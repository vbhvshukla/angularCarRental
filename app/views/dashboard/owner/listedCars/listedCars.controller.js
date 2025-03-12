/** @file Owner's Listed Cars Page's Controller */

mainApp.controller('OwnerListedCarsController', ['$state','dbService', 'authService',
    function ($state,dbService, authService) {

        /**
         * Variable Declarations
         */

        let vm = this; //Alias for view model for this controller
        vm.cars = []; // Holds all the cars listed by the owner

        /**
         * Function :: Initialization
         * @requires authService
         * @description Get all cars of user.
         */
        vm.init = function () {
            authService.getUser()
            .then(user => vm.getAllCars(user.userId))
            .catch(err => console.log("Listed Cars controller :: Error Getting User :: ", err));
        }

        /**
         * Function :: Get All The Cars Of Users
         * @param {*} userId 
         * @description Fetch all the cars of the user by it's userId.
         */

        vm.getAllCars = function (userId) {
            dbService.getAllItemsByIndex('cars', 'ownerId', userId)
                .then((cars) => {
                    vm.cars = cars;
                })
                .catch(err => console.error("Listed Cars controller :: Error Getting Cars :: ", err));
        }

        /**
         * Edit car
         * @param {*} carId 
         * @description Redirects to the manipulateCars page.
         */

        vm.editCar = function(carId) {
            $state.go('ownerdashboard.manipulatecars', { carId: carId });
        };
    }
]);