angular.module("myApp").controller("adminCtrl", function($scope, $state, $rootScope, AuthService) {
    // function to logout the admin on the admin page
    $scope.adminLogout = ()=>{
        AuthService.logout().then((res)=>{
            $state.go("login");
            $rootScope.isLogged = false;
            $rootScope.adminLogged = false;
        }).catch(err=>{
            console.log(err);
        });
    }
});