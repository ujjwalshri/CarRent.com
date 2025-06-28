/**
 * My Profile Controller
 * Handles user profile data display, editing, and car management for sellers
 * @module myProfileCtrl
 */
angular.module("myApp").controller("myProfileCtrl", function($scope, $state, ToastService, UserService, AuthService, $rootScope, SocketService) {

    $scope.loadingProfileData = false;
    
    /**
     * Initializes the controller
     * Fetches user profile and car data
     */
    $scope.init = () => {
        fetchProfileData();
    };

    /**
     * Fetches profile data including user details
     */
    function fetchProfileData() {
        $scope.loadingProfileData = true;
        UserService.getUserProfile().then((result) => {
                $scope.user = result.data;
                if($scope.user.isSeller){
                    return UserService.getSellerRating($scope.user._id);
                }else{
                    return null;
                }
        })
        .then((res)=>{
            if(res){
                $scope.user.rating = res.sellerRating[0]?.averageRating.toFixed(1);
            }
        })
        .catch((err) => {
            ToastService.error("Error fetching the profile data" + err);
        }).finally(() => {
            $scope.loadingProfileData = false;
        });
    }
  

      /**
     * Logs out the current user
     * removes the user cookie and sets isLogged to false
     * @returns {Promise<void>}
     */
      $scope.logout = () => {  
        AuthService.logout().then((res) => {
            // Disconnect socket before logout
            SocketService.disconnect();
            
            ToastService.success("Logged out successfully");
            $rootScope.$emit('user:loggedOut');
            $rootScope.isLogged = false;
            $state.go('login');

        }).catch((err)=>{
            ToastService.error("Error logging out");
        })
    };
    

});