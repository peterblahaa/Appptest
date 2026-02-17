import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CategoryCard.module.css';

export const CategoryCard = ({ id, name, image, hoverImage, linkPrefix = '/ponuka' }) => {
    return (
        <Link to={`${linkPrefix}/${id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                {/* Base Image */}
                <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    className={styles.baseImage}
                />
                {/* Hover Image (if available) */}
                {hoverImage && (
                    <img
                        src={hoverImage}
                        alt={`${name} hover`}
                        loading="lazy"
                        className={styles.hoverImage}
                    />
                )}
            </div>
            <div className={styles.content}>
                <h3>{name}</h3>
            </div>
        </Link>
    );
};
