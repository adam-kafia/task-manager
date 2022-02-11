const mongoose = require("mongoose");

const connectionUrl = process.env.CONNECTION_URL;

mongoose
    .connect(connectionUrl)
    .then(() => {
        console.log("Database Connected");
    })
    .catch(() => {
        console.log("Failed to connect to database " + connectionUrl);
    });
