/* ===================== Spēles loģika ===================== */
const P={x:6.5,y:41.5,path:[],target:null,ph:0,dir:0};
let NPCS=[],CARS=[],ROOM=null,COMP_NPC=null,EXTRAS=[],PIGEONS=[];const TARGET={x:0,y:0,t:0};
const curMap=()=>S.where?ROOM:CITY;
const RES=['apt','apt5','apt_ct','apt_loft','apt_pent','apt_home'];

/* ---------- Mašīnas ---------- */
function initCars(){CARS=[];const lanes=[];
  ROADS.forEach(r=>{const seg=ax=>{let best=[0,0],s=null;for(let i=0;i<=59;i++){const ok=i<59&&(ax==='x'?grid[gi(i,r)]===T.ROAD:grid[gi(r,i)]===T.ROAD);if(ok&&s===null)s=i;if(!ok&&s!==null){if(i-s>best[1]-best[0])best=[s,i];s=null}}return best};
    const sx=seg('x'),sy=seg('y');lanes.push({ax:'x',c:r+.5,d:1,s0:sx[0],s1:sx[1]},{ax:'x',c:r+1.5,d:-1,s0:sx[0],s1:sx[1]},{ax:'y',c:r+.5,d:-1,s0:sy[0],s1:sy[1]},{ax:'y',c:r+1.5,d:1,s0:sy[0],s1:sy[1]})});
  const cols=['#e2484f','#f4f4f4','#2b2f3a','#3f7fd8','#46b06b','#9aa3ad','#1f6f8b','#c0c4ca','#7a2b2b'];
  for(let i=0;i<34;i++){const ln=lanes[i%lanes.length];const taxi=rnd()<.45;CARS.push({ax:ln.ax,dir:ln.d,lane:ln.c,s0:ln.s0,s1:ln.s1,s:ln.s0+rnd()*(ln.s1-ln.s0),v:2+rnd()*1.8,col:taxi?'#ffc61a':pick(cols),taxi,x:0,y:0})}}
function updCars(dt){CARS.forEach(c=>{c.s+=c.v*dt*c.dir;if(c.s>c.s1-.4)c.s=c.s0+.2;if(c.s<c.s0+.2)c.s=c.s1-.4;if(c.ax==='x'){c.x=c.s;c.y=c.lane}else{c.x=c.lane;c.y=c.s}})}

/* ---------- Cilvēki ---------- */
const ZONE_TILES={};
(function(){for(let y=0;y<59;y++)for(let x=0;x<61;x++){const t=grid[gi(x,y)];if(!walkCity(x,y)||t===T.ROAD||t===T.PIER)continue;if(BLDS.some(b=>b.door[0]===x&&b.door[1]===y))continue;const d=distAt(x,y);(ZONE_TILES[d]=ZONE_TILES[d]||[]).push([x,y])}})();
function npcInfo(n){if(n.extra)return {look:n.look,sex:n.sex,person:null};const p=pById(n.pid);if(!p)return {look:randLook('m'),sex:'m',person:null};
  const L=p.cast?p.look:p.look;return {look:L,sex:p.sex,person:p,scale:p.key==='kevin'?.92:1}}
function mkNpc(p,x,y){return {pid:p.id,x,y,path:[],wait:R(0,3),spd:1.2+rnd()*.5,ph:rnd()*6,dir:R(0,3)}}
function zoneTile(z,near){const L=ZONE_TILES[z]||ZONE_TILES.gv;if(near){const cand=L.filter(([x,y])=>Math.abs(x-P.x)+Math.abs(y-P.y)<22);if(cand.length&&rnd()<.75)return pick(cand)}return pick(L)}
function streetPeople(){const h=hourNow();return S.people.filter(p=>p.id!==S.comp&&locOf(p,h)==='street')}
function placeStreet(p){if(p.spot)return [p.spot[0]+.5,p.spot[1]+.5];const t=zoneTile(p.zone,true);return [t[0]+.5,t[1]+.5]}
function spawnCity(){
  NPCS=[];streetPeople().forEach(p=>{const [x,y]=placeStreet(p);NPCS.push(mkNpc(p,x,y))});
  if(S.comp){const p=pById(S.comp);if(p){const t=adjFree(CITY,Math.floor(P.x),Math.floor(P.y))||[Math.floor(P.x),Math.floor(P.y)];COMP_NPC=mkNpc(p,t[0]+.5,t[1]+.5);NPCS.push(COMP_NPC)}}
  spawnExtras();spawnPigeons();
}
function spawnExtras(){EXTRAS=[];let n=distAt(Math.floor(P.x),Math.floor(P.y))==='ts'?26:18;if(S.weather==='rain'||S.weather==='snow')n=Math.round(n*.65);if(NIGHT>.5)n=Math.round(n*.75);
  for(let i=0;i<n;i++){const z=distAt(Math.floor(P.x),Math.floor(P.y));const t=zoneTile(rnd()<.8?z:pick(Object.keys(DISTS)),true);const sex=rnd()<.5?'m':'f';EXTRAS.push({extra:1,look:randLook(sex,S.weather),sex,x:t[0]+.5,y:t[1]+.5,path:[],wait:rnd()*3,spd:1.3+rnd()*.6,ph:rnd()*6,dir:R(0,3)})}}
const PIG_T=[T.PLAZA,T.TSQ,T.PATH,T.WALK,T.PARK,T.PROM];
function pigeonFlock(far){let tries=0;while(tries++<60){const x=Math.floor(P.x)+R(-16,16),y=Math.floor(P.y)+R(-16,16);if(!inB(x,y)||!PIG_T.includes(grid[gi(x,y)])||blockG[gi(x,y)])continue;const d=Math.abs(x-P.x)+Math.abs(y-P.y);if(far&&d<9)continue;
  const n=R(3,6);for(let i=0;i<n;i++)PIGEONS.push({x:x+.2+rnd()*.8,y:y+.2+rnd()*.8,z:0,st:'walk',t:rnd()*2,ph:rnd()*6,fx:rnd()<.5?1:-1,c:pick(['#8e939c','#9aa0aa','#7d828c','#a7a9b0','#6f747e']),vx:0,vy:0});return}}
function spawnPigeons(){PIGEONS=[];if(S.where||hourNow()>=21.5)return;const k=S.weather==='rain'||S.weather==='snow'?2:5;for(let i=0;i<k;i++)pigeonFlock(false)}
function updPigeons(dt){if(S.where)return;let fled=0;
  for(const g of PIGEONS){if(g.st==='walk'){const dp=Math.hypot(g.x-P.x,g.y-P.y);if(dp<1.7||CARS.some(c=>Math.hypot(c.x-g.x,c.y-g.y)<.9)||EXTRAS.some(e=>Math.hypot(e.x-g.x,e.y-g.y)<.5&&rnd()<.02)){g.st='fly';const a=Math.atan2(g.y-P.y,g.x-P.x)+(rnd()-.5);g.vx=Math.cos(a)*(2.5+rnd());g.vy=Math.sin(a)*(2.5+rnd());g.fx=g.vx-g.vy>0?1:-1;continue}
      g.t-=dt;if(g.t<=0){g.t=.4+rnd()*1.6;const nx=g.x+(rnd()-.5)*.6,ny=g.y+(rnd()-.5)*.6;if(inB(Math.floor(nx),Math.floor(ny))&&PIG_T.includes(grid[gi(Math.floor(nx),Math.floor(ny))])){g.fx=(nx-g.x)-(ny-g.y)>0?1:-1;g.x=nx;g.y=ny}}}
    else{g.x+=g.vx*dt;g.y+=g.vy*dt;g.z+=70*dt;if(g.z>170){g.dead=1;fled++}}}
  if(fled){PIGEONS=PIGEONS.filter(g=>!g.dead)}
  if(hourNow()<21.5&&PIGEONS.length<(S.weather==='rain'||S.weather==='snow'?8:22)&&rnd()<dt*.25)pigeonFlock(true);
  PIGEONS=PIGEONS.filter(g=>Math.abs(g.x-P.x)+Math.abs(g.y-P.y)<34)}
function refreshCityNPCs(){
  const h=hourNow(),keep=NPCS.filter(n=>{const p=pById(n.pid);return n===COMP_NPC||n.talking||(p&&locOf(p,h)==='street')});
  const ids=new Set(keep.map(n=>n.pid));NPCS=keep;
  streetPeople().filter(p=>!ids.has(p.id)).forEach(p=>{const b=BLDS.find(x=>x.id===p.sched.find(s=>s.h<=h)?.l)||null;const pos=b?[b.door[0]+.5,b.door[1]+.5]:placeStreet(p);NPCS.push(mkNpc(p,pos[0],pos[1]))});
}
function roomPeople(b){const h=hourNow();return S.people.filter(p=>p.id!==S.comp&&(locOf(p,h)===b.id||(S.where&&S.where.owner===p.id)||(S.where&&S.where.variant==='home'&&p.homeB===b.id&&locOf(p,h)===b.id)))}
function spawnRoom(){
  NPCS=[];EXTRAS=[];const m=ROOM,b=bld(S.where.b);
  m.staffP=[];if(!m.home&&S.where.variant!=='flat'){m.staff.forEach((s,i)=>{const sex=hash(b.seed,i)<.5?'m':'f';const L=randLook(sex);L.top={t:'shirt',c:b.acc};L.bot={t:'pants',c:'#2b2f3a'};L.acc=null;m.staffP.push({x:s.x,y:s.y,look:L,sex,o:s.o})})}
  roomPeople(b).slice(0,10).forEach(p=>{const t=randRoomTile(m);if(t)NPCS.push(Object.assign(mkNpc(p,t[0]+.5,t[1]+.5),{spd:.8}))});
  if(S.comp){const p=pById(S.comp);if(p){const t=adjFree(m,m.exit[0],m.exit[1])||m.exit;COMP_NPC=Object.assign(mkNpc(p,t[0]+.5,t[1]+.5),{spd:1.6});NPCS.push(COMP_NPC)}}
}
function randRoomTile(m){for(let i=0;i<80;i++){const x=R(0,m.W-1),y=R(0,m.H-2);if(m.walk(x,y)&&!(x===m.exit[0]&&y===m.exit[1]))return [x,y]}return null}
function refreshRoomNPCs(){const b=bld(S.where.b),h=hourNow();
  NPCS=NPCS.filter(n=>{if(n===COMP_NPC||n.talking)return true;const p=pById(n.pid);return p&&(locOf(p,h)===b.id||S.where.owner===p.id)});
  const ids=new Set(NPCS.map(n=>n.pid));roomPeople(b).filter(p=>!ids.has(p.id)).slice(0,Math.max(0,10-NPCS.length)).forEach(p=>{NPCS.push(Object.assign(mkNpc(p,ROOM.exit[0]+.5,ROOM.exit[1]+.5),{spd:.8}))});
}
function onHour(){if(!S||!S.c)return;if(S.where)refreshRoomNPCs();else refreshCityNPCs();if(typeof storyHour==='function')storyHour();if(typeof renderHUD==='function')renderHUD()}
function adjFree(m,x,y){for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1],[-1,-1],[1,-1]]){if(m.walk(x+dx,y+dy))return [x+dx,y+dy]}return null}
function wander(n,m,r,maxN){const tx=cl(Math.floor(n.x)+R(-r,r),0,m.W-1),ty=cl(Math.floor(n.y)+R(-r,r),0,m.H-1);
  n.path=(m.walk(tx,ty)&&(S.where||grid[gi(tx,ty)]!==T.ROAD)&&bfs(m,Math.floor(n.x),Math.floor(n.y),tx,ty,maxN))||[]}
