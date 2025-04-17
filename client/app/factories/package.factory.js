mainApp.factory('packageFactory', ['$q', 'packageService', function ($q, packageService) {
    function Package(initialData = {},images) {
        this._id = initialData._id || null;
        this.name = initialData.name || '';
        this.packagePrice = initialData.packagePrice || 0;
        this.images = images;
        this.from = initialData.from || '';
        this.to = initialData.to || '';
        this.description = initialData.description || '';
        this.routes = initialData.routes || [];
        this.cars = initialData.car || {};
        this.driverIncluded = initialData.driverIncluded || false;
        this.isActive = initialData.isActive !== undefined ? initialData.isActive : true;
        this.owner = initialData.owner || {};
    }

    // Validation logic
    function validatePackageData(packageData) {
        const errors = [];

        if (!packageData.name || packageData.name.length < 3) {
            errors.push('Package name must be at least 3 characters long.');
        }

        if (!packageData.packagePrice || packageData.packagePrice <= 0) {
            errors.push('Package price must be greater than 0.');
        }

        if (!packageData.from) {
            errors.push('From location is required.');
        }

        if (!packageData.to) {
            errors.push('To location is required.');
        }

        if (!packageData.description || packageData.description.length < 10) {
            errors.push('Description must be at least 10 characters long.');
        }

        return errors;
    }

    Package.prototype = {
        create: function () {
            const deferred = $q.defer();
            const images = this.images

            console.log('Package Factory :: ', this);
            const packageData = {
                name: this.name,
                packagePrice: this.packagePrice,
                from: this.from,
                to: this.to,
                description: this.description,
                routes: this.routes,
                cars: this.cars,
                driverIncluded: this.driverIncluded,
                isActive: this.isActive,
                owner: this.owner
            };
            console.log('Package Factory :: Package Data ',packageData);


            const errors = validatePackageData(packageData);
            if (errors.length > 0) {
                deferred.reject({ message: 'Validation failed', errors });
            } else {
                packageService.createPackage(packageData,images)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        update: function () {
            const deferred = $q.defer();

            if (!this._id) {
                deferred.reject({ message: 'Package ID is required for update.' });
            } else {
                const packageData = {
                    name: this.name,
                    packagePrice: this.packagePrice,
                    from: this.from,
                    to: this.to,
                    description: this.description,
                    routes: this.routes,
                    cars: this.cars,
                    driverIncluded: this.driverIncluded,
                    isActive: this.isActive
                };

                packageService.updatePackage(this._id, packageData, this.images)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        markInactive: function () {
            const deferred = $q.defer();

            if (!this._id) {
                deferred.reject({ message: 'Package ID is required to mark inactive.' });
            } else {
                packageService.markPackageInactive(this._id)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        getPackageById: function (packageId) {
            const deferred = $q.defer();

            if (!packageId) {
                deferred.reject({ message: "Package ID is required to fetch the package." });
            } else {
                packageService.getPackageById(packageId)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        }
    };

    return {
        createPackage: function (data, images) {
            return new Package(data, images);
        },
        getAllPackages: function (page, limit, from, to) {
            return packageService.getAllPackages(page, limit, from, to);
        }
    };
}]);