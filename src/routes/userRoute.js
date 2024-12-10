const express = require("express");
const router = express.Router();
const { auth } = require('../middleware/auth');

const {
  getAllUsers, 
  registerUser,
  loginUser,
  recieveLoggedInUser, 
  adminLogin, 
  forgetPassword, 
  resetPassword,
} = require("../controllers/userController");

// Route to register a new user
router.post("/", registerUser);
// Route to log in an existing user and generate a token
router.post("/login", loginUser);
// Route to log in admin user and generate a token 
router.post("/adminLogin",adminLogin);
// Route to get all users (requires admin authentication)
router.get("/", auth, getAllUsers);
// Route to fetch the currently logged-in user's information
router.get("/me", auth, recieveLoggedInUser);
// Route to handle forgotten password requests
router.post("/forgetPassword", forgetPassword);
// Route to handle password reset using a valid token
router.post("/reset-password/:token", resetPassword);

module.exports = router;