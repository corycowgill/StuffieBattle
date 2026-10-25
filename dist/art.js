// Pre-sized textures keep full-resolution source art out of the per-frame draw loop.
function texture(url, { trim = false, size = 0 } = {}) {
  const asset = { image: null, ready: false, failed: false };
  asset.promise = new Promise(resolve => {
    const source = new Image();
    source.onload = () => {
      let x = 0, y = 0, width = source.naturalWidth, height = source.naturalHeight;
      if (trim || size) {
        const scratch = document.createElement('canvas');
        scratch.width = width; scratch.height = height;
        const paint = scratch.getContext('2d', { willReadFrequently: true });
        paint.drawImage(source, 0, 0);
        if (trim) {
          const pixels = paint.getImageData(0, 0, width, height).data;
          let left = width, top = height, right = 0, bottom = 0;
          for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
              if (pixels[(row * width + col) * 4 + 3] > 24) {
                left = Math.min(left, col); right = Math.max(right, col);
                top = Math.min(top, row); bottom = Math.max(bottom, row);
              }
            }
          }
          if (right >= left && bottom >= top) { x = left; y = top; width = right - left + 1; height = bottom - top + 1; }
        }
        const scale = size ? Math.min(1, size / Math.max(width, height)) : 1;
        const atlas = document.createElement('canvas');
        atlas.width = Math.max(1, Math.ceil(width * scale)); atlas.height = Math.max(1, Math.ceil(height * scale));
        atlas.getContext('2d').drawImage(source, x, y, width, height, 0, 0, atlas.width, atlas.height);
        asset.image = atlas;
      } else asset.image = source;
      asset.ready = true; resolve(asset);
    };
    source.onerror = () => { asset.failed = true; resolve(asset); };
    source.src = url;
  });
  return asset;
}
export const terrain = texture('assets/buttonwood-v2.png');
export const foes = {
  dust: texture('assets/dust-bunny-v2.png', { trim: true, size: 192 }),
  sock: texture('assets/sock-goblin-v2.png', { trim: true, size: 192 }),
  brute: texture('assets/patchwork-brute-v2.png', { trim: true, size: 320 })
};
export const artReady = Promise.all([terrain.promise, ...Object.values(foes).map(asset => asset.promise)]);
