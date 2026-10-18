/* ===================== Stāvoklis ===================== */
let S=null;
const KEY='lielais_abols_v1';
function save(){try{if(S&&S.c)localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const t=localStorage.getItem(KEY);if(t){S=JSON.parse(t);return true}}catch(e){}return false}
const C=()=>S.c;
const hourNow=()=>DAY_H0+S.min/60;
const clockStr=()=>{const m=Math.min(S.min,DAY_MIN),h=DAY_H0+Math.floor(m/60);return String(h%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0')};
const hstr=h=>String(Math.floor(h)%24).padStart(2,'0')+':'+(h%1?'30':'00');
function nid(){S.uid=(S.uid||100)+1;return S.uid}
function pById(id){return S.people.find(p=>p.id===id)}
function pByKey(k){return S.people.find(p=>p.key===k)}
const fullName=p=>p.first+(p.last?' '+p.last:'');
const meName=()=>C().first;
function addSt(k,v){const s=C().st;s[k]=cl(s[k]+v,0,STAT_MAX)}
function need(k,v){const n=C().needs;n[k]=cl(n[k]+v)}
function log(msg,k=''){S.log.unshift({d:S.day,t:clockStr(),msg,k});if(S.log.length>120)S.log.length=120;if(typeof tick==='function')tick(msg,k)}
function addFame(v){S.fame=cl((S.fame||0)+v)}
function relLabel(p){if(p.fam)return 'brālis';if(p.steady)return p.sex==='m'?'tavs puisis':'tava meitene';return rankOf(p.f).toLowerCase()}

/* ---------- Izskats ---------- */
function randLook(sex,wx){
  const tops=sex==='f'?['tee','tank','shirt','hoodie','dress','jacket','sweater','coat','leather','tee']:['tee','shirt','hoodie','jacket','sweater','coat','leather','suit','tee','shirt'];
  let top=pick(tops);if(wx==='snow'&&rnd()<.6)top='coat';
  const bot=top==='dress'?'none':(sex==='f'?pick(['jeans','skirt','pants','jeans']):pick(['jeans','pants','jeans']));
  const hairs=sex==='f'?['long','bun','pony','curly','short','long','bob','braids','afro','slick']:['short','short','curly','mohawk','bald','short','afro','spiky','buzz','slick'];
  let acc=rnd()<.42?pick(['sunglasses','cap','hat','beanie','scarf','headphones','bag','bag']):null;if(wx==='snow'&&rnd()<.6)acc=pick(['beanie','scarf']);
  return {skin:pick(SKIN),hair:pick(hairs),hairC:pick(HAIRC.slice(0,rnd()<.9?6:8))[0],top:{t:top,c:pick(COLORS)},bot:{t:bot,c:pick(['#2c3150','#3a3a44','#5a4630','#1f3d6b','#6b6b70','#c49a6c'])},shoe:pick(['#1e1d24','#f4f4f4','#7a4b2a','#2b3a67']),acc,
    beard:sex==='m'&&rnd()<.22,capC:pick(['#2b3a67','#c0392b','#2e8b57','#ffc857','#222']),scarfC:pick(['#c0392b','#ffc857','#2fb7b0','#9b5bd6','#f4f4f4']),bagC:pick(['#8a5a36','#2b2f3a','#c0643a']),tie:pick(['#b22234','#2b3a67','#2e8b57']),umb:pick(['#2b3a67','#c0392b','#2e8b57','#ffc857','#9b5bd6','#222','#ff6fae'])};
}
const LK=(skin,hair,hairC,tt,tc,bt,bc,shoe,acc)=>({skin,hair,hairC,top:{t:tt,c:tc},bot:{t:bt,c:bc},shoe,acc:acc||null});
function randInterests(){const a=TOPICS.slice().sort(()=>rnd()-.5);return {likes:[a[0],a[1]],dislikes:[a[2]]}}

/* ---------- Stāsta tēli ---------- */
// sched: [stunda, vieta] — vieta: ēkas id | 'street' (savā rajonā) | 'gone'
function castDefs(sex){
  const sw=sex==='m'?{first:'Laura',last:'Bērziņa',sex:'f',look:LK('#f6d2b5','long','#e0b85e','dress','#ff8fb8','none','#000','#f4f4f4')}:{first:'Kristaps',last:'Bērziņš',sex:'m',look:LK('#f6d2b5','short','#9a6a3a','shirt','#3f7fd8','jeans','#1f3d6b','#7a4b2a')};
  return [
    {key:'bro',first:'Edgars',last:'',sex:'m',fam:1,role:'Tavs brālis, taksists',zone:'gv',homeB:'home',likes:['Sports','Spēles'],dislikes:['Mode'],humor:'rupjš',f:90,met:1,phone:1,noRom:1,
      look:LK('#eebc98','short','#5a3a22','hoodie','#46b06b','jeans','#2c3150','#1e1d24','cap'),sched:[[12,'home'],[13,'street'],[15,'gone'],[22,'pub'],[25,'home']],bio:'Atbrauca uz Ņujorku pirms trim gadiem. Brauc ar dzelteno taksi un zina katru ielu.'},
    {key:'lucy',first:'Lūsija',last:'Moreno',sex:'f',role:'Ielu muzikante',zone:'gv',homeB:'apt_gv2',likes:['Mūzika','Mode','Kino'],dislikes:['Ziņas'],humor:'rupjš',
      look:LK('#d99f78','curly','#2b1b12','tank','#ffc857','jeans','#1f3d6b','#f4f4f4','beanie'),sched:[[12,'street'],[14,'cafe'],[16,'gallery'],[18,'street'],[21,'jazz'],[25,'home']],bio:'Spēlē ģitāru metro stacijās. Meklē lētu istabu Grīnvičā.'},
    {key:'joe',first:'Toms',last:'Ozoliņš',sex:'m',role:'Bērnības draugs, bārmenis',zone:'gv',homeB:'apt_gv3',likes:['Mūzika','Sports'],dislikes:['Mode'],humor:'visi',f:25,met:1,phone:1,
      look:LK('#f6d2b5','short','#e0b85e','shirt','#2b2f3a','jeans','#2c3150','#1e1d24'),sched:[[12,'home'],[13,'records'],[15,'street'],[18,'pub'],[26,'home']],bio:'Jūs kopā spēlējāt futbolu Valmierā. Tagad viņš strādā bārā „Vecā pīpe” un pazīst pusi Manhetenas.'},
    {key:'vanessa',first:'Vanesa',last:'Kroforda',sex:'f',role:'Rietumkrasta diva',zone:'fa',homeB:'apt_fa',likes:['Mode','Ceļojumi','Mīlestība'],dislikes:['Sports','Spēles'],humor:'smalks',gate:{beauty:30},
      look:LK('#f6d2b5','long','#2b1b12','dress','#1b1b22','none','#000','#1e1d24','sunglasses'),sched:[[12,'street'],[13,'boutique'],[15,'salon'],[17,'plaza'],[20,'lincoln'],[23,'club'],[27,'home']],bio:'Atbraukusi no Losandželosas. Runā tikai ar tiem, kas izskatās pēc kaut kā.'},
    {key:'olivia',first:'Olīvija',last:'Beneta',sex:'f',role:'Teātra entuziaste',zone:'fa',homeB:'apt_fa',likes:['Kino','Ceļojumi','Ziņas'],dislikes:['Spēles'],humor:'smalks',gossip:1,gate:{culture:30},
      look:LK('#eebc98','bun','#8c2f1c','jacket','#9b5bd6','skirt','#2b2f3a','#7a4b2a'),sched:[[12,'met'],[15,'gallery'],[17,'street'],[19,'theater'],[23,'jazz'],[26,'home']],bio:'Zina visas Brodvejas tenkas. Rupji joki viņu aizvaino.'},
    {key:'promoter',first:'Džeiks',last:'Rivera',sex:'m',role:'Kluba promouteris',zone:'ts',homeB:'apt_ws',likes:['Mūzika','Mīlestība','Mode'],dislikes:['Ziņas'],humor:'visi',jokes:1,gate:{humor:25},
      look:LK('#b97a52','mohawk','#2b1b12','jacket','#ff4fa3','pants','#2b2f3a','#f4f4f4','necklace'),sched:[[12,'home'],[15,'street'],[17,'arcade'],[19,'pizza'],[21,'club'],[28,'home']],bio:'„Supernovas” promouteris. Smejas par jebkuru joku un var dabūt tev darbu uz skatuves.'},
    {key:'sam',first:'Vecais Sems',last:'',sex:'m',role:'Bezpajumtnieks, kung-fu meistars',zone:'cp',homeB:null,spot:[5,13],likes:['Ziņas','Ceļojumi','Sports'],dislikes:['Mode'],humor:'rupjš',noRom:1,
      look:LK('#d99f78','curly','#9aa3ad','jacket','#6b5a3a','pants','#4a4030','#3a3020','beanie'),sched:[[12,'street'],[27,'gone']],bio:'Dzīvo Centrālparkā. Saka, ka reiz bijis kung-fu čempions. Par hotdogu iemācīs „piedzērušā kung-fu”.'},
    {key:'cop',first:'Roza',last:'Moralesa',sex:'f',role:'Policijas detektīve',zone:'gv',homeB:'apt_ws',likes:['Sports','Kino','Ziņas'],dislikes:['Spēles'],humor:'visi',gateMax:{crime:20},
      look:LK('#d99f78','pony','#2b1b12','shirt','#2b3a67','pants','#2b3a67','#1e1d24','copcap'),sched:[[12,'police'],[15,'street'],[18,'diner'],[20,'street'],[24,'police'],[26,'home']],bio:'6. iecirkņa detektīve. Ar noziedzniekiem nerunā un nekoķetē.'},
    {key:'banker',first:'Bredlijs',last:'Teilors',sex:'m',role:'Volstrītas makleris',zone:'ws',homeB:'penthouse',likes:['Sports','Ziņas','Ceļojumi'],dislikes:['Mūzika'],humor:'smalks',gate:{beauty:25,culture:25},
      look:LK('#f6d2b5','short','#5a3a22','jacket','#2b2f3a','pants','#2b2f3a','#1e1d24'),sched:[[12,'nyse'],[18,'street'],[19,'seaport'],[21,'plaza'],[24,'club'],[26,'home']],bio:'Strādā biržā. Var ieteikt tevi darbam birojā, bet maklerim vajag dzelzs nervus un muskuļus.'},
    Object.assign({key:'sweet',role:'Tava skolas mīlestība',zone:'gv',homeB:'apt_gv3',likes:['Mīlestība','Kino','Ceļojumi'],dislikes:['Spēles'],humor:'visi',appearDay:3,sched:[[12,'street'],[14,'cafe'],[16,'met'],[18,'street'],[20,'dimsum'],[23,'home']],bio:'Jūs kopā gājāt uz izlaidumu Valmierā. Tagad studē Ņujorkā. Vai vecā liesma vēl kvēlo?'},sw),
    {key:'star',first:'Čeiss',last:'Maksvels',sex:'m',role:'Kinozvaigzne',zone:'fa',homeB:'penthouse',likes:['Kino','Mode','Ceļojumi'],dislikes:['Ziņas'],humor:'smalks',gate:{beauty:45},gatePop:40,appearDay:8,
      look:LK('#eebc98','short','#2b1b12','jacket','#f4f4f4','pants','#2b2f3a','#1e1d24','sunglasses'),sched:[[12,'home'],[14,'plaza'],[17,'street'],[20,'lincoln'],[22,'club'],[27,'home']],bio:'Holivudas zvaigzne, kas Ņujorkā filmē jaunu filmu. Paparaci viņu dzenā katru dienu.'},
    {key:'agent',first:'Mārvins',last:'Goldbergs',sex:'m',role:'Slavens aģents',zone:'fa',homeB:'apt_fa',likes:['Ziņas','Kino'],dislikes:['Sports'],humor:'smalks',gatePop:60,noRom:1,
      look:LK('#f6d2b5','bald','#9aa3ad','jacket','#5a2a3a','pants','#2b2f3a','#1e1d24'),sched:[[12,'plaza'],[24,'home']],bio:'Ja Mārvins tev piezvana, tava dzīve mainās. Sēž „Plaza” bārā.'},
    {key:'thug',first:'Vinijs',last:'„Nazis”',sex:'m',role:'Ielu huligāns',zone:'ct',homeB:null,likes:['Sports','Spēles'],dislikes:['Kino'],humor:'rupjš',noRom:1,
      look:LK('#eebc98','bald','#2b1b12','hoodie','#2b2f3a','jeans','#3a3a44','#1e1d24'),sched:[[12,'gone'],[20,'street'],[27,'gone']],bio:'Čainataunas naktīs viņu labāk nesatikt.'},
    {key:'kevin',first:'Kevins',last:'Kohens',sex:'m',role:'Nama saimnieka dēls',zone:'gv',homeB:'apt_gv2',likes:['Spēles','Sports'],dislikes:['Mīlestība'],humor:'rupjš',noRom:1,
      look:LK('#f6d2b5','curly','#5a3a22','tee','#ff6f61','shorts','#3f7fd8','#f4f4f4','cap'),sched:[[12,'home'],[14,'arcade'],[17,'pizza'],[20,'street'],[23,'home']],bio:'Ievāc īri saimnieka vietā. Katru 7. dienu paņem naudu.'},
    {key:'li',first:'Li',last:'Veja',sex:'f',role:'Restorāna „Zelta pūķis” īpašniece',zone:'ct',homeB:'apt_ct',likes:['Ceļojumi','Ziņas','Mīlestība'],dislikes:['Spēles'],humor:'smalks',
      look:LK('#eebc98','bun','#2b1b12','shirt','#c43b2f','pants','#2b2f3a','#1e1d24'),sched:[[12,'dimsum'],[24,'home']],bio:'Gatavo labākos pelmeņus Manhetenā. Viesmīļiem maksā labi.'},
    {key:'jp',first:'Žans Pjērs',last:'Leblāns',sex:'m',role:'Galerists',zone:'gv',homeB:'apt_gv2',likes:['Mode','Kino','Ceļojumi'],dislikes:['Sports'],humor:'smalks',gate:{culture:20},
      look:LK('#f6d2b5','long','#2b1b12','shirt','#f4f4f4','pants','#2b2f3a','#7a4b2a','hat'),sched:[[12,'gallery'],[18,'street'],[20,'jazz'],[24,'home']],bio:'Francūzis, kas vada galeriju „Bohēma”. Mīl mākslu, ienīst sportu.'},
    {key:'nina',first:'Nina',last:'Kima',sex:'f',role:'Tavas mīlestības draudzene',zone:'ct',homeB:'apt_ct',likes:['Mūzika','Spēles'],dislikes:['Ziņas'],humor:'visi',hidden:1,
      look:LK('#eebc98','pony','#2b1b12','tee','#9b5bd6','skirt','#2b2f3a','#f4f4f4'),sched:[[12,'street'],[16,'karaoke'],[19,'dimsum'],[22,'karaoke'],[26,'home']],bio:'Karaoke karaliene. Iepazināties pārsteiguma ballītē.'},
    {key:'marko',first:'Marko',last:'Rosi',sex:'m',role:'Tavas mīlestības draugs',zone:'ws',homeB:'apt_ws',likes:['Sports','Kino'],dislikes:['Mode'],humor:'rupjš',hidden:1,
      look:LK('#d99f78','short','#2b1b12','tee','#46b06b','jeans','#2c3150','#1e1d24','cap'),sched:[[12,'street'],[15,'gym'],[19,'diner'],[22,'pub'],[26,'home']],bio:'Fitnesa fanātiķis no Bruklinas.'}
  ];
}
const ZONE_VENUES={cp:['boathouse','street','street','street'],fa:['boutique','dept','plaza','met','salon','luxe'],ts:['pizza','cinema','arcade','theater'],gv:['cafe','pub','gallery','records','gym','deli'],ct:['dimsum','market','kungfu','massage','teahouse'],ws:['diner','seaport','office','bank']};
const NIGHT_VENUES={cp:['street'],fa:['plaza','club'],ts:['club','arcade','pizza'],gv:['pub','jazz','comedy'],ct:['karaoke','dimsum'],ws:['diner','club']};
const ZONE_HOMES={cp:['apt_fa','apt_gv3'],fa:['apt_fa','apt_gv3'],ts:['apt_gv2','apt_ws'],gv:['apt_gv2','apt_gv3'],ct:['apt_ct'],ws:['apt_ws','penthouse']};
const TOWN_ROLES=[['Students','Studente'],['Barista','Bariste'],['Taksists','Taksiste'],['Jurists','Juriste'],['Programmētājs','Programmētāja'],['Aktieris','Aktrise'],['Dizainers','Dizainere'],['Modelis','Modele'],['Ielu mākslinieks','Ielu māksliniece'],['Ārsts','Ārste'],['Šefpavārs','Šefpavāre'],['Pārdevējs','Pārdevēja'],['Ugunsdzēsējs','Ugunsdzēsēja'],['Žurnālists','Žurnāliste'],['Velokurjers','Velokurjere'],['Baņķieris','Baņķiere'],['Fotogrāfs','Fotogrāfe'],['Treneris','Trenere'],['Mūziķis','Mūziķe'],['Medmāsa','Medmāsa']];
function mkPerson(o){const sex=o.sex||(rnd()<.5?'m':'f');const sur=pick(US_S);
  const ii=randInterests();
  return Object.assign({id:nid(),sex,first:pick(sex==='m'?US_M:US_F),last:sur[sex==='m'?0:1],f:0,rom:0,met:0,phone:0,known:{},look:randLook(sex),likes:ii.likes,dislikes:ii.dislikes,humor:pick(['smalks','rupjš','visi','visi']),sched:[],tDay:{}},o,{sex})}
function genSched(p){
  if(p.cast){const s=p.sched0.map(([h,l])=>({h,l:l==='home'?(p.homeB||'gone'):l}));
    if(p.key==='lucy'&&S.flags.roommate)s.forEach(x=>{if(x.l==='apt_gv2')x.l='home'});
    if(p.appearDay&&S.day<p.appearDay)s.forEach(x=>x.l='gone');
    if(p.hidden&&!S.flags.party)s.forEach(x=>x.l='gone');
    if(p.key==='thug'&&S.flags.thugGone)s.forEach(x=>x.l='gone');
    p.sched=s;return}
  const z=p.zone,s=[],home=p.homeB;
  s.push({h:12,l:rnd()<.5?'street':pick(ZONE_VENUES[z])});
  s.push({h:R(14,15),l:rnd()<.45?'street':pick(ZONE_VENUES[z])});
  s.push({h:R(16,17),l:rnd()<.5?'street':pick(ZONE_VENUES[pick([z,z,pick(Object.keys(ZONE_VENUES))])])});
  s.push({h:R(19,20),l:rnd()<.5?'street':pick(ZONE_VENUES[z])});
  if(rnd()<.6){s.push({h:21+rnd()*1.5,l:pick(NIGHT_VENUES[z])});s.push({h:R(25,27),l:home})}else s.push({h:R(22,24),l:home});
  p.sched=s.map(x=>({h:x.h,l:x.l==='street'||BLDS.some(b=>b.id===x.l)?x.l:'street'}));
}
function locOf(p,h){if(p.appt&&p.appt.day===S.day&&h>=p.appt.from&&h<p.appt.until)return p.appt.b;let l='street';for(const s of p.sched||[])if(s.h<=h)l=s.l;return l}
function newGame(o){
  S={day:1,uid:100,tab:'city',min:0,log:[],people:[],msgs:[],quests:[],trophies:[],flags:{shifts:0,dates:0},fame:0,speed:2,where:null,pos:null,story:{}};
  S.c={first:o.first,sex:o.sex,skin:o.skin,hair:{s:o.hair,c:o.hairC},st:Object.assign({beauty:0,health:0,humor:0,culture:0,strength:5,crime:0},o.st),
    needs:{food:80,energy:85,hygiene:90,bladder:80},money:600,beard:!!o.beard,home:0,furn:{},fridge:2,inv:{avize:1},wardrobe:[],eq:{top:0,bot:1,shoe:2,acc:-1},job:null,mom:0};
  const c=S.c;
  c.wardrobe=[{cid:o.sex==='f'?'tank':'tee',color:o.shirt},{cid:o.sex==='f'?'skirt':'jeans',color:o.sex==='f'?'#2c3150':'#1f3d6b'},{cid:'snk',color:'#f4f4f4'}];
  castDefs(o.sex).forEach(d=>{const p=mkPerson({});Object.assign(p,{cast:1,key:d.key,first:d.first,last:d.last,sex:d.sex,look:d.look,likes:d.likes,dislikes:d.dislikes,humor:d.humor,gossip:d.gossip,jokes:d.jokes,gate:d.gate,gateMax:d.gateMax,gatePop:d.gatePop,
    role:d.role,zone:d.zone,homeB:d.homeB,spot:d.spot,f:d.f||0,met:d.met||0,phone:d.phone||0,fam:d.fam,noRom:d.noRom,appearDay:d.appearDay,hidden:d.hidden,bio:d.bio,sched0:d.sched});S.people.push(p)});
  const zones=['cp','fa','fa','ts','ts','gv','gv','gv','ct','ct','ws','ws'];
  for(let i=0;i<46;i++){const z=zones[i%zones.length];const p=mkPerson({town:1,zone:z,homeB:pick(ZONE_HOMES[z])});p.role=pick(TOWN_ROLES)[p.sex==='m'?0:1];S.people.push(p)}
  newDayWorld();
  log(`${o.first} izkāpj no metro Grīnvičvilidžā. Ņujorka ir tava!`,'y');
}

/* ---------- Izskats un stils ---------- */
function cloth(cid){return CLOTH.find(x=>x.id===cid)}
function myLook(){const c=C(),w=c.wardrobe,g=i=>i>=0&&w[i]?w[i]:null;
  const top=g(c.eq.top),bot=g(c.eq.bot),shoe=g(c.eq.shoe),acc=g(c.eq.acc);
  const tc=top?cloth(top.cid):null,bc=bot?cloth(bot.cid):null,ac=acc?cloth(acc.cid):null;
  return {skin:c.skin,hair:c.hair.s,hairC:c.hair.c,top:{t:tc?tc.t:'tee',c:top?top.color:'#ffffff'},bot:{t:tc&&tc.t==='dress'?'none':(bc?bc.t:'jeans'),c:bot?bot.color:'#2c3150'},shoe:shoe?shoe.color:'#1e1d24',acc:ac?ac.t:null,dirty:c.needs.hygiene<25,beard:c.beard,capC:'#2b3a67',scarfC:'#ff4fa3',bagC:'#8a5a36',tie:'#b22234'};
}
function styleScore(){const c=C();let s=0;['top','bot','shoe','acc'].forEach(k=>{const it=c.wardrobe[c.eq[k]];if(it&&c.eq[k]>=0){const cd=cloth(it.cid);if(!(k==='bot'&&cloth(c.wardrobe[c.eq.top]?.cid||'tee').t==='dress'))s+=cd.st}});
  const hs=HAIRS.find(h=>h.id===c.hair.s);return Math.round(s+(hs?hs.st:0))}
function effBeauty(){return C().st.beauty+Math.round(styleScore()/3)}
function stat(k){return k==='beauty'?effBeauty():C().st[k]}
function homeComfort(){const c=C();let cf=0,pop=0;for(const s in c.furn){const f=FURN.find(x=>x.id===c.furn[s]);if(f&&SLOTS_BY_LVL[HOMES[c.home].lvl].includes(s)){cf+=f.cf||0;pop+=f.pop||0}}return {cf,pop}}
function popularity(){if(!S||!S.c)return 0;let p=0;S.people.forEach(x=>{if(x.fam)return;if(x.f>=FMAX)p+=9;else if(x.f>=80)p+=6;else if(x.f>=35)p+=3;if(x.steady)p+=8});
  const c=C();if(c.job)p+=3+c.job.lvl*3+(c.job.id==='trader'?5:0);p+=HOMES[c.home].pop+homeComfort().pop+Math.floor(styleScore()/4)+Math.floor(effBeauty()/12)+Math.floor(Math.min(c.money,20000)/1500)+(S.fame||0);
  return Math.round(cl(p))}
function socialMul(){const n=C().needs;let m=1;if(n.hygiene<30)m*=.5;if(n.energy<15)m*=.8;if(n.food<10)m*=.85;return m}

/* ---------- Laiks ---------- */
function advance(min){
  if(!S||!S.c)return;const c=C();S.min+=min;
  need('food',-min*.065);need('energy',-min*.07);need('hygiene',-min*.035);need('bladder',-min*.085);
  if(c.needs.food<=0)addSt('health',-min*.01);
  if(c.needs.hygiene<=0){S.flags.stinky=1;addSt('beauty',-min*.004)}
  if(c.needs.energy<=8)addSt('health',-min*.004);
  if(!S.where&&(S.weather==='rain'||S.weather==='snow')&&!c.inv.lietussargs){need('hygiene',-min*.03);if(!S.wetWarn||S.wetWarn<S.day){S.wetWarn=S.day;if(typeof tick==='function')tick(S.weather==='rain'?'☔ Tu esi izmircis! Lietussargs bodegā maksā $8.':'❄ Tu salsti… Lietussargs bodegā maksā $8.','b')}}
  if(!S.where&&S.weather==='snow')need('energy',-min*.012);
  const h=Math.floor(hourNow());if(h!==S.lastHour){S.lastHour=h;if(typeof onHour==='function')onHour()}
}
function spendT(min,cost){const c=C();if(S.min+min>DAY_MIN){toast('Šodien vairs nepietiek laika. Ej gulēt.');return false}if(cost&&c.money<cost){toast('Nepietiek naudas.');return false}c.money-=cost||0;advance(min);return true}

/* ---------- Diena ---------- */
function rentDue(){const h=HOMES[C().home];return h.shared&&S.flags.roommate?Math.round(h.rent/2):h.rent}
function endDay(where){ // 'home'|'hotel'|'friend'|'bench'
  if(S.over)return;const c=C();
  const early=S.min<DAY_MIN-180,cf=homeComfort().cf;
  const q={home:1,hotel:1,friend:.9,bench:.5}[where]||.7;
  if(where==='bench'){addSt('health',-3);need('hygiene',-25);log('Tu aizmiedz uz soliņa. Mugura sāp.','b')}
  c.needs.energy=cl(45+50*q+cf*.6+(early?8:0));c.needs.food=cl(c.needs.food-15);c.needs.bladder=cl(c.needs.bladder-25);c.needs.hygiene=cl(c.needs.hygiene-8);
  if(c.job){if(!c.job.worked){c.job.missed=(c.job.missed||0)+1;if(c.job.missed>=3){log(`Tevi atlaiž no darba (${jobDef().lv[c.job.lvl]}) — trīs kavētas maiņas.`,'b');c.job=null}}else c.job.missed=0;if(c.job)c.job.worked=false}
  S.people.forEach(p=>{if(!p.fam&&p.f>0&&p.met&&p.lastSeen!=null&&S.day-p.lastSeen>4&&p.f<FMAX)p.f=Math.max(0,p.f-1)});
  S.day++;S.min=0;S.lastHour=DAY_H0;
  if(S.day>LEASE_DAYS&&!S.extended){S.flags.ended=1;checkTrophies();save();if(typeof showEnding==='function')showEnding('lease');return}
  // īre
  if(S.day%7===0||S.flags.rentLate){const r=rentDue();
    if(c.money>=r){c.money-=r;S.flags.rentLate=0;log(`Kevins paņem īri: ${usd(r)}.${S.flags.roommate&&HOMES[c.home].shared?' Otru pusi samaksā Lūsija.':''}`,'y')}
    else if(S.flags.rentLate){save();if(typeof showEnding==='function')showEnding('broke');return}
    else{S.flags.rentLate=1;log(`Īrei vajag ${usd(r)}, bet tev ir tikai ${usd(c.money)}! Rīt pēdējā iespēja.`,'b')}}
  newDayWorld();
  checkTrophies();
  if(typeof afterNewDay==='function')afterNewDay(where);
  save();
}
const WX={clear:{n:'Saulains',i:'☀'},cloudy:{n:'Mākoņains',i:'☁'},rain:{n:'Lietus',i:'🌧'},snow:{n:'Sniegs',i:'❄'}};
function rollWeather(){const d=S.day,r=rnd();if(d===1){S.weather='clear';return}
  const w=d<=12?[['clear',.5],['cloudy',.28],['rain',.22]]:d<=26?[['clear',.36],['cloudy',.3],['rain',.34]]:[['clear',.28],['cloudy',.24],['rain',.14],['snow',.34]];
  let a=0;for(const [k,p] of w){a+=p;if(r<a){S.weather=k;return}}S.weather='clear'}
function newDayWorld(){
  rollWeather();
  S.people.forEach(p=>{if(p.appt&&p.appt.day<S.day)p.appt=null;p.qOffer=null;p.tDay={};genSched(p)});
  const cand=S.people.filter(p=>p.town&&!S.quests.some(q=>q.giver===p.id));
  for(let i=0;i<4&&cand.length;i++){const p=cand.splice(R(0,cand.length-1),1)[0];p.qOffer=genQuest(p)}
  S.quests=S.quests.filter(q=>!q.done&&(q.exp==null||q.exp>=S.day));
  // īsziņas
  const fans=S.people.filter(p=>!p.fam&&p.phone&&!p.noRom&&p.rom>=30&&!p.appt);
  if(fans.length&&rnd()<.6){const p=pick(fans);const d=pick(DATES.filter(x=>x.b!=='carriage'));S.msgs.unshift({id:nid(),from:p.id,day:S.day,type:'date',date:d.id,text:`Ei! Varbūt šovakar ${d.n.toLowerCase()}? ${p.steady?'Ilgojos pēc tevis ❤':'😊'}`,read:false})}
  const fr=S.people.filter(p=>!p.fam&&p.phone&&p.f>=35);
  if(fr.length&&rnd()<.55){const p=pick(fr);const b=pick(['cafe','pub','pizza','diner','karaoke','arcade','jazz']);S.msgs.unshift({id:nid(),from:p.id,day:S.day,type:'invite',b,from_h:R(15,21),text:`Sveiks! Satiekamies šodien — ${bld(b).n}?`,read:false})}
  if(S.day%7===6)S.msgs.unshift({id:nid(),from:pByKey('kevin').id,day:S.day,type:'chat',text:`Rīt īres diena: ${usd(rentDue())}. Neaizmirsti! — Kevins`,read:false});
  if(S.msgs.length>40)S.msgs.length=40;
  if(typeof storyDay==='function')storyDay();
}

/* ---------- Uzdevumi ---------- */
function genQuest(p){
  const t=pick(['bring','bring','meet','deliver']);const rew=R(30,140);
  if(t==='bring'){const it=pick(['kafija','ziedi','sokolade','hotdog','zurnals','cd']);return {type:t,item:it,reward:rew,desc:`${p.first} lūdz atnest: ${ITEMS[it].n.toLowerCase()}.`}}
  if(t==='meet'){const b=pick(['cafe','pizza','met','pub','cinema','diner','teahouse']);return {type:t,b,reward:rew,desc:`${p.first} grib satikties: ${bld(b).n} līdz 21:00.`}}
  const b=pick(['office','plaza','police','bank','seaport','realty','nyse']);return {type:'deliver',b,reward:rew+20,desc:`${p.first} lūdz aiznest paciņu: ${bld(b).n}.`};
}
function acceptQuest(p){
  if(S.quests.filter(q=>!q.done).length>=4){toast('Tev jau ir daudz uzdevumu.');return}
  const q=Object.assign({id:nid(),giver:p.id,day:S.day,exp:S.day+3},p.qOffer);p.qOffer=null;
  if(q.type==='meet'){q.exp=S.day;p.appt={b:q.b,day:S.day,from:hourNow(),until:21}}
  if(q.type==='deliver')C().inv.paka=(C().inv.paka||0)+1;
  S.quests.push(q);log(`Jauns uzdevums: ${q.desc}`,'y');
}
function completeQuest(q,msg){
  q.done=true;const c=C(),p=pById(q.giver);c.money+=q.reward;S.flags.quests=(S.flags.quests||0)+1;
  if(p){p.f=cl(p.f+12,0,FMAX);p.met=1}
  if(q.type==='deliver'&&c.inv.paka)c.inv.paka--;
  log(`Uzdevums izpildīts! +${usd(q.reward)}${msg?' · '+msg:''}`,'g');toast(`Uzdevums izpildīts! +${usd(q.reward)}`);checkTrophies();
}
function checkTrophies(){if(!S||!S.c)return;TROPHIES.forEach(t=>{if(!S.trophies.includes(t.id)){let ok=false;try{ok=t.t()}catch(e){}if(ok){S.trophies.push(t.id);log(`Sasniegums: ${t.n}!`,'y');if(typeof toast==='function')toast(`🏆 ${t.n}!`)}}})}
function jobDef(){const c=C();return c.job?JOBS.find(j=>j.id===c.job.id):null}

/* ---------- Novērtējums 40. dienā ---------- */
function evaluate(){
  const c=C(),j=jobDef(),fr=S.people.filter(p=>!p.fam&&p.f>=35).length,best=S.people.filter(p=>!p.fam&&p.f>=80).length,st=S.people.find(p=>p.steady);
  const career=j?Math.min(25,6+c.job.lvl*5+(['office','trader'].includes(j.id)?6:0)+(j.id==='trader'?3:0)):0;
  const love=st?Math.min(25,15+Math.floor(st.rom/12)):Math.min(10,Math.max(0,...S.people.filter(p=>!p.noRom&&!p.fam).map(p=>Math.floor(p.rom/12))));
  const social=Math.min(25,fr*2+best*2);
  const self=Math.min(25,Math.round(CORE.reduce((a,k)=>a+Math.min(100,c.st[k]),0)/16));
  const fame=Math.min(10,Math.round((S.fame||0)/4));
  return {career,love,social,self,fame,total:Math.min(100,career+love+social+self+fame),fr,st,j};
}
