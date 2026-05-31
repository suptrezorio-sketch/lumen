/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("695higz5o8ch4r6")

  collection.createRule = "@request.auth.collectionName = 'admins' || @request.auth.collectionName = 'clients'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("695higz5o8ch4r6")

  collection.createRule = "@request.auth.collectionName = 'admins'"

  return dao.saveCollection(collection)
})
