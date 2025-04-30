angular
  .module("myApp")
  .controller(
    "confirmedBookingsCtrl",
    function ($scope, $state, $uibModal, BiddingFactory, BiddingService, ToastService, $timeout) {

      // Helper function to calculate booking price based on booking details
      $scope.calculateBookingPrice = BiddingFactory.calculate;

      // initialize the pagination variables
      $scope.pagination ={
        currentPage: 1,
        itemsPerPage: 6,
        totalPages : 0,
      }
      
      // Data collections and state
      $scope.allBookings = [];
      $scope.bookingsType = {
        type: ''
      };
      $scope.sortBy = '';
      $scope.searchQuery = ''; // Added for car name search
      $scope.searchTimeout = null; // For debouncing search

      
      /**
       * Function to fetch confirmed bookings for the logged-in car owner
       */
      $scope.init = () => {
        fetchOwnerConfirmedBookings();
      }
      
      /**
       * Opens the start trip modal for a booking
       * @param {Object} booking - The booking to start
       */
      $scope.openStartTripModal = function(booking) {
        var modalInstance = $uibModal.open({
          templateUrl: 'startTripModal.html',
          controller: function($scope, $uibModalInstance, booking) {
            $scope.booking = booking;
            $scope.startOdometerValue = null;
            
            $scope.ok = function() {
              if ($scope.startOdometerValue === null || $scope.startOdometerValue === undefined) {
                ToastService.error("Please enter a valid odometer value");
                return;
              }
              
              const odometerValue = Number($scope.startOdometerValue);
              if (odometerValue < 0) {
                ToastService.error("Odometer value cannot be negative");
                return;
              }
              
              $uibModalInstance.close($scope.startOdometerValue);
            };
            
            $scope.cancel = function() {
              $uibModalInstance.dismiss('cancel');
            };
          },
          resolve: {
            booking: function() {
              return booking;
            }
          }
        });

        modalInstance.result.then(function(startOdometerValue) {
          BiddingService.startBooking(booking._id, startOdometerValue)
            .then(() => {
              ToastService.success("Trip started successfully");
              fetchOwnerConfirmedBookings(); // Refresh the bookings list
            })
            .catch((err) => {
              ToastService.error(`Error starting trip: ${err}`);
            });
        });
      };

      /**
       * Opens the end trip modal for a booking
       * @param {Object} booking - The booking to end
       */
      $scope.openEndTripModal = function(booking) {
        var modalInstance = $uibModal.open({
          templateUrl: 'endTripModal.html',
          controller: function($scope, $uibModalInstance, booking) {
            $scope.booking = booking;
            $scope.endOdometerValue = null;
            
            $scope.ok = function() {
              if ($scope.endOdometerValue === null || $scope.endOdometerValue === undefined) {
                ToastService.error("Please enter a valid end odometer value");
                return;
              }
              
              const endValue = Number($scope.endOdometerValue);
              const startValue = Number(booking.startOdometerValue);
            
              if (endValue < startValue) {
                ToastService.error(`End odometer value (${endValue}) must be greater than or equal to start value (${startValue})`);
                return;
              }
              
              $uibModalInstance.close($scope.endOdometerValue);
            };
            
            $scope.cancel = function() {
              $uibModalInstance.dismiss('cancel');
            };
          },
          resolve: {
            booking: function() {
              return booking;
            }
          }
        });

        modalInstance.result.then(function(endOdometerValue) {
          BiddingService.endBooking(booking._id, endOdometerValue)
            .then(() => {
              ToastService.success("Trip ended successfully");
              fetchOwnerConfirmedBookings(); // Refresh the bookings list
            })
            .catch((err) => {
              console.error("Error ending trip:", err);
              ToastService.error(`Error ending trip: ${err}`);
            });
        });
      };

      /**
       * Downloads the invoice for a completed booking
       * @param {Object} booking - The booking to generate invoice for
       */
      $scope.downloadInvoice = function(booking) {
        if (booking && booking.generatePDF) {
          booking.generatePDF();
        } else {
          ToastService.error("Unable to generate invoice");
        }
      };
      
      /**
       * Fetches confirmed bookings for the currently logged-in car owner
       * Applies current pagination, sorting, and filtering settings
       * Updates total page count based on returned data
       */
      function fetchOwnerConfirmedBookings() {
        // Prepare request parameters for pagination, sorting, and filtering
        const params = {
          page: $scope.pagination.currentPage,
          limit: $scope.pagination.itemsPerPage,
          sort: $scope.sortBy,
          bookingsType: $scope.bookingsType.type,
          searchQuery: $scope.searchQuery // Added for search functionality
        }

        // Call API to fetch owner's bookings with current parameters
        BiddingService.getBookingsForOwner(params)
          .then((bookings) => {
            // Transform raw booking data into proper bidding objects using factory
            $scope.allBookings = bookings.bookings.map(booking => BiddingFactory.createBid(booking, false));
            // Calculate total pages based on total documents and items per page
            $scope.pagination.totalPages = Math.ceil(bookings.totalDocs/$scope.pagination.itemsPerPage);
          })
          .catch((err) => {
            // Display user-friendly error notification
            ToastService.error(`Error fetching bookings ${err}`);
          })
      }

      /**
       * Handles pagination navigation to previous page
       * Decrements current page if not on first page and refreshes data
       */
      $scope.prevPage = function () {
          if ($scope.pagination.currentPage > 1) {
              $scope.pagination.currentPage--;
              $scope.pageChanged();
          }
      };
      
      /**
       * Handles pagination navigation to next page
       * Increments current page if not on last page and refreshes data
       */
      $scope.nextPage = function () {
          if ($scope.pagination.currentPage < $scope.pagination.totalPages) {
              $scope.pagination.currentPage++;
              $scope.pageChanged();
          }
      };

      /**
       * Refreshes booking data when page selection changes
       * Called by next/prev functions and when user clicks page number
       */
      $scope.pageChanged = function () {
        fetchOwnerConfirmedBookings();
      };

      /**
       * Applies current filter settings and refreshes booking data
       * Called when user clicks apply filter button
       */
      $scope.applyFilter = () => {
        $scope.pagination.currentPage = 1;
        fetchOwnerConfirmedBookings();
      };
      
      /**
       * Navigates to the detailed booking management page for a specific booking
       * Validates booking data before navigation
       * @param {Object} booking - The booking object to manage
       */
      $scope.openManageBooking = (booking) => {
        // Validate booking data before navigation
        if (!booking || !booking._id) {
          ToastService.error("Invalid booking data");
          return;
        }
        // Navigate to manage bookings page with booking ID
        $state.go("manageBookings", { id: booking._id });
      };
     
      /**
       * Resets all filtering options to default values
       * Refreshes booking data with cleared filters
       */
      $scope.resetFilter = () => {
        // Reset booking type filter to empty string
        $scope.bookingsType.type = "";
        // Fetch bookings with reset filters
        fetchOwnerConfirmedBookings();
      };

      /**
       * Handles search with debouncing for car name
       * Waits 500ms after user stops typing before executing search
       */
      $scope.searchBookings = function() {
        if ($scope.searchTimeout) {
          $timeout.cancel($scope.searchTimeout);
        }
        
        $scope.searchTimeout = $timeout(function() {
          $scope.pagination.currentPage = 1;
          fetchOwnerConfirmedBookings();
        }, 500);
      };
    }
  );