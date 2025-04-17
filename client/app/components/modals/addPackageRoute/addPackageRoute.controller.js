mainApp.controller('AddPackageRouteController', [
    '$uibModalInstance', 'errorService', 'initialFrom', 'cityService',
    function ($uibModalInstance, errorService, initialFrom, cityService) {
        var vm = this;

        // Initialize new route object
        vm.newRoute = {
            from: initialFrom || '',
            to: '',
            distance: null,
            duration: '',
            stayDuration: '',
            description: ''
        };

        vm.cities = []; // List of cities for typeahead

        // Fetch cities
        cityService.getAllCities().then(cities => {
            vm.cities = cities; // Extract city names
        });

        /**
         * Add Route
         * @function addRoute
         * @description Validates and submits the route data
         */
        vm.addRoute = function () {
            if (!vm.newRoute.from || !vm.newRoute.to || !vm.newRoute.distance || !vm.newRoute.duration || !vm.newRoute.stayDuration || !vm.newRoute.description) {
                errorService.handleError("AddPackageRouteController :: Validation Error :: All fields are required.");
                return;
            }

            if (!vm.cities.includes(vm.newRoute.from) || !vm.cities.includes(vm.newRoute.to)) {
                errorService.handleError("Invalid city selected.");
                return;
            }

            // Pass the new route back to the caller
            $uibModalInstance.close(vm.newRoute);
        };

        /**
         * Close Modal
         * @function closeModal
         * @description Dismisses the modal without saving
         */
        vm.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);