function updNPCs(dt){
  const m=curMap();
  for(const n of NPCS){
    if(n.talking){n.dir=dirFrom(P.x-n.x,P.y-n.y);continue}
    if(n===COMP_NPC){if(n.path.length)stepMover(n,dt,n.spd*(S.where?1:1.25));continue}
    if(n.hold)continue;
    const p=pById(n.pid);
    if(!n.path.length){n.wait-=dt;if(n.wait<=0){if(p&&p.spot&&!S.where){n.wait=4+rnd()*6;if(Math.abs(n.x-p.spot[0]-.5)+Math.abs(n.y-p.spot[1]-.5)>2)n.path=bfs(m,Math.floor(n.x),Math.floor(n.y),p.spot[0],p.spot[1],300)||[];else wander(n,m,1,40)}else{wander(n,m,S.where?3:7,S.where?200:900);n.wait=1.5+rnd()*(S.where?6:4)}}}
    else stepMover(n,dt,n.spd);
  }
  if(!S.where)for(const n of EXTRAS){if(!n.path.length){n.wait-=dt;if(n.wait<=0){wander(n,m,8,700);n.wait=.5+rnd()*3}}else stepMover(n,dt,n.spd);
    if(Math.abs(n.x-P.x)+Math.abs(n.y-P.y)>30){const t=zoneTile(distAt(Math.floor(P.x),Math.floor(P.y)),true);n.x=t[0]+.5;n.y=t[1]+.5;n.path=[]}}
}
function stepMover(m,dt,spd){
  if(!m.path.length)return false;
  const [tx,ty]=m.path[0],gx=tx+.5,gy=ty+.5,dx=gx-m.x,dy=gy-m.y,dist=Math.hypot(dx,dy),st=spd*dt;
  if(dist>1e-4)m.dir=dirFrom(dx,dy);m.ph=(m.ph||0)+dt*12;
  if(dist<=st){m.x=gx;m.y=gy;m.path.shift();return true}
  m.x+=dx/dist*st;m.y+=dy/dist*st;return false;
}

/* ---------- Spēlētāja kustība ---------- */
function goTo(tx,ty,target){
  if(P.target&&P.target.type==='npc')P.target.n.hold=false;
  const m=curMap(),sx=Math.floor(P.x),sy=Math.floor(P.y);
  let path=bfs(m,sx,sy,tx,ty);
  if(!path&&target&&target.type==='npc')for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){path=bfs(m,sx,sy,tx+dx,ty+dy);if(path)break}
  if(!path){toast('Ceļš nav atrasts.');return}
  P.path=path;P.target=target;if(target&&target.type==='npc')target.n.hold=true;
  $('#hint').hidden=true;
  if(!path.length)arrive();
}
function goToFoot(fx,fy,fw,fd,target){
  const m=curMap(),cands=[];for(let x=fx-1;x<=fx+fw;x++)for(let y=fy-1;y<=fy+fd;y++){const inside=x>=fx&&x<fx+fw&&y>=fy&&y<fy+fd;if(!inside&&m.walk(x,y)&&(Math.abs(x-(fx+fw/2-.5))+Math.abs(y-(fy+fd/2-.5))<=fw/2+fd/2+1))cands.push([x,y])}
  if(!cands.length){toast('Nevar piekļūt.');return}
  const sx=Math.floor(P.x),sy=Math.floor(P.y);let best=null,bl=1e9;
  for(const [x,y] of cands){const p=bfs(m,sx,sy,x,y);if(p&&p.length<bl){bl=p.length;best=p}}
  if(!best){toast('Ceļš nav atrasts.');return}
  P.path=best;P.target=target;if(!best.length)arrive();
}
function arrive(){
  const t=P.target;P.target=null;if(!t)return;
  if(t.type==='door'){enterBuilding(bld(t.id));return}
  if(t.type==='npc'){const n=t.n;if(Math.hypot(n.x-P.x,n.y-P.y)<2.3){n.talking=true;n.path=[];P.dir=dirFrom(n.x-P.x,n.y-P.y);socialMenu(n)}else n.hold=false;return}
  if(t.type==='obj'){P.dir=dirFrom(t.o.x+.5-P.x,t.o.y+.5-P.y);openObj(t.o);return}
  if(t.type==='furn'){P.dir=dirFrom(t.o.x+t.o.w/2-P.x,t.o.y+t.o.d/2-P.y);openObj(t.o);return}
  if(t.type==='exit'){leaveBuilding();return}
}
function playerStep(dt){
  if(!P.path.length)return;
  const sp=S.where?2.6:3.3;
  const prev=[Math.floor(P.x),Math.floor(P.y)];
  if(stepMover(P,dt,sp)){
    if(!S.where){const d=distAt(Math.floor(P.x),Math.floor(P.y));if(d!==S.lastDist){S.lastDist=d;tick(`📍 ${DISTS[d].n}`,'y');renderHUD();if(typeof storyHour==='function')storyHour()}}
    if(COMP_NPC){const [lx,ly]=prev,m=curMap();if(m.walk(lx,ly))COMP_NPC.path=[[lx,ly]]}
    const t=P.target;
    if(t&&t.type==='npc'&&Math.hypot(t.n.x-P.x,t.n.y-P.y)<1.6){P.path=[];arrive()}
    else if(!P.path.length)arrive();
  }
}

/* ---------- Ievade ---------- */
function screenToWorld(cx,cy){return {x:(cx*DPR-(CW/2-cam.x*K))/K,y:(cy*DPR-(CH/2-cam.y*K))/K}}
function onTap(cx,cy){
  if(!S||!S.c||S.over||$('#modalRoot').innerHTML||MG_ON||S.tab!=='city')return;
  const w=screenToWorld(cx,cy),pt=[w.x,w.y];
  for(let i=HITS.length-1;i>=0;i--){const h=HITS[i];const hit=h.rect?(pt[0]>=h.rect[0]&&pt[0]<=h.rect[0]+h.rect[2]&&pt[1]>=h.rect[1]&&pt[1]<=h.rect[1]+h.rect[3]):inPoly(pt,h.poly);if(!hit)continue;
    if(h.k==='npc'){const n=h.ref;goTo(Math.floor(n.x),Math.floor(n.y),{type:'npc',n});return}
    if(h.k==='bld'){goTo(h.ref.door[0],h.ref.door[1],{type:'door',id:h.ref.id});return}
    if(h.k==='obj'){goToFoot(h.ref.x,h.ref.y,1,1,{type:'obj',o:h.ref});return}
    if(h.k==='furn'){goToFoot(h.ref.x,h.ref.y,h.ref.w,h.ref.d,{type:'furn',o:h.ref});return}
    if(h.k==='exit'){goTo(ROOM.exit[0],ROOM.exit[1],{type:'exit'});return}
  }
  const tx=Math.floor((w.x/HW+w.y/HH)/2),ty=Math.floor((w.y/HH-w.x/HW)/2),m=curMap();
  if(m.walk(tx,ty)){const door=!S.where&&BLDS.find(b=>b.door[0]===tx&&b.door[1]===ty);goTo(tx,ty,door?{type:'door',id:door.id}:(S.where&&tx===ROOM.exit[0]&&ty===ROOM.exit[1]?{type:'exit'}:null));TARGET.x=tx;TARGET.y=ty;TARGET.t=1}
  else toast('Tur nevar aiziet.');
}
let pinch=null;
cv.addEventListener('click',e=>onTap(e.clientX,e.clientY));
cv.addEventListener('wheel',e=>{e.preventDefault();setZoom(ZOOM*(e.deltaY>0?.9:1.1))},{passive:false});
cv.addEventListener('touchstart',e=>{if(e.touches.length===2){const [a,b]=e.touches;pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z:ZOOM}}},{passive:true});
cv.addEventListener('touchmove',e=>{if(pinch&&e.touches.length===2){const [a,b]=e.touches;setZoom(pinch.z*Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/pinch.d)}},{passive:true});
cv.addEventListener('touchend',()=>{pinch=null},{passive:true});
function setZoom(z){ZOOM=cl(z,.45,2.2);K=DPR*ZOOM;tileCache={}}
const KEYS={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};let keyDir=null;
document.addEventListener('keydown',e=>{if(!S||S.tab!=='city'||MG_ON||$('#modalRoot').innerHTML||e.target.tagName==='INPUT')return;if(KEYS[e.key]){keyDir=KEYS[e.key];e.preventDefault()}});
document.addEventListener('keyup',e=>{if(KEYS[e.key])keyDir=null});

