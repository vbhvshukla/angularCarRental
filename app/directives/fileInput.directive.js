mainApp.directive('fileInput', function() {
    return {
        scope: {
            fileInput: '='
        },
        link: function(scope, element) {
            element.bind('change', function(changeEvent) {
                    scope.fileInput = changeEvent.target.files[0];
            });
        }
    };
});