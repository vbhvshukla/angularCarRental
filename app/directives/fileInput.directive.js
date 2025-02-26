mainApp.directive('fileInput', function() {
    return {
        scope: {
            fileInput: '='
        },
        link: function(scope, element) {
            element.bind('change', function(changeEvent) {
                scope.$apply(function() {
                    scope.fileInput = changeEvent.target.files[0];
                });
            });
        }
    };
});