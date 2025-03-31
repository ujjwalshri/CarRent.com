angular
  .module("myApp")
  .controller("userBookingsCtrl", function ($scope, IDB, BiddingFactory, ToastService, Review, BackButton, BiddingService, CarService,$state) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    $scope.bookings = []; // array to hold the bookings of the logged in user
    $scope.calculateBookingPrice = BiddingFactory.calculate; // function to calculate the booking price from the booking factory
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 6; // setting the items per page to 5
    $scope.isLoading = false;
    $scope.hasMoreData = true;
    $scope.bookings = [];
    $scope.sortBy = '';
    // $scope.variables to store all the variables
    $scope.review = {
      rating:"",
      newReview:""
    }

     // function to handle pagination
    $scope.pageChanged = function() {
      $scope.currentPage = $scope.currentPage + 1;
      getAllBookings();
    };

    
    // function to handle the open of the modal
    $scope.openModal =(booking)=>{
      $scope.selectedBooking = booking; 
      $scope.isModalOpen = true;
      console.log($scope.isModalOpen);
    }
    //  function to handle the close of the modal
    $scope.closeModal = ()=>{
      $scope.isModalOpen = false;
    }

    $scope.handleSorting = ()=>{
      $scope.currentPage = 1;
      $scope.bookings = [];
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
        console.log(biddings); 
        $scope.bookings = $scope.bookings.concat(biddings.bookings.map((booking)=>{
          return BiddingFactory.createBid(booking, false);
        }));
        $scope.hasMoreData = biddings.totalDocs > $scope.bookings.length;
        $scope.totalPages = Math.ceil(biddings.totalDocs/$scope.itemsPerPage);

      }).catch((err) => {
        ToastService.error(`Error fetching bookings ${err}`);
      }).finally(()=>{
        $scope.isLoading = false;
      })
    }

    /*
    function to add a review to the booking
    */
    $scope.addReview = function () {
      const carId = $scope.selectedBooking.vehicle._id; // get the car from the booking
      const bookingId = $scope.selectedBooking._id;
      const review = {
        rating: parseInt($scope.review.rating),
        review: $scope.review.newReview
      };
      
      const reviewData = Review.createValidatedReview(review);
      console.log(reviewData);
      if(reviewData instanceof Error){
        ToastService.error(reviewData.message);
        return;
      }

      // if the review is valid then add the review to the database
      CarService.addReview(carId, reviewData, bookingId)
        .then((res) => {
          console.log("hi");
          // call the IDB service addReview function to add the review to the database
          ToastService.success("Review added successfully");
          $scope.isModalOpen = false;
          $scope.reviewed = true;
          $state.reload();
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
