// utils/priceFormatter.js
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '0';
  
  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if it's a valid number
  if (isNaN(numPrice)) return '0';
  
  // Format the price according to Indian numbering system
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(numPrice);
};