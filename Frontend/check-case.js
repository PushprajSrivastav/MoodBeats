import fs from 'fs';
import path from 'path';

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const match = line.match(/import\s+.*?\s+from\s+['"](.*?)['"]/);
    if (match) {
      const importPath = match[1];
      if (importPath.startsWith('.')) {
        const absolutePath = path.resolve(path.dirname(file), importPath);
        // Add .js or .jsx if no extension
        let toCheck = absolutePath;
        if (!fs.existsSync(absolutePath)) {
            if (fs.existsSync(absolutePath + '.js')) toCheck += '.js';
            else if (fs.existsSync(absolutePath + '.jsx')) toCheck += '.jsx';
        }
        
        // Now check if exact case matches
        const dir = path.dirname(toCheck);
        const base = path.basename(toCheck);
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            if (!files.includes(base)) {
                // If it exists case-insensitively but not sensitively, we found the culprit!
                const lowerFiles = files.map(f => f.toLowerCase());
                if (lowerFiles.includes(base.toLowerCase())) {
                    console.log(`ERROR: Case mismatch in ${file}:${i+1}`);
                    console.log(`Imported: ${importPath}`);
                    console.log(`Actual file should be: ${files[lowerFiles.indexOf(base.toLowerCase())]}`);
                }
            }
        }
      }
    }
  });
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walkDir(p);
        else if (p.endsWith('.js') || p.endsWith('.jsx')) checkFile(p);
    });
}

walkDir('src');
checkFile('app.routes.jsx');
console.log('Check complete.');
