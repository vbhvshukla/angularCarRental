mainApp.controller('AnalyticsController', ['$scope', '$q',
    function ($scope, $q) {
        var vm = this;
        vm.selectedTimeRange = 30;
        
        vm.cards = [
            { title: 'Total Users', value: 0 },
            { title: 'Total Bookings', value: 0 },
            { title: 'Total Biddings', value: 0 },
            { title: 'Total Cars', value: 0 },
            { title: 'Top 3 Bidders', value: 'N/A' }
        ];
        vm.chartData = [
            { id: 'totalRevenuePerCategoryChart' },
            { id: 'totalRevenuePerCityChart' },
            { id: 'averageRevenuePerUserChart' },
            { id: 'bookingsOverTimeChart' },
            { id: 'carsPerCategoryChart' },
            { id: 'highestRatedCarCategoryWiseChart' },
            { id: 'bidsPerCategoryChart' },
            { id: 'totalBiddedPricePerCategoryChart' },
            { id: 'carsPerCityChart' },
            { id: 'revenueTrendsChart' }
        ];

        vm.loadAnalyticsData = function () {
           
        };
    }])