import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categories, subCategories } from '../../data/mockData';

export const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Simple mapping helper - in real app would need more robust lookup
    const getName = (slug) => {
        if (slug === 'ponuka') return 'Ponuka';
        if (slug === 'kosik') return 'Košík';
        if (slug === 'checkout') return 'Pokladňa';

        // Check categories
        const cat = categories.find(c => c.id === slug);
        if (cat) return cat.name;

        // Check subcategories
        for (const key in subCategories) {
            const sub = subCategories[key].find(s => s.id === slug);
            if (sub) return sub.name;
        }

        return slug;
    };

    if (pathnames.length === 0) return null;

    return (
        <nav aria-label="breadcrumb" style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Link to="/">Domov</Link>
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

                    return (
                        <span key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ChevronRight size={16} />
                            {isLast ? (
                                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{getName(name)}</span>
                            ) : (
                                <Link to={routeTo}>{getName(name)}</Link>
                            )}
                        </span>
                    );
                })}
            </div>
        </nav>
    );
};
