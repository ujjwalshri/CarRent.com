angular
  .module("myApp")
  .controller(
    "ownerBiddingsCtrl",
    function ($scope, BiddingFactory, ToastService, BiddingService, $window, CarService) {

      $scope.bookings = [];   // array to hold the bookings of the logged in user
      $scope.bookingsType = { type: "pending" };  // variable to hold the booking type
      $scope.searchCarName = "";  // variable to hold the search car name
      $scope.calculateBookingPrice = BiddingFactory.calculate; // function to calculate the booking price from the booking factory
      $scope.currentPage = 1; // setting the current page to 1
      $scope.itemsPerPage = 6; // setting the items per page to 6
      $scope.totalPages = 0; // setting the total pages to 0
      $scope.isLoading = false; // setting the isLoading to false
      $scope.sort = {
        sortBy: ""  // Initialize with empty string for default sorting
      };
      $scope.filters = {
        selectedCar: "" // Initialize with empty string for no car filter
      };
      $scope.myCars = []; // Array to store cars with bids

      /*
      function to initialize the controller 
      @description: this function will be called when the controller is loaded, fetches the bookings initially 
      */
      $scope.init = function () { 
        getCarsWithBids();
        $scope.fetchBookings(); 
      } 

      /*
      function to reset all filters and refresh the bookings list
      */
      $scope.resetFilters = function() {
        $scope.filters.selectedCar = "";
        $scope.sort.sortBy = "";
        $scope.currentPage = 1;
        $scope.fetchBookings();
        ToastService.success("Filters have been reset");
      };

     /* 
     function to fetch the bookings for logged in owner
     */
      $scope.fetchBookings = function () {
        $scope.isLoading = true;

        // Create sort object for the API
        const sortByParam = $scope.sort.sortBy ? { [$scope.sort.sortBy]: -1 } : { createdAt: -1 };

        const params = {
          page: $scope.currentPage,
          limit: $scope.itemsPerPage,
          status: $scope.bookingsType.type, 
          sortBy: sortByParam
        };

        // Add car filter if selected
        if ($scope.filters.selectedCar) {
          params.carId = $scope.filters.selectedCar;
        }
        
        BiddingService.getOwnerBids(params)
          .then((response) => {
            console.log(response);
            $scope.bookings = response.result.map((booking)=>BiddingFactory.createBid(booking, false));
            $scope.totalPages = Math.ceil(response.totalDocs / $scope.itemsPerPage);
          })
          .catch((err) => {
            ToastService.error(`Error fetching biddings: ${err}`);
          })
          .finally(() => {
            $scope.isLoading = false;
          });
      };

      /*
      function to fetch cars that have bids
      */
      function getCarsWithBids(){
        CarService.getCarsWithBids()
          .then((cars) => {
            $scope.myCars = cars;
            console.log($scope.myCars);
          })
          .catch((err) => {
            ToastService.error(`Error fetching cars: ${err}`);
          });
      }

      /*
      function to handle pageChanged event
      */
      $scope.pageChanged = function () {
        $scope.fetchBookings(); 
      };

     

      /*
      function to handle prev page button
      */
      $scope.prevPage = function () {
        if ($scope.currentPage > 1) {
          $scope.currentPage--;
          $scope.pageChanged();
        }
      };

      /*
      function to handle next page button
      */
      $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPages) {
          $scope.currentPage++;
          $scope.pageChanged();
        }
      };

      /*
      function to apply filter
      */
      $scope.applyFilter = function () {
        $scope.currentPage = 1; 
        $scope.fetchBookings();
      };

     /*
  Function to approve bidding with confirmation
  @params bidID
*/
$scope.approveBidding = function (bidID) {
  if ($window.confirm("Are you sure you want to approve this bid? approving this bid will reject all the overlapping bids on this car")) {
    BiddingService.approveBid(bidID)
      .then(() => {
        ToastService.success("Bidding approved successfully");
        $scope.fetchBookings();
      })
      .catch((err) => {
        ToastService.error(`Error approving bidding: ${err}`);
      });
  }
};

/*
  Function to reject bidding with confirmation
  @params bidID
*/
$scope.rejectBidding = function (bidID) {
  if ($window.confirm("Are you sure you want to reject this bid?")) {
    BiddingService.rejectBid(bidID)
      .then(() => {
        ToastService.success("Bidding rejected successfully");
        $scope.fetchBookings();
      })
      .catch((err) => {
        ToastService.error(`Error rejecting bidding: ${err}`);
      });
  }
};
      
    }
  );