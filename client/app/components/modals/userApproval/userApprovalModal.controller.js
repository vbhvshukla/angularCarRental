/** @file User Approval Modal Controller */

mainApp.controller('UserApprovalModalController', [
    '$uibModalInstance',
    'userService',
    'errorService',
    'selectedUser',
    function ($uibModalInstance, userService, errorService,selectedUser) {
        /**
         * Variable Declarations
         */

        var vm = this;
        vm.selectedUser = selectedUser;

        /**
         * Approve User Function
         * @function vm.approveUser()
         * @description Approves a user
         * @requires userService
         */

        vm.approveUser = function () {
            userService.approveUser(vm.selectedUser.userId)
                .then(function () {
                    $uibModalInstance.close();
                }).catch(err => errorService.handleError("UserApprovalModalController :: Error Approving User :: ", err));
        };

        /**
         * Rejects a user
         * @function vm.rejectUser()
         * @description Rejects a user
         * @requires userService
         */

        vm.rejectUser = function () {
            userService.rejectUser(vm.selectedUser.userId)
                .then(function () {
                    $uibModalInstance.close();
                }).catch(err => errorService.handleError("UserApprovalModalController :: Error Rejecting User :: ", err));
        };

        /**
         * Close the Modal function
         * @function vm.closeUserApprovalModal
         */
        vm.closeUserApprovalModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);