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
        .min(2)
        .max(500)
        .required()
        .trim()
        .messages({
            'string.empty': 'Review cannot be empty',
            'string.min': 'Review must be at least 10 characters long',
            'string.max': 'Review cannot exceed 500 characters',
            'any.required': 'Review text is required'
        }),
    vehicle: Joi.object().unknown(true),
    reviewer: Joi.object().unknown(true)
}).unknown(true);