/* ---------- Ēkas ---------- */
function isOpen(b){const h=hourNow();return h>=b.hours[0]&&h<b.hours[1]}
function enterBuilding(b){
  const c=C();if(S.over)return;
  if(HOMES[c.home].b===b.id){doEnter(b,'home');return}
  if(RES.includes(b.type)){
    const h=hourNow(),res=S.people.filter(p=>p.homeB===b.id&&p.met&&!(p.key==='lucy'&&S.flags.roommate&&b.id!=='home'));
    const ch=res.map(p=>({l:`Zvanīt pie durvīm: ${p.first}`,s:relLabel(p),fn:()=>{if(locOf(p,h)===b.id&&(p.f>=35||p.steady||p.fam)){doEnter(b,'flat',p.id);toast(`${p.first} atver durvis.`)}else toast(locOf(p,h)===b.id?`${p.first} tevi neielaiž.`:'Neviens neatver durvis.')}}));
    const hi=HOMES.findIndex(x=>x.b===b.id);
    if(hi>0)ch.push({l:'Brīvs dzīvoklis',s:`${HOMES[hi].n} · ${usd(HOMES[hi].rent)}/nedēļā · īrē aģentūrā „Nekustamie īpašumi” Volstrītā`,fn:()=>{}});
    ch.push({l:'Ieiet kāpņu telpā',fn:()=>doEnter(b,'lobby')});
    ch.push({l:'Atpakaļ',exit:true});modal({t:b.n,sub:`Dzīvojamā ēka · ${DISTS[b.dist].n}`,b:res.length?'':'<p class="muted">Tu nepazīsti nevienu, kas šeit dzīvo.</p>',ch});return}
  if(!isOpen(b)){toast(`${b.n} ir slēgts. Darba laiks ${hstr(b.hours[0])}–${hstr(b.hours[1])}.`);return}
  if(b.type==='club'){const pr=pByKey('promoter');if(effBeauty()<15&&!(pr&&pr.f>=35)&&!(c.job&&jobDef().b.includes('club'))){modal({t:'Sejas kontrole',b:`<p>Apsargs paskatās uz tevi no galvas līdz kājām: „Šodien tikai pēc ielūgumiem.” <span class="muted">(Vajag skaistumu 15 vai pazīšanos ar promouteri Džeiku.)</span></p>`,ch:[{l:'Iedot apsargam $20',s:'Varbūt tas palīdzēs…',fn:()=>{if(c.money<20)return toast('Nepietiek naudas.');c.money-=20;doEnter(b);toast('Apsargs pamāj ar galvu.')}},{l:'Atkāpties',exit:true}]});return}}
  doEnter(b);
}
function doEnter(b,variant,owner){
  S.where={b:b.id,variant:variant||null,owner:owner||null};
  ROOM=makeRoom(b,variant);
  P.x=ROOM.exit[0]+.5;P.y=ROOM.exit[1]+.5;P.path=[];P.target=null;P.dir=2;
  spawnRoom();cam.init=false;
  S.quests.forEach(q=>{if(q.done)return;if(q.type==='deliver'&&q.b===b.id&&C().inv.paka)completeQuest(q,'Paciņa nodota');
    if(q.type==='meet'&&q.b===b.id&&NPCS.some(n=>n.pid===q.giver))completeQuest(q,'Tikšanās notikusi')});
  const waiting=NPCS.filter(n=>{const p=pById(n.pid);return p&&p.appt&&p.appt.day===S.day&&p.appt.b===b.id&&!p.appt.met});
  if(waiting.length){const p=pById(waiting[0].pid);p.appt.met=true;toast(p.appt.date?`${p.first} jau gaida tevi! Pieskaries, lai sāktu randiņu.`:`${p.first} jau gaida tevi!`)}
  if(typeof storyEnter==='function')storyEnter(b);
  refreshUI();save();
}
function leaveBuilding(){
  const b=bld(S.where.b);S.where=null;ROOM=null;
  P.x=b.door[0]+.5;P.y=b.door[1]+.5;P.path=[];P.target=null;P.dir=b.side==='y'?0:1;
  spawnCity();cam.init=false;refreshUI();save();
}
function afterNewDay(where){
  dismissComp(true);
  if(where==='home'||!where){const b=bld(HOMES[C().home].b);doEnter(b,'home');const bd=ROOM.furn[0];P.x=bd.x+bd.w+.5;P.y=bd.y+1.5;if(!ROOM.walk(Math.floor(P.x),Math.floor(P.y))){P.x=ROOM.exit[0]+.5;P.y=ROOM.exit[1]+.5}}
  else if(where==='hotel'){doEnter(bld('plaza'))}
  else{S.where=null;ROOM=null;P.x=Math.floor(P.x)+.5;P.y=Math.floor(P.y)+.5;spawnCity()}
  const left=LEASE_DAYS-S.day;tick(S.extended?`☀ ${S.day}. diena Ņujorkā`:`☀ ${S.day}. diena · līdz īres līguma beigām ${left} ${left===1?'diena':'dienas'}`,'y');
  tick(`${WX[S.weather].i} Laikapstākļi: ${WX[S.weather].n.toLowerCase()}${S.weather==='rain'||S.weather==='snow'?(C().inv.lietussargs?' — lietussargs ir līdzi':' — noderētu lietussargs (bodegā $8)'):''}`,'');
  if(S.day%7===0||S.day%7===6)tick(`🏠 Īres diena: ${S.day%7===0?'šodien':'rīt'} (${usd(rentDue())})`,'b');
  refreshUI();
}
function endDayPrompt(){
  if(!S||!S.c||S.over||$('#modalRoot').innerHTML)return;const c=C();
  const home=S.where&&S.where.variant==='home';
  if(home){modal({t:'Iet gulēt?',b:`<p>Diena beidzas. Rīt ir ${S.day+1}. diena no ${LEASE_DAYS}.</p>`,ch:[{l:'Gulēt līdz rītam',fn:()=>endDay('home')},{l:'Vēl ne',exit:true}]});return}
  const hb=bld(HOMES[c.home].b),dist=Math.abs(hb.door[0]-curPos()[0])+Math.abs(hb.door[1]-curPos()[1]),fare=Math.round(5+dist*.35);
  modal({t:'Beigt dienu?',b:'<p>Tu neesi mājās. Gulēšana uz soliņa kaitē veselībai un higiēnai.</p>',ch:[
    {l:'Taksometrs uz mājām',s:`${usd(fare)} · 15 min`,fn:()=>{if(c.money<fare)return toast('Nepietiek naudas.');c.money-=fare;advance(15);if(S.where){S.where=null;ROOM=null}doEnter(hb,'home');endDayPrompt()}},
    {l:'Gulēt uz soliņa',fn:()=>endDay('bench')},{l:'Turpināt dienu',exit:true}]});
}
function curPos(){return S.where?bld(S.where.b).door:[P.x,P.y]}

/* ---------- Pavadonis ---------- */
function setComp(p){S.comp=p.id;const n=NPCS.find(x=>x.pid===p.id);if(n){COMP_NPC=n;n.hold=false;n.talking=false;n.spd=S.where?1.6:3.3}log(`${p.first} pavada tevi.`,'g')}
function dismissComp(silent){if(!S.comp)return;const p=pById(S.comp);S.comp=null;if(COMP_NPC){COMP_NPC.path=[];COMP_NPC=null}if(p&&!silent)toast(`${p.first} dodas savās gaitās.`)}
function compP(){return S.comp?pById(S.comp):null}

/* ---------- Darbs ---------- */
function reqWhy(req){const c=C();for(const k in req){if(stat(k)<req[k])return `vajag ${STN[k].toLowerCase()} ${req[k]} (tev ${Math.floor(stat(k))})`}return null}
function jobItems(b){
  const c=C(),out=[],h=hourNow();
  JOBS.filter(j=>j.b.includes(b.id)).forEach(j=>{
    if(c.job&&c.job.id===j.id){
      const inH=h>=j.hours[0]&&h<=j.hours[1]-4;
      out.push({l:'Strādāt maiņu',s:`${j.lv[c.job.lvl]} · maiņa 4 h · sākums ${hstr(j.hours[0])}–${hstr(j.hours[1]-4)} · pieredze ${Math.round(c.job.xp*10)/10}/${c.job.lvl===0?4:c.job.lvl===1?8:'—'}`,t:0,m:true,
        lock:c.job.worked?'Šodien jau strādāji':!inH?`Maiņu var sākt ${hstr(j.hours[0])}–${hstr(j.hours[1]-4)}`:c.needs.energy<15?'Pārāk noguris — izguļies':null,fn:()=>workShift(j)});
      out.push({l:'Atkāpties no darba',t:0,fn:()=>{c.job=null;return 'Tu iesniedz atlūgumu.'}});
    } else {
      const intro=j.intro&&!S.flags['intro_'+j.id]?pByKey(j.intro):null;
      const why=reqWhy(j.req)||(intro?`vajag ieteikumu no ${intro.first} (draudzība 35)`:null);
      out.push({l:`Pieteikties: ${j.n}`,s:`${usd(j.pay[0])} par maiņu · ${j.d}${c.job?' · aizstās pašreizējo darbu':''}`,t:20,lock:why,fn:()=>{c.job={id:j.id,b:b.id,lvl:0,xp:0,missed:0,worked:false};log(`Jauns darbs: ${j.lv[0]} (${b.n})`,'g');checkTrophies();return `Tu esi pieņemts darbā: ${j.lv[0]}! Nāc uz maiņu ${hstr(j.hours[0])}–${hstr(j.hours[1]-4)}.`}});
    }
  });
  return out;
}
function workShift(j){
  const c=C();if(S.min+240>DAY_MIN){toast('Maiņai šodien vairs nepietiek laika.');return}
  startMinigame(j.mg,c.job.lvl,score=>{
    const base=j.pay[c.job.lvl],pay=Math.round(base*(.45+score*.85));let tips=0;
    if(['barista','waiter'].includes(j.id))tips=Math.round(score*R(10,35)+stat('beauty')/6);
    c.money+=pay+tips;c.job.worked=true;c.job.missed=0;S.flags.shifts=(S.flags.shifts||0)+1;c.job.xp+=score;
    advance(240);need('energy',-10);need('hygiene',-12);
    let msg=`Maiņa beigusies: +${usd(pay)}${tips?` + ${usd(tips)} dzeramnauda`:''}.`;
    if((c.job.lvl===0&&c.job.xp>=4)||(c.job.lvl===1&&c.job.xp>=8)){c.job.lvl++;msg+=` Paaugstinājums! Tagad tu esi ${j.lv[c.job.lvl]}.`;log(`Paaugstinājums: ${j.lv[c.job.lvl]}!`,'g');addFame(2)}
    if(score<.3)msg+=' Priekšnieks nav apmierināts.';
    log(msg,'g');toast(msg);checkTrophies();if(typeof storyHour==='function')storyHour();refreshUI();save();
  });
}

