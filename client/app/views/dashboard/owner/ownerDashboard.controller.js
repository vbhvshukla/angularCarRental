/** @file Owner Dashboard's Page Controller */

mainApp.controller('OwnerDashboardController', [
    function () {
        var vm = this;
        
        // Initialize sidebar visibility
        vm.isSidebarVisible = false;

        vm.init = function(){
            console.log("Owner Dashboard Initialized");
        };

        // Toggle sidebar function
        vm.toggleSidebar = function() {
            vm.isSidebarVisible = !vm.isSidebarVisible;
        };
    }
]);