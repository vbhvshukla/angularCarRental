/** @file Car Filter */

mainApp.filter('carFilter', function () {
        /**
         * @function : carFilter
         * @description : This function is used to filter the cars 
         * based on the input in the search bar.
         * @param {cars,filters}
         */

        return function (cars, filters) {

            if (!cars || !filters) return cars;

            return cars.filter(car => {

                //Match Location
                const locationMatch = !filters.location ||
                    filters.location.toLowerCase().split(' ')
                        .some(word => car.city?.toLowerCase().includes(word));

                //Category match
                const categoryMatch = !filters.carCategory ||
                    car.category.categoryName?.toLowerCase() === filters.carCategory.toLowerCase();

                //Price match
                const priceMatch = !filters.priceRange ||
                    car.rentalOptions.local.pricePerHour <= filters.priceRange ||
                    car.rentalOptions.outstation.pricePerDay <= filters.priceRange;

                //Car Type Match
                const carTypeMatch = !filters.carType ||
                    car.carType?.toLowerCase() === filters.carType.toLowerCase();

                //Availibility match(Local/Outstation)
                const availabilityMatch = !filters.availability ||
                    (filters.availability.toLowerCase() === "local" && car.isAvailableForLocal) ||
                    (filters.availability.toLowerCase() === "outstation" && car.isAvailableForOutstation);

                //Feature match
                const featuresMatch = !filters.features?.length ||
                    filters.features.every(f =>
                        car.featured?.map(ft => ft.toLowerCase()).includes(f.toLowerCase())
                    );

                //Rating match
                const ratingMatch = !filters.rating || car.avgRating >= filters.rating;

                //Return everything
                return locationMatch &&
                    categoryMatch &&
                    priceMatch &&
                    carTypeMatch &&
                    availabilityMatch &&
                    featuresMatch &&
                    ratingMatch;
            });
        };
    })

    /**
     * Star Rating filter
     * @description basically returns the numeric rating into stars rating.
     */

    .filter('starRating', function () {
        return function (rating) {
            // Return 5 empty stars if rating is 0 or undefined
            if (!rating || rating === 0) {
                return "☆☆☆☆☆";
            }

            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5 ? 1 : 0;
            const emptyStars = 5 - fullStars - halfStar;

            return "★".repeat(fullStars) +
                "⯨".repeat(halfStar) +
                "☆".repeat(emptyStars);
        };
    })

    /**
     * Availibility Filter
     * @description : Returns the cars which are available to be booked.
     */

    .filter('availability', function () {
        return function (cars) {
            if (!cars) return [];
            const today = new Date();
            return cars.filter(car => {
                const isBooked = car.availabilities?.some(entry => {
                    const fromDate = new Date(entry.fromTimeStamp);
                    const toDate = new Date(entry.toTimeStamp);
                    return today >= fromDate && today <= toDate;
                });

                return !isBooked && !car.isDeleted;
            });
        };
    })