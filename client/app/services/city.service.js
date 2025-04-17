mainApp.service('cityService', function ($http, $q, errorService) {
    // Local const BASE_URL = 'http://127.0.0.1:8006/api/v1/city';
    const BASE_URL = 'https://carental-12t8.onrender.com/api/v1/city';

    /**
     * @function getAllCities()
     * @description Fetches all cities from the backend.
     * @returns resolved or rejected promise.
     */
    this.getAllCities = function () {
        return $http.get(`${BASE_URL}`)
            .then(response => response.data)
            .catch(error => errorService.handleError(error, 'CityService :: Fetch All Cities Failed'));
    };
});