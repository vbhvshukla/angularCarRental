mainApp.directive('compareTo', function() {
    return {
        require: 'ngModel',
        scope: {
            compareTo: '=' //Two way binding
        },
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue === scope.compareTo;
            };

            scope.$watch('compareTo', function() {
                ngModel.$validate();
            });
        }
    };
});