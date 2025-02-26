mainApp.controller('RegisterController', ['$scope', 'authService', '$state', 'errorService',
    function ($scope, authService, $state, errorService) {
        let vm = this;

        //Variables declaration
        vm.userData = {
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            role: 'customer'
        };
        vm.errorMessage = '';
        vm.verificationFile = null;

        //Register function & Validations
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

            authService.register(vm.userData, vm.verificationFile)
                .then(function () {
                    errorService.logSuccess('Register Controller :: User Registration Successful');
                    $state.go('login');
                })
                .catch(function (error) {
                    vm.errorMessage = error;
                    errorService.handleError(error, 'Register Controller :: User Registration Failed');
                });
        };

        //File handler
        vm.handleFileSelect = function (fileInput) {
            if (fileInput.files && fileInput.files[0]) {
                
                const file = fileInput.files[0];
                
                //Valid file types
                const validTypes = ['application/pdf', 'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/jpeg', 'image/png'];

                //File type validator
                if (!validTypes.includes(file.type)) {
                    vm.errorMessage = 'Invalid file type. Please upload PDF, DOC, DOCX, JPG or PNG.';
                    errorService.logError('Register Controller :: File Upload', vm.errorMessage);
                    fileInput.value = '';
                    return;
                }
                //Max file size 5 MB
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