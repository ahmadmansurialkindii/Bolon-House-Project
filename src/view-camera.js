import * as THREE from 'three';

export function createViewCamera(view,box,aspect){
 const size=box.getSize(new THREE.Vector3()),target=box.getCenter(new THREE.Vector3());
 const dist=Math.max(size.x,size.y,size.z,1)*2.5;
 const direction=new THREE.Vector3(...({front:[0,0,1],side:[1,0,0],plan:[0,1,0],axonometric:[1,.5,.7],perspective:[.7,.35,.8]}[view]||[.7,.35,.8])).normalize();
 const camera=view==='perspective'?new THREE.PerspectiveCamera(36,aspect,.1,dist*10):new THREE.OrthographicCamera(-1,1,1,-1,.1,dist*10);
 camera.position.copy(target).addScaledVector(direction,dist);camera.up.set(...(view==='plan'?[0,0,1]:[0,1,0]));camera.lookAt(target);camera.updateMatrixWorld(true);
 if(camera.isOrthographicCamera){
  let halfX=0,halfY=0;const point=new THREE.Vector3();
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){point.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);halfX=Math.max(halfX,Math.abs(point.x));halfY=Math.max(halfY,Math.abs(point.y));}
  const halfHeight=Math.max(halfY,halfX/aspect,.1)*1.08;
  camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;
 }
 camera.updateProjectionMatrix();return {camera,target};
}

// Resize the projection without changing the user's orbit, pan, or zoom.
export function resizeViewCamera(camera,aspect){
 if(!camera||!Number.isFinite(aspect)||aspect<=0)return;
 if(camera.isOrthographicCamera){const halfHeight=(camera.top-camera.bottom)/2,centre=(camera.left+camera.right)/2;camera.left=centre-halfHeight*aspect;camera.right=centre+halfHeight*aspect;}
 else camera.aspect=aspect;
 camera.updateProjectionMatrix();
}

// Geometry updates must never own camera framing. Restore the same camera and
// target even if a future geometry operation changes them or throws.
export function preserveView(camera,controls,updateGeometry){
 if(!camera||!controls)return updateGeometry();
 const state={position:camera.position.clone(),quaternion:camera.quaternion.clone(),up:camera.up.clone(),zoom:camera.zoom,target:controls.target.clone()};
 try{return updateGeometry();}
 finally{camera.position.copy(state.position);camera.quaternion.copy(state.quaternion);camera.up.copy(state.up);camera.zoom=state.zoom;controls.target.copy(state.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);}
}
