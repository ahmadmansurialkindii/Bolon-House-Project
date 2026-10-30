"""Convert uploaded DAE, preserving each mesh and instance transform.
The supplied converted export writes matrices row-major. No geometry is fitted.
"""
import xml.etree.ElementTree as E
import json,sys
from pathlib import Path
source=Path(sys.argv[1]);out=Path(sys.argv[2])
r=E.parse(source).getroot();n={'c':r.tag.split('}')[0][1:]}
geoms={}
for g in r.findall('c:library_geometries/c:geometry',n):
 mesh=g.find('c:mesh',n);sid=mesh.find('c:vertices/c:input',n).get('source')[1:]
 pos=list(map(float,mesh.find(f"c:source[@id='{sid}']/c:float_array",n).text.split()))
 indices=[]
 for poly in mesh.findall('c:polylist',n):
  ins=poly.findall('c:input',n);stride=max(int(x.get('offset','0')) for x in ins)+1
  offset=int(next(x for x in ins if x.get('semantic')=='VERTEX').get('offset','0'))
  values=list(map(int,poly.find('c:p',n).text.split()));counts=list(map(int,poly.find('c:vcount',n).text.split()));cursor=0
  for count in counts:
   assert count==3,'Unexpected non-triangle polygon; do not use naive triangulation'
   indices.extend(values[cursor+offset:cursor+count*stride:stride]);cursor+=count*stride
  assert cursor==len(values)
 assert max(indices)<len(pos)//3
 geoms[g.get('id')]={'positions':pos,'indices':indices}
instances=[]
for node in r.findall('c:library_visual_scenes/c:visual_scene/c:node',n):
 name=node.get('name');num=int(name.split('_')[-1]);m=list(map(float,node.find('c:matrix',n).text.split()))
 assert m[12:]==[0,0,0,1]
 group='roof'
 if num==63:group='ground'
 elif 77<=num<=104:group='stones'
 elif num in [2,3,4,6,7,8,9,12,15,16,17,18,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34]:group='columns'
 elif 55<=num<=76:group='ties'
 elif 105<=num<=113:group='stairs'
 elif num in [54,64]:group='floor'
 elif num<35 or 36<=num<=39 or num in [41,44]:group='beams'
 instances.append({'name':name,'geometry':node.find('c:instance_geometry',n).get('url')[1:],'matrix':m,'group':group})
result={'source':source.name,'unit':'metre','upAxis':'Y','matrixOrder':'row-major as written by converted source','classification':'Display groups assigned provisionally by inspection; original node names retained.','geometries':geoms,'instances':instances}
out.write_text(json.dumps(result,separators=(',',':')))
print(f'{len(geoms)} meshes, {len(instances)} instances, {sum(len(g["indices"])//3 for g in geoms.values())} source triangles; {out.stat().st_size} bytes')
