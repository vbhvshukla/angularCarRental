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

                vm.chartInstances.carsPerCategoryChart = new Chart(
                    canvas,
                    {
                        type: 'pie', // Pie chart
                        data: {
                            labels: categories, // Category names as labels
                            datasets: [{
                                data: carCounts, // Total cars as data
                                backgroundColor: [
                                    'rgba(52, 152, 219, 0.5)', // Transparentized blue
                                    'rgba(231, 76, 60, 0.5)',  // Transparentized red
                                    'rgba(46, 204, 113, 0.5)', // Transparentized green
                                    'rgba(241, 196, 15, 0.5)', // Transparentized yellow
                                    'rgba(142, 68, 173, 0.5)'  // Transparentized purple
                                ],
                                borderColor: [
                                    '#3498db', // Blue
                                    '#e74c3c', // Red
                                    '#2ecc71', // Green
                                    '#f1c40f', // Yellow
                                    '#8e44ad'  // Purple
                                ],
                                borderWidth: 1
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
                                    'rgba(52, 152, 219, 0.5)', // Transparentized blue
                                    'rgba(231, 76, 60, 0.5)',  // Transparentized red
                                    'rgba(46, 204, 113, 0.5)', // Transparentized green
                                    'rgba(241, 196, 15, 0.5)', // Transparentized yellow
                                    'rgba(142, 68, 173, 0.5)'  // Transparentized purple
                                ],
                                borderColor: [
                                    '#3498db', // Blue
                                    '#e74c3c', // Red
                                    '#2ecc71', // Green
                                    '#f1c40f', // Yellow
                                    '#8e44ad'  // Purple
                                ],
                                borderWidth: 1
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
                                backgroundColor: 'rgba(52, 152, 219, 0.5)', // Transparentized blue
                                borderColor: '#3498db',
                                borderWidth: 1
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
                                    backgroundColor: 'rgba(52, 152, 219, 0.5)', // Transparentized blue
                                    fill: true
                                },
                                {
                                    label: 'Outstation Revenue',
                                    data: outstationRevenue,
                                    borderColor: '#e74c3c',
                                    backgroundColor: 'rgba(231, 76, 60, 0.5)', // Transparentized red
                                    fill: true
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
                                backgroundColor: 'rgba(46, 204, 113, 0.5)', // Transparentized green
                                fill: true
                            }]
                        },
                        options: getChartOptions('bookings')
                    }
                );
            }

            // Customer Retention Chart
            if (charts.customerRetention) {
                const retentionData = charts.customerRetention; // Extract the retention data
                const retentionLabels = ['Retention Rate', 'Churn Rate'];
                const retentionValues = [
                    retentionData[0].retentionRate, // Retention rate
                    100 - retentionData[0].retentionRate // Churn rate (100% - retention rate)
                ];
                // Doughnut Chart for Retention Rate
                vm.chartInstances.customerRetentionChart = new Chart(
                    document.getElementById('customerRetentionChart'),
                    {
                        type: 'doughnut',
                        data: {
                            labels: retentionLabels,
                            datasets: [{
                                data: retentionValues,
                                backgroundColor: [
                                    'rgba(46, 204, 113, 0.5)', // Green for retention rate
                                    'rgba(231, 76, 60, 0.5)'  // Red for churn rate
                                ],
                                borderColor: [
                                    '#2ecc71', // Green
                                    '#e74c3c'  // Red
                                ],
                                borderWidth: 1
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
                                            return `${label}: ${value}%`;
                                        }
                                    }
                                }
                            }
                        }
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