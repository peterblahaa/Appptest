import React, { useState } from 'react';
import styles from './PriceTable.module.css'; // New discrete styles for table
import { priceTableQuantities } from '../../data/mockData';

export const PriceTable = ({
    basePrice,
    currentQty,
    onSelectQty,
    onSelectShipping,
    shippingAvailability,
    currentShipping,
    priceModifier = 0 // New prop
}) => {
    const [customQty, setCustomQty] = useState('');

    // Helper to calculate price for a cell
    const calculateCellPrice = (qty, shippingMode) => {
        let multiplier = 1.0;
        if (shippingMode === 'eco') multiplier = 0.95;
        if (shippingMode === 'express') multiplier = 1.25;

        // Apply customer price modifier
        if (priceModifier !== 0) {
            multiplier *= (1 + priceModifier / 100);
        }

        // Simplified calc for table display - just base * shipping * qty
        return (basePrice * multiplier * qty).toFixed(2) + ' €';
    };

    return (
        <div className={styles.tableContainer}>
            <div className={styles.customInput}>
                <label>Zadajte svoj vlastný náklad (min 11ks)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="number"
                        min="11"
                        placeholder="123"
                        value={customQty}
                        onChange={(e) => setCustomQty(e.target.value)}
                    />
                    <button onClick={() => onSelectQty(Number(customQty))} className="btn btn-primary">+</button>
                </div>
            </div>

            <table className={styles.priceTable}>
                <thead>
                    <tr>
                        <th>Množstvo</th>
                        <th onClick={() => onSelectShipping('eco')} className={currentShipping === 'eco' ? styles.activeHead : ''}>
                            Ekonomická <br /> <small>+7 dní</small>
                        </th>
                        <th onClick={() => onSelectShipping('standard')} className={currentShipping === 'standard' ? styles.activeHead : ''}>
                            Štandardná <br /> <small>+4 dni</small>
                        </th>
                        <th onClick={() => onSelectShipping('express')} className={currentShipping === 'express' ? styles.activeHead : ''}>
                            Expresná <br /> <small>+2 dni</small>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {priceTableQuantities.map(qty => (
                        <tr key={qty} className={currentQty === qty ? styles.activeRow : ''}>
                            <td onClick={() => onSelectQty(qty)}>{qty} ks</td>

                            <td
                                className={currentShipping === 'eco' && currentQty === qty ? styles.selectedCell : ''}
                                onClick={() => { onSelectQty(qty); onSelectShipping('eco'); }}
                            >
                                {shippingAvailability.eco ? calculateCellPrice(qty, 'eco') : '—'}
                            </td>

                            <td
                                className={currentShipping === 'standard' && currentQty === qty ? styles.selectedCell : ''}
                                onClick={() => { onSelectQty(qty); onSelectShipping('standard'); }}
                            >
                                {shippingAvailability.standard ? calculateCellPrice(qty, 'standard') : '—'}
                            </td>

                            <td
                                className={currentShipping === 'express' && currentQty === qty ? styles.selectedCell : ''}
                                onClick={() => { onSelectQty(qty); onSelectShipping('express'); }}
                            >
                                {shippingAvailability.express ? calculateCellPrice(qty, 'express') : '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
