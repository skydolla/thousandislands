create extension if not exists pgcrypto;

create table trips (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text not null,
    start_date date not null,
    end_date date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint trips_date_check check (start_date <= end_date)
);

create table islands (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    country text not null,
    region_or_state text,
    latitude double precision not null,
    longitude double precision not null,
    external_reference_id text,
    notes text,
    created_at timestamptz not null default now()
);

create table attendees (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz not null default now()
);

create table trip_islands (
    id uuid primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    island_id uuid not null references islands(id) on delete restrict,
    sequence_number integer,
    created_at timestamptz not null default now(),
    constraint trip_islands_trip_island_unique unique (trip_id, island_id),
    constraint trip_islands_sequence_number_check check (sequence_number is null or sequence_number >= 1)
);

create table trip_attendees (
    id uuid primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    attendee_id uuid not null references attendees(id) on delete restrict,
    role text,
    created_at timestamptz not null default now(),
    constraint trip_attendees_trip_attendee_unique unique (trip_id, attendee_id)
);

create table pictures (
    id uuid primary key default gen_random_uuid(),
    trip_id uuid not null references trips(id) on delete cascade,
    trip_island_id uuid not null references trip_islands(id) on delete cascade,
    image_url text not null,
    caption text,
    taken_at timestamptz,
    sort_order integer,
    created_at timestamptz not null default now(),
    constraint pictures_sort_order_check check (sort_order is null or sort_order >= 1)
);

create index idx_trip_islands_trip_id on trip_islands(trip_id);
create index idx_trip_islands_island_id on trip_islands(island_id);
create index idx_trip_attendees_trip_id on trip_attendees(trip_id);
create index idx_trip_attendees_attendee_id on trip_attendees(attendee_id);
create index idx_pictures_trip_id on pictures(trip_id);
create index idx_pictures_trip_island_id on pictures(trip_island_id);
create index idx_islands_lat_lng on islands(latitude, longitude);
