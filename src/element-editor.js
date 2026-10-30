import {defaultElement,elementLimits,measure} from './element-parameters.js';
export function createElementEditor({host,getItems,getMeshes,getEdits,getRawPositions,setEdit,clearEdit,groupNames,onChoose}){
 let selected='',filter='all';
 const panel=document.createElement('details');panel.className='control-group element-editor';panel.id='element-editor';
 panel.innerHTML=`<summary>Individual elements<span>+</span></summary><p class="editor-help">Click any visible piece or choose one below. Changes apply to that piece and its copies.</p><label class="select-label" for="element-family">ASSEMBLY</label><select id="element-family"><option value="all">All assemblies</option>${Object.entries(groupNames).map(([k,v])=>`<option value="${k}">${v.slice(4)}</option>`).join('')}</select><label class="select-label" for="element-choice">ELEMENT</label><select id="element-choice"><option value="">Choose an element</option></select><p id="element-count-summary" class="editor-help"></p><div id="element-fields" hidden><div class="element-grid">${[['scaleX','Transverse size','m'],['scaleY','Vertical size','m'],['scaleZ','Longitudinal size','m'],['offsetX','Move X','m'],['offsetY','Move Y','m'],['offsetZ','Move Z','m'],['rotateX','Rotate X','°'],['rotateY','Rotate Y','°'],['rotateZ','Rotate Z','°'],['count','Copies (0 removes)',''],['spacing','Copy spacing','m']].map(([k,label,unit])=>`<label for="element-${k}">${label}${unit?' ('+unit+')':''}<input id="element-${k}" type="number" data-element="${k}" step="${k==='count'?1:k.startsWith('rotate')?1:.01}"></label>`).join('')}<label for="element-axis">Copy direction<select id="element-axis"><option value="x">Transverse X</option><option value="y">Vertical Y</option><option value="z" selected>Longitudinal Z</option></select></label></div><p class="editor-help">Sizes are unrotated model-space bounding extents. Counts copy a geometric piece; shared joints are not regenerated.</p><button id="reset-element" type="button">Reset this element</button></div>`;
 host.before(panel);
 const $=s=>panel.querySelector(s);
 function item(){return getItems().find(i=>i.name===selected);}
 function populate(){const list=getItems(),counters={};const labels=new Map();for(const i of list){counters[i.group]=(counters[i.group]||0)+1;labels.set(i.name,`${groupNames[i.group].slice(4)} ${String(counters[i.group]).padStart(2,'0')}${i.generated?' · generated':''}`);}
  $('#element-choice').replaceChildren(new Option('Choose an element',''));
  for(const i of list.filter(i=>filter==='all'||i.group===filter))$('#element-choice').add(new Option(labels.get(i.name),i.name));
  if(!item())selected='';$('#element-choice').value=selected;
  $('#element-count-summary').textContent=`${list.length} editable pieces · ${getMeshes().length} displayed instances`;
 }
 function refresh(){populate();const i=item();$('#element-fields').hidden=!i;if(!i)return;const p={...defaultElement,...getEdits()[i.name]},size=measure(getRawPositions(i)).size;
  for(const k of Object.keys(elementLimits)){const input=$('#element-'+k);let value=p[k];if(k.startsWith('scale')){const axis=k.at(-1).toLowerCase();value=size[axis]*p[k];input.min=(size[axis]*elementLimits[k][0]).toFixed(5);input.max=(size[axis]*elementLimits[k][1]).toFixed(5);}else{input.min=elementLimits[k][0];input.max=elementLimits[k][1];}if(document.activeElement!==input)input.value=k==='count'?String(value):value.toFixed(3);}
  $('#element-axis').value=p.axis;
 }
 function choose(id){selected=id||'';const i=item();if(i&&filter!=='all'&&filter!==i.group){filter=i.group;$('#element-family').value=filter;}refresh();onChoose?.(selected);if(i){panel.open=true;panel.scrollIntoView({block:'nearest'});}}
 $('#element-family').addEventListener('change',()=>{filter=$('#element-family').value;selected='';refresh();});
 $('#element-choice').addEventListener('change',()=>{choose($('#element-choice').value);});
 panel.addEventListener('change',e=>{const k=e.target.dataset.element;if(!k||!item())return;let value=Number(e.target.value);if(!Number.isFinite(value)){refresh();return;}if(k.startsWith('scale')){const axis=k.at(-1).toLowerCase(),size=measure(getRawPositions(item())).size[axis];value=size>0?value/size:1;}const[min,max]=elementLimits[k];value=Math.min(max,Math.max(min,k==='count'?Math.round(value):value));setEdit(selected,{...getEdits()[selected],[k]:value});refresh();});
 $('#element-axis').addEventListener('change',()=>{if(item())setEdit(selected,{...getEdits()[selected],axis:$('#element-axis').value});});
 $('#reset-element').addEventListener('click',()=>{if(item()){clearEdit(selected);refresh();}});
 return {refresh,choose,getSelected:()=>selected};
}
