angular
  .module("myApp")
  .controller(
    "ownerBookingsCtrl",
    function ($scope, $state, IDB, Booking, ToastService, BackButton, BiddingService) {
      $scope.back = BackButton.back; // Go back function
      const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // Get logged-in user

      $scope.bookings = []; // Store bookings
      $scope.bookingsType = { type: "pending" }; // Default filter type
      $scope.searchCarName = ""; // Search model
      $scope.calculateBookingPrice = Booking.calculate; // Booking price calculator
     
      
      // Pagination variables
      $scope.currentPage = 1;
      $scope.itemsPerPage = 3;
      $scope.totalPages = 0;
      $scope.isLoading = false;

      // Fetch bookings initially
      $scope.fetchBookings = function () {
        $scope.isLoading = true;
        const params = {
          page: $scope.currentPage,
          limit: $scope.itemsPerPage,
          status: $scope.bookingsType.type, // Filtering by status (e.g., 'today', 'later', 'pending')
          sort: $scope.sort,
        };

        BiddingService.getOwnerBids(params)
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

      // Handle page change
      $scope.pageChanged = function () {
        $scope.fetchBookings(); // Fetch bookings for new page
      };

      // Previous page function
      $scope.prevPage = function () {
        if ($scope.currentPage > 1) {
          $scope.currentPage--;
          $scope.pageChanged();
        }
      };

      // Next page function
      $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPages) {
          $scope.currentPage++;
          $scope.pageChanged();
        }
      };

      // Filter Bookings based on Type
      $scope.applyFilter = function () {
        $scope.currentPage = 1; // Reset to first page on filter change
        $scope.fetchBookings();
      };

      // Approve Bidding
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

      // Reject Bidding
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

      // Initial Fetch
      $scope.fetchBookings();
    }
  );
