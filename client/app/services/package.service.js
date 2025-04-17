mainApp.service('packageService', ['$http', '$q', function ($http, $q) {

    // const BASE_URL = 'http://127.0.0.1:8006/api/v1/packages';
    const BASE_URL = 'https://carental-12t8.onrender.com/api/v1/packages';

    // Fetch all packages with optional query parameters
    this.getAllPackages = function (page = 1, limit = 10, from = null, to = null) {
        const deferred = $q.defer();
        let queryString = `?page=${page}&limit=${limit}`;
        if (from) queryString += `&from=${encodeURIComponent(from)}`;
        if (to) queryString += `&to=${encodeURIComponent(to)}`;

        $http.get(`${BASE_URL}/allpackages${queryString}`)
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));

        return deferred.promise;
    };
    //Get package by id
    this.getPackageById = function (packageId) {
        const deferred = $q.defer();

        $http.get(`${BASE_URL}/${packageId}`)
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));

        return deferred.promise;
    };

    // Create a new package
    this.createPackage = function (packageData, images) {
        const deferred = $q.defer();
        const formData = new FormData();
        console.log('Images :: ', images)
        formData.append('packageData', JSON.stringify(packageData));
        formData.append('images', images);

        console.log(formData)

        $http.post(`${BASE_URL}/create`, formData, {
            headers: { 'Content-Type': undefined }
        })
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));

        return deferred.promise;
    };

    // Update an existing package
    this.updatePackage = function (packageId, packageData, images) {
        const deferred = $q.defer();
        const formData = new FormData();
        formData.append('packageData', JSON.stringify(packageData));
        if (images && images.length > 0) {
            images.forEach(image => formData.append('images', image));
        }

        $http.put(`${BASE_URL}/update/${packageId}`, formData, {
            headers: { 'Content-Type': undefined }
        })
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));

        return deferred.promise;
    };

    // Mark a package as inactive
    this.markPackageInactive = function (packageId) {
        const deferred = $q.defer();
        $http.put(`${BASE_URL}/markInactive`, { packageId })
            .then(response => deferred.resolve(response.data))
            .catch(error => deferred.reject(error));

        return deferred.promise;
    };
}]);