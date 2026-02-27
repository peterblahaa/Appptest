// TODO: Pred nasadením zmeňte túto URL na vašu skutočnú doménu, napr. 'https://vasadomena.sk/api'
const API_URL = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3000';

export const api = {
    // --- PRODUCTS ---
    async getProducts() {
        const response = await fetch(`${API_URL}/products`);
        return await response.json();
    },

    async updateProduct(id, data) {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Update feature failed');
        return await response.json();
    },

    // --- CATEGORIES ---
    async getCategories() {
        const response = await fetch(`${API_URL}/categories`);
        return await response.json();
    },

    async createCategory(data) {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Vytvorenie kategórie zlyhalo.');
        return await response.json();
    },

    async updateCategory(id, data) {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const text = await response.text();
            console.error('Update failed:', response.status, text);
            throw new Error(`Aktualizácia kategórie zlyhala: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    },

    async deleteCategory(id) {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Odstránenie kategórie zlyhalo.');
        return true;
    },

    // --- AUTH ---
    async login(email, password) {
        console.log(`[DEBUG] Attempting login for ${email}`);
        const url = `${API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        console.log(`[DEBUG] Fetching from URL: ${url}`);

        try {
            const response = await fetch(url);
            console.log(`[DEBUG] Response status:`, response.status);

            const users = await response.json();
            console.log(`[DEBUG] Received data from users.php:`, users);

            if (users && users.length > 0) {
                return users[0];
            }
            throw new Error('Nesprávny email alebo heslo.');
        } catch (error) {
            console.error(`[DEBUG] Login failed:`, error);
            throw error;
        }
    },

    async register(userData) {
        // Check if user exists
        const check = await fetch(`${API_URL}/users?email=${userData.email}`);
        const existing = await check.json();
        if (existing.length > 0) {
            throw new Error('Používateľ s týmto emailom už existuje.');
        }

        // Create user
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Registrácia zlyhala.');
        return await response.json();
    },

    async updateUser(id, data) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Aktualizácia profilu zlyhala.');
        return await response.json();
    },

    async getUser(id) {
        const response = await fetch(`${API_URL}/users/${id}`);
        if (!response.ok) throw new Error('Načítanie používateľa zlyhalo.');
        return await response.json();
    },

    // --- ORDERS ---
    async createOrder(orderData) {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...orderData,
                date: new Date().toISOString()
            })
        });
        if (!response.ok) throw new Error('Vytvorenie objednávky zlyhalo.');
        return await response.json();
    },

    async getOrders(userId) {
        const response = await fetch(`${API_URL}/orders?userId=${userId}`);
        return await response.json();
    },

    // --- ADMIN ---
    async getUsers() {
        const response = await fetch(`${API_URL}/users`);
        return await response.json();
    },

    async getAllOrders() {
        const response = await fetch(`${API_URL}/orders`);
        return await response.json();
    },

    async updateOrder(id, data) {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Aktualizácia objednávky zlyhala.');
        return await response.json();
    },

    // --- MESSAGES ---
    async getMessages() {
        const response = await fetch(`${API_URL}/messages`);
        return await response.json();
    },

    async createMessage(data) {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...data,
                date: new Date().toISOString(),
                status: 'new'
            })
        });
        if (!response.ok) throw new Error('Odoslanie správy zlyhalo.');
        return await response.json();
    },

    async updateMessage(id, data) {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Aktualizácia správy zlyhala.');
        return await response.json();
    },

    // --- EMPLOYEES ---
    async getEmployees() {
        const response = await fetch(`${API_URL}/employees`);
        return await response.json();
    },

    async createEmployee(data) {
        const response = await fetch(`${API_URL}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Vytvorenie zamestnanca zlyhalo.');
        return await response.json();
    },

    async updateEmployee(id, data) {
        const response = await fetch(`${API_URL}/employees/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Aktualizácia zamestnanca zlyhala.');
        return await response.json();
    },

    // --- MACHINES ---
    async getMachines() {
        const response = await fetch(`${API_URL}/machines`);
        return await response.json();
    },

    async createMachine(data) {
        const response = await fetch(`${API_URL}/machines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Vytvorenie stroja zlyhalo.');
        return await response.json();
    },

    async updateMachine(id, data) {
        const response = await fetch(`${API_URL}/machines/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Aktualizácia stroja zlyhala.');
        return await response.json();
    },

    async deleteMachine(id) {
        const response = await fetch(`${API_URL}/machines/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Odstránenie stroja zlyhalo.');
        return true;
    }
};
