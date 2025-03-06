mainApp.component('carCard', {

    templateUrl: 'app/components/carCard/carCard.view.html',

    controller: ['$scope', '$interval',

        function ($scope, $interval) {

            /**
             * Variable Initialization 
             * @var $ctrl Alias for view modal for this particular component.
             * @var carouselInterval Stores the interval id of the carousel.
             * @var currentImageIndex Stores the index of the image from the images array.
             */

            let $ctrl = this;
            let carouselInterval;
            $ctrl.currentImageIndex = 0;

            /**
             * Start carousel function
             * @description Starts the carousel at an interval of 2 seconds.
             */

            $ctrl.startCarousel = function () {
                if ($ctrl.car.images.length <= 1) return;
                if (carouselInterval) $interval.cancel(carouselInterval);
                carouselInterval = $interval(function () {
                    $ctrl.currentImageIndex = ($ctrl.currentImageIndex + 1) % $ctrl.car.images.length;
                }, 2000);
            };

            /**
             * Stop carousel function
             * @description Stops the carousel
             */

            $ctrl.stopCarousel = function () {
                if (carouselInterval) {
                    $interval.cancel(carouselInterval);
                    $ctrl.currentImageIndex = 0;
                }
            };

            /**
             * Handle Card Click
             * @description Stores the carId in the @var $ctrl.car.carId
             */

            $ctrl.handleButtonClick = function () {
                if ($ctrl.onButtonClick) {
                    $ctrl.onButtonClick({ carId: $ctrl.car.carId });
                }
            };

            /**
             * Get the Display Price according to the rental types (Hr/day)
             * @description If the rentalOption is local than display it in hours(hr) else day.
             */

            $ctrl.getDisplayPrice = function () {
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

            /**
             * Upon unmount, Destroy the interval
             */

            $scope.$on('$destroy', function () {
                if (carouselInterval) {
                    $interval.cancel(carouselInterval);
                }
            });
        }],

    /**
     * Bindings for the component
     * @description < : one way binding of data
     *              & : binding function
     *              @ : binding string  
     */

    bindings: {
        car: '<',
        onBook: '&',
        buttonText: '@',
        onButtonClick: '&',
        showButton: '<',
        buttonClass: '@'
    }
});