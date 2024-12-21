const validateDates = require("../middleware/validateDates");
const { ItineraryModel } = require("../models/ItineraryModel");
const { UserModel } = require("../models/UserModel");
const { MessageModel } = require("../models/MessageModel");

// Get shared itineraries and local users excluding the logged-in user's own data
const getItinerariesAndUsers = async (req, res) => {
    try {
        // Extract filters from query parameters
        const { destination, startDate, endDate } = req.query;
        const loggedInUserId = req.user.id;

        if (!destination || !startDate || !endDate) {
            return res.status(400).json({
                message: "Destination, start date, and end date are required"
            });
        }

        // Validate date range
        validateDates(startDate, endDate);

        // Fetch itineraries matching the filters, excluding the logged-in user's
        const itineraries = await ItineraryModel.find({
            userId: { $ne: loggedInUserId },
            destination,
            startDate: { $gte: new Date(startDate) },
            endDate: { $lte: new Date(endDate) }
        }).populate("userId", "name status profilePic");

        // Fetch local users at the destination
        const localUsers = await UserModel.find({
            _id: { $ne: loggedInUserId },
            location: destination,
            status: "Local"
        }).select("name location status profilePic");

        // Get all user IDs to check connections in a single query
        const userIdsToCheck = [
            ...itineraries.map(itinerary => itinerary.userId._id.toString()),
            ...localUsers.map(user => user._id.toString())
        ]

        const connections = await MessageModel.find({
            $or: [
                { senderId: loggedInUserId, recipientId: { $in: userIdsToCheck } },
                { senderId: { $in: userIdsToCheck }, recipientId: loggedInUserId }
            ]
        }).select("senderId, recipientId");

        // Map connections into a set for quick lookup
        const connectedUserIds = new Set(
            connections.flatMap(connection => [connection.senderId.toString(), connection.recipientId.toString()])
        )

        // Format itineraries with "hasConnected" status
        const formattedItineraries = itineraries.map(itinerary => ({
            user: itinerary.userId.name,
            status: itinerary.userId.status,
            profilePic: itinerary.userId.profilePic,
            destination: itinerary.destination,
            startDate: itinerary.startDate,
            endDate: itinerary.endDate,
            hasConnected: connectedUserIds.has(itinerary.userId._id.toString())
        }));

        // Format local users with "hasConnected" status
        const formattedLocalUsers = localUsers.map(user => ({
            user: user.name,
            location: user.location,
            status: user.status,
            profilePic: user.profilePic,
            hasConnected: connectedUserIds.has(user._id.toString())
        }));
        
        // Check if no matching data was found
        if (!formattedItineraries.length && !formattedLocalUsers.length) {
            return res.status(404).json({
                message: "No matching itineraries or locals found"
            });
        }

        // Combine results
        const results = [...formattedItineraries, ...formattedLocalUsers];

        // Respond with the results
        return res.status(200).json({
            message: "Filtered shared itineraries/locals retrieved successfully",
            data: results
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving filtered shared itineraries/locals:",
            error: error.message
        });
    }
}

module.exports = {
    getItinerariesAndUsers
}