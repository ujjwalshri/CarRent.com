angular.module('myApp').controller('bookingsHistoryCtrl', function($scope, IDB, Booking, ToastService, Review, BackButton, BiddingService) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    $scope.bookings = []; // array to hold all the boooking histories
    const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // getting the logged in user
    $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price from the booking factory
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 5; // setting the items per page to 5
    $scope.isLoading = false; // setting the isLoading to false
     //  init to initialize the page data 
    $scope.init = ()=>{
        fetchBookingHistory(); // initially fetching the booking history for the logged in user
    }
    $scope.startDate = '';
    /** 
    function to fetch all the bookings
    @{params} none
    @{returns} none
    */
    function fetchBookingHistory() {
        $scope.isLoading = true;
        BiddingService.getUserBookingsHistory().then((bookings)=>{
            $scope.bookings = bookings.bookings;
            console.log(bookings);
            console.log($scope.bookings);
        }).catch((err)=>{
            ToastService.error(`Error fetching bookings ${err}`);
        }).finally(()=>{
            $scope.isLoading = false;
        })
    }
    // function to change the page
    $scope.pageChanged = function() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage; // setting the start index
        var end = start + $scope.itemsPerPage; // setting the end index
        $scope.paginatedBookings = $scope.bookings.slice(start, end); // setting the paginated bookings to the bookings from start to end
        $scope.totalItems = $scope.bookings.length;
        console.log($scope.paginatedBookings);
    };

    $scope.filterByStartDate = ()=>{
        if($scope.startDate === '') return;
        const selectedDate = new Date($scope.startDate).setHours(0, 0, 0, 0);
        console.log(selectedDate);
        $scope.bookings = $scope.bookings.filter((booking) => {
            const bookingDate = new Date(booking.startDate).setHours(0, 0, 0, 0);
            return bookingDate === selectedDate;
        });
        $scope.pageChanged();
        console.log($scope.bookings);
    }
    $scope.resetFilter = () =>{
        $scope.startDate = "";
        fetchBookingHistory();
    }
  

});