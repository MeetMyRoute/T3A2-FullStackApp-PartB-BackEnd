require("dotenv").config();

// 2 users

const seedItineraries = async(users) => {
    const itineraries = [
        {
            userId: users[0]._id,
            destination: "Melbourne",
            startDate: "2025-03-01",
            endDate: "2025-03-10",
            accommodation: "Hotel Melbourne",
            activities: ["Royal Botanic Gardens Victoria", "National Gallery of Victoria"]
        },
        {
           userId: users[0] ._id,
           destination: "Lisbon",
           startDate: "2025-04-01",
           endDate: "2025-04-07",
           activities: ["Belem Tower"]
        }
    ]
}