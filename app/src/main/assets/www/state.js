/* ===================== Stāvoklis ===================== */
let S=null;
const KEY='ostmalas_nakts_v4';
function save(){try{if(S)localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const t=localStorage.getItem(KEY);if(t){S=JSON.parse(t);return true}}catch(e){}return false}
const C=()=>S.c;
const dateOf=T=>({y:START_YEAR+Math.floor(T/12),m:((T%12)+12)%12});
const dstr=T=>{const d=dateOf(T);return MON[d.m]+' '+d.y};
const ageOf=bT=>Math.floor((S.T-bT)/12);
const sname=(idx,sex)=>SUR[idx%SUR.length][sex==='m'?0:1];
const fullName=p=>p.first+' '+sname(p.surIdx,p.sex);
const meName=()=>fullName(C());
const hourNow=()=>8+S.min/60;
const clockStr=()=>{const m=Math.min(S.min,DAY_MIN),h=8+Math.floor(m/60);return String(h%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0')};
const hstr=h=>String(Math.floor(h)%24).padStart(2,'0')+':'+(h%1?'30':'00');
function nid(){S.uid=(S.uid||100)+1;return S.uid}
function pById(id){return S.people.find(p=>p.id===id)}
function addStat(k,v){const s=C().stats;s[k]=cl(s[k]+v)}
function addRep(v){C().rep=cl(C().rep+v)}
function addInf(v){C().inf=cl(C().inf+v)}
function need(k,v){const n=C().needs;n[k]=cl(n[k]+v)}
function log(msg,k=''){S.log.unshift({T:S.T,d:S.day,msg,k});if(S.log.length>90)S.log.length=90;if(typeof tick==='function')tick(msg,k)}
function parties(){const p=BASE_PARTIES.slice();if(S.own)p.push(S.own);return p}
function party(id){return parties().find(p=>p.id===id)}
function shareOf(id){return S.country.pop[id]||0}
function relName(p){const m=p.sex==='m';
  if(p.enemy)return 'ienaidnieks';
  return {parent:m?'tēvs':'māte',sibling:m?'brālis':'māsa',child:m?'dēls':'meita',spouse:m?'vīrs':'sieva',partner:m?'partneris':'partnere',
    friend:p.close>=80?(m?'labākais draugs':'labākā draudzene'):(m?'draugs':'draudzene'),acq:'paziņa',ex:m?'bijušais':'bijusī',none:'svešinieks'}[p.rel]||'paziņa'}
function isFamily(p){return ['parent','sibling','child'].includes(p.rel)}

function randLook(sex){
  const top=sex==='f'?pick(['tee','tank','shirt','hoodie','dress','jacket','tee']):pick(['tee','shirt','hoodie','jacket','tee','shirt']);
  const bot=top==='dress'?'none':(sex==='f'?pick(['jeans','skirt','shorts','pants']):pick(['jeans','pants','shorts','jeans']));
  return {skin:pick(SKIN),hair:sex==='f'?pick(['long','bun','pony','curly','short','long']):pick(['short','short','curly','mohawk','bald','short']),hairC:pick(HAIRC)[0],
    top:{t:top,c:pick(COLORS)},bot:{t:bot,c:pick(['#2c3150','#3a3a44','#5a4630','#1f3d6b','#6b6b70','#c49a6c','#f4f4f4'])},shoe:pick(['#1e1d24','#f4f4f4','#7a4b2a','#2b3a67']),acc:rnd()<.25?pick(['sunglasses','cap','hat','necklace']):null};
}
function randPref(){const ps=BASE_PARTIES;if(!S||!S.country)return pick(ps).id;let t=0;ps.forEach(p=>t+=S.country.pop[p.id]);let r=rnd()*t;for(const p of ps){r-=S.country.pop[p.id];if(r<=0)return p.id}return ps[0].id}
function randTraits(){const a=TOPICS.slice().sort(()=>rnd()-.5);return {likes:[a[0],a[1]],dis:[a[2]]}}
function mkPerson(o){const sex=o.sex||(rnd()<.5?'m':'f');
  return Object.assign({id:nid(),sex,first:pick(sex==='m'?MALE:FEMALE),surIdx:R(0,SUR.length-1),bT:S.T-12*R(18,40),close:0,rom:0,rel:'none',alive:true,look:randLook(sex),traits:randTraits(),known:{},pref:randPref(),phone:false,sched:[]},o,{sex})}

function newCountry(){return {econ:54,happy:50,safety:55,corr:46,budget:0,laws:[],pop:{prog:17,kons:21,zala:11,nac:15,biz:13},gov:['kons','biz','nac'],seats:{prog:22,kons:30,zala:12,nac:20,biz:16},pm:'Valters Ozoliņš',pmParty:'kons',pres:'Ilze Kalniņa'}}
function mkChar(o){return Object.assign({first:'',sex:'m',surIdx:0,bT:0,stats:{health:75,happy:65,smarts:40,looks:45,charm:40},needs:{energy:90,food:80,fun:70},skills:{dance:5},
  money:0,savings:0,debt:0,rep:0,inf:0,job:null,study:null,degrees:[],party:null,standing:0,rank:0,office:null,ministry:null,offices:[],cand:null,campaign:0,corrupt:0,jail:0,
  home:0,furn:{},fridge:3,inv:{},wardrobe:[],eq:{top:0,bot:1,shoe:2,acc:-1},hair:{s:'short',c:'#2b1b12'},skin:'#eebc98',veh:'none',biz:null,cls:'vid',flags:{},projCd:{}},o)}
function rollStats(bonus=0,parent){const g=(k,base)=>cl(Math.round((parent?parent[k]*.35:0)+(parent?.65:1)*R(base-15,base+15)+bonus));return {health:cl(R(68,92)),happy:R(62,80),smarts:g('smarts',45),looks:g('looks',47),charm:g('charm',45)}}

// iedzīvotāju darba vietas pēc profesijas
const NPC_JOBS=[['Barista','cafe'],['Viesmīle','restaurant'],['Bārmenis','pub'],['Pārdevēja','boutique'],['Programmētājs','office'],['Grāmatvede','bank'],['Ārste','hosp'],['Medmāsa','hosp'],['Skolotājs','uni'],['Studente','uni'],['Students','uni'],['Žurnāliste','media'],['Policists','police'],['Treneris','gym'],['Friziere','salon'],['Krupjē','casino'],['Ostas strādnieks','port1'],['Pārdevējs','super'],['Mākslinieks','museum'],['Bibliotekāre','library'],['Juriste','office'],['Modele','agency'],['DJ','club'],['Ierēdnis','gov'],['Politiķis','party'],['Pensionārs',null],['Uzņēmējs','office'],['Administratore','hotel'],['Pavārs','pizza'],['Ziedu pārdevēja','flowers']];
const HOMES_NPC=['apt_liepas','apt_klavas','apt_berzi','apt_centrs','apt_priedes','apt_ievas','apt_jurmala','apt_vilni'];
function bldOfType(t){const l=BLDS.filter(b=>b.type===t||b.id===t);return l.length?pick(l).id:null}
function genTown(){
  for(let i=0;i<58;i++){const j=pick(NPC_JOBS);const p=mkPerson({town:1,bT:S.T-12*(j[0]==='Pensionārs'?R(64,80):j[0].startsWith('Student')?R(18,24):R(19,58))});
    p.jobT=j[0];p.workB=j[1]?bldOfType(j[1]):null;p.homeB=pick(HOMES_NPC);S.people.push(p)}
}
function venueFor(p,h){
  const like=pick(p.traits.likes),types=TOPIC_VENUE[like]||['cafe'];let t=pick(types);
  if(h>=21&&ageOf(p.bT)<40&&rnd()<.6)t=pick(['club','pub','beachbar','vip','casino','club']);
  if(t==='street')return 'street';return bldOfType(t)||'street';
}
function genSched(p){
  const s=[];const a=ageOf(p.bT);
  if(p.rel==='child'&&a<18){s.push({h:8,l:homeOf(p)});p.sched=s;return}
  if(p.jailed){s.push({h:8,l:'gone'});p.sched=s;return}
  const home=homeOf(p);
  s.push({h:8,l:rnd()<.6?'street':home});
  if(p.workB&&rnd()<.85){const st=R(8,10);s.push({h:st-.5,l:'street'});s.push({h:st,l:p.workB});s.push({h:st+R(6,8),l:'street'})}
  else{s.push({h:R(10,12),l:venueFor(p,12)});s.push({h:R(14,15),l:'street'});s.push({h:R(16,17),l:venueFor(p,16)})}
  const ev=R(18,20);s.push({h:ev,l:rnd()<.5?'street':venueFor(p,19)});
  if(a<45&&rnd()<.55){s.push({h:21+rnd()*1.5,l:venueFor(p,22)});s.push({h:R(24,25),l:home})}
  else s.push({h:R(21,23),l:home});
  s.sort((x,y)=>x.h-y.h);p.sched=s;
}
function homeOf(p){if(['spouse','child'].includes(p.rel)||p.livesWith)return HOMES[C().home].b;return p.homeB||'apt_liepas'}
function locOf(p,h){if(!p.alive)return 'gone';if(p.appt&&p.appt.day===S.day&&h>=p.appt.from&&h<p.appt.until)return p.appt.b;let l='street';for(const s of p.sched||[])if(s.h<=h)l=s.l;return l}

function newGame(o){
  const keepHall=S&&S.hall?S.hall:[];
  S={T:12*20+R(0,11),day:1,uid:100,tab:'city',min:0,log:[],people:[],msgs:[],quests:[],trophies:[],country:newCountry(),own:null,dyn:[],prestige:0,hall:keepHall,dynName:sname(o.surIdx,'m'),gnomes:[],pos:null,where:null};
  for(let i=0;i<24;i++)countryTick();
  const B=CLASSES[o.cls].bonus,st=rollStats(0);for(const k in B)if(st[k]!=null)st[k]=cl(st[k]+B[k]);
  S.c=mkChar({first:o.first,sex:o.sex,surIdx:o.surIdx,bT:S.T-12*20-R(0,11),cls:o.cls,stats:st,money:CLASSES[o.cls].money,inf:B.inf||0,rep:B.rep||0,skin:o.skin,hair:{s:o.hair,c:o.hairC},home:o.cls==='eli'?2:0});
  const c=S.c;
  c.wardrobe=[{cid:o.sex==='f'?'tank':'tee',color:o.shirt},{cid:o.sex==='f'?'skirt':'jeans',color:o.sex==='f'?'#2c3150':'#1f3d6b'},{cid:'snk',color:'#f4f4f4'}];
  c.eq={top:0,bot:1,shoe:2,acc:-1};
  const par=(sex,age)=>mkPerson({rel:'parent',sex,surIdx:o.surIdx,bT:S.T-12*age,close:R(55,85),phone:true,met:1,homeB:'parents',jobT:pick(['Skolotāja','Inženieris','Grāmatvede','Uzņēmējs','Ārste','Šoferis'])});
  S.people.push(par('m',R(46,58)),par('f',R(44,55)));
  for(let i=0,n=R(0,2);i<n;i++)S.people.push(mkPerson({rel:'sibling',surIdx:o.surIdx,bT:S.T-12*R(16,28),close:R(40,80),phone:true,met:1,homeB:pick(HOMES_NPC)}));
  genTown();
  newDayWorld();
  log(`${o.first} ierodas Ostmalā. Pilsēta ir tava!`,'y');
}

/* ===================== Izskats un stils ===================== */
function cloth(cid){return CLOTH.find(x=>x.id===cid)}
function myLook(){const c=C(),w=c.wardrobe,g=i=>i>=0&&w[i]?w[i]:null;
  const top=g(c.eq.top),bot=g(c.eq.bot),shoe=g(c.eq.shoe),acc=g(c.eq.acc);
  const tc=top?cloth(top.cid):null,bc=bot?cloth(bot.cid):null,ac=acc?cloth(acc.cid):null;
  return {skin:c.skin,hair:c.hair.s,hairC:c.hair.c,top:{t:tc?tc.t:'tee',c:top?top.color:'#ffffff'},bot:{t:tc&&tc.t==='dress'?'none':(bc?bc.t:'jeans'),c:bot?bot.color:'#2c3150'},shoe:shoe?shoe.color:'#1e1d24',acc:ac?ac.t:null};
}
function styleScore(){const c=C();let s=0;['top','bot','shoe','acc'].forEach(k=>{const it=c.wardrobe[c.eq[k]];if(it&&c.eq[k]>=0){const cd=cloth(it.cid);if(!(k==='bot'&&cloth(c.wardrobe[c.eq.top]?.cid||'tee').t==='dress'))s+=cd.st}});
  const hs=HAIRS.find(h=>h.id===c.hair.s);return Math.round(s+(hs?hs.st:0)+c.stats.looks/8)}
function homeComfort(){const c=C();let cf=0,st=0,fun=0;for(const s in c.furn){const f=FURN.find(x=>x.id===c.furn[s]);if(f&&SLOTS_BY_LVL[HOMES[c.home].lvl].includes(s)){cf+=f.cf||0;st+=f.st||0;fun+=f.fun||0}}return {cf,st,fun}}
function moodMul(){const n=C().needs;return .7+.3*Math.min(n.energy,n.food,n.fun)/100}

/* ===================== Laiks ===================== */
function advance(min){
  const c=C();S.min+=min;
  const v=VEH.find(x=>x.id===c.veh)||VEH[0];
  need('energy',-min*.07);need('food',-min*.08);need('fun',-min*.05);
  if(c.needs.food<=0)addStat('health',-min*.02);
  if(c.needs.fun<=5)addStat('happy',-min*.01);
  const h=Math.floor(hourNow());if(h!==S.lastHour){S.lastHour=h;if(typeof onHour==='function')onHour()}
}
function spendT(min,cost){const c=C();if(S.min+min>DAY_MIN){toast('Šodien vairs nepietiek laika. Ej gulēt.');return false}if(cost&&c.money<cost){toast('Nepietiek naudas.');return false}c.money-=cost||0;advance(min);return true}

/* ===================== Ienākumi ===================== */
function taxRate(g){const L=S.country.laws;let t=L.includes('tax_cut')?18:23;if(L.includes('tax_up')&&g>3000)t=31;return t}
function jobDef(){const c=C();return c.job?JOBS.find(j=>j.id===c.job.id):null}
function jobSalary(){const c=C(),j=jobDef();if(!j)return 0;let s=j.sal[c.job.lvl];if(S.country.laws.includes('minwage')&&c.job.lvl===0)s*=1.15;return Math.round(s*(.85+S.country.econ/333))}
function income(){
  const c=C(),worked=c.job&&c.job.worked,g=(worked?jobSalary():0)+(c.office?OFFICES[c.office].sal:0),net=g*(1-taxRate(g)/100);
  const biz=c.biz?Math.round(c.biz.val*.018*(S.country.econ/50)*(S.country.laws.includes('dereg')?1.25:1)):0;
  const interest=Math.round(c.savings*.003),parentsAlive=S.people.some(p=>p.rel==='parent'&&p.alive);
  const rent=c.home===0&&!parentsAlive?320:HOMES[c.home].rent;
  const living=220+S.people.filter(p=>p.rel==='child'&&p.alive&&ageOf(p.bT)<18).length*180+(c.veh!=='none'?({scooter:40,car:160,sport:600}[c.veh]):0);
  const tuition=c.study&&!S.country.laws.includes('freeuni')?140:0;
  const debtPay=c.debt>0?Math.min(c.debt,Math.round(c.debt*.03)+50):0,debtInt=Math.round(c.debt*.009);
  return {gross:g,net:Math.round(net),biz,interest,rent,living,tuition,debtPay,debtInt,total:Math.round(net)+biz+interest-rent-living-tuition-debtPay};
}

/* ===================== Dienas (mēneša) beigas ===================== */
function endDay(quality){ // quality: 'home'|'hotel'|'friend'|'bench'|'jail'
  if(S.dead)return;
  const c=C(),inc=income(),cf=homeComfort().cf;
  if(quality==='bench'){addStat('health',-3);addStat('happy',-3);log('Tu aizmiedz uz soliņa. Mugura sāp.','b')}
  if(c.jail>0){c.jail--;if(c.jail===0)log('Tu iznāc no cietuma. Brīvība smaržo pēc jūras.','g')}
  else{
    c.money+=inc.total;c.debt=Math.max(0,c.debt-inc.debtPay+inc.debtInt);c.savings+=inc.interest;
    const j=jobDef();
    if(j){if(c.job.worked){c.job.missed=0;if(j.perk==='rep')addRep(.4);if(j.perk==='inf')addInf(.3)}
      else{c.job.missed=(c.job.missed||0)+1;c.job.perf=Math.max(0,c.job.perf-15);log(`Tu neieradies darbā (${j.lv[c.job.lvl]}). Alga netiek izmaksāta.`,'b');
        if(c.job.missed>=2){log(`Tevi atlaiž no darba: ${j.lv[c.job.lvl]}.`,'b');c.job=null}}
      if(c.job)c.job.worked=false}
    if(c.biz)c.biz.val=Math.max(1000,Math.round(c.biz.val*(1+(S.country.econ-50)/4000+(rnd()-.5)*.02)));
  }
  const age=ageOf(c.bT);
  let dh=(cf/12)+(c.home===0&&age>25?-.8:0);
  if(S.people.some(p=>(p.rel==='spouse'||p.rel==='partner')&&p.alive))dh+=.6;
  if(c.flags.dog)dh+=.3;if(c.money<0)dh-=1.5;dh+=(c.needs.fun-50)*.02;dh+=(55-c.stats.happy)*.03;addStat('happy',dh);
  let hl=age>35?-.12:0;if(age>50)hl=-.3;if(age>65)hl=-.55;if(age>78)hl=-.9;if(c.stats.happy<20)hl-=.3;if(c.needs.food<15)hl-=1;addStat('health',hl);
  if(c.office){addInf(.5);if(c.party)c.standing=cl(c.standing+.6)}else addInf(-.15);
  if(c.party)c.rank=c.rank===3?(c.standing<20?2:3):(c.standing>=55?2:c.standing>=25?1:0);
  if(c.corrupt>0&&(c.office||c.party)&&rnd()<c.corrupt*.0035*(S.country.laws.includes('anticor')?2:1))scandal();
  // miegs atjauno vajadzības
  const q={home:1,hotel:.9,friend:.85,bench:.45,jail:.6}[quality]||.7;
  c.needs.energy=cl(35+60*q+cf*.8);c.needs.food=cl(c.needs.food-12);c.needs.fun=cl(c.needs.fun+5);
  if(c.needs.food<1)addStat('health',-4);
  S.T++;S.day++;countryTick();checkElection(false,false);
  if(((S.T-c.bT)%12)===0)birthday();
  if(S.dead){save();return}
  if(c.stats.health<=0){die('Veselība izsīka');return}
  S.min=0;S.lastHour=8;
  newDayWorld();
  checkTrophies();
  if(typeof afterNewDay==='function')afterNewDay(quality);
  save();
  if(c.jail===0&&rnd()<.35)randomEvent();
}
function newDayWorld(){
  S.people.forEach(p=>{if(p.appt&&p.appt.day<S.day)p.appt=null;p.qOffer=null;genSched(p)});
  // jauni uzdevumi
  const cand=S.people.filter(p=>p.alive&&p.town&&!S.quests.some(q=>q.giver===p.id));
  for(let i=0;i<4&&cand.length;i++){const p=cand.splice(R(0,cand.length-1),1)[0];p.qOffer=genQuest(p)}
  S.quests=S.quests.filter(q=>!q.done&&(q.exp==null||q.exp>=S.day));
  // īsziņas no draugiem
  const fr=S.people.filter(p=>p.alive&&p.phone&&!isFamily(p)&&p.close>=30);
  if(fr.length&&rnd()<.7){const p=pick(fr);const v=pick(['cafe','club','cinema','restaurant','pub','beachbar']);const b=bldOfType(v);
    S.msgs.unshift({id:nid(),from:p.id,day:S.day,type:'invite',b,from_h:R(12,20),text:`Sveiks! Satiekamies šodien ${bld(b).n}?`,read:false})}
  const fam=S.people.filter(p=>p.alive&&isFamily(p)&&p.rel!=='child');
  if(fam.length&&rnd()<.35){const p=pick(fam);S.msgs.unshift({id:nid(),from:p.id,day:S.day,type:'chat',text:pick(['Kā tev iet? Piezvani kādreiz!','Vai ēd kārtīgi?','Mēs lepojamies ar tevi.','Atbrauc ciemos uz vakariņām!']),read:false})}
  if(S.msgs.length>40)S.msgs.length=40;
}
function birthday(){
  const c=C(),age=ageOf(c.bT);
  S.people.forEach(p=>{if(!p.alive)return;const a=ageOf(p.bT);
    if(!isFamily(p)&&p.rel!=='none')p.close=cl(p.close-1);
    const d=a>68?(a-68)*.016+.01:a>50?.004:0;
    if(rnd()<d){p.alive=false;if(p.rel!=='none'){log(`Mūžībā aizgājis: ${relName(p)} ${fullName(p)} (${a} g.).`,'b');if(p.close>45)addStat('happy',-12)}}});
  log(`Tev aprit ${age} gadi.`);
  if(age>=62&&rnd()<Math.max(0,(age-62)*.012+(70-c.stats.health)*.003))die('Vecums');
}
function scandal(){
  const c=C();addRep(-25);c.corrupt=Math.max(0,c.corrupt-25);log('SKANDĀLS! Žurnālisti publisko tavus ēnu darījumus.','b');
  let extra='';
  if(c.office&&rnd()<.55){extra=` Tu zaudē amatu: ${OFFICES[c.office].n}.`;c.office=null;c.ministry=null}
  if(c.party){c.standing=cl(c.standing-30);if(c.rank===3&&rnd()<.6){c.rank=2;extra+=' Partija tevi gāž no priekšsēdētāja amata.'}}
  if(rnd()<.25+c.corrupt/200){goJail(R(12,36));extra+=' Tiesa piespriež reālu cietumsodu.'}
  modal({t:'Skandāls',b:`<p>„Ostmalas Vēstis” publicē dokumentus par taviem ēnu darījumiem.${extra}</p>`,ch:[{l:'Skaidrs'}]});
}
function goJail(m){const c=C();c.jail=m;c.job=null;c.office=null;c.ministry=null;c.cand=null;c.campaign=0;c.study=null;addRep(-20);if(c.party)c.standing=cl(c.standing-30);log(`Tu nonāc cietumā uz ${m} mēnešiem.`,'b');if(typeof onJail==='function')onJail()}

/* ===================== Valsts ===================== */
function approval(){const k=S.country;return cl(Math.round((k.econ+k.happy+k.safety-(k.corr-40)*.8)/3))}
function countryTick(){
  const k=S.country,d={econ:0,happy:0,safety:0,corr:0,budget:0};
  k.laws.forEach(id=>{const L=LAWS.find(x=>x.id===id);for(const f in L.fx)d[f]+=L.fx[f]*.5});
  k.econ=cl(k.econ+d.econ+(53-k.econ)*.02+(rnd()-.5)*1.6+(k.budget<-40?-.4:0));
  k.happy=cl(k.happy+d.happy+(50-k.happy)*.02+(rnd()-.5)*1.1+(k.econ-50)*.008);
  k.safety=cl(k.safety+d.safety+(54-k.safety)*.02+(rnd()-.5));
  k.corr=cl(k.corr+d.corr+(46-k.corr)*.01+(rnd()-.5)*.6);
  k.budget=cl(k.budget+d.budget*1.4+(k.econ-50)*.03-.05+(rnd()-.5)*.8,-100,100);
  if(rnd()<.003){k.econ=cl(k.econ-15);if(S.c&&!S.ff)log('Pasaules finanšu krīze skar Dzintariju.','b')}
  const a=approval();
  parties().forEach(p=>{let v=k.pop[p.id]||1;v+=(k.gov.includes(p.id)?(a-50)*.006:-(a-50)*.003)+(rnd()-.5)*.5;
    if(S.c&&S.c.party===p.id&&S.c.rank===3)v+=(S.c.rep-40)*.002+(S.c.stats.charm-50)*.001;k.pop[p.id]=cl(v,.5,55)});
  const sum=Object.values(k.pop).reduce((a,b)=>a+b,0);if(sum>90)for(const id in k.pop)k.pop[id]*=90/sum;
}
function elType(T){const {y,m}=dateOf(T);if(m===5&&y%4===1)return 'pasv';if(m===9&&y%4===2)return 'saeima';if(m===4&&y%4===3)return 'prez';return null}
function nextEl(type){for(let t=S.T+1;t<S.T+60;t++)if(elType(t)===type)return t;return null}
const EL_N={pasv:'Pašvaldību vēlēšanas',saeima:'Saeimas vēlēšanas',prez:'Valsts prezidenta vēlēšanas'};
function elScore(){const c=C(),s=c.stats,share=c.party?shareOf(c.party):0;return share*1.1+s.charm*.22+c.rep*.25+c.inf*.2+Math.min(40,c.campaign)*.45+c.standing*.08+R(-10,10)}
function checkElection(silent,noPlayer){
  const type=elType(S.T);if(!type)return;
  const k=S.country,c=S.c,lines=[];
  if(type!=='prez'){const ps=parties(),res={};
    ps.forEach(p=>{let v=k.pop[p.id]+(rnd()-.5)*4;if(!noPlayer&&c.cand&&c.cand.type===type&&c.party===p.id)v+=Math.min(4,c.campaign/12);res[p.id]=Math.max(.5,v)});
    ps.forEach(p=>k.pop[p.id]=cl(res[p.id]*.7+k.pop[p.id]*.3,.5,55));if(type==='saeima')formGov(res,noPlayer)}
  if(noPlayer)return;
  const prev=c.office,cand=c.cand,ending=prev&&OFFICES[prev].lvl===type;
  if(cand&&cand.type===type){
    let won=false;const sc=elScore();
    if(cand.office==='deputats')won=sc>=38;if(cand.office==='mers')won=sc>=60;
    if(cand.office==='saeima')won=sc>=50&&shareOf(c.party)>=5;
    if(cand.office==='prezidents')won=(k.gov.includes(c.party)?12:0)+c.inf*.4+c.rep*.4+R(-10,10)>=64;
    if(won){c.office=cand.office;c.ministry=null;if(!c.offices.includes(cand.office))c.offices.push(cand.office);addRep(5);addStat('happy',15);lines.push(`<p><b>Uzvara!</b> Tu esi ievēlēts: ${OFFICES[cand.office].n}.</p>`);log(`Tu uzvari vēlēšanās: ${OFFICES[cand.office].n}!`,'g')}
    else{addStat('happy',-10);lines.push(`<p>Vēlētāji izvēlējās citus. Amats „${OFFICES[cand.office].n}” tev netika.</p>`);log(`Zaudējums vēlēšanās (${OFFICES[cand.office].n}).`,'b');if(ending){c.office=null;c.ministry=null}}
    c.cand=null;c.campaign=0;
  } else if(ending){lines.push(`<p>Tavs pilnvaru termiņš (${OFFICES[prev].n}) beidzās, un tu nekandidēji atkārtoti.</p>`);log('Pilnvaru termiņš beidzās.','y');c.office=null;c.ministry=null}
  if(type==='saeima'&&c.party&&c.office==='saeima'&&k.gov.includes(c.party)){
    const largest=k.gov.slice().sort((a,b)=>(k.seats[b]||0)-(k.seats[a]||0))[0];
    if(c.rank===3&&largest===c.party){c.office='premjers';k.pm=meName();k.pmParty=c.party;if(!c.offices.includes('premjers'))c.offices.push('premjers');lines.push('<p><b>Tava partija vada koalīciju. Tu kļūsti par Ministru prezidentu!</b></p>');log('Tu kļūsti par Ministru prezidentu!','g')}
    else if(c.inf>=50&&c.standing>=50){c.office='ministrs';c.ministry=pick(MINISTRIES);if(!c.offices.includes('ministrs'))c.offices.push('ministrs');lines.push(`<p>Koalīcija tevi apstiprina par <b>${c.ministry.toLowerCase()} ministru</b>.</p>`);log(`Tu kļūsti par ${c.ministry.toLowerCase()} ministru.`,'g')}
  }
  if(type==='saeima')lines.push(`<p class="muted">Jauno valdību veido ${k.gov.map(id=>party(id).sh).join(' + ')}. Valdības vadītājs: ${esc(k.pm)}.</p>`);
  if(type==='prez'&&c.office!=='prezidents')k.pres=pick(MALE.concat(FEMALE))+' '+pick(SUR)[0];
  if(!silent&&lines.length)modal({t:EL_N[type],b:lines.join(''),ch:[{l:'Turpināt'}]});
}
function formGov(res,noPlayer){
  const k=S.country,ps=parties(),pass=ps.filter(p=>res[p.id]>=5),tot=pass.reduce((a,p)=>a+res[p.id],0),seats={};let left=100;
  pass.forEach(p=>{seats[p.id]=Math.floor(res[p.id]/tot*100);left-=seats[p.id]});
  pass.slice().sort((a,b)=>(res[b.id]/tot*100%1)-(res[a.id]/tot*100%1)).forEach(p=>{if(left>0){seats[p.id]++;left--}});
  k.seats=seats;const order=pass.slice().sort((a,b)=>seats[b.id]-seats[a.id]),lead=order[0];if(!lead)return;
  const gov=[lead.id];let sum=seats[lead.id];const dist=p=>Math.abs(p.ax[0]-lead.ax[0])+Math.abs(p.ax[1]-lead.ax[1]);
  for(const p of order.slice(1).sort((a,b)=>dist(a)-dist(b))){if(sum>50)break;gov.push(p.id);sum+=seats[p.id]}
  k.gov=gov;k.pmParty=lead.id;
  if(noPlayer||!(S.c&&S.c.party===lead.id&&S.c.rank===3))k.pm=pick(MALE.concat(FEMALE))+' '+pick(SUR)[0];
}
function lawChance(L){const c=C(),k=S.country;let b={saeima:28,ministrs:48,premjers:66}[c.office]||20;b+=k.gov.includes(c.party)?18:-12;k.gov.forEach(id=>{if(L.like.includes(id))b+=9;if(L.dis.includes(id))b-=14});return Math.round(cl(b+c.inf/6,5,95))}
function passLaw(L,repeal,pc){const k=S.country;if(rnd()<pc/100){if(repeal)k.laws=k.laws.filter(x=>x!==L.id);else k.laws.push(L.id);const s=repeal?-1:1;
  L.like.forEach(id=>{if(k.pop[id]!=null)k.pop[id]=cl(k.pop[id]+.8*s,.5,55)});L.dis.forEach(id=>{if(k.pop[id]!=null)k.pop[id]=cl(k.pop[id]-.6*s,.5,55)});
  addInf(3);addRep(2);log(`Saeima ${repeal?'atceļ':'pieņem'} likumu: ${L.n}.`,'g');return 'Balsojums veiksmīgs!'}addInf(-1);log(`Saeima noraida: ${L.n}.`,'b');return 'Saeima balso pret.'}

/* ===================== Uzdevumi ===================== */
function genQuest(p){
  const t=pick(['bring','bring','meet','pet','deliver']);
  const rew=R(40,220);
  if(t==='bring'){const it=pick(['kafija','ziedi','sokolade','vins','sviestmaize']);return {type:t,item:it,reward:rew,desc:`${p.first} lūdz atnest: ${ITEMS[it].n.toLowerCase()}.`}}
  if(t==='meet'){const b=bldOfType(pick(['cafe','restaurant','museum','beachbar','pub','cinema']));return {type:t,b,reward:rew,desc:`${p.first} grib satikties ${bld(b).n} līdz 20:00.`}}
  if(t==='pet'){return {type:t,reward:rew+80,desc:`${p.first} pazaudēja kaķi Minci. Tas redzēts kaut kur pilsētā!`}}
  const b=bldOfType(pick(['office','hotel','media','police','bank','yacht']));return {type:'deliver',b,reward:rew,desc:`${p.first} lūdz aiznest paciņu uz ${bld(b).n}.`};
}
function acceptQuest(p){
  if(S.quests.filter(q=>!q.done).length>=4){toast('Tev jau ir daudz uzdevumu.');return}
  const q=Object.assign({id:nid(),giver:p.id,day:S.day,exp:S.day+3},p.qOffer);p.qOffer=null;
  if(q.type==='meet'){q.exp=S.day;p.appt={b:q.b,day:S.day,from:hourNow(),until:20}}
  if(q.type==='deliver')C().inv.pacina=(C().inv.pacina||0)+1;
  if(q.type==='pet'){let t;for(let i=0;i<300;i++){const x=R(1,58),y=R(1,58);if(walkCity(x,y)&&grid[gi(x,y)]!==T.ROAD){t=[x,y];break}}q.pet=t||[14,30]}
  S.quests.push(q);log(`Jauns uzdevums: ${q.desc}`,'y');
}
function completeQuest(q,msg){
  q.done=true;const c=C(),p=pById(q.giver);c.money+=q.reward;addRep(1);c.flags.quests=(c.flags.quests||0)+1;
  if(p){p.close=cl(p.close+12);if(p.rel==='none'){p.rel='acq';p.met=1}}
  if(q.type==='deliver'&&c.inv.pacina)c.inv.pacina--;if(q.type==='pet'&&c.inv.kakis)c.inv.kakis--;
  log(`Uzdevums izpildīts! +${eur(q.reward)}${msg?' · '+msg:''}`,'g');toast(`Uzdevums izpildīts! +${eur(q.reward)}`);checkTrophies();
}

/* ===================== Trofejas ===================== */
function checkTrophies(){if(!S||!S.c)return;TROPHIES.forEach(t=>{if(!S.trophies.includes(t.id)){let ok=false;try{ok=t.t()}catch(e){}if(ok){S.trophies.push(t.id);log(`Trofeja: ${t.n}!`,'y');if(typeof toast==='function')toast(`Trofeja: ${t.n}!`)}}})}

/* ===================== Notikumi ===================== */
function friendish(){return S.people.find(p=>p.alive&&(p.rel==='friend'||p.rel==='sibling')&&ageOf(p.bT)>=18)}
const EVENTS=[
  {w:3,c:()=>true,t:'Maks uz ietves',b:()=>'Pie tramvaja pieturas tu atrodi maku ar 180 € un personas apliecību.',ch:[{l:'Aiznest uz policiju',fn:()=>{addRep(2);addStat('happy',3);return 'Īpašniece tev pateicas.'}},{l:'Paturēt naudu',fn:()=>{C().money+=180;return '+180 €. Sirdsapziņa grauž.'}}]},
  {w:2,c:()=>friendish(),prep:()=>({p:friendish()}),t:'Aizdevuma lūgums',b:x=>`${fullName(x.p)} lūdz aizdot 600 €.`,ch:[{l:'Aizdot',fn:x=>{const c=C();if(c.money<600)return 'Tev pašam nav.';c.money-=600;x.p.close=cl(x.p.close+10);if(rnd()<.65){c.money+=600;return 'Nauda atgriezta laikā.'}return 'Nauda netiek atdota…'}},{l:'Atteikt',fn:x=>{x.p.close=cl(x.p.close-12);return 'Attiecības kļūst vēsākas.'}}]},
  {w:2,c:()=>true,t:'Gripa',b:()=>'Tev kāpj temperatūra.',ch:[{l:'Iet pie ārsta (60 €)',fn:()=>{C().money-=60;addStat('health',-2);return 'Ātri atveseļojies.'}},{l:'Pārciest kājās',fn:()=>{addStat('health',-10);need('energy',-20);return 'Slimība ievelkas.'}}]},
  {w:2,c:()=>C().job,t:'Konflikts darbā',b:()=>'Priekšnieks publiski kritizē tavu darbu.',ch:[{l:'Mierīgi atvainoties',fn:()=>{addStat('happy',-3);C().job.perf+=5;return 'Situācija nomierinās.'}},{l:'Iebilst asi',fn:()=>{const c=C();if(rnd()<c.stats.charm/120){c.job.perf+=15;return 'Kolēģi tevi atbalsta.'}if(rnd()<.35){c.job=null;return 'Tevi atlaiž.'}c.job.perf=Math.max(0,c.job.perf-20);return 'Attiecības sabojātas.'}}]},
  {w:3,c:()=>C().office,t:'Aploksne',b:()=>`Būvniecības magnāts piedāvā ${eur(15000)} par „pareizu” balsojumu par ostas zemi.`,ch:[{l:'Pieņemt',fn:()=>{const c=C();c.money+=15000;c.corrupt+=20;return 'Nauda ir tavā kontā.'}},{l:'Atteikt',fn:()=>'Tu paliec tīrs.'},{l:'Ziņot policijai',fn:()=>{addRep(7);addInf(-2);return 'Tu esi varonis ziņās.'}}]},
  {w:2,c:()=>C().corrupt>15,t:'Žurnālists rakņājas',b:()=>'Žurnāliste uzdod neērtus jautājumus par taviem darījumiem.',ch:[{l:'Samaksāt par klusēšanu (5000 €)',fn:()=>{const c=C();if(c.money<5000)return 'Naudas nav.';c.money-=5000;if(rnd()<.7){c.corrupt=Math.max(0,c.corrupt-10);return 'Raksts neiznāk.'}c.corrupt+=10;return 'Viņa ieraksta kukuļa piedāvājumu!'}},{l:'Ignorēt',fn:()=>{if(rnd()<.4){scandal();return null}return 'Pierādījumu nepietiek.'}}]},
  {w:2,c:()=>C().rep>=20,t:'Labdarības balle',b:()=>'Tevi aicina uz labdarības balli viesnīcā.',ch:[{l:'Ziedot 1000 €',fn:()=>{const c=C();if(c.money<1000)return 'Naudas nepietiek.';c.money-=1000;addRep(4);addInf(3);return 'Tavu vārdu nosauc no skatuves.'}},{l:'Neiet',fn:()=>'Tu paliec mājās.'}]},
  {w:2,c:()=>true,t:'Kriptovalūta',b:()=>'Paziņa sola, ka „DzintarCoin” trīskāršosies.',ch:[{l:'Ieguldīt 1000 €',fn:()=>{const c=C();if(c.money<1000)return 'Nav brīvu 1000 €.';c.money-=1000;if(rnd()<.4){c.money+=3200;return 'Tu nopelni 2200 €!'}return 'Monēta sabrūk.'}},{l:'Atteikties',fn:()=>'Labāk drošība.'}]},
  {w:2,c:()=>C().party,t:'Iekšpartijas alianse',b:()=>'Valdes loceklis piedāvā kopā gāzt pašreizējo vadību.',ch:[{l:'Pievienoties',fn:()=>{const c=C();if(rnd()<.55){c.standing=cl(c.standing+15);addInf(4);return 'Sazvērestība izdodas.'}c.standing=cl(c.standing-20);return 'Plāns atklāts.'}},{l:'Palikt lojālam',fn:()=>{C().standing=cl(C().standing+5);return 'Vadība novērtē lojalitāti.'}}]},
  {w:2,c:()=>S.people.some(p=>p.rel==='parent'&&p.alive&&ageOf(p.bT)>58),prep:()=>({p:S.people.find(p=>p.rel==='parent'&&p.alive&&ageOf(p.bT)>58)}),t:'Vecāks saslimst',b:x=>`Tavs ${relName(x.p)} ${x.p.first} nonāk slimnīcā.`,ch:[{l:'Apmaksāt ārstēšanu (800 €)',fn:x=>{C().money-=800;x.p.close=cl(x.p.close+15);return 'Ārstēšana palīdz.'}},{l:'Nav laika',fn:x=>{x.p.close=cl(x.p.close-15);return 'Viņš/viņa ir vīlies.'}}]},
  {w:1,c:()=>C().stats.looks>=60,t:'Realitātes šovs',b:()=>'Televīzija aicina uz šovu „Ostmalas zvaigznes”.',ch:[{l:'Piedalīties',fn:()=>{if(rnd()<.6){addRep(8);C().money+=2000;return 'Tu kļūsti atpazīstams!'}addRep(-6);return 'Montāža tevi nesaudzē.'}},{l:'Atteikties',fn:()=>'Tu paliec ēnā.'}]},
  {w:2,c:()=>C().cand,t:'Televīzijas debates',b:()=>'Pirms vēlēšanām — debates ar galveno konkurentu.',ch:[{l:'Uzbrukt',fn:()=>{const c=C();if(rnd()<c.stats.charm/100+.1){c.campaign+=15;return 'Tu uzvari debatēs!'}c.campaign-=5;return 'Uzbrukums atspēlējas.'}},{l:'Runāt par idejām',fn:()=>{const c=C();if(rnd()<c.stats.smarts/110+.15){c.campaign+=10;return 'Programma novērtēta.'}return 'Neizšķirti.'}}]},
  {w:3,c:()=>S.people.some(p=>(p.rel==='spouse'||p.rel==='partner')&&p.alive),prep:()=>({p:S.people.find(p=>(p.rel==='spouse'||p.rel==='partner')&&p.alive)}),t:'Vairāk uzmanības',b:x=>`${x.p.first} saka, ka tu esi pārāk aizņemts.`,ch:[{l:'Ceļojums divatā (900 €)',fn:x=>{C().money-=900;x.p.close=cl(x.p.close+12);x.p.rom=cl(x.p.rom+12);addStat('happy',8);return 'Nedēļa Itālijā.'}},{l:'Karjera svarīgāka',fn:x=>{x.p.rom=cl(x.p.rom-15);if(x.p.rom<15){x.p.rel='ex';x.p.livesWith=0;addStat('happy',-12);return `${x.p.first} tevi pamet.`}return 'Mājās kļūst vēsāk.'}}]},
  {w:1,c:()=>!C().flags.dog,t:'Klaiņojošs suns',b:()=>'Pie mājām tev seko izsalcis kucēns.',ch:[{l:'Paņemt mājās',fn:()=>{C().flags.dog=true;addStat('happy',8);return 'Tev ir jauns draugs — Bārbija.'}},{l:'Aizvest uz patversmi',fn:()=>'Kucēns ir drošībā.'}]}
];
function randomEvent(){
  const pool=EVENTS.filter(e=>{try{return e.c()}catch(x){return false}});if(!pool.length)return;
  let r=rnd()*pool.reduce((a,e)=>a+e.w,0),ev=pool[0];for(const e of pool){r-=e.w;if(r<=0){ev=e;break}}
  const x=ev.prep?ev.prep():{};
  modal({t:ev.t,b:`<p>${ev.b(x)}</p>`,ch:ev.ch.map(o=>({l:o.l,fn:()=>{const m=o.fn(x);if(m){log(`${ev.t}: ${m}`);toast(m)}refreshUI();save()}}))});
}

/* ===================== Nāve un mantojums ===================== */
function lifePts(c){const off=Math.max(0,...c.offices.map(o=>OFFICES[o].pts)),w=Math.min(35,Math.max(0,c.money+c.savings-c.debt+(c.biz?c.biz.val:0)+HOMES[c.home].buy)/40000);return Math.round(off+w+c.rep/8+c.degrees.length*2+(S.trophies||[]).length)}
function die(cause){
  const c=C(),age=ageOf(c.bT),pts=lifePts(c);S.dead=true;S.prestige+=pts;
  const best=c.offices.length?OFFICES[c.offices.slice().sort((a,b)=>OFFICES[b].pts-OFFICES[a].pts)[0]].n:null;
  const rec={name:meName(),from:dateOf(c.bT).y,to:dateOf(S.T).y,age,best,wealth:c.money+c.savings-c.debt+(c.biz?c.biz.val:0),pts,cause};S.dyn.push(rec);
  log(`${meName()} aiziet mūžībā ${age} gadu vecumā.`,'b');
  const heirs=S.people.filter(p=>p.rel==='child'&&p.alive),tax=S.country.laws.includes('inherit')?.3:.05,estate=Math.max(0,c.money+c.savings-c.debt);
  modal({t:'Dzīve noslēgusies',b:`<p><b>${esc(meName())}</b> (${rec.from}–${rec.to}). Iemesls: ${cause.toLowerCase()}.</p><p>Augstākais amats: ${best||'nav'}. Bagātība: ${eur(rec.wealth)}. Prestižs +${pts}.</p>${heirs.length?`<p>Mantinieks saņems ${eur(estate*(1-tax))} (nodoklis ${tax*100}%), mājokli, mēbeles${c.biz?' un uzņēmumu':''}. Ja mantinieks vēl ir bērns, laiks pārtīsies līdz viņa 18 gadiem.</p>`:'<p>Tev nav bērnu, kas turpinātu dzimtu.</p>'}`,
    ch:heirs.length?heirs.map(h=>({l:`Turpināt kā ${fullName(h)}`,s:`${relName(h)}, ${ageOf(h.bT)} g.`,fn:()=>becomeHeir(h,estate*(1-tax))})):[{l:'Sākt jaunu dzimtu',fn:()=>{S.hall=(S.hall||[]).concat([{name:S.dynName,gens:S.dyn.length,pres:Math.round(S.prestige)}]);startScreen()}}]});
}
function becomeHeir(h,money){
  const old=C();S.dead=false;
  const spouse=S.people.find(p=>p.rel==='spouse'&&p.alive),sib=S.people.filter(p=>p.rel==='child'&&p.alive&&p.id!==h.id);
  S.people=S.people.filter(p=>p.town&&p.id!==h.id&&p.rel!=='spouse');
  S.people.forEach(p=>{if(p.rel!=='none'){p.rel='acq';p.close=Math.round(p.close*.4);p.rom=0;p.phone=false}});
  if(spouse){spouse.rel='parent';spouse.livesWith=0;spouse.homeB=HOMES[old.home].b;spouse.phone=true;S.people.push(spouse)}
  sib.forEach(p=>{p.rel='sibling';p.phone=true;S.people.push(p)});
  const st=h.stats||rollStats(0),L=h.look||randLook(h.sex);
  S.c=mkChar({first:h.first,sex:h.sex,surIdx:old.surIdx,bT:h.bT,cls:S.prestige>=70?'eli':S.prestige>=30?'tur':'vid',skin:L.skin,hair:{s:L.hair,c:L.hairC},
    stats:{health:Math.max(65,st.health),happy:58,smarts:st.smarts,looks:st.looks,charm:st.charm},money:Math.round(money),home:old.home>=3?old.home:0,furn:Object.assign({},old.furn),veh:old.veh,biz:old.biz,rep:Math.round(S.prestige/6),inf:Math.round(Math.min(30,S.prestige/5))});
  S.c.wardrobe=[{cid:L.top.t==='dress'?'dress':L.top.t==='jacket'?'jacket':L.top.t==='shirt'?'shirt':'tee',color:L.top.c},{cid:'jeans',color:'#1f3d6b'},{cid:'snk',color:'#f4f4f4'}];S.c.eq={top:0,bot:1,shoe:2,acc:-1};
  if(ageOf(h.bT)<18){const from=S.T;S.ff=true;while(ageOf(h.bT)<18){S.T++;S.day++;countryTick();checkElection(true,true)}S.ff=false;log(`Paiet ${Math.round((S.T-from)/12)} gadi. ${h.first} izaug un atgriežas Ostmalā.`,'y')}
  if(S.c.home===0&&!S.people.some(p=>p.rel==='parent'&&p.alive))S.c.home=1;
  S.quests=[];S.msgs=[];S.min=0;newDayWorld();
  log(`Dzimtu turpina ${meName()}. Paaudze nr. ${S.dyn.length+1}.`,'y');
  if(typeof afterNewDay==='function')afterNewDay('home');save();
}
