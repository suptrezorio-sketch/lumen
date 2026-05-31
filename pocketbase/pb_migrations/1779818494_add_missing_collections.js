/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  function makeCol(name, type, schema, rules) {
    // Skip if collection already exists
    try {
      dao.findCollectionByName(name);
      console.log(`[migration] Collection "${name}" already exists, skipping.`);
      return;
    } catch (e) {
      // Collection does not exist, create it
    }
    const col = new Collection();
    col.name = name;
    col.type = type || "base";
    col.system = false;
    col.listRule   = rules.list   !== undefined ? rules.list   : null;
    col.viewRule   = rules.view   !== undefined ? rules.view   : null;
    col.createRule = rules.create !== undefined ? rules.create : null;
    col.updateRule = rules.update !== undefined ? rules.update : null;
    col.deleteRule = rules.delete !== undefined ? rules.delete : null;
    for (const f of schema) {
      col.schema.addField(new SchemaField(f));
    }
    dao.saveCollection(col);
  }

  const adminOnly = {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'admins'",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  };

  const adminOrOwner = {
    list:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    delete: "@request.auth.collectionName = 'admins'",
  };

  // client_profiles
  makeCol("client_profiles", "base", [
    { name: "client", type: "text", required: true },
    { name: "avatar", type: "file", options: { maxSelect: 1, mimeTypes: ["image/jpeg","image/png","image/webp"] } },
    { name: "address", type: "text" },
    { name: "date_of_birth", type: "date" },
    { name: "employment_status", type: "text" }
  ], adminOrOwner);

  // client_scenarios
  makeCol("client_scenarios", "base", [
    { name: "client", type: "text", required: true },
    { name: "scenario_template", type: "text", required: true },
    { name: "status", type: "select", options: { values: ["active","completed","paused","cancelled"] } },
    { name: "current_step", type: "number" }
  ], adminOrOwner);

  // transactions
  makeCol("transactions", "base", [
    { name: "client", type: "text", required: true },
    { name: "operation", type: "text" },
    { name: "amount", type: "number", required: true },
    { name: "currency", type: "text", required: true },
    { name: "status", type: "select", options: { values: ["pending","completed","failed","reversed"] } },
    { name: "type", type: "text" }
  ], adminOrOwner);

  // receipts
  makeCol("receipts", "base", [
    { name: "client", type: "text", required: true },
    { name: "transaction", type: "text", required: true },
    { name: "file", type: "file", options: { maxSelect: 1, mimeTypes: ["application/pdf","image/png"] } }
  ], adminOrOwner);

  // devices
  makeCol("devices", "base", [
    { name: "client", type: "text", required: true },
    { name: "device_id", type: "text", required: true },
    { name: "device_name", type: "text" },
    { name: "last_active", type: "date" },
    { name: "is_trusted", type: "bool" }
  ], adminOrOwner);

  // sessions
  makeCol("sessions", "base", [
    { name: "client", type: "text", required: true },
    { name: "device", type: "text" },
    { name: "token", type: "text" },
    { name: "expires_at", type: "date" },
    { name: "is_active", type: "bool" }
  ], adminOrOwner);

  // kyc_question_bank
  makeCol("kyc_question_bank", "base", [
    { name: "category", type: "text", required: true },
    { name: "question_text", type: "text", required: true },
    { name: "question_type", type: "select", options: { values: ["text","boolean","select","file"] } },
    { name: "options", type: "json" },
    { name: "is_active", type: "bool" }
  ], adminOnly);

  // kyc_submissions
  makeCol("kyc_submissions", "base", [
    { name: "client", type: "text", required: true },
    { name: "kyc_request", type: "text", required: true },
    { name: "status", type: "select", options: { values: ["pending","reviewed","approved","rejected"] } },
    { name: "submitted_at", type: "date" }
  ], adminOrOwner);

  // kyc_answers
  makeCol("kyc_answers", "base", [
    { name: "submission", type: "text", required: true },
    { name: "question", type: "text", required: true },
    { name: "answer_text", type: "text" },
    { name: "answer_file", type: "file" }
  ], adminOrOwner);

  // kyc_documents
  makeCol("kyc_documents", "base", [
    { name: "client", type: "text", required: true },
    { name: "submission", type: "text" },
    { name: "document_type", type: "text", required: true },
    { name: "file", type: "file", required: true },
    { name: "status", type: "select", options: { values: ["pending","verified","rejected"] } }
  ], adminOrOwner);

  // scenario_sensitive_answers
  makeCol("scenario_sensitive_answers", "base", [
    { name: "client", type: "text", required: true },
    { name: "scenario", type: "text", required: true },
    { name: "key", type: "text", required: true },
    { name: "value", type: "text", required: true } // Encrypted or restricted view
  ], adminOnly);

  // smart_contract_events
  makeCol("smart_contract_events", "base", [
    { name: "smart_contract", type: "text", required: true },
    { name: "event_type", type: "text", required: true },
    { name: "details", type: "json" }
  ], adminOrOwner);

  // smart_contract_buttons
  makeCol("smart_contract_buttons", "base", [
    { name: "smart_contract", type: "text", required: true },
    { name: "label", type: "text", required: true },
    { name: "action", type: "text", required: true },
    { name: "is_enabled", type: "bool" }
  ], adminOrOwner);

  // smart_contract_conditions
  makeCol("smart_contract_conditions", "base", [
    { name: "smart_contract", type: "text", required: true },
    { name: "condition_type", type: "text", required: true },
    { name: "value", type: "text" },
    { name: "is_met", type: "bool" }
  ], adminOrOwner);

  // bank_call_events
  makeCol("bank_call_events", "base", [
    { name: "client", type: "text", required: true },
    { name: "scenario", type: "text", required: true },
    { name: "event_type", type: "text", required: true },
    { name: "data", type: "json" }
  ], adminOrOwner);

  // ===== LUMEN CORE COLLECTIONS =====

  // accounts — fiat/crypto/credit accounts per client
  makeCol("accounts", "base", [
    { name: "client", type: "text", required: true },
    { name: "account_type", type: "select", options: { values: ["fiat","crypto","credit","contract"] } },
    { name: "currency", type: "text", required: true },
    { name: "asset", type: "text" },
    { name: "available_balance", type: "number", required: true },
    { name: "pending_balance", type: "number", required: true },
    { name: "frozen_balance", type: "number", required: true },
    { name: "status", type: "select", options: { values: ["active","frozen","closed","pending"] } },
    { name: "account_number", type: "text" },
    { name: "iban", type: "text" },
    { name: "swift_bic", type: "text" }
  ], adminOrOwner);

  // crypto_wallets — per-asset wallets
  makeCol("crypto_wallets", "base", [
    { name: "client", type: "text", required: true },
    { name: "asset", type: "text", required: true },
    { name: "address", type: "text" },
    { name: "network", type: "text" },
    { name: "balance", type: "number", required: true },
    { name: "status", type: "select", options: { values: ["active","frozen","pending"] } },
    { name: "memo_tag", type: "text" }
  ], adminOrOwner);

  // ledger_accounts — internal ledger accounts
  makeCol("ledger_accounts", "base", [
    { name: "client", type: "text", required: true },
    { name: "type", type: "select", options: { values: ["fiat","crypto","credit","contract"] }, required: true },
    { name: "currency", type: "text", required: true },
    { name: "asset", type: "text" },
    { name: "available_balance", type: "number", required: true },
    { name: "pending_balance", type: "number", required: true },
    { name: "frozen_balance", type: "number", required: true },
    { name: "status", type: "select", options: { values: ["active","frozen","closed"] } }
  ], adminOrOwner);

  // ledger_entries — debit/credit entries per operation
  makeCol("ledger_entries", "base", [
    { name: "operation", type: "text", required: true },
    { name: "ledger_account", type: "text", required: true },
    { name: "direction", type: "select", options: { values: ["debit","credit"] }, required: true },
    { name: "amount", type: "number", required: true },
    { name: "currency_or_asset", type: "text", required: true },
    { name: "status", type: "select", options: { values: ["pending","posted","reversed","failed"] } },
    { name: "posted_at", type: "date" }
  ], adminOnly);

  // operations — user-triggered pending-by-default operations
  makeCol("operations", "base", [
    { name: "client", type: "text", required: true },
    { name: "type", type: "select", options: { values: ["MOBILE_TOP_UP","UTILITY_PAYMENT","INTERNAL_TRANSFER","CARD_TRANSFER","IBAN_TRANSFER","INTERNATIONAL_TRANSFER","TOP_UP","WITHDRAW","CRYPTO_BUY","CRYPTO_SELL","CRYPTO_SWAP","CRYPTO_TRANSFER","CREDIT_REPAYMENT","SMART_CONTRACT_FUNDING","CARD_STATUS_CHANGE","KYC_SUBMISSION","AML_SUBMISSION"] }, required: true },
    { name: "status", type: "select", options: { values: ["Draft","Submitted","Pending","Processing","Under Review","Approved","Completed","Rejected","Failed","Cancelled","Expired","Frozen"] }, required: true },
    { name: "amount", type: "number", required: true },
    { name: "currency", type: "text", required: true },
    { name: "fee", type: "number" },
    { name: "source", type: "text" },
    { name: "destination", type: "text" },
    { name: "details", type: "json" },
    { name: "confirmation_method", type: "select", options: { values: ["pin","otp","bank_call","face_id"] } },
    { name: "confirmation_status", type: "select", options: { values: ["none","pending","completed","failed"] } },
    { name: "admin_reviewer", type: "text" },
    { name: "reviewed_at", type: "date" },
    { name: "review_comment", type: "text" }
  ], adminOrOwner);

  // client_applications — registration/approval flow
  makeCol("client_applications", "base", [
    { name: "client", type: "text", required: true },
    { name: "full_name", type: "text", required: true },
    { name: "email", type: "text", required: true },
    { name: "phone", type: "text", required: true },
    { name: "country", type: "text" },
    { name: "date_of_birth", type: "date" },
    { name: "address", type: "text" },
    { name: "status", type: "select", options: { values: ["submitted","approved","rejected","info_required"] }, required: true },
    { name: "assigned_scenario", type: "text" },
    { name: "admin_note", type: "text" },
    { name: "submitted_at", type: "date" },
    { name: "approved_at", type: "date" }
  ], adminOrOwner);

  // scenario_templates — admin-defined client scenarios
  makeCol("scenario_templates", "base", [
    { name: "name", type: "text", required: true },
    { name: "name_fr", type: "text" },
    { name: "description", type: "text" },
    { name: "description_fr", type: "text" },
    { name: "initial_fiat_balance", type: "number" },
    { name: "initial_crypto_assets", type: "json" },
    { name: "card_type", type: "select", options: { values: ["fiat","crypto","credit","virtual","smart_contract"] } },
    { name: "card_status", type: "select", options: { values: ["active","frozen","pending"] } },
    { name: "smart_contract_template", type: "json" },
    { name: "kyc_required", type: "bool" },
    { name: "promo_banners", type: "json" },
    { name: "initial_notifications", type: "json" },
    { name: "initial_transactions", type: "json" },
    { name: "activation_conditions", type: "json" },
    { name: "is_active", type: "bool" }
  ], adminOnly);

  // kyc_requests — KYC/AML requests per client
  makeCol("kyc_requests", "base", [
    { name: "client", type: "text", required: true },
    { name: "status", type: "select", options: { values: ["none","required","in_progress","submitted","under_review","approved","rejected","more_info","retry_available","appeal_submitted","final_rejected","expired"] }, required: true },
    { name: "request_type", type: "select", options: { values: ["full_kyc","identity_only","document_update","aml_review"] } },
    { name: "questions", type: "json" },
    { name: "required_documents", type: "json" },
    { name: "deadline", type: "date" },
    { name: "submitted_at", type: "date" },
    { name: "reviewed_at", type: "date" },
    { name: "review_comment", type: "text" },
    { name: "rejection_reason", type: "text" },
    { name: "admin_reviewer", type: "text" }
  ], adminOrOwner);

  // smart_contracts — settlement orders
  makeCol("smart_contracts", "base", [
    { name: "client", type: "text", required: true },
    { name: "contract_id", type: "text", required: true },
    { name: "issuer", type: "text" },
    { name: "beneficiary", type: "text" },
    { name: "asset", type: "text", required: true },
    { name: "asset_amount", type: "number", required: true },
    { name: "fiat_equivalent", type: "number" },
    { name: "required_input_condition", type: "json" },
    { name: "output_asset_amount", type: "number" },
    { name: "output_fiat_equivalent", type: "number" },
    { name: "linked_card", type: "text" },
    { name: "linked_wallet", type: "text" },
    { name: "linked_account", type: "text" },
    { name: "status", type: "select", options: { values: ["Draft","Waiting for verification","Waiting for signature","Waiting for funding","Processing","Pending","Active","Under review","Completed","Rejected","Frozen","Cancelled","Expired"] }, required: true },
    { name: "aml_status", type: "select", options: { values: ["none","pending","approved","rejected"] } },
    { name: "preauth_status", type: "select", options: { values: ["none","pending","approved","failed"] } },
    { name: "confirmation_blocks", type: "number" },
    { name: "live_progress", type: "number" },
    { name: "fee_tax_field", type: "text" },
    { name: "due_date", type: "date" },
    { name: "activity_log", type: "json" }
  ], adminOrOwner);

  // admin_roles — admin permission model
  makeCol("admin_roles", "base", [
    { name: "admin", type: "text", required: true },
    { name: "role", type: "select", options: { values: ["super_admin","admin","manager","compliance_reviewer","support"] }, required: true },
    { name: "permissions", type: "json" },
    { name: "is_active", type: "bool" }
  ], adminOnly);

  // audit_logs — append-only admin action log
  makeCol("audit_logs", "base", [
    { name: "admin", type: "text", required: true },
    { name: "action_type", type: "text", required: true },
    { name: "client", type: "text" },
    { name: "entity_type", type: "text" },
    { name: "entity_id", type: "text" },
    { name: "old_value", type: "json" },
    { name: "new_value", type: "json" },
    { name: "visible_to_client", type: "bool" },
    { name: "comment", type: "text" },
    { name: "ip_address", type: "text" },
    { name: "device_info", type: "text" }
  ], adminOnly);

  // promo_banners — admin-managed banners
  makeCol("promo_banners", "base", [
    { name: "title_en", type: "text", required: true },
    { name: "title_fr", type: "text" },
    { name: "subtitle_en", type: "text" },
    { name: "subtitle_fr", type: "text" },
    { name: "icon", type: "text" },
    { name: "bg_color", type: "text" },
    { name: "cta_label_en", type: "text" },
    { name: "cta_label_fr", type: "text" },
    { name: "target_action", type: "text" },
    { name: "target_route", type: "text" },
    { name: "visibility_rules", type: "json" },
    { name: "segment_targeting", type: "json" },
    { name: "priority", type: "number" },
    { name: "start_date", type: "date" },
    { name: "end_date", type: "date" },
    { name: "active", type: "bool" },
    { name: "sort_order", type: "number" }
  ], adminOnly);

  // support_messages — per-thread messages
  makeCol("support_messages", "base", [
    { name: "thread", type: "text", required: true },
    { name: "sender_type", type: "select", options: { values: ["admin","client","system"] }, required: true },
    { name: "sender_id", type: "text" },
    { name: "text", type: "text", required: true },
    { name: "attachments", type: "json" },
    { name: "is_read", type: "bool" }
  ], adminOrOwner);

}, (db) => {
  const dao = new Dao(db);
  const names = [
    "client_profiles", "client_scenarios", "transactions", "receipts", "devices", "sessions",
    "kyc_question_bank", "kyc_submissions", "kyc_answers", "kyc_documents", "scenario_sensitive_answers",
    "smart_contract_events", "smart_contract_buttons", "smart_contract_conditions", "bank_call_events",
    "accounts", "crypto_wallets", "ledger_accounts", "ledger_entries", "operations",
    "client_applications", "scenario_templates", "kyc_requests", "smart_contracts",
    "admin_roles", "audit_logs", "promo_banners", "support_messages"
  ];
  for (const name of names) {
    try {
      const col = dao.findCollectionByNameOrId(name);
      dao.deleteCollection(col);
    } catch(e) {}
  }
});
