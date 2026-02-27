const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    if (filePath.endsWith('.css') && !filePath.includes('index.css') && !filePath.includes('node_modules')) {
        newContent = newContent
            .replace(/color:\s*(#1e293b)/ig, 'color: var(--text-main)')
            .replace(/color:\s*(#64748b)/ig, 'color: var(--text-muted)')
            .replace(/color:\s*(#0f172a)/ig, 'color: var(--accent-color)');
    } else if (filePath.endsWith('.jsx')) {
        newContent = newContent
            .replace(/color:\s*['"](#1e293b)['"]/ig, "color: 'var(--text-main)'")
            .replace(/color:\s*['"](#64748b)['"]/ig, "color: 'var(--text-muted)'")
            .replace(/color:\s*['"](#0f172a)['"]/ig, "color: 'var(--accent-color)'");
    }

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated Text Colors: ${filePath}`);
    }
}

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Text Color Replacement Done.');
