const express = require("express");
const { createItinerary, getItineraries, getSimplifiedItineraries, getSharedItinerariesByUser, deleteItinerary, updateItinerary, getSharedItinerariesByFilters } = require("../controllers/ItineraryController");
const router = express.Router();
// const auth = require();

// Route for creating a new itinerary to the database
router.post("/", createItinerary);

// Route for getting all itineraries owned by the user
router.get("/", getItineraries);

// Route for getting all simplified itineraries owned by the user
router.get("/simplified", getSimplifiedItineraries);

// Route for getting shared (simplified) itineraries excluding the user's by filters: destination, startDate and endDate
router.get("/search/filtered", getSharedItinerariesByFilters);

// Route for getting shared (simplified) itineraries by a specific user
router.get("/user/:userId", getSharedItinerariesByUser);

// Route for updating details of a specific itinerary
router.put("/:id", updateItinerary);

// Route for deleting an itinerary from the database
router.delete("/:id", deleteItinerary);

module.exports = router;