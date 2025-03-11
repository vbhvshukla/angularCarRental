mainApp.service('categoryService', function (dbService, schemaValidator, idGenerator) {
    /**
     * Global Variable
     */

    const STORE_NAME = 'categories';

    /**
     * Category Schema for validation
     */

    const categorySchema = {
        categoryId: { type: 'string', required: true, minLength: 2 },
        categoryName: { type: 'string', required: true, minLength: 2, maxLength: 50 },
    };

    /**
     * @function getAllCategories()
     * @description Get all the categories
     * @returns resolved or rejected promise.
     */

    this.getAllCategories = function () {
        return dbService.getAllItems(STORE_NAME);
    };

    /**
     * @function getCategoryById()
     * @description Get Category by It's Id.
     * @param {*} categoryId 
     * @returns resolved or rejected promise.
     */

    this.getCategoryById = function (categoryId) {
        return dbService.getItemByKey(STORE_NAME, categoryId);
    };

    /**
     * @function createCategory()
     * @param {*} category 
     * @returns resolved or rejected promise.
     */

    this.createCategory = function (category) {
        if (!category.categoryId) {
            category.categoryId = idGenerator.generate();
        }
        return schemaValidator.validate(category, categorySchema)
            .then(function (validatedCategory) {
                return dbService.addItem(STORE_NAME, validatedCategory);
            });
    };

    /**
     * @function updateCategory()
     * @param {*} category 
     * @returns resolved or rejected promise.
     */

    this.updateCategory = function (category) {
        return dbService.updateItem(STORE_NAME, category);
    };

    /**
     * @function deleteCategory()
     * @param {*} categoryId 
     * @returns resolved or rejected promise.
     */

    this.deleteCategory = function (categoryId) {
        return dbService.deleteItem(STORE_NAME, categoryId);
    };
});