/* ===================== Pamati un dati ===================== */
const DAY_H0=12, DAY_MIN=960, LEASE_DAYS=40; // diena 12:00–04:00, īres līgums 40 dienas
const TW=64,TH=32,HW=32,HH=16;
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const rnd=()=>Math.random();
const cl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const usd=n=>(n<0?'−':'')+'$'+Math.abs(Math.round(n)).toLocaleString('en-US');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function $(s){return document.querySelector(s)}
function decl(name,cas){const rules={acc:[['ais','o'],['is','i'],['us','u'],['s','u'],['š','u'],['a','u'],['e','i']],dat:[['ais','ajam'],['is','im'],['us','um'],['s','am'],['š','am'],['a','ai'],['e','ei']],gen:[['ais','ā'],['is','a'],['us','us'],['s','a'],['š','a'],['a','as'],['e','es']]}[cas];
  return String(name).split(' ').map(w=>{for(const [e,r] of rules)if(w.endsWith(e)&&w.length>e.length+1)return w.slice(0,-e.length)+r;return w}).join(' ')}
const nAcc=n=>decl(n,'acc'),nDat=n=>decl(n,'dat'),nGen=n=>decl(n,'gen');

function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hexMix(a,b,t){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const r=Math.round(((pa>>16)&255)*(1-t)+((pb>>16)&255)*t),g=Math.round(((pa>>8)&255)*(1-t)+((pb>>8)&255)*t),bl=Math.round((pa&255)*(1-t)+(pb&255)*t);return '#'+((1<<24)|(r<<16)|(g<<8)|bl).toString(16).slice(1)}
function shade(hex,f){const p=parseInt(hex.slice(1),16);const r=cl(Math.round(((p>>16)&255)*f),0,255),g=cl(Math.round(((p>>8)&255)*f),0,255),b=cl(Math.round((p&255)*f),0,255);return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}

/* ---------- Vārdi ---------- */
const LV_M=['Jānis','Andris','Mārtiņš','Kārlis','Edgars','Roberts','Artūrs','Toms','Rihards','Oskars','Emīls','Kristaps','Dāvis','Niks','Ēriks','Pēteris'];
const LV_F=['Anna','Laura','Elīna','Marta','Līga','Ieva','Kristīne','Agnese','Paula','Linda','Madara','Zane','Alise','Rūta','Katrīna','Sofija'];
const US_M=['Džeiks','Maikls','Kriss','Deivids','Raiens','Džeisons','Tailers','Kevins','Brendons','Džastins','Entonijs','Marks','Endrjū','Nīks','Tonijs','Bens','Lūkass','Seths','Ītans','Ārons','Danijels','Kails'];
const US_F=['Džesika','Ešlija','Emīlija','Sāra','Megana','Hanna','Lorēna','Reičela','Ketija','Nikola','Amanda','Stefānija','Džūlija','Monika','Brītnija','Kloja','Zoja','Bella','Grēsa','Mija','Eva','Olīvija'];
const US_S=[['Smits','Smita'],['Džonsons','Džonsone'],['Viljamss','Viljamsa'],['Brauns','Brauna'],['Millers','Millere'],['Deiviss','Deivisa'],['Garsija','Garsija'],['Rodrigess','Rodrigesa'],['Vilsons','Vilsone'],['Andersons','Andersone'],['Teilors','Teilore'],['Mūrs','Mūra'],['Džeksons','Džeksone'],['Vaits','Vaita'],['Lī','Lī'],['Čens','Čena'],['Vongs','Vonga'],['Romāno','Romāno'],['Rosi','Rosi'],['Kellijs','Kellija'],['O’Braiens','O’Braiena'],['Kohens','Kohena'],['Martiness','Martinesa'],['Kims','Kima']];
const LV_S=[['Bērziņš','Bērziņa'],['Kalniņš','Kalniņa'],['Ozoliņš','Ozoliņa'],['Jansons','Jansone'],['Liepiņš','Liepiņa'],['Krūmiņš','Krūmiņa'],['Zariņš','Zariņa'],['Vītols','Vītola'],['Balodis','Balode'],['Eglītis','Eglīte'],['Siliņš','Siliņa'],['Straume','Straume']];

