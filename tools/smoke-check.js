// Simple smoke checker: verifies referenced assets exist in HTML files and parses JS files with acorn
const fs = require('fs');
const path = require('path');
let acorn;
try { acorn = require('acorn'); } catch (e) {
    console.error('Missing dependency: acorn. Run `npm install acorn` in the project root.');
    process.exit(2);
}

const ROOT = path.resolve(__dirname, '..');

function findHtmlFiles(dir) {
    return fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => path.join(dir, f));
}

function extractAssetsFromHtml(html) {
    const re = /(?:src|href)=\s*["']([^"']+)["']/gi;
    const matches = [];
    let m;
    while ((m = re.exec(html)) !== null) {
        matches.push(m[1]);
    }
    return matches;
}

function checkAssets() {
    const htmlFiles = findHtmlFiles(ROOT);
    const missing = [];
    htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const assets = extractAssetsFromHtml(content);
        assets.forEach(asset => {
            if (/^(https?:)?\/\//i.test(asset)) return; // skip external
            if (asset.startsWith('data:')) return;
            // resolve relative to HTML file
            const assetPath = path.resolve(path.dirname(file), asset.split('?')[0].split('#')[0]);
            if (!fs.existsSync(assetPath)) {
                missing.push({ html: path.relative(ROOT, file), asset, resolved: path.relative(ROOT, assetPath) });
            }
        });
    });
    return missing;
}

function walkDir(dir, ext = '.js') {
    let out = [];
    fs.readdirSync(dir).forEach(name => {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            out = out.concat(walkDir(full, ext));
        } else if (stat.isFile() && full.endsWith(ext)) {
            out.push(full);
        }
    });
    return out;
}

function parseJsFiles() {
    const jsDir = path.join(ROOT, 'js');
    if (!fs.existsSync(jsDir)) return { errors: [], scanned: 0 };
    const files = walkDir(jsDir, '.js');
    const errors = [];
    files.forEach(file => {
        const src = fs.readFileSync(file, 'utf8');
        try {
            acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' });
        } catch (err) {
            errors.push({ file: path.relative(ROOT, file), message: err.message });
        }
    });
    return { errors, scanned: files.length };
}

function main() {
    console.log('Running approximate headless smoke-check...');
    const missingAssets = checkAssets();
    const jsResult = parseJsFiles();

    console.log('\nHTML asset check:');
    if (missingAssets.length === 0) {
        console.log('  No missing local asset references found in root HTML files.');
    } else {
        console.log('  Missing assets:');
        missingAssets.forEach(m => {
            console.log(`   - ${m.html} -> ${m.asset} (resolved: ${m.resolved})`);
        });
    }

    console.log(`\nJS parse check: scanned ${jsResult.scanned} files.`);
    if (jsResult.errors.length === 0) {
        console.log('  No syntax errors detected by acorn parse in the `js/` folder.');
    } else {
        console.log('  Syntax errors found:');
        jsResult.errors.forEach(e => {
            console.log(`   - ${e.file}: ${e.message}`);
        });
    }

    const problems = missingAssets.length + jsResult.errors.length;
    if (problems === 0) {
        console.log('\nSmoke-check completed: no issues found.');
        process.exit(0);
    } else {
        console.log(`\nSmoke-check completed: ${problems} issue(s) found.`);
        process.exit(3);
    }
}

main();
