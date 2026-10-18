/* ===================== Saskarne ===================== */
let toastT;
function toast(m){if(!m)return;clearTimeout(toastT);let el=document.querySelector('.toast');if(!el){el=document.createElement('div');el.className='toast';el.setAttribute('role','status');document.body.appendChild(el)}el.textContent=m;el.hidden=false;toastT=setTimeout(()=>el.hidden=true,2800)}
function tick(m,k){const tk=$('#ticker');if(!tk||!S)return;const d=document.createElement('div');d.className='glass '+(k||'');d.textContent=m;tk.appendChild(d);while(tk.children.length>3)tk.firstChild.remove();setTimeout(()=>d.remove(),6200)}
const MQ=[];
function nextModal(){const root=$('#modalRoot');if(!root.innerHTML&&MQ.length)modal(MQ.shift())}
function modal(o){
  const root=$('#modalRoot');if(root.innerHTML){MQ.push(o);return}
  const {t,sub,b,ch,closable}=o;
  root.innerHTML=`<div class="ov" role="dialog" aria-modal="true" aria-label="${esc(t)}"><div class="sheet"><div class="head">${sub?`<span class="lab">${esc(sub)}</span>`:''}<h2>${esc(t)}</h2></div>${b?`<div class="body">${b}</div>`:''}<div class="ch">${(ch||[]).map((c,i)=>c.hdr?`<div class="chh">${esc(c.hdr)}</div>`:`<button data-i="${i}" class="${c.exit?'exit':''}" ${c.dis?'disabled':''}><b>${esc(c.l)}</b>${c.s?`<span>${esc(c.s)}</span>`:''}${c.why?`<span class="why">${esc(c.why)}</span>`:''}</button>`).join('')}${closable?`<button data-x="1" class="exit"><b>Atpakaļ</b></button>`:''}</div></div></div>`;
  root.querySelectorAll('button[data-i]').forEach(btn=>btn.onclick=()=>{const c=ch[+btn.dataset.i];root.innerHTML='';if(c.fn)c.fn();else{refreshUI();save()}nextModal()});
  const x=root.querySelector('[data-x]');if(x)x.onclick=()=>{root.innerHTML='';refreshUI();nextModal()};
  const f=root.querySelector('button:not(:disabled)');if(f)f.focus({preventScroll:true});
}
function bar(v,cls='',plain){const w=cl(v);return `<div class="bar ${cls} ${plain?'':w<25?'low':w<45?'warn':''}"><span style="width:${w}%"></span></div>`}
function done(m){if(m){log(m);toast(m)}refreshUI();save()}
function refreshUI(){if(!S||!S.c)return;renderHUD();renderBanners();
  const tab=S.tab||'city';['phone','me','story'].forEach(t=>$('#tab-'+t).hidden=tab!==t);
  $('#fab').hidden=tab!=='city';$('#ticker').hidden=tab!=='city';$('#banners').hidden=tab!=='city';
  $('#exitBtn').hidden=!S.where;if(tab!=='city')$('#hint').hidden=true;
  document.querySelectorAll('nav.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));
  const unread=S.msgs.filter(m=>!m.read).length;$('#phoneDot').hidden=!unread;
  if(tab==='phone')renderPhone();if(tab==='me')renderMe();if(tab==='story')renderStory();
}
function renderHUD(){
  if(!S||!S.c)return;const c=C();
  const where=S.where?bld(S.where.b).n:DISTS[distAt(Math.floor(P.x),Math.floor(P.y))].n;
  $('#hud').innerHTML=`<div class="hud-card glass"><div class="r1">
    <img class="ava" src="${portraitURL(myLook(),c.sex,null)}" alt="">
    <div class="who"><b>${esc(c.first)}</b><span>${S.extended?S.day+'. diena':`Diena ${Math.min(S.day,LEASE_DAYS)}/${LEASE_DAYS}`} · ${WX[S.weather||'clear'].i} · ${esc(where)}</span></div>
    <div class="pill clock">${clockStr()}</div><div class="pill money">${usd(c.money)}</div>
  </div><div class="needs" id="needsRow"></div></div>`;
  renderNeeds();
  document.documentElement.style.setProperty('--hudH',$('#hud').offsetHeight+'px');
  $('#sleepBtn').textContent=S.where&&S.where.variant==='home'?'Iet gulēt':'Beigt dienu';
  const cp=compP();$('#compChip').hidden=!cp;if(cp)$('#compChip').textContent=`♥ ${cp.first} kopā ar tevi ✕`;
}
function renderNeeds(){const el=$('#needsRow');if(!el||!S||!S.c)return;const n=C().needs;
  el.innerHTML=NEEDS.map(([k,l,ic])=>`<div class="nd ${n[k]<15?'alert':''}"><b><i>${ic}</i>${l}</b>${bar(n[k],k)}</div>`).join('')+`<div class="chips"><span title="Popularitāte">★ ${popularity()}</span></div>`;
  const m=document.querySelector('.pill.money');if(m)m.textContent=usd(C().money)}
function renderBanners(){
  const c=C(),out=[],h=hourNow();
  const j=jobDef();if(j&&!c.job.worked&&h<=j.hours[1]-4)out.push(`<div class="banner glass">💼 ${j.lv[c.job.lvl]} · ${bld(c.job.b).n} · maiņa ${hstr(j.hours[0])}–${hstr(j.hours[1]-4)}</div>`);
  S.people.filter(p=>p.appt&&p.appt.day===S.day&&h<p.appt.until).slice(0,2).forEach(p=>out.push(`<div class="banner glass ${p.appt.date?'love':''}">${p.appt.date?'❤ Randiņš':'☕ Tikšanās'}: ${esc(p.first)} · ${esc(bld(p.appt.b).n)} · ${hstr(Math.ceil(p.appt.from*2)/2)}</div>`));
  if(S.flags.rentLate)out.push(`<div class="banner glass red">⚠ Īre nav samaksāta! Rīt vajag ${usd(rentDue())}</div>`);
  else if(S.day%7===6)out.push(`<div class="banner glass">🏠 Rīt īre: ${usd(rentDue())}</div>`);
  $('#banners').innerHTML=out.join('');
}

/* ---------- Veikali ---------- */
function shopClothes(lux){const c=C();const list=CLOTH.filter(x=>!!x.lux===lux);
  modal({t:lux?'Dizaineru kolekcija':'Apģērbi',sub:`Tavs stils: ${styleScore()} · skaistums ar stilu: ${effBeauty()}`,ch:list.map(it=>({l:`${it.n} · ${usd(it.p)}`,s:`${CATN[it.cat]} · stils +${it.st}`,dis:c.money<it.p,fn:()=>colorPick(it)})).concat([{l:'Aizvērt',exit:true}])})}
function colorPick(it){const c=C();modal({t:it.n,sub:'Izvēlies krāsu',ch:COLORS.map(col=>({l:`${COLN[col]}`,s:'',fn:()=>{if(c.money<it.p)return toast('Nepietiek naudas.');c.money-=it.p;c.wardrobe.push({cid:it.id,color:col});c.eq[it.cat]=c.wardrobe.length-1;if(it.t==='dress')c.eq.bot=-1;advance(10);log(`Nopirkts: ${it.n} (${COLN[col]}).`);toast('Nopirkts un uzvilkts!');checkTrophies();refreshUI();save();shopClothes(!!it.lux)}})).concat([{l:'Atpakaļ',exit:true}])});
  setTimeout(()=>{document.querySelectorAll('#modalRoot .ch button').forEach((b,i)=>{if(i<COLORS.length){b.style.borderLeft=`14px solid ${COLORS[i]}`}})},0)}
function wardrobeModal(){const c=C();
  const ch=[];['top','bot','shoe','acc'].forEach(cat=>{ch.push({hdr:CATN[cat]});c.wardrobe.forEach((w,i)=>{const cd=cloth(w.cid);if(cd.cat!==cat)return;ch.push({l:`${cd.n} (${COLN[w.color]||''})${c.eq[cat]===i?' ✓':''}`,s:`stils +${cd.st}`,fn:()=>{c.eq[cat]=i;if(cd.t==='dress')c.eq.bot=-1;else if(cat==='top'&&c.eq.bot<0){const bi=c.wardrobe.findIndex(x=>cloth(x.cid).cat==='bot');c.eq.bot=bi}refreshUI();save();wardrobeModal()}})});if(cat==='acc')ch.push({l:'Bez aksesuāra'+(c.eq.acc<0?' ✓':''),fn:()=>{c.eq.acc=-1;refreshUI();save();wardrobeModal()}})});
  ch.push({l:'Gatavs',exit:true});modal({t:'Garderobe',sub:`Stils: ${styleScore()}`,ch})}
function hairModal(){const c=C();modal({t:'Frizūra',sub:'Stila salons',ch:HAIRS.map(h=>({l:`${h.n} · ${usd(h.p)}`,s:`stils +${h.st}${c.hair.s===h.id?' · pašreizējā':''}`,fn:()=>{if(c.money<h.p)return toast('Nepietiek naudas.');c.money-=h.p;c.hair.s=h.id;advance(40);toast('Jauna frizūra!');refreshUI();save();hairColor()}})).concat([{l:'Krāsot matus',s:'$50',fn:hairColor},{l:'Aizvērt',exit:true}])})}
function hairColor(){const c=C();modal({t:'Matu krāsa',ch:HAIRC.map(([col,n])=>({l:n,s:'$50',fn:()=>{if(c.money<50)return toast('Nepietiek naudas.');c.money-=50;c.hair.c=col;advance(30);toast('Krāsa nomainīta!');refreshUI();save()}})).concat([{l:'Paturēt pašreizējo',exit:true}])})}
function giftShop(ks){const c=C();modal({t:'Dāvanas',ch:ks.map(k=>({l:`${ITEMS[k].n} · ${usd(ITEMS[k].p)}`,s:`Tev ir ${c.inv[k]||0}${ITEMS[k].tag?' · patīk tiem, kam interesē: '+ITEMS[k].tag:''}`,dis:c.money<ITEMS[k].p,fn:()=>{c.money-=ITEMS[k].p;addInv(k);advance(5);toast(`Nopirkts: ${ITEMS[k].n}`);save();refreshUI();giftShop(ks)}})).concat([{l:'Aizvērt',exit:true}])})}
function furnShop(){const c=C(),lvl=HOMES[c.home].lvl;
  modal({t:'Mēbeles un tehnika',sub:`Mājoklis: ${HOMES[c.home].n}`,ch:FURN.map(f=>{const owned=c.furn[f.slot]===f.id,fits=SLOTS_BY_LVL[lvl].includes(f.slot);return {l:`${f.n} · ${usd(f.p)}${owned?' ✓':''}`,s:[f.cf?`komforts +${f.cf}`:'',f.pop?`popularitāte +${f.pop}`:'',!fits?'neietilpst pašreizējā mājoklī':''].filter(Boolean).join(' · ')||'mājīgums',dis:owned||c.money<f.p,fn:()=>{c.money-=f.p;c.furn[f.slot]=f.id;advance(10);log(`Nopirkts: ${f.n}. Piegāde uz mājām.`);toast('Piegādāts uz mājām!');save();refreshUI();furnShop()}}}).concat([{l:'Aizvērt',exit:true}])})}
function homeModal(){const c=C();modal({t:'Mājokļi',sub:`Pašlaik: ${HOMES[c.home].n}`,b:'<p>Trendīgāks rajons dod popularitāti, bet īre jāmaksā katru 7. dienu. Mēbeles pārceļas līdzi.</p>',
  ch:HOMES.map((h,i)=>({l:h.n,s:`${usd(h.rent)} nedēļā${h.shared?' (uz pusēm ar istabas biedru)':''}${h.pop?' · popularitāte +'+h.pop:''}`,dis:i===c.home||c.money<h.rent,why:c.money<h.rent&&i!==c.home?'Vajag pirmās nedēļas īri':null,
    fn:()=>{c.money-=i===0?0:h.rent;c.home=i;done(`Tu pārvācies: ${h.n}.`);checkTrophies()}})).concat([{l:'Aizvērt',exit:true}])})}

/* ---------- Telefons ---------- */
function renderPhone(){
  const t=S.phoneTab||'contacts',c=C();
  const tabs=[['contacts','Kontakti'],['msgs','Ziņas'],['quests','Uzdevumi'],['map','Karte'],['trophies','Sasniegumi']];
  let body='';
  if(t==='contacts'){const list=S.people.filter(p=>p.met).sort((a,b)=>(b.steady?999:0)+b.f-(a.steady?999:0)-a.f);
    body=list.length?`<div class="rows">${list.map(p=>{const ints=TOPICS.filter(x=>p.known[x]).map(x=>`<span class="tag ${p.likes.includes(x)?'lk':p.dislikes.includes(x)?'dk':''}">${TOPIC_ICON[x]} ${x}</span>`).join('');
      return `<div class="row"><img class="ava sm" src="${portraitURL(p.look,p.sex,null)}" alt=""><div class="nm"><b>${esc(fullName(p))}${p.steady?' ❤':''}</b><span>${esc(p.role||'')} · ${relLabel(p)} · ${DISTS[p.zone]?.n||''}</span><div class="mini2">${bar(p.f/FMAX*100)}${!p.fam&&!p.noRom?bar(p.rom/FMAX*100,'love'):''}</div>${ints?`<div class="tags">${ints}</div>`:''}</div>${p.phone?`<button class="btn" data-call="${p.id}">Zvanīt</button><button class="btn" data-inv="${p.id}">Uzaicināt</button>`:'<span class="muted small">nav numura</span>'}</div>`}).join('')}</div>`:'<p class="muted">Kontaktu vēl nav. Iepazīsties ar cilvēkiem pilsētā.</p>'}
  if(t==='msgs'){body=S.msgs.length?`<div class="rows">${S.msgs.map(m=>{const p=pById(m.from);if(m.day===S.day)m.read=true;const d=m.date?DATES.find(x=>x.id===m.date):null;
    return `<div class="row msg"><div class="nm"><b>${p?esc(p.first):'Ziņa'}</b><span>${m.day}. diena</span><p>${esc(m.text)}</p></div>${(m.type==='invite'||m.type==='date')&&m.day===S.day&&!m.done?`<button class="btn" data-acc="${m.id}">Piekrist</button>`:''}${m.type==='chat'&&!m.done&&p?`<button class="btn" data-rep="${m.id}">Atbildēt</button>`:''}</div>`}).join('')}</div>`:'<p class="muted">Ziņu nav.</p>'}
  if(t==='quests'){const ob=objectives(),q=S.quests.filter(x=>!x.done);
    body=`<div class="lab">Stāsts</div><div class="rows">${ob.map(o=>`<div class="row obj ${o.done?'ok':''}"><span class="ck">${o.done?'✓':'○'}</span><div class="nm"><b>${esc(o.t)}</b>${!o.done?`<span>${esc(o.hint)}</span>`:''}</div></div>`).join('')}</div>
    <div class="lab">Lūgumi</div>${q.length?`<div class="rows">${q.map(x=>`<div class="row"><div class="nm"><b>${esc(x.desc)}</b><span>Atlīdzība ${usd(x.reward)}${x.exp!=null?` · līdz ${x.exp}. dienai`:''}</span></div>${x.b?`<button class="btn" data-goq="${x.b}">Rādīt</button>`:''}</div>`).join('')}</div>`:'<p class="muted small">Cilvēki ar zilu <b>?</b> virs galvas lūdz palīdzību.</p>'}`}
  if(t==='map')body=`<canvas id="mapc" class="mapc"></canvas><div class="legend">${Object.values(DISTS).map(d=>`<span><i style="background:${d.c}"></i>${d.n}</span>`).join('')}<span><i style="background:#5fd38a;border-radius:50%"></i>Metro</span></div><p class="muted small">Pieskaries ēkai: aiziet, braukt ar taksometru vai metro.</p>`;
  if(t==='trophies')body=`<div class="tro">${TROPHIES.map(x=>`<div class="tr ${S.trophies.includes(x.id)?'got':''}"><b>${S.trophies.includes(x.id)?'🏆':'○'} ${esc(x.n)}</b><span>${esc(x.d)}</span></div>`).join('')}</div>`;
  $('#phoneWrap').innerHTML=`<div class="phone"><div class="ptop"><b>${clockStr()}</b><span>${S.day}. diena · ${usd(c.money)}</span></div><div class="ptabs">${tabs.map(([k,n])=>`<button data-pt="${k}" aria-pressed="${k===t}">${n}${k==='msgs'&&S.msgs.some(m=>!m.read)?' •':''}</button>`).join('')}</div><div class="pbody">${body}</div>
    <div class="pfoot"><button class="btn" id="momBtn" ${momLock()?'disabled':''}>📞 Zvanīt mammai pēc naudas${momLock()?' · '+momLock():''}</button></div></div>`;
  $('#phoneWrap').querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{S.phoneTab=b.dataset.pt;renderPhone()});
  $('#momBtn').onclick=()=>{if(momLock())return;advance(10);done(momMoney());renderPhone()};
  $('#phoneWrap').querySelectorAll('[data-call]').forEach(b=>b.onclick=()=>{const p=pById(+b.dataset.call);if(!spendT(10,0))return;bond(p,R(2,4),p.steady?3:0);done(`Tu parunājies ar ${nAcc(p.first)} pa telefonu.`);renderPhone()});
  $('#phoneWrap').querySelectorAll('[data-inv]').forEach(b=>b.onclick=()=>inviteModal(pById(+b.dataset.inv)));
  $('#phoneWrap').querySelectorAll('[data-acc]').forEach(b=>b.onclick=()=>{const m=S.msgs.find(x=>x.id===+b.dataset.acc),p=pById(m.from);m.done=true;const h=hourNow();
    if(m.type==='date'){const d=DATES.find(x=>x.id===m.date),bb=bld(d.b);const from=Math.max(h+1,bb.hours[0]);p.appt={b:d.b,day:S.day,from,until:Math.min(bb.hours[1],from+3),date:d.id};done(`Randiņš: ${p.first} gaidīs tevi ${bb.n} ap ${hstr(Math.ceil(from*2)/2)}.`)}
    else{p.appt={b:m.b,day:S.day,from:Math.max(h,m.from_h),until:Math.max(h,m.from_h)+3};bond(p,2,0);done(`${p.first} gaidīs tevi ${bld(m.b).n} no ${hstr(p.appt.from)}.`)}renderPhone()});
  $('#phoneWrap').querySelectorAll('[data-rep]').forEach(b=>b.onclick=()=>{const m=S.msgs.find(x=>x.id===+b.dataset.rep),p=pById(m.from);m.done=true;bond(p,3,p.steady?3:0);p.lastSeen=S.day;advance(2);done(`Tu atbildi ${nDat(p.first)}.`);renderPhone()});
  $('#phoneWrap').querySelectorAll('[data-goq]').forEach(b=>b.onclick=()=>mapInfo(bld(b.dataset.goq)));
  if(t==='map')drawMap();
}
function inviteModal(p){const h=hourNow();const places=['cafe','pizza','pub','diner','dimsum','arcade','karaoke','jazz','gallery','plaza'];
  modal({t:`Uzaicināt ${nAcc(p.first)}`,sub:'Kur satiksieties?',ch:[...(!p.fam&&!p.noRom&&(p.f>=50||p.rom>=25)?[{l:'❤ Aicināt uz randiņu…',s:'Izvēlēties randiņa vietu',fn:()=>dateMenu({talking:false,hold:false,x:0,y:0,pid:p.id,phone:1},p)}]:[]),
    ...places.map(id=>{const bb=bld(id);const open=h<bb.hours[1]-1;return {l:bb.n,s:`${DISTS[bb.dist].n} · ${open?'atvērts līdz '+hstr(bb.hours[1]):'šodien vairs nav atvērts'}`,dis:!open,fn:()=>{advance(5);
    const ok=(p.f>=25||p.steady||p.fam)&&rnd()<.55+p.f/200+p.rom/200;if(!ok){p.f=cl(p.f-2,0,FMAX);done(`${p.first}: „Šodien nevaru, piedod.”`);return}
    p.appt={b:id,day:S.day,from:Math.max(h,bb.hours[0])+.5,until:Math.min(bb.hours[1],Math.max(h,bb.hours[0])+3.5)};done(`${p.first} piekrīt! Tiekaties ${bb.n} ap ${hstr(Math.ceil(p.appt.from*2)/2)}.`)}}})].concat([{l:'Atcelt',exit:true}])})}
