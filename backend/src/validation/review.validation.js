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
        .allow('')  // Allow empty strings
        .optional() // Make the field optional
        .max(500)
        .trim()
        .messages({
            'string.max': 'Review cannot exceed 500 characters'
        }),
    owner: Joi.object().unknown(true),
    vehicle: Joi.object().unknown(true),
    reviewer: Joi.object().unknown(true)
}).unknown(true);