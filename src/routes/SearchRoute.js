const express = require("express");
const { getItinerariesAndUsersByFilters } = require("../controllers/ItineraryController");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Route for getting shared (simplified) itineraries and local users excluding the user's by filters: destination, startDate and endDate
router.get("/", auth, getItinerariesAndUsersByFilters);

module.exports = router;