const SKIN=['#f6d2b5','#eebc98','#d99f78','#b97a52','#8a5636','#5e3a24'];
const HAIRC=[['#2b1b12','Melni'],['#5a3a22','Brūni'],['#9a6a3a','Gaiši brūni'],['#e0b85e','Blondi'],['#efe6cf','Platīna'],['#8c2f1c','Rudi'],['#ff6fae','Rozā'],['#4b7bd8','Zili']];
const HAIRS=[{id:'short',n:'Īsi mati',p:25,st:2},{id:'long',n:'Gari mati',p:35,st:3},{id:'bun',n:'Matu mezgls',p:30,st:4},{id:'curly',n:'Cirtas',p:40,st:4},{id:'pony',n:'Zirgaste',p:30,st:3},{id:'mohawk',n:'Irokēzis',p:45,st:5},{id:'afro',n:'Afro',p:50,st:5},{id:'bob',n:'Bobs',p:40,st:4},{id:'spiky',n:'Ezītis',p:35,st:4},{id:'braids',n:'Bizītes',p:45,st:5},{id:'slick',n:'Atglausti mati',p:40,st:5},{id:'buzz',n:'Īsi apcirpti',p:15,st:2},{id:'bald',n:'Noskūts',p:15,st:1}];
const COLORS=['#ff6f61','#2fb7b0','#ffc857','#f4f4f4','#2b2f3a','#3f7fd8','#ff4fa3','#46b06b','#9b5bd6','#c49a6c'];
const COLN={'#ff6f61':'koraļļu','#2fb7b0':'tirkīza','#ffc857':'dzeltena','#f4f4f4':'balta','#2b2f3a':'melna','#3f7fd8':'zila','#ff4fa3':'rozā','#46b06b':'zaļa','#9b5bd6':'violeta','#c49a6c':'smilšu'};

/* ---------- Īpašības un vajadzības ---------- */
const STATS=[['beauty','Skaistums'],['health','Veselība'],['humor','Humors'],['culture','Kultūra'],['strength','Spēks'],['crime','Noziedzīgums']];
const STN=Object.fromEntries(STATS);
const CORE=['beauty','health','humor','culture'];
const NEEDS=[['food','Sāta','🍎'],['energy','Miegs','zZ'],['hygiene','Higiēna','🚿'],['bladder','Tualete','WC']];
const STAT_MAX=200;

/* ---------- Sarunas ---------- */
const TOPICS=['Sports','Kino','Mūzika','Spēles','Mīlestība','Mode','Ceļojumi','Ziņas'];
const TOPIC_ICON={Sports:'🏀',Kino:'🎬',Mūzika:'🎵',Spēles:'🎮',Mīlestība:'❤',Mode:'👗',Ceļojumi:'✈',Ziņas:'📰'};
const TOPIC_LINE={
  Sports:['Vai redzēji vakardienas „Knicks” spēli?','Es katru rītu skrienu Centrālparkā.'],Kino:['Esi redzējis jauno grāvēju?','Mana mīļākā filma ir klasika.'],
  Mūzika:['Šonedēļ Grīnvičā spēlē lieliska grupa!','Es klausos visu — no džeza līdz hiphopam.'],Spēles:['Vakar spēlēju līdz pieciem rītā!','Spēļu zālē uzstādīju rekordu.'],
  Mīlestība:['Vai tev kāds ir?','Ņujorkā ir grūti atrast īsto…'],Mode:['Piektajā avēnijā ir izpārdošana!','Šosezon modē ir melns.'],
  Ceļojumi:['Es sapņoju par Parīzi.','Esi kādreiz bijis Tokijā?'],Ziņas:['Lasīji šodienas avīzi?','Biržā atkal kritums!']
};
const RANKS=[[0,'Svešinieks'],[1,'Paziņa'],[35,'Čoms'],[80,'Draugs'],[125,'Labākais draugs']];
const FMAX=125;
function rankOf(f){let r=RANKS[0][1];for(const [v,n] of RANKS)if(f>=v)r=n;return r}

