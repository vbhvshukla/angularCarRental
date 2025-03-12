/** @file Login Controller */

mainApp.controller('LoginController', ['$scope', 'authService', '$state', 'errorService',
    function ($scope, authService, $state, errorService) {
    
        /**
         * Variable Declarations
         */
        
        var vm = this;              //Alias for view model for this controller
        vm.credentials = {          //Holds the user's object of form.
            email: '',
            password: ''
        };
        vm.errorMessage = '';       //Holds the message to be displayed on UI.

        /**
         * Login Function
         * @function vm.login()
         * @description logs in a user and redirects according to the user role.
         * @requires authService
         */

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