export const money = (minor) => '৳' + (minor / 100).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const statusLabel = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
