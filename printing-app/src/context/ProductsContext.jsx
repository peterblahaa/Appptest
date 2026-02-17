import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const ProductsContext = createContext();

export const useProducts = () => {
    return useContext(ProductsContext);
};

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState({});
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                api.getProducts(),
                api.getCategories()
            ]);

            // Products Map
            const productsMap = {};
            productsData.forEach(p => {
                productsMap[p.id] = p;
            });
            setProducts(productsMap);

            // Categories
            const sortedCategories = categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0));
            setCategories(sortedCategories);
        } catch (err) {
            console.error("Failed to load data", err);
            setError("Nepodarilo sa načítať dáta.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refreshProducts = () => {
        fetchData();
    };

    const addCategory = async (catData) => {
        const newCat = await api.createCategory(catData);
        setCategories([...categories, newCat].sort((a, b) => (a.order || 0) - (b.order || 0)));
        return newCat;
    };

    const updateCategory = async (id, catData) => {
        const updated = await api.updateCategory(id, catData);
        setCategories(categories.map(c => c.id === id ? updated : c).sort((a, b) => (a.order || 0) - (b.order || 0)));
        return updated;
    };

    const deleteCategory = async (id) => {
        await api.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
    };

    const reorderCategories = async (newCategoriesOrder) => {
        // Optimize: Update local state immediately for UI responsiveness
        const updatedCategories = newCategoriesOrder.map((cat, index) => ({
            ...cat,
            order: index + 1
        }));
        setCategories(updatedCategories);

        // Persist to backend
        try {
            await Promise.all(updatedCategories.map(cat =>
                api.updateCategory(cat.id, { ...cat, order: cat.order })
            ));
        } catch (err) {
            console.error("Failed to reorder categories", err);
            // Optionally revert state or show error
            fetchData(); // Sync with server in case of error
        }
    };

    return (
        <ProductsContext.Provider value={{
            products,
            categories,
            loading,
            error,
            refreshProducts,
            addCategory,
            updateCategory,
            deleteCategory,
            reorderCategories
        }}>
            {children}
        </ProductsContext.Provider>
    );
};
