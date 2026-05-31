# 14 — Admin UI Redesign Notes

## The current AI-made admin screenshot is not acceptable

Observed issues:

```text
weak fintech visual hierarchy
too much empty space
clients shown as simple cards only
no real Client Card
no left navigation / proper admin shell
no pending operations queue
no KYC/AML review depth
no document preview
no ledger/account/card modules
no smart contract control
no scenario editor
no audit log
buttons have no context
balance field is primitive
```

## Required admin structure

Desktop layout:

```text
Header
Sidebar / section navigation
Main content
Right detail panel where useful
```

Main modules:

```text
Dashboard
Clients
Pending Operations
KYC / AML
Documents
Cards
Crypto Wallets
Smart Contracts
Notifications
Support
Scenario Templates
Audit Log
Settings
```

## Clients screen

Client list must show:

```text
name
email
phone
account status
application status
KYC status
AML status
risk level
total balance
pending operations count
last activity
assigned scenario
```

Filters:

```text
Pending approval
Approved
Blocked
KYC required
AML pending
Has pending operations
Has frozen cards
Has active smart contract
```

## Client Card layout

When opening a client:

```text
Top summary:
- client identity
- status badges
- risk level
- application status
- total balance
- current scenario
- quick actions

Tabs:
- Overview
- Accounts
- Cards
- Crypto
- Smart Contracts
- Operations
- KYC / AML
- Documents
- Chat
- Notifications
- Scenario
- Audit
```

## Quick actions

```text
Approve access
Reject access
Assign scenario
Send push
Create operation
Create card
Freeze card
Request KYC/AML
Create smart contract
Open chat
```

## Visual style

Use Lumen admin style:

```text
white/black monochrome
clean cards
strong spacing
clear status badges
dense but readable data
financial dashboard feel
no toy colors except functional statuses
```

## Tables

Use professional tables with:

```text
search
filters
status badges
row actions
pagination
detail drawer
bulk actions where useful
```

## Detail drawers

Use drawers/panels for:

```text
operation details
document preview
KYC submission
smart contract details
card controls
wallet controls
receipt preview
```
