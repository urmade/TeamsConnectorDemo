const express = require("express");

const app = express();

const request = require("request");

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/config.html");
})

app.listen(8000, () => {
    console.log("Server running!");
})