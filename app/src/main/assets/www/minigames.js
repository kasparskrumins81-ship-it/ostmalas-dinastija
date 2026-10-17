/* ===================== Darbu minispēles ===================== */
let MG_ON=false;
function mgOpen(title,sub){MG_ON=true;const ov=$('#mg');ov.hidden=false;
  ov.innerHTML=`<div class="mghead"><div><b>${esc(title)}</b><span>${esc(sub)}</span></div><span id="mgsc"></span></div><div class="mgbody" id="mgb"></div><p class="mghint" id="mghint"></p>`;return $('#mgb')}
function mgHint(t){const e=$('#mghint');if(e)e.textContent=t}
function mgSc(t){const e=$('#mgsc');if(e)e.textContent=t}
function mgFinish(score,cb,lines){
  score=cl(score,0,1);const ov=$('#mg');
  ov.innerHTML=`<div class="mgres"><div class="lab">Rezultāts</div><div class="big">${Math.round(score*100)}%</div><div class="stars">${'★'.repeat(Math.round(score*5))}${'☆'.repeat(5-Math.round(score*5))}</div>${(lines||[]).map(l=>`<p>${esc(l)}</p>`).join('')}<button class="fb sleep" id="mgok">Turpināt</button></div>`;
  $('#mgok').onclick=()=>{ov.hidden=true;ov.innerHTML='';MG_ON=false;cb(score)};
}
function startMinigame(type,lvl,cb,title){({simon:mgSimon,change:mgChange,tables:mgTables,dance:mgDance,pairs:mgPairs,stocks:mgStocks})[type](lvl||0,cb,title)}

