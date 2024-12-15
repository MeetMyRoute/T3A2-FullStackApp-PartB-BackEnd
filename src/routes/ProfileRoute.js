const express = require("express");
const { getProfile, updateProfile } = require("../controllers/ProfileController");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Route for getting user profile of a specific user
router.get("/:id", auth, getProfile);

// Route for updating user profile details for a specific user
router.put("/:id", auth, updateProfile);

module.exports = router;