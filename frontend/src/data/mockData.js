// Categories matching alexa-skill/skill-package/interactionModels/custom/en-US.json
export const CATEGORIES = [
  { id: 'FOOD',          label: 'Food',          color: '#f59e0b', icon: '🍽️' },
  { id: 'GROCERY',       label: 'Grocery',       color: '#10b981', icon: '🛒' },
  { id: 'FUEL',          label: 'Fuel',          color: '#ef4444', icon: '⛽' },
  { id: 'SHOPPING',      label: 'Shopping',      color: '#8b5cf6', icon: '🛍️' },
  { id: 'RENT',          label: 'Rent',          color: '#6366f1', icon: '🏠' },
  { id: 'BILLS',         label: 'Bills',         color: '#0ea5e9', icon: '📄' },
  { id: 'TRAVEL',        label: 'Travel',        color: '#f97316', icon: '✈️' },
  { id: 'ENTERTAINMENT', label: 'Entertainment', color: '#ec4899', icon: '🎬' },
  { id: 'HEALTH',        label: 'Health',        color: '#14b8a6', icon: '💊' },
  { id: 'SUBSCRIPTION',  label: 'Subscription',  color: '#a78bfa', icon: '📱' },
  { id: 'MISC',          label: 'Misc',          color: '#94a3b8', icon: '📦' },
];

export const categoryMap = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const DEFAULT_BUDGETS = {
  FOOD: 5000, GROCERY: 4000, FUEL: 1500, SHOPPING: 2000,
  RENT: 8000, BILLS: 2000, TRAVEL: 1000, ENTERTAINMENT: 1000,
  HEALTH: 1000, SUBSCRIPTION: 700, MISC: 500,
};
