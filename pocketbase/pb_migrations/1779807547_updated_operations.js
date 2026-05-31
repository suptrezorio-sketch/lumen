/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fd9q6cbcwgd581h")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "r2mcfymu",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "MOBILE_TOP_UP",
        "UTILITY_PAYMENT",
        "INTERNAL_TRANSFER",
        "CARD_TRANSFER",
        "IBAN_TRANSFER",
        "INTERNATIONAL_TRANSFER",
        "TOP_UP",
        "WITHDRAW",
        "CRYPTO_BUY",
        "CRYPTO_SELL",
        "CRYPTO_SWAP",
        "CRYPTO_TRANSFER",
        "CREDIT_REPAYMENT",
        "SMART_CONTRACT_FUNDING",
        "CARD_STATUS_CHANGE",
        "KYC_SUBMISSION",
        "AML_SUBMISSION"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "s4i2jqyx",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "Draft",
        "Submitted",
        "Pending",
        "Processing",
        "Under Review",
        "Approved",
        "Completed",
        "Rejected",
        "Failed",
        "Cancelled",
        "Frozen"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7gvqkrot",
    "name": "details",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2097152
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gf4dwcle",
    "name": "risk_level",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "low",
        "medium",
        "high",
        "critical"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fd9q6cbcwgd581h")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "r2mcfymu",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "MOBILE_TOP_UP",
        "UTILITY_PAYMENT",
        "INTERNAL_TRANSFER",
        "CARD_TRANSFER",
        "IBAN_TRANSFER",
        "INTERNATIONAL_TRANSFER",
        "TOP_UP",
        "WITHDRAW",
        "CRYPTO_BUY",
        "CRYPTO_SELL",
        "CRYPTO_SWAP",
        "CRYPTO_TRANSFER",
        "CREDIT_REPAYMENT",
        "SMART_CONTRACT_FUNDING",
        "CARD_STATUS_CHANGE",
        "KYC_SUBMISSION",
        "AML_SUBMISSION"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "s4i2jqyx",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "Draft",
        "Submitted",
        "Pending",
        "Processing",
        "Under Review",
        "Approved",
        "Completed",
        "Rejected",
        "Failed",
        "Cancelled",
        "Frozen"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7gvqkrot",
    "name": "details",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 0
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gf4dwcle",
    "name": "risk_level",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "low",
        "medium",
        "high",
        "critical"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
