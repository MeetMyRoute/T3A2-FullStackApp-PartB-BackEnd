const express = require("express");
const { getItinerariesAndUsers } = require("../controllers/SearchController");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Route for getting shared itineraries and local users excluding the logged-in user's own data
router.get("/", auth, getItinerariesAndUsers);

module.exports = router;