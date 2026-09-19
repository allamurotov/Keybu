const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./app');
for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    // Find all function or const Component = ... declarations
    const componentRegex = /(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/g;
    let match;
    while ((match = componentRegex.exec(content)) !== null) {
        const compName = match[1];
        // Check if it renders itself `<CompName ` or `<CompName>` or `<CompName/>`
        const selfRenderRegex = new RegExp(`<${compName}[\\s>/]`, 'g');
        if (selfRenderRegex.test(content)) {
            console.log(`POTENTIAL RECURSION in ${file}: Component ${compName} renders itself.`);
        }
    }
}
