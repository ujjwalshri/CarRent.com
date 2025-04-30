/**
 * Review Factory
 * @description Factory for creating and managing review objects in the car rental application
 * Review objects represent user feedback for vehicle rentals, including ratings and text reviews
 */
angular.module('myApp').factory('Review', function() { 
    /**
     * Review Constructor
     * @constructor
     * @param {Object} reviewData - The data to create a review
     * @param {string} [reviewData._id] - MongoDB ObjectId for the review
     * @param {Object} [reviewData.vehicle] - The vehicle being reviewed
     * @param {Object} [reviewData.reviewer] - The user submitting the review
     * @param {number} [reviewData.rating] - Rating from 1-5
     * @param {string} [reviewData.review] - Text content of the review
     */
    function Review(reviewData = {}) {
        // Initialize review properties with defaults if not provided
        this._id = reviewData._id || null;
        this.vehicle = reviewData.vehicle || {};
        this.reviewer = reviewData.reviewer || {};
        this.rating = parseFloat(reviewData.rating) || 0;
        this.review = (reviewData.review || '').trim();
    }

    /**
     * Creates a new Review instance
     * @static
     * @param {Object} reviewData - Data for creating the review
     * @returns {Review} A new Review instance
     */
    Review.createReview = function(reviewData) {
        return new Review(reviewData);
    };

    /**
     * Validates the current review instance
     * @method
     * @returns {Object} Validation result
     * @returns {boolean} result.status - Whether the review is valid
     * @returns {string} result.message - Validation message or error
     */
    Review.prototype.isValid = function() {
     
        // Check review length (max 150 characters)
        if (this.review.trim().length > 150) {
            return {
                status: false,
                message: "Review cannot be more than 150 characters"
            };
        }

        // Validate rating (must be number between 1-5)
        if (isNaN(this.rating) || this.rating < 1 || this.rating > 5) {
            return {
                status: false,
                message: "Rating must be between 1 and 5"
            };
        }

        // Review is valid
        return {
            status: true,
            message: "Review is valid"
        };
    };

    /**
     * Checks if a booking has been reviewed
     * @static
     * @param {Object} booking - The booking to check
     * @returns {boolean} True if the booking has been reviewed
     */
    Review.isReviewed = function(booking) {
        return booking.status === "reviewed";
    };

    /**
     * Creates and validates a review in one step
     * @static
     * @param {Object} reviewData - Data for creating the review
     * @throws {Error} If the review is invalid
     * @returns {Review} A validated Review instance
     */
    Review.createValidatedReview = function(reviewData) {
        const review = new Review(reviewData);
        const validation = review.isValid();
        
        if (!validation.status) {
            throw new Error(validation.message);
        }
        
        return review;
    };

    // Return the Review constructor
    return Review;
});