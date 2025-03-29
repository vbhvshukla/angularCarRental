/** @file Login Controller */

mainApp.controller('LoginController', ['$scope', 'userFactory', '$state', 'errorService',
    function ($scope, userFactory, $state, errorService) {

        /**
         * Variable Declarations
         */

        var vm = this;              // Alias for view model for this controller
        vm.credentials = {          // Holds the user's object of form.
            email: '',
            password: ''
        };
        vm.errorMessage = '';       // Holds the message to be displayed on UI.

        /**
         * Login Function
         * @function vm.login()
         * @description logs in a user and redirects according to the user role.
         * @requires userFactory
         */

        vm.login = function () {
            if ($scope.loginForm.$valid) {
                const user = userFactory.createUser(vm.credentials);
                user.login()
                    .then(function (response) {
                        errorService.logSuccess('Login Controller :: Authentication :: Login successful!');
                        userFactory.redirectBasedOnRole(response.data.user, $state);
                    })
                    .catch(function (error) {
                        vm.errorMessage = error.message || 'Login failed. Please try again.';
                        errorService.handleError(error, 'Login Controller :: Authentication Failed');
                    });
            } else {
                vm.errorMessage = 'Please verify all fields before submitting!';
                errorService.logWarning('Login Controller :: Form validation failed');
            }
        };
    }
]);