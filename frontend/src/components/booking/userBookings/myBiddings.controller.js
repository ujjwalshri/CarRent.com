angular.module('myApp').controller('myBiddingsCtrl', function($scope, BiddingFactory, BiddingService, ToastService) {

    $scope.biddingStatus = 'pending'; // setting the bidding status to an empty string
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 6; // setting the items per page to 2
    $scope.totalItems = 0; /// total number of items for pagination
    $scope.isLoading = false; // loading state
 

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
            page: $scope.currentPage,
            limit: $scope.itemsPerPage,
            status: $scope.biddingStatus || undefined, 
        };

        BiddingService.getBiddingsForUser(params) // fetching the biddings for the user
            .then((biddings) => {
                $scope.bookings = biddings.bids || [];
                $scope.bookings = biddings.bids.map((bid) => {
                   return BiddingFactory.createBid(bid, false);
                })

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