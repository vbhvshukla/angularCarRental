mainApp.component('carCard', {
    templateUrl: 'app/components/carCard/carCard.view.html',
    controller: ['$scope', '$interval', function($scope, $interval) {
        let $ctrl = this;
        $ctrl.currentImageIndex = 0;
        let carouselInterval;

        $ctrl.startCarousel = function() {
            if ($ctrl.car.images.length <= 1) return;    
            if (carouselInterval) $interval.cancel(carouselInterval);
            carouselInterval = $interval(function() {
                $ctrl.currentImageIndex = ($ctrl.currentImageIndex + 1) % $ctrl.car.images.length;
            }, 2000);
        };

        $ctrl.stopCarousel = function() {
            if (carouselInterval) {
                $interval.cancel(carouselInterval);
                $ctrl.currentImageIndex = 0;
            }
        };

        $ctrl.handleButtonClick = function() {
            if ($ctrl.onButtonClick) {
                $ctrl.onButtonClick({ carId: $ctrl.car.carId });
            }
        };

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
        onBook: '&',
        buttonText: '@',          // Custom button text
        onButtonClick: '&',       // Custom button click handler
        showButton: '<',          // Optional: control button visibility
        buttonClass: '@'          // Optional: custom button CSS class
    }
});