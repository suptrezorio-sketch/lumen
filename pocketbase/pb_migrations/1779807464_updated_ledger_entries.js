/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("695higz5o8ch4r6")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wnyfjc5o",
    "name": "direction",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "debit",
        "credit"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "3nipl701",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "pending",
        "posted",
        "reversed",
        "failed"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("695higz5o8ch4r6")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wnyfjc5o",
    "name": "direction",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "debit",
        "credit"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "3nipl701",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "pending",
        "posted",
        "reversed",
        "failed"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
