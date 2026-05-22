import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

const sb = createClient(url, key);
const pin = await bcrypt.hash('1388', 10);

const { data: user, error } = await sb.from('users').upsert({
  email: 'test@lumen.local',
  name: 'Test Account',
  password: pin,
  pin,
  balance: 12450.8,
  lang: 'en',
  status: 'approved',
  kyc_status: 'none',
}, { onConflict: 'email' }).select('*').single();

if (error) {
  console.error(error);
  process.exit(1);
}

console.log('Seeded test user:', user.id, 'PIN: 1388');
