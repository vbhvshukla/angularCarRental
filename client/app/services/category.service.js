mainApp.service('categoryService', function ($http, schemaValidator, idGenerator) {
    /**
     * Global Variable
     */
    // const BASE_URL = 'http://127.0.0.1:8006/api/v1/category';
    
    const BASE_URL = 'https://carental-12t8.onrender.com/api/v1/category';

    /**
     * Category Schema for validation
     */
    const categorySchema = {
        categoryName: { type: 'string', required: true, minLength: 2, maxLength: 50 },
    };

    /**
     * @function getAllCategories()
     * @description Get all the categories
     * @returns resolved or rejected promise.
     */
    this.getAllCategories = function () {
        return $http.get(`${BASE_URL}/getallcategories`)
            .then(response => response.data)
            .catch(err => console.log(err));
    };

    /**
     * @function getCategoryById()
     * @description Get Category by Its Id.
     * @param {*} categoryId 
     * @returns resolved or rejected promise.
     */
    this.getCategoryById = function (categoryId) {
        return $http.get(`${BASE_URL}/getcategory/${categoryId}`)
            .then(response => response.data)
            .catch(err => console.log(err));
    };

    /**
     * @function createCategory()
     * @param {*} category 
     * @returns resolved or rejected promise.
     */
    this.createCategory = function (category) {
        return schemaValidator.validate(category, categorySchema)
            .then(function (validatedCategory) {
                return $http.post(`${BASE_URL}/create`, validatedCategory)
                    .then(response => response.data)
                    .catch(err => console.log(err));
            });
    };

    /**
     * @function updateCategory()
     * @param {*} category 
     * @returns resolved or rejected promise.
     */
    this.updateCategory = function (category) {
        return $http.put(`${BASE_URL}/update/${category.categoryId}`, category)
            .then(response => response.data)
            .catch(err => console.log(err));
    };

    /**
     * @function deleteCategory()
     * @param {*} categoryId 
     * @returns resolved or rejected promise.
     */
    this.deleteCategory = function (categoryId) {
        return $http.delete(`${BASE_URL}/delete/${categoryId}`)
            .then(response => response.data)
            .catch(err => console.log(err));
    };
});