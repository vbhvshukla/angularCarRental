/** @file Owner's Listed Cars Page's Controller */

mainApp.controller('OwnerListedCarsController', ['$state', 'carService', 'userFactory',
    function ($state, carService, userFactory) {

        /**
         * Variable Declarations
         */

        let vm = this; // Alias for view model for this controller
        vm.cars = []; // Holds all the cars listed by the owner

        /**
         * Function :: Initialization
         * @requires userFactory
         * @description Get all cars of the logged-in owner.
         */
        vm.init = function () {
            userFactory.getCurrentUser()
                .then(user => vm.getAllCars(user._id))
                .catch(err => console.error("Listed Cars Controller :: Error Getting User :: ", err));
        };

        /**
         * Function :: Get All The Cars Of User
         * @param {*} userId 
         * @description Fetch all the cars of the user by their userId using the backend API.
         */
        vm.getAllCars = function (userId) {
            carService.getCarsByOwner(userId)
                .then(cars => {
                    vm.cars = cars;
                    console.log("Owner Cars ;: " , cars);
                })
                .catch(err => console.error("Listed Cars Controller :: Error Getting Cars :: ", err));
        };

        /**
         * Edit car
         * @param {*} carId 
         * @description Redirects to the manipulateCars page.
         */
        vm.editCar = function (carId) {
            $state.go('ownerdashboard.manipulatecars', { carId: carId });
        };

        // Initialize the controller
        // vm.init();
    }
]);