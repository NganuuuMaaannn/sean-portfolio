-- Optional reset (uncomment only if you intentionally want to recreate the table)
-- drop table if exists public.portfolio_content;

-- Shared portfolio table
create table if not exists public.portfolio_content (
  id text primary key,
  profile jsonb not null default '{}'::jsonb,
  projects jsonb not null default '[]'::jsonb
);

alter table public.portfolio_content enable row level security;

drop policy if exists "portfolio_content_select_all" on public.portfolio_content;
create policy "portfolio_content_select_all"
on public.portfolio_content
for select
to anon, authenticated
using (true);

drop policy if exists "portfolio_content_insert_all" on public.portfolio_content;
create policy "portfolio_content_insert_all"
on public.portfolio_content
for insert
to anon, authenticated
with check (true);

drop policy if exists "portfolio_content_update_all" on public.portfolio_content;
create policy "portfolio_content_update_all"
on public.portfolio_content
for update
to anon, authenticated
using (true)
with check (true);

insert into public.portfolio_content (id, profile, projects)
values (
  'main',
  '{
    "aboutText":"Hi! I''m Sean, a Front-End Developer passionate about modern design and smooth interactions.",
    "aboutImage":"/image/Sean.jpg"
  }'::jsonb,
  '[]'::jsonb
)
on conflict (id) do nothing;

-- Verify
select id, profile, projects from public.portfolio_content where id = 'main';

-- Storage setup for About image uploads from dashboard
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

drop policy if exists "portfolio_images_public_read" on storage.objects;
create policy "portfolio_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'portfolio-images');

drop policy if exists "portfolio_images_auth_insert" on storage.objects;
create policy "portfolio_images_auth_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'portfolio-images');

drop policy if exists "portfolio_images_auth_update" on storage.objects;
create policy "portfolio_images_auth_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'portfolio-images')
with check (bucket_id = 'portfolio-images');

drop policy if exists "portfolio_images_auth_delete" on storage.objects;
create policy "portfolio_images_auth_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'portfolio-images');

-- Realtime setup for live updates on /sean-portfolio and /sean-admin
do $$
begin
  alter publication supabase_realtime add table public.portfolio_content;
exception
  when duplicate_object then null;
end $$;
