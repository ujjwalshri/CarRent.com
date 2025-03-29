angular
  .module("myApp")
  .controller(
    "confirmedBookingsCtrl",
    function ($scope, $state, IDB, BiddingFactory, BackButton, BiddingService, ToastService, Booking) {
      $scope.back = BackButton.back; // back function to go back to the previous page
      $scope.calculateBookingPrice = BiddingFactory.calculate; // function to calculate the booking price from the booking factory
      $scope.todayBooking = Booking.todayBookingCalculator; // function to check if the booking is for today from the booking factory 
      $scope.currentPage = 1; // Initialize currentPage
      $scope.itemsPerPage = 6; // Initialize itemsPerPage
      $scope.allBookings = []; // Initialize to an empty array
      $scope.bookingsType ={ // Initialize bookingsType object as an empty object
        type: ''
      };
      $scope.sortBy = ''; // Initialize sortBy
      $scope.isLoading = false;
      
    
      // Fetch bookings initially
      fetchOwnerConfirmedBookings();
      /*
      function to fetch the bookings for logged in owner
      */
      function fetchOwnerConfirmedBookings() {
        const params = {
          page: $scope.currentPage,
          limit: $scope.itemsPerPage,
          sort: $scope.sortBy,
          bookingsType : $scope.bookingsType.type
        }
        console.log(params);
        $scope.isLoading = true;
        BiddingService.getBookingsForOwner(params).then((bookings)=>{
          console.log(bookings);
          $scope.allBookings = bookings.bookings;
          $scope.totalPages = Math.ceil(bookings.totalDocs/$scope.itemsPerPage);
          console.log($scope.allBookings);
        }).catch((err)=>{
          ToastService.error(`Error fetching bookings ${err}`);
          console.log(err);
        }).finally(()=>{  
          $scope.isLoading = false;
        });
        
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
        fetchOwnerConfirmedBookings();
      };


      $scope.applyFilter = ()=>{
        console.log("appling filter")
        fetchOwnerConfirmedBookings();
    }
      
      /* 
      function to handle the opening on the manage booking page routes the user to the manage booking page with the booking id
      */
      $scope.openManageBooking = (booking) => {
        if (!booking || !booking._id) {
          ToastService.error("Invalid booking data");
          return;
        }
        $state.go("manageBookings", { id: booking._id });
      };
     /* 
     function to reset the filter
     */
    $scope.resetFilter = ()=>{
      $scope.bookingsType.type = "";
      fetchOwnerConfirmedBookings();
    } 
  }
  );