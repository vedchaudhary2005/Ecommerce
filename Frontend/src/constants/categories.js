// Fashion e-commerce categories - Single source of truth
// Used across AdminDashboard and Collections page

export const FASHION_CATEGORIES = [
  'Jewellery',
  'Sarees', 
  'Suits',
  'Accessories'
];

export const ALL_CATEGORIES = [
  'All Categories',
  ...FASHION_CATEGORIES
];

// Category validation helper
export const isValidCategory = (category) => {
  return FASHION_CATEGORIES.includes(category);
};

// Get category display name
export const getCategoryDisplayName = (category) => {
  return category;
};