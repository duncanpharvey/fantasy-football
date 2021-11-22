const express = require("express");
const app = express();

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/data.json", function (req, res) {
    res.sendFile(__dirname + "/data.json");
});

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));

app.listen(process.env.port || 5000);
