const express = require("express");
const cors = require("cors");

const app = express();

// Update when deployed
app.use(cors());
app.use(express.json());

// Test basic route
app.get("/", (request, response) => {
    response.json({
        message: "MeetMyRoute"
    });
});

module.exports = {
    app
}