/* ---------- Priekšmeti ---------- */
const ITEMS={
  ziedi:{n:'Rožu pušķis',p:25,tag:'Mīlestība',gift:8},sokolade:{n:'Šokolādes konfektes',p:12,gift:5,food:15},smarzas:{n:'Smaržas',p:85,tag:'Mode',gift:12},
  cd:{n:'Mūzikas albums',p:15,tag:'Mūzika',gift:7},dvd:{n:'Filmas DVD',p:20,tag:'Kino',gift:7},spele:{n:'Videospēle',p:50,tag:'Spēles',gift:9},
  bumba:{n:'Basketbola bumba',p:30,tag:'Sports',gift:8},celvedis:{n:'Ceļvedis pa pasauli',p:25,tag:'Ceļojumi',gift:7},zurnals:{n:'Žurnāls „Laiks”',p:6,tag:'Ziņas',gift:4},
  rota:{n:'Zelta kaklarota',p:400,tag:'Mīlestība',gift:22},lacis:{n:'Plīša lācītis',p:18,tag:'Mīlestība',gift:6},vins:{n:'Vīna pudele',p:30,gift:6},
  hotdog:{n:'Hotdogs',p:3,food:25},lietussargs:{n:'Lietussargs',p:8},kafija:{n:'Kafija līdzņemšanai',p:4,energy:15,bladder:-15},sviestmaize:{n:'Sviestmaize',p:6,food:30},
  avize:{n:'Avīze „New York Daily”',p:1,read:1},paka:{n:'Paciņa',p:0,quest:1}
};
const CLOTH=[
  {id:'tee',cat:'top',t:'tee',n:'T-krekls',p:15,st:2},{id:'tank',cat:'top',t:'tank',n:'Topiņš',p:20,st:4},{id:'hoodie',cat:'top',t:'hoodie',n:'Hūdijs',p:45,st:4},
  {id:'shirt',cat:'top',t:'shirt',n:'Krekls',p:60,st:6},{id:'sweater',cat:'top',t:'sweater',n:'Strīpains džemperis',p:55,st:5},{id:'leather',cat:'top',t:'leather',n:'Ādas jaka',p:260,st:13},{id:'coat',cat:'top',t:'coat',n:'Mētelis',p:240,st:12},{id:'suit',cat:'top',t:'suit',n:'Uzvalks ar kaklasaiti',p:380,st:15},{id:'jacket',cat:'top',t:'jacket',n:'Žakete',p:220,st:12},{id:'dress',cat:'top',t:'dress',n:'Kleita',p:180,st:11},
  {id:'ljacket',cat:'top',t:'jacket',n:'Dizaineru žakete',p:1400,st:26,lux:1},{id:'ldress',cat:'top',t:'dress',n:'Vakarkleita',p:1600,st:28,lux:1},
  {id:'jeans',cat:'bot',t:'jeans',n:'Džinsi',p:40,st:3},{id:'pants',cat:'bot',t:'pants',n:'Bikses',p:70,st:6},{id:'shorts',cat:'bot',t:'shorts',n:'Šorti',p:25,st:2},
  {id:'skirt',cat:'bot',t:'skirt',n:'Svārki',p:50,st:5},{id:'lpants',cat:'bot',t:'pants',n:'Dizaineru bikses',p:850,st:18,lux:1},
  {id:'snk',cat:'shoe',n:'Kedas',p:35,st:2},{id:'shoe',cat:'shoe',n:'Kurpes',p:90,st:6},{id:'heel',cat:'shoe',n:'Augstpapēžu kurpes',p:120,st:8},{id:'lshoe',cat:'shoe',n:'Itāļu kurpes',p:900,st:16,lux:1},
  {id:'sung',cat:'acc',t:'sunglasses',n:'Saulesbrilles',p:60,st:5},{id:'cap',cat:'acc',t:'cap',n:'Beisbola cepure',p:20,st:2},{id:'hat',cat:'acc',t:'hat',n:'Platmale',p:45,st:4},
  {id:'beanie',cat:'acc',t:'beanie',n:'Adīta cepure',p:18,st:2},{id:'scarf',cat:'acc',t:'scarf',n:'Šalle',p:25,st:3},{id:'headph',cat:'acc',t:'headphones',n:'Austiņas',p:80,st:5},{id:'bag',cat:'acc',t:'bag',n:'Plecu soma',p:70,st:4},{id:'chain',cat:'acc',t:'necklace',n:'Zelta ķēde',p:700,st:12,lux:1},{id:'lsung',cat:'acc',t:'sunglasses',n:'Dizaineru brilles',p:480,st:11,lux:1}
];
const CATN={top:'Augšdaļa',bot:'Apakšdaļa',shoe:'Apavi',acc:'Aksesuārs'};
const FURN=[
  {id:'sofa1',n:'Auduma dīvāns',slot:'sofa',p:300,cf:5},{id:'sofa2',n:'Ādas dīvāns',slot:'sofa',p:1500,cf:12,pop:2},
  {id:'bed2',n:'Divguļamā gulta',slot:'bed',p:700,cf:10},{id:'bed3',n:'Luksusa gulta',slot:'bed',p:3000,cf:18,pop:2},
  {id:'tv1',n:'Televizors',slot:'tv',p:400,cf:2},{id:'tv2',n:'Liels plazmas TV',slot:'tv',p:2200,cf:3,pop:2},
  {id:'console',n:'Spēļu konsole',slot:'console',p:300},{id:'stereo',n:'Mūzikas centrs',slot:'stereo',p:250},
  {id:'plant',n:'Istabas augs',slot:'plant',p:30,cf:2},{id:'paint1',n:'Glezna',slot:'art',p:150,pop:1},{id:'paint2',n:'Oriģināls mākslas darbs',slot:'art',p:2800,pop:5},
  {id:'rug',n:'Paklājs',slot:'rug',p:120,cf:3},{id:'aqua',n:'Akvārijs',slot:'aqua',p:700,cf:6,pop:2},{id:'desk',n:'Grāmatplaukts un galds',slot:'desk',p:400},
  {id:'piano',n:'Klavieres',slot:'piano',p:4800,pop:5},{id:'lamp',n:'Dizaina stāvlampa',slot:'lamp',p:200,cf:2}
];
const HOMES=[
  {n:'Blīkera iela 14 (kopā ar brāli)',b:'home',rent:420,lvl:0,pop:0,shared:1},{n:'Čainataunas studija',b:'apt_ct',rent:300,lvl:1,pop:0},
  {n:'Lofts Hjūstonas ielā',b:'loft',rent:750,lvl:2,pop:6},{n:'Piektās avēnijas dzīvoklis',b:'apt_fa',rent:1500,lvl:3,pop:12},{n:'Volstrītas penthauss',b:'penthouse',rent:3200,lvl:4,pop:20}
];
const SLOTS_BY_LVL=[['bed','desk','plant','art','rug','lamp','tv','console'],['bed','sofa','tv','desk','plant','art','rug','lamp','console'],['bed','sofa','tv','console','stereo','aqua','desk','plant','art','rug','lamp'],['bed','sofa','tv','console','stereo','aqua','desk','plant','art','rug','lamp','piano'],['bed','sofa','tv','console','stereo','aqua','desk','plant','art','rug','lamp','piano']];

