
mainApp.service('categoryService', function (dbService, schemaValidator,idGenerator) {
    const STORE_NAME = 'categories';
    
    const categorySchema = {
        categoryId: { type: 'string', required: true, minLength: 2 },
        categoryName: { type: 'string', required: true, minLength: 2, maxLength: 50 },
    };

    this.getAllCategories = function () {
        return dbService.getAllItems(STORE_NAME);
    };

    this.getCategoryById = function (categoryId) {
        return dbService.getItemByKey(STORE_NAME, categoryId);
    };

    this.createCategory = function (category) {
        if (!category.categoryId) {
            category.categoryId = idGenerator.generate();
            // category.categoryName = category.name;
            console.log(category);
        }
        return schemaValidator.validate(category, categorySchema)
            .then(function (validatedCategory) {
                return dbService.addItem(STORE_NAME, validatedCategory);
            });
    };

    this.updateCategory = function (category) {
        return dbService.updateItem(STORE_NAME, category);
    };

    this.deleteCategory = function (categoryId) {
        console.log(categoryId);
        return dbService.deleteItem(STORE_NAME, categoryId);
    };
});