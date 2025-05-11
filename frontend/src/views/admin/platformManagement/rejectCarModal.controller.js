angular.module('myApp').controller('rejectCarModalCtrl', function($scope, $uibModalInstance, car) {
    $scope.car = car;
    $scope.rejectionData = {
        reason: ''
    };

    $scope.submit = function() {
        if (!$scope.rejectionData.reason) {
            return;
        }
        $uibModalInstance.close($scope.rejectionData);
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});