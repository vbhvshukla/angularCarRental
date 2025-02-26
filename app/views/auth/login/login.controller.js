mainApp.controller('LoginController', ['$scope', 'authService', '$state', 'errorService',
    function ($scope, authService, $state, errorService) {
        var vm = this;

        //Variable declarations
        vm.credentials = {
            email: '',
            password: ''
        };
        vm.errorMessage = '';

        //Login and redirection according to the role
        vm.login = function () {
            if ($scope.loginForm.$valid) {
                authService.login(vm.credentials.email, vm.credentials.password)
                    .then(function (user) {
                        errorService.logSuccess('Login Controller :: Authentication :: Login successful!');
                        switch (user.role) {
                            case 'admin':
                                $state.go('admindashboard');
                                break;
                            case 'owner':
                                $state.go('ownerdashboard');
                                break;
                            case 'customer':
                                $state.go('home');
                                break;
                            default:
                                $state.go('home');
                        }
                    })
                    .catch(function (error) {
                        vm.errorMessage = error;
                        errorService.handleError(error, 'Login Controller :: Authentication Failed');
                    });
            } else {
                vm.errorMessage = 'Please verify all fields before submitting!';
                errorService.logWarning('Login Controller :: Form validation failed');
            }
        };
    }
]);