mainApp.component('priceInfoModal', {
    
    templateUrl: 'app/components/price-info/price-info-modal.template.html',
    
    controller: ['$scope', function($scope) {
    
        /**
         * Variable declarations 
         * @var $ctrl : Alias for view modal object of the component.
         */

        let $ctrl = this;

        /**
         * Function : Close the modal.
         */

        $ctrl.close = function() {
            $ctrl.onClose();
        };

        /**
         * Function : Format The Price
         * @param {*} price 
         * @returns Amount prefixed with '₹'
         */
        
        $ctrl.formatPrice = function(price) {
            return '₹' + parseFloat(price).toFixed(2);
        };
    }],

    /**
     * Bindings for the component
     */
    
    bindings: {
        car: '<',
        onClose: '&'
    }
});