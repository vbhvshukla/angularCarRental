/** @file Manipulate Package's Page Controller */

mainApp.controller('ManipulatePackageController', [
    '$scope', '$state', '$q', '$stateParams', '$uibModal', 'packageFactory', 'authService', 'errorService', 'cityService', 'carService','packageService',
    function ($scope, $state, $q, $stateParams, $uibModal, packageFactory, authService, errorService, cityService, carService,packageService) {

        /** Variable Declaration */
        let vm = this;
        vm.loading = false;
        vm.isEditMode = !!$stateParams.packageId;
        vm.isSubmitting = false;
        vm.imageError = '';
        vm.currentUser = null;
        vm.cars = []; // List of cars owned by the user
        vm.selectedCars = []; // Cars selected for the package
        vm.package = {
            name: '',
            packagePrice: 0,
            from: '',
            to: '',
            description: '',
            images: [],
            routes: [],
            car: {}, // Embedded car schema
            driverIncluded: false,
            isActive: true,
            owner: null
        };

        vm.cities = []; // List of cities for typeahead

        /**
         * Function :: Initialization
         * @description Fetches all the data and sets it in scope.
         * @requires $q, authService, cityService, carService
         */
        vm.init = function () {
            vm.loading = true;

            const promises = [
                authService.getUser(),
                cityService.getAllCities().then(cities => {
                    vm.cities = cities; // Extract city names
                })
            ];

            if (vm.isEditMode) {
                promises.push(packageService.getPackageById($stateParams.packageId).then(packageData => {
                    if (!packageData) {
                        return $q.reject('Package not found');
                    }
                    console.log(packageData);
                    vm.package = packageData.package;
                }));
            }

            $q.all(promises)
                .then(results => {
                    vm.currentUser = results[0];
                    return carService.getCarsByOwner(vm.currentUser._id); // Fetch cars owned by the user
                })
                .then(cars => {
                    vm.cars = cars;

                    // Pre-select the car in edit mode
                    if (vm.isEditMode && vm.package.car) {
                        vm.package.car = vm.cars.find(car => car.carId === vm.package.car.carId);
                    }
                })
                .catch(error => {
                    errorService.handleError('Failed to initialize form', error);
                    vm.goBack();
                })
                .finally(() => {
                    vm.loading = false;
                });
        };

        /**
         * Function :: Handle Image Upload
         * @function handleImageUpload
         * @description Validates and adds images to the package.
         * @param {*} files 
         */
        vm.handleImageUpload = function (files) {
            vm.imageError = '';
            if (files.length + vm.package.images.length > 10) {
                vm.imageError = 'Maximum 10 images allowed';
                return;
            }

            Array.from(files).forEach(file => {
                if (file.size > 5000000) {
                    vm.imageError = 'File size exceeds 5MB limit';
                    return;
                }
                vm.package.images.push(file); // Store raw File objects
            });
        };

        /**
         * Function :: Open Add Route Modal
         * @description Opens the modal to add a new route and adds it to the package.
         */
        vm.openAddRouteModal = function () {
            const lastRouteTo = vm.package.routes.length > 0 ? vm.package.routes[vm.package.routes.length - 1].to : null;

            const modalInstance = $uibModal.open({
                templateUrl: 'app/components/modals/addPackageRoute/addPackageRoute.template.html',
                controller: 'AddPackageRouteController',
                controllerAs: 'vm',
                resolve: {
                    initialFrom: function () {
                        return lastRouteTo; // Pass the last route's 'to' value
                    }
                }
            });

            modalInstance.result
                .then(function (newRoute) {
                    if (vm.package.routes.length >= 5) {
                        errorService.handleError('Maximum 5 routes allowed');
                        return;
                    }
                    vm.package.routes.push(newRoute);
                })
                .catch(function () {
                    console.log('Add Route Modal dismissed');
                });
        };

        /**
         * Function :: Remove a route from the routes array.
         * @function removeRoute
         * @param {*} index 
         */
        vm.removeRoute = function (index) {
            vm.package.routes.splice(index, 1);
        };

        /**
         * Function :: Remove an image from the images array.
         * @function removeImage
         * @param {*} index 
         */
        vm.removeImage = function (index) {
            vm.package.images.splice(index, 1);
        };

        /**
         * Function :: Validate City
         * @description Ensures the selected city is valid.
         * @param {string} city
         * @returns {boolean}
         */
        vm.validateCity = function (city) {
            return vm.cities.includes(city);
        };

        /**
         * Function :: Add or Remove Car
         * @description Adds or removes a car from the selected cars list
         * @param {Object} car
         */
        vm.toggleCarSelection = function (car) {
            const index = vm.selectedCars.findIndex(selectedCar => selectedCar.carId === car.carId);
            if (index > -1) {
                vm.selectedCars.splice(index, 1); // Remove car if already selected
            } else {
                vm.selectedCars.push(car); // Add car if not already selected
            }
        };

        /**
         * Function :: Add Car to Package
         * @description Adds the selected car to the package's cars list.
         */
        vm.addCarToPackage = function () {
            if (!vm.selectedCar) return;

            const carExists = vm.selectedCars.some(car => car.carId === vm.selectedCar.carId);
            if (carExists) {
                errorService.handleError('Car is already added to the package.');
                return;
            }
            vm.selectedCar = null; // Reset the dropdown
        };

        /**
         * Function :: Remove Car from Package
         * @description Removes a car from the package's cars list.
         * @param {number} index - Index of the car to remove.
         */
        vm.removeCarFromPackage = function (index) {
            vm.selectedCars.splice(index, 1);
        };

        /**
         * Function :: Submit Form 
         * @function submitForm()
         * @param {*} isValid 
         * @description Submit the package (add/edit)
         */
        vm.submitForm = function (isValid) {
            if (!isValid || !vm.validateCity(vm.package.from) || !vm.validateCity(vm.package.to)) {
                errorService.handleError('Invalid city selected.');
                return;
            }

            if (!vm.package.car) {
                errorService.handleError('Please select a car for the package.');
                return;
            }
            console.log(vm.package);

            vm.package.owner = {
                _id: vm.currentUser._id,
                username: vm.currentUser.username,
                email: vm.currentUser.email
            };

            vm.isSubmitting = true;

            // Use packageFactory to create or update the package
            const packageInstance = packageFactory.createPackage(vm.package, vm.package.images);
            const savePromise = vm.isEditMode ? packageInstance.update() : packageInstance.create();

            savePromise
                .then(() => {
                    errorService.logSuccess(
                        vm.isEditMode ? 'Package updated successfully' : 'Package added successfully'
                    );
                    vm.goBack();
                })
                .catch(error => {
                    errorService.handleError(
                        vm.isEditMode ? 'Failed to update package' : 'Failed to add package',
                        error
                    );
                })
                .finally(() => {
                    vm.isSubmitting = false;
                });
        };

        /**
         * Function :: Return to Parent state
         */
        vm.goBack = function () {
            $state.go('ownerdashboard.listedpackages');
        };

        /**
         * Function :: Cancel and return to Parent state
         */
        vm.cancel = function () {
            vm.goBack();
        };
    }
]);