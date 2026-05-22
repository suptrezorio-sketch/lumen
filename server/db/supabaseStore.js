const { getSupabase, mapRow, toSnake } = require('./supabaseClient');

function sb() {
  const c = getSupabase();
  if (!c) throw new Error('Supabase not configured');
  return c;
}

async function populateUser(ref, fields = 'name email') {
  if (!ref) return ref;
  const id = typeof ref === 'object' ? ref._id || ref.id : ref;
  const { data } = await sb().from('users').select(fields === 'name email' ? 'id,name,email' : '*').eq('id', id).single();
  return data ? { _id: data.id, name: data.name, email: data.email } : null;
}

const User = {
  async find(filter = {}) {
    let q = sb().from('users').select('*');
    if (filter.email) q = q.eq('email', filter.email);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapRow);
  },
  async findById(id) {
    const { data, error } = await sb().from('users').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return mapRow(data);
  },
  async findOne(filter) {
    if (filter.email) {
      const { data, error } = await sb().from('users').select('*').eq('email', filter.email).maybeSingle();
      if (error) throw error;
      return mapRow(data);
    }
    return null;
  },
  async findByIdAndUpdate(id, update, opts = {}) {
    let payload = toSnake(update);
    if (update.$inc?.balance) {
      const current = await User.findById(id);
      payload = { balance: Number(current.balance) + Number(update.$inc.balance) };
    }
    const { data, error } = await sb().from('users').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return mapRow(data);
  },
  async findOneAndUpdate(filter, update, opts = {}) {
    const existing = await User.findOne(filter);
    if (!existing && opts.upsert) {
      const insert = toSnake({ ...filter, ...update.$set, ...update.$setOnInsert });
      const { data, error } = await sb().from('users').insert(insert).select('*').single();
      if (error) throw error;
      return mapRow(data);
    }
    if (!existing) return null;
    const set = update.$set || update;
    const { data, error } = await sb().from('users').update(toSnake(set)).eq('id', existing._id).select('*').single();
    if (error) throw error;
    return mapRow(data);
  },
  async findByIdAndDelete(id) {
    await sb().from('users').delete().eq('id', id);
    return { _id: id };
  },
  async create(doc) {
    const { data, error } = await sb().from('users').insert(toSnake(doc)).select('*').single();
    if (error) throw error;
    return mapRow(data);
  },
};

const Card = {
  async find(filter) {
    const { data, error } = await sb().from('cards').select('*').eq('user_id', filter.userId);
    if (error) throw error;
    return data.map(mapRow);
  },
  async create(doc) {
    const { data, error } = await sb().from('cards').insert(toSnake(doc)).select('*').single();
    if (error) throw error;
    return mapRow(data);
  },
  async deleteMany(filter) {
    await sb().from('cards').delete().eq('user_id', filter.userId);
  },
};

const Transaction = {
  async find(filter = {}) {
    let q = sb().from('transactions').select('*');
    if (filter.userId) q = q.eq('user_id', filter.userId);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    const rows = data.map(mapRow);
    for (const row of rows) {
      if (row.userId) row.userId = await populateUser(row.userId);
    }
    return rows;
  },
  async findByIdAndUpdate(id, update) {
    const { data, error } = await sb().from('transactions').update(toSnake(update)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapRow(data);
  },
  async findByIdAndDelete(id) {
    await sb().from('transactions').delete().eq('id', id);
  },
  async create(doc) {
    const payload = toSnake(doc);
    const { data, error } = await sb().from('transactions').insert(payload).select('*').single();
    if (error) throw error;
    const row = mapRow(data);
    row.toObject = () => row;
    return row;
  },
};

const Document = {
  async find() {
    const { data, error } = await sb().from('documents').select('*').order('uploaded_at', { ascending: false });
    if (error) throw error;
    const rows = data.map(mapRow);
    for (const row of rows) {
      if (row.userId) row.userId = await populateUser(row.userId);
    }
    return rows;
  },
  async findByIdAndUpdate(id, update) {
    const { data, error } = await sb().from('documents').update(toSnake(update)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapRow(data);
  },
  async create(doc) {
    const { data, error } = await sb().from('documents').insert(toSnake(doc)).select('*').single();
    if (error) throw error;
    return mapRow(data);
  },
};

const CreditRequest = {
  async find() {
    const { data, error } = await sb().from('credit_requests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const rows = data.map(mapRow);
    for (const row of rows) {
      if (row.userId) row.userId = await populateUser(row.userId);
    }
    return rows;
  },
  async findByIdAndUpdate(id, update) {
    const { data, error } = await sb().from('credit_requests').update(toSnake(update)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapRow(data);
  },
  async deleteMany(filter) {
    await sb().from('credit_requests').delete().eq('user_id', filter.userId);
  },
  async create(doc) {
    const row = toSnake(doc);
    const { data, error } = await sb().from('credit_requests').insert(row).select('*').single();
    if (error) throw error;
    const mapped = mapRow(data);
    mapped.save = async () => mapped;
    return mapped;
  },
};

const Banner = {
  async find(filter = {}) {
    let q = sb().from('banners').select('*');
    if (filter.active !== undefined) q = q.eq('active', filter.active);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapRow);
  },
  async findByIdAndUpdate(id, update) {
    const { data, error } = await sb().from('banners').update(toSnake(update)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapRow(data);
  },
  async findByIdAndDelete(id) {
    await sb().from('banners').delete().eq('id', id);
  },
  async create(doc) {
    const { data, error } = await sb().from('banners').insert(toSnake(doc)).select('*').single();
    if (error) throw error;
    const mapped = mapRow(data);
    mapped.save = async () => mapped;
    return mapped;
  },
};

const AuditLog = {
  async create(doc) {
    await sb().from('audit_logs').insert(toSnake(doc));
  },
  async find() {
    const { data, error } = await sb().from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return data.map(mapRow);
  },
};

const Message = {
  async find(filter) {
    let q = sb().from('messages').select('*');
    const uid = filter.$or?.[0]?.receiverId || filter.receiverId;
    if (uid) {
      const { data, error } = await q.or(`receiver_id.eq.${uid},sender_id.eq.${uid},receiver_id.is.null`).order('created_at', { ascending: true });
      if (error) throw error;
      return data.map(mapRow);
    }
    const { data, error } = await q.order('created_at', { ascending: true });
    if (error) throw error;
    return data.map(mapRow);
  },
  async create(doc) {
    const { data, error } = await sb().from('messages').insert(toSnake(doc)).select('*').single();
    if (error) throw error;
    const mapped = mapRow(data);
    mapped.save = async () => mapped;
    return mapped;
  },
};

async function getThresholds() {
  const { data } = await sb().from('scenario_thresholds').select('*').eq('id', 1).single();
  return {
    callTriggerAmount: Number(data?.call_trigger_amount ?? 100),
    suspiciousAmount: Number(data?.suspicious_amount ?? 50000),
  };
}

async function updateThresholds(patch) {
  const current = await getThresholds();
  const next = { ...current, ...patch };
  await sb().from('scenario_thresholds').upsert({
    id: 1,
    call_trigger_amount: next.callTriggerAmount,
    suspicious_amount: next.suspiciousAmount,
    updated_at: new Date().toISOString(),
  });
  const { updateThresholds: syncEngine } = require('../scenarioEngine');
  syncEngine(next);
  return next;
}

module.exports = {
  isSupabase: true,
  connect: async () => true,
  User,
  Card,
  Transaction,
  Document,
  Banner,
  AuditLog,
  CreditRequest,
  Message,
  getThresholds,
  updateThresholds,
};
