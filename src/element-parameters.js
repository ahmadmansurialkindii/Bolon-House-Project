import * as THREE from 'three';

export const defaultElement={scaleX:1,scaleY:1,scaleZ:1,offsetX:0,offsetY:0,offsetZ:0,rotateX:0,rotateY:0,rotateZ:0,count:1,spacing:1,axis:'z'};
export const elementLimits={scaleX:[.05,10],scaleY:[.05,10],scaleZ:[.05,10],offsetX:[-30,30],offsetY:[-30,30],offsetZ:[-30,30],rotateX:[-180,180],rotateY:[-180,180],rotateZ:[-180,180],count:[0,12],spacing:[0,20]};
export function validateElement(raw={}){
 const result={...defaultElement};
 for(const [k,[min,max]]of Object.entries(elementLimits))if(Object.hasOwn(raw,k)){
  const n=raw[k];if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max||(k==='count'&&!Number.isInteger(n)))throw Error(`Invalid element ${k}`);result[k]=n;
 }
 if(Object.hasOwn(raw,'axis')){if(!['x','y','z'].includes(raw.axis))throw Error('Invalid repetition axis');result.axis=raw.axis;}
 return result;
}
// Weld coincident coordinates solely to identify connected triangle islands.
// No source vertices are moved or simplified.
export function splitParts(item){
 const n=item.base.length/3,parent=Array.from({length:n},(_,i)=>i),weld=new Map();
 const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
 const join=(a,b)=>parent[find(a)]=find(b);
 for(let i=0;i<n;i++){const k=[0,1,2].map(j=>Math.round(item.base[3*i+j]*1e5)).join(',');if(weld.has(k))join(i,weld.get(k));else weld.set(k,i);}
 for(let i=0;i<item.indices.length;i+=3){join(item.indices[i],item.indices[i+1]);join(item.indices[i],item.indices[i+2]);}
 const islands=new Map();for(let i=0;i<item.indices.length;i+=3){const root=find(item.indices[i]);if(!islands.has(root))islands.set(root,[]);islands.get(root).push(...item.indices.slice(i,i+3));}
 if(islands.size===1)return [item];
 return [...islands.values()].map((indices,part)=>{
  const ids=[...new Set(indices)],remap=new Map(ids.map((v,i)=>[v,i]));
  return {...item,name:`${item.name}::part${part+1}`,parentName:item.name,base:Float64Array.from(ids.flatMap(i=>Array.from(item.base.slice(i*3,i*3+3)))),indices:indices.map(i=>remap.get(i))};
 });
}
export function measure(positions){const box=new THREE.Box3();for(let i=0;i<positions.length;i+=3)box.expandByPoint(new THREE.Vector3().fromArray(positions,i));return {box,centre:box.getCenter(new THREE.Vector3()),size:box.getSize(new THREE.Vector3())};}
export function transformElement(base,raw={},copy=0){
 const p=validateElement(raw),{centre}=measure(base),rotation=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(p.rotateX*Math.PI/180,p.rotateY*Math.PI/180,p.rotateZ*Math.PI/180)),result=new Float64Array(base.length),v=new THREE.Vector3(),scale=new THREE.Vector3(p.scaleX,p.scaleY,p.scaleZ);
 for(let i=0;i<base.length;i+=3){v.fromArray(base,i).sub(centre).multiply(scale).applyMatrix4(rotation).add(centre);v.x+=p.offsetX;v.y+=p.offsetY;v.z+=p.offsetZ;v[p.axis]+=copy*p.spacing;v.toArray(result,i);}
 return result;
}
