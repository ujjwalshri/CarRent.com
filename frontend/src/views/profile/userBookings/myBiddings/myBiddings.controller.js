angular.module('myApp').controller('myBiddingsCtrl', function($scope, BiddingFactory, BiddingService, ToastService) {

    $scope.biddingStatus = 'pending'; // setting the bidding status to an empty string
    $scope.isLoading = false; // loading state
    // scope variable to hold the state for pagination
    $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 4,
        totalItems: 0,
        maxSize: 5
    };
    
    // Added sorting variables
    $scope.sortField = 'createdAt';
    $scope.sortOrder = 'desc';
    
    // Initialize search object
    $scope.search = {
        carQuery: ''
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
            sortBy: $scope.sortField,
            sortOrder: $scope.sortOrder
        };
        
        // Add search parameter if there's a search query
        if ($scope.search.carQuery && $scope.search.carQuery.trim() !== '') {
            params.search = $scope.search.carQuery.trim();
        }

        BiddingService.getBiddingsForUser(params) // fetching the biddings for the user
            .then((biddings) => {
                 console.log(biddings.bids)
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
        $scope.sortField = 'createdAt';
        $scope.sortOrder = 'desc';
        $scope.search.carQuery = '';
        fetchAllBiddings();
    };
    
    /**
     * Function to set sorting options and refresh the biddings list
     * @param {string} field - The field to sort by
     * @param {string} order - The order to sort by (asc or desc)
     * @returns none
     */
    $scope.setSort = function(field, order) {
        $scope.sortField = field;
        $scope.sortOrder = order;
        $scope.pagination.currentPage = 1;
        fetchAllBiddings();
    };
    
    /**
     * Function to get the current sort label for display in the UI
     * @returns {string} - The sort label
     */
    $scope.getSortLabel = function() {
        const sortLabels = {
            'amount': {
                'asc': 'Price: Low-High',
                'desc': 'Price: High-Low'
            },
            'startDate': {
                'asc': 'Latest Starting',
                'desc': 'Earliest Starting'
            },
            'createdAt': {
                'asc': 'Oldest First',
                'desc': 'Newest First'
            }
        };
        
        return sortLabels[$scope.sortField] && sortLabels[$scope.sortField][$scope.sortOrder] 
            ? sortLabels[$scope.sortField][$scope.sortOrder] 
            : 'Default';
    };

});