/**
 * Vehicle Controllers
 * Handles all operations related to vehicle management
 * @module controllers/vehicle
 */
import User from "../models/user.model.js";
import Vehicle from "../models/vehicle.model.js"; 
import Bidding from "../models/bidding.model.js";
import { createCarValidation } from "../validation/car.validation.js";
import { sendCongratulationEmail, sendCarRejectionEmail } from "../services/email.service.js";
import { getCachedData, setCachedData, deleteCachedData} from "../services/redis.service.js";
import {Types} from 'mongoose';

/**
 * Adds a new car to the database
 * 
 * @async
 * @function addCarController
 * @param {Object} req - Express request object
 * @param {Object} req.body - Car details submitted by user
 * @param {string} req.body.name - Name of the car
 * @param {string} req.body.company - Manufacturer of the car
 * @param {string} req.body.modelYear - Year the car was manufactured
 * @param {number} req.body.price - Rental price per day
 * @param {string} req.body.color - Color of the car
 * @param {string} req.body.mileage - Fuel efficiency
 * @param {string} req.body.fuelType - Type of fuel used
 * @param {string} req.body.category - Vehicle category
 * @param {string} req.body.city - City where the car is available
 * @param {string} req.body.location - Specific location within the city
 * @param {Array} req.files - Uploaded images of the vehicle
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 * @description
 * Validates and adds a new car to the database. Sets the vehicle status
 * to 'approved' if the user is already a seller, otherwise defaults to 'pending'.
 */
export const addCarController = async (req, res) => {
    const {
        name, company, modelYear, price, color, mileage, fuelType, category, city, location, registrationNumber
    } = req.body;
    try {
        const user = req.user;
        const images = req.files.map(file => ({
            url: file.location,
            key: file.key,
            name: file.originalname,
            uploadedAt: new Date()
        }));

        const carData = {
            name, company, modelYear, price, color, mileage,vehicleImages:images, registrationNumber, fuelType,location, category, city, owner:{
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                city: user.city,
            }
        }
        const isValidCar = createCarValidation.validate(carData);
        if(isValidCar.error){
            return res.status(400).json({error: isValidCar.error.details[0].message});
        }

        const newCar = new Vehicle({
            name,
            company,
            modelYear,
            price,
            color,
            mileage,
            fuelType,
            location, 
            category,
            city,
            vehicleImages: images,
            registrationNumber: registrationNumber,
            owner: {
                _id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                city: user.city,
            },
        });
       
        await newCar.save();
        res.status(201).json({
            message: 'Car added successfully',
        });
    } catch (error) {
        if (req.files && req.files.length > 0) {
            try {
              const deleteParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Delete: {
                  Objects: req.files.map(file => ({ Key: file.key })),
                  Quiet: false
                }
              };
          
              await s3Client.deleteObjects(deleteParams).promise();
              console.log('All uploaded images deleted from S3');
            } catch (cleanupError) {
              console.error('Failed to cleanup S3:', cleanupError);
            }
          }
          
          if (err.name === 'ValidationError') {
            return res.status(400).json({
              error: 'Validation Error',
              details: Object.values(err.errors).map(err => err.message)
            });
          }
          console.log(`Error adding message: ${err}`);
          return res.status(500).json({ message: "Internal server error" });          
    }
};

/**
 * Retrieves all approved vehicles with optional filtering
 * 
 * @async
 * @function getAllCarController
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters for filtering
 * @param {string} [req.query.search] - Search term for vehicle name, company, or model year
 * @param {string} [req.query.priceRange] - Price range in format 'min-max'
 * @param {string} [req.query.city] - City filter
 * @param {string} [req.query.category] - Vehicle category filter
 * @param {number} [req.query.limit=6] - Number of results to return
 * @param {number} [req.query.skip=0] - Number of results to skip (pagination)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with filtered vehicles or error
 * @description
 * Retrieves approved vehicles using aggregation pipeline with text search,
 * filtering by price range, city, category, and pagination support.
 */
