/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ix07a1n6xcampch")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1qo3822o",
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
        "hidden"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ix07a1n6xcampch")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1qo3822o",
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
        "hidden"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
