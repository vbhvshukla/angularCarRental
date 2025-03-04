/**
 * Rating Directive
 * @description Converts the numerical rating into stars.
 */
mainApp.directive('starRating', function() {
    return {
        restrict: 'E',
        scope: {
            rating: '='
        },
        template: '<span class="stars">{{generateStars(rating)}}</span>',
        controller: function($scope) {
            $scope.generateStars = function(rating) {
                const fullStars = Math.floor(rating);
                const halfStar = rating % 1 >= 0.5 ? 1 : 0;
                const emptyStars = 5 - fullStars - halfStar;
                
                return "★".repeat(fullStars) +
                       "⯨".repeat(halfStar) +
                       "☆".repeat(emptyStars);
            };
        }
    };
});