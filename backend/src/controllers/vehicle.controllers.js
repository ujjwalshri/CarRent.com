import User from "../models/user.model.js";
import Vehicle from "../models/vehicle.model.js"; 
import { s3Client } from "../config/s3.connection.js";

export const addCarController = async (req, res) => {
    const {
        name, company, modelYear, price, color, mileage, fuelType, category, city
    } = req.body;
    console.log(req.body);

    try {
        console.log("kufbgagaoaasogfasiufasfgasgfasofsvddgda......");
        console.log(req.user);
        const user = await User.findById(req.user._id);
        console.log(user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const images = req.files.map(file => ({
            url: file.location,
            key: file.key,
            name: file.originalname,
            uploadedAt: new Date()
        }));

        console.log("ghihdgohioasdhgdsoighdsgdsag................. mai hun car object");
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
                isBlocked: user.isBlocked,
            },
        });
        console.log(newCar);
        const savedCar = await newCar.save();
        console.log('Saved Car:', savedCar);

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