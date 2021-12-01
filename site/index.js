const express = require("express");
const app = express();
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://mongo:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'fantasy-football-data';

const db = client.db(dbName);
const collection = db.collection('documents');

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/data", async function (req, res) {
    await client.connect();
    const results = await collection.find({ "summary_id": { "$exists": true } }).toArray();
    res.send(results);
    client.close();
});

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));

const port = process.env.PORT || 8080;
console.log(`Listening on port ${port}`)
app.listen(port);
