/**
 * Factory : Number formatter
 * @description Formats numbers based on there decimals (K,M,B)
 * @requires value Numerical Value to be converted.
 * @returns {formatNumber}
 */

mainApp.factory('numberFormatFactory', [function () {

    /**
     * @function formatNumber
     * @description Formats numbers based on there decimals (K,M,B)
     * @param {*} value 
     * @returns {string}
     */

    function formatNumber(value) {
        if (value >= 1e9) {
            return (value / 1e9).toFixed(1) + 'B';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(1) + 'M';
        } else if (value >= 1e3) {
            return (value / 1e3).toFixed(1) + 'K';
        } else {
            return value.toString();
        }
    }

    return { formatNumber }
}])