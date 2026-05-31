import pb from '../../lib/pb';

/**
 * Processes an operation status change from an admin view.
 * Handles ledger entries, balances, and receipt generation.
 *
 * @param {string} opId - The ID of the operation.
 * @param {string} newStatus - The new status (e.g. 'Completed', 'Rejected').
 * @param {object} opData - (Optional) Current operation data.
 */
export async function processOperationStatus(opId, newStatus, opData = null) {
  try {
    const op = opData || await pb.collection('operations').getOne(opId);

    // 1. Update the operation status
    await pb.collection('operations').update(opId, { status: newStatus });

    // 2. Process Ledger Entries
    if (newStatus === 'Completed' || newStatus === 'Rejected') {
      const entriesRes = await pb.collection('ledger_entries').getList(1, 10, {
        filter: `operation_id = '${opId}' && status = 'pending'`,
      });
      
      for (const entry of entriesRes.items) {
        const account = await pb.collection('ledger_accounts').getOne(entry.ledger_account_id);
        const amount = parseFloat(entry.amount || 0);

        if (newStatus === 'Completed') {
          // Post the entry
          await pb.collection('ledger_entries').update(entry.id, {
            status: 'posted',
            posted_at: new Date().toISOString(),
          });
          
          // Update balances: deduct from pending, deduct from available (for debits)
          if (entry.direction === 'debit') {
            await pb.collection('ledger_accounts').update(account.id, {
              pending_balance: (account.pending_balance || 0) - amount,
              available_balance: (account.available_balance || 0) - amount,
            });
          } else {
            // If credit
            await pb.collection('ledger_accounts').update(account.id, {
              pending_balance: (account.pending_balance || 0) - amount,
              available_balance: (account.available_balance || 0) + amount,
            });
          }
        } else if (newStatus === 'Rejected') {
          // Reverse the entry
          await pb.collection('ledger_entries').update(entry.id, {
            status: 'reversed',
          });
          
          // Release pending balance
          await pb.collection('ledger_accounts').update(account.id, {
            pending_balance: (account.pending_balance || 0) - amount,
          });
        }
      }

      // 3. Generate Receipt if Completed
      if (newStatus === 'Completed') {
        const receiptExists = await pb.collection('receipts').getList(1, 1, { filter: `operation_id = '${opId}'` });
        if (receiptExists.items.length === 0) {
          const receiptDetails = {
            amount: op.amount,
            currency: op.currency,
            type: op.type,
            details: op.details,
            date: new Date().toISOString(),
            transaction_id: `#TX-${op.id.substring(0,8).toUpperCase()}`,
          };
          await pb.collection('receipts').create({
            client_id: op.client,
            operation_id: op.id,
            receipt_url: '', // Future implementation: generate PDF or specific URL
            details: JSON.stringify(receiptDetails)
          });
        }
      }
    }

    // 4. Create Audit Log
    await pb.collection('audit_logs').create({
      admin_id: pb.authStore.model?.id,
      action_type: `operation_${newStatus.toLowerCase()}`,
      entity_type: 'operation',
      entity_id: opId,
      new_value: { status: newStatus },
      client_id: op.client,
    });

    return true;
  } catch (err) {
    console.error('Failed to process operation status:', err);
    throw err;
  }
}
