# 08 — Cards, Crypto, Payments

## Cards

Every visible card must exist as an internal entity.

Fields:

```text
card_id
client_id
account_id
card_number_token
card_number_masked
type: FIAT / CRYPTO / CREDIT / VIRTUAL / SMART_CONTRACT
status: ACTIVE / FROZEN / BLOCKED / PENDING / CLOSED / EXPIRED
currency
linked_asset
balance
activation_rule_json
created
updated
```

## Card screen

```text
Cards
→ card carousel/list
→ card detail
→ reveal number
→ reveal CVV
→ freeze/unfreeze
→ block/reissue
→ limits
→ wallet status
→ transactions
→ statements
```

## Card controls

```text
Online payments
Contactless payments
ATM withdrawals
International payments
Crypto payments
Merchant restrictions
```

## Crypto page

Add decorative live chart.

Structure:

```text
Crypto
→ Portfolio balance
→ Asset selector / asset carousel
→ Decorative live chart
→ Asset balance
→ Fiat equivalent
→ Quick actions: Buy / Sell / Swap / Send / Receive
→ Pending crypto operations
→ Linked smart contract block
→ Crypto transaction history
```

Admin can control:

```text
visible assets
balances
chart trend
price override
pending crypto operation status
wallet status
crypto card activation condition
```

## Payments

Quick actions stay on Home:

```text
Send
Top Up
Withdraw
Utilities / Pay
Credit
```

Do not hide common actions in a deep menu.

All submit as Pending/Processing unless system/admin completes immediately.
