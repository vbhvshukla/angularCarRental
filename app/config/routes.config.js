mainApp.config(['$stateProvider', '$urlMatcherFactoryProvider', '$urlRouterProvider',
    function ($stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider) {
        $urlMatcherFactoryProvider.caseInsensitive(true);
        $urlRouterProvider.otherwise('/');
        $urlRouterProvider.when('/dashboard', '/dashboard/profile');
        $urlRouterProvider.when('/ownerdashboard', '/ownerdashboard/home');

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/views/home/home.view.html',
                controller: 'HomeController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAdmin: ['authService', '$state',
                        function (authService, $state) {
                            return authService.getUser().then(function (user) {
                                if (user && user.role === 'admin') {
                                    return $state.go('admindashboard');
                                }
                                if (user && user.role === 'owner' && user.isApproved===true) {
                                    return $state.go('ownerdashboard');
                                }
                                else{
                                    return $state.go('home')
                                }
                            });
                        }
                    ]
                }
            })
            .state('login', {
                url: '/login?redirect&params',
                templateUrl: 'app/views/auth/login/login.view.html',
                controller: 'LoginController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    if ($stateParams.redirect) {
                                        return $state.go($stateParams.redirect,
                                            JSON.parse($stateParams.params || '{}'));
                                    }
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner' && user.isApproved : return $state.go('ownerdashboard');
                                        case 'customer': return $state.go('home');
                                    }
                                    
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('register', {
                url: '/register',
                templateUrl: 'app/views/auth/register/register.view.html',
                controller: 'RegisterController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state',
                        function (authService, $state) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    switch (user.role) {
                                        case 'admin':
                                            return $state.go('admindashboard');
                                        case 'owner':
                                            return $state.go('owner.dashboard');
                                        case 'customer':
                                            return $state.go('dashboard');
                                    }
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('bid', {
                url: '/bid/:carId',
                templateUrl: 'app/views/bid/bid.view.html',
                controller: 'BiddingController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    if ($stateParams.redirect) {
                                        return $state.go($stateParams.redirect,
                                            JSON.parse($stateParams.params || '{}'));
                                    }
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner': return $state.go('owner.dashboard');
                                        // case 'customer': return $state.go('home');
                                    }
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('userdashboard', {
                url: '/dashboard',
                templateUrl: 'app/views/dashboard/user/user.dashboard.html',
                controller: 'UserDashboardController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner': return $state.go('owner.dashboard');
                                    }
                                }
                                else {
                                    $state.go("home");
                                }
                                return true;
                            });
                        }
                    ]
                },
                abstract: true
            })
            .state('userdashboard.profile', {
                url: '/profile',
                templateUrl: 'app/views/dashboard/user/profile/profile.view.html',
                controller: 'UserProfileController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner': return $state.go('owner.dashboard');
                                    }
                                }
                                else {
                                    $state.go("home");
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('userdashboard.bookings', {
                url: '/bookings',
                templateUrl: 'app/views/dashboard/user/bookings/bookings.view.html',
                controller: 'UserBookingsController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner': return $state.go('owner.dashboard');
                                    }
                                }
                                else {
                                    $state.go("home");
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('userdashboard.messages', {
                url: '/messages',
                templateUrl: 'app/views/dashboard/user/messages/messages.view.html',
                controller: 'UserMessagesController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner': return $state.go('owner.dashboard');
                                    }
                                }
                                else {
                                    $state.go("home");
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('userdashboard.message', {
                url: '/message/:chatId',
                templateUrl: 'app/views/dashboard/user/messages/message/message.view.html',
                controller: 'UserMessageController',
                controllerAs: 'vm',
                params: {
                    chatId: null
                },
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    if ($stateParams.redirect) {
                                        return $state.go($stateParams.redirect,
                                            JSON.parse($stateParams.params || '{}'));
                                    }
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner': return $state.go('owner.dashboard');
                                        // case 'customer': return $state.go('home');
                                    }
                                }
                                else {
                                    $state.go("home");
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('userdashboard.bids', {
                url: '/bids',
                templateUrl: 'app/views/dashboard/user/bids/allbids.view.html',
                controller: 'UserBidsController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    if ($stateParams.redirect) {
                                        return $state.go($stateParams.redirect,
                                            JSON.parse($stateParams.params || '{}'));
                                    }
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner': return $state.go('owner.dashboard');
                                        // case 'customer': return $state.go('home');
                                    }
                                }
                                else {
                                    $state.go("home");
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('admindashboard', {
                url: '/admindashboard',
                templateUrl: 'app/views/dashboard/admin/admin.view.html',
                controller: 'AdminController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    if ($stateParams.redirect) {
                                        return $state.go($stateParams.redirect,
                                            JSON.parse($stateParams.params || '{}'));
                                    }
                                    switch (user.role) {
                                        case 'owner': return $state.go('owner.dashboard');
                                        case 'customer': return $state.go('home');
                                    }
                                } else {
                                    $state.go("home");
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('adminanalytics', {
                url: '/adminanalytics',
                templateUrl: 'app/views/dashboard/admin/analytics/analytics.view.html',
                controller: 'AnalyticsController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams',
                        function (authService, $state, $stateParams) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    if ($stateParams.redirect) {
                                        return $state.go($stateParams.redirect,
                                            JSON.parse($stateParams.params || '{}'));
                                    }
                                    switch (user.role) {
                                        case 'owner' && user.isApproved: return $state.go('owner.dashboard');
                                        case 'customer': return $state.go('home');
                                    }
                                } else {
                                    $state.go("home");
                                }
                                return true;
                            });
                        }
                    ]
                }
            })
            .state('ownerdashboard', {
                url: '/ownerdashboard',
                templateUrl: 'app/views/dashboard/owner/ownerDashboard.view.html',
                controller: 'OwnerDashboardController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams', function (authService, $state, $stateParams) {
                        return authService.getUser().then(function (user) {
                            if (user) {
                                switch (user.role) {
                                    case 'admin': return $state.go('admindashboard');
                                    case 'owner' && !user.isApproved : return $state.go('home')
                                    case 'customer': return $state.go('home');
                                }
                            }
                            else {
                                $state.go("home");
                            }
                        })
                    }]
                }
            })
            .state('ownerdashboard.home', {
                url: '/home',
                templateUrl: 'app/views/dashboard/owner/home/home.view.html',
                controller: 'OwnerHomeDashboardController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams', function (authService, $state, $stateParams) {
                        return authService.getUser().then(function (user) {
                            if (user) {
                                switch (user.role) {
                                    case 'admin': return $state.go('admindashboard');
                                    case 'owner' && !user.isApproved : return $state.go('home')
                                    case 'customer': return $state.go('home');
                                }
                            }
                            else {
                                $state.go("home");
                            }
                        })
                    }]
                }
            })
            .state('ownerdashboard.listedcars', {
                url: '/listedcars',
                templateUrl: 'app/views/dashboard/owner/listedCars/listedCars.view.html',
                controller: 'OwnerListedCarsController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams', function (authService, $state, $stateParams) {
                        return authService.getUser().then(function (user) {
                            if (user) {
                                switch (user.role) {
                                    case 'admin': return $state.go('admindashboard');
                                    case 'owner' && !user.isApproved : return $state.go('home')
                                    case 'customer': return $state.go('home');
                                }
                            }
                            else {
                                $state.go("home");
                            }
                        })
                    }]
                }
            })
            .state('ownerdashboard.manipulatecars', {
                url: '/car/:carId',
                templateUrl: 'app/views/dashboard/owner/manipulatecar/manipulatecar.view.html',
                controller: 'ManipulateCarController',
                controllerAs: 'vm',
                params: {
                    carId: { value: null }
                },
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams', function (authService, $state, $stateParams) {
                        return authService.getUser().then(function (user) {
                            if (user) {
                                switch (user.role) {
                                    case 'admin': return $state.go('admindashboard');
                                    case 'owner' && !user.isApproved : return $state.go('home')
                                    case 'customer': return $state.go('home');
                                }
                            }
                            else {
                                $state.go("home");
                            }
                        })
                    }]
                }
            })
            .state('ownerdashboard.allmessages', {
                url: '/allmessages',
                templateUrl: 'app/views/dashboard/owner/allchats/allChats.view.html',
                controller: 'OwnerAllChatsController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams', function (authService, $state, $stateParams) {
                        return authService.getUser().then(function (user) {
                            if (user) {
                                switch (user.role) {
                                    case 'admin': return $state.go('admindashboard');
                                    case 'owner' && !user.isApproved : return $state.go('home')
                                    case 'customer': return $state.go('home');
                                }
                            }
                            else {
                                $state.go("home");
                            }
                        })
                    }]
                }
            })
            .state('ownerdashboard.message', {
                url: '/message/:chatId',
                templateUrl: 'app/views/dashboard/owner/allchats/chat/chat.view.html',
                controller: 'OwnerChatController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams', function (authService, $state, $stateParams) {
                        return authService.getUser().then(function (user) {
                            if (user) {
                                switch (user.role) {
                                    case 'admin': return $state.go('admindashboard');
                                    case 'owner' && !user.isApproved : return $state.go('home')
                                    case 'customer': return $state.go('home');
                                }
                            }
                            else {
                                $state.go("home");
                            }
                        })
                    }]
                }
            })
    }
]);