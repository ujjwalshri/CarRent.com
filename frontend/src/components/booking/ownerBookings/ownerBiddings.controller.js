angular
  .module("myApp")
  .controller(
    "ownerBiddingsCtrl",
    function ($scope, BiddingFactory, ToastService, BiddingService, $window) {

      $scope.bookings = [];   // array to hold the bookings of the logged in user
      $scope.bookingsType = { type: "pending" };  // variable to hold the booking type
      $scope.searchCarName = "";  // variable to hold the search car name
      $scope.calculateBookingPrice = BiddingFactory.calculate; // function to calculate the booking price from the booking factory
      $scope.sortBy=""; // variable to hold the sort by value
      $scope.currentPage = 1; // setting the current page to 1
      $scope.itemsPerPage = 6; // setting the items per page to 6
      $scope.totalPages = 0; // setting the total pages to 0
      $scope.isLoading = false; // setting the isLoading to false
 
      /*
      function to initialize the controller 
      @description: this function will be called when the controller is loaded, fetches the bookings initially 
      */
      $scope.init = function () { 
        $scope.fetchBookings(); 
      } 

     /* 
     function to fetch the bookings for logged in owner
     */
      $scope.fetchBookings = function () {
        $scope.isLoading = true;
        const params = {
          page: $scope.currentPage,
          limit: $scope.itemsPerPage,
          status: $scope.bookingsType.type, 
          sort: $scope.sortBy?{[$scope.sortBy]:-1}:undefined, 
        };

        BiddingService.getOwnerBids(params) // get the bookings for the owner
          .then((response) => {
            $scope.bookings = response.result || [];
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
