import User from "../models/user.model.js";
import Vehicle from "../models/vehicle.model.js"; 
import { s3Client } from "../config/s3.connection.js";
import {Types} from 'mongoose';


export const addCarController = async (req, res) => {
    const {
        name, company, modelYear, price, color, mileage, fuelType, category, city
    } = req.body;
   
    
    try {
       
        const user = await User.findById(req.user._id);
       
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const images = req.files.map(file => ({
            url: file.location,
            key: file.key,
            name: file.originalname,
            uploadedAt: new Date()
        }));

        const newCar = new Vehicle({
            name,
            company,
            modelYear,
            price,
            color,
            mileage,
            fuelType,
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

        const savedCar = await newCar.save();


        res.status(201).json({
            message: 'Car added successfully',
            car: savedCar
        });
    } catch (error) {
        console.error('Add car error:', error);
        if (req.files) {
            try {
                await Promise.all(req.files.map(file => s3Client.deleteObject({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: file.key
                }).promise()));
            } catch (cleanupError) {
                console.error('Failed to cleanup S3:', cleanupError);
            }
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation Error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            error: 'Failed to add car',
            message: error.message
        });
    }
};

export const getAllCarController = async(req, res)=>{
    try{
        const cars = await Vehicle.find({status: 'approved'});
        console.log(cars);
        if(!cars){
            return res.status(404).json({message: 'No cars found'});
        }
        res.status(200).json(cars);
    }catch(err){
       console.log(`error in the getAllCarController ${err.message}`);
       res.status(500).json({message: `error in the getAllCarController ${err.message}`});
    }
}


export const getVehicleByStatus = async(req, res)=>{
    const {statusValue} = req.body;
    try{
        const cars = await Vehicle.find({status : statusValue});
        if(!cars){
            return res.status(404).json({message: 'No cars found'});
        }
        res.status(200).json(cars);
    }catch(err){
         console.log(`error in the getVehicleByStatus ${err.message}`);
         res.status(500).json({message: `error in the getVehicleByStatus ${err.message}`});
    }
}

export const toggleVehicleStatusController = async (req, res) => {
    const { vehicleStatus } = req.body;
    try {
       if(!Types.ObjectId.isValid(req.params.id)){
           return res.status(404).json({message: 'Invalid vehicle id'});
         }
        const car = await Vehicle.findById(req.params.id);
        console.log(car);
        if (!car) {
            return res.status(404).json({ message: 'Error retrieving the car' });
        }
        car.status = vehicleStatus;
        console.log("updated car", car);
        const updatedCar = await car.save();
        console.log("updated car after saving", updatedCar);
        res.status(200).json({
            message: 'Car approved successfully',
            car: updatedCar
        });

    } catch (err) {
        console.log(`error in the approveVehicle ${err.message}`);
        res.status(500).json({ message: `error in the approveVehicle Controller ${err.message}` });
    }
}

export const updateVehicleController = async (req, res)=>{
     const{ id }= req.params;
     console.log(id);
     const {price, mileage} = req.body;
     console.log(req.body);
        try{
            if(!Types.ObjectId.isValid(id)){
                return res.status(404).json({message: 'Invalid vehicle id'});
            }
            const car = await Vehicle.findById(id);
            if(!car){
                return res.status(404).json({message: 'Car not found'});
            }
            car.mileage = mileage;
            car.price = price;
            const updatedCar = await car.save();
            res.status(200).json({message: 'Car updated successfully', car: updatedCar});
        }catch(err){
            console.log(`error in the updateCarController ${err.message}`);
            res.status(500).json({message: `error in the updateCarController ${err.message}`});
        }
}

export const getVehicleByIdController = async (req, res) => {
    const {id} = req.params;
    try{
        if(!Types.ObjectId.isValid(id)){
            return res.status(404).json({message: 'Invalid vehicle id'});
        }
        const car = await Vehicle.findById(id);
        if(!car){
            return res.status(404).json({message: 'Car not found'});
        }
        res.status(200).json(car);

    }catch(err){
        console.log(`error in the get vehicle controller ${err}`);
        res.status(500).json({message: `error in the get vehicle controller ${err}`});
    }
}
