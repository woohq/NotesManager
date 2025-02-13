// utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from 'dompurify';

// Style utility function
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a cabinet name
 * @param {string} name - The cabinet name to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export function validateCabinetName(name) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      isValid: false,
      error: 'Cabinet name cannot be empty'
    };
  }

  if (trimmedName.length > 51) {
    return {
      isValid: false,
      error: 'Cabinet name must be 50 characters or less'
    };
  }

  const invalidChars = /[/\\.<>$"&\x00-\x1F\x7F-\x9F]/;
  if (invalidChars.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Cabinet name contains invalid characters'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

// DOMPurify configuration for sanitization
const sanitizerConfig = {
  ALLOWED_TAGS: [
    // Basic structure
    'p', 'div', 'span',
    // Typography
    'h1', 'h2', 'h3', 'strong', 'em', 'u', 's',
    // Lists
    'ul', 'ol', 'li',
    // Code
    'pre', 'code',
    // Other elements
    'blockquote', 'a',
    // Task lists
    'input',
  ],
  ALLOWED_ATTR: [
    'href', // For links
    'class', // For styling
    'style', // For inline styles
    'data-type', // For TipTap specific attributes
    'type', // For checkboxes
    'checked', // For checkboxes
  ],
  ALLOWED_STYLES: [
    'color',
    'background-color',
    'font-family',
    'font-size',
    'text-align',
    'margin',
    'margin-left',
    'padding',
  ],
};

/**
 * Sanitizes HTML content before saving to database
 * @param {string} content - The HTML content to sanitize
 * @returns {string} - Sanitized HTML content
 */
export function sanitizeContent(content) {
  if (!content) return '';
  return DOMPurify.sanitize(content, sanitizerConfig);
}

/**
 * Cleans content when loading from database
 * @param {string} content - The content to clean
 * @returns {string} - Cleaned content
 */
export function cleanContent(content) {
  if (!content) return '';
  return content.trim();
}