const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler"); 
const jwt = require("jsonwebtoken");
const nodemailer = require ("nodemailer"); 
const upload = require("../middleware/uploadConfig");
const { UserModel } = require('../models/UserModel');

// Generate JWT Token
const generateToken = (id, isAdmin) => {
    return jwt.sign({ id, isAdmin }, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: '1h',
    });
  };

// @desc    Get all users (Admin only)
// @route   GET /user
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        // Check if the logged-in user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Admins only. Access denied." });
        }

        // Fetch all users from the database
        const users = await UserModel.find({}).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "An error occurred while fetching users." });
    }
});

// @desc    Register new user
// @route   POST /user
const registerUser = asyncHandler(async (req, res) => {
  const {name, email, password, status, location, travelPreferencesAndGoals, socialMediaLink, isAdmin} = req.body;

  try {
      // Check fields have been filled in
      if (!name || !email || !password || !status || !location || !travelPreferencesAndGoals || !socialMediaLink) {
          return res.status(400).json({ message: "Please fill in all fields" });
      }

      // Check if user already exists
      const userExists = await UserModel.findOne({ email });
      if (userExists) {
          return res.status(400).json({ message: "User already exists with this email." });
      }

      // Create hashed password
      const salt = await bcrypt.genSalt(10); 
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Handle file upload
      let profilePicPath = null;
      if (req.file) {
         profilePicPath = req.file.path;
       }

      // Create a new user
      const newUser = await UserModel.create({
          name,
          email,
          password: hashedPassword,
          location,
          travelPreferencesAndGoals,
          status,
          socialMediaLink,
          profilePic: profilePicPath, 
          isAdmin: isAdmin || false 
      });

      // Check if user creation was successful
      if (newUser) {
          return res.status(201).json({
              _id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              status: newUser.status,
              location: newUser.location,
              travelPreferencesAndGoals: newUser.travelPreferencesAndGoals, 
              socialMediaLink: newUser.socialMediaLink,
              profilePic: profilePicPath, 
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

// @desc    User Login
// @route   POST /user/login
const loginUser = asyncHandler(async (req, res) => {
  const {email, password} = req.body;

  // Check if required fields are present
  if (!email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
  }

  try {
      // Check for user by email
      const user = await UserModel.findOne({ email: email});

      if (!user) {
        return res.status(404).json({ message: "No user found with this email" });
      }

      // Compare passwords
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
          return res.status(401).json({ message: "Invalid password" });
      }

      // Generate JWT token
      const token = generateToken(user._id, user.isAdmin);

      // Respond with success message and token
      res.json({
          message: "Logged in successfully",
          user: {id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin},
          token,
      });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

// @desc    Get currently logged-in user data 
// @route   GET /user/me
const recieveLoggedInUser = asyncHandler(async (req, res) => {
    const { _id, name, email } = await UserModel.findById(req.user.id);
    res.status(200).json({
      id: _id,
      name,
      email,
    });
});

// @desc    Admin Login
// @route   POST /user/adminlogin
const adminLogin = asyncHandler (async (req, res) => {
    const {email, password} = req.body 

    try {
        // Check for user by email
        const user = await UserModel.findOne({email}); 
        if (!user) {
            return res.status(401).json({message: "Invalid email or password"}); 
        }

        // Check if user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({message: "Access denied. You are not an admin." });
        }

         // Compare passwords
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
          return res.status(401).json({message: "Invalid password" });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.isAdmin);

        // Respond with success message and token
        res.json({
            message: "Logged in successfully",
            token,
        });

    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
}); 

// @desc    Password reset email 
// @route   /user/forgetPassword
// @route   /user/resetPassword
const passwordResetEmail = (token) => `
    <h1>Reset Your Password</h1>
    <p>You requested a password reset. Please use the following token to reset your password:</p>
    <p><strong>Your reset token:</strong> <span style="font-size: 18px;">${token}</span></p>
    <p>The token above will expire in one hour. If you didn't request this password reset, please ignore this email.</p>
`;

const forgetPassword = asyncHandler (async (req, res) => {
    const {email} = req.body; 

    // Check if email is provided 
    if (!email) {
        return res.status(400).json({message: "Please provide an email address"}); 
    }

    try {
        // Find the user by email
        const user = await UserModel.findOne ({email}); 
        if (!user) {
            return res.status(404).json({message: "User not found"}); 
        }

        // Generate a unique JWT token for password reset
        const token = jwt.sign({userId: user._id}, process.env.JWT_RESET_PASSWORD_SECRET, {expiresIn: '1h'}); 

        // Configure the email transporter 
        const emailSender = nodemailer.createTransport ({
            service: "gmail", 
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.EMAIL_PASS,
            }, 
        }); 

        // Define email content
        const mailFormat = {
            from: process.env.EMAIL,  
            to: req.body.email, 
            subject: "Reset Password",  
            html: passwordResetEmail(token), 
        }; 

        // Send the email
        await emailSender.sendMail(mailFormat);

        // Respond with a success message
        res.status(200).json({ 
            message: "If a user with that email exists, a password reset link has been sent.", 
            token: token, 
        });
    } catch (error) {
        console.error("Error during forget password process:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
}); 

const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword, resetToken } = req.body;

    // Validate new password
    if ( !resetToken || !newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ message: "Invalid password format."});
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(resetToken, process.env.JWT_RESET_PASSWORD_SECRET);

        if (!decodedToken || !decodedToken.userId) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }

        // Find the user by ID from the token
        const user = await UserModel.findById(decodedToken.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Send success response
        res.status(200).json({ message: "Password has been reset successfully." });

    } catch (error) {
        console.error("Error during password reset:", error);

        // Distinguish between token expiration and other errors
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token has expired. Please request a new password reset." });
        }
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});

// @desc    Delete user account
// @route   /user/delete
const deleteUser = async (req, res) => {
    try {
        // Get user ID from JWT token
        const {id} = req.user;

        // Find user that belong to the user ID
        const user = await UserModel.findOneAndDelete({_id: id});

        // Check if user ID exists
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        // Respond with a success message
        return res.status(200).json({
            message: "User account deleted successfully",
        })
    // Respond with an error message
    } catch (error) {
        res.status(500).json({
            message: "Error deleting user account:",
            error 
        });
    }
}

module.exports = {
    getAllUsers, 
    registerUser,
    loginUser,
    recieveLoggedInUser,  
    adminLogin, 
    forgetPassword, 
    resetPassword,
    deleteUser
};