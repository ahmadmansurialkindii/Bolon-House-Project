import {repeatComponents} from './repetition.js';
import {splitParts,measure} from './element-parameters.js';

export const familyDefaults={columnDiameter:.25,roundBeamCount:2,upperBeamCount:2,edgeBeamCount:2,roundBeamScale:1,upperBeamScale:1,edgeBeamScale:1,groundWidthScale:1,groundLengthScale:1,groundThicknessScale:1,stoneWidthScale:1,stoneHeightScale:1,tieLevelCount:4,tieSectionScale:1,floorThicknessScale:1,beamSectionScale:1,roofRibCount:27,roofBattenCount:33,roofMemberScale:1,stepCount:7,stairWidthScale:1,stepThicknessScale:1};
export const familySpecs=[
 ['Columns & stone supports', [['columnCount','Columns per side row',3,17,1],['columnDiameter','Column diameter',.12,.5,.01],['stoneWidthScale','Stone width scale',.5,2,.05],['stoneHeightScale','Stone height scale',.5,2,.05]]],
 ['Lower connecting members', [['tieLevelCount','Horizontal tie levels',1,8,1],['tieSectionScale','Tie section scale',.5,2,.05]]],
 ['Floor & upper beams', [['roundBeamCount','Lower round members',2,7,1],['roundBeamScale','Lower round member size',.5,2,.05],['upperBeamCount','Upper longitudinal beams',2,7,1],['upperBeamScale','Upper beam section scale',.5,2,.05],['edgeBeamCount','Outer edge members',2,7,1],['edgeBeamScale','Outer edge section scale',.5,2,.05],['floorThicknessScale','Floor thickness scale',.5,3,.05],['beamSectionScale','Beam cap size scale',.5,2,.05]]],
 ['Roof components', [['frameCount','Roof frame count',3,15,1],['roofRibCount','Roof ribs per side',5,55,1],['roofBattenCount','Longitudinal roof members per side',5,65,1],['roofMemberScale','Roof member section scale',.5,2,.05]]],
 ['Ground base', [['groundWidthScale','Base width scale',.7,1.5,.05],['groundLengthScale','Base length scale',.7,1.5,.05],['groundThicknessScale','Base thickness scale',.5,2,.05]]],
 ['Entrance stair', [['stepCount','Stair tread count',3,15,1],['stairWidthScale','Stair width scale',.6,1.8,.05],['stepThicknessScale','Tread thickness scale',.5,2,.05]]]
];
const parentId=item=>Number((item.parentName||item.name).replace('empty_','').split('::')[0]);
const centre=(item,axis)=>measure(item.base).centre[axis];
// Place nearest source members at evenly resampled source stations. Varying
// roof members retain their template topology and fit interpolated extents.
export function resampleSeries(items,count,axis,prefix){
 const sorted=[...items].sort((a,b)=>centre(a,axis)-centre(b,axis));
 if(count===items.length)return items;
 const first=centre(sorted[0],axis),last=centre(sorted.at(-1),axis),out=[];
 for(let i=0;i<count;i++){
  const pos=count===1?(first+last)/2:first+(last-first)*i/(count-1);
  let lo=0;while(lo<sorted.length-2&&centre(sorted[lo+1],axis)<pos)lo++;
  const a=sorted[lo],b=sorted[Math.min(lo+1,sorted.length-1)],am=measure(a.base),bm=measure(b.base),span=bm.centre[axis]-am.centre[axis],t=span>1e-9?(pos-am.centre[axis])/span:0;
  const template=t<.5?a:b,tm=measure(template.base),target=am.centre.clone().lerp(bm.centre,t),size=am.size.clone().lerp(bm.size,t);
  target[axis]=pos;
  const base=Float64Array.from(template.base,(v,j)=>{const ax='xyz'[j%3];return target[ax]+(v-tm.centre[ax])*(tm.size[ax]>1e-9?size[ax]/tm.size[ax]:1);});
  out.push({...template,name:`family_${prefix}_${i}`,parentName:template.parentName||template.name,base,generated:true});
 }
 return out;
}
export function buildFamilyComponents(originals,parameters){
 const p={...familyDefaults,...parameters};
 const specs=familySpecs.flatMap(([,items])=>items);
 for(const[k,,min,max,step]of specs){const value=p[k];if(!Number.isFinite(value)||value<min||value>max||(step===1&&!Number.isInteger(value)))throw Error('Invalid '+k);}
 let items=repeatComponents(originals,p.columnCount,p.frameCount).flatMap(splitParts);
 const replace=(predicate,count,axis,name)=>{const members=items.filter(predicate);if(!members.length)throw Error('Missing family '+name);if(count!==members.length){const ids=new Set(members);items=items.filter(i=>!ids.has(i)).concat(resampleSeries(members,count,axis,name));}};
 for(const[side,ids]of [['left',[35,47,48]],['right',[51,45,50]]])replace(i=>ids.includes(parentId(i)),p.roofRibCount,'z','ribs_'+side);
 for(const[side,id]of [['left',52],['right',53]])replace(i=>parentId(i)===id,p.roofBattenCount,'x','rooflong_'+side);
 for(const[name,ids,key]of [['round',[5,11],'roundBeamCount'],['upper',[10,27],'upperBeamCount'],['edge',[13,14],'edgeBeamCount']])replace(i=>ids.includes(parentId(i)),p[key],'x','beamrows_'+name);
 const ties=items.filter(i=>{const id=parentId(i);return id>=55&&id<=76&&id!==63&&id!==64;});
 const series=new Map();for(const item of ties){const {centre:c,size}=measure(item.base);const k=[c.x.toFixed(2),c.z.toFixed(2),size.z>size.x?'long':'cross'].join('/');if(!series.has(k))series.set(k,[]);series.get(k).push(item);}
 if(p.tieLevelCount!==4){const ids=new Set(ties);items=items.filter(i=>!ids.has(i));let n=0;for(const row of series.values())items.push(...resampleSeries(row,p.tieLevelCount,'y','ties_'+n++));}
 replace(i=>{const id=parentId(i);return id>=107&&id<=113;},p.stepCount,'y','steps');
 return items;
}
export function familyTransform(item,base,parameters){
 const p={...familyDefaults,...parameters},{centre:c,size,box}=measure(base);let sx=1,sy=1,sz=1,anchor=c.clone();
 const id=parentId(item),family=item.name;
 if(item.group==='ground'){sx=p.groundWidthScale;sy=p.groundThicknessScale;sz=p.groundLengthScale;anchor.y=box.min.y;}
 else if(item.group==='columns'&&!(p.columnDiameter===.25&&(parameters.widthScale??1)===1&&(parameters.lengthScale??1)===1)){sx=size.x>0?p.columnDiameter/size.x:1;sz=size.z>0?p.columnDiameter/size.z:1;}
 else if(item.group==='stones'){sx=sz=p.stoneWidthScale;sy=p.stoneHeightScale;anchor.y=box.min.y;}
 else if(id===54||id===64){sy=p.floorThicknessScale;anchor.y=box.max.y;}
 else if(item.group==='beams'){const section=[5,11].includes(id)?p.roundBeamScale:[10,27].includes(id)?p.upperBeamScale:[13,14].includes(id)?p.edgeBeamScale:p.beamSectionScale;const longest=size.x>size.z?'x':'z';sy=section;if(longest==='x')sz=section;else sx=section;}
 else if(item.group==='ties'&&id!==64){sy=p.tieSectionScale;if(size.x>size.z)sz=p.tieSectionScale;else sx=p.tieSectionScale;}
 else if(item.group==='stairs'){sx=p.stairWidthScale;anchor.x=0;if((id>=107&&id<=113)||family.startsWith('family_steps_')){sy=p.stepThicknessScale;anchor.y=box.max.y;}}
 else if(item.group==='roof'){
  // Section edits preserve the longest bounding axis of each source piece.
  const longest=size.x>=size.y&&size.x>=size.z?'x':size.y>=size.z?'y':'z';
  sx=longest==='x'?1:p.roofMemberScale;sy=longest==='y'?1:p.roofMemberScale;sz=longest==='z'?1:p.roofMemberScale;
 }
 return Float64Array.from(base,(v,j)=>{const axis='xyz'[j%3],s=[sx,sy,sz][j%3];return anchor[axis]+(v-anchor[axis])*s;});
}
export function familyCounts(items){return {roundBeams:items.filter(i=>[5,11].includes(parentId(i))).length,upperBeams:items.filter(i=>[10,27].includes(parentId(i))).length,edgeBeams:items.filter(i=>[13,14].includes(parentId(i))).length,longitudinalBeams:items.filter(i=>[5,10,11,13,14,27].includes(parentId(i))).length,columns:items.filter(i=>i.group==='columns').length,roofRibs:items.filter(i=>[35,47,48,51,45,50].includes(parentId(i))).length,roofLongitudinals:items.filter(i=>[52,53].includes(parentId(i))).length,ties:items.filter(i=>{const id=parentId(i);return id>=55&&id<=76&&id!==63&&id!==64;}).length,steps:items.filter(i=>{const id=parentId(i);return id>=107&&id<=113;}).length};}
