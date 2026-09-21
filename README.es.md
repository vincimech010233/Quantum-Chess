# Quantum Chess

[English](README.md)

Experimento de ajedrez para navegador que introduce movimientos “cuánticos” probabilísticos. Es un prototipo educativo de juego, no una simulación física cuántica.

## Problema

El ajedrez clásico es determinista. Este proyecto explora cómo la incertidumbre modifica las decisiones tácticas manteniendo el tablero y las piezas conocidos.

## Solución

Los jugadores pueden realizar movimientos normales o colocar una pieza apta en una superposición de dos casillas. La medición la hace colapsar a una sola posición e introduce azar controlado en capturas y posicionamiento.

## Funciones

- Modos de movimiento clásico y cuántico
- Superposición en dos posiciones
- Medición voluntaria o provocada por interacción
- Interfaz con React y TypeScript
- Ejecución local sin cuentas ni claves API

## Instalación

```bash
git clone https://github.com/vincimech010233/Quantum-Chess.git
cd Quantum-Chess
npm install
npm run dev
```

## Seguridad

La aplicación funciona localmente y no necesita secretos. No deben versionarse claves API ni archivos `.env.local`.

## Limitaciones

Es un prototipo. Sus reglas cuánticas son una mecánica de juego y no representan un ordenador cuántico real. Las pruebas automatizadas y la cobertura completa de reglas quedan pendientes.

## Licencia

Aún no se ha elegido licencia. Todos los derechos quedan reservados hasta añadir una.
