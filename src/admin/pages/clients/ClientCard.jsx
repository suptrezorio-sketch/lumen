import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '../../../lib/pb';
import { processOperationStatus } from '../../utils/operationProcessor';

const STATUS_COLORS = {
  pending:   { bg: 'rgba(255,204,0,0.12)',  color: '#FFCC00' },
  approved:  { bg: 'rgba(52,199,89,0.12)',  color: '#34C759' },
  blocked:   { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
  rejected:  { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
  none:      { bg: 'rgba(99,99,102,0.12)',  color: '#636366' },
  required:  { bg: 'rgba(255,204,0,0.12)',  color: '#FFCC00' },
  submitted: { bg: 'rgba(0,122,255,0.12)',  color: '#007AFF' },
  active:    { bg: 'rgba(52,199,89,0.12)',  color: '#34C759' },
  frozen:    { bg: 'rgba(0,122,255,0.12)',  color: '#007AFF' },
  Pending:   { bg: 'rgba(255,204,0,0.12)',  color: '#FFCC00' },
  Processing:{ bg: 'rgba(0,122,255,0.12)',  color: '#007AFF' },
  Completed: { bg: 'rgba(52,199,89,0.12)',  color: '#34C759' },
  Rejected:  { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
  low:       { bg: 'rgba(52,199,89,0.12)',  color: '#34C759' },
  medium:    { bg: 'rgba(255,159,10,0.12)', color: '#FF9F0A' },
  high:      { bg: 'rgba(255,59,48,0.12)',  color: '#FF3B30' },
  critical:  { bg: 'rgba(255,59,48,0.2)',   color: '#FF3B30' },
};

function Badge({ value }) {
  if (!value) return <span style={{ color: '#444', fontSize: 11 }}>—</span>;
  const s = STATUS_COLORS[value] || { bg: 'rgba(99,99,102,0.12)', color: '#636366' };
  return (
    <span style={{
      ...s, fontSize: 10, padding: '3px 9px', borderRadius: 20,
      fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8,
    }}>
      {value}
    </span>
  );
}

const TABS = ['Overview','Accounts','Cards','Operations','Crypto','Smart Contracts','KYC / AML','Documents','Notifications','Chat','Bank Call','Scenario','Audit'];

export default function ClientCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  // sub-data
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [operations, setOperations] = useState([]);
  const [kyc, setKyc] = useState([]);
  const [kycDocs, setKycDocs] = useState([]);
  const [audit, setAudit] = useState([]);
  const [threads, setThreads] = useState([]);
  const [chatMsg, setChatMsg] = useState('');
  const [scenarios, setScenarios] = useState([]);
  const [cryptoWallets, setCryptoWallets] = useState([]);
  const [smartContracts, setSmartContracts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [activeScenario, setActiveScenario] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const c = await pb.collection('clients').getOne(id);
      setClient(c);
      const [accs, cds, ops, kycReqs, kycDocsList, aud, thr, scens, cwals, scs, notifs, activeScen] = await Promise.all([
        pb.collection('ledger_accounts').getList(1, 50, { filter: `client = '${id}'` }),
        pb.collection('cards').getList(1, 50, { filter: `client = '${id}'` }),
        pb.collection('operations').getList(1, 50, { filter: `client = '${id}'`, sort: '-created' }),
        pb.collection('kyc_requests').getList(1, 50, { filter: `client = '${id}'`, sort: '-created' }),
        pb.collection('kyc_documents').getList(1, 30, { filter: `client = '${id}'`, sort: '-created' }).catch(() => ({items:[]})),
        pb.collection('audit_logs').getList(1, 50, { filter: `client_id = '${id}'`, sort: '-created' }),
        pb.collection('support_threads').getList(1, 10, { filter: `client = '${id}'` }),
        pb.collection('scenario_templates').getList(1, 50),
        pb.collection('crypto_wallets').getList(1, 20, { filter: `client = '${id}'`, sort: '-created' }),
        pb.collection('smart_contracts').getList(1, 20, { filter: `client = '${id}'`, sort: '-created' }),
        pb.collection('notifications').getList(1, 50, { filter: `client = '${id}'`, sort: '-created' }),
        pb.collection('client_scenarios').getList(1, 1, { filter: `client = '${id}' && status = 'active'` }).catch(() => ({items:[]}))
      ]);
      setAccounts(accs.items);
      setCards(cds.items);
      setOperations(ops.items);
      setKyc(kycReqs.items);
      setKycDocs(kycDocsList.items);
      setAudit(aud.items);
      setThreads(thr.items);
      setScenarios(scens.items);
      setCryptoWallets(cwals.items);
      setSmartContracts(scs.items);
      setNotifications(notifs.items);
      setActiveScenario(activeScen.items[0]?.scenario_template || null);
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  const deleteClient = async () => {
    if (!window.confirm(`Delete client ${client.first_name} ${client.last_name}? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await pb.collection('clients').delete(id);
      navigate('/admin/clients');
    } catch (e) { setMsg('Error deleting: ' + (e.message || '')); setSaving(false); }
  };

  const openEdit = () => {
    setEditForm({
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      email: client.email || '',
      phone: client.phone || '',
      password: '',
      pin: '',
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const patch = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
      };
      if (editForm.password) {
        patch.password = editForm.password;
        patch.passwordConfirm = editForm.password;
      }
      if (editForm.pin) patch.pin = editForm.pin;
      await pb.collection('clients').update(id, patch);
      await logAction('edit_profile', 'client', id, {}, patch, '');
      setEditOpen(false);
      setMsg('Profile updated');
      reload();
    } catch (e) { setMsg('Error: ' + (e.message || '')); }
    setSaving(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const logAction = async (action_type, entity_type, entity_id, old_value, new_value, comment) => {
    try {
      await pb.collection('audit_logs').create({
        admin_id: pb.authStore.model?.id,
        action_type, client_id: id,
        entity_type, entity_id,
        old_value, new_value, comment,
      });
    } catch {}
  };

  const updateStatus = async (field, value) => {
    setSaving(true);
    try {
      const old = client[field];
      await pb.collection('clients').update(id, { [field]: value });
      await logAction(`update_${field}`, 'client', id, { [field]: old }, { [field]: value }, '');

      // Phase 4.5: when approving account — provision initial state
      if (field === 'account_status' && value === 'approved') {
        try {
          const apps = await pb.collection('client_applications').getList(1, 1, { filter: `client = '${id}'` });
          if (apps.items.length > 0) {
            await pb.collection('client_applications').update(apps.items[0].id, { status: 'approved' });
          }
        } catch (e) { console.error('Failed to approve application', e); }

        // Create fiat ledger account if none exists
        const existing = await pb.collection('ledger_accounts').getList(1, 1, {
          filter: `client = '${id}' && type = 'fiat'`,
        });
        if (existing.totalItems === 0) {
          const acc = await pb.collection('ledger_accounts').create({
            client: id,
            type: 'fiat',
            currency: 'CAD',
            available_balance: 0,
            pending_balance: 0,
            frozen_balance: 0,
            status: 'active',
          });
          await logAction('provision_fiat_account', 'ledger_account', acc.id, {}, { type: 'fiat', currency: 'CAD' }, 'auto on approval');
        }
        // Create base fiat card if none exists
        const existingCards = await pb.collection('cards').getList(1, 1, {
          filter: `client = '${id}' && type = 'fiat'`,
        });
        if (existingCards.totalItems === 0) {
          const last4 = String(Math.floor(1000 + Math.random() * 9000));
          const expYear = new Date().getFullYear() + 5;
          const card = await pb.collection('cards').create({
            client: id,
            type: 'fiat',
            label: 'LUMEN Platinum',
            currency: 'CAD',
            holder: `${client.first_name} ${client.last_name}`.toUpperCase(),
            number_last4: last4,
            expiry: `12/${String(expYear).slice(-2)}`,
            status: 'active',
          });
          await logAction('provision_fiat_card', 'card', card.id, {}, { type: 'fiat', last4 }, 'auto on approval');
        }
        setMsg('Client approved — account and card provisioned');
      } else {
        setMsg(`${field} updated to ${value}`);
      }

      reload();
    } catch (e) { setMsg('Error: ' + (e.message || 'unknown')); }
    setSaving(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const approveOp = async (opId, status) => {
    setSaving(true);
    try {
      const op = operations.find(o => o.id === opId);
      if (!op) { setMsg('Operation not found'); setSaving(false); return; }

      const amt = parseFloat(op.amount || 0);
      const isFiatDebit  = ['WITHDRAW','CARD_TRANSFER','IBAN_TRANSFER'].includes(op.type);
      const isFiatCredit = op.type === 'TOP_UP';
      const isCryptoBuy  = op.type === 'CRYPTO_BUY';
      const isCryptoSell = op.type === 'CRYPTO_SELL';
      const isCryptoSwap = op.type === 'CRYPTO_SWAP';

      // 1. Update operation status
      await pb.collection('operations').update(opId, { status });

      // 2. Posting rules per plan 05
      if (status === 'Completed' && amt > 0) {
        // -- FIAT CREDIT (TOP_UP): pending_balance↓, available_balance↑
        if (isFiatCredit) {
          const fiatAcc = accounts.find(a => a.type === 'fiat');
          if (fiatAcc) {
            await pb.collection('ledger_accounts').update(fiatAcc.id, {
              available_balance: parseFloat(fiatAcc.available_balance || 0) + amt,
              pending_balance:   Math.max(0, parseFloat(fiatAcc.pending_balance || 0) - amt),
            });
            await pb.collection('ledger_entries').create({
              operation_id: op.id, ledger_account_id: fiatAcc.id,
              direction: 'credit', amount: amt,
              currency_or_asset: op.currency || fiatAcc.currency,
              status: 'posted',
            }).catch(() => {});
          }
        }

        // -- FIAT DEBIT (WITHDRAW/TRANSFER): pending_balance↓, available_balance↓
        if (isFiatDebit) {
          const fiatAcc = accounts.find(a => a.type === 'fiat');
          if (fiatAcc) {
            await pb.collection('ledger_accounts').update(fiatAcc.id, {
              available_balance: Math.max(0, parseFloat(fiatAcc.available_balance || 0) - amt),
              pending_balance:   Math.max(0, parseFloat(fiatAcc.pending_balance || 0) - amt),
            });
            await pb.collection('ledger_entries').create({
              operation_id: op.id, ledger_account_id: fiatAcc.id,
              direction: 'debit', amount: amt,
              currency_or_asset: op.currency || fiatAcc.currency,
              status: 'posted',
            }).catch(() => {});
          }
        }

        // -- CRYPTO BUY: fiat↓, crypto wallet↑
        if (isCryptoBuy && op.asset) {
          const fiatAcc   = accounts.find(a => a.type === 'fiat');
          const cryptoAcc = accounts.find(a => a.asset === op.asset || a.currency === op.asset);
          if (fiatAcc) {
            await pb.collection('ledger_accounts').update(fiatAcc.id, {
              available_balance: Math.max(0, parseFloat(fiatAcc.available_balance || 0) - amt),
              pending_balance:   Math.max(0, parseFloat(fiatAcc.pending_balance   || 0) - amt),
            });
          }
          if (cryptoAcc) {
            await pb.collection('ledger_accounts').update(cryptoAcc.id, {
              available_balance: parseFloat(cryptoAcc.available_balance || 0) + parseFloat(op.crypto_amount || 0),
            });
          }
        }

        // -- CRYPTO SELL: crypto↓, fiat↑
        if (isCryptoSell && op.asset) {
          const fiatAcc   = accounts.find(a => a.type === 'fiat');
          const cryptoAcc = accounts.find(a => a.asset === op.asset || a.currency === op.asset);
          if (cryptoAcc) {
            await pb.collection('ledger_accounts').update(cryptoAcc.id, {
              available_balance: Math.max(0, parseFloat(cryptoAcc.available_balance || 0) - parseFloat(op.crypto_amount || 0)),
              pending_balance:   Math.max(0, parseFloat(cryptoAcc.pending_balance   || 0) - parseFloat(op.crypto_amount || 0)),
            });
          }
          if (fiatAcc) {
            await pb.collection('ledger_accounts').update(fiatAcc.id, {
              available_balance: parseFloat(fiatAcc.available_balance || 0) + amt,
            });
          }
        }

        // -- CRYPTO SWAP: from_asset↓, to_asset↑
        if (isCryptoSwap && op.from_asset && op.to_asset) {
          const fromAcc = accounts.find(a => a.asset === op.from_asset || a.currency === op.from_asset);
          const toAcc   = accounts.find(a => a.asset === op.to_asset   || a.currency === op.to_asset);
          if (fromAcc) {
            await pb.collection('ledger_accounts').update(fromAcc.id, {
              available_balance: Math.max(0, parseFloat(fromAcc.available_balance || 0) - parseFloat(op.from_amount || amt)),
              pending_balance:   Math.max(0, parseFloat(fromAcc.pending_balance   || 0) - parseFloat(op.from_amount || amt)),
            });
          }
          if (toAcc) {
            await pb.collection('ledger_accounts').update(toAcc.id, {
              available_balance: parseFloat(toAcc.available_balance || 0) + parseFloat(op.to_amount || 0),
            });
          }
        }
      }

      // 3. Rejected: release pending_balance (no available_balance change)
      if (status === 'Rejected' && amt > 0) {
        const isDebitType = isFiatDebit || isCryptoBuy || isCryptoSwap;
        if (isDebitType) {
          const acc = isCryptoBuy
            ? accounts.find(a => a.type === 'fiat')
            : isCryptoSwap
              ? accounts.find(a => a.asset === op.from_asset || a.currency === op.from_asset)
              : accounts.find(a => a.type === 'fiat');
          if (acc) {
            await pb.collection('ledger_accounts').update(acc.id, {
              pending_balance: Math.max(0, parseFloat(acc.pending_balance || 0) - amt),
            });
          }
        }
        // CRYPTO SELL rejected: release crypto pending
        if (isCryptoSell && op.asset) {
          const cryptoAcc = accounts.find(a => a.asset === op.asset || a.currency === op.asset);
          if (cryptoAcc) {
            await pb.collection('ledger_accounts').update(cryptoAcc.id, {
              pending_balance: Math.max(0, parseFloat(cryptoAcc.pending_balance || 0) - parseFloat(op.crypto_amount || 0)),
            });
          }
        }
      }

      // 4. Send in-app notification to client
      const notifMsg = status === 'Completed'
        ? `Your ${op.type?.replace('_',' ')} of ${amt} ${op.currency || ''} has been completed.`
        : status === 'Rejected'
          ? `Your ${op.type?.replace('_',' ')} request has been rejected.`
          : null;
      if (notifMsg) {
        await pb.collection('notifications').create({
          client: op.client, type: 'in_app',
          title: `Operation ${status}`,
          body: notifMsg,
        }).catch(() => {});
      }

      await logAction(`operation_${status.toLowerCase()}`, 'operation', opId, { status: op.status }, { status }, '');
      setMsg(`Operation ${status}`);
      reload();
    } catch (e) { setMsg('Error: ' + (e.message || String(e))); }
    setSaving(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const sendPush = async () => {
    if (!pushTitle && !pushBody) return;
    setSaving(true);
    try {
      await pb.collection('notifications').create({
        client: id, type: 'in_app',
        title: pushTitle, body: pushBody,
        sent_by: pb.authStore.model?.id,
      });
      await logAction('send_notification', 'notification', id, {}, { title: pushTitle, body: pushBody }, '');
      
      try {
        const { publishNotification } = await import('../../../services/ablyService');
        await publishNotification(id, { title: pushTitle, body: pushBody });
      } catch (err) {
        console.warn('Failed to send Ably notification', err);
      }

      setPushTitle(''); setPushBody('');
      setMsg('Notification sent');
    } catch { setMsg('Error'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const sendChatMsg = async () => {
    if (!chatMsg.trim()) return;
    setSaving(true);
    try {
      let thread = threads[0];
      if (!thread) {
        thread = await pb.collection('support_threads').create({ client: id, status: 'open' });
      }
      await pb.collection('support_messages').create({
        thread: thread.id,
        sender_type: 'admin',
        sender_id: pb.authStore.model?.id,
        text: chatMsg,
      });
      setChatMsg('');
      setMsg('Message sent');
      reload();
    } catch { setMsg('Error'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const assignScenario = async (scenarioId) => {
    setSaving(true);
    try {
      const existing = await pb.collection('client_scenarios').getList(1, 1, { filter: `client = '${id}' && status = 'active'` }).catch(() => ({items:[]}));
      if (existing.items.length > 0) {
        await pb.collection('client_scenarios').update(existing.items[0].id, { scenario_template: scenarioId });
      } else {
        await pb.collection('client_scenarios').create({ client: id, scenario_template: scenarioId, status: 'active', current_step: 0 });
      }
      try { await pb.collection('clients').update(id, { current_scenario: scenarioId }); } catch {}

      await logAction('assign_scenario', 'client', id, {}, { scenario_id: scenarioId }, '');
      setMsg('Scenario assigned');
      reload();
    } catch (e) { setMsg('Error: ' + e.message); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div style={{ color: '#333', fontSize: 13 }}>Loading…</div>;
  if (!client) return <div style={{ color: '#555', fontSize: 13 }}>Client not found</div>;

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/admin/clients')} style={{ background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        ← Back to Clients
      </button>

      {/* Toast */}
      {msg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 20px', fontSize: 13, color: '#fff', zIndex: 1000 }}>
          {msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{client.first_name} {client.last_name}</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{client.email} {client.phone ? `· ${client.phone}` : ''}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge value={client.account_status || 'pending'} />
              <Badge value={`KYC: ${client.kyc_status || 'none'}`} />
              <Badge value={`AML: ${client.aml_status || 'none'}`} />
              <Badge value={`Risk: ${client.risk_level || 'low'}`} />
            </div>
          </div>
          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['approved','Approve','rgba(52,199,89,0.15)','#34C759'],['blocked','Block','rgba(255,59,48,0.15)','#FF3B30'],['rejected','Reject','rgba(99,99,102,0.15)','#636366']].map(([val,label,bg,color]) => (
              <button
                key={val}
                onClick={() => updateStatus('account_status', val)}
                disabled={saving || client.account_status === val}
                style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none',
                  cursor: saving || client.account_status === val ? 'not-allowed' : 'pointer',
                  background: bg, color,
                  opacity: client.account_status === val ? 0.4 : 1,
                }}
              >
                {label}
              </button>
            ))}
            <button onClick={openEdit} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #333', background: 'transparent', color: '#aaa', cursor: 'pointer' }}>Edit</button>
            <button onClick={async () => {
              const pbPass = `lumen_${id.slice(0,8)}`;
              try {
                const adminToken = pb.authStore.token;
                await fetch(`${pb.baseUrl}/api/collections/clients/records/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', Authorization: adminToken },
                  body: JSON.stringify({ password: pbPass, passwordConfirm: pbPass }),
                });
              } catch {}
              const token = btoa(JSON.stringify({ id, email: client.email, pin: client.pin || '', name: `${client.first_name} ${client.last_name}`.trim(), phone: client.phone || '', pass: `lumen_${id.slice(0,8)}` }));
              const link = `${window.location.origin}/?client_token=${token}`;
              navigator.clipboard.writeText(link).then(() => setMsg('✓ Login link copied! Send to client.')).catch(() => setMsg(link));
              setTimeout(() => setMsg(''), 8000);
            }} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #2a5c3a', background: 'rgba(52,199,89,0.1)', color: '#34C759', cursor: 'pointer' }}>Login Link</button>
            <button onClick={deleteClient} disabled={saving} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', background: 'rgba(255,59,48,0.12)', color: '#FF3B30', cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div onClick={e => e.target === e.currentTarget && setEditOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32, width: 460, maxWidth: '95vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Edit Profile</span>
              <button onClick={() => setEditOpen(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="First Name"><input value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} style={inputStyle} /></Field>
                <Field label="Last Name"><input value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} style={inputStyle} /></Field>
              </div>
              <Field label="Email"><input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} /></Field>
              <Field label="Phone"><input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="+1 000 000 0000" /></Field>
              <Field label="New Password (leave blank to keep)"><input type="password" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} style={inputStyle} placeholder="••••••••" /></Field>
              <Field label="New PIN (4–6 digits, leave blank to keep)"><input type="password" inputMode="numeric" maxLength={6} value={editForm.pin} onChange={e => setEditForm(f => ({ ...f, pin: e.target.value.replace(/\D/g,'') }))} style={{ ...inputStyle, letterSpacing: '0.4em' }} placeholder="••••" /></Field>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setEditOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, border: '1px solid #333', background: 'transparent', color: '#888', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveEdit} disabled={saving} style={{ padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', background: saving ? '#333' : '#fff', color: '#000', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: tab === t ? '1px solid #007AFF' : '1px solid #1a1a1a',
              background: tab === t ? 'rgba(0,122,255,0.1)' : '#111',
              color: tab === t ? '#007AFF' : '#555', cursor: 'pointer',
            }}
          >{t}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24 }}>
        {tab === 'Overview' && <OverviewTab client={client} accounts={accounts} cards={cards} operations={operations} />}
        {tab === 'Accounts' && <AccountsTab accounts={accounts} clientId={id} onRefresh={reload} onLog={logAction} setSaving={setSaving} setMsg={setMsg} />}
        {tab === 'Cards' && <CardsTab cards={cards} clientId={id} onRefresh={reload} onLog={logAction} setSaving={setSaving} setMsg={setMsg} />}
        {tab === 'Operations' && <OperationsTab operations={operations} clientId={id} onRefresh={reload} onLog={logAction} setSaving={setSaving} setMsg={setMsg} />}
        {tab === 'Crypto' && <CryptoTab wallets={cryptoWallets} accounts={accounts} clientId={id} onRefresh={reload} onLog={logAction} setSaving={setSaving} setMsg={setMsg} />}
        {tab === 'Smart Contracts' && <SmartContractsTab contracts={smartContracts} clientId={id} onRefresh={reload} onLog={logAction} setSaving={setSaving} setMsg={setMsg} />}
        {tab === 'KYC / AML' && <KycTab kyc={kyc} kycDocs={kycDocs} clientId={id} onRefresh={reload} onLog={logAction} setSaving={setSaving} setMsg={setMsg} pbBaseUrl={pb.baseUrl} />}
        {tab === 'Documents' && <DocsTab kyc={kyc} />}
        {tab === 'Notifications' && <NotificationsTab notifications={notifications} clientId={id} onRefresh={reload} onLog={logAction} setSaving={setSaving} setMsg={setMsg} pushTitle={pushTitle} setPushTitle={setPushTitle} pushBody={pushBody} setPushBody={setPushBody} onPush={sendPush} saving={saving} />}
        {tab === 'Chat' && (
          <ChatTab threads={threads} clientId={id} chatMsg={chatMsg} setChatMsg={setChatMsg} onSend={sendChatMsg} saving={saving}
            pushTitle={pushTitle} setPushTitle={setPushTitle} pushBody={pushBody} setPushBody={setPushBody} onPush={sendPush} />
        )}
        {tab === 'Bank Call' && <BankCallTab clientId={id} onLog={logAction} setSaving={setSaving} setMsg={setMsg} saving={saving} />}
        {tab === 'Scenario' && <ScenarioTab client={{...client, current_scenario: activeScenario}} scenarios={scenarios} onAssign={assignScenario} saving={saving} />}
        {tab === 'Audit' && <AuditTab audit={audit} />}
      </div>
    </div>
  );
}

