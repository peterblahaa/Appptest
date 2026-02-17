import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Check, ShieldCheck, Tag, LogOut, User } from 'lucide-react';
import { api } from '../services/api';
import styles from './AccountPage.module.css';

export const AccountPage = () => {
    const { user, isLoggedIn, login, register, logout, updateProfile, loading } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    // -- LOGGED IN VIEW STATE --
    const [view, setView] = useState('profile'); // 'profile' | 'orders'
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);

    // -- GUEST VIEW STATE --
    const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        agree: false,
        newsletter: false
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // -- PROFILE EDIT STATE --
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({});

    // -- EFFECTS --
    useEffect(() => {
        if (user) {
            setProfileData({ ...user });
        }
    }, [user]);

    useEffect(() => {
        if (isLoggedIn && user?.id && view === 'orders') {
            const fetchOrders = async () => {
                setOrdersLoading(true);
                setOrdersError(null);
                try {
                    const data = await api.getOrders(user.id);
                    // Client-side sort: newest first
                    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setOrders(sortedData);
                } catch (err) {
                    console.error("Failed to fetch orders:", err);
                    setOrdersError("Nepodarilo sa načítať objednávky viazané na váš účet.");
                } finally {
                    setOrdersLoading(false);
                }
            };
            fetchOrders();
        }
    }, [isLoggedIn, user, view]);

    // -- LOADING CHECK --
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Načítavam...</div>;
    }

    // -- HANDLERS --
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        clearMessages();
        setIsLoading(true);
        try {
            await login(formData.email, formData.password);
            if (cartCount > 0) {
                navigate('/checkout');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        clearMessages();

        if (formData.password !== formData.confirmPassword) {
            setError('Heslá sa nezhodujú.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Heslo musí mať aspoň 8 znakov.');
            return;
        }

        setIsLoading(true);
        try {
            await register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                phone: formData.phone,
                newsletter: formData.newsletter
            });
            if (cartCount > 0) {
                navigate('/checkout');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await updateProfile(profileData);
        setIsLoading(false);
        setIsEditing(false);
        setSuccess('Profil bol úspešne aktualizovaný.');
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };


    if (isLoggedIn) {
        return (
            <div className={styles.container}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Môj účet</h1>
                    <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                        <LogOut size={18} /> Odhlásiť sa
                    </button>
                </div>

                <div className={styles.tabs} style={{ justifyContent: 'flex-start', marginBottom: '2rem' }}>
                    <button
                        className={`${styles.tab} ${view === 'profile' ? styles.activeTab : ''}`}
                        onClick={() => setView('profile')}
                    >
                        Profil
                    </button>
                    <button
                        className={`${styles.tab} ${view === 'orders' ? styles.activeTab : ''}`}
                        onClick={() => setView('orders')}
                    >
                        História objednávok
                    </button>
                </div>

                <div className={styles.authGrid}>
                    <div className={styles.leftCol}>

                        {view === 'profile' && (
                            <div className={styles.profileSection}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3>Osobné údaje</h3>
                                    {!isEditing && <button onClick={() => setIsEditing(true)} style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Upraviť</button>}
                                </div>

                                {success && <div className={`${styles.notification} ${styles.success}`}>{success}</div>}

                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Meno a priezvisko</label>
                                            <input name="name" value={profileData.name || ''} onChange={handleProfileChange} className={styles.input} required />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>E-mail</label>
                                                <input name="email" value={profileData.email || ''} disabled className={styles.input} style={{ background: '#f1f5f9' }} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Telefón</label>
                                                <input name="phone" value={profileData.phone || ''} onChange={handleProfileChange} className={styles.input} />
                                            </div>
                                        </div>

                                        <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Fakturačná / Dodacia adresa</h4>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Ulica a číslo</label>
                                            <input name="street" value={profileData.street || ''} onChange={handleProfileChange} className={styles.input} placeholder="Napr. Hlavná 123" />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Mesto</label>
                                                <input name="city" value={profileData.city || ''} onChange={handleProfileChange} className={styles.input} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>PSČ</label>
                                                <input name="zip" value={profileData.zip || ''} onChange={handleProfileChange} className={styles.input} />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Názov firmy (voliteľné)</label>
                                            <input name="company" value={profileData.company || ''} onChange={handleProfileChange} className={styles.input} />
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                            <button type="button" onClick={() => { setIsEditing(false); setProfileData({ ...user }); }} className="btn btn-outline">Zrušiť</button>
                                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                                {isLoading ? 'Ukladám...' : 'Uložiť zmeny'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className={styles.infoList}>
                                        <p><strong>Meno:</strong> {user.name}</p>
                                        <p><strong>E-mail:</strong> {user.email}</p>
                                        <p><strong>Telefón:</strong> {user.phone || '-'}</p>
                                        <hr style={{ margin: '1rem 0', borderColor: '#eee' }} />
                                        <p><strong>Adresa:</strong> {user.street ? `${user.street}, ${user.zip} ${user.city}` : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nezadaná</span>}</p>
                                        {user.company && <p><strong>Firma:</strong> {user.company}</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {view === 'orders' && (
                            <div className={styles.profileSection}>
                                <h3>Moje objednávky</h3>

                                {ordersLoading ? (
                                    <p style={{ color: '#64748b', marginTop: '1rem' }}>Načítavam objednávky...</p>
                                ) : ordersError ? (
                                    <div className={`${styles.notification} ${styles.error}`}>{ordersError}</div>
                                ) : orders.length === 0 ? (
                                    <p style={{ color: '#64748b', marginTop: '1rem' }}>Zatiaľ nemáte žiadne objednávky.</p>
                                ) : (
                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {orders.map(order => (
                                            <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <strong>Objednávka #{order.id}</strong>
                                                    <span style={{ color: '#64748b' }}>{new Date(order.date).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <span className={`${styles.statusBadge} ${order.status === 'new' ? styles.statusNew :
                                                            order.status === 'processing' ? styles.statusProcessing :
                                                                order.status === 'shipped' ? styles.statusShipped :
                                                                    order.status === 'completed' ? styles.statusCompleted :
                                                                        order.status === 'cancelled' ? styles.statusCancelled : ''
                                                        }`}>
                                                        {
                                                            order.status === 'new' ? 'Nová' :
                                                                order.status === 'processing' ? 'Spracováva sa' :
                                                                    order.status === 'shipped' ? 'Odoslaná' :
                                                                        order.status === 'completed' ? 'Dokončená' :
                                                                            order.status === 'cancelled' ? 'Zrušená' : order.status
                                                        }
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.9rem' }}>
                                                    {order.items.map((item, i) => (
                                                        <div key={i}>{item.qty}x {item.name}</div>
                                                    ))}
                                                </div>
                                                <div style={{ marginTop: '0.5rem', fontWeight: 600, textAlign: 'right' }}>
                                                    Celkom: {order.total.toFixed(2)} €
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    <div className={styles.rightCol}>
                        <div className={styles.infoBox}>
                            <h3>Rýchle odkazy</h3>
                            <Link to="/ponuka" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                                Nová objednávka
                            </Link>
                            {cartCount > 0 && (
                                <Link to="/checkout" className="btn btn-outline" style={{ width: '100%' }}>
                                    Pokračovať v košíku ({cartCount})
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -- GUEST VIEW (LOGIN/REGISTER) --
    return (
        <div className={styles.container}>
            <div className={styles.authGrid}>

                {/* Left Column: Forms */}
                <div className={styles.leftCol}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
                            onClick={() => { setActiveTab('login'); clearMessages(); }}
                        >
                            Prihlásenie
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'register' ? styles.activeTab : ''}`}
                            onClick={() => { setActiveTab('register'); clearMessages(); }}
                        >
                            Registrácia
                        </button>
                    </div>

                    {error && <div className={`${styles.notification} ${styles.error}`}>{error}</div>}

                    {activeTab === 'login' ? (
                        <form onSubmit={handleLogin}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="login-email">E-mail</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="login-password">Heslo</label>
                                <input
                                    id="login-password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div className={styles.checkboxGroup} style={{ marginBottom: 0 }}>
                                    <input type="checkbox" id="remember" />
                                    <label htmlFor="remember" style={{ fontSize: '0.9rem' }}>Zapamätať si ma</label>
                                </div>
                                <a href="#" className={styles.forgotPassword} onClick={(e) => { e.preventDefault(); alert('Link na obnovu hesla bol odoslaný (mock).'); }}>
                                    Zabudli ste heslo?
                                </a>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                                {isLoading ? 'Prihlasujem...' : 'Prihlásiť sa'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Meno a priezvisko</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} required />
                            </div>
                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>E-mail</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.input} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Telefón</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.input} required />
                                </div>
                            </div>
                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Heslo (min. 8 znakov)</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className={styles.input} required minLength={8} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Potvrdiť heslo</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={styles.input} required />
                                </div>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input type="checkbox" name="agree" id="agree" checked={formData.agree} onChange={handleChange} required />
                                <label htmlFor="agree" style={{ fontSize: '0.9rem' }}>Súhlasím so spracovaním osobných údajov *</label>
                            </div>
                            <div className={styles.checkboxGroup}>
                                <input type="checkbox" name="newsletter" id="newsletter" checked={formData.newsletter} onChange={handleChange} />
                                <label htmlFor="newsletter" style={{ fontSize: '0.9rem' }}>Chcem dostávať novinky a akcie</label>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                                {isLoading ? 'Vytváram účet...' : 'Vytvoriť účet'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Right Column: Benefits */}
                <div className={styles.rightCol}>
                    <div className={styles.infoBox}>
                        <h3>Prečo mať účet?</h3>
                        <ul className={styles.infoList}>
                            <li><ShieldCheck size={20} color="var(--primary-color)" /> Bezpečná objednávka</li>
                            <li><Tag size={20} color="var(--primary-color)" /> Prehľad objednávok</li>
                            <li><Check size={20} color="var(--primary-color)" /> Rýchlejší nákup</li>
                        </ul>
                        {cartCount > 0 && (
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                                <p style={{ color: '#065f46', marginBottom: '0.5rem', fontWeight: 600 }}>Máte {cartCount} položiek v košíku</p>
                                <Link to="/checkout" className="btn btn-outline" style={{ width: '100%', fontSize: '0.9rem' }}>
                                    Pokračovať bez registrácie
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
