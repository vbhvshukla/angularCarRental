mainApp.controller('UserDashboardController', [
    function () {
        var vm = this;
        vm.isSidebarVisible = false;

        vm.init = function () {
            // Check screen size on init
            vm.isSidebarVisible = window.innerWidth >= 768;
        };

        vm.toggleSidebar = function(forcedState) {
            if (typeof forcedState !== 'undefined') {
                vm.isSidebarVisible = forcedState;
            } else {
                vm.isSidebarVisible = !vm.isSidebarVisible;
            }
        };
    }
]);