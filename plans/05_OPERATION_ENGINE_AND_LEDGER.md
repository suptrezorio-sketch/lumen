# 05 — Operation Engine and Ledger

## Principle

One operation lifecycle. Many operation templates.

Do not create one generic form for all operations.

## Lifecycle

```text
Start operation
→ Select source
→ Fill operation-specific details
→ Enter or confirm amount
→ Calculate fees/rates/limits
→ Review
→ Confirm with PIN / Face ID / OTP / Bank Call
→ Submit
→ Pending / Processing by default
→ Admin/System review
→ Completed / Rejected / Failed
→ Receipt
→ History update
→ Notification
```

## Operation types

```text
MOBILE_TOP_UP
UTILITY_PAYMENT
INTERNAL_TRANSFER
CARD_TRANSFER
IBAN_TRANSFER
INTERNATIONAL_TRANSFER
TOP_UP
WITHDRAW
CRYPTO_BUY
CRYPTO_SELL
CRYPTO_SWAP
CRYPTO_TRANSFER
CREDIT_REPAYMENT
SMART_CONTRACT_FUNDING
CARD_STATUS_CHANGE
KYC_SUBMISSION
AML_SUBMISSION
```

## Details examples

Mobile top up:

```text
source_account
phone_number
operator
amount
fee
```

IBAN transfer:

```text
source_account
recipient_full_name
recipient_country
recipient_city
recipient_address
iban
bic_swift
bank_name
currency
amount
payment_purpose
comment
fee
estimated_arrival
```

Crypto transfer:

```text
source_wallet
asset
network
destination_wallet
memo/tag optional
amount
network_fee
```

## Statuses

```text
Draft
Submitted
Pending
Processing
Under Review
Approved
Completed
Rejected
Failed
Cancelled
Expired
Frozen
```

## Pending-by-default

All user-triggered operations are submitted successfully, but operational status is Pending/Processing by default.

## Ledger accounts

```text
id
client_id
type: fiat / crypto / credit / contract
currency
asset
available_balance
pending_balance
frozen_balance
status
created
updated
```

## Ledger entries

```text
id
operation_id
ledger_account_id
direction: debit / credit
amount
currency_or_asset
status: pending / posted / reversed / failed
created
posted_at
```

## Posting rules

Pending operation:

```text
pending_balance changes
available_balance unchanged
ledger entry status = pending
```

Approved operation:

```text
pending reduced
available updated
ledger entry status = posted
operation status = completed
receipt updated
notification sent
```

Rejected operation:

```text
pending released
ledger entry reversed/failed
operation status = rejected
receipt updated
notification sent
```
