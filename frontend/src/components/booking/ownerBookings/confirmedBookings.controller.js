angular
  .module("myApp")
  .controller(
    "confirmedBookingsCtrl",
    function ($scope, $state, IDB, Booking, BackButton) {
      $scope.back = BackButton.back; // back function to go back to the previous page
      $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price from the booking factory
      $scope.todayBooking = Booking.todayBookingCalculator; // function to check if the booking is for today from the booking factory 
      $scope.currentPage = 1; // Initialize currentPage
      $scope.itemsPerPage = 10; // Initialize itemsPerPage
      $scope.allBookings = []; // Initialize to an empty array
      $scope.bookingsType ={ // Initialize bookingsType object as an empty object
        type: ''
      };
      
    
      // Fetch bookings initially
      fetchOwnerConfirmedBookings();
      /*
      function to fetch the bookings for logged in owner
      */
      function fetchOwnerConfirmedBookings() {
        const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
        IDB.getBookingsByOwnerId(loggedInUser.id)
          .then((bookings) => {
            bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by createdAt to make sure the latest booking comes first
            $scope.allBookings = bookings.filter(
              (booking) => booking.status === "approved" || booking.status === "reviewed"
            );
            $scope.totalItems = $scope.allBookings.length;
            console.log($scope.allBookings);
            $scope.pageChanged(); // Update paginated list
          })
          .catch((err) => console.log(err));
      }
      // Pagination logic starts here
      $scope.totalPages = Math.ceil($scope.allBookings.length / $scope.itemsPerPage); // Initialize totalPages
      
      // function to handle the pagination when user clicks on the previous button
      $scope.prevPage = function () {
          if ($scope.currentPage > 1) {
              $scope.currentPage--;
              $scope.pageChanged();
          }
      };
      // function to handle the pagination when user clicks on the next button
      $scope.nextPage = function () {
          if ($scope.currentPage < $scope.totalPages) {
              $scope.currentPage++;
              $scope.pageChanged();
          }
      };

      /*
      function to handle the pagination when user clicks on the page number
      */
      $scope.pageChanged = function () {
          var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
          var end = start + $scope.itemsPerPage;
          $scope.bookings = $scope.allBookings.slice(start, end);
          
          // Update total pages
          $scope.totalPages = Math.ceil($scope.allBookings.length / $scope.itemsPerPage);
      };


      $scope.applyFilter = ()=>{
        
        $scope.currentPage = 1;
        console.log($scope.bookingsType.type);
       if($scope.bookingsType.type == "today"){
        $scope.allBookings = $scope.allBookings.filter((booking) => {
          return Booking.todayBookingCalculator(booking);
        });
      
       }else if($scope.bookingsType.type == "later"){
         $scope.allBookings = $scope.allBookings.filter((booking) => {
          return !Booking.todayBookingCalculator(booking); 
         });
      }
      $scope.totalItems = $scope.allBookings.length;
      $scope.pageChanged();
    }
      
      /* 
      function to handle the opening on the manage booking page routes the user to the manage booking page with the booking id
      */
      $scope.openManageBooking = (booking) => {
        $state.go("manageBookings", { id: booking.id }); // using $state to navigate to the manage booking page with the booking id
       };
 
    $scope.resetFilter = ()=>{
      fetchOwnerConfirmedBookings();
      $scope.bookingsType.type = "";
    } 
  }
  );