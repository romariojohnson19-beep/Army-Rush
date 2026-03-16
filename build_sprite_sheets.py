#!/usr/bin/env python3
"""
Build sprite sheets from individual PNG files.
Combines 4 resource sprites into resources.png (4x1 grid)
and 12 powerup sprites into powerups.png (4x3 grid).
"""

from PIL import Image
import os

def build_sheet(input_dir, output_path, num_sprites, cols):
    """
    Build a sprite sheet from numbered PNG files.
    Args:
        input_dir: Directory containing PNG files (resource_01.png, resource_02.png, etc.)
        output_path: Output sprite sheet path
        num_sprites: Number of sprites to include
        cols: Number of columns in the grid
    """
    if not os.path.exists(input_dir):
        print(f"❌ Directory not found: {input_dir}")
        return False
    
    # Determine sprite size and grid dimensions
    rows = (num_sprites + cols - 1) // cols
    
    # Load first sprite to get dimensions
    first_file = os.path.join(input_dir, 'resource_01.png' if 'resource' in input_dir else 'powerup_01.png')
    if not os.path.exists(first_file):
        print(f"❌ First sprite not found: {first_file}")
        return False
    
    first_img = Image.open(first_file)
    sprite_width, sprite_height = first_img.size
    print(f"📐 Sprite size: {sprite_width}x{sprite_height}")
    
    # Create output sheet
    sheet_width = sprite_width * cols
    sheet_height = sprite_height * rows
    sheet = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))
    print(f"📋 Sheet size: {sheet_width}x{sheet_height} ({cols}x{rows} grid)")
    
    # Paste sprites into sheet
    prefix = 'resource' if 'resource' in input_dir else 'powerup'
    for i in range(num_sprites):
        col = i % cols
        row = i // cols
        x = col * sprite_width
        y = row * sprite_height
        
        filename = f"{prefix}_{i+1:02d}.png"
        filepath = os.path.join(input_dir, filename)
        
        if os.path.exists(filepath):
            sprite = Image.open(filepath).convert('RGBA')
            sheet.paste(sprite, (x, y))
            print(f"  ✓ {i+1:2d}. ({col},{row}) {filename}")
        else:
            print(f"  ✗ {i+1:2d}. Missing: {filename}")
    
    # Save sheet
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    sheet.save(output_path, 'PNG')
    print(f"\n✅ Saved: {output_path}")
    return True

# Build both sheets
print("🔨 Building Resource Sprite Sheet...")
build_sheet(
    'c:\\Users\\ASZIAM\\Desktop\\ROKOT\\Army Rush\\assets\\resources',
    'c:\\Users\\ASZIAM\\Desktop\\ROKOT\\Army Rush\\assets\\resources\\resources.png',
    4,
    4
)

print("\n🔨 Building PowerUp Sprite Sheet...")
build_sheet(
    'c:\\Users\\ASZIAM\\Desktop\\ROKOT\\Army Rush\\assets\\powerups',
    'c:\\Users\\ASZIAM\\Desktop\\ROKOT\\Army Rush\\assets\\powerups\\powerups.png',
    12,
    4
)

print("\n🎉 Done!")
