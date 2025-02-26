mainApp.service('bidService', ['$q', 'dbService', 'carService', 'errorService',
    function ($q, dbService, carService, errorService) {

        //Bid Estimate Calculation (Params Required -> CarId and BidData object)
        this.calculateEstimate = function (carId, bidData) {
            return carService.getCarById(carId)
                .then(car => {
                    const rentalType = bidData.rentalType;
                    const startDate = new Date(bidData.startDate);
                    const endDate = new Date(bidData.endDate);
                    //Calculate the time difference
                    const timeDiff = endDate - startDate;
                    //Initialize the basePrice,minimum Bid and maximum bid to 0.
                    let basePrice = 0;
                    let minBid = 0;
                    let maxBid = 0;

                    //Estimate Calculation

                    //Estimate Calculation :: Rental Type - Local 
                    if (rentalType === 'local') {

                        if (!car.isAvailableForLocal) {
                            return errorService.handleError('Bid Service :: Car Unavailable For Local Rental');
                        }
                        //Calculate the number of ours the car is booked.
                        const hours = Math.ceil(timeDiff / (1000 * 60 * 60));

                        //Get the localOptions from the car's object.
                        const localOptions = car.rentalOptions.local;

                        // Calculate base price using hourly rate
                        basePrice = localOptions.pricePerHour * hours;
                        // Min bid cannot be less than base price for local rentals
                        minBid = basePrice;
                        // Max bid can be 50% more than base price
                        maxBid = basePrice * 1.5;
                    }
                    //Estimate Calculation :: Rental Type -  Outstation
                    else {

                        if (!car.isAvailableForOutstation) {
                            return errorService.handleError('Bid Service :: Car Unavailable For Outstation Rental');
                        }

                        //Calculate the number of days the car is booked.

                        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                        //Get the outstation options

                        const outstationOptions = car.rentalOptions.outstation;

                        // Calculate base price using daily rate and minimum km charge.
                        // The max of either of the two would be the base price.

                        basePrice = Math.max(
                            outstationOptions.pricePerDay * days,
                            outstationOptions.minimumKmChargeable * outstationOptions.pricePerKm
                        );

                        // Min bid cannot be less than base price for outstation rentals
                        minBid = basePrice;
                        // Max bid can be 60% more than base price for outstation
                        maxBid = basePrice * 1.6;
                    }

                    return {
                        basePrice: basePrice,
                        minBid: minBid,
                        maxBid: maxBid,
                        duration: rentalType === 'local' ? 'hours' : 'days',
                        rentalLimits: rentalType === 'local' ? {
                            maxKmPerHour: car.rentalOptions.local.maxKmPerHour,
                            extraHourRate: car.rentalOptions.local.extraHourRate,
                            extraKmRate: car.rentalOptions.local.extraKmRate
                        } : {
                            maxKmPerDay: car.rentalOptions.outstation.maxKmLimitPerDay,
                            minimumKm: car.rentalOptions.outstation.minimumKmChargeable,
                            extraDayRate: car.rentalOptions.outstation.extraDayRate,
                            extraHourlyRate: car.rentalOptions.outstation.extraHourlyRate,
                            extraKmRate: car.rentalOptions.outstation.extraKmRate
                        }
                    };
                })
                .catch(error => errorService.handleError('BidService :: Estimate Failed', error));
        };

        //Submit Bid (Params Required -> CarId, BidData Object and UserData Object || Returns bid object)
        this.submitBid = function (carId, bidData, userData) {
            return carService.getCarById(carId)
                .then(car => {
                    const bid = {
                        bidId: Date.now().toString(),
                        fromTimestamp: bidData.startDate,
                        toTimestamp: bidData.endDate,
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        bidAmount: bidData.bidAmount,
                        rentalType: bidData.rentalType,
                        bidBaseFare: bidData.basePrice,
                        user: {
                            userId: userData.userId,
                            username: userData.username,
                            email: userData.email,
                            role: userData.role,
                            paymentPreference: userData.paymentPreference,
                            avgRating: userData.avgRating,
                            ratingCount: userData.ratingCount
                        },
                        car: {
                            carId: car.carId,
                            carName: car.carName,
                            carType: car.carType,
                            city: car.city,
                            createdAt: car.createdAt,
                            description: car.description,
                            isAvailableForLocal: car.isAvailableForLocal,
                            isAvailableForOutstation: car.isAvailableForOutstation,
                            avgRating: car.avgRating,
                            ratingCount: car.ratingCount,
                            images: car.images,
                            featured: car.featured,
                            category: car.category,
                            owner: car.owner,
                            rentalOptions: car.rentalOptions
                        }
                    };
                    return dbService.addItem('bids', bid);
                })
                .catch(error => errorService.handleError(error, 'BidService :: Submit Failed'));
        };

        //Check if a car is available for the selected date (Params Required -> CarId,StartDate,EndDate ||  Returns a boolean)
        this.checkDateAvailability = function (carId, startDate, endDate) {
            return dbService.getAllItemsByIndex('bids', 'carId', carId)
                .then(bids => {
                    const overlapping = bids.some(bid => {
                        if (bid.status === 'rejected') return false;
                        const bidStart = new Date(bid.startDate);
                        const bidEnd = new Date(bid.endDate);
                        return (startDate <= bidEnd && endDate >= bidStart);
                    });
                    return !overlapping;
                })
                .catch(error => errorService.handleError(error, 'BidService :: Availability Check Failed'));
        };

        //Get all bids of a user (Params Required -> UserId || Returns an array of objects)
        this.getBidsByUser = function (userId) {
            return dbService.getAllItemsByIndex('bids', 'userId', userId)
                .catch(error => errorService.handleError(error, 'BidService :: User Bids Fetch Failed'));
        };

        //Get all bids placed for a car (Params Required -> UserId || Returns an array of objects)
        this.getBidsByCar = function (carId) {
            return dbService.getAllItemsByIndex('bids', 'carId', carId)
                .catch(error => errorService.handleError(error, 'BidService :: Car Bids Fetch Failed'));
        };

        this.updateBidStatus = function (bidId, status) {
            return dbService.getItemById('bids', bidId)
                .then(bid => {
                    bid.status = status;
                    return dbService.updateItem('bids', bid);
                })
                .catch(error => errorService.handleError(error, 'BidService :: Status Update Failed'));
        };
    }
]);