const { createClient } = require('@supabase/supabase-js');

let client = null;

function getSupabase() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

function mapRow(row) {
  if (!row) return null;
  const { id, user_id, kyc_status, aml_status, credit_status, created_at, tx_id, image_url, link_type, link_value, is_admin, receiver_id, sender_id, target_user_id, admin_id, ...rest } = row;
  return {
    ...rest,
    _id: id,
    id,
    userId: user_id,
    user_id,
    kycStatus: kyc_status,
    amlStatus: aml_status,
    creditStatus: credit_status,
    createdAt: created_at,
    txId: tx_id,
    imageUrl: image_url,
    linkType: link_type,
    linkValue: link_value,
    isAdmin: is_admin,
    receiverId: receiver_id,
    senderId: sender_id,
    targetUserId: target_user_id,
    adminId: admin_id,
    uploadedAt: row.uploaded_at,
  };
}

function toSnake(obj) {
  const map = {
    userId: 'user_id',
    kycStatus: 'kyc_status',
    amlStatus: 'aml_status',
    creditStatus: 'credit_status',
    txId: 'tx_id',
    imageUrl: 'image_url',
    linkType: 'link_type',
    linkValue: 'link_value',
    isAdmin: 'is_admin',
    receiverId: 'receiver_id',
    senderId: 'sender_id',
    kycSettings: 'kyc_settings',
    smartContract: 'smart_contract',
    recipientAccount: 'recipient_account',
    targetUserId: 'target_user_id',
    adminId: 'admin_id',
  };
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[map[k] || k.replace(/([A-Z])/g, '_$1').toLowerCase()] = v;
  }
  return out;
}

module.exports = { getSupabase, mapRow, toSnake };
