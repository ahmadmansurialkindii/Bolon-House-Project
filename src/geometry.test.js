import test from 'node:test';
import assert from 'node:assert/strict';
import {presets,roofPoint,supportPoints,validate,dimensions} from './geometry.js';
test('roof halves share a ridge and remain above eaves across parameter limits',()=>{
 for(const baseline of Object.values(presets))for(const width of [3,8])for(const rise of [0,2.5]){
 const p={...baseline,width,frontRise:rise,rearRise:2.5-rise};assert.ok(validate(p));
 for(let i=0;i<=100;i++){const t=i/100,r=roofPoint(p,t,0,1),e=roofPoint(p,t,1,1);assert.deepEqual(r,roofPoint(p,t,0,-1).map(v=>Object.is(v,-0)?0:v));assert.ok(r[1]>e[1]);for(let j=0;j<=16;j++)assert.ok(roofPoint(p,t,j/16,1).every(Number.isFinite));}
 assert.ok(Math.abs(Math.max(roofPoint(p,0,0,1)[1],roofPoint(p,1,0,1)[1])-dimensions(p).roofMax)<1e-9);
 }});
test('support grid follows footprint and bay count',()=>{const p=presets.plan,pts=supportPoints(p);assert.equal(pts.length,2*(p.bays+1));assert.equal(pts[0][2],-p.length/2);assert.equal(pts.at(-1)[2],p.length/2);});