export const getAllCarController = async (req, res) => {
    let { search = '', priceRange, city, category, limit = 6, skip = 0 } = req.query;
    skip = parseInt(skip);
    limit = parseInt(limit);

    if (priceRange === 'undefined') priceRange = false;
    if (city === 'undefined') city = false;
    if (category === 'undefined') category = false;

    //  Create a unique cache key based on the query params
    const cacheKey = `cars:${search}:${priceRange}:${city}:${category}:${limit}:${skip}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }

    try {
        const aggregationPipeline = [];

        
        let matchConditions = {
            status: 'approved',
            deleted: false
        };

        
        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split('-').map(Number);
            matchConditions.price = { $gte: minPrice, $lte: maxPrice };
        }

        
        if (city) {
            matchConditions.city = city;
        }

        
        if (category) {
            matchConditions.category = category;
        }

        
        if (search?.trim()) {
            aggregationPipeline.push({
                $search: {
                    index: "vehicleSearchIndex",
                    text: {
                        query: search,
                        path: ["company", "modelYear", "name"],
                        fuzzy: {},
                    },
                },
            });
        }

        
        aggregationPipeline.push({ $match: matchConditions });

        
        aggregationPipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        );

        const cars = await Vehicle.aggregate(aggregationPipeline);
        await setCachedData(cacheKey, cars);
        res.status(200).json(cars);
    } catch (err) {
        console.error(`Error in the getAllCarController: ${err.message}`);
        res.status(500).json({ message: `Error in the getAllCarController: ${err.message}` });
    }
};

/**
 * Retrieves vehicles filtered by status
 * 
 * @async
 * @function getVehicleByStatus
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.statusValue - Status to filter vehicles by (e.g., 'approved', 'pending', 'rejected')
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with filtered vehicles or error
 * @description
 * Fetches all vehicles matching the provided status value.
 */
export const getVehicleByStatus = async(req, res)=>{
    const {statusValue} = req.body;
    if(!statusValue){
        return res.status(400).json({message: 'statusValue is required'});
    }
    try{
        const cars = await Vehicle.find({status : statusValue});
        res.status(200).json(cars);
    }catch(err){
         console.log(`error in the getVehicleByStatus ${err.message}`);
         res.status(500).json({message: `error in the getVehicleByStatus ${err.message}`});
    }
}

/**
 * Changes a vehicle's status and updates owner's seller status if required
 * 
 * @async
 * @function toggleVehicleStatusController
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.vehicleStatus - New status for the vehicle
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - Vehicle ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 * @description
 * Updates a vehicle's status. If the status is changed to 'approved',
 * also updates the vehicle owner's status to 'seller'.
 */
export const toggleVehicleStatusController = async (req, res) => {
    const { vehicleStatus } = req.body;
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({message: 'Vehicle not found'});
        }
        
        const ownerId = vehicle.owner._id;
        
        // Update vehicle status
        await Vehicle.updateOne({'_id': req.params.id}, { status: vehicleStatus });
        
        if(vehicleStatus === 'approved') {
            // Update user to be a seller
            const owner = await User.findById(ownerId);
            // Send congratulation email to the seller for becoming a seller if he is adding the vehicle for the first time
            if(owner.isSeller === false){
                sendCongratulationEmail({ email : vehicle.owner.email, company: vehicle.company, name: vehicle.name, modelYear: vehicle.modelYear})
                .catch((err) => {
                    console.error(`Error sending approval email: ${err.message}`);
                });
                await User.updateOne({ _id: ownerId }, { isSeller: true });
            }
            
        } else if(vehicleStatus === 'rejected') {
            // Send rejection email to the seller for not becoming a seller
            sendCarRejectionEmail({
                email: vehicle.owner.email,
                seller: vehicle.owner,
                vehicle: vehicle
            }).catch((err) => {
                console.error(`Error sending rejection email: ${err.message}`);
            });
        }
        
        // Always return success response even if email fails
        res.status(200).json({
            message: vehicleStatus === 'approved' ? 'Car approved successfully' : 'Car status updated successfully',
        });
    } catch (err) {
        console.error(`Error in toggleVehicleStatus: ${err.message}`);
        res.status(500).json({ message: `Error in toggleVehicleStatus: ${err.message}` });
    }
}

/**
 * Updates a vehicle's price
 * 
 * @async
 * @function updateVehicleController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - Vehicle ID
 * @param {Object} req.body - Request body
 * @param {number} req.body.price - New price for the vehicle
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 * @description
 * Updates a vehicle's price after validating the price range.
 * Price must be between 500 and 10000.
 */
export const updateVehicleController = async (req, res)=>{
     const{ id }= req.params;
     const {price} = req.body;
     
        try{
            await Vehicle.updateOne(
                { _id: id }, 
                { price: price } 
            );
            
            res.status(200).json({ message: 'Car updated successfully' });
        }catch(err){
            console.log(`error in the updateCarController ${err.message}`);
            res.status(500).json({message: `error in the updateCarController ${err.message}`});
        }
}

/**
 * Retrieves a specific vehicle by ID
 * 
 * @async
 * @function getVehicleByIdController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - Vehicle ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with vehicle data or error
 * @description
 * Fetches a single vehicle by its ID after validating the ID format.
 */
export const getVehicleByIdController = async (req, res) => {
    const {id} = req.params;

    // implementing redis caching for the vehicle 
    const cacheKey = `vehicle:${id}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return res.status(200).json(cachedData);
    }
    try{
      
        const car = await Vehicle.findById(id).select('-registrationNumber');
       // cache the data 
        await setCachedData(cacheKey, car);
       return res.status(200).json(car);

    }catch(err){
        console.log(`error in the get vehicle controller ${err}`);
        return res.status(500).json({message: `error in the get vehicle controller ${err}`});
    }
}

/**
 * Retrieves all vehicles belonging to a user with optional status filtering
 * 
 * @async
 * @function getAllCarsByUser
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.carStatus='all'] - Status filter for vehicles
 * @param {number} [req.query.skip=0] - Number of results to skip (pagination)
 * @param {number} [req.query.limit=5] - Number of results to return
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user's vehicles or error
 * @description
 * Retrieves vehicles owned by the authenticated user with optional
 * filtering by status and pagination support.
 */
