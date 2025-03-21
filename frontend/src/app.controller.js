const app = angular.module("myApp", ["ui.router", "ui.bootstrap"]);
app.controller("appCtrl", function($scope,$rootScope, ToastService,AuthService, RouteProtection) {
    //init function to run when the app first loads
    $scope.init = async function() {
        RouteProtection.getLoggedinUser().then((user)=>{
            $rootScope.isLogged = true;
            if(user.isAdmin){
                $rootScope.adminLogged = true;
            }
            if(user.isSeller){
                $rootScope.isSeller = true;
            }
        }
    )
    };

    //logout function to remove the user from the session storage
    $scope.logout = () => {  
        AuthService.logout().then((res) => {
            ToastService.success("Logged out successfully");
            $rootScope.isLogged = false;
        }).catch((err)=>{
            ToastService.error("Error logging out");
        })
    };
});
