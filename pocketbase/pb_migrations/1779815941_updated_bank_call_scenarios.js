/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2y8su9bxb5tf6bk")

  // remove
  collection.schema.removeField("jefkncfr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yq0qjku8",
    "name": "client",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "u2fu6tp7uazt547",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": [
        "email"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2y8su9bxb5tf6bk")

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

  // remove
  collection.schema.removeField("yq0qjku8")

  return dao.saveCollection(collection)
})
