angular.module('myApp').controller('myBiddingsCtrl', function($scope, $state, IDB, Booking, BackButton, BiddingService, ToastService) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price from the booking factory
    const loggedInUser = JSON.parse(sessionStorage.getItem('user')); // retrieving the logged in user from the session storage
    $scope.biddingStatus = 'pending'; // setting the bidding status to an empty string
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 6; // setting the items per page to 2
    $scope.totalItems = 0; /// total number of items for pagination
    $scope.isLoading = false; // loading state

    fetchAllBiddings(); // fetch all biddings initially

    // Fetch all biddings with pagination
    function fetchAllBiddings() {
        $scope.isLoading = true;

        const params = {
            page: $scope.currentPage,
            limit: $scope.itemsPerPage,
            status: $scope.biddingStatus || undefined, 
        };

        BiddingService.getBiddingsForUser(params)
            .then((biddings) => {
                $scope.bookings = biddings.bids || [];
                $scope.totalItems = biddings.totalDocs || 0; 
                
            })
            .catch((err) => {
                ToastService.error(`Error fetching bookings: ${err}`);
                console.error(err);
            })
            .finally(() => {
                $scope.isLoading = false;
            });
    }

    /*
    function to handle the pagination when user clicks on the previous button
    */
    $scope.pageChanged = function () {
        fetchAllBiddings();
    };

    // Apply filter
    $scope.applyFilter = () => {
        $scope.currentPage = 1;
        fetchAllBiddings();
    };

    // Reset filter
    $scope.resetFilter = () => {
        $scope.biddingStatus = '';
        $scope.currentPage = 1; 
        fetchAllBiddings();
    };

});