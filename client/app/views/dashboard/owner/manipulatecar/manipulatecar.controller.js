/** @file Manipulate Car's Page Controller */

mainApp.controller('ManipulateCarController', [
    '$scope', '$state', '$q', '$stateParams', 'carFactory', 'categoryService', 'cityService', 'authService', 'errorService','carService',
    function ($scope, $state, $q, $stateParams, carFactory, categoryService, cityService, authService, errorService,carService) {

        console.log($stateParams.carId)

        /** Variable Declaration */
        let vm = this;
        vm.loading = false;
        vm.isEditMode = !!$stateParams.carId;
        vm.isSubmitting = false;
        vm.imageError = '';
        vm.categories = [];
        vm.cities = [];
        vm.currentUser = null;
        vm.newFeature = '';
        vm.car = {
            carName: '',
            carType: '',
            city: '',
            createdAt: new Date().toISOString(),  // Set current date for new cars
            description: '',
            isAvailableForLocal: false,
            isAvailableForOutstation: false,
            images: [],
            featured: [],
            isDeleted: false,
            category: {
                categoryId: '',
                categoryName: ''
            },
            owner: null,  // Will be set during form submission
            rating: { avgRating: 0, ratingCount: 0 }, // Updated to handle rating as an object
            rentalOptions: {
                local: {
                    extraHourlyRate: 0,
                    extraKmRate: 0,
                    maxKmPerHour: 0,
                    pricePerHour: 0
                },
                outstation: {
                    pricePerDay: 0,
                    pricePerKm: 0,
                    minimumKmChargeable: 0,
                    maxKmLimitPerDay: 0,
                    extraKmRate: 0,
                    extraHourRate: 0,
                    extraDayRate: 0,
                }
            }
        };

        /**
         * Function :: Initialization
         * @description Fetches all the data and sets it in scope.
         * @requires $q,categoryService,cityService,authService
         */

        vm.init = function () {
            vm.loading = true;
            const promises = [
                categoryService.getAllCategories(),
                cityService.getAllCities(),
                authService.getUser()
            ];

            if (vm.isEditMode) {
                promises.push(carService.getCarById($stateParams.carId));
            }

            $q.all(promises)
                .then(results => {
                    [vm.categories, vm.cities, vm.currentUser] = results;
                    if (vm.isEditMode) {
                        const car = results[3];
                        if (!car) {
                            return $q.reject('Car not found');
                        }
                        vm.car = car;
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
         * Function :: Handle Category Selection
         * @function handleCategorySelect()
         * @description Handle the category selection for the form
         */

        vm.handleCategorySelect = function () {
            const selectedCategory = vm.categories.find(c =>
                c.categoryName.toLowerCase() === vm.car.category.categoryName.toLowerCase()
            );

            if (selectedCategory) {
                vm.car.category = {
                    categoryId: selectedCategory.categoryId,
                    categoryName: selectedCategory.categoryName
                };
            } else {
                vm.car.category = { categoryId: '', categoryName: '' };
                errorService.handleError('Please select a valid category');
            }
        };

        /**
         * Function :: Handle Image Upload
         * @function handleImageUpload
         * @description validates and converts the file into base64 dataURL.
         * @param {*} files 
         */

        vm.handleImageUpload = function (files) {
            vm.imageError = '';
            if (files.length + vm.car.images.length > 10) {
                vm.imageError = 'Maximum 10 images allowed';
                return;
            }

            Array.from(files).forEach(file => {
                if (file.size > 5000000) {
                    vm.imageError = 'File size exceeds 5MB limit';
                    return;
                }
                vm.car.images.push(file); // Store raw File objects
            });
        };

        /**
         * Function :: Add A Feature(for featured section)
         * @function addFeature()
         */

        vm.addFeature = function () {
            if (!vm.newFeature || vm.newFeature.trim() === '') {
                errorService.handleError('Feature cannot be empty');
                return;
            }

            if (vm.car.featured.length >= 3) {
                errorService.handleError('Maximum 3 features allowed');
                return;
            }

            if (vm.car.featured.includes(vm.newFeature.trim())) {
                errorService.handleError('Feature already exists');
                return;
            }

            vm.car.featured.push(vm.newFeature.trim());
            vm.newFeature = '';
        };

        /**
         * Function :: Remove a feature from the featured array.
         * @function removeFeature
         * @param {*} index 
         */

        vm.removeFeature = function (index) {
            vm.car.featured.splice(index, 1);
        };

        /**
         * Function :: Remove a image from the images array.
         * @function removeImage
         * @param {*} index 
         */

        vm.removeImage = function (index) {
            vm.car.images.splice(index, 1);
        };

        /**
         * Function :: Submit Form 
         * @function submitForm()
         * @param {*} isValid 
         * @description Submit's the car (add/edit)
         */

        vm.submitForm = function (isValid) {
            if (!isValid) return;

            // Validate category
            const selectedCategory = vm.categories.find(c => c.categoryName === vm.car.category.categoryName);
            if (!selectedCategory) {
                errorService.handleError('Please select a valid category');
                return;
            }

            vm.car.owner = {
                _id: vm.currentUser._id,
                username: vm.currentUser.username,
                email:vm.currentUser.email
            }

            vm.car.category = {
                _id: selectedCategory._id,
                categoryName: selectedCategory.categoryName
            };

            vm.isSubmitting = true;

            // Use carFactory to create or update the car
            const carInstance = carFactory.createCar(vm.car);
            const savePromise = vm.isEditMode ? carInstance.update() : carInstance.create();

            savePromise
                .then(() => {
                    errorService.logSuccess(
                        vm.isEditMode ? 'Car updated successfully' : 'Car added successfully'
                    );
                    vm.goBack();
                })
                .catch(error => {
                    errorService.handleError(
                        vm.isEditMode ? 'Failed to update car' : 'Failed to add car',
                        error
                    );
                })
                .finally(() => {
                    vm.isSubmitting = false;
                });
        };

        /**
         * Function :: Checks if a city entered is valid
         */

        vm.validateCity = function () {
            if (vm.car.city) {
                var isValid = vm.cities.indexOf(vm.car.city) > -1;
                $scope.carForm.city.$setValidity('validCity', isValid);
            }
        };

        /**
         * Function :: Return to Parent state
         */

        vm.goBack = function () {
            $state.go('ownerdashboard.listedcars');
        };

        /**
        * Function :: Return to Parent state
        */
        vm.cancel = function () {
            vm.goBack();
        };
    }
]);