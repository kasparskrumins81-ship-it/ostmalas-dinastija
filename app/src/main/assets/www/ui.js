/* ===================== Saskarne ===================== */
let toastT;
function toast(m){if(!m)return;clearTimeout(toastT);let el=document.querySelector('.toast');if(!el){el=document.createElement('div');el.className='toast';el.setAttribute('role','status');document.body.appendChild(el)}el.textContent=m;el.hidden=false;toastT=setTimeout(()=>el.hidden=true,2600)}
function tick(m,k){const tk=$('#ticker');if(!tk||!S||S.ff)return;const d=document.createElement('div');d.className='glass '+(k||'');d.textContent=m;tk.appendChild(d);while(tk.children.length>3)tk.firstChild.remove();setTimeout(()=>d.remove(),6200)}
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
function bar(v,cls=''){const w=cl(v);return `<div class="bar ${cls} ${w<25?'low':w<45?'warn':''}"><span style="width:${w}%"></span></div>`}
function done(m){if(m){log(m);toast(m)}refreshUI();save()}
function refreshUI(){if(!S||!S.c)return;renderHUD();renderBanners();
  const tab=S.tab||'city';['phone','life','pol','dyn'].forEach(t=>$('#tab-'+t).hidden=tab!==t);
  $('#fab').hidden=tab!=='city';$('#ticker').hidden=tab!=='city';$('#banners').hidden=tab!=='city';
  $('#exitBtn').hidden=!S.where;
  document.querySelectorAll('nav.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));
  const unread=S.msgs.filter(m=>!m.read).length;$('#phoneDot').hidden=!unread;
  if(tab==='phone')renderPhone();if(tab==='life')renderLife();if(tab==='pol')renderPol();if(tab==='dyn')renderDyn();
}
function renderHUD(){
  if(!S||!S.c)return;const c=C(),d=dateOf(S.T),n=c.needs;
  const nb=(lab,v,col)=>`<div class="nd"><b>${lab}</b>${bar(v,col)}</div>`;
  const where=S.where?bld(S.where.b).n:'Ostmala';
  $('#hud').innerHTML=`<div class="hud-card glass"><div class="r1">
    <div class="ava" style="background:${myLook().top.c}">${esc(c.first[0])}</div>
    <div class="who"><b>${esc(meName())}</b><span>${S.day}. diena · ${MONL[d.m]} ${d.y} · ${esc(where)}</span></div>
    <div class="pill clock">${c.jail?'--:--':clockStr()}</div><div class="pill money">${eur(c.money)}</div>
  </div><div class="needs">${nb('Enerģija',n.energy,'e')}${nb('Sāta',n.food,'f')}${nb('Prieks',n.fun,'j')}<div class="chips"><span title="Slava">★ ${Math.round(c.rep)}</span><span title="Stils">✦ ${styleScore()}</span></div></div></div>`;
  document.documentElement.style.setProperty('--hudH',$('#hud').offsetHeight+'px');
  $('#sleepBtn').textContent=c.jail?'Gaidīt mēnesi':S.where&&S.where.variant==='home'?'Iet gulēt':'Beigt dienu';
  const cp=compP();$('#compChip').hidden=!cp;if(cp)$('#compChip').textContent=`♥ ${cp.first} kopā ar tevi ✕`;
}
function renderBanners(){
  const c=C(),out=[];
  if(c.jail)out.push(`<div class="banner glass red">Cietumā vēl ${c.jail} mēn.</div>`);
  if(c.cand)out.push(`<div class="banner glass">Kampaņa: ${OFFICES[c.cand.office].n} · ${dstr(nextEl(c.cand.type))} · ${Math.round(c.campaign)} p.</div>`);
  const j=jobDef();if(j&&!c.job.worked){const h=hourNow();if(h<j.hours[1]-1)out.push(`<div class="banner glass">Darbs: ${j.lv[c.job.lvl]} · ${bld(c.job.b).n} · ${hstr(j.hours[0])}–${hstr(j.hours[1])}</div>`)}
  $('#banners').innerHTML=out.join('');
}

/* ---------- Veikali ---------- */
function shopClothes(lux){const c=C();const list=CLOTH.filter(x=>!!x.lux===lux);
  modal({t:lux?'Butiks „Luxe”':'Apģērbi',sub:`Tavs stils: ${styleScore()}`,ch:list.map(it=>({l:`${it.n} · ${eur(it.p)}`,s:`${CATN[it.cat]} · stils +${it.st}`,dis:c.money<it.p,fn:()=>colorPick(it)})).concat([{l:'Aizvērt',exit:true}])})}
function colorPick(it){const c=C();modal({t:it.n,sub:'Izvēlies krāsu',ch:COLORS.map(col=>({l:`${COLN[col]}`,s:'',col,fn:()=>{if(c.money<it.p)return toast('Nepietiek naudas.');c.money-=it.p;c.wardrobe.push({cid:it.id,color:col});c.eq[it.cat]=c.wardrobe.length-1;if(it.t==='dress')c.eq.bot=-1;advance(10);log(`Nopirkts: ${it.n} (${COLN[col]}).`);toast('Nopirkts un uzvilkts!');checkTrophies();refreshUI();save();shopClothes(!!it.lux)}})).concat([{l:'Atpakaļ',exit:true}])});
  setTimeout(()=>{document.querySelectorAll('#modalRoot .ch button').forEach((b,i)=>{if(i<COLORS.length){b.style.borderLeft=`14px solid ${COLORS[i]}`}})},0)}
function wardrobeModal(){const c=C();
  const ch=[];['top','bot','shoe','acc'].forEach(cat=>{ch.push({hdr:CATN[cat]});c.wardrobe.forEach((w,i)=>{const cd=cloth(w.cid);if(cd.cat!==cat)return;ch.push({l:`${cd.n} (${COLN[w.color]||''})${c.eq[cat]===i?' ✓':''}`,s:`stils +${cd.st}`,fn:()=>{c.eq[cat]=i;if(cd.t==='dress')c.eq.bot=-1;else if(cat==='top'&&c.eq.bot<0){const bi=c.wardrobe.findIndex(x=>cloth(x.cid).cat==='bot');c.eq.bot=bi}refreshUI();save();wardrobeModal()}})});if(cat==='acc')ch.push({l:'Bez aksesuāra'+(c.eq.acc<0?' ✓':''),fn:()=>{c.eq.acc=-1;refreshUI();save();wardrobeModal()}})});
  ch.push({l:'Gatavs',exit:true});modal({t:'Garderobe',sub:`Stils: ${styleScore()}`,ch})}
function hairModal(){const c=C();modal({t:'Frizūra',sub:'Skaistumkopšanas salons',ch:HAIRS.map(h=>({l:`${h.n} · ${eur(h.p)}`,s:`stils +${h.st}${c.hair.s===h.id?' · pašreizējā':''}`,fn:()=>{if(c.money<h.p)return toast('Nepietiek naudas.');c.money-=h.p;c.hair.s=h.id;advance(40);toast('Jauna frizūra!');refreshUI();save();hairColor()}})).concat([{l:'Krāsot matus',s:'50 €',fn:hairColor},{l:'Aizvērt',exit:true}])})}
function hairColor(){const c=C();modal({t:'Matu krāsa',ch:HAIRC.map(([col,n])=>({l:n,s:'50 €',fn:()=>{if(c.money<50)return toast('Nepietiek naudas.');c.money-=50;c.hair.c=col;advance(30);toast('Krāsa nomainīta!');refreshUI();save()}})).concat([{l:'Paturēt pašreizējo',exit:true}])})}
function giftShop(){const c=C();const ks=['ziedi','sokolade','smarzas','rota','vins','lacis','gredzens'];modal({t:'Dāvanu veikals',ch:ks.map(k=>({l:`${ITEMS[k].n} · ${eur(ITEMS[k].p)}`,s:`Tev ir ${c.inv[k]||0}`,dis:c.money<ITEMS[k].p,fn:()=>{c.money-=ITEMS[k].p;addInv(k);advance(5);toast(`Nopirkts: ${ITEMS[k].n}`);save();refreshUI();giftShop()}})).concat([{l:'Aizvērt',exit:true}])})}
function furnShop(slots){const c=C(),lvl=HOMES[c.home].lvl;const list=FURN.filter(f=>!slots||slots.includes(f.slot));
  modal({t:'Mēbeles un tehnika',sub:`Tavs mājoklis: ${HOMES[c.home].n}`,ch:list.map(f=>{const owned=c.furn[f.slot]===f.id,fits=SLOTS_BY_LVL[lvl].includes(f.slot);return {l:`${f.n} · ${eur(f.p)}${owned?' ✓':''}`,s:[f.cf?`komforts +${f.cf}`:'',f.fun?`izklaide +${f.fun}`:'',f.st?`stils +${f.st}`:'',!fits?'neietilpst pašreizējā mājoklī':''].filter(Boolean).join(' · '),dis:owned||c.money<f.p,fn:()=>{c.money-=f.p;c.furn[f.slot]=f.id;advance(10);log(`Nopirkts: ${f.n}. Piegāde uz mājām.`);toast('Piegādāts uz mājām!');save();refreshUI();furnShop(slots)}}}).concat([{l:'Aizvērt',exit:true}])})}
function homeModal(){const c=C();modal({t:'Mājokļi',sub:`Pašlaik: ${HOMES[c.home].n}`,b:'<p>Pirktiem mājokļiem nav īres, tikai uzturēšana. Pārdodot saņem 90%. Mēbeles pārceļas līdzi.</p>',
  ch:HOMES.map((h,i)=>({l:h.n,s:h.buy?`Pirkt ${eur(h.buy)} · ${eur(h.rent)}/mēn.`:`Īre ${eur(h.rent)}/mēn.`,dis:i===c.home||(h.buy&&c.money+HOMES[c.home].buy*.9<h.buy)||(i===0&&!S.people.some(p=>p.rel==='parent'&&p.alive)),
    fn:()=>{c.money+=HOMES[c.home].buy*.9;c.money-=h.buy;c.home=i;addStat('happy',4);S.people.forEach(p=>{if(p.livesWith||['spouse','child'].includes(p.rel))genSched(p)});done(`Tu pārvācies: ${h.n}.`);checkTrophies()}})).concat([{l:'Aizvērt',exit:true}])})}
function vehModal(){const c=C();modal({t:'Auto salons',sub:`Pašlaik: ${VEH.find(v=>v.id===c.veh).n}`,ch:VEH.filter(v=>v.p).map(v=>({l:`${v.n} · ${eur(v.p)}`,s:`ātrums ×${v.sp}${v.rep?' · +slava':''}`,dis:c.veh===v.id||c.money<v.p,fn:()=>{c.money-=v.p;c.veh=v.id;if(v.rep)addRep(v.rep);done(`Tev ir ${v.n.toLowerCase()}! Pa pilsētu pārvietojies ātrāk.`);checkTrophies()}})).concat([{l:'Aizvērt',exit:true}])})}
function degModal(){const c=C();modal({t:'Studiju programmas',b:'<p>Studijas maksā 140 € mēnesī. Diploms nāk, apmeklējot lekcijas.</p>',closable:true,
  ch:DEG.map(d=>({l:d.n,s:`${d.m} lekcijas · vajag gudrību ${d.sm}${c.degrees.includes(d.id)?' · jau pabeigts':''}`,dis:c.stats.smarts<d.sm||c.degrees.includes(d.id),fn:()=>{c.study={id:d.id,p:0};done(`Tu iestājies: ${d.n}.`)}}))})}
function allJobsModal(){const c=C();modal({t:'Darba sludinājumi',sub:'Piesakies klātienē attiecīgajā vietā',ch:JOBS.map(j=>{const b=BLDS.find(x=>j.places.includes(x.type));return {l:`${j.n} · ${eur(j.sal[0])}`,s:`${b?b.n:''} · ${hstr(j.hours[0])}–${hstr(j.hours[1])}`,fn:()=>{if(b&&!S.where){goTo(b.door[0],b.door[1],{type:'door',id:b.id});S.tab='city';refreshUI()}else toast(`Dodies uz: ${b.n}`)}}}).concat([{l:'Aizvērt',exit:true}])})}
function partyModal(){const c=C();modal({t:'Partijas',b:'<p>Pašreizējie reitingi.</p>',closable:true,ch:BASE_PARTIES.map(p=>({l:`${p.n} (${p.sh})`,s:`${shareOf(p.id).toFixed(1)}%${S.country.gov.includes(p.id)?' · valdībā':' · opozīcijā'}`,fn:()=>{c.party=p.id;c.standing=10;c.rank=0;addInf(2);advance(30);done(`Tu iestājies partijā „${p.n}”.`)}}))})}
function foundParty(){const c=C(),names=['Jaunā vienotība','Kustība „Nākotne”','Pilsoņu spēks',sname(c.surIdx,c.sex)+' saraksts'];
  modal({t:'Jauna partija',b:'<p>Jaunā partija sāk ar ~3% atbalstu, un tu esi tās priekšsēdētājs.</p>',closable:true,ch:names.map(n=>({l:n,s:'15 000 €',fn:()=>{if(c.money<15000)return toast('Nepietiek naudas.');c.money-=15000;advance(120);
    S.own={id:'own',n,sh:n.replace(/[„”]/g,'').split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase(),color:'#ff5f8a',ax:[0,0]};S.country.pop.own=3;c.party='own';c.rank=3;c.standing=80;addInf(5);done(`Dibināta partija „${n}”!`)}}))})}
function candModal(){const c=C(),age=ageOf(c.bT),ch=[];
  const opt=(type,office,req,why)=>{const t=nextEl(type),soon=t-S.T<=8;ch.push({l:OFFICES[office].n,s:`${EL_N[type]} · ${MONL[dateOf(t).m]} ${dateOf(t).y}${!soon?' · pieteikšanās 8 mēn. pirms':''}${!req?' · '+why:''}`,dis:!soon||!req,fn:()=>{c.cand={type,office};c.campaign=0;advance(60);done(`Tu kandidē: ${OFFICES[office].n}. Lūdz balsis uz ielām!`)}})};
  opt('pasv','deputats',c.party&&c.inf>=10,'vajag partiju un ietekmi 10');opt('pasv','mers',c.party&&c.rank>=1&&(c.inf>=30||c.offices.includes('deputats')),'vajag aktīvista rangu un ietekmi 30');
  opt('saeima','saeima',c.party&&c.inf>=25,'vajag partiju un ietekmi 25');opt('prez','prezidents',c.inf>=75&&c.rep>=50&&age>=40,'vajag ietekmi 75, slavu 50, 40+ gadus');
  modal({t:'Kandidēšana',b:'<p>Kampaņas punktus vāc, lūdzot balsis garāmgājējiem, zvanot vēlētājiem partijas mītnē, ar reklāmu un debatēs.</p>',closable:true,ch})}
function projModal(){const c=C();modal({t:'Pilsētas projekti',b:'<p>Katru projektu var virzīt reizi gadā.</p>',closable:true,ch:PROJECTS.map(p=>{const cd=(c.projCd[p.id]??-99)+12>S.T,pc=Math.round((c.office==='mers'?.8:.45)*100);
  return {l:p.n,s:`${p.d} · izredzes ${pc}%${cd?' · jau virzīts šogad':''}`,dis:cd,fn:()=>{if(!spendT(120,0))return;c.projCd[p.id]=S.T;if(rnd()<pc/100){for(const f in p.fx)S.country[f]=cl(S.country[f]+p.fx[f]);addRep(p.rep);addInf(2);log(`Dome atbalsta projektu: ${p.n}.`,'g');done('Projekts apstiprināts!')}else done('Dome noraida projektu.')}}})})}
function lawModal(){const k=S.country;modal({t:'Likumprojekti',b:'<p>Izredzes atkarīgas no amata, koalīcijas nostājas un ietekmes.</p>',closable:true,ch:LAWS.map(L=>{const on=k.laws.includes(L.id),blocked=L.x&&k.laws.includes(L.x),pc=lawChance(L);
  return {l:(on?'Atcelt: ':'')+L.n,s:`${L.d} · izredzes ${pc}%${blocked?' · konfliktē ar spēkā esošu likumu':''}`,dis:blocked,fn:()=>{if(!spendT(120,0))return;done(passLaw(L,on,pc))}}})})}

/* ---------- Deju minispēle ---------- */
function startDance(b,partner){
  if(!spendT(30,0))return;
  const c=C(),ov=$('#dance');ov.hidden=false;
  const lanes=['←','↓','↑','→'],notes=[],dur=20,speed=1/2.2;let t0=performance.now(),hits=0,total=0,combo=0,raf;
  for(let i=0;i<22;i++)notes.push({lane:R(0,3),t:1.2+i*(.75+rnd()*.2),hit:false,miss:false});
  total=notes.length;
  ov.innerHTML=`<div class="dhead"><b>${partner?'Deja ar '+esc(partner.first):'Deju grīda'}</b><span id="dsc">0%</span></div><div class="dfield" id="dfield">${lanes.map((l,i)=>`<div class="lane" data-l="${i}"></div>`).join('')}<div class="hitline"></div></div><div class="dbtns">${lanes.map((l,i)=>`<button data-k="${i}" aria-label="Josla ${i+1}">${l}</button>`).join('')}</div><p class="muted" style="text-align:center;margin:6px 0 0">Spied pogu, kad bulta sasniedz līniju</p>`;
  const field=$('#dfield'),fh=()=>field.clientHeight;
  const els=notes.map(n=>{const e=document.createElement('div');e.className='note';e.textContent=lanes[n.lane];field.querySelector(`[data-l="${n.lane}"]`).appendChild(e);return e});
  const press=k=>{const now=(performance.now()-t0)/1000;let best=null,bd=.22;notes.forEach(n=>{if(!n.hit&&!n.miss&&n.lane===k){const d=Math.abs(n.t-now);if(d<bd){bd=d;best=n}}});
    const btn=ov.querySelector(`[data-k="${k}"]`);if(best){best.hit=true;hits++;combo++;btn.classList.add('ok');els[notes.indexOf(best)].classList.add('hit')}else{combo=0;btn.classList.add('bad')}setTimeout(()=>btn.classList.remove('ok','bad'),120)};
  ov.querySelectorAll('[data-k]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();press(+b.dataset.k)});
  const kh=e=>{const m={ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3}[e.key];if(m!=null){e.preventDefault();press(m)}};document.addEventListener('keydown',kh);
  const loop=()=>{const now=(performance.now()-t0)/1000,H_=fh();
    notes.forEach((n,i)=>{const y=(1-(n.t-now)*speed)*H_*.86;els[i].style.transform=`translateY(${y}px)`;els[i].style.opacity=n.hit?0:1;if(!n.hit&&!n.miss&&now-n.t>.22){n.miss=true;combo=0;els[i].classList.add('miss')}});
    $('#dsc').textContent=Math.round(hits/total*100)+'%'+(combo>2?` · kombo ${combo}`:'');
    if(now>notes[notes.length-1].t+.6){finish();return}raf=requestAnimationFrame(loop)};
  const finish=()=>{cancelAnimationFrame(raf);document.removeEventListener('keydown',kh);ov.hidden=true;ov.innerHTML='';
    const r=hits/total,club=b&&['club','vip'].includes(b.type);need('fun',10+r*15);c.skills.dance=cl(c.skills.dance+1+r*3);need('energy',-8);
    if(club)addRep(r*3);if(r>=.9)c.flags.dance90=true;
    let msg=`Deja: ${Math.round(r*100)}%. Deju prasme ${Math.round(c.skills.dance)}.`;
    if(partner){compBoost(partner,4+r*8,4+r*12);msg+=` ${partner.first} ir sajūsmā!`}
    // tuvumā esošie iespaidoti
    NPCS.forEach(n=>{const p=pById(n.pid);if(p&&p.rel!=='none'&&r>.7&&Math.hypot(n.x-P.x,n.y-P.y)<3){p.close=cl(p.close+3);bubble(n,'Forši dejo!')}});
    log(msg,'g');toast(msg);checkTrophies();refreshUI();save()};
  raf=requestAnimationFrame(loop);
}

/* ---------- Telefons ---------- */
function renderPhone(){
  const t=S.phoneTab||'contacts',c=C();
  const tabs=[['contacts','Kontakti'],['msgs','Ziņas'],['quests','Uzdevumi'],['map','Karte'],['trophies','Trofejas']];
  let body='';
  if(t==='contacts'){const list=S.people.filter(p=>p.alive&&(p.phone||isFamily(p)));
    body=list.length?`<div class="rows">${list.map(p=>`<div class="row"><div class="ava sm" style="background:${p.look.top.c}">${esc(p.first[0])}</div><div class="nm"><b>${esc(fullName(p))}</b><span>${relName(p)} · ${ageOf(p.bT)} g.${p.jobT?' · '+esc(p.jobT):''}</span><div class="mini2">${bar(p.close)}${!isFamily(p)&&ageOf(p.bT)>=18?bar(p.rom,'love'):''}</div></div><button class="btn" data-call="${p.id}">Zvanīt</button><button class="btn" data-inv="${p.id}">Uzaicināt</button></div>`).join('')}</div>`:'<p class="muted">Kontaktu vēl nav. Iepazīsties ar cilvēkiem un palūdz viņu numurus.</p>'}
  if(t==='msgs'){body=S.msgs.length?`<div class="rows">${S.msgs.map(m=>{const p=pById(m.from);if(m.day===S.day)m.read=true;return `<div class="row msg"><div class="nm"><b>${p?esc(p.first):'Ziņa'}</b><span>${m.day}. diena</span><p>${esc(m.text)}</p></div>${m.type==='invite'&&m.day===S.day&&!m.done?`<button class="btn" data-acc="${m.id}">Piekrist</button>`:''}${m.type==='chat'&&!m.done?`<button class="btn" data-rep="${m.id}">Atbildēt</button>`:''}</div>`}).join('')}</div>`:'<p class="muted">Ziņu nav.</p>'}
  if(t==='quests'){const q=S.quests.filter(x=>!x.done);body=q.length?`<div class="rows">${q.map(x=>`<div class="row"><div class="nm"><b>${esc(x.desc)}</b><span>Atlīdzība ${eur(x.reward)}${x.exp!=null?` · līdz ${x.exp}. dienai`:''}${x.type==='pet'?(x.found?' · kaķis noķerts — aiznes to saimniekam':' · meklē kaķi kartē'):''}</span></div>${x.b?`<button class="btn" data-goq="${x.b}">Rādīt</button>`:''}</div>`).join('')}</div>`:'<p class="muted">Aktīvu uzdevumu nav. Meklē cilvēkus ar <b style="color:var(--gold)">!</b> virs galvas.</p>'}
  if(t==='map')body=`<canvas id="mapc" class="mapc"></canvas><p class="muted small">Pieskaries ēkai, lai redzētu informāciju, aizietu turp vai izsauktu taksometru.</p>`;
  if(t==='trophies')body=`<div class="tro">${TROPHIES.map(x=>`<div class="tr ${S.trophies.includes(x.id)?'got':''}"><b>${S.trophies.includes(x.id)?'🏆':'○'} ${esc(x.n)}</b><span>${esc(x.d)}</span></div>`).join('')}</div>`;
  $('#phoneWrap').innerHTML=`<div class="phone"><div class="ptop"><b>${clockStr()}</b><span>${S.day}. diena</span></div><div class="ptabs">${tabs.map(([k,n])=>`<button data-pt="${k}" aria-pressed="${k===t}">${n}${k==='msgs'&&S.msgs.some(m=>!m.read)?' •':''}</button>`).join('')}</div><div class="pbody">${body}</div></div>`;
  $('#phoneWrap').querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{S.phoneTab=b.dataset.pt;renderPhone()});
  $('#phoneWrap').querySelectorAll('[data-call]').forEach(b=>b.onclick=()=>{const p=pById(+b.dataset.call);if(!spendT(10,0))return;p.close=cl(p.close+R(3,6)*moodMul());need('fun',2);done(`Tu parunājies ar ${p.first} pa telefonu.`);renderPhone()});
  $('#phoneWrap').querySelectorAll('[data-inv]').forEach(b=>b.onclick=()=>inviteModal(pById(+b.dataset.inv)));
  $('#phoneWrap').querySelectorAll('[data-acc]').forEach(b=>b.onclick=()=>{const m=S.msgs.find(x=>x.id===+b.dataset.acc),p=pById(m.from);m.done=true;p.appt={b:m.b,day:S.day,from:Math.max(hourNow(),m.from_h),until:Math.max(hourNow(),m.from_h)+3};p.close=cl(p.close+2);done(`${p.first} gaidīs tevi ${bld(m.b).n} no ${hstr(p.appt.from)}.`);renderPhone()});
  $('#phoneWrap').querySelectorAll('[data-rep]').forEach(b=>b.onclick=()=>{const m=S.msgs.find(x=>x.id===+b.dataset.rep),p=pById(m.from);m.done=true;p.close=cl(p.close+3);advance(2);done(`Tu atbildi ${p.first}.`);renderPhone()});
  $('#phoneWrap').querySelectorAll('[data-goq]').forEach(b=>b.onclick=()=>{const bb=bld(b.dataset.goq);mapInfo(bb)});
  if(t==='map')drawMap();
}
function inviteModal(p){const h=hourNow();const types=[['cafe','Kafejnīcā'],['restaurant','Restorānā'],['cinema','Kino'],['club','Klubā'],['pub','Krogā'],['beachbar','Pludmales bārā'],['museum','Muzejā']];
  modal({t:`Uzaicināt ${p.first}`,sub:'Kur satiksieties?',ch:types.map(([ty,n])=>{const b=bldOfType(ty),bb=bld(b);const open=h<bb.hours[1]-1;return {l:`${n} · ${bb.n}`,s:open?`atvērts līdz ${hstr(bb.hours[1])}`:'šodien vairs nav atvērts',dis:!open,fn:()=>{advance(5);
    const ok=(p.close>=25||p.rom>=25||isFamily(p))&&rnd()<.55+p.close/200+p.rom/200;if(!ok){p.close=cl(p.close-2);done(`${p.first}: „Šodien nevaru, piedod.”`);return}
    p.appt={b,day:S.day,from:Math.max(h,bb.hours[0])+.5,until:Math.min(bb.hours[1],Math.max(h,bb.hours[0])+3.5)};done(`${p.first} piekrīt! Tiekaties ${bb.n} ap ${hstr(Math.ceil(p.appt.from*2)/2)}.`)}}}).concat([{l:'Atcelt',exit:true}])})}
const CATCOL={home:'#ff6f61',apt:'#c9b8a8',parents:'#c9b8a8',house:'#c9b8a8',villa:'#c9b8a8',club:'#ff4fa3',vip:'#ff4fa3',pub:'#ff4fa3',beachbar:'#ff4fa3',casino:'#ff4fa3',cafe:'#f2a541',restaurant:'#f2a541',pizza:'#f2a541',icecream:'#f2a541',
  boutique:'#9b5bd6',luxe:'#9b5bd6',mall:'#9b5bd6',salon:'#9b5bd6',flowers:'#9b5bd6',super:'#9b5bd6',elec:'#9b5bd6',furniture:'#9b5bd6',carshop:'#9b5bd6',realestate:'#9b5bd6',gov:'#ffc857',party:'#ffc857',police:'#ffc857',media:'#3f7fd8',office:'#3f7fd8',bank:'#3f7fd8',agency:'#3f7fd8',uni:'#2fb7b0',library:'#2fb7b0',museum:'#2fb7b0',dance:'#2fb7b0',gym:'#46b06b',hosp:'#e04f5f',hotel:'#2fb7b0',cinema:'#ff4fa3',port:'#8a97a3',yacht:'#8a97a3'};
let MAPS=4;
function drawMap(){const cvm=$('#mapc');if(!cvm)return;const w=cvm.clientWidth;MAPS=w/64;cvm.width=Math.round(w*DPR);cvm.height=Math.round(w*DPR);const g=cvm.getContext('2d');g.scale(DPR*MAPS,DPR*MAPS);
  const col={0:'#9fd17f',1:'#6b6f7d',2:'#e8e1d3',3:'#47b5d8',4:'#f2df9f',5:'#efe5d3',6:'#9fd17f',7:'#cf9b63',8:'#b07f4f',9:'#8cc96b'};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){g.fillStyle=col[grid[gi(x,y)]];g.fillRect(x,y,1.02,1.02)}
  const hb=HOMES[C().home].b;
  BLDS.forEach(b=>{g.fillStyle=b.id===hb?'#ff6f61':(CATCOL[b.type]||'#ccc');g.fillRect(b.bx+.1,b.by+.1,b.w-.2,b.d-.2);if(!isOpen(b)&&!['apt','parents','house','villa'].includes(b.type)){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(b.bx+.1,b.by+.1,b.w-.2,b.d-.2)}});
  TAXIS.forEach(t=>{g.fillStyle='#ffd23f';g.fillRect(t.x-.2,t.y-.2,1.4,1.4)});
  S.quests.forEach(q=>{if(q.done)return;const pt=q.b?bld(q.b).door:q.type==='pet'&&!q.found?q.pet:null;if(pt){g.fillStyle='#ffc857';g.beginPath();g.arc(pt[0]+.5,pt[1]+.5,1.3,0,Math.PI*2);g.fill();g.strokeStyle='#3a2400';g.lineWidth=.3;g.stroke()}});
  const pp=S.where?bld(S.where.b).door:[P.x,P.y];g.fillStyle='#fff';g.beginPath();g.arc(pp[0],pp[1],1.4,0,Math.PI*2);g.fill();g.fillStyle='#ff3b6b';g.beginPath();g.arc(pp[0],pp[1],.9,0,Math.PI*2);g.fill();
  cvm.onclick=e=>{const r=cvm.getBoundingClientRect(),x=(e.clientX-r.left)/MAPS,y=(e.clientY-r.top)/MAPS;const b=BLDS.find(b=>x>=b.bx-.5&&x<=b.bx+b.w+.5&&y>=b.by-.5&&y<=b.by+b.d+.5);if(b)mapInfo(b)};
}
function mapInfo(b){const c=C(),open=isOpen(b),dist=Math.abs(b.door[0]-(S.where?bld(S.where.b).door[0]:P.x))+Math.abs(b.door[1]-(S.where?bld(S.where.b).door[1]:P.y)),fare=Math.round(8+dist*.25);
  const res=['apt','parents','house','villa'].includes(b.type);
  modal({t:b.n,sub:res?(HOMES[c.home].b===b.id?'Tavas mājas':'Dzīvojamā ēka'):`${open?'Atvērts':'Slēgts'} · ${hstr(b.hours[0])}–${hstr(b.hours[1])}`,ch:[
    {l:'Iet turp',s:`~${Math.round(dist/VEHSP())} min`,fn:()=>{if(S.where)leaveBuilding();S.tab='city';refreshUI();goTo(b.door[0],b.door[1],{type:'door',id:b.id})}},
    {l:'Taksometrs',s:`${eur(fare)} · 10 min`,dis:c.money<fare,fn:()=>{c.money-=fare;advance(10);if(S.where){S.where=null;ROOM=null}P.x=b.door[0]+.5;P.y=b.door[1]+.5;P.path=[];cam.init=false;spawnCity();S.tab='city';refreshUI();toast(`Taksometrs aizved tevi līdz: ${b.n}`)}},
    {l:'Aizvērt',exit:true}]})}

