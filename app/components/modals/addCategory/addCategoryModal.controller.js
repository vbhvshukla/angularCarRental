mainApp.controller('AddCategoryModalController', [
    '$uibModalInstance',
    'categoryService',
    'errorService',
    function ($uibModalInstance, categoryService, errorService) {
        var vm = this;
        vm.newCategory = {};

        vm.createCategory = function () {
            categoryService.createCategory(vm.newCategory)
                .then(function () {
                    $uibModalInstance.close();
                }).catch(err => errorService.handleError("AddCategoryModalController :: Error Adding Category :: ", err));
        };

        vm.closeAddCategoryModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);