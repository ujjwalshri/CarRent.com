/**
 * Single Car Controller
 * 
 * This controller manages the individual car details page functionality.
 * It handles displaying car information, reviews, date selection for booking,
 * and placing bids for car rentals. It also manages the chat functionality 
 * between potential renters and car owners.
 */
angular
  .module("myApp")
  .controller(
    "singleCarCtrl",
    function (
      $scope,
      $state,
      $q,
      $stateParams,
      ToastService,
      CarService,
      BiddingService,
      ChatService,
      BiddingFactory,
      RouteProtection
    ) {
    
      // Utility function to calculate booking price based on date range
      $scope.calculateBookingPrice = BiddingFactory.calculate;
      $scope.initializeFlatpickr = BiddingFactory.initializeFlatpickr;
      
      // Initialize view model properties
      $scope.car = {};                 // Stores the current car's details
      $scope.carReviews = [];          // Stores reviews for the current car
      $scope.blockedDates = [];        // Dates when the car is already booked/unavailable
      $scope.averageRating = 0;        // Average rating calculated from reviews
      $scope.skip = 0;                 // Number of reviews to skip (for pagination)
      $scope.limit = 3;                // Number of reviews to load per page
      $scope.hasMoreReviews = true;    // Flag indicating if more reviews are available
      $scope.LoggedinUser = {};        // Current authenticated user information
      $scope.isLoading = false;        // Loading state for async operations

      /**
       * Function to initialize the car details page
       * Fetches car data, reviews, and sets up date picker
       */
      $scope.init = () => {
        fetchCarData();
        $scope.loadReviews();
      };

      /**
       * Fetch car data and bookings
       * Makes multiple API calls in parallel to get car details, 
       * existing bookings, and user information
       */
      function fetchCarData() {
        $q.all([
          // Get car details by ID from route parameter
          CarService.getCarById($stateParams.id),
          
          // Get existing bookings to determine unavailable dates
          CarService.fetchBookingsAtCarId($stateParams.id),
          
          // Get current user information
          RouteProtection.getLoggedinUser(), 
        ])
          .then((results) => {
            console.log(results[1]);
            // Process booking data to determine which dates are unavailable
            $scope.blockedDates = BiddingFactory.calculateBlockedDates(results);
            $scope.initializeFlatpickr($scope.blockedDates, "#dateRangePicker", $scope);
            // Store car details in scope for rendering
            $scope.car = results[0].data;
            // Store logged in user information
            $scope.LoggedinUser = results[2];
          })
          .catch((error) => {
            // Show error notification if data fetching fails
            ToastService.error(`error fetching the car data ${error}`);
          });
      }
   
    

      /**
       * Load car reviews with pagination
       * Fetches reviews for the current car and calculates average rating
       */
      $scope.loadReviews = () => {
        // Prepare pagination parameters
        const params = {
          skip: $scope.skip,
          limit: $scope.limit,
        }
        
        // Call API to get reviews
        CarService.getReviewsByCarId($stateParams.id, params)
          .then((res) => {
            // Append new reviews to existing ones (for pagination)
            $scope.carReviews = $scope.carReviews.concat(res.data.reviews);
            
            // Check if we've reached the end of available reviews
            if(res.data.reviews.length < $scope.limit) {
              $scope.hasMoreReviews = false;
            }
            
            // Format average rating to 1 decimal place
            $scope.averageRating = parseFloat(res.data.avgRating).toFixed(1);
          })
          .catch((err) => { 
            ToastService.error(`Error fetching the reviews ${err}`);
          });
      }

      /**
       * Load more reviews when user clicks "Load More"
       * Updates skip parameter and loads the next batch of reviews
       */
      $scope.loadMoreReviews = () => {
        // Increase skip value to get the next batch
        $scope.skip = $scope.skip + $scope.limit;
        $scope.loadReviews();
      }

      /**
       * Place bid for renting the car
       * Validates bid amount and date range before submitting
       * Creates a bidding object and sends it to the server
       */
      $scope.placeBid = async () => {
        // Set loading state to show spinner/disable buttons
        $scope.isLoading = true;
        
        // Validate bid amount is at least the car's price
        if($scope.amount < $scope.car.price) {
          ToastService.error("Bid amount should be greater than the car price");
          $scope.isLoading = false;
          return;
        }

        // Prepare owner object for the bid
        const ownerObj = {
          _id: $scope.car.owner._id,
          username: $scope.car.owner.username,
          email: $scope.car.owner.email, 
          firstName: $scope.car.owner.firstName,
          lastName: $scope.car.owner.lastName,
          city: $scope.car.owner.city
        }

        let bidding = {};
        console.log($scope.amount);
        
        // Use factory to create a valid bid object with validation
        const bid = BiddingFactory.createBid({
          amount: $scope.amount, 
          startDate: $scope.startDate, 
          endDate: $scope.endDate, 
          owner: ownerObj
        });
        
        console.log("bidding factory's");
        console.log(bid);
        
        // Check if bid creation returned an error
        if(bid.error) {
          ToastService.error(bid.error);
          $scope.isLoading = false;
          return;
        } else {
          bidding = bid;
        }

        // Submit bid to the server
        BiddingService.addBid($stateParams.id, bidding)
          .then((res) => {
            ToastService.info("Bid processing started wait for the bid to get saved");
          })
          .catch((err) => {
            ToastService.error(`Error placing the bid ${err}`);
          })
          .finally(() => {
            // Reset form and loading state regardless of outcome
            $scope.isLoading = false;
            $scope.amount = "";
            $scope.startDate = "";
            $scope.endDate = "";
            $scope.initializeFlatpickr($scope.blockedDates, "#dateRangePicker", $scope);
          });
      };

      /**
       * Start a conversation with the car owner
       * Creates or accesses an existing chat conversation and navigates to it
       * 
       * @param {Object} owner - The car owner's user information
       */
      $scope.chatWithOwner = (owner) => {
        // Create or get conversation with the owner
        ChatService.createConversation(owner, $scope.car._id)
          .then((conversation) => {
            // Navigate to conversations view with the car ID
            $state.go("conversations", { id: $scope.car._id });
          })
          .catch((err) => {
            ToastService.error(`Error creating the conversation ${err}`);
          });
      };
    }
  );
