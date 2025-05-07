angular.module('myApp').controller('myBiddingsCtrl', function($scope, BiddingFactory, BiddingService, ToastService, $timeout) {

    $scope.biddingStatus = 'pending'; // setting the bidding status to an empty string
    $scope.isLoading = false; // loading state
    // scope variable to hold the state for pagination
    $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 6,
        totalItems: 0,
        maxSize: 5
    };
 
    /**
     * Function to initialize the page
     * Fetches all biddings for the user
     * @returns none
     */
    $scope.init = function(){
        fetchAllBiddings();
    }

    /**
     * Function to fetch all biddings for the user
     * @returns none
     */
    function fetchAllBiddings() {
        $scope.isLoading = true;

        const params = { // params for the getBiddingsForUser function used for filtering and pagination
            page: $scope.pagination.currentPage,
            limit: $scope.pagination.itemsPerPage,
            status: $scope.biddingStatus || undefined, 
        };

        BiddingService.getBiddingsForUser(params) // fetching the biddings for the user
            .then((biddings) => {

                $scope.bookings = biddings.bids.map((bid) => {
                   return BiddingFactory.createBid(bid, false);
                });

                $scope.pagination.totalItems = biddings.totalDocs; 
                
            })
            .catch((err) => {
                ToastService.error(`Error fetching bookings: ${err}`);
            })
            .finally(() => {
                $scope.isLoading = false;
            });
    }

    /**
     * Function to handle the pageChanged event
     * Fetches all biddings for the user
     * @returns none
     */
    $scope.pageChanged = function () {
        fetchAllBiddings();
    };

    // Apply filter
    $scope.applyFilter = () => {
        $scope.pagination.currentPage = 1;
        fetchAllBiddings();
    };

    // Reset filter
    $scope.resetFilter = () => {
        $scope.biddingStatus = 'pending';
        $scope.pagination.currentPage = 1; 
        fetchAllBiddings();
    };

});