/* ===================== Spēles loģika: kustība, NPC, mijiedarbība ===================== */
const P={x:12.5,y:24.5,path:[],target:null,ph:0,dir:0,exitB:null,lastTile:null};
let NPCS=[],CARS=[],ROOM=null,COMP_NPC=null;const TARGET={x:0,y:0,t:0};
const curMap=()=>S.where?ROOM:CITY;

/* ---------- Mašīnas ---------- */
function initCars(){CARS=[];const lanes=[];ROADS.forEach(r=>{lanes.push({ax:'x',c:r+.5,d:1},{ax:'x',c:r+1.5,d:-1},{ax:'y',c:r+.5,d:-1},{ax:'y',c:r+1.5,d:1})});
  const cols=['#e2484f','#f4f4f4','#2b2f3a','#3f7fd8','#46b06b','#9aa3ad','#ff7a59','#1f6f8b','#c0c4ca','#ffb3cf','#9b5bd6'];
  for(let i=0;i<26;i++){const ln=lanes[i%lanes.length],s=rnd()*58;CARS.push({ax:ln.ax,dir:ln.d,lane:ln.c,s,v:2+rnd()*1.8,col:i%7===0?'#ffd23f':cols[i%cols.length],taxi:i%7===0,x:0,y:0})}}
function updCars(dt){CARS.forEach(c=>{c.s+=c.v*dt*c.dir;if(c.s>58.6)c.s=-.6;if(c.s<-.6)c.s=58.6;if(c.ax==='x'){c.x=c.s;c.y=c.lane}else{c.x=c.lane;c.y=c.s}})}

/* ---------- NPC ---------- */
function npcInfo(n){if(n.staff)return {look:n.look,sex:n.sex,person:null,name:n.name};const p=pById(n.pid);if(!p)return {look:randLook('m'),sex:'m',person:null,name:'?'};
  return {look:p.look,sex:p.sex,person:p,name:p.rel==='none'?'Svešinieks':fullName(p),scale:ageOf(p.bT)<14?.72:ageOf(p.bT)<18?.88:1}}
function mkNpc(p,x,y){return {pid:p.id,x,y,path:[],wait:R(0,3),spd:1.25+rnd()*.55,ph:rnd()*6,dir:R(0,3)}}
function randStreetTile(near){for(let i=0;i<300;i++){let x,y;if(near&&i<200){x=Math.floor(P.x)+R(-14,14);y=Math.floor(P.y)+R(-14,14)}else{x=R(0,58);y=R(0,58)}
  if(walkCity(x,y)&&grid[gi(x,y)]!==T.ROAD&&grid[gi(x,y)]!==T.PIER)return [x+.5,y+.5]}return [12.5,24.5]}
function streetPeople(){const h=hourNow();return S.people.filter(p=>p.alive&&p.id!==S.comp&&locOf(p,h)==='street'&&(p.town||p.rel!=='none'))}
function spawnCity(){
  NPCS=[];const list=streetPeople().sort(()=>rnd()-.5).slice(0,28);
  list.forEach((p,i)=>{const [x,y]=randStreetTile(i<18);NPCS.push(mkNpc(p,x,y))});
  if(S.comp){const p=pById(S.comp);if(p){const t=adjFree(CITY,Math.floor(P.x),Math.floor(P.y))||[Math.floor(P.x),Math.floor(P.y)];COMP_NPC=mkNpc(p,t[0]+.5,t[1]+.5);NPCS.push(COMP_NPC)}}
}
function refreshCityNPCs(){
  const h=hourNow(),keep=NPCS.filter(n=>{const p=pById(n.pid);return n===COMP_NPC||n.talking||(p&&p.alive&&locOf(p,h)==='street')});
  const ids=new Set(keep.map(n=>n.pid));NPCS=keep;
  const add=streetPeople().filter(p=>!ids.has(p.id)).sort(()=>rnd()-.5).slice(0,Math.max(0,28-NPCS.length));
  add.forEach(p=>{const b=pick(BLDS),t=b.door;NPCS.push(mkNpc(p,t[0]+.5,t[1]+.5))});
}
function roomPeople(b){const h=hourNow();return S.people.filter(p=>p.alive&&p.id!==S.comp&&(locOf(p,h)===b.id||(S.where&&S.where.owner===p.id)||(S.where&&S.where.variant==='home'&&homeOf(p)===b.id&&p.rel!=='none'&&locOf(p,h)===b.id)))}
function spawnRoom(){
  NPCS=[];const m=ROOM,b=bld(S.where.b);
  // personāls
  m.staffP=[];if(!m.home&&S.where.variant!=='flat'){m.staff.forEach((s,i)=>{const sex=hash(b.seed,i)<.5?'m':'f';const L=randLook(sex);L.top={t:'shirt',c:b.acc};L.bot={t:'pants',c:'#2b2f3a'};m.staffP.push({x:s.x,y:s.y,look:L,sex,o:s.o})})}
  const list=roomPeople(b).slice(0,10);
  list.forEach(p=>{const t=randRoomTile(m);if(t)NPCS.push(Object.assign(mkNpc(p,t[0]+.5,t[1]+.5),{spd:.8}))});
  if(S.comp){const p=pById(S.comp);if(p){const t=adjFree(m,m.exit[0],m.exit[1])||m.exit;COMP_NPC=Object.assign(mkNpc(p,t[0]+.5,t[1]+.5),{spd:1.6});NPCS.push(COMP_NPC)}}
}
function randRoomTile(m){for(let i=0;i<80;i++){const x=R(0,m.W-1),y=R(0,m.H-2);if(m.walk(x,y)&&!(x===m.exit[0]&&y===m.exit[1]))return [x,y]}return null}
function refreshRoomNPCs(){const b=bld(S.where.b),h=hourNow();
  NPCS=NPCS.filter(n=>{if(n===COMP_NPC||n.talking)return true;const p=pById(n.pid);const ok=p&&p.alive&&(locOf(p,h)===b.id||S.where.owner===p.id);return ok});
  const ids=new Set(NPCS.map(n=>n.pid));roomPeople(b).filter(p=>!ids.has(p.id)).slice(0,Math.max(0,10-NPCS.length)).forEach(p=>{NPCS.push(Object.assign(mkNpc(p,ROOM.exit[0]+.5,ROOM.exit[1]+.5),{spd:.8}))});
}
function onHour(){if(!S||!S.c)return;if(S.where)refreshRoomNPCs();else refreshCityNPCs();if(typeof renderHUD==='function')renderHUD()}
function adjFree(m,x,y){for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1],[-1,-1],[1,-1]]){if(m.walk(x+dx,y+dy))return [x+dx,y+dy]}return null}
function updNPCs(dt){
  const m=curMap();
  for(const n of NPCS){
    if(n.talking){const dx=P.x-n.x,dy=P.y-n.y;n.dir=dirFrom(dx,dy);continue}
    if(n===COMP_NPC){if(n.path.length){stepMover(n,dt,n.spd*(S.where?1:VEHSP()))}continue}
    if(n.hold)continue;
    if(!n.path.length){n.wait-=dt;if(n.wait<=0){const r=S.where?3:7,tx=cl(Math.floor(n.x)+R(-r,r),0,m.W-1),ty=cl(Math.floor(n.y)+R(-r,r),0,m.H-1);
      n.path=(m.walk(tx,ty)&&(S.where||grid[gi(tx,ty)]!==T.ROAD)&&bfs(m,Math.floor(n.x),Math.floor(n.y),tx,ty,S.where?200:900))||[];n.wait=1.5+rnd()*(S.where?6:4)}}
    else stepMover(n,dt,n.spd);
  }
}
function stepMover(m,dt,spd){
  if(!m.path.length)return false;
  const [tx,ty]=m.path[0],gx=tx+.5,gy=ty+.5,dx=gx-m.x,dy=gy-m.y,dist=Math.hypot(dx,dy),st=spd*dt;
  if(dist>1e-4)m.dir=dirFrom(dx,dy);m.ph=(m.ph||0)+dt*12;
  if(dist<=st){m.x=gx;m.y=gy;m.path.shift();return true}
  m.x+=dx/dist*st;m.y+=dy/dist*st;return false;
}
const VEHSP=()=>(VEH.find(v=>v.id===C().veh)||VEH[0]).sp;

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
  const sp=S.where?2.6:3.2*VEHSP();
  const prev=[Math.floor(P.x),Math.floor(P.y)];
  if(stepMover(P,dt,sp)){
    advance(S.where?.4:1/VEHSP());
    if(!S.where){checkGnome();checkPet()}
    if(COMP_NPC){const [lx,ly]=prev,m=curMap();if(m.walk(lx,ly))COMP_NPC.path=[[lx,ly]]}
    const t=P.target;
    if(t&&t.type==='npc'&&Math.hypot(t.n.x-P.x,t.n.y-P.y)<1.6){P.path=[];arrive()}
    else if(!P.path.length)arrive();
    if(Math.floor(S.min)%6===0)renderHUD();
  }
}
function checkGnome(){const fx=Math.floor(P.x),fy=Math.floor(P.y);
  GNOME_SPOTS.forEach(([x,y],i)=>{if(x===fx&&y===fy&&!S.gnomes.includes(i)){S.gnomes.push(i);const c=C();c.money+=150;addStat('happy',3);
    log(`Atrasts dārza rūķītis (${S.gnomes.length}/${GNOMES}) · +150 €`,'y');
    if(S.gnomes.length===GNOMES){c.money+=5000;addRep(5);modal({t:'Pēdējais rūķītis!',b:`<p>Tu atradi visus ${GNOMES} Ostmalas dārza rūķīšus! +5000 €, +slava.</p>`,ch:[{l:'Lieliski'}]})}
    checkTrophies();save();renderHUD()}})}
