/** @file User Approval Modal Controller */

mainApp.controller('UserApprovalModalController', [
    '$uibModalInstance',
    'userFactory',
    'errorService',
    'selectedUser',
    function ($uibModalInstance, userFactory, errorService, selectedUser) {
        /**
         * Variable Declarations
         */

        var vm = this;
        vm.selectedUser = selectedUser;

        console.log(vm.selectedUser);
        /**
         * Approve User Function
         * @function vm.approveUser()
         * @description Approves a user
         * @requires userFactory
         */

        vm.approveUser = function () {
            userFactory.createUser(vm.selectedUser).approve()
                .then(function () {
                    $uibModalInstance.close();
                }).catch(err => errorService.handleError("UserApprovalModalController :: Error Approving User :: ", err));
        };

        /**
         * Rejects a user
         * @function vm.rejectUser()
         * @description Rejects a user
         * @requires userFactory
         */

        vm.rejectUser = function () {
            userFactory.createUser(vm.selectedUser).reject()
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