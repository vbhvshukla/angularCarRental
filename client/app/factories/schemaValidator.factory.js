/**
 * Factory : Schema Validator
 * @description Checks for the schema passed against the provided schema
 * and ensures only those fields are getting stored in the db which are
 * necessary.
 * @requires $q
 */

mainApp.factory('schemaValidator', function($q) {   
    
    /** Validate Value Function
     * @function ValidateValue
     * @param {field} field 
     * @param {value} value 
     * @param {rules} rules 
     * @param {data} data 
     * @param {path} path 
     * @description Checks for errors with the rules provided,
     * if there are any errors, it returns the error message.
     * @returns errors
     */
    
    function validateValue(field, value, rules, data, path = '') {
        
        const errors = [];
        //If path is there use that path else make it like ex: in car we have user so user.car
        const fullPath = path ? `${path}.${field}` : field;
        
        const isRequired = typeof rules.required === 'function' ? rules.required.call(data) : rules.required;

        //If the field is required throw an error
        if (isRequired && !value && value !== false && value !== 0) {
            errors.push(`${fullPath} is required`);
            return errors;
        }
        
        //Value Validations(Undefined/Null Check)
        if (value === undefined || value === null) {
            return errors;
        }

        if (value === undefined && 'default' in rules) {
            value = rules.default;
        }

        //Array Type Validation
        if (rules.type) {
            if (rules.type === 'array' && !Array.isArray(value)) {
                errors.push(`${fullPath} must be an array`);
            } else if (rules.type !== 'array' && typeof value !== rules.type) {
                errors.push(`${fullPath} must be of type ${rules.type}`);
            }
        }
        //Array Length & Type Validation
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

        //String type ,length and regex validation.
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

        //Number validations
        if (rules.type === 'number' && typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${fullPath} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${fullPath} must not exceed ${rules.max}`);
            }
        }
        
        //Object validation
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

        //Data validation
        if (rules.validate && typeof rules.validate === 'function') {
            const customErrors = rules.validate(value, data);
            if (customErrors) {
                errors.push(...(Array.isArray(customErrors) ? customErrors : [customErrors]));
            }
        }

        return errors;
    }

    /**
     * Main function to validate
     * @description Take the schema iterate over each of it's keys.
     * match with the data provided if all the keys are present and the match the field types.
     * @param {Incoming} data 
     * @param {Predefined} schema 
     * @returns {error,data}
     */
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