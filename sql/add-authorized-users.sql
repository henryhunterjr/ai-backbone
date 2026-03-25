-- AI Backbone — Authorized Users Table
-- Run this in the Supabase SQL Editor after the initial schema

create table if not exists authorized_users (
  id         uuid default gen_random_uuid() primary key,
  email      text not null unique,
  name       text,
  notes      text,
  created_at timestamptz default now()
);

-- Allow service role full access (RLS bypass) but lock down anon
alter table authorized_users enable row level security;
