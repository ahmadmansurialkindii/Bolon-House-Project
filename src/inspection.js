import * as THREE from 'three';
export function createInspector({viewer,meshes,materials,getCamera,getRenderer}){
 let selected=null,outline=null;
 const label=document.createElement('div');label.className='selection-label';label.hidden=true;label.setAttribute('aria-live','polite');viewer.append(label);
 const highlight=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x555555,emissiveIntensity:.65,roughness:.65,side:THREE.DoubleSide});
 function select(m){if(selected)selected.material=materials[selected.userData.group];if(outline){outline.removeFromParent();outline.geometry.dispose();outline.material.dispose();outline=null;}selected=m||null;label.hidden=!selected;viewer.dataset.selected=selected?.name||'';if(selected){highlight.wireframe=materials[selected.userData.group].wireframe;selected.material=highlight;outline=new THREE.BoxHelper(selected,0xffffff);outline.material.depthTest=false;outline.renderOrder=10;selected.parent.parent.add(outline);label.textContent=`${selected.userData.generated?'Generated':'Baseline'} ${selected.userData.group} · click empty space to clear`;}}
 let start=null;const canvas=getRenderer().domElement;
 canvas.addEventListener('pointerdown',e=>start={x:e.clientX,y:e.clientY,id:e.pointerId,button:e.button});
 canvas.addEventListener('pointerup',e=>{if(!start||start.id!==e.pointerId||start.button!==0)return;const moved=Math.hypot(e.clientX-start.x,e.clientY-start.y);start=null;if(moved>5)return;const rect=canvas.getBoundingClientRect(),point=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(point,getCamera());select(ray.intersectObjects(meshes.filter(m=>m.visible&&m.parent.visible),false)[0]?.object);});
 canvas.addEventListener('pointercancel',()=>start=null);
 return {clear:()=>select(null),refresh:()=>{if(selected)outline?.update();},visibilityChanged:()=>{if(selected&&!selected.parent.visible)select(null);},syncWireframe:()=>highlight.wireframe=materials.roof.wireframe};
}
