export const baseline={widthScale:1,lengthScale:1,floor:2.23,body:2.07,roofScale:1};
export function deform(x,y,z,p){
 let h;
 if(y<=2.23)h=y*p.floor/2.23;
 else if(y<=4.3)h=p.floor+(y-2.23)*p.body/2.07;
 else h=p.floor+p.body+(y-4.3)*p.roofScale;
 return [(x-4.1)*p.widthScale,h,(z+5.62838879995)*p.lengthScale];
}
