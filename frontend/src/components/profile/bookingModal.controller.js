angular.module('myApp').controller('BookingsModalCtrl', [
    '$scope', 
    'selectedCar',
    '$uibModalInstance',
    'BiddingService',
    'CarService',
    'ToastService',
    'BiddingFactory',
    function($scope, selectedCar, $uibModalInstance, BiddingService, CarService, ToastService, BiddingFactory) {
        // Make sure all dependencies are properly injected
        if (!selectedCar) {
            ToastService.error('No car data provided');
            $uibModalInstance.dismiss('no car data');
            return;
        }
        
        $scope.selectedCar = selectedCar;
        console.log('Selected car in the modal:', $scope.selectedCar);
        $scope.carBookings = [];

        console.log(CarService);

        // Load bookings when modal opens
        CarService.fetchBookingsAtCarId(selectedCar._id)
            .then(function(response) {
                console.log('Bookings:', response);   
                if(response.length > 0){
                    $scope.carBookings = response.map(booking =>{
                        return BiddingFactory.createBid(booking, false);
                    });
                }else{
                    $scope.carBookings = [];
                }
                console.log('Bookings:', $scope.carBookings);   
            })
            .catch(function(error) {
                ToastService.error('Error fetching bookings: ' + error.message);
                $uibModalInstance.dismiss();
            });

        // Add close/dismiss functions that the modal template can use
        $scope.close = function() {
            $uibModalInstance.close();
        };
        
        $scope.dismiss = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);