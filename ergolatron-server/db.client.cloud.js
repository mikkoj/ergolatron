var DocumentClient = require('documentdb').DocumentClientWrapper;

var host = "https://ergolatron.documents.azure.com:443/";
var masterKey = "asfsafd";
var databaseId = "ergolatrondb";
var client = new DocumentClient(host, {masterKey: masterKey});

var DbClient = function () {
    var self = this;


    // update item
    self.updateItem = function (collection, itemId, callback) {
        //first fetch the document based on the id
        self.getItem(collection, itemId, function (doc) {
            //now replace the document with the updated one
            doc.completed = true;
            client.replaceDocument(doc._self, doc, function (err, replacedDoc) {
                if (err) {
                    throw (err);
                }

                callback();
            });
        });
    };

    // get item
    self.getItem = function (collection, itemId, callback) {
        self.client.queryDocuments(collection._self, 'SELECT * FROM root r WHERE r.id="' + itemId + '"').toArray(function (err, results) {
            if (err) {
                throw (err);
            }

            if (results === null ||
                results.length === 0)
            {
                callback(null);
            }

            callback(results[0]);
        });
    };

    // create new item
    self.createItem = function (collection, documentDefinition, callback) {
        documentDefinition.completed = false;
        self.client.createDocument(collection._self, documentDefinition, function (err, doc) {
            if (err) {
                throw (err);
            }

            callback();
        });
    };

    // query the provided collection for all non-complete items
    self.getAllDocuments = function (collection, callback) {
        self.client.queryDocuments(collection._self, 'SELECT * FROM root').toArray(function (err, docs) {
            if (err) {
                throw (err);
            }

            callback(docs);
        });
    };

    // query the provided collection for all non-complete items
    self.query = function (collection, query, callback) {
        self.client.queryDocuments(collection._self, query).toArray(function (err, docs) {
            if (err) {
                throw (err);
            }

            callback(docs);
        });
    };

    // if the database does not exist, then create it, else return the database object
    self.readOrCreateDatabase = function (callback) {
        var queryIterator = client.queryDatabases('SELECT * FROM root r WHERE r.id="' + databaseId + '"');
        queryIterator.toArray(function (err, results) {
            if (err) {
                // some error occured, rethrow up
                throw (err);
            }
            if (!err && results.length === 0) {
                // no error occured, but there were no results returned
                // indicating no database exists matching the query
                self.client.createDatabase({id: databaseId}, function (err, createdDatabase) {
                    callback(createdDatabase);
                });
            } else {
                // we found a database
                callback(results[0]);
            }
        });
    };

    // if the collection does not exist for the database provided, create it, else return the collection object
    self.readOrCreateCollection = function (database, collectionId, callback) {
        self.client.queryCollections(database._self, 'SELECT * FROM root r WHERE r.id="' + collectionId + '"').toArray(function (err, results) {
            if (err) {
                // some error occured, rethrow up
                throw (err);
            }
            if (!err && results.length === 0) {
                // no error occured, but there were no results returned
                //indicating no collection exists in the provided database matching the query
                self.client.createCollection(database._self, {id: collectionId}, function (err, createdCollection) {
                    callback(createdCollection);
                });
            } else {
                // we found a collection
                callback(results[0]);
            }
        });
    };
};

module.exports.dbClient = new DbClient();