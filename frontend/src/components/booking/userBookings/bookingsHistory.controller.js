angular.module('myApp').controller('bookingsHistoryCtrl', function($scope, IDB, BiddingFactory, ToastService, Review, BackButton, BiddingService, $state) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    $scope.bookings = []; // array to hold all the boooking histories
    
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 6; // setting the items per page to 5
    $scope.isLoading = false; // setting the isLoading to false
    $scope.hasMoreData = true; // setting the hasMoreData to true
    $scope.startDate = ''; // setting the startDate to empty string

     //  init to initialize the page data 
    $scope.init = ()=>{
        fetchBookingHistory();
    }
    /** 
    function to fetch all the bookings
    @{params} none
    @{returns} none
    */
    function fetchBookingHistory() {
        console.log('search' , $scope.search);
        $scope.isLoading = true;
        const params = {
            page: $scope.currentPage,
            limit: $scope.itemsPerPage,
            startDate: $scope.startDate || undefined,
        }
        BiddingService.getUserBookingsHistory(params).then((bookings)=>{
            $scope.bookings = $scope.bookings.concat(bookings.bookings.map((booking)=>{
                return BiddingFactory.createBid(booking, false);
            }));
            console.log($scope.bookings);
            console.log(bookings.totalDocs);
            $scope.hasMoreData = bookings.totalDocs > $scope.bookings.length;
            $scope.totalItems = Math.ceil(bookings.totalDocs/$scope.itemsPerPage);
            console.log($scope.totalItems);
        }).catch((err)=>{
            ToastService.error(`Error fetching bookings ${err}`);
        }).finally(()=>{
            $scope.isLoading = false;
        })
    }
    // function to change the page
    $scope.pageChanged = function() {
        $scope.currentPage = $scope.currentPage + 1;
        fetchBookingHistory();
    };

  
    

});