mainApp.factory('carFactory', ['$q', 'carService', function ($q, carService) {
    function Car(initialData = {}) {
        this._id = initialData._id || null;
        this.carName = initialData.carName || '';
        this.carType = initialData.carType || '';
        this.city = initialData.city || '';
        this.description = initialData.description || '';
        this.isAvailableForLocal = initialData.isAvailableForLocal || false;
        this.isAvailableForOutstation = initialData.isAvailableForOutstation || false;
        this.images = initialData.images || [];
        this.featured = initialData.featured || [];
        this.isDeleted = initialData.isDeleted || false;
        this.category = initialData.category || { categoryId: '', categoryName: '' };
        this.owner = initialData.owner || null;
        this.rating = initialData.rating || { avgRating: 0, ratingCount: 0 }; 
        this.rentalOptions = initialData.rentalOptions || {
            local: {
                extraHourlyRate: 0,
                extraKmRate: 0,
                maxKmPerHour: 0,
                pricePerHour: 0
            },
            outstation: {
                pricePerDay: 0,
                pricePerKm: 0,
                minimumKmChargeable: 0,
                maxKmLimitPerDay: 0,
                extraKmRate: 0,
                extraHourRate: 0,
                extraDayRate: 0
            }
        };
    }

    function validateCarData(carData) {
        const errors = [];

        if (!carData.carName || carData.carName.trim() === '') {
            errors.push('Car name is required.');
        }

        if (!carData.carType || carData.carType.trim() === '') {
            errors.push('Car type is required.');
        }

        if (!carData.city || carData.city.trim() === '') {
            errors.push('City is required.');
        }

        if (!carData.category || !carData.category._id || carData.category._id.trim() === '') {
            errors.push('Category is required.');
        }

        if (!carData.owner || !carData.owner._id || carData.owner._id.trim() === '') {
            errors.push('Owner information is required.');
        }

        if (carData.isAvailableForLocal) {
            const local = carData.rentalOptions.local;
            if (!local.pricePerHour || local.pricePerHour <= 0) {
                errors.push('Price per hour for local rental must be greater than 0.');
            }
            if (!local.maxKmPerHour || local.maxKmPerHour <= 0) {
                errors.push('Max kilometers per hour for local rental must be greater than 0.');
            }
        }

        if (carData.isAvailableForOutstation) {
            const outstation = carData.rentalOptions.outstation;
            if (!outstation.pricePerDay || outstation.pricePerDay <= 0) {
                errors.push('Price per day for outstation rental must be greater than 0.');
            }
            if (!outstation.pricePerKm || outstation.pricePerKm <= 0) {
                errors.push('Price per kilometer for outstation rental must be greater than 0.');
            }
        }

        if (!carData.images || carData.images.length === 0) {
            errors.push('At least one image is required.');
        }

        if (carData.featured.length > 3) {
            errors.push('A maximum of 3 features are allowed.');
        }

        if (!carData.rating || typeof carData.rating.avgRating !== 'number' || typeof carData.rating.ratingCount !== 'number') {
            errors.push('Rating must include avgRating and ratingCount as numbers.');
        }

        return errors;
    }

    Car.prototype = {
        create: function () {
            const deferred = $q.defer();

            const errors = validateCarData(this);
            if (errors.length > 0) {
                deferred.reject({ message: 'Validation failed', errors });
            } else {
                const formData = new FormData();
                formData.append('carData', JSON.stringify(this)); 
                this.images.forEach(file => formData.append('images', file)); 

                carService.createCar(formData)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        update: function () {
            const deferred = $q.defer();

            if (!this._id) {
                deferred.reject({ message: 'Car ID is required to update.' });
            } else {
                const formData = new FormData();
                formData.append('carData', JSON.stringify(this)); 
                this.images.forEach(file => formData.append('images', file)); 

                carService.updateCar(this._id, formData)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        delete: function () {
            const deferred = $q.defer();

            if (!this._id) {
                deferred.reject({ message: 'Car ID is required to delete.' });
            } else {
                carService.deleteCar(this._id)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        validate: function () {
            return validateCarData(this);
        }
    };

    return {
        createCar: function (data) {
            return new Car(data);
        },
        getCarById: function (carId) {
            const deferred = $q.defer();

            if (!carId) {
                deferred.reject({ message: 'Car ID is required to fetch car.' });
            } else {
                carService.getCarById(carId)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        getAllCars: function () {
            return carService.getAllCars();
        }
    };
}]);
