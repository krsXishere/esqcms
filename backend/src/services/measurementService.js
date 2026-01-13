/**
 * Service for measurement-related business logic
 */
class MeasurementService {
    /**
     * Calculate measurement status based on actual value and tolerance
     * @param {number} actual - Actual measurement value
     * @param {number} toleranceMin - Minimum tolerance value
     * @param {number} toleranceMax - Maximum tolerance value
     * @returns {string} - 'ok' if within tolerance, 'ng' if outside
     */
    calculateStatus(actual, toleranceMin, toleranceMax) {
        const actualValue = parseFloat(actual);
        const minValue = parseFloat(toleranceMin);
        const maxValue = parseFloat(toleranceMax);

        if (actualValue >= minValue && actualValue <= maxValue) {
            return 'ok';
        }
        return 'ng';
    }

    /**
     * Calculate pass rate for a set of measurements
     * @param {Array} measurements - Array of measurement objects
     * @returns {object} - Statistics including passRate, okCount, ngCount
     */
    calculatePassRate(measurements) {
        if (!measurements || measurements.length === 0) {
            return { passRate: 0, okCount: 0, ngCount: 0, total: 0 };
        }

        const okCount = measurements.filter(m => m.status === 'ok').length;
        const ngCount = measurements.filter(m => m.status === 'ng').length;
        const total = measurements.length;
        const passRate = (okCount / total) * 100;

        return {
            passRate: Math.round(passRate * 100) / 100,
            okCount,
            ngCount,
            total,
        };
    }

    /**
     * Validate measurement data
     * @param {object} data - Measurement data to validate
     * @returns {object} - Validation result with isValid and errors
     */
    validateMeasurementData(data) {
        const errors = [];

        if (data.dimensional === undefined || isNaN(parseFloat(data.dimensional))) {
            errors.push('Dimensional must be a valid number');
        }
        if (data.nominal === undefined || isNaN(parseFloat(data.nominal))) {
            errors.push('Nominal must be a valid number');
        }
        if (data.toleranceMin === undefined || isNaN(parseFloat(data.toleranceMin))) {
            errors.push('Tolerance min must be a valid number');
        }
        if (data.toleranceMax === undefined || isNaN(parseFloat(data.toleranceMax))) {
            errors.push('Tolerance max must be a valid number');
        }
        if (data.actual === undefined || isNaN(parseFloat(data.actual))) {
            errors.push('Actual must be a valid number');
        }

        // Check if toleranceMin is less than toleranceMax
        if (parseFloat(data.toleranceMin) > parseFloat(data.toleranceMax)) {
            errors.push('Tolerance min must be less than or equal to tolerance max');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

module.exports = new MeasurementService();
