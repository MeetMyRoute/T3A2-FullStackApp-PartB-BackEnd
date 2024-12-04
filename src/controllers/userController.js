const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler"); 
const jwt = require("jsonwebtoken");

// Get users 
// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, status, location, travelPreferences, socialMediaLink } = req.body;

  try {
      // check fields have been filled in
      if (!email || !password || !status || !location || !travelPreferences || !socialMediaLink) {
          return res.status(400).json({ message: "Please fill in all fields" });
      }

      // check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
          return res.status(400).json({ message: "User already exists" });
      }

      // create hashed password
      const hashedPassword = await bcrypt.hash(password, 10);

      // create a new user
      const newUser = await User.create({
          name,
          email,
          password: hashedPassword,
          location,
          travelPreferences,
          status,
          socialMediaLink,
      });

      // check if user creation was successful
      if (newUser) {
          return res.status(201).json({
              _id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              status: newUser.status,
              location: newUser.location,
              travelPreferences: newUser.travelPreferences,
              socialMediaLink: newUser.socialMediaLink,
              token: generateToken(newUser._id),
          });
      } else {
          return res.status(400).json({ message: "Invalid user details" });
      }
  } catch (error) {
      console.error("Error during user registration:", error);
      res.status(500).json({ message: "An error occurred while registering the user. Please try again later." });
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if required fields are present
  if (!email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
  }

  try {
      // Check for user by email
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare passwords
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateToken(user._id);

      // Respond with success message and token
      res.json({
          message: "Logged in successfully",
          token,
      });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

// Admin login 
/// RESET PASSWORD

module.exports = {
    registerUser,
    loginUser,
};