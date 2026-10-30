import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {baseline,deform} from './dae-deform.js';
import './style.css';
import {repeatComponents} from './repetition.js';
let originals=[];
import {createViewCamera} from './view-camera.js';
import {createInspector} from './inspection.js';
let inspector;
const $=s=>document.querySelector(s);
let p={...baseline},wire=false,currentView='perspective',sourceMeshes=[],model,layers={},orbit,camera,renderer,scene;
const specs=[['Component repetition',[['columnCount','Columns per side row',3,17,1],['frameCount','Roof frame count',3,15,1]]],['Source proportions',[['widthScale','Transverse scale',.7,1.4,.01],['lengthScale','Longitudinal scale',.7,1.4,.01]]],['Vertical relationships',[['floor','Floor top datum',1.2,3,.01],['body','Floor-to-upper-beam span',1.2,3,.01],['roofScale','Roof vertical scale',.65,1.35,.01]]]];
const layerNames={ground:'01  Source ground slab',stones:'02  Stone supports',columns:'03  Columns',ties:'04  Lower connecting members',floor:'05  Floor / horizontal surfaces',beams:'06  Upper beams',stairs:'07  Entrance stair',roof:'08  Roof assembly'};
const visible=Object.fromEntries(Object.keys(layerNames).map(k=>[k,true]));
$('#controls').innerHTML=specs.map(([title,items])=>`<details class="control-group" open><summary>${title}<span>+</span></summary>${items.map(([key,label,min,max,step])=>`<label class="slider-label" for="${key}">${label}<output id="${key}-value"></output></label><input id="${key}" data-key="${key}" type="range" min="${min}" max="${max}" step="${step}">`).join('')}</details>`).join('');
$('#controls').insertAdjacentHTML('beforeend','<div class="repetition-summary" aria-live="polite"><p id="column-summary"></p><label class="slider-label" for="roof-spacing">Target roof-frame spacing (m)</label><input id="roof-spacing" type="number" min="0.45" max="6.3" step="0.05"><p id="frame-summary"></p><p>Spacing fits the existing frame span. Other roof members retain their source counts.</p></div>');
$('#layers').innerHTML=Object.entries(layerNames).map(([k,n])=>`<label class="layer"><input type="checkbox" data-layer="${k}" checked><span>${n}</span></label>`).join('');
$('.intro').textContent='Explore the uploaded Toba Batak model. Its original roof profile, framing, and support positions form the baseline.';
$('.metrics div:first-child span').textContent='COMPLETE SOURCE EXTENTS';
$('.metrics div:last-child strong').textContent='DAE-based mesh study';
$('.evidence').innerHTML='<summary>Source geometry & parameter assumptions <span>+</span></summary><p>Baseline: uploaded Rumah+Batak+Toba.dae. At reset, all 50 mesh definitions, 132 placed instances, and 50,810 source triangles are retained. Repetition controls regenerate the two side-column rows with matching stone supports, and resample the five source roof frames. End-face/interior columns and other roof assemblies retain their source geometry. Frame sections interpolate between source stations; this does not establish structural adequacy or exact contact with every curved roof member. The converted export writes affine matrices in row-major order; these are explicitly interpreted and baked into vertices. Only horizontal centring is applied at reset. No replacement roof, walls, supports, or ornament are generated.</p><p>The file declares metres, but this does not establish surveyed dimensions. Reset retains the source column geometry (approximately 0.25 m diameter), rather than imposing the earlier 0.20 m estimate from a different plan. Overall extents include the ground slab and roof projections; they are not floor dimensions.</p><p>Controls deform the actual source vertices: transverse/longitudinal scaling and continuous piecewise vertical scaling. The 2.23 m floor-top and 4.30 m upper-beam datums are read from model geometry, not independently verified measurements. Reset restores source coordinates exactly, apart from horizontal centring and floating-point rendering precision. Layer assignments are provisional because source node names are generic. No structural or historically valid design ranges are established.</p>';
function sync(){for(const [,items]of specs)for(const[k]of items){$('#'+k).value=p[k];$('#'+k+'-value').textContent=k.endsWith('Count')?String(p[k]):k.endsWith('Scale')?p[k].toFixed(2)+'×':p[k].toFixed(2)+' m';}}
const materials={};for(const k of Object.keys(layerNames))materials[k]=new THREE.MeshStandardMaterial({color:({ground:0x343434,stones:0x8c8c8c,columns:0xa48b65,ties:0xb09870,floor:0xb99c70,beams:0xb99b70,stairs:0xb69870,roof:0xb6a481})[k],roughness:.9,side:THREE.DoubleSide});
function update(){const bounds=new THREE.Box3();for(const m of sourceMeshes){const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const b=i*3;const v=deform(m.userData.base[b],m.userData.base[b+1],m.userData.base[b+2],p);a.setXYZ(i,...v);}a.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();bounds.union(m.geometry.boundingBox);}if(sourceMeshes.length){const size=bounds.getSize(new THREE.Vector3());$('#footprint').textContent=`${size.x.toFixed(2)} × ${size.z.toFixed(2)} m`;$('#height').textContent=size.y.toFixed(2)+' m';}if(currentView!=='perspective')setView(currentView);inspector?.refresh();$('#roof-spacing').value=(9*p.lengthScale/(p.frameCount-1)).toFixed(3);$('#column-summary').textContent=`${sourceMeshes.filter(m=>m.userData.group==='columns').length} columns total · ${p.columnCount} per side row · ${(9*p.lengthScale/(p.columnCount-1)).toFixed(2)} m side spacing`;$('#frame-summary').textContent=`${p.frameCount} roof frames · ${p.frameCount*4} frame members · ${(9*p.lengthScale/(p.frameCount-1)).toFixed(2)} m actual spacing`;$('#viewer').dataset.columnCount=String(sourceMeshes.filter(m=>m.userData.group==='columns').length);$('#viewer').dataset.frameCount=String(p.frameCount);}
function setView(view){
 currentView=view;if(!camera||!model)return;
 const e=$('#viewer'),aspect=Math.max(e.clientWidth,1)/Math.max(e.clientHeight,1);
 const result=createViewCamera(view,new THREE.Box3().setFromObject(model),aspect);
 camera=result.camera;orbit.object=camera;orbit.target.copy(result.target);
 orbit.enableRotate=view==='perspective'||view==='axonometric';orbit.update();
 $('#viewer').dataset.projection=camera.isOrthographicCamera?'orthographic':'perspective';
 $('#viewer').dataset.view=view;
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view));});
 $('.viewer-bottom>span').textContent=orbit.enableRotate?'Drag to orbit · Scroll to zoom · Right-drag to pan':'Scroll to zoom · Drag to pan · Orthographic projection';
 orbit.mouseButtons.LEFT=orbit.enableRotate?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN;
}
function rebuildComponents(){
 inspector?.clear();for(const mesh of sourceMeshes){mesh.removeFromParent();mesh.geometry.dispose();}sourceMeshes.length=0;
 for(const item of repeatComponents(originals,p.columnCount,p.frameCount)){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(item.base,3));geo.setIndex(item.indices);const mesh=new THREE.Mesh(geo,materials[item.group]);mesh.name=item.name;mesh.userData={base:item.base,group:item.group,sourceGeometry:item.sourceGeometry,generated:!!item.generated};layers[item.group].add(mesh);sourceMeshes.push(mesh);}
 $('#viewer').dataset.instances=String(sourceMeshes.length);
}
async function load(){try{
 scene=new THREE.Scene();scene.background=new THREE.Color(0x080808);renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));$('#viewer').appendChild(renderer.domElement);camera=new THREE.PerspectiveCamera(36,1,.1,300);orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.maxDistance=100;orbit.minDistance=3;scene.add(new THREE.HemisphereLight(0xffffff,0x353535,2.6));const sun=new THREE.DirectionalLight(0xfff2dc,3);sun.position.set(-8,16,-6);scene.add(sun);const grid=new THREE.GridHelper(40,40,0x444444,0x222222);grid.position.y=-.02;scene.add(grid);
 new ResizeObserver(()=>{const e=$('#viewer');renderer.setSize(e.clientWidth,e.clientHeight);if(model)setView(currentView);else{camera.aspect=e.clientWidth/e.clientHeight;camera.updateProjectionMatrix();}}).observe($('#viewer'));
 const response=await fetch(import.meta.env.BASE_URL+'models/toba-baseline.json');if(!response.ok)throw Error('Model request failed: '+response.status);const data=await response.json();
 model=new THREE.Group();scene.add(model);for(const k of Object.keys(layerNames)){layers[k]=new THREE.Group();model.add(layers[k]);layers[k].visible=visible[k];}
 for(const instance of data.instances){const source=data.geometries[instance.geometry],matrix=new THREE.Matrix4().set(...instance.matrix),vertices=new Float64Array(source.positions.length),v=new THREE.Vector3();for(let i=0;i<source.positions.length;i+=3){v.fromArray(source.positions,i).applyMatrix4(matrix);vertices[i]=v.x;vertices[i+1]=v.y;vertices[i+2]=v.z;}originals.push({name:instance.name,base:vertices,indices:source.indices,group:instance.group,sourceGeometry:instance.geometry});}
 rebuildComponents();
 update();setView('perspective');inspector=createInspector({container:$('.layer-panel'),viewer:$('#viewer'),meshes:sourceMeshes,groups:layers,materials,layerNames,getCamera:()=>camera,getRenderer:()=>renderer});renderer.setAnimationLoop(()=>{orbit.update();renderer.render(scene,camera);});$('#viewer').dataset.loaded='true';$('#viewer').dataset.instances=String(sourceMeshes.length);
 }catch(e){$('#render-error').hidden=false;$('#render-error').textContent='Unable to load the source model. '+e.message;console.error(e);}}
