mainApp.controller('NavbarController', ['$state', '$transitions', 'authService', 'errorService',

    function ($state, $transitions, authService, errorService) {

        /**
         * Variable declarations
         * @var vm Alias for view modal for the navbar controller.
         * @var vm.isLoggedIn Holds boolean for loggedin user.
         * @var vm.currentUser Holds the currentUser object after authentication.
         * @var vm.links Holds the links to show in the navbar.
         */

        let vm = this;
        vm.isLoggedIn = false;
        vm.currentUser = null;
        vm.links = [];

        /**
         * Function : Initialization
         * @requires authService
         * @description Calls authService to get the user and assign it to @var vm.currentUser
         */

        vm.init = function () {
            authService.getUser()
                .then(user => {
                    vm.isLoggedIn = true;
                    vm.currentUser = user;
                    updateNavLinks();
                })
                .catch(error => {
                    console.error("NavbarController :: Error fetching user", error);
                    vm.isLoggedIn = false;
                    vm.currentUser = null;
                    updateNavLinks();
                });
        };

        /**
         * Function : Update the navlinks based on user roles
         */

        function updateNavLinks() {
            var links = [];

            if (!vm.isLoggedIn || (vm.currentUser && vm.currentUser.role === 'customer')) {
                links.push({ state: 'home', label: 'Home' });
            }

            if (!vm.isLoggedIn) {
                links.push({ state: 'login', label: 'Login' });
            }

            if (vm.isLoggedIn && vm.currentUser) {
                switch (vm.currentUser.role) {
                    case 'customer':
                        links.push({ state: 'userdashboard.profile', label: 'Dashboard' });
                        break;
                    case 'owner':
                        links.push({ state: 'ownerdashboard.home', label: 'Dashboard' });
                        break;
                    case 'admin':
                        links.push({ state: 'adminanalytics', label: 'Analytics' });
                        links.push({ state: 'admindashboard', label: 'Dashboard' });
                        break;
                }
            }

            vm.links = links;
        }

        /**
         * Function : Logout
         * @requires AuthService
         */

        vm.logout = function () {
            authService.logout()
                .then(function () {
                    vm.isLoggedIn = false;
                    vm.currentUser = null;
                    updateNavLinks();
                    $state.go('home');
                })
                .catch(error => errorService.handleError(error, 'Navbar Controller :: Logout Failed'));
        };

        /**
         * Transition
         * @description If transaction is successful , as the navbar is static recall the init function.
         */
        
        $transitions.onSuccess({}, function () {
            vm.init();
        });
    }
]);