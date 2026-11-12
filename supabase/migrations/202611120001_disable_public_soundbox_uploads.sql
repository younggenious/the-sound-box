drop policy if exists "Anyone can submit a soundbox clip" on public.soundbox_clips;
revoke insert on table public.soundbox_clips from anon, authenticated;
drop policy if exists "Anyone can upload soundbox audio" on storage.objects;