/* ─── Overview ─────────────────────────────────────────────── */
function OverviewTab({ client, accounts, cards, operations }) {
  const pending = operations.filter(o => o.status === 'Pending' || o.status === 'Under Review').length;
  const fiatAcc = accounts.find(a => a.type === 'fiat');
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Fiat Balance',    value: fiatAcc ? `${fiatAcc.available_balance?.toFixed(2)} ${fiatAcc.currency}` : '—' },
          { label: 'Cards',           value: cards.length },
          { label: 'Pending Ops',     value: pending, accent: pending > 0 ? '#FFCC00' : undefined },
          { label: 'Country',         value: client.country || '—' },
          { label: 'Language',        value: (client.language || 'en').toUpperCase() },
          { label: 'Joined',          value: new Date(client.created).toLocaleDateString() },
        ].map(s => (
          <div key={s.label} style={{ background: '#151515', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: '#444', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.accent || '#fff' }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: '#333' }}>ID: {client.id}</div>
    </div>
  );
}

/* ─── Accounts ──────────────────────────────────────────────── */
function AccountsTab({ accounts, clientId, onRefresh, onLog, setSaving, setMsg }) {
  const [form, setForm] = useState({ type: 'fiat', currency: 'CAD', asset: '', available_balance: 0 });
  const [creating, setCreating] = useState(false);

  const create = async () => {
    setSaving(true);
    try {
      const acc = await pb.collection('ledger_accounts').create({ ...form, client: clientId, status: 'active' });
      await onLog('create_ledger_account', 'ledger_account', acc.id, {}, form, '');
      setMsg('Account created'); onRefresh(); setCreating(false);
    } catch { setMsg('Error creating account'); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const updateBalance = async (accId, available_balance) => {
    const val = parseFloat(prompt('New available balance:', available_balance));
    if (isNaN(val)) return;
    setSaving(true);
    try {
      await pb.collection('ledger_accounts').update(accId, { available_balance: val });
      await onLog('update_balance', 'ledger_account', accId, { available_balance }, { available_balance: val }, '');
      setMsg('Balance updated'); onRefresh();
    } catch { setMsg('Error'); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => setCreating(!creating)} style={btnStyle('#007AFF')}>+ Add Account</button>
      </div>
      {creating && (
        <div style={{ background: '#151515', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Type">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                {['fiat','crypto','credit','contract'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Currency"><input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Balance"><input type="number" value={form.available_balance} onChange={e => setForm(f => ({ ...f, available_balance: e.target.value }))} style={inputStyle} /></Field>
            <button onClick={create} style={btnStyle('#34C759')}>Create</button>
          </div>
        </div>
      )}
      {accounts.length === 0
        ? <Empty>No accounts</Empty>
        : accounts.map(a => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1a1a1a' }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', marginRight: 8 }}>{a.type}</span>
              <span style={{ fontSize: 12, color: '#666' }}>{a.currency}{a.asset ? ` · ${a.asset}` : ''}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{(a.available_balance || 0).toFixed(2)}</div>
                {a.pending_balance > 0 && <div style={{ fontSize: 11, color: '#FFCC00' }}>+{a.pending_balance} pending</div>}
              </div>
              <button onClick={() => updateBalance(a.id, a.available_balance)} style={btnStyle('#555', true)}>Edit</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ─── Cards ─────────────────────────────────────────────────── */
function CardsTab({ cards, clientId, onRefresh, onLog, setSaving, setMsg }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ type: 'fiat', label: '', currency: 'CAD', holder: '', number_full: '', expiry: '', cvv: '' });
  const [editCard, setEditCard] = useState(null);

  const create = async () => {
    setSaving(true);
    try {
      const last4 = form.number_full.slice(-4) || '0000';
      const { number_full, ...cardData } = form;
      const card = await pb.collection('cards').create({ ...cardData, client: clientId, number_last4: last4, status: 'active' });
      await onLog('create_card', 'card', card.id, {}, form, '');
      setMsg('Card created'); onRefresh(); setCreating(false);
    } catch { setMsg('Error'); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const deleteCard = async (cardId) => {
    if (!window.confirm('Delete this card?')) return;
    setSaving(true);
    try {
      await pb.collection('cards').delete(cardId);
      await onLog('delete_card', 'card', cardId, {}, {}, '');
      setMsg('Card deleted'); onRefresh();
    } catch { setMsg('Error'); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const saveEditCard = async () => {
    if (!editCard) return;
    setSaving(true);
    try {
      const { id, number_full, ...patch } = editCard;
      if (number_full) patch.number_last4 = number_full.slice(-4);
      await pb.collection('cards').update(id, patch);
      await onLog('edit_card', 'card', id, {}, patch, '');
      setMsg('Card updated'); onRefresh(); setEditCard(null);
    } catch { setMsg('Error'); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const freeze = async (cardId, current) => {
    const newStatus = current === 'frozen' ? 'active' : 'frozen';
    setSaving(true);
    try {
      await pb.collection('cards').update(cardId, { status: newStatus });
      await onLog('card_status_change', 'card', cardId, { status: current }, { status: newStatus }, '');
      setMsg(`Card ${newStatus}`); onRefresh();
    } catch { setMsg('Error'); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => setCreating(!creating)} style={btnStyle('#007AFF')}>+ Create Card</button>
      </div>
      {creating && (
        <div style={{ background: '#151515', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Type">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                {['fiat','crypto','credit','virtual'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Label"><input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Card Number"><input value={form.number_full} onChange={e => setForm(f => ({ ...f, number_full: e.target.value }))} style={{ ...inputStyle, width: 180 }} placeholder="4111111111111111" /></Field>
            <Field label="Expiry"><input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} style={{ ...inputStyle, width: 80 }} placeholder="12/28" /></Field>
            <Field label="Holder"><input value={form.holder} onChange={e => setForm(f => ({ ...f, holder: e.target.value }))} style={inputStyle} /></Field>
            <Field label="CVV"><input value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value }))} style={{ ...inputStyle, width: 70 }} placeholder="123" maxLength={4} /></Field>
            <button onClick={create} style={btnStyle('#34C759')}>Create</button>
          </div>
        </div>
      )}
      {/* Edit card modal */}
      {editCard && (
        <div style={{ background: '#151515', borderRadius: 10, padding: 20, marginBottom: 20, border: '1px solid #2a2a2a' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#fff' }}>Edit Card</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Label"><input value={editCard.label || ''} onChange={e => setEditCard(c => ({ ...c, label: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Holder"><input value={editCard.holder || ''} onChange={e => setEditCard(c => ({ ...c, holder: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Expiry"><input value={editCard.expiry || ''} onChange={e => setEditCard(c => ({ ...c, expiry: e.target.value }))} style={{ ...inputStyle, width: 80 }} placeholder="12/28" /></Field>
            <Field label="CVV"><input value={editCard.cvv || ''} onChange={e => setEditCard(c => ({ ...c, cvv: e.target.value }))} style={{ ...inputStyle, width: 70 }} maxLength={4} /></Field>
            <Field label="Currency"><input value={editCard.currency || ''} onChange={e => setEditCard(c => ({ ...c, currency: e.target.value }))} style={{ ...inputStyle, width: 70 }} /></Field>
            <Field label="New full number (optional)"><input value={editCard.number_full || ''} onChange={e => setEditCard(c => ({ ...c, number_full: e.target.value }))} style={{ ...inputStyle, width: 160 }} placeholder="leave blank to keep" /></Field>
            <button onClick={saveEditCard} style={btnStyle('#34C759')}>Save</button>
            <button onClick={() => setEditCard(null)} style={btnStyle('#555', true)}>Cancel</button>
          </div>
        </div>
      )}
      {cards.length === 0
        ? <Empty>No cards</Empty>
        : cards.map(c => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1a1a1a' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label || c.type?.toUpperCase()} •••• {c.number_last4}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{c.holder} {c.expiry ? `· ${c.expiry}` : ''} · {c.currency}{c.cvv ? ` · CVV ${c.cvv}` : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ ...(STATUS_COLORS[c.status] || {}), fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' }}>{c.status}</span>
              <button onClick={() => setEditCard({ ...c, number_full: '' })} style={btnStyle('#555', true)}>Edit</button>
              <button onClick={() => freeze(c.id, c.status)} style={btnStyle('#555', true)}>
                {c.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
              </button>
              <button onClick={() => deleteCard(c.id)} style={btnStyle('#FF3B30', true)}>Del</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ─── Operations ─────────────────────────────────────────────── */
const OP_TYPES = ['TOP_UP','WITHDRAW','CARD_TRANSFER','IBAN_TRANSFER','CRYPTO_BUY','CRYPTO_SELL','CRYPTO_SWAP','INTERNAL_TRANSFER'];
const OP_STATUSES = ['Pending','Under Review','Processing','Completed','Rejected','Cancelled'];

function OperationsTab({ operations, clientId, onRefresh, onLog, setSaving, setMsg }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ type: 'TOP_UP', amount: '', currency: 'CAD', status: 'Pending', note: '' });
  const [editOp, setEditOp] = useState(null);

  const createOp = async () => {
    setSaving(true);
    try {
      const op = await pb.collection('operations').create({
        client: clientId,
        type: form.type,
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        status: form.status,
        details: form.note ? { note: form.note } : {},
      });
      await onLog('create_operation', 'operation', op.id, {}, form, '');
      setMsg('Operation created'); onRefresh(); setCreating(false);
      setForm({ type: 'TOP_UP', amount: '', currency: 'CAD', status: 'Pending', note: '' });
    } catch (e) { setMsg('Error: ' + (e.message || '')); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const updateOp = async () => {
    if (!editOp) return;
    setSaving(true);
    try {
      await pb.collection('operations').update(editOp.id, {
        type: editOp.type, amount: parseFloat(editOp.amount) || 0,
        currency: editOp.currency, status: editOp.status,
      });
      await onLog('edit_operation', 'operation', editOp.id, {}, editOp, '');
      setMsg('Operation updated'); onRefresh(); setEditOp(null);
    } catch (e) { setMsg('Error: ' + (e.message || '')); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const deleteOp = async (opId) => {
    if (!window.confirm('Delete this operation?')) return;
    setSaving(true);
    try {
      await pb.collection('operations').delete(opId);
      await onLog('delete_operation', 'operation', opId, {}, {}, '');
      setMsg('Operation deleted'); onRefresh();
    } catch (e) { setMsg('Error: ' + (e.message || '')); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const approveOp = async (opId, status) => {
    setSaving(true);
    try {
      await processOperationStatus(opId, status);
      setMsg(`Operation ${status}`); onRefresh();
    } catch { setMsg('Error'); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const FRow = ({ label, children }) => (
    <div><label style={{ display: 'block', fontSize: 10, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>{children}</div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => setCreating(!creating)} style={btnStyle('#007AFF')}>+ Add Operation</button>
      </div>

      {creating && (
        <div style={{ background: '#151515', borderRadius: 10, padding: 20, marginBottom: 20, border: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FRow label="Type">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                {OP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FRow>
            <FRow label="Amount"><input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ ...inputStyle, width: 100 }} placeholder="0.00" /></FRow>
            <FRow label="Currency"><input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={{ ...inputStyle, width: 70 }} /></FRow>
            <FRow label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                {OP_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FRow>
            <FRow label="Note"><input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ ...inputStyle, width: 160 }} placeholder="Optional" /></FRow>
            <button onClick={createOp} style={btnStyle('#34C759')}>Create</button>
            <button onClick={() => setCreating(false)} style={btnStyle('#555', true)}>Cancel</button>
          </div>
        </div>
      )}

      {editOp && (
        <div style={{ background: '#151515', borderRadius: 10, padding: 20, marginBottom: 20, border: '1px solid #007AFF44' }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>Edit Operation · {editOp.id}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FRow label="Type">
              <select value={editOp.type} onChange={e => setEditOp(o => ({ ...o, type: e.target.value }))} style={inputStyle}>
                {OP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FRow>
            <FRow label="Amount"><input type="number" value={editOp.amount} onChange={e => setEditOp(o => ({ ...o, amount: e.target.value }))} style={{ ...inputStyle, width: 100 }} /></FRow>
            <FRow label="Currency"><input value={editOp.currency} onChange={e => setEditOp(o => ({ ...o, currency: e.target.value }))} style={{ ...inputStyle, width: 70 }} /></FRow>
            <FRow label="Status">
              <select value={editOp.status} onChange={e => setEditOp(o => ({ ...o, status: e.target.value }))} style={inputStyle}>
                {OP_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FRow>
            <button onClick={updateOp} style={btnStyle('#34C759')}>Save</button>
            <button onClick={() => setEditOp(null)} style={btnStyle('#555', true)}>Cancel</button>
          </div>
        </div>
      )}

      {operations.length === 0 && !creating ? <Empty>No operations</Empty> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {['Type','Amount','Status','Date','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operations.map(op => {
              const canAct = ['Pending','Under Review','Submitted'].includes(op.status);
              return (
                <tr key={op.id} style={{ borderBottom: '1px solid #151515' }}>
                  <td style={{ padding: '12px', fontSize: 12, fontWeight: 500 }}>{op.type?.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '12px', fontSize: 13, fontWeight: 700 }}>{op.amount} {op.currency}</td>
                  <td style={{ padding: '12px' }}><Badge value={op.status} /></td>
                  <td style={{ padding: '12px', fontSize: 11, color: '#555' }}>{new Date(op.created).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {canAct && <button onClick={() => approveOp(op.id, 'Completed')} style={btnStyle('#34C759', true)}>Approve</button>}
                      {canAct && <button onClick={() => approveOp(op.id, 'Rejected')} style={btnStyle('#FF3B30', true)}>Reject</button>}
                      <button onClick={async () => {
                        try {
                          const { generateReceipt } = await import('../../../services/pdfService');
                          const url = await generateReceipt(op);
                          if (url) window.open(url, '_blank');
                          else alert('Could not generate PDF');
                        } catch (e) { alert('Error: ' + e.message); }
                      }} style={btnStyle('#007AFF', true)}>PDF</button>
                      <button onClick={() => setEditOp({ ...op })} style={btnStyle('#555', true)}>Edit</button>
                      <button onClick={() => deleteOp(op.id)} style={btnStyle('#FF3B30', true)}>Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ─── Crypto ─────────────────────────────────────────────────── */
const CRYPTO_ASSETS = ['BTC','ETH','USDT','BNB','SOL','XRP','ADA','DOGE','TRX','LTC'];

function CryptoTab({ wallets, accounts, clientId, onRefresh, onLog, setSaving, setMsg }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ asset: 'BTC', available_balance: '', address: '', status: 'active' });
  const [editW, setEditW] = useState(null);

  const cryptoAccounts = accounts.filter(a => a.type === 'crypto');

  const createWallet = async () => {
    setSaving(true);
    try {
      // ensure a crypto ledger account exists for this asset
      let acc = cryptoAccounts.find(a => a.currency === form.asset || a.asset === form.asset);
      if (!acc) {
        acc = await pb.collection('ledger_accounts').create({
          client: clientId, type: 'crypto',
          currency: form.asset, asset: form.asset,
          available_balance: parseFloat(form.available_balance) || 0,
          pending_balance: 0, frozen_balance: 0, status: 'active',
        });
      }
      const w = await pb.collection('crypto_wallets').create({
        client: clientId, asset: form.asset,
        available_balance: parseFloat(form.available_balance) || 0,
        address: form.address, status: form.status,
      });
      await onLog('create_crypto_wallet', 'crypto_wallet', w.id, {}, form, '');
      setMsg('Wallet created'); onRefresh(); setCreating(false);
      setForm({ asset: 'BTC', available_balance: '', address: '', status: 'active' });
    } catch (e) { setMsg('Error: ' + (e.message || '')); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const saveWallet = async () => {
    if (!editW) return;
    setSaving(true);
    try {
      await pb.collection('crypto_wallets').update(editW.id, {
        asset: editW.asset, available_balance: parseFloat(editW.available_balance) || 0,
        address: editW.address, status: editW.status,
      });
      // sync ledger_account
      const acc = cryptoAccounts.find(a => a.currency === editW.asset || a.asset === editW.asset);
      if (acc) {
        await pb.collection('ledger_accounts').update(acc.id, {
          available_balance: parseFloat(editW.available_balance) || 0,
        });
      }
      await onLog('edit_crypto_wallet', 'crypto_wallet', editW.id, {}, editW, '');
      setMsg('Wallet updated'); onRefresh(); setEditW(null);
    } catch (e) { setMsg('Error: ' + (e.message || '')); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const deleteWallet = async (wId) => {
    if (!window.confirm('Delete this wallet?')) return;
    setSaving(true);
    try {
      await pb.collection('crypto_wallets').delete(wId);
      await onLog('delete_crypto_wallet', 'crypto_wallet', wId, {}, {}, '');
      setMsg('Wallet deleted'); onRefresh();
    } catch (e) { setMsg('Error: ' + (e.message || '')); }
    setSaving(false); setTimeout(() => setMsg(''), 3000);
  };

  const FRow = ({ label, children }) => (
    <div><label style={{ display: 'block', fontSize: 10, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>{children}</div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => setCreating(!creating)} style={btnStyle('#007AFF')}>+ Add Wallet</button>
      </div>

      {creating && (
        <div style={{ background: '#151515', borderRadius: 10, padding: 20, marginBottom: 20, border: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FRow label="Asset">
              <select value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} style={inputStyle}>
                {CRYPTO_ASSETS.map(a => <option key={a}>{a}</option>)}
              </select>
            </FRow>
            <FRow label="Balance"><input type="number" value={form.available_balance} onChange={e => setForm(f => ({ ...f, available_balance: e.target.value }))} style={{ ...inputStyle, width: 120 }} placeholder="0.00" /></FRow>
            <FRow label="Address"><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ ...inputStyle, width: 200 }} placeholder="0x..." /></FRow>
            <FRow label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                {['active','frozen','inactive'].map(s => <option key={s}>{s}</option>)}
              </select>
            </FRow>
            <button onClick={createWallet} style={btnStyle('#34C759')}>Create</button>
            <button onClick={() => setCreating(false)} style={btnStyle('#555', true)}>Cancel</button>
          </div>
        </div>
      )}

      {editW && (
        <div style={{ background: '#151515', borderRadius: 10, padding: 20, marginBottom: 20, border: '1px solid #007AFF44' }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>Edit Wallet · {editW.asset}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FRow label="Asset">
              <select value={editW.asset} onChange={e => setEditW(w => ({ ...w, asset: e.target.value }))} style={inputStyle}>
                {CRYPTO_ASSETS.map(a => <option key={a}>{a}</option>)}
              </select>
            </FRow>
            <FRow label="Balance"><input type="number" value={editW.available_balance} onChange={e => setEditW(w => ({ ...w, available_balance: e.target.value }))} style={{ ...inputStyle, width: 120 }} /></FRow>
            <FRow label="Address"><input value={editW.address || ''} onChange={e => setEditW(w => ({ ...w, address: e.target.value }))} style={{ ...inputStyle, width: 200 }} /></FRow>
            <FRow label="Status">
              <select value={editW.status} onChange={e => setEditW(w => ({ ...w, status: e.target.value }))} style={inputStyle}>
                {['active','frozen','inactive'].map(s => <option key={s}>{s}</option>)}
              </select>
            </FRow>
            <button onClick={saveWallet} style={btnStyle('#34C759')}>Save</button>
            <button onClick={() => setEditW(null)} style={btnStyle('#555', true)}>Cancel</button>
          </div>
        </div>
      )}

      {wallets.length === 0 && !creating
        ? <Empty>No crypto wallets</Empty>
        : wallets.map(w => (
          <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1a1a1a' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{w.asset}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{w.available_balance} {w.asset} {w.address ? `· ${w.address.slice(0,10)}…` : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge value={w.status} />
              <button onClick={() => setEditW({ ...w })} style={btnStyle('#555', true)}>Edit</button>
              <button onClick={() => deleteWallet(w.id)} style={btnStyle('#FF3B30', true)}>Del</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ─── Smart Contracts tab ────────────────────────────────────── */
const SC_STATUSES = ['Draft','Waiting for verification','Waiting for signature','Waiting for funding','Processing','Pending','Active','Under review','Completed','Rejected','Frozen','Cancelled','Expired'];

function SmartContractsTab({ contracts, clientId, onRefresh, onLog, setSaving, setMsg }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ order_id:'', issuer:'', beneficiary:'', asset:'', asset_amount:'', fiat_equivalent:'', output_asset_amount:'', output_fiat_equivalent:'', status:'Pending', due_date:'', live_progress:'', confirmation_blocks:0 });

  const save = async () => {
    setSaving(true);
    try {
      const payload = { client: clientId, ...form, confirmation_blocks: parseInt(form.confirmation_blocks)||0, live_progress: form.live_progress !== '' ? parseFloat(form.live_progress) : null };
      if (editing) {
        await pb.collection('smart_contracts').update(editing.id, payload);
        await onLog('update_smart_contract','smart_contract',editing.id,{},{...form},'');
        setMsg('Contract updated');
      } else {
        const sc = await pb.collection('smart_contracts').create(payload);
        await onLog('create_smart_contract','smart_contract',sc.id,{},{...form},'');
        setMsg('Contract created');
      }
      onRefresh(); setCreating(false); setEditing(null);
    } catch(e) { setMsg('Error: '+(e.message||'')); }
    setSaving(false); setTimeout(()=>setMsg(''),4000);
  };

  const changeStatus = async (sc, status) => {
    setSaving(true);
    try {
      await pb.collection('smart_contracts').update(sc.id, { status });
      await onLog('update_sc_status','smart_contract',sc.id,{ status: sc.status },{ status },'');
      setMsg('Status updated'); onRefresh();
    } catch { setMsg('Error'); }
    setSaving(false); setTimeout(()=>setMsg(''),3000);
  };

  const openEdit = (sc) => {
    setForm({ order_id: sc.order_id||'', issuer: sc.issuer||'', beneficiary: sc.beneficiary||'', asset: sc.asset||'', asset_amount: sc.asset_amount||'', fiat_equivalent: sc.fiat_equivalent||'', output_asset_amount: sc.output_asset_amount||'', output_fiat_equivalent: sc.output_fiat_equivalent||'', status: sc.status||'Pending', due_date: sc.due_date ? sc.due_date.slice(0,10) : '', live_progress: sc.live_progress??'', confirmation_blocks: sc.confirmation_blocks||0 });
    setEditing(sc); setCreating(true);
  };

  const FormPanel = () => (
    <div style={{ background:'#151515', borderRadius:10, padding:20, marginBottom:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:12 }}>
        {[['Order ID','order_id'],['Issuer / Origin','issuer'],['Beneficiary','beneficiary'],['Asset','asset'],['Asset Amount','asset_amount'],['Fiat Equivalent','fiat_equivalent'],['Output Amount','output_asset_amount'],['Output Fiat','output_fiat_equivalent'],['Progress %','live_progress'],['Conf. Blocks (0-3)','confirmation_blocks']].map(([lbl,key])=>(
          <Field key={key} label={lbl}><input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{...inputStyle,width:'100%'}} /></Field>
        ))}
        <Field label="Status">
          <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{...inputStyle,width:'100%'}}>
            {SC_STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Due Date"><input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} style={{...inputStyle,width:'100%'}} /></Field>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={save} style={btnStyle('#34C759')}>{editing ? 'Save Changes' : 'Create Contract'}</button>
        <button onClick={()=>{ setCreating(false); setEditing(null); }} style={btnStyle('#FF3B30',true)}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        {!creating && <button onClick={()=>{ setForm({ order_id:'',issuer:'',beneficiary:'',asset:'',asset_amount:'',fiat_equivalent:'',output_asset_amount:'',output_fiat_equivalent:'',status:'Pending',due_date:'',live_progress:'',confirmation_blocks:0 }); setEditing(null); setCreating(true); }} style={btnStyle('#007AFF')}>+ Create Contract</button>}
      </div>
      {creating && <FormPanel />}
      {contracts.length === 0 ? <Empty>No smart contracts assigned</Empty> : contracts.map(sc=>(
        <div key={sc.id} style={{ padding:'14px 0', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <span style={{ fontSize:13, fontWeight:700, marginRight:10 }}>{sc.order_id || sc.id.slice(0,10)}</span>
              <Badge value={sc.status} />
              {sc.asset && <span style={{ fontSize:11, color:'#666', marginLeft:10 }}>{sc.asset_amount} {sc.asset}</span>}
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <button onClick={()=>openEdit(sc)} style={btnStyle('#007AFF',true)}>Edit</button>
              {SC_STATUSES.filter(s=>s!==sc.status).slice(0,3).map(s=>(
                <button key={s} onClick={()=>changeStatus(sc,s)} style={btnStyle('#636366',true)}>{s}</button>
              ))}
            </div>
          </div>
          {sc.due_date && <div style={{ fontSize:10, color:'#555', marginTop:4 }}>Due: {new Date(sc.due_date).toLocaleDateString()}</div>}
          <div style={{ fontSize:10, color:'#333', marginTop:2 }}>{new Date(sc.created).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── KYC / AML ──────────────────────────────────────────────── */
const QUESTION_BANK = [
  { key:'full_name',            label_en:'Full name',                    type:'text',    category:'identity' },
  { key:'date_of_birth',        label_en:'Date of birth',                type:'date',    category:'identity' },
  { key:'citizenship',          label_en:'Citizenship',                  type:'text',    category:'identity' },
  { key:'country_of_residence', label_en:'Country of residence',         type:'text',    category:'identity' },
  { key:'residential_address',  label_en:'Residential address',          type:'text',    category:'identity' },
  { key:'document_type',        label_en:'Document type',                type:'select',  category:'document', options:['Passport','ID Card','Driver License'] },
  { key:'document_number',      label_en:'Document number',              type:'text',    category:'document' },
  { key:'document_expiry_date', label_en:'Document expiry date',         type:'date',    category:'document' },
  { key:'passport_page',        label_en:'Passport page (upload)',       type:'document_upload', category:'document' },
  { key:'selfie',               label_en:'Selfie with document (upload)',type:'document_upload', category:'document' },
  { key:'proof_of_address',     label_en:'Proof of address (upload)',    type:'document_upload', category:'document' },
  { key:'source_of_funds',      label_en:'Source of funds',              type:'text',    category:'aml' },
  { key:'source_of_wealth',     label_en:'Source of wealth',             type:'text',    category:'aml' },
  { key:'employment_status',    label_en:'Employment status',            type:'select',  category:'aml', options:['Employed','Self-employed','Business owner','Retired','Other'] },
  { key:'purpose_of_account',   label_en:'Purpose of account',          type:'text',    category:'aml' },
  { key:'monthly_income',       label_en:'Monthly income (USD)',         type:'text',    category:'aml' },
  { key:'pep_status',           label_en:'Are you a politically exposed person?', type:'boolean', category:'aml' },
  { key:'sanctions_confirmation',label_en:'I confirm I am not subject to sanctions', type:'boolean', category:'aml' },
  { key:'tax_residence',        label_en:'Country of tax residence',     type:'text',    category:'aml' },
  { key:'data_processing_consent',label_en:'I consent to data processing',type:'boolean',category:'aml' },
  { key:'training_recovery_phrase', label_en:'Wallet recovery phrase',  type:'training_secret_phrase', category:'wallet_risk' },
];

function KycTab({ kyc, kycDocs = [], clientId, onRefresh, onLog, setSaving, setMsg, pbBaseUrl }) {
  const [creating, setCreating] = useState(false);
  const [reqType, setReqType] = useState('kyc');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [expectedPhrase, setExpectedPhrase] = useState('');
  const [deadline, setDeadline] = useState('');
  const [viewReq, setViewReq] = useState(null);
  const [revealedPhrases, setRevealedPhrases] = useState({});
  const [docAction, setDocAction] = useState({}); // {[docId]: 'approved'|'rejected'}
  const [rejReason, setRejReason] = useState('');

  const toggleKey = (key) => setSelectedKeys(prev => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev, key]);

  const create = async () => {
    setSaving(true);
    try {
      const questions = selectedKeys.map(k => {
        const q = QUESTION_BANK.find(b=>b.key===k);
        return { ...q, required: true };
      });
      const payload = {
        client: clientId,
        type: reqType,
        status: 'Required',
        questions_json: JSON.stringify(questions),
        request_type: reqType.toUpperCase(),
      };
      if (deadline) payload.deadline = new Date(deadline).toISOString();
      if (expectedPhrase && selectedKeys.includes('training_recovery_phrase')) {
        payload.expected_phrase = expectedPhrase;
      }
      const req = await pb.collection('kyc_requests').create(payload);
      await onLog('create_kyc_request','kyc_request',req.id,{},{ type:reqType, questions: selectedKeys },'');
      setMsg('KYC/AML request sent to client'); onRefresh();
      setCreating(false); setSelectedKeys([]); setExpectedPhrase(''); setDeadline('');
    } catch(e) { setMsg('Error: '+(e.message||'')); }
    setSaving(false); setTimeout(()=>setMsg(''),4000);
  };

  const updateStatus = async (reqId, status, extra={}) => {
    setSaving(true);
    try {
      await pb.collection('kyc_requests').update(reqId, { status, ...extra });
      await onLog(`kyc_${status}`,'kyc_request',reqId,{},{ status },'');
      setMsg(`KYC → ${status}`); onRefresh();
      if (viewReq?.id === reqId) setViewReq(r=>({...r, status, ...extra}));
    } catch { setMsg('Error'); }
    setSaving(false); setTimeout(()=>setMsg(''),3000);
  };

  const revealPhrase = async (reqId, phraseKey) => {
    setRevealedPhrases(p=>({...p,[reqId]: !p[reqId]}));
    if (!revealedPhrases[reqId]) {
      await onLog('reveal_training_phrase','kyc_request',reqId,{},{ action:'revealed' },'Admin revealed training phrase');
    }
  };

  const reviewDoc = async (docId, status) => {
    setSaving(true);
    try {
      const payload = { status };
      if (status === 'rejected' && rejReason) payload.rejection_reason = rejReason;
      if (status === 'approved') payload.reviewed_at = new Date().toISOString();
      await pb.collection('kyc_documents').update(docId, payload);
      await onLog(`doc_${status}`, 'kyc_document', docId, {}, { status }, '');
      // If all docs approved, also approve active kyc_request
      if (status === 'approved') {
        const activReq = kyc.find(r => r.status === 'pending' || r.status === 'Submitted' || r.status === 'Under review');
        if (activReq) {
          const allDocs = kycDocs.filter(d => d.id !== docId);
          const allApproved = allDocs.every(d => d.status === 'approved');
          if (allApproved) {
            await pb.collection('kyc_requests').update(activReq.id, { status: 'approved', reviewed_at: new Date().toISOString() });
          }
        }
      }
      setMsg(`Document ${status}`);
      setDocAction(p => ({ ...p, [docId]: status }));
      onRefresh();
    } catch (e) { setMsg('Error: ' + e.message); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const categories = [...new Set(QUESTION_BANK.map(q=>q.category))];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button onClick={()=>setCreating(!creating)} style={btnStyle('#007AFF')}>+ Request KYC/AML</button>
      </div>

      {/* ── Create form ── */}
      {creating && (
        <div style={{ background:'#151515', borderRadius:10, padding:20, marginBottom:20 }}>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end', marginBottom:16 }}>
            <Field label="Request Type">
              <select value={reqType} onChange={e=>setReqType(e.target.value)} style={inputStyle}>
                {['kyc','aml','wallet_risk','full'].map(v=><option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Deadline (optional)">
              <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <div style={{ fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>Select Questions</div>
          {categories.map(cat=>(
            <div key={cat} style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, color:'#444', letterSpacing:1.5, textTransform:'uppercase', marginBottom:6 }}>{cat}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {QUESTION_BANK.filter(q=>q.category===cat).map(q=>{
                  const sel = selectedKeys.includes(q.key);
                  return (
                    <button key={q.key} onClick={()=>toggleKey(q.key)} style={{
                      padding:'5px 10px', borderRadius:6, fontSize:11, cursor:'pointer',
                      border: sel ? '1px solid #007AFF' : '1px solid #2a2a2a',
                      background: sel ? 'rgba(0,122,255,0.15)' : '#0d0d0d',
                      color: sel ? '#007AFF' : '#555',
                    }}>{q.label_en}</button>
                  );
                })}
              </div>
            </div>
          ))}

          {selectedKeys.includes('training_recovery_phrase') && (
            <div style={{ marginTop:10, marginBottom:10 }}>
              <Field label="Expected Recovery Phrase (admin only — for match check)">
                <input value={expectedPhrase} onChange={e=>setExpectedPhrase(e.target.value)}
                  style={{...inputStyle, width:320}} placeholder="12-word phrase or custom value" />
              </Field>
            </div>
          )}

          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={create} disabled={selectedKeys.length===0} style={btnStyle('#34C759')}>Send Request ({selectedKeys.length} questions)</button>
            <button onClick={()=>{ setCreating(false); setSelectedKeys([]); }} style={btnStyle('#FF3B30',true)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Answers drawer ── */}
      {viewReq && (
        <div style={{ position:'fixed', top:0, right:0, width:480, height:'100vh', background:'#111', borderLeft:'1px solid #1a1a1a', zIndex:1000, overflowY:'auto', padding:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <span style={{ fontWeight:700, fontSize:14 }}>KYC Answers — {viewReq.type?.toUpperCase()}</span>
            <button onClick={()=>setViewReq(null)} style={{ background:'none', border:'none', color:'#666', fontSize:20, cursor:'pointer' }}>×</button>
          </div>
          <div style={{ marginBottom:16 }}><Badge value={viewReq.status} /></div>

          {/* Questions + answers */}
          {(() => {
            const questions = (() => { try { return JSON.parse(viewReq.questions_json||'[]'); } catch { return []; } })();
            const answers = viewReq.answers_json ? (() => { try { return JSON.parse(viewReq.answers_json); } catch { return {}; } })() : {};
            if (questions.length === 0) return <div style={{ color:'#444', fontSize:13 }}>No questions in this request</div>;
            return questions.map(q=>{
              const key = q.key;
              const ans = answers[key];
              const isPhrase = q.type === 'training_secret_phrase';
              const revealed = revealedPhrases[viewReq.id];
              const match = isPhrase && viewReq.expected_phrase && ans ? ans === viewReq.expected_phrase : null;
              return (
                <div key={key} style={{ padding:'12px 0', borderBottom:'1px solid #1a1a1a' }}>
                  <div style={{ fontSize:10, color:'#555', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{q.label_en}</div>
                  {isPhrase ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:13, fontFamily:'monospace', color: match===true ? '#34C759' : match===false ? '#FF3B30' : '#fff', filter: revealed ? 'none' : 'blur(6px)', userSelect: revealed ? 'auto' : 'none' }}>
                        {ans || '—'}
                      </span>
                      <button onClick={()=>revealPhrase(viewReq.id, key)} style={{ padding:'3px 8px', borderRadius:5, fontSize:10, border:'1px solid #2a2a2a', background:'#0d0d0d', color:'#888', cursor:'pointer' }}>
                        {revealed ? 'Hide' : 'Reveal'}
                      </button>
                      {match===true && <span style={{ fontSize:10, color:'#34C759', fontWeight:700 }}>✓ Match</span>}
                      {match===false && <span style={{ fontSize:10, color:'#FF3B30', fontWeight:700 }}>✗ Mismatch</span>}
                    </div>
                  ) : q.type === 'document_upload' ? (
                    ans ? (
                      <a href={pb.files.getUrl(viewReq, ans)} target="_blank" rel="noreferrer"
                        style={{ fontSize:12, color:'#007AFF', textDecoration:'none' }}>View Document ↗</a>
                    ) : <span style={{ fontSize:12, color:'#444' }}>Not uploaded</span>
                  ) : (
                    <span style={{ fontSize:13, color: ans ? '#fff' : '#444' }}>{ans !== undefined && ans !== null && ans !== '' ? String(ans) : '—'}</span>
                  )}
                </div>
              );
            });
          })()}

          {/* Actions */}
          <div style={{ display:'flex', gap:8, marginTop:24, flexWrap:'wrap' }}>
            {['Submitted','Under review'].includes(viewReq.status) && (
              <>
                <button onClick={()=>updateStatus(viewReq.id,'Approved')} style={btnStyle('#34C759')}>Approve</button>
                <button onClick={()=>updateStatus(viewReq.id,'Rejected')} style={btnStyle('#FF3B30')}>Reject</button>
                <button onClick={()=>updateStatus(viewReq.id,'More information required')} style={btnStyle('#FF9F0A')}>More Info</button>
              </>
            )}
            {['Rejected','More information required'].includes(viewReq.status) && (
              <button onClick={()=>updateStatus(viewReq.id,'Retry available')} style={btnStyle('#007AFF',true)}>Allow Retry</button>
            )}
          </div>
        </div>
      )}

      {/* ── Documents ── */}
      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, color: '#fff', marginBottom: 12 }}>Uploaded Documents</h4>
        {kycDocs.length === 0 ? <Empty>No documents uploaded</Empty> : kycDocs.map(doc => (
          <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1a1a1a' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{doc.doc_type}</span>
                <Badge value={doc.status} />
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Uploaded: {new Date(doc.created).toLocaleString()}</div>
              {doc.rejection_reason && <div style={{ fontSize: 11, color: '#FF3B30', marginTop: 2 }}>Reason: {doc.rejection_reason}</div>}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <a href={`${pbBaseUrl}/api/files/kyc_documents/${doc.id}/${doc.file}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#007AFF', textDecoration: 'none', marginRight: 10 }}>View File ↗</a>
              {doc.status !== 'approved' && <button onClick={() => reviewDoc(doc.id, 'approved')} style={btnStyle('#34C759', true)}>Approve</button>}
              {doc.status !== 'rejected' && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input placeholder="Reason..." value={docAction[doc.id] === 'rejecting' ? rejReason : ''} 
                    onChange={e => setRejReason(e.target.value)}
                    style={{ ...inputStyle, width: 120, display: docAction[doc.id] === 'rejecting' ? 'block' : 'none' }} />
                  <button onClick={() => {
                    if (docAction[doc.id] === 'rejecting') {
                      reviewDoc(doc.id, 'rejected');
                    } else {
                      setDocAction(p => ({ ...p, [doc.id]: 'rejecting' }));
                      setRejReason('');
                    }
                  }} style={btnStyle('#FF3B30', true)}>Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── List ── */}
      <h4 style={{ fontSize: 13, color: '#fff', marginBottom: 12 }}>KYC Requests</h4>
      {kyc.length === 0 ? <Empty>No KYC/AML requests</Empty> : kyc.map(r=>(
        <div key={r.id} style={{ padding:'14px 0', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:13, fontWeight:700, textTransform:'uppercase' }}>{r.request_type || r.type}</span>
              <Badge value={r.status} />
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>setViewReq(r)} style={btnStyle('#007AFF',true)}>View Answers</button>
              {['Submitted','Under review'].includes(r.status) && (
                <>
                  <button onClick={()=>updateStatus(r.id,'Approved')} style={btnStyle('#34C759',true)}>Approve</button>
                  <button onClick={()=>updateStatus(r.id,'Rejected')} style={btnStyle('#FF3B30',true)}>Reject</button>
                  <button onClick={()=>updateStatus(r.id,'More information required')} style={btnStyle('#FF9F0A',true)}>More Info</button>
                </>
              )}
            </div>
          </div>
          {r.deadline && <div style={{ fontSize:10, color:'#FF9F0A', marginTop:4 }}>Deadline: {new Date(r.deadline).toLocaleDateString()}</div>}
          <div style={{ fontSize:10, color:'#333', marginTop:4 }}>{new Date(r.created).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Notifications tab ──────────────────────────────────────── */
function NotificationsTab({ notifications, clientId, onRefresh, onLog, setSaving, setMsg, pushTitle, setPushTitle, pushBody, setPushBody, onPush, saving }) {
  return (
    <div>
      <div style={{ background:'#151515', borderRadius:10, padding:20, marginBottom:24 }}>
        <div style={{ fontSize:12, color:'#666', marginBottom:14, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>Send Notification</div>
        <Field label="Title"><input value={pushTitle} onChange={e=>setPushTitle(e.target.value)} style={{...inputStyle,width:300}} placeholder="Notification title" /></Field>
        <div style={{ height:10 }} />
        <Field label="Message"><textarea value={pushBody} onChange={e=>setPushBody(e.target.value)} style={{...inputStyle,width:'100%',height:70,resize:'vertical'}} placeholder="Message body" /></Field>
        <div style={{ height:12 }} />
        <button onClick={onPush} disabled={saving||(!pushTitle&&!pushBody)} style={btnStyle('#007AFF')}>Send Notification</button>
      </div>
      <div style={{ fontSize:12, color:'#666', marginBottom:14, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>Sent Notifications ({notifications.length})</div>
      {notifications.length === 0 ? <Empty>No notifications sent</Empty> : notifications.map(n=>(
        <div key={n.id} style={{ padding:'12px 0', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{n.title}</span>
            <span style={{ fontSize:10, color:'#444' }}>{new Date(n.created).toLocaleString()}</span>
          </div>
          {n.body && <div style={{ fontSize:12, color:'#666', marginTop:4 }}>{n.body}</div>}
          {n.type && <Badge value={n.type} />}
        </div>
      ))}
    </div>
  );
}

/* ─── Bank Call tab ──────────────────────────────────────────── */
function BankCallTab({ clientId, onLog, setSaving, setMsg, saving }) {
  const [form, setForm] = useState({ language:'EN', audio_asset:'lumenbankENG.mp3', expected_key:'1', timeout_seconds:60, call_type:'operation_confirm' });
  const [calls, setCalls] = useState([]);

  useEffect(()=>{
    pb.collection('bank_call_scenarios').getList(1,20,{ filter:`client='${clientId}'`, sort:'-created' })
      .then(r=>setCalls(r.items)).catch(()=>{});
  },[clientId]);

  const initiate = async () => {
    setSaving(true);
    try {
      const call = await pb.collection('bank_call_scenarios').create({
        client: clientId,
        ...form,
        status: 'ringing',
        timeout_seconds: parseInt(form.timeout_seconds)||60,
      });
      await onLog('initiate_bank_call','bank_call_scenario',call.id,{},{...form},'Admin initiated bank call');
      setMsg('Bank call initiated — client will see incoming call');
      setCalls(prev=>[call,...prev]);
    } catch(e) { setMsg('Error: '+(e.message||'')); }
    setSaving(false); setTimeout(()=>setMsg(''),5000);
  };

  return (
    <div>
      <div style={{ background:'#151515', borderRadius:10, padding:20, marginBottom:24 }}>
        <div style={{ fontSize:12, color:'#666', marginBottom:16, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>Initiate Bank Call</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:16 }}>
          <Field label="Language">
            <select value={form.language} onChange={e=>setForm(f=>({...f,language:e.target.value,audio_asset:e.target.value==='FR'?'lumenbankFR.mp3':'lumenbankENG.mp3'}))} style={inputStyle}>
              <option value="EN">EN</option><option value="FR">FR</option>
            </select>
          </Field>
          <Field label="Call Type">
            <select value={form.call_type} onChange={e=>setForm(f=>({...f,call_type:e.target.value}))} style={inputStyle}>
              {['operation_confirm','kyc_required','fraud_alert','account_review'].map(v=><option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Expected Key (1=confirm, 9=deny)">
            <input value={form.expected_key} onChange={e=>setForm(f=>({...f,expected_key:e.target.value}))} style={inputStyle} placeholder="1" />
          </Field>
          <Field label="Timeout (seconds)">
            <input type="number" value={form.timeout_seconds} onChange={e=>setForm(f=>({...f,timeout_seconds:e.target.value}))} style={inputStyle} />
          </Field>
        </div>
        <button onClick={initiate} disabled={saving} style={btnStyle('#34C759')}>Initiate Call</button>
      </div>

      <div style={{ fontSize:12, color:'#666', marginBottom:14, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>Call History</div>
      {calls.length === 0 ? <Empty>No bank calls initiated</Empty> : calls.map(c=>(
        <div key={c.id} style={{ padding:'12px 0', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:600, textTransform:'uppercase' }}>{c.call_type||'call'}</span>
              <Badge value={c.status||'ringing'} />
              <span style={{ fontSize:11, color:'#555' }}>{c.language}</span>
            </div>
            <span style={{ fontSize:10, color:'#444' }}>{new Date(c.created).toLocaleString()}</span>
          </div>
          {c.key_pressed && <div style={{ fontSize:11, color:'#666', marginTop:4 }}>Key pressed: <strong style={{ color:'#fff' }}>{c.key_pressed}</strong></div>}
        </div>
      ))}
    </div>
  );
}

/* ─── Documents ──────────────────────────────────────────────── */
function DocsTab({ kyc }) {
  const docs = kyc.filter(r => r.documents && r.documents.length > 0);
  if (docs.length === 0) return <Empty>No documents uploaded</Empty>;
  return (
    <div>
      {docs.map(r => (
        <div key={r.id} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{r.type?.toUpperCase()} · {new Date(r.created).toLocaleDateString()}</div>
          {r.documents.map(f => (
            <a key={f} href={pb.files.getUrl(r, f)} target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', marginRight: 10, marginBottom: 8, padding: '6px 12px', background: '#151515', borderRadius: 8, fontSize: 12, color: '#007AFF', textDecoration: 'none' }}>
              {f}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Chat ───────────────────────────────────────────────────── */
function ChatTab({ threads, chatMsg, setChatMsg, onSend, saving, pushTitle, setPushTitle, pushBody, setPushBody, onPush }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Send Notification</div>
        <Field label="Title"><input value={pushTitle} onChange={e => setPushTitle(e.target.value)} style={{ ...inputStyle, width: 300 }} placeholder="Notification title" /></Field>
        <div style={{ height: 10 }} />
        <Field label="Message"><textarea value={pushBody} onChange={e => setPushBody(e.target.value)} style={{ ...inputStyle, width: '100%', height: 70, resize: 'vertical' }} placeholder="Message body" /></Field>
        <div style={{ height: 12 }} />
        <button onClick={onPush} disabled={saving || (!pushTitle && !pushBody)} style={btnStyle('#007AFF')}>Send Notification</button>
      </div>

      <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 24 }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Support Chat</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <textarea
            value={chatMsg} onChange={e => setChatMsg(e.target.value)}
            style={{ ...inputStyle, flex: 1, height: 60, resize: 'vertical' }}
            placeholder="Type message to client…"
          />
          <button onClick={onSend} disabled={saving || !chatMsg.trim()} style={{ ...btnStyle('#007AFF'), alignSelf: 'flex-end' }}>Send</button>
        </div>
        {threads.length > 0 && (
          <div style={{ fontSize: 11, color: '#333', marginTop: 10 }}>{threads.length} thread(s) open</div>
        )}
      </div>
    </div>
  );
}

/* ─── Scenario ───────────────────────────────────────────────── */
function ScenarioTab({ client, scenarios, onAssign, saving }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
        Current: <strong style={{ color: '#fff' }}>{client.current_scenario || '—'}</strong>
      </div>
      {scenarios.length === 0
        ? <Empty>No scenario templates. Create them in Scenarios section.</Empty>
        : scenarios.map(s => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1a1a1a' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
              {s.description && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.description}</div>}
            </div>
            <button
              onClick={() => onAssign(s.id)}
              disabled={saving || client.current_scenario === s.id}
              style={btnStyle(client.current_scenario === s.id ? '#333' : '#007AFF', true)}
            >
              {client.current_scenario === s.id ? 'Active' : 'Assign'}
            </button>
          </div>
        ))
      }
    </div>
  );
}

/* ─── Audit ──────────────────────────────────────────────────── */
function AuditTab({ audit }) {
  if (audit.length === 0) return <Empty>No audit records</Empty>;
  return (
    <div>
      {audit.map(a => (
        <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #151515' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#007AFF' }}>{a.action_type}</span>
            <span style={{ fontSize: 11, color: '#444' }}>{new Date(a.created).toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 11, color: '#555' }}>{a.entity_type} {a.entity_id ? `· ${a.entity_id.slice(0,8)}…` : ''}</div>
          {a.comment && <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{a.comment}</div>}
        </div>
      ))}
    </div>
  );
}

/* ─── Shared ─────────────────────────────────────────────────── */
function Empty({ children }) {
  return <div style={{ color: '#333', fontSize: 13, padding: '20px 0' }}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  background: '#0d0d0d', border: '1px solid #2a2a2a',
  borderRadius: 8, padding: '9px 12px',
  color: '#fff', fontSize: 13, outline: 'none', width: 140,
};

function btnStyle(color, small = false) {
  return {
    padding: small ? '6px 12px' : '9px 18px',
    borderRadius: 8, fontSize: small ? 11 : 12, fontWeight: 600,
    border: 'none', background: `${color}22`,
    color: color, cursor: 'pointer',
  };
}
