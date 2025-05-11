angular.module('myApp').controller('placeBidModalCtrl', function(
    $scope, 
    $uibModalInstance, 
    BiddingFactory, 
    BiddingService, 
    ToastService, 
    car, 
    addOns, 
    blockedDates,
    platformFeePercentage,
) {
    // Initial setup
    $scope.car = car;
    $scope.addOns = addOns;
    $scope.platformFeePercentage = platformFeePercentage;
    $scope.amount = car.price;
    $scope.startDate = "";
    $scope.endDate = "";
    $scope.selectedAddons = [];
    $scope.totalAddonPrice = 0;
    $scope.processingBid = false;
    
    // Function to check if an addon is selected
    $scope.isAddonSelected = function(addonId) {
        return $scope.selectedAddons.some(function(addon) {
            return addon._id === addonId;
        });
    };

    $scope.init=function(){
        BiddingFactory.initializeFlatpickr(blockedDates, '#modalDateRangePicker', $scope);
    }

    // Function to toggle addon selection
    $scope.toggleAddon = function(addon) {
        const index = $scope.selectedAddons.findIndex(item => item._id === addon._id);
        
        if (index === -1) {
            // Add addon
            $scope.selectedAddons.push(addon);
        } else {
            // Remove addon
            $scope.selectedAddons.splice(index, 1);
        }
        
        // Update total addon price
        $scope.totalAddonPrice = $scope.selectedAddons.reduce(function(total, addon) {
            return total + addon.price;
        }, 0);
    };

    // Calculate booking price function
    $scope.calculateBookingPrice = function(startDate, endDate, amount) {
        if (!startDate || !endDate || !amount) return 0;
        return BiddingFactory.calculate(startDate, endDate, amount);
    };

   


    // Place bid function
    $scope.placeBid = function() {
        $scope.processingBid = true;

        const ownerObj = {
            _id: $scope.car.owner._id,
            username: $scope.car.owner.username,
            email: $scope.car.owner.email, 
            firstName: $scope.car.owner.firstName,
            lastName: $scope.car.owner.lastName,
            city: $scope.car.owner.city
        };

        // Create bid object
        const bid = BiddingFactory.createBid({
            startDate: $scope.startDate,
            endDate: $scope.endDate,
            amount: $scope.amount,
            owner: ownerObj,
            selectedAddons: $scope.selectedAddons
        });

        if (bid.error) {
            ToastService.error(bid.error);
            $scope.processingBid = false;
            return;
        }

        // Send bid to server
        BiddingService.addBid($scope.car._id, bid)
            .then(function(res) {
                ToastService.info("Bid sent wait for the bid to get saved!");
                $uibModalInstance.close(true); // Close modal with success result
            })
            .catch(function(err) {
                ToastService.error(`Error placing the bid: ${err}`);
            })
            .finally(function() {
                $scope.processingBid = false;
            });
    };

    // Cancel function
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});