/* Local, licensed glTF models. No network/CDN or runtime model-generation service. */
(() => {
  'use strict';
  const T=window.THREE, library=new Map();
  const files={
    diver:'v6/diver.glb',scavenger:'v6/scavenger.glb',police:'v6/police.glb',manager:'v6/manager.glb',mabel:'v6/mabel.glb',skunk:'v6/skunk.glb',fox:'characters/fox.glb',wovenBasket:'v6/basket.glb',baton:'v6/baton.glb',backpack:'v6/backpack.glb',sack:'v6/sack.glb',brokenBottle:'v6/broken-bottle.glb',batterySock:'v6/battery-sock.glb',sock:'v6/sock.glb',batteries:'v6/batteries.glb',
    porcelainGoose:'characters/porcelain-goose.glb',dumpster:'quaternius/dumpster.glb',umbrella:'creative-trio/umbrella.glb',toolbox:'creative-trio/toolbox.glb',cart:'google/cart.glb',broom:'jarlan-perez/broom.glb',
    radio:'furniture/radio.glb',lamp:'furniture/lampRoundTable.glb',box:'furniture/cardboardBoxClosed.glb',openbox:'furniture/cardboardBoxOpen.glb',trashcan:'furniture/trashcan.glb',bench:'furniture/bench.glb',plant:'furniture/pottedPlant.glb',tv:'furniture/televisionVintage.glb',toaster:'furniture/toaster.glb',coffeemaker:'furniture/kitchenCoffeeMachine.glb',chair:'furniture/loungeChair.glb',books:'furniture/books.glb',
    shop:'city/building-a.glb',apartment:'city/building-c.glb',fancy:'city/building-f.glb',garage:'industrial/building-d.glb',awning:'city/detail-awning-wide.glb',tank:'industrial/detail-tank.glb',solar:'industrial/solar-panel-flat.glb',
    van:'car/van.glb',truck:'car/garbage-truck.glb',cone:'car/cone.glb',tire:'car/debris-tire.glb',tree:'nature/tree_oak.glb',tree2:'nature/tree_detailed.glb',bush:'nature/plant_bushDetailed.glb',rock:'nature/rock_smallA.glb',flower:'nature/flower_redA.glb',
    bag:'food/bag.glb',can:'food/soda-can.glb',crushedCan:'food/soda-can-crushed.glb',takeaway:'food/chinese.glb',chopstick:'food/chopstick.glb',pan:'food/frying-pan.glb',apple:'food/apple.glb',banana:'food/banana.glb',
    crate:'survival/box-open.glb',chest:'survival/chest.glb',hammer:'survival/tool-hammer.glb',shovel:'survival/tool-shovel.glb',workbench:'survival/workbench.glb',bottle:'survival/bottle.glb',bedroll:'survival/bedroll-packed.glb'
  };
  let brush;
  function paintMaterial(m,scale=1){
    m.roughness=Math.max(m.roughness||0,.8);m.metalness=Math.min(m.metalness||0,.1);
    m.onBeforeCompile=shader=>{
      shader.uniforms.brushMap={value:brush};shader.uniforms.brushScale={value:scale};
      shader.vertexShader='varying vec3 vBrush; varying vec3 vBrushN;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBrush=position; vBrushN=normal;');
      shader.fragmentShader='uniform sampler2D brushMap; uniform float brushScale; varying vec3 vBrush; varying vec3 vBrushN;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        vec3 brushNormal=dot(vBrushN,vBrushN)>.00001?normalize(vBrushN):vec3(0.0,1.0,0.0);
        vec3 blend=pow(abs(brushNormal),vec3(4.0));blend/=max(dot(blend,vec3(1.0)),0.001);
        vec3 q=vBrush*brushScale;
        float pigment=dot(texture2D(brushMap,q.yz).rgb,vec3(0.333))*blend.x+dot(texture2D(brushMap,q.xz).rgb,vec3(0.333))*blend.y+dot(texture2D(brushMap,q.xy).rgb,vec3(0.333))*blend.z;
        diffuseColor.rgb*=0.35+pigment*0.95;
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(dot(diffuseColor.rgb,vec3(.299,.587,.114))),.08);
      `);
    };
    m.customProgramCacheKey=()=> 'gouache-triplanar-v6';return m;
  }
  async function load(progress){
    if(library.size===Object.keys(files).length)return;
    brush=await new T.TextureLoader().loadAsync('assets/brush-gouache.png');brush.wrapS=brush.wrapT=T.RepeatWrapping;brush.colorSpace=T.NoColorSpace;brush.anisotropy=4;
    const loader=new T.GLTFLoader();let done=0;
    await Promise.all(Object.entries(files).map(async([name,file])=>{
      const gltf=await loader.loadAsync('assets/models/'+file+'?v=6.3'),box=new T.Box3().setFromObject(gltf.scene),scale=1.8/Math.max(.1,box.getSize(new T.Vector3()).y);
      gltf.scene.traverse(o=>{if(o.isMesh){if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals();o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;for(const m of Array.isArray(o.material)?o.material:[o.material]){
        paintMaterial(m,scale);if(name==='broom'){m.color.set(({mat20:'#8b593a',mat22:'#899b8c',mat18:'#d9b568',mat19:'#ae8846'})[m.name]||'#b99a69');m.emissive.copy(m.color);m.emissiveIntensity=.12;}if(name==='porcelainGoose')m.roughness=.38;
        if(name==='cart'){if(m.color.r>.9&&m.color.g<.1)m.color.set('#98624a');else if(m.color.r>.4)m.color.set('#879d91');}
      }}});
      library.set(name,gltf);progress?.(++done,Object.keys(files).length);
    }));
  }
  // Scale from visible, posed mesh bounds; unused weapon nodes must not affect the hero size.
  function bounds(root){root.updateMatrixWorld(true);const box=new T.Box3();root.traverse(o=>{let visible=true;for(let p=o;p;p=p.parent)if(!p.visible){visible=false;break;}if(visible&&o.isMesh){if(o.isSkinnedMesh)o.computeBoundingBox();else if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();box.union((o.isSkinnedMesh?o.boundingBox:o.geometry.boundingBox).clone().applyMatrix4(o.matrixWorld));}});return box;}
  function model(name,{height,max,fit,yaw=0,uniqueMaterials=false}={}){
    const source=library.get(name);if(!source)throw new Error('Missing model: '+name);
    const root=new T.Group(),pivot=new T.Group(),scene=T.SkeletonUtils.clone(source.scene);root.add(pivot);pivot.add(scene);scene.rotation.y+=yaw;
    const box=bounds(scene),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
    const s=height?height/size.y:max?max/Math.max(size.x,size.y,size.z):1;
    scene.position.add(new T.Vector3(-center.x,-box.min.y,-center.z));pivot.scale.set(fit?fit[0]/size.x:s,fit?fit[1]/size.y:s,fit?fit[2]/size.z:s);
    if(uniqueMaterials){const copies=new Map();scene.traverse(o=>{if(!o.isMesh)return;const own=m=>{if(!copies.has(m)){const c=m.clone();c.onBeforeCompile=m.onBeforeCompile;c.customProgramCacheKey=m.customProgramCacheKey;copies.set(m,c);}return copies.get(m);};o.material=Array.isArray(o.material)?o.material.map(own):own(o.material);});}
    root.userData={asset:name};Object.defineProperties(root.userData,{pivot:{value:pivot},scene:{value:scene},clips:{value:source.animations}});return root;
  }
  function character(name,height){
    const root=model(name,{height,uniqueMaterials:true}),data=root.userData,mixer=new T.AnimationMixer(data.scene),actions=new Map(),meshes=[];
    data.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
    for(const clip of data.clips){if(clip.name.includes('|'))continue;actions.set(clip.name,mixer.clipAction(clip));}
    let current=null,key='',flash=0;
    const aliases={Running_A:'Run',Hit_A:'HitRecieve',Dodge_Forward:'Roll',Jump_Idle:'Idle_Neutral','1H_Melee_Attack_Slice_Horizontal':'Sword_Slash','1H_Melee_Attack_Slice_Diagonal':'Punch_Right','2H_Melee_Attack_Spin':'Kick_Right',Idle_HitReact_Left:'HitRecieve',Idle_2_HeadLow:'Idle_Sword',Attack:'Sword_Slash',Gallop:'Run',Eating:'Interact'};
    function play(name,{once=false,speed=1,token=''}={}){
      const action=actions.get(name)||actions.get(aliases[name])||actions.get(name==='Attack'?'Slash':name==='Idle_HitReact_Left'?'HitReact':'Idle');if(!action){key=name;return;}
      const next=name+':'+token;if(key===next)return;key=next;
      action.reset().setEffectiveTimeScale(speed).setEffectiveWeight(1);action.setLoop(once?T.LoopOnce:T.LoopRepeat,once?1:Infinity);action.clampWhenFinished=once;
      if(current&&current!==action){current.fadeOut(.1);action.fadeIn(.1);}action.play();current=action;
    }
    play('Idle');mixer.update(.001);
    const cargo=new T.Group(),carrier=new T.Group(),weapon=new T.Group();root.add(cargo,carrier,weapon);cargo.position.set(0,1.14,-.27);carrier.position.set(0,.67,-.26);
    const hand=data.scene.getObjectByName('WristR')||data.scene.getObjectByName('Wrist.R')||data.scene.getObjectByName('LowerArmR')||data.scene.getObjectByName('LowerArm.R')||data.scene.getObjectByName('handslotr')||data.scene.getObjectByName('handslot.r')||data.scene.getObjectByName('handr')||data.scene.getObjectByName('hand.r');
    const handPos=new T.Vector3(),handQuat=new T.Quaternion(),rootQuat=new T.Quaternion(),gripCorrection=new T.Quaternion().setFromEuler(new T.Euler(0,0,Math.PI/2));
    Object.assign(data,{mixer,actions,play,cargo,carrier,weapon,hand,
      tick(dt){mixer.update(dt);root.updateMatrixWorld(true);if(hand){hand.getWorldPosition(handPos);root.worldToLocal(handPos);weapon.position.copy(handPos);hand.getWorldQuaternion(handQuat);root.getWorldQuaternion(rootQuat).invert();weapon.quaternion.copy(rootQuat.multiply(handQuat)).multiply(gripCorrection);}if(flash>0)flash=Math.max(0,flash-dt);for(const o of meshes)for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.emissive){m.emissive.set('#f9d58e');m.emissiveIntensity=flash>0?.65:0};}},
      flash(){flash=.14;},
      reset(){key='';mixer.stopAllAction();play('Idle');root.visible=true;}
    });
    return root;
  }
  window.DumpsterModels={load,model,character,bounds,paintMaterial,count:()=>library.size,files};
})();
