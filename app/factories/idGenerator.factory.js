/**
 * Factory : IdGenerator
 * @description Generates random ID.
 * @requires prefix for generateWithPrefix function.
 * @returns {generate,generateWithPrefix}
 */

mainApp.factory('idGenerator', function() {
    
    /**
     * Random ID generator
     * @function generateRandomId()
     * @description Generates 10 digit unique id from the
     * combination of random 4 digits and last six digit of
     * today's date.
     * @return {number}
     */

    function generateRandomId() {
        const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
        const timestampLastSix = Date.now().toString().slice(-6);
        return `${randomFourDigits}${timestampLastSix}`;
    }

    /**
     * Custom Id Generator
     * @function generateWithPrefix()
     * @param {*} prefix 
     * @returns {unique id prefixed with the prefix provided}
     */

    function generateCustomId(prefix) {
        return `${prefix}_${generateRandomId()}`;
    }

    return {
        generate: generateRandomId,
        generateWithPrefix: generateCustomId
    };
});