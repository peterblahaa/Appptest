import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerContainer}`}>
                <div className={styles.col}>
                    <h3 className={styles.logo}>Hansman Tlačiareň</h3>
                    <p className={styles.text}>
                        Váš spoľahlivý partner pre kvalitnú tlač.
                        Vizitky, letáky, krabice a mnoho ďalšieho
                        s doručením do 24 hodín.
                    </p>
                    <div className={styles.socials}>
                        <a href="#" className={styles.socialLink}><Facebook size={20} /></a>
                        <a href="#" className={styles.socialLink}><Instagram size={20} /></a>
                        <a href="#" className={styles.socialLink}><Linkedin size={20} /></a>
                    </div>
                </div>

                <div className={styles.col}>
                    <h4 className={styles.title}>Rýchle odkazy</h4>
                    <ul className={styles.links}>
                        <li><Link to="/">Domov</Link></li>
                        <li><Link to="/ponuka">Naša ponuka</Link></li>
                        <li><Link to="/kosik">Košík</Link></li>
                        <li><Link to="/konto">Môj účet</Link></li>
                    </ul>
                </div>

                <div className={styles.col}>
                    <h4 className={styles.title}>Produkty</h4>
                    <ul className={styles.links}>
                        <li><Link to="/ponuka/vizitky">Vizitky</Link></li>
                        <li><Link to="/ponuka/letaky">Letáky</Link></li>
                        <li><Link to="/ponuka/kalendare">Kalendáre</Link></li>
                        <li><Link to="/ponuka/krabice">Krabice</Link></li>
                    </ul>
                </div>

                <div className={styles.col}>
                    <h4 className={styles.title}>Kontakt</h4>
                    <ul className={styles.contactList}>
                        <li><MapPin size={18} /> Hlavná 123, 058 01 Poprad</li>
                        <li><Phone size={18} /> +421 900 123 456</li>
                        <li><Mail size={18} /> info@hansman.sk</li>
                    </ul>
                </div>
            </div>
            <div className={styles.bottomBar}>
                <div className="container">
                    <p>&copy; 2026 Hansman. Všetky práva vyhradené.</p>
                </div>
            </div>
        </footer>
    );
};
