angular
  .module("myApp")
  .controller("userBookingsCtrl", function ($scope, BiddingFactory, ToastService, BiddingService, $uibModal, $timeout) {
    $scope.bookings = []; // array to hold the bookings
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 6; // setting the items per page 
    $scope.totalItems = 0;
    $scope.maxSize = 5; // Number of page buttons to show
    $scope.sortBy = ''; // setting the sortBy to an empty string
    
    // Initialize the review object
    $scope.review = {
      rating: "",
      newReview: ""
    };

    // Initialize the controller
    $scope.init = function() {
      getAllBookings()
    };
    

    // function to handle the page changed event
    $scope.pageChanged = function() {
      getAllBookings();
    };

    // function to open the review modal
    $scope.openModal = (booking) => {
      const modalInstance = $uibModal.open({
        templateUrl: 'reviewModal.html',
        controller: 'ReviewModalCtrl',
        resolve: {
          booking: () => booking
        }
      });

      // function to handle the modal result
      modalInstance.result.then(function() {
        // Modal was closed with success (review submitted)
        $scope.currentPage = 1;
        getAllBookings();
        $timeout();
      });
    };

    $scope.handleSorting = () => {
      $scope.currentPage = 1;
      getAllBookings();
    };


    /**
     * Fetches all bookings for the user
     * @returns {void}
     */
    function getAllBookings() {
      if ($scope.isLoading) return;

      const params = {
        page: $scope.currentPage,
        limit: $scope.itemsPerPage,
        sort: $scope.sortBy ? { [$scope.sortBy]: 1 } : undefined
      };

      
      BiddingService.getBookingsForUser(params)
        .then((response) => {
          $scope.bookings = response.bookings.map((booking) => {
            return BiddingFactory.createBid(booking, false);
          });
          $scope.totalItems = response.totalDocs;
        })
        .catch((err) => {
          ToastService.error(`Error fetching bookings: ${err}`);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    }
  })
  /**
   * Controller for the review modal
   * @param {Object} $scope - The scope object
   * @param {Object} $uibModalInstance - The modal instance
   * @param {Object} booking - The booking object
   * @param {Object} CarService - The car service
   * @param {Object} Review - The review service
   * @param {Object} ToastService - The toast service
   */
  .controller('ReviewModalCtrl', function($scope, $uibModalInstance, booking, CarService, Review, ToastService) {
    $scope.booking = booking;
    $scope.isLoading = false;
    $scope.review = {
      rating: "",
      newReview: ""
    };

    $scope.close = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.addReview = function() {
      if (!$scope.booking) {
        ToastService.error("No booking selected for review");
        return;
      }

      const carId = $scope.booking.vehicle._id;
      const bookingId = $scope.booking._id;
      const review = {
        rating: parseInt($scope.review.rating),
        review: $scope.review.newReview.trim()
      };

      const reviewData = Review.createValidatedReview(review);
      
      if (reviewData instanceof Error) {
        ToastService.error(reviewData.message || "Invalid review data");
        return;
      }

      $scope.isLoading = true;
      
      CarService.addReview(carId, reviewData, bookingId)
        .then(() => {
          ToastService.success("Review added successfully");
          $uibModalInstance.close();
        })
        .catch((err) => {
          ToastService.error(err.message || "Error adding review");
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    };
  });