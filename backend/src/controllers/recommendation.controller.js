/**
 * Controller function to get vehicle recommendations based on location and ratings
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.city - City of the authenticated user
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.city - Optional city filter
 * @param {Object} res - Express response object
 * 
 * @returns {Promise<void>} Sends JSON response with vehicle recommendations
 * 
 * @description
 * This controller:
 * 1. Takes user's city or query city as reference
 * 2. Aggregates vehicle data from biddings collection
 * 3. Matches vehicles with approved/started/ended/reviewed status in the specified city
 * 4. Groups results by vehicle ID and counts bookings
 * 5. Looks up related reviews
 * 6. Calculates average rating and review count
 * 7. Computes recommendation score based on:
 *    - Booking count (weight: 1)
 *    - Average rating (weight: 2)
 * 8. Returns top 6 recommended vehicles sorted by score
 * 
 * @throws {Error} Returns 500 status if server encounters an error
 */
import Bidding from "../models/bidding.model.js";



export const getVehicleRecommendationController = async (req, res) => {
    let userCity = req.user.city;
    const city = req.query.city;

    if(city){
        userCity = city;
    }
   
    try {
        const recommendations = await Bidding.aggregate([
            {
              $match: {
                status: { $in: ['approved', 'started', 'ended', 'reviewed'] },
                'vehicle.city': userCity
              }
            },
            {
              $group: {
                _id: '$vehicle._id',
                bookingCount: { $sum: 1 },
                vehicleInfo: { $first: '$vehicle' }
              }
            },
            {
              $lookup: {
                from: 'reviews', 
                localField: '_id',
                foreignField: 'vehicle._id',
                as: 'reviews'
              }
            },
            {
              $addFields: {
                averageRating: { 
                  $cond: [
                    { $gt: [{ $size: '$reviews' }, 0] },
                    { $avg: '$reviews.rating' },
                    0
                  ]
                },
                totalReviews: { $size: '$reviews' }
              }
            },
            {
              $addFields: {
                score: {
                  $add: [
                    { $multiply: ['$bookingCount', 1] },   
                    { $multiply: ['$averageRating', 2] }  
                  ]
                }
              }
            },
            {
              $sort: { score: -1 } 
            },
            {
              $limit: 6
            },
            {
              $project: {
                vehicleId: '$_id',
                vehicle: '$vehicleInfo',
                bookingCount: 1,
                averageRating: 1,
                totalReviews: 1
              }
            }
          ]);
        res.status(200).json({ recommendations });
    }catch (error) {
        console.error('Error fetching vehicle recommendations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }   
}