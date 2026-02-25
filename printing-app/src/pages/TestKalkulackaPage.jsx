import React, { useState } from 'react';
import { calculate_print_price, FORMATS, DEFAULT_MACHINES, OFFSET_COLOR_MODES, BINDINGS, DEFAULT_FINISHING } from '../core/calculator';
import { api } from '../services/api';

export function TestKalkulackaPage() {
    // === CONFIG STATE ===
    const [paperPricePerTon, setPaperPricePerTon] = useState(1100);
    const [paperMarginPercent, setPaperMarginPercent] = useState(0);
    const [customMachines, setCustomMachines] = useState({});
    const [newMachine, setNewMachine] = useState({
        name: '',
        technology: 'digital',
        sheet_format: 'SRA3',
        digital_setup_fixed: 15,
        digital_price_per_side_1F: 0.03,
        digital_price_per_side_4F: 0.05,
        offset_run_price_per_sheet_side: 0.02,
        offset_setup_per_side: 30,
        plate_price: 6,
    });
    const [apiMachines, setApiMachines] = useState({});

    React.useEffect(() => {
        const fetchMachines = async () => {
            try {
                const machinesList = await api.getMachines();
                const machinesObj = {};
                for (const m of machinesList) {
                    machinesObj[m.id] = { ...m };
                    delete machinesObj[m.id].id;
                }
                setApiMachines(machinesObj);

                // Set default selected if applicable
                if (machinesList.length > 0) {
                    setCalcParams(prev => ({ ...prev, machine_name: machinesList[0].id }));
                }
            } catch (err) {
                console.error("Nebolo možné načítať stroje z databázy:", err);
            }
        };
        fetchMachines();
    }, []);

    // === CALCULATOR STATE ===
    const [calcParams, setCalcParams] = useState({
        job_type: 'sheet',
        machine_name: 'XEROX_SRA3',
        quantity: 1000,
        sheet_format: 'SRA3',
        product_format: 'A4',
        grammage_gm2: 130,
        technology: 'digital',
        color_mode: '4F',
        offset_color_mode: '4/4',
        pages: 16,
        duplex: true,
        binding_type: 'V1',
        finishing: [], // array of strings
    });

    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Derived combo lists
    const allMachines = { ...DEFAULT_MACHINES, ...apiMachines, ...customMachines };
    const machineOptions = Object.keys(allMachines);
    const formatOptions = Object.keys(FORMATS);
    const offsetColorOptions = Object.keys(OFFSET_COLOR_MODES);
    const bindingOptions = Object.keys(BINDINGS);
    const finishingOptions = Object.keys(DEFAULT_FINISHING);

    // === HANDLERS ===
    const handleAddMachine = async (e) => {
        e.preventDefault();
        if (!newMachine.name) return;

        // Parse numeric fields properly
        const parsedMachine = {
            id: newMachine.name,
            sheet_format: newMachine.sheet_format,
            technology: newMachine.technology,
        };

        if (newMachine.technology === 'digital') {
            parsedMachine.digital_setup_fixed = Number(newMachine.digital_setup_fixed);
            parsedMachine.digital_price_per_side_1F = Number(newMachine.digital_price_per_side_1F);
            parsedMachine.digital_price_per_side_4F = Number(newMachine.digital_price_per_side_4F);
        } else {
            parsedMachine.offset_run_price_per_sheet_side = Number(newMachine.offset_run_price_per_sheet_side);
            parsedMachine.offset_setup_per_side = Number(newMachine.offset_setup_per_side);
            parsedMachine.plate_price = Number(newMachine.plate_price);
        }

        try {
            await api.createMachine(parsedMachine);

            // Update local state to reflect the newly created machine immediately
            const machineForState = { ...parsedMachine };
            delete machineForState.id;

            setApiMachines(prev => ({
                ...prev,
                [newMachine.name]: machineForState
            }));

            // reset basic fields on add machine
            setNewMachine({ ...newMachine, name: '' });
            alert('Stroj bol úspešne uložený do databázy!');
        } catch (err) {
            console.error("Chyba pri vytváraní stroja:", err);
            alert('Nepodarilo sa uložiť stroj do databázy. Skontrolujte pripojenie.');

            // Fallback - aspoň dočasne uložíme lokálne, ak zlyhá API (na testovacie účely)
            setCustomMachines({
                ...customMachines,
                [newMachine.name]: parsedMachine
            });
        }
    };

    const handleCalculate = () => {
        setError(null);
        setResult(null);
        try {
            const res = calculate_print_price({
                ...calcParams,
                quantity: Number(calcParams.quantity),
                grammage_gm2: Number(calcParams.grammage_gm2),
                pages: Number(calcParams.pages),
                paper_price_per_ton: Number(paperPricePerTon),
                paper_margin_percent: Number(paperMarginPercent),
                custom_machines: { ...customMachines, ...apiMachines },
                duplex: calcParams.duplex === true || calcParams.duplex === 'true',
            });
            setResult(res);
        } catch (err) {
            setError(err.message);
        }
    };

    const updateCalcParam = (key, value) => {
        setCalcParams(prev => {
            const next = { ...prev, [key]: value };
            // auto update technology when machine changes
            if (key === 'machine_name' && allMachines[value]) {
                next.technology = allMachines[value].technology;
            }
            return next;
        });
    };

    const toggleFinishing = (item) => {
        setCalcParams(prev => {
            const current = prev.finishing || [];
            const updated = current.includes(item)
                ? current.filter(i => i !== item)
                : [...current, item];
            return { ...prev, finishing: updated };
        });
    };

    // === RENDER ===
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Test Kalkulačky</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* L'AVA STRANA - KONFIGURÁCIA A STROJE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <section style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#f9fafb' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Globálne Parametre (Fixné)</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Cena papiera za tonu (€)</label>
                                <input
                                    type="number"
                                    value={paperPricePerTon}
                                    onChange={e => setPaperPricePerTon(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Marža na papier (%)</label>
                                <input
                                    type="number"
                                    value={paperMarginPercent}
                                    onChange={e => setPaperMarginPercent(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>
                    </section>

                    <section style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#f9fafb' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Pridať vlastný stroj</h2>
                        <form onSubmit={handleAddMachine} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Názov Stroja (napr. MOJ_STROJ)</label>
                                <input
                                    required
                                    type="text"
                                    value={newMachine.name}
                                    onChange={e => setNewMachine({ ...newMachine, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Technológia</label>
                                    <select
                                        value={newMachine.technology}
                                        onChange={e => setNewMachine({ ...newMachine, technology: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                    >
                                        <option value="digital">Digitál</option>
                                        <option value="offset">Offset</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Formát Hárku</label>
                                    <select
                                        value={newMachine.sheet_format}
                                        onChange={e => setNewMachine({ ...newMachine, sheet_format: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                                    >
                                        {formatOptions.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>

                            {newMachine.technology === 'digital' ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Setup (€)</label>
                                            <input type="number" step="0.01" value={newMachine.digital_setup_fixed} onChange={e => setNewMachine({ ...newMachine, digital_setup_fixed: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Cena 1F/strana (€)</label>
                                            <input type="number" step="0.001" value={newMachine.digital_price_per_side_1F} onChange={e => setNewMachine({ ...newMachine, digital_price_per_side_1F: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Cena 4F/strana (€)</label>
                                            <input type="number" step="0.001" value={newMachine.digital_price_per_side_4F} onChange={e => setNewMachine({ ...newMachine, digital_price_per_side_4F: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Setup per side (€)</label>
                                            <input type="number" step="0.01" value={newMachine.offset_setup_per_side} onChange={e => setNewMachine({ ...newMachine, offset_setup_per_side: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Cena platne (€)</label>
                                            <input type="number" step="0.01" value={newMachine.plate_price} onChange={e => setNewMachine({ ...newMachine, plate_price: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Run price per sheet side (€)</label>
                                        <input type="number" step="0.001" value={newMachine.offset_run_price_per_sheet_side} onChange={e => setNewMachine({ ...newMachine, offset_run_price_per_sheet_side: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                    </div>
                                </>
                            )}

                            <button type="submit" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                                Pridať / Upraviť Stroj
                            </button>
                        </form>

                        {Object.keys(customMachines).length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Zoznam vlastných strojov:</h3>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                                    {Object.keys(customMachines).map(k => (
                                        <li key={k}>{k} ({customMachines[k].technology})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                </div>

                {/* PRAVÁ STRANA - VSTUPY & VÝSLEDKY */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <section style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Parametre Zákazky</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Typ Zákazky</label>
                                <select value={calcParams.job_type} onChange={e => updateCalcParam('job_type', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                                    <option value="sheet">Hárok (Sheet)</option>
                                    <option value="catalog">Katalóg (Catalog)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Počet kusov</label>
                                <input type="number" value={calcParams.quantity} onChange={e => updateCalcParam('quantity', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Stroj</label>
                                <select value={calcParams.machine_name} onChange={e => updateCalcParam('machine_name', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                                    {machineOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Formát Produktu</label>
                                <select value={calcParams.product_format} onChange={e => updateCalcParam('product_format', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                                    {formatOptions.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Gramáž (g/m²)</label>
                                <input type="number" value={calcParams.grammage_gm2} onChange={e => updateCalcParam('grammage_gm2', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Duplex (Obojstranne)</label>
                                <select value={calcParams.duplex} onChange={e => updateCalcParam('duplex', e.target.value === 'true')} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                                    <option value="true">Áno</option>
                                    <option value="false">Nie</option>
                                </select>
                            </div>

                            {calcParams.technology === 'digital' ? (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Farebnosť (Digitál)</label>
                                    <select value={calcParams.color_mode} onChange={e => updateCalcParam('color_mode', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                                        <option value="4F">4F (Farba)</option>
                                        <option value="1F">1F (ČB)</option>
                                    </select>
                                </div>
                            ) : (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Farebnosť (Offset)</label>
                                    <select value={calcParams.offset_color_mode} onChange={e => updateCalcParam('offset_color_mode', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                                        {offsetColorOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}

                            {calcParams.job_type === 'catalog' && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Počet Strán</label>
                                        <input type="number" value={calcParams.pages} onChange={e => updateCalcParam('pages', e.target.value)} step="4" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Väzba</label>
                                        <select value={calcParams.binding_type} onChange={e => updateCalcParam('binding_type', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                                            {bindingOptions.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Dokončovanie</label>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {finishingOptions.map(f => (
                                        <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={(calcParams.finishing || []).includes(f)}
                                                onChange={() => toggleFinishing(f)}
                                            />
                                            {f}
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <button
                            onClick={handleCalculate}
                            style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', backgroundColor: '#10b981', color: 'white', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.125rem' }}
                        >
                            Vypočítať Cenu
                        </button>
                    </section>

                    {/* VÝSLEDKY SECTION */}
                    {(result || error) && (
                        <section style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: error ? '#fef2f2' : '#ecfdf5', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: error ? '#dc2626' : '#059669' }}>
                                {error ? 'Chyba Výpočtu' : 'Výsledok'}
                            </h2>

                            {error ? (
                                <p style={{ color: '#ef4444' }}>{error}</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #d1fae5' }}>
                                        <span style={{ color: '#4b5563' }}>Stroj:</span>
                                        <span style={{ fontWeight: '500' }}>{result.machine} ({result.technology})</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #d1fae5' }}>
                                        <span style={{ color: '#4b5563' }}>Formát Hárku:</span>
                                        <span style={{ fontWeight: '500' }}>{result.sheet_format}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #d1fae5' }}>
                                        <span style={{ color: '#4b5563' }}>Potrebných hárkov:</span>
                                        <span style={{ fontWeight: '500' }}>{result.sheets_needed} ks</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #d1fae5' }}>
                                        <span style={{ color: '#4b5563' }}>Papier:</span>
                                        <span style={{ fontWeight: '500' }}>{result.paper_cost.toFixed(2)} €</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #d1fae5' }}>
                                        <span style={{ color: '#4b5563' }}>Tlač ({result.technology}):</span>
                                        <span style={{ fontWeight: '500' }}>{result.print_cost.toFixed(2)} €</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #d1fae5' }}>
                                        <span style={{ color: '#4b5563' }}>Setup:</span>
                                        <span style={{ fontWeight: '500' }}>{result.setup_cost.toFixed(2)} €</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #d1fae5' }}>
                                        <span style={{ color: '#4b5563' }}>Väzba:</span>
                                        <span style={{ fontWeight: '500' }}>{result.binding_cost.toFixed(2)} €</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #d1fae5' }}>
                                        <span style={{ color: '#4b5563' }}>Dokončovanie:</span>
                                        <span style={{ fontWeight: '500' }}>{result.finishing_cost.toFixed(2)} €</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                        <span>Cena Spolu:</span>
                                        <span style={{ color: '#059669' }}>{result.total_price.toFixed(2)} €</span>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                </div>
            </div>
        </div>
    );
}
