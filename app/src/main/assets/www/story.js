/* ===================== Stāsts (40 dienas Ņujorkā) ===================== */
const sp=k=>pByKey(k);
function sweetName(){const p=sp('sweet');return p?p.first:''}
function objectives(){const F=S.flags,c=C(),sw=sp('sweet'),out=[];
  out.push({t:'Atrodi savu jauno dzīvokli: Blīkera iela 14, Grīnvičvilidža',done:F.arrived,hint:'Ej uz sarkano zīmi „Mājas”. Tas ir pavisam tuvu metro stacijai.'});
  if(F.arrived)out.push({t:'Atrodi istabas biedru, kas maksās pusi īres',done:F.roommate,hint:'Lūsija bieži sēž kafejnīcā „Kafija & Co” un staigā pa Grīnviču. Sadraudzējies (draudzība 35) un piedāvā istabu.'});
  if(F.arrived)out.push({t:'Atrodi darbu un nostrādā pirmo maiņu',done:F.shifts>0,hint:'Kafejnīcā „Kafija & Co” baristu ņem uzreiz. Labākiem darbiem vajag īpašības un draugu ieteikumus.'});
  out.push({t:'Iegūsti 3 čomus (draudzība 35+)',done:S.people.filter(p=>!p.fam&&p.f>=35).length>=3,hint:'Runā par tēmām, kas cilvēkiem patīk. Uzzini intereses, pajautājot „par sevi”.'});
  if(S.day>=3&&sw){out.push({t:`Tava skolas mīlestība ${sw.first} ir Ņujorkā! Atrodi ${sw.sex==='f'?'viņu':'viņu'}`,done:F.sweetMet,hint:`${sw.first} bieži ir Grīnvičā, kafejnīcā un Metropolitēna muzejā.`});
    if(F.sweetMet&&!S.people.some(p=>p.steady))out.push({t:`Aizved ${nAcc(sw.first)} uz 3 randiņiem (${Math.min(3,sw.dates||0)}/3)`,done:(sw.dates||0)>=3,hint:'Kad draudzība 50+, aicini uz randiņu. Izvēlies vietu, kas viņam/viņai patīk.'});
    if(F.sweetMet)out.push({t:'Kļūsti par pāri ar kādu',done:S.people.some(p=>p.steady),hint:'Pēc 3 randiņiem un romantikas 70 piedāvā kļūt par pāri.'})}
  if(F.partyDay)out.push({t:`Pārsteiguma ballīte restorānā „Zelta pūķis” ${F.partyDay}. dienā no 20:00`,done:F.party,hint:'Čainataunā. Ienāc restorānā vakarā.'});
  out.push({t:'Kļūsti par biržas makleri Volstrītā',done:c.job&&c.job.id==='trader',hint:'Vajag spēku 45, kultūru 50 un Bredlija ieteikumu (draudzība 80). Spēku trenē sporta klubā, kung-fu skolā vai pie Vecā Sema parkā.'});
  if(S.day>=10)out.push({t:'Baumas: kāds slavens naktīs pazūd Čainataunā…',done:F.savedActor,hint:'Pastaigā pa Čainataunu pēc 21:00. Noderēs spēks (50) vai draugi policijā.'});
  if(F.savedActor){out.push({t:'Apmeklē Čeisa filmēšanu (draudzība 60)',done:F.filmset,hint:'Runā ar Čeisu Maksvelu — viņš bieži ir „Plaza” viesnīcā un Piektajā avēnijā.'});
    if(F.filmset)out.push({t:'Sarunā publicitātes līgumu ar aģentu Mārvinu (popularitāte 55)',done:F.contract,hint:'Mārvins sēž „Plaza” bārā. Kļūsti populārāks: draugi, stils, darbs, slava.'});
    if(F.premiereDay)out.push({t:`Filmas pirmizrāde Taimskvērā ${F.premiereDay}. dienā no 20:00`,done:F.premiere,hint:'Kinoteātris „Ekrāns” Taimskvērā. Saposies!'})}
  out.push({t:`Nodzīvo ${LEASE_DAYS} dienas un gūsti panākumus (${Math.min(S.day,LEASE_DAYS)}/${LEASE_DAYS})`,done:F.ended,hint:'Panākumus vērtē pēc karjeras, mīlestības, draugiem, īpašībām un slavas.'});
  return out}
