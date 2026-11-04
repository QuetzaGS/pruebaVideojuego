# Duelo de tanques

Juego de dos jugadores en el mismo teclado, hecho con Vite y Canvas 2D (sin frameworks ni backend). Gana quien llegue primero a 3 rondas; las balas rebotan hasta 2 veces.

| | Mover | Disparar |
|---|---|---|
| Jugador 1 | W A S D | F |
| Jugador 2 | Flechas | Enter |

Espacio inicia la partida y la revancha. Requiere teclado físico.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Subir a GitHub (desde el teléfono)

1. Crea un repositorio nuevo en github.com y abre **Add file → Upload files**.
2. Selecciona todos los archivos de esta carpeta (no hay subcarpetas) y pulsa **Commit changes**.

Desde una computadora también funciona con `git init`, `git add .`, `git commit` y `git push`.

## Desplegar en Vercel

1. En vercel.com elige **Add New → Project** e importa el repositorio.
2. Vercel detecta Vite solo (build `npm run build`, salida `dist`). Pulsa **Deploy**.
3. Cada `git push` a `main` publica una nueva versión; las ramas generan previews.

## Estructura

- `input.js`: estado del teclado.
- `game.js`: reglas, física y dibujo.
- `main.js`: bucle principal con paso de tiempo variable.

## Siguientes pasos

- Multijugador en línea: Vercel usa funciones serverless y no mantiene WebSockets. Opciones: WebRTC con PeerJS (sin servidor propio) o un servicio de tiempo real como PartyKit o Ably.
- Mapas distintos, power-ups y controles táctiles.
