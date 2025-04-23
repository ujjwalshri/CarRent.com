angular.module('myApp').controller('bookingsHistoryCtrl', function($scope, BiddingFactory, ToastService, BiddingService, $state, $window) {
    // Initialize scope variables
    $scope.bookings = [];
    $scope.isLoading = false;
    $scope.startDate = '';
    $scope.Math = $window.Math;
    
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
     * Handle page change events
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
});