/* ---------- Darbi (katrs ar minispēli) ---------- */
const JOBS=[
  {id:'barista',n:'Barista',b:['cafe'],hours:[12,22],pay:[55,75,100],mg:'simon',req:{},lv:['Barista','Vecākais barista','Kafejnīcas vadītājs'],d:'Atceries klientu pasūtījumus'},
  {id:'waiter',n:'Viesmīlis',b:['dimsum','seaport'],hours:[17,25],pay:[65,90,125],mg:'tables',req:{health:15},lv:['Viesmīlis','Galvenais viesmīlis','Zāles pārzinis'],d:'Ātri apkalpo galdiņus'},
  {id:'cashier',n:'Kluba kasieris',b:['club'],hours:[21,28],pay:[80,110,150],mg:'change',req:{culture:15},intro:'joe',lv:['Kasieris','Vecākais kasieris','Kases vadītājs'],d:'Ātri izdod atlikumu'},
  {id:'dancer',n:'Dejotājs',b:['club'],hours:[22,28],pay:[100,150,220],mg:'dance',req:{beauty:25,health:25},intro:'promoter',lv:['Dejotājs','Galvenais dejotājs','Šova zvaigzne'],d:'Dejo ritmā uz skatuves'},
  {id:'office',n:'Biroja darbinieks',b:['office','tower2'],hours:[12,20],pay:[120,170,240],mg:'pairs',req:{culture:35,beauty:25},intro:'banker',lv:['Asistents','Projektu vadītājs','Nodaļas vadītājs'],d:'Sakārto dokumentus pa pāriem'},
  {id:'trader',n:'Biržas makleris',b:['nyse'],hours:[12,18],pay:[220,340,520],mg:'stocks',req:{strength:45,culture:50},intro:'banker',lv:['Jaunākais makleris','Makleris','Biržas vilks'],d:'Pērc lēti, pārdod dārgi'}
];
/* ---------- Randiņi ---------- */
const DATES=[
  {id:'cinema',n:'Kino',b:'cinema',p:25,req:{},tag:'Kino',v:10},
  {id:'dinner',n:'Vakariņas „Zelta pūķī”',b:'dimsum',p:60,req:{humor:20},tag:'Ceļojumi',v:14},
  {id:'boat',n:'Laiva Centrālparka ezerā',b:'boathouse',p:30,req:{health:25},tag:'Sports',v:13},
  {id:'carriage',n:'Pajūgs pa Centrālparku (no „Plaza”)',b:'plaza',p:80,req:{beauty:20,humor:20},tag:'Mīlestība',v:16},
  {id:'empire',n:'Empīra Steita skatu laukums',b:'empire',p:45,req:{beauty:30},tag:'Mīlestība',v:18},
  {id:'club',n:'Dejas „Supernovā”',b:'club',p:40,req:{beauty:25},tag:'Mūzika',v:14},
  {id:'jazz',n:'Džeza vakars',b:'jazz',p:50,req:{culture:20,humor:20},tag:'Mūzika',v:15},
  {id:'show',n:'Brodvejas izrāde',b:'theater',p:120,req:{culture:30},tag:'Kino',v:18},
  {id:'opera',n:'Opera Linkolna centrā',b:'lincoln',p:200,req:{culture:60},tag:'Ceļojumi',v:24},
  {id:'seaport',n:'Vakariņas „Pīrā 17”',b:'seaport',p:110,req:{beauty:35,culture:25},tag:'Ceļojumi',v:20}
];
const TROPHIES=[
  {id:'friend',n:'Pirmais čoms',d:'Draudzība 35 ar kādu',t:()=>S.people.some(p=>!p.fam&&p.f>=35)},
  {id:'friends5',n:'Savējais pilsētā',d:'5 čomi',t:()=>S.people.filter(p=>!p.fam&&p.f>=35).length>=5},
  {id:'friends10',n:'Visi tevi pazīst',d:'10 čomi',t:()=>S.people.filter(p=>!p.fam&&p.f>=35).length>=10},
  {id:'best',n:'Labākais draugs',d:'Draudzība 125',t:()=>S.people.some(p=>!p.fam&&p.f>=FMAX)},
  {id:'roomie',n:'Kopā lētāk',d:'Atrodi istabas biedru',t:()=>S.flags.roommate},
  {id:'job',n:'Pirmā alga',d:'Nostrādā pirmo maiņu',t:()=>S.flags.shifts>0},
  {id:'promo',n:'Karjeras virsotne',d:'Sasniedz augstāko amatu',t:()=>C().job&&C().job.lvl>=2},
  {id:'trader',n:'Volstrītas vilks',d:'Kļūsti par biržas makleri',t:()=>C().job&&C().job.id==='trader'},
  {id:'date3',n:'Romantiķis',d:'3 randiņi',t:()=>(S.flags.dates||0)>=3},
  {id:'steady',n:'Mīlestība Ņujorkā',d:'Kļūsti par pāri',t:()=>S.people.some(p=>p.steady)},
  {id:'empire',n:'Virs mākoņiem',d:'Randiņš Empīra Steita ēkā',t:()=>S.flags.d_empire},
  {id:'all50',n:'Daudzpusīgs',d:'Visas 4 pamatīpašības 50+',t:()=>CORE.every(k=>C().st[k]>=50)},
  {id:'stat100',n:'Meistars',d:'Kāda īpašība 100+',t:()=>STATS.some(([k])=>k!=='crime'&&C().st[k]>=100)},
  {id:'pop50',n:'Populārs',d:'Popularitāte 50',t:()=>popularity()>=50},
  {id:'pop90',n:'Slavenība',d:'Popularitāte 90',t:()=>popularity()>=90},
  {id:'kungfu',n:'Piedzērušais meistars',d:'Spēks 80',t:()=>C().st.strength>=80},
  {id:'stinky',n:'Ielu smarža',d:'Higiēna nokrīt līdz 0',t:()=>S.flags.stinky},
  {id:'hero',n:'Varonis',d:'Izglāb kinozvaigzni Čainataunā',t:()=>S.flags.savedActor},
  {id:'premiere',n:'Sarkanais paklājs',d:'Apmeklē pirmizrādi',t:()=>S.flags.premiere},
  {id:'rich',n:'Pirmie 10 000',d:'$10 000 kabatā',t:()=>C().money>=10000},
  {id:'penthouse',n:'Virs pilsētas',d:'Pārvācies uz penthausu',t:()=>C().home===4},
  {id:'survive',n:'40 dienas Ņujorkā',d:'Nodzīvo līdz īres līguma beigām',t:()=>S.flags.ended}
];
