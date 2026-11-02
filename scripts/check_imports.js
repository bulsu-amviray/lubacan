const fs = require('fs');
const path = require('path');

function getAllJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllJsFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const jsFiles = getAllJsFiles(path.join(process.cwd(), 'frontend', 'js'));

const importRegex = /(?:from\s+['"]([^'"]+)['"])|(?:import\s*['"]([^'"]+)['"])/g;

let brokenImports = [];

for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1] || match[2];
    if (importPath.startsWith('.')) {
      const resolved = path.resolve(path.dirname(file), importPath);
      if (!fs.existsSync(resolved)) {
        brokenImports.push({ file: path.relative(process.cwd(), file), importPath, resolved: path.relative(process.cwd(), resolved) });
      }
    } else if (!importPath.startsWith('http') && !importPath.startsWith('/')) {
      brokenImports.push({ file: path.relative(process.cwd(), file), importPath, reason: 'bare specifier' });
    }
  }
}

console.log('Broken imports count:', brokenImports.length);
if (brokenImports.length > 0) {
  console.log(JSON.stringify(brokenImports, null, 2));
}
