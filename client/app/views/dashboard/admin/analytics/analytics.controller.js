/** @file Admin Analytics Controller */

mainApp.controller('AdminAnalyticsController', [
    '$scope', 'analyticsService',
    /**
     * Admin Analytics controller
     *
     * @param {*} $scope 
     * @param {*} analyticsService 
     */
    function ($scope, analyticsService) {

        /**
         * Variable declarations
         */
        var vm = this;
        vm.selectedTimeRange = "30";
        vm.loading = false;
        vm.chartInstances = {};
        vm.cards = [];
        vm.charts = {};
        vm.topOwners = [];

        /**
         * Initialization function
         * @function vm.loadAnalyticsData
         * @description Loads all the data related to admin
         * @requires analyticsService
         */

        vm.loadAnalyticsData = function () {
            vm.loading = true;
            analyticsService.getAdminAnalytics(vm.selectedTimeRange)
                .then(data => {
                    // Map totals to cards
                    vm.cards = [
                        { title: "Total Users", value: data.cards.totalUsers },
                        { title: "Total Bookings", value: data.cards.totalBookings },
                        { title: "Total Bids", value: data.cards.totalBids },
                        { title: "Total Cars", value: data.cards.totalCars }
                    ];

                    // Map top-performing owners
                    vm.topOwners = data.charts.topOwners.map(owner => ({
                        ownerId: owner._id,
                        totalRevenue: owner.totalRevenue,
                        totalBookings: owner.totalBookings
                    }));

                    // Render charts
                    renderCharts(data.charts);
                })
                .catch(error => {
                    console.error("Error loading admin analytics:", error);
                })
                .finally(() => {
                    vm.loading = false;
                });
        };


        /**
         * Chart rendering function
         * @param {*} charts 
         */

        function renderCharts(charts) {
            console.log(charts);
            // Destroy existing charts
            Object.keys(vm.chartInstances).forEach(chartKey => {
                if (vm.chartInstances[chartKey]) {
                    vm.chartInstances[chartKey].destroy();
                    delete vm.chartInstances[chartKey];
                }
            });

            // Cars Per Category Chart
            if (charts.carsPerCategory) {
                const categories = charts.carsPerCategory.map(item => item._id.categoryName); // Extract category names
                const carCounts = charts.carsPerCategory.map(item => item.totalCars); // Extract total cars

                // Ensure the canvas element is not reused without destroying the previous chart
                const canvas = document.getElementById('carsPerCategoryChart');
                // if (canvas && Chart.getChart(canvas)) {
                //     Chart.getChart(canvas).destroy(); // Destroy the existing chart instance
                // }

                vm.chartInstances.carsPerCategoryChart = new Chart(
                    canvas,
                    {
                        type: 'pie', // Pie chart
                        data: {
                            labels: categories, // Category names as labels
                            datasets: [{
                                data: carCounts, // Total cars as data
                                backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#8e44ad'] // Colors for each category
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.label || '';
                                            const value = context.raw;
                                            return `${label}: ${value} cars`;
                                        }
                                    }
                                }
                            }
                        }
                    }
                );
            }

            // Top Performing Owners Chart (Polar Area Chart)
            if (charts.topOwners) {
                const ownerLabels = charts.topOwners.map(owner => `Owner ${owner._id}`);
                const ownerRevenues = charts.topOwners.map(owner => owner.totalRevenue);

                vm.chartInstances.topOwnersChart = new Chart(
                    document.getElementById('topOwnersChart'),
                    {
                        type: 'polarArea',
                        data: {
                            labels: ownerLabels,
                            datasets: [{
                                label: 'Total Revenue',
                                data: ownerRevenues,
                                backgroundColor: [
                                    '#3498db',
                                    '#e74c3c',
                                    '#2ecc71',
                                    '#f1c40f',
                                    '#8e44ad'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.label || '';
                                            const value = context.raw;
                                            return `${label}: ₹${value.toLocaleString()}`;
                                        }
                                    }
                                }
                            }
                        }
                    }
                );
            }

            

            // Revenue by City Chart
            if (charts.revenueByCity) {
                const cityLabels = [...new Set(charts.revenueByCity.map(item => item._id.city))];
                const cityData = cityLabels.map(city =>
                    charts.revenueByCity
                        .filter(item => item._id.city === city)
                        .reduce((sum, item) => sum + item.totalRevenue, 0)
                );

                vm.chartInstances.totalRevenuePerCityChart = new Chart(
                    document.getElementById('totalRevenuePerCityChart'),
                    {
                        type: 'bar',
                        data: {
                            labels: cityLabels,
                            datasets: [{
                                label: 'Revenue',
                                data: cityData,
                                backgroundColor: '#3498db'
                            }]
                        },
                        options: getChartOptions('revenue')
                    }
                );
            }

            // Revenue by Rental Type Chart
            if (charts.revenueByRentalType) {
                console.log(charts.revenueByRentalType);
                const dates = [...new Set(charts.revenueByRentalType.map(item => item._id.date))];
                const localRevenue = dates.map(date =>
                    charts.revenueByRentalType
                        .filter(item => item._id.date === date && item._id.rentalType === 'local')
                        .reduce((sum, item) => sum + item.totalRevenue, 0)
                );
                const outstationRevenue = dates.map(date =>
                    charts.revenueByRentalType
                        .filter(item => item._id.date === date && item._id.rentalType === 'outstation')
                        .reduce((sum, item) => sum + item.totalRevenue, 0)
                );


                vm.chartInstances.revenueTrendsChart = new Chart(
                    document.getElementById('revenueTrendsChart'),
                    {
                        type: 'line',
                        data: {
                            labels: dates,
                            datasets: [
                                {
                                    label: 'Local Revenue',
                                    data: localRevenue,
                                    borderColor: '#3498db',
                                    fill: false
                                },
                                {
                                    label: 'Outstation Revenue',
                                    data: outstationRevenue,
                                    borderColor: '#e74c3c',
                                    fill: false
                                }
                            ]
                        },
                        options: getChartOptions('revenue')
                    }
                );
            }

            // Booking Trends Chart
            if (charts.bookingTrends) {
                const dates = charts.bookingTrends.map(item => item._id);
                const bookings = charts.bookingTrends.map(item => item.totalBookings);

                vm.chartInstances.bookingsOverTimeChart = new Chart(
                    document.getElementById('bookingsOverTimeChart'),
                    {
                        type: 'line',
                        data: {
                            labels: dates,
                            datasets: [{
                                label: 'Bookings',
                                data: bookings,
                                borderColor: '#2ecc71',
                                fill: false
                            }]
                        },
                        options: getChartOptions('bookings')
                    }
                );
            }

        }

        /**
         * Custom Chart Options for configuration
         * @param {*} chartType 
         * @returns 
         */

        function getChartOptions(chartType) {
            return {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                if (chartType.includes('revenue')) {
                                    return `${label}: ₹${value.toLocaleString()}`;
                                }
                                return `${label}: ${value}`;
                            }
                        }
                    }
                },
                
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 10 
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            maxTicksLimit: 10,
                            callback: value => {
                                if (chartType.includes('revenue')) {
                                    return `₹${value.toLocaleString()}`;
                                }
                                return Number.isInteger(value) ? value : Math.round(value); // Ensure whole numbers for bookings
                            }
                        }
                    }
                }
            };
        }

        /**
         * Destroy the chart on Destroy event.
         */

        $scope.$on('$destroy', function () {
            Object.values(vm.chartInstances).forEach(chart => chart.destroy());
        });
    }
]);