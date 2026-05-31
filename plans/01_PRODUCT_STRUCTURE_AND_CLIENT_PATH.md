# 01 — Product Structure and Client Path

## Main app navigation

The bottom navigation must stay simple:

```text
Home
Cards
Crypto
History
Profile
```

Secondary flows open contextually:

```text
Send
Top Up
Withdraw
Utilities / Pay
Credit
Chat
Notifications
Verification
Smart Contract
Bank Call Confirmation
Wallet Verification
```

Do not create many bottom tabs. Do not hide frequent actions.

## Home screen structure

Preserve current Home layout. Do not replace it with a generic dashboard.

Top to bottom:

```text
1. Header
   - Lumen logo / brand
   - chat button
   - notification bell

2. Total balance
   - total fiat balance
   - growth/rate indicator
   - hide/show balance control

3. Crypto balance summary
   - each crypto owned by user
   - compact row/carousel/expandable block
   - asset amount + fiat equivalent where available

4. Card carousel
   - fiat card
   - crypto card
   - credit card if available
   - smart contract card if assigned
   - virtual cards if available

5. Quick actions
   - Send
   - Top Up
   - Withdraw
   - Utilities / Pay
   - Credit

6. Promo banner carousel
   - admin-managed
   - EN/FR
   - target screen/action
   - segment and visibility rules

7. Recent Transactions
   - latest 5 operations
   - status visible
   - See All opens History

8. Bottom navigation
```

## Registration path

User must not enter the bank immediately after registration.

```text
Launch app
→ Language selection EN/FR
→ Create account / Login
→ Phone/email
→ OTP
→ Personal data
→ Create password/PIN
→ Optional biometrics
→ Application submitted
→ Waiting for bank approval
→ Admin review
→ Approved / Rejected / More information required
→ If approved: assign Client Scenario Template
→ First login into prepared scenario
```

## Client Scenario Template

A scenario can include:

```text
fiat account
fiat card
crypto card
crypto wallet
smart contract
pending payout operation
activation conditions
KYC/AML request
promo banners
notifications
initial history records
support messages
```

## Example scenario

```text
Fiat card: active, balance 0
Crypto card: visible, frozen
Crypto card activation condition: requires admin-selected crypto asset and amount
Smart Contract / Settlement Order: assigned, visible, pending
Pending payout: from fund to crypto card/wallet, status Processing/Pending
User tops up fiat → swaps to required crypto → condition is met → crypto card can be unfrozen → payout can be completed
```
