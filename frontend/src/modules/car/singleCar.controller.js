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
      RouteProtection,
      UserService
    ) {
    
      // Utility function to calculate booking price based on date range
      $scope.calculateBookingPrice = BiddingFactory.calculate;
      $scope.initializeFlatpickr = BiddingFactory.initializeFlatpickr;
      $scope.totalAddonPrice = 0;
      
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
      $scope.processingBid = false;   // Loading state for bid processing
      $scope.platformFeePercentage = 0; // Platform fee percentage
      $scope.selectedAddons = []; // selected Addons state
      $scope.sellerRating = 0; // seller rating

      /**
       * Function to initialize the car details page
       * Fetches car data, reviews, and sets up date picker
       */
      $scope.init = () => {
        fetchCarData();
        $scope.loadReviews();
      };

      /**
       * Fetches car data, bookings, user info, platform fees and seller rating
       * Makes parallel API calls using $q.all() to optimize loading time
       * Updates scope variables with fetched data
       * Initializes date picker with blocked dates
       * Sets up add-ons for the car
       * 
       * API calls made:
       * - CarService.getCarById() - Gets details of specific car
       * - CarService.fetchBookingsAtCarId() - Gets existing bookings
       * - RouteProtection.getLoggedinUser() - Gets current user info
       * - CarService.getCharges() - Gets platform fee percentage
       * - BiddingService.getAddOnsForUser() - Gets available add-ons
       * - UserService.getSellerRating() - Gets seller's rating
       * 
       * @returns {void}
       * @throws {Error} If any API calls fail
       */
      function fetchCarData() {
        $scope.isLoading = true;
        $q.all([
          CarService.getCarById($stateParams.id),
          CarService.fetchBookingsAtCarId($stateParams.id),
          RouteProtection.getLoggedinUser(),
          CarService.getCharges(),
        ])
          .then((results) => {
            $scope.blockedDates = BiddingFactory.calculateBlockedDates(results);
            $scope.initializeFlatpickr($scope.blockedDates, "#dateRangePicker", $scope);
            $scope.car = results[0].data;
            $scope.LoggedinUser = results[2];
            $scope.platformFeePercentage = results[3][0].percentage;
            return BiddingService.getAddOnsForUser($scope.car.owner._id); 
          })
          .then(({addOns})=>{
            $scope.addOns = addOns;
            return UserService.getSellerRating($scope.car.owner._id);
          })
          .then(({sellerRating})=>{
            $scope.sellerRating = sellerRating[0]?.averageRating;
          })
          .catch((error) => {
            ToastService.error(`error fetching the car data ${error}`);
          }).finally(()=>{
            $scope.isLoading = false;
          });
      }

      // Function to handle addon selection
      $scope.toggleAddon = function(addon) {
        const index = $scope.selectedAddons.findIndex(a => a._id === addon._id);
        if (index === -1) {
          $scope.selectedAddons.push(addon);
          $scope.totalAddonPrice += addon.price;
        } else {
          $scope.selectedAddons.splice(index, 1);
          $scope.totalAddonPrice -= addon.price;
        }
        
      }
      // Function to check if an addon is selected
      $scope.isAddonSelected = function(addonId) {
        return $scope.selectedAddons.some(addon => addon._id === addonId);
      }

      /**
       * @description Makes API call to get paginated reviews for the current car.
       * Concatenates new reviews to existing ones and updates the average rating.
       * Updates hasMoreReviews flag if fewer reviews than limit are returned.
       * @function loadReviews
       * @memberof singleCarCtrl
       * @instance
       * 
       * @uses CarService.getReviewsByCarId
       * @uses ToastService.error
       * 
       * @param {void}
       * @returns {void}
       * 
       * @example
       * $scope.loadReviews();
       */
      $scope.loadReviews = () => {

        const params = {
          skip: $scope.skip,
          limit: $scope.limit,
        }
    
        CarService.getReviewsByCarId($stateParams.id, params)
          .then((res) => {
            $scope.carReviews = $scope.carReviews.concat(res.data.reviews);
            if(res.data.reviews.length < $scope.limit) {
              $scope.hasMoreReviews = false;
            }
            $scope.averageRating = parseFloat(res.data.avgRating).toFixed(1);
          })
          .catch((err) => { 
            ToastService.error(`Error fetching the reviews ${err}`);
          });
      }

      // Load more reviews when user clicks "Load More"
      $scope.loadMoreReviews = () => {
        $scope.skip = $scope.skip + $scope.limit;
        $scope.loadReviews();
      }

      /**
       * @description Places a bid for renting the car. Validates the bid amount and date range 
       * before submitting. Creates a bidding object and sends it to the server.
       * @function placeBid
       * @memberof singleCarCtrl
       * @instance
       * 
       * @uses BiddingFactory.createBid
       * @uses BiddingService.addBid
       * @uses ToastService.error
       * @uses ToastService.info
       * 
       * @param {void}
       * @returns {void}
       * 
       * @example
       * $scope.placeBid();
       */
      $scope.placeBid = async () => {

        $scope.processingBid = true;
        
        if($scope.amount < $scope.car.price) {
          ToastService.error("Bid amount should be greater than the car price");
          $scope.isLoading = false;
          return;
        }


        const ownerObj = {
          _id: $scope.car.owner._id,
          username: $scope.car.owner.username,
          email: $scope.car.owner.email, 
          firstName: $scope.car.owner.firstName,
          lastName: $scope.car.owner.lastName,
          city: $scope.car.owner.city
        }



        const bid = BiddingFactory.createBid({
          amount: $scope.amount, 
          startDate: $scope.startDate, 
          endDate: $scope.endDate, 
          owner: ownerObj,
          selectedAddons: $scope.selectedAddons
        });
        


        if(bid.error) {
          ToastService.error(bid.error);
          $scope.isLoading = false;
          $scope.processingBid = false;
          return;
        }

        BiddingService.addBid($stateParams.id, bid)
          .then((res) => {
            ToastService.info("Bid processing started wait for the bid to get saved");
          })
          .catch((err) => {
            ToastService.error(`Error placing the bid ${err}`);
          })
          .finally(() => {
            $scope.processingBid = false;
            $scope.amount = "";
            $scope.startDate = "";
            $scope.endDate = "";
            $scope.selectedAddons = [];
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
          .then(() => {
            // Navigate to conversations view with the car ID
            $state.go("conversations", { id: $scope.car._id });
          })
          .catch((err) => {
            ToastService.error(`Error creating the conversation ${err}`);
          });
      };
    }
  );
