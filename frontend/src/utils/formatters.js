// Indian Currency Formatter (e.g. ₹1.85 Cr, ₹61.0 L, ₹4,80,000)
export const formatCurrencyShort = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num === 0) return '00';

  if (Math.abs(num) >= 10000000) {
    // Crores
    const cr = num / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (Math.abs(num) >= 100000) {
    // Lakhs
    const lakh = num / 100000;
    return `₹${lakh.toFixed(1).replace(/\.0$/, '')} L`;
  }
  return formatCurrencyINR(num);
};

export const formatCurrencyINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN');
};

export const formatDateDDMMYYYY = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateDisplay = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
