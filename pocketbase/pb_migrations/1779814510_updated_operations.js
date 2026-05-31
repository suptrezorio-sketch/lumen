/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fd9q6cbcwgd581h")

  collection.listRule = "@request.auth.collectionName = 'admins' || @request.auth.id = client"
  collection.createRule = "@request.auth.collectionName = 'admins' || @request.auth.collectionName = 'clients'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fd9q6cbcwgd581h")

  collection.listRule = "@request.auth.collectionName = 'admins'"
  collection.createRule = "@request.auth.collectionName = 'admins' || @request.auth.id = client"

  return dao.saveCollection(collection)
})
