export function bounds(base){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<base.length;i+=3)for(let j=0;j<3;j++){min[j]=Math.min(min[j],base[i+j]);max[j]=Math.max(max[j],base[i+j]);}return {min,max,centre:min.map((v,j)=>(v+max[j])/2)};}
export function repeatComponents(originals,columnCount=9,frameCount=5){
 if(!Number.isInteger(columnCount)||columnCount<3||columnCount>17||!Number.isInteger(frameCount)||frameCount<3||frameCount>15)throw Error('Invalid repetition count');
 const sideCols=originals.filter(m=>m.group==='columns'&&[1.5,6.7].some(x=>Math.abs(bounds(m.base).centre[0]-x)<.01));
 const sideIds=new Set(sideCols.map(m=>m.name));
 const stones=originals.filter(m=>m.group==='stones'&&[1.5,6.7].some(x=>Math.abs(bounds(m.base).centre[0]-x)<.01));
 const stoneIds=new Set(stones.map(m=>m.name));
 const frames=originals.filter(m=>Number(m.name.replace('empty_',''))>=114);
 const frameIds=new Set(frames.map(m=>m.name));
 const result=originals.filter(m=>!(columnCount!==9&&(sideIds.has(m.name)||stoneIds.has(m.name)))&&!(frameCount!==5&&frameIds.has(m.name)));
 if(columnCount!==9){
  for(const x of [1.5,6.7])for(let i=0;i<columnCount;i++){
   const z=-10.28+9*i/(columnCount-1);
   for(const [kind,candidates]of [['column',sideCols],['stone',stones]]){
    const row=candidates.filter(m=>Math.abs(bounds(m.base).centre[0]-x)<.01);
    const template=row.reduce((a,b)=>Math.abs(bounds(a.base).centre[2]-z)<Math.abs(bounds(b.base).centre[2]-z)?a:b);
    const dz=z-bounds(template.base).centre[2],base=Float64Array.from(template.base,(v,j)=>j%3===2?v+dz:v);
    result.push({...template,name:`generated_${kind}_${x}_${i}`,base,generated:true});
   }
  }
 }
 if(frameCount!==5){
  // Each source frame contains four separate, corresponding timber members.
  // Resample between these source cross-sections; preserve source topology.
  for(let i=0;i<frameCount;i++){
   const u=i*4/(frameCount-1),lo=Math.min(3,Math.floor(u)),alpha=u-lo;
   for(let member=0;member<4;member++){
    const a=originals.find(m=>m.name===`empty_${130-lo*4+member}`),b=originals.find(m=>m.name===`empty_${130-(lo+1)*4+member}`);
    if(a.base.length!==b.base.length||a.indices.join(',')!==b.indices.join(','))throw Error('Roof frame topology mismatch');
    result.push({...a,name:`generated_frame_${i}_${member}`,base:Float64Array.from(a.base,(v,j)=>v*(1-alpha)+b.base[j]*alpha),generated:true});
   }
  }
 }
 return result;
}
