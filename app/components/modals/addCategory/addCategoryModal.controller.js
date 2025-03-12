/** @file AddCategoryModal Controller */

mainApp.controller('AddCategoryModalController', [
    '$uibModalInstance',
    'categoryService',
    'errorService',
    function ($uibModalInstance, categoryService, errorService) {
        var vm = this;
        vm.newCategory = {};
        /**
         * Create category function
         * @function createCategory()
         * @requires categoryService
         * @returns $uibModalInstance.close();
         */
        vm.createCategory = function () {
            categoryService.createCategory(vm.newCategory)
                .then(function () {
                    $uibModalInstance.close();
                }).catch(err => errorService.handleError("AddCategoryModalController :: Error Adding Category :: ", err));
        };

        /**
         * Close Add Category Modal
         */
        vm.closeAddCategoryModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);