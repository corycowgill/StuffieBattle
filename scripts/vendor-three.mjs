import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),source=new URL('node_modules/three/',root),target=new URL('dist/vendor/',root);
await fs.mkdir(target,{recursive:true});
for(const name of ['three.module.js','three.core.js']){const text=await fs.readFile(new URL('build/'+name,source),'utf8');await fs.writeFile(new URL(name,target),text.replace(/^(\t+) +\t/gm,'$1\t'));}
const utils=await fs.readFile(new URL('examples/jsm/utils/BufferGeometryUtils.js',source),'utf8');
await fs.writeFile(new URL('BufferGeometryUtils.js',target),utils.replaceAll("from 'three'","from './three.module.js'"));
await fs.copyFile(new URL('LICENSE',source),new URL('THREE-LICENSE.txt',target));
console.log('Vendored the installed Three.js build and license into dist/vendor.');
