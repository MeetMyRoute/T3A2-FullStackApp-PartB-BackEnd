const validateDates = require("../middleware/itinerary");
const { ItineraryModel } = require("../models/ItineraryModel");
const { UserModel } = require("../models/UserModel");
const { MessageModel } = require("../models/MessageModel");

// Get shared (simplified) itineraries and local users excluding the user's by filters: destination, startDate and endDate
const getItinerariesAndUsers = async(req, res) => {
    try {
        // Extract filters from query params
        const {destination, startDate, endDate} = req.query;
        const loggedInUserId = req.user.id;

        if (!destination || !startDate || !endDate) {
            return res.status(400).json({
                message: "Destination, start date, and end date are required"
            })
        }

        validateDates(startDate, endDate);

        // Query for itineraries excluding the user's and matching the filters
        const itineraries = await ItineraryModel.find({
            userId: {$ne: loggedInUserId},
            destination,
            startDate: {$gte: new Date(startDate)},
            endDate: {$lte: new Date(endDate)}
        }).populate("userId", "name status profilePic");

        // Query for local users at the destination
        const localUsers = await UserModel.find({
            _id: {$ne: loggedInUserId},
            location: destination,
            status: "Local"
        }).select("name location status profilePic");

        // Add "hasConnected" information to users with itineraries
        const itinerariesAlreadyConnected = await Promise.all(
            itineraries.map(async(itinerary) => {
                const hasConnected = await MessageModel.exists({
                    $or: [
                        {senderId: loggedInUserId, recipientId: itinerary.userId._id},
                        {senderId: itinerary.userId._id, recipientId: loggedInUserId}
                    ]
                });
                return {
                    user: itinerary.userId.name,
                    status: itinerary.userId.status,
                    profilePic: itinerary.userId.profilePic,
                    destination: itinerary.destination,
                    startDate: itinerary.startDate,
                    endDate: itinerary.endDate,
                    hasConnected: !!hasConnected
                }
            })
        )

        // Add "hasConnected" information to local users
        const localUsersAlreadyConnected = await Promise.all(
            localUsers.map(async(user) => {
                const hasConnected = await MessageModel.exists({
                    $or: [
                        {senderId: loggedInUserId, recipientId: user._id},
                        {senderId: user._id, recipientId: loggedInUserId}
                    ]
                });
                return {
                    user: user.name,
                    location: user.location,
                    status: user.status,
                    profilePic: user.profilePic,
                    hasConnected: !!hasConnected
                }
            })
        )
        
        // Check if any itineraries and users match the filters
        if (!itineraries.length && !localUsers.length) {
            return res.status(404).json({
                message: "No matching itineraries and locals found"
            });
        }

        // Combine results
        const results = [...itinerariesAlreadyConnected, ...localUsersAlreadyConnected];

        // Respond with the filtered itineraries
        return res.status(200).json({
            message: "Filtered shared itineraries/local users retrieved successfully",
            data: results
        });
    } catch(error) {
        return res.status(500).json({
            message: "Error retrieving filtered shared itineraries/local users:",
            error
        });
    }
}

module.exports = {
    getItinerariesAndUsers
}