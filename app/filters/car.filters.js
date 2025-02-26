mainApp.filter('carFilter', function () {
    return function (cars, filters) {
        if (!cars || !filters) return cars;

        return cars.filter(car => {
            // Location filter
            const locationMatch = !filters.location ||
                filters.location.toLowerCase().split(' ')
                    .some(word => car.city?.toLowerCase().includes(word));

            // Category filter
            const categoryMatch = !filters.carCategory ||
                car.category.categoryName?.toLowerCase() === filters.carCategory.toLowerCase();

            // Price filter
            const priceMatch = !filters.priceRange ||
                car.rentalOptions.local.pricePerHour <= filters.priceRange ||
                car.rentalOptions.outstation.pricePerDay <= filters.priceRange;

            // Car type filter
            const carTypeMatch = !filters.carType ||
                car.carType?.toLowerCase() === filters.carType.toLowerCase();

            // Availability filter
            const availabilityMatch = !filters.availability ||
                (filters.availability.toLowerCase() === "local" && car.isAvailableForLocal) ||
                (filters.availability.toLowerCase() === "outstation" && car.isAvailableForOutstation);

            // Features filter
            const featuresMatch = !filters.features?.length ||
                filters.features.every(f =>
                    car.featured?.map(ft => ft.toLowerCase()).includes(f.toLowerCase())
                );

            // Rating filter
            const ratingMatch = !filters.rating || car.avgRating >= filters.rating;

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

    .filter('starRating', function () {
        return function (rating) {
            if (!rating) return '';

            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5 ? 1 : 0;
            const emptyStars = 5 - fullStars - halfStar;

            return "★".repeat(fullStars) +
                "⯨".repeat(halfStar) +
                "☆".repeat(emptyStars);
        };
    })

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