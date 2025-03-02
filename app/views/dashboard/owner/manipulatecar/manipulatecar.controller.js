mainApp.controller('ManipulateCarController', [
    '$scope', '$state', '$q','$stateParams', 'carService', 'categoryService', 'cityService', 'authService', 'errorService',
    function ($scope, $state, $q, $stateParams, carService, categoryService, cityService, authService, errorService) {
        let vm = this;

        // Initialize variables
        vm.loading = false;
        vm.isEditMode = !!$stateParams.carId;
        vm.isSubmitting = false;
        vm.imageError = '';
        vm.categories = [];
        vm.cities = [];
        vm.currentUser = null;
        vm.newFeature = '';

        // Initialize empty car object
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
            isDeleted:false,
            category: {
                categoryId: '',
                categoryName: ''
            },
            owner: null,  // Will be set during form submission
            rentalOptions: {
                local: {
                    pricePerHour: 0,
                    maxKmPerHour: 0,
                    extraHourRate: 0,
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

        // Initialize controller
        vm.init = function() {
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

        // Add this function after vm.init
        vm.handleCategorySelect = function() {
            const selectedCategory = vm.categories.find(c => 
                c.categoryName.toLowerCase() === vm.car.category.categoryName.toLowerCase()
            );
            
            if (selectedCategory) {
                vm.car.category = {
                    categoryId: selectedCategory.categoryId,
                    categoryName: selectedCategory.categoryName // Use exact case from database
                };
            } else {
                vm.car.category = { categoryId: '', categoryName: '' };
                errorService.handleError('Please select a valid category');
            }
        };

        // Handle image uploads
        vm.handleImageUpload = function(files) {
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

        // Add a feature
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
        // Remove a feature
        vm.removeFeature = function (index) {
            vm.car.featured.splice(index, 1);
        };

        // Remove image
        vm.removeImage = function (index) {
            vm.car.images.splice(index, 1);
        };

        // Form submission
        vm.submitForm = function (isValid) {
            if (!isValid) return;

            // Validate category
            const selectedCategory = vm.categories.find(c => c.categoryName === vm.car.category.categoryName);
            if (!selectedCategory) {
                errorService.handleError('Please select a valid category');
                return;
            }
            // Update category with complete data
            vm.car.category = {
                categoryId: selectedCategory.categoryId,
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
                userId: vm.currentUser.userId,
                username: vm.currentUser.username,
                email: vm.currentUser.email,
                role: 'owner',
                isApproved: true,
                avgRating: 0,
                ratingCount: 0,
                paymentPreference: 'both'
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

        // Navigation
        vm.goBack = function () {
            $state.go('ownerdashboard.listedcars');
        };

        // Cancel
        vm.cancel = function () {
            vm.goBack();
        };
    }
]);