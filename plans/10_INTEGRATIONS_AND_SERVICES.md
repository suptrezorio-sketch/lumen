# 10 — Integrations and Services

## PDF receipts

Add branded PDF receipts.

Candidates:

```text
CraftMyPDF
PDFMonkey
APITemplate.io
local HTML-to-PDF service later
```

Flow:

```text
operation status created/updated
→ build receipt JSON
→ generate PDF from template
→ store PDF URL
→ show Share / Download / Email
→ admin can regenerate
```

PDF types:

```text
transaction receipt
pending operation receipt
card statement
account statement
smart contract certificate
KYC/AML submission summary
```

## Push notifications

Candidate:

```text
OneSignal
```

Use for:

```text
operation submitted
operation processing
operation completed
operation rejected
KYC required
document requested
card frozen/unfrozen
smart contract updated
bank call required
manager/support message
```

## In-app simulated Bank Call

Do not start MVP with real telephony.

Flow:

```text
operation submitted
→ confirmation method: Bank Call
→ incoming call screen inside app
→ user taps Accept
→ EN/FR audio plays
→ custom keypad appears
→ press 1: confirm
→ press 9: deny
→ press #: contact manager/support
→ result stored
→ operation moves Pending/Under Review
```

CRM controls:

```text
call scenario type
audio language
audio asset
expected key
timeout
retry count
result action
```

## Analytics

Track non-sensitive events only:

```text
operation_started
operation_submitted
receipt_opened
bank_call_accepted
bank_call_key_pressed
kyc_started
kyc_submitted
document_uploaded
smart_contract_opened
crypto_card_activation_viewed
```

Never track:

```text
full card numbers
passport data
documents
training_recovery_phrase
phone/email raw values
wallet phrase values
```
