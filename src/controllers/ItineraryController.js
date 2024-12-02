const Itinerary = require("../models/ItineraryModel");

// Create a new itinerary to the database
const createItinerary = async(request, response) => {
    try {
        // Extract the itinerary data from the request body
        const {destination, startDate, endDate, accommodation, activites} = request.body;
        
        // Check if the required fields are provided
        if (!destination || !startDate || !endDate) {
            return response.status(400).json({
                message: "Destination, start date, and end date are required"
            });
        }

        // Create a new itinerary object
        const newItinerary = new ItineraryModel({
            userId: request.user._id,
            destination,
            startDate,
            endDate,
            accommodation,
            activites
        });

        // Save the new itinerary to the database
        const savedItinerary = await newItinerary.save();

        // Respond with the saved itinerary data
        return response.status(201).json({
            message: "Itinerary created successfully",
            data: savedItinerary
        });
    } catch(error) {
        response.status(500).json({
            message: "Error creating itinerary",
            error
        });
    }
}

// Get all itineraries owned by the user
const getItineraries = async(request, response) => {
    try {
        // Find itineraries that belong to the user
        const itineraries = await ItineraryModel.find({userId: request.user._id});

        // Check if the user has any itineraries
        if (!itineraries.length) {
            return response.status(404).json({
                message: "No itineraries found"
            });
        }

        // Respond with the found itineraries
        response.status(200).json({
            message: "Itineraries retrieved successfully",
            data: itineraries
        });
    } catch(error) {
        response.status(500).json({
            message: "Error retrieving itineraries",
            error
        });
    }
}

// Get all simplified itineraries owned by the user
const getSimplifiedItineraries = async(response, request) => {
    try {
        // Find itineraries that belong to the user and only return the destination, startDate, and endDate fields
        const itineraries = await ItineraryModel.find(
            {userId: request.user._id},
            "destination startDate endDate"
        )

        // Check if the user has any itineraries
        if (!itineraries.length) {
            return response.status(404).json({
                message: "No itineraries found"
            });
        }

        // Respond with the simplified itineraries data
        return response.status(200).json({
            message: "Simplified itineraries retrieved successfully",
            data: itineraries
        });
    } catch(error) {
        return response.status(500).json({
            message: "Error retrieving simplified itineraries",
            error
        });
    }
}


// Get all shared itineraries excluding the user's
const getSharedItineraries = async(response, request) => {
    try {
        // Find itineraries that do not belong to the user
        const itineraries = await ItineraryModel.find(
            {userId: {$ne: request.user._id}},
            "destination startDate endDate"
        ).populate("userId", "name");

        // Check if there are any shared itineraries
        if (!itineraries.length) {
            return response.status(404).json({
                message: "No shared itineraries found"
            });
        }

        // Respond with the shared itineraries data
        return response.status(200).json({
            message: "Shared itineraries retrieved successfully",
            data: itineraries
        });
    } catch(error) {
        return response.status(500).json({
            message: "Error retrieving shared itineraries",
            error
        });
    }
}

// Get shared itineraries excluding the user's by filters: destination, startDate and endDate
const getSharedItinerariesByFilters = async(response, request) => {
    try {
        // Extract filters from query params
        const {destination, startDate, endDate} = request.query;

        // Build query dynamically based on provided filters
        const query = {userId: {$ne: request.user._id}};

        if(destination) {
            query.destination = {
                $regex: destination,
                $options: "i"
            };
        }

        if (startDate) {
            query.startDate = {
                $gte: new Date(startDate)
            }
        }

        if (endDate) {
            query.endDate = {
                $lte: new Date(endDate)
            }
        }

        // Fetch itineraries matching the query and include user details
        const itineraries = await ItineraryModel.find(
            query,
            "destination startDate endDate"
        ).populate("userId", "name");
        
        // Check if any itineraries match the filters
        if (!itineraries.length) {
            return response.status(404).json({
                message: "No matching itineraries found"
            });
        }

        // Respond with the filtered itineraries
        return response.status(200).json({
            message: "Filtered shared itineraries retrieved successfully",
            data: itineraries
        });
    } catch(error) {
        return response.status(500).json({
            message: "Error retrieving filtered shared itineraries"
        });
    }
}

// Update details of a specific itinerary
const updateItinerary = async(response, request) => {
    try {
        // Get the itinerary ID from the URL parameters
        const {id} = request.params;
        // Data to update from the request body
        const updateData = request.body;

        // Find the itinerary and ensure it belongs to the user
        const itinerary = await ItineraryModel.findOne({
            _id: id,
            userId: request.user._id
        });

        if (!itinerary) {
            return response.status(404).json({
                message: "Itinerary not found or access denied"
            });
        }

        // Update the itinerary
        Object.assign(itinerary, updateData);
        await itinerary.save();

        // Respond with the updated itinerary
        return response.status(200).json({
            message: "Itinerary updated successfully",
            data: itinerary
        });
    } catch(error) {
        return response.status(500).json({
            message: "Error updating itinerary",
            error
        });
    }
}

// Delete an itinerary from the database
const deleteItinerary = async(request, response) => {
    try {
        // Get the itinerary ID from the URL parameters
        const {id} = request.params;

        // Find the itinerary and ensure it belongs to the user
        const itinerary = await ItineraryModel.findOneAndDelete({
            _id: id,
            userId: request.user._id
        });

        if (!itinerary) {
            return response.status(404).json({
                message: "Itinerary not found or access denied"
            });
        }

        // Respond with the success message
        return response.status(200).json({
            message: "Itinerary deleted successfully"
        });
    } catch(error) {
        return response.status(500).json({
            message: "Error deleting itinerary",
            error
        });
    }
}

module.exports = {
    createItinerary,
    getItineraries,
    getSimplifiedItineraries,
    getSharedItineraries,
    getSharedItinerariesByFilters,
    updateItinerary,
    deleteItinerary
}