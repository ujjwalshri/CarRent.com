
import Review from "../models/review.model.js";
import Vehicle from "../models/vehicle.model.js";

/*
    @description function to get all the reviews at a particular carId
*/
export const getAllReviewsAtCarIdController = async (req, res)=>{
    const {id} = req.params;
    try{
        const reviews = await Review.find({'vehicle._id': id});
        return res.status(200).json({reviews});
    }catch(err){
        console.log(`error in the getAllReviewsAtCarIdController ${err.message}`);
        res.status(500).json({error: `error in the getAllReviewsAtCarIdController ${err.message}`});
    }
}

/*
    @description function to Add a review to the database
*/
export const addReviewController = async (req, res)=>{ 
    const {id}  = req.params;
    const {rating, review} = req.body;
    
   try{
    const {_id, username, email, firstName, lastName, city} = req.user; 
    const reviewer = {_id, username, email, firstName, lastName, city}; 
    const vehicle = await Vehicle.findById(id);

   const reviewData = new Review({ 
       rating,
       review,
       vehicle,
       reviewer
   });

    await reviewData.save(); 
    return res.status(201).json({message: 'Review added successfully'}); 
   }catch(err){
         console.log(`error in the addReviewController ${err.message}`);
         res.status(500).json({error: `error in the addReviewController ${err.message}`});
   }
}

