create table if not exists public.soundbox_clips (
  id uuid primary key default gen_random_uuid(),
  object_path text not null unique,
  duration_seconds smallint not null check (duration_seconds between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.soundbox_clips enable row level security;
grant select, insert on public.soundbox_clips to anon, authenticated;
create policy "Anyone can listen to soundbox clips" on public.soundbox_clips for select to anon, authenticated using (true);
create policy "Anyone can submit a soundbox clip" on public.soundbox_clips for insert to anon, authenticated with check (duration_seconds between 1 and 5);

create table if not exists public.soundbox_reports (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null references public.soundbox_clips(id) on delete cascade,
  reason text not null check (reason in ('inappropriate', 'personal_info', 'other')),
  created_at timestamptz not null default now()
);
alter table public.soundbox_reports enable row level security;
grant insert on public.soundbox_reports to anon, authenticated;
create policy "Anyone can report a soundbox clip" on public.soundbox_reports for insert to anon, authenticated with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('soundbox-audio', 'soundbox-audio', true, 1572864, array['audio/webm', 'audio/webm;codecs=opus', 'audio/ogg', 'audio/mp4', 'audio/mpeg'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "Anyone can upload soundbox audio" on storage.objects for insert to anon, authenticated with check (bucket_id = 'soundbox-audio');

