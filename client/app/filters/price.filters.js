/**
 * Price's filter
 * @description Returns the number passed into Ex : ₹100.00
 * @requires input
*/

mainApp.filter('price', function() {
    return function(input) {
        if (!input) return '₹0.00';
        return '₹' + parseFloat(input).toFixed(2);
    };
});

