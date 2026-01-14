/**
 * Utility function untuk generate unique codes untuk berbagai entity
 */
class CodeGenerator {
    /**
     * Generate unique code dengan format PREFIX-YYYYMMDD-XXXXX
     * @param {string} prefix - Prefix untuk code
     * @returns {string} - Generated code
     */
    _generateCodeWithDate(prefix) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;

        // Generate random 5-digit number (00001-99999)
        const randomNum = String(Math.floor(Math.random() * 100000)).padStart(5, '0');

        return `${prefix}-${dateStr}-${randomNum}`;
    }

    /**
     * Generate unique delivery order code
     * Format: DO-YYYYMMDD-XXXXX (contoh: DO-20260114-00001)
     * @returns {string}
     */
    generateDeliveryOrderCode() {
        return this._generateCodeWithDate('DO');
    }

    /**
     * Generate unique shift code
     * Format: SFT-YYYYMMDD-XXXXX
     * @returns {string}
     */
    generateShiftCode() {
        return this._generateCodeWithDate('SFT');
    }

    /**
     * Generate unique section code
     * Format: SEC-YYYYMMDD-XXXXX
     * @returns {string}
     */
    generateSectionCode() {
        return this._generateCodeWithDate('SEC');
    }

    /**
     * Generate unique template code
     * Format: TPL-YYYYMMDD-XXXXX
     * @returns {string}
     */
    generateTemplateCode() {
        return this._generateCodeWithDate('TPL');
    }

    /**
     * Generate unique reject reason code
     * Format: RSN-YYYYMMDD-XXXXX
     * @returns {string}
     */
    generateRejectReasonCode() {
        return this._generateCodeWithDate('RSN');
    }

    /**
     * Generate unique DIR code
     * Format: DIR-YYYYMMDD-XXXXX
     * @returns {string}
     */
    generateDirCode() {
        return this._generateCodeWithDate('DIR');
    }

    /**
     * Generate unique FI code
     * Format: FI-YYYYMMDD-XXXXX
     * @returns {string}
     */
    generateFiCode() {
        return this._generateCodeWithDate('FI');
    }
}

module.exports = new CodeGenerator();
