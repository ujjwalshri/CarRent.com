angular.module('myApp').controller('manageBookingsCtrl', function($scope, $stateParams, IDB, BiddingFactory,$state, ToastService,BackButton, BiddingService) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    const bookingID = $stateParams.id; // get the booking id from the state params
    $scope.calculateBookingPrice = BiddingFactory.calculate; // function to calculate the booking price from the booking factory
    $scope.startOdometerValue = 0; // initial start odometer value
   
   // init function to run when the page mounts
    $scope.init = () => {
        $scope.startOdometerValue = ''; // initial start odometer value
        $scope.endOdometerValue = ''; // initial end odometer value
        $scope.ended = false; // initial end status
        console.log(bookingID);
        BiddingService.getBid(bookingID).then((booking) => { // get the booking by the booking id
            $scope.booking = BiddingFactory.createBid(booking.booking, false); 
            console.log($scope.booking);    
            $scope.started = $scope.booking.status === 'started'; // set started to the booking started status
            console.log($scope.booking);
            $scope.booking.startDate = new Date($scope.booking.startDate); // convert startDate to Date object
            $scope.booking.endDate = new Date($scope.booking.endDate); // convert endDate to Date object
            $scope.started = $scope.booking.started; // set started to the booking started status
            $scope.ended = $scope.booking.ended; // set ended to the booking ended status
        }).catch((err) => {
            ToastService.error(`Error fetching the booking ${err}`); // show error message if there is an error
        });
    };
  
    // function to start the trip when the user clicks on the start trip button
    $scope.startTrip = () => {
      
        if (!$scope.started) {
            BiddingService.startBooking($scope.booking._id, $scope.startOdometerValue).then(() => { // call to the database function to update the booking  and add the start odometer value
                $scope.booking.startOdometerValue = $scope.startOdometerValue;
                $scope.started = true;
                $state.go('confirmedBookings');
            }).catch((err) => {
                console.log(err);
            });
        }
    };
   // function to end the trip when the user clicks on the end trip button 
    $scope.endTrip = () => {
        console.log("$scope.booking.startOdometerValue");
        if ($scope.booking.status==='started') {
            console.log("$scope.booking.startOdometerValue");
            if($scope.booking.startOdometerValue > $scope.endOdometerValue){ // check if the end odometer value is greater than the start odometer value
                ToastService.error("End Odometer value should be greater than start odometer value"); // show the error message
                return; // return from the function
            }
            BiddingService.endBooking($scope.booking._id, $scope.endOdometerValue).then(() => { // call to the database function to update the booking  and add the end odometer value
                ToastService.success("Booking ended successfully"); // show success message
                $scope.booking.endOdometerValue = $scope.endOdometerValue; 
                $state.go('confirmedBookings');
                $scope.started = false; // setting the started status to false
                $scope.ended = true; // setting the ended status to true

            }).catch((err) => {
               ToastService.error(`Error ending the trip ${err}`); // show error message if there is an error
            });
        }
    };
});