import { THREE, COLORS as C, group, part, ball, box, cylinder, torus, cone, stroke, rod, button, batch, toon, geometry } from './geometry.js';

function eyes(body, y, z, spread = .18, size = .06) {
  for (const side of [-1, 1]) {
    ball(body, '#24383c', side * spread, y, z, size, size * 1.18, size * .65, false);
    ball(body, '#fff9e3', side * spread - .014, y + .02, z + size * .56, size * .23, size * .23, size * .15, false);
  }
}
function face(body, color, y = 1.25, z = .4) {
  ball(body, color, 0, y, z, .26, .18, .13);
  ball(body, '#3c373e', 0, y + .07, z + .12, .073, .05, .045, false);
  stroke(body, '#674c4b', [[-.095, y - .025, z + .115], [0, y - .06, z + .135], [.095, y - .025, z + .115]], .012);
}
function stitches(body, y, z, width = .23) {
  for (let i = -2; i <= 2; i++) rod(body, C.cream, [i * width / 4 - .022, y - .025, z], [i * width / 4 + .022, y + .025, z], .012, 4);
}
function legs(root, color, offset = .25, y = .26, length = .33, bootColor = color) {
  return [-1, 1].map(side => {
    const joint = group(root, side * offset, y, 0);
    ball(joint, color, 0, -.08, 0, .17, length, .18);
    ball(joint, bootColor, 0, -length + .02, .12, .2, .13, .29);
    batch(joint); return joint;
  });
}
function arms(root, color, y = 1, spread = .48, length = .32) {
  return [-1, 1].map(side => {
    const joint = group(root, side * spread, y, .02);
    const arm = ball(joint, color, 0, -.12, .07, .17, length, .17); arm.rotation.z = -side * .3;
    ball(joint, color, side * .05, -.3, .12, .18, .17, .18);
    batch(joint); return joint;
  });
}
function scarf(body, color, y = 1.05, radius = .36) {
  const collar = torus(body, color, 0, y, 0, radius, .1, true); collar.rotation.x = Math.PI / 2;
  const tail = box(body, color, -.23, y - .22, .38, .19, .43, .09); tail.rotation.z = -.2;
  stitches(body, y - .32, .435, .15);
}
function bear(root, boss = false) {
  const body = group(root), color = boss ? C.violet : C.coral;
  ball(body, color, 0, .78, 0, .52, .61, .38);
  ball(body, boss ? C.coral : '#f4ad91', .02, .78, .32, .34, .39, .13);
  ball(body, boss ? C.purple : C.coral, 0, 1.48, 0, .48, .43, .4);
  for (const side of [-1, 1]) {
    ball(body, color, side * .37, 1.78, -.01, .2, .2, .13);
    ball(body, boss ? C.coral : '#f4bf9f', side * .37, 1.79, .105, .12, .12, .035, false);
  }
  face(body, C.cream, 1.32, .34);
  if (boss) {
    button(body, C.gold, -.18, 1.52, .36, .115); button(body, C.gold, .19, 1.52, .36, .1);
    ball(body, C.coral, -.24, 1.67, .3, .19, .14, .05);
    for (let i = 0; i < 6; i++) rod(body, C.gold, [-.04 + i * .015, 1.17 + i * .12, .405], [.04 + i * .015, 1.2 + i * .12, .405], .015, 5);
    stitches(body, .87, .45, .44); stitches(body, 1.69, .37, .3);
    button(body, C.cream, .18, .6, .41, .14);
  } else { eyes(body, 1.49, .365); scarf(body, '#c85861', 1.1); }
  const feet = legs(root, color, .27, .32, .28);
  const hands = arms(root, color, 1, boss ? .59 : .49, boss ? .38 : .29);
  if (boss) for (const hand of hands) hand.scale.set(1.55, 1.2, 1.5);
  batch(body); return { body, feet, hands };
}
function bunny(root) {
  const body = group(root);
  ball(body, '#82ae83', 0, .8, 0, .4, .5, .29);
  ball(body, C.cream, 0, .85, .26, .24, .29, .065);
  ball(body, C.mint, 0, 1.43, .01, .41, .38, .33);
  for (const side of [-1, 1]) {
    const ear = group(body, side * .21, 1.87, -.03); ear.rotation.z = -side * .2;
    ball(ear, C.mint, 0, .24, 0, .14, .48, .12);
    ball(ear, '#efbaad', 0, .25, .1, .075, .34, .035, false);
  }
  eyes(body, 1.48, .317, .155, .052);
  ball(body, C.cream, 0, 1.29, .3, .22, .15, .11);
  ball(body, '#d68b84', 0, 1.37, .4, .055, .04, .032, false);
  const hood = torus(body, '#5c8b67', 0, 1.1, 0, .29, .07); hood.rotation.x = Math.PI / 2;
  box(body, '#896747', 0, .64, .29, .69, .12, .07); button(body, C.gold, 0, .64, .35, .075);
  const quiver = cylinder(body, C.wood, -.26, 1.03, -.31, .12, .1, .55, 8); quiver.rotation.z = -.2;
  for (let i = 0; i < 3; i++) rod(body, C.cream, [-.34 + i * .08, 1.25, -.33], [-.38 + i * .08, 1.64, -.3], .018);
  const feet = legs(root, C.mint, .2, .3, .27, '#9b7851');
  const hands = arms(root, C.mint, 1, .39, .23);
  batch(body); return { body, feet, hands };
}
function penguin(root) {
  const body = group(root);
  ball(body, C.navy, 0, .85, 0, .49, .67, .36);
  ball(body, C.cream, 0, .76, .28, .34, .46, .115);
  ball(body, C.blue, 0, 1.45, .01, .36, .35, .32);
  for (const side of [-1, 1]) ball(body, C.cream, side * .12, 1.43, .27, .15, .2, .08, false);
  eyes(body, 1.49, .327, .12, .047);
  const beak = cone(body, '#eeb255', 0, 1.34, .4, .11, .2, 10); beak.rotation.x = Math.PI / 2;
  scarf(body, '#62b9cf', 1.12, .32);
  for (const side of [-1, 1]) {
    ball(body, C.navy, side * .48, .88, 0, .12, .38, .18).rotation.z = -side * .4;
    ball(body, '#edaa4f', side * .2, .24, .16, .23, .08, .3);
    ball(body, '#66b9cc', side * .37, 1.47, 0, .13, .2, .17);
  }
  stroke(body, '#9ddcde', [[-.37,1.5,0],[-.25,1.8,0],[0,1.87,0],[.25,1.8,0],[.37,1.5,0]], .045);
  batch(body); return { body, feet: [], hands: [] };
}
function fox(root) {
  const body = group(root);
  ball(body, '#367d78', 0, .79, 0, .42, .51, .3);
  box(body, '#79aaa0', -.2, 1.05, .27, .09, .4, .06); box(body, '#79aaa0', .2, 1.05, .27, .09, .4, .06);
  button(body, C.gold, -.2, .94, .33, .055); button(body, C.gold, .2, .94, .33, .055);
  ball(body, '#e79b53', 0, 1.45, .01, .44, .38, .36);
  for (const side of [-1, 1]) {
    cone(body, '#d88748', side * .3, 1.85, -.02, .21, .46, 4).rotation.z = -side * .15;
    cone(body, C.cream, side * .3, 1.84, .07, .12, .27, 4).rotation.z = -side * .15;
    ball(body, C.cream, side * .16, 1.27, .28, .23, .17, .15);
    torus(body, C.brass, side * .18, 1.69, .3, .13, .045);
    const lens = cylinder(body, '#79c1d2', side * .18, 1.69, .305, .105, .105, .03, 14, false); lens.rotation.x = Math.PI / 2;
  }
  eyes(body, 1.45, .35, .18, .052);
  ball(body, '#3f3b3c', 0, 1.29, .445, .075, .057, .045, false);
  const tail = group(body, .32, .55, -.23); tail.rotation.z = -.6;
  ball(tail, '#dc8c43', .12, .13, -.17, .22, .48, .23); ball(tail, C.cream, .16, .48, -.2, .18, .2, .19);
  const feet = legs(root, '#bf743f', .23, .3, .27, '#765d45'), hands = arms(root, '#e79b53', 1, .42, .26);
  batch(body); return { body, feet, hands };
}
function dust(root) {
  const body = group(root);
  ball(body, C.purple, 0, .49, 0, .46, .45, .39);
  for (const side of [-1, 1]) {
    const ear = group(body, side * .28, .85, -.03); ear.rotation.z = -side * .65;
    ball(ear, C.purple, 0, .14, 0, .13, .32, .12);
    ball(ear, '#bd95bc', 0, .15, .09, .065, .2, .04, false);
    button(body, '#f3cd65', side * .17, .54, .365, .105);
  }
  for (let i = 0; i < 5; i++) cone(body, C.purple, Math.sin(i*2.4)*.24, .88, Math.cos(i*2.4)*.2, .1, .2, 5).rotation.z = (i-2)*.3;
  ball(body, C.violet, -.12, .76, .32, .14, .09, .035); stitches(body, .77, .36, .22);
  stroke(body, '#5d496e', [[-.08,.32,.34],[0,.28,.38],[.12,.34,.36]], .014);
  const feet = legs(root, C.purple, .24, .15, .12); batch(body); return { body, feet, hands: [] };
}
function sock(root) {
  const body = group(root);
  ball(body, '#d4c7a0', 0, .65, 0, .3, .38, .25);
  ball(body, '#e2d4b0', 0, 1.14, 0, .45, .4, .31);
  for (const side of [-1,1]) cone(body, '#d4c7a0', side*.46, 1.19, 0, .16, .4, 4).rotation.z = -side * 1.1;
  button(body, C.teal, -.17, 1.2, .287, .105); button(body, C.gold, .17, 1.2, .287, .105);
  ball(body, '#b45e61', 0, 1.06, .34, .06, .08, .04);
  stroke(body, '#765951', [[-.21,.95,.27],[0,.9,.32],[.21,.98,.27]], .018);
  for (let i=0;i<4;i++) rod(body,C.darkWood,[-.17+i*.1,.9,.31],[-.15+i*.1,.98,.31],.013);
  ball(body, C.teal, 0, .67, .17, .29, .3, .13); button(body,C.gold,0,.67,.31,.075);
  const brim = torus(body, '#bd595c',0,1.43,0,.36,.09);brim.rotation.x=Math.PI/2;
  const hat = group(body,0,1.48,0); hat.rotation.z=-.28;
  cone(hat,'#c95b62',0,.22,0,.37,.56,14);
  for(let i=0;i<2;i++){const stripe=torus(hat,C.cream,0,.09+i*.16,0,.28-i*.085,.04);stripe.rotation.x=Math.PI/2;}
  ball(hat,C.cream,-.12,.52,0,.13);
  const feet=legs(root,'#d4c7a0',.2,.27,.22,'#9a7750'),hands=arms(root,'#d4c7a0',.83,.32,.22);
  rod(body,C.wood,[.49,.37,.2],[.49,1.04,.2],.04);box(body,C.wood,.49,.55,.2,.26,.065,.085);box(body,'#d3b37b',.49,.84,.2,.12,.6,.07);
  batch(body);return {body,feet,hands};
}
export function createEnemy(kind) {
  const root=group(),rig=kind==='dust'?dust(root):kind==='sock'?sock(root):bear(root,true);
  if(kind==='brute')root.scale.setScalar(1.25);else if(kind==='sock')root.scale.setScalar(.67);else root.scale.setScalar(.8);
  root.userData={rig,kind}; return root;
}
function platform(root,type){
  const base=group(root);
  cylinder(base,'#8f9b82',0,.12,0,.77,.84,.24,24);cylinder(base,C.cream,0,.28,0,.78,.78,.13,24);
  const trim=torus(base,type===2?'#87c9d9':C.gold,0,.36,0,.71,.035);trim.rotation.x=Math.PI/2;
  for(let i=0;i<10;i++){const a=i*Math.PI/5;box(base,'#bcb68d',Math.sin(a)*.75,.22,Math.cos(a)*.75,.035,.12,.035,false);}
  if(type===1){cylinder(base,C.wood,0,.52,0,.58,.58,.43,20);cylinder(base,'#c5a271',0,.77,0,.71,.71,.1,20);for(let i=0;i<12;i++){let a=i*Math.PI/6;rod(base,'#e5c38e',[Math.sin(a)*.59,.32,Math.cos(a)*.59],[Math.sin(a)*.59,.7,Math.cos(a)*.59],.018);}}
  if(type===2)cylinder(base,C.navy,0,.5,0,.72,.72,.28,24);
  if(type===3)cylinder(base,C.brass,0,.46,0,.65,.65,.22,18);
  const emblem=button(base,type===2?'#86cfdf':C.gold,0,.46,.73,.16);emblem.rotation.x=-.1;
  batch(base);return base;
}
function cannon(parent,type){
  const gun=group(parent,0,.82,.5),barrel=group(gun);
  if(type===0){
    const tube=part(barrel,geometry('cannonTube',()=>new THREE.CylinderGeometry(.24,.31,.85,20,1,true)),C.cream,[0,0,.25]);tube.rotation.x=Math.PI/2;
    torus(barrel,C.gold,0,0,.68,.245,.065,true);
    const dark=cylinder(barrel,'#394445',0,0,.54,.2,.2,.02,20,false);dark.rotation.x=Math.PI/2;
    const band=torus(barrel,C.coral,0,0,.05,.29,.05,true);box(gun,C.brass,0,-.27,.15,.48,.19,.53);
    for(const side of[-1,1]){const wheel=cylinder(gun,C.wood,side*.35,-.25,.05,.22,.22,.1,16);wheel.rotation.z=Math.PI/2;}
  }else{
    const housing=cylinder(barrel,C.brass,0,0,.14,.3,.3,.4,16);housing.rotation.x=Math.PI/2;
    for(let i=0;i<6;i++){let a=i*Math.PI/3;let tube=cylinder(barrel,'#53656a',Math.cos(a)*.18,Math.sin(a)*.18,.55,.066,.066,.65,10);tube.rotation.x=Math.PI/2;torus(barrel,C.gold,Math.cos(a)*.18,Math.sin(a)*.18,.89,.067,.016);}
    torus(barrel,C.gold,0,0,.5,.26,.045);box(gun,C.teal,0,-.3,.1,.55,.19,.46);
  }
  batch(barrel);
  const fixed=group();for(const child of [...gun.children])if(child!==barrel){gun.remove(child);fixed.add(child);}gun.add(batch(fixed));
  const flash=part(gun,geometry('flash',()=>new THREE.OctahedronGeometry(.2)),new THREE.MeshBasicMaterial({color:'#fff4a5',transparent:true,opacity:.9}),[0,0,type===0?.8:1]);flash.visible=false;flash.castShadow=false;
  return {gun,barrel,flash};
}
export function createTower(type,level=1){
  const root=group(),base=platform(root,type),turn=group(root,0,type===1?.9:type===3?.65:.45,0);
  const rig=type===0?bear(turn):type===1?bunny(turn):type===2?penguin(turn):fox(turn);
  let weapon=null;
  if(type===0||type===3)weapon=cannon(turn,type);
  if(type===1){const bow=group(turn,.43,1.05,.43);stroke(bow,C.wood,[[0,-.52,0],[.15,-.3,.15],[.2,0,.19],[.15,.3,.15],[0,.52,0]],.035,20);rod(bow,C.cream,[0,-.52,0],[0,.52,0],.009);rod(bow,'#d7b77d',[0,0,-.18],[0,0,.63],.018);const tip=cone(bow,'#9ea99c',0,0,.69,.06,.17,6);tip.rotation.x=Math.PI/2;batch(bow);}
  if(type===2){
    const glassMaterial=new THREE.MeshPhongMaterial({color:'#b5f1ff',transparent:true,opacity:.13,shininess:90,depthWrite:false,side:THREE.FrontSide});
    const glass=part(turn,geometry('globe',()=>new THREE.SphereGeometry(1,28,20)),glassMaterial,[0,1.07,0],[.91,.95,.91],false);glass.castShadow=false;
    const arc=stroke(turn,'#c9f7ff',[[-.63,1.05,.56],[-.6,1.52,.4],[-.35,1.86,.28]],.025);arc.castShadow=false;
    const crystal=group(turn,-.52,1.95,0);for(let i=0;i<3;i++){const bar=box(crystal,'#9be7ed',0,0,0,.045,.47,.045,false);bar.rotation.z=i*Math.PI/3;}batch(crystal);
  }
  const stars=group(root,0,.4,-.55);
  for(let i=0;i<level;i++){const gem=part(stars,geometry('rankGem',()=>new THREE.OctahedronGeometry(.08)),C.gold,[(i-(level-1)/2)*.19,0,0]);gem.rotation.z=Math.PI/4;}
  batch(stars);
  root.userData={type,level,base,turn,rig,weapon,stars};return root;
}
