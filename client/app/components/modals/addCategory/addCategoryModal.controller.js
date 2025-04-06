/** @file AddCategoryModal Controller */

mainApp.controller('AddCategoryModalController', [
    '$uibModalInstance',
    'categoryFactory',
    'errorService',
    function ($uibModalInstance, categoryFactory, errorService) {
        var vm = this;
        vm.newCategory = categoryFactory.createCategory();

        /**
         * Create category function
         * @function createCategory()
         * @requires categoryFactory
         * @returns $uibModalInstance.close();
         */
        vm.createCategory = function () {
            vm.newCategory.create()
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