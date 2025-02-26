mainApp.controller('UserProfileController', [
    'authService', 'userService', 'errorService',
    function (authService, userService, errorService) {
        var vm = this;
        //Holds user variable from init function.
        vm.user = null;
        //For password comparison.
        vm.newPassword = '';
        vm.oldPassword = '';
        vm.showNewPasswordField = false;
        //Loader
        vm.loading = true;

        //Profile Initialization function
        vm.init = function () {
            vm.loading = true;
            authService.getUser().then(user => { vm.user = user }).catch(error => { errorService.handleError('Profile Controller :: Failed to get user :: ', error); }).finally(() => { vm.loading = false; });
        }

        //Function to validate old password
        vm.validateOldPassword = function () {
            if (!vm.oldPassword) return;

            userService.validatePassword(vm.oldPassword)
                .then(isValid => {
                    vm.showNewPasswordField = isValid;
                    vm.oldPasswordError = isValid ? '' : 'Incorrect old password.';
                })
                .catch((error) => {
                    vm.oldPasswordError = 'Error validating password';
                    console.log("Profile Controller :: Error validating password :: ", error);
                });
        };

        //Function to update password
        vm.updatePassword = function () {
            if (!vm.validateNewPassword()) return;

            vm.isUpdating = true;
            userService.updatePassword(vm.newPassword)
                .then(() => {
                    errorService.logSuccess('Password updated successfully!');
                    vm.newPassword = '';
                    vm.oldPassword = '';
                    vm.showNewPasswordField = false;
                })
                .catch(() => {
                    errorService.handleError('Profile Controller :: Error updating password :: ');
                })
                .finally(() => {
                    vm.isUpdating = false;
                });
        };

        //Function to validate new password
        vm.validateNewPassword = function () {
            if (!vm.newPassword) {
                vm.newPasswordError = 'Password is required';
                return false;
            }
            if (vm.newPassword.length < 6) {
                vm.newPasswordError = 'Password must be at least 6 characters.';
                return false;
            }
            if (!/[A-Z]/.test(vm.newPassword)) {
                vm.newPasswordError = 'Password must contain an uppercase letter.';
                return false;
            }
            if (!/\d/.test(vm.newPassword)) {
                vm.newPasswordError = 'Password must contain a number.';
                return false;
            }

            vm.newPasswordError = '';
            return true;
        };

        //Function to update profile
        vm.updateProfile = function () {
            if (!vm.user.username || !vm.user.email) {
                errorService.error('Username and email are required');
                return;
            }

            vm.isUpdating = true;
            userService.updateProfile(vm.user)
                .then(() => {
                    errorService.logSuccess('Profile updated successfully!');
                })
                .catch(() => {
                    errorService.handleError('Profile Controller :: Error updating profile :: ');
                })
                .finally(() => {
                    vm.isUpdating = false;
                });
        };

    }
]);