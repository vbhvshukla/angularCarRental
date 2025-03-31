mainApp.controller('HomeController', ["$q", "$state", "carService", "categoryService", "cityService", "$filter", "$scope",
    function ($q, $state, carService, categoryService, cityService, $filter, $scope) {
        var vm = this;

        // Variable declarations
        vm.cars = [];         // Holds the cars fetched (paginated)
        vm.categories = [];   // Holds all the categories
        vm.cities = [];       // Holds all the cities

        vm.pagination = {
            currentPage: 1,
            itemsPerPage: 6,
            totalItems: 0,
            loading: false
        };

        vm.filters = {
            location: '',
            carCategory: '',
            priceRange: 500,
            carType: '',
            availability: '',
            features: '',
            rating: ''
        };

        // Initialize sidebar state
        vm.isSidebarVisible = false;

        // Update applyFilters to use the Angular binding
        var originalApplyFilters = vm.applyFilters;
        vm.applyFilters = function() {
            if (originalApplyFilters) {
                originalApplyFilters();
            }
            if (window.innerWidth < 768) {
                vm.isSidebarVisible = false;
            }
        };

        // Close sidebar on route change
        $scope.$on('$stateChangeStart', function() {
            vm.isSidebarVisible = false;
        });

        // Initialize the controller
        vm.init = function () {
            vm.loading = true;
            async.parallel([
                function (callback) {
                    cityService.getAllCities().then(cities => {
                        callback(null, cities);
                    }).catch(error => {
                        callback(error);
                    });
                },
                function (callback) {
                    carService.getAvailableCarsWithPagination(
                        vm.pagination.currentPage,
                        vm.pagination.itemsPerPage
                    ).then(result => {
                        callback(null, result);
                    }).catch(error => {
                        callback(error);
                    });
                },
                function (callback) {
                    categoryService.getAllCategories().then(categories => {
                        callback(null, categories);
                    }).catch(error => {
                        callback(error);
                    });
                }
            ], function (error, results) {
                if (error) {
                    console.log("Home Controller :: Init Error :: ", error);
                } else {
                    vm.cities = results[0];
                    vm.cars = results[1].cars;
                    vm.pagination.totalItems = results[1].total;
                    vm.categories = results[2];
                }
                vm.loading = false;
            });
        };

        // Load more cars for pagination
        vm.loadMoreCars = function () {
            // console.log(vm.pagination.loading,vm.cars.length,vm.pagination.totalItems);
            if (vm.pagination.loading || vm.cars.length >= vm.pagination.totalItems) {
                return;
            }
            vm.pagination.loading = true;
            vm.pagination.currentPage++;

            carService.getAvailableCarsWithPagination(
                vm.pagination.currentPage,
                vm.pagination.itemsPerPage,
                vm.filters
            ).then(result => {
                vm.cars = vm.cars.concat(result.cars);
                vm.pagination.totalItems = result.total;
            }).catch(error => {
                console.error('Error loading more cars:', error);
            }).finally(() => {
                vm.pagination.loading = false;
            });
        };

        // Navigate to the bidding page
        vm.goToBooking = function (carId) {
            if (!carId) {
                console.error('Car Not Available');
                return;
            }

            $state.go('bid', { carId: carId });
        };

        // Apply filters to fetch filtered cars
        vm.applyFilters = function () {
            vm.pagination.currentPage = 1;
            vm.pagination.loading = true;
            console.log(vm.filters)
            // Pass filters to the backend
            carService.getAvailableCarsWithPagination(
                vm.pagination.currentPage,
                vm.pagination.itemsPerPage,
                vm.filters
            ).then(result => {
                vm.cars = result.cars;
                vm.pagination.totalItems = result.total;
            }).catch(error => {
                console.error('Error applying filters:', error);
            }).finally(() => {
                vm.pagination.loading = false;
            });
        };
    }
]);