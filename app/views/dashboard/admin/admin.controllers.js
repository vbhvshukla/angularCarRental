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
        var vm = this;
        vm.users = [];
        vm.cars = [];
        vm.categories = [];
        vm.currentPage = 1;
        vm.currentCarPage = 1;
        vm.sortField = '';
        vm.reverseSort = false;

        vm.showUserModal = false;
        vm.showCategoryModal = false;
        vm.selectedUser = null;
        vm.newCategory = { name: '' };

        vm.sortBy = sortBy;
        vm.pageChanged = pageChanged;
        vm.carPageChanged = carPageChanged;
        vm.showUserApprovalModal = showUserApprovalModal;
        vm.showAddCategoryModal = showAddCategoryModal;
        vm.addCategory = addCategory;
        vm.deleteCategory = deleteCategory;

        vm.closeUserModal = closeUserModal;
        vm.closeCategoryModal = closeCategoryModal;
        vm.approveUser = approveUser;
        vm.rejectUser = rejectUser;

        activate();

        function activate() {
            loadUsers();
            loadCars();
            loadCategories();
        }

        function sortBy(field) {
            vm.reverseSort = (vm.sortField === field) ? !vm.reverseSort : false;
            vm.sortField = field;
        }

        function pageChanged() {
            loadUsers();
        }

        function carPageChanged() {
            loadCars();
        }

        function loadUsers() {
            userService.getAllUsers(vm.currentPage)
                .then(function (response) {
                    vm.users = response.data;
                    vm.totalUsers = response.total;
                });
        }

        function loadCars() {
            carService.getAllCars(vm.currentCarPage)
                .then(function (response) {
                    vm.cars = response.data;
                    vm.totalCars = response.total;
                });
        }

        function loadCategories() {
            categoryService.getAllCategories()
                .then(function (response) {
                    vm.categories = response;
                });
        }

        function showUserApprovalModal(user) {
            vm.selectedUser = user;
            vm.showUserModal = true;
        }

        function closeUserModal() {
            vm.showUserModal = false;
            vm.selectedUser = null;
        }

        function showAddCategoryModal() {
            vm.showCategoryModal = true;
        }

        function closeCategoryModal() {
            vm.showCategoryModal = false;
            vm.newCategory = { name: '' };
        }

        function approveUser() {
            userService.approveUser(vm.selectedUser.id)
                .then(function () {
                    loadUsers();
                    closeUserModal();
                });
        }

        function rejectUser() {
            userService.rejectUser(vm.selectedUser.id)
                .then(function () {
                    loadUsers();
                    closeUserModal();
                });
        }

        function addCategory() {
            categoryService.addCategory(vm.newCategory)
                .then(function () {
                    loadCategories();
                    closeCategoryModal();
                });
        }

        function deleteCategory(category) {
            if (confirm('Are you sure you want to delete this category?')) {
                categoryService.deleteCategory(category.id)
                    .then(function () {
                        loadCategories();
                    });
            }
        }

    }
])