/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ef1uthlbpxtbbk8")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vrncyzqc",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "kyc",
        "aml",
        "wallet_risk"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qkewivsv",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "pending",
        "submitted",
        "approved",
        "rejected",
        "more_info_required"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4ihtcnaj",
    "name": "questions",
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
    "id": "aj4bzwgz",
    "name": "answers",
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
    "id": "cxupb1o2",
    "name": "documents",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp"
      ],
      "thumbs": null,
      "maxSelect": 5,
      "maxSize": 2097152,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ef1uthlbpxtbbk8")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vrncyzqc",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "kyc",
        "aml",
        "wallet_risk"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qkewivsv",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "pending",
        "submitted",
        "approved",
        "rejected",
        "more_info_required"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4ihtcnaj",
    "name": "questions",
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
    "id": "aj4bzwgz",
    "name": "answers",
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
    "id": "cxupb1o2",
    "name": "documents",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp"
      ],
      "thumbs": null,
      "maxSelect": 5,
      "maxSize": 0,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
})
