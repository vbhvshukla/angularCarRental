mainApp.controller('RegisterController', ['$scope', 'userFactory', '$state', 'errorService',
    function ($scope, userFactory, $state, errorService) {
        let vm = this;

        /**
         * Variable declarations
         */

        vm.userData = {             // Holds the user object
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            role: 'customer'
        };
        vm.errorMessage = '';       // Holds the error message to be displayed on UI.
        vm.verificationFile = null; // Holds the verification file.

        /**
         * Function to register user
         * @function vm.register()
         * @description Registers a user in the DB.
         */

        vm.register = function () {
            if (!$scope.registerForm.$valid) {
                errorService.logWarning('Register Controller :: Please input all fields correctly!');
                return;
            }
            if (vm.userData.password !== vm.userData.confirmPassword) {
                vm.errorMessage = 'Passwords do not match';
                errorService.handleError('Register Controller :: Passwords do not match');
                return;
            }
            if (vm.userData.role === 'owner' && !vm.verificationFile) {
                vm.errorMessage = 'Verification document is required for owner registration';
                errorService.handleError('Register Controller :: Verification Document Required');
                return;
            }


            const user = userFactory.createUser(vm.userData, vm.verificationFile);
            user.create()
                .then(function () {
                    errorService.logSuccess('Register Controller :: User Registration Successful');
                    $state.go('login');
                })
                .catch(function (error) {
                    vm.errorMessage = error.message || 'Registration failed';
                    errorService.handleError(error, 'Register Controller :: User Registration Failed');
                });
        };

        /**
         * File Handler
         * @param {*} fileInput 
         * @description Validates and attaches the file to the scope.
         */

        vm.handleFileSelect = function (fileInput) {
            if (fileInput.files && fileInput.files[0]) {

                const file = fileInput.files[0];

                const validTypes = ['application/pdf', 'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/jpeg', 'image/png'];

                if (!validTypes.includes(file.type)) {
                    vm.errorMessage = 'Invalid file type. Please upload PDF, DOC, DOCX, JPG or PNG.';
                    errorService.logError('Register Controller :: File Upload', vm.errorMessage);
                    fileInput.value = '';
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    vm.errorMessage = 'File size too large. Maximum size is 5MB.';
                    errorService.logError('Register Controller :: File Upload', vm.errorMessage);
                    fileInput.value = '';
                    return;
                }

                vm.verificationFile = file;
                errorService.logInfo('File selected: ' + file.name, 'File Upload');
            }
        };
    }
]);