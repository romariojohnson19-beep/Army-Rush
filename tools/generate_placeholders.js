const fs = require('fs');
const path = require('path');

// 1x1 transparent PNG (base64)
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
const buffer = Buffer.from(pngBase64, 'base64');

const files = [
  'assets/ships/rookie.png',
  'assets/ships/vanguard.png',
  'assets/ships/pegasus.png',
  'assets/sprites/ships/rookie.png',
  'assets/sprites/ships/vanguard.png',
  'assets/sprites/ships/pegasus.png',
  'favicon.ico'
];

files.forEach((relative) => {
  const p = path.join(__dirname, '..', relative);
  const dir = path.dirname(p);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, buffer);
    console.log(`Wrote placeholder: ${relative}`);
  } catch (err) {
    console.error(`Failed to write ${relative}:`, err.message);
  }
});

console.log('Placeholder generation complete.');
