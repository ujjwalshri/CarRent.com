angular.module('myApp').controller('bookingsHistoryCtrl', function($scope, BiddingFactory, ToastService, BiddingService, CarService, Review, $state, $window) {
    // Initialize scope variables
    $scope.bookings = [];
    $scope.isLoading = false;
    $scope.startDate = '';
    
    // Initialize search
    $scope.search = {
        searchQuery: ''
    };
    
    // Initialize pagination
    $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 2,
        totalItems: 0,
        maxSize: 5
    };

    // Initialize sorting
    $scope.selectedSort = {
        field: 'createdAt',
        order: -1,
        label: 'Latest First'
    };

    // Initialize controller
    $scope.init = () => {
        fetchBookingHistory();
    };

    // Handle search
    $scope.handleSearch = function() {
        $scope.pagination.currentPage = 1; // Reset to first page when searching
        fetchBookingHistory();
    };

    /**
     * Apply sorting and refresh data
     * @param {string} field - Field to sort by
     * @param {number} order - Sort order (1 or -1)
     * @param {string} label - Label for the sort option
     */
    $scope.applySorting = function(field, order, label) {
        $scope.selectedSort = {
            field: field,
            order: order,
            label: label
        };
        $scope.pagination.currentPage = 1; // Reset to first page when sorting changes
        fetchBookingHistory();
    };

    /**
     * Reset all filters and sorting to default values
     */
    $scope.resetFilters = function() {
        // Reset search query
        $scope.search.searchQuery = '';
        
        // Reset sorting to default (Latest First)
        $scope.selectedSort = {
            field: 'createdAt',
            order: -1,
            label: 'Latest First'
        };
        
        // Reset to first page
        $scope.pagination.currentPage = 1;
        
        // Re-fetch booking history with reset filters
        fetchBookingHistory();
        
    };

    // Initialize bookings with review property
    function initializeBookingWithReview(booking) {
        booking.review = {
            rating: "",
            newReview: ""
        };
        return booking;
    }

   /**
    * @description: this function will be called when the controller is loaded, fetches the bookings initially
    * @returns {Promise} - A promise that resolves when the bookings are fetched
    * @throws {Error} - Throws an error if fetching bookings fails
    */
    function fetchBookingHistory() {
        if ($scope.isLoading) return; // Prevent multiple simultaneous requests

        $scope.isLoading = true;
        const sortObj = {};
        sortObj[$scope.selectedSort.field] = $scope.selectedSort.order;
        const params = {
            page: $scope.pagination.currentPage,
            limit: $scope.pagination.itemsPerPage,
            startDate: $scope.startDate || undefined,
            sort: JSON.stringify(sortObj)
        };

        // Add search parameter if there's a search query
        if ($scope.search.searchQuery) {
            params.search = $scope.search.searchQuery;
        }

        BiddingService.getUserBookingsHistory(params)
            .then((response) => {
                $scope.bookings = response.bookings.map(booking => {
                    const bidObject = BiddingFactory.createBid(booking, false);
                    return initializeBookingWithReview(bidObject);
                });
                $scope.pagination.totalItems = response.totalDocs; // Update total items count
            })
            .catch((err) => {
                console.error('Error in getUserBookingsHistory:', err);
                ToastService.error(`Error fetching bookings: ${err}`);
            })
            .finally(() => {
                $scope.isLoading = false;
            });
    }
    
    /**
     * Fetch booking history with current pagination
     */
    $scope.pageChanged = function() {
        fetchBookingHistory();
    };
    
    /**
     * Navigate to single car page
     * @param {string} carId - ID of the car to view
     */
    $scope.navigateToSingleCarPage = function(carId) {
        $state.go('singleCar', {id: carId});
    };

    // Handle star rating selection for a specific booking
    $scope.setRating = function(rating, booking) {
        booking.review.rating = rating;
    };

    // Handle review submission for a specific booking
    $scope.addReview = function(booking) {
        if (!booking) {
            ToastService.error("No booking selected for review");
            return;
        }

        const carId = booking.vehicle._id;
        const bookingId = booking._id;
        const review = {
            rating: parseInt(booking.review.rating),
            review: booking.review.newReview.trim()
        };

        $scope.isLoading = true;
        const reviewData = Review.createValidatedReview(review);
        if (typeof reviewData === 'string') {
            ToastService.error(reviewData);
            $scope.isLoading = false;
            return;
        }

        CarService.addReview(carId, reviewData, bookingId)
            .then(() => {
                // Update booking status immediately to hide the form
                booking.status = 'reviewed';
                ToastService.success("Review added successfully");
                fetchBookingHistory(); // Refresh the list after review submission
            })
            .catch((err) => {
                ToastService.error(err.message || "Error adding review");
            })
            .finally(() => {
                $scope.isLoading = false;
            });
    };
});