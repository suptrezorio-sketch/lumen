migrate((db) => {
  const collection = new Collection({
    "id": "login_requests_coll",
    "created": "2024-05-31 00:00:00.000Z",
    "updated": "2024-05-31 00:00:00.000Z",
    "name": "login_requests",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "identifier_field",
        "name": "identifier",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "status_field",
        "name": "status",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": ["pending", "fulfilled"]
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("login_requests_coll");
  return dao.deleteCollection(collection);
});