/* ---------- Dzīve ---------- */
function renderLife(){
  const c=C(),inc=income(),s=c.stats,j=jobDef(),hc=homeComfort();
  const sb=(n,v)=>`<div class="sb"><span>${n}</span>${bar(v)}<span>${Math.round(v)}</span></div>`;
  const inv=Object.keys(c.inv).filter(k=>c.inv[k]>0);
  $('#lifeWrap').innerHTML=`
  <div class="panel"><h2>Vajadzības</h2><div class="statbars">${sb('Enerģija',c.needs.energy)}${sb('Sāta',c.needs.food)}${sb('Prieks',c.needs.fun)}</div><p class="muted small" style="margin:0">Enerģiju atjauno miegs un kafija, sātu ēdiens, prieku izklaides un draugi. Zemas vajadzības pasliktina sarunas.</p></div>
  <div class="panel"><h2>Īpašības</h2><div class="statbars">${sb('Veselība',s.health)}${sb('Laime',s.happy)}${sb('Gudrība',s.smarts)}${sb('Izskats',s.looks)}${sb('Harizma',s.charm)}${sb('Slava',c.rep)}${sb('Ietekme',c.inf)}${sb('Deju prasme',c.skills.dance)}</div><p class="muted small" style="margin:0">Stils ${styleScore()} · Trofejas ${S.trophies.length}/${TROPHIES.length} · Rūķīši ${S.gnomes.length}/${GNOMES}</p></div>
  <div class="panel"><h2>Finanses</h2><div class="kv">
    <div><span class="lab">Nauda</span><b>${eur(c.money)}</b></div><div><span class="lab">Noguldījums</span><b>${eur(c.savings)}</b></div><div><span class="lab">Kredīts</span><b>${eur(c.debt)}</b></div>
    <div><span class="lab">Mēneša bilance</span><b style="color:${inc.total>=0?'var(--good)':'var(--bad)'}">${inc.total>=0?'+':''}${eur(inc.total)}</b><span class="muted small">${j&&!c.job.worked?'ja šodien nostrādāsi maiņu':''}</span></div><div><span class="lab">Īre un dzīve</span><b>${eur(inc.rent+inc.living)}</b></div><div><span class="lab">Uzņēmums</span><b>${c.biz?esc(c.biz.n)+' · '+eur(c.biz.val):'Nav'}</b></div></div></div>
  <div class="panel"><h2>Darbs un izglītība</h2><div class="kv">
    <div><span class="lab">Darbs</span><b>${j?esc(j.lv[c.job.lvl]):'Nav'}</b>${j?`<span class="muted small">${esc(bld(c.job.b).n)} · ${hstr(j.hours[0])}–${hstr(j.hours[1])} · ${c.job.worked?'šodien nostrādāts ✓':'šodien vēl jāstrādā'}</span>`:'<span class="muted small">Piesakies kafejnīcā, bārā, veikalā, birojā…</span>'}</div>
    <div><span class="lab">Darba rezultāts</span><b>${j?Math.round(c.job.perf)+'/100':'—'}</b></div>
    <div><span class="lab">Izglītība</span><b>${c.degrees.length?c.degrees.map(d=>DEG.find(x=>x.id===d).n).join(', '):'Vidusskola'}</b>${c.study?`<span class="muted small">Studē: ${DEG.find(d=>d.id===c.study.id).n} (${Math.floor(c.study.p)}/${DEG.find(d=>d.id===c.study.id).m})</span>`:''}</div></div></div>
  <div class="panel"><h2>Mājoklis un mantas</h2><div class="kv">
    <div><span class="lab">Mājoklis</span><b>${HOMES[c.home].n}</b><span class="muted small">komforts ${hc.cf} · ledusskapī ${c.fridge} maltītes</span></div>
    <div><span class="lab">Transports</span><b>${VEH.find(v=>v.id===c.veh).n}</b></div>
    <div><span class="lab">Mēbeles</span><b>${Object.values(c.furn).map(id=>FURN.find(f=>f.id===id).n).join(', ')||'Tikai pamata'}</b></div>
    <div><span class="lab">Somā</span><b>${inv.length?inv.map(k=>`${ITEMS[k].n} ×${c.inv[k]}`).join(', '):'Tukša'}</b></div></div>
    ${inv.some(k=>ITEMS[k].food||ITEMS[k].energy)?`<div class="rows">${inv.filter(k=>ITEMS[k].food||ITEMS[k].energy).map(k=>`<button class="btn" data-use="${k}">Izmantot: ${ITEMS[k].n}</button>`).join('')}</div>`:''}
    <div><button class="btn" id="wardBtn">Garderobe (${c.wardrobe.length})</button></div></div>
  <div class="panel"><h2>Ģimene un tuvie</h2><div class="rows">${S.people.filter(p=>p.rel!=='none'&&p.rel!=='acq').sort((a,b)=>b.close-a.close).slice(0,14).map(p=>`<div class="row"><div class="nm"><b>${esc(fullName(p))}</b><span>${relName(p)} · ${p.alive?ageOf(p.bT)+' g.':'miris'}</span></div><div style="width:120px">${bar(p.close)}</div></div>`).join('')||'<p class="muted">Vēl nav tuvu cilvēku.</p>'}</div></div>
  <div class="panel"><h2>Notikumu žurnāls</h2><div class="log">${S.log.slice(0,40).map(e=>`<div><time>${e.d||''}. d.</time><span class="${e.k}">${esc(e.msg)}</span></div>`).join('')}</div></div>`;
  $('#wardBtn').onclick=()=>wardrobeModal();
  $('#lifeWrap').querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{const k=b.dataset.use,it=ITEMS[k];c.inv[k]--;if(it.food)need('food',it.food);if(it.energy)need('energy',it.energy);advance(5);done(`Izmantots: ${it.n}.`)});
}
function renderPol(){
  const c=C(),PP=c.party?party(c.party):null,els=['pasv','saeima','prez'].map(t=>({t,at:nextEl(t)})).sort((a,b)=>a.at-b.at),k=S.country,ps=parties().slice().sort((a,b)=>shareOf(b.id)-shareOf(a.id)),maxs=Math.max(...ps.map(p=>shareOf(p.id)),1);
  const sb=(n,v,lab)=>`<div class="sb"><span>${n}</span>${bar(v)}<span>${lab??Math.round(v)}</span></div>`;
  $('#polWrap').innerHTML=`
  <div class="panel"><h2>Politiskā karjera</h2><div class="kv">
    <div><span class="lab">Partija</span><b>${PP?`<span style="color:${PP.color}">${esc(PP.n)}</span>`:'Bezpartejisks'}</b></div><div><span class="lab">Rangs</span><b>${PP?RANKS[c.rank]:'—'}</b></div>
    <div><span class="lab">Atbalsts partijā</span><b>${PP?Math.round(c.standing)+'/100':'—'}</b></div><div><span class="lab">Amats</span><b>${c.office?(c.office==='ministrs'?c.ministry+' ministrs':OFFICES[c.office].n):'Nav'}</b></div>
    <div><span class="lab">Kandidatūra</span><b>${c.cand?OFFICES[c.cand.office].n+' · '+Math.round(c.campaign)+' p.':'Nav'}</b></div><div><span class="lab">Korupcijas pēdas</span><b style="color:${c.corrupt>30?'var(--bad)':'inherit'}">${Math.round(c.corrupt)}</b></div></div>
    <p class="muted small" style="margin:0">Partijā iestājies Partiju mītnē, kandidē Valdības namā. Balsis vari lūgt jebkuram uz ielas.</p></div>
  <div class="panel"><h2>Vēlēšanu kalendārs</h2><div class="rows">${els.map(e=>`<div class="row"><div class="nm"><b>${EL_N[e.t]}</b><span>${MONL[dateOf(e.at).m]} ${dateOf(e.at).y} · pēc ${e.at-S.T} dienām</span></div></div>`).join('')}</div></div>
  <div class="panel"><div class="lab">Dzintarijas Republika</div><h2>Valdības reitings: ${approval()}%</h2>
    <p class="muted" style="margin:0">Ministru prezidents: ${esc(k.pm)} (${party(k.pmParty)?party(k.pmParty).sh:'—'}). Valsts prezidents: ${esc(c.office==='prezidents'?meName():k.pres)}. Koalīcija: ${k.gov.map(id=>party(id)?party(id).sh:'').join(' + ')}.</p>
    <div class="statbars">${sb('Ekonomika',k.econ)}${sb('Labklājība',k.happy)}${sb('Drošība',k.safety)}${sb('Korupcija',k.corr)}${sb('Budžets',50+k.budget/2,(k.budget>0?'+':'')+Math.round(k.budget))}</div></div>
  <div class="panel"><h2>Partiju reitingi</h2><div class="rows" style="gap:10px">${ps.map(p=>`<div class="pbar"><span><b style="color:${p.color}">${p.sh}</b> ${esc(p.n.split(' ')[0])}</span><div class="track"><span style="width:${shareOf(p.id)/maxs*100}%;background:${p.color}"></span></div><span>${shareOf(p.id).toFixed(1)}%</span></div>`).join('')}</div></div>
  <div class="panel"><h2>Spēkā esošie likumi</h2>${k.laws.length?`<div class="rows">${k.laws.map(id=>{const L=LAWS.find(x=>x.id===id);return `<div class="row"><div class="nm"><b>${L.n}</b><span>${L.d}</span></div></div>`}).join('')}</div>`:'<p class="muted" style="margin:0">Jaunu likumu vēl nav.</p>'}</div>`;
}
function renderDyn(){
  const p=Math.round(S.prestige+lifePts(C())),rank=p>=150?'Leģendāra dinastija':p>=70?'Elites dzimta':p>=30?'Ietekmīga ģimene':'Parasta ģimene';
  $('#dynWrap').innerHTML=`
  <div class="panel"><div class="lab">Dzimta ${esc(S.dynName)}</div><h2>${rank}</h2><p class="muted" style="margin:0">Prestižs ${p}. Tas dod nākamajām paaudzēm labākas īpašības, slavu un ietekmi.</p></div>
  <div class="panel"><h2>Paaudzes</h2><div class="rows">${S.dyn.map((g,i)=>`<div class="row gen"><span class="n">${i+1}</span><div class="nm"><b>${esc(g.name)}</b><span>${g.from}–${g.to} · ${g.best||'bez amata'} · ${eur(g.wealth)} · +${g.pts}</span></div></div>`).join('')}<div class="row gen"><span class="n">${S.dyn.length+1}</span><div class="nm"><b>${esc(meName())}</b><span>Dzīvo tagad · ${ageOf(C().bT)} g.</span></div></div></div></div>
  ${(S.hall||[]).length?`<div class="panel"><h2>Iepriekšējās dzimtas</h2><div class="rows">${S.hall.map(h=>`<div class="row"><div class="nm"><b>${esc(h.name)}</b><span>${h.gens} paaudzes · prestižs ${h.pres}</span></div></div>`).join('')}</div></div>`:''}
  <div class="panel"><h2>Kā spēlēt</h2><p class="muted" style="margin:0">Pieskaries zemei, lai ietu. Pieskaries ēkai, lai ieietu, cilvēkam, lai runātu, un priekšmetiem iekštelpās, lai tos izmantotu. Divi pirksti vai + un − tuvina pilsētu. Datorā darbojas peles rullītis un bultiņas. Katra diena ilgst no 8:00 līdz 2:00 un ir viens dzīves mēnesis. Spēle saglabājas automātiski.</p><div><button class="btn" id="resetBtn">Sākt no jauna</button></div></div>`;
  $('#resetBtn').onclick=()=>modal({t:'Sākt no jauna?',b:'<p>Pašreizējā dzimta tiks dzēsta.</p>',ch:[{l:'Jā, sākt no jauna',fn:()=>{S.hall=[];startScreen()}},{l:'Atcelt',exit:true}]});
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
  MQ.length=0;NPCS=[];
  let sex=rnd()<.5?'m':'f',first=pick(sex==='m'?MALE:FEMALE),sur=R(0,SUR.length-1),shirt=COLORS[0],cls=pick(['nab','vid','vid','vid','tur','tur','eli']),skin=SKIN[1],hair=sex==='f'?'long':'short',hairC=HAIRC[1][0];
  const draw=()=>{const C_=CLASSES[cls];
    $('#modalRoot').innerHTML=`<div class="ov start"><div class="sheet">
      <div class="head"><span class="lab">Ostmala · ${START_YEAR+20}</span><h2 class="logo">Ostmalas <em>dinastija</em></h2></div>
      <p style="margin:0">Tev ir 20 gadi, un tu tikko ieradies Ostmalā, saulainā pilsētā pie jūras. Iepazīsties, strādā, dejo, mīli, iesaisties politikā un veido dzimtu.</p>
      <canvas id="prev" width="160" height="160" class="prev" aria-hidden="true"></canvas>
      <div class="seg" role="group" aria-label="Dzimums"><button id="sm" aria-pressed="${sex==='m'}">Vīrietis</button><button id="sf" aria-pressed="${sex==='f'}">Sieviete</button></div>
      <label class="lab" for="fn">Vārds</label><input type="text" id="fn" value="${esc(first)}" maxlength="18">
      <div class="muted">Uzvārds: <b style="color:var(--fg)">${sname(sur,sex)}</b> <button class="btn" id="rs">Cits</button></div>
      <div><div class="lab">Āda</div><div class="sw" id="swS">${SKIN.map(c=>`<button data-v="${c}" style="background:${c}" aria-label="Ādas tonis" aria-pressed="${c===skin}"></button>`).join('')}</div></div>
      <div><div class="lab">Frizūra</div><div class="seg wrap">${HAIRS.filter(h=>h.id!=='bald').map(h=>`<button data-h="${h.id}" aria-pressed="${h.id===hair}">${h.n}</button>`).join('')}</div></div>
      <div><div class="lab">Matu krāsa</div><div class="sw" id="swH">${HAIRC.map(([c])=>`<button data-v="${c}" style="background:${c}" aria-label="Matu krāsa" aria-pressed="${c===hairC}"></button>`).join('')}</div></div>
      <div><div class="lab">Krekla krāsa</div><div class="sw" id="swT">${COLORS.map(c=>`<button data-v="${c}" style="background:${c}" aria-label="Krāsa" aria-pressed="${c===shirt}"></button>`).join('')}</div></div>
      <div class="origin"><div><div class="lab">Izcelsme</div><b>${C_.n}</b><div class="muted" style="font-size:13px">${C_.d} · sākumā ${eur(C_.money)}</div></div><button class="btn" id="rc">Cits liktenis</button></div>
      <div class="ch"><button id="go" class="go"><b>Ierasties Ostmalā</b><span>Pilsēta jau gaida</span></button></div></div></div>`;
    const sv=()=>first=$('#fn').value;
    $('#sm').onclick=()=>{sex='m';first=pick(MALE);hair='short';draw()};$('#sf').onclick=()=>{sex='f';first=pick(FEMALE);hair='long';draw()};
    $('#rs').onclick=()=>{sv();sur=R(0,SUR.length-1);draw()};$('#rc').onclick=()=>{sv();cls=pick(['nab','vid','tur','eli'].filter(x=>x!==cls));draw()};
    $('#swS').querySelectorAll('button').forEach(b=>b.onclick=()=>{sv();skin=b.dataset.v;draw()});$('#swH').querySelectorAll('button').forEach(b=>b.onclick=()=>{sv();hairC=b.dataset.v;draw()});$('#swT').querySelectorAll('button').forEach(b=>b.onclick=()=>{sv();shirt=b.dataset.v;draw()});
    document.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{sv();hair=b.dataset.h;draw()});
    const pc=$('#prev').getContext('2d');pc.setTransform(2.4,0,0,2.4,80,150);
    previewPerson(pc,{skin,hair,hairC,top:{t:sex==='f'?'tank':'tee',c:shirt},bot:{t:sex==='f'?'skirt':'jeans',c:sex==='f'?'#2c3150':'#1f3d6b'},shoe:'#f4f4f4',acc:null},sex);
    $('#go').onclick=()=>{const n=($('#fn').value||first).trim().slice(0,18)||first;$('#modalRoot').innerHTML='';
      newGame({first:n,sex,surIdx:sur,cls,shirt,skin,hair,hairC});S.tab='city';
      const hb=bld(HOMES[C().home].b);P.x=hb.door[0]+.5;P.y=hb.door[1]+.5;S.where=null;ROOM=null;initCars();spawnCity();cam.init=false;refreshUI();save();
      modal({t:'Laipni lūgts Ostmalā!',b:`<p>Pieskaries zemei, lai ietu. Pieskaries ēkai, lai ieietu, vai cilvēkam, lai runātu. Iekštelpās pieskaries priekšmetiem: letēm, galdiem, deju grīdai.</p><p>Tavas mājas apzīmē sarkanā zīme. Darbu vari atrast kafejnīcā, bārā, veikalā un citur. Telefonā ir kontakti, ziņas, uzdevumi un pilsētas karte.</p><p class="muted">Pa pilsētu ir paslēpti ${GNOMES} dārza rūķīši.</p>`,ch:[{l:'Sākt'}]})};
  };
  draw();
}
function previewPerson(pc,L,sex){const old=ctx;ctx=pc;try{drawPerson(0,0,L,sex,0,false,1,{})}finally{ctx=old}}

function boot(){
  resizeCanvas();
  if(!load())S=null;
  if(!S||!S.c){S=S&&S.hall?{hall:S.hall}:null;startScreen()}
  else{S.dead=false;if(!S.msgs)S.msgs=[];initCars();
    if(S.where){const b=bld(S.where.b);ROOM=makeRoom(b,S.where.variant);P.x=ROOM.exit[0]+.5;P.y=ROOM.exit[1]+.5;spawnRoom()}
    else{if(S.pos){P.x=S.pos[0];P.y=S.pos[1]}else{const hb=bld(HOMES[C().home].b);P.x=hb.door[0]+.5;P.y=hb.door[1]+.5}spawnCity()}
    S.lastHour=Math.floor(hourNow());refreshUI()}
  requestAnimationFrame(frame);
}
setInterval(()=>{if(S&&S.c&&!S.where){S.pos=[P.x,P.y]}save()},5000);
