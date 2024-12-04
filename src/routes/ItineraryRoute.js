const express = require("express");
const { createItinerary, getItineraries, getSimplifiedItineraries, getSharedItineraries, getSharedItinerariesByUser, deleteItinerary, updateItinerary, getSharedItinerariesByFilters } = require("../controllers/ItineraryController");
const router = express.Router();
// const auth = require();

// Route for creating a new itinerary to the database
router.post("/itinerary", createItinerary);

// Route for getting all itineraries owned by the user
router.get("/itineraries", getItineraries);

// Route for getting all simplified itineraries owned by the user
router.get("/itineraries/simplified", getSimplifiedItineraries);

// Route for getting all shared (simplified) itineraries excluding the user's
router.get("/itineraries/shared", getSharedItineraries);

// Route for getting shared (simplified) itineraries excluding the user's by filters: destination, startDate and endDate
router.get("/itineraries/shared/filtered", getSharedItinerariesByFilters);

// Route for getting shared (simplified) itineraries by a specific user
router.get("/itineraries/user/:userId", getSharedItinerariesByUser);

// Route for updating details of a specific itinerary
router.put("/itineraries/:id", updateItinerary);

// Route for deleting an itinerary from the database
router.delete("/itineraries/:id", deleteItinerary);

module.exports = router