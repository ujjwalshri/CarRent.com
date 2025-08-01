import joi from 'joi';

// function to validate the car data before saving it into the database
export const createCarValidation = joi.object({
    name: joi.string().min(2).max(50).required(),
    company: joi.string().min(2).max(50).required(),
    modelYear: joi.number().min(1886).max(new Date().getFullYear()+1).required(),
    price: joi.number().min(0).required(),
    color: joi.string().min(3).max(20).required(),
    mileage: joi.number().min(0).max(1000).required(),
    fuelType: joi.string().required(),
    category: joi.object().required(),
    deleted: joi.boolean().default(false),
    status: joi.string().valid("pending", "approved", "rejected").default("pending"),
    city: joi.string().min(2).max(50).required(),
    vehicleImages: joi.array().min(1).max(5).required(),
    registrationNumber: joi.string().min(2).max(50).required(),
    owner: joi.object().keys({
        username: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        firstName: joi.string().min(2).max(30).required(),
        lastName: joi.string().min(2).max(30).required(),
    }).required(),
});