/* ---------- Darbības ---------- */
function I(l,s,t,cost,fn,lock,opt){return Object.assign({l,s,t,cost,fn,lock},opt||{})}
function M_(l,s,fn,lock){return {l,s,t:0,fn,lock,m:true}}
const night=()=>hourNow()>=22;
const withComp=(l,s,t,cost,fn,lock)=>{const p=compP();return p?[I(`${l} (kopā ar ${nAcc(p.first)})`,s,t,cost,()=>fn(p),lock)]:[]};
const bond=(p,f_,r_)=>{p.f=cl(p.f+f_*socialMul(),0,FMAX);if(!p.noRom&&!p.fam&&r_)p.rom=cl(p.rom+r_*socialMul(),0,FMAX);p.lastSeen=S.day};
function eat(v){need('food',v)}
function addInv(k,n=1){const i=C().inv;i[k]=(i[k]||0)+n}
function fxs(o){return Object.entries(o).map(([k,v])=>(v>0?'+':'')+v+' '+(STN[k]||k).toLowerCase()).join(', ')}
function act(l,t,cost,eff,extra,lock,msg){return I(l,[fxs(eff),extra].filter(Boolean).join(' · '),t,cost,()=>{for(const k in eff)addSt(k,eff[k]);if(typeof msg==='function')return msg();return msg||'Darīts!'},lock)}
const wc=()=>[I('Izmantot tualeti','Tualete 100%',5,0,()=>{need('bladder',100);return 'Atvieglojums!'})];
const ACT={
  wc:b=>wc(),
  shower:b=>[I('Iet dušā','Higiēna 100%',20,0,()=>{need('hygiene',100);return 'Svaigs kā rasa!'})],
  cafe:b=>[I('Kafija','+30 miegs, −20 tualete',10,4,()=>{need('energy',30);need('bladder',-20);return 'Stipra, karsta kafija.'}),I('Kafija līdzņemšanai','Somā',2,4,()=>{addInv('kafija');return 'Kafija ir līdzi.'}),
    I('Mellenu mafins','+20 sāta',10,5,()=>{eat(20);return 'Mmm!'}),I('Nopirkt avīzi','Somā',1,1,()=>{addInv('avize');return 'Svaiga „New York Daily”.'}),...jobItems(b)],
  cafeTable:b=>[act('Lasīt avīzi',30,0,{culture:3},C().inv.avize?'izlieto avīzi':'',!C().inv.avize?'Vajag avīzi ($1 pie letes)':null,()=>{C().inv.avize--;return 'Tu uzzini jaunāko pilsētā.'}),...withComp('Kafija un saruna','+draudzība',30,8,p=>{bond(p,8,3);need('energy',15);return `Jauka saruna ar ${nAcc(p.first)}.`})],
  deli:b=>[I('Pārtikas grozs','+4 maltītes ledusskapī',10,28,()=>{C().fridge+=4;return 'Ledusskapis būs pilns.'}),I('Sviestmaize','Somā',2,6,()=>{addInv('sviestmaize');return 'Ar pastrami!'}),I('Hotdogs','Somā',2,3,()=>{addInv('hotdog');return 'Ar sinepēm.'}),I('Avīze','Somā',1,1,()=>{addInv('avize');return 'Svaiga avīze.'}),I('Lietussargs','Sargā no lietus un sniega',2,8,()=>{addInv('lietussargs');return 'Tagad lietus nav biedējošs!'},C().inv.lietussargs?'Tev jau ir':null),I('Bodegas kafija','+20 miegs',5,2,()=>{need('energy',20);need('bladder',-15);return 'Rūgta, bet stipra.'})],
  grocery:b=>ACT.deli(b),
  pizza:b=>[act('Picas šķēle',60,7,{health:5,beauty:-1},'+50 sāta',null,()=>{eat(50);return 'Ņujorkas pica — plāna un milzīga!'}),I('Pica līdzņemšanai','+2 maltītes ledusskapī',10,15,()=>{C().fridge+=2;return 'Kaste zem paduses.'})],
  pizzaTable:b=>[act('Picas šķēle',60,7,{health:5,beauty:-1},'+50 sāta',null,()=>{eat(50);return 'Gardi!'}),...withComp('Pica kopā','+draudzība',60,14,p=>{eat(50);bond(p,8,3);return 'Jūs smejaties par siera stīgām.'})],
  diner:b=>[act('Burgers un frī',45,9,{health:-1,humor:1},'+55 sāta',null,()=>{eat(55);return 'Klasiskā amerikāņu ēstuve!'}),I('Kafija un ābolu pīrāgs','+20 sāta, +15 miegs',30,5,()=>{eat(20);need('energy',15);need('bladder',-10);return 'Kā mājās.'})],
  dinerTable:b=>[...ACT.diner(b),...withComp('Piena kokteilis divatā','+romantika',30,8,p=>{bond(p,5,8);return 'Divi salmiņi, viena glāze.'})],
  dimsum:b=>[I('Pelmeņi līdzņemšanai','+1 maltīte ledusskapī',10,8,()=>{C().fridge++;return 'Karsti pelmeņi.'}),...jobItems(b)],
  dimsumTable:b=>[act('Dim sum pusdienas',60,18,{health:2,culture:1},'+50 sāta',null,()=>{eat(50);return 'Garneļu pelmeņi kūp tvaikā.'}),...withComp('Pusdienas kopā','+draudzība',60,30,p=>{eat(50);bond(p,8,4);return 'Jūs mācāties ēst ar irbulīšiem.'})],
  seaportBar:b=>[act('Glāze vīna ar skatu uz upi',30,14,{culture:1,humor:1},'',null,'Bruklinas tilts mirdz.'),...jobItems(b)],
  seaportTable:b=>[act('Jūras velšu vakariņas',90,45,{culture:2,beauty:1},'+60 sāta',null,()=>{eat(60);return 'Omārs un skats uz ostu.'})],
  pub:b=>[act('Iedzert pie bāra',90,34,{humor:8},'−20 tualete',null,()=>{need('bladder',-20);return pick(['Bārmenis izstāsta anekdoti.','Tu iepazīsti visu bāru.','Vēl vienu!'])}),I('Alus kauss','+2 humors, −15 tualete',30,6,()=>{addSt('humor',2);need('bladder',-15);return 'Atspirdzinoši.'}),...withComp('Uzsaukt dzērienu','+draudzība',30,12,p=>{bond(p,7,4);return `${p.first} paceļ glāzi.`})],
  pubTable:b=>[act('Tērzēt ar vietējiem',30,0,{humor:2},'',null,'Tu uzzini, kurš kuru satiek.')],
  pool:b=>[act('Spēlēt biljardu',30,3,{humor:1,culture:1},'',null,()=>rnd()<.5?'Tu uzvari!':'Šoreiz zaudējums.'),...withComp('Biljards kopā','+draudzība',30,3,p=>{bond(p,8,2);return 'Jautra partija.'})],
  comedyTable:b=>[act('Skatīties stand-up šovu',90,25,{humor:8},'',null,'Tu smejies līdz asarām.'),...withComp('Šovs kopā','+draudzība',90,50,p=>{addSt('humor',6);bond(p,9,4);return 'Jūs abi smejaties.'})],
  comedyStage:b=>[I('Uzstāties atvērtajā mikrofonā','Humora pārbaude · +slava',60,0,()=>{const c=C();if(rnd()<.2+c.st.humor/110){addSt('humor',3);addFame(3);return 'Zāle smejas un aplaudē! Tevi atpazīst.'}addSt('humor',1);addFame(-1);return 'Klusums… Kāds klepo. Bet tu kaut ko iemācījies.'},C().st.humor<20?'Vajag humoru 20':null)],
  bar:b=>[act('Kokteilis',30,12,{humor:3},'−10 tualete',null,()=>{need('bladder',-10);return 'Kosmopolitans!'}),...withComp('Uzsaukt dzērienu','+romantika',20,12,p=>{bond(p,5,7);return `${p.first} pasmaida.`})],
  gallery:b=>[act('Aplūkot mākslu',45,0,{culture:4},'',null,'Iedvesmojoši.'),...withComp('Izstāde kopā','+draudzība',45,0,p=>{addSt('culture',3);bond(p,6,5);return 'Jūs apspriežat gleznas.'})],
  galleryDesk:b=>[I('Nopirkt gleznu','$150 · mājām · +popularitāte',10,150,()=>{C().furn.art='paint1';return 'Glezna nosūtīta uz mājām.'},C().furn.art?'Gleznas vieta jau aizņemta':null),I('Nopirkt oriģinālu','$2800 · +5 popularitāte',10,2800,()=>{C().furn.art='paint2';return 'Oriģināls darbs tavās mājās!'},C().furn.art==='paint2'?'Jau pieder':null)],
  records:b=>[I('Nopirkt mūzikas albumu','Dāvana · patīk mūzikas mīļotājiem',5,15,()=>{addInv('cd');return 'Albums somā.'}),I('Nopirkt filmas DVD','Dāvana · patīk kino mīļotājiem',5,20,()=>{addInv('dvd');return 'DVD somā.'})],
  recordsDesk:b=>ACT.records(b),
  listen:b=>[act('Klausīties plates',30,0,{culture:1,humor:1},'',null,'Vecais labais roks.')],
  treadmill:b=>[act('Skriet uz skrejceliņa',60,10,{health:4},'−15 higiēna, −12 miegs',C().needs.energy<15?'Pārāk noguris':null,()=>{need('hygiene',-15);need('energy',-12);return 'Sviedri līst!'})],
  weights:b=>[act('Svarcelšana',60,10,{strength:4,beauty:1},'−15 higiēna, −12 miegs',C().needs.energy<15?'Pārāk noguris':null,()=>{need('hygiene',-15);need('energy',-12);return 'Muskuļi aug!'})],
  yoga:b=>[act('Joga',45,10,{health:2,beauty:2},'+5 miegs',null,()=>{need('energy',5);return 'Prāts ir mierīgs.'})],
  gymDesk:b=>[I('Proteīna kokteilis','+15 sāta, +1 spēks',5,5,()=>{eat(15);addSt('strength',1);return 'Banānu garša.'})],
  kungfu:b=>[act('Kung-fu nodarbība',90,25,{strength:5,health:2},'−20 higiēna, −15 miegs',C().needs.energy<15?'Pārāk noguris':null,()=>{need('hygiene',-20);need('energy',-15);return 'Meistars Vongs ir apmierināts.'})],
  kfDesk:b=>ACT.kungfu(b),
  massage:b=>[act('Masāža',60,60,{health:2,beauty:1},'+30 miegs',null,()=>{need('energy',30);return 'Tu gandrīz aizmiegi.'})],
  massageDesk:b=>ACT.massage(b),
  karaoke:b=>[I('Dziedāt karaoke','Humora pārbaude',30,5,()=>{if(rnd()<.3+C().st.humor/140){addSt('humor',3);addFame(1);return 'Zāle dzied līdzi!'}addSt('humor',1);return 'Tu aizmirsi vārdus, bet visi smējās.'}),...withComp('Duets','+romantika',30,10,p=>{bond(p,7,8);return 'Jūsu duets ir šova zvaigzne!'})],
  tea:b=>[act('Tējas ceremonija',45,12,{culture:3},'+10 miegs',null,()=>{need('energy',10);return 'Jasmīns un klusums.'}),...withComp('Tēja divatā','+draudzība',45,24,p=>{bond(p,7,5);return 'Mierīga saruna.'})],
  teaDesk:b=>ACT.tea(b),
  market:b=>[I('Plīša lācītis','Dāvana · $10',3,10,()=>{addInv('lacis');return 'Panda!'}),I('Ceļvedis pa pasauli','Dāvana · $15',3,15,()=>{addInv('celvedis');return 'Ceļvedis somā.'}),I('Šokolādes konfektes','Dāvana · $8',3,8,()=>{addInv('sokolade');return 'Konfektes somā.'})],
  marketFruit:b=>[I('Augļi','+20 sāta, +1 veselība',5,4,()=>{eat(20);addSt('health',1);return 'Liči un mango.'})],
  pawn:b=>{const c=C(),gifts=Object.keys(c.inv).filter(k=>c.inv[k]>0&&ITEMS[k].gift);return [...gifts.map(k=>I(`Pārdot: ${ITEMS[k].n}`,`saņemsi ${usd(Math.floor(ITEMS[k].p*.4))}`,5,0,()=>{c.inv[k]--;c.money+=Math.floor(ITEMS[k].p*.4);return 'Darījums noslēgts.'})),
    I('„Lēta” zelta kaklarota','Dāvana · +2 noziedzīgums (zagta?)',5,150,()=>{addInv('rota');addSt('crime',2);return 'Nejautā, no kurienes.'})]},
  bank:b=>[I('Pieprasīt pārvedumu no vecākiem','Reizi 10 dienās',10,0,()=>momMoney(),momLock())],
  nyse:b=>jobItems(b),
  nyseInfo:b=>[act('Ekskursija biržā',45,15,{culture:4},'',null,'Tu redzi tirdzniecības zāli.'),...jobItems(b)],
  officeDesk:b=>jobItems(b),officeJobs:b=>jobItems(b),
  realestate:b=>[M_('Mājokļu piedāvājumi','Īrēt citu dzīvokli',()=>homeModal())],
  hotel:b=>[I('Īrēt numuru un gulēt','Diena beidzas',0,250,()=>{setTimeout(()=>endDay('hotel'),30);return 'Numurs ar skatu uz Centrālparku.'})],
  hotelTea:b=>[act('Pēcpusdienas tēja „Plaza”',45,35,{culture:3,beauty:1},'',null,'Ļoti smalki.')],
  plazaBar:b=>[act('Martini',30,18,{humor:2,culture:1},'',null,'Sakratīts, nevis samaisīts.'),...withComp('Martini divatā','+romantika',30,36,p=>{bond(p,6,9);return 'Džezs un sveču gaisma.'})],
  opera:b=>[act('Opera un balets',180,150,{culture:12,beauty:-1},'',null,'Brāvo! Brāvo!')],
  play:b=>[act('Brodvejas izrāde',150,90,{culture:8,beauty:-1},'',null,'Mūzikls ir lielisks!')],
  snacks:b=>[I('Popkorns','+15 sāta',5,5,()=>{eat(15);return 'Sāļš popkorns.'}),...wc()],
  movie:b=>[act('Skatīties filmu',120,14,{culture:3,humor:3},'',null,()=>pick(['Asa sižeta grāvējs!','Romantiska komēdija.','Šausmene — brr!']))],
  dance:b=>[M_('Dejot','Deju minispēle · +humors, +slava',()=>freeDance(b,null)),...(compP()?[M_(`Dejot kopā ar ${nAcc(compP().first)}`,'+romantika',()=>freeDance(b,compP()))]:[])],
  dj:b=>[I('Palūgt dziesmu','+1 humors',5,0,()=>{addSt('humor',1);return 'DJ uzliek tavu mīļāko dziesmu!'})],
  clubDesk:b=>jobItems(b),
  arcade:b=>[act('Spēlēt videospēles',60,8,{humor:night()?6:3},night()?'vēlā nakts — dubults humors':'pēc 22:00 humors aug ātrāk',null,'Jauns rekords!'),...withComp('Spēlēt kopā','+draudzība',60,16,p=>{bond(p,8,2);return 'Kurš uzvarēja? Strīdīgi.'})],
  arcadeDesk:b=>[I('Nopirkt videospēli','Dāvana · $50',5,50,()=>{addInv('spele');return 'Jaunākā spēle somā.'}),I('Basketbola bumba','Dāvana · $30',5,30,()=>{addInv('bumba');return 'Bumba somā.'})],
  view:b=>[act('Skatīties uz Manhetenu',45,25,{culture:5},'',null,()=>NIGHT>.3?'Pilsēta mirdz kā zvaigžņu jūra.':'Redzams līdz pat Brīvības statujai!')],
  empireShop:b=>[I('Ceļvedis pa pasauli','Dāvana',5,25,()=>{addInv('celvedis');return 'Ceļvedis somā.'})],
  boathouse:b=>[act('Airēt laivu pa ezeru',60,15,{health:3,humor:1},'',null,'Pīles peld līdzās.')],
  clothes:b=>[M_('Apskatīt apģērbus','Butiks',()=>shopClothes(false))],
  luxe:b=>[M_('Dizaineru kolekcija','Dārgi, bet stilīgi',()=>shopClothes(true))],
  mirror:b=>[M_('Pārģērbties','Garderobe',()=>wardrobeModal())],
  shopCounter:b=>[],
  gifts:b=>[M_('Dāvanu nodaļa','Šokolāde, lāči, rotas…',()=>giftShop(['sokolade','lacis','vins','rota','zurnals'])),M_('Mājai: mēbeles un tehnika','Komforts un popularitāte',()=>furnShop())],
  perfume:b=>[I('Smaržas','Dāvana · patīk modes mīļotājiem',5,85,()=>{addInv('smarzas');return 'Smaržas somā.'})],
  jewel:b=>[I('Zelta kaklarota','Dāvana · ļoti romantiska',5,400,()=>{addInv('rota');return 'Mirdz!'})],
  hair:b=>[M_('Frizūra','Mainīt matus',()=>hairModal())],
  salon:b=>[act('Manikīrs',45,40,{beauty:3},'',null,'Nevainojami nagi.'),act('Sejas procedūra',60,90,{beauty:5},'',null,'Āda mirdz.'),M_('Frizūra','Mainīt matus',()=>hairModal())],
  tan:b=>[act('Iedegums solārijā',20,30,{beauty:3},'',null,'Tu izskaties pēc Maiami!')],
  flowers:b=>[I('Rožu pušķis','Dāvana · romantiska',5,25,()=>{addInv('ziedi');return 'Rozes ietītas papīrā.'}),I('Plīša lācītis','Dāvana',5,18,()=>{addInv('lacis');return 'Mīksts lācītis.'}),I('Šokolādes konfektes','Dāvana',5,12,()=>{addInv('sokolade');return 'Konfektes somā.'})],
  art:b=>[act('Apskatīt izstādi',90,25,{culture:6},'',null,'Van Gogs, Monē, Rembrants…'),...withComp('Muzejs kopā','+draudzība',90,50,p=>{addSt('culture',5);bond(p,8,5);return 'Jūs apspriežat impresionistus.'})],
  museumDesk:b=>[act('Gida ekskursija',120,40,{culture:9},'',null,'Gids zina visu par ēģiptiešu kapenēm.')],
  police:b=>{const c=C();return [I('Samaksāt sodu par pārkāpumiem','−10 noziedzīgums',20,100,()=>{addSt('crime',-10);return 'Tava kartīte ir tīrāka.'},c.st.crime<5?'Tev nav pārkāpumu':null)]},
  jazzStage:b=>[act('Klausīties džeza grupu',60,20,{culture:3,humor:2},'',null,'Saksofons raud.')],
  jazzTable:b=>[...ACT.jazzStage(b),...withComp('Džezs divatā','+romantika',60,40,p=>{bond(p,6,9);return 'Lēna melodija tikai jums.'})],
  mail:b=>[I('Pārbaudīt pastkastīti','',2,0,()=>{if(S.mailDay===S.day)return 'Pastkastīte tukša.';S.mailDay=S.day;if(rnd()<.3){C().money+=20;return 'Atrasts kupons: +$20'}return pick(['Reklāmas buklets.','Rēķins par elektrību (Edgars samaksāja).','Vēstule no mammas Latvijā!'])})],
  elevator:b=>{const h=hourNow(),res=S.people.filter(p=>p.homeB===b.id&&p.met);return res.length?res.map(p=>I(`Uz ${nGen(p.first)} dzīvokli`,relLabel(p),2,0,()=>{if(locOf(p,h)===b.id&&(p.f>=35||p.steady)){setTimeout(()=>doEnter(b,'flat',p.id),20);return `${p.first} atver durvis.`}return 'Neviens neatver.'})):[I('Braukt ar liftu','Tu nevienu šeit nepazīsti',2,0,()=>'Lifts aizved līdz augšai un atpakaļ.')]},
  visit:b=>{const p=pById(S.where.owner);if(!p)return [];return [I(`Ciemoties pie ${nGen(p.first)}`,'+draudzība',60,0,()=>{bond(p,8,3);return 'Jauks vakars ciemos.'}),
    ...(p.steady||p.rom>=80?[I('Palikt pa nakti','Diena beidzas · +romantika',0,0,()=>{bond(p,4,10);setTimeout(()=>endDay('friend'),30);return 'Labu nakti.'},hourNow()<20?'Pēc 20:00':null)]:[])]},
  bed:b=>{const sp=compP();return [I('Gulēt līdz rītam','Diena beidzas',0,0,()=>{setTimeout(()=>endDay('home'),30);return 'Labu nakti!'},hourNow()<19&&C().needs.energy>30?'Vēl par agru (pēc 19:00 vai ja ļoti noguris)':null),I('Pasnaust','+20 miegs',60,0,()=>{need('energy',20);return 'Īss miegs palīdz.'}),
    ...(sp&&(sp.steady||sp.rom>=80)?[I(`Romantisks vakars ar ${nAcc(sp.first)}`,'+romantika · diena beidzas',60,0,()=>{bond(sp,5,14);setTimeout(()=>endDay('home'),30);return 'Svečes, mūzika…'},hourNow()<20?'Pēc 20:00':null)]:[])]},
  wardrobe:b=>[M_('Pārģērbties','Garderobe',()=>wardrobeModal())],
  fridge:b=>{const c=C();return [I('Ēst','+45 sāta',20,0,()=>{c.fridge--;eat(45);return 'Mājas maltīte.'},c.fridge<=0?'Ledusskapis tukšs — iepērcies bodegā':null),...withComp('Pagatavot vakariņas','+romantika',60,0,p=>{c.fridge-=2;eat(50);bond(p,8,10);return 'Svecītes un mājas vakariņas.'},c.fridge<2?'Vajag 2 maltītes':null)]},
  dumbbell:b=>[act('Trenēties ar hantelēm',30,0,{strength:2},'−8 higiēna, −8 miegs',C().needs.energy<12?'Pārāk noguris':null,()=>{need('hygiene',-8);need('energy',-8);return 'Viens, divi, trīs…'})],
  homeSofa:b=>[I('Atpūsties','+10 miegs',30,0,()=>{need('energy',10);return 'Tu atslābsti.'}),...withComp('Apskāvieni uz dīvāna','+romantika',30,0,p=>{bond(p,4,10);return 'Silti un mājīgi.'})],
  homeTv:b=>[act('Skatīties ziņas',30,0,{culture:2},'',null,'Mērs sola labot metro.'),act('Skatīties komēdiju šovu',30,0,{humor:2},'',null,'Hahaha!')],
  homeConsole:b=>[act('Spēlēt videospēles',60,0,{humor:night()?4:2},night()?'vēlā nakts':'',null,'Vēl tikai viens līmenis…'),...withComp('Spēlēt kopā','+draudzība',60,0,p=>{bond(p,8,2);return 'Jautri!'})],
  homeStereo:b=>[act('Klausīties mūziku',30,0,{humor:1,culture:1},'',null,'Mīļākā dziesma.'),...withComp('Lēnā deja','+romantika',20,0,p=>{bond(p,4,10);return 'Jūs dejojat istabas vidū.'})],
  homeAqua:b=>[I('Vērot zivtiņas','+5 miegs',15,0,()=>{need('energy',5);return 'Nomierinoši.'})],
  homeDesk:b=>[act('Lasīt grāmatu',60,0,{culture:3},'',null,'Hemingvejs.'),...(C().inv.avize?[act('Lasīt avīzi',20,0,{culture:2},'',null,()=>{C().inv.avize--;return 'Biržā atkal svārstības.'})]:[])],
  piano:b=>[act('Spēlēt klavieres',30,0,{culture:2,humor:1},'',null,'Skaista melodija.')],
  swim:b=>[act('Peldēt baseinā',40,0,{health:3},'+higiēna',null,()=>{need('hygiene',30);return 'Atsvaidzinoši!'})],
  fountain:o=>[I('Iemest monētu','Ievēlēties…',2,1,()=>{if(rnd()<.15){C().money+=20;return 'Tu atrodi $20 pie strūklakas malas!'}return 'Vēlēšanās ir izteikta.'})],
  bench:o=>[I('Atpūsties','+8 miegs',20,0,()=>{need('energy',8);return 'Tu vēro garāmgājējus.'}),I('Gulēt uz soliņa','Diena beidzas (slikti)',0,0,()=>{setTimeout(()=>endDay('bench'),30);return 'Zvaigznes virs Ņujorkas…'},hourNow()<21?'Pēc 21:00':null)],
  cart:o=>[I('Hotdogs','+25 sāta · $3',5,3,()=>{eat(25);return 'Ar sinepēm un sīpoliem!'}),I('Hotdogs līdzņemšanai','Somā',2,3,()=>{addInv('hotdog');return 'Hotdogs somā. Varbūt kāds izsalcis?'})],
  chess:o=>[act('Spēlēt šahu ar vecīšiem',45,0,{culture:4},'',null,()=>rnd()<.4?'Šahs un mats! Tu uzvarēji.':'Vecītis tevi sagrāva 12 gājienos.')],
  picnic:o=>[...(compP()?withComp('Pikniks','+romantika',60,15,p=>{eat(25);bond(p,8,10);return 'Sviestmaizes zālē un saule.'}):[act('Pikniks vienatnē',45,8,{humor:1},'+25 sāta',null,()=>{eat(25);return 'Vāveres tev ziņkārīgi skatās.'})])],
  carriage:o=>[act('Pajūga brauciens pa parku',45,60,{culture:2,beauty:1},'',null,'Zirgu pakavi klaudz pa taku.'),...withComp('Pajūgs divatā','+romantika',45,80,p=>{bond(p,8,14);return 'Ļoti romantiski!'})],
  carousel:o=>[act('Izbraukt ar karuseli',15,3,{humor:3},'',null,'Ūū!')],
  jog:o=>[act('Skriet pa parka taku',45,0,{health:3},'−12 higiēna, −10 miegs',C().needs.energy<15?'Pārāk noguris':null,()=>{need('hygiene',-12);need('energy',-10);return 'Centrālparks ir skaists.'})],
  news:o=>[I('Avīze','Somā · $1',1,1,()=>{addInv('avize');return 'Avīze somā.'}),I('Žurnāls „Laiks”','Dāvana · $6',1,6,()=>{addInv('zurnals');return 'Žurnāls somā.'})],
  bull:o=>[I('Paberzēt vērša degunu veiksmei','Volstrītas tradīcija',5,0,()=>{if(S.bullDay===S.day)return 'Vērsis šodien jau devis veiksmi.';S.bullDay=S.day;if(rnd()<.35){C().money+=25;return 'Veiksme! Tu atrodi $25.'}addFame(.5);return 'Tūristi tevi fotografē.'})],
  steps:o=>[act('Vērot Taimskvēru',30,0,{culture:2,humor:2},'',null,'Miljoniem gaismu un cilvēku.')],
  subway:o=>STATIONS.filter(s=>s!==o).map(s=>I(`Uz: ${s.n}`,DISTS[s.d].n,12,3,()=>{travelTo(s.x,s.y,'metro',s.n);return `Metro aizved tevi: ${DISTS[s.d].n}.`})),
  taxi:o=>Object.keys(DISTS).map(d=>{const s=STATIONS.find(x=>x.d===d),dist=Math.abs(s.x-o.x)+Math.abs(s.y-o.y),fare=Math.round(5+dist*.35);return I(`Uz: ${DISTS[d].n}`,'Dzeltenais taksometrs',Math.round(6+dist*.2),fare,()=>{travelTo(s.x,s.y,'taxi',DISTS[d].n);return `Taksometrs aizved tevi: ${DISTS[d].n}.`})}).concat([I('Uz mājām','Taksometrs',12,Math.round(5+Math.abs(bld(HOMES[C().home].b).door[0]-o.x)*.35+Math.abs(bld(HOMES[C().home].b).door[1]-o.y)*.35),()=>{const b=bld(HOMES[C().home].b);travelTo(b.door[0],b.door[1],'taxi','Mājas');return 'Esi pie mājām.'})])
};
function travelTo(x,y,kind,label){if(kind&&typeof showTransit==='function')showTransit(kind,label);if(S.where){S.where=null;ROOM=null}const t=walkCity(x,y)?[x,y]:(adjFree(CITY,x,y)||[x,y]);P.x=t[0]+.5;P.y=t[1]+.5;P.path=[];P.target=null;cam.init=false;spawnCity()}
function momLock(){return S.momDay!=null&&S.day-S.momDay<10?`Nākamreiz pēc ${10-(S.day-S.momDay)} d.`:null}
function momMoney(){S.momDay=S.day;C().mom=(C().mom||0)+1;C().money+=150;return C().mom>2?'Mamma sūta $150, bet nopūšas: „Kad tu sāksi pelnīt pats?”':'Mamma atsūta $150: „Ēd kārtīgi, dēliņ/meitiņ!”'}
function freeDance(b,partner){if(!spendT(30,0))return;startMinigame('dance',0,r=>{addSt('humor',1+Math.round(r*2));need('energy',-8);need('hygiene',-6);addFame(r*1.5);let msg=`Deja: ${Math.round(r*100)}%.`;
  if(partner){bond(partner,4+r*8,4+r*12);msg+=` ${partner.first} ir sajūsmā!`}
  NPCS.forEach(n=>{const p=pById(n.pid);if(p&&p.met&&r>.7&&Math.hypot(n.x-P.x,n.y-P.y)<3){p.f=cl(p.f+3,0,FMAX);bubble(n,'Forši dejo!')}});log(msg,'g');toast(msg);checkTrophies();refreshUI();save()},partner?'Deja ar '+partner.first:'Deju grīda')}
