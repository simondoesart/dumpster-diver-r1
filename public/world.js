/* Licensed authored meshes, skeletal animation, painted street surfaces and warm lighting. */
(() => {
  'use strict';
  const T = window.THREE, C = window.DumpsterCore, M = window.DumpsterModels;
  const cream='#e9dcc0', ink='#26323a', green='#285a48', gold='#e3aa35';
  let seed=741;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const materials=new Map(),geometries=new Map();
  function mat(color,emissive=0){const key=color+':'+emissive;if(!materials.has(key))materials.set(key,M.paintMaterial(new T.MeshStandardMaterial({color,roughness:.94,metalness:0,flatShading:false,emissive:emissive?color:0,emissiveIntensity:emissive}),1.2));return materials.get(key);}
  function geo(key,fn){if(!geometries.has(key))geometries.set(key,fn());return geometries.get(key);}
  function mesh(parent,g,m,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(parent,x,y,z,w,h,d,color){const o=mesh(parent,geo('box',()=>new T.BoxGeometry(1,1,1)),typeof color==='string'?mat(color):color,x,y,z);o.scale.set(w,h,d);return o;}
  function ball(parent,x,y,z,rx,ry,rz,color){const o=mesh(parent,geo('sphere',()=>new T.SphereGeometry(1,10,7)),mat(color),x,y,z);o.scale.set(rx,ry,rz);return o;}
  function cylinder(parent,x,y,z,rt,rb,h,color,n=8){return mesh(parent,geo(`c${rt},${rb},${h},${n}`,()=>new T.CylinderGeometry(rt,rb,h,n)),typeof color==='string'?mat(color):color,x,y,z);}
  function group(parent,x=0,y=0,z=0){const o=new T.Group();o.position.set(x,y,z);parent.add(o);return o;}
  function texture(w,h,draw){const cv=document.createElement('canvas');cv.width=w;cv.height=h;draw(cv.getContext('2d'),w,h);const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
  function paper(color,kind='paper'){
    const t=texture(256,256,(c,w,h)=>{c.fillStyle=color;c.fillRect(0,0,w,h);for(let i=0;i<3200;i++){const light=rand()>.5;c.fillStyle=light?'rgba(255,237,206,.09)':'rgba(15,24,33,.09)';c.fillRect(rand()*w,rand()*h,1+rand()*4,1+rand()*3);}if(kind==='brick'){c.strokeStyle='#382b292e';c.lineWidth=2;for(let y=0;y<h;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();for(let x=-(y%64?0:32);x<w;x+=64){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+32);c.stroke();}}}for(let i=0;i<12;i++){c.fillStyle='#33352a18';c.fillRect(rand()*w,rand()*h,rand()*30,rand()*3);}});
    t.wrapS=t.wrapT=T.RepeatWrapping;
    return new T.MeshStandardMaterial({map:t,roughness:1});
  }
  function sign(parent,text,x,y,z,w,h,opts={}){
    const lines=text.split('\n'), t=texture(768,Math.max(128,Math.round(768*h/w)),(c,cw,ch)=>{
      c.fillStyle=opts.bg||cream;c.fillRect(0,0,cw,ch);
      for(let i=0;i<650;i++){c.fillStyle=rand()>.5?'#2d352818':'#ffffff28';c.fillRect(rand()*cw,rand()*ch,rand()*13,rand()*5);}
      c.strokeStyle=opts.border||'#604d3730';c.lineWidth=6;c.strokeRect(12,12,cw-24,ch-24);c.textAlign='center';c.textBaseline='middle';
      lines.forEach((line,i)=>{const size=Math.min(ch/(lines.length+.6),cw/Math.max(5,line.length)*1.55);c.font=`900 ${size}px Arial`;c.fillStyle=opts.color||'#8f3827';c.fillText(line,cw/2,(i+.65)*ch/(lines.length+.25),cw*.9);});
    });
    const m=new T.MeshStandardMaterial({map:t,roughness:1,emissive:opts.glow?'#edbb68':'#000000',emissiveIntensity:opts.glow?.12:0});
    const o=mesh(parent,new T.PlaneGeometry(w,h),m,x,y,z);o.rotation.z=opts.tilt||0;return o;
  }
  function item(type){
    const imported={basket:['wovenBasket',{height:.66}],bottle:['brokenBottle',{height:.6}],batterySock:['batterySock',{height:.85}],sock:['sock',{height:.48}],batteries:['batteries',{height:.36}],lamp:['lamp',{height:1.32}],music:['radio',{max:.67}],food:['takeaway',{height:.52}],pan:['pan',{max:.84}],sack:['sack',{height:.82}],tote:['backpack',{height:.67}],goose:['porcelainGoose',{height:.93}],toolbox:['toolbox',{max:.7}],cart:['cart',{height:1.1}],broom:['broom',{height:1.5}],umbrella:['umbrella',{height:1.2}]};
    if(imported[type]){const [name,opts]=imported[type],o=M.model(name,opts);o.userData.kind=type;if(type==='pan'){const pivot=new T.Group();pivot.add(o);o.rotation.x=Math.PI/2;o.position.y=.39;return pivot;}return o;}
    const g=new T.Group();
    if(type==='cans'){const bag=M.model('bag',{height:.49});g.add(bag);for(let i=0;i<3;i++){const can=M.model(i===1?'crushedCan':'can',{height:.24});can.position.set((i-1)*.11,.36,(i%2)*.08);can.rotation.z=(i-1)*.19;g.add(can);}}
    if(type==='basket'){const b=M.model('crate',{fit:[.73,.5,.51]});g.add(b);mesh(g,new T.TorusGeometry(.34,.025,8,24,Math.PI),mat('#c6ab76'),0,.43,0);}
    g.userData.kind=type;return g;
  }
  // The street and portrait share the same imported rig and current equipment.
  function scavenger(){return M.character('diver',1.72);}
  function enemy(type,id){const human=['scavenger','police','manager'].includes(type),o=M.character(id==='mabel'?'mabel':type,human?1.75:type==='fox'?.83:1.10);o.userData.cargo.position.set(0,human?1:.4,human?-.3:.55);if(type==='police'){const baton=M.model('baton',{height:.65});baton.position.y=-.16;o.userData.weapon.add(baton);}if(type==='manager'){const prop=M.model('broom',{height:1.2});prop.position.y=-.5;o.userData.weapon.add(prop);}return o;}
  function batch(root,exclude=[]){root.updateMatrixWorld(true);const inv=root.matrixWorld.clone().invert(),buckets=new Map();root.traverse(o=>{if(!o.visible||!o.isMesh||o.isInstancedMesh||o.material.transparent)return;for(let p=o;p&&p!==root;p=p.parent)if(exclude.includes(p))return;const k=o.geometry.uuid+o.material.uuid;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(o);});for(const objs of buckets.values()){if(objs.length<2)continue;const a=objs[0],im=new T.InstancedMesh(a.geometry,a.material,objs.length);im.castShadow=true;im.receiveShadow=true;objs.forEach((o,i)=>{im.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));o.removeFromParent();});root.add(im);}}
  async function create(canvas){
    await M.load((done,total)=>{const el=document.getElementById('start');if(el)el.textContent=`Getting the block ready… ${Math.round(done/total*100)}%`;});
    let atlas=null;try{atlas=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src='assets/painted-materials-v3.png';});}catch(e){console.warn('Painted atlas unavailable; using handmade fallback textures.');}
    const painted=(part,color='#ffffff',repeat=1)=>{if(!atlas)return paper(color);const sx=(part%2)*atlas.width/2,sy=Math.floor(part/2)*atlas.height/2;const t=texture(512,512,(c,w,h)=>c.drawImage(atlas,sx,sy,atlas.width/2,atlas.height/2,0,0,w,h));t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);return new T.MeshStandardMaterial({map:t,color,roughness:.98});};
    const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
    const scene=new T.Scene();scene.background=new T.Color('#273a43');scene.fog=new T.Fog('#273a43',43,85);const camera=new T.OrthographicCamera(-12,12,8,-8,.1,100),offset=new T.Vector3(14,16,23),look=new T.Vector3(12,0,18),pointer=new T.Vector2(),ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0);
    let width=1,height=1,zoom=1,overview=false,time=0,shake=0,cargoKey='',equipKey='',stepClock=0;const sway={x:0,z:0,vx:0,vz:0};
    const staticWorld=group(scene),dynamic=group(scene),buildings=[],pickables=[],binMeshes=new Map(),looseMeshes=new Map(),hazardMeshes=new Map(),effects=[],enemies=new Map();
    scene.add(new T.HemisphereLight('#afc4d0','#76533c',1.6));const sun=new T.DirectionalLight('#ffd091',3.1);sun.position.set(-8,25,15);sun.target.position.set(14,0,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-23,right:23,top:22,bottom:-22,near:1,far:60});sun.shadow.normalBias=.045;sun.shadow.bias=-.0002;scene.add(sun,sun.target);const moon=new T.DirectionalLight('#8ca5c7',1);moon.position.set(20,14,-14);scene.add(moon);
    const pavement=painted(2,'#c2c4b8',6),road=paper('#535e60'),plaster=painted(0),metal=painted(1),wood=painted(3),roof=paper('#38484d');
    box(staticWorld,14,-.36,12,28.8,.6,24.8,'#293e47');box(staticWorld,14,-.055,12,28,.14,24,pavement);box(staticWorld,14,.018,21.5,28,.07,3.8,road);
    for(let x=.5;x<28;x+=.7)box(staticWorld,x,.08,19.55,.65,.16,.26,'#c0b39a');for(let x=1;x<28;x+=2.3)box(staticWorld,x,.06,22.6,1.1,.012,.08,'#b6aa86');
    for(let z=20;z<23;z+=.4)box(staticWorld,25,.065,z,1.4,.02,.18,'#c7bca2');
    for(let i=0;i<100;i++){const x=1+rand()*26,z=1+rand()*22;if(C.BUILDINGS.some(b=>x>b.x&&x<b.x+b.w&&z>b.y&&z<b.y+b.h))continue;const p=box(staticWorld,x,.10+C.heightAt(x,z),z,.07+rand()*.2,.009,.07+rand()*.16,i%4===0?'#d2bea0':'#74755b');p.rotation.y=rand()*6;}
    for(const [x,z,w]of[[9,20.3,1.6],[22.9,11,.9],[3.1,9,1.3],[15,4.7,1]]){const o=mesh(staticWorld,new T.CircleGeometry(w,16),new T.MeshStandardMaterial({color:'#49616b',roughness:.27,metalness:.18}),x,.105,z);o.rotation.x=-Math.PI/2;o.scale.y=.45;}
    // Authored facade geometry preserves the tested footprints and adds real shallow rooms.
    const doorMeshes=[];
    for(const b of C.BUILDINGS){
      const made=window.DumpsterArchitecture.create(b,{group,box,mesh,mat,sign,painted}),g=made.g;g.position.set(b.x+b.w/2,0,b.y+b.h/2);staticWorld.add(g);doorMeshes.push(...made.doors);
      const own=new Map();g.traverse(o=>{if(!o.isMesh)return;const unique=m=>{if(!own.has(m)){const c=m.clone();c.onBeforeCompile=m.onBeforeCompile;c.customProgramCacheKey=m.customProgramCacheKey;c.userData.baseOpacity=m.opacity;c.transparent=true;own.set(m,c);}return own.get(m);};o.material=Array.isArray(o.material)?o.material.map(unique):unique(o.material);});
      // Merge repeated architecture by geometry/material; moving doors stay independent.
      for(const m of own.values())m.transparent=false;batch(g,made.doors.map(d=>d.hinge));for(const m of own.values())m.transparent=true;
      buildings.push({g,materials:[...own.values()],opacity:1,box:new T.Box3(new T.Vector3(b.x-.15,0,b.y-.15),new T.Vector3(b.x+b.w+.15,b.z+.6,b.y+b.h+.15))});
    }
    for(const [i,[x,z]]of[[2.2,3],[25.8,5],[25.7,16.5]].entries()){const tree=M.model(i===1?'tree2':'tree',{height:2.9});tree.position.set(x,0,z);staticWorld.add(tree);}
    for(let x=2;x<26;x+=.7){box(staticWorld,x,.46,.8,.1,.9,.1,'#4b6560');}box(staticWorld,14,.73,.8,24,.09,.09,'#607a6c');box(staticWorld,14,.3,.8,24,.075,.075,'#607a6c');
    // An optional raised loading dock. Real elevation, stairs at both ends, hop-off edges.
    box(staticWorld,6.225,.54,10.6,2.45,1.08,6.2,wood);for(const [start,end]of[[5.5,7.5],[13.7,16]])for(let i=0;i<10;i++){const z=start+(i+.5)*(end-start)/10,h=C.heightAt(6,z);box(staticWorld,6.225,h/2,z,2.45,h,(end-start)/10+.015,wood);}
    for(let z=7.7;z<13.6;z+=1.3){box(staticWorld,7.4,1.48,z,.05,.8,.05,'#5d746c');}box(staticWorld,7.4,1.86,10.6,.065,.07,6.1,'#84938b');sign(staticWorld,'LOADING DOCK\nMIND THE STEP',6.7,2.4,12,.83,.65,{bg:'#d1b27b',color:'#465849'});
    for(const b of C.PROPS){if(b.kind==='tree')continue;const x=b.x+b.w/2,z=b.y+b.h/2;
      if(b.kind==='planter'){box(staticWorld,x,.2,z,b.w,.4,b.h,wood);const bush=M.model('bush',{fit:[b.w*.9,.62,b.h*.85]});bush.position.set(x,.37,z);staticWorld.add(bush);}
      else{const bench=M.model('bench',{fit:[b.w,.86,b.h],yaw:Math.PI/2});bench.position.set(x,0,z);staticWorld.add(bench);}}
    // Little visual stories against the walls; no new obstacles in the playable lanes.
    for(const [name,x,z,size,yaw] of [['workbench',8.5,6.72,.92,Math.PI],['tire',9.6,6.75,.44,0],['cone',7.7,16.7,.5,0],['chair',14.9,17.15,.65,0],['tv',15.7,17.18,.53,-.2],['openbox',16.3,17.13,.5,0],['plant',20.2,11.8,.68,1],['books',20.25,12.55,.38,0],['toaster',16.35,17.12,.27,0]]){const o=M.model(name,{max:size});o.position.set(x,name==='toaster'?.28:.04,z);o.rotation.y=yaw;staticWorld.add(o);}
    function lantern(x,z){const p=group(staticWorld,x,0,z);cylinder(p,0,1.5,0,.035,.06,3,'#31474a');box(p,.19,2.99,0,.43,.06,.08,ink);cylinder(p,.39,2.91,0,.07,.22,.2,'#3f5151');ball(p,.39,2.76,0,.10,.12,.10,'#ffe3a9');const l=new T.PointLight('#ffbd62',20,7,2);l.position.set(.39,2.7,0);p.add(l);const t=texture(64,64,(c)=>{const gr=c.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'#e5b15740');gr.addColorStop(1,'#e5b15700');c.fillStyle=gr;c.fillRect(0,0,64,64);});const glow=mesh(staticWorld,new T.PlaneGeometry(5,5),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}),x,.115,z);glow.rotation.x=-Math.PI/2;glow.castShadow=false;}
    lantern(9,18.8);lantern(23.7,10.6);lantern(12,3.6);lantern(3.5,15.2);
    for(const b of C.BIN_DEFS){
      const g=group(staticWorld,b.x,C.heightAt(b.x,b.y),b.y),isCrate=b.container==='crate',isTrunk=b.container==='trunk',isWheel=b.container==='wheelie',h=isCrate?.65:isTrunk?.61:isWheel?1.14:.93,w=isWheel?.77:1.2,d=isWheel?.68:.87;
      const shell=M.model(isCrate?'crate':isTrunk?'chest':'dumpster',{fit:[w,h,d]});shell.position.y=.05;g.add(shell);
      let lid=shell.userData.scene.getObjectByName('Lid');
      if(!lid){lid=group(g,0,h+.04,-d/2);if(isCrate)box(lid,0,.015,d/2,w+.04,.06,d+.04,wood);}
      if(!isCrate&&!isTrunk)sign(g,isWheel?'RECYCLE':'CLEANER\nTOMORROW',0,h*.57,d/2+.025,w*.6,.27,{bg:b.color,color:'#ddd0a5'});
      g.userData={kind:'bin',id:b.id,lid,h};pickables.push(g);binMeshes.set(b.id,g);batch(g,[lid]);
      if(!isCrate&&!isTrunk){const bag=M.model('bag',{height:.43});bag.position.set(b.x-.8,C.heightAt(b.x-.8,b.y),b.y-.14);bag.rotation.z=.12;staticWorld.add(bag);}
    }
    function vehicle(truck=false){const g=M.model(truck?'truck':'van',{fit:truck?[3.3,1.7,1.35]:[2.8,1.43,1.32],yaw:Math.PI/2});
      sign(g,truck?'CLEAN SWEEP':'ODD JOBS & GOOD FINDS',truck?-.2:-.3,.96,.671,truck?1.6:1.55,.28,{bg:truck?'#426556':'#d7c9a8',color:truck?cream:'#3e564b'});return g;}
    const van=vehicle();van.position.set(C.VAN.x,0,C.VAN.y);van.userData.kind='van';staticWorld.add(van);pickables.push(van);const truck=vehicle(true);scene.add(truck);truck.visible=false;
    const ring=(radius,color)=>{const m=mesh(dynamic,new T.RingGeometry(radius-.035,radius,40),new T.MeshBasicMaterial({color,transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.castShadow=false;return m;};
    const extractRing=ring(.9,'#e9bd61');extractRing.position.set(C.VAN.at.x,.14,C.VAN.at.y);const targetMarker=ring(.24,'#eedab0');targetMarker.visible=false;
    const hero=scavenger();dynamic.add(hero);const cartRoot=group(dynamic);const cartModel=item('cart');cartModel.scale.setScalar(1.12);cartRoot.add(cartModel);const cartCargo=group(cartRoot,0,.45,0);cartRoot.visible=false;
    const shadowTex=texture(64,64,(c)=>{const gr=c.createRadialGradient(32,32,4,32,32,32);gr.addColorStop(0,'#192b2c90');gr.addColorStop(1,'#192b2c00');c.fillStyle=gr;c.fillRect(0,0,64,64);});
    function shadow(parent){const m=mesh(parent,new T.PlaneGeometry(1.25,1.1),new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}),0,.10,0);m.rotation.x=-Math.PI/2;m.castShadow=false;}
    shadow(hero);
    for(const r of C.RAT_DEFS){const actor=enemy(r.type,r.id);dynamic.add(actor);shadow(actor);const warning=ring(r.type==='skunk'?1.35:.8,'#e6854f'),stars=group(dynamic);for(let i=0;i<3;i++){const m=mesh(stars,new T.OctahedronGeometry(.065),mat('#ffda7b'));m.position.set(Math.cos(i*2.09)*.34,0,Math.sin(i*2.09)*.34);}enemies.set(r.id,{actor,warning,stars,key:'',lastHit:0});}
    batch(staticWorld,[...pickables,...buildings.map(b=>b.g)]);
    const itemTemplates=Object.fromEntries([...Object.keys(C.ITEMS),'broom','tote'].map(type=>[type,item(type)])),cloneItem=type=>itemTemplates[type].clone(true),icons={};
    const iconScene=new T.Scene();iconScene.add(new T.HemisphereLight('#ffffff','#947660',2.2));const il=new T.DirectionalLight('#ffe6bf',3.5);il.position.set(-2,5,3);iconScene.add(il);const ic=new T.OrthographicCamera(-.86,.86,.86,-.86,.1,20);ic.position.set(3,2.4,4);ic.lookAt(0,.59,0);renderer.setSize(256,256,false);renderer.setClearColor('#000000',0);for(const type of Object.keys(itemTemplates)){const o=cloneItem(type),bounds=new T.Box3().setFromObject(o),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=1.3/Math.max(size.x,size.y,size.z);o.scale.setScalar(scale);o.position.set(-center.x*scale,.58-center.y*scale,-center.z*scale);iconScene.add(o);renderer.render(iconScene,ic);icons[type]=canvas.toDataURL('image/png');iconScene.remove(o);}renderer.setClearColor('#273a43',1);
    function resize(){const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);renderer.setSize(width,height,false);const aspect=width/height,span=(overview?Math.max(28,35/aspect):Math.max(10.8,14/aspect))/zoom;camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();}
    function setZoom(v){zoom=T.MathUtils.clamp(v,.75,1.55);resize();return zoom;}
    function setOverview(v){overview=v;resize();return overview;}
    function point(x,y,z=0){const v=new T.Vector3(x,z,y).project(camera);return{x:(v.x+1)*width/2,y:(1-v.y)*height/2,visible:v.z<1&&Math.abs(v.x)<.98&&Math.abs(v.y)<.95};}
    function hit(cx,cy){pointer.set(cx/width*2-1,-cy/height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects([...pickables,...looseMeshes.values()],true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.kind)o=o.parent;if(o)return o.userData;}const p=new T.Vector3();if(ray.ray.intersectPlane(plane,p))return{kind:'ground',x:p.x,y:p.z};return null;}
    function effect(type,x,z,stage=1,itemType=null){if(type==='pickup'&&itemType&&itemTemplates[itemType]){const m=cloneItem(itemType);m.scale.setScalar(.5);m.position.set(x,C.heightAt(x,z)+.5,z);dynamic.add(m);effects.push({m,collect:true,life:.55,max:.55,start:m.position.clone()});}
      const level=C.heightAt(x,z),col=['stolen','bumped'].includes(type)?'#d28257':type==='dash'?'#b9c3b0':'#f6d187';if(['hit','parry','swing'].includes(type)){const m=mesh(dynamic,new T.RingGeometry(stage===3?.8:.5,stage===3?1.05:.67,32,1,0,Math.PI*1.55),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false}),x,.64+level,z);m.rotation.set(-Math.PI/2,0,rand()*6);m.castShadow=false;effects.push({m,ring:true,life:.22,max:.22});}if(type!=='swing')for(let i=0;i<(type==='pickup'?18:type==='dash'?3:10);i++){const m=mesh(dynamic,geo('spark',()=>new T.BoxGeometry(.045,.045,.045)),mat(col),x,.4+level,z);effects.push({m,vx:(rand()-.5)*4,vy:1+rand()*2,vz:(rand()-.5)*4,life:.3+rand()*.4,max:.7});}if(['hit','parry','stolen','bumped'].includes(type))shake=type==='parry'?.17:.09;}
    function reset(){hero.userData.reset();for(const e of enemies.values()){e.actor.userData.reset();e.lastHit=0;}cargoKey='';equipKey='';sway.x=sway.z=sway.vx=sway.vz=0;hero.userData.cargo.clear();cartCargo.clear();for(const o of looseMeshes.values())o.removeFromParent();looseMeshes.clear();for(const e of effects)e.m.removeFromParent();effects.length=0;for(const o of hazardMeshes.values())o.removeFromParent();hazardMeshes.clear();look.set(12.7,0,18.8);cartRoot.position.set(12.7,0,21.3);overview=false;zoom=1;resize();}
    const occRay=new T.Ray(),occPoint=new T.Vector3();
    function render(g,dt,reduced=false){time+=dt;const p=g.player,moving=Math.hypot(p.vx,p.vy)>.1,run=g.phase==='playing',hd=hero.userData;
      const desired=overview?new T.Vector3(14,0,12):new T.Vector3(p.x-.5,p.z*.55+.35,p.y-1.15);look.lerp(desired,1-Math.exp(-dt*(g.phase==='title'?2:5)));camera.position.copy(look).add(offset);camera.lookAt(look);if(shake>0&&!reduced){shake=Math.max(0,shake-dt);camera.position.x+=(rand()-.5)*shake;camera.position.y+=(rand()-.5)*shake*.5;}
      // Fade only buildings between the camera and the diver. The full loop stays legible.
      for(const b of buildings){let occluded=false;if(!overview)for(const dx of[-.5,0,.5]){const origin=new T.Vector3(p.x+dx,p.z+.8,p.y),dir=camera.position.clone().sub(origin).normalize();occRay.set(origin,dir);if(occRay.intersectBox(b.box,occPoint)){occluded=true;break;}}const target=occluded?.12:1;b.opacity+=(target-b.opacity)*Math.min(1,dt*7);for(const m of b.materials){m.opacity=b.opacity*(m.userData.baseOpacity??1);m.depthWrite=m.opacity>.96;}}
      hero.position.set(p.x,p.z+.07,p.y);const yaw=Math.atan2(p.faceX,p.faceY);hero.rotation.y+=Math.atan2(Math.sin(yaw-hero.rotation.y),Math.cos(yaw-hero.rotation.y))*Math.min(1,dt*18);hero.visible=p.hurt<=0||Math.floor(time*22)%2===0;
      if(g.attack)hd.play(['','1H_Melee_Attack_Slice_Horizontal','1H_Melee_Attack_Slice_Diagonal','2H_Melee_Attack_Spin'][g.attack.stage],{once:true,speed:2.3,token:g.attack.id});
      else if(p.hurt>0)hd.play('Hit_A',{once:true,speed:1.8});
      else if(g.dash>0)hd.play('Dodge_Forward',{once:true,speed:2.5});
      else if(!p.grounded)hd.play('Jump_Idle');
      else if(g.action)hd.play('Interact',{speed:1.4});
      else hd.play(moving?'Running_A':'Idle',{speed:moving?1.1:1});
      hd.tick(g.phase==='paused'?0:dt);
      const ek=g.carrier+g.weapon;if(ek!==equipKey){equipKey=ek;hd.carrier.clear();hd.weapon.clear();if(g.carrier!=='cart'){const model=cloneItem(g.carrier);model.scale.setScalar(g.carrier==='sack'?.97:.9);model.rotation.x=.13;hd.carrier.add(model);}if(g.weapon==='broom'){const broom=cloneItem('broom');broom.position.y=-.75;hd.weapon.add(broom);}else{const w=cloneItem(g.weapon);w.rotation.x=.3;hd.weapon.add(w);if(g.weapon==='umbrella'){const canopy=cylinder(hd.weapon,0,.88,0,.025,.67,.25,'#b86a4b',8);canopy.name='open-canopy';canopy.visible=false;}}}
      const canopy=hd.weapon.getObjectByName('open-canopy');if(canopy)canopy.visible=!!g.attack&&g.attack.stage===3;
      const ck=g.bag.map(o=>o.id+o.type).join(',')+g.carrier;if(ck!==cargoKey){cargoKey=ck;hd.cargo.clear();cartCargo.clear();let h=g.carrier==='basket'?.2:g.carrier==='sack'?.35:.06;for(let i=0;i<g.bag.length;i++){const it=g.bag[i],o=cloneItem(it.type);if(g.carrier==='cart'){o.position.set((i%2-.5)*.32,Math.floor(i/2)*.29,(i%3-1)*.08);o.scale.setScalar(.68);cartCargo.add(o);}else{o.position.set(Math.sin(i*2.4)*.13,h,Math.cos(i*2)*.05);o.rotation.y=i*.85;o.scale.setScalar(.68);hd.cargo.add(o);h+=it.type==='lamp'?.46:it.type==='goose'?.36:.26;}}}
      cartRoot.visible=g.carrier==='cart';if(cartRoot.visible){const wanted=new T.Vector3(p.x-p.faceX*1.0,C.heightAt(p.x-p.faceX,p.y-p.faceY)+.07,p.y-p.faceY*1.0);cartRoot.position.lerp(wanted,1-Math.exp(-dt*10));cartRoot.rotation.y=hero.rotation.y;cartModel.rotation.z=reduced?0:Math.sin(p.walking*1.7)*Math.min(.045,Math.hypot(p.vx,p.vy)*.02);}
      const lx=Math.cos(hero.rotation.y)*p.vx-Math.sin(hero.rotation.y)*p.vy,lz=Math.sin(hero.rotation.y)*p.vx+Math.cos(hero.rotation.y)*p.vy,h=Math.min(dt,.035);sway.vx+=((lz*.022-sway.x)*70-sway.vx*10)*h;sway.vz+=((-lx*.025-sway.z)*70-sway.vz*10)*h;sway.x+=sway.vx*h;sway.z+=sway.vz*h;hd.cargo.rotation.x=reduced?0:sway.x;hd.cargo.rotation.z=reduced?0:sway.z;hd.cargo.children.forEach((o,i)=>o.rotation.z=reduced?0:Math.sin(time*2+i)*.035);
      for(const r of g.raccoons){const e=enemies.get(r.id),a=e.actor,d=a.userData,z=C.heightAt(r.x,r.y),human=['scavenger','police','manager'].includes(r.type);
        a.visible=!r.defeated||r.defeatTime<2.4;a.position.set(r.x,z+.07,r.y);const ry=Math.atan2(r.faceX,r.faceY);if(!r.defeated)a.rotation.y+=Math.atan2(Math.sin(ry-a.rotation.y),Math.cos(ry-a.rotation.y))*Math.min(1,dt*13);
        if(r.defeated)d.play('Death',{once:true});else if(r.hitSerial!==e.lastHit){d.flash();d.play('Idle_HitReact_Left',{once:true,token:r.hitSerial});}
        else if(r.stun>0)d.play('Idle_HitReact_Left',{once:true,token:r.hitSerial});
        else if(r.windup>0)d.play('Idle_2_HeadLow',{speed:1.2});else if(r.lunge>0)d.play('Attack',{once:true,speed:1.5});
        else d.play(['chase','flee','emerging'].includes(r.state)?'Gallop':['patrol','investigate'].includes(r.state)?'Walk':r.state==='distracted'?'Eating':'Idle');
        if(r.type==='skunk'){const pivot=d.pivot,moving=['patrol','chase','flee'].includes(r.state);pivot.rotation.z=r.defeated?0:moving?Math.sin(r.walk*1.8)*.055:0;pivot.rotation.x=r.windup>0?-.12:0;pivot.position.y=r.defeated?-.08:moving?Math.abs(Math.sin(r.walk*1.8))*.035:0;}
        e.lastHit=r.hitSerial;d.tick(run?dt:0);e.warning.visible=run&&!r.defeated&&(r.windup>0||r.lunge>0);e.warning.position.set(r.x,z+.15,r.y);e.warning.scale.setScalar(1+Math.sin(time*25)*.08);e.warning.material.opacity=r.lunge>0?.4:.85;
        e.stars.visible=run&&(!r.defeated?r.stun>.1:r.defeatTime<2.3);e.stars.position.set(r.x,z+(r.defeated?.6:human?1.9:1.18),r.y);e.stars.rotation.y=time*3;
        const key=r.carried?r.carried.id+':'+r.carried.type:'';if(key!==e.key){e.key=key;d.cargo.clear();if(r.carried){const o=cloneItem(r.carried.type);o.scale.setScalar(.55);d.cargo.add(o);}}
      }
      for(const door of doorMeshes){const r=g.raccoons.find(r=>r.id===door.shop);const want=r?.state==='emerging'||(r?.outside&&C.dist(r,C.SHOPS.find(s=>s.id===r.shop).door)<1)?-1.4:0;door.hinge.rotation.y+=(want-door.hinge.rotation.y)*Math.min(1,dt*8);}
      const hazardIds=new Set(g.hazards.map(h=>h.id));for(const[id,m]of hazardMeshes)if(!hazardIds.has(id)){m.removeFromParent();m.traverse(o=>{if(o.isMesh)o.material.dispose();});hazardMeshes.delete(id);}for(const h of g.hazards){if(!hazardMeshes.has(h.id)){const cloud=group(dynamic);for(let i=0;i<7;i++){const puff=mesh(cloud,new T.SphereGeometry(.43,10,7),new T.MeshBasicMaterial({color:i%2?'#89994f':'#b3bc75',transparent:true,opacity:.22,depthWrite:false}),Math.sin(i*2.4)*.75,.25+Math.sin(i)*.13,Math.cos(i*2.4)*.75);puff.castShadow=false;}hazardMeshes.set(h.id,cloud);}const cloud=hazardMeshes.get(h.id);cloud.position.set(h.x,.1,h.y);cloud.rotation.y=time*.2;cloud.scale.setScalar(Math.min(1,(3.7-h.life)*3));cloud.children.forEach((o,i)=>{o.position.y=.35+Math.sin(time*2+i)*.12;o.material.opacity=Math.min(.22,h.life*.16);});}
      for(const b of g.bins)binMeshes.get(b.id).userData.lid.rotation.x=-b.open*1.22;
      const ids=new Set(g.loose.map(o=>o.id));for(const[id,m]of looseMeshes)if(!ids.has(id)){m.removeFromParent();looseMeshes.delete(id);}for(const o of g.loose){if(!looseMeshes.has(o.id)){const m=cloneItem(o.type);m.userData={kind:'loose',id:o.id};dynamic.add(m);looseMeshes.set(o.id,m);}const m=looseMeshes.get(o.id);m.position.set(o.x,C.heightAt(o.x,o.y)+.13+(o.toss?Math.sin(o.toss/.4*Math.PI)*.5:Math.sin(time*3)*.035),o.y);m.rotation.y=time*.35;}
      targetMarker.visible=run&&g.path.length>0;if(targetMarker.visible){const n=g.path[g.path.length-1];targetMarker.position.set(n.x,C.heightAt(n.x,n.y)+.16,n.y);}extractRing.material.opacity=.5+Math.sin(time*3)*.2;
      truck.visible=g.time<30;truck.position.set(-4+(30-g.time)/30*36,0,23.1);
      for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;if(e.collect){const target=hero.position.clone().add(new T.Vector3(0,1.35,0)),t=1-e.life/e.max;e.m.position.lerpVectors(e.start,target,t);e.m.position.y+=Math.sin(t*Math.PI)*.65;e.m.scale.setScalar(.5*(1-t*.7));e.m.rotation.y+=dt*5;}else if(e.ring){e.m.scale.setScalar(1+(1-e.life/e.max)*.6);e.m.material.opacity=Math.max(0,e.life/e.max);}else{e.m.position.x+=e.vx*dt;e.m.position.y+=e.vy*dt;e.m.position.z+=e.vz*dt;e.vy-=8*dt;e.m.scale.setScalar(Math.max(0,e.life/e.max));}if(e.life<=0){e.m.removeFromParent();if(e.ring){e.m.geometry.dispose();e.m.material.dispose();}effects.splice(i,1);}}
      if(run&&moving&&g.dash>0&&!reduced){stepClock+=dt;if(stepClock>.06){stepClock=0;effect('dash',p.x,p.y);}}
      renderer.render(scene,camera);
    }
    resize();return{render,resize,hit,point,effect,reset,icons,setZoom,getZoom:()=>zoom,setOverview,getOverview:()=>overview,info:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,painted:!!atlas,models:M.count()}),renderer};
  }
  function createPortrait(canvas){
    const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.1,20),actor=scavenger(),rig=group(scene);rig.add(actor);actor.rotation.y=-.38;
    scene.add(new T.HemisphereLight('#e5efe5','#514137',2));const key=new T.DirectionalLight('#ffe0a5',3.7);key.position.set(-3,5,4);scene.add(key);const rim=new T.DirectionalLight('#7eadb7',2.7);rim.position.set(3,2,-3);scene.add(rim);
    let signature='',time=0,angle=-.38,drag=null;canvas.addEventListener('pointerdown',e=>{drag=e.clientX;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(drag!==null){angle+=(e.clientX-drag)*.012;drag=e.clientX;}});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
    return {render(g,dt,reduced){time+=dt;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const w=Math.round(rect.width),h=Math.round(rect.height);if(canvas.dataset.size!==w+'x'+h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();canvas.dataset.size=w+'x'+h;}
      const d=actor.userData,k=g.carrier+g.weapon+g.bag.map(o=>o.id+o.type).join(',');if(k!==signature){signature=k;d.carrier.clear();d.cargo.clear();d.weapon.clear();const carrier=item(g.carrier);carrier.scale.setScalar(g.carrier==='cart'?.85:.85);if(g.carrier==='cart'){carrier.position.set(-.7,-.68,.15);}d.carrier.add(carrier);const weapon=item(g.weapon);weapon.position.y=g.weapon==='broom'?-.75:-.2;d.weapon.add(weapon);let y=.06;d.cargo.position.set(g.carrier==='cart'?-.7:0,g.carrier==='cart'?.29:1.14,g.carrier==='cart'?-.22:-.37);g.bag.forEach((o,i)=>{const m=item(o.type);m.scale.setScalar(.5);m.position.set(g.carrier==='cart'?(i%2-.5)*.25:Math.sin(i*2.4)*.12,g.carrier==='cart'?Math.floor(i/2)*.22:y,0);m.rotation.y=i*.8;d.cargo.add(m);y+=o.type==='lamp'?.45:.23;});}
      actor.rotation.y=angle+(reduced?0:Math.sin(time*.5)*.06);d.play('Idle');d.tick(reduced?0:dt);const bounds=M.bounds(actor),size=bounds.getSize(new T.Vector3());const centerY=Math.max(.91,(bounds.max.y+bounds.min.y)/2),distance=Math.max(3.65,size.y*2.15,size.x*1.18/(.536*camera.aspect))+size.z*.5,centerX=(bounds.max.x+bounds.min.x)/2;camera.position.set(centerX+.12,centerY+.12,distance);camera.lookAt(centerX,centerY,0);renderer.render(scene,camera);
    }};
  }
  window.DumpsterWorld={create,createPortrait};
})();
