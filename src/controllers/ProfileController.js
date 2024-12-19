const { UserModel } = require("../models/UserModel");
const { ItineraryModel } = require("../models/ItineraryModel");
const { MessageModel } = require("../models/MessageModel");

// Get a user profile
const getProfile = async (req, res) => {
    try {
        // Get the user ID from the URL parameters
        const {id} = req.params;

        // Get from the request
        const loggedInUserId = req.user.id;

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
            return res.status(403).json({
                message: "User profile is private"
            })
        }

        // Check if the user has connected with the other user
        const hasConnected = await MessageModel.exists({
            $or: [
                {senderId: loggedInUserId, recipientId: id},
                {senderId: id, recipientId: loggedInUserId}
            ]
        });

        // Find itineraries belonging to the user
        const itineraries = await ItineraryModel.find({userId: id}).select("destination startDate endDate");

        // Format itineraries
        const formattedItineraries = itineraries.map(itinerary => ({
            destination: itinerary.destination,
            startDate: itinerary.startDate,
            endDate: itinerary.endDate
        }));

        // Respond with the found user profile
        res.status(200).json({
            message: "User profile retrieved successfully",
            data: {
                name: user.name,
                location: user.location, 
                status: user.status,
                profilePic: user.profilePic,
                travelPreferencesAndGoals: user.travelPreferencesAndGoals,
                socialMediaLink: user.socialMediaLink,
                hasConnected: !!hasConnected,
                itineraries: formattedItineraries
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving user profile:",
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
        const {name, location, status, profilePic, travelPreferencesAndGoals, socialMediaLink} = req.body;

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
        user.profilePic = profilePic || user.profilePic;
        user.travelPreferencesAndGoals = travelPreferencesAndGoals || user.travelPreferencesAndGoals;
        user.socialMediaLink = socialMediaLink || user.socialMediaLink;

        // Save updated user profile
        const updatedUser = await user.save();

        // Respond with the updated user profile
        return res.status(200).json({
            message: "User profile updated successfully",
            data: updatedUser
        })
    } catch (error) {
        res.status(500).json({
            message: "Error updated user profile:",
            error 
        });
    }
}

module.exports = {
    getProfile,
    updateProfile
}