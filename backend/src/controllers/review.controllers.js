
import Review from "../models/review.model.js";
import Vehicle from "../models/vehicle.model.js";

/*
    @description function to get all the reviews at a particular carId
*/
export const getAllReviewsAtCarIdController = async (req, res)=>{
    const {page=1, limit=2} = req.query;
    console.log(page, limit);
    const {id} = req.params;
    console.log(id);
    try{
        const reviews = await Review.find({'vehicle._id': id});
        console.log(reviews);
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
   try{
    const {id}  = req.params;// gettingt the carId from the req params
    const {rating, review} = req.body; // getting the rating and review from the req body
    const {_id, username, email, firstName, lastName, city} = req.user; // getting the user details from the req.user
    const reviewer = {_id, username, email, firstName, lastName, city}; // creating the reviewer object
    const vehicle = await Vehicle.findById(id); // finding the vehicle with the given id

   const reviewData = new Review({ // creating the review object
       rating,
       review,
       vehicle,
       reviewer
   });

   const saved =  await reviewData.save(); // saving the review
   if(!saved){
       return res.status(400).json({error: "Error in saving the review"});
    }
    return res.status(201).json({reviewData}); // returning the review
   }catch(err){
         console.log(`error in the addReviewController ${err.message}`);
         res.status(500).json({error: `error in the addReviewController ${err.message}`});
   }
}

