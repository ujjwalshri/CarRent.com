/**
 * @ngdoc controller
 * @name BookingsModalCtrl
 * @description
 * Controller for handling the bookings modal functionality.
 * 
 * @param {Object} $scope - AngularJS scope object.
 * @param {Object} selectedCar - The car object selected for viewing bookings.
 * @param {Object} $uibModalInstance - Instance of the modal for controlling modal actions.
 * @param {Object} CarService - Service for handling car-related API calls.
 * @param {Object} ToastService - Service for displaying toast notifications.
 * @param {Object} BiddingFactory - Factory for creating bidding objects.
 */
angular.module('myApp').controller('BookingsModalCtrl', [
    '$scope', 
    'selectedCar',
    '$uibModalInstance',
    'CarService',
    'ToastService',
    'BiddingFactory',
    function($scope, selectedCar, $uibModalInstance, CarService, ToastService, BiddingFactory) {
        /**
         * @ngdoc method
         * @name BookingsModalCtrl#init
         * @description
         * Initializes the modal by checking for selected car data and loading bookings.
         */
        if (!selectedCar) {
            ToastService.error('No car data provided');
            $uibModalInstance.dismiss('no car data');
            return;
        }
        
        $scope.selectedCar = selectedCar;
        $scope.carBookings = [];

        /**
         * @ngdoc method
         * @name BookingsModalCtrl#loadBookings
         * @description
         * Fetches bookings for the selected car and processes them.
         */
        CarService.fetchBookingsAtCarId(selectedCar._id)
            .then(function(response) {
                if(response.length > 0){
                    $scope.carBookings = response.map(booking =>{
                        return BiddingFactory.createBid(booking, false);
                    });
                }else{
                    $scope.carBookings = [];
                }  
            })
            .catch(function(error) {
                ToastService.error('Error fetching bookings: ' + error.message);
                $uibModalInstance.dismiss();
            });

        /**
         * @ngdoc method
         * @name BookingsModalCtrl#close
         * @description
         * Closes the modal and resolves the modal instance.
         */
        $scope.close = function() {
            $uibModalInstance.close();
        };
        
        /**
         * @ngdoc method
         * @name BookingsModalCtrl#dismiss
         * @description
         * Dismisses the modal and rejects the modal instance.
         */
        $scope.dismiss = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);