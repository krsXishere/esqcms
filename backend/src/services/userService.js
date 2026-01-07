const bcrypt = require('bcrypt');

class UserService {
    /**
     * Hash password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} - Hashed password
     */
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Compare password with hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} - True if password matches
     */
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} - Validation result with isValid and message
     */
    validatePasswordStrength(password) {
        if (password.length < 8) {
            return {
                isValid: false,
                message: 'Password must be at least 8 characters long',
            };
        }
        return { isValid: true, message: 'Password is valid' };
    }
}

module.exports = new UserService();
