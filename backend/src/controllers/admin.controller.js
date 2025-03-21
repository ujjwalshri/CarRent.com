import Bidding from "../models/bidding.model.js";

/*
@description: function to get a map of monthwise trips(trips per month) from the database for the admin charts
*/
export const monthlyTripsController = async (req, res) => {
    try {
        const aggregationPipeline = [
            {
                $match: {
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: { $month: "$startDate" },
                    trips: { $push: "$$ROOT" } 
                }
            },
            {
                $sort: { _id: 1 } 
            }
        ];
        const result = await Bidding.aggregate(aggregationPipeline);


        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];


        const monthVsBookings = result.reduce((acc, item) => {
            const monthName = monthNames[item._id - 1]; 
            acc[monthName] = item.trips.length; 
            return acc;
        }, {});

        return res.status(200).json({ monthVsBookings });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};