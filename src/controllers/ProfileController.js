const {req, res } = require("express");
const { UserModel } = require("../models/UserModel");

// Get a user profile
const getProfile = async (req, res) => {
    try {
        // Get the user ID from the URL parameters
        const {id} = req.params;

        // Find user profile that belong to the user ID
        const user = await UserModel.findById(id);

        // Check if the user ID exists
        // If it does not, return error
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        // Check if status is set to Private
        // If it is, return error
        if (user.status == "Private") {
            return response.status(403).json({
                message: "User profile is private"
            })
        }

        // Check if a profile pic exists
        // If it does, convert it to Base64
        let profilePicUrl = null;
        if (user.profilePic) {
            // Convert the Buffer binary data to a Base64 string
            const base64Image = user.profilePic.toString("base64");
            // Create a data URL format
            profilePicUrl = `data:${user.profilePic.contentType};base64,${base64Image}`;
        }

        // Respond with the found user profile
        res.status(200).json({
            message: "User profile retrieved successfully",
            data: {
                name: user.name,
                location: user.location, 
                status: user.status,
                profilePic: profilePicUrl,
                travelPreferencesAndGoals: user.travelPreferencesAndGoals,
                socialMediaLink: user.socialMediaLink
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving user profile",
            error 
        });
    }
}

// Update details of user profile
const updateProfile = async (req, res) => {
    try {
        // Get the user ID from the URL parameters
        const {id} = req.params;
        // Get data to update from the request body
        const {name, location, status, travelPreferencesAndGoals, socialMediaLink} = request.body;

        // Get user ID from JWT token
        const loggedInUserId = req.user.id;

        // Check if logged in user ID matches user ID from the URL parameters
        if (loggedInUserId !== id) {
            return res.status(403).json({
                message: "User not authorised"
            });
        }

        // Find user profile that belong to the user ID
        const user = await UserModel.findById(id);

        // Check if user ID exists
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        // Update fields if new data is provided
        user.name = name || user.name;
        user.location = location || user.location;
        user.status = status || user.status;
        user.travelPreferencesAndGoals = travelPreferencesAndGoals || user.travelPreferencesAndGoals;
        user.socialMediaLink = socialMediaLink || user.socialMediaLink;

        // If new data is provided for profilePic, convert it into a Buffer object
        if (profilePic) {
            // Extract MIME type
            const matches = profilePic.match(/^data:(.+);base64,/);
            if (matches && matches[1]) {
                const mimeType = matches[1];
                const base64Data = profilePic.replace(/^data:.+;base64,/, '');
                const buffer = Buffer.from(base64Data, "base64");

                // Update field
                user.profilePic = {data: buffer, contentType: mimeType}
            } else {
                return response.status(400).json({
                    message: "Invalid image format"
                })
            }
        }

        // Save updated user profile
        const updatedUser = await user.save();

        // Respond with the updated user profile
        return res.status(200).json({
            message: "User profile updated successfully",
            data: updatedUser
        })
    } catch (error) {
        res.status(500).json({
            message: "Error updated user profile",
            error 
        });
    }
}

module.exports = {
    getProfile,
    updateProfile
}