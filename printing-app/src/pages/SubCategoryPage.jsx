import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { CategoryCard } from '../components/catalog/CategoryCard';
import { useProducts } from '../context/ProductsContext';
import styles from './SubCategoryPage.module.css';

export const SubCategoryPage = () => {
    const { category } = useParams();
    const { products, categories, loading } = useProducts();

    // Find current category info for title
    const parentCategory = categories.find(c => c.id === category);

    if (loading) {
        return <div className="container" style={{ padding: '2rem' }}>Načítavam produkty...</div>;
    }

    // Filter products by category
    const categoryProducts = Object.values(products).filter(p => p.categoryId === category && p.isVisible);

    if (!parentCategory) return <Navigate to="/ponuka" replace />;

    if (categoryProducts.length === 0) {
        return (
            <div className="container">
                <h1 style={{ margin: '2rem 0' }}>{parentCategory.name}</h1>
                <p>V tejto kategórii zatiaľ nie sú žiadne produkty.</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{ margin: '2rem 0', fontSize: '2rem' }}>{parentCategory?.name || 'Kategória'}</h1>
            <div className={styles.subCatGrid}>
                {categoryProducts.map((prod) => (
                    <CategoryCard
                        key={prod.id}
                        id={prod.id}
                        name={prod.name}
                        image={prod.image || `https://placehold.co/400x400/white/e2e8f0?text=${prod.name.replace(/ /g, '+')}`} // Fallback image logic
                        linkPrefix="/produkt"
                    />
                ))}
            </div>
        </div>
    );
};
