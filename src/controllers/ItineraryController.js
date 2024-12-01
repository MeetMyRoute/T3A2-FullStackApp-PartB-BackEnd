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

// Gets all shared itineraries
const getSharedItineraries = async(response, request) => {

}

// Gets shared itineraries based on options query paramters: destination, startDate and endDate
const getSharedItineraryByFilters = async(response, request) => {
    
}

// Updates details of a specific itinerary
const updateItinerary = async(response, request) => {
    
}

// Deletes an itinerary from the database
const deleteItinerary = async(request, response) => {
    
}

module.exports = {
    createItinerary,
    getItineraries,
    getSharedItineraries,
    getSharedItineraryByFilters,
    updateItinerary,
    deleteItinerary
}