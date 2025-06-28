/**
     * angular js route configuration
     * defines the routes for the application and the controllers associated with them
 */
angular.module("myApp").config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        .state("home", {
            url: "/home",
            templateUrl: "views/home/home.html",
            controller: "homeCtrl",
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                    }).catch((err)=>{
                       console.log(err);   
                    })
                }]
            }
        })
        .state("login",{
            url: "/login",
            templateUrl: "views/auth/login.html",
            controller: "loginCtrl",
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
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
           templateUrl: "views/auth/signup.html",
           controller: "signupCtrl",
              resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
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
        .state('becomeSeller', {
            url: '/becomeSeller',
            templateUrl: 'views/becomeSeller/becomeSeller.html',
            controller: 'becomeSellerCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
                    if(user.isAdmin){
                        $state.go('admin');
                    }
                    if(user && user.isSeller){
                        $state.go('home');
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
            templateUrl: 'views/admin/admin.html',
            controller: 'adminCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
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
                    templateUrl: 'views/admin/platformManagement/platformManagement.html',
                    controller: 'carCtrl'
                }
            }
        })
        .state('admin.userManagement',{
            url: '/userManagement',
            views: {
                'adminContent@admin': {
                    templateUrl: 'views/admin/userManagement/userManagement.html',
                    controller: 'userManagementCtrl',
                }
            }
        })
        .state('admin.analytics',{
            url: '/analytics',
            views: {
                'adminContent@admin': {
                    templateUrl: 'views/admin/Analytics/analytics.html',
                    controller: 'analyticsCtrl'
                }
            }
        })
        .state('singleCar',{
            url: '/singleCar/:id',
            templateUrl: 'views/car/singleCar.html',
            controller: 'singleCarCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{

                   
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
            templateUrl: 'views/conversations/conversations.html',
            controller: 'conversationsCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
                    if(user && user.isAdmin){
                        $state.go('admin');
                    }
                   }).catch((err)=>{
                    $state.go('login');
                })
                }]
            }
        }) 
        .state('exploreCars', {
            url: '/exploreCars',
            templateUrl: 'views/car/exploreCars.html',
            controller: 'exploreCarsCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                    }).catch((err)=>{
                    })
                }]
            }
        })

        .state('myProfile', {
            url: '/myProfile?/:id',
            templateUrl: 'views/profile/myProfile.html',
            controller: 'myProfileCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then(user=>{
                        if(user && user.isAdmin){
                            $state.go('admin');
                        }
                    }).catch(err=>{
                        $state.go('login');
                    })
                }]
            }
        })
        .state('myProfile.overview', {
            url: '/overview',
            templateUrl: 'views/profile/overview.html',
            controller: 'myProfileCtrl'
        })
        .state('myProfile.myConversations', {
            url: '/conversations',
            templateUrl: 'views/conversations/conversations.html',
            controller: 'conversationsCtrl'
        })
        .state('myProfile.biddings', {
            url: '/biddings',
            templateUrl: 'views/profile/userBookings/myBiddings/myBiddings.html',
            controller: 'myBiddingsCtrl'
        })
        .state('myProfile.bookingsHistory', {
            url: '/bookingsHistory',
            templateUrl: 'views/profile/userBookings/bookingsHistory/bookingsHistory.html',
            controller: 'bookingsHistoryCtrl'
        })
        .state('ownerBookings', {
            url: '/ownerBiddings',
            templateUrl: 'views/seller/sellerBookings/biddingRequests/ownerBiddings.html',
            controller: 'ownerBiddingsCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
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
            templateUrl: 'views/profile/userBookings/bookingsHistory/bookingsHistory.html',
            controller: 'bookingsHistoryCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
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
            templateUrl: 'views/seller/sellerBookings/confirmedBookings/confirmedBookings.html',
            controller: 'confirmedBookingsCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
                    if(user && user.isAdmin){
                        $state.go('admin');
                    }
                    if(user.isSeller === false){
                        $state.go('home');
                    }
                   }).catch((err)=>{
                    $state.go('login'); 
                   });
                }]
            }
        })
        .state('myBiddings', {
            url: '/myBiddings',
            templateUrl: 'views/profile/userBookings/myBiddings/myBiddings.html',
            controller: 'myBiddingsCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
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
            templateUrl: 'views/seller/sellerAnalytics/sellerAnalytics.html',
            controller: 'sellerAnalyticsCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
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
            templateUrl: 'views/auth/verifiedEmail.html',
            resolve : {
                auth : ['$state', 'AuthService', function($state, AuthService){
                    
                }]
            }
        })
        .state('sellerListings', {
            url: '/sellerListings',
            templateUrl: 'views/seller/sellerListings/sellerListings.html',
            controller: 'sellerListingsCtrl',
            resolve : {
                auth: ['$state', 'AuthService', function($state, AuthService){
                    AuthService.getLoggedinUser().then((user)=>{
                        
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


angular.module('myApp')
.run(function($window, $transitions) {
  $transitions.onSuccess({}, function() {
    $window.scrollTo(0, 0);
  });
});
