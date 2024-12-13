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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    accommodation: String,
    activities: [String]
});

// Add compound index
ItinerarySchema.index({userId: 1, destination: 1});

const ItineraryModel = mongoose.model("Itinerary", ItinerarySchema);

module.exports = {
    ItineraryModel
}