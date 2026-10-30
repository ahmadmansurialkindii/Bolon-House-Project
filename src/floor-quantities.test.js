import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {baseline,deform} from './dae-deform.js';
import {buildFamilyComponents,familyTransform} from './family-parameters.js';
import {componentQuantities} from './component-quantities.js';
import {sourceId,isFloorPlatform} from './floor-boards.js';
import {measure} from './element-parameters.js';

const data=JSON.parse(fs.readFileSync(new URL('../public/models/toba-baseline.json',import.meta.url)));
const originals=data.instances.map(item=>{
 const geometry=data.geometries[item.geometry],matrix=new THREE.Matrix4().set(...item.matrix),base=Float64Array.from(geometry.positions);
 for(let i=0;i<base.length;i+=3)new THREE.Vector3().fromArray(base,i).applyMatrix4(matrix).toArray(base,i);
 return {...item,base,indices:geometry.indices};
});
const topArea=item=>{
 const y=measure(item.base).box.max.y;let area=0;
 for(let i=0;i<item.indices.length;i+=3){
  const v=item.indices.slice(i,i+3).map(j=>new THREE.Vector3().fromArray(item.base,j*3));
  if(v.every(p=>Math.abs(p.y-y)<1e-6))area+=new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0])).length()/2;
 }
 return area;
};

test('both source platforms belong to FLOOR; baseline shapes and the stair opening are retained',()=>{
 const items=buildFamilyComponents(originals,baseline),floors=items.filter(i=>i.group==='floor');
 assert.equal(floors.length,2);
 for(const floor of floors){const source=originals.find(i=>i.name===floor.name);assert.deepEqual(floor.base,source.base);assert.deepEqual(floor.indices,source.indices);}
 assert.equal(items.some(i=>i.group==='ties'&&sourceId(i)===64),false);
});

test('individual papan preserve source surface area and never cover the entrance opening',()=>{
 for(const count of [2,13,60]){
  const items=buildFamilyComponents(originals,{...baseline,floorBoardCount:count,floorBoardGap:0});
  for(const source of originals.filter(isFloorPlatform)){
   const boards=items.filter(i=>i.group==='floor'&&sourceId(i)===sourceId(source));
   assert.equal(boards.length,count);
   assert.ok(Math.abs(boards.reduce((sum,i)=>sum+topArea(i),0)-topArea(source))<1e-7);
   for(const board of boards){
    assert.ok([...board.base].every(Number.isFinite));
    assert.ok(board.indices.every(i=>i>=0&&i<board.base.length/3));
    if(sourceId(source)===64)for(let i=0;i<board.indices.length;i+=3){
     const triangle=board.indices.slice(i,i+3).map(j=>new THREE.Vector3().fromArray(board.base,j*3));
     const centre=triangle.reduce((a,b)=>a.add(b),new THREE.Vector3()).divideScalar(3);
     assert.ok(!(centre.x>3.500001&&centre.x<4.699999&&centre.z>-2.399999));
    }
   }
  }
 }
});

test('board gaps remain in metres when width changes and thickness stays anchored to each top surface',()=>{
 const p={...baseline,floorBoardCount:20,floorBoardGap:.008,widthScale:1.4,floorThicknessScale:2};
 const items=buildFamilyComponents(originals,p);
 const transform=item=>familyTransform(item,Float64Array.from(item.base,(_,i)=>{const j=i-i%3;return deform(item.base[j],item.base[j+1],item.base[j+2],p)[i%3];}),p);
 const boards=items.filter(i=>i.group==='floor'&&sourceId(i)===54).map(i=>({item:i,bounds:measure(transform(i))})).sort((a,b)=>a.bounds.box.min.x-b.bounds.box.min.x);
 for(let i=1;i<boards.length;i++)assert.ok(Math.abs(boards[i].bounds.box.min.x-boards[i-1].bounds.box.max.x-.008)<1e-8);
 for(const {item,bounds}of boards){const before=measure(item.base);assert.ok(Math.abs(bounds.size.y-before.size.y*2)<1e-8);assert.ok(Math.abs(bounds.box.max.y-deform(0,before.box.max.y,0,p)[1])<1e-8);}
});

test('quantities partition every model piece once and separate frame assemblies from member totals',()=>{
 const initial=buildFamilyComponents(originals,baseline),q=componentQuantities(initial);
 assert.equal(q.total,251);assert.equal(q.ground,1);assert.equal(q.counts.columns,27);assert.equal(q.counts.stones,28);assert.equal(q.roofFrames,5);assert.equal(q.counts.frameMembers,20);
 assert.equal(q.total+q.ground,initial.length);
 const p={...baseline,columnCount:12,frameCount:9,roofRibCount:35,roofBattenCount:40,stepCount:11,tieLevelCount:6,roundBeamCount:4,upperBeamCount:5,floorBoardCount:24};
 const items=buildFamilyComponents(originals,p),changed=componentQuantities(items);
 assert.deepEqual(changed.counts,{columns:33,stones:33,ties:30,lowerFloor:24,upperFloor:24,roundBeams:4,upperBeams:5,edgeBeams:2,beamCaps:6,frameMembers:36,roofRibs:70,roofLongitudinals:80,otherRoof:13,steps:11,stairSupports:2});
 assert.equal(changed.roofFrames,9);assert.equal(changed.total,373);assert.equal(changed.total+changed.ground,items.length);
 const unchanged=componentQuantities(buildFamilyComponents(originals,{...p,columnDiameter:.4,roofScale:1.2}));assert.deepEqual(unchanged,changed);
 assert.throws(()=>buildFamilyComponents(originals,{...baseline,floorBoardCount:2.5}),/Invalid floorBoardCount/);
 assert.throws(()=>buildFamilyComponents(originals,{...baseline,floorBoardGap:.1}),/Invalid floorBoardGap/);
});
