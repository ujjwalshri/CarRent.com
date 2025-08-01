import Joi from 'joi';
/* 
function to validate the bidding data before saving it into the database
    @params data
    @returns object
*/
const validateBiddingData = (data) => {
    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        startDate: Joi.date().required(),
        startOdometerValue: Joi.number(),
        endOdometerValue: Joi.number().min(Joi.ref('startOdometerValue')),  
        endDate: Joi.date().min(Joi.ref('startDate')).required(),
        owner: Joi.object({
            _id: Joi.required(),
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
        }).required(),
        vehicle: Joi.object({
            _id: Joi.required(),
            name: Joi.string().required(),
            company: Joi.string().required(),
            modelYear: Joi.number().integer().min(1886).required(), // Cars were invented in 1886
            price: Joi.number().positive().required(),
            color: Joi.string().required(),
            mileage: Joi.number().positive().required(),
            fuelType: Joi.string().valid('Petrol', 'Diesel', 'Electric', 'Hybrid').required(),
            category: Joi.object().required(),
            status: Joi.string().valid('pending', 'approved').required(),
            city: Joi.string().required(),
            vehicleImage: Joi.object().required(),
        }).required(),
        status: Joi.string().valid('pending', 'approved', 'rejected', 'ended', 'reviewed'),
        selectedAddons: Joi.array().max(10).required(),
        platformFeePercentage: Joi.number().min(0).max(100).required(),
        taxes: Joi.array().max(20).required(),
        from: Joi.object({
            _id: Joi.required(),
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
        }).required(),
    });

    return schema.validate(data);
};

export default validateBiddingData;