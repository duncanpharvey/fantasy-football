const { MongoClient } = require('mongodb');
const mongoPort = 27017;

// Connection URL
const url = `mongodb://mongo:${mongoPort}`;
const client = new MongoClient(url);

// Database Name
const dbName = 'fantasy-football-data';

const db = client.db(dbName);
const collection = db.collection('documents');

console.log(`Fantasy football database listening on port ${mongoPort}`);

module.exports = {
    client: client,
    collection: collection
};
