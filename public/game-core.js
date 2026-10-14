/* Deterministic gameplay simulation. World coordinates are x/y; rendering uses x/z. */
(function(root){
'use strict';
const ITEMS={
 batteries:{name:'Loose batteries',short:'Batteries',points:1,slots:1,tier:0,description:'Still a little life in them. Crafting material.',color:'#b59252'},
 sock:{name:'Lonesome sports sock',short:'Sock',points:1,slots:1,tier:0,description:'Its partner left town. Crafting material.',color:'#a1aaa3'},
 bottle:{name:'Broken bottle',short:'Bottle',points:0,slots:0,tier:1,equip:'weapon',description:'Quick, scrappy and entirely unclassy.',color:'#729b79'},
 batterySock:{name:'The night-night sock',short:'Battery sock',points:0,slots:0,tier:2,equip:'weapon',description:'One absurdly heavy sock. A sweeping wallop.',color:'#cfac78'},
 cans:{name:'Bag of cans',short:'Cans',points:1,slots:1,tier:0,description:'A little noisy. Still counts.',color:'#829b8d'},
 food:{name:'Mystery takeaway',short:'Takeaway',points:2,slots:1,tier:0,description:'Best before… let’s not look.',color:'#dfc99c'},
 toolbox:{name:'Heavy toolbox',short:'Toolbox',points:3,slots:2,tier:1,description:'Someone’s whole weekend, in a box.',color:'#b75c43'},
 lamp:{name:'Wonky lamp',short:'Lamp',points:4,slots:2,tier:1,description:'A little crooked. A lot of potential.',color:'#dbb168'},
 music:{name:'Pocket radio',short:'Radio',points:5,slots:1,tier:1,description:'It still knows all the good stations.',color:'#a45643'},
 goose:{name:'Porcelain goose',short:'Goose',points:7,slots:1,tier:2,description:'Magnificent. Unnecessary. Yours.',color:'#f2e3ba'},
 basket:{name:'Market basket',short:'Basket',points:0,slots:0,tier:1,equip:'carrier',capacity:8,description:'Two more spaces. A very jaunty wobble.',color:'#ceaa6b'},
 sack:{name:'Bottomless-ish sack',short:'Sack',points:0,slots:0,tier:1,equip:'carrier',capacity:10,description:'Ten spaces. Questionable stitching.',color:'#899374'},
 cart:{name:'Wonky shopping trolley',short:'Trolley',points:0,slots:0,tier:2,equip:'carrier',capacity:12,description:'Twelve spaces. One extremely musical wheel.',color:'#81aca1'},
 pan:{name:'Cast-iron pan',short:'Pan',points:0,slots:0,tier:1,equip:'weapon',description:'Short reach. A beautiful, resounding CLANG.',color:'#7b8991'},
 umbrella:{name:'Unreasonable umbrella',short:'Umbrella',points:0,slots:0,tier:2,equip:'weapon',description:'Extra reach. The third swing opens it.',color:'#c07759'}
};
const WEAPONS={bottle:{name:'Broken bottle',range:1.45,power:1.5,damage:2,cooldown:.21},batterySock:{name:'Battery sock',range:2.15,power:2.6,damage:2,cooldown:.36},broom:{name:'Trusty broom',range:1.85,power:1.9,damage:1},pan:{name:'Cast-iron pan',range:1.65,power:2.4,damage:2},umbrella:{name:'Unreasonable umbrella',range:2.4,power:2.2,damage:1}};
const TIERS=[{name:'USEFUL JUNK',color:'#a9c5b1'},{name:'GOOD FIND',color:'#8ccac7'},{name:'ABSOLUTE TREASURE',color:'#e7b956'}];
const WORLD={width:28,height:24,duration:180,capacity:6,target:12};
const BUILDINGS=[
 {x:8,y:12,w:6,h:5,z:3.8,kind:'shop',name:'Mabel’s Grocery'},
 {x:14,y:12,w:6,h:5,z:4.6,kind:'apartment',name:'The Promenade'},
 {x:8,y:7,w:5.5,h:5,z:3.3,kind:'garage',name:'Fix / Mend'},
 {x:13.5,y:7,w:6.5,h:5,z:4.2,kind:'fancy',name:'Northside Antiques'}
];
const PROPS=[{x:3.4,y:11,w:.8,h:1.6,z:.5,kind:'planter'},{x:23.8,y:15.2,w:.7,h:1.8,z:.5,kind:'bench'},{x:15,y:3.3,w:1.5,h:.7,z:.5,kind:'planter'}];
PROPS.push(...[[2.2,3],[25.8,5],[25.7,16.5]].map(([x,y])=>({x:x-.65,y:y-.65,w:1.3,h:1.3,z:.6,kind:'tree'})));
const VAN={x:22.2,y:21.25,w:3,h:1.35,at:{x:20.55,y:20.25}};
const BIN_DEFS=[
 {id:'starter',x:11.6,y:18.55,name:'Mabel’s dumpster',container:'dumpster',loot:['cans','basket','lamp'],color:'#315b49',duration:1.9},
 {id:'produce',x:4.35,y:16.5,name:'Produce crates',container:'crate',loot:['food','pan','music'],color:'#a9834d',duration:1.85},
 {id:'workshop',x:6.25,y:8.75,name:'Loading-dock crate',container:'crate',loot:['toolbox','cart','music'],color:'#967149',duration:2.05},
 {id:'skip',x:10.3,y:5.45,name:'Back-alley skip',container:'dumpster',loot:['sack','toolbox','lamp'],color:'#62724e',duration:2.35},
 {id:'recycling',x:17.8,y:5.4,name:'Recycling bin',container:'wheelie',loot:['cans','umbrella','music'],color:'#3c646e',duration:2.1},
 {id:'fancy',x:21.65,y:8.05,name:'Discarded steamer trunk',container:'trunk',loot:['goose','music','lamp'],color:'#81584b',duration:2.65},
 {id:'east',x:21.55,y:14.2,name:'Promenade wheelie bin',container:'wheelie',loot:['food','lamp'],color:'#4c6b69',duration:2.05},
 {id:'corner',x:17.85,y:18.55,name:'Corner dumpster',container:'dumpster',loot:['cans','goose'],color:'#3d5b45',duration:2.3}
];
const SHOPS=[
 {id:'mabel',name:'Mabel',building:'shop',door:{x:12.8,y:17.42},inside:{x:12.8,y:16.2},windows:[{x:9.8,y:17.3},{x:11.4,y:17.3}],line:'OI. OFF THE GLASS.'},
 {id:'clive',name:'Clive',building:'fancy',door:{x:17.9,y:6.58},inside:{x:17.9,y:7.8},windows:[{x:14.8,y:6.7},{x:16.3,y:6.7}],line:'THAT IS NOT A FREE SAMPLE.'}
];
const RAT_DEFS=[
 {id:'patch',type:'fox',name:'Patch',health:4,x:22.8,y:18.5,den:{x:24.8,y:18.3},patrol:[{x:22.6,y:17.1},{x:21.4,y:10.2},{x:24,y:19.7}]},
 {id:'nibs',type:'skunk',name:'Little Stinker',health:4,x:3.2,y:12,den:{x:3.7,y:5.2},patrol:[{x:3,y:17.5},{x:3,y:8},{x:3.5,y:10}]},
 {id:'midge',type:'skunk',name:'Chemical Kevin',health:4,x:20.9,y:4.5,den:{x:24.8,y:4.3},patrol:[{x:22.5,y:5.1},{x:16,y:4.3},{x:22,y:9.4}]},
 {id:'wired',type:'scavenger',name:'Wired Eddie',health:5,x:4,y:4.5,den:{x:2,y:3},patrol:[{x:4,y:4.5},{x:9,y:4.3},{x:4,y:16.8}]},
 {id:'officer',type:'police',name:'Officer Grudge',health:7,x:24,y:8,den:{x:25,y:3},patrol:[{x:24,y:8},{x:24,y:18},{x:18,y:20},{x:24,y:8}]},
 ...SHOPS.map(s=>({id:s.id,type:'manager',name:s.name,health:6,x:s.inside.x,y:s.inside.y,shop:s.id,den:{...s.door},patrol:[{...s.door}]}))
];
// A seed owns the raid, including every unopened find. Presentation never rolls rewards.
function seeded(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function generateLoot(seed){
 const random=seeded(seed),shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const bins=BIN_DEFS.map(b=>({...b,loot:[],open:0,duration:b.duration+1.1}));
 const first=shuffle(['cans','food','toolbox','lamp','cans','music','food','lamp']);bins.forEach((b,i)=>b.loot.push(first[i]));bins[0].loot.push('basket');
 const early=shuffle([1,6,7]);bins[early[0]].loot.push('sock');bins[early[1]].loot.push('batteries');bins[early[2]].loot.push('bottle');
 for(const type of ['goose','goose','cart','umbrella','sack','pan','music','music','toolbox','lamp','cans','food']){
  const eligible=bins.filter((b,i)=>b.loot.length<3&&(ITEMS[type].tier!==2||(i!==0&&!b.loot.some(t=>ITEMS[t].tier===2))));
  const b=eligible[Math.floor(random()*eligible.length)];b.loot.push(type);
 }
 return bins;
}
const RECIPES={batterySock:{name:'The night-night sock',ingredients:['sock','batteries'],duration:2.2}};
function canCraft(g,type='batterySock'){const recipe=RECIPES[type];return !!recipe&&g.weapon!==type&&recipe.ingredients.every(t=>g.bag.some(o=>o.type===t));}
function craft(g,type='batterySock'){
 if(g.phase!=='playing'||g.action||g.dash>0||!canCraft(g,type))return false;
 g.path=[];g.auto=null;g.action={kind:'craft',type,time:0,duration:RECIPES[type].duration};event(g,'craft-start','Making something deeply questionable. Keep watch.');return true;
}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function makeGame(seed=(Date.now()^Math.floor(Math.random()*4294967296))>>>0){
 const raccoons=RAT_DEFS.map(d=>({...d,den:{...d.den},state:d.type==='manager'?'inside':'patrol',alert:0,outside:false,investigate:null,hp:d.health,maxHp:d.health,defeated:false,defeatTime:0,hitSerial:0,target:0,stun:0,cooldown:6,carried:null,walk:0,path:[],repath:0,faceX:0,faceY:1,vx:0,vy:0,windup:0,lunge:0,recover:0,flash:0}));
 return {raidSeed:seed>>>0,hazards:[],noise:null,phase:'title',time:WORLD.duration,elapsed:0,player:{x:12.7,y:20.2,z:0,vz:0,grounded:true,faceX:-.5,faceY:.86,walking:0,vx:0,vy:0,invulnerable:0,hurt:0,stink:0},carrier:'tote',capacity:6,weapon:'broom',bag:[],selected:0,bins:generateLoot(seed),loose:[],raccoons,raccoon:raccoons[0],action:null,path:[],auto:null,attack:null,attackSerial:0,attackCooldown:0,combo:0,comboWindow:0,shove:0,dash:0,dashCooldown:0,dashX:0,dashY:0,hitstop:0,events:[],stats:{found:0,dropped:0,stolen:0,recovered:0,hits:0,parries:0,defeated:0,upgrades:0,crafted:0},nextId:1,searchSerial:0,warning:false};
}
// A loading dock with stair approaches at either end. Edges can be hopped down.
function heightAt(x,y){if(x<5||x>7.45||y<5.5||y>16)return 0;if(y<7.5)return (y-5.5)/2*1.1;if(y>13.7)return (16-y)/2.3*1.1;return 1.1;}
function used(g){return g.bag.reduce((n,o)=>n+ITEMS[o.type].slots,0);}
function score(g){return g.bag.reduce((n,o)=>n+ITEMS[o.type].points,0);}
function rectangles(g){return [...BUILDINGS,...PROPS,...g.bins.map(b=>({x:b.x-.58,y:b.y-.48,w:1.16,h:.96})),{x:VAN.x-VAN.w/2,y:VAN.y-VAN.h/2,w:VAN.w,h:VAN.h}];}
function blocked(g,x,y,r=.26){if(x<.7+r||y<.7+r||x>WORLD.width-.7-r||y>WORLD.height-.7-r)return true;return rectangles(g).some(b=>x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.h+r);}
function move(g,o,dx,dy,r=.26){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.12));for(let i=0;i<steps;i++){const level=Math.max(heightAt(o.x,o.y),o.z||0),ok=(x,y)=>!blocked(g,x,y,r)&&heightAt(x,y)<=level+.2;if(ok(o.x+dx/steps,o.y))o.x+=dx/steps;if(ok(o.x,o.y+dy/steps))o.y+=dy/steps;}}
function sight(g,a,b){const n=Math.ceil(dist(a,b)/.28);for(let i=1;i<n;i++){const x=a.x+(b.x-a.x)*i/n,y=a.y+(b.y-a.y)*i/n;if(BUILDINGS.some(o=>x>o.x&&x<o.x+o.w&&y>o.y&&y<o.y+o.h))return false;}return true;}
function event(g,type,text='',extra={}){g.events.push({type,text,...extra});}
function cancel(g){if(g.action?.kind==='rummage')event(g,'search-cancel');if(g.action?.kind==='craft')event(g,'craft-cancel','Assembly cancelled. Materials kept.');g.action=null;}
function nearest(g){const p=g.player;const loose=g.loose.filter(o=>dist(o,p)<1.25&&Math.abs((p.z||0)-heightAt(o.x,o.y))<.7).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(loose)return {kind:'loose',object:loose};if(dist(p,VAN.at)<1.5)return {kind:'van'};const b=g.bins.filter(b=>dist(b,p)<1.75&&Math.abs((p.z||0)-heightAt(b.x,b.y))<.7&&sight(g,p,b)).sort((a,b)=>dist(a,p)-dist(b,p))[0];return b?{kind:'bin',object:b}:null;}
function collect(g,item,source){const def=ITEMS[item.type];if(def.equip){if(def.equip==='carrier'){if(def.capacity>g.capacity){g.carrier=item.type;g.capacity=def.capacity;}}else g.weapon=item.type;g.stats.upgrades++;event(g,'pickup',def.name,{item:{...item},source,tier:def.tier,equip:def.equip,kept:def.equip==='carrier'&&def.capacity<g.capacity});return true;}if(used(g)+def.slots>g.capacity){event(g,'full','No room. Drop something with Q.');return false;}g.bag.push(item);g.selected=g.bag.length-1;if(source==='found')g.stats.found++;if(item.stolen){g.stats.recovered++;delete item.stolen;}event(g,'pickup',def.name,{item:{...item},source,tier:def.tier});return true;}
function interact(g){
 if(g.phase!=='playing'||g.action||g.dash>0)return;const n=nearest(g);
 if(!n){event(g,'hint','Move up to a container, a loose find, or the van.');return;}
 if(n.kind==='loose'){if(collect(g,n.object,'recovered'))g.loose=g.loose.filter(o=>o.id!==n.object.id);return;}
 if(n.kind==='van'){if(!g.bag.length){event(g,'hint','Bring back a little something first.');return;}g.action={kind:'extract',time:0,duration:1.8};event(g,'loading','Loading up. Stay close.');return;}
 const b=n.object;if(!b.loot.length){event(g,'hint','Picked clean. There’s more around the block.');return;}
 const type=b.loot[0];if(used(g)+ITEMS[type].slots>g.capacity){event(g,'full',`Need ${ITEMS[type].slots} free slot${ITEMS[type].slots===1?'':'s'}. Q drops your selected find.`);return;}
 g.path=[];g.auto=null;g.action={kind:'rummage',id:++g.searchSerial,bin:b.id,type,time:0,duration:b.duration,stage:0};
 g.noise={x:b.x,y:b.y,life:3,radius:6};event(g,'search','',{bin:b.id,container:b.container,id:g.searchSerial});
}
function drop(g){if(!['playing','inventory'].includes(g.phase)||!g.bag.length)return;const index=clamp(g.selected,0,g.bag.length-1),item=g.bag.splice(index,1)[0];let x=g.player.x+g.player.faceX*.85,y=g.player.y+g.player.faceY*.85;if(blocked(g,x,y,.1)){x=g.player.x;y=g.player.y;}g.loose.push({...item,x,y,age:0,toss:.4});g.selected=Math.max(0,g.bag.length-1);g.stats.dropped++;event(g,'drop',`Dropped ${ITEMS[item.type].short.toLowerCase()}.`);}
function setInventory(g,open){if(open&&g.phase==='playing'){cancel(g);g.path=[];g.auto=null;g.player.vx=g.player.vy=0;g.phase='inventory';return true;}if(!open&&g.phase==='inventory'){g.phase='playing';return true;}return false;}
function release(g,r){if(!r.carried)return;g.loose.push({...r.carried,x:r.x,y:r.y,age:0,toss:.4,stolen:true});r.carried=null;}
function hitRat(g,r,stage,parry=false){
 if(r.defeated)return;
 const p=g.player,d=Math.max(.01,dist(p,r)),dx=d<.1?p.faceX:(r.x-p.x)/d,dy=d<.1?p.faceY:(r.y-p.y)/d;
 r.vx=dx*(parry?11:stage===3?12:WEAPONS[g.weapon].power);r.vy=dy*(parry?11:stage===3?12:WEAPONS[g.weapon].power);r.stun=parry?2.6:stage===3?2:g.weapon==='pan'?1.2:.85;r.cooldown=r.stun+1.7;r.windup=0;r.lunge=0;r.recover=0;r.path=[];r.state='stunned';r.flash=.18;r.hitSerial++;r.hp=Math.max(0,r.hp-WEAPONS[g.weapon].damage-(stage===3?1:0)-(parry?1:0));release(g,r);g.stats.hits++;g.hitstop=.045;
 if(parry){g.stats.parries++;event(g,'parry','NOT TODAY.',{x:r.x,y:r.y,stage});}else event(g,'hit',stage===3?'SCRAM!':'',{x:r.x,y:r.y,stage});
 if(r.hp===0){r.defeated=true;r.defeatTime=0;r.state='defeated';r.stun=0;r.vx=r.vy=0;r.path=[];g.stats.defeated++;event(g,'defeated',`${r.name} is out! Clear for this run.`,{x:r.x,y:r.y,enemy:r.type,name:r.name});}
}
function attack(g){
 if(g.phase!=='playing'||g.attackCooldown>0||g.dash>0)return false;cancel(g);g.path=[];g.auto=null;
 g.combo=g.comboWindow>0?g.combo%3+1:1;g.comboWindow=.88;g.attackCooldown=g.combo===3?.48:(WEAPONS[g.weapon].cooldown||.25);g.shove=.3;
 const p=g.player,near=g.raccoons.filter(r=>!r.defeated&&r.state!=='inside'&&r.state!=='emerging'&&dist(p,r)<WEAPONS[g.weapon].range+.3&&Math.abs((p.z||0)-heightAt(r.x,r.y))<.9&&sight(g,p,r)).sort((a,b)=>dist(a,p)-dist(b,p))[0];
 if(near){const d=Math.max(.01,dist(p,near));p.faceX=(near.x-p.x)/d;p.faceY=(near.y-p.y)/d;}
 g.noise={x:p.x,y:p.y,life:3,radius:g.weapon==='pan'?9:6};g.attack={id:++g.attackSerial,stage:g.combo,time:.28};event(g,'swing','',{stage:g.combo,weapon:g.weapon,x:p.x,y:p.y});
 for(const r of g.raccoons){if(r.defeated||r.state==='inside'||r.state==='emerging')continue;const d=dist(p,r),dot=((r.x-p.x)*p.faceX+(r.y-p.y)*p.faceY)/Math.max(.01,d);if(d<WEAPONS[g.weapon].range+(g.combo===3?.3:0)&&(g.combo===3||dot>-.15)&&Math.abs((p.z||0)-heightAt(r.x,r.y))<.9&&sight(g,p,r))hitRat(g,r,g.combo,r.state==='windup');}
 return true;
}
function shove(g){return attack(g);}
function dash(g,x=0,y=0){if(g.phase!=='playing'||g.dashCooldown>0)return false;const d=Math.hypot(x,y);g.dashX=d>.01?x/d:g.player.faceX;g.dashY=d>.01?y/d:g.player.faceY;g.dash=.22;g.dashCooldown=1.25;g.player.invulnerable=Math.max(g.player.invulnerable,.32);cancel(g);event(g,'dash');return true;}
function jump(g){if(g.phase!=='playing'||!g.player.grounded)return false;cancel(g);g.player.vz=4.7;g.player.grounded=false;event(g,'jump');return true;}
function end(g,success){if(g.phase!=='playing')return;cancel(g);g.phase=success?'success':'failed';if(!success){g.bag=[];g.selected=0;}g.path=[];g.auto=null;event(g,success?'success':'failed',success?'Home with the goods.':'The truck got there first.');}
function pathTo(g,start,goal){
 const step=.5,cols=WORLD.width*2,rows=WORLD.height*2,key=(x,y)=>y*cols+x;
 const sx=clamp(Math.floor(start.x/step),0,cols-1),sy=clamp(Math.floor(start.y/step),0,rows-1);
 let gx=clamp(Math.floor(goal.x/step),0,cols-1),gy=clamp(Math.floor(goal.y/step),0,rows-1);
 const free=(x,y)=>x>=0&&y>=0&&x<cols&&y<rows&&!blocked(g,(x+.5)*step,(y+.5)*step,.26);
 if(!free(gx,gy)){let best=Infinity;for(let y=Math.max(0,gy-4);y<Math.min(rows,gy+5);y++)for(let x=Math.max(0,gx-4);x<Math.min(cols,gx+5);x++)if(free(x,y)){const d=Math.hypot((x+.5)*step-goal.x,(y+.5)*step-goal.y);if(d<best){best=d;gx=x;gy=y;}}if(best===Infinity)return [];}
 const queue=[[sx,sy]],came=new Map([[key(sx,sy),null]]);let found=false;
 for(let qi=0;qi<queue.length;qi++){const[x,y]=queue[qi];if(x===gx&&y===gy){found=true;break;}for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(came.has(k)||!free(nx,ny)||Math.abs(heightAt((nx+.5)*step,(ny+.5)*step)-heightAt((x+.5)*step,(y+.5)*step))>.32||(dx&&dy&&(!free(x+dx,y)||!free(x,y+dy))))continue;came.set(k,key(x,y));queue.push([nx,ny]);}}
 if(!found)return [];const path=[];let k=key(gx,gy);while(came.get(k)!==null){path.push({x:((k%cols)+.5)*step,y:(Math.floor(k/cols)+.5)*step});k=came.get(k);}return path.reverse();
}
function navigate(g,x,y,auto=null){if(g.phase!=='playing')return;cancel(g);g.path=pathTo(g,g.player,{x,y});g.auto=auto;}
function ratUpdate(g,r,dt,input){
 if(r.defeated){r.defeatTime+=dt;return;}
 const p=g.player;
 if(r.type==='manager'){
  const shop=SHOPS.find(s=>s.id===r.shop);
  if(!r.outside){
   if(r.state==='emerging'){r.emerge=Math.min(1,(r.emerge||0)+dt*1.25);r.x=shop.inside.x+(shop.door.x-shop.inside.x)*r.emerge;r.y=shop.inside.y+(shop.door.y-shop.inside.y)*r.emerge;r.faceY=shop.door.y>shop.inside.y?1:-1;if(r.emerge>=1){r.outside=true;r.state='chase';r.cooldown=0;r.alert=1;}return;}
   const near=shop.windows.some(w=>dist(p,w)<1.4)||dist(p,shop.door)<1.05;
   r.alert=clamp(r.alert+dt*(near?.55:-.28),0,1);r.state='inside';if(r.alert>=1){r.state='emerging';r.emerge=0;event(g,'manager-alert',shop.line,{x:shop.door.x,y:shop.door.y,enemy:r.type});}return;
  }
 }
 r.cooldown=Math.max(0,r.cooldown-dt);r.stun=Math.max(0,r.stun-dt);r.flash=Math.max(0,r.flash-dt);r.repath-=dt;
 if(Math.hypot(r.vx,r.vy)>.1){move(g,r,r.vx*dt,r.vy*dt,.23);r.vx*=Math.exp(-dt*7);r.vy*=Math.exp(-dt*7);}
 if(r.stun>0){r.state='stunned';return;}
 if(r.windup>0){r.state='windup';r.windup-=dt;if(r.windup<=0){if(r.type==='skunk'){g.hazards.push({id:++g.nextId,x:r.x+r.faceX*1.1,y:r.y+r.faceY*1.1,radius:1.25,life:3.6});r.recover=.9;r.cooldown=5;r.state='recover';event(g,'spray','Skunk funk! Dodge out of the cloud.',{x:r.x,y:r.y});}else{r.lunge=r.type==='police'?.38:.26;r.state='lunge';event(g,'enemy-lunge','',{x:r.x,y:r.y});}}return;}
 if(r.lunge>0){r.state='lunge';r.lunge-=dt;move(g,r,r.faceX*(r.type==='police'?9.2:8.8)*dt,r.faceY*(r.type==='police'?9.2:8.8)*dt,.23);
   if(dist(p,r)<.82&&Math.abs(p.z-heightAt(r.x,r.y))<.65&&p.invulnerable<=0&&g.dash<=0){cancel(g);g.path=[];g.auto=null;p.invulnerable=1.6;p.hurt=.35;move(g,p,r.faceX*.7,r.faceY*.7);if(g.bag.length&&!['fox','scavenger'].includes(r.type)){const o=g.bag.pop();g.loose.push({...o,x:p.x,y:p.y,age:0,toss:.4});g.selected=Math.max(0,g.bag.length-1);event(g,'bumped',r.name+' knocked a find loose!',{x:p.x,y:p.y,item:{...o}});}else if(g.bag.length){r.carried=g.bag.pop();g.selected=Math.max(0,g.bag.length-1);g.stats.stolen++;event(g,'stolen',`${r.name} pinched your ${ITEMS[r.carried.type].short.toLowerCase()}!`,{x:p.x,y:p.y,item:{...r.carried}});}else event(g,'bumped','Personal space. Ever heard of it?',{x:p.x,y:p.y});r.lunge=0;}
   if(r.lunge<=0){r.recover=.9;r.cooldown=g.bag.length?3.2:6;r.path=[];}return;}
 if(r.recover>0){r.recover-=dt;r.state='recover';return;}
 const d=dist(p,r),bait=g.loose.find(o=>(r.type==='scavenger'||(['fox','skunk'].includes(r.type)&&['food','music'].includes(o.type)))&&o.age<12&&dist(o,r)<4&&sight(g,r,o));let target,speed=1.55;
 if(r.type==='police'&&g.noise&&dist(r,g.noise)<g.noise.radius)r.investigate={x:g.noise.x,y:g.noise.y,life:5};if(r.investigate)r.investigate.life-=dt;
 if(r.carried){r.state='flee';target=r.den;speed=3.3;if(dist(r,r.den)<.6){release(g,r);r.cooldown=6;event(g,'stash',`${r.name} hid your find by the drain.`,{x:r.den.x,y:r.den.y});}}
 else if(bait){r.state='distracted';target=bait;speed=2.2;if(r.type==='scavenger'&&dist(r,bait)<.6){r.carried={...bait};g.loose=g.loose.filter(o=>o.id!==bait.id);g.stats.stolen++;event(g,'stolen',r.name+' grabbed a loose find!',{x:r.x,y:r.y,item:{...bait}});}}
 else if(r.cooldown<=0&&d<(g.action?5.5:input.sprint?6:r.type==='police'?3.5:4.5)&&sight(g,p,r)){
   r.state='chase';target=p;speed=2.8;if(d<(r.type==='skunk'?2.7:1.75)){const rd=Math.max(.01,d);r.faceX=(p.x-r.x)/rd;r.faceY=(p.y-r.y)/rd;r.windup=r.type==='skunk'?1.05:r.type==='police'?.85:r.type==='manager'?.7:.6;r.state='windup';r.path=[];event(g,'enemy-ready','',{x:r.x,y:r.y,enemy:r.type});return;}
 }else if(r.investigate?.life>0){r.state='investigate';target=r.investigate;speed=2.25;}else{r.state='patrol';target=r.patrol[r.target%r.patrol.length];if(dist(r,target)<.45){r.target++;r.repath=0;}}
 if(target&&dist(r,target)>.25){if(r.repath<=0){r.path=pathTo(g,r,target);r.repath=r.state==='chase'?.35:1.15;}const n=r.path[0];if(n){const rd=dist(r,n);if(rd<.14)r.path.shift();else{r.faceX=(n.x-r.x)/rd;r.faceY=(n.y-r.y)/rd;move(g,r,r.faceX*speed*dt,r.faceY*speed*dt,.23);r.walk+=dt*speed*5;}}}
}
function update(g,dt,input={x:0,y:0,sprint:false}){
 if(g.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);
 if(g.hitstop>0){g.hitstop=Math.max(0,g.hitstop-dt);return;}
 if(g.noise){g.noise.life-=dt;if(g.noise.life<=0)g.noise=null;}
 for(const h of g.hazards){h.life-=dt;if(h.life>0&&dist(g.player,h)<h.radius&&g.player.z<.7&&g.dash<=0&&g.player.invulnerable<=0){cancel(g);g.player.stink=4;g.player.invulnerable=1;event(g,'stink','You smell like a bad decision. Movement slowed.');}}g.hazards=g.hazards.filter(h=>h.life>0);g.player.stink=Math.max(0,g.player.stink-dt);
 g.elapsed+=dt;g.time=Math.max(0,WORLD.duration-g.elapsed);if(g.time<=0){end(g,false);return;}
 if(g.time<30&&!g.warning){g.warning=true;event(g,'warning','Last collection. Get back to the van.');}
 for(const k of['shove','dashCooldown','dash','attackCooldown','comboWindow'])g[k]=Math.max(0,g[k]-dt);
 if(g.attack){g.attack.time-=dt;if(g.attack.time<=0)g.attack=null;}
 const p=g.player;const floor=heightAt(p.x,p.y);if(!p.grounded||Math.abs(p.z-floor)>.04){p.vz-=12*dt;p.z+=p.vz*dt;if(p.z<=floor){if(p.vz<-3)event(g,'land');p.z=floor;p.vz=0;p.grounded=true;}}else p.z=floor;p.invulnerable=Math.max(0,p.invulnerable-dt);p.hurt=Math.max(0,p.hurt-dt);
 for(const b of g.bins)b.open=Math.max(0,b.open-dt*.65);for(const o of g.loose){o.age+=dt;o.toss=Math.max(0,(o.toss||0)-dt);}
 let dx=input.x||0,dy=input.y||0;const manual=Math.hypot(dx,dy)>.01;
 if(manual){g.path=[];g.auto=null;cancel(g);}else if(g.path.length){const goal=g.path[0],d=dist(p,goal);if(d<.15)g.path.shift();else{dx=(goal.x-p.x)/d;dy=(goal.y-p.y)/d;}}
 if(!g.path.length&&g.auto){const a=g.auto;g.auto=null;if(a==='interact')interact(g);}
 if(g.dash>0){dx=g.dashX;dy=g.dashY;cancel(g);}
 const length=Math.hypot(dx,dy),heavy=g.bag.filter(o=>ITEMS[o.type].slots===2).length;
 const speed=(g.dash>0?10.5:input.sprint?4.6:3.65)*(1-heavy*.055)*(g.carrier==='cart'?.92:1)*(p.stink>0?.76:1),ox=p.x,oy=p.y;
 if(length>.01&&!g.action){dx/=length;dy/=length;p.faceX=dx;p.faceY=dy;move(g,p,dx*speed*dt,dy*speed*dt);p.walking+=dt*speed*3;}p.vx=(p.x-ox)/dt;p.vy=(p.y-oy)/dt;
 if(g.action){const a=g.action;a.time+=dt;if(a.kind==='rummage'){const b=g.bins.find(b=>b.id===a.bin);b.open=Math.min(1,b.open+dt*3);const stage=Math.min(3,Math.floor(a.time/a.duration*4));if(stage>a.stage){a.stage=stage;event(g,'rustle','',{container:b.container,stage,tier:0});}}
   if(a.time>=a.duration){g.action=null;if(a.kind==='extract'){if(g.bag.length)end(g,true);else event(g,'hint','Empty hands. Grab something first.');return;}
     if(a.kind==='craft'){if(canCraft(g,a.type)){for(const type of RECIPES[a.type].ingredients){const i=g.bag.findIndex(o=>o.type===type);g.bag.splice(i,1);}g.weapon=a.type;g.selected=Math.max(0,g.bag.length-1);g.stats.crafted++;event(g,'crafted','The night-night sock. Equipped.',{item:{id:g.nextId++,type:a.type},tier:2,equip:'weapon'});}return;}
     const b=g.bins.find(b=>b.id===a.bin);if(b.loot.length&&collect(g,{id:g.nextId++,type:b.loot[0]},'found'))b.loot.shift();}
 }
 for(const r of g.raccoons)ratUpdate(g,r,dt,input);
}
const api={cancel,seeded,generateLoot,RECIPES,canCraft,craft,SHOPS,setInventory,ITEMS,WEAPONS,TIERS,heightAt,jump,WORLD,BUILDINGS,PROPS,VAN,BIN_DEFS,RAT_DEFS,makeGame,used,score,blocked,move,dist,sight,nearest,interact,drop,attack,shove,dash,end,pathTo,navigate,update};
root.DumpsterCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
