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
      Bidding,
      Booking,
      $timeout,
      ToastService,
      BackButton
    ) {
      $scope.back = BackButton.back; // back function to go back to the previous page
      const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // get the logged in user from the session storage
      $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price
      $scope.user = loggedInUser.username; // get the username of the logged in user
      $scope.car = {}; // initial car object
      $scope.carReviews = []; // intital car reviews array
      $scope.blockedDates = []; //initial blocked dates array
      $scope.averageRating = 0; // initial average rating for each car
      // init function to fetch the car, reviews and blocked dates
      $scope.init = () => {
        fetchCarData();
      };

      // function to fetch all the car data to be displayed on the single car page
      function fetchCarData() {
        $q.all([
          IDB.getCarByID($stateParams.id), // get the car by the id
          IDB.getReviewsByCarID($stateParams.id), // get the reviews by the car id
          IDB.getBookingsByCarID($stateParams.id), // get the bookings by the car id
        ])
          .then((results) => {
            helper(results); // function to calculate the average rating and blocked dates of the car
            initializeFlatpickr(); // initialize the flatpickr date range picker
          })
          .catch((error) => {
            ToastService.error(`error fetching the car data ${error}`); // error toast
          });
      }
      /*
          Helper function to calculate the average rating and blocked dates of the car
      */
      function helper(results) {
        $scope.car = results[0]; // set the car to the first of result
        $scope.carReviews = results[1]; // set the car reviews to the second of result
        const totalOfRatings = $scope.carReviews.reduce(
          (acc, review) => acc + review.rating,
          0
        );
        $scope.averageRating = parseFloat(
          (totalOfRatings / $scope.carReviews.length).toFixed(1)
        );
        if ($scope.carReviews.length === 0) {
          $scope.averageRating = 0;
        }

        // function to get the dates between the start and end date to block the dates
        $scope.blockedDates = results[2]
          .filter(
            (bid) => bid.status === "approved" || bid.status === "reviewed"
          )
          .flatMap((bid) =>
            getDatesBetween(new Date(bid.startDate), new Date(bid.endDate))
          );
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
         This function is used to place a bid
      */
         $scope.placeBid = async () => {
          const bidding = {
            id: crypto.randomUUID(),
            amount: $scope.amount,
            vehicle: $scope.car,
            startDate: $scope.startDate,
            endDate: $scope.endDate,
            status: "pending",
            from: {
              id: loggedInUser.id,
              username: loggedInUser.username,
              firstName: loggedInUser.firstName,
              lastName: loggedInUser.lastName,
              email: loggedInUser.email,
              isBlocked: loggedInUser.isBlocked,
              isSeller: loggedInUser.isSeller,
              city: loggedInUser.city,
            },
            owner: $scope.car.owner,
            createdAt: new Date(),
            location: $scope.car.location,
          };
        
          const isValidSchema = Bidding.validateBiddingSchema(bidding);
          if (!isValidSchema) {
            ToastService.error("Invalid bidding schema");
            return;
          }
          const isValid = Bidding.isValidBid(bidding);
          if (!isValid.success) {
            ToastService.error(`Invalid bid ${isValid.message}`);
            return;
          }
        
          IDB.addBid(bidding)
            .then(() => {
              ToastService.success("Bid placed successfully"); // bid placed successfully toast
              return IDB.getUserConversations(loggedInUser.id);
            })
            .then((conversations) => {
              const existingConversation = conversations.find((convo) => {
                return convo.car.id === $scope.car.id && convo.receiver.id === $scope.car.owner.id;
              });
              if (existingConversation) {
                console.log("Existing conversation found", existingConversation);
                const startDate = new Date($scope.startDate).toDateString();
                const endDate = new Date($scope.endDate).toDateString();
               
                return IDB.addMessage({
                  message: `hi i have placed a bid on your ${$scope.car.carName} bid price = $${$scope.amount}  startDate: ${startDate} endDate: ${endDate}`, 
                  sender: loggedInUser.username, 
                  receiver: $scope.car.owner, 
                  conversation: existingConversation, 
                  createdAt: new Date(), 
                });
              } else {
                console.log("No existing conversation found");
                const conversation = {
                  sender: loggedInUser,
                  receiver: $scope.car.owner,
                  participants: [
                    {
                      id: loggedInUser.id,
                      username: loggedInUser.username,
                      firstName: loggedInUser.firstName,
                      lastName: loggedInUser.lastName,
                      email: loggedInUser.email,
                      isBlocked: loggedInUser.isBlocked,
                      isSeller: loggedInUser.isSeller,
                    },
                    $scope.car.owner,
                  ],
                  car: $scope.car,
                  createdAt: new Date(),
                };
                return IDB.addConversation(conversation).then((newConversation) => {
                  console.log("New conversation created", newConversation);
                  return IDB.getConversation(newConversation).then((conversation) => {
                    console.log(conversation);
                    return IDB.addMessage({
                      message: `hi i have placed a bid on your ${$scope.car.carName} bid price = ${$scope.amount} bid startDate: ${new Date($scope.startDate).toDateString()} bid endDate: ${new Date($scope.endDate).toDateString()}`, // Trim the message
                      sender: loggedInUser.username, // Set the sender to the logged in user
                      receiver: $scope.car.owner, // Set the receiver to the selected conversation receiver
                      conversation: conversation, // Set the conversation to the new conversation
                      createdAt: new Date(), // Set the createdAt to the current date
                    });
              });
                });
              }
            })
            .then(() => {
              $state.go("conversations", { id: $scope.car.id }); // redirect to the conversation page
            })
            .catch((error) => {
              ToastService.error(`Error Creating the conversation ${error}`); // error placing bid toast
            });
        };

      // function to chat with the owner of the car which creates a new chat if the conversation does not exist on the car and the buyer and seller and redirects to the conversation page
      // if the conversation does not exist then it creates a new conversation and then redirects to the conversation page
      $scope.chatWithOwner = (owner) => {
        async.waterfall(
          [
            function (callback) {
              IDB.getUserConversations(loggedInUser.id)
                .then((conversations) => callback(null, conversations))
                .catch((error) => callback(error));
            },
            function (conversations, callback) {
              const existingConversation = conversations.find(
                (conversation) =>
                  conversation.receiver.id === owner.id &&
                  conversation.car.id === $scope.car.id
              );

              if (existingConversation) {
                console.log(
                  "Existing conversation found",
                  existingConversation
                );
                $state.go("conversations", { id: $scope.car.id });
                return;
              }
              console.log("No existing conversation found");

              const conversation = {
                sender: loggedInUser,
                receiver: owner,
                participants: [
                  {
                    id: loggedInUser.id,
                    username: loggedInUser.username,
                    firstName: loggedInUser.firstName,
                    lastName: loggedInUser.lastName,
                    email: loggedInUser.email,
                    isBlocked: loggedInUser.isBlocked,
                    isSeller: loggedInUser.isSeller,
                  },
                  owner,
                ],
                car: $scope.car,
                createdAt: new Date(),
              };

              IDB.addConversation(conversation)
                .then(() => callback(null))
                .catch((error) => callback(error));
            },
          ],
          function (error) {
            if (error) {
              console.error("Error:", error);
              alert("There was an error. Please try again.");
            } else {
              console.log("Chat created successfully");
              $state.go("conversations", { id: $scope.car.id });
            }
          }
        );
      };

      // function to get dates between a start and end date
      function getDatesBetween(startDate, endDate) {
        let dates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
      }
    }
  );
