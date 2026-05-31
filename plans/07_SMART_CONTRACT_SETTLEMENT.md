# 07 — Smart Contract / Settlement Order

## Goal

Convert old standalone personal order / smart contract page into an in-app Lumen module.

Do not copy old HTML design.

## Where it appears

```text
Home card carousel
Crypto page linked block
Smart Contract detail screen
History
Notifications
Admin Client Card
```

## Smart Contract fields

```text
id
client_id
contract_id
order_id
issuer / fund / origin
beneficiary
asset
asset_amount
fiat_equivalent
required_input_condition_json
output_asset_amount
output_fiat_equivalent
linked_card_id
linked_wallet_id
linked_account_id
status
aml_status
preauth_status
confirmation_blocks
live_progress
fee_tax_field
due_date
activity_log_json
created
updated
```

## Statuses

```text
Draft
Waiting for verification
Waiting for signature
Waiting for funding
Processing
Pending
Active
Under review
Completed
Rejected
Frozen
Cancelled
Expired
```

## Client detail screen

Must show:

```text
contract visual card
contract/order ID
status
issuer/fund/origin
beneficiary
asset amount
fiat equivalent
required input condition
expected output
linked card/wallet/account
AML status
pre-authorization status
confirmation block progress
live progress
due date
activity log
optional action buttons
support/contact CTA
```

## Optional action buttons

Preserve old 3-step idea as configurable buttons.

Fields:

```text
button_id
contract_id
label_en
label_fr
url
enabled
visibility_rules_json
required_step
sort_order
```

Buttons may stay empty/disabled until their purpose is defined.

## CRM controls

Admin can:

```text
create contract
assign to client
change status
change amounts
change required condition
link card/wallet/account
edit due date
edit progress
enable/disable action buttons
reset activation steps
send notification
generate PDF certificate
```
