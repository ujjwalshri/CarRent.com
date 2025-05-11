/**
 * Taxes Management Controller
 * Handles all tax-related operations in the admin platform management section
 */
angular.module('myApp').controller('taxesManagementCtrl', function($scope, TaxService, ToastService, $uibModal, BiddingFactory) {
    
    // Initialize variables
    $scope.taxes = [];
    $scope.isLoading = false;
    $scope.newTax = {
        name: '',
        type: 'percentage',
        value: 0,
        isActive: true
    };
    $scope.validateTax = BiddingFactory.validateTax;
    
    /**
     * Initialize controller
     */
    $scope.init = function() {
        $scope.fetchTaxes();
    };
    
    /**
     * Fetch all taxes from the API
     */
    $scope.fetchTaxes = function() {
        $scope.isLoading = true;
        
        TaxService.getAllTaxes()
            .then(function(taxes) {
                $scope.taxes = taxes;
            })
            .catch(function(error) {
                ToastService.error(error);
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    /**
     * Add a new tax
     */
    $scope.addTax = function() {
        if (!$scope.validateTax($scope.newTax)) {
            return;
        }
        
        $scope.isLoading = true;
        
        TaxService.addTax($scope.newTax)
            .then(function() {
                ToastService.success('Tax added successfully');
                $scope.fetchTaxes();
                
                // Reset form
                $scope.newTax = {
                    name: '',
                    type: 'percentage',
                    value: 0,
                    isActive: true
                };
            })
            .catch(function(error) {
                ToastService.error(error);
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    /**
     * Opens a modal to edit a tax
     * @param {Object} tax - The tax to edit
     */
    $scope.openEditTaxModal = function(tax) {
        const modalInstance = $uibModal.open({
            templateUrl: 'editTaxModal.html',
            controller: 'editTaxModalCtrl',
            resolve: {
                tax: function() {
                    // Create a copy to avoid modifying the original tax object
                    return angular.copy(tax);
                },
                validateTax : function() {
                    return $scope.validateTax;
                }
            }
        });
        
        modalInstance.result.then(function() {
            // Refresh taxes list on successful edit
            $scope.fetchTaxes();
        });
    };
    
    /**
     * Delete a tax with confirmation
     * @param {Object} tax - The tax to delete
     */
    $scope.deleteTax = function(tax) {
        if (!window.confirm(`Are you sure you want to delete "${tax.name}" tax?`)) {
            return;
        }
        
        $scope.isLoading = true;
        
        TaxService.deleteTax(tax._id)
            .then(function() {
                ToastService.success('Tax deleted successfully');
                $scope.fetchTaxes();
            })
            .catch(function(error) {
                ToastService.error(error);
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    /**
     * Toggle the active status of a tax
     * @param {Object} tax - The tax to toggle
     */
    $scope.toggleTaxStatus = function(tax) {
        $scope.isLoading = true;
        
        TaxService.toggleTaxStatus(tax._id)
            .then(function() {
                const statusText = tax.isActive ? 'deactivated' : 'activated';
                ToastService.success(`Tax ${statusText} successfully`);
                $scope.fetchTaxes();
            })
            .catch(function(error) {
                ToastService.error(error);
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    /**
     * Format the value display based on tax type
     * @param {Object} tax - The tax object
     * @returns {string} - The formatted value
     */
    $scope.formatValue = function(tax) {
        if(tax.type === 'percentage') {
            return tax.value + '%';
        } else {
            return '₹' + tax.value.toFixed(2);
        }
    };

});

/**
 * Edit Tax Modal Controller
 * Handles tax editing in a modal window
 */
angular.module('myApp').controller('editTaxModalCtrl', function($scope, $uibModalInstance, TaxService, ToastService, tax, validateTax) {
    $scope.tax = tax;
    
    $scope.save = function() {
        // Validate tax data
        if (!validateTax($scope.tax)) {
            return;
        }
        
        TaxService.updateTax($scope.tax._id, $scope.tax)
            .then(function() {
                ToastService.success('Tax updated successfully');
                $uibModalInstance.close();
            })
            .catch(function(error) {
                ToastService.error(error);
            });
    };
    
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});