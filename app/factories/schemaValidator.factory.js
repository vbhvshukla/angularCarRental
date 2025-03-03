mainApp.factory('schemaValidator', function($q) {   
        // Field: the name of the fields (email,password etc)
        // Value : the value of the field
        // Rules : the validation rules like required,type,min,max etc.
        // Data : Data object to be validated
        // Path : The path of the field within the data (for nested objects) Ex: address.street etc etc booking.bid.user.xyz..
    

    function validateValue(field, value, rules, data, path = '') {
        const errors = [];
        //If path is there use that path else make it like ex: in car we have user so user.car
        const fullPath = path ? `${path}.${field}` : field;
        
        const isRequired = typeof rules.required === 'function' ? rules.required.call(data) : rules.required;

        if (isRequired && !value && value !== false && value !== 0) {
            errors.push(`${fullPath} is required`);
            return errors;
        }
        
        if (value === undefined || value === null) {
            return errors;
        }

        if (value === undefined && 'default' in rules) {
            value = rules.default;
        }

        if (rules.type) {
            if (rules.type === 'array' && !Array.isArray(value)) {
                errors.push(`${fullPath} must be an array`);
            } else if (rules.type !== 'array' && typeof value !== rules.type) {
                errors.push(`${fullPath} must be of type ${rules.type}`);
            }
        }
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

        if (rules.type === 'number' && typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${fullPath} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${fullPath} must not exceed ${rules.max}`);
            }
        }
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

/*
mainApp.factory('schemaValidator', function($q) {
   
    function validateValue(field, value, rules) {
        const errors = [];
        
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} is required`);
        }

        if (value === undefined || value === null) {
            return errors;
        }

        if (rules.type) {
            if (rules.type === 'array' && !Array.isArray(value)) {
                errors.push(`${field} must be an array`);
            } else if (rules.type !== 'array' && typeof value !== rules.type) {
                errors.push(`${field} must be of type ${rules.type}`);
            }
        }

        if (rules.type === 'string' && typeof value === 'string') {
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${field} must not exceed ${rules.maxLength} characters`);
            }
        }

        if (rules.type === 'number' && typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${field} must not exceed ${rules.max}`);
            }
        }

        return errors;
    }

    function validate(data, schema) {
        const errors = [];

        Object.keys(schema).forEach(field => {
            const fieldErrors = validateValue(field, data[field], schema[field]);
            errors.push(...fieldErrors);
        });

        return errors.length ? $q.reject(errors) : $q.resolve(data);
    }

    return {
        validate: validate
    };
});

*/