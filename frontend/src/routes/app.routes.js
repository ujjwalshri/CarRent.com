/**
     * angular js route configuration
     * defines the routes for the application and the controllers associated with them
 */
angular.module("myApp").config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        .state("home", {
            url: "/home",
            templateUrl: "modules/home/home.html",
            controller: "homeCtrl",
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    RouteProtection.getLoggedinUser().then((user)=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                        if(user && user.isSeller){
                            $state.go('sellerListings');
                        }
                    }).catch((err)=>{
                     
                    })
                }]
            }
        })
        .state("login",{
            url: "/login",
            templateUrl: "modules/auth/login.html",
            controller: "loginCtrl",
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    RouteProtection.getLoggedinUser().then((user)=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                        if(user){
                            $state.go('home');
                        }
                        
                    }).catch((err)=>{
                        
                    })
                }]
            }
        })
        .state("signup",{
           url: "/signup",
           templateUrl: "modules/auth/signup.html",
           controller: "signupCtrl",
              resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    RouteProtection.getLoggedinUser().then((user)=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                        if(user){
                            $state.go('home');
                        }
                    }).catch((err)=>{
                        
                    })
                }]}
        })
        .state('car', {
            url: '/car',
            templateUrl: 'modules/car/addCarForm.html',
            controller: 'addCarCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                   RouteProtection.getLoggedinUser().then((user)=>{
                    if(user.isAdmin){
                        $state.go('admin');
                    }
                }).catch((err)=>{
                    console.log(err);
                    $state.go('login');
                })
                }]
            }
        })
        .state('admin', {
            url: '/admin',
            templateUrl: 'modules/admin/admin.html',
            controller: 'adminCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                  RouteProtection.getLoggedinUser().then((user)=>{
                    if(!user.isAdmin){
                        $state.go('home');
                    }
                }  ).catch((err)=>{
                    $state.go('login');
                })
                }]
            }
        })
        .state('admin.platformManagement', {
            url: '/platformManagement',
            views: {
                'adminContent@admin': { 
                    templateUrl: 'modules/admin/platformManagement/platformManagement.html',
                    controller: 'carCtrl'
                }
            }
        })
        .state('admin.userManagement',{
            url: '/userManagement',
            views: {
                'adminContent@admin': {
                    templateUrl: 'modules/admin/userManagement/userManagement.html',
                    controller: 'userManagementCtrl',
                }
            }
        })
        .state('admin.analytics',{
            url: '/analytics',
            views: {
                'adminContent@admin': {
                    templateUrl: 'modules/admin/Analytics/analytics.html',
                    controller: 'analyticsCtrl'
                }
            }
        })
        .state('singleCar',{
            url: '/singleCar/:id',
            templateUrl: 'modules/car/singleCar.html',
            controller: 'singleCarCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                  RouteProtection.getLoggedinUser().then((user)=>{
                    if(user && user.isAdmin){
                        $state.go('admin');
                    }}).catch((err)=>{
                        $state.go('login');
                    })
                }]
            }
        })
        .state('conversations', {
            url: '/conversations?/:id',
            templateUrl: 'modules/conversations/conversations.html',
            controller: 'conversationsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                   RouteProtection.getLoggedinUser().then((user)=>{
                    if(user && user.isAdmin){
                        $state.go('admin');
                    }
                   }).catch((err)=>{
                    $state.go('login');
                })
                }]
            }
        }) 
        .state('myProfile', {
            url: '/myProfile?/:id',
            templateUrl: 'modules/profile/myProfile.html',
            controller: 'myProfileCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    RouteProtection.getLoggedinUser().then(user=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                    }).catch(err=>{
                        $state.go('login');
                    })
                }]
            }
        })
        .state('userBookings', {
            url: '/userBookings',
            templateUrl: 'modules/booking/userBookings/userBookings.html',
            controller: 'userBookingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                   RouteProtection.getLoggedinUser().then((user)=>{
                    if(user && user.isAdmin){
                        $state.go('admin');
                    }
                    if(user.isSeller){
                        $state.go('ownerBookings');
                    }
                   }).catch((err)=>{
                    $state.go('login');
                })
                }]
            }
            
        })
        .state('ownerBookings', {
            url: '/ownerBiddings',
            templateUrl: 'modules/booking/ownerBookings/ownerBiddings.html',
            controller: 'ownerBiddingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    RouteProtection.getLoggedinUser().then((user)=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                        if(user.isSeller === false ){
                            $state.go('userBookings');
                        }
                    }).catch((err)=>{
                        $state.go('login');
                    })
                }]
            }
        })
        .state('bookingHistory', {
            url: '/bookingHistory',
            templateUrl: 'modules/booking/userBookings/bookingsHistory.html',
            controller: 'bookingsHistoryCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                   RouteProtection.getLoggedinUser().then((user)=>{
                    if(user && user.isAdmin){
                        $state.go('admin');
                    }
                   }).catch((err)=>{
                    $state.go('login'); 
                })
                }]
            }
        })
        .state('confirmedBookings', {
            url: '/confirmedBookings',
            templateUrl: 'modules/booking/ownerBookings/confirmedBookings.html',
            controller: 'confirmedBookingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                  RouteProtection.getLoggedinUser().then((user)=>{
                    if(user && user.isAdmin){
                        $state.go('admin');
                    }
                    if(user.isSeller){
                        $state.go('manageBookings');
                    }
                   }).catch((err)=>{
                    $state.go('login'); 
                   });
                }]
            }
        })
        .state('manageBookings', {
            url: '/manageBookings:id',
            templateUrl: 'modules/booking/ownerBookings/manageBookings.html',
            controller: 'manageBookingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    RouteProtection.getLoggedinUser().then((user)=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                       
                    }).catch((err)=>{
                        $state.go('login');
                    })
                }]
            }
        })
        .state('myBiddings', {
            url: '/myBiddings',
            templateUrl: 'modules/booking/userBookings/myBiddings.html',
            controller: 'myBiddingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    RouteProtection.getLoggedinUser().then((user)=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }

                        
                    }).catch((err)=>{
                        $state.go('login');
                    })
                }]
            }
        })
        .state('sellerAnalytics', {
            url: '/sellerAnalytics',
            templateUrl: 'modules/sellerAnalytics/sellerAnalytics.html',
            controller: 'sellerAnalyticsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    RouteProtection.getLoggedinUser().then((user)=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                        if(user.isSeller === false){
                            $state.go('home');
                        }
                    }).catch((err)=>{
                        $state.go('login');
                    })
                }]
            }
        })
        .state('verified', {
            url: '/verified',
            templateUrl: 'modules/auth/verifiedEmail.html',
            resolve : {
                auth : ['$state', 'RouteProtection', function($state, RouteProtection){
                    
                }]
            }
        })
        .state('sellerListings', {
            url: '/sellerListings',
            templateUrl: 'modules/sellerListings/sellerListings.html',
            controller: 'sellerListingsCtrl',
            resolve : {
                auth: ['$state', 'RouteProtection', function($state, RouteProtection){
                    RouteProtection.getLoggedinUser().then((user)=>{
                        
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                        if(user.isSeller === false){
                            $state.go('home');
                        }
                    }).catch((err)=>{
                        $state.go('login');
                    })
                }]
            }
        });
        
});
