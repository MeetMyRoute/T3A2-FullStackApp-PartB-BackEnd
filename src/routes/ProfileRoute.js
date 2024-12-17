const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/ProfileController");
const { auth } = require("../middleware/auth");

// Route for getting user profile of a specific user
router.get("/:id", auth, getProfile);

// Route for updating user profile details for a specific user
router.patch("/:id", auth, updateProfile);

module.exports = router;