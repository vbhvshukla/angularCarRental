/** @file Owner Dashboard's Page Controller */

mainApp.controller('OwnerDashboardController', [
    '$scope', '$state', 'authService',
    function ($scope, $state, authService) {
        var vm = this;
        vm.init = function(){
            console.log("Hello world");
        }
    }
]);