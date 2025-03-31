angular
  .module("myApp")
  .controller(
    "singleCarCtrl",
    function (
      $scope,
      $state,
      $q,
      IDB,
      $stateParams,
      Booking,
      $timeout,
      ToastService,
      BackButton, 
      CarService,
      BiddingService,
      ChatService,
      BiddingFactory,
      RouteProtection
    ) {
      $scope.back = BackButton.back; // back function to go back to the previous page
    
      $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price
      
      $scope.car = {}; // initial car object
      $scope.carReviews = []; // intital car reviews array
      $scope.blockedDates = []; //initial blocked dates array
      $scope.averageRating = 0; // initial average rating for each car
      $scope.skip = 0; // initial skip value for the reviews
      $scope.limit = 3; // initial limit value for the reviews
      $scope.hasMoreReviews = true; // initial hasMoreReviews value
      $scope.LoggedinUser = {}; // initial logged in user object
      $scope.isLoading = false;
      // init function to fetch the car, reviews and blocked dates
      $scope.init = () => {
        fetchCarData();
        $scope.loadReviews();
      };

      /* 
        function to fetch the car data
      */
      function fetchCarData() {
        $q.all([
          CarService.getCarById($stateParams.id),
          CarService.fetchBookingsAtCarId($stateParams.id),
          RouteProtection.getLoggedinUser(), 
        ])
          .then((results) => {
            console.log(results[1]);
            $scope.blockedDates = BiddingFactory.calculateBlockedDates(results);
            console.log($scope.blockedDates);
            $scope.car = results[0].data; // set the car to the first of result
            $scope.LoggedinUser = results[2];
            initializeFlatpickr(); // initialize the flatpickr date range picker
          })
          .catch((error) => {
            ToastService.error(`error fetching the car data ${error}`); // error toast
          });
      }
   
      // initialize the flatpickr date range picker
      function initializeFlatpickr() {
        // using timeout to make sure the angular updates the views after we have the blocked dates
        $timeout(() => {
          flatpickr("#dateRangePicker", {
            mode: "range",
            dateFormat: "Y-m-d",
            minDate: "today",
            disable: $scope.blockedDates,
            onClose: function (selectedDates) {
              if (selectedDates.length === 2) {
                $scope.startDate = selectedDates[0].toISOString();
                $scope.endDate = selectedDates[1].toISOString();
                $timeout(); // using timeout to trigger the changes in the above score variables
              }
            },
          });
        });
      }

     /*
     function to load all the reviews of the car
     */
      $scope.loadReviews = ()=>{
        const params ={
          skip: $scope.skip,
          limit: $scope.limit,
        }
        CarService.getReviewsByCarId($stateParams.id, params ).then((res)=>{
          console.log(res.data);
          $scope.carReviews = $scope.carReviews.concat(res.data.reviews);
          if(res.data.reviews.length < $scope.limit){
            $scope.hasMoreReviews = false;
          }
          console.log($scope.carReviews);
          $scope.averageRating = parseFloat(res.data.avgRating).toFixed(1);
        }).catch((err)=>{ 
          ToastService.error(`Error fetching the reviews ${err}`);
        })
      }

      $scope.loadMoreReviews = ()=>{
        $scope.skip = $scope.skip + $scope.limit;
        $scope.loadReviews();
      }

      /* 
         This function is used to place a bid
      */
         $scope.placeBid = async () => {
          $scope.isLoading = true;
          if($scope.amount < $scope.car.price){
            ToastService.error("Bid amount should be greater than the car price");
            $scope.isLoading = false;
            return;
          }

          const ownerObj = {
            _id: $scope.car.owner._id,
            username: $scope.car.owner.username,
            email : $scope.car.owner.email, 
            firstName: $scope.car.owner.firstName,
            lastName: $scope.car.owner.lastName,
            city: $scope.car.owner.city
          }

          let bidding = {};
          console.log($scope.amount);
          const bid = BiddingFactory.createBid({amount: $scope.amount, startDate:$scope.startDate, endDate:$scope.endDate, owner:ownerObj});
          console.log("bidding factory's");
          console.log(bid);
          if(bid.error){
            ToastService.error(bid.error);
            $scope.isLoading = false;
            return;
          }else{
            bidding = bid;
          }

          BiddingService.addBid($stateParams.id, bidding).then((res)=>{
            ToastService.success("Bid placed successfully");
          }).catch((err)=>{
            ToastService.error(`Error placing the bid ${err}`);
          }).finally(()=>{
            $scope.isLoading = false;
            $scope.amount = "";
            $scope.startDate = "";
            $scope.endDate = "";
          })
        };

      /*
      function to chat with the owner
      */
      $scope.chatWithOwner = (owner) => {
        console.log(owner);
        ChatService.createConversation(owner, $scope.car._id).then((conversation)=>{
          $state.go("conversations", { id: $scope.car._id });
        }).catch((err)=>{
          ToastService.error(`Error creating the conversation ${err}`);
        })
      };
    }
  );
