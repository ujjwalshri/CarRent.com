angular
  .module("myApp")
  .controller("userBookingsCtrl", function ($scope, IDB, BiddingFactory, ToastService, Review, BackButton, BiddingService, CarService, $state, $uibModal) {
    $scope.back = BackButton.back;
    $scope.bookings = [];
    $scope.calculateBookingPrice = BiddingFactory.calculate;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 6;
    $scope.isLoading = false;
    $scope.hasMoreData = true;
    $scope.sortBy = '';
    
    $scope.review = {
      rating: "",
      newReview: ""
    };

    // Initialize the controller
    $scope.init = function() {
      getAllBookings();
    };

    $scope.pageChanged = function() {
      $scope.currentPage = $scope.currentPage + 1;
      getAllBookings();
    };

    $scope.openModal = (booking) => {
      const modalInstance = $uibModal.open({
        templateUrl: 'reviewModal.html',
        controller: 'ReviewModalCtrl',
        resolve: {
          booking: function() {
            return booking;
          }
        }
      });

      modalInstance.result.then(function() {
        // Modal was closed with success (review submitted)
        $scope.currentPage = 1;
        getAllBookings();
      }, function() {
        // Modal was dismissed
        console.log('Modal dismissed');
      });
    };

    $scope.handleSorting = () => {
      $scope.currentPage = 1;
      $scope.bookings = [];
      getAllBookings();
    };

    function getAllBookings() {
      if ($scope.isLoading) return;

      const params = {
        page: $scope.currentPage,
        limit: $scope.itemsPerPage,
        sort: $scope.sortBy ? { [$scope.sortBy]: 1 } : undefined
      };

      $scope.isLoading = true;
      
      BiddingService.getBookingsForUser(params)
        .then((biddings) => {
          if ($scope.currentPage === 1) {
            $scope.bookings = [];
          }
          
          const newBookings = biddings.bookings.map((booking) => {
            return BiddingFactory.createBid(booking, false);
          });
          
          $scope.bookings = $scope.bookings.concat(newBookings);
          $scope.hasMoreData = biddings.totalDocs > $scope.bookings.length;
          $scope.totalPages = Math.ceil(biddings.totalDocs / $scope.itemsPerPage);
        })
        .catch((err) => {
          ToastService.error(`Error fetching bookings: ${err}`);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    }
  })
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

      if (!$scope.review.rating || !$scope.review.newReview) {
        ToastService.error("Please provide both rating and review");
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