import DOMPurify from 'dompurify';

// Configure DOMPurify to allow specific HTML elements and attributes
const config = {
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

// Sanitize content before saving to database
export const sanitizeContent = (content) => {
  if (!content) return '';
  return DOMPurify.sanitize(content, config);
};

// Additional utility to clean content when loading from database
export const cleanContent = (content) => {
  if (!content) return '';
  return content.trim();
};