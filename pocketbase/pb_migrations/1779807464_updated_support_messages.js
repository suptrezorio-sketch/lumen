/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l5p8rt53odb10ka")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0ldxa145",
    "name": "sender_type",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "client",
        "admin"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l5p8rt53odb10ka")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0ldxa145",
    "name": "sender_type",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "client",
        "admin"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
