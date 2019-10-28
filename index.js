//Create a basic Node.js server
const express = require("express");
const app = express();


app.get("/", (req,res) => {
    //Send out the configuration page of the connector
    res.sendFile(__dirname + "/config.html");
})

app.listen(8000, () => {
    console.log("Server running!");
})