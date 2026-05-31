migrate((db) => {
  const dao = new Dao(db);
  
  // Allow public registration for clients
  const clientsCol = dao.findCollectionByNameOrId("clients");
  clientsCol.createRule = "";
  dao.saveCollection(clientsCol);

  // Allow public creation of applications (since they do this right after client create, before auth)
  const appsCol = dao.findCollectionByNameOrId("client_applications");
  appsCol.createRule = "";
  dao.saveCollection(appsCol);
}, (db) => {
  // rollback
});
