import * as THREE from 'three';

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
