const express = require("express");
const { createItinerary, getItineraries, getSimplifiedItineraries, deleteItinerary, updateItinerary, getItinerariesAndUsersByFilters } = require("../controllers/ItineraryController");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Route for creating a new itinerary to the database
router.post("/", auth, createItinerary);

// Route for getting all itineraries owned by the user
router.get("/", auth, getItineraries);

// Route for getting all simplified itineraries owned by the user
router.get("/simplified", auth, getSimplifiedItineraries);

// Route for getting shared (simplified) itineraries and local users excluding the user's by filters: destination, startDate and endDate
router.get("/search", auth, getItinerariesAndUsersByFilters);

// Route for updating details of a specific itinerary
router.put("/:id", auth, updateItinerary);

// Route for deleting an itinerary from the database
router.delete("/:id", auth, deleteItinerary);

module.exports = router;