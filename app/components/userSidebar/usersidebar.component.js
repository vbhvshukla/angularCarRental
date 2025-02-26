mainApp.component('userSidebar', {
    templateUrl: 'app/components/userSidebar/usersidebar.template.html',
    controller: ['$state', function($state) {
        let $ctrl = this;
        
        $ctrl.menuItems = [
            { state: 'userdashboard.profile', icon: '🏠', label: 'My Profile' },
            { state: 'userdashboard.bookings', icon: '📅', label: 'My Bookings' },
            { state: 'userdashboard.messages', icon: '✉️', label: 'My Messages' },
            { state: 'userdashboard.bids', icon: '💰', label: 'My Biddings' }
        ];

        $ctrl.isActive = function(state) {
            return $state.includes(state);
        };
    }],
});