function objTitle(o){const b=S.where?bld(S.where.b):null;const n={tree:'Koks',bench:'Soliņš',cart:'Hotdogu ratiņi',taxi:'Taksometru pietura',fountain:'Betesdas strūklaka',subway:o.n?'Metro: '+o.n:'Metro',chess:'Šaha galdiņš',picnic:'Pikniks',carriage:'Zirgu pajūgs',carousel:'Karuselis',jog:'Skriešanas taka',news:'Avīžu kiosks',bull:'Volstrītas vērsis',steps:'Sarkanās kāpnes'}[o.k];if(n)return n;
  return {counter:'Lete',bar:'Bārs',table:'Galdiņš',table4:'Galds',dance:'Deju grīda',dj:'DJ pults',rack:'Apģērbi',mirror:'Spogulis',bed:'Gulta',fridge:'Ledusskapis',wardrobe:'Skapis',sofa:'Dīvāns',tvstand:'Televizors',desk:'Galds',seats:'Sēdvietas',stage:'Skatuve',shelf:'Plaukts',treadmill:'Skrejceliņš',weights:'Svari',salonchair:'Friziera krēsls',teller:'Kase',atmI:'Bankomāts',toilet:'Tualete',shower:'Duša',arcadem:'Spēļu automāts',telescope:'Teleskops',dummy:'Kung-fu manekens',massagebed:'Masāžas galds',tradedesk:'Tirdzniecības galds',stall:'Tirgus stends',dumbbell:'Hanteles',pool:'Biljards',hbed:'Solārijs',mat:'Paklājiņš',pedestal:'Eksponāts',flowerstand:'Ziedi',stereo:'Atskaņotājs',piano:'Klavieres',mailbox:'Pastkastītes',elevator:'Lifts',swim:'Baseins'}[o.k]||(b?b.n:'')}
