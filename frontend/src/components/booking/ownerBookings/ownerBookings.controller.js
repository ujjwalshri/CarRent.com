angular
  .module("myApp")
  .controller(
    "ownerBookingsCtrl",
    function ($scope, $state, IDB, Booking, ToastService, BackButton) {
      $scope.back = BackButton.back; // Back function to go back to the previous page
      const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // Get logged-in user
      $scope.allBookings = []; // Store all bookings
      $scope.bookings = []; // Store paginated bookings
      $scope.searchCarName = ""; // Search input model
      $scope.calculateBookingPrice = Booking.calculate; // Function to calculate booking price
      // Pagination variables
      $scope.currentPage = 1;
      $scope.itemsPerPage = 3;
      $scope.totalPages = 0;

      // Function to check booking status
      $scope.checkApproved = (booking) => booking.status === "approved"; // Check if booking is approved
      $scope.checkRejected = (booking) => booking.status === "rejected"; // Check if booking is rejected

      // Fetch bookings initially
      fetchBookings();
      
      /*
        Function to fetch all the bookings of the logged in user
        @params none
        @returns none
    */
      function fetchBookings() {
        IDB.getBookingsByOwnerId(loggedInUser.id)
          .then((bookings) => {
            $scope.allBookings = bookings.filter(
              (booking) => booking.status === "pending"
            ); // Filter pending bookings
            $scope.totalPages = Math.ceil(
              $scope.allBookings.length / $scope.itemsPerPage
            ); // Calculate total pages
            $scope.pageChanged(); // Update pagination variables
          })
          .catch((err) => console.log(err));
      }

      // Handle pagination
      $scope.pageChanged = function () {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage; // calculate start index
        var end = start + $scope.itemsPerPage; // calculate end index
        $scope.bookings = $scope.allBookings.slice(start, end); // slice bookings array
        $scope.totalPages = Math.ceil(
          $scope.allBookings.length / $scope.itemsPerPage
        ); // calculate total pages
      };
      // Previous page function to navigate to the previous page
      $scope.prevPage = function () {
        if ($scope.currentPage > 1) {
          $scope.currentPage--;
          $scope.pageChanged();
        }
      };
      // Next page function to navigate to the next page
      $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPages) {
          $scope.currentPage++;
          $scope.pageChanged();
        }
      };

      /*
       Function to reject overlapping biddings by using the async.each for rejecting the bookings in parallel
        @param {string} carID - ID of the car
        @param {string} startDate - Start date of the booking
        @param {string} endDate - End date of the booking
        rejects all the pending bookings that overlap with the given booking
    */
      function rejectOverlappingBiddings(carID, startDate, endDate) {
        IDB.getBookingsByCarId(carID)
          .then((bookings) => {
            // Filter pending bookings that overlap
            const overlappingBookings = bookings.filter(
              (booking) =>
                booking.status === "pending" &&
                booking.startDate <= endDate &&
                booking.endDate >= startDate
            );

            // Use async.each to process updates in parallel
            async.each(
              overlappingBookings,
              (booking, callback) => {
                IDB.updateBookingStatus(booking.id, "rejected") // Reject the booking
                  .then(() => callback()) // Continue to next booking
                  .catch((err) => callback(err)); // Handle error
              },
              (err) => {
                if (err) {
                  ToastService.error(
                    `Error rejecting overlapping biddings ${err}`
                  ); // Show error message
                } else {
                  fetchBookings(); // Fetch bookings again
                }
              }
            );
          })
          .catch((err) => console.log(err));
      }

      // function to approve a bidding
      $scope.approveBidding = function (bidID) {
        IDB.updateBookingStatus(bidID, "approved")
          .then(() => {
            ToastService.success("Bidding approved successfully");
            const booking = $scope.allBookings.find((b) => b.id === bidID);
            if (booking) {
              rejectOverlappingBiddings(
                booking.vehicle.id,
                booking.startDate,
                booking.endDate
              ); // Reject overlapping biddings
            }
            fetchBookings(); // Fetch bookings again
          })
          .catch((err) => console.log(err));
      };

      // Reject a bidding
      $scope.rejectBidding = function (bidID) {
        IDB.updateBookingStatus(bidID, "rejected")
          .then(() => {
            ToastService.success("Bidding rejected successfully"); // show success message
            fetchBookings(); // fetch bookings again
          })
          .catch((err) => {
            ToastService.error(`Error rejecting bidding ${err}`); // show error message
          });
      };
    }
  );
