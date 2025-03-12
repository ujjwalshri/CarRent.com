angular.module("myApp").controller("adminCtrl", function($scope, $state, $rootScope) {
    // function to logout the admin on the admin page
    $scope.adminLogout = ()=>{
        sessionStorage.removeItem("user");
        $state.go("login");
        $rootScope.isLogged = false;
        $rootScope.adminLogged = false;
    }
});