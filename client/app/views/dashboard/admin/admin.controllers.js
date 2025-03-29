/** @file Admin Dashboard Controller */

mainApp.controller('AdminController', [
    'userFactory',
    'carService',
    'categoryService',
    'errorService',
    '$uibModal',
    function (
        userFactory,
        carService,
        categoryService,
        errorService,
        $uibModal

    ) {
        /**
         * Variable declaration
         */

        var vm = this;
        vm.users = [];                                          //Holds users data
        vm.cars = [];                                           //Holds cars data
        vm.categories = [];                                     //Holds category data
        vm.currentPage = 1;                                     //Current User page
        vm.currentCarPage = 1;                                  //Current Car Page
        vm.currentCategoryPage = 1;
        vm.itemsPerPage = 5;                                    //Items per page        //Current Category Page
        vm.sortField = '';                                      //Sorting fields
        vm.reverseSort = false;                                 //Sorting fields
        vm.showUserModal = false;                               //User Modal Boolean
        vm.showCategoryModal = false;                           //Category Modal Boolean
        vm.selectedUser = null;                                 //Holds the selected user's for the modal.
        vm.newCategory = {};                                    //Holds the new category object

        /**
         * Function :: Initialization
         * @function vm.init()
         * @description Calls loadAllData.
         */

        vm.init = function () {
            vm.loadAllData();
        }

        /**
         * Function :: Load All Data
         * @function vm.loadAllData()
         * @description Loads all required data (users,cars,categories) as per requirement.
         * @requires userFactory,carService,categoryService
         */

        vm.loadAllData = function () {
            async.parallel([
                function (callback) {
                    userFactory.getAllUsers()
                        .then(function (response) {
                            vm.users = response;
                            vm.totalUsers = response.length;
                            callback(null);
                        }).catch(err => {
                            errorService.handleError("Admin Controller :: Error Getting All Users :: ", err);
                            callback(err);
                        });
                },
                function (callback) {
                    carService.getAllCars(vm.currentCarPage)
                        .then(function (response) {
                            vm.cars = response;
                            vm.totalCars = response.length;
                            callback(null);
                        }).catch(err => {
                            errorService.handleError("Admin Controller :: Error Getting All Cars :: ", err);
                            callback(err);
                        });
                },
                function (callback) {
                    categoryService.getAllCategories()
                        .then(function (response) {
                            vm.categories = response;
                            vm.totalCategories = response.length;
                            callback(null);
                        }).catch(err => {
                            errorService.handleError("Admin Controller :: Error Getting All Categories :: ", err);
                            callback(err);
                        });
                }
            ], function (err) {
                if (err) {
                    console.error("Admin Controller :: Error Fetching Data ", err);
                } else {
                    console.log("Admin Controller :: Data fetched successfully!");
                }
            });
        };

        /**
         * Function :: Load All Users
         * @function vm.loadUsers()
         * @description Loads all users
         * @requires userFactory
         */

        vm.loadUsers = function () {
            userFactory.getAllUsers()
                .then(function (response) {
                    vm.users = response;
                    vm.totalUsers = response.length;
                }).catch(err => errorService.handleError("Admin Controller :: Error Getting All Users :: ", err));
        }

        /**
         * Function :: Load Cars
         * @function vm.loadCars()
         * @description Loads all the cars.
         * @requires carService
         */

        vm.loadCars = function () {
            carService.getAllCars(vm.currentCarPage)
                .then(function (response) {
                    vm.cars = response.data;
                    vm.totalCars = response.total;
                }).catch(err => errorService.handleError("Admin Controller :: Error Getting All Cars :: ", err));
        }

        /**
         * Function :: Load Categories
         * @function vm.loadCategories()
         * @description Loads all categories.
         * @requires categoryService
         */
        vm.loadCategories = function () {
            categoryService.getAllCategories()
                .then(function (response) {
                    vm.categories = response.data;
                    vm.totalCategories = response.total;
                }).catch(err => errorService.handleError("Admin Controller :: Error Getting All Categories :: ", err));
        }

        /**
         * Function :: Sort 
         * @param {*} field 
         */

        vm.sortBy = function (field) {
            vm.reverseSort = (vm.sortField === field) ? !vm.reverseSort : false;
            vm.sortField = field;
        }

        /**
         * Function :: Approval Modal
         * @param {*} user 
         * @requires $uibModal
         * @template userApprovalModal.template.html
         * @description For User Approval Modal Creation.
         */

        vm.showUserApprovalModal = function (user) {
            vm.selectedUser = user;
            var modalInstance = $uibModal.open({
                templateUrl: 'app/components/modals/userApproval/userApprovalModal.template.html',
                controller: 'UserApprovalModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                resolve: {
                    selectedUser: function () {
                        return user;
                    }
                }
            })

            modalInstance.result.then(function () {
                vm.loadAllData();
            }, function () {
                console.log("Modal dismissed")
            })
        }



        /**
        * Function :: Add Category Modal
        * @requires $uibModal
        * @template addCategoryModal.template.html
        * @description For Category Addition
        */

        vm.showAddCategoryModal = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/components/modals/addCategory/addCategoryModal.template.html',
                controller: 'AddCategoryModalController',
                controllerAs: 'vm',
                backdrop: 'static'
            });

            modalInstance.result.then(function () {
                vm.loadAllData();
            }, function () {
                console.log('Modal dismissed');
            })
        }

        /**
         * Function :: Approve a user
         * @requires userFactory
         * @description approves a user in the DB.
         */

        vm.approveUser = function () {
            userFactory.getUserById(vm.selectedUser.userId)
                .then(user => user.approve())
                .then(function () {
                    vm.closeUserModal();
                    vm.loadAllData();
                })
                .catch(err => errorService.handleError("Admin Controller :: Error Approving User :: ", err));
        }

        /**
         * Function :: Rejects/Blocks a user
         * @requires userFactory
         * @description rejects/blocks a user in the DB.
         */

        vm.rejectUser = function () {
            userFactory.getUserById(vm.selectedUser.userId)
                .then(user => user.reject())
                .then(function () {
                    vm.loadAllData();
                    vm.closeUserModal();
                }).catch(err => errorService.handleError("Admin Controller :: Error Rejecting User :: ", err));
        }

        /**
         * Function :: Add A Category
         * @requires categoryService
         * @description Adds a category in the DB.
         */

        vm.createCategory = function () {
            categoryService.createCategory(vm.newCategory)
                .then(function () {
                    vm.loadAllData();
                    vm.closeCategoryModal();

                }).catch(err => errorService.handleError("Admin Controller :: Error Adding Categories :: ", err));
        }

        /**
        * Function :: Delets a category
        * @requires categoryService
        * @description Deletes a category from the DB.
        */

        vm.deleteCategory = function (category) {
            console.log(category);
            if (confirm('Are you sure you want to delete this category?')) {
                categoryService.deleteCategory(category.categoryId)
                    .then(function () {
                        vm.loadAllData();
                    }).catch(err => errorService.handleError("Admin Controller :: Error Deleting Categories :: ", err));
            }
        }

        /**
         * Rollback Mechanism
         * @description Let's suppose we're creating a category and something related to it throws an error,
         * the created category would be rolledback(deleted in this case).
         * @requires categoryService
         */
        
        vm.testingRollback = function () {
            async.series([
                function (callback) {
                    categoryService
                        .createCategory(
                            {
                                categoryName: "Rollback Test Category"
                            }
                        )
                        .then((res) => {
                            callback(null, res);
                        }
                        )
                        .catch((err) => callback(err));
                },
                function (callback) {
                    setTimeout(() => { return callback("err") }, 200)
                }
            ], function (err, results) {
                if (err) {
                    console.log("If err block :: ", results);
                    categoryService.deleteCategory(results[0].categoryId).then(() => { console.log("category Deleted") }).catch(err => console.log(err));
                }
                else {
                    console.log(newResult[0].categoryId);
                }
            })
        }

        /** Implemented UIB MODAL -  No Longer In Use */
        vm.closeCategoryModal = function () {
            vm.showCategoryModal = false;
            vm.newCategory = { name: '' };
            return false;
        }

        /** Implemented UIB MODAL -  No Longer In Use */
        vm.closeUserModal = function () {
            vm.showUserModal = false;
            vm.selectedUser = null;
            return false;
        }

        /** Implemented UIB Pagination -  No Longer In Use */
        vm.pageChanged = function () {
            vm.loadAllData();
        }

        /** Implemented UIB Pagination -  No Longer In Use */
        vm.carPageChanged = function () {
            vm.loadAllData();
        }

        /** Implemented UIB Pagination -  No Longer In Use */
        vm.categoryPageChanged = function () {
            vm.loadAllData();
        }

    }
])