let MAPS=4;
function drawMap(){const cvm=$('#mapc');if(!cvm)return;const w=cvm.clientWidth;MAPS=w/64;cvm.width=Math.round(w*DPR);cvm.height=Math.round(w*DPR);const g=cvm.getContext('2d');g.scale(DPR*MAPS,DPR*MAPS);
  const col={0:'#9fd17f',1:'#5a5e6b',2:'#d8d4cc',3:'#3f8db4',4:'#bdb8b0',5:'#e8e1d3',6:'#ccc',7:'#8a6a4a',8:'#9a7048',9:'#86c46b',10:'#e6d6a8',11:'#9a96a6'};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=grid[gi(x,y)];g.fillStyle=t===T.WATER&&x<=37&&y<=17?'#5bb2c4':col[t];g.fillRect(x,y,1.02,1.02)}
  const hb=HOMES[C().home].b;
  BLDS.forEach(b=>{g.fillStyle=b.id===hb?'#ff6f61':DISTS[b.dist].c;g.globalAlpha=isOpen(b)||RES.includes(b.type)?1:.45;g.fillRect(b.bx+.15,b.by+.15,b.w-.3,b.d-.3);g.globalAlpha=1});
  STATIONS.forEach(s=>{g.fillStyle='#fff';g.beginPath();g.arc(s.x+.5,s.y+.5,1.2,0,Math.PI*2);g.fill();g.fillStyle='#2e8b57';g.beginPath();g.arc(s.x+.5,s.y+.5,.8,0,Math.PI*2);g.fill()});
  storyPins().forEach(id=>{const b=bld(id);if(!b)return;g.fillStyle='#ffc857';g.beginPath();g.arc(b.door[0]+.5,b.door[1]+.5,1.4,0,Math.PI*2);g.fill();g.strokeStyle='#3a2400';g.lineWidth=.3;g.stroke()});
  S.quests.forEach(q=>{if(q.done||!q.b)return;const pt=bld(q.b).door;g.fillStyle='#7be0ff';g.beginPath();g.arc(pt[0]+.5,pt[1]+.5,1.2,0,Math.PI*2);g.fill()});
  S.people.forEach(p=>{if(p.appt&&p.appt.day===S.day){const b=bld(p.appt.b);if(b){g.fillStyle='#ff8fb8';g.beginPath();g.arc(b.door[0]+.5,b.door[1]+.5,1.2,0,Math.PI*2);g.fill()}}});
  g.font='700 2.1px Figtree, sans-serif';g.textAlign='center';[['cp',19,9],['fa',50,9],['ts',12,25],['gv',8,50],['ct',38,36],['ws',52,56]].forEach(([d,x,y])=>{g.fillStyle='rgba(0,0,0,.55)';g.fillText(DISTS[d].n,x+.1,y+.1);g.fillStyle='#fff';g.fillText(DISTS[d].n,x,y)});
  const pp=curPos();g.fillStyle='#fff';g.beginPath();g.arc(pp[0],pp[1],1.5,0,Math.PI*2);g.fill();g.fillStyle='#ff3b6b';g.beginPath();g.arc(pp[0],pp[1],1,0,Math.PI*2);g.fill();
  cvm.onclick=e=>{const r=cvm.getBoundingClientRect(),x=(e.clientX-r.left)/MAPS,y=(e.clientY-r.top)/MAPS;const b=BLDS.find(b=>x>=b.bx-.5&&x<=b.bx+b.w+.5&&y>=b.by-.5&&y<=b.by+b.d+.5);if(b)mapInfo(b);else{const s=STATIONS.find(s=>Math.abs(s.x-x)<2&&Math.abs(s.y-y)<2);if(s)mapInfo(null,s)}};
}
function mapInfo(b,st){const c=C(),pt=b?b.door:[st.x,st.y],pp=curPos(),dist=Math.abs(pt[0]-pp[0])+Math.abs(pt[1]-pp[1]),fare=Math.round(5+dist*.35);
  const near=STATIONS.slice().sort((a,z)=>Math.abs(a.x-pt[0])+Math.abs(a.y-pt[1])-Math.abs(z.x-pt[0])-Math.abs(z.y-pt[1]))[0];
  const res=b&&RES.includes(b.type),go=()=>{if(S.where)leaveBuilding();S.tab='city';refreshUI()};
  modal({t:b?b.n:'Metro: '+st.n,sub:b?(res?(HOMES[c.home].b===b.id?'Tavas mājas':'Dzīvojamā ēka'):`${DISTS[b.dist].n} · ${isOpen(b)?'Atvērts':'Slēgts'} · ${hstr(b.hours[0])}–${hstr(b.hours[1])}`):DISTS[st.d].n,ch:[
    {l:'Iet turp',s:`~${Math.round(dist*.6)} min kājām`,fn:()=>{go();goTo(pt[0],pt[1],b?{type:'door',id:b.id}:null)}},
    {l:'Dzeltenais taksometrs',s:`${usd(fare)} · ${Math.round(6+dist*.2)} min`,dis:c.money<fare,fn:()=>{c.money-=fare;advance(Math.round(6+dist*.2));go();travelTo(pt[0],pt[1],'taxi',b?b.n:st.n);toast(`Taksometrs aizved tevi līdz: ${b?b.n:st.n}`)}},
    {l:'Metro',s:`$3 · 12 min · stacija „${near.n}”`,dis:c.money<3,fn:()=>{c.money-=3;advance(12);go();travelTo(near.x,near.y,'metro',near.n);if(b)goTo(pt[0],pt[1],{type:'door',id:b.id});toast(`Metro: ${near.n}`)}},
    {l:'Aizvērt',exit:true}]})}