function openObj(o){
  const b=S.where?bld(S.where.b):null,f=ACT[o.act];if(!f)return;
  const list=f(b||o);if(!list.length){toast('Šeit nav ko darīt.');return}
  listModal(objTitle(o),list,()=>openObj(o),b?b.n:null);
}
function listModal(title,list,reopen,sub){
  modal({t:title,sub:(sub?sub+' · ':'')+clockStr(),ch:list.map(it=>({l:it.l,s:[it.s,it.t?`${it.t>=60?(it.t/60).toFixed(it.t%60?1:0)+' h':it.t+' min'}`:'',it.cost?usd(it.cost):''].filter(Boolean).join(' · '),why:it.lock,dis:!!it.lock,fn:()=>{
    if(it.m){it.fn();return}
    if(!spendT(it.t||0,it.cost||0)){if(reopen)reopen();return}
    const msg=it.fn();if(msg){log(msg);toast(msg)}checkTrophies();if(typeof storyHour==='function')storyHour();refreshUI();save();
    if(reopen&&!S.over&&!it.close&&S.where!==undefined)setTimeout(()=>{if(!$('#modalRoot').innerHTML&&!MG_ON&&S.min<DAY_MIN)reopen()},10);
  }})).concat([{l:'Aizvērt',exit:true}])});
}

/* ---------- Sarunas ---------- */
function bubble(n,t,ex){if(t){n.bub=t;n.bubT=2.6}if(ex){n.ex=ex;n.exT=3.2;const p=pById(n.pid);if(p)p._ex=ex}}
function gateWhy(p){if(p.f>=35||p.fam)return null;
  if(p.gate)for(const k in p.gate)if(stat(k)<p.gate[k])return `${p.first} tevi ignorē. (Vajag ${STN[k].toLowerCase()} ${p.gate[k]}, tev ${Math.floor(stat(k))}.)`;
  if(p.gatePop&&popularity()<p.gatePop)return `${p.first} nerunā ar nepazīstamiem. (Vajag popularitāti ${p.gatePop}, tev ${popularity()}.)`;
  if(p.gateMax)for(const k in p.gateMax)if(stat(k)>=p.gateMax[k])return `„Ar tādiem kā tu es nerunāju.” (Noziedzīgumam jābūt zem ${p.gateMax[k]}.)`;
  return null}
