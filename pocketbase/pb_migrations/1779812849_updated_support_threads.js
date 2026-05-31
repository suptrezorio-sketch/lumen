/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("t8wj486h3hqa7lm")

  collection.viewRule = "@request.auth.collectionName = 'admins' || client = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("t8wj486h3hqa7lm")

  collection.viewRule = "@request.auth.collectionName = 'admins' || @request.auth.id = client"

  return dao.saveCollection(collection)
})
