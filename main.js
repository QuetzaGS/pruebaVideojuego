import './style.css';
import { W, H, createGame, render } from './game.js';
import { endFrame } from './input.js';

const canvas = document.getElementById('game');
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d');
const game = createGame();

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05); // evita saltos al cambiar de pestaña
  last = now;
  game.update(dt);
  endFrame();
  render(ctx, game.state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
