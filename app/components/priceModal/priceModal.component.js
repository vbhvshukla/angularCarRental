mainApp.component('priceInfoModal', {
    templateUrl: 'app/components/price-info/price-info-modal.template.html',
    controller: ['$scope', function($scope) {
        let $ctrl = this;

        $ctrl.close = function() {
            $ctrl.onClose();
        };

        $ctrl.formatPrice = function(price) {
            return '₹' + parseFloat(price).toFixed(2);
        };
    }],
    bindings: {
        car: '<',
        onClose: '&'
    }
});