function socialMenu(n){
  const c=C(),p=pById(n.pid);if(!p){n.talking=false;return}
  const close=()=>{n.talking=false;n.hold=false};
  const again=()=>{if(!S.over)socialMenu(n);else close()};
  const mul=socialMul();
  const A=(l,s,mins,fn,lock)=>({l,s:s+(mins?` · ${mins} min`:''),dis:!!lock,why:lock,fn:()=>{if(!spendT(mins,0)){close();return}const r=fn();if(r){if(r.msg)toast(r.msg);if(r.b||r.ex)bubble(n,r.b,r.ex)}p.lastSeen=S.day;checkTrophies();if(typeof storyHour==='function')storyHour();renderHUD();save();if(r&&r.stop){close();return}again()}});
  const ch=[],gw=gateWhy(p);
  (typeof storyOptions==='function'?storyOptions(p,n):[]).forEach(o=>ch.push(o));
  if(p.appt&&p.appt.date&&p.appt.day===S.day&&S.where&&S.where.b===p.appt.b){const d=DATES.find(x=>x.id===p.appt.date);ch.unshift({l:`❤ Sākt randiņu: ${d.n}`,s:`${usd(d.p)} · 2 h`,fn:()=>{doDate(p,d,n)}})}
  if(!p.met){
    ch.push({hdr:'Iepazīšanās'});
    ch.push(A('Sasveicināties un iepazīties','Pajautāt vārdu',10,()=>{if(gw)return {msg:gw,b:'Hmpf.',ex:'angry'};
      if(p.cast||rnd()<(.55+stat('beauty')/200+c.st.humor/300+popularity()/250)*mul){p.met=1;p.f=Math.max(p.f,5);log(`Tu iepazīsties: ${fullName(p)} (${p.role||'ņujorkietis'}).`);return {msg:`Prieks iepazīties, ${p.first}!`,b:'Sveiks!',ex:'happy'}}
      return {msg:'Garāmgājējs steidzas tālāk.',b:'Nav laika…',ex:'bored'}}));
  } else if(gw){
    ch.push({hdr:'Saruna'});ch.push(A('Mēģināt parunāt','',5,()=>({msg:gw,b:pick(['…','Hmpf.','Nē, paldies.']),ex:'angry'})));
  } else {
    ch.push({hdr:'Saruna'});
    ch.push({l:'Runāt par…',s:'Izvēlies tēmu · 30 min',fn:()=>topicMenu(n,p)});
    if(!p.tDay._ask)ch.push(A('Pajautāt par sevi','Uzzināt, kas patīk · reizi dienā',15,()=>{p.tDay._ask=1;const un=p.likes.concat(p.dislikes).filter(t=>!p.known[t]);if(!un.length)return {msg:`Tu jau zini visu par ${nGen(p.first)} interesēm.`,b:'Tu mani pazīsti!'};const t=pick(un);p.known[t]=1;const like=p.likes.includes(t);bond(p,2,0);return {msg:`${p.first} ${like?'dievina':'nevar ciest'}: ${t}.`,b:like?`Es dievinu ${t.toLowerCase()}!`:`${t}? Fū!`,ex:like?'happy':'angry'}}));
    ch.push({l:'Jokot…',s:'Asprātīgs, rupjš vai palaidnība',fn:()=>jokeMenu(n,p)});
    if(p.f>=35)ch.push(A('Tenkot','Pastāstīt jaunumus par citiem',20,()=>{const others=S.people.filter(x=>x.met&&x!==p&&!x.fam);if(others.length<2)return {msg:'Tev vēl nav par ko tenkot.',b:'Nu?'};const t=pick(others);const g=p.gossip?R(9,13):R(2,5);bond(p,g,0);if(rnd()<.2){t.f=cl(t.f-8,0,FMAX);log(`${t.first} uzzināja, ka tu par viņu tenkoji…`,'b')}return {msg:p.gossip?`${p.first} dievina tenkas par ${nAcc(t.first)}!`:`${p.first} klausās par ${nAcc(t.first)}.`,b:p.gossip?'Nevar būt!!!':'Mhm.',ex:p.gossip?'laugh':'happy'}}));
    if(!p.phone)ch.push(A('Lūgt telefona numuru','',5,()=>{if(p.f>=15&&rnd()<.8*mul+.15){p.phone=1;return {msg:`${p.first} iedod numuru!`,b:'Piezvani!',ex:'happy'}}return {msg:'„Varbūt kādreiz.”',b:'Hmm.',ex:'bored'}},p.f<15?'Vajag draudzību 15':null));
    if(!p.fam&&!p.noRom){
      ch.push({hdr:'Romantika'});
      ch.push(A('Flirtēt','Skaistums + humors',10,()=>{if(p.key==='cop'&&c.st.crime>=20)return {msg:'Roza tev nopietni paskatās: „Nemēģini.”',b:'Nē.',ex:'angry'};if(rnd()<(.2+stat('beauty')/150+c.st.humor/400+p.f/400)*mul){bond(p,1,R(6,10));return {msg:`${p.first} nosarkst.`,b:'❤',ex:'love'}}p.rom=cl(p.rom-3,0,FMAX);p.f=cl(p.f-2,0,FMAX);return {msg:'Neveikls brīdis.',b:'Ēē…',ex:'bored'}},p.f<50&&p.rom<20?'Vajag draudzību 50 (Čoms+)':null));
      ch.push({l:'Aicināt uz randiņu',s:'Izvēlies vietu un laiku',dis:p.f<50&&p.rom<25,why:p.f<50&&p.rom<25?'Vajag draudzību 50 vai romantiku 25':null,fn:()=>dateMenu(n,p)});
      if(p.steady||p.rom>=60)ch.push(A('Noskūpstīt','',5,()=>{if(rnd()<.85){bond(p,1,6);S.flags.kiss=1;return {msg:'Skūpsts!',b:'❤❤',ex:'love'}}p.rom=cl(p.rom-5,0,FMAX);return {msg:`${p.first} novēršas.`,b:'Ne šeit!',ex:'angry'}}));
      if(!p.steady&&!S.people.some(x=>x.steady))ch.push(A('Piedāvāt kļūt par pāri','Vajag 3 randiņus un romantiku 70',10,()=>{if((p.dates||0)>=3&&p.rom>=70){p.steady=1;addFame(3);log(`Tu un ${p.first} esat pāris!`,'g');if(typeof storySteady==='function')storySteady(p);return {msg:`Jā! ${p.first} tagad ir ${p.sex==='m'?'tavs puisis':'tava meitene'}!`,b:'❤❤❤',ex:'love'}}p.rom=cl(p.rom-6,0,FMAX);return {msg:`${p.first} grib vēl pagaidīt.`,b:'Varbūt vēlāk…',ex:'sad'}},(p.dates||0)<3?`Randiņi: ${p.dates||0}/3`:p.rom<70?`Romantika ${Math.floor(p.rom)}/70`:null));
      if(p.steady)ch.push(A('Izšķirties','',10,()=>{p.steady=0;p.rom=cl(p.rom-50,0,FMAX);p.f=cl(p.f-20,0,FMAX);if(S.comp===p.id)dismissComp(true);log(`Tu un ${p.first} izšķiraties.`,'b');return {msg:'Attiecības beidzas.',b:'…',ex:'sad',stop:1}}));
    }
    ch.push({hdr:'Kopā'});
    if(S.comp===p.id)ch.push({l:'Atvadīties līdz nākamajai reizei',s:'Beigt kopā pavadīto laiku',fn:()=>{dismissComp();close()}});
    else ch.push(A('Nāc man līdzi!','Pavadonis staigās tev līdzi',5,()=>{if(p.f>=35||p.steady){if(S.comp)dismissComp(true);setComp(p);return {msg:`${p.first} nāk tev līdzi.`,b:'Ejam!',ex:'happy'}}return {msg:`${p.first} šobrīd nevar.`,b:'Piedod.',ex:'sad'}},p.f<35&&!p.steady&&!p.fam?'Vajag draudzību 35':null));
    const gifts=Object.keys(c.inv).filter(k=>c.inv[k]>0&&(ITEMS[k].gift||(p.key==='sam'&&k==='hotdog')));
    if(gifts.length)ch.push({l:'Dāvināt…',s:gifts.map(k=>ITEMS[k].n).join(', '),fn:()=>giftMenu(n,p)});
    const jb=p.key&&JOBS.find(j=>j.intro===p.key&&!S.flags['intro_'+j.id]);
    if(jb)ch.push(A(`Palūgt ieteikumu darbam: ${jb.n}`,'Draudzība 35',10,()=>{if(jb.id==='trader'&&p.f<80)return {msg:`${p.first}: „Maklerim es ieteikšu tikai labu draugu.” (Vajag draudzību 80.)`,b:'Vēlāk.'};S.flags['intro_'+jb.id]=1;log(`${p.first} tevi ieteica: ${jb.n}.`,'g');return {msg:`${p.first} tevi ieteiks! Piesakies: ${bld(jb.b[0]).n}.`,b:'Pasaki, ka no manis!',ex:'happy'}},p.f<35?'Vajag draudzību 35':null));
    if(c.st.crime>=15&&!p.fam){ch.push({hdr:'Naidīgi'});ch.push(A('Iebiedēt','Spēks + noziedzīgums',10,()=>{addSt('crime',3);if(rnd()<.3+c.st.strength/150+c.st.crime/200){p.f=cl(p.f-15,0,FMAX);p.likes.concat(p.dislikes).forEach(t=>p.known[t]=1);const m=R(5,30);c.money+=m;return {msg:`${p.first} nobijies atdod ${usd(m)} un izstāsta visu par sevi.`,b:'Labi, labi!',ex:'sad'}}p.f=cl(p.f-10,0,FMAX);addSt('health',-5);P.ex='sad';P.exT=3;return {msg:`${p.first} iesit tev pa degunu!`,b:'Pazūdi!',ex:'angry'}}))}
  }
  if(p.qOffer){ch.unshift({l:'„Vai varu kā palīdzēt?”',s:p.qOffer.desc,fn:()=>{acceptQuest(p);again()}})}
  S.quests.filter(q=>!q.done&&q.giver===p.id).forEach(q=>{if(q.type==='bring'&&C().inv[q.item])ch.unshift({l:`Atdot: ${ITEMS[q.item].n}`,s:`Atlīdzība ${usd(q.reward)}`,fn:()=>{C().inv[q.item]--;completeQuest(q);bubble(n,'Paldies!');again()}})});
  ch.push({l:'Atvadīties',exit:true,fn:close});
  const known=p.met;
  const ints=known?TOPICS.filter(t=>p.known[t]).map(t=>`<span class="tag ${p.likes.includes(t)?'lk':p.dislikes.includes(t)?'dk':''}">${TOPIC_ICON[t]} ${t}</span>`).join(''):'';
  const body=known?`<div class="relrow"><span>${rankOf(p.f)}</span>${bar(p.f/FMAX*100)}<b>${Math.round(p.f)}</b></div>${!p.fam&&!p.noRom?`<div class="relrow"><span>Romantika</span>${bar(p.rom/FMAX*100,'love')}<b>${Math.round(p.rom)}</b></div>`:''}${ints?`<div class="tags">${ints}</div>`:'<p class="muted small" style="margin:0">Intereses vēl nezini — runā par dažādām tēmām vai pajautā.</p>'}${p.bio&&p.cast?`<p class="muted small" style="margin:4px 0 0">${esc(p.bio)}</p>`:''}${C().needs.hygiene<30?'<p class="small" style="color:var(--bad);margin:4px 0 0">No tevis ož… Sarunas iet sliktāk. Ej dušā!</p>':''}`:`<p class="muted" style="margin:0">Tu vēl nepazīsti šo cilvēku.${gw?' '+esc(gw):''}</p>`;
  const pic=`<img class="portrait ${p._ex||''}" src="${portraitURL(p.look,p.sex,p._ex||null)}" alt="">`;p._ex=null;
  modal({t:known?fullName(p):(p.cast?p.role:'Svešinieks'),sub:`${known?(p.role?p.role+' · ':'')+relLabel(p):DISTS[p.zone]?.n||''} · ${clockStr()}`,b:`<div class="phead">${pic}<div class="pinfo">${body}</div></div>`,ch});
}
function topicMenu(n,p){
  modal({t:`Runāt ar ${nAcc(p.first)} par…`,sub:'Pieskaņo tēmu sarunu biedra interesēm',ch:TOPICS.map(t=>({l:`${TOPIC_ICON[t]} ${t}`,s:p.known[t]?(p.likes.includes(t)?'Patīk!':p.dislikes.includes(t)?'Nepatīk':'Neitrāli'):'',fn:()=>{
    if(!spendT(30,0)){n.talking=false;return}const mul=socialMul(),rep=p.tDay[t]||0,fat=1/(1+rep);p.tDay[t]=rep+1;
    let msg,b,ex=null;if(p.likes.includes(t)){p.known[t]=1;bond(p,R(8,12)*fat,R(0,2)*fat);ex=rep?'happy':pick(['happy','laugh']);msg=rep?`${p.first} jau par to runāja… (${Math.round(fat*100)}%)`:`${p.first} dievina šo tēmu! 😊`;b=pick(TOPIC_LINE[t])}
    else if(p.dislikes.includes(t)){p.known[t]=1;p.f=cl(p.f-6,0,FMAX);msg=`${p.first} žāvājas… 🥱`;b='Garlaicīgi…';ex='bored'}
    else{bond(p,R(2,4)*fat,0);p.known[t]=p.known[t]||0;msg='Jauka saruna.';b='Interesanti.'}
    p.lastSeen=S.day;toast(msg);bubble(n,b,ex);P.ex=ex==='bored'?'sad':ex;P.exT=2.5;checkTrophies();if(typeof storyHour==='function')storyHour();renderHUD();save();socialMenu(n)}})).concat([{l:'Atpakaļ',exit:true,fn:()=>socialMenu(n)}])});
}
function jokeMenu(n,p){const c=C();
  const J=[['smalks','Asprātīgs joks','Humors + kultūra'],['rupjš','Rupjš joks','Humors'],['prank','Izspēlēt palaidnību','+1 noziedzīgums']];
  modal({t:`Jokot ar ${nAcc(p.first)}`,ch:J.map(([k,l,s])=>({l,s:s+' · 10 min',fn:()=>{if(!spendT(10,0)){n.talking=false;return}const mul=socialMul();let msg,b;
    const taste=k==='prank'?p.humor==='rupjš':(p.humor==='visi'||p.humor===k);const skill=k==='smalks'?.2+c.st.humor/130+c.st.culture/260:k==='rupjš'?.3+c.st.humor/110:.35;
    if(k==='prank')addSt('crime',1);let ex;
    if(taste&&rnd()<skill*mul+(p.jokes?.15:0)){bond(p,R(6,10)*(p.jokes?1.5:1),0);msg=`${p.first} smejas līdz asarām!`;b=pick(['Hahaha!','Tu esi traks!','Ha! Labs!']);ex='laugh'}
    else if(!taste){p.f=cl(p.f-(k==='rupjš'&&p.key==='olivia'?12:6),0,FMAX);msg=`${p.first} nav tāda humora izjūta.`;b=k==='rupjš'?'Cik pretīgi!':'Ē… nesapratu.';ex='angry'}
    else{p.f=cl(p.f-2,0,FMAX);msg='Joks nenostrādāja.';b='…';ex='bored'}
    p.lastSeen=S.day;toast(msg);bubble(n,b,ex);P.ex=ex==='laugh'?'laugh':'sad';P.exT=2.5;checkTrophies();renderHUD();save();socialMenu(n)}})).concat([{l:'Atpakaļ',exit:true,fn:()=>socialMenu(n)}])});
}
function giftMenu(n,p){const c=C();const gifts=Object.keys(c.inv).filter(k=>c.inv[k]>0&&(ITEMS[k].gift||(p.key==='sam'&&k==='hotdog')));
  modal({t:`Dāvana: ${p.first}`,ch:gifts.map(k=>({l:ITEMS[k].n,s:`Tev ir ${c.inv[k]}${ITEMS[k].tag&&p.known[ITEMS[k].tag]!=null?(p.likes.includes(ITEMS[k].tag)?' · patiks!':p.dislikes.includes(ITEMS[k].tag)?' · nepatiks':''):''}`,fn:()=>{c.inv[k]--;
    if(p.key==='sam'&&k==='hotdog'){S.flags.samFed=S.day;bond(p,8,0);bubble(n,'Mmm! Tagad varu tev ko iemācīt.','happy');toast('Sems apēd hotdogu un ir gatavs mācīt.');advance(5);save();socialMenu(n);return}
    const it=ITEMS[k];let v=it.gift;if(it.tag&&p.likes.includes(it.tag)){v*=2;p.known[it.tag]=1}else if(it.tag&&p.dislikes.includes(it.tag)){v*=.3;p.known[it.tag]=1}
    bond(p,v,!p.noRom&&p.f>=35?v*.6:0);bubble(n,v>=12?'Wow, paldies!!':v<4?'Ē… paldies.':'Paldies!',v>=12?(p.noRom||p.fam?'laugh':'love'):v<4?'bored':'happy');toast(`${p.first} ${v>=12?'ir sajūsmā':'saņem dāvanu'}.`);advance(5);save();socialMenu(n)}})).concat([{l:'Atpakaļ',exit:true,fn:()=>socialMenu(n)}])})}

