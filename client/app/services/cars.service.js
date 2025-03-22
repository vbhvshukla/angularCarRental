mainApp.service('carService', ['$http', '$q', function ($http, $q) {
    const BASE_URL = "http://127.0.0.1:8006/api/v1/car";

    /**
     * @function getAllCars()
     * @description Gets all the cars from the backend.
     * @returns resolved or rejected promise.
     */
    this.getAllCars = function () {
        const deferred = $q.defer();
        $http.get(`${BASE_URL}`)
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    /**
     * @function getCarById()
     * @description Get a particular car by its ID.
     * @param {*} carId 
     * @returns resolved or rejected promise.
     */
    this.getCarById = function (carId) {
        const deferred = $q.defer();
        $http.get(`${BASE_URL}/getcar/${carId}`)
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    /**
     * @function getCarsByOwner()
     * @param {*} ownerId 
     * @returns resolved or rejected promise.
     */
    this.getCarsByOwner = function (ownerId) {
        console.log("Car Service :: Owner Id",ownerId);
        const deferred = $q.defer();
        $http.get(`${BASE_URL}/owner/${ownerId}`)
            .then(response => {
                deferred.resolve(response.data)
            })
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    /**
     * @function getCarsByCategory()
     * @description Get Cars By Category
     * @param {*} categoryId 
     * @returns resolved or rejected promise.
     */
    this.getCarsByCategory = function (categoryId) {
        const deferred = $q.defer();
        $http.get(`${BASE_URL}/category/${categoryId}`)
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    /**
     * @function getCarsByCity()
     * @description Get Cars By City
     * @param {*} city 
     * @returns resolved or rejected promise.
     */
    this.getCarsByCity = function (city) {
        const deferred = $q.defer();
        $http.get(`${BASE_URL}/city/${city}`)
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    /**
     * @function createCar()
     * @description Create a car in the backend.
     * @param {*} car 
     * @returns resolved or rejected promise.
     */
    this.createCar = function (car) {
        console.log(car);
        const deferred = $q.defer();
        $http.post(`${BASE_URL}/create`, car, {
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    this.getAvailableCarsWithPagination = function (currentPage, itemsPerPage, filters = {}) {
        const deferred = $q.defer();
        const params = {
            page: currentPage,
            limit: itemsPerPage,
            ...filters // Include any filters passed
        };
        $http.get(`${BASE_URL}/available`, { params })
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    /**
     * @function updateCar()
     * @param {*} carId 
     * @param {*} carData 
     * @returns resolved or rejected promise.
     */
    this.updateCar = function (carId, carData) {
        console.log("CLIENT :: Car Service :: Update Car :: Car Data  ",carId)
        const deferred = $q.defer();
        $http.put(`${BASE_URL}/update/${carId._id}`, carId, {
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    /**
     * @function deleteCar()
     * @param {*} carId 
     * @returns resolved or rejected promise.
     */
    this.deleteCar = function (carId) {
        const deferred = $q.defer();
        $http.delete(`${BASE_URL}/${carId}`)
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    /**
     * @function getAvailableCars()
     * @description Gets all available cars from the backend.
     * @returns resolved or rejected promise.
     */
    this.getAvailableCars = function () {
        const deferred = $q.defer();
        $http.get(`${BASE_URL}/available`)
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };

    /**
     * @function searchCars()
     * @param {*} criteria 
     * @returns resolved or rejected promise.
     */
    this.searchCars = function (criteria) {
        const deferred = $q.defer();
        $http.get(`${BASE_URL}`, { params: criteria })
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));
        return deferred.promise;
    };
}]);