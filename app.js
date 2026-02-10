// Event Planning Landing Page - Main Application Module

/**
 * Validation Module
 * Provides validation functions for different input types
 */
const Validators = {
  /**
   * Validates that a field is not empty
   * @param {string} value - The value to validate
   * @returns {string|null} - Error message or null if valid
   */
  required: (value) => {
    return value && value.trim().length > 0 
      ? null 
      : 'This field is required';
  },
  
  /**
   * Validates email format
   * @param {string} value - The email to validate
   * @returns {string|null} - Error message or null if valid
   */
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) 
      ? null 
      : 'Please enter a valid email address';
  },
  
  /**
   * Validates phone number format
   * @param {string} value - The phone number to validate
   * @returns {string|null} - Error message or null if valid
   */
  phone: (value) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10
      ? null 
      : 'Please enter a valid phone number';
  },
  
  /**
   * Validates that a date is today or in the future
   * @param {string} value - The date string (YYYY-MM-DD format)
   * @returns {string|null} - Error message or null if valid
   */
  futureDate: (value) => {
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today 
      ? null 
      : 'Event date must be today or in the future';
  },
  
  /**
   * Validates that a number is positive
   * @param {string|number} value - The number to validate
   * @returns {string|null} - Error message or null if valid
   */
  positiveNumber: (value) => {
    const num = parseInt(value, 10);
    return num > 0 
      ? null 
      : 'Please enter a number greater than 0';
  },
  
  /**
   * Validates that at least one service is selected
   * @param {Array} services - Array of selected services
   * @returns {string|null} - Error message or null if valid
   */
  atLeastOneService: (services) => {
    return services.length > 0 
      ? null 
      : 'Please select at least one service';
  }
};

// Export for use in other modules or tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Validators };
}
