const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    if (filePath.endsWith('.css') && !filePath.includes('index.css') && !filePath.includes('node_modules')) {
        newContent = newContent
            .replace(/background:\s*(white|#fff|#ffffff)/g, 'background: var(--card-bg)')
            .replace(/background-color:\s*(white|#fff|#ffffff)/g, 'background-color: var(--card-bg)')
            .replace(/background:\s*(#f8fafc|#f9fafb)/g, 'background: var(--bg-color)')
            .replace(/background-color:\s*(#f8fafc|#f9fafb)/g, 'background-color: var(--bg-color)')
            .replace(/border-color:\s*(#e2e8f0|#e5e7eb)/g, 'border-color: var(--border-color)')
            .replace(/border:\s*1px\s*solid\s*(#e2e8f0|#e5e7eb)/g, 'border: 1px solid var(--border-color)');
        // We intentionally SKIP text color: white
    } else if (filePath.endsWith('.jsx')) {
        newContent = newContent
            .replace(/backgroundColor:\s*['"](white|#fff|#ffffff)['"]/g, "backgroundColor: 'var(--card-bg)'")
            .replace(/backgroundColor:\s*['"](#f8fafc|#f9fafb)['"]/g, "backgroundColor: 'var(--bg-color)'")
            .replace(/background:\s*['"](white|#fff|#ffffff)['"]/g, "background: 'var(--card-bg)'")
            .replace(/background:\s*['"](#f8fafc|#f9fafb)['"]/g, "background: 'var(--bg-color)'")
            .replace(/border:\s*['"][^'"]*(#e2e8f0|#e5e7eb)[^'"]*['"]/g, match => match.replace(/(#e2e8f0|#e5e7eb)/g, 'var(--border-color)'))
    }

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
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
console.log('Done.');
