# 12 — MASTER AI REFACTOR PROMPT

You are working on LUMEN Bank.

Your task is to refactor and rebuild the existing LUMEN client app and admin CRM according to these instructions.

Do not improvise a generic fintech UI.  
Do not create a toy admin panel.  
Do not replace the Home screen structure.  
Do not ignore the controlled training architecture.  
Do not use trigger words in UI/CRM/scenario names.

## Read these files first

```text
00_PROJECT_CONTEXT.md
01_PRODUCT_STRUCTURE_AND_CLIENT_PATH.md
02_FRAMEWORK7_DESIGN_SYSTEM.md
03_ADMIN_CRM_REQUIREMENTS.md
04_POCKETBASE_ARCHITECTURE.md
05_OPERATION_ENGINE_AND_LEDGER.md
06_KYC_AML_AND_WALLET_RISK.md
07_SMART_CONTRACT_SETTLEMENT.md
08_CARDS_CRYPTO_PAYMENTS.md
09_GLOBAL_INPUTS_KEYBOARDS_VALIDATION.md
10_INTEGRATIONS_AND_SERVICES.md
11_IMPLEMENTATION_PLAN.md
13_DO_NOT_DO.md
14_ADMIN_UI_REDESIGN_NOTES.md
```

## Main goal

Create a premium neobank-style app with:

```text
Framework7 client app
custom Lumen CRM admin
PocketBase backend
internal ledger
pending-by-default operations
KYC/AML question bank
Wallet Risk Training
smart contract / settlement orders
crypto page with chart
global custom input/keyboards
PDF receipts
push notifications
in-app bank call confirmation
```

## Preserve Home

Home screen must remain:

```text
logo/chat/notification
total balance
crypto balances
card carousel
quick actions
admin banners
recent transactions
bottom nav
```

## Admin must be fintech-grade

Build:

```text
Bank Control Center
Client Card
Pending Operations Queue
KYC/AML Review
Document Review
Smart Contract Control
Ledger-aware operations
Audit log
Scenario templates
```

## PocketBase

Use PocketBase as:

```text
database
auth
files
realtime API
backend hooks
```

Do not use PocketBase admin UI as final CRM.

## Output expected before code changes

1. revised app structure
2. route map
3. CRM screen map
4. PocketBase collection plan
5. component hierarchy
6. implementation order
7. list of files/components to change

Then implement step by step.
