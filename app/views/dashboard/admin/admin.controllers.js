mainApp.controller('AdminController', [
    'userService',
    'authService',
    'bookingService',
    'carService',
    'categoryService',
    'errorService',
    function (
        userService,
        authService,
        bookingService,
        carService,
        categoryService,
        errorService,
    ) {
        //Variable Declarations
        var vm = this;
        vm.users = [];                                          //Holds users data
        vm.cars = [];                                           //Holds cars data
        vm.categories = [];                                     //Holds category data
        vm.currentPage = 1;                                     //Current User page
        vm.currentCarPage = 1;                                  //Current Car Page
        vm.sortField = '';                                      //Sorting fields
        vm.reverseSort = false;                                 //Sorting fields
        vm.showUserModal = false;                               //User Modal Boolean
        vm.showCategoryModal = false;                           //Category Modal Boolean
        vm.selectedUser = null;                                 //Holds the selected user's for the modal.
        vm.newCategory = {};                                    //Holds the new category object


        //Initialization function (Loads all data)
        vm.init = function () {
            vm.loadAllData();
        }

        vm.loadAllData = function () {
            async.parallel([
                function (callback) {
                    userService.getAllUsers(vm.currentPage)
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

        vm.loadUsers =  function () {
            async.parallel([
                function (callback) {
                    userService.getAllUsers(vm.currentPage)
                        .then(function (response) {
                            callback(null, response);
                        }).catch(err => callback(err));
                }
            ], function (err, result) {
                if (err) {
                    errorService.handleError(err);
                } else {
                        
                    vm.users = result[0];
                    vm.totalUsers = result.total;
                }
            })


        }

        vm.loadCars = function () {
            carService.getAllCars(vm.currentCarPage)
                .then(function (response) {
                    vm.cars = response.data;
                    vm.totalCars = response.total;
                }).catch(err => errorService.handleError("Admin Controller :: Error Getting All Cars :: ", err));
        }

        vm.loadCategories = function () {
            categoryService.getAllCategories()
                .then(function (response) {
                    vm.categories = response;
                }).catch(err => errorService.handleError("Admin Controller :: Error Getting All Categories :: ", err));
        }

        vm.sortBy = function (field) {
            vm.reverseSort = (vm.sortField === field) ? !vm.reverseSort : false;
            vm.sortField = field;
        }

        vm.pageChanged = function () {
            loadUsers();
        }

        vm.carPageChanged = function () {
            vm.loadCars();
        }

        vm.showUserApprovalModal = function (user) {
            vm.selectedUser = user;
            vm.showUserModal = true;
        }

        vm.closeUserModal = function () {
            vm.showUserModal = false;
            vm.selectedUser = null;
            return false;
        }

        vm.showAddCategoryModal = function () {
            vm.showCategoryModal = true;
            return true;
        }

        vm.closeCategoryModal = function () {
            vm.showCategoryModal = false;
            vm.newCategory = { name: '' };
            return false;
        }

        vm.approveUser = function () {
            userService.approveUser(vm.selectedUser.userId)
                .then(function () {
                    vm.closeUserModal();
                    vm.loadUsers();
                })
                .catch(err => errorService.handleError("Admin Controller :: Error Approving User :: ", err));
        }

        vm.rejectUser = function () {
            userService.rejectUser(vm.selectedUser.userId)
                .then(function () {
                    vm.loadUsers();
                    vm.closeUserModal();
                }).catch(err => errorService.handleError("Admin Controller :: Error Rejecting User :: ", err));
        }

        vm.createCategory = function () {
            categoryService.createCategory(vm.newCategory)
                .then(function () {
                    vm.loadCategories();
                    vm.closeCategoryModal();
                }).catch(err => errorService.handleError("Admin Controller :: Error Adding Categories :: ", err));
        }

        vm.deleteCategory = function (category) {
            console.log(category);
            if (confirm('Are you sure you want to delete this category?')) {
                categoryService.deleteCategory(category.categoryId)
                    .then(function () {
                        vm.loadCategories();
                    }).catch(err => errorService.handleError("Admin Controller :: Error Deleting Categories :: ", err));
            }
        }

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
    }
])