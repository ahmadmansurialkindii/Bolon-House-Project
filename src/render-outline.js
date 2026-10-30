import * as THREE from 'three';
const blackEdges=new THREE.LineBasicMaterial({color:0x000000,depthTest:true,depthWrite:false});
export function setMeshOutline(mesh,enabled){
 const old=mesh.getObjectByName('render-outline');if(old){old.removeFromParent();old.geometry.dispose();}
 if(enabled){const edges=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,24),blackEdges);edges.name='render-outline';edges.renderOrder=1;mesh.add(edges);}
}
export function disposeMesh(mesh){setMeshOutline(mesh,false);mesh.geometry.dispose();}