/* ---------- Es ---------- */
function renderMe(){
  const c=C(),j=jobDef(),hc=homeComfort(),pop=popularity();
  const sb=(n,v,m,cls,plain)=>`<div class="sb"><span>${n}</span>${bar(v/m*100,cls||'',plain)}<span>${Math.floor(v)}</span></div>`;
  const inv=Object.keys(c.inv).filter(k=>c.inv[k]>0);
  $('#meWrap').innerHTML=`
  <div class="panel"><h2>Īpašības</h2><div class="statbars">${STATS.map(([k,n])=>sb(n+(k==='beauty'&&styleScore()?` (+${Math.round(styleScore()/3)})`:''),k==='beauty'?effBeauty():c.st[k],100,k==='crime'?'crime':'st',1)).join('')}${sb('Popularitāte',pop,100,'pop',1)}</div>
    <p class="muted small" style="margin:0">Īpašības aug no darbībām: kultūra muzejos un teātrī, humors bāros un komēdiju klubā, veselība un spēks sportā, skaistums salonā un ar stilīgām drēbēm. Daži cilvēki runā tikai ar tiem, kam ir pietiekami augsta kāda īpašība.</p></div>
  <div class="panel"><h2>Vajadzības</h2><div class="statbars">${NEEDS.map(([k,l,ic])=>sb(ic+' '+l,c.needs[k],100,k)).join('')}</div><p class="muted small" style="margin:0">Ja vajadzības ir zemas, īpašības krītas un sarunas iet sliktāk. Tualete ir mājās, kafejnīcās, restorānos un bāros.</p></div>
  <div class="panel"><h2>Darbs un mājoklis</h2><div class="kv">
    <div><span class="lab">Darbs</span><b>${j?esc(j.lv[c.job.lvl]):'Nav'}</b>${j?`<span class="muted small">${esc(bld(c.job.b).n)} · maiņa ${hstr(j.hours[0])}–${hstr(j.hours[1]-4)} · ${c.job.worked?'šodien nostrādāts ✓':'šodien vēl jāstrādā'}</span>`:'<span class="muted small">Kafejnīcā „Kafija & Co” baristu ņem uzreiz</span>'}</div>
    <div><span class="lab">Pieredze</span><b>${j?(c.job.lvl<2?`${(Math.round(c.job.xp*10)/10)}/${c.job.lvl===0?4:8}`:'Augstākais līmenis'):'—'}</b></div>
    <div><span class="lab">Mājoklis</span><b>${HOMES[c.home].n}</b><span class="muted small">Īre ${usd(rentDue())} katru 7. dienu${HOMES[c.home].shared?(S.flags.roommate?' · istabas biedrs: Lūsija':' · bez istabas biedra'):''} · ledusskapī ${c.fridge} maltītes</span></div>
    <div><span class="lab">Somā</span><b>${inv.length?inv.map(k=>`${ITEMS[k].n} ×${c.inv[k]}`).join(', '):'Tukša'}</b></div></div>
    ${inv.some(k=>ITEMS[k].food||ITEMS[k].energy)?`<div class="rows">${inv.filter(k=>ITEMS[k].food||ITEMS[k].energy).map(k=>`<button class="btn" data-use="${k}">Izmantot: ${ITEMS[k].n}</button>`).join('')}</div>`:''}
    <div><button class="btn" id="wardBtn">Garderobe (${c.wardrobe.length})</button></div></div>
  <div class="panel"><h2>Notikumu žurnāls</h2><div class="log">${S.log.slice(0,50).map(e=>`<div><time>${e.d}. d. ${e.t||''}</time><span class="${e.k}">${esc(e.msg)}</span></div>`).join('')}</div></div>
  <div class="panel"><h2>Iestatījumi</h2><div><div class="lab">Laika ātrums</div><div class="seg" role="group" aria-label="Laika ātrums">${[1,2,3,4].map(v=>`<button data-sp="${v}" aria-pressed="${(S.speed||2)===v}">${v}×</button>`).join('')}</div></div>
    <p class="muted small" style="margin:0">Pulkstenis iet pats, kamēr esi pilsētā. Pieskaries zemei, lai ietu; ēkai, lai ieietu; cilvēkam, lai runātu. Divi pirksti vai + un − tuvina pilsētu. Spēle saglabājas automātiski.</p>
    <div><button class="btn" id="resetBtn">Sākt no jauna</button></div></div>`;
  $('#wardBtn').onclick=()=>wardrobeModal();
  $('#meWrap').querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{const k=b.dataset.use,it=ITEMS[k];c.inv[k]--;if(it.food)need('food',it.food);if(it.energy)need('energy',it.energy);if(it.bladder)need('bladder',it.bladder);advance(5);done(`Izmantots: ${it.n}.`)});
  $('#meWrap').querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{S.speed=+b.dataset.sp;save();renderMe()});
  $('#resetBtn').onclick=()=>modal({t:'Sākt no jauna?',b:'<p>Pašreizējā spēle tiks dzēsta.</p>',ch:[{l:'Jā, sākt no jauna',fn:()=>{try{localStorage.removeItem(KEY)}catch(e){}startScreen()}},{l:'Atcelt',exit:true}]});
}
/* ---------- Stāsts ---------- */
function renderStory(){const ob=objectives(),e=evaluate(),F=S.flags;
  const cells=Array.from({length:LEASE_DAYS},(_,i)=>{const d=i+1;const cls=[d<S.day?'past':'',d===S.day?'today':'',d%7===0?'rent':'',d===F.partyDay?'ev':'',d===F.premiereDay?'ev':''].join(' ');return `<span class="${cls}" title="${d}. diena">${d}</span>`}).join('');
  const row=(n,v,m)=>`<div class="sb"><span>${n}</span>${bar(v/m*100)}<span>${v}/${m}</span></div>`;
  $('#storyWrap').innerHTML=`
  <div class="panel"><div class="lab">Īres līgums</div><h2>${S.extended?`${S.day}. diena — līgums pagarināts`:`${Math.min(S.day,LEASE_DAYS)}. diena no ${LEASE_DAYS}`}</h2><div class="cal">${cells}</div><p class="muted small" style="margin:0">🏠 Īres dienas: katra 7. diena (${usd(rentDue())}). Ja nevarēsi samaksāt — būs jābrauc atpakaļ uz Latviju.</p></div>
  <div class="panel"><h2>Mērķi</h2><div class="rows">${ob.map(o=>`<div class="row obj ${o.done?'ok':''}"><span class="ck">${o.done?'✓':'○'}</span><div class="nm"><b>${esc(o.t)}</b>${!o.done?`<span>${esc(o.hint)}</span>`:''}</div></div>`).join('')}</div></div>
  <div class="panel"><h2>Tavi panākumi šobrīd: ${e.total}/100</h2><div class="statbars">${row('Karjera',e.career,25)}${row('Mīlestība',e.love,25)}${row('Draugi',e.social,25)}${row('Īpašības',e.self,25)}${row('Slava',e.fame,10)}</div><p class="muted small" style="margin:0">Pēc ${LEASE_DAYS}. dienas uzzināsi, vai esi iekarojis Ņujorku.</p></div>`;
}
document.querySelectorAll('nav.tabs button').forEach(b=>b.onclick=()=>{if(!S||!S.c)return;S.tab=b.dataset.tab;refreshUI();const pg=$('#tab-'+S.tab);if(pg)pg.scrollTop=0});
$('#zin').onclick=()=>setZoom(ZOOM*1.15);$('#zout').onclick=()=>setZoom(ZOOM/1.15);
$('#sleepBtn').onclick=()=>endDayPrompt();
$('#exitBtn').onclick=()=>{if(S.where&&!$('#modalRoot').innerHTML)goTo(ROOM.exit[0],ROOM.exit[1],{type:'exit'})};
$('#mapBtn').onclick=()=>{S.tab='phone';S.phoneTab='map';refreshUI()};
$('#compChip').onclick=()=>{dismissComp();refreshUI()};
window.addEventListener('resize',()=>{resizeCanvas();if(S&&S.tab==='phone'&&S.phoneTab==='map')drawMap()});

