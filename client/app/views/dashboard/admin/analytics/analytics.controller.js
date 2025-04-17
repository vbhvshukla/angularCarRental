/** @file Admin Analytics Controller */

mainApp.controller('AdminAnalyticsController', [
    '$scope', 'analyticsService', '$uibModal',
    /**
     * Admin Analytics controller
     *
     * @param {*} $scope 
     * @param {*} analyticsService 
     * @param {*} $uibModal 
     */
    function ($scope, analyticsService, $uibModal) {

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
         * Function : Open Predictive Modal
         * @description Opens the predictive analytics modal
         */
        vm.openPredictiveModal = function() {
            $uibModal.open({
                templateUrl: 'app/components/modals/predictiveAnalytics/predictiveAnalyticsModal.html',
                controller: 'PredictiveAnalyticsModalController as vm',
                size: 'lg',
                backdrop: 'static',
                keyboard: false
            });
        };

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
                const categories = charts.carsPerCategory.map(item => item._id.categoryName);
                const carCounts = charts.carsPerCategory.map(item => item.totalCars);

                const canvas = document.getElementById('carsPerCategoryChart');

                vm.chartInstances.carsPerCategoryChart = new Chart(
                    canvas,
                    {
                        type: 'pie',
                        data: {
                            labels: categories,
                            datasets: [{
                                data: carCounts,
                                backgroundColor: [
                                    'rgba(52, 152, 219, 0.5)',
                                    'rgba(231, 76, 60, 0.5)',
                                    'rgba(46, 204, 113, 0.5)',
                                    'rgba(241, 196, 15, 0.5)',
                                    'rgba(142, 68, 173, 0.5)'
                                ],
                                borderColor: [
                                    '#3498db',
                                    '#e74c3c',
                                    '#2ecc71',
                                    '#f1c40f',
                                    '#8e44ad'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            layout: {
                                padding: {
                                    left: 20,
                                    right: 20
                                }
                            },
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        },
                                        padding: 20
                                    }
                                },
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
                                    fill: true,
                                    tension: 0.4
                                },
                                {
                                    label: 'Outstation Revenue',
                                    data: outstationRevenue,
                                    borderColor: '#e74c3c',
                                    backgroundColor: 'rgba(231, 76, 60, 0.5)', // Transparentized red
                                    fill: true,
                                    tension: 0.4
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
                                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                                fill: true,
                                // tension: 0.4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                    labels: {
                                        font: {
                                            family: 'Inter',
                                            size: 12
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        },
                                        stepSize: 1,
                                        precision: 0
                                    },
                                    title: {
                                        display: true,
                                        text: 'Number of Bookings',
                                        font: {
                                            family: 'Inter',
                                            size: 12,
                                            weight: 500
                                        }
                                    }
                                },
                                x: {
                                    ticks: {
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        },
                                        maxRotation: 45,
                                        minRotation: 45
                                    }
                                }
                            }
                        }
                    }
                );
            }

            // Customer Retention Chart
            if (charts.customerRetention) {
                const retentionData = charts.customerRetention;
                const retentionLabels = ['Retention Rate', 'Churn Rate'];
                const retentionValues = [
                    retentionData[0].retentionRate,
                    100 - retentionData[0].retentionRate
                ];

                vm.chartInstances.customerRetentionChart = new Chart(
                    document.getElementById('customerRetentionChart'),
                    {
                        type: 'doughnut',
                        data: {
                            labels: retentionLabels,
                            datasets: [{
                                data: retentionValues,
                                backgroundColor: [
                                    'rgba(46, 204, 113, 0.5)',
                                    'rgba(231, 76, 60, 0.5)'
                                ],
                                borderColor: [
                                    '#2ecc71',
                                    '#e74c3c'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            layout: {
                                padding: {
                                    left: 20,
                                    right: 20
                                }
                            },
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        },
                                        padding: 20
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.label || '';
                                            const value = context.raw;
                                            return `${label}: ${value.toFixed(1)}%`;
                                        }
                                    }
                                }
                            }
                        }
                    }
                );
            }

            // Rental Duration Chart
            if (charts.rentalDuration) {
                vm.chartInstances.rentalDurationChart = new Chart(
                    document.getElementById('rentalDurationChart'),
                    {
                        type: 'bar',
                        data: {
                            labels: charts.rentalDuration.map(item =>
                                `${item._id.city} - ${item._id.category}`
                            ),
                            datasets: [{
                                label: 'Average Duration (Hours)',
                                data: charts.rentalDuration.map(item => item.averageDuration),
                                backgroundColor: 'rgba(52, 152, 219, 0.5)'
                            }]
                        },
                        options: getChartOptions('duration')
                    }
                );
            }

            // Category Performance Chart
            if (charts.categoryPerformance) {
                // Aggregate data by category
                const categoryData = {};
                charts.categoryPerformance.forEach(item => {
                    const category = item._id.category;
                    if (!categoryData[category]) {
                        categoryData[category] = {
                            totalRevenue: 0,
                            totalBookings: 0,
                            uniqueCustomers: 0
                        };
                    }
                    categoryData[category].totalRevenue += item.totalRevenue;
                    categoryData[category].totalBookings += item.totalBookings;
                    categoryData[category].uniqueCustomers += item.uniqueCustomerCount;
                });

                // Convert to arrays for chart
                const categories = Object.keys(categoryData);
                const revenues = categories.map(cat => categoryData[cat].totalRevenue);

                vm.chartInstances.categoryPerformanceChart = new Chart(
                    document.getElementById('categoryPerformanceChart'),
                    {
                        type: 'line',
                        data: {
                            labels: categories,
                            datasets: [{
                                label: 'Revenue',
                                data: revenues,
                                borderColor: '#2ecc71',
                                fill: false
                            }]
                        },
                        options: {
                            ...getChartOptions('revenue'),
                            scales: {
                                x: {
                                    ticks: {
                                        maxTicksLimit: 10,
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        }
                                    }
                                },
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        maxTicksLimit: 10,
                                        callback: value => `₹${value.toLocaleString()}`,
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        }
                                    },
                                    title: {
                                        display: true,
                                        text: 'Revenue (₹)',
                                        font: {
                                            family: 'Inter',
                                            size: 12,
                                            weight: 500
                                        }
                                    }
                                }
                            }
                        }
                    }
                );
            }

            // Bid Success Rate Chart
            if (charts.bidSuccessRate) {
                // Group and aggregate data by city-category combination
                const aggregatedData = {};

                charts.bidSuccessRate.forEach(item => {
                    const key = `${item._id.city}-${item._id.category}`;
                    if (!aggregatedData[key]) {
                        aggregatedData[key] = {
                            city: item._id.city,
                            category: item._id.category,
                            totalBids: 0,
                            acceptedBids: 0,
                            totalBidAmount: 0,
                            bidCount: 0
                        };
                    }
                    aggregatedData[key].totalBids += item.totalBids;
                    aggregatedData[key].acceptedBids += item.acceptedBids;
                    aggregatedData[key].totalBidAmount += (item.averageBidAmount * item.totalBids);
                    aggregatedData[key].bidCount += item.totalBids;
                });

                const labels = Object.keys(aggregatedData);
                const successRates = labels.map(key =>
                    (aggregatedData[key].acceptedBids / aggregatedData[key].totalBids) * 100
                );
                const avgBidAmounts = labels.map(key =>
                    aggregatedData[key].totalBidAmount / aggregatedData[key].bidCount
                );

                vm.chartInstances.bidSuccessChart = new Chart(
                    document.getElementById('bidSuccessChart'),
                    {
                        type: 'bar',
                        data: {
                            labels: labels.map(key => {
                                const { city, category } = aggregatedData[key];
                                return `${city} - ${category}`;
                            }),
                            datasets: [
                                {
                                    label: 'Success Rate (%)',
                                    data: successRates,
                                    backgroundColor: 'rgba(46, 204, 113, 0.5)',
                                    borderColor: 'rgba(46, 204, 113, 1)',
                                    borderWidth: 1,
                                    yAxisID: 'y-percentage'
                                },
                                {
                                    label: 'Average Bid Amount (₹)',
                                    data: avgBidAmounts,
                                    type: 'line',
                                    borderColor: 'rgba(52, 152, 219, 1)',
                                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                                    borderWidth: 2,
                                    yAxisID: 'y-amount'
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                    labels: {
                                        font: {
                                            family: 'Inter',
                                            size: 12
                                        }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.dataset.label || '';
                                            const value = context.raw;
                                            if (context.datasetIndex === 0) {
                                                return `${label}: ${value.toFixed(1)}%`;
                                            }
                                            return `${label}: ₹${value.toLocaleString()}`;
                                        }
                                    }
                                }
                            },
                            scales: {
                                'y-percentage': {
                                    type: 'linear',
                                    position: 'left',
                                    title: {
                                        display: true,
                                        text: 'Success Rate (%)',
                                        font: {
                                            family: 'Inter',
                                            size: 12,
                                            weight: 500
                                        }
                                    },
                                    min: 0,
                                    max: 100,
                                    ticks: {
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        }
                                    }
                                },
                                'y-amount': {
                                    type: 'linear',
                                    position: 'right',
                                    title: {
                                        display: true,
                                        text: 'Average Bid Amount (₹)',
                                        font: {
                                            family: 'Inter',
                                            size: 12,
                                            weight: 500
                                        }
                                    },
                                    ticks: {
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        },
                                        callback: value => `₹${value.toLocaleString()}`
                                    }
                                },
                                x: {
                                    ticks: {
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        },
                                        maxRotation: 45,
                                        minRotation: 45
                                    }
                                }
                            }
                        }
                    }
                );
            }

            // Peak Hours Chart
            if (charts.peakHours) {
                const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                // Group data by day of week
                const dailyData = daysOfWeek.map((day, index) => {
                    const dayData = charts.peakHours.filter(item => item._id.dayOfWeek === index + 1);
                    return {
                        day,
                        bookings: Math.round(dayData.reduce((sum, item) => sum + item.bookingCount, 0)),
                        revenue: dayData.reduce((sum, item) => sum + item.totalRevenue, 0)
                    };
                });

                vm.chartInstances.peakHoursChart = new Chart(
                    document.getElementById('peakHoursChart'),
                    {
                        type: 'bar',
                        data: {
                            labels: daysOfWeek,
                            datasets: [
                                {
                                    label: 'Bookings',
                                    data: dailyData.map(d => d.bookings),
                                    backgroundColor: 'rgba(52, 152, 219, 0.5)',
                                    borderColor: 'rgba(52, 152, 219, 1)',
                                    borderWidth: 1,
                                    yAxisID: 'y-bookings'
                                },
                                {
                                    label: 'Revenue',
                                    data: dailyData.map(d => d.revenue),
                                    backgroundColor: 'rgba(46, 204, 113, 0.5)',
                                    borderColor: 'rgba(46, 204, 113, 1)',
                                    borderWidth: 1,
                                    yAxisID: 'y-revenue',
                                    type: 'line'
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            interaction: {
                                mode: 'index',
                                intersect: false,
                            },
                            scales: {
                                'y-bookings': {
                                    type: 'linear',
                                    position: 'left',
                                    title: {
                                        display: true,
                                        text: 'Number of Bookings',
                                        font: {
                                            family: 'Inter',
                                            size: 12,
                                            weight: 500
                                        }
                                    },
                                    grid: {
                                        drawOnChartArea: false
                                    },
                                    ticks: {
                                        stepSize: 1,
                                        precision: 0,
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        }
                                    }
                                },
                                'y-revenue': {
                                    type: 'linear',
                                    position: 'right',
                                    title: {
                                        display: true,
                                        text: 'Revenue (₹)',
                                        font: {
                                            family: 'Inter',
                                            size: 12,
                                            weight: 500
                                        }
                                    },
                                    grid: {
                                        drawOnChartArea: false
                                    },
                                    ticks: {
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        },
                                        callback: value => `₹${value.toLocaleString()}`
                                    }
                                },
                                x: {
                                    ticks: {
                                        font: {
                                            family: 'Inter',
                                            size: 11
                                        }
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.dataset.label || '';
                                            const value = context.raw;
                                            if (context.datasetIndex === 1) { // Revenue dataset
                                                return `${label}: ₹${value.toLocaleString()}`;
                                            }
                                            return `${label}: ${Math.round(value)}`;
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