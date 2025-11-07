### # 31_TRIVIA_WEB

Proyecto: Trivia Challenge Web  
Instrucciones rápidas para ejecutar en localhost.

## Estructura
- `index.html` — interfaz
- `style.css` — estilos
- `app.js` — lógica del juego (fetch a `questions.json`)
- `questions.json` — banco de preguntas
- `assets/` — imágenes opcionales

## Ejecutar localmente
1. Clona o copia esta carpeta a tu equipo.
2. Desde la carpeta `31_TRIVIA_WEB`, lanza un servidor local (una de estas opciones):
   - Con Live Server (VSCode): botón **Go Live**.

> Nota: `fetch('questions.json')` requiere servidor (no funciona con `file://`).

## Reglas rápidas
- Se muestran 6 preguntas aleatorias.
- Temporizador por pregunta: 20s.
- Aciertos/fallos se guardan en `localStorage`.
- Sonido sintetizado para acierto/fallo.
- Añade más preguntas editando `questions.json`.

## Mejoras propuestas (si hay tiempo)
- Sistema de niveles (principiante/intermedio/difícil).
- Animación de círculo de tiempo.
- Reproducir efectos sonoros reales (archivos .mp3).
- Guardar historial de partidas y mejor puntuación.