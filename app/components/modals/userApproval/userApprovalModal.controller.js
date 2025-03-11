mainApp.controller('UserApprovalModalController', [
    '$uibModalInstance',
    'userService',
    'errorService',
    'selectedUser',
    function ($uibModalInstance, userService, errorService,selectedUser) {
        var vm = this;
        vm.selectedUser = selectedUser;

        vm.approveUser = function () {
            userService.approveUser(vm.selectedUser.userId)
                .then(function () {
                    $uibModalInstance.close();
                }).catch(err => errorService.handleError("UserApprovalModalController :: Error Approving User :: ", err));
        };

        vm.rejectUser = function () {
            userService.rejectUser(vm.selectedUser.userId)
                .then(function () {
                    $uibModalInstance.close();
                }).catch(err => errorService.handleError("UserApprovalModalController :: Error Rejecting User :: ", err));
        };

        vm.closeUserApprovalModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);