angular
  .module("myApp")
  .controller("userBookingsCtrl", function ($scope, BiddingFactory, ToastService, BiddingService, $timeout) {
    $scope.bookings = []; // array to hold the bookings
    $scope.sortBy = ''; // setting the sortBy to an empty string
    $scope.ownerNameQuery = ''; // added for owner name search
    $scope.isLoading = false;
    
    // initializing the pagination variables
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 6,
      totalItems: 0,
      maxSize: 5,
      totalPages: 0
    }

    
    
    // Initialize the controller
    $scope.init = function() {
      getAllBookings()
    };
    
    // function to handle the page changed event
    $scope.pageChanged = function() {
      getAllBookings();
    };

    $scope.handleSorting = () => {
      $scope.pagination.currentPage = 1;
      getAllBookings();
    };

    // Function to search bookings by owner name
    $scope.searchByOwnerName = () => {
      $scope.pagination.currentPage = 1;
      getAllBookings();
    };

    $scope.resetFilters = () => {
      $scope.sortBy = '';
      $scope.ownerNameQuery = ''; // Clear owner name search
      $scope.pagination.currentPage = 1;
      getAllBookings();
    };

    /**
     * Fetches all bookings for the user
     * @returns {void}
     */
    function getAllBookings() {
      $scope.isLoading = true;

      const params = {
        page: $scope.pagination.currentPage,
        limit: $scope.pagination.itemsPerPage,
        sort: $scope.sortBy ? { [$scope.sortBy]: 1 } : undefined,
        ownerName: $scope.ownerNameQuery || undefined // Added owner name parameter
      };

      BiddingService.getBookingsForUser(params)
        .then((response) => {
          $scope.bookings = response.bookings.map((booking) => {
            return BiddingFactory.createBid(booking, false);
          });
          $scope.pagination.totalItems = response.totalDocs;
          $scope.pagination.totalPages = Math.ceil($scope.pagination.totalItems / $scope.pagination.itemsPerPage);

        })
        .catch((err) => {
          ToastService.error(`Error fetching bookings: ${err}`);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    }
  });