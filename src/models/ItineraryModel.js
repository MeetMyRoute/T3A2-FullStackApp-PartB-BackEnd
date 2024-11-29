const mongoose = require("mongoose");

const ItinerarySchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    travelDates: {
        type: String,
        required: true
    },
    accommodation: String,
    activities: String
});

const ItineraryModel = mongoose.model("Itinerary", ItinerarySchema);

module.exports = {
    ItineraryModel
}