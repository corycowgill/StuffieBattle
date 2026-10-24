export const sheet=new Image();sheet.src='assets/towers.png';
const regions=[[0,535],[560,1024],[1024,1536],[1536,2048]];
export function drawSprite(ctx,index,x,y,width,height){if(!sheet.complete||!sheet.naturalWidth)return;let [left,right]=regions[index],scale=sheet.naturalWidth/2048,sw=(right-left)*scale,sh=sheet.naturalHeight,ratio=Math.min(width/sw,height/sh),w=sw*ratio,h=sh*ratio;ctx.drawImage(sheet,left*scale,0,sw,sh,x+(width-w)/2,y+height-h,w,h);}
function portraits(){document.querySelectorAll('canvas.portrait').forEach((c,i)=>{c.width=150;c.height=170;drawSprite(c.getContext('2d'),i,0,0,150,170);});}sheet.addEventListener('load',portraits);if(sheet.complete)queueMicrotask(portraits);
