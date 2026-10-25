import { THREE, COLORS as C, group, part, ball, box, torus, geometry, worldPosition } from './geometry.js';
import { createTown, createBuildPad } from './town.js';
import { createTower, createEnemy } from './characters.js';
import { TYPES, PADS, position } from './engine.js';

const views = new WeakMap();
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -.2);
export function worldPoint(canvas, event) {
  const view=views.get(canvas);if(!view)return {x:-10000,y:-10000};
  view.ray(event);const hit=new THREE.Vector3();
  if(!view.raycaster.ray.intersectPlane(ground,hit))return {x:-10000,y:-10000};
  return {x:hit.x*40+660,y:hit.z*40+310};
}
function lights(scene,shadows=true){
  scene.add(new THREE.HemisphereLight('#c4dce7','#8d936a',1.05));
  const sun=new THREE.DirectionalLight('#fff1cc',2.65);sun.position.set(-12,25,15);sun.castShadow=shadows;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-23,right:23,top:19,bottom:-19,near:1,far:75});
  sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00015;sun.shadow.normalBias=.035;sun.shadow.radius=2;scene.add(sun);scene.add(sun.target);
  const rim=new THREE.DirectionalLight('#abcfdc',.55);rim.position.set(14,12,-14);scene.add(rim);return sun;
}
function disposeModel(root){const disposed=new Set();root.traverse(mesh=>{if(!mesh.isMesh)return;if(mesh.geometry.userData.owned&&!disposed.has(mesh.geometry)){mesh.geometry.dispose();disposed.add(mesh.geometry);}if(mesh.material.userData.owned&&!disposed.has(mesh.material)){mesh.material.dispose();disposed.add(mesh.material);}});}
function healthBar(){
  const root=group();
  const back=box(root,new THREE.MeshBasicMaterial({color:'#293f3b'}),0,0,0,.8,.1,.025,false);
  const fill=box(root,new THREE.MeshBasicMaterial({color:'#ee9b7d'}),0,0,.018,.73,.048,.015,false);back.material.userData.owned=true;fill.material.userData.owned=true;
  root.traverse(m=>{if(m.isMesh)m.castShadow=false;});root.userData={fill};return root;
}
export function createRenderer(canvas){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.04;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#8da9a0');scene.fog=new THREE.Fog('#a3bab0',65,110);
  const sun=lights(scene);if(innerWidth<700)sun.shadow.mapSize.set(1024,1024);
  const camera=new THREE.OrthographicCamera(-20,20,10,-10,.1,150);
  const target=new THREE.Vector3(0,.7,-.4),raycaster=new THREE.Raycaster(),ndc=new THREE.Vector2();
  let yaw=.12,zoom=1,width=0,height=0,previousTime=-1,previousActors=-1,frame=0,renderTotal=0;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const town=createTown();scene.add(town);
  const table=part(scene,geometry('table',()=>new THREE.CircleGeometry(60,64)),new THREE.MeshToonMaterial({color:'#7a9990'}),[0,-1.35,0],[1,1,1],false);table.rotation.x=-Math.PI/2;table.castShadow=false;
  const pads=PADS.map(p=>{let mesh=createBuildPad();mesh.position.copy(worldPosition(...p,.16));scene.add(mesh);return mesh;});
  const towers=new Map(),enemies=new Map(),shots=new Map(),effects=new Map(),ghosts=new Map();
  const ringMaterial=new THREE.MeshBasicMaterial({color:'#f6da87',transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide});
  const range=group(scene),rangeRing=new THREE.Mesh(new THREE.RingGeometry(.987,1,96),ringMaterial);
  rangeRing.rotation.x=-Math.PI/2;range.add(rangeRing);
  const rangeFill=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshBasicMaterial({color:'#f6da87',transparent:true,opacity:.055,depthWrite:false,side:THREE.DoubleSide}));rangeFill.rotation.x=-Math.PI/2;range.add(rangeFill);range.visible=false;
  const marker=part(scene,geometry('marker',()=>new THREE.OctahedronGeometry(.16)),new THREE.MeshBasicMaterial({color:'#ffe7a5'}),[0,4,0]);marker.visible=false;marker.castShadow=false;
  const frozenMat=new THREE.MeshBasicMaterial({color:'#b3f3ff',transparent:true,opacity:.6,depthWrite:false});
  const projectileMats=TYPES.map(t=>new THREE.MeshBasicMaterial({color:t.color}));
  function fit(){
    const rect=canvas.getBoundingClientRect();if(rect.width!==width||rect.height!==height){width=rect.width;height=rect.height;renderer.setSize(width,height,false);}
    const extent=38/zoom,aspect=width/Math.max(1,height);camera.left=-extent/2;camera.right=extent/2;camera.top=extent/aspect/2;camera.bottom=-extent/aspect/2;
    camera.position.set(Math.sin(yaw)*35,28,Math.cos(yaw)*35);camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  }
  function ray(event){fit();const rect=canvas.getBoundingClientRect();ndc.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(ndc,camera);}
  views.set(canvas,{ray,raycaster});
  function enemyModel(entity){
    const root=createEnemy(entity.kind),bar=healthBar();scene.add(root);scene.add(bar);root.userData.health=bar;return root;
  }
  function walk(root,time,moving=true){
    const {rig,kind}=root.userData;if(!rig)return;
    const phase=reduced?0:Math.sin(time*(kind==='brute'?5:9));
    rig.body.position.y=(moving?Math.abs(phase)*.035:Math.sin(time*2)*.012);
    rig.body.rotation.z=moving?phase*.035:0;
    rig.feet.forEach((joint,i)=>joint.rotation.x=moving?phase*(i?1:-1)*.42:0);
    rig.hands.forEach((joint,i)=>joint.rotation.x=moving?phase*(i?-1:1)*.22:-.35);
  }
  function addShot(shot){
    const root=group(),material=projectileMats[shot.type];
    if(shot.type===0){const disk=part(root,geometry('buttonShot',()=>new THREE.CylinderGeometry(.13,.13,.055,12)),material);disk.rotation.x=Math.PI/2;torus(root,C.cream,0,0,.04,.09,.015);}
    else if(shot.type===1){const shaft=part(root,geometry('arrowShot',()=>new THREE.CylinderGeometry(.018,.018,.6,6)),material);const tip=part(root,geometry('arrowTip',()=>new THREE.ConeGeometry(.07,.19,4)),material,[0,.36,0]);}
    else if(shot.type===2){for(let i=0;i<3;i++){const crystal=box(root,material,0,0,0,.045,.36,.045,false);crystal.rotation.z=i*Math.PI/3;}}
    else part(root,geometry('rapidShot',()=>new THREE.SphereGeometry(.065,8,6)),material);
    root.traverse(m=>{if(m.isMesh)m.castShadow=false;});scene.add(root);return root;
  }
  function addEffect(effect){
    const root=group(),material=effect.color==='#a4efff'?frozenMat:new THREE.MeshBasicMaterial({color:effect.color});
    if(material!==frozenMat)material.userData.owned=true;const ring=new THREE.Mesh(geometry('impactRing',()=>new THREE.TorusGeometry(1,.025,5,32)),material);ring.rotation.x=-Math.PI/2;root.add(ring);
    for(let i=0;i<8;i++){const shard=part(root,geometry('shard',()=>new THREE.OctahedronGeometry(.09)),material);shard.castShadow=false;}
    root.position.copy(worldPosition(effect.x,effect.y,.35));scene.add(root);return root;
  }
  function pickTower(event){
    ray(event);scene.updateMatrixWorld(true);
    const hits=raycaster.intersectObjects([...towers.values()],true);
    for(const hit of hits){let object=hit.object;while(object){if(object.userData.entity)return object.userData.entity;object=object.parent;}}
    return null;
  }
  function ghost(type){
    if(!ghosts.has(type)){
      const root=createTower(type);root.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.transparent=true;m.material.opacity=.36;m.material.depthWrite=false;m.castShadow=false;}});ghosts.set(type,root);scene.add(root);
    }
    return ghosts.get(type);
  }
  const stats={fps:60,calls:0,triangles:0};let previousFrame=performance.now(),fpsTotal=0;
  function draw(game,{hover=-1,selected=-1,inspected=null,paused=false}={}){
    const start=performance.now();fit();const time=game.time,advanced=time!==previousTime;
    for(let i=0;i<pads.length;i++){pads[i].visible=!game.towers.some(t=>t.pad===i);pads[i].scale.setScalar(hover===i&&selected>=0?1.065:1);}
    for(const [entity,root] of towers)if(!game.towers.includes(entity)||entity.level!==root.userData.level){scene.remove(root);disposeModel(root);towers.delete(entity);}
    for(const entity of game.towers){
      if(!towers.has(entity)){const root=createTower(entity.type,entity.level);root.userData.entity=entity;root.position.copy(worldPosition(entity.x,entity.y,.2));scene.add(root);towers.set(entity,root);}
      const root=towers.get(entity),rig=root.userData.rig,turn=root.userData.turn;
      const targetEnemy=game.enemies.filter(e=>Math.hypot(e.x-entity.x,e.y-entity.y)<TYPES[entity.type].range+(entity.level-1)*18).sort((a,b)=>b.d-a.d)[0];
      const angle=targetEnemy?Math.atan2(targetEnemy.x-entity.x,targetEnemy.y-entity.y):.18;
      turn.rotation.y+=Math.atan2(Math.sin(angle-turn.rotation.y),Math.cos(angle-turn.rotation.y))*.18;
      rig.body.position.y=reduced?0:Math.sin(time*2+entity.pad)*.014;
      rig.hands.forEach(hand=>hand.rotation.x=-.55-entity.recoil*.2);
      const weapon=root.userData.weapon;if(weapon){weapon.barrel.position.z=-entity.recoil*.16;weapon.flash.visible=entity.recoil>.72;weapon.flash.scale.setScalar(.7+entity.recoil*.65);if(entity.type===3)weapon.barrel.rotation.z=time*6;}
    }
    for(const [entity,root] of enemies)if(!game.enemies.includes(entity)){scene.remove(root);scene.remove(root.userData.health);disposeModel(root.userData.health);disposeModel(root);enemies.delete(entity);}
    for(const entity of game.enemies){
      if(!enemies.has(entity))enemies.set(entity,enemyModel(entity));
      const root=enemies.get(entity),next=position(entity.d+12);
      root.position.copy(worldPosition(entity.x,entity.y,.32));root.rotation.y=Math.atan2(next.x-entity.x,next.y-entity.y);
      walk(root,time+entity.seed,true);
      if(entity.kind==='dust'&&!reduced)root.position.y+=Math.abs(Math.sin(time*9+entity.seed))*.12;
      const bar=root.userData.health;bar.visible=entity.hp<entity.max||entity.kind==='brute';bar.position.copy(root.position);bar.position.y+=entity.kind==='brute'?2.7:entity.kind==='sock'?1.45:1.3;bar.quaternion.copy(camera.quaternion);
      const fraction=Math.max(0,entity.hp/entity.max);bar.userData.fill.scale.x=fraction;bar.userData.fill.position.x=-(1-fraction)*.365;
      bar.userData.fill.material.color.set(entity.slow>0?'#9ce7ef':'#ee9b7d');
      if(entity.slow>0){if(!root.userData.ice){const ice=part(root,geometry('iceHalo',()=>new THREE.TorusGeometry(.65,.025,5,24)),frozenMat,[0,.15,0]);ice.rotation.x=-Math.PI/2;ice.castShadow=false;root.userData.ice=ice;}root.userData.ice.visible=true;root.userData.ice.rotation.z=time;}
      else if(root.userData.ice)root.userData.ice.visible=false;
    }
    for(const [shot,root] of shots)if(!game.shots.includes(shot)){scene.remove(root);shots.delete(shot);}
    for(const shot of game.shots){
      if(!shots.has(shot))shots.set(shot,addShot(shot));const root=shots.get(shot);
      const remaining=Math.hypot(shot.target.x-shot.x,shot.target.y-shot.y),total=Math.max(1,Math.hypot(shot.target.x-shot.startX,shot.target.y-shot.startY)),progress=1-Math.min(1,remaining/total);
      root.position.copy(worldPosition(shot.x,shot.y,1.45-progress*.65+(shot.type===0?Math.sin(progress*Math.PI)*.55:0)));
      const dir=worldPosition(shot.target.x,shot.target.y,.65).sub(root.position).normalize();root.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);if(shot.type!==1)root.rotateY(time*9);
    }
    for(const [effect,root] of effects)if(!game.effects.includes(effect)){scene.remove(root);disposeModel(root);effects.delete(effect);}
    for(const effect of game.effects){
      if(!effects.has(effect))effects.set(effect,addEffect(effect));const root=effects.get(effect),t=1-effect.life/effect.max,radius=effect.size/40;
      root.children[0].scale.setScalar(Math.max(.01,t*radius));
      for(let i=1;i<root.children.length;i++){const p=root.children[i],a=i*Math.PI/4;p.position.set(Math.cos(a)*t*radius,Math.sin(t*Math.PI)*.5,Math.sin(a)*t*radius);p.scale.setScalar(Math.max(.01,1-t));p.rotation.set(t*4,a,t*6);}
    }
    for(const root of ghosts.values())root.visible=false;
    range.visible=false;marker.visible=Boolean(inspected);
    let selection=inspected;
    if(!selection&&selected>=0&&hover>=0&&!game.towers.some(t=>t.pad===hover)){
      const root=ghost(selected);root.visible=true;root.position.copy(worldPosition(...PADS[hover],.2));selection={x:PADS[hover][0],y:PADS[hover][1],type:selected,level:1};
    }
    if(selection){range.visible=true;range.position.copy(worldPosition(selection.x,selection.y,.27));range.scale.setScalar((TYPES[selection.type].range+(selection.level-1)*18)/40);ringMaterial.color.set(TYPES[selection.type].color);rangeFill.material.color.copy(ringMaterial.color);}
    if(inspected){marker.position.copy(worldPosition(inspected.x,inspected.y,3.6+(reduced?0:Math.sin(time*3)*.12)));marker.rotation.y=time;}
    const actorCount=towers.size+enemies.size;renderer.shadowMap.needsUpdate=frame===0||actorCount!==previousActors||(advanced&&frame%3===0);previousActors=actorCount;
    renderer.render(scene,camera);
    const now=performance.now();fpsTotal+=now-previousFrame;previousFrame=now;renderTotal+=now-start;frame++;
    if(frame%60===0){stats.fps=Math.round(60000/fpsTotal);stats.calls=renderer.info.render.calls;stats.triangles=renderer.info.render.triangles;canvas.dataset.fps=stats.fps;canvas.dataset.drawCalls=stats.calls;canvas.dataset.triangles=stats.triangles;canvas.dataset.renderMs=(renderTotal/60).toFixed(2);fpsTotal=0;renderTotal=0;}
    previousTime=time;
  }
  draw.pickTower=pickTower;draw.orbit=delta=>{yaw=THREE.MathUtils.clamp(yaw+delta,-1.05,1.05);};draw.zoom=delta=>{zoom=THREE.MathUtils.clamp(zoom+delta,.75,1.6);};draw.resetView=()=>{yaw=.12;zoom=1;};draw.stats=stats;
  draw.project=(x,y,height=0)=>{fit();const p=worldPosition(x,y,height).project(camera);const r=canvas.getBoundingClientRect();return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};};
  canvas.dataset.renderer='webgl2-mesh';canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.querySelector('#status').textContent='3D graphics paused. Refresh to restore the scene.';});
  let drag=null;
  canvas.addEventListener('pointerdown',e=>{if(e.button===2){drag={x:e.clientX};canvas.setPointerCapture(e.pointerId);}});
  canvas.addEventListener('pointermove',e=>{if(drag){draw.orbit((e.clientX-drag.x)*.006);drag.x=e.clientX;}});
  canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',e=>{if(innerWidth>700){e.preventDefault();draw.zoom(-e.deltaY*.0006);}},{passive:false});
  return draw;
}
export function createModelPreviews(container){
  const canvas=document.createElement('canvas');canvas.className='model-previews';canvas.setAttribute('aria-hidden','true');container.append(canvas);
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;
  const scene=new THREE.Scene();lights(scene,false);const camera=new THREE.OrthographicCamera(-1.45,1.45,2,-1.3,.1,30);camera.position.set(3,2.8,5);camera.lookAt(0,1.35,0);
  const models=Array.from({length:4},(_,type)=>{const root=createTower(type);scene.add(root);return root;});
  function paint(){
    const rect=container.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
    container.querySelectorAll('.portrait').forEach((slot,i)=>{const r=slot.getBoundingClientRect(),x=r.left-rect.left,y=rect.bottom-r.bottom;models.forEach((model,j)=>model.visible=i===j);renderer.setViewport(x,y,r.width,r.height);renderer.setScissor(x,y,r.width,r.height);renderer.render(scene,camera);});
  }
  new ResizeObserver(paint).observe(container);document.fonts.ready.then(paint);paint();return paint;
}
export function createWelcomeModel(container){
  const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');container.append(canvas);
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;
  const scene=new THREE.Scene();lights(scene,false);const camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(5.5,4.5,7.5);camera.lookAt(0,1.15,0);
  const root=group(scene);const first=createTower(0);first.position.set(-.8,.1,.35);root.add(first);const second=createTower(1);second.position.set(.9,.1,-.5);second.scale.setScalar(.82);root.add(second);
  const stage=part(scene,geometry('welcomeStage',()=>new THREE.CylinderGeometry(2.2,2,.35,32)),new THREE.MeshToonMaterial({color:'#96ad7a'}),[0,-.15,0]);
  let last=0;
  function paint(time){if(!document.querySelector('#overlay').hidden&&time-last>32){const r=container.getBoundingClientRect();if(r.width&&r.height){renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();root.rotation.y=matchMedia('(prefers-reduced-motion:reduce)').matches?0:Math.sin(time*.00023)*.18;renderer.render(scene,camera);}last=time;}requestAnimationFrame(paint);}requestAnimationFrame(paint);
}
