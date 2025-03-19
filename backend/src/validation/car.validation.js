import joi from 'joi';

function validateCar(car){
    console.log(car);
    const validateCarSchema = joi.object({
        name: joi.string().min(3).max(30).required(),
        company: joi.string().min(3).max(30).required(),
        modelYear: joi.number().min(1900).max(2025).required(),
        price: joi.number().min(500).max(10000).required(),
        color: joi.string().min(3).max(30).required(),
        mileage: joi.number().min(0).max(1000000).required(),
        fuelType: joi.string().min(3).max(30).required(),
        category: joi.string().min(3).max(30).required(),
        city: joi.string().min(3).max(30).required(),
    });
    return validateCarSchema.validate(car);
}

export default validateCar;