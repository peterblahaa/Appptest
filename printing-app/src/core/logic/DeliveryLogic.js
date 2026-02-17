/**
 * Calculates the expected delivery date based on shipping method.
 * 
 * @param {string} shippingMode - 'eco', 'standard', or 'express'.
 * @returns {string} Formatted date string (DD.MM.YYYY).
 */
export const getDeliveryDate = (shippingMode) => {
    const days = shippingMode === 'express' ? 2 : shippingMode === 'eco' ? 7 : 4;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
