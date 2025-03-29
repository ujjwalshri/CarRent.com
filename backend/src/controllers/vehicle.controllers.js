import User from "../models/user.model.js";
import Vehicle from "../models/vehicle.model.js"; 
import { createCarValidation } from "../validation/car.validation.js";
import {Types} from 'mongoose';

/*
@description: Add a new car to the database
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
/*
@description: function to get all the approved cars from the database
*/
export const getAllCarController = async (req, res) => {
    let { search = '', priceRange, city, category, limit = 6, skip = 0 } = req.query;
    skip = parseInt(skip);
    console.log('skip', skip);
    if (priceRange === 'undefined') priceRange = false;
    if (city === 'undefined') city = undefined;
    if (category === 'undefined') category = undefined;

    try {
        const aggregationPipeline = [];

       
        if (search.trim()) {
            aggregationPipeline.push({
                $search: {
                    index: "vehicleSearchIndex",
                    text: {
                        query: search,
                        path: ["company", "modelYear", "name"],
                        fuzzy: {
                           
                        },
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
            aggregationPipeline.push({
                $match: {
                    city: city,
                },
            });
        }

       
        if (category) {
            aggregationPipeline.push({
                $match: {
                    category: category,
                },
            });
        }

        
        aggregationPipeline.push(
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) }
        );

       
        const cars = await Vehicle.aggregate(aggregationPipeline);

       
        res.status(200).json(cars);
    } catch (err) {
        console.error(`Error in the getAllCarController: ${err.message}`);
        res.status(500).json({ message: `Error in the getAllCarController: ${err.message}` });
    }
};
/*
@description: function to get all the cars from the database
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
/*
@description: function to change vehicle status
*/
export const toggleVehicleStatusController = async (req, res) => {
    const { vehicleStatus } = req.body;
    try {
       if(!Types.ObjectId.isValid(req.params.id)){
           return res.status(404).json({message: 'Invalid vehicle id'});
         }
        const vehicle = await Vehicle.findById(req.params.id);
        const ownerId = vehicle.owner._id;

        const car = await Vehicle.updateOne({'_id': req.params.id}, { status: vehicleStatus });
        if(vehicleStatus === 'approved' ){
            // then make user a seller on the platform
           const user = await User.updateOne( { _id: ownerId }, { isSeller: true });
        }
        res.status(200).json({
            message: 'Car approved successfully',
        });

    } catch (err) {
        console.log(`error in the approveVehicle ${err.message}`);
        res.status(500).json({ message: `error in the approveVehicle Controller ${err.message}` });
    }
}
/*
@description: function to update a car from the database
*/
export const updateVehicleController = async (req, res)=>{
     const{ id }= req.params;
     console.log(id);
     const {price} = req.body;
     if(price<0 || price<500 || price>10000){
            return res.status(400).json({message: 'Invalid price range'});
     }
     console.log(req.body);
        try{
            if(!Types.ObjectId.isValid(id)){
                return res.status(404).json({message: 'Invalid vehicle id'});
            }
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
/*
@description: function to get a car at particular carId
*/
export const getVehicleByIdController = async (req, res) => {
    const {id} = req.params;
    try{
        if(!Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid vehicle id'});
        }
        const car = await Vehicle.findById(id);
        res.status(200).json(car);

    }catch(err){
        console.log(`error in the get vehicle controller ${err}`);
        res.status(500).json({message: `error in the get vehicle controller ${err}`});
    }
}

/*
@description: function to getAllCarsByUser from the database
*/
export const getAllCarsByUser = async (req, res) => {
    const { carStatus, skip=0, limit=5 } = req.query;
    console.log(typeof(carStatus));
    
    try {

        const query = { 'owner._id': req.user._id };

        if (carStatus !== 'all') {
            query.status = carStatus;
        }
        
        const cars = await Vehicle.aggregate([
           
            {
                $match: query
            },
          
            {
                $skip: parseInt(skip)
            },

            {
                $limit: parseInt(limit)
            }
        ]);
        console.log([
           
            {
                $match: query
            },
          
            {
                $skip: parseInt(skip)
            },

            {
                $limit: parseInt(limit)
            }
        ]);
     
        return res.status(200).json(cars);
    } catch (error) {
        console.error('Get all cars by user error:', error);
        return res.status(500).json({ error: error.message });
    }
};

/*
@description: function to get pending cars from the database
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