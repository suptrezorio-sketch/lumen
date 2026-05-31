/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4468zxkvfiun1vt")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "obs28hau",
    "name": "cvv",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": 4,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4468zxkvfiun1vt")

  // remove
  collection.schema.removeField("obs28hau")

  return dao.saveCollection(collection)
})
