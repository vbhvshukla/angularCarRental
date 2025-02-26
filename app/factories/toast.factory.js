mainApp.factory('toastService', ['$q', function($q) {
    if (typeof toastr !== 'undefined') {
        toastr.options = {
            "closeButton": true,
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "3000",
            "extendedTimeOut": "1000",
            "preventDuplicates": true,
            "newestOnTop": true
        };
    }

    function checkToastr() {
        if (typeof toastr === 'undefined') {
            console.error('Toastr is not loaded');
            return false;
        }
        return true;
    }

    return {
        error: function(message, title = 'Error') {
            console.error(`${title}: ${message}`);
            if (checkToastr()) {
                toastr.error(message, title);
            }
            return $q.reject(message);
        },

        success: function(message, title = 'Success') {
            console.log(`${title}: ${message}`);
            if (checkToastr()) {
                toastr.success(message, title);
            }
            return $q.when(message);
        },

        warning: function(message, title = 'Warning') {
            console.warn(`${title}: ${message}`);
            if (checkToastr()) {
                toastr.warning(message, title);
            }
            return $q.when(message);
        },

        info: function(message, title = 'Info') {
            console.info(`${title}: ${message}`);
            if (checkToastr()) {
                toastr.info(message, title);
            }
            return $q.when(message);
        },

        clear: function() {
            if (checkToastr()) {
                toastr.clear();
            }
        },

        // Configure toast options
        configure: function(options) {
            angular.extend(toastr.options, options);
        }
    };
}]);