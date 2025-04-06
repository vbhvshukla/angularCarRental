mainApp.factory('categoryFactory', ['$q', 'categoryService', function ($q, categoryService) {
    function Category(initialData = {}) {
        this.categoryName = initialData.categoryName || '';
    }

    function validateCategoryData(categoryData) {
        const errors = [];

        if (!categoryData.categoryName || categoryData.categoryName.trim() === '') {
            errors.push('Category name is required.');
        }

        if (categoryData.categoryName.length < 2 || categoryData.categoryName.length > 50) {
            errors.push('Category name must be between 2 and 50 characters.');
        }

        return errors;
    }

    Category.prototype = {
        create: function () {
            const deferred = $q.defer();

            const errors = validateCategoryData(this);
            if (errors.length > 0) {
                deferred.reject({ message: 'Validation failed', errors });
            } else {
                categoryService.createCategory(this)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        update: function () {
            const deferred = $q.defer();

            const errors = validateCategoryData(this);
            if (errors.length > 0) {
                deferred.reject({ message: 'Validation failed', errors });
            } else {
                categoryService.updateCategory(this)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        validate: function () {
            return validateCategoryData(this);
        }
    };

    return {
        createCategory: function (data) {
            return new Category(data);
        },
        getAllCategories: function () {
            return categoryService.getAllCategories();
        }
    };
}]);
