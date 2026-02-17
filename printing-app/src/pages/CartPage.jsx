import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2 } from 'lucide-react';
import styles from './CartPage.module.css';

export const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Váš košík je prázdny</h2>
                <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>Vyberte si niečo z našej ponuky.</p>
                <Link to="/ponuka" className="btn btn-primary">Prejsť do ponuky</Link>
            </div>
        );
    }

    return (
        <div className={`container ${styles.cartContainer}`}>
            <h1 style={{ marginBottom: '2rem' }}>Nákupný košík</h1>

            <div className={styles.cartGrid}>
                {/* Items List */}
                <div className={styles.cartList}>
                    {cartItems.map((item) => (
                        <div key={item.cartId} className={styles.cartItem}>
                            <img
                                src="https://placehold.co/100x100?text=Item"
                                alt={item.name}
                                className={styles.itemImage}
                            />

                            <div className={styles.itemContent}>
                                <div className={styles.itemHeader}>
                                    <div>
                                        <div className={styles.itemTitle}>{item.name}</div>
                                        <div className={styles.itemOptions}>
                                            {Object.entries(item.selectedOptions).map(([key, value]) => {
                                                // Skip showing objects/IDs if possible, just basics for demo
                                                if (typeof value === 'object') return null;
                                                if (key === 'fileCheck' && value === 'auto') return null;
                                                return (
                                                    <span key={key} className={styles.optionTag}>
                                                        {key}: {value}
                                                    </span>
                                                );
                                            })}
                                            <span className={styles.optionTag}>Doprava: {item.shipping}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.cartId)} className={styles.removeBtn}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className={styles.itemFooter}>
                                    <div className={styles.quantityControl}>
                                        <label>Ks:</label>
                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => updateQuantity(item.cartId, parseInt(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                    <div className={styles.itemPrice}>
                                        {item.totalPriceVat.toFixed(2)} €
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className={styles.summaryCard}>
                    <h3>Zhrnutie objednávky</h3>
                    <div style={{ margin: '1.5rem 0' }}>
                        <div className={styles.summaryRow}>
                            <span>Medzisúčet (s DPH)</span>
                            <span>{cartTotal.toFixed(2)} €</span>
                        </div>
                        <div className={styles.summaryRow + ' ' + styles.totalRow}>
                            <span>Celkom k úhrade</span>
                            <span>{cartTotal.toFixed(2)} €</span>
                        </div>
                    </div>

                    <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                        Pokračovať k objednávke
                    </Link>
                    <Link to="/ponuka" className="btn btn-outline" style={{ width: '100%', textAlign: 'center', marginTop: '1rem' }}>
                        Späť do obchodu
                    </Link>
                </div>
            </div>
        </div>
    );
};
