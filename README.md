# Vätskelabbet

A 2D liquid (FLIP/PIC) that scales from 2×2 LEDs to full screens. `fluid-core.js` is the simulation itself, with no DOM and no allocations per step. `index.html` is the test bench with tilt, stirring and sliders.

## Run

```
node serve.js
```

- PC: http://localhost:8090
- Anyone, any phone: https://ojojboll-ui.github.io/FluidSim/ (GitHub Pages)
- Phone (same Wi-Fi): https://192.168.0.5:8443. The Controls panel on the PC also shows a QR code.
  The certificate is self-signed. In Safari: *Show details → visit this website*. Then tap **Tap for sensor** so iOS asks for motion access.
  Lock the screen rotation, otherwise the page flips when you tilt.

## Three resolutions, chosen independently

| Choice | What it decides | Typical |
|---|---|---|
| `cellsX` | simulation cells across the width (the cost) | LED 8×8: 16–24 · phone: 40 · PC: 64–128 |
| field | smoothed coverage at 2× the cells (`computeField`) | automatic |
| output | `rasterize(w, h, …)` at any size; large pixels average, small ones interpolate | 8×8 LEDs … 4K via GPU |

Simulate at roughly twice the resolution you show: an 8×8 matrix looks best from a sim 16–24 cells wide.
On the CPU, the ceiling is around 100 cells across on a phone. Beyond that, the solver needs to move to the GPU.

## API

```js
const sim = new FluidCore.FluidSim({ cellsX: 24, aspect: 1, shape: 'box' /* 'circle' */, width: 0.5 /* m */, fill: 0.4,
  params: { flipRatio: 0.9, damping: 0.05, driftK: 1, pressureIters: 30 } });
sim.gx = 0; sim.gy = 9.81;                 // m/s², y down; from the accelerometer: -(accIncludingGravity)
sim.obstacle = { active: true, x, y, vx, vy, r };  // finger/object that stirs
sim.step(dt);
sim.computeField();
sim.rasterize(8, 8, cov, spd);             // cov 0..1 per LED (-1 outside a round tank); apply gamma ~2.2 for PWM
```

`sim.setWidth(m)` changes the tank size without restarting. `sim.build({...})` rebuilds everything.

## Porting

Every array is created in `build()`, and `step()` only does arithmetic on Float32/Int32 arrays. The code translates line by line to C for ESP32/RP2040 (static arrays, `float`).

Test the core offline: `node test/coretest.js`. It sweeps 4–200 cells, box and circle, and checks that no values are NaN, nothing leaks out of the tank and the volume is preserved.

Algorithm after Matthias Müller, *Ten Minute Physics* #18 (FLIP), written from scratch here.
