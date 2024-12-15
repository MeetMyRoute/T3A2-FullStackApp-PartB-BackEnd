const {ItineraryModel} = require("../models/ItineraryModel");

// Helper function to validate dates
const validateDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format. Use date format YYYY-MM-DD.");
    }

    if (start > end) {
        throw new Error("Start date must be before the end date");
    }
}

module.exports = validateDates;