mainApp.controller('AddRatingController', ['$scope', '$uibModalInstance', 'carService', 'bookingId', 'carId', function($scope, $uibModalInstance, carService, bookingId, carId) {
    $scope.rating = 0;
    $scope.maxRating = 5;
    $scope.ratingHover = 0;
    $scope.ratingMessage = '';

    $scope.setRating = function(rating) {
        $scope.rating = rating;
    };

    $scope.setHoverRating = function(rating) {
        $scope.ratingHover = rating;
    };

    $scope.submitRating = function() {
        if ($scope.rating === 0) {
            $scope.ratingMessage = 'Please select a rating';
            return;
        }

        carService.rateCar(bookingId, $scope.rating, carId)
            .then(function(response) {
                $uibModalInstance.close(response);
            })
            .catch(function(error) {
                $scope.ratingMessage = 'Error submitting rating. Please try again.';
            });
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}]);
