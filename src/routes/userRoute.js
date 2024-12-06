const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');

const {
  registerUser,
  loginUser,
  recieveLoggedInUser, 
  adminLogin, 
} = require("../controllers/userController");

// Route to register a new user
router.post("/", registerUser);
// Route to log in an existing user and generate a token
router.post("/login", loginUser);
// Route to log in admin user and generate a token 
router.post("/admin", auth, adminAuth, adminLogin)
// Route to fetch the currently logged-in user's information
router.get("/me", auth, recieveLoggedInUser);

module.exports = router;