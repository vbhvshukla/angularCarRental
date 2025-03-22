mainApp.service('bookingService', ['$q', 'dbService', 'errorService', 'idGenerator', function ($q, dbService, errorService, idGenerator) {

    /**
     * Variable Declarations
     */
    var service = this;
    const ITEMS_PER_PAGE = 5;
    const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

    /**
     * @function calculateBaseFare()
     * @description Calculates the base fare for a booking.
     * @param {*} bookingData 
     * @returns the baseFare.
     */

    service.calculateBaseFare = function (bookingData) {
        if (bookingData.bid === undefined) {
            const rentalType = bookingData.rentalType;
            const car = bookingData.car;
            const from = new Date(bookingData.fromTimestamp);
            const to = new Date(bookingData.toTimestamp);
            const diffTime = Math.abs(to - from);
            if (rentalType === 'local') {
                const totalHours = diffTime / (1000 * 60 * 60);
                return car.rentalOptions.local.pricePerHour * totalHours;
            } else if (rentalType === 'outstation') {
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return car.rentalOptions.outstation.pricePerDay * diffDays;
            }
            return 0;
        }
        else {
            const rentalType = bookingData.rentalType;
            const car = bookingData.bid.car;
            const from = new Date(bookingData.bid.fromTimestamp);
            const to = new Date(bookingData.bid.toTimestamp);
            const diffTime = Math.abs(to - from);
            if (rentalType === 'local') {
                const totalHours = diffTime / (1000 * 60 * 60);
                return car.rentalOptions.local.pricePerHour * totalHours;
            } else if (rentalType === 'outstation') {
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return car.rentalOptions.outstation.pricePerDay * diffDays;
            }
            return 0;
        }

    };

    /**
     * @function calculatedTotalAmount()
     * @description Calculates the total amount for a booking.
     * @param {*} bookingData 
     * @returns the total amount.
     */

    service.calculateTotalAmount = function (bookingData) {
        if (!bookingData) return 0;

        const baseFare = service.calculateBaseFare(bookingData);
        const extraKmCharges = bookingData.extraKmCharges || 0;
        const extraHourCharges = bookingData.extraHourCharges || 0;
        const extraDayCharges = bookingData.extraDayCharges || 0;

        // If it's a bid being passed, use bidAmount instead of calculating
        if (bookingData.bidId) {
            return bookingData.bidAmount;
        }

        // For bookings, calculate total with all charges
        return baseFare + extraKmCharges + extraHourCharges + extraDayCharges;
    };


    /**
     * @function createBooking()
     * @description Takes booking data adds it into DB.
     * @param {*} bookingData 
     * @returns resolved/rejected promise.
     */

    service.createBooking = function (bookingData) {
        let deferred = $q.defer();

        // Calculate base fare and total amount
        let calculatedBaseFare = service.calculateBaseFare(bookingData);
        let calculatedTotalAmount = service.calculateTotalAmount(bookingData);

        // Validate booking data
        if (!bookingData || !bookingData.fromTimestamp || !bookingData.toTimestamp) {
            throw new Error('Missing required booking information');
        }

        if (!bookingData.bidId || !bookingData.user || !bookingData.car) {
            throw new Error('Invalid bid information');
        }

        // Create booking object
        const booking = {
            bookingId: idGenerator.generate(),
            fromTimestamp: bookingData.fromTimestamp,
            toTimestamp: bookingData.toTimestamp,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            rentalType: bookingData.rentalType,
            bid: {
                bidId: bookingData.bidId,
                fromTimestamp: bookingData.fromTimestamp,
                toTimestamp: bookingData.toTimestamp,
                status: 'accepted',
                createdAt: bookingData.createdAt,
                bidAmount: bookingData.bidAmount,
                rentalType: bookingData.rentalType,
                bidBaseFare: bookingData.bidBaseFare,
                user: bookingData.user,
                car: bookingData.car
            },
            baseFare: calculatedBaseFare,
            extraKmCharges: 0,
            extraHourCharges: 0,
            totalFare: calculatedTotalAmount
        };

        // Check car availability
        service.checkCarAvailability(
            bookingData.car.carId,
            bookingData.fromTimestamp,
            bookingData.toTimestamp
        )
            .then(function (available) {
                if (!available) {
                    throw new Error('Car is not available for selected dates');
                }

                // Save booking to the backend
                return $http.post('/api/v1/booking/create', booking);
            })
            .then(function (response) {
                errorService.logSuccess('Booking created successfully!');
                deferred.resolve(response.data);
            })
            .catch(function (error) {
                errorService.handleError('Booking Service :: Error creating booking: ' + error.message);
                deferred.reject(error);
            });

        return deferred.promise;
    };

    /**
     * @function updateBookingStatus()
     * @description Takes the bookingId and updates its status.
     * @param {*} bookingId 
     * @param {*} newStatus 
     * @returns resolved/rejected promise.
     */

    service.updateBookingStatus = function (bookingId, newStatus) {
        if (!VALID_STATUSES.includes(newStatus)) {
            return $q.reject(new Error('Invalid status'));
        }

        return $http.put(`/api/v1/booking/updatestatus/${bookingId}`, { newStatus })
            .then(response => response.data)
            .catch(error => errorService.handleError('Booking Service :: Error updating booking status', error));
    };

    /**
     * @function checkCarAvailability()
     * @description Takes the car id and timestamps to check if the car is already booked.
     * @param {*} carId 
     * @param {*} fromTimestamp 
     * @param {*} toTimestamp 
     * @returns resolved or rejected promise.
     */
    service.checkCarAvailability = function (carId, fromTimestamp, toTimestamp) {
        return $http.get(`/api/v1/booking/checkavailability?carId=${carId}&fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`)
            .then(response => response.data.isAvailable)
            .catch(error => errorService.handleError('Booking Service :: Error checking car availability', error));
    };

    /**
     * @function getUserBookings()
     * @description Takes the userId and gets all the user bookings.
     * @param {*} userId 
     * @param {*} page 
     * @param {*} filters 
     * @returns resolved or rejected promise.
     */
    service.getUserBookings = function (userId, page = 1, filters = {}) {
        const queryParams = new URLSearchParams({ page, ...filters }).toString();
        return $http.get(`/api/v1/booking/userbookings/${userId}?${queryParams}`)
            .then(response => response.data)
            .catch(error => errorService.handleError('Booking Service :: Error fetching user bookings', error));
    };

    /**
     * @function cancelBooking()
     * @description Cancels a booking by id.
     * @param {*} bookingId 
     * @returns resolved or rejected promise.
     */
    service.cancelBooking = function (bookingId) {
        return $http.post(`/api/v1/booking/cancel/${bookingId}`)
            .then(response => response.data)
            .catch(error => errorService.handleError('Booking Service :: Error cancelling booking', error));
    };

    /**
     * @function submitRating()
     * @description Submits a rating for a booking.
     * @param {*} carId 
     * @param {*} rating 
     * @returns resolved or rejected promise.
     */

    service.submitRating = function (carId, rating) {
        return $http.post(`/api/v1/car/rate/${carId}`, { rating })
            .then(response => response.data)
            .catch(error => errorService.handleError('Booking Service :: Error submitting rating', error));
    };

    /**
     * @function addExtras
     * @description Adds extras to a booking.
     * @param {*} bookingData 
     * @param {*} extraKm 
     * @param {*} extraHr 
     * @param {*} extraDay 
     * @returns resolved or rejected promise.
     */
    service.addExtras = function (bookingId, extras) {
        return $http.put(`/api/v1/booking/addextras/${bookingId}`, extras)
            .then(response => response.data)
            .catch(error => errorService.handleError('Booking Service :: Error adding extras', error));
    };

    /**
     * @function getBookingsForOwner
     * @description Takes the ownerId and gets all the bookings for the owner.
     * @param {*} ownerId 
     * @param {*} page 
     * @param {*} limit 
     * @param {*} filters 
     * @returns resolved or rejected promise.
     */
    service.getBookingsForOwner = function (ownerId, page, limit, filters) {
        const params = {
            page,
            limit,
            bookingType: filters.bookingType || 'all'
        };
        return $http.get(`/api/v1/booking/ownerbookings/${ownerId}`, { params })
            .then(response => response.data);
    };

    return service;
}]);