mainApp.component('carDetails', {
    templateUrl: 'app/components/carDetails/carDetails.template.html',
    controller: ['$scope', function($scope) {
        let $ctrl = this;
        
        $ctrl.currentImageIndex = 0;

        $ctrl.nextImage = function() {
            if ($ctrl.car.images.length > 0) {
                $ctrl.currentImageIndex = ($ctrl.currentImageIndex + 1) % $ctrl.car.images.length;
            }
        };

        $ctrl.prevImage = function() {
            if ($ctrl.car.images.length > 0) {
                $ctrl.currentImageIndex = ($ctrl.currentImageIndex - 1 + $ctrl.car.images.length) % $ctrl.car.images.length;
            }
        };
    }],
    bindings: {
        car: '<'
    }
});