export const getAllCarsByUser = async (req, res) => {

    const userId = req.user._id;
    const { carStatus, skip=0, limit=5, search='', fuelType='', category='', city='', priceRange='' } = req.query;
    try {
        const aggregationPipeline = [];

        // Add text search if search query exists
        if (search.trim()) {
            aggregationPipeline.push({
                $search: {
                    index: "vehicleSearchIndex",
                    text: {
                        query: search,
                        path: ["company", "modelYear", "name"],
                        fuzzy: {},
                    },
                },
            });
        }

        // Build the match query based on owner ID and optional status filter
        const matchQuery = { 'owner._id': new Types.ObjectId(String(userId)) };
        if (carStatus !== 'all') {
            matchQuery.status = carStatus;
        }
        if(req.params.userId){
            matchQuery.status = 'approved';
        }
        if(fuelType){
            matchQuery.fuelType = fuelType;
        }
        if(category){
            matchQuery.category = category;
        }
        if(city){
            matchQuery.city = city;
        }
        if(priceRange){
            const [minPrice, maxPrice] = priceRange.split('-').map(Number);
            matchQuery.price = { $gte: minPrice, $lte: maxPrice };
        }
        
        // Create a copy of the pipeline for counting total documents
        const countPipeline = [...aggregationPipeline];
        countPipeline.push({ $match: matchQuery }, { $count: "total" });
        
        // Main pipeline for fetching cars with pagination
        aggregationPipeline.push(
            {
                $match: matchQuery
            },
            {
                $sort: { createdAt: -1 }  // Sort before pagination
            },
            {
                $skip: parseInt(skip)
            },
            {
                $limit: parseInt(limit)
            },
            {
                $project:{
                    registrationNumber: 0,
                }
            }
        );

        // Execute both pipelines
        const [cars, countResult] = await Promise.all([
            Vehicle.aggregate(aggregationPipeline),
            Vehicle.aggregate(countPipeline)
        ]);
        
        // Get total count from count pipeline result
        const totalDocs = countResult.length > 0 ? countResult[0].total : 0;
        
        return res.status(200).json({
            data: cars,
            totalDocs: totalDocs,
            page: parseInt(skip/limit) + 1,
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Get all cars by user error:', error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Retrieves vehicles with 'pending' status
 * 
 * @async
 * @function getPendingCars
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of results per page
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with pending vehicles or error
 * @description
 * Fetches all vehicles with 'pending' status, sorted and paginated
 * according to the provided parameters.
 */
export const getPendingCars = async (req, res) => {
   let { page=1, limit=10 } = req.query;
   // Parse parameters as integers to avoid MongoDB "Expected a number" error
   page = parseInt(page);
   limit = parseInt(limit);
   const sort = { createdAt: -1 };
   
    try {
        const aggregationPipeline = [
            { $match: { status: 'pending' } },
            { $sort: sort },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]
        const cars = await Vehicle.aggregate(aggregationPipeline);
        
        // Count total documents for pagination metadata
        const totalCount = await Vehicle.countDocuments({ status: 'pending' });
        
        res.status(200).json({
            cars,
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit)
            }
        });
      
    } catch (error) {
        console.error('Get pending cars error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Toggles a vehicle's listing status (deleted flag)
 * 
 * @async
 * @function listUnlistCarController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.vehicleId - Vehicle ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message and updated vehicle or error
 * @description
 * Toggles the 'deleted' flag of a vehicle to list or unlist it.
 * This is a soft delete mechanism that maintains the record but
 * removes it from public search results.
 */
export const listUnlistCarController = async (req, res)=>{
    const {vehicleId} = req.params;
    try{
        const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, {deleted: !deleted});
        res.status(200).json({message: 'Car updated successfully', vehicle});
    }catch(err){
        console.log(`error in the listUnlistCarController ${err.message}`);
        res.status(500).json({message: `error in the listUnlistCarController ${err.message}`});
    }
}

/**
 * Retrieves cars with bids
 * 
 * @async
 * @function getCarsWithBids
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with cars and bids or error
 * @description
 * Retrieves cars with bids for the authenticated user.
 */
export const getCarsWithBids = async(req, res)=>{
    const ownerId = req.user._id;
  try{
    const aggregationPipeline = [
        {
            $match : {
                'owner._id' : ownerId,
                status: 'pending',
                startDate:{
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)), // making sure user dont see the past bids that cant be accepted
                }
                
            }
        },
        {
            $group : {
                _id : '$vehicle._id',
                vehicle : { $first : '$vehicle'}
            }
        }
    ]
    const cars = await Bidding.aggregate(aggregationPipeline);
    return res.status(200).json(cars);
  }catch(err){
    console.log(`error in the getCarWithBids ${err.message}`);
    return res.status(500).json({message: `error in the getCarWithBids ${err.message}`});
  }
}