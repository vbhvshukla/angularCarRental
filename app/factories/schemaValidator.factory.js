mainApp.factory('schemaValidator', function($q) {
   
    function validateValue(field, value, rules, data, path = '') {
        const errors = [];
        const fullPath = path ? `${path}.${field}` : field;

        // Handle required validation
        const isRequired = typeof rules.required === 'function' ? rules.required.call(data) : rules.required;

        if (isRequired && !value && value !== false && value !== 0) {
            errors.push(`${fullPath} is required`);
            return errors;
        }

        // If no value and not required, skip further validation
        if (value === undefined || value === null) {
            return errors;
        }

        // Handle default values
        if (value === undefined && 'default' in rules) {
            value = rules.default;
        }

        // Type validation
        if (rules.type) {
            if (rules.type === 'array' && !Array.isArray(value)) {
                errors.push(`${fullPath} must be an array`);
            } else if (rules.type !== 'array' && typeof value !== rules.type) {
                errors.push(`${fullPath} must be of type ${rules.type}`);
            }
        }

        // Array validations
        if (rules.type === 'array' && Array.isArray(value)) {
            if (rules.minItems && value.length < rules.minItems) {
                errors.push(`${fullPath} must have at least ${rules.minItems} items`);
            }
            if (rules.maxItems && value.length > rules.maxItems) {
                errors.push(`${fullPath} must not exceed ${rules.maxItems} items`);
            }
            if (rules.itemType && value.some(item => typeof item !== rules.itemType)) {
                errors.push(`All items in ${fullPath} must be of type ${rules.itemType}`);
            }
        }

        // String validations
        if (rules.type === 'string' && typeof value === 'string') {
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${fullPath} must be at least ${rules.minLength} characters`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${fullPath} must not exceed ${rules.maxLength} characters`);
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${fullPath} format is invalid`);
            }
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${fullPath} must be one of: ${rules.enum.join(', ')}`);
            }
        }

        // Number validations
        if (rules.type === 'number' && typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${fullPath} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${fullPath} must not exceed ${rules.max}`);
            }
        }

        // Object validations
        if (rules.type === 'object' && typeof value === 'object') {
            if (rules.properties) {
                Object.keys(rules.properties).forEach(prop => {
                    const propErrors = validateValue(
                        prop, 
                        value[prop], 
                        rules.properties[prop],
                        data,
                        fullPath
                    );
                    errors.push(...propErrors);
                });
            }
        }

        // Custom validation
        if (rules.validate && typeof rules.validate === 'function') {
            const customErrors = rules.validate(value, data);
            if (customErrors) {
                errors.push(...(Array.isArray(customErrors) ? customErrors : [customErrors]));
            }
        }

        return errors;
    }

    function validate(data, schema) {
        const errors = [];
        
        Object.keys(schema).forEach(field => {
            const fieldErrors = validateValue(field, data[field], schema[field], data);
            errors.push(...fieldErrors);
        });

        return errors.length ? $q.reject(errors) : $q.resolve(data);
    }

    return {
        validate: validate
    };
});