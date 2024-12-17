const validateDates = require("../middleware/itinerary");
const { ItineraryModel } = require("../models/ItineraryModel");

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
    updateItinerary,
    deleteItinerary
}