angular.module('myApp').controller('OverlappingBidsModalCtrl', [
    '$scope',
    '$uibModalInstance',
    'overlappingBids',
    'selectedBid',
    'BiddingService',
    'ToastService',
    'BiddingFactory',
    function($scope, $uibModalInstance, overlappingBids, selectedBid, BiddingService, ToastService, BiddingFactory) {
        $scope.overlappingBids = overlappingBids.map(bid => BiddingFactory.createBid(bid, false));
        $scope.selectedBid = selectedBid;
        $scope.confirm = function() {
            BiddingService.approveBid($scope.selectedBid._id)
                .then(() => {
                    ToastService.success("Bidding approved successfully");
                    $uibModalInstance.close(true);
                })
                .catch((err) => {
                    ToastService.error(`Error approving bidding: ${err}`);
                    $uibModalInstance.dismiss('error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
]); 