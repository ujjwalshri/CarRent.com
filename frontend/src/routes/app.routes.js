angular.module("myApp").config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        .state("home", {
            url: "/home",
            templateUrl: "components/home/home.html",
            controller: "homeCtrl",
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                }]
            }
        })
        .state("login",{
            url: "/login",
            templateUrl: "components/auth/login.html",
            controller: "loginCtrl",
            // resolve : {
            //     auth: ['$state', 'RouteProtection', function($state, RouteProtection){
            //         if(RouteProtection.isAuthorized()){
            //             $state.go('home');
            //         }
            //     }]
            // }
        })
        .state("signup",{
           url: "/signup",
           templateUrl: "components/auth/signup.html",
           controller: "signupCtrl",
              resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                     if(RouteProtection.isAuthorized()){
                          $state.go('home');
                     }
                }]}
        })
        .state('car', {
            url: '/car',
            templateUrl: 'components/car/addCarForm.html',
            controller: 'addCarCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                }]
            }
        })
        .state('admin', {
            url: '/admin',
            templateUrl: 'components/admin/admin.html',
            controller: 'adminCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(!RouteProtection.isAdmin()){
                        $state.go('home');
                    }
                }]
            }
        })
        .state('admin.carApprovals', {
            url: '/carApprovals',
            views: {
                'adminContent@admin': { 
                    templateUrl: 'components/admin/carApprovals/carApprovals.html',
                    controller: 'carCtrl'
                }
            }
        })
        .state('admin.userManagement',{
            url: '/userManagement',
            views: {
                'adminContent@admin': {
                    templateUrl: 'components/admin/userManagement/userManagement.html',
                    controller: 'userManagementCtrl',
                }
            }
        })
        .state('admin.analytics',{
            url: '/analytics',
            views: {
                'adminContent@admin': {
                    templateUrl: 'components/admin/Analytics/analytics.html',
                    controller: 'analyticsCtrl'
                }
            }
        })
        .state('singleCar',{
            url: '/singleCar/:id',
            templateUrl: 'components/car/singleCar.html',
            controller: 'singleCarCtrl',
            // resolve : {
            //     auth: ['$state', 'RouteProtection', function($state, RouteProtection){
            //         if(!RouteProtection.isAuthorized()){
            //             $state.go('login');
            //         }
            //         if(RouteProtection.isAdmin()){
            //             $state.go('admin');
            //         }
            //     }]
            // }
        })
        .state('conversations', {
            url: '/conversations:id',
            templateUrl: 'components/conversations/conversations.html',
            controller: 'conversationsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                }]
            }
        }) 
        .state('myProfile', {
            url: '/myProfile',
            templateUrl: 'components/profile/myProfile.html',
            controller: 'myProfileCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                }]
            }
        })
        .state('userBookings', {
            url: '/userBookings',
            templateUrl: 'components/booking/userBookings/userBookings.html',
            controller: 'userBookingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                    if(RouteProtection.isSeller()){
                        $state.go('ownerBookings');
                    }
                }]
            }
            
        })
        .state('ownerBookings', {
            url: '/ownerBookings',
            templateUrl: 'components/booking/ownerBookings/ownerBookings.html',
            controller: 'ownerBookingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                    if(RouteProtection.isBuyer()){
                        $state.go('userBookings');
                    }
                }]
            }
        })
        .state('bookingHistory', {
            url: '/bookingHistory',
            templateUrl: 'components/booking/userBookings/bookingsHistory.html',
            controller: 'bookingsHistoryCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                    
                }]
            }
        })
        .state('confirmedBookings', {
            url: '/confirmedBookings',
            templateUrl: 'components/booking/ownerBookings/confirmedBookings.html',
            controller: 'confirmedBookingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                    if(RouteProtection.isBuyer()){
                        $state.go('userBookings');
                    }
                }]
            }
        })
        .state('manageBookings', {
            url: '/manageBookings:id',
            templateUrl: 'components/booking/ownerBookings/manageBookings.html',
            controller: 'manageBookingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                    if(RouteProtection.isBuyer()){
                        $state.go('userBookings');
                    }
                }]
            }
        })
        .state('myBiddings', {
            url: '/myBiddings',
            templateUrl: 'components/booking/userBookings/myBiddings.html',
            controller: 'myBiddingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                    if(RouteProtection.isSeller()){
                        $state.go('ownerBookings');
                    }
                }]
            }
        })
        .state('sellerAnalytics', {
            url: '/sellerAnalytics',
            templateUrl: 'components/sellerAnalytics/sellerAnalytics.html',
            controller: 'sellerAnalyticsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    if(!RouteProtection.isAuthorized()){
                        $state.go('login');
                    }
                    if(RouteProtection.isAdmin()){
                        $state.go('admin');
                    }
                    if(RouteProtection.isBuyer()){
                        $state.go('home');
                    }
                }]
            }
            
        })
        
        
});
