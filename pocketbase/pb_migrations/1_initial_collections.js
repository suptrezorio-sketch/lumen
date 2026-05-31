/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  function makeCol(name, type, schema, rules) {
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

  // scenario_templates — no deps, must be first
  makeCol("scenario_templates", "base", [
    { name: "name",        type: "text",  required: true },
    { name: "description", type: "text" },
    { name: "steps",       type: "json" },
    { name: "active",      type: "bool" },
  ], {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'admins'",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // clients — auth collection
  makeCol("clients", "auth", [
    { name: "first_name",     type: "text", required: true },
    { name: "last_name",      type: "text", required: true },
    { name: "phone",          type: "text" },
    { name: "country",        type: "text" },
    { name: "language",       type: "select", options: { values: ["en","fr"] } },
    { name: "account_status", type: "select", options: { values: ["pending","approved","blocked","rejected"] } },
    { name: "kyc_status",     type: "select", options: { values: ["none","required","submitted","approved","rejected"] } },
    { name: "aml_status",     type: "select", options: { values: ["none","required","submitted","approved","rejected"] } },
    { name: "risk_level",     type: "select", options: { values: ["low","medium","high","critical"] } },
  ], {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.id = id || @request.auth.collectionName = 'admins'",
    create: "",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // client_applications
  makeCol("client_applications", "base", [
    { name: "client",            type: "relation", options: { collectionId: "_pb_users_auth_", cascadeDelete: true } },
    { name: "status",            type: "select", options: { values: ["submitted","under_review","approved","rejected","more_info_required"] } },
    { name: "rejection_reason",  type: "text" },
    { name: "notes",             type: "text" },
  ], {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    create: "@request.auth.collectionName = 'clients'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // ledger_accounts
  makeCol("ledger_accounts", "base", [
    { name: "client",            type: "text", required: true },
    { name: "type",              type: "select", options: { values: ["fiat","crypto","credit","contract"] }, required: true },
    { name: "currency",          type: "text" },
    { name: "asset",             type: "text" },
    { name: "available_balance", type: "number" },
    { name: "pending_balance",   type: "number" },
    { name: "frozen_balance",    type: "number" },
    { name: "status",            type: "select", options: { values: ["active","frozen","closed"] } },
  ], {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'admins'",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // operations
  makeCol("operations", "base", [
    { name: "client",      type: "text",   required: true },
    { name: "type",        type: "select", required: true, options: { values: [
      "MOBILE_TOP_UP","UTILITY_PAYMENT","INTERNAL_TRANSFER","CARD_TRANSFER",
      "IBAN_TRANSFER","INTERNATIONAL_TRANSFER","TOP_UP","WITHDRAW",
      "CRYPTO_BUY","CRYPTO_SELL","CRYPTO_SWAP","CRYPTO_TRANSFER",
      "CREDIT_REPAYMENT","SMART_CONTRACT_FUNDING","CARD_STATUS_CHANGE",
      "KYC_SUBMISSION","AML_SUBMISSION"
    ]}},
    { name: "amount",      type: "number", required: true },
    { name: "currency",    type: "text" },
    { name: "status",      type: "select", options: { values: [
      "Draft","Submitted","Pending","Processing","Under Review",
      "Approved","Completed","Rejected","Failed","Cancelled","Frozen"
    ]}},
    { name: "details",     type: "json" },
    { name: "receipt_url", type: "url" },
    { name: "risk_level",  type: "select", options: { values: ["low","medium","high","critical"] } },
    { name: "note",        type: "text" },
  ], {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    create: "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // ledger_entries
  makeCol("ledger_entries", "base", [
    { name: "operation",      type: "text" },
    { name: "ledger_account", type: "text", required: true },
    { name: "direction",      type: "select", options: { values: ["debit","credit"] }, required: true },
    { name: "amount",         type: "number", required: true },
    { name: "currency",       type: "text" },
    { name: "status",         type: "select", options: { values: ["pending","posted","reversed","failed"] } },
    { name: "posted_at",      type: "date" },
  ], {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'admins'",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // cards
  makeCol("cards", "base", [
    { name: "client",         type: "text", required: true },
    { name: "ledger_account", type: "text" },
    { name: "type",           type: "select", options: { values: ["fiat","crypto","credit","virtual"] }, required: true },
    { name: "label",          type: "text" },
    { name: "number_last4",   type: "text" },
    { name: "number_full",    type: "text" },
    { name: "expiry",         type: "text" },
    { name: "holder",         type: "text" },
    { name: "currency",       type: "text" },
    { name: "status",         type: "select", options: { values: ["active","frozen","blocked","pending"] } },
    { name: "freeze_reason",  type: "text" },
    { name: "activation_condition", type: "json" },
  ], {
    list:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // crypto_wallets
  makeCol("crypto_wallets", "base", [
    { name: "client",  type: "text", required: true },
    { name: "asset",   type: "text", required: true },
    { name: "network", type: "text" },
    { name: "address", type: "text" },
    { name: "balance", type: "number" },
    { name: "status",  type: "select", options: { values: ["active","frozen","hidden"] } },
  ], {
    list:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // smart_contracts
  makeCol("smart_contracts", "base", [
    { name: "client",      type: "text", required: true },
    { name: "title",       type: "text", required: true },
    { name: "description", type: "text" },
    { name: "amount",      type: "number" },
    { name: "currency",    type: "text" },
    { name: "status",      type: "select", options: { values: ["draft","active","pending","completed","cancelled"] } },
    { name: "conditions",  type: "json" },
    { name: "buttons",     type: "json" },
    { name: "expires_at",  type: "date" },
  ], {
    list:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // notifications
  makeCol("notifications", "base", [
    { name: "client",  type: "text", required: true },
    { name: "type",    type: "select", options: { values: ["push","in_app","system"] } },
    { name: "title",   type: "text" },
    { name: "body",    type: "text" },
    { name: "read",    type: "bool" },
    { name: "action",  type: "text" },
    { name: "sent_by", type: "text" },
  ], {
    list:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // support_threads
  makeCol("support_threads", "base", [
    { name: "client",      type: "text", required: true },
    { name: "status",      type: "select", options: { values: ["open","closed"] } },
    { name: "assigned_to", type: "text" },
  ], {
    list:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    create: "@request.auth.collectionName = 'admins' || @request.auth.collectionName = 'clients'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // support_messages
  makeCol("support_messages", "base", [
    { name: "thread",       type: "text", required: true },
    { name: "sender_type",  type: "select", options: { values: ["client","admin"] } },
    { name: "sender_id",    type: "text" },
    { name: "text",         type: "text", required: true },
    { name: "read",         type: "bool" },
  ], {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'admins'",
    create: "@request.auth.collectionName = 'admins' || @request.auth.collectionName = 'clients'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // kyc_requests
  makeCol("kyc_requests", "base", [
    { name: "client",      type: "text", required: true },
    { name: "type",        type: "select", options: { values: ["kyc","aml","wallet_risk"] }, required: true },
    { name: "status",      type: "select", options: { values: ["pending","submitted","approved","rejected","more_info_required"] } },
    { name: "questions",   type: "json" },
    { name: "answers",     type: "json" },
    { name: "documents",   type: "file", options: { maxSelect: 5, mimeTypes: ["application/pdf","image/jpeg","image/png","image/webp"] } },
    { name: "reviewed_by", type: "text" },
    { name: "note",        type: "text" },
  ], {
    list:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins' || @request.auth.id = client",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // promo_banners
  makeCol("promo_banners", "base", [
    { name: "title_en",    type: "text" },
    { name: "title_fr",    type: "text" },
    { name: "subtitle_en", type: "text" },
    { name: "subtitle_fr", type: "text" },
    { name: "image",       type: "file", options: { maxSelect: 1 } },
    { name: "cta_en",      type: "text" },
    { name: "cta_fr",      type: "text" },
    { name: "target",      type: "text" },
    { name: "priority",    type: "number" },
    { name: "enabled",     type: "bool" },
    { name: "start_date",  type: "date" },
    { name: "end_date",    type: "date" },
  ], {
    list:   "@request.auth.collectionName = 'clients' || @request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'clients' || @request.auth.collectionName = 'admins'",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

  // audit_logs
  makeCol("audit_logs", "base", [
    { name: "admin_id",     type: "text" },
    { name: "action_type",  type: "text", required: true },
    { name: "client_id",    type: "text" },
    { name: "entity_type",  type: "text" },
    { name: "entity_id",    type: "text" },
    { name: "old_value",    type: "json" },
    { name: "new_value",    type: "json" },
    { name: "comment",      type: "text" },
    { name: "ip",           type: "text" },
  ], {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'admins'",
    create: "@request.auth.collectionName = 'admins'",
    update: null,
    delete: null,
  });

  // bank_call_scenarios
  makeCol("bank_call_scenarios", "base", [
    { name: "name",         type: "text", required: true },
    { name: "language",     type: "select", options: { values: ["en","fr"] } },
    { name: "audio_url",    type: "url" },
    { name: "expected_key", type: "text" },
    { name: "timeout",      type: "number" },
    { name: "retry_count",  type: "number" },
  ], {
    list:   "@request.auth.collectionName = 'admins'",
    view:   "@request.auth.collectionName = 'admins' || @request.auth.collectionName = 'clients'",
    create: "@request.auth.collectionName = 'admins'",
    update: "@request.auth.collectionName = 'admins'",
    delete: "@request.auth.collectionName = 'admins'",
  });

}, (db) => {
  const dao = new Dao(db);
  const names = [
    "bank_call_scenarios","audit_logs","promo_banners","kyc_requests",
    "support_messages","support_threads","notifications","smart_contracts",
    "crypto_wallets","cards","ledger_entries","operations","ledger_accounts",
    "client_applications","clients","scenario_templates"
  ];
  for (const name of names) {
    try {
      const col = dao.findCollectionByNameOrId(name);
      dao.deleteCollection(col);
    } catch(e) {}
  }
});
