/**
 * Run: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/migrate-supabase.mjs
 */
const PROJECT_REF = 'jryxgykfmgtaoywkdqql';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || process.env.SBP_TOKEN;

if (!TOKEN) {
  console.error('Set SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

const SQL = `
create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  password text not null,
  pin text not null,
  balance numeric default 0,
  btc numeric default 0,
  eth numeric default 0,
  usdt numeric default 0,
  status text default 'pending',
  kyc_status text default 'none',
  aml_status text default 'none',
  credit_status text default 'none',
  lang text default 'en',
  kyc_settings jsonb default '[]',
  smart_contract jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  name text not null,
  number text not null,
  balance numeric default 0,
  currency text not null,
  expiry text,
  holder text,
  cvv text,
  blocked boolean default false,
  daily_limit numeric,
  monthly_limit numeric,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  type text not null,
  title text not null,
  description text,
  amount numeric not null,
  status text default 'processing',
  tx_id text unique,
  category text,
  fee numeric default 0,
  recipient_account text,
  created_at timestamptz default now()
);

create table if not exists credit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  amount numeric not null,
  term int,
  rate numeric,
  employment text,
  income text,
  purpose text,
  collateral text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  file_url text not null,
  status text default 'pending',
  uploaded_at timestamptz default now()
);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  link_type text default 'url',
  link_value text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id text,
  receiver_id text,
  text text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id text not null,
  action text not null,
  target_user_id text,
  details jsonb,
  created_at timestamptz default now()
);

create table if not exists scenario_thresholds (
  id int primary key default 1 check (id = 1),
  call_trigger_amount numeric default 100,
  suspicious_amount numeric default 50000,
  updated_at timestamptz default now()
);

insert into scenario_thresholds (id, call_trigger_amount, suspicious_amount)
values (1, 100, 50000)
on conflict (id) do nothing;

alter table users enable row level security;
alter table transactions enable row level security;
alter table messages enable row level security;

drop policy if exists users_all_service on users;
create policy users_all_service on users for all using (true) with check (true);

drop policy if exists tx_all_service on transactions;
create policy tx_all_service on transactions for all using (true) with check (true);

drop policy if exists messages_all_service on messages;
create policy messages_all_service on messages for all using (true) with check (true);
`;

async function runQuery(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  const statements = SQL.split(';').map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    try {
      await runQuery(stmt);
      console.log('OK:', stmt.slice(0, 60).replace(/\n/g, ' ') + '...');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('SKIP:', stmt.slice(0, 40));
      } else {
        console.error('FAIL:', stmt.slice(0, 80), e.message);
      }
    }
  }
  console.log('Migration complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
