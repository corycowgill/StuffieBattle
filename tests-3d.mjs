import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {THREE} from './dist/geometry.js';
import {createTower,createEnemy} from './dist/characters.js';
import {createTown} from './dist/town.js';

function verifyModel(root){
  const size=new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
  assert.ok(size.x>.5&&size.y>.5&&size.z>.5,'character must have volume on all three axes');
  let meshes=0,toon=0;
  root.traverse(object=>{
    assert.ok(!object.isSprite,'scene characters must not contain sprites');
    if(object.isMesh){meshes++;assert.ok(object.geometry.attributes.position.count>0);assert.equal(object.material.map,null,'mesh surfaces must not use character images');if(object.material.isMeshToonMaterial){toon++;assert.equal(object.material.gradientMap.image.width,4);assert.equal(object.material.gradientMap.magFilter,THREE.NearestFilter);}}
  });
  assert.ok(meshes>8);assert.ok(toon>2);
}
test('every defender has volumetric cel-shaded mesh geometry at every upgrade level',()=>{
  for(let type=0;type<4;type++)for(let level=1;level<=3;level++){const model=createTower(type,level);verifyModel(model);assert.ok(model.userData.turn.isGroup);assert.equal(model.userData.level,level);}
});
test('all enemy types have actual mesh bodies and articulated walking joints',()=>{
  for(const kind of ['dust','sock','brute']){const model=createEnemy(kind);verifyModel(model);assert.equal(model.userData.rig.feet.length,2);for(const joint of model.userData.rig.feet)assert.ok(joint.isGroup);}
});
test('town geometry has depth and shadow-casting scenery',()=>{
  const town=createTown(),size=new THREE.Box3().setFromObject(town).getSize(new THREE.Vector3());
  assert.ok(size.x>30&&size.z>16&&size.y>5);let casters=0,receivers=0;
  town.traverse(object=>{assert.ok(!object.isSprite);if(object.isMesh){if(object.castShadow)casters++;if(object.receiveShadow)receivers++;assert.equal(object.material.map,null);}});
  assert.ok(casters>10&&receivers>10);
});
test('runtime modules and CSS have no bitmap or sprite-rendering dependency',()=>{
  for(const file of ['game.js','render.js','geometry.js','characters.js','town.js']){
    const source=fs.readFileSync('dist/'+file,'utf8');
    assert.ok(!/new\s+(?:THREE\.)?Sprite\s*\(|drawImage\s*\(|new\s+Image\s*\(|TextureLoader\s*\(|assets\//.test(source),file);
  }
  assert.ok(!fs.readFileSync('dist/style.css','utf8').includes('assets/'));
  assert.ok(fs.existsSync('dist/vendor/three.module.js')&&fs.existsSync('dist/vendor/three.core.js'));
});