$('#controls').addEventListener('input',e=>{const k=e.target.dataset.key;if(k){p[k]=Number(e.target.value);if(k==='columnCount'||k==='frameCount')rebuildComponents();sync();update();}});
$('#roof-spacing').addEventListener('change',e=>{const spacing=Number(e.target.value);if(!Number.isFinite(spacing)||spacing<=0){update();return;}p.frameCount=Math.max(3,Math.min(15,Math.round(9*p.lengthScale/spacing)+1));rebuildComponents();sync();update();});
$('#layers').addEventListener('change',e=>{const k=e.target.dataset.layer;if(k){visible[k]=e.target.checked;if(layers[k])layers[k].visible=visible[k];inspector?.visibilityChanged();}});
$('#views').addEventListener('click',e=>{if(e.target.dataset.view)setView(e.target.dataset.view);});
$('#reset').addEventListener('click',()=>{p={...baseline};rebuildComponents();sync();update();setView('perspective');});
$('#wire').addEventListener('click',()=>{wire=!wire;Object.values(materials).forEach(m=>m.wireframe=wire);$('#wire span').textContent=wire?'ON':'OFF';inspector?.syncWireframe();});
$('#export').addEventListener('click',()=>{const u=URL.createObjectURL(new Blob([JSON.stringify({schemaVersion:3,repetitionMethod:'DAE side-column/stone replication and roof-frame interpolation',source:'Rumah+Batak+Toba.dae',parameters:p,sourceDatums:{floorTop:2.23,upperBeamTop:4.3},physicalScaleVerified:false,visibility:visible},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='toba-dae-parameters.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
sync();load();
