mainApp.controller('HomeController', ["$q", "$state", "carService", "categoryService", "cityService", "$filter",
    function ($q, $state, carService, categoryService, cityService, $filter) {
        var vm = this;

        vm.originalCars = [];
        vm.cars = [];
        vm.categories = [];
        vm.cities = [];
        vm.features = [];

        vm.pagination = {
            currentPage: 1,
            itemsPerPage: 6,
            totalItems: 0,
            loading: false
        };

        vm.filters = {
            location: '',
            carCategory: '',
            priceRange: 250,
            carType: '',
            availability: '',
            features: '',
            rating: ''
        };

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

        vm.loadMoreCars = function() {
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

        vm.updatePriceRangeValue = function (value) {
            vm.filters.priceRange = value;
        };

        vm.goToBooking = function (carId) {
            if (!carId) {
                errorService.handleError('Car Not Available', 'HomeController :: Navigation');
                return;
            }

            $state.go('bid', { carId: carId });
        };

        vm.applyFilters = function () {
            vm.pagination.currentPage = 1;
            vm.pagination.loading = true;
            
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