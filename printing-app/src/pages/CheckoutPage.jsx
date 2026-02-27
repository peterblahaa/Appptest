import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import styles from './CheckoutPage.module.css';

export const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        street: user?.street || '',
        city: user?.city || '',
        zip: user?.zip || '',
        payment: 'card'
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                street: user.street || '',
                city: user.city || '',
                zip: user.zip || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.street) {
            alert('Prosím, vyplňte povinné údaje.');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData = {
                customer: formData,
                items: cartItems,
                total: cartTotal,
                status: 'new',
                userId: user ? user.id : null
            };

            await api.createOrder(orderData);

            alert('Objednávka bola úspešne odoslaná a uložená! Ďakujeme.');
            clearCart();
            navigate('/ponuka');
        } catch (error) {
            console.error(error);
            alert('Chyba pri odosielaní objednávky: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <h2>Košík je prázdny</h2>
        </div>
    );

    return (
        <div className={`container ${styles.checkoutContainer}`}>
            <h1 style={{ marginBottom: '2rem' }}>Pokladňa</h1>

            <form className={styles.layout} onSubmit={handleSubmit}>
                {/* Left Column - Forms */}
                <div>
                    {/* Contact Info */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>1. Kontaktné údaje</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup + ' ' + styles.fullWidth}>
                                <label>Meno a Priezvisko *</label>
                                <input className={styles.input} name="name" value={formData.name} required onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>E-mail *</label>
                                <input className={styles.input} type="email" name="email" value={formData.email} required onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Telefón</label>
                                <input className={styles.input} type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>2. Fakturačná a dodacia adresa</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup + ' ' + styles.fullWidth}>
                                <label>Ulica a číslo *</label>
                                <input className={styles.input} name="street" value={formData.street} required onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mesto *</label>
                                <input className={styles.input} name="city" value={formData.city} required onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>PSČ *</label>
                                <input className={styles.input} name="zip" value={formData.zip} required onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>3. Spôsob platby</h2>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input type="radio" name="payment" value="card" defaultChecked onChange={handleChange} />
                                <span>Platobná karta (Stripe/GoPay)</span>
                            </label>
                            <label className={styles.radioLabel}>
                                <input type="radio" name="payment" value="transfer" onChange={handleChange} />
                                <span>Bankový prevod (vopred)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className={styles.summaryPanel}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Zhrnutie objednávky</h3>

                    <div style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {cartItems.map(item => (
                            <div key={item.cartId} className={styles.summaryItem}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.qty} ks</div>
                                </div>
                                <div style={{ fontWeight: 600 }}>
                                    {item.totalPriceVat.toFixed(2)} €
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                        <div className={styles.summaryItem}>
                            <span>Doprava</span>
                            <span style={{ color: '#10b981' }}>Zadarmo</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Spolu k úhrade</span>
                            <span>{cartTotal.toFixed(2)} €</span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>vrátane DPH</div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Objednať s povinnosťou platby
                    </button>

                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Odoslaním súhlasíte s obchodnými podmienkami.
                    </div>
                </div>

            </form>
        </div>
    );
};