/* ---------- Sākums ---------- */
function startScreen(){
  MQ.length=0;NPCS=[];EXTRAS=[];S=null;
  let beard=false,sex=rnd()<.5?'m':'f',first=pick(sex==='m'?LV_M:LV_F),shirt=COLORS[0],skin=SKIN[0],hair=sex==='f'?'long':'short',hairC=HAIRC[3][0];const st={beauty:5,health:5,humor:5,culture:5};
  const draw=()=>{const left=20-CORE.reduce((a,k)=>a+st[k],0);
    $('#modalRoot').innerHTML=`<div class="ov start"><div class="sheet">
      <div class="head"><span class="lab">Manhetena · 40 dienas</span><h2 class="logo">Lielais <em>Ābols</em></h2></div>
      <p style="margin:0">Tu tikko izkāpi no metro Ņujorkā ar koferi un mammas iedotiem <b>$600</b>. Brālis Edgars tev atradis istabu Grīnvičvilidžā. Tev ir <b>40 dienas</b>, lai atrastu draugus, darbu un mīlestību — un kļūtu veiksmīgs Lielajā Ābolā.</p>
      <canvas id="prev" width="160" height="160" class="prev" aria-hidden="true"></canvas>
      <div class="seg" role="group" aria-label="Dzimums"><button id="sm" aria-pressed="${sex==='m'}">Vīrietis</button><button id="sf" aria-pressed="${sex==='f'}">Sieviete</button></div>
      <label class="lab" for="fn">Vārds</label><input type="text" id="fn" value="${esc(first)}" maxlength="16">
      <div><div class="lab">Āda</div><div class="sw" id="swS">${SKIN.map(c=>`<button data-v="${c}" style="background:${c}" aria-label="Ādas tonis" aria-pressed="${c===skin}"></button>`).join('')}</div></div>
      <div><div class="lab">Frizūra</div><div class="seg wrap">${HAIRS.filter(h=>h.id!=='bald').map(h=>`<button data-h="${h.id}" aria-pressed="${h.id===hair}">${h.n}</button>`).join('')}</div></div>
      ${sex==='m'?`<div class="seg" role="group" aria-label="Bārda"><button id="bdN" aria-pressed="${!beard}">Bez bārdas</button><button id="bdY" aria-pressed="${beard}">Ar bārdu</button></div>`:''}
      <div><div class="lab">Matu krāsa</div><div class="sw" id="swH">${HAIRC.map(([c])=>`<button data-v="${c}" style="background:${c}" aria-label="Matu krāsa" aria-pressed="${c===hairC}"></button>`).join('')}</div></div>
      <div><div class="lab">Krekla krāsa</div><div class="sw" id="swT">${COLORS.map(c=>`<button data-v="${c}" style="background:${c}" aria-label="Krāsa" aria-pressed="${c===shirt}"></button>`).join('')}</div></div>
      <div class="pts"><div class="lab">Sadali 20 punktus · atlikuši <b style="color:var(--gold)">${left}</b></div>${CORE.map(k=>`<div class="pt"><span>${STN[k]}</span><button data-m="${k}" aria-label="Mazāk: ${STN[k]}" ${st[k]<=0?'disabled':''}>−</button><b>${st[k]}</b><button data-p="${k}" aria-label="Vairāk: ${STN[k]}" ${left<=0?'disabled':''}>+</button></div>`).join('')}</div>
      <div class="ch"><button id="go" class="go"><b>Izkāpt no metro</b><span>Ņujorka gaida</span></button></div></div></div>`;
    const sv=()=>first=$('#fn').value;
    $('#sm').onclick=()=>{sv();sex='m';first=pick(LV_M);hair='short';draw()};$('#sf').onclick=()=>{sv();sex='f';first=pick(LV_F);hair='long';beard=false;draw()};
    $('#swS').querySelectorAll('button').forEach(b=>b.onclick=()=>{sv();skin=b.dataset.v;draw()});$('#swH').querySelectorAll('button').forEach(b=>b.onclick=()=>{sv();hairC=b.dataset.v;draw()});$('#swT').querySelectorAll('button').forEach(b=>b.onclick=()=>{sv();shirt=b.dataset.v;draw()});
    document.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{sv();hair=b.dataset.h;draw()});if($('#bdY')){$('#bdY').onclick=()=>{sv();beard=true;draw()};$('#bdN').onclick=()=>{sv();beard=false;draw()}}
    document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{sv();if(20-CORE.reduce((a,k)=>a+st[k],0)>0)st[b.dataset.p]++;draw()});
    document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{sv();if(st[b.dataset.m]>0)st[b.dataset.m]--;draw()});
    const pc=$('#prev').getContext('2d');pc.setTransform(2.4,0,0,2.4,80,150);
    previewPerson(pc,{skin,hair,hairC,beard:sex==='m'&&beard,top:{t:sex==='f'?'tank':'tee',c:shirt},bot:{t:sex==='f'?'skirt':'jeans',c:sex==='f'?'#2c3150':'#1f3d6b'},shoe:'#f4f4f4',acc:null},sex);
    $('#go').onclick=()=>{const n=($('#fn').value||first).trim().slice(0,16)||first;$('#modalRoot').innerHTML='';
      newGame({first:n,sex,shirt,skin,hair,hairC,beard:sex==='m'&&beard,st:Object.assign({},st)});S.tab='city';
      const s0=STATIONS.find(s=>s.d==='gv'),t0=adjFree(CITY,s0.x,s0.y)||[s0.x,s0.y];P.x=t0[0]+.5;P.y=t0[1]+.5;S.where=null;ROOM=null;S.lastDist='gv';initCars();spawnCity();cam.init=false;refreshUI();save();
      modal({t:'Laipni lūgts Ņujorkā!',b:`<p>Pieskaries zemei, lai ietu. Pieskaries ēkai, lai ieietu, vai cilvēkam, lai runātu. Iekštelpās pieskaries priekšmetiem — letēm, galdiem, gultai.</p><p>Vispirms dodies uz <b>Blīkera ielu 14</b> (sarkanā zīme „Mājas”), kur tevi gaida brālis. Telefonā ir kontakti, ziņas, uzdevumi un Manhetenas karte ar metro.</p><p class="muted">Pulkstenis iet pats. Ēd 🍎, guli zZ, ej dušā 🚿 un uz tualetes WC!</p>`,ch:[{l:'Sākt'}]})};
  };
  draw();
}
const PORT={};
function portraitURL(L,sex,expr){const key=JSON.stringify(L)+sex+(expr||'');if(PORT[key])return PORT[key];
  const c=document.createElement('canvas');c.width=c.height=192;const g=c.getContext('2d');
  const gr=g.createRadialGradient(96,70,10,96,96,96);gr.addColorStop(0,'#3b3170');gr.addColorStop(1,'#1d1838');g.fillStyle=gr;g.fillRect(0,0,192,192);
  g.setTransform(3.9,0,0,3.9,96,236);const old=ctx,ot=TIME;ctx=g;TIME=0;try{drawPerson(0,0,Object.assign({},L,{dirty:false}),sex,0,false,1,{noShadow:1,expr})}finally{ctx=old;TIME=ot}
  const keys=Object.keys(PORT);if(keys.length>220)delete PORT[keys[0]];return PORT[key]=c.toDataURL('image/png')}
