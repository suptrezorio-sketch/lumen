/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("t8wj486h3hqa7lm")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "h7k0rc2z",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "open",
        "closed"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("t8wj486h3hqa7lm")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "h7k0rc2z",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "open",
        "closed"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
