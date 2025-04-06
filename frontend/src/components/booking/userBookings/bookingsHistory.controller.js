angular.module('myApp').controller('bookingsHistoryCtrl', function($scope, BiddingFactory, ToastService, BiddingService, $state) {
    $scope.bookings = []; // array to hold all the boooking histories
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 6; // setting the items per page to 5
    $scope.isLoading = false; // setting the isLoading to false
    $scope.hasMoreData = true; // setting the hasMoreData to true
    $scope.startDate = ''; // setting the startDate to empty string

    // Initialize sorting
    $scope.selectedSort = {
        field: 'createdAt',
        order: -1,
        label: 'Latest First'
    };

    //  init to initialize the page data 
    $scope.init = ()=>{
        fetchBookingHistory();
    }
   /**
    * 
    * @param {*} field 
    * @param {*} order 
    * @param {*} label 
    * @description function to apply sorting to the page
    */
    $scope.applySorting = function(field, order, label) {
        $scope.selectedSort = {
            field: field,
            order: order,
            label: label
        };
        // Reset pagination and reload data
        $scope.bookings = [];
        $scope.currentPage = 1;
        $scope.hasMoreData = true;
        fetchBookingHistory();
    };

    /** 
    function to fetch all the bookings
    @{params} none
    @{returns} none
    */
    function fetchBookingHistory() {
        if ($scope.isLoading) return;
        
        $scope.isLoading = true;
        console.log('Fetching with sort:', $scope.selectedSort);
        
        // Create sort object
        const sortObj = {};
        sortObj[$scope.selectedSort.field] = $scope.selectedSort.order;
        
        const params = {
            page: $scope.currentPage,
            limit: $scope.itemsPerPage,
            startDate: $scope.startDate || undefined,
            sort: sortObj
        };

        BiddingService.getUserBookingsHistory(params)
            .then((response) => {
                if ($scope.currentPage === 1) {
                    $scope.bookings = response.bookings.map(booking => BiddingFactory.createBid(booking, false));
                } else {
                    $scope.bookings = $scope.bookings.concat(
                        response.bookings.map(booking => BiddingFactory.createBid(booking, false))
                    );
                }
                
                $scope.hasMoreData = response.totalDocs > $scope.bookings.length;
                console.log('Bookings loaded:', $scope.bookings.length, 'Total:', response.totalDocs);
            })
            .catch((err) => {
                ToastService.error(`Error fetching bookings: ${err}`);
            })
            .finally(() => {
                $scope.isLoading = false;
            });
    }
    // function to change the page
    $scope.pageChanged = function() {
        if (!$scope.isLoading && $scope.hasMoreData) {
            $scope.currentPage++;
            fetchBookingHistory();
        }
    };
    /*
    function to navigate to the single car page
    @params carId
    @returns none
    */
    $scope.navigateToSingleCarPage = function(carId){
        $state.go('singleCar', {id: carId});
    }
});