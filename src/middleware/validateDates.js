const {ItineraryModel} = require("../models/ItineraryModel");

// Helper function to validate date ranges
const validateDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that both dates are in a valid format
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format. Please use date format YYYY-MM-DD");
    }

    // Ensure that start date is before or equal to the end date
    if (start > end) {
        throw new Error("Start date must be before or equal to the end date");
    }
}

module.exports = validateDates;