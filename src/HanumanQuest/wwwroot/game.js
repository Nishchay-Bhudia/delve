// ---------- Hanuman's Leap: canvas renderer + input poller ----------
// The C# side owns all game state and math; this file only draws what it's
// told to draw and reports raw input. One render() call per frame, one
// getInput() call per frame — no per-key interop chatter.

let canvas, ctx, W, H;

const keys = Object.create(null);
let mouseDx = 0;

const CREATURE_EMOJI = { 1: '🐒', 2: '🐘', 3: '🦚' };
const WALL_COLORS = {
  1: [255, 169, 44],   // outer wall — saffron
  2: [35, 187, 168],   // pillar — teal
};

export function init(canvasId, width, height) {
  canvas = document.getElementById(canvasId);
  W = canvas.width = width;
  H = canvas.height = height;
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  window.addEventListener('keydown', (e) => {
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  canvas.addEventListener('click', () => {
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
  });
  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) mouseDx += e.movementX;
  });
}

export function getInput() {
  const forward = (keys['KeyW'] || keys['ArrowUp']) ? 1 : 0;
  const back = (keys['KeyS'] || keys['ArrowDown']) ? 1 : 0;
  const left = (keys['KeyA'] || keys['ArrowLeft']) ? 1 : 0;
  const right = (keys['KeyD'] || keys['ArrowRight']) ? 1 : 0;
  const watch = keys['Space'] ? 1 : 0;
  const dx = mouseDx;
  mouseDx = 0;
  return [forward, back, left, right, dx, watch];
}

export function render(wallData, spriteData, hudText, toastText, won) {
  if (!ctx) return;

  // Sky (top half) and floor (bottom half)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H / 2);
  skyGrad.addColorStop(0, '#58C4F0');
  skyGrad.addColorStop(1, '#A8E4FA');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H / 2);

  const floorGrad = ctx.createLinearGradient(0, H / 2, 0, H);
  floorGrad.addColorStop(0, '#4a3d2a');
  floorGrad.addColorStop(1, '#2c2318');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, H / 2, W, H / 2);

  // Walls: wallData is [dist0, type0, dist1, type1, ...], one pair per column of width 1px.
  const cols = wallData.length / 2;
  for (let i = 0; i < cols; i++) {
    const dist = Math.max(0.15, wallData[i * 2]);
    const type = wallData[i * 2 + 1];
    if (type === 0) continue;

    const sliceH = Math.min(H, H / dist);
    const shade = Math.max(0.25, 1 - dist / 12);
    const [r, g, b] = WALL_COLORS[type] || [120, 120, 120];
    ctx.fillStyle = `rgb(${r * shade | 0}, ${g * shade | 0}, ${b * shade | 0})`;
    ctx.fillRect(i, (H - sliceH) / 2, 1, sliceH);
  }

  // Sprites: spriteData is [screenXFrac, dist, typeCode, calmProgress, ...]
  const spriteCount = spriteData.length / 4;
  for (let i = 0; i < spriteCount; i++) {
    const sx = spriteData[i * 4] * W;
    const dist = Math.max(0.4, spriteData[i * 4 + 1]);
    const type = spriteData[i * 4 + 2];
    const calm = spriteData[i * 4 + 3];
    const size = Math.min(220, (H / dist) * 0.9);
    const sy = H / 2 + size * 0.05;

    if (calm > 0) {
      ctx.save();
      ctx.globalAlpha = 0.25 + calm * 0.35;
      ctx.fillStyle = '#FFD166';
      ctx.beginPath();
      ctx.arc(sx, sy, size * (0.4 + calm * 0.35), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.font = `${size}px "Baloo 2", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(CREATURE_EMOJI[type] || '❓', sx, sy);
  }

  // HUD
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '700 15px "Baloo 2", sans-serif';
  ctx.fillStyle = 'rgba(58,46,69,.55)';
  ctx.fillRect(0, 0, W, 34);
  ctx.fillStyle = '#FFF6E8';
  ctx.fillText(hudText, 12, 9);

  if (toastText) {
    ctx.textAlign = 'center';
    ctx.font = '700 15px "Baloo 2", sans-serif';
    const pad = 14;
    const tw = ctx.measureText(toastText).width;
    ctx.fillStyle = 'rgba(58,46,69,.82)';
    ctx.fillRect(W / 2 - tw / 2 - pad, H - 56, tw + pad * 2, 32);
    ctx.fillStyle = '#FFD166';
    ctx.fillText(toastText, W / 2, H - 48);
  }

  if (won) {
    ctx.fillStyle = 'rgba(58,46,69,.55)';
    ctx.fillRect(0, 0, W, H);
  }
}
