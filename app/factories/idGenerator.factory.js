mainApp.factory('idGenerator', function() {
    function generateRandomId() {
        const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
        const timestampLastSix = Date.now().toString().slice(-6);
        return `${randomFourDigits}${timestampLastSix}`;
    }

    function generateCustomId(prefix) {
        return `${prefix}_${generateRandomId()}`;
    }

    // Return the public API
    return {
        generate: generateRandomId,
        generateWithPrefix: generateCustomId
    };
});