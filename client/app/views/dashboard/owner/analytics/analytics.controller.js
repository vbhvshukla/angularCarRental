mainApp.controller('OwnerAnalyticsController', [
    '$scope', 'analyticsService', 'userFactory', 'errorService',
    function ($scope, analyticsService, userFactory, errorService) {
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

            userFactory.getCurrentUser() // Use userFactory to fetch the current user
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
                labels: data.revenue.map(item => item.month).slice(0, 10), // Limit to 10 points
                datasets: [
                    {
                        label: 'Local Revenue',
                        data: data.revenue.map(item => item.totalLocalRevenue).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(52, 152, 219, 0.5)', // Transparentized blue
                        borderColor: '#3498db',
                        fill: true
                    },
                    {
                        label: 'Outstation Revenue',
                        data: data.revenue.map(item => item.totalOutstationRevenue).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(231, 76, 60, 0.5)', // Transparentized red
                        borderColor: '#e74c3c',
                        fill: true
                    }
                ]
            }, {
                ...vm.revenueChartOptions,
                scales: {
                    ...vm.revenueChartOptions.scales,
                    x: {
                        ...vm.revenueChartOptions.scales.x,
                        ticks: {
                            maxTicksLimit: 10 // Limit X-axis to 10 points
                        }
                    },
                    y: {
                        ...vm.revenueChartOptions.scales.y,
                        ticks: {
                            maxTicksLimit: 10 // Limit Y-axis to 10 points
                        }
                    }
                }
            });

            // Bookings Per Car Chart
            createChart('bookingsPerCarChart', 'bar', {
                labels: data.bookings.map(item => item.carName).slice(0, 10), // Limit to 10 points
                datasets: [
                    {
                        label: 'Bookings',
                        data: data.bookings.map(item => item.totalBookings).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(46, 204, 113, 0.5)' // Transparentized green
                    }
                ]
            }, {
                ...vm.barChartOptions,
                scales: {
                    ...vm.barChartOptions.scales,
                    x: {
                        ...vm.barChartOptions.scales.x,
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        ...vm.barChartOptions.scales.y,
                        ticks: {
                            maxTicksLimit: 10,
                            stepSize: 1,
                            callback: value => Math.floor(value)
                        }
                    }
                }
            });

            // Rental Duration Chart
            createChart('rentalDurationChart', 'bar', {
                labels: data.rentalDuration.map(item => item.carName).slice(0, 10), // Limit to 10 points
                datasets: [
                    {
                        label: 'Local Duration (Hours)',
                        data: data.rentalDuration.map(item => item.totalLocalDurationInHours).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(142, 68, 173, 0.5)' // Transparentized purple
                    },
                    {
                        label: 'Outstation Duration (Days)',
                        data: data.rentalDuration.map(item => item.totalOutstationDurationInDays).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(230, 126, 34, 0.5)' // Transparentized orange
                    }
                ]
            }, {
                ...vm.barChartOptions,
                scales: {
                    ...vm.barChartOptions.scales,
                    x: {
                        ...vm.barChartOptions.scales.x,
                        ticks: {
                            maxTicksLimit: 10 // Limit X-axis to 10 points
                        }
                    },
                    y: {
                        ...vm.barChartOptions.scales.y,
                        ticks: {
                            maxTicksLimit: 10 // Limit Y-axis to 10 points
                        }
                    }
                }
            });

            // Bid Amount Per Car Chart
            createChart('bidAmountChart', 'bar', {
                labels: data.bidAmounts.map(item => item.carName).slice(0, 10), // Limit to 10 points
                datasets: [
                    {
                        label: 'Bid Amount',
                        data: data.bidAmounts.map(item => item.bidAmount).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(241, 196, 15, 0.5)' // Transparentized yellow
                    }
                ]
            }, {
                ...vm.barChartOptions,
                scales: {
                    ...vm.barChartOptions.scales,
                    x: {
                        ...vm.barChartOptions.scales.x,
                        ticks: {
                            maxTicksLimit: 10 // Limit X-axis to 10 points
                        }
                    },
                    y: {
                        ...vm.barChartOptions.scales.y,
                        ticks: {
                            maxTicksLimit: 10 // Limit Y-axis to 10 points
                        }
                    }
                }
            });

            // Car Availability Insights Chart
            createChart('carAvailabilityChart', 'bar', {
                labels: data.carAvailability.map(item => item.carName).slice(0, 10), // Limit to 10 points
                datasets: [
                    {
                        label: 'Availability (%)',
                        data: data.carAvailability.map(item => item.availabilityPercentage).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(26, 188, 156, 0.5)' // Transparentized teal
                    }
                ]
            }, {
                ...vm.barChartOptions,
                scales: {
                    ...vm.barChartOptions.scales,
                    x: {
                        ...vm.barChartOptions.scales.x,
                        ticks: {
                            maxTicksLimit: 10 // Limit X-axis to 10 points
                        }
                    },
                    y: {
                        ...vm.barChartOptions.scales.y,
                        ticks: {
                            maxTicksLimit: 10 // Limit Y-axis to 10 points
                        }
                    }
                }
            });

            // Rental Type Distribution Chart
            createChart('rentalTypeDistributionChart', 'pie', {
                labels: data.rentalTypeDistribution.map(item => item.rentalType).slice(0, 10), // Limit to 10 points
                datasets: [
                    {
                        label: 'Rental Type Distribution',
                        data: data.rentalTypeDistribution.map(item => item.count).slice(0, 10), // Limit to 10 points
                        backgroundColor: [
                            'rgba(52, 152, 219, 0.5)', // Transparentized blue
                            'rgba(231, 76, 60, 0.5)'  // Transparentized red
                        ]
                    }
                ]
            });

            // Category Performance Chart
            createChart('categoryPerformanceChart', 'bar', {
                labels: data.categoryPerformance.map(item => item._id).slice(0, 10), // Limit to 10 points
                datasets: [
                    {
                        label: 'Revenue',
                        data: data.categoryPerformance.map(item => item.totalRevenue).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(155, 89, 182, 0.5)' // Transparentized violet
                    },
                    {
                        label: 'Bookings',
                        data: data.categoryPerformance.map(item => item.totalBookings).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(52, 73, 94, 0.5)' // Transparentized gray
                    }
                ]
            }, {
                ...vm.barChartOptions,
                scales: {
                    ...vm.barChartOptions.scales,
                    x: {
                        ...vm.barChartOptions.scales.x,
                        ticks: {
                            maxTicksLimit: 10 // Limit X-axis to 10 points
                        }
                    },
                    y: {
                        ...vm.barChartOptions.scales.y,
                        ticks: {
                            maxTicksLimit: 10 // Limit Y-axis to 10 points
                        }
                    }
                }
            });

            // Peak Booking Hours Chart
            createChart('peakBookingHoursChart', 'bar', {
                labels: data.peakBookingHours.map(item => item.hour).slice(0, 10), // Limit to 10 points
                datasets: [
                    {
                        label: 'Bookings',
                        data: data.peakBookingHours.map(item => item.bookings).slice(0, 10), // Limit to 10 points
                        backgroundColor: 'rgba(230, 126, 34, 0.5)' // Transparentized orange
                    }
                ]
            }, {
                ...vm.barChartOptions,
                scales: {
                    ...vm.barChartOptions.scales,
                    x: {
                        ...vm.barChartOptions.scales.x,
                        ticks: {
                            maxTicksLimit: 10 // Limit X-axis to 10 points
                        }
                    },
                    y: {
                        ...vm.barChartOptions.scales.y,
                        ticks: {
                            maxTicksLimit: 10 // Limit Y-axis to 10 points
                        }
                    }
                }
            });
        }

        vm.updateTimeRange = function () {
            vm.loading = true;
            userFactory.getCurrentUser() // Use userFactory to fetch the current user
                .then(user => analyticsService.getOwnerAnalytics(user._id, vm.selectedDays))
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