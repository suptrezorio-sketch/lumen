# 11 — Implementation Plan

## Phase 1 — Stabilize structure

1. Lock main navigation: Home / Cards / Crypto / History / Profile.
2. Preserve Home structure.
3. Create route map.
4. Create Framework7 shared shell.
5. Create design tokens.

## Phase 2 — PocketBase backend

1. Set up PocketBase server.
2. Create auth collections.
3. Create core collections.
4. Add access rules.
5. Add file storage rules.
6. Add realtime subscriptions.
7. Add audit log.

## Phase 3 — CRM foundation

1. Build custom admin frontend.
2. Create dashboard.
3. Create Clients list.
4. Create Client Card layout.
5. Add Pending Operations Queue.

## Phase 4 — Client application approval

1. Registration creates application.
2. User sees waiting approval screen.
3. Admin approves/rejects.
4. Admin assigns scenario template.
5. Approved client gets first prepared state.

## Phase 5 — Internal ledger

1. Create ledger accounts.
2. Create ledger entries.
3. Make balances derive from ledger.
4. Implement pending/posted/reversed rules.
5. Create operation hooks.

## Phase 6 — Operation engine

1. Create operation templates.
2. Create dynamic forms.
3. Create shared review screen.
4. Create confirmation methods.
5. Create receipt system.
6. Connect statuses to history and notifications.

## Phase 7 — Cards and Crypto

1. Create internal card entities.
2. Create card carousel and details.
3. Add status controls.
4. Add card validation input.
5. Create crypto wallets.
6. Add crypto chart and asset selector.

## Phase 8 — Smart Contract

1. Create smart_contract collections.
2. Create smart contract detail screen.
3. Add CRM panel.
4. Add realtime updates.
5. Add optional action buttons.

## Phase 9 — KYC / AML

1. Create question bank.
2. Create request builder.
3. Create client questionnaire.
4. Add document upload.
5. Add review panel.
6. Add retry/appeal.
7. Add Wallet Risk Training field.

## Phase 10 — Global input system

1. Add LumenInputController.
2. Add PWA custom keyboard provider.
3. Add card input validation.
4. Add phone input.
5. Add wheel date picker.
6. Replace all free text date fields.
