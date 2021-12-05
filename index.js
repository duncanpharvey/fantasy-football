const express = require("express");
const app = express();
const { client, collection } = require("./processor/mongo");
const basicAuth = require('express-basic-auth');
const child_process = require('child_process');

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/data", async (req, res) => {
    await client.connect();
    const results = await collection.find({ "summary_id": { "$exists": true } }).toArray();
    res.send(results);
    client.close();
});

if (!process.env.NFL_USERNAME || !process.env.NFL_PASSWORD || !process.env.API_USERNAME || !process.env.API_PASSWORD) {
    console.log("Missing environment variables, stopping server");
    return;
}

users = {};
users[process.env.API_USERNAME] = process.env.API_PASSWORD;

app.use(basicAuth({
    users: users,
    unauthorizedResponse: () => {
        message = "invalid credentials";
        return { message: message };
    }
}));

app.post("/processor", async (req, res) => {
    // non-blocking child process
    const child = child_process.fork("./processor/index.js");
    child.on('message', ({ isError, data }) => {
        if (isError) {
            res.json({
                "message": "Encountered error while simulating rest of season",
                "error": data
            });
        }
    });
    child.on("exit", () => {
        res.json({ "message": "Completed simulating rest of seasion" });
    });
});

const port = process.env.PORT || 8080;
console.log(`Fantasy football site listening on port ${port}`);
app.listen(port);
