/**
 * Controller for managing car addons modal
 */
angular.module("myApp").controller('AddonsModalCtrl', function($scope, $uibModalInstance, userCars, AddonService, ToastService) {
    $scope.userCars = userCars;
    $scope.selectedCar = null;
    $scope.newAddon = {
        name: '',
        price: 0,
        description: ''
    };
    $scope.isLoading = false;

    // Load addons for selected car
    $scope.loadCarAddons = function() {
        $scope.isLoading = true;
        AddonService.getOwnAddons()
            .then(function(addons) {
                $scope.addons = addons;
            })
            .catch(function(error) {
                ToastService.error("Error loading addons: " + error);
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    // Initialize by loading addons
    $scope.loadCarAddons();

    // Add new addon
    $scope.addAddon = function() {
        $scope.isLoading = true;
        AddonService.addAddon($scope.newAddon)
            .then(function(addon) {
                ToastService.success("Addon added successfully");
                $scope.newAddon = {
                    name: '',
                    price: 0,
                    description: ''
                };
                $scope.loadCarAddons();
            })
            .catch(function(error) {
                ToastService.error("Error adding addon: " + error);
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Remove addon
    $scope.removeAddon = function(addonId) {
        if (confirm('Are you sure you want to remove this addon?')) {
            $scope.isLoading = true;
            AddonService.deleteAddon(addonId)
                .then(function() {
                    ToastService.success("Addon removed successfully");
                    $scope.loadCarAddons();
                })
                .catch(function(error) {
                    ToastService.error("Error removing addon: " + error);
                })
                .finally(function() {
                    $scope.isLoading = false;
                });
        }
    };

    // Cancel modal
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    // Close modal and return updated car
    $scope.close = function() {
        $uibModalInstance.close($scope.selectedCar);
    };
});