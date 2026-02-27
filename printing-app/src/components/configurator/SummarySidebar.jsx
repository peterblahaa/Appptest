import React from 'react';
import styles from '../../pages/ProductPage.module.css';

export const SummarySidebar = ({
    qty,
    priceNoVat,
    vat,
    priceVat,
    deliveryDate,
    onAddToCart
}) => {
    return (
        <div className={styles.summarySidebar}>
            <div className={styles.summaryHeader}>
                DOPRAVA ZADARMO
            </div>

            <div className={styles.summaryContent}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Dodanie: {deliveryDate}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success-color)' }}>
                        Objednať nasledujúci pracovný deň do 16:00
                    </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong>Podmienkou zásielky je:</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                        <li>pridanie súborov do 15:30</li>
                        <li>prijatie náhľadov do 16:00</li>
                        <li>zaplatenie objednávky do 16:00</li>
                    </ul>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div className={styles.summaryRow}>
                        <span>Množstvo</span>
                        <span>{qty} ks</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Cena bez DPH</span>
                        <span>{priceNoVat} €</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>DPH (23%)</span>
                        <span>{vat} €</span>
                    </div>
                    <div className={styles.summaryRow + ' ' + styles.total}>
                        <span>Spolu</span>
                        <span>{priceVat} €</span>
                    </div>
                    <div className={styles.priceVat}>verátane DPH</div>

                    <div className={styles.availability} style={{ margin: '1rem 0' }}>
                        <span className={styles.dot}></span>
                        Produkt: dostupný
                    </div>

                    <div className={styles.actionButtons}>
                        <button className={styles.ctaSecondary}>Objednať</button>
                        <button className={styles.ctaPrimary} onClick={onAddToCart}>Pridať</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
