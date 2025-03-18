import joi from 'joi';

function validateUser(user){
    console.log(user);
    const validateUserSchema = joi.object({
        username: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(30).required(),
        firstName: joi.string().min(3).max(30).required(),
        lastName: joi.string().min(3).max(30).required(),
        city: joi.string().min(3).max(30).required(),
        adhaar: joi.string().min(12).max(12).required()
    });
    console.log(validateUserSchema.validate(user));
    return validateUserSchema.validate(user);
}

export default validateUser;