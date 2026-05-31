/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("u2fu6tp7uazt547")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bn5kir7z",
    "name": "pin",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": 6,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("u2fu6tp7uazt547")

  // remove
  collection.schema.removeField("bn5kir7z")

  return dao.saveCollection(collection)
})
