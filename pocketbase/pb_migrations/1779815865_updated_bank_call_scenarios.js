/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2y8su9bxb5tf6bk")

  collection.listRule = "@request.auth.collectionName = 'admins' || @request.auth.id = client"
  collection.viewRule = "@request.auth.collectionName = 'admins' || @request.auth.id = client"
  collection.updateRule = "@request.auth.collectionName = 'admins' || @request.auth.id = client"

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jefkncfr",
    "name": "client",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": []
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gxd57hte",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "idle",
        "ringing",
        "active",
        "confirmed",
        "denied",
        "ended",
        "cancelled"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "oqolmzpa",
    "name": "key_pressed",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nlegr2yf",
    "name": "caller_name",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "g8bsyyvz",
    "name": "caller_number",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2y8su9bxb5tf6bk")

  collection.listRule = "@request.auth.collectionName = 'admins'"
  collection.viewRule = "@request.auth.collectionName = 'admins' || @request.auth.collectionName = 'clients'"
  collection.updateRule = "@request.auth.collectionName = 'admins'"

  // remove
  collection.schema.removeField("jefkncfr")

  // remove
  collection.schema.removeField("gxd57hte")

  // remove
  collection.schema.removeField("oqolmzpa")

  // remove
  collection.schema.removeField("nlegr2yf")

  // remove
  collection.schema.removeField("g8bsyyvz")

  return dao.saveCollection(collection)
})
