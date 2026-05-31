/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2y8su9bxb5tf6bk")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gp770i5t",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2y8su9bxb5tf6bk")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gp770i5t",
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

  return dao.saveCollection(collection)
})
