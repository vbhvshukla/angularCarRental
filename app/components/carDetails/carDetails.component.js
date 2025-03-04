mainApp.component('carDetails', {
   
    templateUrl: 'app/components/carDetails/carDetails.template.html',
   
    controller: [
   
        function () {

            /**
             * Variable declarations : 
             * @var $ctrl Alias for view modal in this component.
             * @var $ctrl.currentImageIndex Holds the current image's index of the carousel.
             */

            let $ctrl = this;
            $ctrl.currentImageIndex = 0;

            /**
             * Next Image Function
             * @description Toggles the next image in the images array.
             */
          
            $ctrl.nextImage = function () {
                if ($ctrl.car.images.length > 0) {
                    $ctrl.currentImageIndex = ($ctrl.currentImageIndex + 1) % $ctrl.car.images.length;
                }
            };
            
            /**
             * Previous Image Function
             * @description Toggles the previous image in the images array.
             */
            
            $ctrl.prevImage = function () {
                if ($ctrl.car.images.length > 0) {
                    $ctrl.currentImageIndex = ($ctrl.currentImageIndex - 1 + $ctrl.car.images.length) % $ctrl.car.images.length;
                }
            };
        }],
    bindings: {
        car: '<'
    }
});