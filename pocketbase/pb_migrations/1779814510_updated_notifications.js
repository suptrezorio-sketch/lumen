/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9m3xstrg6hupi7e")

  collection.updateRule = "@request.auth.collectionName = 'admins'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9m3xstrg6hupi7e")

  collection.updateRule = "@request.auth.collectionName = 'admins' || @request.auth.id = client"

  return dao.saveCollection(collection)
})
