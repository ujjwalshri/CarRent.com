angular
  .module("myApp")
  .controller(
    "confirmedBookingsCtrl",
    function ($scope, $uibModal, BiddingFactory, BiddingService, ToastService, $timeout) {

      // Helper function to calculate booking price based on booking details
      $scope.calculateBookingPrice = BiddingFactory.calculate;

      // initialize the pagination variables
      $scope.pagination ={
        currentPage: 1,
        itemsPerPage: 6,
        totalPages : 0,
      }
      $scope.isDateFilterApplied = false;
      // Data collections and state
      $scope.allBookings = [];
      $scope.bookingsType = {
        type: ''
      };
      $scope.sortBy = '';
      $scope.carSearchQuery = ''; // For car name search
      $scope.usernameSearchQuery = ''; // For username search
      $scope.searchTimeout = null; // For debouncing search
      
      // Date filter options
      $scope.dateFilter = {
        startDate: null,
        endDate: null
      };
      // variable to hold the error message for date filter
      $scope.dateFilterError = null;

      
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
          carSearchQuery: $scope.carSearchQuery, // Updated for car name search
          usernameSearchQuery: $scope.usernameSearchQuery // Added for username search
        }

        // Add date filters if they are set
        if ($scope.dateFilter.startDate) {
          const startDate = new Date($scope.dateFilter.startDate);
          startDate.setHours(0, 0, 0, 0); // Set to beginning of day
          params.startDate = startDate.toISOString();
        }
       // check if the end date is set
        if ($scope.dateFilter.endDate) {
          const endDate = new Date($scope.dateFilter.endDate);
          endDate.setHours(23, 59, 59, 999); // Set to end of day
          params.endDate = endDate.toISOString();
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
            // Display error notification
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
       * Validates that the date range is valid (start date is not after end date)
       * Sets error message if validation fails
       */
      $scope.validateDateRange = function() {
        $scope.dateFilterError = null;
        
        if ($scope.dateFilter.startDate && $scope.dateFilter.endDate) {
          const startDate = new Date($scope.dateFilter.startDate);
          const endDate = new Date($scope.dateFilter.endDate);
          
          if (startDate > endDate) {
            $scope.dateFilterError = "Start date cannot be after end date";
          }
        }
      };
      
      /**
       * Applies the date filters after validation
       * Called when user clicks apply date filter button
       */
      $scope.applyDateFilter = function() {
        $scope.validateDateRange();
        
        if (!$scope.dateFilterError) {
          $scope.isDateFilterApplied = true;
          $scope.pagination.currentPage = 1;
          fetchOwnerConfirmedBookings();
        }
      };

      /**
       * Resets all filtering options to default values
       * Refreshes booking data with cleared filters
       */
      $scope.resetFilter = () => {
        $scope.bookingsType.type = "";
        $scope.carSearchQuery = "";
        $scope.usernameSearchQuery = "";
        $scope.dateFilter.startDate = null;
        $scope.dateFilter.endDate = null;
        $scope.dateFilterError = null;
        $scope.pagination.currentPage = 1;
        fetchOwnerConfirmedBookings();
      };

      /**
       * Handles search with debouncing for car name
       * Waits 500ms after user stops typing before executing search
       */
      $scope.searchCarName = function() {
        if ($scope.searchTimeout) {
          $timeout.cancel($scope.searchTimeout);
        }
        
        $scope.searchTimeout = $timeout(function() {
          $scope.pagination.currentPage = 1;
          fetchOwnerConfirmedBookings();
        }, 500);
      };

      /**
       * Handles search with debouncing for username
       * Waits 500ms after user stops typing before executing search
       */
      $scope.searchUsername = function() {
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