/* Barista: atceries pasūtījumu secību (Simon) */
function mgSimon(lvl,cb){
  const box=mgOpen('Kafejnīca „Kafija & Co”','Atkārto klienta pasūtījumu');
  const it=[['☕','Espreso'],['🥛','Late'],['🍫','Kakao'],['🍵','Tēja']];
  box.innerHTML=`<div class="simon">${it.map((x,i)=>`<button data-i="${i}" class="sb${i}"><span>${x[0]}</span><b>${x[1]}</b></button>`).join('')}</div>`;
  const btns=[...box.querySelectorAll('button')],seq=[];let pos=0,round=0,lives=2,busy=true;const maxR=8,spd=Math.max(260,560-lvl*90);
  const flash=(i,ms)=>new Promise(r=>{btns[i].classList.add('on');setTimeout(()=>{btns[i].classList.remove('on');setTimeout(r,120)},ms)});
  const next=async()=>{round++;if(round>maxR)return end();seq.push(R(0,3));
    busy=true;mgSc(`Klients ${round}/${maxR} · ♥${lives}`);mgHint('Klients pasūta…');await new Promise(r=>setTimeout(r,500));for(const i of seq)await flash(i,spd);pos=0;busy=false;mgHint('Tava kārta! Pieskaries dzērieniem tādā pašā secībā.')};
  const end=()=>{const done=Math.min(maxR,round-1);mgFinish(done/maxR,cb,[`Apkalpoti ${done} no ${maxR} klientiem.`])};
  btns.forEach((b,i)=>b.onpointerdown=e=>{e.preventDefault();if(busy)return;b.classList.add('on');setTimeout(()=>b.classList.remove('on'),150);
    if(seq[pos]===i){pos++;if(pos>=seq.length){busy=true;mgHint('Pareizi! 👍');setTimeout(next,450)}}
    else{lives--;busy=true;mgHint('Nepareizs dzēriens! Klients sarauc pieri.');if(lives<=0){setTimeout(end,600);return}round--;seq.pop();setTimeout(next,700)}});
  for(let k=0;k<lvl;k++)seq.push(R(0,3));
  setTimeout(next,400);
}
/* Kasieris: izdod pareizu atlikumu */
function mgChange(lvl,cb){
  const box=mgOpen('Naktsklubs „Supernova” · kase','Izvēlies pareizo atlikumu');
  let t=40-lvl*4,ok=0,bad=0,cur=null,timer;const end=()=>{clearInterval(timer);mgFinish(ok/12-bad*.07,cb,[`Pareizi: ${ok} · Kļūdas: ${bad}`])};
  const task=()=>{const bill=R(4,46)+pick([0,.25,.5,.75,.1,.4,.9]);const paid=[5,10,20,50,100].find(v=>v>bill+(rnd()<.5?0:3))||100;const ch=+(paid-bill).toFixed(2);
    const opts=new Set([ch]);while(opts.size<4){const d=pick([.25,.5,1,2,5,.1,10]);const v=+(ch+(rnd()<.5?-d:d)).toFixed(2);if(v>0)opts.add(v)}
    cur={ch};box.innerHTML=`<div class="till"><div class="bill"><span>Rēķins</span><b>$${bill.toFixed(2)}</b></div><div class="bill"><span>Klients dod</span><b>$${paid}</b></div></div><div class="opts">${[...opts].sort(()=>rnd()-.5).map(v=>`<button data-v="${v}">$${v.toFixed(2)}</button>`).join('')}</div>`;
    box.querySelectorAll('button').forEach(b=>b.onpointerdown=e=>{e.preventDefault();if(+b.dataset.v===cur.ch){ok++;b.classList.add('ok')}else{bad++;b.classList.add('bad')}setTimeout(task,220)})};
  mgHint('Atlikums = klienta nauda − rēķins. Jo ātrāk, jo lielāka alga!');
  timer=setInterval(()=>{t--;mgSc(`${t} s · ✓${ok}`);if(t<=0)end()},1000);mgSc(`${t} s`);task();
}
/* Viesmīlis: apkalpo galdiņus, pirms klienti aiziet */
function mgTables(lvl,cb){
  const box=mgOpen('Restorāns · zāle','Pieskaries galdiņam, kas sauc viesmīli');
  box.innerHTML=`<div class="tables">${Array.from({length:9},(_,i)=>`<button data-i="${i}"><span class="tb">🍽</span><i></i></button>`).join('')}</div>`;
  const btns=[...box.querySelectorAll('button')],act=new Map();let served=0,missed=0,wrong=0,t=32,spawnT=0,last=performance.now(),raf;const life=Math.max(1.1,2-lvl*.25),icons=['🍷','🧾','🍲','☕','🍰'];
  const loop=now=>{const dt=(now-last)/1000;last=now;t-=dt;spawnT-=dt;
    if(spawnT<=0){spawnT=Math.max(.45,.9-lvl*.12)*(.7+rnd()*.6);const free=btns.map((b,i)=>i).filter(i=>!act.has(i));if(free.length){const i=pick(free);act.set(i,life);btns[i].classList.add('call');btns[i].querySelector('.tb').textContent=pick(icons)}}
    act.forEach((v,i)=>{v-=dt;if(v<=0){act.delete(i);missed++;btns[i].classList.remove('call');btns[i].classList.add('miss');btns[i].querySelector('.tb').textContent='😠';setTimeout(()=>{btns[i].classList.remove('miss');btns[i].querySelector('.tb').textContent='🍽'},400)}else{act.set(i,v);btns[i].querySelector('i').style.width=(v/life*100)+'%'}});
    mgSc(`${Math.ceil(t)} s · ✓${served}`);if(t<=0){cancelAnimationFrame(raf);mgFinish(served/(served+missed+wrong*.5+1)*1.08,cb,[`Apkalpoti: ${served} · Aizgāja dusmīgi: ${missed}`]);return}raf=requestAnimationFrame(loop)};
  btns.forEach((b,i)=>b.onpointerdown=e=>{e.preventDefault();if(act.has(i)){act.delete(i);served++;b.classList.remove('call');b.classList.add('ok');b.querySelector('.tb').textContent='😊';setTimeout(()=>{b.classList.remove('ok');b.querySelector('.tb').textContent='🍽'},300)}else wrong++});
  mgHint('Klienti ar ikonu gaida. Nepaspēsi — viņi aizies!');raf=requestAnimationFrame(loop);
}
/* Dejotājs / deju grīda: ritma spēle */
function mgDance(lvl,cb,title){
  const box=mgOpen(title||'Naktsklubs „Supernova” · skatuve','Spied bultu, kad tā sasniedz līniju');
  const lanes=['←','↓','↑','→'],notes=[],speed=1/(2.2-lvl*.25);let t0=performance.now(),hits=0,combo=0,raf;
  for(let i=0;i<24;i++)notes.push({lane:R(0,3),t:1.2+i*(Math.max(.42,.72-lvl*.1)+rnd()*.18),hit:false,miss:false});
  box.innerHTML=`<div class="dfield" id="dfield">${lanes.map((l,i)=>`<div class="lane" data-l="${i}"></div>`).join('')}<div class="hitline"></div></div><div class="dbtns">${lanes.map((l,i)=>`<button data-k="${i}" aria-label="Josla ${i+1}">${l}</button>`).join('')}</div>`;
  const field=$('#dfield');
  const els=notes.map(n=>{const e=document.createElement('div');e.className='note';e.textContent=lanes[n.lane];field.querySelector(`[data-l="${n.lane}"]`).appendChild(e);return e});
  const press=k=>{const now=(performance.now()-t0)/1000;let best=null,bd=.22;notes.forEach(n=>{if(!n.hit&&!n.miss&&n.lane===k){const d=Math.abs(n.t-now);if(d<bd){bd=d;best=n}}});
    const btn=box.querySelector(`[data-k="${k}"]`);if(best){best.hit=true;hits++;combo++;btn.classList.add('ok');els[notes.indexOf(best)].classList.add('hit')}else{combo=0;btn.classList.add('bad')}setTimeout(()=>btn.classList.remove('ok','bad'),120)};
  box.querySelectorAll('[data-k]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();press(+b.dataset.k)});
  const kh=e=>{const m={ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3}[e.key];if(m!=null){e.preventDefault();press(m)}};document.addEventListener('keydown',kh);
  const loop=()=>{const now=(performance.now()-t0)/1000,H_=field.clientHeight;
    notes.forEach((n,i)=>{const y=(1-(n.t-now)*speed)*H_*.86;els[i].style.transform=`translateY(${y}px)`;els[i].style.opacity=n.hit?0:1;if(!n.hit&&!n.miss&&now-n.t>.22){n.miss=true;combo=0;els[i].classList.add('miss')}});
    mgSc(Math.round(hits/notes.length*100)+'%'+(combo>2?` · kombo ${combo}`:''));
    if(now>notes[notes.length-1].t+.6){cancelAnimationFrame(raf);document.removeEventListener('keydown',kh);mgFinish(hits/notes.length,cb,[`Trāpīti ${hits} no ${notes.length} soļiem.`]);return}raf=requestAnimationFrame(loop)};
  raf=requestAnimationFrame(loop);
}
/* Birojs: sakārto dokumentu pārus */
function mgPairs(lvl,cb){
  const box=mgOpen('Birojs Volstrītā','Atrodi vienādu dokumentu pārus');
  const sy=['📄','📊','📎','✉️','📁','🗂️','🖊️','📌'],cards=sy.concat(sy).sort(()=>rnd()-.5);let open=[],found=0,t=Math.max(35,60-lvl*8),lock=false,timer;
  box.innerHTML=`<div class="pairs">${cards.map((c,i)=>`<button data-i="${i}"><span>${c}</span></button>`).join('')}</div>`;
  const btns=[...box.querySelectorAll('button')];const T0=t;
  const end=()=>{clearInterval(timer);mgFinish(found/8*(.6+.4*t/T0),cb,[`Sakārtoti ${found} no 8 pāriem.`])};
  btns.forEach((b,i)=>b.onpointerdown=e=>{e.preventDefault();if(lock||b.classList.contains('up')||b.classList.contains('done'))return;b.classList.add('up');open.push(i);
    if(open.length===2){const [a,c]=open;if(cards[a]===cards[c]){btns[a].classList.add('done');btns[c].classList.add('done');open=[];found++;if(found===8)setTimeout(end,300)}else{lock=true;setTimeout(()=>{btns[a].classList.remove('up');btns[c].classList.remove('up');open=[];lock=false},600)}}});
  timer=setInterval(()=>{t--;mgSc(`${t} s · ${found}/8`);if(t<=0)end()},1000);mgSc(`${t} s`);mgHint('Atver divas kartītes. Vienādās paliek atvērtas.');
}
/* Makleris: pērc lēti, pārdod dārgi */
function mgStocks(lvl,cb){
  const box=mgOpen('Ņujorkas birža','Pērc, kad cena zema, pārdod, kad augsta');
  box.innerHTML=`<div class="stk"><div class="stkhead"><b id="stkN">MANH</b><span id="stkP">$100.00</span><span id="stkPL">P/Z: $0.00</span></div><canvas id="stkc"></canvas><div class="stknews" id="stkNews">Tirgus atveras…</div><div class="stkb"><button id="buy" class="ok">PIRKT</button><button id="sell" class="bad">PĀRDOT</button></div></div>`;
  const cvs=$('#stkc'),g=cvs.getContext('2d');let price=100,hist=[100],drift=0,driftT=0,hold=null,pl=0,trades=0,t=40,acc=0,last=performance.now(),raf;
  const NEWS=[['Tehnoloģiju gigants ziņo par rekordpeļņu!',1],['Valdība paaugstina nodokļus bankām.',-1],['Investori panikā — krīzes baumas!',-1],['Jauns iPod hits pārdošanā!',1],['Naftas cenas krītas.',1],['Skandāls valdes sēdē!',-1]];
  const draw=()=>{const w=cvs.clientWidth,h=cvs.clientHeight;cvs.width=w*DPR;cvs.height=h*DPR;g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='#0b1220';g.fillRect(0,0,w,h);
    const mn=Math.min(...hist)-2,mx=Math.max(...hist)+2;g.strokeStyle='rgba(255,255,255,.08)';for(let i=1;i<4;i++){g.beginPath();g.moveTo(0,h*i/4);g.lineTo(w,h*i/4);g.stroke()}
    if(hold){const y=h-(hold-mn)/(mx-mn)*h;g.strokeStyle='#ffc857';g.setLineDash([4,4]);g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();g.setLineDash([])}
    g.strokeStyle=hist[hist.length-1]>=hist[0]?'#3dff8a':'#ff5d5d';g.lineWidth=2;g.beginPath();hist.forEach((v,i)=>{const x=i/(hist.length-1||1)*w,y=h-(v-mn)/(mx-mn)*h;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()};
  const upd=()=>{$('#stkP').textContent='$'+price.toFixed(2);$('#stkPL').textContent='P/Z: '+(pl+(hold?price-hold:0)>=0?'+':'')+'$'+(pl+(hold?price-hold:0)).toFixed(2);$('#buy').disabled=!!hold;$('#sell').disabled=!hold};
  const loop=now=>{const dt=(now-last)/1000;last=now;t-=dt;acc+=dt;driftT-=dt;
    if(driftT<=0){if(rnd()<.55){const nw=pick(NEWS);drift=nw[1]*(1.2+rnd()*1.2);$('#stkNews').textContent='📰 '+nw[0]}else{drift=(rnd()-.5)*.8;$('#stkNews').textContent='Tirgus svārstās…'}driftT=3+rnd()*3}
    while(acc>.12){acc-=.12;price=Math.max(20,price+drift*.18+(rnd()-.5)*(1.6+lvl*.6));hist.push(price);if(hist.length>120)hist.shift()}
    draw();upd();mgSc(`${Math.ceil(t)} s`);
    if(t<=0){cancelAnimationFrame(raf);if(hold){pl+=price-hold;hold=null}mgFinish(.45+pl/36,cb,[`Darījumi: ${trades} · Peļņa: ${pl>=0?'+':''}$${pl.toFixed(2)} par akciju`]);return}raf=requestAnimationFrame(loop)};
  $('#buy').onpointerdown=e=>{e.preventDefault();if(!hold){hold=price;trades++}};
  $('#sell').onpointerdown=e=>{e.preventDefault();if(hold){pl+=price-hold;hold=null}};
  mgHint('Seko ziņām: labas ziņas ceļ cenu, sliktas — gāž.');raf=requestAnimationFrame(loop);
}
