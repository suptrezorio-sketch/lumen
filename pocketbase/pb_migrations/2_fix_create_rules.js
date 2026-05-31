/// <reference path="../pb_data/types.d.ts" />

// Fix createRule for client_applications — allow unauthenticated creation
migrate((db) => {
  const dao = new Dao(db);
  const col = dao.findCollectionByNameOrId("client_applications");
  col.createRule = null; // null = public (no auth required)
  dao.saveCollection(col);
});
