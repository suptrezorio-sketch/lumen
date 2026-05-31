migrate((db) => {
  const dao = new Dao(db);
  
  // Fix clients authOptions
  const clientsCol = dao.findCollectionByNameOrId("clients");
  clientsCol.options.allowEmailAuth = true;
  clientsCol.options.allowUsernameAuth = false;
  // allow them to update their own pin
  clientsCol.updateRule = "@request.auth.id = id || @request.auth.collectionName = 'admins'";
  dao.saveCollection(clientsCol);

  // Fix client_applications createRule
  const appsCol = dao.findCollectionByNameOrId("client_applications");
  appsCol.createRule = "@request.auth.collectionName = 'clients' || @request.auth.collectionName = 'admins'";
  dao.saveCollection(appsCol);
}, (db) => {
  // rollback
});
