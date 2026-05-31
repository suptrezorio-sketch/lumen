/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("u2fu6tp7uazt547")

  collection.options = {
    "allowEmailAuth": false,
    "allowOAuth2Auth": false,
    "allowUsernameAuth": false,
    "exceptEmailDomains": null,
    "manageRule": null,
    "minPasswordLength": 0,
    "onlyEmailDomains": null,
    "onlyVerified": false,
    "requireEmail": false
  }

  // remove
  collection.schema.removeField("dyxyrcjs")

  // remove
  collection.schema.removeField("dldyju64")

  // remove
  collection.schema.removeField("ofibkt4b")

  // remove
  collection.schema.removeField("guzhojh5")

  // remove
  collection.schema.removeField("yg2zctz6")

  // remove
  collection.schema.removeField("oa0jebc3")

  // remove
  collection.schema.removeField("pgs4dod4")

  // remove
  collection.schema.removeField("tyvr1g4g")

  // remove
  collection.schema.removeField("n2ahihac")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "eaaogmtq",
    "name": "first_name",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "54xcxk5t",
    "name": "last_name",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lgq0p9wg",
    "name": "phone",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "6quvguni",
    "name": "country",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "w7ogwwkq",
    "name": "language",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "en",
        "fr"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pvplhj68",
    "name": "account_status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "pending",
        "approved",
        "blocked",
        "rejected"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4qvcxtc4",
    "name": "kyc_status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "none",
        "required",
        "submitted",
        "approved",
        "rejected"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fbghjymj",
    "name": "aml_status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "none",
        "required",
        "submitted",
        "approved",
        "rejected"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wo37kxp2",
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
  const collection = dao.findCollectionByNameOrId("u2fu6tp7uazt547")

  collection.options = {}

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dyxyrcjs",
    "name": "first_name",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dldyju64",
    "name": "last_name",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ofibkt4b",
    "name": "phone",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "guzhojh5",
    "name": "country",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yg2zctz6",
    "name": "language",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "en",
        "fr"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "oa0jebc3",
    "name": "account_status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "pending",
        "approved",
        "blocked",
        "rejected"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pgs4dod4",
    "name": "kyc_status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "none",
        "required",
        "submitted",
        "approved",
        "rejected"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tyvr1g4g",
    "name": "aml_status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "none",
        "required",
        "submitted",
        "approved",
        "rejected"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "n2ahihac",
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

  // remove
  collection.schema.removeField("eaaogmtq")

  // remove
  collection.schema.removeField("54xcxk5t")

  // remove
  collection.schema.removeField("lgq0p9wg")

  // remove
  collection.schema.removeField("6quvguni")

  // remove
  collection.schema.removeField("w7ogwwkq")

  // remove
  collection.schema.removeField("pvplhj68")

  // remove
  collection.schema.removeField("4qvcxtc4")

  // remove
  collection.schema.removeField("fbghjymj")

  // remove
  collection.schema.removeField("wo37kxp2")

  return dao.saveCollection(collection)
})
