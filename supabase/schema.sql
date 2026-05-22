-- LUMEN Bank — Supabase schema (backend v2)
-- Run in Supabase SQL editor after creating a project

create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  phone text,
  pin_hash text not null,
  balance numeric default 0,
  btc numeric default 0,
  eth numeric default 0,
  usdt numeric default 0,
  status text default 'pending',
  kyc_status text default 'none',
  aml_status text default 'none',
  credit_status text default 'none',
  lang text default 'en',
  created_at timestamptz default now()
);

create table if not exists cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  name text not null,
  number text not null,
  balance numeric default 0,
  currency text not null,
  expiry text,
  cvv text,
  blocked boolean default false,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  type text not null,
  title text not null,
  description text,
  amount numeric not null,
  status text default 'processing',
  tx_id text unique,
  category text,
  fee numeric default 0,
  created_at timestamptz default now()
);

create table if not exists credit_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  amount numeric not null,
  term int,
  rate numeric,
  employment text,
  income text,
  purpose text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  file_url text not null,
  status text default 'pending',
  uploaded_at timestamptz default now()
);

create table if not exists banners (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  link_type text default 'url',
  link_value text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id text,
  receiver_id text,
  text text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id text not null,
  action text not null,
  target_user_id text,
  details jsonb,
  created_at timestamptz default now()
);

alter table users enable row level security;
alter table transactions enable row level security;

-- Students read own row (when using Supabase Auth uid = users.id)
create policy "users_select_own" on users for select using (auth.uid() = id);
create policy "tx_select_own" on transactions for select using (auth.uid() = user_id);
