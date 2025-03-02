mainApp.service('carService', ['dbService','schemaValidator','$q','idGenerator',function (dbService, schemaValidator, $q, idGenerator) {
    const STORE_NAME = 'cars';

    const carSchema = {
        carId: { type: 'string', required: true, minLength: 2 },
        carName: { type: 'string', required: true, minLength: 2, maxLength: 100 },
        carType: { type: 'string', required: true, minLength: 2, maxLength: 50 },
        city: { type: 'string', required: true, minLength: 2, maxLength: 100 },
        createdAt: { type: 'string', required: true },
        description: { type: 'string', required: false, maxLength: 1000 },
        isAvailableForLocal: { type: 'boolean', required: true, default: false },
        isAvailableForOutstation: { type: 'boolean', required: true, default: false },
        avgRating: { type: 'number', required: true, default: 0, min: 0, max: 5 },
        ratingCount: { type: 'number', required: true, default: 0, min: 0 },
        images: {
            type: 'array',
            required: true,
            minItems: 1,
            maxItems: 10,
            itemType: 'string'
        },
        featured: {
            type: 'array',
            required: false,
            maxItems: 5,
            itemType: 'string'
        },
        category: {
            type: 'object',
            required: true,
            properties: {
                categoryId: { type: 'string', required: true },
                categoryName: { type: 'string', required: true, minLength: 2, maxLength: 50 }
            }
        },
        owner: {
            type: 'object',
            required: true,
            properties: {
                userId: { type: 'string', required: true },
                username: { type: 'string', required: true, minLength: 2, maxLength: 50 },
                email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                role: { type: 'string', required: true, enum: ['owner', 'admin', 'user'] },
                isApproved: { type: 'boolean', required: true, default: false },
                avgRating: { type: 'number', required: true, default: 0, min: 0, max: 5 },
                ratingCount: { type: 'number', required: true, default: 0, min: 0 },
                paymentPreference: { type: 'string', required: true, enum: ['cash', 'online', 'both'] }
            }
        },
        rentalOptions: {
            type: 'object',
            required: true,
            validate: function (value, data) {
                if (!data.isAvailableForLocal && !data.isAvailableForOutstation) {
                    return ['At least one rental option (local/outstation) must be available'];
                }

                if (data.isAvailableForLocal && (!value.local || typeof value.local !== 'object')) {
                    return ['Local rental options are required when isAvailableForLocal is true'];
                }

                if (data.isAvailableForOutstation && (!value.outstation || typeof value.outstation !== 'object')) {
                    return ['Outstation rental options are required when isAvailableForOutstation is true'];
                }

                return null;
            },
            properties: {
                local: {
                    type: 'object',
                    required: false, // Will be validated through parent's validate function
                    properties: {
                        pricePerHour: { type: 'number', required: true, min: 0 },
                        maxKmPerHour: { type: 'number', required: true, min: 1 },
                        extraHourRate: { type: 'number', required: true, min: 0 },
                        extraKmRate: { type: 'number', required: true, min: 0 }
                    },
                    validate: function (value, data) {
                        if (!data.isAvailableForLocal) return null;
                        if (!value) return ['Local rental options are required'];
                        return null;
                    }
                },
                outstation: {
                    type: 'object',
                    required: false,
                    properties: {
                        pricePerDay: { type: 'number', required: true, min: 0 },
                        pricePerKm: { type: 'number', required: true, min: 0 },
                        minimumKmChargeable: { type: 'number', required: true, min: 0 },
                        maxKmLimitPerDay: { type: 'number', required: true, min: 0 },
                        extraDayRate: { type: 'number', required: true, min: 0 },
                        extraHourlyRate: { type: 'number', required: true, min: 0 },
                        extraKmRate: { type: 'number', required: true, min: 0 }
                    },
                    validate: function (value, data) {
                        if (!data.isAvailableForOutstation) return null;
                        if (!value) return ['Outstation rental options are required'];
                        return null;
                    }
                }
            }
        },
        isDeleted: { type: 'boolean', required: true, default: false }
    };

    this.getAllCars = function () {
        return dbService.getAllItems(STORE_NAME);
    };

    this.getCarById = function (carId) {
        return dbService.getItemByKey(STORE_NAME, carId);
    };

    this.getCarsByOwner = function (ownerId) {
        return dbService.getAllItemsByIndex(STORE_NAME, 'ownerId', ownerId);
    };

    this.getCarsByCategory = function (categoryId) {
        return dbService.getAllItemsByIndex(STORE_NAME, 'categoryId', categoryId);
    };

    this.getCarsByCity = function (city) {
        return dbService.getAllItemsByIndex(STORE_NAME, 'city', city);
    };

    this.createCar = function (car) {
        if (!car.carId) {
            car.carId = idGenerator.generate();
        }
        car.createdAt = new Date().toISOString();

        return schemaValidator.validate(car, carSchema)
            .then(function (validatedCar) {
                return dbService.addItem(STORE_NAME, validatedCar);
            }).catch(err=>console.log("Car Service :: Failed to Add Car"));
    };

    this.updateCar = function (car) {
        return schemaValidator.validate(car, carSchema)
            .then(function (validatedCar) {
                return dbService.updateCarInAllStores(validatedCar);
            });
    };

    this.deleteCar = function (carId) {
        return this.getCarById(carId)
            .then(car => {
                car.isDeleted = true;
                return this.updateCar(car);
            });
    };

    this.getAvailableCars = function () {
        const today = new Date();

        return $q.all([
            dbService.getAllItems('carAvailibility'),
            dbService.getItemsWithPagination(STORE_NAME)
        ]).then(function (responses) {
            const [carAvailability, allCars] = responses;

            return allCars.filter(car => {
                const carAvailabilityEntries = carAvailability.filter(entry =>
                    entry.carId === car.carId
                );

                const isBooked = carAvailabilityEntries.some(entry => {
                    const fromDate = new Date(entry.fromTimestamp);
                    const toDate = new Date(entry.toTimestamp);
                    return today >= fromDate && today <= toDate;
                });

                return !isBooked && !car.isDeleted;
            });
        });
    };

    this.searchCars = function (criteria) {
        return this.getAllCars()
            .then(cars => {
                return cars.filter(car => {
                    let matches = !car.isDeleted;

                    if (criteria.city && matches) {
                        matches = car.city.toLowerCase() === criteria.city.toLowerCase();
                    }

                    if (criteria.categoryId && matches) {
                        matches = car.category.categoryId === criteria.categoryId;
                    }

                    if (criteria.maxPrice && matches) {
                        matches = car.price <= criteria.maxPrice;
                    }

                    if (criteria.minPrice && matches) {
                        matches = car.price >= criteria.minPrice;
                    }

                    return matches;
                });
            });
    };
}]);