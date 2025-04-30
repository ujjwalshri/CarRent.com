angular.module('myApp').component('backButton', {
    template: `
        <button class="btn btn-default" ng-click="$ctrl.goBack()">
            <span class="glyphicon glyphicon-arrow-left"></span> Back
        </button>
    `,
    controller: function ($window) {
        this.goBack = function () {
            $window.history.back();
        };
    }
});
