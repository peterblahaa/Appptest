import React from 'react';
import { useProducts } from '../context/ProductsContext';
import { CategoryCard } from '../components/catalog/CategoryCard';

import styles from './OfferPage.module.css';

export const OfferPage = () => {
    const { categories, loading } = useProducts();

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Načítavam ponuku...</div>;

    return (
        <div className="container">
            <h1 className={styles.title}>Naša ponuka</h1>
            <div className={styles.offerGrid}>
                {categories.map((cat) => (
                    <CategoryCard
                        key={cat.id}
                        {...cat}
                    />
                ))}
            </div>
        </div>
    );
};
