/* Original procedural late-night jazz. No recordings, streaming, or external audio. */
(function(root){
'use strict';
const midi=n=>440*Math.pow(2,(n-69)/12);
const LOOT_NOTES=[[72,79],[72,75,79,82],[72,75,79,82,86,91]];
class Soundscape{
 constructor(){this.ctx=null;this.muted=false;this.playing=false;this.beat=0;this.nextBeat=0;this.step=0;this.notes=0;this.lastProximity=0;this.masterLevel=.48;}
 async unlock(){if(!this.ctx){const AC=root.AudioContext||root.webkitAudioContext;if(!AC)return;this.ctx=new AC();const c=this.ctx;this.master=c.createGain();this.master.gain.value=0;this.limiter=c.createDynamicsCompressor();this.limiter.threshold.value=-15;this.limiter.knee.value=14;this.limiter.ratio.value=8;this.limiter.attack.value=.004;this.limiter.release.value=.16;this.master.connect(this.limiter);this.limiter.connect(c.destination);
 this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noise.getChannelData(0);let seed=59;for(let i=0;i<data.length;i++){seed=(1664525*seed+1013904223)>>>0;data[i]=(seed/4294967296)*2-1;}
 // A quiet room/air bed under the close, dry instruments.
 const air=c.createBufferSource();air.buffer=this.noise;air.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=350;const gain=c.createGain();gain.gain.value=.012;air.connect(filter);filter.connect(gain);gain.connect(this.master);air.start();this.nextBeat=c.currentTime+.08;
 }if(this.ctx.state==='suspended')await this.ctx.resume();}
 setMuted(v){this.muted=v;this.level();}
 level(){if(this.ctx)this.master.gain.setTargetAtTime(!this.muted&&this.playing?this.masterLevel:0,this.ctx.currentTime,.06);}
 tone(freq,at,duration=.3,volume=.06,wave='sine',end=null){const c=this.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=wave;o.frequency.setValueAtTime(freq,at);if(end)o.frequency.exponentialRampToValueAtTime(end,at+duration);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.001,volume),at+.006);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g);g.connect(this.master);o.start(at);o.stop(at+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};this.notes++;}
 hiss(at,duration=.07,volume=.06,freq=6500,kind='highpass'){const c=this.ctx;if(!c)return;const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noise;f.type=kind;f.frequency.value=freq;f.Q.value=.7;g.gain.setValueAtTime(volume,at);g.gain.exponentialRampToValueAtTime(.0001,at+duration);s.connect(f);f.connect(g);g.connect(this.master);s.start(at,(this.notes%19)/10);s.stop(at+duration+.015);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};}
 piano(note,at,volume=.07,duration=.75){const f=midi(note);this.tone(f,at,duration,volume);this.tone(f*2.004,at,duration*.5,volume*.24);this.tone(f*3.001,at,duration*.28,volume*.07);}
 bass(note,at,volume=.08){this.tone(midi(note),at,.34,volume,'triangle',midi(note)*.997);this.tone(midi(note)*2,at,.08,volume*.25);}
 hat(at,volume=.045,open=false){this.hiss(at,open?.23:.052,volume,6200);for(const ratio of[1,1.43,2.17])this.tone(3750*ratio,at,open?.16:.03,volume*.055);}
 update(g,dt){if(!this.ctx)return;const active=g.phase==='playing'||this.tailUntil>this.ctx.currentTime;if(active!==this.playing){this.playing=active;this.level();this.nextBeat=this.ctx.currentTime+.03;}if(!active||this.muted||g.phase!=='playing')return;const c=this.ctx,now=c.currentTime,proximity=Math.max(0,...g.raccoons.filter(r=>!r.defeated).map(r=>Math.max(0,1-Math.hypot(r.x-g.player.x,r.y-g.player.y)/6))),moving=Math.hypot(g.player.vx,g.player.vy)>.1,urgency=Math.max(0,1-g.time/40);this.lastProximity=proximity;
 const tempo=92+urgency*40,beatLength=60/tempo;
 if(this.nextBeat<now-.2)this.nextBeat=now+.02;
 while(this.nextBeat<now+.12){const at=this.nextBeat,step=this.beat%16,chord=Math.floor(this.beat/16)%4,roots=[36,41,38,43],rootNote=roots[chord],voicings=[[63,67,70,74],[63,69,72,75],[65,68,72,76],[65,68,71,75]];
 if(step%4===0)this.bass(rootNote+(step===8?7:0),at,.075+proximity*.018);else if(step%4===2&&(moving||urgency>.3))this.bass(rootNote+(step%8===2?10:7),at,.04);
 if(step===0||step===10)for(const[i,n]of voicings[chord].entries())this.piano(n,at+i*.014,moving?.023:.017,1.05);
 if(step%4===2)this.hiss(at,.12,.018+urgency*.035,2100,'bandpass');
 if(urgency>.05||proximity>.25)this.hat(at,(.016+urgency*.025+proximity*.012)*(step%2?.65:1),step===14);
 if(urgency>.4&&step%4===0){this.tone(82,at,.12,.07,'sine',39);}
 if(step===15&&urgency>.6){this.piano(79,at,.027,.18);this.piano(82,at+.09,.025,.18);}
 this.nextBeat+=beatLength/2*(step%2?.72:1.28);this.beat++;}
 if(moving&&g.player.grounded){this.step+=dt*Math.hypot(g.player.vx,g.player.vy);if(this.step>.86){this.step=0;this.hat(now,.032+proximity*.12,g.carrier==='cart'&&this.beat%4===0);this.tone(90,now,.045,.012,'triangle',45);if(this.beat%3===0){const melody=[72,75,77,79,82,79,75,74],n=melody[Math.floor(g.player.walking/5)%melody.length];this.piano(n,now,.02+proximity*.007,.26);}}}
 }
 event(e){if(!this.ctx||this.muted)return;const now=this.ctx.currentTime;
 switch(e.type){
 case 'reel-tick':this.hiss(now,.024,.045,3200,'bandpass');this.tone(630,now,.035,.017,'triangle',410);break;
 case 'search':this.hiss(now,.35,.075,e.container==='crate'?1350:2800,'bandpass');if(e.container!=='crate')this.tone(192,now,.24,.055,'triangle',127);break;
 case 'rustle':this.hiss(now,.20,.055+e.stage*.012,e.container==='trunk'?750:e.container==='crate'?1500:2300,'bandpass');if(e.stage>1)this.piano(60+e.stage*3+e.tier*2,now,.024,.17);break;
 case 'pickup':{const tier=e.tier||0,notes=LOOT_NOTES[tier];notes.forEach((n,i)=>this.piano(n,now+i*(tier===2?.085:.09),tier===2?.083:.065,tier===2?1:.55));if(tier>0){this.bass(tier===2?36:48,now,.1);this.hat(now,.055,true);}if(tier===2){[63,67,70,74].forEach(n=>this.piano(n,now+.52,.031,1.15));this.hiss(now+.08,.45,.035,8400);}break;}
 case 'swing':this.hiss(now,.15,e.stage===3?.13:.07,1100,'bandpass');if(e.weapon==='pan')this.tone(265,now,.2,.048,'triangle');break;
 case 'hit':case 'parry':this.tone(e.type==='parry'?760:175,now,.19,.105,'triangle',e.type==='parry'?430:65);this.hiss(now,.12,.095,2200,'bandpass');if(e.type==='parry'){this.piano(82,now+.025,.085,.4);this.piano(89,now+.075,.07,.4);}break;
 case 'defeated':this.hiss(now,.2,.075,1800,'bandpass');this.tone(115,now,.22,.09,'triangle',45);[60,64,67,74].forEach((n,i)=>this.piano(n,now+i*.07,.075,.38));break;
 case 'spray':this.hiss(now,.65,.12,1400,'bandpass');this.tone(240,now,.35,.05,'triangle',90);break;
 case 'manager-alert':this.piano(65,now,.08,.2);this.piano(66,now+.12,.09,.4);this.hiss(now,.16,.055,2200,'bandpass');break;
 case 'craft-start':this.hiss(now,.3,.05,1100,'bandpass');break;
 case 'enemy-ready':if(e.enemy==='police'){this.hiss(now,.22,.075,330,'bandpass');this.tone(95,now,.15,.055,'sawtooth',58);this.tone(115,now+.14,.12,.042,'triangle',72);}else if(e.enemy==='skunk'){this.hiss(now,.11,.11,560,'bandpass');this.tone(135,now,.12,.055,'triangle',85);}else this.hiss(now,.16,.055,1400,'bandpass');break;
 case 'stolen':case 'bumped':[67,63,58].forEach((n,i)=>this.piano(n,now+i*.065,.065,.22));break;
 case 'dash':this.hiss(now,.18,.09,2400,'bandpass');break;
 case 'jump':this.tone(190,now,.16,.04,'triangle',410);break;
 case 'land':case 'drop':this.hiss(now,.1,.06,530,'lowpass');this.tone(85,now,.11,.06,'triangle',40);break;
 case 'warning':[60,67,70,74].forEach((n,i)=>this.piano(n,now+i*.11,.06,.5));break;
 case 'success':this.tailUntil=now+2.1;this.playing=true;this.level();[60,63,67,70,74,79,84].forEach((n,i)=>this.piano(n,now+i*.075,.09,1.3));break;
 case 'failed':this.tailUntil=now+1.5;this.playing=true;this.level();[60,58,55,48].forEach((n,i)=>this.piano(n,now+i*.13,.07,.6));break;
 }
 }
 info(){return{unlocked:!!this.ctx,state:this.ctx?.state||'locked',notes:this.notes,audible:this.playing&&!this.muted,proximity:this.lastProximity,muted:this.muted};}
}
root.DumpsterAudio={Soundscape,LOOT_NOTES};if(typeof module!=='undefined')module.exports={Soundscape,LOOT_NOTES};
})(typeof window!=='undefined'?window:globalThis);