function nextHint(){const o=objectives().find(x=>!x.done);return o?o.hint:'Tu visu esi paveicis! Bauda Ņujorku.'}
function storyMark(p){const F=S.flags;
  if(p.key==='lucy'&&F.arrived&&!F.roommate)return '★';
  if(p.key==='sweet'&&!F.sweetMet&&S.day>=3)return '★';
  if(p.key==='star'&&F.savedActor&&!F.filmset)return '★';
  if(p.key==='agent'&&F.filmset&&!F.contract)return '★';
  if(p.key==='sam'&&F.samDay!==S.day)return '★';
  if(p.key&&JOBS.some(j=>j.intro===p.key&&!S.flags['intro_'+j.id]&&p.f>=35))return '★';
  return null}
function storyPins(){const F=S.flags,o=[];if(!F.arrived)o.push('home');else if(!F.roommate||!F.shifts)o.push('cafe');
  if(F.partyDay&&!F.party&&S.day===F.partyDay)o.push('dimsum');if(F.premiereDay&&!F.premiere&&S.day>=F.premiereDay)o.push('cinema');if(F.filmset&&!F.contract)o.push('plaza');return o}
function cut(t,html,ch){modal({t,b:html,ch:ch||[{l:'Turpināt'}]})}
function storyEnter(b){const F=S.flags,h=hourNow();
  if(b.id==='home'&&!F.arrived){F.arrived=1;const bro=sp('bro');bro.met=1;
    cut('Edgars',`<p>„Sveiks, ${esc(C().first)}! Laipni lūgts Ņujorkā! Šī ir mūsu istaba Blīkera ielā.”</p><p>„Īre ir <b>${usd(HOMES[0].rent)} nedēļā</b> — to katru 7. dienu ievāc saimnieka dēls Kevins. Mammas nauda ilgi nepietiks, tāpēc atrodi <b>darbu</b> un <b>istabas biedru</b>, kas maksās pusi.”</p><p>„Tev ir <b>${LEASE_DAYS} dienas</b> līdz līguma beigām. Iepazīsti cilvēkus, atrodi mīlestību un kļūsti par kādu šajā pilsētā!”</p><p class="muted">Padoms: ēd, guli, ej dušā un uz tualetes — citādi īpašības kritīsies.</p>`);log('Tu atradi savu jauno mājvietu.','g')}
  if(b.id==='dimsum'&&F.partyDay===S.day&&!F.party&&h>=20){F.party=1;const st=S.people.find(p=>p.steady);['nina','marko'].forEach(k=>{const p=sp(k);p.met=1;p.f=Math.max(p.f,40);p.phone=1;genSched(p)});if(st)bond(st,5,10);addFame(3);
    cut('Pārsteiguma ballīte!',`<p>„PĀRSTEIGUMS!” Svētku lukturi, kūka un mūzika. ${st?esc(st.first)+' tevi iepazīstina ar saviem draugiem':'Tu iepazīsties ar jauniem cilvēkiem'} — karaoke karalieni <b>Ninu</b> un fitnesa fanātiķi <b>Marko</b>.</p><p class="muted">Abi tagad ir tavi kontakti (draudzība 40).</p>`);log('Pārsteiguma ballīte „Zelta pūķī”! Jauni draugi.','g');checkTrophies()}
  if(b.id==='cinema'&&F.premiereDay&&S.day>=F.premiereDay&&!F.premiere&&h>=20)premiere();
}
function premiere(){const F=S.flags,st=S.people.find(p=>p.steady),star=sp('star');F.premiere=1;addFame(8);
  if(!F.contract){cut('Pirmizrāde',`<p>Sarkanais paklājs, paparaci zibspuldzes un Čeiss Maksvels tev pamāj no skatuves: „Šis cilvēks izglāba man dzīvību!” Visa zāle aplaudē.</p><p class="muted">+slava</p>`);checkTrophies();save();return}
  modal({t:'Pirmizrāde Taimskvērā',b:`<p>Zibspuldzes, sarkanais paklājs, filmas zvaigznes. Aģents Mārvins pasniedz tev līgumu: „Paraksti — un rīt visa Amerika zinās tavu vārdu. Bet tev būs jābrauc uz Losandželosu.”</p>${st?`<p>Zālē tevi gaida ${esc(st.first)} un visi tavi draugi.</p>`:'<p>Zālē tevi gaida visi tavi Ņujorkas draugi.</p>'}`,
    ch:[{l:'Parakstīt līgumu',s:'Slava un nauda · draugi un mīlestība cietīs',fn:()=>{F.ending='fame';addFame(30);C().money+=5000;S.people.forEach(p=>{if(!p.fam&&p.f>=35&&p.key!=='star'&&p.key!=='agent')p.f=cl(p.f-12,0,FMAX)});if(st){st.rom=cl(st.rom-45,0,FMAX);if(st.rom<40){st.steady=0;log(`${st.first} tevi pamet — „Tev svarīgāka ir slava.”`,'b')}}
        if(star){star.f=FMAX;if(!star.noRom)star.rom=cl(star.rom+40,0,FMAX)}cut('Slavenība',`<p>Mārvins smaida. Čeiss pieiet tev klāt: „Patiesību sakot… es tevī esmu iemīlējies kopš tās nakts Čainataunā.”</p><p>Rīt tava seja būs visos Taimskvēra ekrānos. +$5000</p>`);log('Tu paraksti līgumu ar Mārvinu. Slava!','y');checkTrophies();save()}},
      {l:'Atteikties un palikt ar draugiem',s:'Draugi un mīlestība ir svarīgāki',fn:()=>{F.ending='friends';addFame(5);S.people.forEach(p=>{if(!p.fam&&p.f>=35)p.f=cl(p.f+10,0,FMAX)});if(st)st.rom=cl(st.rom+25,0,FMAX);
        cut('Īstā bagātība',`<p>Čeiss saplēš līgumu un smaida: „Tu esi īsts draugs. Tādu Holivudā nav.” ${st?esc(st.first)+' apskauj tevi zāles vidū.':'Draugi tevi apskauj.'}</p><p>Tu esi laimīgs savā Ņujorkā.</p>`);log('Tu paliec ar draugiem. Čeiss saplēš līgumu.','g');checkTrophies();save()}}]});
}
function storyOptions(p,n){const F=S.flags,c=C(),out=[];
  const A=(l,s,mins,cost,fn,lock)=>({l,s:s+(mins?` · ${mins} min`:'')+(cost?` · ${usd(cost)}`:''),dis:!!lock,why:lock,fn:()=>{if(!spendT(mins,cost)){socialMenu(n);return}const r=fn();if(r&&r.msg)toast(r.msg);if(r&&r.b)bubble(n,r.b);checkTrophies();renderHUD();save();if(!(r&&r.stop))socialMenu(n);else{n.talking=false;n.hold=false}}});
  if(p.key==='bro')out.push(A('Pajautāt Edgaram padomu','',5,0,()=>({msg:nextHint(),b:'Klausies brāli!'})));
  if(p.key==='lucy'&&F.arrived&&!F.roommate&&p.met)out.push(A('★ Piedāvāt istabu Blīkera ielā','Draudzība 35 · viņa maksās pusi īres',10,0,()=>{if(p.f>=35){F.roommate=1;p.homeB='home';genSched(p);log('Lūsija kļūst par tavu istabas biedreni! Īre tagad uz pusēm.','g');return {msg:`Lūsija pārvācas pie jums! Īre tagad ${usd(rentDue())} nedēļā.`,b:'Ura! Kaimiņi!'}}return {msg:'„Mēs vēl tik maz pazīstamies…” (Vajag draudzību 35.)',b:'Varbūt vēlāk.'}},p.f<35?`Draudzība ${Math.floor(p.f)}/35`:null));
  if(p.key==='sam'&&p.met){const fed=F.samFed===S.day;out.push(A('★ Mācīties „piedzērušā kung-fu”','+6 spēks, −30 higiēna, −15 miegs · reizi dienā',60,fed?0:10,()=>{F.samDay=S.day;addSt('strength',6);addSt('health',1);need('hygiene',-30);need('energy',-15);bond(p,4,0);return {msg:'Sems šūpojas kā piedzēries, bet sit kā zibens. Tu kļūsti stiprāks… un smirdīgāks.',b:'Hī-jā!'}},F.samDay===S.day?'Šodien jau trenējāties':c.needs.energy<15?'Pārāk noguris':null));if(!fed&&F.samDay!==S.day)out.push({l:'Padoms',s:'Sems trenē par $10 — vai bez maksas, ja uzdāvini hotdogu',dis:true})}
  if(p.key==='sweet'&&!F.sweetMet&&S.day>=3)out.push(A(`★ „${p.first}?! Vai tas tiešām esi tu?”`,'Satikt skolas mīlestību',15,0,()=>{F.sweetMet=1;p.met=1;p.phone=1;p.f=Math.max(p.f,42);p.rom=Math.max(p.rom,22);p.known[p.likes[0]]=1;log(`Tu satiec ${nAcc(p.first)} — savu skolas mīlestību no Valmieras!`,'g');
    cut(`${p.first}`,`<p>„${esc(C().first)}! Es nespēju noticēt — no visām pilsētām pasaulē!” ${p.first} tevi apskauj. „Atceries mūsu izlaidumu? Man tagad ir tik daudz ko tev izstāstīt…”</p><p class="muted">Draudzība 42 · Romantika 22 · Telefona numurs saņemts</p>`);return {b:'Tu!!!',stop:1}}));
  if(p.key==='star'&&F.savedActor&&!F.filmset)out.push(A('★ Apmeklēt filmēšanas laukumu','Draudzība 60 · +slava',120,0,()=>{if(p.f<60)return {msg:'„Nākamnedēļ, labi?” (Vajag draudzību 60.)',b:'Vēlāk.'};F.filmset=1;addFame(6);addSt('culture',3);const ag=sp('agent');ag.met=1;ag.f=Math.max(ag.f,25);ag.gatePop=45;
    cut('Filmēšanas laukumā',`<p>Prožektori, kameras, „Motors!” Čeiss tevi visiem iepazīstina kā savu glābēju. Režisors tev pat iedod mazu lomiņu!</p><p>Pēc filmēšanas tev pienāk vīrs dārgā uzvalkā: „Mārvins Goldbergs. Es varu no tevis izveidot zvaigzni. Atrodi mani „Plaza” bārā, kad būsi pietiekami populārs.”</p>`);log('Filmēšanas laukumā tu iepazīsties ar aģentu Mārvinu.','y');return {stop:1}},p.f<60?`Draudzība ${Math.floor(p.f)}/60`:null));
  if(p.key==='agent'&&F.filmset&&!F.contract)out.push(A('★ Runāt par publicitātes līgumu','Popularitāte 55',20,0,()=>{if(popularity()<55)return {msg:`Mārvins: „Tu vēl neesi gatavs. Atgriezies, kad tevi pazīs vairāk cilvēku.” (Popularitāte ${popularity()}/55)`,b:'Vēl ne.'};F.contract=1;F.premiereDay=Math.min(LEASE_DAYS-1,Math.max(S.day+2,30));addFame(4);log(`Mārvins piedāvā līgumu. Pirmizrāde ${F.premiereDay}. dienā!`,'y');
    cut('Līgums',`<p>„Lieliski. Līgumu parakstīsim Čeisa jaunās filmas <b>pirmizrādē Taimskvērā ${F.premiereDay}. dienā</b>, 20:00. Visa prese būs tur.”</p>`);return {stop:1}},popularity()<55?`Popularitāte ${popularity()}/55`:null));
  if(p.key==='thug'&&p.met&&!F.thugGone&&c.st.strength>=50)out.push(A('Izaicināt Viniju uz kautiņu','Spēks',20,0,()=>{if(rnd()<.35+c.st.strength/150){F.thugGone=1;addFame(3);genSched(p);return {msg:'Vinijs bēg no Čainataunas! Ielas ir drošākas.',b:'Es vēl atgriezīšos!',stop:1}}addSt('health',-8);return {msg:'Vinijs ir stiprāks, nekā izskatās…',b:'Ha!'}}));
  return out}
