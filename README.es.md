# Quantum Chess

[English](README.md)

Experimento de ajedrez para navegador con movimientos probabilísticos. Es un prototipo educativo de juego, no una simulación física cuántica ni un motor de ajedrez completo.

## Reglas y alcance

- Los movimientos normales usan los patrones implementados en `utils/chessLogic.ts`. Una captura elimina la pieza rival. Capturar un rey termina la partida.
- Una pieza distinta del rey puede dividirse entre dos casillas alcanzables, **vacías y distintas**. La división no captura; una pieza en superposición debe medirse antes de volver a moverse.
- Pulsar una pieza cuántica propia la mide en una de sus dos casillas y termina el turno.
- Atacar una pieza cuántica rival la mide primero. Si permanece en la casilla atacada, se elimina; si no, sobrevive en su otra casilla. La pieza atacante se mueve al destino elegido en ambos casos.
- La medición elige cada posición con la misma probabilidad mediante `Math.random()`. Es una mecánica de juego.
- No se implementan jaque/jaque mate, enroque, captura al paso ni promoción. Los peones que llegan a la última fila permanecen allí y no pueden seguir avanzando.

## Garantías de estado y pruebas

Las coordenadas deben ser enteros entre 0 y 7, los identificadores deben ser únicos y cada casilla puede contener una sola pieza, incluidas todas las posiciones de superposición. Una pieza tiene una posición o dos posiciones distintas; los reyes no se dividen. Una transición inválida devuelve el tablero original sin modificarlo. Estos invariantes describen estados representables, no toda la legalidad del ajedrez.

Las funciones puras de movimiento, división y medición comparten un pequeño validador de estado. La interfaz React usa esas funciones y cancela las animaciones pendientes al reiniciar o desmontarse. Las regresiones cubren bordes de peones, capturas normales/cuánticas, ocupación aliada, entradas inválidas, actualizaciones sin mutación y unicidad. También se comprueban los límites de los movimientos para cada tipo de pieza, color y casilla de origen.

## Instalación reproducible

Usa Node.js 22.12 o posterior dentro de la serie 22.x, o Node.js 24 o posterior. El manifiesto declara el mismo rango compatible; CI usa Node.js 22.

```bash
git clone https://github.com/vincimech010233/Quantum-Chess.git
cd Quantum-Chess
npm ci
npm test
npm run typecheck
npm run build
npm audit
npm run dev
```

Abre `http://127.0.0.1:3000`. Para inspeccionar la aplicación compilada, ejecuta `npm run preview` y utiliza la URL local que indique. Ambos servidores escuchan solo en loopback por defecto.

La instalación requiere acceso al registro npm. Después, la compilación y la aplicación usan dependencias locales: Tailwind se compila a CSS y Vite incluye React en el bundle. No hay recursos de CDN en ejecución, cuentas, llamadas API, integración Gemini ni claves API. Sirve localmente el directorio generado `dist/`; no se admite abrir el HTML directamente mediante `file://`. No se ofrece service worker ni función de instalación offline.

## Arquitectura

- `App.tsx`: selección, turnos y ciclo de animación
- `components/`: representación del tablero y las piezas
- `utils/chessLogic.ts`: patrones de movimiento y transiciones de estado validadas
- `types.ts`: tipos de dominio
- `index.css` y `tailwind.config.js`: estilos locales y animaciones existentes

GitHub Actions ejecuta instalación limpia, pruebas, comprobación TypeScript independiente, build y auditoría de dependencias. El lockfile se versiona; `dist/`, las instalaciones de dependencias, archivos de entorno locales y artefactos de pruebas se ignoran. No añadas credenciales ni secretos de entorno.

## Limitaciones y procedencia

Este prototipo no tiene IA, backend, multijugador, partidas persistentes ni validación completa de reglas de ajedrez. Superar las regresiones no constituye una prueba formal ni una simulación de física cuántica.

La procedencia global sigue sin verificarse, incluidos los dibujos SVG preexistentes de `components/ChessPiece.tsx` y el código de plantilla. La reparación no modifica esos assets, no los presenta como trabajo original ni les aplica otra licencia. No se ha elegido una licencia global. Las dependencias conservan sus propias licencias.
