mainApp.controller('NavbarController', ['$scope', '$state', '$transitions', 'authService', 'errorService',
    function ($scope, $state, $transitions, authService, errorService) {
        let vm = this;
        vm.isLoggedIn = false;
        vm.currentUser = null;

        function init() {
            if (authService.checkAuth()) {
                authService.getUser()
                    .then(function (user) {
                        vm.isLoggedIn = true;
                        vm.currentUser = user;
                    })
                    .catch(function (error) {
                        errorService.handleError(error, 'NavbarController :: User Fetch Failed');
                        vm.isLoggedIn = false;
                        vm.currentUser = null;
                    });
            }
        }

        vm.getNavLinks = function () {
            var links = [
                { state: 'home', label: 'Home' }
            ];

            if (!vm.isLoggedIn) {
                links.push({ state: 'login', label: 'Login' });
            }

            return links;
        };

        vm.logout = function () {
            authService.logout()
                .then(function () {
                    vm.isLoggedIn = false;
                    vm.currentUser = null;
                }).catch(err => console.error("Navbar Controller :: Couldn't Logout :: ", err))
        };

        init();

        $transitions.onSuccess({}, function () {
            init();
        });
    }
]);