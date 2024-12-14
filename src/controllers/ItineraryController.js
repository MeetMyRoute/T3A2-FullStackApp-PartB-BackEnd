const { res, req } = require("express");
const validateDates = require("../middleware/itinerary");
const { ItineraryModel } = require("../models/ItineraryModel");
const { UserModel } = require("../models/UserModel");

// Create a new itinerary to the database
const createItinerary = async(req, res) => {
    try {
        // Extract the itinerary data from the request body
        const {destination, startDate, endDate, accommodation, activities} = req.body;
        
        // Check if the required fields are provided
        if (!destination || !startDate || !endDate) {
            return res.status(400).json({
                message: "Destination, start date, and end date are required"
            });
        }

        validateDates(startDate, endDate);

        // Create a new itinerary object
        const newItinerary = new ItineraryModel({
            userId: req.user._id,
            destination,
            startDate,
            endDate,
            accommodation,
            activities
        });

        // Save the new itinerary to the database
        const savedItinerary = await newItinerary.save();

        // Respond with the saved itinerary data
        return res.status(201).json({
            message: "Itinerary created successfully",
            data: savedItinerary
        });
    } catch(error) {
        res.status(500).json({
            message: "Error creating itinerary:",
            error
        });
    }
}

// Get all itineraries owned by the user
const getItineraries = async(req, res) => {
    try {
        // Find itineraries that belong to the user
        const itineraries = await ItineraryModel.find({userId: req.user._id});

        // Check if the user has any itineraries
        if (!itineraries.length) {
            return res.status(404).json({
                message: "No itineraries found"
            });
        }

        // Respond with the found itineraries
        res.status(200).json({
            message: "Itineraries retrieved successfully",
            data: itineraries
        });
    } catch(error) {
        res.status(500).json({
            message: "Error retrieving itineraries:",
            error
        });
    }
}

// Get all simplified itineraries owned by the user
const getSimplifiedItineraries = async(req, res) => {
    try {
        // Find itineraries that belong to the user and only return the destination, startDate, and endDate fields
        const itineraries = await ItineraryModel.find(
            {userId: req.user._id},
            "destination startDate endDate"
        )

        // Check if the user has any itineraries
        if (!itineraries.length) {
            return res.status(404).json({
                message: "No itineraries found"
            });
        }

        // Respond with the simplified itineraries data
        return res.status(200).json({
            message: "Simplified itineraries retrieved successfully",
            data: itineraries
        });
    } catch(error) {
        return res.status(500).json({
            message: "Error retrieving simplified itineraries:",
            error
        });
    }
}

// Get shared (simplified) itineraries and local users excluding the user's by filters: destination, startDate and endDate
const getItinerariesAndUsersByFilters = async(req, res) => {
    try {
        // Extract filters from query params
        const {destination, startDate, endDate} = req.query;
        const loggedInUserId = req.user.id;

        if (!destination || !startDate || !endDate) {
            return res.status(400).json({
                message: "Destination, start date, and end date are required"
            })
        }

        // Query for itineraries excluding the user's and matching the filters
        const itineraries = await ItineraryModel.find({
            userId: {$ne: loggedInUserId},
            destination,
            startDate: {$gte: startDate},
            endDate: {$lte: endDate}
        }).populate("userId", "name status profilePic");

        // Query for local users at the destination
        const localUsers = await UserModel.find({
            _id: {$ne: loggedInUserId},
            location: destination,
            status: "Local"
        }).select("name location status profilePic");
        
        // Check if any itineraries and users match the filters
        if (!itineraries.length && !localUsers.length) {
            return res.status(404).json({
                message: "No matching itineraries and locals found"
            });
        }

        // Format the results
        const results = [
            ...itineraries.map((itinerary) => {
                let profilePicUrl = null;
                if (itinerary.userId.profilePic?.data) {
                    const base64Image = itinerary.userId.profilePic.data.toString("base64");
                    profilePicUrl = `data:${itinerary.userId.profilePic.contentType};base64,${base64Image}`;
                }
                return {
                    user: itinerary.userId.name,
                    status: itinerary.userId.status,
                    profilePic: profilePicUrl,
                    destination: itinerary.destination,
                    startDate: itinerary.startDate,
                    endDate: itinerary.endDate
                }
            }),
            ...localUsers.map((user) => {
                let profilePicUrl = null;
                if (user.profilePic?.data) {
                    const base64Image = user.profilePic.data.toString("base64");
                    profilePicUrl = `data${user.profilePic.contentType};base64,${base64Image}`;
                }
                return {
                    user: user.name,
                    location: user.location,
                    status: user.status,
                    profilePic: profilePicUrl
                }
            })
        ]

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

// Update details of a specific itinerary
const updateItinerary = async(req, res) => {
    try {
        // Get the itinerary ID from the URL parameters
        const {id} = req.params;
        // Data to update from the request body
        const {destination, startDate, endDate, accommodation, activities} = req.body;

        // Find the itinerary and ensure it belongs to the user
        const itinerary = await ItineraryModel.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!itinerary) {
            return res.status(404).json({
                message: "Itinerary not found or access denied"
            });
        }

        // Validate dates if they are provided
        if (startDate && endDate) {
            validateDates(startDate, endDate);
        }

        // Update fields only if they are provided
        if (destination !== undefined) itinerary.destination = destination;
        if (startDate !== undefined) itinerary.startDate = startDate;
        if (endDate !== undefined) itinerary.endDate = endDate;
        if (accommodation !== undefined) itinerary.accommodation = accommodation;
        if (activities !== undefined) itinerary.activities = activities;

        // Save the updated itinerary
        const updateItinerary = await itinerary.save();

        // Respond with the updated itinerary
        return res.status(200).json({
            message: "Itinerary updated successfully",
            data: updateItinerary
        });
    } catch(error) {
        return res.status(500).json({
            message: "Error updating itinerary:",
            error
        });
    }
}

// Delete an itinerary from the database
const deleteItinerary = async(req, res) => {
    try {
        // Get the itinerary ID from the URL parameters
        const {id} = req.params;

        // Find the itinerary and ensure it belongs to the user
        const itinerary = await ItineraryModel.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!itinerary) {
            return res.status(404).json({
                message: "Itinerary not found or access denied"
            });
        }

        // Respond with the success message
        return res.status(200).json({
            message: "Itinerary deleted successfully"
        });
    } catch(error) {
        return res.status(500).json({
            message: "Error deleting itinerary:",
            error
        });
    }
}

module.exports = {
    createItinerary,
    getItineraries,
    getSimplifiedItineraries,
    getItinerariesAndUsersByFilters,
    updateItinerary,
    deleteItinerary
}