function showTransit(kind,label){const el=$('#transit');if(!el)return;el.className='transit '+kind;el.innerHTML=kind==='metro'?`<div class="tun"></div><div class="train"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="tlab"><b>M</b>${esc(label||'')}</div>`:`<div class="sky"></div><div class="road"></div><div class="cab"><span>TAXI</span></div><div class="tlab">🚕 ${esc(label||'')}</div>`;
  el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>{el.hidden=true;el.innerHTML=''},1500)}
function previewPerson(pc,L,sex){const old=ctx;ctx=pc;try{drawPerson(0,0,L,sex,0,false,1,{})}finally{ctx=old}}

function boot(){
  resizeCanvas();
  if(!load())S=null;
  if(!S||!S.c){S=null;startScreen()}
  else{if(!S.msgs)S.msgs=[];initCars();
    if(S.where){const b=bld(S.where.b);ROOM=makeRoom(b,S.where.variant);P.x=ROOM.exit[0]+.5;P.y=ROOM.exit[1]+.5;spawnRoom()}
    else{if(S.pos){P.x=S.pos[0];P.y=S.pos[1]}else{const hb=bld(HOMES[C().home].b);P.x=hb.door[0]+.5;P.y=hb.door[1]+.5}spawnCity()}
    S.lastHour=Math.floor(hourNow());refreshUI();if(S.over)showEnding(S.flags.ended?'lease':'broke')}
  requestAnimationFrame(frame);
}
setInterval(()=>{if(S&&S.c&&!S.where){S.pos=[P.x,P.y]}save()},5000);
