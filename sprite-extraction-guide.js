// Script to help extract sprites from the spritesheet
// The spritesheet contains 4 mini bosses arranged in a 2x2 grid:
// Top row: Orange/red ship (left), Blue/teal ship with tentacles (right)  
// Bottom row: Dark military ship (left), Green ship with tentacles (right)

// Based on the sprite sheet, let's define the 4 new mini boss types:
const newMiniBosses = [
    {
        name: 'mini_inferno',
        description: 'Orange armored ship with twin weapons - aggressive fire-based boss',
        position: 'top-left'
    },
    {
        name: 'mini_kraken', 
        description: 'Blue/teal ship with tentacles - agile water/electric-based boss',
        position: 'top-right'
    },
    {
        name: 'mini_fortress',
        description: 'Dark military ship with heavy armor - defensive tank boss', 
        position: 'bottom-left'
    },
    {
        name: 'mini_venom',
        description: 'Green ship with bio-tentacles - poison/organic-based boss',
        position: 'bottom-right'
    }
];

console.log('New Mini Boss Types:');
newMiniBosses.forEach(boss => {
    console.log(`- ${boss.name}: ${boss.description} (${boss.position})`);
});