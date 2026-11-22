-- Merges a duplicate island into the one to keep: every trip that visited the duplicate now visits
-- the kept island, with its photos. A trip that visited both keeps one stop (the kept island's) and
-- that stop gets the duplicate's photos appended after its own. The duplicate is then deleted.

create or replace function merge_islands(p_keep_id uuid, p_duplicate_id uuid)
returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
    v_ext_ref text;
    v_moved record;
begin
    if not public.is_owner() then
        raise exception 'not authorized' using errcode = '42501';
    end if;
    if p_keep_id = p_duplicate_id then
        raise exception 'cannot merge an island into itself' using errcode = '22023';
    end if;
    -- Lock both rows so a concurrent edit can't interleave.
    perform 1 from public.islands where id = p_keep_id for update;
    if not found then
        raise exception 'island not found' using errcode = 'P0002';
    end if;
    select external_reference_id into v_ext_ref from public.islands where id = p_duplicate_id for update;
    if not found then
        raise exception 'island not found' using errcode = 'P0002';
    end if;

    -- Trips that visited both: move the duplicate stop's photos onto the kept stop, then drop it.
    for v_moved in
        select dup.id as dup_stop, keep.id as keep_stop
        from public.trip_islands dup
        join public.trip_islands keep on keep.trip_id = dup.trip_id and keep.island_id = p_keep_id
        where dup.island_id = p_duplicate_id
    loop
        update public.pictures p
        set trip_island_id = v_moved.keep_stop,
            sort_order = coalesce(
                (select max(sort_order) from public.pictures where trip_island_id = v_moved.keep_stop), 0
            ) + coalesce(p.sort_order, 0)
        where p.trip_island_id = v_moved.dup_stop;
        delete from public.trip_islands where id = v_moved.dup_stop;
    end loop;

    -- Every other trip: point the stop at the kept island. Photos follow because they hang off the stop.
    update public.trip_islands set island_id = p_keep_id where island_id = p_duplicate_id;

    delete from public.islands where id = p_duplicate_id;
    -- Keep the duplicate's external reference if the kept island has none (after the delete, so the
    -- unique index never sees it twice).
    update public.islands
    set external_reference_id = coalesce(external_reference_id, v_ext_ref)
    where id = p_keep_id;

    return p_keep_id;
end;
$$;

revoke execute on function merge_islands from public, anon;
grant execute on function merge_islands to authenticated;
