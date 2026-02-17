import React from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import styles from './ProductPage.module.css';

import { ConfigPanel } from '../components/configurator/ConfigPanel';
import { PriceTable } from '../components/configurator/PriceTable';
import { SummarySidebar } from '../components/configurator/SummarySidebar';
import { useProductConfigurator } from '../hooks/useProductConfigurator';

export const ProductPage = () => {
    const { id } = useParams();
    const { products, loading } = useProducts();
    const activeProductData = products[id];

    // Use Custom Hook for all logic
    const {
        product,
        selectedOptions,
        qty,
        shipping,
        priceNoVat,
        vat,
        priceVat,
        deliveryDate,
        setQty,
        setShipping,
        handleOptionChange,
        handleAddToCart
    } = useProductConfigurator(activeProductData);

    if (loading) return <div className="container" style={{ padding: '4rem' }}>Načítavam produkt...</div>;

    if (!activeProductData) {
        return <div className="container" style={{ padding: '4rem' }}>Produkt nenájdený.</div>;
    }

    if (!selectedOptions) return <div className="container">Načítavam konfigurátor...</div>;

    return (
        <div className={`container ${styles.pageContainer}`}>
            <div className={styles.layout}>
                {/* LEFT COLUMN - Image */}
                <div className={styles.imageSection}>
                    <img
                        src="https://placehold.co/600x600?text=Preview"
                        alt={product?.name || 'Produkt'}
                        className={styles.mainImage}
                    />
                    <a href="#" className={styles.filePrepLink}>
                        Ako pripraviť súbor? (PDF Návod)
                    </a>

                    {/* Upload Box Mock */}
                    <div style={{ marginTop: '1rem', border: '2px dashed #cbd5e1', padding: '1rem', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                        <p>Nahrajte súbory (PDF, AI, PSD)</p>
                        <small>max 100MB</small>
                    </div>
                </div>

                {/* CENTER COLUMN - Config */}
                <div className={styles.centerColumn}>
                    <ConfigPanel
                        product={activeProductData}
                        options={activeProductData.options}
                        selectedOptions={selectedOptions}
                        onChange={handleOptionChange}
                    />

                    <PriceTable
                        basePrice={activeProductData.basePrice}
                        currentQty={qty}
                        onSelectQty={setQty}
                        onSelectShipping={setShipping}
                        shippingAvailability={activeProductData.shipping}
                        currentShipping={shipping}
                    // priceModifier passed via context in hook, not needed here directly unless table needs it for display
                    />
                </div>

                {/* RIGHT COLUMN - Summary */}
                <SummarySidebar
                    qty={qty}
                    priceNoVat={priceNoVat.toFixed(2)}
                    vat={vat.toFixed(2)}
                    priceVat={priceVat.toFixed(2)}
                    deliveryDate={deliveryDate}
                    onAddToCart={handleAddToCart}
                />
            </div>
        </div>
    );
};
