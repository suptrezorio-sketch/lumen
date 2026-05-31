/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yiejeprhsyk2soy")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ytb1l7kv",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "fiat",
        "crypto",
        "credit",
        "contract"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mencmzxx",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "active",
        "frozen",
        "closed"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yiejeprhsyk2soy")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ytb1l7kv",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "fiat",
        "crypto",
        "credit",
        "contract"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mencmzxx",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "active",
        "frozen",
        "closed"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
