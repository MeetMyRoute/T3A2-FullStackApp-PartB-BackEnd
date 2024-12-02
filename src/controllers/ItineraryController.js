const Itinerary = require("../models/ItineraryModel");

// Create a new itinerary to the database
const createItinerary = async(request, response) => {
    try {
        // Extract data from the request body
        const {userId, destination, startDate, endDate, accommodation, activites} = request.body;
        
        // Validate required fields
        if (!userId || !destination || !startDate || !endDate) {
            return response.status(400).json({
                message: "Missing required fields: user ID, destination, start date, or end date"
            });
        }

        // Create a new itinerary document
        const newItinerary = new Itinerary({
            userId,
            destination,
            travelDates: {startDate, endDate},
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
        // If something goes wrong during the database query respond with an error
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
        // If something goes wrong during the database query respond with an error
        return response.status(500).json({
            message: "Itineraries fetched unsuccessfully",
            error: error.message
        });
    }
}

// Update details of a specific itinerary
const updateItinerary = async(response, request) => {
    
}

// Delete an itinerary from the database
const deleteItinerary = async(request, response) => {
    
}

module.exports = {
    createItinerary,
    getItineraries,
    getSharedItineraries,
    getSharedItinerariesByFilters,
    updateItinerary,
    deleteItinerary
}