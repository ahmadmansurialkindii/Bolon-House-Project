export const presets = {
 plan:{width:5.05,length:8.2,floor:1.56,body:1.67,diameter:.2,lean:7,roofHeight:2.75,frontRise:1.15,rearRise:1.5,overhang:.7,eave:.45,bays:6},
 figure7:{width:3.86,length:5.6,floor:1.56,body:1.67,diameter:.2,lean:7,roofHeight:2.75,frontRise:.8,rearRise:1.1,overhang:.6,eave:.35,bays:4}
};
export const dimensions=p=>({top:p.floor+p.body,half:p.width/2+p.body*Math.tan(p.lean*Math.PI/180),roofMax:p.floor+p.body+p.roofHeight+Math.max(p.frontRise,p.rearRise)});
export function roofPoint(p,t,s,side){
 const d=dimensions(p),bend=p.frontRise*Math.max(1-2*t,0)**2+p.rearRise*Math.max(2*t-1,0)**2;
 const ridge=d.top+p.roofHeight+bend;
 const eave=d.top-.12+bend*.12;
 // Almost straight transverse slopes, flaring at the outer edge.
 const profile=1-s+.07*Math.sin(Math.PI*s);
 return [side*s*(d.half+p.eave),eave+(ridge-eave)*profile,-p.length/2-p.overhang+t*(p.length+2*p.overhang)];
}
export function supportPoints(p){
 const pts=[];for(let i=0;i<=p.bays;i++) for(const side of [-1,1])pts.push([side*(p.width/2-.16),0,-p.length/2+i*p.length/p.bays]);return pts;
}
export function validate(p){
 for(const [k,v] of Object.entries(p))if(!Number.isFinite(v))throw Error(`Invalid ${k}`);
 for(const k of ['width','length','floor','body','diameter','roofHeight'])if(p[k]<=0)throw Error(`${k} must be positive`);
 if(!Number.isInteger(p.bays)||p.bays<1)throw Error('Invalid bay count');
 return true;
}
