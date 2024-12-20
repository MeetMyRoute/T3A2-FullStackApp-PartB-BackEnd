const express = require("express");
const { createItinerary, getItineraries, getSimplifiedItineraries, deleteItinerary, updateItinerary } = require("../controllers/ItineraryController");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Route for creating a new itinerary to the database
router.post("/", auth, createItinerary);

// Route for retrieving all itineraries owned by the authenticated user
router.get("/", auth, getItineraries);

// Route for retrieving simplified itineraries owned by the authenticated user (only destination, startDate, and endDate)
router.get("/simplified", auth, getSimplifiedItineraries);

// Route for updating a specific itinerary
router.patch("/:id", auth, updateItinerary);

// Route for deleting a specific itinerary
router.delete("/:id", auth, deleteItinerary);

module.exports = router;