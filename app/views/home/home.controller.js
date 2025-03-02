mainApp.controller('HomeController', ["$q", "$state", "carService", "categoryService", "cityService", "$filter",
    function ($q, $state, carService, categoryService, cityService, $filter) {
        var vm = this;

        //Holds all fetched cars
        vm.originalCars = [];
        //Holds all filters
        vm.filters = {
            location: '',
            carCategory: '',
            priceRange: 250,
            carType: '',
            availability: '',
            features: '',
            rating: ''
        };
        //Holds all filtered cars
        vm.cars = [];
        //Holds all the categories
        vm.categories = [];
        //Holds all the cities
        vm.cities = [];
        //Holds all the features
        vm.features = [];

        //Initialization function (Gets All Cities,Available Cars & Categories and Assign it to "vm")
        vm.init = function () {
            async.parallel([
                function (callback) {
                    cityService.getAllCities().then(cities => {
                        callback(null, cities);
                    }).catch(error => {
                        callback(error);
                    });
                },
                function (callback) {
                    carService.getAvailableCars().then(cars => {
                        callback(null, cars);
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
                    vm.cars = results[1];
                    vm.categories = results[2];
                }
            });
        }

        //Function to update selected value of the price slider.
        vm.updatePriceRangeValue = function (value) {
            vm.filters.priceRange = value;
        };

        //Function to redirect to the booking's page along with the carId as params.
        vm.goToBooking = function (carId) {
            if (!carId) {
                errorService.handleError('Car Not Available', 'HomeController :: Navigation');
                return;
            }

            $state.go('bid', { carId: carId });
        };

        //Function to apply filters.
        vm.applyFilters = function () {
            if (vm.originalCars.length) {
                vm.cars = $filter('carFilter')(vm.originalCars, vm.filters);
            }
        };

    }]);