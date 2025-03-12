angular.module('myApp').controller('myBiddingsCtrl', function($scope, $state, IDB, Booking, BackButton) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price from the booking factory
    const loggedInUser = JSON.parse(sessionStorage.getItem('user')); // retrieving the logged in user from the session storage
    $scope.biddingStatus = ''; // setting the bidding status to an empty string
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 10; // setting the items per page to 5


    fetchAllBiddings(); // fetch all the biddings initially
    // fetch the biddings at a particular owner.username
    function fetchAllBiddings(){
        IDB.getAllBookings().then((bookings) => {
            $scope.bookings = bookings.filter((booking) => {
                return (booking.status === "pending" && booking.from.id === loggedInUser.id) || (booking.status ==="rejected" && booking.from.id === loggedInUser.id); // filtering out the pending bookings and the bookings of the logged in user
            });
            $scope.totalItems = $scope.bookings.length; // setting the total items to the length of the bookings
            $scope.pageChanged();
        });
    }
    // function to handle pagination
    $scope.pageChanged = function() {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage; // setting the start index
        var end = start + $scope.itemsPerPage; // setting the end index
        $scope.paginatedBookings = $scope.bookings.slice(start, end); // setting the paginated bookings to the bookings from start to end
    };

    $scope.applyFilter =()=>{
        if($scope.biddingStatus === '') return;
        $scope.bookings = $scope.bookings.filter((booking)=>{
            return booking.status === $scope.biddingStatus;
        });
        $scope.totalItems = $scope.bookings.length; // setting the total items to the length of the bookings
        $scope.pageChanged();
    }
    
    $scope.resetFilter =()=>{   
        fetchAllBiddings();
        $scope.biddingStatus = '';
    }


    // handling manage booking function redirects the user to the manage booking page with that booking's id
    $scope.handleManageBookings = (bookingID) => {
        $state.go('manageBookings', { id: bookingID }); // go to manage booking when the user clicks on the user bookings
    };
});