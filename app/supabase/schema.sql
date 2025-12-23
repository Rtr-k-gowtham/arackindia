-- Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  user_id uuid references auth.users not null
);

-- Submissions Table
create table submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects on delete cascade not null,
  data jsonb not null
);

-- Enable RLS
alter table projects enable row level security;
alter table submissions enable row level security;

-- Policies for Projects
create policy "Users can view their own projects" on projects
  for select using (auth.uid() = user_id);

create policy "Users can insert their own projects" on projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects" on projects
  for update using (auth.uid() = user_id);

create policy "Users can delete their own projects" on projects
  for delete using (auth.uid() = user_id);

-- Policies for Submissions
create policy "Users can view submissions for their projects" on submissions
  for select using (
    exists (
      select 1 from projects
      where projects.id = submissions.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Allow public submissions (for the form endpoint)
create policy "Anyone can insert submissions" on submissions
  for insert with check (true);
