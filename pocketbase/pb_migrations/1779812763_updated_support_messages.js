/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l5p8rt53odb10ka")

  collection.viewRule = "@request.auth.collectionName = 'admins' || @request.auth.collectionName = 'clients'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l5p8rt53odb10ka")

  collection.viewRule = "@request.auth.collectionName = 'admins'"

  return dao.saveCollection(collection)
})
