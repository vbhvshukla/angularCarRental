mainApp.service('analyticsService', [
    '$q', 'dbService',
    function ($q, dbService) {
        this.getOwnerAnalytics = function (ownerId, days = 30) {
            return $q.all([
                dbService.getItemsByTimeRange('bookings', 'ownerId', ownerId, days),
                dbService.getItemsByTimeRange('bids', 'ownerId', ownerId, days),
                dbService.getAllItemsByIndex('cars', 'ownerId', ownerId)
            ]).then(([bookings, bids, cars]) => {
                return {
                    totals: getTotals(bookings, bids, cars),
                    charts: {
                        revenue: getRevenueData(bookings),
                        bookings: getBookingsData(bookings),
                        bids: getBidsData(bids),
                        cars: getCarsData(cars),
                        carUtilization: getCarUtilizationData(bookings, cars),
                        activeRenters: getMostActiveRenters(bookings),
                        avgRevenueByType: getAvgRevenueOverTime(bookings),
                        rentalDuration: getRentalDuration(bookings),
                        revenueOverTime: getRevenueOverTime(bookings),
                        avgRevenueOverTime: getAvgRevenueOverTime(bookings),
                        avgBidAmount: getAvgBidAmountPerCar(bids, cars)
                    }
                };
            });
        };

        function getTotals(bookings, bids, cars) {
            return {
                totalCars: cars.length,
                totalBookings: bookings.length,
                totalBids: bids.length,
                totalRevenue: bookings.reduce((sum, b) => sum + b.totalFare, 0)
            };
        }

        function getRevenueData(bookings) {
            const monthlyRevenue = {};
            bookings.forEach(booking => {
                const month = new Date(booking.createdAt).toLocaleString('default', { month: 'short' });
                monthlyRevenue[month] = (monthlyRevenue[month] || 0) + booking.totalFare;
            });


            return {
                labels: Object.keys(monthlyRevenue),
                datasets: [{
                    label: 'Monthly Revenue (₹)',
                    data: Object.values(monthlyRevenue),
                    borderColor: '#3498db',
                    fill: false
                }]
            };
        }

        function getBookingsData(bookings) {
            // Group bookings by car
            const bookingsBycar = {};
            bookings.forEach(booking => {
                const carName = booking.bid.car.carName;
                bookingsBycar[carName] = (bookingsBycar[carName] || 0) + 1;
            });

            return {
                labels: Object.keys(bookingsBycar),
                datasets: [{
                    label: 'Bookings per Car',
                    data: Object.values(bookingsBycar),
                    backgroundColor: '#2ecc71'
                }]
            };
        }

        function getBidsData(bids) {
            const bidStatus = { accepted: 0, pending: 0, rejected: 0 };
            bids.forEach(bid => {
                bidStatus[bid.status] = (bidStatus[bid.status] || 0) + 1;
            });

            return {
                labels: Object.keys(bidStatus),
                datasets: [{
                    label: 'Bid Status',
                    data: Object.values(bidStatus),
                    backgroundColor: ['#27ae60', '#f1c40f', '#e74c3c']
                }]
            };
        }

        function getCarsData(cars) {
            const carCategories = {};
            cars.forEach(car => {
                const category = car.category.categoryName;
                carCategories[category] = (carCategories[category] || 0) + 1;
            });

            return {
                labels: Object.keys(carCategories),
                datasets: [{
                    label: 'Cars by Category',
                    data: Object.values(carCategories),
                    backgroundColor: '#9b59b6'
                }]
            };
        }

        function getCarUtilizationData(bookings, cars) {
            const utilization = {};
            cars.forEach(car => {
                utilization[car.carName] = {
                    totalDays: getDaysSinceCreation(car.createdAt),
                    bookedDays: 0
                };
            });

            bookings.forEach(booking => {
                const carName = booking.bid.car.carName;
                const duration = getDurationInDays(booking.fromTimestamp, booking.toTimestamp);
                if (utilization[carName]) {
                    utilization[carName].bookedDays += duration;
                }
            });

            const labels = Object.keys(utilization);
            const data = labels.map(carName => {
                const { totalDays, bookedDays } = utilization[carName];
                return (bookedDays / totalDays) * 100;
            });

            return {
                labels: labels,
                datasets: [{
                    label: 'Car Utilization (%)',
                    data: data,
                    backgroundColor: '#2c3e50'
                }]
            };
        }

        function getDaysSinceCreation(createdAt) {
            const created = new Date(createdAt);
            const now = new Date();
            return Math.ceil((now - created) / (1000 * 60 * 60 * 24));
        }

        function getDurationInDays(from, to) {
            return Math.ceil(
                (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)
            );
        }

        function getMostActiveRenters(bookings) {
            const renters = {};
            bookings.forEach(booking => {
                const username = booking.bid.user.username;
                renters[username] = (renters[username] || 0) + 1;
            });

            const sortedRenters = Object.entries(renters).sort(([, a], [, b]) => b - a).slice(0, 5);

            return {
                labels: sortedRenters.map(([name]) => name),
                datasets: [{
                    label: 'Number of Bookings',
                    data: sortedRenters.map(([, count]) => count),
                    backgroundColor: '#f1c40f'
                }]
            };
        }

        function getRentalDuration(bookings) {
            const duration = {
                local: { total: 0, count: 0 },
                outstation: { total: 0, count: 0 }
            };

            bookings.forEach(booking => {
                const type = booking.rentalType;
                const days = getDurationInDays(booking.fromTimestamp, booking.toTimestamp);
                duration[type].total += days;
                duration[type].count++;
            });

            const avgLocal = duration.local.count ? duration.local.total / duration.local.count : 0;
            const avgOutstation = duration.outstation.count ? duration.outstation.total / duration.outstation.count : 0;

            return {
                labels: ['Local', 'Outstation'],
                datasets: [{
                    label: 'Average Rental Duration (Days)',
                    data: [avgLocal, avgOutstation],
                    backgroundColor: ['#8e44ad', '#2c3e50']
                }]
            };
        }

        function getRevenueOverTime(bookings, period = 'monthly') {
            console.log('Processing bookings for revenue:', bookings);
            
            const revenue = {};
            
            bookings.forEach(booking => {
                if (!booking.totalFare) {
                    console.warn('Missing totalFare for booking:', booking);
                    return;
                }
        
                const date = new Date(booking.createdAt);
                let timeKey = getTimeKey(date, period);
                
                if (!revenue[timeKey]) {
                    revenue[timeKey] = { local: 0, outstation: 0 };
                }
                
                const totalFare = parseFloat(booking.totalFare);
                revenue[timeKey][booking.rentalType] += totalFare;
                
                console.log(`Added revenue for ${timeKey}:`, {
                    type: booking.rentalType,
                    amount: totalFare,
                    newTotal: revenue[timeKey][booking.rentalType]
                });
            });
        
            const timeKeys = Object.keys(revenue).sort((a, b) => new Date(a) - new Date(b));
            
            return {
                labels: timeKeys,
                local: timeKeys.map(key => revenue[key].local || 0),
                outstation: timeKeys.map(key => revenue[key].outstation || 0),
                datasets: [
                    {
                        label: 'Local Revenue',
                        data: timeKeys.map(key => revenue[key].local || 0),
                        backgroundColor: '#3498db',
                        stack: 'revenue'
                    },
                    {
                        label: 'Outstation Revenue',
                        data: timeKeys.map(key => revenue[key].outstation || 0),
                        backgroundColor: '#e67e22',
                        stack: 'revenue'
                    }
                ]
            };
        }

        function getAvgRevenueOverTime(bookings, period = 'monthly') {
            const data = {};

            bookings.forEach(booking => {
                const date = new Date(booking.createdAt);
                let timeKey = getTimeKey(date, period);

                if (!data[timeKey]) {
                    data[timeKey] = {
                        local: { total: 0, count: 0 },
                        outstation: { total: 0, count: 0 }
                    };
                }
                data[timeKey][booking.rentalType].total += booking.totalFare;
                data[timeKey][booking.rentalType].count++;
            });

            const timeKeys = Object.keys(data).sort((a, b) => new Date(a) - new Date(b));

            return {
                labels: timeKeys,
                datasets: [
                    {
                        label: 'Avg Local Revenue',
                        data: timeKeys.map(key =>
                            data[key].local.count ?
                                data[key].local.total / data[key].local.count : 0
                        ),
                        borderColor: '#2ecc71',
                        fill: false
                    },
                    {
                        label: 'Avg Outstation Revenue',
                        data: timeKeys.map(key =>
                            data[key].outstation.count ?
                                data[key].outstation.total / data[key].outstation.count : 0
                        ),
                        borderColor: '#e74c3c',
                        fill: false
                    }
                ]
            };
        }

        function getAvgBidAmountPerCar(bids, cars) {
            const bidAmounts = {};
            
            // Initialize all cars with zero bids
            cars.forEach(car => {
                bidAmounts[car.carName] = {
                    total: 0,
                    count: 0
                };
            });

            // Calculate total bids and amounts for each car
            bids.forEach(bid => {
                const carName = bid.car.carName;
                if (bidAmounts[carName]) {
                    bidAmounts[carName].total += bid.bidAmount;
                    bidAmounts[carName].count++;
                }
            });

            // Calculate averages and prepare chart data
            const labels = Object.keys(bidAmounts);
            const data = labels.map(carName => {
                const { total, count } = bidAmounts[carName];
                return count > 0 ? Math.round(total / count) : 0;
            });

            return {
                labels: labels,
                datasets: [{
                    label: 'Average Bid Amount (₹)',
                    data: data,
                    backgroundColor: '#16a085',
                    borderColor: '#16a085',
                    borderWidth: 1
                }]
            };
        }

        function getTimeKey(date, period) {
            switch (period) {
                case 'weekly':
                    const onejan = new Date(date.getFullYear(), 0, 1);
                    const weekNum = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                    return `Week ${weekNum}, ${date.getFullYear()}`;

                case 'monthly':
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });

                case 'yearly':
                    return date.getFullYear().toString();

                default:
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
            }
        }

    }
]);