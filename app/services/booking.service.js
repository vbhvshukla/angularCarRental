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
    SubmitRating
    */

    service.calculateBaseFare = function (bookingData) {
        const rentalType = bookingData.bid.rentalType;
        const car = bookingData.bid.car;
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
        var deferred = $q.defer();

        try {
            // Validate required fields and structure
            if (!bookingData.bid || !bookingData.fromTimestamp || !bookingData.toTimestamp) {
                throw new Error('Missing required booking information');
            }

            if (!bookingData.bid.bidId || !bookingData.bid.user || !bookingData.bid.car) {
                throw new Error('Invalid bid information');
            }

            service.checkCarAvailability(
                bookingData.bid.car.carId,
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
                    rentalType: bookingData.bid.rentalType,
                    bid: {
                        bidId: bookingData.bid.bidId,
                        fromTimestamp: bookingData.bid.fromTimestamp,
                        toTimestamp: bookingData.bid.toTimestamp,
                        status: bookingData.bid.status,
                        createdAt: bookingData.bid.createdAt,
                        bidAmount: bookingData.bid.bidAmount,
                        rentalType: bookingData.bid.rentalType,
                        bidBaseFare: bookingData.bid.bidBaseFare,
                        user: bookingData.bid.user,
                        car: bookingData.bid.car
                    },
                    baseFare: service.calculateBaseFare(bookingData),
                    extraKmCharges: 0,
                    extraHourCharges: 0,
                    totalFare: service.calculateTotalAmount(bookingData)
                };

                const carAvailability = {
                    carId: bookingData.bid.car.carId,
                    fromTimestamp: new Date(bookingData.fromTimestamp),
                    toTimestamp: new Date(bookingData.toTimestamp)
                };

                //Changed Promise.all to $q.all
                return $q.all([
                    dbService.saveItem('bookings', booking),
                    dbService.saveItem('carAvailability', carAvailability)
                ]).then(function () {
                    errorService.success('Booking created successfully!');
                    deferred.resolve(booking);
                });
            })
                .catch(function (error) {
                    errorService.handleError('Error creating booking: ' + error.message);
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
                errorService.success('Booking status updated successfully!');
                deferred.resolve();
            })
            .catch(function (error) {
                errorService.handleError('Error updating booking status');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    service.checkCarAvailability = function (carId, fromTimestamp, toTimestamp) {
        var deferred = $q.defer();

        dbService.getItems('carAvailability')
            .then(function (availabilities) {
                const carAvailabilities = availabilities.filter(
                    availability => availability.carId === carId
                );

                const isOverlapping = carAvailabilities.some(function (availability) {
                    const existingFrom = new Date(availability.fromTimestamp);
                    const existingTo = new Date(availability.toTimestamp);
                    const newFrom = new Date(fromTimestamp);
                    const newTo = new Date(toTimestamp);

                    return (
                        (newFrom >= existingFrom && newFrom <= existingTo) || // New start date falls within existing booking
                        (newTo >= existingFrom && newTo <= existingTo) || // New end date falls within existing booking
                        (newFrom <= existingFrom && newTo >= existingTo) // New booking completely encompasses existing booking
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
                ]);
            })
            .then(function () {
                errorService.success('Booking cancelled successfully!');
                deferred.resolve();
            })
            .catch(function (error) {
                errorService.error('Error cancelling booking', 'error');
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
                errorService.success('Rating submitted successfully!');
                deferred.resolve();
            })
            .catch(function (error) {
                errorService.error('Error submitting rating', 'error');
                deferred.reject(error);
            });

        return deferred.promise;
    };

    return service;
}]);