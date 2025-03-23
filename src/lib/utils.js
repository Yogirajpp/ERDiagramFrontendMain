import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes without conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to a readable string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a random color
 */
export function getRandomColor() {
  const colors = [
    'bg-blue-100 border-blue-300 text-blue-800',
    'bg-green-100 border-green-300 text-green-800',
    'bg-purple-100 border-purple-300 text-purple-800',
    'bg-yellow-100 border-yellow-300 text-yellow-800',
    'bg-red-100 border-red-300 text-red-800',
    'bg-indigo-100 border-indigo-300 text-indigo-800',
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Check if an object is empty
 */
export function isEmptyObject(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Create a debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Download data as a file
 */
export function downloadFile(data, filename, type = 'text/plain') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Calculate the position for a new entity on the canvas
 */
export function calculateNodePosition(existingNodes) {
  // Default position if no nodes exist
  if (!existingNodes || existingNodes.length === 0) {
    return { x: 250, y: 150 };
  }
  
  // Find the rightmost node
  let maxX = 0;
  let correspondingY = 150;
  
  existingNodes.forEach(node => {
    if (node.position.x > maxX) {
      maxX = node.position.x;
      correspondingY = node.position.y;
    }
  });
  
  // Place the new node to the right of the rightmost node
  return { x: maxX + 300, y: correspondingY };
}


/**
 * Format date as relative time from now (e.g., "2 days ago")
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.addSuffix - Whether to add a suffix
 * @param {boolean} options.includeSeconds - Whether to include seconds
 * @returns {string} Formatted relative time string
 */
export function formatDistanceToNow(date, options = {}) {
  const now = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const seconds = Math.floor((now - dateObj) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  // Default options
  const { addSuffix = true, includeSeconds = false } = options;
  
  let result;
  
  if (years > 0) {
    result = years === 1 ? '1 year' : `${years} years`;
  } else if (months > 0) {
    result = months === 1 ? '1 month' : `${months} months`;
  } else if (days > 0) {
    result = days === 1 ? '1 day' : `${days} days`;
  } else if (hours > 0) {
    result = hours === 1 ? '1 hour' : `${hours} hours`;
  } else if (minutes > 0) {
    result = minutes === 1 ? '1 minute' : `${minutes} minutes`;
  } else if (includeSeconds && seconds > 0) {
    result = seconds === 1 ? '1 second' : `${seconds} seconds`;
  } else {
    result = 'just now';
    return result; // No suffix needed for "just now"
  }
  
  // Add suffix like "ago" if specified
  if (addSuffix) {
    result += ' ago';
  }
  
  return result;
}

/**
 * Alternative approach using built-in Intl.RelativeTimeFormat
 * This has better internationalization support but requires extra logic for time unit selection
 */
export function formatRelativeTime(date, options = { locale: 'en' }) {
  const now = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const formatter = new Intl.RelativeTimeFormat(options.locale, { 
    numeric: 'auto',
    style: options.style || 'long'
  });
  
  const seconds = Math.floor((dateObj - now) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (Math.abs(years) >= 1) {
    return formatter.format(years, 'year');
  } else if (Math.abs(months) >= 1) {
    return formatter.format(months, 'month');
  } else if (Math.abs(days) >= 1) {
    return formatter.format(days, 'day');
  } else if (Math.abs(hours) >= 1) {
    return formatter.format(hours, 'hour');
  } else if (Math.abs(minutes) >= 1) {
    return formatter.format(minutes, 'minute');
  } else {
    return formatter.format(seconds, 'second');
  }
}