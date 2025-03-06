mainApp.service('bookingService', ['$q', 'dbService', 'errorService', 'idGenerator', function ($q, dbService, errorService, idGenerator) {

    //Variable declaration
    var service = this;
    const ITEMS_PER_PAGE = 5;
    const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

    /*Functions available 
    CreateBooking(used for accepting the bid)
    CheckCarAvailibility
    UpdateBookingStatus,
    GetUserBookings
    CancelBooking
    SubmitRatingt
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

    service.calculateTotalAmount = function (bookingData) {
        const baseFare = service.calculateBaseFare(bookingData);
        const extraKmCharges = bookingData.extraKmCharges || 0;
        const extraHourCharges = bookingData.extraHourCharges || 0;
        return baseFare + extraKmCharges + extraHourCharges;
    };

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

    service.createBooking = function (bookingData) {
        let deferred = $q.defer();
        let calculatedBaseFare = service.calculateBaseFare(bookingData);
        let calculatedTotalAmount = service.calculateTotalAmount(bookingData);
        try {
            if (!bookingData || !bookingData.fromTimestamp || !bookingData.toTimestamp) {
                throw new Error('Missing required booking information');
            }

            if (!bookingData.bidId || !bookingData.user || !bookingData.car) {
                throw new Error('Invalid bid information');
            }

            service.checkCarAvailability(
                bookingData.car.carId,
                bookingData.fromTimestamp,
                bookingData.toTimestamp
            ).then(function (isAvailable) {
                if (!isAvailable) {
                    throw new Error('Car is not available for selected dates');
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
                    carId: bookingData.car.carId,
                    fromTimestamp: new Date(bookingData.fromTimestamp),
                    toTimestamp: new Date(bookingData.toTimestamp)
                };

                return $q.all([
                    dbService.addItem('bookings', booking),
                    dbService.addItem('carAvailibility', carAvailability)
                ]).then(function () {
                    errorService.logSuccess('Booking created successfully!');
                    deferred.resolve(booking);
                })
            }).catch(function (error) {
                errorService.handleError('Booking Service :: Error creating booking: ' + error.message);
                deferred.reject(error);
            });
        } catch (error) {
            errorService.handleError('Error creating booking: ' + error.message);
            deferred.reject(error);
        }

        return deferred.promise;
    };

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