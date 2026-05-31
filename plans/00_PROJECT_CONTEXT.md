# 00 — Project Context

## Product

**Name:** LUMEN Bank  
**Type:** premium neobank-style training banking app  
**Languages:** English / French only  
**Client app:** PWA + possible native wrapper  
**Admin:** custom CRM / Bank Control Center  
**Backend:** self-hosted PocketBase preferred  
**Design base:** Framework7 wireframe + Lumen monochrome design system  
**Primary control:** admin CRM controls every client state and scenario

## What LUMEN is

LUMEN is not a toy demo UI.

It is a controlled training banking environment that must look, behave, and feel like a real banking application to the participant.

The app must include:

- onboarding
- bank approval flow
- prepared client scenario
- cards
- accounts
- crypto wallets
- internal ledger
- payments/transfers
- operation pending queue
- KYC/AML
- document upload
- Wallet Risk Training fields
- smart contract / settlement order
- CRM-controlled notifications
- PDF receipts
- in-app simulated bank call confirmation
- admin chat/push
- audit log

## User-facing terms

Do not break the experience with obvious training labels inside the app flow.

Use neutral terms:

```text
Wallet Risk Training
Wallet Verification
Bank Call Confirmation
Smart Contract
Settlement Order
Verification
Review
Processing
Pending
```

Do not use in UI/CRM/scenario names:

```text
scam
fake
demo money
simulator
training mode
```

## Money model

Balances are not just text.

Every balance must come from internal entities:

```text
ledger_accounts
ledger_entries
operations
transactions
receipts
```

Every card, wallet, account and contract must exist in the backend.

No random card numbers. No random wallet addresses. No UI-only destinations.
