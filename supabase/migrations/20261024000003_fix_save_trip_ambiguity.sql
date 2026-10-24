-- save_trip's output column trip_id collided with table columns of the same name ("column reference
-- trip_id is ambiguous"). Prefer table columns inside the function body.

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
#variable_conflict use_column
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
