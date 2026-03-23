import React, { useState } from 'react';
import { Camera, Layers, Filter } from 'lucide-react';
import styles from './HomePage.module.css'; // Reusing some base styles if possible, else inline/custom

const GALLERY_CATEGORIES = ['Všetko', 'Vizitky', 'Letáky', 'Katalógy', 'Obaly', 'Bannery'];

const MOCK_GALLERY = [
    { id: 1, title: 'Luxusné vizitky so zlatou razbou', category: 'Vizitky', image: 'https://placehold.co/600x400/1e293b/ffffff?text=Zlata+Razba', size: 'small' },
    { id: 2, title: 'Produktový leták A4', category: 'Letáky', image: 'https://placehold.co/400x600/334155/ffffff?text=Letak+A4', size: 'tall' },
    { id: 3, title: 'Krabica na víno', category: 'Obaly', image: 'https://placehold.co/800x600/0f172a/ffffff?text=Krabica+na+vino', size: 'large' },
    { id: 4, title: 'Trendy firemné vizitky', category: 'Vizitky', image: 'https://placehold.co/600x400/475569/ffffff?text=Firemne+Vizitky', size: 'small' },
    { id: 5, title: 'Katalóg jar/leto', category: 'Katalógy', image: 'https://placehold.co/800x800/1e293b/ffffff?text=Katalog', size: 'large' },
    { id: 6, title: 'Roll-up banner na event', category: 'Bannery', image: 'https://placehold.co/400x800/64748b/ffffff?text=Roll+Up', size: 'tall' },
    { id: 7, title: 'Potlač poštovej krabice', category: 'Obaly', image: 'https://placehold.co/600x600/334155/ffffff?text=Postova+Krabica', size: 'small' },
    { id: 8, title: 'Plagát A2 kampaň', category: 'Letáky', image: 'https://placehold.co/600x800/0f172a/ffffff?text=Plagat+A2', size: 'tall' }
];

export const GalleryPage = () => {
    const [activeCategory, setActiveCategory] = useState('Všetko');

    const filteredGallery = activeCategory === 'Všetko'
        ? MOCK_GALLERY
        : MOCK_GALLERY.filter(item => item.category === activeCategory);

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Header Section */}
            <section style={{
                background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--bg-color) 100%)',
                padding: '4rem 1rem',
                textAlign: 'center',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <div className="container">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '0.4rem 1rem', borderRadius: '50px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                        <Camera size={18} /><span>Naša Práca</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                        Galéria inšpirácií
                    </h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        Prezrite si ukážky našich doterajších realizácií. Od luxusných vizitiek až po zložité obalové riešenia. Nechajte sa inšpirovať pre váš ďalší projekt.
                    </p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="container" style={{ padding: '3rem 1rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 'bold', marginRight: '1rem' }}>
                        <Filter size={20} /> Filtrovať:
                    </div>
                    {GALLERY_CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                borderRadius: '50px',
                                border: `2px solid ${activeCategory === category ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                background: activeCategory === category ? 'var(--primary-color)' : 'transparent',
                                color: activeCategory === category ? 'white' : 'var(--text-main)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Grid Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'start'
                }}>
                    {filteredGallery.map((item, idx) => (
                        <div key={item.id} style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: 'var(--card-bg)',
                            boxShadow: 'var(--shadow-md)',
                            position: 'relative',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both`
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                                e.currentTarget.querySelector('.overlay').style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                e.currentTarget.querySelector('.overlay').style.opacity = '0';
                            }}
                        >
                            <div style={{ position: 'relative', overflow: 'hidden', height: item.size === 'tall' ? '400px' : item.size === 'large' ? '350px' : '250px' }}>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                />
                                <div className="overlay" style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                }}>
                                    <span style={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        padding: '0.8rem 1.5rem',
                                        border: '2px solid white',
                                        borderRadius: '50px',
                                        backdropFilter: 'blur(4px)'
                                    }}>
                                        Zväčšiť náhľad
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{
                                    display: 'inline-block',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: 'bold',
                                    color: 'var(--primary-color)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {item.category}
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                    {item.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredGallery.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <Layers size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
                        <h3>Zatiaľ žiadne ukážky v tejto kategórii</h3>
                    </div>
                )}
            </section>
        </div>
    );
};
