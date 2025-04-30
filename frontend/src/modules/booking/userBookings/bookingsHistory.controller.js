angular.module('myApp').controller('bookingsHistoryCtrl', function($scope, BiddingFactory, ToastService, BiddingService, $state, $window, $uibModal) {
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
        itemsPerPage: 6,
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
     * Fetch booking history with current pagination and sorting
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
                $scope.bookings = response.bookings.map(booking => BiddingFactory.createBid(booking, false));
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

    /**
     * Open review modal for a booking
     * @param {Object} booking - Booking object
     */
    $scope.openModal = function(booking) {
        const modalInstance = $uibModal.open({
            templateUrl: 'reviewModal.html',
            controller: function($scope, $uibModalInstance, booking, CarService, Review, ToastService) {
                $scope.booking = booking;
                $scope.isLoading = false;
                $scope.review = {
                    rating: "",
                    newReview: ""
                };

                $scope.close = function() {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.addReview = function() {
                    if (!$scope.booking) {
                        ToastService.error("No booking selected for review");
                        return;
                    }

                    const carId = $scope.booking.vehicle._id;
                    const bookingId = $scope.booking._id;
                    const review = {
                        rating: parseInt($scope.review.rating),
                        review: $scope.review.newReview.trim()
                    };

                    try {
                        const reviewData = Review.createValidatedReview(review);
                        $scope.isLoading = true;

                        CarService.addReview(carId, reviewData, bookingId)
                            .then(() => {
                                ToastService.success("Review added successfully");
                                $uibModalInstance.close();
                            })
                            .catch((err) => {
                                ToastService.error(err.message || "Error adding review");
                            })
                            .finally(() => {
                                $scope.isLoading = false;
                            });
                    } catch (error) {
                        ToastService.error(error.message || "Invalid review data");
                    }
                };
            },
            resolve: {
                booking: function() {
                    return booking;
                }
            }
        });

        modalInstance.result.then(function() {
            // Refresh the bookings list after review is submitted
            fetchBookingHistory();
        });
    };
});