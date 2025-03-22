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