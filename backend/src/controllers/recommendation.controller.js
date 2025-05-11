/**
 * Controller function to get vehicle recommendations based on location and ratings
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
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



/**
 * Function to get the optimal bid recommendation for a seller 
 * based on their pending bids uses a dynamic programming approach. 
 * It calculates the maximum revenue possible by selecting non-overlapping bids.
 */
export const getOptimalBidRecommendationsController = async(req, res) => {
  try {
      const ownerId = req.user._id;
      
      // Get all pending bids for all vehicles owned by this seller
      const pendingBids = await Bidding.find({
          'owner._id': ownerId,
          status: 'pending',
          startDate: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Only consider future bids
          }
      }).sort({ startDate: 1 });  // sort by start date initially 
      
      if (pendingBids.length === 0) {
          return res.status(200).json({ 
              message: 'No pending bids found for any of your vehicles',
              optimalBidSets: []
          });
      }

      // Helper function to calculate the number of days between two dates
      const calculateDays = (startDate, endDate) => {
          // Ensure both dates are normalized to midnight
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          
          // Calculate difference in milliseconds and convert to days
          // Add 1 because we count both the start day and end day
          return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      };

      // Group bids by vehicle ID
      const bidsByVehicle = {};
      pendingBids.forEach(bid => {
          const vehicleId = bid.vehicle._id.toString();
          if (!bidsByVehicle[vehicleId]) {
              bidsByVehicle[vehicleId] = {
                  vehicleId: vehicleId,
                  vehicleName: `${bid.vehicle.company} ${bid.vehicle.name}`,
                  rentals: []
              };
          }
          
          // Normalize dates by setting hours to 0,0,0,0 to ensure date-only comparison
          const startDate = new Date(bid.startDate);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(bid.endDate);
          endDate.setHours(0, 0, 0, 0);
          
          // Calculate total days and total revenue for this booking
          const days = calculateDays(startDate, endDate);
          const totalRevenue = days * bid.amount;
          
          bidsByVehicle[vehicleId].rentals.push({
              id: bid._id.toString(),
              startDate: startDate,
              endDate: endDate,
              amount: bid.amount,
              days: days,
              totalRevenue: totalRevenue  // Total revenue for the entire booking period
          });
      });

      // Process each vehicle separately using dynamic programming
      const optimalBidSets = [];

      for (const vehicleId in bidsByVehicle) {
          const vehicleData = bidsByVehicle[vehicleId];
          const rentals = vehicleData.rentals;
          
          const numRentals = rentals.length;
          if (numRentals === 0) continue;
          
          // Convert rentals to a format suitable for dynamic programming
          const rentalBookings = rentals.map((rental, index) => ({
              index,
              id: rental.id,
              startTime: rental.startDate.getTime(),
              endTime: rental.endDate.getTime(),
              startDate: rental.startDate,
              endDate: rental.endDate,
              dailyAmount: rental.amount,
              days: rental.days,
              revenue: rental.totalRevenue  // Use total revenue instead of daily amount
          }));
          
          // Sort rentals by end time
          rentalBookings.sort((a, b) => a.endTime - b.endTime);
          
          // Find the latest non-conflicting rental for each rental
          // basically a predecessor array storing the index of the last compatible rental
          const prevCompatible = Array(numRentals).fill(-1);
          for (let i = 1; i < numRentals; i++) {
              for (let j = i - 1; j >= 0; j--) {
                  // Check if the end date of rental[j] is before the start date of rental[i]
                  // Since we set all times to midnight (00:00:00), we need to ensure at least one day gap
                  const nextAvailableDay = new Date(rentalBookings[j].endTime);
                  nextAvailableDay.setDate(nextAvailableDay.getDate() + 1); // Add one day to end date
                  
                  if (nextAvailableDay.getTime() <= rentalBookings[i].startTime) {
                      prevCompatible[i] = j;
                      break;
                  }
              }
          }
          
          // DP array to store maximum revenue
          const maxRevenue = Array(numRentals).fill(0);
          maxRevenue[0] = rentalBookings[0].revenue;
          
          // Array to track which rentals are included in optimal solution
          const includedRentals = Array(numRentals).fill().map(() => []);
          includedRentals[0] = [rentalBookings[0].id];
          
          // Fill the maxRevenue table
          for (let i = 1; i < numRentals; i++) {
              // Option 1: Include current rental
              let revenueWithCurrent = rentalBookings[i].revenue;
              let rentalsWithCurrent = [rentalBookings[i].id];
              
              // Add revenue from previous compatible rentals
              if (prevCompatible[i] !== -1) {
                  revenueWithCurrent += maxRevenue[prevCompatible[i]];
                  rentalsWithCurrent = [...includedRentals[prevCompatible[i]], rentalBookings[i].id];
              }
              
              // Option 2: Exclude current rental
              const revenueWithoutCurrent = maxRevenue[i-1];
              const rentalsWithoutCurrent = includedRentals[i-1];
              
              // Choose the better option
              if (revenueWithCurrent > revenueWithoutCurrent) {
                  maxRevenue[i] = revenueWithCurrent;
                  includedRentals[i] = rentalsWithCurrent;
              } else {
                  maxRevenue[i] = revenueWithoutCurrent;
                  includedRentals[i] = rentalsWithoutCurrent;
              }
          }
          
          // Get the final set of optimal rental IDs
          const optimalRentalIds = includedRentals[numRentals-1];
          
          // Calculate optimal revenue for this vehicle
          const totalRevenue = maxRevenue[numRentals-1];
          
          // Add to vehicle recommendations
          optimalBidSets.push({
              vehicleId: vehicleId,
              vehicleName: vehicleData.vehicleName,
              optimalBidIds: optimalRentalIds,
              totalRevenue: totalRevenue
          });
      }
      
      // Sort by total revenue (highest first)
      optimalBidSets.sort((a, b) => b.totalRevenue - a.totalRevenue);
      
      return res.status(200).json({
          optimalBidSets
      });
      
  } catch (err) {
      console.error(`Error in getOptimalBidRecommendationsController: ${err.message}`);
      return res.status(500).json({ error: `Error in getOptimalBidRecommendationsController: ${err.message}` });
  }
}
