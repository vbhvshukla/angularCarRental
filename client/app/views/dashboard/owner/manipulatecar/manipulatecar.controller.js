/** @file Manipulate Car's Page Controller */

mainApp.controller('ManipulateCarController', [
    '$scope', '$state', '$q', '$stateParams', 'carService', 'categoryService', 'cityService', 'authService', 'errorService',
    function ($scope, $state, $q, $stateParams, carService, categoryService, cityService, authService, errorService) {

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
            carId: '',  // Will be generated for new cars
            carName: '',
            carType: '',
            city: '',
            createdAt: new Date().toISOString(),  // Set current date for new cars
            description: '',
            isAvailableForLocal: false,
            isAvailableForOutstation: false,
            avgRating: 0,  // Default for new cars
            ratingCount: 0,  // Default for new cars
            images: [],
            featured: [],
            isDeleted: false,
            category: {
                categoryId: '',
                categoryName: ''
            },
            owner: null,  // Will be set during form submission
            rentalOptions: {
                local: {
                    pricePerHour: 0,
                    maxKmPerHour: 0,
                    extraHourlyRate: 0,
                    extraKmRate: 0
                },
                outstation: {
                    pricePerDay: 0,
                    pricePerKm: 0,
                    maxKmLimitPerDay: 0,
                    minimumKmChargeable: 0,
                    extraDayRate: 0,
                    extraHourlyRate: 0,
                    extraKmRate: 0
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

            const imagePromises = Array.from(files).map(file => {
                if (file.size > 5000000) {
                    return $q.reject('File size exceeds 5MB limit');
                }
                const deferred = $q.defer();
                const reader = new FileReader();
                reader.onload = e => deferred.resolve(e.target.result);
                reader.onerror = () => deferred.reject('Failed to read file');
                reader.readAsDataURL(file);
                return deferred.promise;
            });

            $q.all(imagePromises)
                .then(results => {
                    vm.car.images.push(...results);
                })
                .catch(error => {
                    vm.imageError = error;
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
            // Update category with complete data
            console.log(selectedCategory);
            vm.car.category = {
                _id: selectedCategory._id,
                categoryName: selectedCategory.categoryName
            };

            vm.isSubmitting = true;

            // Validate rental options
            if (!vm.car.isAvailableForLocal && !vm.car.isAvailableForOutstation) {
                errorService.handleError('At least one rental option must be selected');
                vm.isSubmitting = false;
                return;
            }

            // Validate required fields based on rental options
            if (vm.car.isAvailableForLocal &&
                (!vm.car.rentalOptions.local.pricePerHour ||
                    !vm.car.rentalOptions.local.maxKmPerHour)) {
                errorService.handleError('All local rental fields are required');
                vm.isSubmitting = false;
                return;
            }

            if (vm.car.isAvailableForOutstation &&
                (!vm.car.rentalOptions.outstation.pricePerDay ||
                    !vm.car.rentalOptions.outstation.pricePerKm)) {
                errorService.handleError('All outstation rental fields are required');
                vm.isSubmitting = false;
                return;
            }

            // Set owner details
            vm.car.owner = {
                _id: vm.currentUser._id,
                username: vm.currentUser.username,
                email: vm.currentUser.email,
                role: 'owner',
                isApproved: true,
                rating: {
                    avgRating: 0,
                    ratingCount: 0
                },
                paymentPreference: 'cash'
            };

            const savePromise = vm.isEditMode ?
                carService.updateCar(vm.car) :
                carService.createCar(vm.car);

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