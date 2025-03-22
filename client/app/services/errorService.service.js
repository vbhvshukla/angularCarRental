mainApp.service('errorService', ['$q', function($q) {
    this.handleError = function(error, title = 'Error') {
        console.error(`${title}:`, error);
        return $q.reject(error);
    };

    this.logSuccess = function(message, title = 'Success') {
        console.log(`${title}:`, message);
        return $q.when(message);
    };

    this.logWarning = function(message, title = 'Warning') {
        console.warn(`${title}:`, message);
        return $q.when(message);
    };

    this.logInfo = function(message, title = 'Info') {
        console.info(`${title}:`, message);
        return $q.when(message);
    };
}]);