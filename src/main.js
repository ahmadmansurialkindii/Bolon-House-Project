import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {baseline,deform} from './dae-deform.js';
import './style.css';
import {buildFamilyComponents,familyTransform,familySpecs,familyCounts} from './family-parameters.js';
let editableItems=[];
let originals=[];
import {createViewCamera,resizeViewCamera} from './view-camera.js';
import {createInspector} from './inspection.js';
let inspector;
const $=s=>document.querySelector(s);
let p={...baseline},wire=false,currentView='axonometric',sourceMeshes=[],model,layers={},orbit,camera,renderer,scene;
const specs=[...familySpecs,['Overall proportions',[['widthScale','Transverse scale',.7,1.4,.01],['lengthScale','Longitudinal scale',.7,1.4,.01]]],['Vertical relationships',[['floor','Floor top datum',1.2,3,.01],['body','Floor-to-upper-beam span',1.2,3,.01],['roofScale','Roof vertical scale',.65,1.35,.01]]]];
const layerNames={ground:'01  Source ground slab',stones:'02  Stone supports',columns:'03  Columns',ties:'04  Lower connecting members',floor:'05  Floor / horizontal surfaces',beams:'06  Upper beams',stairs:'07  Entrance stair',roof:'08  Roof assembly'};
const visible=Object.fromEntries(Object.keys(layerNames).map(k=>[k,true]));
$('#controls').innerHTML=specs.map(([title,items])=>`<details class="control-group" open><summary>${title}<span>+</span></summary>${items.map(([key,label,min,max,step])=>`<label class="slider-label" for="${key}">${label}<output id="${key}-value"></output></label><input id="${key}" data-key="${key}" type="range" min="${min}" max="${max}" step="${step}">`).join('')}</details>`).join('');
$('#controls').insertAdjacentHTML('beforeend','<div class="repetition-summary" aria-live="polite"><p id="column-summary"></p><label class="slider-label" for="roof-spacing">Target roof-frame spacing (m)</label><input id="roof-spacing" type="range" min="0.45" max="6.3" step="0.05"><p id="frame-summary"></p><p>Spacing fits the existing frame span. Family sliders regenerate repeated members within the source spans. Stone supports follow the side columns.</p></div>');
$('#layers').innerHTML=Object.entries(layerNames).map(([k,n])=>`<label class="layer"><input type="checkbox" data-layer="${k}" checked><span>${n}</span></label>`).join('');
$('.metrics div:first-child span').textContent='COMPLETE SOURCE EXTENTS';
$('.metrics div:last-child strong').textContent='DAE-based mesh study';
// Keep supporting information available without consuming the modelling canvas.
const layerPanel=$('.layer-panel');
layerPanel.hidden=true;
const dock=document.createElement('div');dock.className='viewport-tools';dock.innerHTML='<div><button id="toggle-layers" aria-expanded="false">Assembly layers</button></div><div><button id="fit-view" title="Fit model to the current view">Fit model</button><button id="fullscreen">Expand viewport</button></div>';
$('.metrics').after(dock);
$('#toggle-layers').addEventListener('click',()=>{layerPanel.hidden=!layerPanel.hidden;$('#toggle-layers').setAttribute('aria-expanded',String(!layerPanel.hidden));});
$('#fit-view').addEventListener('click',()=>setView(currentView));
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.workspace').requestFullscreen();}catch{$('#fullscreen').textContent='Fullscreen unavailable';}});
document.addEventListener('fullscreenchange',()=>$('#fullscreen').textContent=document.fullscreenElement?'Exit expanded view':'Expand viewport');
function sync(){for(const [,items]of specs)for(const[k]of items){$('#'+k).value=p[k];$('#'+k+'-value').textContent=k.endsWith('Count')?String(p[k]):k.endsWith('Scale')?p[k].toFixed(2)+'×':p[k].toFixed(2)+' m';}}
const materials={};for(const k of Object.keys(layerNames))materials[k]=new THREE.MeshStandardMaterial({color:({ground:0x343434,stones:0x8c8c8c,columns:0xa48b65,ties:0xb09870,floor:0xb99c70,beams:0xb99b70,stairs:0xb69870,roof:0xb6a481})[k],roughness:.9,side:THREE.DoubleSide});
function rawPositions(item){return Float64Array.from(item.base,(_,i)=>{const k=i-i%3;return deform(item.base[k],item.base[k+1],item.base[k+2],p)[i%3];});}
function update(){
 inspector?.clear();for(const mesh of sourceMeshes){mesh.removeFromParent();mesh.geometry.dispose();}sourceMeshes.length=0;
 const bounds=new THREE.Box3();
 for(const item of editableItems){const transformed=familyTransform(item,rawPositions(item),p),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(transformed,3));geo.setIndex(item.indices);geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();const mesh=new THREE.Mesh(geo,materials[item.group]);mesh.name=item.name;mesh.userData={group:item.group,elementKey:item.name,generated:!!item.generated};layers[item.group].add(mesh);sourceMeshes.push(mesh);bounds.union(geo.boundingBox);}
 {const size=bounds.isEmpty()?new THREE.Vector3():bounds.getSize(new THREE.Vector3());$('#footprint').textContent=`${size.x.toFixed(2)} × ${size.z.toFixed(2)} m`;$('#height').textContent=size.y.toFixed(2)+' m';}
 $('#viewer').dataset.instances=String(sourceMeshes.length);$('#viewer').dataset.editablePieces=String(editableItems.length);
 $('#roof-spacing').value=(9*p.lengthScale/(p.frameCount-1)).toFixed(3);
 $('#column-summary').textContent=`${sourceMeshes.filter(m=>m.userData.group==='columns').length} columns total · ${p.columnCount} per side row · ${(9*p.lengthScale/(p.columnCount-1)).toFixed(2)} m side spacing`;
 const counts=familyCounts(editableItems);$('#viewer').dataset.familyCounts=JSON.stringify(counts);
 $('#frame-summary').textContent=`${p.frameCount} roof frames · ${(9*p.lengthScale/(p.frameCount-1)).toFixed(2)} m frame spacing · ${counts.roofRibs} roof ribs · ${counts.roofLongitudinals} longitudinal roof members · ${counts.longitudinalBeams} longitudinal beams · ${counts.ties} lower ties · ${counts.steps} stair treads`;
 $('#viewer').dataset.columnCount=String(sourceMeshes.filter(m=>m.userData.group==='columns').length);$('#viewer').dataset.frameCount=String(p.frameCount);
}
function setView(view){
 currentView=view;if(!camera||!model)return;
 const e=$('#viewer'),aspect=Math.max(e.clientWidth,1)/Math.max(e.clientHeight,1);
 const viewBounds=new THREE.Box3().setFromObject(model);if(viewBounds.isEmpty())return;
 const result=createViewCamera(view,viewBounds,aspect);
 camera=result.camera;orbit.object=camera;orbit.target.copy(result.target);
 orbit.enableRotate=view==='perspective'||view==='axonometric';orbit.update();
 $('#viewer').dataset.projection=camera.isOrthographicCamera?'orthographic':'perspective';
 $('#viewer').dataset.view=view;
 document.querySelectorAll('#views [data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view));});
 $('.viewer-bottom>span').textContent=orbit.enableRotate?'Drag to orbit · Scroll to zoom · Right-drag to pan':'Scroll to zoom · Drag to pan · Orthographic projection';
 orbit.mouseButtons.LEFT=orbit.enableRotate?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN;
}
function rebuildComponents(){editableItems=buildFamilyComponents(originals,p);}
async function load(){try{
 scene=new THREE.Scene();scene.background=new THREE.Color(0x080808);renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));$('#viewer').appendChild(renderer.domElement);camera=new THREE.PerspectiveCamera(36,1,.1,300);orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.maxDistance=100;orbit.minDistance=3;scene.add(new THREE.HemisphereLight(0xffffff,0x353535,2.6));const sun=new THREE.DirectionalLight(0xfff2dc,3);sun.position.set(-8,16,-6);scene.add(sun);const grid=new THREE.GridHelper(40,40,0x444444,0x222222);grid.position.y=-.02;scene.add(grid);
 new ResizeObserver(()=>{const e=$('#viewer');renderer.setSize(e.clientWidth,e.clientHeight);resizeViewCamera(camera,Math.max(e.clientWidth,1)/Math.max(e.clientHeight,1));}).observe($('#viewer'));
 const response=await fetch(import.meta.env.BASE_URL+'models/toba-baseline.json');if(!response.ok)throw Error('Model request failed: '+response.status);const data=await response.json();
 model=new THREE.Group();scene.add(model);for(const k of Object.keys(layerNames)){layers[k]=new THREE.Group();model.add(layers[k]);layers[k].visible=visible[k];}
 for(const instance of data.instances){const source=data.geometries[instance.geometry],matrix=new THREE.Matrix4().set(...instance.matrix),vertices=new Float64Array(source.positions.length),v=new THREE.Vector3();for(let i=0;i<source.positions.length;i+=3){v.fromArray(source.positions,i).applyMatrix4(matrix);vertices[i]=v.x;vertices[i+1]=v.y;vertices[i+2]=v.z;}originals.push({name:instance.name,base:vertices,indices:source.indices,group:instance.group,sourceGeometry:instance.geometry});}
 rebuildComponents();
 update();setView('axonometric');inspector=createInspector({container:$('.layer-panel'),viewer:$('#viewer'),meshes:sourceMeshes,groups:layers,materials,layerNames,getCamera:()=>camera,getRenderer:()=>renderer});renderer.setAnimationLoop(()=>{orbit.update();renderer.render(scene,camera);});$('#viewer').dataset.loaded='true';$('#viewer').dataset.instances=String(sourceMeshes.length);
 }catch(e){$('#render-error').hidden=false;$('#render-error').textContent='Unable to load the source model. '+e.message;console.error(e);}}
