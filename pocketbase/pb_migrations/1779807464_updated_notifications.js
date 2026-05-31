/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9m3xstrg6hupi7e")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vb7qwgnf",
    "name": "type",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "push",
        "in_app",
        "system"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9m3xstrg6hupi7e")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vb7qwgnf",
    "name": "type",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "push",
        "in_app",
        "system"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
