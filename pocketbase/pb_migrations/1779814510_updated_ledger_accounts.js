/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yiejeprhsyk2soy")

  collection.listRule = "@request.auth.collectionName = 'admins' || @request.auth.id = client"
  collection.viewRule = "@request.auth.collectionName = 'admins' || @request.auth.id = client"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yiejeprhsyk2soy")

  collection.listRule = "@request.auth.collectionName = 'admins'"
  collection.viewRule = "@request.auth.collectionName = 'admins'"

  return dao.saveCollection(collection)
})
