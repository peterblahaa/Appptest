import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { categories, subCategories } from '../../data/mockData';
import styles from './Header.module.css';

import logo from '../../assets/hansman-logo.png';

export const Header = () => {
    const { cartCount } = useCart();
    const { user, isLoggedIn, stopImpersonating, isImpersonating } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    // Simple search logic
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const results = [];

        // Search main categories
        categories.forEach(cat => {
            if (cat.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push({ type: 'cat', name: cat.name, link: `/ponuka/${cat.id}` });
            }
        });

        // Search subcategories
        Object.keys(subCategories).forEach(catId => {
            subCategories[catId].forEach(sub => {
                if (sub.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push({ type: 'sub', name: sub.name, link: `/produkt/${sub.id}` }); // Assuming direct link to config for simplicity or subcat page
                }
            });
        });

        setSearchResults(results);
        setShowResults(true);
    }, [searchTerm]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            navigate(searchResults[0].link);
            setShowResults(false);
            setSearchTerm('');
        }
    };

    return (
        <>
            {isImpersonating && (
                <div style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '0.5rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <span>Práve nakupujete ako: {user?.name} ({user?.email})</span>
                    <button
                        onClick={() => {
                            stopImpersonating();
                            navigate('/admin');
                        }}
                        style={{
                            backgroundColor: 'white',
                            color: '#ef4444',
                            border: 'none',
                            padding: '0.2rem 0.8rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Späť do Adminu
                    </button>
                </div>
            )}
            <header className={styles.header}>
                <div className={`container ${styles.headerContainer}`}>
                    <Link to="/" className={styles.logo}>
                        <img src={logo} alt="Hansman Tlačiareň" style={{ height: '100px' }} />
                    </Link>

                    <div className={styles.searchBar}>
                        <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
                            <input
                                type="text"
                                name="search"
                                id="search-input"
                                placeholder="Hľadať produkt (napr. vizitky)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow click
                                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                            />
                            <button type="submit"><Search size={20} /></button>

                            {/* Autocomplete Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className={styles.searchResults}>
                                    {searchResults.map((res, idx) => (
                                        <Link
                                            key={idx}
                                            to={res.link}
                                            className={styles.searchResultItem}
                                            onClick={() => { setSearchTerm(''); setShowResults(false); }}
                                        >
                                            <Search size={14} style={{ marginRight: '8px', opacity: 0.5 }} />
                                            {res.name}
                                            <span style={{ fontSize: '0.7em', color: '#94a3b8', marginLeft: 'auto' }}>
                                                {res.type === 'cat' ? 'Kategória' : 'Produkt'}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </form>
                    </div>

                    <nav className={styles.nav}>
                        {isLoggedIn && user?.isAdmin && (
                            <Link to="/admin" className={styles.navLink} style={{ color: '#ef4444', fontWeight: 'bold' }}>Admin</Link>
                        )}
                        <Link to="/ponuka" className={styles.navLink}>Ponuka</Link>
                        <Link to="/konto" className={styles.navItem}>
                            <User size={24} color={isLoggedIn ? 'var(--primary-color)' : 'currentColor'} />
                            <span className={styles.navText}>
                                {isLoggedIn ? (user?.name?.split(' ')[0] || 'Účet') : 'Konto'}
                            </span>
                        </Link>
                        <Link to="/kosik" className={styles.cartBtn}>
                            <ShoppingCart size={24} />
                            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                            <span className={styles.cartText}>Košík</span>
                        </Link>
                    </nav>
                </div>
            </header>
        </>
    );
};
