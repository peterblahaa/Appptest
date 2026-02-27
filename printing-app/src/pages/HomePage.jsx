import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { api } from '../services/api';
import { CategoryCard } from '../components/catalog/CategoryCard';
import { CheckCircle, Truck, FileCheck, Search, ArrowRight } from 'lucide-react';
import styles from './HomePage.module.css';

// Featured categories IDs
const FEATURED_IDS = ['vizitky', 'letaky', 'plagty', 'katalogy', 'krabice-a-obaly', 'postove-krabice'];

export const HomePage = () => {
    const { cartCount } = useCart();
    const { categories } = useProducts();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Contact Form State
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactStatus, setContactStatus] = useState(null);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactStatus('loading');
        try {
            await api.createMessage(contactForm);
            setContactStatus('success');
            setContactForm({ name: '', email: '', message: '' });
            setTimeout(() => setContactStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setContactStatus('error');
            setTimeout(() => setContactStatus(null), 3000);
        }
    };

    // Sort them to match specific order if needed, otherwise filter preserves original order logic roughly
    // Let's ensure order matches request: Vizitky, Letáky, Plagáty, Katalógy, Krabice a obaly, Bannery
    const sortedFeatured = FEATURED_IDS.map(id => categories.find(c => c.id === id)).filter(Boolean);

    return (
        <div>
            {/* Search Overlay or Autocomplete could go here or in Header, specifically requested "Functionality: Search" */}

            {/* 1. Hero Section */}
            <section className={styles.heroSection}>
                <div className="container">
                    <h1 className={styles.heroTitle}>Tlač a obaly na mieru – jednoducho a rýchlo</h1>
                    <p className={styles.heroSubtitle}>
                        Vyberte si produkt &rarr; Nakonfigurujte parametre &rarr; Zistite cenu &rarr; Objednajte
                    </p>

                    <div className={styles.heroButtons}>
                        <Link to="/ponuka" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>
                            Prejsť na ponuku
                        </Link>
                        <Link to="/ponuka/vizitky" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>
                            Začať s vizitkami
                        </Link>
                    </div>

                    <div className={styles.benefits}>
                        <div className={styles.benefitItem}>
                            <CheckCircle size={20} color="var(--success-color)" />
                            <span>Ceny okamžite online</span>
                        </div>
                        <div className={styles.benefitItem}>
                            <FileCheck size={20} color="var(--primary-color)" />
                            <span>Automatická kontrola súborov</span>
                        </div>
                        <div className={styles.benefitItem}>
                            <Truck size={20} color="var(--warning-color)" />
                            <span>Rýchle dodanie (od 2 dní)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cart Notification Bar if Cart has items */}
            {cartCount > 0 && (
                <div style={{ background: '#ecfdf5', borderBottom: '1px solid #d1fae5', padding: '0.5rem', textAlign: 'center', color: '#065f46' }}>
                    Máte <strong>{cartCount}</strong> položky v košíku. <Link to="/kosik" style={{ textDecoration: 'underline' }}>Dokončiť objednávku</Link>
                </div>
            )}

            {/* 2. Most Frequent */}
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Najčastejšie objednávané</h2>
                    {/* Reusing the responsive grid from OfferPage/SubCategoryPage logic */}
                    {/* 6 desktop / 3 tablet / 2 mobile, using custom class for tighter fit */}
                    <div className={styles.featuredGrid}>
                        {sortedFeatured.map(cat => (
                            <CategoryCard key={cat.id} {...cat} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. How it Works */}
            <section className={styles.section} style={{ background: 'var(--bg-color)' }}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Ako to funguje?</h2>
                    <div className={styles.stepsGrid}>
                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>1</div>
                            <h3>Vyberte produkt</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Zvoľte si z našej širokej ponuky tlačovín a obalov.</p>
                        </div>
                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>2</div>
                            <h3>Nakonfigurujte</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Zvoľte papier, rozmery, náklad a povrchovú úpravu.</p>
                        </div>
                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>3</div>
                            <h3>Objednajte</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Nahrajte tlačové dáta a my sa postaráme o zvyšok.</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link to="/ponuka" className="btn btn-primary">
                            Vyskúšať konfigurátor <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. Promo Banner */}
            <div className="container">
                <div className={styles.promoBanner}>
                    <h2 className={styles.promoTitle}>DOPRAVA ZADARMO</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Expresné dodanie už od 2 pracovných dní pre celú SR.</p>
                </div>
            </div>

            {/* 5. Inspiration (Mock) */}
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Inšpirácia & Šablóny</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '1.5rem' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', height: '200px', background: '#e2e8f0', position: 'relative' }}>
                                <img src={`https://placehold.co/400x300?text=Inspiracia+${i}`} alt="Template" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                                    Vzorový dizajn #{i}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Contact Form */}
            <section className={styles.section} style={{ background: 'var(--bg-color)' }}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Máte otázky? Napíšte nám</h2>
                    <form className={styles.contactForm} onSubmit={handleContactSubmit}>
                        <div className={styles.formGrid}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Meno"
                                    required
                                    className={styles.textarea}
                                    style={{ minHeight: 'auto', height: '45px' }}
                                    value={contactForm.name}
                                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                />
                                <input
                                    type="email"
                                    placeholder="E-mail"
                                    required
                                    className={styles.textarea}
                                    style={{ minHeight: 'auto', height: '45px' }}
                                    value={contactForm.email}
                                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                />
                            </div>
                            <textarea
                                placeholder="Vaša správa..."
                                required
                                className={styles.textarea}
                                value={contactForm.message}
                                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                            ></textarea>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={contactStatus === 'loading'}>
                                {contactStatus === 'loading' ? 'Odosielam...' : contactStatus === 'success' ? 'Odoslané!' : contactStatus === 'error' ? 'Chyba, skúste znova' : 'Odoslať správu'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};
