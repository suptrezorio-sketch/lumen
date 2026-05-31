# 04 — PocketBase Architecture

## Decision

Use PocketBase as backend engine:

```text
PocketBase = auth + database + realtime + files + API
Custom Lumen Admin = CRM frontend
Client App = banking frontend
```

Do not treat PocketBase admin UI as the final CRM.

## Deployment

Recommended server layout:

```text
/client-app
/admin-app
/pocketbase
```

Domains:

```text
app.domain.com
admin.domain.com
api.domain.com
```

## Core collections

```text
clients
admins
admin_roles
client_applications
client_profiles
scenario_templates
client_scenarios
accounts
cards
crypto_wallets
ledger_accounts
ledger_entries
operations
transactions
receipts
notifications
promo_banners
support_threads
support_messages
devices
sessions
audit_logs
```

## KYC / AML collections

```text
kyc_question_bank
kyc_requests
kyc_submissions
kyc_answers
kyc_documents
scenario_sensitive_answers
```

## Smart Contract collections

```text
smart_contracts
smart_contract_events
smart_contract_buttons
smart_contract_conditions
```

## Bank Call collections

```text
bank_call_scenarios
bank_call_events
```

## Access model

Roles:

```text
super_admin
admin
manager
compliance_reviewer
support
client
```

Rules:

```text
clients can read only their own app data
clients cannot write balances directly
admins can act according to role
audit log is append-only
sensitive answers require elevated permission to reveal
documents visible only to authorized admin roles
```

## Hooks / business logic

Implement hooks for:

```text
after client application created → status submitted
after admin approves client → assign scenario
after operation created → status pending
after operation approved → post ledger entries
after operation rejected → release pending balance
after document uploaded → update KYC request status
after smart contract updated → create notification
after crypto activation condition met → unfreeze card or notify admin
after bank call key pressed → update operation confirmation record
```

## Backups and security

```text
daily backup pb_data
off-server backup
weekly restore test
HTTPS only
strong admin passwords
admin route protected
IP allowlist or access proxy where possible
no public direct access to sensitive files
audit every sensitive view/reveal
```
