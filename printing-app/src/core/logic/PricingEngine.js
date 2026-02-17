/**
 * Calculates the total price for a product configuration.
 * 
 * @param {Object} product - The product object containing basePrice and options.
 * @param {number} quantity - Chosen quantity.
 * @param {Object} selectedOptions - Dictionary of selected option IDs.
 * @param {string} shippingMode - 'eco', 'standard', or 'express'.
 * @param {Object} user - User object for price modifiers (optional).
 * 
 * @returns {Object} { priceNoVat, vat, priceVat, fee }
 */
export const calculatePrice = (product, quantity, selectedOptions, shippingMode, user = null) => {
    if (!product || !selectedOptions) {
        return { priceNoVat: 0, vat: 0, priceVat: 0, fee: 0 };
    }

    let base = product.basePrice;

    // 1. Quantity Multiplier (linear for mock, usually logarithmic)
    // No change to base, just Total = Base * Qty

    // 2. Options Multipliers
    let optionsModifier = 1.0;
    const options = product.options;

    // Finish
    if (selectedOptions.surfaceFinish && options.surfaceFinish) {
        const finishOpt = options.surfaceFinish.find(o => o.id === selectedOptions.surfaceFinish);
        if (finishOpt) optionsModifier += finishOpt.priceMod;
    }

    // UV
    if (selectedOptions.uvLack && options.uvLack) {
        const uvOpt = options.uvLack.find(o => o.id === selectedOptions.uvLack);
        if (uvOpt) optionsModifier += uvOpt.priceMod;
    }

    // Foil
    if (selectedOptions.colorFoil && options.colorFoil) {
        const foilOpt = options.colorFoil.find(o => o.id === selectedOptions.colorFoil);
        if (foilOpt) optionsModifier += foilOpt.priceMod;
    }

    let unitPrice = base * optionsModifier;

    // 3. Shipping Multiplier
    if (shippingMode === 'eco') unitPrice *= 0.95;
    if (shippingMode === 'express') unitPrice *= 1.25;

    // Total
    let totalNoVat = unitPrice * quantity;

    // Apply Customer Price Modifier
    if (user && user.priceModifier) {
        const modifier = Number(user.priceModifier);
        if (!isNaN(modifier) && modifier !== 0) {
            totalNoVat = totalNoVat * (1 + modifier / 100);
        }
    }

    // File Check Fee (Fixed)
    let fee = 0;
    if (selectedOptions.fileCheck && options.fileCheck) {
        const checkOpt = options.fileCheck.find(o => o.id === selectedOptions.fileCheck);
        fee = checkOpt ? checkOpt.price : 0;
    }

    totalNoVat += fee;

    const vat = totalNoVat * 0.23;
    const totalVat = totalNoVat + vat;

    return {
        priceNoVat: Number(totalNoVat.toFixed(2)),
        vat: Number(vat.toFixed(2)),
        priceVat: Number(totalVat.toFixed(2)),
        fee
    };
};
