/**
 * Validates a cabinet name
 * @param {string} name - The cabinet name to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateCabinetName = (name) => {
    // Trim the name to check actual length without whitespace
    const trimmedName = name.trim();
    
    // Check for empty name
    if (!trimmedName) {
      return {
        isValid: false,
        error: 'Cabinet name cannot be empty'
      };
    }
  
    // Check length (30 characters max)
    if (trimmedName.length > 30) {
      return {
        isValid: false,
        error: 'Cabinet name must be 30 characters or less'
      };
    }
  
    // Check for problematic characters using regex
    const invalidChars = /[/\\.<>$"&\x00-\x1F\x7F-\x9F]/;
    if (invalidChars.test(trimmedName)) {
      return {
        isValid: false,
        error: 'Cabinet name contains invalid characters'
      };
    }
  
    // Check for names that are only whitespace
    if (!trimmedName.length) {
      return {
        isValid: false,
        error: 'Cabinet name cannot be only whitespace'
      };
    }
  
    return {
      isValid: true,
      error: null
    };
  };