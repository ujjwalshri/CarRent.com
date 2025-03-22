angular
  .module("myApp")
  .controller("userBookingsCtrl", function ($scope, IDB, Booking, ToastService, Review, BackButton, BiddingService) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    $scope.bookings = []; // array to hold the bookings of the logged in user
    $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price from the booking factory
    const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // get the logged in user
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 1; // setting the items per page to 5
    $scope.isLoading = false;
    $scope.sortBy = '';


    
    getAllBookings();  // function to get all the bookings of the logged in user
    
     // function to handle pagination
    $scope.pageChanged = function() {
        getAllBookings();
    };

    // $scope.variables to store all the variables
    $scope.review = {
      rating:"",
      newReview:""
    }
    // function to handle the open of the modal
    $scope.openModal =(booking)=>{
      $scope.selectedBooking = booking; 
      $scope.isModalOpen = true;
      console.log($scope.isModalOpen);
    }
    //  function to handle the close of the modal
    $scope.closeModal = ()=>{
      isModalOpen = false;
    }

    $scope.handleSorting = ()=>{
      getAllBookings();
    }


   // function to get all the bookings of the logged in user
  function getAllBookings() {
     console.log($scope.sortBy);
      const params = {
        page: $scope.currentPage,
        limit: $scope.itemsPerPage,
        sort: $scope.sortBy ? { [$scope.sortBy]: 1 } : undefined
      }
      $scope.isLoading = true;
      BiddingService.getBookingsForUser(params).then((biddings) => {
        $scope.bookings = biddings.bookings;
        $scope.totalPages = Math.ceil(biddings.totalDocs/$scope.itemsPerPage);
        console.log($scope.bookings);
      }).catch((err) => {
        ToastService.error(`Error fetching bookings ${err}`);
      }).finally(()=>{
        $scope.isLoading = false;
      })
    }
    // function to check if the booking is reviewed or not
    $scope.isReviewed = Review.isReviewed;
    /*
    function to add a review to the booking
    */
    $scope.addReview = function () {
      const car = $scope.selectedBooking.vehicle; // get the car from the booking
      const review = {
        id: crypto.randomUUID(),
        car: car,
        rating: parseInt($scope.review.rating),
        review: $scope.review.newReview,
        reviewer: {
          id:loggedInUser.id,
          username: loggedInUser.username,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          email: loggedInUser.email,
          isBlocked: loggedInUser.isBlocked,
          isSeller: loggedInUser.isSeller,
          city: loggedInUser.city,
        },
        createdAt: new Date(),
      };
      
      //check if the review is a valid review or not
      const isValidReview = Review.isValidReview(review);
      if(isValidReview.status === false){
        ToastService.error(isValidReview.message);
        return;
      }
      // if the review is valid then add the review to the database
      IDB.addReview(review)
        .then((res) => {
          // call the IDB service addReview function to add the review to the database
          ToastService.success("Review added successfully");
          return IDB.updateBookingStatus($scope.selectedBooking.id, "reviewed");
        })
        .then(()=>{
          $scope.reviewed = true;
          $scope.isModalOpen = false;
          getAllBookings(); // get all the bookings again
        })
        .catch((err) => {
         ToastService.error(`Error adding review ${err}`);  // show error message if there is an error
        })
        .finally(() => {
          // finally mark the review and rating as empty
          $scope.review = "";
          $scope.rating = "";
        });
    };
  });
