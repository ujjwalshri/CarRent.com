/**
 * Vehicle Controllers
 * Handles all operations related to vehicle management
 * @module controllers/vehicle
 */
import User from "../models/user.model.js";
import Vehicle from "../models/vehicle.model.js"; 
import { createCarValidation } from "../validation/car.validation.js";
import { generateCongratulationMailToSeller } from "../utils/gen.mail.js";
import redisClient from "../config/redis.connection.js";
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
        name, company, modelYear, price, color, mileage, fuelType, category, city, location
    } = req.body;
    console.log(req.body);
    console.log(req.files);
    try {
        const user = await User.findById(req.user._id);
        const images = req.files.map(file => ({
            url: file.location,
            key: file.key,
            name: file.originalname,
            uploadedAt: new Date()
        }));

        const carData = {
            name, company, modelYear, price, color, mileage, fuelType,location, category, city, owner:{
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                city: user.city,
                adhaar: user.adhaar,
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
            owner: {
                _id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                city: user.city,
                adhaar: user.adhaar,
            },
        });
        if(user.isSeller ){ // if the user is already a seller then the set the car as approved initially
            newCar.status = 'approved';
        }

        const savedCar = await newCar.save(); 

        res.status(201).json({
            message: 'Car added successfully',
        });
    } catch (error) {
        console.error('Add car error:', error);
        res.status(500).json({ error: error.message });
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
    if (city === 'undefined') city = undefined;
    if (category === 'undefined') category = undefined;

    // 🔑 Create a unique cache key based on the query params
    const cacheKey = `cars:${search}:${priceRange}:${city}:${category}:${limit}:${skip}`;

    try {

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {

            return res.status(200).json(JSON.parse(cachedData));
        }


        const aggregationPipeline = [];

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

        aggregationPipeline.push({
            $match: {
                status: 'approved',
                deleted: false,
            },
        });

        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split('-').map(Number);
            aggregationPipeline.push({
                $match: {
                    price: { $gte: minPrice, $lte: maxPrice },
                },
            });
        }

        if (city) {
            aggregationPipeline.push({ $match: { city } });
        }

        if (category) {
            aggregationPipeline.push({ $match: { category } });
        }

        aggregationPipeline.push({$sort:{ createdAt: -1}},{ $skip: skip }, { $limit: limit });

        const cars = await Vehicle.aggregate(aggregationPipeline);
        await redisClient.setEx(cacheKey, 60, JSON.stringify(cars));
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
            // Get user data first
            const user = await User.findById(ownerId);
            if (!user) {
                return res.status(404).json({message: 'Vehicle owner not found'});
            }
            
            // Update user to be a seller
            await User.updateOne({ _id: ownerId }, { isSeller: true });
            
            // Send congratulation email to the seller for becoming a seller
            generateCongratulationMailToSeller(user.email, vehicle.company, vehicle.name, vehicle.modelYear);
        }
        
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
     if(price<500 || price>10000){
            return res.status(400).json({message: 'Invalid price range'});
     }

        try{
            if(!Types.ObjectId.isValid(id)){
                return res.status(404).json({message: 'Invalid vehicle id'});
            }
            await Vehicle.updateOne(
                { _id: id }, 
                { price: price } 
            );
            // Clear the cache for this vehicle
            const cacheKey = `vehicle:${id}`;
            await redisClient.del(cacheKey);
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
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
    }
    try{
        if(!Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid vehicle id'});
        }
        const car = await Vehicle.findById(id);

       // cache the data 
        await redisClient.setEx(cacheKey, 60, JSON.stringify(car));
        res.status(200).json(car);

    }catch(err){
        console.log(`error in the get vehicle controller ${err}`);
        res.status(500).json({message: `error in the get vehicle controller ${err}`});
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
    const { carStatus, skip=0, limit=5 } = req.query;

    // implementing redis caching 
    const cacheKey = `userCars:${req.user._id}:${carStatus}:${skip}:${limit}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {   

        return res.status(200).json(JSON.parse(cachedData));
    }
    try {
        // Build the query based on owner ID and optional status filter
        const query = { 'owner._id': req.user._id };

        if (carStatus !== 'all') {
            query.status = carStatus;
        }
        
        const cars = await Vehicle.aggregate([
            // Match stage - filter by query
            {
                $match: query
            },
            // Skip stage - for pagination
            {
                $skip: parseInt(skip)
            },
            // Limit stage - number of documents to return
            {
                $limit: parseInt(limit)
            }
        ]);
        console.log([
            // Match stage - filter by query
            {
                $match: query
            },
            // Skip stage - for pagination
            {
                $skip: parseInt(skip)
            },
            // Limit stage - number of documents to return
            {
                $limit: parseInt(limit)
            }
        ]);
        // Cache the result for 60 seconds
        await redisClient.setEx(cacheKey, 60, JSON.stringify(cars));
        return res.status(200).json(cars);
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
 * @param {Object} [req.query.sort={createdAt: -1}] - Sort criteria
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with pending vehicles or error
 * @description
 * Fetches all vehicles with 'pending' status, sorted and paginated
 * according to the provided parameters.
 */
export const getPendingCars = async (req, res) => {
   const  {page=1, limit=10, sort={createdAt: -1}}  = req.query;
    try {
        const aggregationPipeline = [
            { $match: { status: 'pending' } },
            { $sort: sort },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]
        const cars = await Vehicle.aggregate(aggregationPipeline);
        res.status(200).json(cars);
      
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
    console.log(vehicleId);
    try{
        const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, {deleted: !deleted});
        res.status(200).json({message: 'Car updated successfully', vehicle});
    }catch(err){
        console.log(`error in the listUnlistCarController ${err.message}`);
        res.status(500).json({message: `error in the listUnlistCarController ${err.message}`});
    }
}