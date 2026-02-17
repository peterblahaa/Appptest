import { useState, useEffect } from 'react';
import { calculatePrice } from '../core/logic/PricingEngine';
import { getDeliveryDate } from '../core/logic/DeliveryLogic';
import { Product } from '../core/models/Product';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const useProductConfigurator = (productData) => {
    const { addToCart } = useCart();
    const { user } = useAuth();

    // Core State
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(100);
    const [shipping, setShipping] = useState('standard');
    const [selectedOptions, setSelectedOptions] = useState(null);

    // Derived State
    const [priceData, setPriceData] = useState({
        priceNoVat: 0,
        vat: 0,
        priceVat: 0,
        fee: 0
    });
    const [deliveryDate, setDeliveryDate] = useState('');

    // Initialize
    useEffect(() => {
        if (productData) {
            const prod = new Product(productData);
            setProduct(prod);
            setSelectedOptions(prod.getDefaultOptions());
        }
    }, [productData]);

    // Recalculate Logic
    useEffect(() => {
        if (!product || !selectedOptions) return;

        const prices = calculatePrice(product, qty, selectedOptions, shipping, user);
        setPriceData(prices);

        const date = getDeliveryDate(shipping);
        setDeliveryDate(date);

    }, [product, qty, selectedOptions, shipping, user]);

    // Actions
    const handleOptionChange = (key, value) => {
        setSelectedOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleAddToCart = () => {
        if (!product) return;

        addToCart({
            id: product.id,
            name: product.name,
            qty,
            selectedOptions,
            shipping,
            totalPriceVat: priceData.priceVat,
            deliveryDate
        });
        alert('Produkt pridaný do košíka!');
    };

    return {
        // State
        product,
        selectedOptions,
        qty,
        shipping,

        // Calculations
        priceNoVat: priceData.priceNoVat,
        vat: priceData.vat,
        priceVat: priceData.priceVat,
        deliveryDate,

        // Actions
        setQty,
        setShipping,
        handleOptionChange,
        handleAddToCart
    };
};
