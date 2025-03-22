/**
 * Handle file Input
 * @description Handles the file to the element upon file change event.
 * @requires element
 */
mainApp.directive('fileInput', function() {
    return {
        scope: {
            fileInput: '=' //two way binding
        },
        link: function(scope, element) {
            //Binds the change event to the element 
            element.bind('change', function(changeEvent) {
                    scope.fileInput = changeEvent.target.files[0];
            });
        }
    };
});