-- ============================================================
-- Sean Portfolio: Recommended Supabase Schema (Split Tables)
-- ============================================================
-- What this does:
-- 1) Creates separate tables for profile, projects, figma projects, and tech stack items
-- 2) Migrates existing data from public.portfolio_content (if it exists)
-- 3) Enables RLS + policies
-- 4) Adds realtime publication entries
-- 5) Keeps storage bucket setup for image uploads
--
-- Run this whole file in Supabase SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 0) Optional backup of legacy table
-- ------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'portfolio_content'
  ) then
    execute 'create table if not exists public.portfolio_content_backup as table public.portfolio_content';
  end if;
end $$;

-- ------------------------------------------------------------
-- 1) New split tables
-- ------------------------------------------------------------
create table if not exists public.portfolio_profile (
  id text primary key,
  about_text text not null default '',
  about_image text not null default '/image/Sean.jpg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null default 'main',
  title text not null,
  description text not null,
  image text not null,
  tech jsonb not null default '[]'::jsonb,
  live_url text,
  project_type text check (project_type in ('app', 'web')),
  is_private boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_figma_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null default 'main',
  title text not null,
  src text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_tech_stack_items (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null default 'main',
  name text not null,
  category text not null check (category in ('tech', 'tool')),
  logo_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.portfolio_tech_stack_items
  add column if not exists logo_url text;

create index if not exists portfolio_projects_owner_sort_idx
  on public.portfolio_projects(owner_id, sort_order);

create index if not exists portfolio_figma_projects_owner_sort_idx
  on public.portfolio_figma_projects(owner_id, sort_order);

create index if not exists portfolio_tech_stack_owner_sort_idx
  on public.portfolio_tech_stack_items(owner_id, sort_order);

create unique index if not exists portfolio_tech_stack_owner_sort_uidx
  on public.portfolio_tech_stack_items(owner_id, sort_order);

-- ------------------------------------------------------------
-- 2) Seed main profile row (safe default)
-- ------------------------------------------------------------
insert into public.portfolio_profile (id, about_text, about_image)
values (
  'main',
  'Hi! I''m Sean, a Front-End Developer passionate about modern design and smooth interactions.',
  '/image/Sean.jpg'
)
on conflict (id) do nothing;

insert into public.portfolio_tech_stack_items (
  owner_id, name, category, logo_url, sort_order
)
select owner_id, name, category, logo_url, sort_order
from (
  values
    ('main', 'React Native', 'tech', null, 0),
    ('main', 'React JS', 'tech', null, 1),
    ('main', 'Next.js', 'tech', null, 2),
    ('main', 'TypeScript', 'tech', null, 3),
    ('main', 'JavaScript', 'tech', null, 4),
    ('main', 'Tailwind CSS', 'tech', null, 5),
    ('main', 'Node.js', 'tech', null, 6),
    ('main', 'HTML', 'tech', null, 7),
    ('main', 'CSS', 'tech', null, 8),
    ('main', 'Bootstrap', 'tech', null, 9),
    ('main', 'Visual Studio Code', 'tool', null, 10),
    ('main', 'Vercel', 'tool', null, 11),
    ('main', 'Figma', 'tool', null, 12),
    ('main', 'GitHub', 'tool', null, 13),
    ('main', 'Git', 'tool', null, 14),
    ('main', 'Photoshop', 'tool', null, 15),
    ('main', 'Premiere Pro', 'tool', null, 16)
) as defaults(owner_id, name, category, logo_url, sort_order)
where not exists (
  select 1
  from public.portfolio_tech_stack_items
  where owner_id = 'main'
);

-- ------------------------------------------------------------
-- 3) Migrate from legacy public.portfolio_content (if present)
-- ------------------------------------------------------------
do $$
declare
  has_legacy_table boolean;
