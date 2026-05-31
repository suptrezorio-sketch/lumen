# 03 — Admin CRM Requirements

## Goal

Build a custom CRM frontend called:

```text
LUMEN Bank Control Center
```

Do not rely on PocketBase admin panel as the final CRM. PocketBase admin is only for development/debug.

## Main admin sections

```text
Dashboard
Clients
Pending Operations
KYC / AML
Smart Contracts
Cards
Crypto Wallets
Notifications
Support Chat
Promo Banners
Scenario Templates
Audit Log
Settings
```

## Client Card

Each client opens into a detailed control center.

Sections:

```text
Overview
Accounts
Cards
Crypto Wallets
Smart Contracts
Operations
History
KYC / AML
Documents
Notifications
Devices / Sessions
Support Chat
Scenario Template
Audit Log
```

## Client Overview must show

```text
client name
email
phone
account status
application status
KYC status
AML status
risk level
current scenario
total fiat balance
crypto summary
active cards
frozen cards
pending operations
last login
device/session status
```

## Admin actions from Client Card

```text
approve first account access
reject account application
request more information
assign scenario template
create account
create card
create crypto wallet
create smart contract
change card status
change wallet status
change operation status
approve/reject pending operation
send push/in-app notification
send chat message
create KYC/AML request
review KYC/AML answers
review documents
request KYC/AML again
reset activation steps
create PDF receipt
regenerate receipt
change promo banner visibility
```

## Pending Operations Queue

Columns:

```text
operation ID
client
operation type
amount
asset/currency
source
destination
status
risk level
created at
actions
```

Actions:

```text
open
approve
reject
hold
request more information
send notification
change status
generate receipt
```

## Promo banner manager

Fields:

```text
title_en
title_fr
subtitle_en
subtitle_fr
image/icon
CTA label EN/FR
target route/action
visibility rules
client/segment targeting
priority
start date
end date
enabled
```

## Scenario Templates

A scenario template can define:

```text
initial accounts
initial cards
crypto wallets
frozen states
activation conditions
smart contract
pending payout
banners
notifications
KYC/AML request
support messages
initial transactions
```

## Audit Log

Every admin action must be logged:

```text
admin_id
action_type
client_id
entity_type
entity_id
old_value
new_value
timestamp
visible_to_client
comment/reason
ip/device if available
```
