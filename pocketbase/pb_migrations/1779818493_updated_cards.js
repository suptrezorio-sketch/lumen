/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4468zxkvfiun1vt")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dtp0dkfb",
    "name": "internet_purchases",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5kowokzq",
    "name": "transfer_limit",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 1000000,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4468zxkvfiun1vt")

  // remove
  collection.schema.removeField("dtp0dkfb")

  // remove
  collection.schema.removeField("5kowokzq")

  return dao.saveCollection(collection)
})
