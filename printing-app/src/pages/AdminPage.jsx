import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { api } from '../services/api';
import { Edit, X, Save, Check, Filter, LayoutDashboard, ListOrdered, TrendingUp, Package, DollarSign, Trash2, Plus, ArrowUp, ArrowDown, GripVertical, Users, ShoppingBag, MessageSquare, FileText } from 'lucide-react';

// ... (imports)

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { EmployeesTab } from '../components/admin/EmployeesTab';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generateInvoice } from '../core/logic/InvoiceGenerator';
import styles from './AdminPage.module.css';

const COLORS = ['#0ea5e9', '#84cc16', '#f59e0b', '#10b981', '#ef4444'];

// Helper Component for SortableRow
const SortableRow = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
    };

    return (
        <tr ref={setNodeRef} style={style}>
            {React.Children.map(children, child => {
                if (child.props['data-drag-handle']) {
                    return React.cloneElement(child, { ...attributes, ...listeners });
                }
                return child;
            })}
        </tr>
    );
};

export const AdminPage = () => {
    const { user, isLoggedIn, loading, impersonateUser } = useAuth();
    const navigate = useNavigate();

    const STATUS_COLORS = {
        new: '#2563eb', // blue-600
        processing: '#d97706', // amber-600
        shipped: '#7c3aed', // violet-600
        completed: '#059669', // emerald-600
        cancelled: '#dc2626' // red-600
    };

    const [orders, setOrders] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (id) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedRows(newSet);
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

    // Modal State
    const [editingOrder, setEditingOrder] = useState(null);
    const [editForm, setEditForm] = useState({});
    const {
        products,
        categories,
        loading: productsLoading, // Renamed to avoid conflict with pageLoading
        error: productsError, // Renamed to avoid conflict with page error
        refreshProducts,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories
    } = useProducts();
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({});

    const [editingCategory, setEditingCategory] = useState(null); // null = none, 'new' = creating, object = editing
    const [categoryForm, setCategoryForm] = useState({});

    // User Management State
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({});

    const fetchUsers = async () => {
        try {
            setPageLoading(true);
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError('Nepodarilo sa načítať používateľov.');
        } finally {
            setPageLoading(false);
        }
    };

    const [employees, setEmployees] = useState([]);

    // Initial data fetch
    useEffect(() => {
        if (isLoggedIn && user?.isAdmin) {
            // Fetch employees for dropdowns regardless of active tab, or just when needed
            // It's better to have them ready for Orders tab
            api.getEmployees().then(setEmployees).catch(console.error);
        }
    }, [isLoggedIn, user]);

    // Messages State

    // Messages State
    const [messages, setMessages] = useState([]);

    const fetchMessages = async () => {
        try {
            setPageLoading(true);
            const data = await api.getMessages();
            // Sort by date desc
            const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setMessages(sorted);
        } catch (err) {
            console.error(err);
            setError('Nepodarilo sa načítať správy.');
        } finally {
            setPageLoading(false);
        }
    };

    const handleEditUserClick = (user) => {
        setEditingUser(user);
        setUserForm({
            name: user.name,
            email: user.email,
            company: user.company,
            priceModifier: user.priceModifier || 0
        });
    };

    const handleUserSave = async () => {
        try {
            await api.updateUser(editingUser.id, {
                priceModifier: Number(userForm.priceModifier)
            });
            await fetchUsers(); // Refresh list
            setEditingUser(null);
        } catch (err) {
            alert('Chyba pri ukladaní používateľa: ' + err.message);
        }
    };

    // Create User State
    const [creatingUser, setCreatingUser] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        email: '',
        password: '',
        company: '',
        phone: '',
        street: '',
        city: '',
        zip: ''
    });

    const handleCreateUserClick = () => {
        setCreatingUser(true);
        setNewUserForm({
            name: '',
            email: '',
            password: '', // Required for registration
            company: '',
            phone: '',
            street: '',
            city: '',
            zip: ''
        });
    };

    const handleCreateUserSave = async () => {
        if (!newUserForm.email || !newUserForm.password || !newUserForm.name) {
            alert('Vyplňte prosím Meno, Email a Heslo.');
            return;
        }
        try {
            await api.register(newUserForm);
            await fetchUsers();
            setCreatingUser(false);
            alert('Zákazník bol úspešne vytvorený.');
        } catch (err) {
            alert('Chyba pri vytváraní zákazníka: ' + err.message);
        }
    };

    const handleEditProductClick = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            basePrice: product.basePrice,
            description: product.description,
            isVisible: product.isVisible,
            categoryId: product.categoryId
        });
    };

    const handleProductSave = async () => {
        try {
            await api.updateProduct(editingProduct.id, {
                ...editingProduct,
                name: productForm.name,
                basePrice: Number(productForm.basePrice),
                description: productForm.description,
                isVisible: productForm.isVisible,
                categoryId: productForm.categoryId
            });
            refreshProducts();
            setEditingProduct(null);
        } catch (err) {
            alert('Chyba pri ukladaní produktu: ' + err.message);
        }
    };

    const handleEditCategoryClick = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            image: category.image
        });
    };

    const handleCreateCategoryClick = () => {
        setEditingCategory('new');
        setCategoryForm({
            name: '',
            image: ''
        });
    };

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if larger than 800px width
                    const MAX_WIDTH = 800;
                    if (width > MAX_WIDTH) {
                        height = (MAX_WIDTH * height) / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setCategoryForm(prev => ({ ...prev, [field]: dataUrl }));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCategorySave = async () => {
        try {
            if (editingCategory === 'new') {
                const id = categoryForm.id || categoryForm.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
                await addCategory({
                    id,
                    ...categoryForm
                });
            } else {
                await updateCategory(editingCategory.id, {
                    ...categoryForm,
                    id: editingCategory.id // Ensure ID is preserved
                });
            }
            setEditingCategory(null);
        } catch (err) {
            alert('Chyba pri ukladaní kategórie: ' + err.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Naozaj chcete odstrániť túto kategóriu? Produkty v nej môžu zostať osirelé.')) {
            try {
                await deleteCategory(id);
            } catch (err) {
                console.error(err);
                alert('Chyba pri mazaní kategórie.');
            }
        }
    };



    useEffect(() => {
        if (!loading) {
            setError(null); // Clear errors on tab change
            if (!isLoggedIn || !user?.isAdmin) {
                navigate('/');
                return;
            }
            if (activeTab === 'orders' || activeTab === 'dashboard') fetchOrders();
            if (activeTab === 'customers') fetchUsers();
            if (activeTab === 'questions') fetchMessages();
        }
    }, [isLoggedIn, user, loading, navigate, activeTab]);

    const fetchOrders = async () => {
        try {
            setPageLoading(true);
            const data = await api.getAllOrders();
            // Sort by date desc
            const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setOrders(sorted);
        } catch (err) {
            console.error(err);
            setError('Nepodarilo sa načítať objednávky.');
        } finally {
            setPageLoading(false);
        }
    };

    // --- STATISTICS CALCULATION ---
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Status Distribution
        const statusCount = {};
        orders.forEach(order => {
            statusCount[order.status] = (statusCount[order.status] || 0) + 1;
        });
        const statusTranslation = {
            new: 'Nová',
            processing: 'Sprac.',
            shipped: 'Odoslaná',
            completed: 'Dokončená',
            cancelled: 'Zrušená'
        };

        const statusData = Object.keys(statusCount).map(status => ({
            name: statusTranslation[status] || status,
            value: statusCount[status],
            color: STATUS_COLORS[status] || '#94a3b8'
        }));

        // Revenue by Date (Last 7 distinct dates or just grouping)
        // Group by Date (YYYY-MM-DD)
        const revenueByDate = {};
        orders.forEach(order => {
            const date = new Date(order.date).toLocaleDateString('sk-SK');
            revenueByDate[date] = (revenueByDate[date] || 0) + order.total;
        });
        // Convert to array and take last 7
        const chartData = Object.keys(revenueByDate).map(date => ({
            date,
            revenue: revenueByDate[date]
        })).slice(-7);

        return { totalRevenue, totalOrders, avgOrderValue, statusData, chartData };
    }, [orders]);


    const handleStatusChange = async (orderId, newStatus) => {
        // Optimistic update
        const originalOrders = [...orders];
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        try {
            await api.updateOrder(orderId, { status: newStatus });
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Chyba pri aktualizácii statusu.');
            setOrders(originalOrders);
        }
    };

    const handleAssignEmployee = async (orderId, employeeId) => {
        // Optimistic update
        const originalOrders = [...orders];
        setOrders(orders.map(o => o.id === orderId ? { ...o, assignedTo: employeeId } : o));

        try {
            await api.updateOrder(orderId, { assignedTo: employeeId });
        } catch (err) {
            console.error('Failed to update assignment', err);
            alert('Chyba pri priraďovaní zamestnanca.');
            setOrders(originalOrders);
        }
    };

    const handleEditClick = (order) => {
        setEditingOrder(order);
        setEditForm({
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone,
            street: order.customer.street,
            city: order.customer.city,
            zip: order.customer.zip,
            status: order.status
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSaveEdit = async () => {
        try {
            const updatedCustomer = {
                ...editingOrder.customer,
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                street: editForm.street,
                city: editForm.city,
                zip: editForm.zip
            };

            const updatedOrder = {
                status: editForm.status,
                customer: updatedCustomer
            };

            const res = await api.updateOrder(editingOrder.id, updatedOrder);

            // Update local state
            setOrders(orders.map(o => o.id === editingOrder.id ? res : o));
            setEditingOrder(null);
        } catch (err) {
            alert('Chyba pri ukladaní zmien: ' + err.message);
        }
    };


    // --- Sorting Logic ---

    // For Up/Down buttons
    const handleMoveCategory = async (category, direction) => {
        const currentIndex = categories.findIndex(c => c.id === category.id);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= categories.length) return;

        const newCategoriesOrder = arrayMove(categories, currentIndex, newIndex);
        await reorderCategories(newCategoriesOrder);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over.id);

            const newCategoriesOrder = arrayMove(categories, oldIndex, newIndex);
            await reorderCategories(newCategoriesOrder);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'new': return styles.statusNew;
            case 'processing': return styles.statusProcessing;
            case 'shipped': return styles.statusShipped;
            case 'completed': return styles.statusCompleted;
            case 'cancelled': return styles.statusCancelled;
            default: return '';
        }
    };

    if (loading || pageLoading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Načítavam administráciu...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Admin Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>

                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <LayoutDashboard size={18} style={{ display: 'inline', marginRight: '5px' }} /> Prehľad
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <ListOrdered size={18} style={{ display: 'inline', marginRight: '5px' }} /> Objednávky ({orders.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    <Package size={18} style={{ display: 'inline', marginRight: '5px' }} /> Produkty
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    <LayoutDashboard size={18} style={{ display: 'inline', marginRight: '5px' }} /> Kategórie
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'customers' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('customers')}
                >
                    <Users size={18} style={{ display: 'inline', marginRight: '5px' }} /> Zákazníci
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'employees' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('employees')}
                >
                    <Users size={18} style={{ display: 'inline', marginRight: '5px' }} /> Zamestnanci
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'questions' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('questions')}
                >
                    <MessageSquare size={18} style={{ display: 'inline', marginRight: '5px' }} /> Otázky
                </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            {activeTab === 'dashboard' ? (
                <div className={styles.dashboardGrid}>
                    {/* KPI CARDS - Same as before */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statTitle}>Celkové tržby</span>
                            <span className={styles.statValue}>{stats.totalRevenue.toFixed(2)} €</span>
                            <span className={styles.statTrend}><TrendingUp size={16} /> +12% tento týždeň</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statTitle}>Počet objednávok</span>
                            <span className={styles.statValue}>{stats.totalOrders}</span>
                            <span className={styles.statTrend}><Package size={16} /> {orders.filter(o => o.status === 'new').length} nových</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statTitle}>Priemerná hodnota</span>
                            <span className={styles.statValue}>{stats.avgOrderValue.toFixed(2)} €</span>
                            <span className={styles.statTrend}><DollarSign size={16} /> Stabilný rast</span>
                        </div>
                    </div>

                    {/* CHARTS */}
                    <div className={styles.chartsGrid}>
                        <div className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>Vývoj tržieb (posledné dni)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.chartData} margin={{ top: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                        dataKey="revenue"
                                        fill="var(--primary-color)"
                                        radius={[4, 4, 0, 0]}
                                        name="Tržby (€)"
                                        maxBarSize={50}
                                        label={({ x, y, width, value }) => (
                                            <text x={x + width / 2} y={y} dy={-6} fill="var(--text-main)" textAnchor="middle" fontWeight="bold" fontSize={13}>
                                                {Number(value).toFixed(2)}
                                            </text>
                                        )}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>Stav objednávok</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        labelLine={false}
                                        label={({ value }) => `${value}`}
                                    >
                                        {stats.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'orders' ? (
                <>
                    <div className={styles.controlsBar}>
                        <input
                            type="text"
                            placeholder="Hľadať podľa mena, emailu alebo ID..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <select
                            className={styles.filterSelect}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Všetky stavy</option>
                            <option value="new">Nová</option>
                            <option value="processing">Spracováva sa</option>
                            <option value="shipped">Odoslaná</option>
                            <option value="completed">Dokončená</option>
                            <option value="cancelled">Zrušená</option>
                        </select>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Dátum</th>
                                    <th>Zákazník</th>
                                    <th>Suma</th>
                                    <th>Status</th>
                                    <th>Priradený</th>
                                    <th>Akcie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <React.Fragment key={order.id}>
                                        <tr
                                            onClick={() => toggleRow(order.id)}
                                            style={{ cursor: 'pointer', backgroundColor: expandedRows.has(order.id) ? '#f8fafc' : undefined }}
                                        >
                                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                #{order.id.slice(-6)}
                                            </td>
                                            <td>{new Date(order.date).toLocaleString('sk-SK')}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{order.customer.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.customer.email}</div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{order.total.toFixed(2)} €</td>
                                            <td>
                                                <select
                                                    className={`${styles.statusSelect} ${getStatusClass(order.status)}`}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                >
                                                    <option value="new">Nová</option>
                                                    <option value="processing">Sprac.</option>
                                                    <option value="shipped">Odosla.</option>
                                                    <option value="completed">Hotovo</option>
                                                    <option value="cancelled">Zrušená</option>
                                                </select>
                                            </td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                    {order.assignedTo && (
                                                        <span
                                                            style={{
                                                                width: '10px',
                                                                height: '10px',
                                                                borderRadius: '50%',
                                                                backgroundColor: employees.find(e => e.id === order.assignedTo)?.color || '#ccc',
                                                                position: 'absolute',
                                                                left: '10px',
                                                                zIndex: 1,
                                                                pointerEvents: 'none'
                                                            }}
                                                        />
                                                    )}
                                                    <select
                                                        className={styles.statusSelect}
                                                        style={{
                                                            background: '#f8fafc',
                                                            borderColor: '#e2e8f0',
                                                            color: '#475569',
                                                            minWidth: '160px',
                                                            paddingLeft: order.assignedTo ? '1.8rem' : '1rem'
                                                        }}
                                                        value={order.assignedTo || ''}
                                                        onChange={(e) => handleAssignEmployee(order.id, e.target.value)}
                                                    >
                                                        <option value="">-- Nepriradené --</option>
                                                        {employees.map(emp => (
                                                            <option key={emp.id} value={emp.id}>
                                                                {emp.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={(e) => { e.stopPropagation(); generateInvoice(order); }}
                                                        title="Stiahnuť faktúru"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={(e) => { e.stopPropagation(); handleEditClick(order); }}
                                                        title="Upraviť objednávku"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRows.has(order.id) && (
                                            <tr className={styles.expandedRow}>
                                                <td colSpan="7" style={{ padding: 0 }}>
                                                    <div className={styles.orderDetails}>
                                                        <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Položky objednávky:</h4>
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className={styles.orderItem}>
                                                                <div className={styles.itemInfo}>
                                                                    <span className={styles.itemName}>{item.name}</span>
                                                                    <div className={styles.itemMeta}>
                                                                        {Object.entries(item.selectedOptions || {}).map(([key, val]) => (
                                                                            <div key={key} style={{ marginRight: '20px', display: 'inline-flex', flexDirection: 'column', verticalAlign: 'top' }}>
                                                                                <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', marginBottom: '2px', textTransform: 'uppercase' }}>{key}</span>
                                                                                <span>{val}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>{item.qty} <small style={{ fontSize: '0.7em', color: '#64748b' }}>ks</small></div>
                                                                    <div style={{ fontWeight: 600 }}>{item.totalPriceVat?.toFixed(2)} €</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                                            <div>
                                                                <strong>Doručenie:</strong> {order.customer.street}, {order.customer.city} {order.customer.zip}
                                                            </div>
                                                            <div>
                                                                <strong>Kontakt:</strong> {order.customer.phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Žiadne objednávky nevyhovujú filtru.
                            </div>
                        )}
                    </div>
                </>
            ) : activeTab === 'employees' ? (
                <EmployeesTab />
            ) : activeTab === 'categories' ? (
                <div className={styles.tableContainer}>
                    <div style={{ padding: '1rem', textAlign: 'right' }}>
                        <button className="btn btn-primary" onClick={handleCreateCategoryClick}><Plus size={16} /> Pridať kategóriu</button>
                    </div>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}></th>
                                    <th>Poradie</th>
                                    <th>Obrázok</th>
                                    <th>Názov</th>
                                    <th>ID</th>
                                    <th>Akcie</th>
                                </tr>
                            </thead>
                            <tbody>
                                <SortableContext
                                    items={categories.map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {categories.map((cat, index) => (
                                        <SortableRow key={cat.id} id={cat.id}>
                                            <td data-drag-handle style={{ cursor: 'grab', color: '#94a3b8' }}>
                                                <GripVertical size={20} />
                                            </td>
                                            <td> {index + 1}</td>
                                            <td>
                                                <div className={styles.tableImg}>
                                                    {cat.image ? (
                                                        <img src={cat.image} alt={cat.name} />
                                                    ) : (
                                                        <div className={styles.noImg}><Package size={20} /></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{cat.name}</td>
                                            <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{cat.id}</td>
                                            <td>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => handleMoveCategory(cat, 'up')}
                                                    disabled={categories.indexOf(cat) === 0}
                                                    title="Posunúť hore"
                                                >
                                                    <ArrowUp size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => handleMoveCategory(cat, 'down')}
                                                    disabled={categories.indexOf(cat) === categories.length - 1}
                                                    title="Posunúť dole"
                                                >
                                                    <ArrowDown size={16} />
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => handleEditCategoryClick(cat)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </SortableRow>
                                    ))}
                                </SortableContext>
                            </tbody>
                        </table>
                    </DndContext>
                </div>
            ) : activeTab === 'customers' ? (
                <div className={styles.tableContainer}>
                    <div style={{ padding: '1rem', textAlign: 'right' }}>
                        <button className="btn btn-primary" onClick={handleCreateUserClick}>
                            <Plus size={16} /> Pridať zákazníka
                        </button>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Meno</th>
                                <th>Email</th>
                                <th>Firma</th>
                                <th>Cenová úprava</th>
                                <th>Akcie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.company || '-'}</td>
                                    <td>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: u.priceModifier < 0 ? 'var(--success-color)' : u.priceModifier > 0 ? 'var(--error-color)' : 'inherit'
                                        }}>
                                            {u.priceModifier ? `${u.priceModifier > 0 ? '+' : ''}${u.priceModifier}%` : '0%'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleEditUserClick(u)}
                                            title="Upraviť"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => {
                                                if (window.confirm(`Chcete vytvoriť objednávku ako ${u.name}?`)) {
                                                    impersonateUser(u);
                                                    navigate('/ponuka');
                                                }
                                            }}
                                            title="Objednať v mene zákazníka"
                                            style={{ marginLeft: '5px', color: 'var(--primary-color)' }}
                                        >
                                            <ShoppingBag size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : activeTab === 'products' ? (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Názov</th>
                                <th>Kategória</th>
                                <th>Popis</th>
                                <th>Základná cena</th>
                                <th>Viditeľnosť</th>
                                <th>Akcie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(products).map(product => {
                                const prodCat = categories.find(c => c.id === product.categoryId);
                                return (
                                    <tr key={product.id}>
                                        <td style={{ fontWeight: 600 }}>{product.name}</td>
                                        <td style={{ fontSize: '0.9rem', color: '#64748b' }}>{prodCat ? prodCat.name : product.categoryId}</td>
                                        <td style={{ maxWidth: '300px', fontSize: '0.9rem', color: '#64748b' }}>{product.description}</td>
                                        <td>{product.basePrice.toFixed(2)} €</td>
                                        <td>
                                            <span className={product.isVisible ? styles.statusCompleted : styles.statusCancelled}>
                                                {product.isVisible ? 'Aktívny' : 'Skrytý'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={styles.actionBtn} onClick={() => handleEditProductClick(product)}>
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : null}

            {/* Product Edit Modal */}
            {editingProduct && (
                <div className={styles.modalOverlay} onClick={() => setEditingProduct(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Upraviť produkt: {editingProduct.name}</h2>
                            <button className={styles.closeBtn} onClick={() => setEditingProduct(null)}><X size={24} /></button>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Názov</label>
                                <input
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Kategória</label>
                                <select
                                    value={productForm.categoryId}
                                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                                    style={{ padding: '0.6rem' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Popis</label>
                                <textarea
                                    className={styles.textarea}
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Základná cena (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={productForm.basePrice}
                                    onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={productForm.isVisible}
                                        onChange={(e) => setProductForm({ ...productForm, isVisible: e.target.checked })}
                                        style={{ marginRight: '10px' }}
                                    />
                                    Viditeľný na webe
                                </label>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className="btn btn-outline" onClick={() => setEditingProduct(null)}>Zrušiť</button>
                            <button className="btn btn-primary" onClick={handleProductSave}>
                                <Save size={18} style={{ marginRight: '5px' }} /> Uložiť
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Edit Modal */}
            {editingCategory && (
                <div className={styles.modalOverlay} onClick={() => setEditingCategory(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingCategory === 'new' ? 'Nová kategória' : 'Upraviť kategóriu'}</h2>
                            <button className={styles.closeBtn} onClick={() => setEditingCategory(null)}><X size={24} /></button>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Názov</label>
                                <input
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    placeholder="Názov kategórie"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Obrázok (základný)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'image')}
                                    style={{ padding: '0.5rem 0' }}
                                />
                                {categoryForm.image && (
                                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                        <img src={categoryForm.image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px', maxWidth: '100%' }} />
                                    </div>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Obrázok po nabehnutí (Hover)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'hoverImage')}
                                    style={{ padding: '0.5rem 0' }}
                                />
                                {categoryForm.hoverImage && (
                                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                        <img src={categoryForm.hoverImage} alt="Hover Preview" style={{ maxHeight: '100px', borderRadius: '4px', maxWidth: '100%' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className="btn btn-outline" onClick={() => setEditingCategory(null)}>Zrušiť</button>
                            <button className="btn btn-primary" onClick={handleCategorySave}>
                                <Save size={18} style={{ marginRight: '5px' }} /> Uložiť
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Same as before) */}
            {editingOrder && (
                <div className={styles.modalOverlay} onClick={() => setEditingOrder(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Upraviť objednávku #{editingOrder.id}</h2>
                            <button className={styles.closeBtn} onClick={() => setEditingOrder(null)}><X size={24} /></button>
                        </div>

                        <div className={styles.formGrid}>
                            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginTop: 0 }}>Zákazník</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className={styles.formGroup}>
                                    <label>Meno</label>
                                    <input name="name" value={editForm.name} onChange={handleEditChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Tel.</label>
                                    <input name="phone" value={editForm.phone} onChange={handleEditChange} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input name="email" value={editForm.email} onChange={handleEditChange} />
                            </div>

                            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginTop: '1rem' }}>Adresa</h4>
                            <div className={styles.formGroup}>
                                <label>Ulica</label>
                                <input name="street" value={editForm.street} onChange={handleEditChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <div className={styles.formGroup}>
                                    <label>Mesto</label>
                                    <input name="city" value={editForm.city} onChange={handleEditChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>PSČ</label>
                                    <input name="zip" value={editForm.zip} onChange={handleEditChange} />
                                </div>
                            </div>

                            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginTop: '1rem' }}>Suma a Status</h4>
                            <div className={styles.formGroup}>
                                <label>Status</label>
                                <select name="status" value={editForm.status} onChange={handleEditChange} style={{ padding: '0.6rem' }}>
                                    <option value="new">Nová</option>
                                    <option value="processing">Spracováva sa</option>
                                    <option value="shipped">Odoslaná</option>
                                    <option value="completed">Dokončená</option>
                                    <option value="cancelled">Zrušená</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button className="btn btn-outline" onClick={() => setEditingOrder(null)}>Zrušiť</button>
                            <button className="btn btn-primary" onClick={handleSaveEdit}><Save size={18} style={{ marginRight: '5px' }} /> Uložiť zmeny</button>
                        </div>
                    </div>
                </div>
            )}
            {/* User Edit Modal */}
            {editingUser && (
                <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Upraviť zákazníka: {editingUser.name}</h2>
                            <button className={styles.closeBtn} onClick={() => setEditingUser(null)}><X size={24} /></button>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Cenová úprava (%)</label>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                    Zadajte percentuálnu zmenu ceny. <br />
                                    Napríklad <b>-20</b> pre 20% zľavu, <b>10</b> pre 10% navýšenie.
                                </div>
                                <input
                                    type="number"
                                    value={userForm.priceModifier}
                                    onChange={(e) => setUserForm({ ...userForm, priceModifier: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Meno</label>
                                <input value={userForm.name} disabled style={{ backgroundColor: '#f1f5f9' }} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input value={userForm.email} disabled style={{ backgroundColor: '#f1f5f9' }} />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className="btn btn-outline" onClick={() => setEditingUser(null)}>Zrušiť</button>
                            <button className="btn btn-primary" onClick={handleUserSave}>
                                <Save size={18} style={{ marginRight: '5px' }} /> Uložiť
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {activeTab === 'questions' && (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Dátum</th>
                                <th>Meno</th>
                                <th>Email</th>
                                <th>Správa</th>
                                <th>Status</th>
                                <th>Akcie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map(msg => (
                                <tr key={msg.id} style={{ opacity: msg.status === 'answered' ? 0.6 : 1 }}>
                                    <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>
                                        {new Date(msg.date).toLocaleString('sk-SK')}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{msg.name}</td>
                                    <td>
                                        <a href={`mailto:${msg.email}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                                            {msg.email}
                                        </a>
                                    </td>
                                    <td style={{ maxWidth: '400px', whiteSpace: 'pre-wrap' }}>{msg.message}</td>
                                    <td>
                                        <span className={msg.status === 'answered' ? styles.statusCompleted : styles.statusNew}>
                                            {msg.status === 'answered' ? 'Vybavené' : 'Nové'}
                                        </span>
                                    </td>
                                    <td>
                                        {msg.status !== 'answered' && (
                                            <button
                                                className={styles.actionBtn}
                                                onClick={async () => {
                                                    try {
                                                        await api.updateMessage(msg.id, { status: 'answered' });
                                                        fetchMessages(); // Refresh list
                                                    } catch (err) {
                                                        alert('Chyba pri zmene statusu.');
                                                    }
                                                }}
                                                title="Označiť ako vybavené"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {messages.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        Žiadne správy.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit User Modal */}
            {creatingUser && (
                <div className={styles.modalOverlay} onClick={() => setCreatingUser(false)}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Nový zákazník</h2>
                            <button className={styles.closeBtn} onClick={() => setCreatingUser(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Meno / Názov firmy *</label>
                                <input
                                    value={newUserForm.name}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                                    placeholder="Celé meno alebo názov firmy"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email *</label>
                                <input
                                    value={newUserForm.email}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Heslo *</label>
                                <input
                                    type="password"
                                    value={newUserForm.password}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                    placeholder="Heslo"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Firma</label>
                                <input
                                    value={newUserForm.company}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, company: e.target.value })}
                                    placeholder="Názov firmy (nepovinné)"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Telefón</label>
                                <input
                                    value={newUserForm.phone}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                                    placeholder="+421 900 000 000"
                                />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className="btn btn-outline" onClick={() => setCreatingUser(false)}>Zrušiť</button>
                            <button className="btn btn-primary" onClick={handleCreateUserSave}>
                                <Save size={18} style={{ marginRight: '5px' }} /> Vytvoriť zákazníka
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
