mainApp.controller('OwnerAnalyticsController', [
    '$scope', 'analyticsService', 'authService', 'errorService',
    function ($scope, analyticsService, authService, errorService) {
        let vm = this;
        vm.chartInstances = {};
        vm.loading = false;
        vm.selectedDays = "30";
        vm.totals = {};
        vm.charts = {};

        // Chart options
        vm.revenueChartOptions = {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString(),
                        stepSize: 500
                    },
                    title: {
                        display: true,
                        text: 'Revenue (₹)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Time Period'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return label + ': ₹' + value.toLocaleString();
                        }
                    }
                }
            }
        };

        vm.barChartOptions = {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                        callback: value => Math.floor(value)
                    }
                }
            }
        };

        vm.init = function () {
            vm.loading = true;

            authService.getUser()
                .then(user => {
                    vm.currentUser = user;
                    return analyticsService.getOwnerAnalytics(user._id, vm.selectedDays);
                })
                .then(data => {
                    vm.totals = data.totals;
                    vm.charts = data.charts;

                    // Format revenue for display
                    vm.totals.formattedRevenue = '₹' + vm.totals.totalRevenue.toLocaleString();

                    // Render charts
                    renderCharts(data.charts);
                })
                .catch(error => {
                    errorService.handleError('Failed to load analytics', error);
                })
                .finally(() => {
                    vm.loading = false;
                });
        };

        function createChart(canvasId, type, data, options) {
            const ctx = document.getElementById(canvasId).getContext('2d');

            if (vm.chartInstances[canvasId]) {
                vm.chartInstances[canvasId].destroy();
            }

            vm.chartInstances[canvasId] = new Chart(ctx, {
                type: type,
                data: data,
                options: options
            });
        }

        function renderCharts(data) {
            console.log(data);
            // Monthly Revenue Chart
            createChart('monthlyRevenueChart', 'line', {
                labels: data.revenue.map(item => item.month),
                datasets: [
                    {
                        label: 'Local Revenue',
                        data: data.revenue.map(item => item.totalLocalRevenue),
                        backgroundColor: '#3498db',
                        borderColor: '#3498db',
                        fill: false
                    },
                    {
                        label: 'Outstation Revenue',
                        data: data.revenue.map(item => item.totalOutstationRevenue),
                        backgroundColor: '#e74c3c',
                        borderColor: '#e74c3c',
                        fill: false
                    }
                ]
            }, vm.revenueChartOptions);

            // Bookings Per Car Chart
            createChart('bookingsPerCarChart', 'bar', {
                labels: data.bookings.map(item => item.carName),
                datasets: [
                    {
                        label: 'Bookings',
                        data: data.bookings.map(item => item.totalBookings),
                        backgroundColor: '#2ecc71'
                    }
                ]
            }, vm.barChartOptions);

            // Rental Duration Chart
            createChart('rentalDurationChart', 'bar', {
                labels: data.rentalDuration.map(item => item.carName),
                datasets: [
                    {
                        label: 'Local Duration (Hours)',
                        data: data.rentalDuration.map(item => item.totalLocalDurationInHours),
                        backgroundColor: '#8e44ad'
                    },
                    {
                        label: 'Outstation Duration (Days)',
                        data: data.rentalDuration.map(item => item.totalOutstationDurationInDays),
                        backgroundColor: '#e67e22'
                    }
                ]
            }, vm.barChartOptions);

            // Bid Amount Per Car Chart
            createChart('bidAmountChart', 'bar', {
                labels: data.bidAmounts.map(item => item.carName),
                datasets: [
                    {
                        label: 'Bid Amount',
                        data: data.bidAmounts.map(item => item.bidAmount),
                        backgroundColor: '#f1c40f'
                    }
                ]
            }, vm.barChartOptions);
        }

        vm.updateTimeRange = function () {
            vm.loading = true;
            authService.getUser()
                .then(user => analyticsService.getOwnerAnalytics(user.userId, vm.selectedDays))
                .then(data => {
                    vm.totals = data.totals;
                    vm.charts = data.charts;
                    vm.totals.formattedRevenue = '₹' + vm.totals.totalRevenue.toLocaleString();
                    renderCharts(data.charts);
                })
                .catch(error => errorService.handleError('Failed to load analytics', error))
                .finally(() => vm.loading = false);
        };

        $scope.$on('$destroy', function () {
            Object.values(vm.chartInstances).forEach(chart => chart.destroy());
        });
    }
]);