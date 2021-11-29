const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://mongo:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'fantasy-football-data';

const db = client.db(dbName);
const collection = db.collection('documents');

module.exports = {
    client: client,
    collection: collection
}
