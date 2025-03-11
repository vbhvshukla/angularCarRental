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
     * @function applyFilterConditions()
     * @description Apply filter conditions according to the booking and filters passed.
     * @param {*} booking 
     * @param {*} filters 
     * @returns bookings
     */

    function applyFilterConditions(booking, filters) {
        if (!filters) return true;

        if (filters.searchCar && !booking.bid.car.carName.toLowerCase().includes(filters.searchCar.toLowerCase())) return false;
        if (filters.startDate && new Date(booking.fromTimestamp) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(booking.toTimestamp) > new Date(filters.endDate)) return false;
        if (filters.maxAmount && booking.bid.bidAmount > filters.maxAmount) return false;

        const currentDate = new Date();
        const bookingStartDate = new Date(booking.fromTimestamp);
        const bookingEndDate = new Date(booking.toTimestamp);

        if (filters.status) {
            if (filters.status === "cancelled" && booking.status !== "cancelled") return false;
            if (filters.status === "active" && (booking.status === "cancelled" || bookingEndDate < currentDate)) return false;
            if (filters.status === "past" && (bookingEndDate >= currentDate || booking.status === "cancelled")) return false;
        }

        return true;
    };

    /**
     * @function createBooking()
     * @description Takes booking data adds it into DB.
     * @param {*} bookingData 
     * @returns resolved/rejected promise.
     */

    service.createBooking = function (bookingData) {
        // debugger
        let deferred = $q.defer();
        let calculatedBaseFare = service.calculateBaseFare(bookingData);
        let calculatedTotalAmount = service.calculateTotalAmount(bookingData);

        if (!bookingData || !bookingData.fromTimestamp || !bookingData.toTimestamp) {
            throw new Error('Missing required booking information');
        }

        if (!bookingData.bidId || !bookingData.user || !bookingData.car) {
            throw new Error('Invalid bid information');
        }

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

        const carAvailability = {
            availibilityId : idGenerator.generate(),
            carId: bookingData.car.carId,
            fromTimestamp: new Date(bookingData.fromTimestamp),
            toTimestamp: new Date(bookingData.toTimestamp)
        };

        service.checkCarAvailability(
            bookingData.car.carId,
            bookingData.fromTimestamp,
            bookingData.toTimestamp
        )
            .then(function (available) {
                if (!available) {
                    throw new Error('Car is not available for selected dates');
                }
                // First add the booking
                return dbService.addItem('bookings', booking)
            })
            .then(function (bookingData) {
                console.log(bookingData)
                // Then add car availability
                return dbService.addItem('carAvailibility', carAvailability);
            })
            .then(function () {
                errorService.logSuccess('Booking created successfully!');
                deferred.resolve(booking);
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
        var deferred = $q.defer();

        if (!VALID_STATUSES.includes(newStatus)) {
            deferred.reject(new Error('Invalid status'));
            return deferred.promise;
        }

        dbService.getItemByKey('bookings', bookingId)
            .then(function (booking) {
                booking.status = newStatus;
                return dbService.updateItem('bookings', booking);
            })
            .then(function () {
                errorService.logSuccess('Booking status updated successfully!');
                deferred.resolve();
            })
            .catch(function (error) {
                errorService.handleError('Error updating booking status');
                deferred.reject(error);
            });

        return deferred.promise;
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
        let deferred = $q.defer();

        dbService.getAllItems('carAvailibility')
            .then(function (availabilities) {
                const carAvailabilities = availabilities.filter(availability => availability.carId === carId);

                const isOverlapping = carAvailabilities.some(function (availability) {
                    const existingFrom = new Date(availability.fromTimestamp);
                    const existingTo = new Date(availability.toTimestamp);
                    const newFrom = new Date(fromTimestamp);
                    const newTo = new Date(toTimestamp);

                    return (
                        (newFrom >= existingFrom && newFrom <= existingTo) || // new start date falls within existing booking
                        (newTo >= existingFrom && newTo <= existingTo) || // new end date falls within existing booking
                        (newFrom <= existingFrom && newTo >= existingTo) // new booking completely exceeds existing booking
                    );
                });

                deferred.resolve(!isOverlapping);
            })
            .catch(function (error) {
                errorService.handleError('Error checking car availability');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    /**
     * @function getUserBookings()
     * @description Takes the userId and gets all the user bookings.
     * @param {*} userId 
     * @param {*} page 
     * @param {*} filters 
     * @returns resolved or rejected promise.
     */

    service.getUserBookings = function (userId, page, filters) {
        var deferred = $q.defer();

        if (!userId) {
            deferred.reject(new Error('User ID is required'));
            return deferred.promise;
        }

        dbService.getItemsWithPagination('bookings', page, ITEMS_PER_PAGE)
            .then(function (bookings) {
                const filteredBookings = bookings.filter(function (booking) {
                    return booking.bid.user.userId === userId && applyFilterConditions(booking, filters);
                });
                deferred.resolve(filteredBookings);
            })
            .catch(function (error) {
                errorService.handleError('Error fetching bookings', 'error');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    /**
     * @function cancelBooking()
     * @description Cancels a booking by id.
     * @param {*} bookingId 
     * @returns resolved or rejected promise.
     */
    service.cancelBooking = function (bookingId) {
        var deferred = $q.defer();

        dbService.getItemByKey('bookings', bookingId)
            .then(function (booking) {
                booking.status = 'cancelled';
                return Promise.all([
                    dbService.updateItem('bookings', booking),
                    dbService.deleteItemByQuery('carAvailability', { carId: booking.bid.car.carId })
                ]).then(() => { console.log("Done") }).catch((err) => { console.log("Booking Service :: Error Cancelling Booking", err) });
            })
            .then(function () {
                errorService.logSuccess('Booking cancelled successfully!');
                deferred.resolve();
            })
            .catch(function (error) {
                errorService.handleError('Error cancelling booking', 'error');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    /**
     * @function submitRating()
     * @description Submits a rating for a booking.
     * @param {*} carId 
     * @param {*} rating 
     * @returns resolved or rejected promise.
     */

    service.submitRating = function (carId, rating) {
        var deferred = $q.defer();

        dbService.getItemByKey('cars', carId)
            .then(function (car) {
                car.ratingCount = car.ratingCount ? car.ratingCount + 1 : 1;
                car.avgRating = ((car.avgRating * (car.ratingCount - 1)) + rating) / car.ratingCount;
                return dbService.updateItem('cars', car);
            })
            .then(function () {
                errorService.logSuccess('Rating submitted successfully!');
                deferred.resolve();
            })
            .catch(function (error) {
                errorService.handleError('Error submitting rating', 'error');
                deferred.reject(error);
            });

        return deferred.promise;
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
    service.addExtras = function (bookingData, extraKm, extraHr, extraDay) {
        let deferred = $q.defer();
        const rentalType = bookingData.rentalType;
        const car = bookingData.bid.car;
        if (rentalType === 'local') {
            const extraKmCharges = car.rentalOptions.local.extraKmRate * extraKm;
            const extraHourCharges = car.rentalOptions.local.extraHourRate * extraHr;
            const totalFare = bookingData.totalFare + extraHourCharges + extraKmCharges;
            dbService.updateItem("bookings", {
                ...bookingData,
                extraHourCharges: extraHourCharges,
                extraKmCharges: extraKmCharges,
                totalFare: totalFare
            }).then((res) => { deferred.resolve(res) })
                .catch((err) => { deferred.reject(err) })
        } else if (rentalType === 'outstation') {
            const extraKmCharges = car.rentalOptions.outstation.extraKmRate * extraKm;
            const extraHourCharges = car.rentalOptions.outstation.extraHourlyRate * extraHr;
            const extraDayCharges = car.rentalOptions.outstation.extraDayRate * extraDay;
            const totalFare = bookingData.totalFare + extraHourCharges + extraKmCharges + extraDayCharges;
            dbService.updateItem("bookings", {
                ...bookingData,
                extraHourCharges: extraHourCharges,
                extraKmCharges: extraKmCharges,
                totalFare: totalFare
            }).then((res) => { deferred.resolve(res) })
                .catch((err) => { deferred.reject(err) })
        }
        return deferred.promise;
    }

    return service;
}]);