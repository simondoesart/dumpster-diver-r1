/* Built for this block: recessed windows, shallow furnished rooms and opening doors. */
(()=>{'use strict';const T=THREE,M=DumpsterModels;
function create(b,{group,box,mesh,mat,sign,painted}){
 const g=new T.Group(),doors=[],h=b.z,w=b.w,d=b.h,wall=painted(0,b.kind==='shop'?'#d8bd91':b.kind==='fancy'?'#bec4b0':b.kind==='garage'?'#aa9c80':'#bd9882',2),trim=mat('#d5c5a5'),dark=mat('#38474b'),brick=mat(b.kind==='shop'?'#81634e':'#796756');
 // Deep central volume, with real window cavities on the exposed facades.
 box(g,0,h/2,0,w,h,d-2.25,wall);box(g,0,.12,0,w+.15,.24,d+.14,dark);
 for(const back of[false,true]){
  const f=group(g,0,0,(back?-1:1)*d/2);if(back)f.rotation.y=Math.PI;
  const shop=DumpsterCore.SHOPS.find(s=>s.building===b.kind&&((s.door.y<b.y)===back));
  const center=b.x+w/2,wx=shop?shop.windows.map(p=>(p.x-center)*(back?-1:1)):[-w*.30,.05],doorX=shop?(shop.door.x-center)*(back?-1:1):w*.31;
  box(f,0,2.15,0,w,.55,.22,wall);box(f,0,.26,0,w,.35,.2,brick);
  box(f,0,2.44,.03,w+.18,.14,.36,trim);box(f,0,h-.10,0,w+.22,.20,.37,trim);box(f,0,h-.29,0,w+.10,.13,.27,brick);
  for(const x of [-w/2+.11,w/2-.11])box(f,x,1.05,0,.22,1.9,.30,trim);
  // Room backs sit behind the openings, with furniture in the space between.
  box(f,0,.15,-.60,w-.3,.08,1.04,mat('#695f4c'));box(f,0,1.22,-1.04,w-.2,2.05,.08,mat(b.kind==='fancy'?'#8b7354':'#6a7664'));
  for(const x of wx){
   const ww=1.18;box(f,x,.61,.08,ww+.24,.13,.38,trim);box(f,x,1.86,.04,ww+.16,.12,.28,trim);
   for(const side of[-1,1])box(f,x+side*(ww/2+.035),1.24,0,.10,1.28,.24,dark);
   box(f,x,1.25,.025,.045,1.15,.06,trim);box(f,x,1.19,.025,ww,.045,.06,trim);
   const pane=new T.MeshStandardMaterial({color:'#9fbbab',roughness:.32,metalness:.08,transparent:true,opacity:.10,depthWrite:false});box(f,x,1.24,.02,ww,1.13,.025,pane);
   const glow=new T.MeshBasicMaterial({color:b.kind==='fancy'?'#b39462':'#829c73'});box(f,x,1.45,-1,.82,.75,.012,glow);
   const shelf=group(f,x,0,-.58);box(shelf,0,.83,0,1.08,.055,.5,mat('#4b4938'));
   const objects=b.kind==='shop'?['apple','banana','can']:b.kind==='garage'?['toolbox','hammer','radio']:b.kind==='fancy'?['porcelainGoose','lamp','books']:['plant','radio','books'];
   for(let i=0;i<3;i++){const o=M.model(objects[i],{max:i===1?.42:.3});o.position.set((i-1)*.32,.86,(i%2)*.07);shelf.add(o);}
   sign(f,b.kind==='shop'?'PAY FIRST. COMPLAIN LATER.':b.kind==='fancy'?'LOOK WITH YOUR EYES.':'NO LOITERING',x,.42,.125,ww,.13,{bg:'#d4c294',color:'#5d4e38'});
  }
  // Solid piers fill the wall between openings; actual glass remains see-through.
  const openings=[...wx.map(x=>[x-.65,x+.65]),[doorX-.51,doorX+.51]].sort((a,b)=>a[0]-b[0]);let left=-w/2+.2;
  for(const [l,r]of openings){if(l>left)box(f,(left+l)/2,1.18,0,l-left,1.77,.22,wall);left=Math.max(left,r);}if(left<w/2-.2)box(f,(left+w/2-.2)/2,1.18,0,w/2-.2-left,1.77,.22,wall);
  for(const x of[doorX-.53,doorX+.53])box(f,x,1.03,.02,.11,1.94,.22,trim);box(f,doorX,2.0,0,1.18,.15,.3,trim);
  const hinge=group(f,doorX-.45,.13,.08),door=group(hinge,.45,0,0);box(door,0,.82,0,.88,1.64,.07,dark);box(door,0,1,-.045,.64,.91,.014,new T.MeshStandardMaterial({color:'#99b0a0',transparent:true,opacity:.20,roughness:.35,depthWrite:false}));
  // Remove the opaque centre of the door and replace it with a framed clear opening.
  door.children[0].visible=false;box(door,0,.21,0,.88,.42,.075,dark);for(const x of[-.405,.405])box(door,x,1,0,.07,1.25,.075,dark);box(door,0,1.62,0,.88,.07,.075,dark);box(door,.31,.82,.055,.035,.17,.035,mat('#cfb780'));
  if(shop)doors.push({hinge,shop:shop.id});sign(f,b.kind==='shop'?'OPEN. UNFORTUNATELY.':'STAFF ONLY',doorX,1.9,.15,.91,.15,{bg:'#634d3c',color:'#ecd6a3'});
  const title=b.kind==='shop'?'MABEL’S • 24-ISH HOURS':b.kind==='fancy'?'NORTHSIDE • SECOND HAND, FIRST CLASS':b.kind==='garage'?'FIX / MEND / SWEAR':'THE PROMENADE';sign(f,title,0,2.71,.15,w-.35,.38,{bg:b.kind==='shop'?'#344d3c':'#d0bc94',color:b.kind==='shop'?'#e8d2a7':'#48544b'});
  if(h>3.5)for(let x=-w/2+.75;x<w/2-.3;x+=1.23){box(f,x,3.37,-.015,.72,.66,.1,dark);box(f,x,3.37,.05,.56,.51,.018,mat('#748b88'));box(f,x,3.37,.07,.035,.55,.045,trim);box(f,x,3.02,.07,.86,.09,.27,trim);box(f,x,3.74,.02,.84,.09,.22,trim);}
 }
 // Layered roof silhouette and exposed end walls with downpipes and staggered brick courses.
 box(g,0,h+.025,0,w+.3,.1,d+.3,dark);for(const x of[-w/2,w/2]){box(g,x,h/2,0,.18,h,d-.1,wall);for(let z=-d/2+.38;z<d/2;z+=.65)for(let y=.6;y<h-.6;y+=.48){box(g,x+(x<0?-.10:.10),y,z+(Math.round(y*2)%2?.08:0),.018,.025,.5,brick);}}
 const tank=M.model(b.kind==='garage'?'solar':'tank',{max:1});tank.position.set(-w*.22,h+.09,-.2);g.add(tank);box(g,w*.25,h+.24,-.4,.55,.48,.65,brick);box(g,w*.25,h+.5,-.4,.65,.08,.75,trim);
 return {g,doors};
}
window.DumpsterArchitecture={create};})();