/* ---------- Randiņi ---------- */
function dateMenu(n,p){const c=C(),h=hourNow(),back=()=>{if(n.phone)refreshUI();else socialMenu(n)};
  modal({t:`Randiņš ar ${nAcc(p.first)}`,sub:'Partneris tevi gaidīs vietā pēc ~1 stundas',ch:DATES.map(d=>{const b=bld(d.b),why=reqWhy(d.req),open=h+1<b.hours[1]-2&&h+1>=b.hours[0]-1;
    return {l:`${d.n} · ${usd(d.p)}`,s:`${b.n}${d.req&&Object.keys(d.req).length?' · '+Object.entries(d.req).map(([k,v])=>STN[k].toLowerCase()+' '+v).join(', '):''}${p.known[d.tag]&&p.likes.includes(d.tag)?' · ❤ patiks':''}`,dis:!open,why:!open?'Tur šodien vairs nevar':why?'Ieteicams: '+why:null,fn:()=>{
      advance(5);const ok=p.steady||rnd()<.35+p.rom/110+p.f/260;if(!ok){p.f=cl(p.f-2,0,FMAX);toast(`${p.first}: „Šodien nevaru, piedod.”`);bubble(n,'Varbūt citreiz…');save();back();return}
      const from=Math.max(h+1,b.hours[0]);p.appt={b:d.b,day:S.day,from,until:Math.min(b.hours[1],from+3),date:d.id};n.talking=false;n.hold=false;if(S.comp===p.id)dismissComp(true);
      log(`Randiņš: ${p.first} gaidīs tevi ${b.n} ap ${hstr(Math.ceil(from*2)/2)} (${d.n}).`,'g');toast(`${p.first} piekrīt! ${b.n}, ap ${hstr(Math.ceil(from*2)/2)}.`);bubble(n,'❤ Līdz tikšanās!');refreshUI();save()}}}).concat([{l:'Atpakaļ',exit:true,fn:back}])})}
function doDate(p,d,n){const c=C();
  if(!spendT(120,d.p)){socialMenu(n);return}
  let v=d.v;const why=reqWhy(d.req);if(why)v*=.35;if(p.likes.includes(d.tag)){v*=1.5;p.known[d.tag]=1}else if(p.dislikes.includes(d.tag))v*=.5;
  bond(p,v*.6,v);p.dates=(p.dates||0)+1;S.flags.dates=(S.flags.dates||0)+1;S.flags['d_'+d.id]=1;p.appt=null;addFame(1);
  const eff={cinema:{culture:2,humor:2},dinner:{health:1},boat:{health:2},carriage:{culture:1},empire:{culture:3},club:{humor:2},jazz:{culture:2},show:{culture:5},opera:{culture:8},seaport:{culture:2}}[d.id]||{};for(const k in eff)addSt(k,eff[k]);
  if(d.id==='dinner'||d.id==='seaport')eat(55);
  const msg=why?`Randiņš bija neveikls (${why}). ${p.first} tomēr pasmaida.`:p.likes.includes(d.tag)?`Brīnišķīgs randiņš! ${p.first} ir sajūsmā.`:`Jauks randiņš ar ${nAcc(p.first)}.`;
  log(`${d.n} ar ${nAcc(p.first)}: ${msg}`,'g');bubble(n,'❤',why?'happy':'love');P.ex='love';P.exT=3;n.talking=false;n.hold=false;setComp(p);
  modal({t:d.n,sub:`Randiņš nr. ${p.dates} ar ${nAcc(p.first)}`,b:`<p>${esc(msg)}</p><div class="relrow"><span>Romantika</span>${bar(p.rom/FMAX*100,'love')}<b>${Math.round(p.rom)}</b></div>${!p.steady&&p.dates>=3&&p.rom>=70?'<p class="small" style="color:var(--good)">Varbūt ir laiks piedāvāt kļūt par pāri?</p>':''}`,ch:[{l:'Turpināt kopā'}]});
  checkTrophies();if(typeof storyHour==='function')storyHour();refreshUI();save();
}

/* ---------- Galvenais cikls ---------- */
let lastT=performance.now(),HUDT=0,NEEDT=0;
function needAlerts(){const c=C(),n=c.needs;
  if(n.bladder<=0){n.bladder=70;need('hygiene',-45);addSt('beauty',-2);S.flags.accident=(S.flags.accident||0)+1;NPCS.forEach(x=>{const p=pById(x.pid);if(p&&p.met&&Math.hypot(x.x-P.x,x.y-P.y)<4){p.f=cl(p.f-4,0,FMAX);bubble(x,'Fū!')}});toast('Ak nē… tu nepaspēji līdz tualetei! 😳');log('Negadījums ar tualeti. Kauns!','b')}
  const warn=(k,txt)=>{if(n[k]<15&&S.warn!==k+S.day+Math.floor(S.min/120)){S.warn=k+S.day+Math.floor(S.min/120);tick(txt,'b')}};
  warn('food','🍎 Tu esi izsalcis — paēd!');warn('energy','zZ Tu esi noguris — izguļies vai iedzer kafiju.');warn('hygiene','🚿 No tevis ož — ej dušā!');warn('bladder','WC Steidzami vajag uz tualeti!');
}
function frame(now){
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;TIME=now/1000;
  if(S&&S.c&&!S.over&&S.tab==='city'&&!document.hidden){
    const h=hourNow();DUSK=h>=18?cl((h-18)/2.5,0,1):0;NIGHT=h>=20?cl((h-20)/1.5,0,1):0;if(S.where)NIGHT=Math.min(NIGHT,.9);
    const modalOpen=!!$('#modalRoot').innerHTML||MG_ON;
    if(!modalOpen){
      if(!P.path.length&&keyDir){const m=curMap(),nx=Math.floor(P.x)+keyDir[0],ny=Math.floor(P.y)+keyDir[1];if(m.walk(nx,ny)){P.path=[[nx,ny]];P.target=null;
        if(!S.where){const door=BLDS.find(b=>b.door[0]===nx&&b.door[1]===ny);if(door)P.target={type:'door',id:door.id}}else if(nx===ROOM.exit[0]&&ny===ROOM.exit[1])P.target={type:'exit'}}}
      playerStep(dt);
      if(S.min<DAY_MIN)advance(dt*(S.speed||2));
      NEEDT+=dt;if(NEEDT>1){NEEDT=0;needAlerts();renderNeeds()}
    }
    if(!S.where){updCars(dt);updPigeons(dt)}updNPCs(dt);
    const ps=iso(P.x,P.y);let tx=ps.x,ty=ps.y-30;if(S.where){const rc=iso(ROOM.W/2,ROOM.H/2);tx=rc.x*.75+ps.x*.25;ty=(rc.y-40)*.75+(ps.y-30)*.25}if(!cam.init){cam.x=tx;cam.y=ty;cam.init=true}cam.x+=(tx-cam.x)*Math.min(1,dt*6);cam.y+=(ty-cam.y)*Math.min(1,dt*6);
    if(S.where)renderRoom(ROOM,dt);else renderCity(dt);
    HUDT+=dt;if(HUDT>.5){HUDT=0;const ck=document.querySelector('.pill.clock');if(ck)ck.textContent=clockStr()}
    if(!modalOpen&&S.min>=DAY_MIN){S.min=DAY_MIN;P.path=[];modal({t:'Ir 04:00',b:'<p>Tu esi pārāk noguris, lai turpinātu. Acis veras ciet…</p>',ch:[{l:'Gulēt',fn:()=>endDay(S.where&&S.where.variant==='home'?'home':S.where&&S.where.b==='plaza'?'hotel':'bench')}]})}
    else if(!modalOpen&&C().needs.energy<=0){C().needs.energy=5;P.path=[];addSt('health',-4);modal({t:'Tu sabrūc no noguruma',b:'<p>Tev steidzami jāizguļas.</p>',ch:[{l:'Gulēt',fn:()=>endDay(S.where&&S.where.variant==='home'?'home':'bench')}]})}
  }
  requestAnimationFrame(frame);
}
