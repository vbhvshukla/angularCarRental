mainApp.controller('UserDashboardController', [
    '$scope', '$state', 'authService',
    function ($scope, $state, authService) {
        var vm = this;

        vm.init = function(){
            console.log("Hello world");
        }
    }
]);