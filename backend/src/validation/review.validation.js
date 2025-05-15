import Joi from "joi";

export const addReviewValidation = Joi.object({
    rating: Joi.number()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.base': 'Rating must be a number',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot be more than 5',
            'any.required': 'Rating is required'
        }),
    review: Joi.string()
        .allow('')  
        .optional()
        .max(500)
        .trim()
        .messages({
            'string.max': 'Review cannot exceed 500 characters'
        }),
    owner: Joi.object({
        _id: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
        username: Joi.string().min(3).max(30).required()
    }).required(),
    vehicle: Joi.object({
        _id: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
        name: Joi.string().min(3).max(30).required(),
        company: Joi.string().min(3).max(30).required(),
        modelYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
        city: Joi.string().min(3).max(30).required(),
        color: Joi.string().min(3).max(30).required(),
        mileage: Joi.number().positive().required(),
        price: Joi.number().positive().required(),
        fuelType: Joi.string().valid('Petrol', 'Diesel', 'Electric', 'Hybrid').required()
    }).required(),
    reviewer: Joi.object({
        _id: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
        username: Joi.string().min(3).max(30).required()
    }).required(),
    booking: Joi.object({
        _id: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
        amount: Joi.number().positive().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().min(Joi.ref('startDate')).required(),
        startOdometerValue: Joi.number().min(0).required(),
        endOdometerValue: Joi.number().min(Joi.ref('startOdometerValue')).required()
    }).required()
});