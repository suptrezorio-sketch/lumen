# 06 — KYC / AML and Wallet Risk Training

## Goal

Rebuild KYC/AML inside Lumen. Do not copy the old standalone HTML visual design.

Use Lumen / Framework7 design. English and French only.

## Client path

```text
Profile
→ Verification
→ Requested questionnaire
→ Upload documents
→ Submit
→ Under review
→ Approved / Rejected / More information required
```

## Admin path

```text
Client Card
→ KYC / AML
→ Create request
→ Select questions
→ Select documents
→ Set deadline
→ Send request
→ Review answers/documents
→ Approve / Reject / Request more information / Request again
```

## Question categories

```text
Identity
Identity document
Document upload
Source of funds
Source of wealth
Crypto / wallet
Risk declarations
Consent
Wallet Risk Training
```

## Identity questions

```text
full_name
date_of_birth
citizenship
country_of_residence
email
phone
residential_address
```

## Document questions

```text
document_type
document_number
document_issue_date
document_expiry_date
document_country
```

Document uploads:

```text
passport_page
identity_front
identity_back
driver_license_front
driver_license_back
proof_of_address
bank_statement
proof_of_funds
selfie
additional_document
```

## AML questions

```text
transaction_amount
source_of_funds
source_of_wealth
capital_amount
monthly_income
employment_status
occupation
purpose_of_account
pep_status
pep_relation
sanctions_confirmation
aml_cft_confirmation
tax_residence
data_processing_consent
submission_date
```

## Wallet Risk Training field

Field key:

```text
training_recovery_phrase
```

Type:

```text
training_secret_phrase
```

Category:

```text
wallet_risk_training
```

Client labels:

EN:

```text
Wallet recovery phrase
```

FR:

```text
Phrase de récupération du portefeuille
```

Properties:

```text
CRM-selected only
linked to Client Scenario Template
optional expected phrase for match/mismatch check
encrypted storage
masked display by default
admin reveal requires permission
admin reveal creates audit log
visible in Client Card → KYC / AML → Scenario Fields
not used for normal external wallet verification
```

Do not use trigger words in UI, code comments, routes, labels, or CRM.

## Statuses

```text
Not requested
Required
In progress
Submitted
Under review
Approved
Rejected
More information required
Retry available
Appeal submitted
Final rejected
Expired
```

## Retry / appeal

If rejected and allowed:

```text
Verification rejected
→ visible reason
→ Request review
→ one retry attempt
→ edit answers/upload docs
→ submit again
→ Appeal under review
```
