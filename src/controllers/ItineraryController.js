const { response, request } = require("express");
const Itinerary = require("../models/ItineraryModel");

// Create a new itinerary to the database
const createItinerary = async(request, response) => {
    try {
        // Extract data from the request body
        const {destination, startDate, endDate, accommodation, activites} = request.body;

        // Extract the logged-in user's ID
        const userId = request.user._id;
        
        // Validate required fields
        if (!destination || !startDate || !endDate) {
            return response.status(400).json({
                message: "Missing required fields: destination, start date, or end date"
            });
        }

        // Create a new itinerary document
        const newItinerary = new Itinerary({
            userId,
            destination,
            startDate,
            endDate,
            accommodation: accommodation || "",
            activites: activites || []
        });

        // Save the itinerary to the database
        const savedItinerary = await newItinerary.save();

        // Respond with the created itinerary
        response.status(201).json({
            message: "Itinerary created successfully",
            data: savedItinerary
        });
    } catch(error) {
        // If saving the document fails respond with an error
        response.status(500).json({
            message: "Itinerary created unsuccessfully",
            error: error.message
        });
    }
}

// Get all itineraries owned by the user
const getItineraries = async(request, response) => {
    try {
        // Extract userId from request query
        const {userId} = request.query;

        // Validate that userId is provided
        if (!userId) {
            return response.status(400).json({
                message: "User ID is required to fetch itineraries"
            });
        }

        // Fetch itineraries
        const itineraries = await Itinerary.find({userId});

        // Respond with the itineraries
        response.status(200).json({
            message: "Itineraries fetched successfully",
            data: itineraries
        });
    } catch(error) {
        // If something goes wrong respond with an error
        response.status(500).json({
            message: "Itineraries fetched unsuccessfully",
            error: error.message
        });
    }
}

// Get all simplified itineraries owned by the user
const getSimpleItineraries = async(response, request) => {
    try {
        // Extract userId from the request query
        const {userId} = request.query;

        // Validate that userId is provided
        if (!userId) {
            return response.status(400).json({
                message: "User ID is required to fetch itineraries"
            });
        }

        // Fetch itineraries
        const itineraries = await Itinerary.find(
            {userId},
            {destination: 1, startDate: 1, endDate: 1}
        )

        // Respond with the itineraries
        response.status(200).json({
            message: "Itineraries fetch successfully",
            data: itineraries
        });
    } catch(error) {
        // If something goes wrong respond with an error
        response.status(500).json({
            message: "Itineraries fetched unsuccessfully",
            error: error.message
        });
    }
}


// Get all shared itineraries excluding the logged-in user's
const getSharedItineraries = async(response, request) => {
    try {
        // Extract the logged-in user's ID
        const loggedInUserId = request.user._id;

        // Fetch all itineraries and project and exclude required fields
        const itineraries = await ItineraryModel.find({userId: {$ne: loggedInUserId}})
            .select("destination startDate endDate userId")
            .populate("userId", "name");

        // If no itineraries are found respond with an error
        if (!itineraries || itineraries.length === 0) {
            return response.status(404).json({
                message: "No itineraries found"
            });
        }

        // Map results to include only the required fields
        const result = itineraries.map(itinerary => ({
            destination: itinerary.destination,
            startDate: itinerary.startDate,
            endDate: itinerary.endDate,
            user: itinerary.userId
        }));

        // Respond with the itineraries
        return response.status(200).json(result);
    } catch(error) {
        // If something goes wrong respond with an error
        return response.status(500).json({
            message: "Itineraries fetched unsuccessfully",
            error: error.message
        });
    }
}

// Get shared itineraries excluding the logged-in user's based on query parameters: destination, startDate and endDate
const getSharedItinerariesByFilters = async(response, request) => {
    try {
        // Extract the logged-in user's ID
        const loggedInUserId = request.user._id;

        // Extract destination, start date, and end date from request query
        const {destination, startDate, endDate} = request.query;

        // Ensure all required query parameters are provided
        if (!destination || !startDate || !endDate) {
            return response.status(400).json({
                message: "Destination, start date, and end date are required to filter itineraries"
            });
        }

        // Convert start date and end date to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate date formats
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return response.status(400).json({
                message: "Invalid start date or end date format"
            });
        }

        // Find itineraries that match and exclude the criteria
        const itineraries = await ItineraryModel.find({
            userId: {$ne: loggedInUserId},
            destination: destination,
            startDate: {$lte: end},
            end: {$gte: start}
        })
            .select("destination startDate endDate userId")
            .populate("userId", "name");

        // If no itineraries are found respond with an error
        if (!itineraries || itineraries.length === 0) {
            return response.status(404).json({
                message: "No itineraries found with the given destination and date range"
            });
        }

        // Map result to include only the required fields
        const result = itineraries.map(itinerary => ({
            destination: itinerary.destination,
            startDate: itinerary.startDate,
            endDate: itinerary.endDate,
            user: itinerary.userId
        }));

        // Respond with the itineraries
        return response.status(200).json(result);
    } catch(error) {
        // If something goes wrong respond with an error
        return response.status(500).json({
            message: "Itineraries fetched unsuccessfully",
            error: error.message
        });
    }
}

// Update details of a specific itinerary
const updateItinerary = async(response, request) => {
    try {
        // Extract the itineraryId from the request parameters and the updated data from the request body
        const {id} = request.params;
        const {destination, startDate, endDate, accommodation, activites} = request.body;

        // Extract the logged-in user's ID
        const loggedInUserId = request.user._id;

        // Find itinerary by ID
        const itinerary = await ItineraryModel.findById(id);

        // Check if itinerary exists
        if (!itinerary) {
            return response.status(404).json({
                message: "Itinerary not found"
            });
        }

        // Ensure the logged-in user owns the itinerary
        if (itinerary.userId.toString() !== loggedInUserId.toString()) {
            return response.start(403).json({
                message: "You are not authorised to update this itinerary"
            });
        }

        // Validate the required fields only if provided
        if (destination && destination.trim() === "") {
            return response.status(400).json({
                message: "Destination cannot be empty"
            });
        }

        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                return response.status(400).json({
                    message: "Invalid date format"
                });
            }
        }

        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                return response.status(400).json({
                    message: "Invalid date format"
                });
            }
        }

        // Update the itinerary fields (allow partial updates)
        if (destination) itinerary.destination = destination;
        if (startDate) itinerary.startDate = new Date(startDate);
        if (endDate) itinerary.endDate = new Date(endDate);
        itinerary.accommodation = accommodation || itinerary.accommodation;
        itinerary.activites = activites || itinerary.activites;

        // Save the updated itinerary
        await itinerary.save();

        // Respond with the updated itinerary
        return response.status(200).json({
            message: "Itinerary updated successfully",
            itinerary
        });
    } catch(error) {
        // If something goes wrong response with an error
        return response.status(500).json({
            message: "Itinerary updated unsuccessfully",
            error: error.message
        });
    }
}

// Delete an itinerary from the database
const deleteItinerary = async(request, response) => {
    
}

module.exports = {
    createItinerary,
    getItineraries,
    getSimpleItineraries,
    getSharedItineraries,
    getSharedItinerariesByFilters,
    updateItinerary,
    deleteItinerary
}