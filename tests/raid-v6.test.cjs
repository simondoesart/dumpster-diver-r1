const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../public/game-core.js');
const advance=(g,s,input={})=>{for(let t=0;t<s;t+=.02)C.update(g,.02,input);};
const play=seed=>{const g=C.makeGame(seed);g.phase='playing';return g;};
test('1,000 raid seeds preserve budgets, route floors, spread and guaranteed crafting resources',()=>{
 const signatures=new Set();let budget;
 for(let seed=0;seed<1000;seed++){
  const bins=C.generateLoot(seed),all=bins.flatMap(b=>b.loot),counts={};all.forEach(t=>counts[t]=(counts[t]||0)+1);
  assert.equal(all.length,24);assert.ok(bins.every(b=>b.loot.length===3));assert.ok(bins.every(b=>!C.ITEMS[b.loot[0]].equip&&C.ITEMS[b.loot[0]].points>0));
  assert.equal(bins[0].loot[1],'basket');assert.equal(bins[0].loot.filter(t=>C.ITEMS[t].tier===2).length,0);assert.ok(bins.every(b=>b.loot.filter(t=>C.ITEMS[t].tier===2).length<=1));
  for(const t of ['sock','batteries','bottle'])assert.ok([bins[1],bins[6],bins[7]].some(b=>b.loot.includes(t)));
  if(!budget)budget=counts;else assert.deepEqual(counts,budget);signatures.add(JSON.stringify(bins.map(b=>b.loot)));
 }assert.ok(signatures.size>990);
});
test('Same seed reproduces unopened loot; cancelling never rerolls or exposes the result in the search event',()=>{
 const a=play(919),b=play(919);assert.deepEqual(a.bins,b.bins);a.raccoons=[];
 const bin=a.bins[0],before=[...bin.loot];Object.assign(a.player,{x:bin.x,y:bin.y+1.15});
 C.interact(a);advance(a,.7);const e=a.events.find(e=>e.type==='search');assert.equal(e.itemType,undefined);C.cancel(a);assert.deepEqual(bin.loot,before);
 C.interact(a);advance(a,bin.duration+.1);assert.equal(a.bag[0].type,before[0]);assert.deepEqual(bin.loot,before.slice(1));assert.equal(a.stats.found,1);
});
test('Crafting consumes the exact items once only on completion, cancels safely, and cannot duplicate a weapon',()=>{
 const g=play(1);g.raccoons=[];g.bag=[{id:20,type:'sock'},{id:21,type:'batteries'},{id:22,type:'goose'}];assert.equal(C.canCraft(g),true);C.craft(g);advance(g,.5);C.cancel(g);assert.equal(g.bag.length,3);assert.equal(g.weapon,'broom');
 C.craft(g);advance(g,2.4);assert.equal(g.weapon,'batterySock');assert.deepEqual(g.bag.map(o=>o.id),[22]);assert.equal(g.stats.crafted,1);assert.equal(C.craft(g),false);assert.equal(g.events.filter(e=>e.type==='crafted').length,1);
});
test('Store managers build suspicion at windows, emerge through the door and remain defeatable',()=>{
 for(const shop of C.SHOPS){const g=play(2);const r=g.raccoons.find(r=>r.id===shop.id);g.raccoons=[r];Object.assign(g.player,shop.windows[0]);g.player.y+=shop.door.y>shop.inside.y?.6:-.6;
 advance(g,.8);assert.ok(r.alert>0&&r.alert<1);assert.equal(r.state,'inside');Object.assign(g.player,{x:25,y:22});advance(g,1.8);assert.equal(r.alert,0);
 Object.assign(g.player,shop.windows[0]);g.player.y+=shop.door.y>shop.inside.y?.6:-.6;advance(g,2);assert.equal(r.state,'emerging');advance(g,1);assert.equal(r.outside,true);assert.equal(C.blocked(g,r.x,r.y,.23),false);
 for(let i=0;i<8&&!r.defeated;i++){g.player.x=r.x;g.player.y=r.y+.9;g.attackCooldown=0;C.attack(g);}assert.equal(r.defeated,true);
 }
});
test('Skunks telegraph, emit persistent stink and can be interrupted before spraying',()=>{
 const g=play(4),r=g.raccoons.find(r=>r.type==='skunk');g.raccoons=[r];Object.assign(g.player,{x:13,y:20.5});Object.assign(r,{x:14.8,y:20.5,cooldown:0,path:[]});advance(g,.1);assert.equal(r.state,'windup');advance(g,1.2);assert.equal(g.hazards.length,1);assert.ok(g.player.stink>0);assert.ok(g.events.some(e=>e.type==='spray'));
 const q=play(4),s=q.raccoons.find(r=>r.type==='skunk');q.raccoons=[s];Object.assign(q.player,{x:13,y:20.5});Object.assign(s,{x:14.4,y:20.5,cooldown:0,path:[]});advance(q,.1);C.attack(q);advance(q,1.4);assert.equal(q.hazards.length,0);assert.ok(q.stats.parries>0);
});
test('Police investigate audible disturbances without seeing the player',()=>{
 const g=play(6),r=g.raccoons.find(r=>r.type==='police');g.raccoons=[r];Object.assign(g.player,{x:3,y:18});Object.assign(r,{x:23,y:18,cooldown:20});g.noise={x:21,y:19,life:2,radius:9};advance(g,.1);assert.equal(r.state,'investigate');assert.equal(r.investigate.x,21);assert.ok(r.path.length>0);
});
test('Rummaging does not pause the raid or approaching enemies; physical contact interrupts the search',()=>{
 const g=play(22),r=g.raccoons.find(r=>r.type==='scavenger'),bin=g.bins[0];g.raccoons=[r];Object.assign(g.player,{x:bin.x,y:bin.y+1.15});Object.assign(r,{x:g.player.x+1.4,y:g.player.y,cooldown:0,path:[]});C.interact(g);advance(g,1.6);assert.ok(g.time<179);assert.equal(g.action,null);assert.equal(bin.loot.length,3);assert.ok(g.events.some(e=>e.type==='bumped'));
});
