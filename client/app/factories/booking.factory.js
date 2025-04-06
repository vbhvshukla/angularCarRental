mainApp.factory('bookingFactory', ['$q', 'bookingService', function ($q, bookingService) {
    function Booking(initialData = {}) {
        this._id = initialData._id || null; 
        this.user = initialData.user || null;
        this.car = initialData.car || null; 
        this.fromTimestamp = initialData.fromTimestamp || null;
        this.toTimestamp = initialData.toTimestamp || null; 
        this.rentalType = initialData.rentalType || 'local'; 
        this.extraKmCharges = initialData.extraKmCharges || 0;
        this.extraHourCharges = initialData.extraHourCharges || 0;
        this.extraDayCharges = initialData.extraDayCharges || 0; 
        this.status = initialData.status || 'pending'; 
        this.bidAmount = initialData.bidAmount || null; 
        this.bidBaseFare = initialData.bidBaseFare || null;
        this.createdAt = initialData.createdAt || null; 
        this.updatedAt = initialData.updatedAt || null; 
    }

    // Centralized validation logic
    function validateBookingData(bookingData) {
        const errors = [];

        if (!bookingData.user) {
            errors.push('User is required.');
        }

        if (!bookingData.car) {
            errors.push('Car is required.');
        }

        if (!bookingData.fromTimestamp || !bookingData.toTimestamp) {
            errors.push('Both fromTimestamp and toTimestamp are required.');
        }

        if (!['local', 'outstation'].includes(bookingData.rentalType)) {
            errors.push('Rental type must be either "local" or "outstation".');
        }

        return errors;
    }

    Booking.prototype = {
        create: function () {
            const deferred = $q.defer();

            const bookingData = this

            const errors = validateBookingData(bookingData);
            if (errors.length > 0) {
                deferred.reject({ message: 'Validation failed', errors });
            } else {
                bookingService.createBooking(bookingData)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        updateStatus: function (newStatus) {
            const deferred = $q.defer();

            if (!this._id) {
                deferred.reject({ message: 'Booking ID is required to update status.' });
            } else {
                bookingService.updateBookingStatus(this._id, newStatus)
                    .then(response => {
                        this.status = newStatus;
                        deferred.resolve(response);
                    })
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        addExtras: function (extras) {
            const deferred = $q.defer();

            if (!this._id) {
                deferred.reject({ message: 'Booking ID is required to add extras.' });
            } else {
                bookingService.addExtras(this._id, extras)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        validate: function () {
            const bookingData = {
                user: this.user,
                car: this.car,
                fromTimestamp: this.fromTimestamp,
                toTimestamp: this.toTimestamp,
                rentalType: this.rentalType
            };

            return validateBookingData(bookingData);
        }
    };

    return {
        createBooking: function (data) {
            return new Booking(data);
        },
        getBookingById: function (bookingId) {
            const deferred = $q.defer();

            if (!bookingId) {
                deferred.reject({ message: 'Booking ID is required to fetch booking.' });
            } else {
                bookingService.getBookingById(bookingId)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        getAllBookings: function () {
            return bookingService.getAllBookings();
        }
    };
}]);
