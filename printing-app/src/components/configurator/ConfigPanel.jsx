import React from 'react';
import styles from '../../pages/ProductPage.module.css';

export const ConfigPanel = ({ product, options, selectedOptions, onChange }) => {
    if (!product || !options) return null;

    return (
        <div className={styles.configSection}>
            <h2 className={styles.sectionTitle}>Konfigurácia produktu</h2>

            <div className={styles.formGroup}>
                <label>Produkt</label>
                <input
                    type="text"
                    value={product.name}
                    readOnly
                    className={styles.select}
                    style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                />
            </div>

            {options.internalDimensions && (
                <div className={styles.formGroup}>
                    <label>Vnútorné rozmery</label>
                    <select
                        className={styles.select}
                        value={selectedOptions.internalDimensions}
                        onChange={(e) => onChange('internalDimensions', e.target.value)}
                    >
                        {options.internalDimensions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}

            {options.papers && (
                <div className={styles.formGroup}>
                    <label>Druh papiera / kartón</label>
                    <select
                        className={styles.select}
                        value={selectedOptions.papers}
                        onChange={(e) => onChange('papers', e.target.value)}
                    >
                        {options.papers.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.formGroup}>
                <label>Potlač</label>
                <select
                    className={styles.select}
                    value={selectedOptions.print}
                    onChange={(e) => onChange('print', e.target.value)}
                >
                    {options.print.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>Povrchová úprava – fólia</label>
                <select
                    className={styles.select}
                    value={selectedOptions.surfaceFinish}
                    onChange={(e) => onChange('surfaceFinish', e.target.value)}
                >
                    {options.surfaceFinish.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>UV 3D lak</label>
                <select
                    className={styles.select}
                    value={selectedOptions.uvLack}
                    onChange={(e) => onChange('uvLack', e.target.value)}
                >
                    {options.uvLack.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>Farebná fólia 3D</label>
                <select
                    className={styles.select}
                    value={selectedOptions.colorFoil}
                    onChange={(e) => onChange('colorFoil', e.target.value)}
                >
                    {options.colorFoil.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>Kontrola súborov</label>
                <select
                    className={styles.select}
                    value={selectedOptions.fileCheck}
                    onChange={(e) => onChange('fileCheck', e.target.value)}
                >
                    {options.fileCheck.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
