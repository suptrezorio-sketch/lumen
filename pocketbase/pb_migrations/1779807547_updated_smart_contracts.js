/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e2y6mbh6mm7ai9z")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pdxcpwxl",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "draft",
        "active",
        "pending",
        "completed",
        "cancelled"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yndumgsc",
    "name": "conditions",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2097152
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fvaarqxs",
    "name": "buttons",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2097152
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e2y6mbh6mm7ai9z")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pdxcpwxl",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "draft",
        "active",
        "pending",
        "completed",
        "cancelled"
      ]
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yndumgsc",
    "name": "conditions",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 0
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fvaarqxs",
    "name": "buttons",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 0
    }
  }))

  return dao.saveCollection(collection)
})
