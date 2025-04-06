import joi from 'joi';
/* function to validate a user 
    @params user
    @returns object
*/
function validateUser(user){
    console.log("validate user mai " , user);
    const validateUserSchema = joi.object({
        username: joi.string().min(3).max(30).required(),
        email:joi.string()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) // Custom regex for email validation
        .required(),
        password: joi.string().min(6).max(30).required(),
        firstName: joi.string().min(3).max(30).required(),
        lastName: joi.string().min(3).max(30).required(),
        city: joi.string().min(3).max(30).required(),
        adhaar: joi.required(),
    });
    console.log(validateUserSchema.validate(user));
    return validateUserSchema.validate(user);
}

export default validateUser;