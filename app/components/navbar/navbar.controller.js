mainApp.controller('NavbarController', ['$scope', '$state', '$transitions', 'authService', 'errorService',
    function ($scope, $state, $transitions, authService, errorService) {
        let vm = this;
        vm.isLoggedIn = false;
        vm.currentUser = null;
        vm.links = [];

        function init() {
            if (authService.checkAuth()) {
                authService.getUser()
                    .then(function (user) {
                        vm.isLoggedIn = true;
                        vm.currentUser = user;
                        updateNavLinks(); 
                    })
                    .catch(function (error) {
                        errorService.handleError(error, 'NavbarController :: User Fetch Failed');
                        vm.isLoggedIn = false;
                        vm.currentUser = null;
                        updateNavLinks();
                    });
            } else {
                updateNavLinks();
            }
        }

        function updateNavLinks() {
            var links = [];
            
            if (!vm.isLoggedIn || (vm.currentUser && vm.currentUser.role === 'customer')) {
                links.push({ state: 'home', label: 'Home' });
            }

            if (!vm.isLoggedIn) {
                links.push({ state: 'login', label: 'Login' });
            }

            if (vm.isLoggedIn && vm.currentUser) {
                switch(vm.currentUser.role) {
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

        init();

        $transitions.onSuccess({}, function () {
            init();
        });
    }
]);