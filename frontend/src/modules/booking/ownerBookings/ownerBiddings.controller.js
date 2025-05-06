angular
  .module("myApp")
  .controller(
    "ownerBiddingsCtrl",
    function (
      $scope,
      BiddingFactory,
      ToastService,
      BiddingService,
      $window,
      CarService,
      $uibModal,
      RecommendationService
    ) {
      $scope.bookings = []; // array to hold the bookings of the logged in user
      $scope.bookingsType = { type: "pending" }; // variable to hold the booking type
      $scope.searchCarName = ""; // variable to hold the search car name
      $scope.calculateBookingPrice = BiddingFactory.calculate; // function to calculate the booking price from the booking factory
      $scope.currentPage = 1; // setting the current page to 1
      $scope.itemsPerPage = 6; // setting the items per page to 6
      $scope.totalPages = 0; // setting the total pages to 0
      $scope.optimalBids = []; // array to hold the optimal bids 

      // pagination variables
      $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 6,
        totalItems: 0,
      };

      $scope.isLoading = false; // setting the isLoading to false
      $scope.sort = {
        sortBy: "", // Initialize with empty string for default sorting
      };
      $scope.filters = {
        selectedCar: "", // Initialize with empty string for no car filter
      };
      $scope.myCars = []; // Array to store cars with bids

      $scope.optimalBids = []; // Array to store optimal bid IDs
      $scope.optimalBidsActive = false; // Flag to track if optimal bid mode is active
      $scope.isLoadingOptimal = false; // Flag to track if optimal bids are loading

      /*
      function to initialize the controller 
      @description: this function will be called when the controller is loaded, fetches the bookings initially 
      */
      $scope.init = function () {
        $scope.fetchBookings();
      };

      /*
      function to reset all filters and refresh the bookings list
      */
      $scope.resetFilters = function () {
        $scope.filters.selectedCar = "";
        $scope.sort.sortBy = "";
        $scope.pagination.currentPage = 1;
        $scope.fetchBookings();
      };

      /* 
     function to fetch the bookings for logged in owner
     */
      $scope.fetchBookings = function () {
        $scope.isLoading = true;

        // Create sort object for the API
        const sortByParam = $scope.sort.sortBy
          ? { [$scope.sort.sortBy]: -1 }
          : { createdAt: -1 };

        const params = {
          page: $scope.pagination.currentPage,
          limit: $scope.pagination.itemsPerPage,
          status: $scope.bookingsType.type,
          sortBy: sortByParam,
        };

        // Add car filter if selected
        if ($scope.filters.selectedCar) {
          params.carId = $scope.filters.selectedCar;
        }

        BiddingService.getOwnerBids(params)
          .then((response) => {
            $scope.bookings = response.result.map((booking) =>
              BiddingFactory.createBid(booking, false)
            );
            $scope.pagination.totalPages = Math.ceil(
              response.totalDocs / $scope.pagination.itemsPerPage
            );
            return CarService.getCarsWithBids();
          })
          .then((cars) => {
            $scope.myCars = cars;
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
        if ($scope.pagination.currentPage > 1) {
          $scope.pagination.currentPage--;
          $scope.pageChanged();
        }
      };

      /*
      function to handle next page button
      */
      $scope.nextPage = function () {
        if ($scope.pagination.currentPage < $scope.pagination.totalPages) {
          $scope.pagination.currentPage++;
          $scope.pageChanged();
        }
      };

      /*
      function to apply filter
      */
      $scope.applyFilter = function () {
        $scope.pagination.currentPage = 1;
        $scope.fetchBookings();
      };

      /**
       * Function to fetch and show optimal bid recommendations
       * Uses the recommendation service to get the optimal combination of bids
       * that maximize revenue
       */
      $scope.showOptimalBids = function () {
        $scope.isLoadingOptimal = true;

        RecommendationService.optimalBidsRecommendationForSeller()
          .then((response) => {
            // Reset any previous optimal bids
            

            // Process the optimal bid sets from all vehicles
            if (response && response.optimalBidSets && response.optimalBidSets.length > 0) {
              // Extract all optimal bid IDs from all vehicle recommendations
              response.optimalBidSets.forEach((vehicleSet) => {
                if (vehicleSet.optimalBidIds && vehicleSet.optimalBidIds.length > 0) {
                  $scope.optimalBids = [...$scope.optimalBids, ...vehicleSet.optimalBidIds];
                }
              });

              $scope.optimalBidsActive = true;

              // Show summary toast with recommendation stats
              const totalVehicles = response.optimalBidSets.length;
              const totalBids = $scope.optimalBids.length;
            
              ToastService.success(
                `Found ${totalBids} optimal bids across ${totalVehicles} vehicles that would maximize your revenue}`
              );
            } else {
              ToastService.info("No optimal bid recommendations found");
            }
          })
          .catch((err) => {
            ToastService.error(`Error fetching optimal bids: ${err}`);
          })
          .finally(() => {
            $scope.isLoadingOptimal = false;
          });
      };

      /**
       * Function to check if a bid is in the optimal set
       * @param {string} bidId - The ID of the bid to check
       * @returns {boolean} - True if the bid is in the optimal set
       */
      $scope.isOptimalBid = function (bidId) {
        if (!$scope.optimalBidsActive || !$scope.optimalBids.length) {
          return false;
        }
        return $scope.optimalBids.includes(bidId.toString());
      };

      /**
       * Function to clear optimal bid highlights
       */
      $scope.clearOptimalBids = function () {
        $scope.optimalBids = [];
        $scope.optimalBidsActive = false;
      };

      /**
       * Function to check if a bid is already approved
       * @param {Object} booking - The booking object to check
       * @returns {boolean} - True if the booking is approved
       */
      $scope.checkApproved = function (booking) {
        return booking.status !== "pending";
      };

      /*
  Function to approve bidding with confirmation
  @params bidID
*/
      $scope.approveBidding = function (bidID) {
        const selectedBid = $scope.bookings.find((b) => b._id === bidID);

        BiddingService.getOverlappingBids(bidID)
          .then((response) => {
            const overlappingBids = response.overlappingBids;

            if (overlappingBids && overlappingBids.length > 0) {
              // Show modal with overlapping bids
              const modalInstance = $uibModal.open({
                templateUrl:
                  "modules/booking/ownerBookings/overlappingBidsModal.html",
                controller: "OverlappingBidsModalCtrl",
                resolve: {
                  overlappingBids: function () {
                    return overlappingBids;
                  },
                  selectedBid: function () {
                    return selectedBid;
                  },
                },
              });

              modalInstance.result.then(function (approved) {
                if (approved) {
                  $scope.fetchBookings();
                }
              });
            } else {
              // No overlapping bids, proceed with normal confirmation
              if (
                $window.confirm("Are you sure you want to approve this bid?")
              ) {
                BiddingService.approveBid(bidID)
                  .then(() => {
                    ToastService.success("Bidding approved successfully");
                    $scope.fetchBookings();
                  })
                  .catch((err) => {
                    ToastService.error(`Error approving bidding: ${err}`);
                  });
              }
            }
          })
          .catch((err) => {
            ToastService.error(`Error checking overlapping bids: ${err}`);
          });
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
