const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Testing basic route
app.get("/", (request, response) => {
    response.json({
        message: "MeetMyRoute"
    });
});

module.exports = {
    app
}