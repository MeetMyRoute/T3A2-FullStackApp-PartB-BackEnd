const express = require("express");
const cors = require("cors");

const app = express();

// Update when deployed
app.use(cors());
app.use(express.json());

// Test basic route
app.get("/", (req, res) => {
    res.json({
        message: "MeetMyRoute"
    });
});

const ProfileRouter = require("./routes/ProfileRoute");
app.use("//profile", ProfileRouter);

const ItineraryRouter = require("./routes/ItineraryRoute");
app.use("/itinerary", ItineraryRouter);

const UserRouter = require('./routes/UserRoute'); 
app.use('/user', UserRouter);

const SearchRouter = require("./routes/SearchRoute");
app.use("/search", SearchRouter);

module.exports = {
    app
}