function storySteady(p){S.flags.steadyDay=S.day}
function storyDay(){const F=S.flags;
  if(S.day===3){const j=sp('joe');S.msgs.unshift({id:nid(),from:j.id,day:S.day,type:'chat',text:`Ei, vai zini, ka ${sweetName()} arī tagad dzīvo Ņujorkā? Redzēju Grīnvičā pie kafejnīcas!`,read:false})}
  if(S.people.some(p=>p.steady)&&!F.partyDay&&F.steadyDay!=null&&S.day>=F.steadyDay+2){F.partyDay=S.day;const st=S.people.find(p=>p.steady);S.msgs.unshift({id:nid(),from:st.id,day:S.day,type:'chat',text:'Šovakar 20:00 „Zelta pūķī” Čainataunā — pārsteiguma ballīte manai draudzenei! Tev jānāk! ❤',read:false})}
  S.people.forEach(p=>{if(p.steady&&p.lastSeen!=null&&S.day-p.lastSeen>=2){p.rom=cl(p.rom-3,0,FMAX);if(p.rom<25){p.steady=0;log(`${p.first} tevi pamet: „Tev nekad nav laika man.”`,'b')}else if(S.day-p.lastSeen===2)S.msgs.unshift({id:nid(),from:p.id,day:S.day,type:'chat',text:'Tu mani esi aizmirsis? Gribu tevi redzēt…',read:false})}});
  if(F.savedActor&&!F.premiereDay&&S.day>=34){F.premiereDay=36;const s=sp('star');S.msgs.unshift({id:nid(),from:s.id,day:S.day,type:'chat',text:'Mana filma iznāk! Pirmizrāde 36. dienā 20:00 Taimskvērā. Tu esi mans goda viesis!',read:false})}
  if(F.premiereDay&&S.day===F.premiereDay&&!F.premiere)S.msgs.unshift({id:nid(),from:sp('star').id,day:S.day,type:'chat',text:'Šovakar pirmizrāde! 20:00, kinoteātris „Ekrāns”. Neaizkavējies!',read:false});
}
function storyHour(){if(!S||!S.c||S.over||$('#modalRoot').innerHTML||MG_ON)return;const F=S.flags,h=hourNow(),c=C();
  // Čeisa glābšana Čainataunā
  if(!F.savedActor&&S.day>=10&&!S.where&&h>=21&&F.rescueDay!==S.day&&S.scene==='ct'){F.rescueDay=S.day;const star=sp('star'),cop=sp('cop');
    modal({t:'Uzbrukums Čainataunā!',b:'<p>Tumšā alejā huligāns <b>Vinijs „Nazis”</b> ir piespiedis pie sienas vīrieti saulesbrillēs. „Pulksteni un maku, zvaigznīt!” Tas ir… kinozvaigzne <b>Čeiss Maksvels</b>!</p>',ch:[
      {l:'Iejaukties ar dūrēm',s:`Spēks ${Math.floor(c.st.strength)} (labāk 50+)`,fn:()=>{if(rnd()<(c.st.strength>=50?.9:.25+c.st.strength/200))rescued('fight');else{addSt('health',-10);const m=Math.min(c.money,R(20,60));c.money-=m;star.f=cl(star.f+8,0,FMAX);cut('Sakāve',`<p>Vinijs tev iesit un aizbēg ar ${usd(m)} no tavas kabatas. Čeiss pateicas par drosmi un pazūd taksometrā.</p><p class="muted">Varbūt citu nakti… ar vairāk muskuļiem.</p>`)}}},
      ...(c.st.crime>=25?[{l:'Iebiedēt huligānu',s:`Noziedzīgums ${Math.floor(c.st.crime)}`,fn:()=>{addSt('crime',4);rescued('bully')}}]:[]),
      {l:'Zvanīt policijai',s:cop.f>=35?'Roza tev palīdzēs!':'Policija var nepaspēt',fn:()=>{if(cop.f>=35||rnd()<.25){cop.f=cl(cop.f+8,0,FMAX);rescued('cop')}else{star.f=cl(star.f+4,0,FMAX);cut('Par vēlu',`<p>Kad policija atbrauc, Vinijs jau ir prom. Čeiss nikns aizbrauc.</p>`)}}},
      {l:'Paiet garām',fn:()=>{}}]});return}
  // zvaigzne aizsauc prom no mīļotā
  const cp=compP();if(cp&&cp.steady&&F.filmset&&!F.callAway&&rnd()<.25&&h>=18){F.callAway=1;
    modal({t:'Zvans no Čeisa',b:`<p>„Tūlīt vajag tevi „Plaza” — preses konference! Mārvins arī būs!” ${esc(cp.first)} skatās uz tevi ar cerību acīs…</p>`,ch:[
      {l:'Steigties uz „Plaza”',s:`+slava · ${cp.first} būs vīlies`,fn:()=>{addFame(4);const s=sp('star');s.f=cl(s.f+8,0,FMAX);cp.rom=cl(cp.rom-30,0,FMAX);cp.f=cl(cp.f-10,0,FMAX);dismissComp(true);if(cp.rom<40){cp.steady=0;log(`${cp.first} tevi pamet: „Tev vienmēr svarīgāks ir Čeiss!”`,'b')}travelScene('fa2','taxi','Plaza');toast('Tu esi pie „Plaza”.')}},
      {l:`Palikt ar ${nAcc(cp.first)}`,s:'Čeiss apvainosies',fn:()=>{const s=sp('star');s.f=cl(s.f-15,0,FMAX);bond(cp,5,10);toast(`${cp.first} tevi apskauj.`)}}]})}
}
function rescued(how){const F=S.flags,star=sp('star');F.savedActor=1;star.met=1;star.phone=1;star.f=Math.max(star.f,62);addFame(8);
  cut('Varonis!',`<p>${how==='fight'?'Pāris precīzi sitieni — un Vinijs bēg pa aleju!':how==='bully'?'Tu paskaties uz Viniju tā, ka viņš nobāl un aizlaižas.':'Detektīve Roza ierodas pēc minūtes un aiztur Viniju!'}</p><p>Čeiss noņem saulesbrilles: „Tu man izglābi dzīvību. Esmu tavs parādnieks — piezvani man!”</p><p class="muted">Čeiss Maksvels tagad ir tavs draugs (draudzība 62) · +slava</p>`);
  log('Tu izglābi kinozvaigzni Čeisu Maksvelu!','y');checkTrophies();save()}

