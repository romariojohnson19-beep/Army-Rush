#!/usr/bin/env node
/**
 * Build sprite sheets from individual PNG files using sharp (lightweight image processor).
 * Combines 4 resource sprites into resources.png (1x4 grid)
 * and 12 powerup sprites into powerups.png (3x4 grid).
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (err) {
    console.error('❌ sharp library not found. Installing...');
    const { execSync } = require('child_process');
    try {
        execSync('npm install --save-dev sharp', { stdio: 'inherit' });
        sharp = require('sharp');
    } catch (installErr) {
        console.error('❌ Failed to install sharp. Falling back to manual sheet creation.');
        manualFallback();
        process.exit(0);
    }
}

async function buildSheet(inputDir, outputPath, numSprites, cols) {
    const rows = Math.ceil(numSprites / cols);
    const prefix = inputDir.includes('resource') ? 'resource' : 'powerup';
    
    // Load first sprite to get dimensions
    const firstFile = path.join(inputDir, `${prefix}_01.png`);
    if (!fs.existsSync(firstFile)) {
        console.error(`❌ First sprite not found: ${firstFile}`);
        return false;
    }

    const firstMeta = await sharp(firstFile).metadata();
    const spriteWidth = firstMeta.width;
    const spriteHeight = firstMeta.height;
    const sheetWidth = spriteWidth * cols;
    const sheetHeight = spriteHeight * rows;

    console.log(`📐 Sprite size: ${spriteWidth}x${spriteHeight}`);
    console.log(`📋 Sheet size: ${sheetWidth}x${sheetHeight} (${cols}x${rows} grid)`);

    // Build composite array
    const composites = [];
    for (let i = 0; i < numSprites; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * spriteWidth;
        const y = row * spriteHeight;

        const filename = `${prefix}_${String(i + 1).padStart(2, '0')}.png`;
        const filepath = path.join(inputDir, filename);

        if (fs.existsSync(filepath)) {
            composites.push({
                input: filepath,
                left: x,
                top: y
            });
            console.log(`  ✓ ${String(i + 1).padStart(2, ' ')}. (${col},${row}) ${filename}`);
        } else {
            console.log(`  ✗ ${String(i + 1).padStart(2, ' ')}. Missing: ${filename}`);
        }
    }

    // Create blank sheet and composite sprites
    if (composites.length > 0) {
        try {
            // Start with blank canvas
            let image = sharp({
                create: {
                    width: sheetWidth,
                    height: sheetHeight,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                }
            });

            // Composite all sprites
            image = image.composite(composites);

            // Ensure output directory exists
            const outDir = path.dirname(outputPath);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            // Save
            await image.png().toFile(outputPath);
            console.log(`✅ Saved: ${outputPath}\n`);
            return true;
        } catch (err) {
            console.error(`❌ Failed to create sheet: ${err.message}`);
            return false;
        }
    }
    return false;
}

async function main() {
    console.log('🔨 Building Resource Sprite Sheet...\n');
    await buildSheet(
        'c:\\Users\\ASZIAM\\Desktop\\ROKOT\\Army Rush\\assets\\resources',
        'c:\\Users\\ASZIAM\\Desktop\\ROKOT\\Army Rush\\assets\\resources\\resources.png',
        4,
        4
    );

    console.log('🔨 Building PowerUp Sprite Sheet...\n');
    await buildSheet(
        'c:\\Users\\ASZIAM\\Desktop\\ROKOT\\Army Rush\\assets\\powerups',
        'c:\\Users\\ASZIAM\\Desktop\\ROKOT\\Army Rush\\assets\\powerups\\powerups.png',
        12,
        4
    );

    console.log('🎉 Done!');
}

function manualFallback() {
    console.log('⚠️  Skipping sheet generation. Individual sprites will be used as fallback.');
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
