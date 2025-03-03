mainApp.component('carCard', {
    templateUrl: 'app/components/carCard/carCard.view.html',
    controller: ['$scope', '$interval', function($scope, $interval) {

        //Variable initialization
        let $ctrl = this;
        $ctrl.currentImageIndex = 0;
        let carouselInterval; //For storing the interval id

        //Start the caraousel with 2 sec interval
        $ctrl.startCarousel = function() {
            if ($ctrl.car.images.length <= 1) return;    
            if (carouselInterval) $interval.cancel(carouselInterval);
            carouselInterval = $interval(function() {
                $ctrl.currentImageIndex = ($ctrl.currentImageIndex + 1) % $ctrl.car.images.length;
            }, 2000);
        };

        //Stop the carousel
        $ctrl.stopCarousel = function() {
            if (carouselInterval) {
                $interval.cancel(carouselInterval);
                $ctrl.currentImageIndex = 0;
            }
        };

        //Handle if somebody clicks upon the card
        $ctrl.handleButtonClick = function() {
            if ($ctrl.onButtonClick) {
                $ctrl.onButtonClick({ carId: $ctrl.car.carId });
            }
        };

        //Get the display price according to thte rental type
        $ctrl.getDisplayPrice = function() {
            if ($ctrl.car.rentalOptions.local) {
                return {
                    amount: $ctrl.car.rentalOptions.local.pricePerHour,
                    unit: 'hr'
                };
            } else if ($ctrl.car.rentalOptions.outstation) {
                return {
                    amount: $ctrl.car.rentalOptions.outstation.pricePerDay,
                    unit: 'day'
                };
            }
            return { amount: 0, unit: 'hr' };
        };

        //Good practice to destroy interval set
        $scope.$on('$destroy', function() {
            if (carouselInterval) {
                $interval.cancel(carouselInterval);
            }
        });
    }],
    bindings: {
        car: '<',
        onBook: '&',              //Binding For functions
        buttonText: '@',          
        onButtonClick: '&',       
        showButton: '<',          
        buttonClass: '@'          
    }
});