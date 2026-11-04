const { FluidSim } = require('../fluid-core.js');
const sim = new FluidSim({ cellsX: 128, aspect: 1, shape: 'box', width: 1, fill: 0.4 });
for (let k = 0; k < 120; k++) sim.step(1/60);
const parts = ['_integrate','_pushApart','_collide','_toGrid','_updateDensity','_project','_toParticles'];
const T = {}; for (const p of parts) { const f = sim[p].bind(sim); T[p]=0; sim[p] = (...a) => { const t=performance.now(); f(...a); T[p]+=performance.now()-t; }; }
let sub=0; const N=60; for (let k=0;k<N;k++){ sim.gx=9.81*Math.sin(k/20); sim.step(1/60); sub+=sim.lastSubsteps; }
for (const p of parts) console.log(p.padEnd(15), (T[p]/N).toFixed(2), 'ms/frame');
console.log('avg substeps', (sub/N).toFixed(2), 'maxSpeed', sim.maxSpeed.toFixed(2), 'cells/frame', (sim.maxSpeed/60/sim.h).toFixed(2));
let t=performance.now(); for (let k=0;k<30;k++) sim.computeField(); console.log('computeField', ((performance.now()-t)/30).toFixed(2));
