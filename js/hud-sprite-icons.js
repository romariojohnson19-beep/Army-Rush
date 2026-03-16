// HUD Sprite Icons Renderer
// Replaces emoji resource icons with sprites from resource-sprite-renderer (or fallback shapes)
(function(){
    function drawAll() {
        const canvases = document.querySelectorAll('canvas.resource-icon[data-resource]');
        canvases.forEach(cv => {
            const type = cv.getAttribute('data-resource');
            const ctx = cv.getContext('2d');
            ctx.clearRect(0,0,cv.width,cv.height);
            const size = Math.min(cv.width, cv.height);
            if (window.ResourceSpriteRenderer && ResourceSpriteRenderer.ready) {
                // Draw centered
                ResourceSpriteRenderer.drawResource(ctx, type, size/2, size/2, size);
            } else {
                // Fallback: simple pixel style glyph
                ctx.imageSmoothingEnabled = false;
                ctx.fillStyle = '#111';
                ctx.fillRect(0,0,size,size);
                ctx.fillStyle = '#0ff';
                switch(type){
                    case 'energy': ctx.fillStyle = '#f5d300'; break;
                    case 'metal': ctx.fillStyle = '#7a8a99'; break;
                    case 'crystals': ctx.fillStyle = '#6bf'; break;
                    case 'darkMatter': ctx.fillStyle = '#9400ff'; break;
                }
                for(let i=2;i<size-2;i+=2){
                    ctx.fillRect(i, (i%4===0?2:4), 2, 2);
                }
            }
        });
    }
    // Redraw periodically until sprites ready
    let interval = setInterval(()=>{
        drawAll();
        if (window.ResourceSpriteRenderer && ResourceSpriteRenderer.ready) {
            clearInterval(interval);
        }
    }, 500);
    window.addEventListener('load', drawAll);
})();
