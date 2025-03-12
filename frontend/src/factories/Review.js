angular.module('myApp').factory('Review', function() { 
    return {
        // function to check if a bidding is reviewed or not 
        isReviewed: function(booking){
            return booking.status ==="reviewed" ? true : false; // return true or false
        },
        // function to check if a review is valid or not
        isValidReview: function(review){
            if(!review.review || review.review.trim() === ""){ // check if the review is empty
                return {
                    status: false,
                    message: "Review cannot be empty"
                }
            } 
            if(review.review.trim().length > 150){ // checks if a review is more than 100 character
                return {
                    status: false,
                    message: "Review cannot be more than 100 characters"
                }
            }  
            if(!review.rating === NaN){ // checks if the rating is a number
                return {
                    status: false,
                    message: "Please enter a rating"
                }
            }
            return { // return true if the review is valid
                status: true,
                message: "Review is valid"
            }
        }
    }

});