begin
  select exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'portfolio_content'
  ) into has_legacy_table;

  if not has_legacy_table then
    return;
  end if;

  -- 3a) Profile migration (about text/image)
  insert into public.portfolio_profile (id, about_text, about_image)
  select
    'main',
    coalesce(nullif(trim(profile->>'aboutText'), ''), 'Hi! I''m Sean, a Front-End Developer passionate about modern design and smooth interactions.'),
    coalesce(nullif(trim(profile->>'aboutImage'), ''), '/image/Sean.jpg')
  from public.portfolio_content
  where id = 'main'
  on conflict (id) do update
    set about_text = excluded.about_text,
        about_image = excluded.about_image,
        updated_at = now();

  -- 3b) Projects migration
  delete from public.portfolio_projects where owner_id = 'main';
  insert into public.portfolio_projects (
    owner_id, title, description, image, tech, live_url, project_type, is_private, sort_order
  )
  select
    'main' as owner_id,
    trim(coalesce(project_item->>'title', '')) as title,
    trim(coalesce(project_item->>'description', '')) as description,
    trim(coalesce(project_item->>'image', '')) as image,
    case
      when jsonb_typeof(project_item->'tech') = 'array' then project_item->'tech'
      else '[]'::jsonb
    end as tech,
    nullif(trim(coalesce(project_item->>'liveUrl', '')), '') as live_url,
    case
      when project_item->>'type' in ('app', 'web') then project_item->>'type'
      else null
    end as project_type,
    case
      when lower(coalesce(project_item->>'private', '')) in ('true', 'false')
        then (project_item->>'private')::boolean
      else false
    end as is_private,
    ordinality - 1 as sort_order
  from public.portfolio_content legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.projects, '[]'::jsonb))
    with ordinality as p(project_item, ordinality)
  where legacy.id = 'main'
    and trim(coalesce(project_item->>'title', '')) <> ''
    and trim(coalesce(project_item->>'description', '')) <> ''
    and trim(coalesce(project_item->>'image', '')) <> '';

  -- 3c) Figma projects migration from profile.figmaProjects
  delete from public.portfolio_figma_projects where owner_id = 'main';
  insert into public.portfolio_figma_projects (
    owner_id, title, src, sort_order
  )
  select
    'main' as owner_id,
    trim(coalesce(figma_item->>'title', '')) as title,
    trim(coalesce(figma_item->>'src', '')) as src,
    ordinality - 1 as sort_order
  from public.portfolio_content legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.profile->'figmaProjects', '[]'::jsonb))
    with ordinality as f(figma_item, ordinality)
  where legacy.id = 'main'
    and trim(coalesce(figma_item->>'title', '')) <> ''
    and trim(coalesce(figma_item->>'src', '')) <> '';
end $$;

-- ------------------------------------------------------------
-- 4) RLS + policies
-- ------------------------------------------------------------
alter table public.portfolio_profile enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_figma_projects enable row level security;
alter table public.portfolio_tech_stack_items enable row level security;

-- Profile policies
drop policy if exists "portfolio_profile_select_all" on public.portfolio_profile;
create policy "portfolio_profile_select_all"
on public.portfolio_profile
for select
to anon, authenticated
using (true);

drop policy if exists "portfolio_profile_write_auth" on public.portfolio_profile;
create policy "portfolio_profile_write_auth"
on public.portfolio_profile
for all
to authenticated
using (true)
with check (true);

-- Projects policies
drop policy if exists "portfolio_projects_select_all" on public.portfolio_projects;
create policy "portfolio_projects_select_all"
on public.portfolio_projects
for select
to anon, authenticated
using (true);

drop policy if exists "portfolio_projects_write_auth" on public.portfolio_projects;
create policy "portfolio_projects_write_auth"
on public.portfolio_projects
for all
to authenticated
using (true)
with check (true);

-- Figma policies
drop policy if exists "portfolio_figma_select_all" on public.portfolio_figma_projects;
create policy "portfolio_figma_select_all"
on public.portfolio_figma_projects
for select
to anon, authenticated
using (true);

drop policy if exists "portfolio_figma_write_auth" on public.portfolio_figma_projects;
create policy "portfolio_figma_write_auth"
on public.portfolio_figma_projects
for all
to authenticated
using (true)
with check (true);

-- Tech stack policies
drop policy if exists "portfolio_tech_stack_select_all" on public.portfolio_tech_stack_items;
create policy "portfolio_tech_stack_select_all"
on public.portfolio_tech_stack_items
for select
to anon, authenticated
using (true);

drop policy if exists "portfolio_tech_stack_write_auth" on public.portfolio_tech_stack_items;
create policy "portfolio_tech_stack_write_auth"
on public.portfolio_tech_stack_items
for all
to authenticated
using (true)
with check (true);

-- ------------------------------------------------------------
-- 5) Realtime setup
-- ------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.portfolio_profile;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.portfolio_projects;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.portfolio_figma_projects;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.portfolio_tech_stack_items;
exception when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- 6) Storage bucket setup (unchanged)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 7) Verify
-- ------------------------------------------------------------
select id, about_text, about_image
from public.portfolio_profile
where id = 'main';

select owner_id, sort_order, title, description, image, tech, live_url, project_type, is_private
from public.portfolio_projects
where owner_id = 'main'
order by sort_order;

select owner_id, sort_order, title, src
from public.portfolio_figma_projects
where owner_id = 'main'
order by sort_order;

select owner_id, sort_order, name, category, logo_url
from public.portfolio_tech_stack_items
where owner_id = 'main'
order by sort_order;

-- ------------------------------------------------------------
-- 8) Optional cleanup (run only after fully verifying app behavior)
-- ------------------------------------------------------------
-- drop table if exists public.portfolio_content;