function checkPet(){const fx=Math.floor(P.x),fy=Math.floor(P.y);S.quests.forEach(q=>{if(q.type==='pet'&&!q.found&&q.pet&&q.pet[0]===fx&&q.pet[1]===fy){q.found=true;C().inv.kakis=(C().inv.kakis||0)+1;toast('Tu noķēri kaķi Minci! Aiznes to saimniekam.');log('Kaķis Mince atrasts!','y')}})}

/* ---------- Ievade ---------- */
function screenToWorld(cx,cy){return {x:(cx*DPR-(CW/2-cam.x*K))/K+0,y:(cy*DPR-(CH/2-cam.y*K))/K}}
function inPoly(pt,poly){let ins=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))ins=!ins}return ins}
function onTap(cx,cy){
  if(!S||!S.c||S.dead||$('#modalRoot').innerHTML||S.tab!=='city')return;
  if(C().jail){toast('Tu esi cietumā. Spied „Gaidīt mēnesi”.');return}
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
function setZoom(z){ZOOM=cl(z,.55,2.2);K=DPR*ZOOM;tileCache={}}
const KEYS={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};let keyDir=null;
document.addEventListener('keydown',e=>{if(!S||S.tab!=='city'||$('#modalRoot').innerHTML||e.target.tagName==='INPUT')return;if(KEYS[e.key]){keyDir=KEYS[e.key];e.preventDefault()}});
document.addEventListener('keyup',e=>{if(KEYS[e.key])keyDir=null});

/* ---------- Ēkas ---------- */
function isOpen(b){const h=hourNow();if(b.type==='casino'&&!S.country.laws.includes('casino'))return false;return h>=b.hours[0]&&h<b.hours[1]}
function residentsOf(b){return S.people.filter(p=>p.alive&&homeOf(p)===b.id&&p.rel!=='none')}
function enterBuilding(b){
  const c=C();if(c.jail||S.dead)return;
  const myHome=HOMES[c.home].b===b.id;
  if(myHome){doEnter(b,'home');return}
  if(b.type==='apt'||b.type==='parents'){
    const res=residentsOf(b);const h=hourNow();
    const ch=res.map(p=>({l:`Zvanīt pie durvīm: ${p.first}`,s:relName(p),fn:()=>{if(locOf(p,h)===b.id&&(p.close>=15||isFamily(p))){doEnter(b,'flat',p.id);toast(`${p.first} atver durvis.`)}else toast(locOf(p,h)===b.id?`${p.first} tevi neielaiž.`:'Neviens neatver durvis.')}}));
    if(b.type==='apt')ch.push({l:'Ieiet kāpņu telpā',fn:()=>doEnter(b,'lobby')});
    ch.push({l:'Atpakaļ',exit:true});modal({t:b.n,sub:'Dzīvojamā ēka',b:res.length?'':'<p class="muted">Tu nepazīsti nevienu, kas šeit dzīvo.</p>',ch});return}
  if(b.type==='house'||b.type==='villa'){toast(`${b.n} ir pārdošanā. Jautā nekustamo īpašumu aģentūrā.`);return}
  if(!isOpen(b)){toast(b.type==='casino'&&!S.country.laws.includes('casino')?'Kazino ir slēgts: tam vajag kazino legalizācijas likumu.':`${b.n} ir slēgts. Darba laiks ${hstr(b.hours[0])}–${hstr(b.hours[1])}.`);return}
  if(b.type==='vip'){const st=styleScore();if(st<30||c.rep<20){modal({t:'Apsargs',b:`<p>„Tikai VIP viesiem.” Vajag stilu 30 un slavu 20. Tev: stils ${st}, slava ${Math.round(c.rep)}.</p>`,ch:[{l:'Iepirkt 200 € dzeramnaudu',s:'Varbūt viņš izliksies neredzam…',fn:()=>{if(c.money<200)return toast('Nepietiek naudas.');c.money-=200;if(rnd()<.5){doEnter(b);toast('Apsargs pamāj ar galvu.')}else toast('Apsargs paņem naudu un tik un tā neielaiž!')}},{l:'Atkāpties',exit:true}]});return}c.flags.vip=true;checkTrophies()}
  doEnter(b);
}
function doEnter(b,variant,owner){
  S.where={b:b.id,variant:variant||null,owner:owner||null};
  ROOM=makeRoom(b,variant);
  P.x=ROOM.exit[0]+.5;P.y=ROOM.exit[1]+.5;P.path=[];P.target=null;P.dir=2;
  spawnRoom();cam.init=false;
  // uzdevumi un tikšanās
  S.quests.forEach(q=>{if(q.done)return;if(q.type==='deliver'&&q.b===b.id&&C().inv.pacina)completeQuest(q,'Paciņa nodota');
    if(q.type==='meet'&&q.b===b.id&&NPCS.some(n=>n.pid===q.giver))completeQuest(q,'Tikšanās notikusi')});
  const waiting=NPCS.filter(n=>{const p=pById(n.pid);return p&&p.appt&&p.appt.day===S.day&&p.appt.b===b.id});
  if(waiting.length){const p=pById(waiting[0].pid);toast(`${p.first} jau gaida tevi!`);p.appt.met=true}
  refreshUI();save();
}
function leaveBuilding(){
  const b=bld(S.where.b);S.where=null;ROOM=null;
  P.x=b.door[0]+.5;P.y=b.door[1]+.5;P.path=[];P.target=null;P.dir=b.side==='y'?0:1;
  spawnCity();cam.init=false;refreshUI();save();
}
function afterNewDay(quality){
  dismissComp(true);
  if(quality==='home'||!quality){const b=bld(HOMES[C().home].b);doEnter(b,'home');P.x=ROOM.furn[0].x+ROOM.furn[0].w+.5;P.y=ROOM.furn[0].y+1.5;if(!ROOM.walk(Math.floor(P.x),Math.floor(P.y))){P.x=ROOM.exit[0]+.5;P.y=ROOM.exit[1]+.5}}
  else if(quality==='hotel'){doEnter(bld('hotel'))}
  else{S.where=null;ROOM=null;const b=bld(HOMES[C().home].b);P.x=b.door[0]+.5;P.y=b.door[1]+.5;spawnCity()}
  const d=dateOf(S.T);tick(`Jauns rīts · ${S.day}. diena · ${MONL[d.m]} ${d.y}`,'y');refreshUI();
}
function onJail(){if(S.where){S.where=null;ROOM=null}dismissComp(true);const b=bld('police');P.x=b.door[0]+.5;P.y=b.door[1]+.5;P.path=[]}
function endDayPrompt(){
  if(!S||!S.c||$('#modalRoot').innerHTML)return;const c=C();if(c.jail){endDay('jail');return}
  const home=S.where&&S.where.variant==='home';
  if(home){modal({t:'Iet gulēt?',b:'<p>Diena beidzas, un paiet mēnesis.</p>',ch:[{l:'Gulēt',fn:()=>endDay('home')},{l:'Vēl ne',exit:true}]});return}
  const hb=bld(HOMES[c.home].b);
  modal({t:'Beigt dienu?',b:'<p>Tu neesi mājās. Gulēšana uz soliņa kaitē veselībai un laimei.</p>',ch:[
    {l:'Taksometrs uz mājām',s:`${eur(15)} · 10 min`,fn:()=>{if(c.money<15)return toast('Nepietiek naudas.');c.money-=15;advance(10);if(S.where){S.where=null;ROOM=null}doEnter(hb,'home');endDayPrompt()}},
    {l:'Gulēt uz soliņa',fn:()=>endDay('bench')},{l:'Turpināt dienu',exit:true}]});
}

/* ---------- Pavadonis ---------- */
function setComp(p){S.comp=p.id;const n=NPCS.find(x=>x.pid===p.id);if(n){COMP_NPC=n;n.hold=false;n.talking=false;n.spd=S.where?1.6:3.2}log(`${p.first} pavada tevi.`,'g')}
function dismissComp(silent){if(!S.comp)return;const p=pById(S.comp);S.comp=null;if(COMP_NPC){COMP_NPC.path=[];COMP_NPC=null}if(p&&!silent)toast(`${p.first} dodas savās gaitās.`)}
function compP(){return S.comp?pById(S.comp):null}

/* ---------- Darbs ---------- */
function jobItems(b){
  const c=C(),out=[],h=hourNow();
  JOBS.filter(j=>j.places.includes(b.type)).forEach(j=>{
    if(c.job&&c.job.id===j.id&&c.job.b===b.id){
      const inH=h>=j.hours[0]&&h<j.hours[1]-1;
      out.push({l:c.job.worked?'Strādāt virsstundas':'Strādāt maiņu',s:`${j.lv[c.job.lvl]} · ${hstr(j.hours[0])}–${hstr(j.hours[1])}`,t:240,lock:!inH?`Maiņas laiks ${hstr(j.hours[0])}–${hstr(j.hours[1])}`:c.needs.energy<20?'Pārāk noguris':c.job.ot?'Šodien pietiks':null,fn:()=>workShift(j)});
      out.push({l:'Lūgt paaugstinājumu',s:`Darba rezultāts ${Math.round(c.job.perf)}/100`,t:20,lock:c.job.lvl>=2?'Augstākais līmenis':null,fn:()=>{if(c.job.perf>=60&&rnd()<.35+c.stats.charm/250){c.job.lvl++;c.job.perf=10;addStat('happy',6);return `Apsveicam! Tagad tu esi ${j.lv[c.job.lvl]}.`}c.job.perf=Math.max(0,c.job.perf-8);return 'Priekšnieks saka: „Vēl ne.”'}});
      out.push({l:'Atkāpties no darba',t:0,fn:()=>{c.job=null;return 'Tu iesniedz atlūgumu.'}});
    } else {
      const r=j.req||{},why=r.deg&&!c.degrees.includes(r.deg)?`vajag diplomu: ${DEG.find(d=>d.id===r.deg).n}`:r.looks&&c.stats.looks<r.looks?`vajag izskatu ${r.looks}`:r.charm&&c.stats.charm<r.charm?`vajag harizmu ${r.charm}`:r.health&&c.stats.health<r.health?`vajag veselību ${r.health}`:r.smarts&&c.stats.smarts<r.smarts?`vajag gudrību ${r.smarts}`:r.rep&&c.rep<r.rep?`vajag slavu ${r.rep}`:r.dance&&c.skills.dance<r.dance?`vajag deju prasmi ${r.dance}`:null;
      out.push({l:`Pieteikties darbā: ${j.n}`,s:`${eur(j.sal[0])}/mēn. · ${hstr(j.hours[0])}–${hstr(j.hours[1])}${c.job?' · aizstās pašreizējo darbu':''}`,t:30,lock:why,fn:()=>{c.job={id:j.id,b:b.id,lvl:0,perf:0,missed:0,worked:false};addStat('happy',4);log(`Jauns darbs: ${j.lv[0]} (${b.n})`,'g');return `Tu esi pieņemts darbā: ${j.lv[0]}!`}});
    }
  });
  return out;
}
function workShift(j){
  const c=C();if(c.job.worked)c.job.ot=true;c.job.worked=true;
  const gain=8+(c.stats.smarts+c.stats.charm)/25+(c.needs.fun>40?2:0);c.job.perf=Math.min(100,c.job.perf+gain);
  need('energy',-25);need('fun',-8);let extra='';
  if(j.tips){const t=R(15,60)+Math.round(c.stats.charm/4);c.money+=t;extra=` Dzeramnauda: ${eur(t)}.`}
  if(c.job.ot){const b=Math.round(jobSalary()*.15);c.money+=b;extra+=` Virsstundas: +${eur(b)}.`}
  if(j.perk==='rep')addRep(1);if(j.perk==='inf')addInf(.5);
  if(c.job.perf>=100&&c.job.lvl<2){c.job.lvl++;c.job.perf=10;log(`Paaugstinājums! ${j.lv[c.job.lvl]}.`,'g');extra+=` Paaugstinājums: ${j.lv[c.job.lvl]}!`;checkTrophies()}
  return `Maiņa padarīta.${extra}`;
}

/* ---------- Mijiedarbības ar objektiem ---------- */
function I(l,s,t,cost,fn,lock,opt){return Object.assign({l,s,t,cost,fn,lock},opt||{})}
function M_(l,s,fn,lock){return {l,s,t:0,fn,lock,m:true}}
const withComp=(l,s,t,cost,fn,lock)=>{const p=compP();return p?[I(`${l} (kopā ar ${p.first})`,s,t,cost,()=>fn(p),lock)]:[]};
const compBoost=(p,c_,r_)=>{p.close=cl(p.close+c_);if(p.rel!=='none'&&!isFamily(p)&&ageOf(p.bT)>=18)p.rom=cl(p.rom+r_);if(p.rel==='acq'&&p.close>=45)p.rel='friend'};
function eat(v,f=0){need('food',v);need('fun',f)}
const ACT={
  cafe:b=>[I('Kafija','+enerģija',10,4,()=>{need('energy',15);need('fun',2);return 'Stipra, karsta kafija.'}),I('Kafija līdzņemšanai','Somā',2,4,()=>{addInv('kafija');return 'Kafija ir līdzi.'}),I('Kūka','+sāta',15,6,()=>{eat(20,4);return 'Mmm, ogu kūka.'}),
    ...withComp('Kafija','+draudzība, +romantika',30,8,p=>{compBoost(p,8,4);need('energy',12);return `Jūs ar ${p.first} parunājāties pie kafijas.`}),...jobItems(b)],
  cafeTable:b=>[I('Lasīt avīzi','+gudrība',20,0,()=>{addStat('smarts',1);need('fun',3);return 'Tu uzzini jaunāko pilsētā.'}),...withComp('Parunāties pie galdiņa','+draudzība',30,0,p=>{compBoost(p,7,3);return 'Laba saruna.'})],
  icecream:b=>[I('Saldējums','+prieks',5,3,()=>{eat(10,6);return 'Zemeņu saldējums!'}),...withComp('Saldējums','+romantika',10,6,p=>{compBoost(p,5,6);return 'Saldi!'}),...jobItems(b)],
  restCounter:b=>[I('Ēdiens līdzņemšanai','+sāta',10,12,()=>{eat(40);return 'Gards ēdiens.'}),...jobItems(b)],
  restTable:b=>[I(hourNow()>=17?'Vakariņas':'Pusdienas','+sāta, +prieks',45,22,()=>{eat(60,5);return 'Lieliska maltīte!'}),...withComp('Vakariņas divatā','+romantika',90,55,p=>{eat(60,8);compBoost(p,10,12);return `Romantiskas vakariņas ar ${p.first}.`})],
  bar:b=>[I('Dzēriens','+prieks',10,6,()=>{need('fun',8);need('energy',-3);return 'Atsvaidzinoši!'}),I('Kokteilis','+prieks',15,12,()=>{need('fun',14);return 'Mojito ar piparmētru.'}),...withComp('Uzsaukt dzērienu','+romantika',15,12,p=>{compBoost(p,6,8);need('fun',8);return `${p.first} pasmaida.`}),...jobItems(b)],
  vipbar:b=>[I('Šampanietis','+prieks, +slava',15,60,()=>{need('fun',20);addRep(1);return 'Burbuļi un zelts.'}),...withComp('Šampanietis divatā','+romantika',20,120,p=>{compBoost(p,8,14);return 'Toasts par jums!'}),...jobItems(b)],
  pool:b=>[I('Spēlēt biljardu','+prieks',30,5,()=>{need('fun',12);addStat('smarts',.5);return rnd()<.5?'Tu uzvari!':'Šoreiz zaudējums.'}),...withComp('Biljards','+draudzība',30,5,p=>{compBoost(p,8,2);need('fun',12);return 'Jautra partija.'})],
  karaoke:b=>[I('Dziedāt karaoke','Harizmas pārbaude',30,0,()=>{need('fun',10);if(rnd()<.3+C().stats.charm/140){addRep(2);addStat('charm',1);return 'Zāle aplaudē!'}addRep(-1);return 'Nu… vismaz bija jautri.'})],
  dance:b=>[M_('Dejot','Deju minispēle · 30 min',()=>startDance(b,null)),...(compP()?[M_(`Dejot kopā ar ${compP().first}`,'+romantika',()=>startDance(b,compP()))]:[]),...(b.type==='club'||b.type==='vip'?[]:[])],
  danceLesson:b=>[I('Deju nodarbība','+deju prasme',60,25,()=>{C().skills.dance=cl(C().skills.dance+4);need('fun',6);return `Deju prasme: ${Math.round(C().skills.dance)}`}),M_('Vingrināties','Deju minispēle',()=>startDance(b,null))],
  danceDesk:b=>jobItems(b),
  dj:b=>[I('Palūgt dziesmu','+prieks',5,0,()=>{need('fun',4);return 'DJ uzliek tavu mīļāko dziesmu!'}),...jobItems(b)],
  clothes:b=>[M_('Apskatīt apģērbus','Butiks',()=>shopClothes(false))],
  luxe:b=>[M_('Apskatīt kolekciju','Dizaineru apģērbi',()=>shopClothes(true))],
  mirror:b=>[M_('Pārģērbties','Garderobe',()=>wardrobeModal())],
  shopCounter:b=>[...(b.type==='mall'?[]:[]),...jobItems(b)],
  elecCounter:b=>jobItems(b),furnCounter:b=>[M_('Mēbeļu katalogs','Pirkt mēbeles',()=>furnShop())].concat(jobItems(b)),superCounter:b=>jobItems(b),
  hair:b=>[M_('Frizūra','Mainīt matus',()=>hairModal())],salon:b=>[I('Manikīrs','+izskats',30,35,()=>{addStat('looks',1);return 'Nevainojami nagi.'}),I('Sejas maska','+izskats, +prieks',40,50,()=>{addStat('looks',1);need('fun',5);return 'Āda mirdz.'}),...jobItems(b)],
  flowers:b=>[I('Ziedu pušķis','Dāvanai',5,25,()=>{addInv('ziedi');return 'Rozes ietītas papīrā.'}),I('Plīša lācītis','Dāvanai',5,20,()=>{addInv('lacis');return 'Mīksts lācītis.'}),...jobItems(b)],
  gifts:b=>[M_('Dāvanu veikals','Šokolāde, smaržas, rotas…',()=>giftShop())].concat(jobItems(b)),
  foodcourt:b=>[I('Ātrā ēdināšana','+sāta',20,8,()=>{eat(45,3);return 'Burgers un frī kartupeļi.'}),...withComp('Pusdienas kopā','+draudzība',30,16,p=>{eat(45,4);compBoost(p,6,3);return 'Jautras pusdienas.'})],
  grocery:b=>[I('Pārtikas grozs','+5 maltītes ledusskapī',10,40,()=>{C().fridge+=5;return 'Ledusskapis būs pilns.'}),I('Sviestmaize','Somā',3,5,()=>{addInv('sviestmaize');return 'Sviestmaize somā.'}),I('Enerģijas dzēriens','Somā',3,3,()=>{addInv('energ');return 'Enerģija bundžā.'}),I('Šokolādes konfektes','Dāvanai',3,12,()=>{addInv('sokolade');return 'Konfektes somā.'}),I('Vīna pudele','Dāvanai',3,30,()=>{addInv('vins');return 'Labs sarkanvīns.'})],
  elec:b=>[M_('Tehnika mājām','TV, konsole, dators',()=>furnShop(['tv','console','stereo','desk']))].concat(jobItems(b)),
  furn:b=>[M_('Mēbeļu katalogs','Pirkt mēbeles',()=>furnShop())],
  realestate:b=>[M_('Mājokļu piedāvājumi','Īrēt vai pirkt',()=>homeModal())].concat(jobItems(b)),
  cars:b=>[M_('Transportlīdzekļi','Motorollers, auto…',()=>vehModal())],
  bank:b=>bankItems().concat(jobItems(b)),atm:()=>bankItems(),
  work:b=>{const c=C();if(c.job&&c.job.b===b.id)return jobItems(b);return [M_('Meklēt darbu','Biroja vakances',()=>listModal('Vakances',jobItems(b)))]},
  officeJobs:b=>jobItems(b).concat(bizItems()),
  lecture:b=>{const c=C(),h=hourNow();if(!c.study)return [I('Klausīties lekciju kā viesis','+gudrība',90,0,()=>{addStat('smarts',1);return 'Interesanta lekcija.'}),I('Publiskās runas kurss','+harizma',60,200,()=>{addStat('charm',3);return 'Tu runā pārliecinošāk.'})];
    const d=DEG.find(x=>x.id===c.study.id);return [I('Apmeklēt lekciju',`${d.n}: ${Math.floor(c.study.p)}/${d.m}`,180,0,()=>{c.study.p++;addStat('smarts',2);need('energy',-8);if(c.study.p>=d.m){c.degrees.push(d.id);c.study=null;log(`Tu absolvē universitāti: ${d.n}!`,'g');checkTrophies();return `Diploms! ${d.n}`}return 'Vēl viens solis līdz diplomam.'},h<8||h>=18?'Lekcijas 8:00–18:00':null),I('Publiskās runas kurss','+harizma',60,200,()=>{addStat('charm',3);return 'Tu runā pārliecinošāk.'})]},
  uniDesk:b=>{const c=C();return c.study?[I('Pamest studijas','',5,0,()=>{c.study=null;return 'Tu pamet studijas.'})]:[M_('Iestāties studijās','Studiju programmas',()=>degModal())]},
  read:b=>[I('Lasīt grāmatu','+gudrība, +prieks',60,0,()=>{addStat('smarts',2);need('fun',3);return 'Lieliska grāmata.'}),...(C().study?[I('Mācīties eksāmenam','+studiju progress',120,0,()=>{C().study.p+=.5;addStat('smarts',1);return 'Konspekti ir kārtībā.'})]:[])],
  libDesk:b=>jobItems(b),
  art:b=>[I('Aplūkot mākslu','+gudrība, +prieks',30,0,()=>{addStat('smarts',1);need('fun',6);return 'Iedvesmojoši.'}),...withComp('Izstāde kopā','+romantika',40,0,p=>{compBoost(p,6,6);return 'Jūs apspriežat gleznas.'})],
  buyArt:b=>[I('Nopirkt gleznu','160 € · mājai',10,160,()=>{C().furn.art='paint1';return 'Glezna nosūtīta uz mājām.'},C().furn.art?'Gleznas vieta jau aizņemta':null),I('Nopirkt mākslas darbu','3200 € · mājai',10,3200,()=>{C().furn.art='paint2';addRep(1);return 'Oriģināls darbs tavās mājās!'},C().furn.art==='paint2'?'Jau pieder':null)].concat(jobItems(b)),
  govPodium:b=>{const c=C(),o=c.office,out=[];if(['saeima','ministrs','premjers'].includes(o))out.push(M_('Iesniegt likumprojektu','Saeimas balsojums',()=>lawModal()));if(o==='deputats'||o==='mers')out.push(M_('Pilsētas projekti','Domes lēmums',()=>projModal()));
    if(o)out.push(I('Uzrunāt kolēģus','+ietekme, +slava',60,0,()=>{addInf(2);if(rnd()<.3+c.stats.charm/150){addRep(2);return 'Runa izpelnās aplausus.'}return 'Daži aizmieg.'}));if(o==='prezidents')out.push(I('Valsts vizīte','+slava, +ietekme',120,0,()=>{addRep(4);addInf(2);return 'Vizīte stiprina valsts tēlu.'}));
    if(!out.length)out.push(I('Uzkāpt tribīnē','Tikai deputātiem…',5,0,()=>{addRep(-1);return 'Apsardze tevi pieklājīgi aizved prom.'}));return out},
  govSeats:b=>[I('Novērot sēdi','+ietekme, +gudrība',60,0,()=>{addInf(1);addStat('smarts',1);return 'Tu redzi, kā tiek pieņemti lēmumi.'}),I('Protestēt','+slava, aresta risks',30,0,()=>{if(rnd()<(S.country.laws.includes('police')?.12:.06)){goJail(2);return 'Policija tevi aiztur.'}addRep(2);if(C().party&&!S.country.gov.includes(C().party))C().standing=cl(C().standing+3);return 'Tavu plakātu rāda ziņās.'})],
  govDesk:b=>{const c=C();return [M_('Pieteikties vēlēšanām','Kandidēšana',()=>candModal(),c.cand?'Jau esi kandidāts':(!c.party&&c.inf<75)?'Vajag partiju':null),...(c.office?[I('Slēgta lobija sanāksme','+ietekme, korupcijas risks',60,0,()=>{addInf(4);c.standing=cl(c.standing+2);if(rnd()<.35){c.corrupt+=8;c.money+=R(2000,8000);return 'Tev „pateicas” aploksnē.'}return 'Noderīgi kontakti.'})]:[]),...jobItems(b)]},
  partyDesk:b=>partyItems().concat(jobItems(b)),
  phonebank:b=>[I('Zvanīt vēlētājiem','+kampaņas punkti',120,0,()=>{C().campaign+=6;C().standing=cl(C().standing+2);return 'Tu pārliecināji desmitiem vēlētāju.'},!C().cand?'Vajag kandidēt vēlēšanās':null)],
  police:b=>[I('Brīvprātīgais patruļā','+slava',60,0,()=>{addRep(1);addStat('health',1);return 'Ielas ir drošākas.'}),...jobItems(b)],
  tvshow:b=>[I('Tok-šovs','Harizmas pārbaude',60,0,()=>{const c=C();if(rnd()<.35+c.stats.charm/150){addRep(5);addInf(2);return 'Tu esi šova zvaigzne!'}addRep(-4);return 'Neveikls teikums kļūst par mēmi.'},C().rep<15&&!C().office?'Vajag slavu 15':null)],
  news:b=>[I('Kampaņas reklāma','+12 kampaņas punkti',30,1500,()=>{C().campaign+=12;return 'Tavi plakāti ir visā Ostmalā.'},!C().cand?'Vajag kandidēt vēlēšanās':null),I('Viedokļraksts','+ietekme',60,0,()=>{if(rnd()<.3+C().stats.smarts/140){addInf(2);addRep(1);return 'Raksts tiek plaši apspriests.'}return 'Rakstu gandrīz neviens nelasa.'}),...jobItems(b)],
  mediaDesk:b=>jobItems(b),
  photoshoot:b=>[I('Fotosesija','+slava, +nauda',90,0,()=>{const c=C();if(c.stats.looks+styleScore()/2>70){addRep(3);c.money+=200;return 'Bildes ir žurnāla vākam! +200 €'}addRep(1);return 'Fotogrāfs saka: „Vēl jāpastrādā.”'},C().stats.looks<45?'Vajag izskatu 45':null)],
  agencyDesk:b=>jobItems(b),
  hotel:b=>[I('Īrēt numuru un gulēt','Diena beidzas',0,120,()=>{setTimeout(()=>endDay('hotel'),30);return 'Numurs ar skatu uz jūru.'}),...withComp('Romantiska nakts viesnīcā','+romantika',0,180,p=>{compBoost(p,8,15);setTimeout(()=>endDay('hotel'),30);return 'Neaizmirstama nakts.'},compP()&&compP().rom<45?'Vajag romantiku 45':null),...jobItems(b)],
  piano:b=>[I('Spēlēt klavieres','+harizma, +prieks',30,0,()=>{addStat('charm',1);need('fun',8);return 'Skaista melodija.'})],
  hosp:b=>{const pr=S.country.laws.includes('health')?20:80;return [I('Ārsta vizīte','+veselība',60,pr,()=>{addStat('health',15);return 'Ārsts izraksta ārstēšanu.'}),I('Psihoterapeits','+laime',60,60,()=>{addStat('happy',10);need('fun',5);return 'Saruna palīdz.'}),I('Plastiskā ķirurģija','+izskats (ar risku)',240,5000,()=>{if(rnd()<.85){addStat('looks',12);return 'Operācija izdodas.'}addStat('looks',-8);addStat('health',-10);return 'Komplikācijas…'}),...jobItems(b)]},
  treadmill:b=>[I('Skriet','+veselība, +izskats',60,0,()=>{addStat('health',3);addStat('looks',1);need('energy',-12);return 'Labs skrējiens!'},C().needs.energy<15?'Pārāk noguris':null)],
  weights:b=>[I('Spēka treniņš','+izskats, +veselība',60,0,()=>{addStat('health',2);addStat('looks',2);need('energy',-14);return 'Muskuļi aug!'},C().needs.energy<15?'Pārāk noguris':null)],
  yoga:b=>[I('Joga','+prieks, +laime',45,0,()=>{need('fun',5);addStat('happy',2);need('energy',5);return 'Prāts ir mierīgs.'})],
  gymDesk:b=>jobItems(b),
  movie:b=>[I('Skatīties filmu','+prieks',120,10,()=>{need('fun',30);return pick(['Asa sižeta grāvējs!','Romantiska komēdija.','Šausmene — brr!'])}),...withComp('Filma divatā','+romantika',120,20,p=>{need('fun',30);compBoost(p,6,10);return 'Jūs sadevāties rokās tumšajā zālē.'})],
  snacks:b=>[I('Popkorns','+sāta',5,5,()=>{eat(12,3);return 'Sālīts popkorns.'})],
  slots:b=>[10,50,200].map(v=>I(`Likt ${v} €`,'Laimes spēle',5,v,()=>{need('fun',4);const r=rnd();if(r<.02){C().money+=v*20;return `DŽEKPOTS! +${eur(v*20)}`}if(r<.3){C().money+=v*2;return `Laimests: ${eur(v*2)}`}return 'Neveiksme.'})),
  roulette:b=>[I('Likt 100 € uz sarkano','Gandrīz 50/50',5,100,()=>{need('fun',6);if(rnd()<.47){C().money+=200;return 'Sarkanais! +200 €'}return 'Melnais. Zaudējums.'}),...jobItems(b)],
  yacht:b=>[I('Izbraukt ar jahtu','+prieks, +slava',120,300,()=>{need('fun',30);addRep(2);return 'Vējš matos un jūra apkārt.'}),...withComp('Jahtas brauciens divatā','+romantika',120,350,p=>{need('fun',30);compBoost(p,10,16);return 'Saulriets jūrā.'}),...jobItems(b)],
  smuggle:b=>{const c=C(),pol=S.country.laws.includes('police')?1.6:1,night=hourNow()>=21?.6:1;return [I('Kontrabandas darījums','Peļņa un risks (naktī drošāk)',60,0,()=>{const r=rnd();if(r<.15*pol*night){goJail(R(6,24));return 'Policijas reids!'}if(r<.4)return 'Kravas nav.';const g=R(2000,6000);c.money+=g;return `Darījums izdodas: +${eur(g)}.`}),
    I('Kompromats uz konkurentu','+ietekme, risks',60,3000,()=>{if(rnd()<.22){addRep(-15);c.corrupt+=10;return 'Kompromats atsitas pret tevi!'}addInf(6);c.standing=cl(c.standing+4);return 'Konkurents ir spiests klusēt.'},!c.party?'Vajag partiju':null),I('Uzpirkt ierēdni','+ietekme, korupcija',30,2000,()=>{c.corrupt+=10;addInf(5);return 'Dokumenti pēkšņi kustas ātrāk.'})]},
  portDesk:b=>jobItems(b),
  mail:b=>[I('Pārbaudīt pastkastīti','',2,0,()=>{if(S.mailDay===S.day)return 'Pastkastīte tukša.';S.mailDay=S.day;if(rnd()<.3){C().money+=20;return 'Atrasts kupons: +20 €'}return pick(['Reklāmas buklets.','Rēķins par elektrību (jau samaksāts).','Vēstule no vecmāmiņas!'])})],
  elevator:b=>{const res=residentsOf(b),h=hourNow();return res.length?res.map(p=>I(`Uz ${p.first} dzīvokli`,relName(p),2,0,()=>{if(locOf(p,h)===b.id&&(p.close>=15||isFamily(p))){setTimeout(()=>doEnter(b,'flat',p.id),20);return `${p.first} atver durvis.`}return 'Neviens neatver.'})):[I('Braukt ar liftu','Tu nevienu šeit nepazīsti',2,0,()=>'Lifts aizved līdz augšai un atpakaļ.')]},
  visit:b=>{const p=pById(S.where.owner);if(!p)return [];return [I(`Ciemoties pie ${p.first}`,'+draudzība, +prieks',60,0,()=>{compBoost(p,8,isFamily(p)?0:3);need('fun',6);if(isFamily(p))eat(30);return isFamily(p)?'Mājas vakariņas kā bērnībā!':'Jauks vakars ciemos.'}),
    ...(['partner','spouse'].includes(p.rel)||p.rom>=60?[I('Palikt pa nakti','Diena beidzas',0,0,()=>{compBoost(p,4,8);setTimeout(()=>endDay('friend'),30);return 'Labu nakti.'})]:[])]},
  visitBed:b=>ACT.visit(b),
  bed:b=>{const c=C(),sp=S.people.find(p=>['spouse','partner'].includes(p.rel)&&p.alive&&(p.livesWith||p.rel==='spouse'||p.id===S.comp));
    return [I('Gulēt','Diena beidzas, paiet mēnesis',0,0,()=>{setTimeout(()=>endDay('home'),30);return 'Labu nakti!'}),I('Pasnaust','+enerģija',60,0,()=>{need('energy',18);return 'Īss miegs palīdz.'}),
      ...(sp?[I('Plānot bērnu',`kopā ar ${sp.first}`,60,0,()=>{const fa=c.sex==='f'?ageOf(c.bT):sp.sex==='f'?ageOf(sp.bT):40;if(fa>46)return 'Vecums vairs neļauj.';compBoost(sp,4,6);
        if(rnd()<.42){const kid=mkPerson({rel:'child',surIdx:c.surIdx,bT:S.T,close:80,phone:false,met:1,stats:rollStats(Math.min(15,S.prestige/6),c.stats)});kid.homeB=HOMES[c.home].b;S.people.push(kid);genSched(kid);addStat('happy',12);log(`Piedzimst tavs ${kid.sex==='m'?'dēls':'meita'} ${kid.first}!`,'g');checkTrophies();return `Ģimenē ienāk ${kid.first}!`}return 'Šoreiz neizdevās.'})]:[])]},
  wardrobe:b=>[M_('Pārģērbties','Garderobe',()=>wardrobeModal())],
  fridge:b=>{const c=C();return [I('Ēst','+sāta',20,0,()=>{c.fridge--;eat(45,2);return 'Mājas maltīte.'},c.fridge<=0?'Ledusskapis tukšs — iepērcies lielveikalā':null),...withComp('Pagatavot vakariņas','+romantika',60,0,p=>{c.fridge-=2;eat(50,6);compBoost(p,8,10);return 'Svecītes un mājas vakariņas.'},c.fridge<2?'Vajag 2 maltītes':null)]},
  homeSofa:b=>[I('Atpūsties','+enerģija, +prieks',40,0,()=>{need('energy',10);need('fun',5);return 'Tu atslābsti.'}),...withComp('Apskāvieni uz dīvāna','+romantika',30,0,p=>{compBoost(p,5,10);return 'Silti un mājīgi.'})],
  homeTv:b=>[I('Skatīties TV','+prieks',60,0,()=>{need('fun',12+homeComfort().fun/3);return pick(['Ziņas: '+S.country.pm+' runā par budžetu.','Seriāls „Ostmalas noslēpumi”.','Futbola spēle!'])})],
  homeConsole:b=>[I('Spēlēt videospēles','+prieks',60,0,()=>{need('fun',16);return 'Vēl tikai viens līmenis…'}),...withComp('Spēlēt kopā','+draudzība',60,0,p=>{compBoost(p,8,2);need('fun',14);return 'Kurš uzvarēja? Strīdīgi.'})],
  homeStereo:b=>[I('Klausīties mūziku','+prieks',30,0,()=>{need('fun',8);return 'Mīļākā playlist.'}),...withComp('Lēnā deja','+romantika',20,0,p=>{compBoost(p,4,10);return 'Jūs dejojat istabas vidū.'})],
  homeAqua:b=>[I('Vērot zivtiņas','+laime',15,0,()=>{addStat('happy',2);need('fun',3);return 'Nomierinoši.'})],
  homeDesk:b=>{const c=C(),j=jobDef(),remote=j&&['dev','analyst','journo'].includes(j.id);return [I('Rakstīt blogu','+slava, +ietekme',60,0,()=>{if(rnd()<.3+c.stats.smarts/150){addRep(1);addInf(1);return 'Ieraksts kļūst populārs!'}return 'Daži lasītāji.'}),I('Lasīt ziņas','+gudrība',20,0,()=>{addStat('smarts',1);return `Valdības reitings: ${approval()}%.`}),
    ...(remote?[I('Strādāt no mājām','Darba maiņa',240,0,()=>workShift(j),c.job.worked?'Šodien jau strādāts':null)]:[]),M_('Darba sludinājumi','Visas vakances',()=>allJobsModal())]},
  swim:b=>[I('Peldēt baseinā','+prieks, +veselība',40,0,()=>{need('fun',10);addStat('health',2);return 'Atsvaidzinoši!'})],
  fountain:o=>[I('Iemest monētu','Ievēlēties…',2,1,()=>{if(rnd()<.15){C().money+=50;return 'Tu atrodi 50 € pie strūklakas malas!'}need('fun',2);return 'Vēlēšanās ir izteikta.'})],
  bench:o=>[I('Atpūsties','+enerģija',20,0,()=>{need('energy',6);return 'Tu vēro garāmgājējus.'})],
  lounger:o=>[I('Sauļoties','+prieks, +izskats',60,0,()=>{need('fun',8);addStat('looks',.5);addStat('happy',2);return 'Saule silda.'},hourNow()>=20||hourNow()<9?'Saule nespīd':null),I('Peldēt jūrā','+veselība, +prieks',40,0,()=>{addStat('health',3);need('fun',8);return 'Viļņi ir vēsi un spirgti.'}),...withComp('Pastaiga gar jūru','+romantika',40,0,p=>{compBoost(p,6,10);return 'Saulriets pār jūru.'})],
  cart:o=>[I({hotdog:'Hotdogs',smoothie:'Smūtijs',icecart:'Saldējums'}[o.kind],'+sāta',5,o.kind==='hotdog'?4:3,()=>{eat(o.kind==='hotdog'?30:12,4);if(o.kind==='smoothie')need('energy',8);return 'Gardi!'})],
  taxi:o=>TAXIS.filter(t=>t.x!==o.x||t.y!==o.y).map(t=>I(`Uz: ${t.n}`,'Taksometrs',10,12,()=>{P.x=t.x+.5;P.y=t.y+.5;P.path=[];cam.init=false;spawnCity();return `Taksometrs aizved tevi: ${t.n}.`})).concat([I('Uz mājām','Taksometrs',10,15,()=>{const b=bld(HOMES[C().home].b);P.x=b.door[0]+.5;P.y=b.door[1]+.5;cam.init=false;spawnCity();return 'Esi pie mājām.'})])
};
function addInv(k){const i=C().inv;i[k]=(i[k]||0)+1}
function bankItems(){const c=C();return [I('Noguldīt 1000 €','0,3% mēnesī',5,1000,()=>{c.savings+=1000;return 'Nauda noguldīta.'}),I('Izņemt noguldījumu',`Noguldīts ${eur(c.savings)}`,5,0,()=>{const v=c.savings;c.money+=v;c.savings=0;return `Izņemti ${eur(v)}.`},c.savings<=0?'Nav noguldījuma':null),
  I('Ņemt kredītu 10 000 €','~11% gadā',10,0,()=>{c.money+=10000;c.debt+=10000;return 'Kredīts piešķirts.'},c.debt>60000?'Banka atsaka':null),I('Atmaksāt kredītu',`Parāds ${eur(c.debt)}`,5,0,()=>{const v=Math.min(c.debt,Math.max(0,c.money));c.money-=v;c.debt-=v;return `Atmaksāti ${eur(v)}.`},c.debt<=0?'Nav parāda':c.money<=0?'Nav naudas':null)]}
function bizItems(){const c=C();if(!c.biz)return [I('Dibināt uzņēmumu','Ieguldījums',60,12000,()=>{c.biz={n:pick(['Baltā Osta','Dzintara loģistika','Ostmala Digital','Jūras Garša','Ziemeļu būve']),val:12000};addInf(2);return `Dibināts uzņēmums „${c.biz.n}”.`})];
  return [I('Paplašināt uzņēmumu',`Vērtība ${eur(c.biz.val)}`,120,Math.round(c.biz.val*.3),()=>{const ok=rnd()<.7+c.stats.smarts/400;c.biz.val=Math.round(c.biz.val*(ok?1.45:1.05));addInf(ok?3:0);return ok?'Uzņēmums aug!':'Pieaugums neliels.'}),I('Pārdot uzņēmumu','Saņem tirgus vērtību',30,0,()=>{const v=c.biz.val;c.money+=v;c.biz=null;return `Uzņēmums pārdots par ${eur(v)}.`})]}
function partyItems(){const c=C();if(!c.party)return [M_('Iestāties partijā','Izvēlies ideoloģiju',()=>partyModal()),M_('Dibināt savu partiju','15 000 € · ietekme 35',()=>foundParty(),c.inf<35?'Vajag ietekmi 35':null)];
  const P_=party(c.party);const out=[I('Brīvprātīgais darbs',`Partijas atbalsts ${Math.round(c.standing)}/100`,120,0,()=>{c.standing=cl(c.standing+5);addInf(2);return `${P_.sh} biedri novērtē tavu darbu.`}),I('Ziedot partijai','+partijas atbalsts',5,2000,()=>{c.standing=cl(c.standing+8);return 'Partijas kase ir pateicīga.'})];
  if(c.rank<3)out.push(I('Kandidēt uz priekšsēdētāju','Partijas kongress',180,0,()=>{if(rnd()<(c.standing-40)/60+c.inf/300){c.rank=3;addInf(6);log(`Tu kļūsti par partijas „${P_.n}” priekšsēdētāju!`,'g');return 'Kongress tevi ievēl!'}c.standing=cl(c.standing-10);return 'Kongress izvēlas citu.'},c.rank<2?'Vajag būt valdes loceklim':c.inf<45?'Vajag ietekmi 45':null));
  out.push(I('Izstāties no partijas','',5,0,()=>{if(c.party==='own')return 'Tu nevari pamest paša dibināto partiju.';c.party=null;c.standing=0;c.rank=0;c.cand=null;c.campaign=0;return 'Tu izstājies no partijas.'}));return out}
function objTitle(o){const b=S.where?bld(S.where.b):null;const n={tree:'Koks',bench:'Soliņš',lounger:'Pludmale',cart:'Kiosks',atm:'Bankomāts',taxi:'Taksometru pietura',fountain:'Strūklaka'}[o.k];if(n)return n;
  return {counter:'Lete',bar:'Bārs',table:'Galdiņš',table4:'Galds',dance:'Deju grīda',dj:'DJ pults',rack:'Apģērbi',mirror:'Spogulis',bed:'Gulta',fridge:'Ledusskapis',wardrobe:'Skapis',sofa:'Dīvāns',tvstand:'Televizors',desk:'Galds',seats:'Sēdvietas',podium:'Tribīne',bookshelf:'Grāmatplaukts',slot:'Spēļu automāts',roulette:'Rulete',treadmill:'Skrejceliņš',weights:'Svari',salonchair:'Friziera krēsls',shelf:'Plaukts',crates:'Kastes',teller:'Kase',atmI:'Bankomāts'}[o.k]||(b?b.n:'')}
function openObj(o){
  const b=S.where?bld(S.where.b):null,f=ACT[o.act];if(!f)return;
  const list=f(b||o);if(!list.length){toast('Šeit nav ko darīt.');return}
  listModal(objTitle(o),list,()=>openObj(o),b?b.n:null);
}
function listModal(title,list,reopen,sub){
  modal({t:title,sub:(sub?sub+' · ':'')+clockStr(),ch:list.map(it=>({l:it.l,s:[it.s,it.t?`${it.t>=60?(it.t/60).toFixed(it.t%60?1:0)+' h':it.t+' min'}`:'',it.cost?eur(it.cost):''].filter(Boolean).join(' · '),why:it.lock,dis:!!it.lock,fn:()=>{
    if(it.m){it.fn();return}
    if(!spendT(it.t||0,it.cost||0)){if(reopen)reopen();return}
    const msg=it.fn();if(msg){log(msg);toast(msg)}checkTrophies();refreshUI();save();
    if(reopen&&!S.dead&&!C().jail&&!it.close&&S.where!==undefined)setTimeout(()=>{if(!$('#modalRoot').innerHTML&&S.min<DAY_MIN)reopen()},10);
  }})).concat([{l:'Aizvērt',exit:true}])});
}

/* ---------- Sarunas ---------- */
function bubble(n,t){n.bub=t;n.bubT=2.4}
function socialMenu(n){
  const c=C(),p=pById(n.pid);if(!p){n.talking=false;return}
  const close=()=>{n.talking=false;n.hold=false};
  const again=()=>{if(!S.dead&&!C().jail&&p.alive)socialMenu(n);else close()};
  const mm=moodMul(),adult=ageOf(p.bT)>=18&&ageOf(c.bT)>=18,fam=isFamily(p);
  const act=(l,s,mins,fn,lock)=>({l,s:s+(mins?` · ${mins} min`:''),dis:!!lock,why:lock,fn:()=>{if(!spendT(mins,0)){close();return}const r=fn();if(r){toast(r.msg);if(r.b)bubble(n,r.b)}checkTrophies();renderHUD();save();again()}});
  const ch=[];
  if(p.rel==='none'){
    ch.push({hdr:'Iepazīšanās'});
    ch.push(act('Iepazīties','Sasveicināties un pajautāt vārdu',10,()=>{if(rnd()<(.55+c.stats.charm/200+c.stats.looks/400+c.rep/300)*mm){p.rel='acq';p.met=1;p.close=cl(15+Math.round(c.stats.charm/6));log(`Tu iepazīsties ar ${fullName(p)}.`);return {msg:`Prieks iepazīties, ${p.first}!`,b:'Sveiks!'}}return {msg:'Garāmgājējs steidzas tālāk.',b:'Nav laika…'}}));
    if(c.cand)ch.push(act('Lūgt balsi','Kampaņa uz ielas',10,()=>{if(p.pref===c.party||rnd()<c.stats.charm/160*mm){c.campaign+=2;return {msg:'Apsola balsot par tevi!',b:'Balsošu!'}}return {msg:'„Es neticu politiķiem.”',b:'Hmm…'}}));
  } else {
    ch.push({hdr:'Draudzīgi'});
    ch.push({l:'Runāt par…',s:'Izvēlies tēmu · 15 min',fn:()=>topicMenu(n,p)});
    ch.push(act('Pajokot','Harizma',10,()=>{if(rnd()<(.3+c.stats.charm/120)*mm){p.close=cl(p.close+7);return {msg:`${p.first} smejas.`,b:'Hahaha!'}}p.close=cl(p.close-4);return {msg:'Joks nenostrādā.',b:'…'}}));
    ch.push(act('Izteikt komplimentu','Stils + harizma',10,()=>{if(rnd()<(.3+(c.stats.charm+styleScore())/220)*mm){p.close=cl(p.close+6);return {msg:`${p.first} ir glaimots.`,b:'Ak, paldies!'}}p.close=cl(p.close-3);return {msg:'Tas izklausījās dīvaini.',b:'Ēē…'}}));
    ch.push(act('Apskaut','',5,()=>{if(p.close>=35||fam){p.close=cl(p.close+5);return {msg:'Silts apskāviens.',b:'♥'}}p.close=cl(p.close-6);return {msg:`${p.first} atkāpjas.`,b:'Ē…'}},p.close<20&&!fam?'Vajag draudzību 20':null));
    if(!p.phone)ch.push(act('Lūgt telefona numuru','',5,()=>{if(p.close>=25&&rnd()<.7*mm+.2){p.phone=true;return {msg:`${p.first} iedod numuru!`,b:'Piezvani!'}}return {msg:'„Varbūt kādreiz.”',b:'Hmm.'}},p.close<15?'Vajag draudzību 15':null));
    if(!fam&&adult){
      ch.push({hdr:'Romantiski'});
      if(!['spouse'].includes(p.rel))ch.push(act('Flirtēt','Izskats + stils',10,()=>{if(rnd()<(.2+c.stats.looks/180+styleScore()/180+p.close/350)*mm){p.rom=cl(p.rom+9);return {msg:`${p.first} sarkst.`,b:'❤'}}p.rom=cl(p.rom-4);p.close=cl(p.close-2);return {msg:'Neveikls brīdis.',b:'Nu…'}}));
      ch.push(act('Noskūpstīt','',5,()=>{if(p.rom>=45&&rnd()<.75*mm+.15){p.rom=cl(p.rom+10);c.flags.kiss=true;return {msg:'Skūpsts!',b:'❤❤'}}p.rom=cl(p.rom-10);p.close=cl(p.close-6);return {msg:`${p.first} novēršas.`,b:'Ei!'}},p.rom<30?'Vajag romantiku 30':null));
      if(['acq','friend','ex'].includes(p.rel)&&!S.people.some(x=>['partner','spouse'].includes(x.rel)&&x.alive))ch.push(act('Piedāvāt attiecības','',10,()=>{if(p.rom>=55&&rnd()<p.rom/100+.1){p.rel='partner';c.flags.partner=true;addStat('happy',10);log(`Tu un ${p.first} esat pāris!`,'g');return {msg:'Jā! Jūs esat pāris!',b:'❤❤❤'}}p.rom=cl(p.rom-8);return {msg:`${p.first} grib vēl pagaidīt.`,b:'Varbūt vēlāk…'}},p.rom<45?'Vajag romantiku 45':null));
      if(p.rel==='partner'){ch.push(act('Bildināt','Vajag gredzenu',10,()=>{if(!c.inv.gredzens)return {msg:'Tev vajag saderināšanās gredzenu (Tirdzniecības centrā).'};c.inv.gredzens--;if(rnd()<p.rom/100+.1){p.rel='spouse';p.livesWith=1;c.flags.married=true;addStat('happy',15);log(`Kāzas ar ${fullName(p)}!`,'g');return {msg:'JĀ! Kāzas pie jūras!',b:'❤❤❤'}}p.rom=cl(p.rom-10);return {msg:'„Vēl neesmu gatavs/-a.”',b:'…'}},p.rom<70?'Vajag romantiku 70':null));
        if(!p.livesWith)ch.push(act('Aicināt dzīvot kopā','',10,()=>{if(p.rom>=60){p.livesWith=1;return {msg:`${p.first} pārvācas pie tevis!`,b:'Jā!'}}return {msg:'Vēl par agru.',b:'Hmm.'}},c.home===0?'Vispirms vajag savu mājokli':null))}
      if(['partner','spouse'].includes(p.rel))ch.push(act(p.rel==='spouse'?'Šķirties':'Izšķirties','',10,()=>{if(p.rel==='spouse')c.money=Math.round(c.money*.7);p.rel='ex';p.livesWith=0;p.rom=cl(p.rom-40);addStat('happy',-10);if(S.comp===p.id)dismissComp(true);return {msg:'Attiecības beidzas.',b:'…'}}));
    }
    ch.push({hdr:'Kopā'});
    if(S.comp===p.id)ch.push({l:'Atvadīties līdz nākamajai reizei',s:'Beigt kopā pavadīto laiku',fn:()=>{dismissComp();close()}});
    else ch.push(act('Nāc man līdzi!','Pavadonis staigās tev līdzi',5,()=>{if(p.close>=30||p.rom>=25||fam){if(S.comp)dismissComp(true);setComp(p);return {msg:`${p.first} nāk tev līdzi.`,b:'Ejam!'}}return {msg:`${p.first} šobrīd nevar.`,b:'Piedod.'}},p.close<30&&p.rom<25&&!fam?'Vajag draudzību 30':null));
    const gifts=Object.keys(c.inv).filter(k=>c.inv[k]>0&&ITEMS[k].gift);
    if(gifts.length)ch.push({l:'Dāvināt…',s:gifts.map(k=>ITEMS[k].n).join(', '),fn:()=>giftMenu(n,p)});
    ch.push({hdr:'Naidīgi'});
    ch.push(act('Strīdēties','',10,()=>{p.close=cl(p.close-10);if(p.close<5&&!fam)p.enemy=true;addStat('happy',-2);return {msg:'Asa vārdu apmaiņa.',b:'Kā tu uzdrīksties?!'}}));
    ch.push(act('Iepļaukāt','',5,()=>{p.close=cl(p.close-25);p.rom=cl(p.rom-30);addRep(-2);if(!fam)p.enemy=true;if(rnd()<.4){addStat('health',-6);return {msg:`${p.first} atbild ar dūri!`,b:'Saņem!'}}return {msg:'Pļauks!',b:'Au!'}}));
    if(c.party){ch.push({hdr:'Politika'});
      ch.push(act('Runāt par politiku',`Atbalsta: ${party(p.pref)?party(p.pref).sh:'—'}`,15,()=>{if(p.pref===c.party){p.close=cl(p.close+5);addRep(.5);return {msg:'Jūs esat vienisprātis!',b:'Piekrītu!'}}
        if(rnd()<(c.stats.smarts/220+c.stats.charm/300)*mm){p.pref=c.party;p.close=cl(p.close+2);addInf(1);return {msg:`Tu pārliecini ${p.first}!`,b:'Varbūt tev taisnība.'}}p.close=cl(p.close-4);return {msg:'Strīds par politiku.',b:'Nepiekrītu!'}}));
      if(p.pref===c.party&&!p.joined)ch.push(act('Aicināt iestāties partijā','+partijas atbalsts',15,()=>{p.joined=true;c.standing=cl(c.standing+5);addInf(1);return {msg:`${p.first} iestājas ${party(c.party).sh}!`,b:'Esmu iekšā!'}},p.close<50?'Vajag draudzību 50':null));
      if(c.cand)ch.push(act('Lūgt balsi','Kampaņa',10,()=>{if(p.pref===c.party||rnd()<.3+p.close/150){c.campaign+=2+p.close/30;return {msg:'Apsola balsot par tevi!',b:'Protams!'}}return {msg:'Balsos par savējiem.',b:'Piedod.'}}));
    }
  }
  // uzdevumi
  if(p.qOffer){ch.unshift({l:'„Vai varu kā palīdzēt?”',s:p.qOffer.desc,fn:()=>{acceptQuest(p);again()}})}
  S.quests.filter(q=>!q.done&&q.giver===p.id).forEach(q=>{
    if(q.type==='bring'&&C().inv[q.item])ch.unshift({l:`Atdot: ${ITEMS[q.item].n}`,s:`Atlīdzība ${eur(q.reward)}`,fn:()=>{C().inv[q.item]--;completeQuest(q);bubble(n,'Paldies!');again()}});
    if(q.type==='pet'&&C().inv.kakis)ch.unshift({l:'Atdot kaķi Minci',s:`Atlīdzība ${eur(q.reward)}`,fn:()=>{completeQuest(q);bubble(n,'Mince!!!');again()}});
  });
  ch.push({l:'Atvadīties',exit:true,fn:close});
  const known=p.rel!=='none';
  const likes=known?TOPICS.filter(t=>p.known&&p.known[t]).map(t=>(p.traits.likes.includes(t)?'❤ ':p.traits.dis.includes(t)?'✕ ':'· ')+t).join('  '):'';
  const b=known?`<div class="relrow"><span>Draudzība</span>${bar(p.close)}<b>${Math.round(p.close)}</b></div>${!fam&&adult?`<div class="relrow"><span>Romantika</span>${bar(p.rom,'love')}<b>${Math.round(p.rom)}</b></div>`:''}${likes?`<p class="muted small">${esc(likes)}</p>`:''}`:'<p class="muted" style="margin:0">Tu vēl nepazīsti šo cilvēku.</p>';
  modal({t:known?fullName(p):'Svešinieks',sub:`${known?relName(p)+' · ':''}${ageOf(p.bT)} g.${p.jobT&&known?' · '+p.jobT:''} · ${clockStr()}`,b,ch});
}
function topicMenu(n,p){
  const c=C(),mm=moodMul();
  modal({t:`Runāt ar ${p.first} par…`,ch:TOPICS.map(t=>({l:t,s:p.known&&p.known[t]?(p.traits.likes.includes(t)?'Patīk!':p.traits.dis.includes(t)?'Nepatīk':'Neitrāli'):'',fn:()=>{
    if(!spendT(15,0)){n.talking=false;return}p.known=p.known||{};p.known[t]=1;
    let msg,b;if(p.traits.likes.includes(t)){p.close=cl(p.close+R(8,12)*mm);msg=`${p.first} dievina šo tēmu!`;b='Es to dievinu!'}else if(p.traits.dis.includes(t)){p.close=cl(p.close-6);msg=`${p.first} garlaikojas.`;b='Garlaicīgi…'}else{p.close=cl(p.close+R(2,4)*mm);msg='Jauka saruna.';b='Interesanti.'}
    if(p.rel==='acq'&&p.close>=45)p.rel='friend';if(p.rel==='friend'&&p.close<35)p.rel='acq';
    need('fun',2);toast(msg);bubble(n,b);checkTrophies();renderHUD();save();socialMenu(n)}})).concat([{l:'Atpakaļ',exit:true,fn:()=>socialMenu(n)}])});
}
function giftMenu(n,p){const c=C();const gifts=Object.keys(c.inv).filter(k=>c.inv[k]>0&&ITEMS[k].gift);
  modal({t:`Dāvana: ${p.first}`,ch:gifts.map(k=>({l:ITEMS[k].n,s:`Tev ir ${c.inv[k]}`,fn:()=>{c.inv[k]--;const [cc,rr]=ITEMS[k].gift;p.close=cl(p.close+cc);if(!isFamily(p)&&ageOf(p.bT)>=18)p.rom=cl(p.rom+rr);bubble(n,'Paldies!!');toast(`${p.first} priecājas par dāvanu.`);advance(5);save();socialMenu(n)}})).concat([{l:'Atpakaļ',exit:true,fn:()=>socialMenu(n)}])})}

/* ---------- Galvenais cikls ---------- */
let lastT=performance.now(),HUDT=0;
function frame(now){
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;TIME=now/1000;
  if(S&&S.c&&!S.dead&&S.tab==='city'&&!document.hidden){
    const h=hourNow();DUSK=h>=17?cl((h-17)/3,0,1):0;NIGHT=h>=19.5?cl((h-19.5)/2,0,1):0;if(S.where)NIGHT=Math.min(NIGHT,.9);
    const modalOpen=!!$('#modalRoot').innerHTML;
    if(!modalOpen&&!C().jail){
      if(!P.path.length&&keyDir){const m=curMap(),nx=Math.floor(P.x)+keyDir[0],ny=Math.floor(P.y)+keyDir[1];if(m.walk(nx,ny)){P.path=[[nx,ny]];P.target=null;
        if(!S.where){const door=BLDS.find(b=>b.door[0]===nx&&b.door[1]===ny);if(door)P.target={type:'door',id:door.id}}else if(nx===ROOM.exit[0]&&ny===ROOM.exit[1])P.target={type:'exit'}}}
      playerStep(dt);
    }
    if(!S.where)updCars(dt);updNPCs(dt);
    const ps=iso(P.x,P.y);let tx=ps.x,ty=ps.y-30;if(S.where){const rc=iso(ROOM.W/2,ROOM.H/2);tx=rc.x*.75+ps.x*.25;ty=(rc.y-40)*.75+(ps.y-30)*.25}if(!cam.init){cam.x=tx;cam.y=ty;cam.init=true}cam.x+=(tx-cam.x)*Math.min(1,dt*6);cam.y+=(ty-cam.y)*Math.min(1,dt*6);
    if(S.where)renderRoom(ROOM,dt);else renderCity(dt);
    HUDT+=dt;if(HUDT>.5){HUDT=0;const ck=document.querySelector('.pill.clock');if(ck)ck.textContent=C().jail?'--:--':clockStr()}
    if(!modalOpen&&S.min>=DAY_MIN){S.min=DAY_MIN;P.path=[];modal({t:'Ir 02:00',b:'<p>Tu esi pārāk noguris, lai turpinātu. Acis veras ciet…</p>',ch:[{l:'Gulēt',fn:()=>endDay(S.where&&S.where.variant==='home'?'home':S.where&&S.where.b==='hotel'?'hotel':'bench')}]})}
    else if(!modalOpen&&C().needs.energy<=0&&!C().jail){C().needs.energy=5;P.path=[];addStat('health',-4);modal({t:'Tu sabrūc no noguruma',b:'<p>Enerģija beigusies. Tev steidzami jāguļ.</p>',ch:[{l:'Gulēt',fn:()=>endDay(S.where&&S.where.variant==='home'?'home':'bench')}]})}
  }
  requestAnimationFrame(frame);
}
