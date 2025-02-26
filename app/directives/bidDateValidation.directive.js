mainApp.directive('bidDateValidation', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$validators.bidDateValidation = function(modelValue) {
                if (!modelValue) return true;
                
                const selectedDate = new Date(modelValue);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                return selectedDate >= today;
            };
        }
    };
});