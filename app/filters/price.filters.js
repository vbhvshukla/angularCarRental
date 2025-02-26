mainApp.filter('price', function() {
    return function(input) {
        if (!input) return '₹0.00';
        return '₹' + parseFloat(input).toFixed(2);
    };
});