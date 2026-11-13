grant insert on table public.soundbox_clips to anon, authenticated;

drop policy if exists "Anyone can submit a soundbox clip" on public.soundbox_clips;
create policy "Anyone can submit a soundbox clip"
  on public.soundbox_clips
  for insert
  to anon, authenticated
  with check (duration_seconds between 1 and 5);

drop policy if exists "Anyone can upload soundbox audio" on storage.objects;
create policy "Anyone can upload soundbox audio"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'soundbox-audio');

