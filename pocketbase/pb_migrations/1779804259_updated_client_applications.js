/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("z3tmlhw7j09mz9g")

  collection.createRule = ""

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cjzxi9uh",
    "name": "client",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ixm3wfd4",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "more_info_required"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("z3tmlhw7j09mz9g")

  collection.createRule = "@request.auth.collectionName = 'clients'"

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cjzxi9uh",
    "name": "client",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": null
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ixm3wfd4",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 0,
      "values": [
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "more_info_required"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
