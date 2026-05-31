# 09 — Global Inputs, Keyboards and Validation

## Goal

Create one global input system across the whole app.

In PWA, custom keyboards/pickers are not only for chat. They are for the entire app.

## Components

```text
LumenInputController
LumenKeyboardProvider
LumenNumericKeyboard
LumenAmountKeyboard
LumenCardKeyboard
LumenPhoneKeyboard
LumenOTPKeyboard
LumenPINKeyboard
LumenTextKeyboard
LumenWheelDatePicker
LumenSelectPicker
```

## Platform behavior

PWA:

```text
use custom keyboards for app inputs
safe-area aware
keyboard does not cover active input
input scrolls into view
consistent Lumen style
```

Native:

```text
system keyboard by default
custom PIN/OTP/amount/date picker where required
same validation and masks
```

## Card number validation

Reusable component:

```text
LumenCardNumberInput
```

Rules:

```text
digits only
auto group visually
store normalized digits
max 19 digits
detect scheme while typing
display scheme label/icon
validate length
validate Luhn where applicable
show clear error state
```

Card scheme detection:

```text
Visa: starts with 4, length 13 / 16 / 19
Mastercard: starts with 51-55 or 2221-2720, length 16
American Express: starts with 34 or 37, length 15, grouping 4-6-5
Discover: starts with 6011, 65, or 644-649, length 16 or 19
UnionPay: starts with 62, length 16-19
```

Important:

```text
American Express does not start with 6.
Do not allow invalid long garbage strings like 1310170475205702174.
```

## Phone number validation

Reusable component:

```text
LumenPhoneInput
```

Rules:

```text
default prefix: +1
prefix configurable
digits only after prefix
E.164 normalized storage
same across onboarding, KYC, profile, transfers, support, admin
```

Default display:

```text
+1 (___) ___-____
```

## Date input

All date fields must use wheel picker.

Component:

```text
LumenWheelDatePicker
```

Used for:

```text
date of birth
document issue date
document expiry date
submission date
due date
payment date
schedule date
credit date
card expiry where applicable
```

No manual DD.MM.YYYY text input.

## training_secret_phrase input

Used only for `training_recovery_phrase`.

Rules:

```text
scenario-bound only
masked by default
word slots optional
store encrypted
admin reveal requires audit
not sent to analytics/logging
```
