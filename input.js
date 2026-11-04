const down = new Set();
const pressed = new Set();

addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
  if (!e.repeat) pressed.add(e.code);
  down.add(e.code);
});
addEventListener('keyup', (e) => down.delete(e.code));
addEventListener('blur', () => down.clear());

export const isDown = (code) => down.has(code);
export const wasPressed = (code) => pressed.has(code);
export const endFrame = () => pressed.clear();
