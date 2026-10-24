-- Access model: anyone can read; only owners (listed in public.owners) can write.
-- Writes go through Row Level Security, so the database enforces this for the web app and iOS app alike.

create table owners (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

create or replace function is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$
    select exists (select 1 from public.owners where user_id = auth.uid());
$$;

-- Attendees are matched by name when saving a trip, so names must be unique (case-insensitive).
create unique index attendees_name_unique on attendees(lower(name));

alter table owners enable row level security;
alter table trips enable row level security;
alter table islands enable row level security;
alter table attendees enable row level security;
alter table trip_islands enable row level security;
alter table trip_attendees enable row level security;
alter table pictures enable row level security;

create policy "owners can see themselves" on owners
    for select to authenticated using (user_id = auth.uid());

create policy "public read" on trips for select to anon, authenticated using (true);
create policy "public read" on islands for select to anon, authenticated using (true);
create policy "public read" on attendees for select to anon, authenticated using (true);
create policy "public read" on trip_islands for select to anon, authenticated using (true);
create policy "public read" on trip_attendees for select to anon, authenticated using (true);
create policy "public read" on pictures for select to anon, authenticated using (true);

create policy "owner write" on trips for all to authenticated using (is_owner()) with check (is_owner());
create policy "owner write" on islands for all to authenticated using (is_owner()) with check (is_owner());
create policy "owner write" on attendees for all to authenticated using (is_owner()) with check (is_owner());
create policy "owner write" on trip_islands for all to authenticated using (is_owner()) with check (is_owner());
create policy "owner write" on trip_attendees for all to authenticated using (is_owner()) with check (is_owner());
create policy "owner write" on pictures for all to authenticated using (is_owner()) with check (is_owner());

-- Explicit grants, in case the project does not auto-expose new tables to the Data API.
grant select on trips, islands, attendees, trip_islands, trip_attendees, pictures to anon, authenticated;
grant insert, update, delete on trips, islands, attendees, trip_islands, trip_attendees, pictures to authenticated;
grant select on owners to authenticated;

create or replace function unique_islands_visited() returns integer
language sql stable security invoker set search_path = ''
as $$
    select count(distinct island_id)::integer from public.trip_islands;
$$;

-- Creates (p_trip_id null) or updates a trip with its attendees and ordered islands in one transaction.
-- Islands removed from the trip delete their pictures; their R2 storage keys are returned so the
-- caller can delete the files.
create or replace function save_trip(
    p_trip_id uuid,
    p_name text,
    p_description text,
    p_start_date date,
    p_end_date date,
    p_attendee_names text[],
    p_island_ids uuid[]
) returns table (trip_id uuid, removed_storage_keys text[])
language plpgsql security invoker set search_path = ''
as $$
declare
    v_trip_id uuid;
    v_removed text[];
    v_names text[];
begin
    if not public.is_owner() then
        raise exception 'not authorized' using errcode = '42501';
    end if;
    if cardinality(p_island_ids) <> (select count(distinct x) from unnest(p_island_ids) x) then
        raise exception 'duplicate island in trip' using errcode = '22023';
    end if;

    if p_trip_id is null then
        insert into public.trips (name, description, start_date, end_date)
        values (p_name, p_description, p_start_date, p_end_date)
        returning id into v_trip_id;
    else
        update public.trips
        set name = p_name, description = p_description, start_date = p_start_date, end_date = p_end_date
        where id = p_trip_id
        returning id into v_trip_id;
        if v_trip_id is null then
            raise exception 'trip not found' using errcode = 'P0002';
        end if;
    end if;

    -- Attendees, matched by name.
    select coalesce(array_agg(distinct trim(n)), '{}') into v_names
    from unnest(p_attendee_names) n where trim(n) <> '';

    insert into public.attendees (name)
    select n from unnest(v_names) n
    on conflict ((lower(name))) do nothing;

    delete from public.trip_attendees ta
    using public.attendees a
    where ta.trip_id = v_trip_id and a.id = ta.attendee_id
      and lower(a.name) <> all (select lower(n) from unnest(v_names) n);

    insert into public.trip_attendees (trip_id, attendee_id)
    select v_trip_id, a.id from public.attendees a
    where lower(a.name) in (select lower(n) from unnest(v_names) n)
    on conflict (trip_id, attendee_id) do nothing;

    -- Islands, in order.
    select coalesce(array_agg(p.storage_key) filter (where p.storage_key is not null), '{}') into v_removed
    from public.pictures p
    join public.trip_islands ti on ti.id = p.trip_island_id
    where ti.trip_id = v_trip_id and ti.island_id <> all (p_island_ids);

    delete from public.trip_islands ti
    where ti.trip_id = v_trip_id and ti.island_id <> all (p_island_ids);

    insert into public.trip_islands (trip_id, island_id, sequence_number)
    select v_trip_id, x.id, x.ord::integer
    from unnest(p_island_ids) with ordinality as x(id, ord)
    on conflict on constraint trip_islands_trip_island_unique
    do update set sequence_number = excluded.sequence_number;

    return query select v_trip_id, v_removed;
end;
$$;

-- Deletes a trip (cascading to its islands, attendees links and pictures) and returns the R2 storage
-- keys of the deleted pictures.
create or replace function delete_trip(p_trip_id uuid) returns text[]
language plpgsql security invoker set search_path = ''
as $$
declare
    v_removed text[];
begin
    if not public.is_owner() then
        raise exception 'not authorized' using errcode = '42501';
    end if;

    select coalesce(array_agg(p.storage_key) filter (where p.storage_key is not null), '{}') into v_removed
    from public.pictures p
    join public.trip_islands ti on ti.id = p.trip_island_id
    where ti.trip_id = p_trip_id;

    delete from public.trips where id = p_trip_id;
    if not found then
        raise exception 'trip not found' using errcode = 'P0002';
    end if;

    return v_removed;
end;
$$;

revoke execute on function save_trip, delete_trip from public, anon;
grant execute on function save_trip, delete_trip to authenticated;
grant execute on function unique_islands_visited to anon, authenticated;
