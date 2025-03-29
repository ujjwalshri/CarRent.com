angular
  .module("myApp")
  .controller(
    "ownerBookingsCtrl",
    function ($scope, $state, IDB, BiddingFactory, ToastService, BackButton, BiddingService) {
      $scope.back = BackButton.back;  // back function to go back to the previous page
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
            console.log(response.result.length);
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
      function to approve bidding
      @params bidID
      */
      $scope.approveBidding = function (bidID) {
        BiddingService.approveBid(bidID)
          .then(() => {
            ToastService.success("Bidding approved successfully");
            $scope.fetchBookings();
          })
          .catch((err) => {
            ToastService.error(`Error approving bidding: ${err}`);
          });
      };

       /*
      function to reject bidding
      @params bidID
      */
      $scope.rejectBidding = function (bidID) {
        BiddingService.rejectBid(bidID)
          .then(() => {
            ToastService.success("Bidding rejected successfully");
            $scope.fetchBookings();
          })
          .catch((err) => {
            ToastService.error(`Error rejecting bidding: ${err}`);
          });
      };

      
      $scope.fetchBookings();
    }
  );
