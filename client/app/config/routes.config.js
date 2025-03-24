/** @file Routes configuration file */

mainApp.config(['$stateProvider', '$urlMatcherFactoryProvider', '$urlRouterProvider',
    function ($stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider) {

        /**
         * Configurations
         */
        $urlMatcherFactoryProvider.caseInsensitive(true);
        $urlRouterProvider.otherwise('/');
        $urlRouterProvider.when('/dashboard', '/dashboard/profile');
        $urlRouterProvider.when('/ownerdashboard', '/ownerdashboard/home');

        /**
         * List of states available
         * --Global--
         * @name home : Home.
         * @name login : Login.
         * @name register : Register.
         * @name bid : Bidding.
         * 
         * --User's Dashboard--
         * @name userdashboard : User's dashboard.
         * @name userdashboard.profile : User's profile.
         * @name userdashboard.bookings : User's bookings.
         * @name userdashboard.messages : User's messages.
         * @name userdashboard.message  : User's specific conversation and it's messages.
         * @name userdashboard.bids : User's bids.
         * 
         * --Admin's Dashboard--
         * @name admindashboard : Admin's Dashboard.
         * @name adminanalytics : Admin's Analytics.
         * 
         * --Owner's Dashboard--
         * @name ownerdashboard : Owner's Dashboard Base Page
         * @name ownerdashboard.home : Owner Dashboard's Home Page
         * @name ownerdashboard.listedcars : Owner's Listed Cars.
         * @name ownerdashboard.manipulatecar : Owner's Add/Edit Car Page.
         * @name ownerdashboard.allmessages : Owner's All Messages.
         * @name ownerdashboard.message : Owner's Specific Conversation and it's messages.
         * @name ownerdashboard.analytics : Owner's Analytics Page.
         */

        $stateProvider
            // Home
            .state('home', {
                url: '/',
                templateUrl: 'app/views/home/home.view.html',
                controller: 'HomeController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state',
                        function (authService, $state) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner': return user.isApproved ? $state.go('ownerdashboard') : true;
                                        case 'customer': return true; // Allow users to access home
                                    }
                                }
                                return true; // Allow unauthenticated users to access home
                            }).catch(function () {
                                return true; // Allow unauthenticated users to access home
                            });
                        }
                    ]
                }
            })

            // Login
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
                                        case 'owner': return user.isApproved ? $state.go('ownerdashboard') : $state.go('home');
                                        case 'customer': return $state.go('userdashboard.profile');
                                    }
                                }
                                return true; // Allow unauthenticated users to access login
                            }).catch(function () {
                                return true; // Allow unauthenticated users to access login
                            });
                        }
                    ]
                }
            })

            // Register
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
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner': return user.isApproved ? $state.go('ownerdashboard') : $state.go('home');
                                        case 'customer': return $state.go('userdashboard.profile');
                                    }
                                }
                                return true; // Allow unauthenticated users to access register
                            }).catch(function () {
                                return true; // Allow unauthenticated users to access register
                            });
                        }
                    ]
                }
            })

            // Bidding
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
                                    switch (user.role) {
                                        case 'admin': return $state.go('admindashboard');
                                        case 'owner':
                                            if (user.isApproved) {
                                                return $state.go('ownerdashboard');
                                            } else {
                                                return $state.go('home');
                                            }
                                        // case 'customer': return $state.go('userdashboard.profile');
                                    }
                                }
                                return true;
                            }).catch(function () {
                                return true;
                            });
                        }
                    ]
                }
            })

            // User Dashboard : Base Page
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

            // User Dashboard : User's Profile (home page for dashboard)
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

            // User Dashboard : User Bookings
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

            // User Dashboard : User Messages
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

            // User Dashboard : User message
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

            // User Dashboard : User's All Bids
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

            // Admin Dashboard
            .state('admindashboard', {
                url: '/admindashboard',
                templateUrl: 'app/views/dashboard/admin/admin.view.html',
                controller: 'AdminController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state',
                        function (authService, $state) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    if (user.role === 'admin') {
                                        return true; // Allow admins to access admin pages
                                    }
                                    return $state.go('home'); // Redirect others to home
                                }
                                return $state.go('home'); // Redirect unauthenticated users to home
                            }).catch(function () {
                                return $state.go('home'); // Redirect unauthenticated users to home
                            });
                        }
                    ]
                }
            })

            // Admin Analytics
            .state('adminanalytics', {
                url: '/adminanalytics',
                templateUrl: 'app/views/dashboard/admin/analytics/analytics.view.html',
                controller: 'AdminAnalyticsController',
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

            // Owner Dashboard : Base Page
            .state('ownerdashboard', {
                url: '/ownerdashboard',
                templateUrl: 'app/views/dashboard/owner/ownerDashboard.view.html',
                controller: 'OwnerDashboardController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state',
                        function (authService, $state) {
                            return authService.getUser().then(function (user) {
                                if (user) {
                                    if (user.role === 'owner' && user.isApproved) {
                                        return true; // Allow approved owners to access owner pages
                                    }
                                    return $state.go('home'); // Redirect others to home
                                }
                                return $state.go('home'); // Redirect unauthenticated users to home
                            }).catch(function () {
                                return $state.go('home'); // Redirect unauthenticated users to home
                            });
                        }
                    ]
                }
            })

            // Owner Dashboard : Home Page
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
                                    case 'owner' && !user.isApproved: return $state.go('home')
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

            // Owner Dashboard : All Listed Cars
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
                                    case 'owner' && !user.isApproved: return $state.go('home')
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

            // Owner Dashboard : Manipulate Cars(Add/Edit)
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
                                    case 'owner' && !user.isApproved: return $state.go('home')
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

            // Owner Dashboard : All Messages
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
                                    case 'owner' && !user.isApproved: return $state.go('home')
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

            // Owner Dashboard : Specific message of the conversations.
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
                                    case 'owner' && !user.isApproved: return $state.go('home')
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

            // Owner Dashboard : Owner Analytics
            .state('ownerdashboard.analytics', {
                url: '/analytics',
                templateUrl: 'app/views/dashboard/owner/analytics/analytics.view.html',
                controller: 'OwnerAnalyticsController',
                controllerAs: 'vm',
                resolve: {
                    redirectIfAuthenticated: ['authService', '$state', '$stateParams', function (authService, $state, $stateParams) {
                        return authService.getUser().then(function (user) {
                            if (user) {
                                switch (user.role) {
                                    case 'admin': return $state.go('admindashboard');
                                    case 'owner' && !user.isApproved: return $state.go('home')
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