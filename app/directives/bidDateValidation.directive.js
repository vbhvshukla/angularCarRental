/** 
 * Bid Date Validation Directive
 * @description If the selected date is before today return false.
 * @requires ngModel
 * @returns boolean
 */

mainApp.directive('bidDateValidation', function() {
    return {
        require: 'ngModel',
        link: function(ngModel) {
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