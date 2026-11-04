import { isDown, wasPressed } from './input.js';

export const W = 960;
export const H = 540;

const R = 16;            // radio del tanque
const SPEED = 170;       // px/s
const TURN = 3.2;        // rad/s
const BULLET = 380;      // px/s
const COOLDOWN = 0.45;   // s entre disparos
const MAX_HP = 3;
const WIN = 3;           // rondas para ganar la partida
const MAX_BOUNCES = 2;

const WALLS = [
  { x: 0, y: 0, w: W, h: 16 }, { x: 0, y: H - 16, w: W, h: 16 },
  { x: 0, y: 0, w: 16, h: H }, { x: W - 16, y: 0, w: 16, h: H },
  { x: 440, y: 150, w: 80, h: 20 }, { x: 440, y: 370, w: 80, h: 20 },
  { x: 250, y: 240, w: 20, h: 60 }, { x: 690, y: 240, w: 20, h: 60 },
  { x: 460, y: 250, w: 40, h: 40 },
];

const PLAYERS = [
  { name: 'Jugador 1', color: '#5eead4', spawn: { x: 90, y: H / 2, a: 0 },
    keys: { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', fire: 'KeyF' } },
  { name: 'Jugador 2', color: '#fb923c', spawn: { x: W - 90, y: H / 2, a: Math.PI },
    keys: { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', fire: 'Enter' } },
];

const hitsWall = (x, y, r) => WALLS.some((w) => {
  const cx = Math.max(w.x, Math.min(x, w.x + w.w));
  const cy = Math.max(w.y, Math.min(y, w.y + w.h));
  return (x - cx) ** 2 + (y - cy) ** 2 < r * r;
});

export function createGame() {
  const s = { mode: 'menu', tanks: [], bullets: [], scores: [0, 0], winner: null, timer: 0 };

  const resetRound = () => {
    s.tanks = PLAYERS.map((p) => ({ ...p.spawn, hp: MAX_HP, cd: 0 }));
    s.bullets = [];
    s.mode = 'playing';
  };

  function update(dt) {
    if (s.mode === 'menu' || s.mode === 'matchEnd') {
      if (wasPressed('Space')) { s.scores = [0, 0]; resetRound(); }
      return;
    }
    if (s.mode === 'roundEnd') {
      s.timer -= dt;
      if (s.timer <= 0) resetRound();
      return;
    }

    s.tanks.forEach((t, i) => {
      const k = PLAYERS[i].keys;
      t.a += (Number(isDown(k.right)) - Number(isDown(k.left))) * TURN * dt;
      const v = (Number(isDown(k.up)) - Number(isDown(k.down))) * SPEED * dt;
      const nx = t.x + Math.cos(t.a) * v;
      const ny = t.y + Math.sin(t.a) * v;
      if (!hitsWall(nx, t.y, R)) t.x = nx;
      if (!hitsWall(t.x, ny, R)) t.y = ny;

      t.cd -= dt;
      if (isDown(k.fire) && t.cd <= 0) {
        t.cd = COOLDOWN;
        s.bullets.push({
          x: t.x + Math.cos(t.a) * (R + 8), y: t.y + Math.sin(t.a) * (R + 8),
          vx: Math.cos(t.a) * BULLET, vy: Math.sin(t.a) * BULLET, owner: i, bounces: 0,
        });
      }
    });

    for (const b of s.bullets) {
      b.x += b.vx * dt;
      if (hitsWall(b.x, b.y, 3)) { b.x -= b.vx * dt; b.vx *= -1; b.bounces++; }
      b.y += b.vy * dt;
      if (hitsWall(b.x, b.y, 3)) { b.y -= b.vy * dt; b.vy *= -1; b.bounces++; }
      s.tanks.forEach((t, i) => {
        const canHit = i !== b.owner || b.bounces > 0; // el rebote puede dañar a quien disparó
        if (!b.dead && canHit && (b.x - t.x) ** 2 + (b.y - t.y) ** 2 < (R + 3) ** 2) {
          t.hp--; b.dead = true;
        }
      });
    }
    s.bullets = s.bullets.filter((b) => !b.dead && b.bounces <= MAX_BOUNCES);

    const [d0, d1] = s.tanks.map((t) => t.hp <= 0);
    if (d0 || d1) {
      if (d0 !== d1) { s.winner = d0 ? 1 : 0; s.scores[s.winner]++; } else s.winner = null;
      s.mode = s.scores.some((n) => n >= WIN) ? 'matchEnd' : 'roundEnd';
      s.timer = 1.5;
    }
  }

  return { state: s, update };
}

export function render(ctx, s) {
  ctx.fillStyle = '#0e1a17';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2f4a42';
  for (const w of WALLS) ctx.fillRect(w.x, w.y, w.w, w.h);

  s.tanks.forEach((t, i) => {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.a);
    ctx.fillStyle = PLAYERS[i].color;
    ctx.fillRect(-R, -R * 0.8, R * 2, R * 1.6);
    ctx.fillStyle = '#0e1a17';
    ctx.fillRect(0, -3, R + 10, 6);
    ctx.restore();
  });

  ctx.fillStyle = '#fef08a';
  for (const b of s.bullets) { ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill(); }

  ctx.font = '600 18px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  PLAYERS.forEach((p, i) => {
    const hp = s.tanks[i]?.hp ?? MAX_HP;
    const dots = '●'.repeat(hp) + '○'.repeat(MAX_HP - hp);
    ctx.fillStyle = p.color;
    ctx.textAlign = i ? 'right' : 'left';
    ctx.fillText(i ? `${s.scores[i]}   ${dots}` : `${dots}   ${s.scores[i]}`, i ? W - 32 : 32, 40);
  });

  const name = s.winner === null ? null : PLAYERS[s.winner].name;
  const overlay = {
    menu: ['Duelo de tanques', `Gana quien llegue a ${WIN} rondas. Pulsa Espacio para empezar`],
    roundEnd: [name ? `Punto para ${name}` : 'Empate', 'Siguiente ronda...'],
    matchEnd: [`${name} gana la partida`, 'Pulsa Espacio para la revancha'],
  }[s.mode];
  if (overlay) {
    ctx.fillStyle = 'rgba(10, 18, 16, 0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f1f5f2';
    ctx.textAlign = 'center';
    ctx.font = '700 44px system-ui, sans-serif';
    ctx.fillText(overlay[0], W / 2, H / 2 - 16);
    ctx.font = '400 20px system-ui, sans-serif';
    ctx.fillText(overlay[1], W / 2, H / 2 + 28);
  }
}
