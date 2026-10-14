const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../public/game-core.js');
// Exercise normal player actions from the actual spawn, with every enemy active.
// No teleporting, inventory injection, time extensions or damage overrides.
test('A full seeded raid supports physical collection, two fights, crafting and extraction',()=>{
const g=C.makeGame(7);g.phase='playing';let planTick=0,stage='corner',events=[];
const plan=(goal)=>{if(C.dist(g.player,goal)>.2)C.navigate(g,goal.x,goal.y);};
const approach=b=>[{x:b.x,y:b.y+1.15},{x:b.x,y:b.y-1.15},{x:b.x-1.15,y:b.y},{x:b.x+1.15,y:b.y}].filter(p=>!C.blocked(g,p.x,p.y)&&Math.abs(C.heightAt(p.x,p.y)-C.heightAt(b.x,b.y))<.55).map(p=>({p,path:C.pathTo(g,g.player,p)})).filter(q=>q.path.length||C.dist(q.p,g.player)<.5).sort((a,b)=>a.path.length-b.path.length)[0]?.p;
for(let step=0;step<12000&&g.phase==='playing';step++){
 const has=t=>g.bag.some(o=>o.type===t),near=C.nearest(g),enemies=g.raccoons.filter(r=>!r.defeated&&!['inside','emerging'].includes(r.state)&&C.dist(r,g.player)<3.5&&C.sight(g,g.player,r)).sort((a,b)=>C.dist(a,g.player)-C.dist(b,g.player));
 let goal;
 if(g.weapon==='batterySock')stage='extract';else if(has('sock')&&has('batteries'))stage='craft';else if(has('sock'))stage='east';else stage='corner';
 const threat=enemies[0];
 if(threat){if(C.dist(threat,g.player)<C.WEAPONS[g.weapon].range-.08)C.attack(g);else goal=threat;}
 else if(stage==='craft')C.craft(g);
 else if(stage==='extract'){if(near?.kind==='van')C.interact(g);else goal=C.VAN.at;}
 else {const materialLoose=g.loose.find(o=>['sock','batteries'].includes(o.type));if(materialLoose){if(near?.kind==='loose')C.interact(g);else goal=materialLoose;}
 else {const bin=g.bins.find(b=>b.id===stage);if(near?.kind==='bin'&&near.object===bin||near?.kind==='loose')C.interact(g);else goal=approach(bin);}}
 if(goal&&!g.action&&(!g.path.length||planTick++%25===0))plan(goal);
 C.update(g,.02,{});for(const e of g.events)if(['pickup','crafted','defeated','success','failed'].includes(e.type))events.push([g.elapsed.toFixed(1),e.type,e.text]);g.events=[];
}
assert.equal(g.phase,'success');
assert.equal(g.weapon,'batterySock');
assert.equal(g.stats.crafted,1);
assert.ok(g.stats.defeated>=2);
assert.equal(C.score(g),5);
assert.ok(g.time>0);
assert.ok(!g.bag.some(o=>['sock','batteries'].includes(o.type)));
});
