angular
  .module("myApp")
  .controller("userBookingsCtrl", function ($scope, BiddingFactory, ToastService, BiddingService, $timeout) {
    $scope.bookings = []; // array to hold the bookings
    $scope.sortBy = ''; // setting the sortBy to an empty string
    
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
      console.log('Page changed to: ' + $scope.pagination.currentPage);
      getAllBookings();
    };

    $scope.handleSorting = () => {
      $scope.pagination.currentPage = 1;
      getAllBookings();
    };

    $scope.resetFilters = () => {
      $scope.sortBy = '';
      $scope.pagination.currentPage = 1;
      getAllBookings();
    };

    /**
     * Fetches all bookings for the user
     * @returns {void}
     */
    function getAllBookings() {
      if ($scope.isLoading) return;

      const params = {
        page: $scope.pagination.currentPage,
        limit: $scope.pagination.itemsPerPage,
        sort: $scope.sortBy ? { [$scope.sortBy]: 1 } : undefined
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