const fs = require('fs');

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

let sql = '';

// Vloženie kategórií
if (db.categories) {
    db.categories.forEach(c => {
        sql += `INSERT INTO categories (id, \`order\`, name, image, hoverImage) VALUES ('${c.id}', ${c.order}, '${c.name.replace(/'/g, "''")}', '${c.image || ''}', '${c.hoverImage || ''}');\n`;
    });
}

// Vloženie produktov
if (db.products) {
    db.products.forEach(p => {
        const shipping = JSON.stringify(p.shipping || {});
        const options = JSON.stringify(p.options || {});
        sql += `INSERT INTO products (id, categoryId, name, basePrice, description, shipping, isVisible, options) VALUES ('${p.id}', '${p.categoryId}', '${p.name.replace(/'/g, "''")}', ${p.basePrice || 0}, '${(p.description || '').replace(/'/g, "''")}', '${shipping}', ${p.isVisible ? 1 : 0}, '${options}');\n`;
    });
}

// Vloženie užívateľov
if (db.users) {
    db.users.forEach(u => {
        const password = u.password ? u.password : 'default_password';
        sql += `INSERT INTO users (id, email, password, name, phone, newsletter, city, zip, company, isAdmin, priceModifier, street) VALUES ('${u.id}', '${u.email}', '${password}', '${u.name.replace(/'/g, "''")}', '${u.phone || ''}', ${u.newsletter ? 1 : 0}, '${u.city || ''}', '${u.zip || ''}', '${u.company || ''}', ${u.isAdmin ? 1 : 0}, ${u.priceModifier || 0}, '${u.street || ''}');\n`;
    });
}

// Vloženie zamestnancov
if (db.employees) {
    db.employees.forEach(e => {
        sql += `INSERT INTO employees (id, name, email, role, joinedDate, department, active, color) VALUES ('${e.id}', '${e.name.replace(/'/g, "''")}', '${e.email}', '${e.role}', '${e.joinedDate}', '${e.department || ''}', ${e.active ? 1 : 0}, '${e.color || ''}');\n`;
    });
}

// Vloženie objednávok
if (db.orders) {
    const validUserIds = db.users ? db.users.map(u => u.id) : [];
    db.orders.forEach(o => {
        // Kontrola, ci uzivatel pre objednavku existuje
        if (validUserIds.includes(o.userId)) {
            const customer = JSON.stringify(o.customer || {}).replace(/'/g, "''");
            const items = JSON.stringify(o.items || []).replace(/'/g, "''");
            sql += `INSERT INTO orders (id, userId, customer, items, total, status, date, assignedTo) VALUES ('${o.id}', '${o.userId}', '${customer}', '${items}', ${o.total}, '${o.status}', '${new Date(o.date).toISOString().slice(0, 19).replace('T', ' ')}', ${o.assignedTo ? "'" + o.assignedTo + "'" : "NULL"});\n`;
        } else {
            console.log(`Vyhadzujem objednávku ${o.id}, lebo používateľ ${o.userId} neexistuje.`);
        }
    });
}

// Vloženie správ
if (db.messages) {
    db.messages.forEach(m => {
        sql += `INSERT INTO messages (id, name, email, message, date, status) VALUES ('${m.id}', '${m.name.replace(/'/g, "''")}', '${m.email}', '${m.message.replace(/'/g, "''")}', '${new Date(m.date).toISOString().slice(0, 19).replace('T', ' ')}', '${m.status}');\n`;
    });
}

fs.appendFileSync('database-setup.sql', '\n-- Počiatočné dáta\n' + sql);
console.log('Počiatočné dáta boli pridané do database-setup.sql');
