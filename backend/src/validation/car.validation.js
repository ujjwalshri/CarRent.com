import joi from 'joi';

export const createCarValidation = joi.object({
    name: joi.string().min(2).max(50).required(),
    company: joi.string().min(2).max(50).required(),
    location: joi.string().min(2).max(50).required(),
    modelYear: joi.number().min(1886).max(new Date().getFullYear()).required(),
    price: joi.number().min(0).required(),
    color: joi.string().min(3).max(20).required(),
    mileage: joi.number().min(0).required(),
    fuelType: joi.string().valid("petrol", "diesel", "electric").required(),
    category: joi.string().valid("SUV", "Sedan").required(),
    deleted: joi.boolean().default(false),
    status: joi.string().valid("pending", "approved", "rejected").default("pending"),
    city: joi.string().min(2).max(50).required(),
    owner: joi.object().keys({
        username: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        firstName: joi.string().min(2).max(30).required(),
        lastName: joi.string().min(2).max(30).required(),
        city: joi.string().min(2).max(50).required(),
        adhaar: joi.string().regex(/^\d{12}$/).required() // Aadhaar must be a 12-digit number
    }).required(),
});