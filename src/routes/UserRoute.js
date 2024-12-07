const express = require("express");
const { getUserProfile, updateUserProfile } = require("../controllers/UserProfileController");
const router = express.Router();
// const { auth } = require();

// Route for getting user profile of a specific user
router.get("/:id", getUserProfile);

// Route for updating user profile details for a specific user
router.put("/:id", updateUserProfile);

module.exports = router;