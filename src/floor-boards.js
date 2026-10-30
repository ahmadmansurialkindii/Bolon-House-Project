import * as THREE from 'three';
import {measure} from './element-parameters.js';

export const sourceId=item=>Number((item.parentName||item.name).replace('empty_','').split('::')[0]);
export const isFloorPlatform=item=>[54,64].includes(sourceId(item));

// Follow the boundary of the source top faces, including the stair opening.
export function floorFootprint(item){
 const top=measure(item.base).box.max.y,edges=new Map(),points=new Map();
 const key=v=>`${v[0].toFixed(6)},${v[2].toFixed(6)}`;
 for(let j=0;j<item.indices.length;j+=3){
  const tri=item.indices.slice(j,j+3).map(i=>Array.from(item.base.slice(i*3,i*3+3)));
  if(!tri.every(v=>Math.abs(v[1]-top)<1e-6))continue;
  for(let k=0;k<3;k++){
   const a=key(tri[k]),b=key(tri[(k+1)%3]),edge=[a,b].sort().join('/');
   points.set(a,[tri[k][0],tri[k][2]]);points.set(b,[tri[(k+1)%3][0],tri[(k+1)%3][2]]);
   if(edges.has(edge))edges.delete(edge);else edges.set(edge,[a,b]);
  }
 }
 const neighbours=new Map();for(const[a,b]of edges.values())for(const[x,y]of [[a,b],[b,a]]){if(!neighbours.has(x))neighbours.set(x,[]);neighbours.get(x).push(y);}
 if(!neighbours.size||[...neighbours.values()].some(v=>v.length!==2))throw Error('Unsupported floor outline');
 const start=neighbours.keys().next().value,outline=[];let previous=null,current=start;
 do{outline.push(points.get(current));const next=neighbours.get(current).find(v=>v!==previous);previous=current;current=next;if(outline.length>neighbours.size)throw Error('Invalid floor outline');}while(current!==start);
 if(outline.length!==neighbours.size)throw Error('Floor outline contains multiple boundaries');
 return outline;
}

function clip(polygon,bound,keepGreater){
 const out=[],inside=p=>keepGreater?p[0]>=bound-1e-9:p[0]<=bound+1e-9;
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],aIn=inside(a),bIn=inside(b);
  if(aIn)out.push(a);
  if(aIn!==bIn){const t=(bound-a[0])/(b[0]-a[0]);out.push([bound,a[1]+(b[1]-a[1])*t]);}
 }
 return out.filter((v,i)=>{const next=out[(i+1)%out.length];return Math.hypot(v[0]-next[0],v[1]-next[1])>1e-8;});
}

function extrude(polygon,minY,maxY){
 // CCW in X/Z gives an upward-facing top when triangle winding is reversed.
 const shape=polygon.map(([x,z])=>new THREE.Vector2(x,z));
 if(THREE.ShapeUtils.isClockWise(shape))shape.reverse();
 const n=shape.length,base=Float64Array.from([minY,maxY].flatMap(y=>shape.flatMap(v=>[v.x,y,v.y]))),indices=[];
 for(const[a,b,c]of THREE.ShapeUtils.triangulateShape(shape,[])){indices.push(a,b,c,n+c,n+b,n+a);}
 for(let a=0;a<n;a++){const b=(a+1)%n;indices.push(a,n+a,n+b,a,n+b,b);}
 // Separate face vertices so board edges stay crisp under vertex-normal lighting.
 return {base:Float64Array.from(indices.flatMap(i=>Array.from(base.slice(i*3,i*3+3)))),indices:indices.map((_,i)=>i)};
}

export function divideFloor(item,count,gap,widthScale=1){
 const floor={...item,group:'floor'};
 if(count===1)return [floor];
 const {box,size}=measure(item.base),sourceGap=gap/widthScale,width=(size.x-sourceGap*(count-1))/count;
 if(width<=0)throw Error('Floor board gap exceeds the platform width');
 const outline=floorFootprint(item),boards=[];
 for(let i=0;i<count;i++){
  const left=box.min.x+i*(width+sourceGap),right=left+width;
  const polygon=clip(clip(outline,left,true),right,false);
  if(polygon.length<3)continue;
  boards.push({...floor,...extrude(polygon,box.min.y,box.max.y),name:`floor_board_${sourceId(item)}_${i}`,parentName:item.parentName||item.name,generated:true});
 }
 return boards;
}
