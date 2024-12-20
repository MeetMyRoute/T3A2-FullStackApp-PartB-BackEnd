const validateDates = require("../middleware/validateDates");
const { ItineraryModel } = require("../models/ItineraryModel");

// Create a new itinerary to the database
const createItinerary = async (req, res) => {
    try {
        // Extract the itinerary details from the request body
        const { destination, startDate, endDate, accommodation, activities } = req.body;
        
        // Validate required fields
        if (!destination || !startDate || !endDate) {
            return res.status(400).json({
                message: "Destination, start date, and end date are required"
            });
        }

        // Validate date inputs
        validateDates(startDate, endDate);

        // Create a new itinerary instance
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
            message: "Error creating itinerary",
            error: error.message
        });
    }
}

// Retrieve all itineraries owned by the authenticated user
const getItineraries = async (req, res) => {
    try {
        // Fetch itineraries belonging to the user
        const itineraries = await ItineraryModel.find({ userId: req.user._id });

        if (!itineraries.length) {
            return res.status(404).json({
                message: "No itineraries found"
            });
        }

        // Respond with the list of itineraries
        res.status(200).json({
            message: "Itineraries retrieved successfully",
            data: itineraries
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving itineraries",
            error: error.message
        });
    }
}

// Retrieve simplified itineraries owned by the authenticated user (only destination, startDate, and endDate)
const getSimplifiedItineraries = async (req, res) => {
    try {
        const itineraries = await ItineraryModel.find(
            { userId: req.user._id },
            "destination startDate endDate"
        )

        if (!itineraries.length) {
            return res.status(404).json({
                message: "No itineraries found"
            });
        }

        return res.status(200).json({
            message: "Simplified itineraries retrieved successfully",
            data: itineraries
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving simplified itineraries:",
            error: error.message
        });
    }
}

// Update a specific itinerary
const updateItinerary = async (req, res) => {
    try {
        const { id } = req.params;
        const { destination, startDate, endDate, accommodation, activities } = req.body;

        // Find the itinerary and ensure it belongs to the authenticated user
        const itinerary = await ItineraryModel.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!itinerary) {
            return res.status(404).json({
                message: "Itinerary not found or access denied"
            });
        }

        // Validate dates if provided
        if (startDate && endDate) {
            validateDates(startDate, endDate);
        }

        // Update only the provided fields
        if (destination) itinerary.destination = destination;
        if (startDate) itinerary.startDate = startDate;
        if (endDate) itinerary.endDate = endDate;
        if (accommodation) itinerary.accommodation = accommodation;
        if (activities) itinerary.activities = activities;

        // Save the updated itinerary
        const updateItinerary = await itinerary.save();

        return res.status(200).json({
            message: "Itinerary updated successfully",
            data: updateItinerary
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error updating itinerary:",
            error: error.message
        });
    }
}

// Delete a specific itinerary
const deleteItinerary = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the itinerary
        const itinerary = await ItineraryModel.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!itinerary) {
            return res.status(404).json({
                message: "Itinerary not found or access denied"
            });
        }

        return res.status(200).json({
            message: "Itinerary deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting itinerary",
            error: error.message
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