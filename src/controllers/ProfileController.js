const {request, response } = require("express");
const { UserModel } = require("../models/UserModel");

// Get a user profile
const getProfile = async (request, response) => {
    try {
        // Get the user ID from the URL parameters
        const {id} = request.params;

        // Find user profile that belong to the user ID
        const user = await UserModel.findById(id);

        // Check if user ID exists
        if (!user) {
            return response.status(404).json({
                message: "User not found"
            })
        }

        // Respond with the found user profile
        response.status(200).json({
            message: "User profile retrieved successfully",
            data: user
        });
    } catch (error) {
        response.status(500).json({
            message: "Error retrieving user profile",
            error 
        });
    }
}

// Update details of user profile
const updateProfile = async (request, response) => {
    try {
        // Get the user ID from the URL parameters
        const {id} = request.params;
        // Get data to update from the request body
        const {name, location, status, travelPreferencesAndGoals, socialMediaLink} = request.body;

        // Get user ID from JWT token
        const loggedInUserId = request.user.id;

        // Check if logged in user ID matches user ID from the URL parameters
        if (loggedInUserId !== id) {
            return response.status(403).json({
                message: "User not authorised"
            });
        }

        // Find user profile that belong to the user ID
        const user = await UserModel.findById(id);

        // Check if user ID exists
        if (!user) {
            return response.status(404).json({
                message: "User not found"
            })
        }

        // Update fields if new data is provided
        user.name = name || user.name;
        user.location = location || user.location;
        user.status = status || user.status;
        user.travelPreferencesAndGoals = travelPreferencesAndGoals || user.travelPreferencesAndGoals;
        user.socialMediaLink = socialMediaLink || user.socialMediaLink;

        // Save updated user profile
        const updatedUser = await user.save();

        // Respond with the updated user profile
        return response.status(200).json({
            message: "User profile updated successfully",
            data: updatedUser
        })
    } catch (error) {
        response.status(500).json({
            message: "Error updated user profile",
            error 
        });
    }
}

module.exports = {
    getProfile,
    updateProfile
}