/* ---------- Beigas ---------- */
function showEnding(kind){S.over=true;save();const e=evaluate(),c=C();
  if(kind==='broke'){modal({t:'Atpakaļ uz Latviju',sub:`${S.day}. diena`,b:`<p>Kevins nolasa paziņojumu: īre nav samaksāta. Mammas nauda ir beigusies, un tev ir jāpako koferi.</p><p>Lidmašīna paceļas virs Manhetenas gaismām… Varbūt nākamreiz.</p>`,ch:[{l:'Sākt no jauna',fn:()=>{try{localStorage.removeItem(KEY)}catch(x){}startScreen()}}]});return}
  const title=e.total>=85?'Ņujorkas leģenda':e.total>=65?'Tu iekaroji Lielo Ābolu':e.total>=45?'Ņujorka tevi pieņēma':e.total>=25?'Vēl jāpacenšas':'Atpakaļ uz Latviju';
  const story=S.flags.ending==='fame'?'Tava seja rotā Taimskvēra ekrānus — tu esi slavenība.':S.flags.ending==='friends'?'Tu izvēlējies draugus, nevis slavu — un nekad to nenožēloji.':'';
  const row=(n,v,m)=>`<div class="sb"><span>${n}</span>${bar(v/m*100)}<span>${v}/${m}</span></div>`;
  modal({t:title,sub:`Īres līgums beidzies · ${LEASE_DAYS} dienas Ņujorkā`,b:`<div class="big-score">${e.total}<small>/100</small></div>${story?`<p>${story}</p>`:''}<div class="statbars">${row('Karjera',e.career,25)}${row('Mīlestība',e.love,25)}${row('Draugi',e.social,25)}${row('Īpašības',e.self,25)}${row('Slava',e.fame,10)}</div>
    <p class="muted small" style="margin:6px 0 0">${e.j?'Darbs: '+e.j.lv[c.job.lvl]:'Bez darba'} · ${e.fr} čomi · ${e.st?'Kopā ar '+esc(nAcc(e.st.first)):'Viens'} · ${usd(c.money)} · Sasniegumi ${S.trophies.length}/${TROPHIES.length}</p>`,
    ch:[{l:'Pagarināt īres līgumu',s:'Turpināt dzīvi Ņujorkā bez laika ierobežojuma',fn:()=>{S.over=false;S.extended=1;save();afterNewDay('home')}},{l:'Sākt no jauna',fn:()=>{try{localStorage.removeItem(KEY)}catch(x){}startScreen()}}]});
}
