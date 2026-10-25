import { THREE, COLORS as C, group, part, ball, box, cylinder, torus, cone, stroke, rod, button, cushion, batch, worldPosition, toon } from './geometry.js';
import { PATH, PADS } from './engine.js';

function roof(parent, color, width, depth, height, y) {
  const w=width/2,d=depth/2;
  const vertices=[-w,y,-d,w,y,-d,0,y+height,-d, -w,y,d,0,y+height,d,w,y,d, -w,y,-d,0,y+height,-d,0,y+height,d, -w,y,-d,0,y+height,d,-w,y,d, w,y,-d,w,y,d,0,y+height,d, w,y,-d,0,y+height,d,0,y+height,-d];
  for(let i=0;i<vertices.length;i+=9)for(let j=0;j<3;j++){const t=vertices[i+3+j];vertices[i+3+j]=vertices[i+6+j];vertices[i+6+j]=t;}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();
  part(parent,geo,color);
  rod(parent,C.cream,[-w,y+.02,d+.02],[0,y+height+.02,d+.02],.028);rod(parent,C.cream,[0,y+height+.02,d+.02],[w,y+.02,d+.02],.028);
  for(let side of[-1,1])for(let row=1;row<=4;row++){const t=row/5;const x=side*w*(1-t),h=y+height*t+.035;rod(parent,color,[x,h,-d],[x,h,d],.055);for(let z=-d+.16;z<d;z+=.42)rod(parent,'#f2d1a4',[x,h+.012,z],[x,h+.012,z+.09],.013);}
}
function windowFrame(root,x,y,z,w=.4,h=.5){
  cushion(root,'#f7c96a',x,y,z,w,h,.08,.035,false);
  box(root,'#a47e53',x,y,z+.045,w+.09,.055,.055);box(root,'#a47e53',x,y,z+.045,.045,h+.07,.055);
  box(root,C.cream,x,y-h/2-.08,z+.04,w+.16,.11,.16);
}
function cottage(parent,x,z,color,scale=1,rotation=0){
  const root=group(parent,x,.18,z);root.scale.setScalar(scale);root.rotation.y=rotation;
  cushion(root,'#efd9af',0,.8,0,1.8,1.6,1.45,.14);
  cushion(root,'#b5a67d',0,.12,0,2,.24,1.65,.07);
  roof(root,color,2.08,1.8,.95,1.55);
  cushion(root,C.wood,0,.48,.76,.44,.9,.12,.08);button(root,C.brass,.12,.48,.84,.035);
  for(const side of[-1,1])windowFrame(root,side*.59,.94,.76,.35,.43);
  box(root,'#d8c396',.56,2.1,-.3,.32,.8,.33);box(root,C.cream,.56,2.52,-.3,.42,.13,.43);
  for(let i=0;i<3;i++)cushion(root,'#d2c8a1',0,.08-i*.025,.98+i*.19,.8+i*.2,.1,.22,.025,false);
  return root;
}
function townHall(parent){
  const root=group(parent,12.6,.18,-5.1);
  cushion(root,'#e8d6a7',0,1.25,0,3,2.5,2.35,.15);
  cushion(root,'#d7be8e',0,.18,0,3.4,.36,2.8,.08);
  roof(root,C.teal,3.5,2.9,1.4,2.5);
  cushion(root,'#f3e2b9',0,1.85,1.25,1.2,3,1,.1);
  roof(root,'#3b8b86',1.65,1.45,1,3.35);
  const clock=cylinder(root,C.gold,0,2.55,1.82,.51,.51,.1,28);clock.rotation.x=Math.PI/2;
  const face=cylinder(root,C.cream,0,2.55,1.88,.435,.435,.04,28,false);face.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){let a=i*Math.PI/6;const tick=box(root,C.darkWood,Math.sin(a)*.35,2.55+Math.cos(a)*.35,1.92,.026,.065,.025,false);tick.rotation.z=-a;}
  rod(root,C.darkWood,[0,2.55,1.94],[0,2.82,1.94],.026);rod(root,C.darkWood,[0,2.55,1.95],[.19,2.45,1.95],.026);
  cushion(root,C.wood,0,.72,1.79,.68,1.25,.15,.16);box(root,C.darkWood,0,.65,1.89,.03,1.1,.025,false);
  for(const side of[-1,1]){
    windowFrame(root,side*1.03,1.55,1.2,.42,.65);
    const flag=group(root,side*1.55,1.78,1.33);box(flag,'#c96565',0,0,0,.44,.72,.055,false);button(flag,C.gold,0,.02,.05,.12);
    rod(root,C.brass,[side*1.62,2.2,1.25],[side*1.01,2.2,1.25],.035);
  }
  for(let i=0;i<4;i++)cushion(root,'#d3c29a',0,.15-i*.04,2+i*.24,1.5+i*.3,.16,.28,.025,false);
  const flagpole=rod(root,C.brass,[0,4.25,0],[0,5.05,0],.035);box(root,'#d78368',.25,4.88,0,.5,.3,.025,false);
  return root;
}
function tree(parent,x,z,size=1,round=false){
  const root=group(parent,x,.18,z);root.scale.setScalar(size);
  cylinder(root,C.wood,0,.55,0,.13,.2,1.1,7);
  const colors=['#487e5c','#609567','#82ac75'];
  if(round){
    ball(root,colors[0],0,1.4,0,.78,.95,.65);ball(root,colors[1],-.35,1.8,.1,.54,.65,.5);ball(root,colors[2],.22,1.97,-.1,.5,.58,.44);
  }else for(let i=0;i<3;i++)cone(root,colors[i],0,1+i*.48,0,.87-i*.17,1.25-i*.13,9);
  for(let i=0;i<6;i++){const y=.92+i*.2;rod(root,'#c0cf8b',[-.035,y,.67-i*.07],[.035,y+.04,.67-i*.07],.016,4);}
  for(let i=0;i<3;i++)ball(root,C.gold,Math.sin(i*2.2)*.5,1.2+i*.18,.51-i*.02,.065,.065,.065,false);
  return root;
}
function flower(parent,x,z,color,size=1){
  const root=group(parent,x,.17,z);root.scale.setScalar(size);
  rod(root,C.darkLeaf,[0,0,0],[0,.42,0],.025);
  const leaf=ball(root,C.leaf,.12,.19,0,.14,.05,.065,false);leaf.rotation.z=.45;
  for(let i=0;i<5;i++){let a=i*Math.PI*2/5;ball(root,color,Math.cos(a)*.115,.44+Math.sin(a)*.115,0,.075,.075,.04,false);}
  button(root,C.gold,0,.44,.04,.07);return root;
}
function fence(parent,points){
  for(let i=0;i<points.length-1;i++){
    const a=new THREE.Vector3(...points[i]),b=new THREE.Vector3(...points[i+1]),length=a.distanceTo(b),steps=Math.ceil(length/.6);
    for(let j=0;j<=steps;j++){const p=a.clone().lerp(b,j/steps);cushion(parent,'#e8dbac',p.x,.59,p.z,.15,.88,.15,.035,false);cone(parent,'#f5e8bd',p.x,1.08,p.z,.13,.19,4);}
    for(let y of[.42,.8])rod(parent,'#c9b98a',[a.x,y,a.z],[b.x,y,b.z],.055);
  }
}
function portal(parent){
  const root=group(parent,-15.5,.2,-1.4);root.rotation.y=Math.PI/2;
  cushion(root,'#84669e',0,.14,0,2.15,.28,2,.08);
  box(root,'#67507e',0,1,-.85,2.05,1.8,.16);box(root,'#9476a9',-.95,1,0,.16,1.8,1.8);box(root,'#9476a9',.95,1,0,.16,1.8,1.8);
  cushion(root,'#ad8abb',0,2,0,2.2,.2,2.1,.07);
  const shape=new THREE.Shape();for(let i=0;i<10;i++){let a=i*Math.PI/5,r=i%2?.22:.43;const x=Math.sin(a)*r,y=Math.cos(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();
  const star=part(root,new THREE.ExtrudeGeometry(shape,{depth:.05,bevelEnabled:false}),C.gold,[0,2.12,0]);star.rotation.x=-Math.PI/2;
  for(const side of[-1,1])for(let i=0;i<8;i++)rod(root,C.cream,[side*.96,.3+i*.21,.9],[side*.96+.05,.34+i*.21,.9],.012,4);
}
function distanceToRoad(x,z){
  const p=new THREE.Vector2(x,z);let min=Infinity;
  for(let i=1;i<PATH.length;i++){
    const a=worldPosition(...PATH[i-1]),b=worldPosition(...PATH[i]);const v=new THREE.Vector2(b.x-a.x,b.z-a.z),offset=p.clone().sub(new THREE.Vector2(a.x,a.z));
    const t=THREE.MathUtils.clamp(offset.dot(v)/v.lengthSq(),0,1);min=Math.min(min,offset.sub(v.multiplyScalar(t)).length());
  }
  return min;
}
function road(parent){
  const lane=group(parent),points=PATH.map(p=>worldPosition(...p,.2)),left=[],right=[];
  for(let i=0;i<points.length;i++){
    const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dir=next.clone().sub(prev).normalize();
    const normal=new THREE.Vector3(-dir.z,0,dir.x);left.push(points[i].clone().addScaledVector(normal,.95));right.push(points[i].clone().addScaledVector(normal,-.95));
  }
  const contour=[...left,...[...right].reverse()].map(p=>new THREE.Vector2(p.x,-p.z));
  const shape=new THREE.Shape(contour);shape.closePath();
  const mesh=new THREE.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:true,bevelThickness:.018,bevelSize:.035,bevelSegments:2,steps:1});mesh.rotateX(-Math.PI/2);
  part(lane,mesh,'#eac77b',[0,.18,0],[1,1,1],false);
  stroke(lane,'#c7a665',left.map(p=>[p.x,.24,p.z]),.045,100);stroke(lane,'#fff0b4',right.map(p=>[p.x,.24,p.z]),.035,100);
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],dir=b.clone().sub(a),length=dir.length();dir.normalize();const normal=new THREE.Vector3(-dir.z,0,dir.x);
    for(let d=.2;d<length;d+=.38){const p=a.clone().addScaledVector(dir,d);for(const side of[-1,1]){const c=p.clone().addScaledVector(normal,side*.78);rod(lane,'#a99b60',[c.x-dir.x*.045,.255,c.z-dir.z*.045],[c.x+dir.x*.045,.255,c.z+dir.z*.045],.016,4);}}
  }
  lane.traverse(mesh=>{if(mesh.isMesh)mesh.castShadow=false;});
}
export function createTown(){
  const root=group();
  cushion(root,'#7e6854',0,-.65,0,35,1.25,18.7,.3);
  cushion(root,'#a5b17d',0,-.14,0,34.7,.35,18.4,.18);
  for(let iz=0;iz<5;iz++)for(let ix=0;ix<10;ix++){
    const x=-15.75+ix*3.5,z=-7.2+iz*3.6;
    cushion(root,(ix+iz)%3===0?'#a3bc80':(ix+iz)%2?'#8eac73':'#98b57a',x,.075,z,3.46,.16,3.55,.06,false);
    for(let k=0;k<7;k++)rod(root,'#c1ca92',[x-1.45+k*.44,.165,z+1.65],[x-1.3+k*.44,.165,z+1.65],.013,4);
  }
  road(root);
  townHall(root);portal(root);
  cottage(root,-11,-6.7,'#dc8c76',.85,.12);cottage(root,-4,-7,'#5b929b',1.05,-.12);cottage(root,4.5,-7.3,'#c67972',.8,.12);
  cottage(root,-11,7,'#5c9497',.9,-.2);cottage(root,-2.7,7.3,'#d98c76',.75,.12);cottage(root,11.6,7.4,'#5c9497',.85,-.1);
  for(let i=0;i<16;i++){
    const x=-15.3+i*2;
    if(Math.abs(x+11)>1.5&&Math.abs(x+4)>1.6&&Math.abs(x-4.5)>1.4&&x<10)tree(root,x,-7.1+(i%2)*.7,.7+(i%3)*.12,i%3===0);
    if(Math.abs(x+11)>1.6&&Math.abs(x+2.7)>1.6&&Math.abs(x-11.6)>1.6)tree(root,x,7.8-(i%2)*.4,.72+(i%3)*.1,i%3===1);
  }
  for(let i=0;i<6;i++){let z=-6.5+i*2.6;if(Math.abs(z+1.4)>1.7)tree(root,-16.1,z,.7,i%2===0);tree(root,16.3,z,.8,i%2===0);}
  fence(root,[[-16,0,-8.5],[9,0,-8.5]]);fence(root,[[-16,0,8.7],[16,0,8.7]]);
  for(let i=0;i<65;i++){
    const x=Math.sin(i*77.31)*15.7,z=Math.sin(i*29.7+2)*7.5;
    if(distanceToRoad(x,z)<1.6||PADS.some(p=>worldPosition(...p).distanceTo(new THREE.Vector3(x,0,z))<1.5)||Math.abs(z)>6.1)continue;
    flower(root,x,z,[C.coral,'#e5c66d','#b8a0c9'][i%3],.7+(i%3)*.15);
    if(i%5===0){const cap=ball(root,'#ce7a70',x+.35,.32,z+.2,.17,.11,.17);cylinder(root,C.cream,x+.35,.22,z+.2,.05,.06,.2,8,false);}
  }
  return batch(root);
}
export function createBuildPad(){
  const root=group();
  cylinder(root,'#a48f62',0,.16,0,.98,1.07,.28,24);
  cylinder(root,'#ede0b2',0,.32,0,1,1,.09,24);
  cylinder(root,'#6e8d6d',0,.38,0,.85,.85,.035,24,false);
  const ring=torus(root,C.gold,0,.42,0,.9,.035);ring.rotation.x=Math.PI/2;
  box(root,C.cream,0,.42,0,.36,.035,.1,false);box(root,C.cream,0,.42,0,.1,.035,.36,false);
  for(let i=0;i<16;i++){let a=i*Math.PI/8;rod(root,'#dcd9a3',[Math.sin(a)*.76,.41,Math.cos(a)*.76],[Math.sin(a+.04)*.76,.41,Math.cos(a+.04)*.76],.015,4);}
  return batch(root);
}
