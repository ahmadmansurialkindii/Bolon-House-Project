import {sourceId} from './floor-boards.js';

const sections=[
 ['FOUNDATION',[['columns','Columns'],['stones','Stone supports']]],
 ['LOWER CONNECTIONS',[['ties','Horizontal ties']]],
 ['FLOOR',[['lowerFloor','Lower platform · papan'],['upperFloor','Upper platform · papan']]],
 ['BEAMS',[['roundBeams','Lower round members'],['upperBeams','Upper longitudinal beams'],['edgeBeams','Outer edge beams'],['beamCaps','Beam caps / other beams']]],
 ['ROOF',[['frameMembers','Frame members'],['roofRibs','Roof ribs'],['roofLongitudinals','Longitudinal roof members'],['otherRoof','Other roof members']]],
 ['ENTRANCE STAIR',[['steps','Treads'],['stairSupports','Stair supports']]]
];

// Count generated geometry once per piece. Assembly counts are separate metadata.
export function componentQuantities(items){
 const counts=Object.fromEntries(sections.flatMap(([,rows])=>rows.map(([key])=>[key,0])));
 let ground=0;
 for(const item of items){
  const id=sourceId(item);let key;
  switch(item.group){
   case 'ground':ground++;continue;
   case 'columns':key='columns';break;
   case 'stones':key='stones';break;
   case 'ties':key='ties';break;
   case 'floor':key=id===64?'lowerFloor':'upperFloor';break;
   case 'beams':key=[5,11].includes(id)?'roundBeams':[10,27].includes(id)?'upperBeams':[13,14].includes(id)?'edgeBeams':'beamCaps';break;
   case 'roof':key=id>=114||item.name.startsWith('generated_frame_')?'frameMembers':[35,47,48,51,45,50].includes(id)?'roofRibs':[52,53].includes(id)?'roofLongitudinals':'otherRoof';break;
   case 'stairs':key=id>=107&&id<=113?'steps':'stairSupports';break;
   default:throw Error('Unclassified component group: '+item.group);
  }
  counts[key]++;
 }
 return {counts,total:Object.values(counts).reduce((a,b)=>a+b,0),ground,roofFrames:counts.frameMembers/4,sections:sections.map(([label,rows])=>({label,rows:rows.map(([key,label])=>({key,label,count:counts[key]}))}))};
}
