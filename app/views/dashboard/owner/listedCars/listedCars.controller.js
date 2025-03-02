mainApp.controller('OwnerListedCarsController', ['$state','dbService', 'authService',
    function ($state,dbService, authService) {

        // Variable Declaration
        let vm = this;

        vm.cars = []; // Holds all the cars listed by the owner

        // Initialization function
        vm.init = function () {
            authService.getUser()
            .then(user => vm.getAllCars(user.userId))
            .catch(err => console.log("Listed Cars controller :: Error Getting User :: ", err));
        }
        console.log(vm.cars)
        // Get all the cars listed by the owner
        vm.getAllCars = function (userId) {
            dbService.getAllItemsByIndex('cars', 'ownerId', userId)
                .then((cars) => {
                    vm.cars = cars;
                })
                .catch(err => console.error("Listed Cars controller :: Error Getting Cars :: ", err));
        }

        vm.editCar = function(carId) {
            $state.go('ownerdashboard.manipulatecars', { carId: carId });
        };
    }
]);