$('#controls').addEventListener('input',e=>{const k=e.target.dataset.key;if(k){p[k]=Number(e.target.value);if(k.endsWith('Count'))rebuildComponents();sync();update();}});
$('#roof-spacing').addEventListener('input',e=>{const spacing=Number(e.target.value);if(!Number.isFinite(spacing)||spacing<=0){update();return;}p.frameCount=Math.max(3,Math.min(15,Math.round(9*p.lengthScale/spacing)+1));rebuildComponents();sync();update();});
$('#layers').addEventListener('change',e=>{const k=e.target.dataset.layer;if(k){visible[k]=e.target.checked;if(layers[k])layers[k].visible=visible[k];inspector?.visibilityChanged();}});
$('#views').addEventListener('click',e=>{if(e.target.dataset.view)setView(e.target.dataset.view);});
$('#reset').addEventListener('click',()=>{p={...baseline};rebuildComponents();sync();update();});
$('#wire').addEventListener('click',()=>{wire=!wire;Object.values(materials).forEach(m=>m.wireframe=wire);$('#wire span').textContent=wire?'ON':'OFF';inspector?.syncWireframe();});
const importButton=document.createElement('button');importButton.className='reset';importButton.id='import-parameters';importButton.textContent='Import parameters';$('#reset').after(importButton);
const importFile=document.createElement('input');importFile.type='file';importFile.accept='.json,application/json';importFile.hidden=true;importFile.id='import-file';importButton.after(importFile);
const importStatus=document.createElement('p');importStatus.className='editor-help';importStatus.setAttribute('role','status');importFile.after(importStatus);
importButton.addEventListener('click',()=>importFile.click());
importFile.addEventListener('change',async()=>{try{const file=importFile.files[0];if(!file)return;if(file.size>2000000)throw Error('Parameter file is too large');const data=JSON.parse(await file.text());if(data.source!=='Rumah+Batak+Toba.dae'||!data.parameters)throw Error('This file is for a different model');const next={...baseline};for(const[,items]of specs)for(const[k,,min,max]of items){const legacyCount=['roundBeamCount','upperBeamCount'].includes(k)?data.parameters.beamRowCount:undefined;const value=data.parameters[k]??legacyCount??baseline[k];if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(k.endsWith('Count')&&!Number.isInteger(value)))throw Error('Invalid '+k);next[k]=value;}if(Object.keys(data.elementEdits||{}).length)throw Error('This file contains old individual edits. Use a family-slider parameter file.');const nextItems=buildFamilyComponents(originals,next);p=next;editableItems=nextItems;sync();update();importStatus.textContent='Parameters imported.';}catch(e){importStatus.textContent='Import failed: '+e.message;}finally{importFile.value='';}});
sync();load();

// Read-only camera state for regression checks and future saved-view support.
export function getCameraState(){return camera&&orbit?{id:camera.uuid,position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),up:camera.up.toArray(),zoom:camera.zoom,target:orbit.target.toArray(),projection:camera.projectionMatrix.toArray()}:null;}
