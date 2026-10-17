/* ===================== Pamati un dati ===================== */
const START_YEAR=1990, DAY_MIN=1080; // diena 08:00–02:00
const TW=64,TH=32,HW=32,HH=16;
const MON=['janv.','febr.','marts','apr.','maijs','jūn.','jūl.','aug.','sept.','okt.','nov.','dec.'];
const MONL=['janvāris','februāris','marts','aprīlis','maijs','jūnijs','jūlijs','augusts','septembris','oktobris','novembris','decembris'];
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const rnd=()=>Math.random();
const cl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const eur=n=>(n<0?'−':'')+Math.abs(Math.round(n)).toLocaleString('lv-LV')+' €';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function $(s){return document.querySelector(s)}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hexMix(a,b,t){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const r=Math.round(((pa>>16)&255)*(1-t)+((pb>>16)&255)*t),g=Math.round(((pa>>8)&255)*(1-t)+((pb>>8)&255)*t),bl=Math.round((pa&255)*(1-t)+(pb&255)*t);return '#'+((1<<24)|(r<<16)|(g<<8)|bl).toString(16).slice(1)}
function shade(hex,f){const p=parseInt(hex.slice(1),16);const r=cl(Math.round(((p>>16)&255)*f),0,255),g=cl(Math.round(((p>>8)&255)*f),0,255),b=cl(Math.round((p&255)*f),0,255);return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}

const MALE=['Jānis','Andris','Mārtiņš','Kārlis','Edgars','Roberts','Artūrs','Toms','Mārcis','Rihards','Valdis','Oskars','Emīls','Gustavs','Kristaps','Ralfs','Dāvis','Niks','Ivars','Aigars','Raimonds','Krišjānis','Ēriks','Pēteris'];
const FEMALE=['Anna','Laura','Elīna','Marta','Līga','Ieva','Sanita','Kristīne','Agnese','Paula','Evelīna','Linda','Madara','Zane','Alise','Rūta','Katrīna','Sofija','Dace','Inese','Baiba','Signe','Liene','Elza'];
const SUR=[['Bērziņš','Bērziņa'],['Kalniņš','Kalniņa'],['Ozoliņš','Ozoliņa'],['Jansons','Jansone'],['Liepiņš','Liepiņa'],['Krūmiņš','Krūmiņa'],['Zariņš','Zariņa'],['Vītols','Vītola'],['Kļaviņš','Kļaviņa'],['Balodis','Balode'],['Lapiņš','Lapiņa'],['Eglītis','Eglīte'],['Siliņš','Siliņa'],['Grīnbergs','Grīnberga'],['Pētersons','Pētersone'],['Straume','Straume'],['Avotiņš','Avotiņa'],['Rozenbergs','Rozenberga'],['Celmiņš','Celmiņa'],['Vanags','Vanaga']];
const SKIN=['#f6d2b5','#eebc98','#d99f78','#b97a52','#8a5636','#5e3a24'];
const HAIRC=[['#2b1b12','Melni'],['#5a3a22','Brūni'],['#9a6a3a','Gaiši brūni'],['#e0b85e','Blondi'],['#efe6cf','Platīna'],['#8c2f1c','Rudi'],['#ff6fae','Rozā'],['#4b7bd8','Zili']];
const HAIRS=[{id:'short',n:'Īsi mati',p:25,st:2},{id:'long',n:'Gari mati',p:35,st:3},{id:'bun',n:'Matu mezgls',p:30,st:4},{id:'curly',n:'Cirtas',p:40,st:4},{id:'pony',n:'Zirgaste',p:30,st:3},{id:'mohawk',n:'Irokēzis',p:45,st:5},{id:'bald',n:'Noskūts',p:15,st:1}];
const COLORS=['#ff6f61','#2fb7b0','#ffc857','#f4f4f4','#2b2f3a','#3f7fd8','#ff4fa3','#46b06b','#9b5bd6','#c49a6c'];
const COLN={'#ff6f61':'koraļļu','#2fb7b0':'tirkīza','#ffc857':'dzeltena','#f4f4f4':'balta','#2b2f3a':'melna','#3f7fd8':'zila','#ff4fa3':'rozā','#46b06b':'zaļa','#9b5bd6':'violeta','#c49a6c':'smilšu'};

const CLOTH=[
  {id:'tee',cat:'top',t:'tee',n:'T-krekls',p:15,st:2},{id:'tank',cat:'top',t:'tank',n:'Topiņš',p:20,st:4},
  {id:'polo',cat:'top',t:'shirt',n:'Polo krekls',p:35,st:4},{id:'hoodie',cat:'top',t:'hoodie',n:'Hūdijs',p:45,st:4},
  {id:'shirt',cat:'top',t:'shirt',n:'Krekls',p:60,st:6},{id:'jacket',cat:'top',t:'jacket',n:'Žakete',p:220,st:12},
  {id:'dress',cat:'top',t:'dress',n:'Kleita',p:180,st:11},
  {id:'ljacket',cat:'top',t:'jacket',n:'Dizaineru žakete',p:1400,st:26,lux:1},{id:'ldress',cat:'top',t:'dress',n:'Vakarkleita',p:1600,st:28,lux:1},
  {id:'jeans',cat:'bot',t:'jeans',n:'Džinsi',p:40,st:3},{id:'pants',cat:'bot',t:'pants',n:'Bikses',p:70,st:6},
  {id:'shorts',cat:'bot',t:'shorts',n:'Šorti',p:25,st:2},{id:'skirt',cat:'bot',t:'skirt',n:'Svārki',p:50,st:5},
  {id:'lpants',cat:'bot',t:'pants',n:'Dizaineru bikses',p:850,st:18,lux:1},
  {id:'snk',cat:'shoe',n:'Kedas',p:35,st:2},{id:'shoe',cat:'shoe',n:'Kurpes',p:90,st:6},{id:'heel',cat:'shoe',n:'Augstpapēžu kurpes',p:120,st:8},
  {id:'lshoe',cat:'shoe',n:'Itāļu kurpes',p:900,st:16,lux:1},
  {id:'sung',cat:'acc',t:'sunglasses',n:'Saulesbrilles',p:60,st:5},{id:'cap',cat:'acc',t:'cap',n:'Beisbola cepure',p:20,st:2},
  {id:'hat',cat:'acc',t:'hat',n:'Platmale',p:45,st:4},{id:'chain',cat:'acc',t:'necklace',n:'Zelta ķēde',p:700,st:12,lux:1},
  {id:'lsung',cat:'acc',t:'sunglasses',n:'Dizaineru brilles',p:480,st:11,lux:1}
];
const CATN={top:'Augšdaļa',bot:'Apakšdaļa',shoe:'Apavi',acc:'Aksesuārs'};
const ITEMS={
  ziedi:{n:'Ziedu pušķis',p:25,gift:[8,10]},sokolade:{n:'Šokolādes konfektes',p:12,gift:[6,4],food:15},
  smarzas:{n:'Smaržas',p:85,gift:[12,12]},rota:{n:'Zelta rotaslieta',p:420,gift:[20,25]},
  vins:{n:'Vīna pudele',p:30,gift:[8,6]},lacis:{n:'Plīša lācītis',p:20,gift:[7,8]},
  kafija:{n:'Kafija līdzņemšanai',p:4,gift:[3,0],energy:12},sviestmaize:{n:'Sviestmaize',p:5,food:30},
  energ:{n:'Enerģijas dzēriens',p:3,energy:22},gredzens:{n:'Saderināšanās gredzens',p:1500},
  pacina:{n:'Paciņa',p:0,quest:1},kakis:{n:'Pazudušais kaķis',p:0,quest:1}
};
const FURN=[
  {id:'sofa1',n:'Auduma dīvāns',slot:'sofa',p:300,cf:5,st:2,fun:2},{id:'sofa2',n:'Ādas dīvāns',slot:'sofa',p:1800,cf:12,st:8,fun:3},
  {id:'bed2',n:'Divguļamā gulta',slot:'bed',p:900,cf:10,st:3},{id:'bed3',n:'Luksusa gulta',slot:'bed',p:4200,cf:18,st:10},
  {id:'tv1',n:'Televizors',slot:'tv',p:600,cf:2,st:2,fun:6},{id:'tv2',n:'Liels plazmas TV',slot:'tv',p:2600,cf:3,st:6,fun:10},
  {id:'console',n:'Spēļu konsole',slot:'console',p:450,fun:8},{id:'stereo',n:'Mūzikas centrs',slot:'stereo',p:380,fun:5,st:2},
  {id:'plant',n:'Istabas augs',slot:'plant',p:40,cf:2,st:2},{id:'paint1',n:'Glezna',slot:'art',p:160,st:4},
  {id:'paint2',n:'Oriģināls mākslas darbs',slot:'art',p:3200,st:15},{id:'rug',n:'Paklājs',slot:'rug',p:120,cf:3,st:3},
  {id:'aqua',n:'Akvārijs',slot:'aqua',p:850,cf:6,st:8},{id:'desk',n:'Rakstāmgalds ar datoru',slot:'desk',p:1200,st:2},
  {id:'piano',n:'Klavieres',slot:'piano',p:5200,st:12,fun:4},{id:'lamp',n:'Dizaina stāvlampa',slot:'lamp',p:220,cf:2,st:4}
];
const VEH=[{id:'none',n:'Kājām',sp:1},{id:'scooter',n:'Motorollers',p:1400,sp:1.6},{id:'car',n:'Auto',p:16000,sp:2.1,rep:2},{id:'sport',n:'Sporta auto',p:95000,sp:2.6,rep:8}];
const HOMES=[
  {n:'Istaba vecāku mājā',b:'parents',rent:60,buy:0,lvl:0},{n:'Īres istaba „Bērzos”',b:'apt_berzi',rent:280,buy:0,lvl:1},
  {n:'Dzīvoklis „Centrā”',b:'apt_centrs',rent:820,buy:0,lvl:2},{n:'Privātmāja „Ozoli”',b:'house_ozoli',rent:180,buy:190000,lvl:3},
  {n:'Villa „Saulriets”',b:'villa',rent:650,buy:780000,lvl:4}
];
const SLOTS_BY_LVL=[['bed','desk','plant','art','rug','lamp'],['bed','sofa','tv','desk','plant','art','rug','lamp'],['bed','sofa','tv','console','stereo','aqua','desk','plant','art','rug','lamp'],['bed','sofa','tv','console','stereo','aqua','desk','plant','art','rug','lamp','piano'],['bed','sofa','tv','console','stereo','aqua','desk','plant','art','rug','lamp','piano']];
const DEG=[
  {id:'tiesib',n:'Tiesību zinātne',m:48,sm:55},{id:'med',n:'Medicīna',m:60,sm:65},{id:'it',n:'Datorzinātnes',m:36,sm:50},
  {id:'ekon',n:'Ekonomika',m:36,sm:45},{id:'polit',n:'Politoloģija',m:36,sm:40},{id:'zurn',n:'Žurnālistika',m:36,sm:35}
];
const JOBS=[
  {id:'barista',n:'Barista',places:['cafe','icecream'],hours:[8,18],sal:[700,850,1050],lv:['Barista','Vecākais barista','Kafejnīcas vadītājs'],tips:1},
  {id:'waiter',n:'Viesmīlis',places:['restaurant','pizza'],hours:[11,24],sal:[750,950,1250],lv:['Viesmīlis','Galvenais viesmīlis','Restorāna pārvaldnieks'],tips:1},
  {id:'bartender',n:'Bārmenis',places:['pub','beachbar','club'],hours:[17,26],sal:[800,1050,1400],lv:['Bārmenis','Galvenais bārmenis','Bāra vadītājs'],tips:1},
  {id:'seller',n:'Pārdevējs',places:['boutique','luxe','mall','super','elec','flowers','furniture'],hours:[10,20],sal:[700,950,1400],lv:['Pārdevējs','Nodaļas vadītājs','Veikala direktors']},
  {id:'stylist',n:'Frizieris',places:['salon'],hours:[9,19],sal:[750,1100,1700],lv:['Friziera palīgs','Stilists','Salona vadītājs'],req:{charm:35}},
  {id:'trainer',n:'Fitnesa treneris',places:['gym','dance'],hours:[7,21],sal:[900,1300,1900],lv:['Treneris','Personīgais treneris','Sporta zāles vadītājs'],req:{health:70}},
  {id:'model',n:'Modelis',places:['agency'],hours:[10,18],sal:[1200,2600,5200],lv:['Jaunais modelis','Modelis','Supermodelis'],req:{looks:60},perk:'rep'},
  {id:'dj',n:'DJ',places:['club','vip'],hours:[20,26],sal:[1000,2400,4800],lv:['Iesācējs DJ','Rezidents DJ','Zvaigžņu DJ'],req:{charm:45,dance:25},perk:'rep'},
  {id:'actor',n:'Aktieris',places:['media'],hours:[10,20],sal:[1500,3600,8000],lv:['Epizožu aktieris','Seriāla aktieris','Kinozvaigzne'],req:{charm:55,rep:25},perk:'rep'},
  {id:'journo',n:'Žurnālists',places:['media'],hours:[9,19],sal:[950,1600,2600],lv:['Reportieris','Redaktors','Galvenais redaktors'],req:{deg:'zurn'},perk:'rep'},
  {id:'cop',n:'Policists',places:['police'],hours:[8,20],sal:[950,1400,2100],lv:['Patruļnieks','Inspektors','Iecirkņa priekšnieks'],req:{health:50}},
  {id:'advisor',n:'Politikas padomnieks',places:['party','gov'],hours:[9,19],sal:[1200,2000,3200],lv:['Asistents','Padomnieks','Biroja vadītājs'],req:{deg:'polit'},perk:'inf'},
  {id:'analyst',n:'Finanšu analītiķis',places:['office','bank'],hours:[8,18],sal:[1400,2600,4400],lv:['Analītiķis','Portfeļa pārvaldnieks','Finanšu direktors'],req:{deg:'ekon'}},
  {id:'dev',n:'Programmētājs',places:['office'],hours:[9,19],sal:[1600,2900,4600],lv:['Jaunākais izstrādātājs','Vecākais izstrādātājs','Tehnoloģiju direktors'],req:{deg:'it'}},
  {id:'lawyer',n:'Jurists',places:['office'],hours:[9,19],sal:[1400,2700,4800],lv:['Jurista palīgs','Zvērināts advokāts','Biroja partneris'],req:{deg:'tiesib'},perk:'inf'},
  {id:'doctor',n:'Ārsts',places:['hosp'],hours:[8,20],sal:[1700,3100,5200],lv:['Rezidents','Ārsts speciālists','Nodaļas vadītājs'],req:{deg:'med'},perk:'rep'},
  {id:'croupier',n:'Krupjē',places:['casino'],hours:[18,26],sal:[900,1300,1900],lv:['Krupjē','Galda vadītājs','Zāles pārvaldnieks'],req:{smarts:40}},
  {id:'docker',n:'Ostas strādnieks',places:['port','yacht'],hours:[7,17],sal:[850,1100,1500],lv:['Krāvējs','Brigadieris','Noliktavas vadītājs'],req:{health:55}},
  {id:'librarian',n:'Bibliotekārs',places:['library','museum'],hours:[9,19],sal:[700,900,1200],lv:['Bibliotekārs','Galvenais bibliotekārs','Direktors'],req:{smarts:45}},
  {id:'receptionist',n:'Administrators',places:['hotel','realestate'],hours:[8,22],sal:[800,1000,1400],lv:['Administrators','Vecākais administrators','Vadītājs'],req:{charm:35}}
];
const TOPICS=['Mūzika','Sports','Mode','Māksla','Tehnoloģijas','Politika','Ceļojumi','Ēdiens','Kino','Dzīvnieki'];
const TOPIC_VENUE={'Mūzika':['club','pub','beachbar'],'Sports':['gym','beachbar'],'Mode':['boutique','luxe','mall','salon'],'Māksla':['museum','library'],'Tehnoloģijas':['elec','office'],'Politika':['party','gov'],'Ceļojumi':['hotel','yacht'],'Ēdiens':['restaurant','pizza','cafe'],'Kino':['cinema'],'Dzīvnieki':['street']};

const BASE_PARTIES=[
  {id:'prog',n:'Progresīvā savienība',sh:'PS',color:'#2fb7b0',ax:[-1,1]},{id:'kons',n:'Tautas konservatīvie',sh:'TK',color:'#6a86f0',ax:[1,-1]},
  {id:'zala',n:'Zaļā kustība',sh:'ZK',color:'#46b06b',ax:[-.5,.6]},{id:'nac',n:'Nacionālā alianse',sh:'NA',color:'#e8a93a',ax:[.4,-1]},
  {id:'biz',n:'Brīvā tirgus partija',sh:'BT',color:'#ff7a59',ax:[1,.5]}
];
const LAWS=[
  {id:'tax_cut',n:'Ienākuma nodokļa samazināšana',d:'Algas nodoklis 23% → 18%',fx:{econ:.4,budget:-.6},like:['kons','biz'],dis:['prog','zala'],x:'tax_up'},
  {id:'tax_up',n:'Progresīvais nodoklis turīgajiem',d:'Algām virs 3000 € nodoklis 31%',fx:{budget:.5,happy:.1,econ:-.2},like:['prog','zala'],dis:['biz','kons'],x:'tax_cut'},
  {id:'minwage',n:'Minimālās algas celšana',d:'Zemākās algas +15%',fx:{happy:.3,econ:-.1},like:['prog','nac'],dis:['biz']},
  {id:'freeuni',n:'Bezmaksas augstākā izglītība',d:'Studijas bez maksas',fx:{happy:.2,budget:-.3,econ:.1},like:['prog','zala'],dis:['biz']},
  {id:'health',n:'Veselības aprūpes reforma',d:'Ārsta vizītes 4× lētākas',fx:{happy:.3,budget:-.4},like:['prog','nac','zala'],dis:[]},
  {id:'police',n:'Policijas finansējuma palielināšana',d:'Vairāk patruļu, lielāks arestu risks',fx:{safety:.5,budget:-.3},like:['kons','nac'],dis:['prog']},
  {id:'green',n:'Zaļās enerģijas programma',d:'Vēja parki piekrastē',fx:{econ:.1,happy:.1,budget:-.3},like:['zala','prog'],dis:['nac']},
  {id:'anticor',n:'Pretkorupcijas birojs',d:'Korupcija tiek atklāta divreiz biežāk',fx:{corr:-.6,budget:-.1},like:['prog','zala','nac'],dis:[]},
  {id:'inherit',n:'Mantojuma nodoklis 30%',d:'Mantinieki saņem mazāk (parasti 5%)',fx:{budget:.3},like:['prog'],dis:['kons','biz','nac']},
  {id:'dereg',n:'Biznesa birokrātijas mazināšana',d:'Uzņēmumi aug ātrāk',fx:{econ:.5,corr:.2},like:['biz','kons'],dis:['zala']},
  {id:'border',n:'Stingrāka robežkontrole',d:'Drošība pret ekonomiku',fx:{safety:.2,econ:-.1},like:['nac','kons'],dis:['prog']},
  {id:'casino',n:'Kazino legalizācija',d:'Kazino „Fortūna” drīkst darboties',fx:{econ:.3,safety:-.2,budget:.2,corr:.2},like:['biz'],dis:['kons','zala']}
];
const PROJECTS=[
  {id:'prom',n:'Jūrmalas promenāde',d:'Pastaigu taka gar jūru',fx:{happy:3},rep:4},{id:'tram',n:'Jauna tramvaja līnija',d:'No ostas līdz universitātei',fx:{econ:2,happy:2},rep:5},
  {id:'patrol',n:'Nakts patruļas',d:'Drošākas ielas',fx:{safety:4},rep:3},{id:'fest',n:'Ostmalas vasaras festivāls',d:'Koncerti pludmalē',fx:{happy:4},rep:3}
];
const OFFICES={
  deputats:{n:'Domes deputāts',sal:1200,pts:5,lvl:'pasv'},mers:{n:'Ostmalas mērs',sal:3600,pts:12,lvl:'pasv'},
  saeima:{n:'Saeimas deputāts',sal:2900,pts:15,lvl:'saeima'},ministrs:{n:'Ministrs',sal:4200,pts:25,lvl:'saeima'},
  premjers:{n:'Ministru prezidents',sal:5600,pts:40,lvl:'saeima'},prezidents:{n:'Valsts prezidents',sal:6200,pts:50,lvl:'prez'}
};
const MINISTRIES=['Finanšu','Iekšlietu','Veselības','Izglītības','Ekonomikas','Ārlietu'];
const RANKS=['Biedrs','Aktīvists','Valdes loceklis','Partijas priekšsēdētājs'];
const CLASSES={
  nab:{n:'Trūcīga ģimene',d:'Maz naudas, bet tu esi izturīgs',money:300,bonus:{health:6,charm:2}},
  vid:{n:'Vidusšķiras ģimene',d:'Stabils sākums',money:2000,bonus:{smarts:3}},
  tur:{n:'Turīga ģimene',d:'Nauda un sakari',money:12000,bonus:{looks:3,inf:4}},
  eli:{n:'Elites dzimta',d:'Liela nauda, ietekme un dzīvoklis centrā',money:50000,bonus:{inf:10,rep:8}}
};
const GNOMES=20;
const TROPHIES=[
  {id:'friend',n:'Pirmais draugs',d:'Iegūsti draugu',t:()=>S.people.some(p=>p.alive&&['friend','partner','spouse'].includes(p.rel))},
  {id:'friends5',n:'Populārs',d:'5 draugi',t:()=>S.people.filter(p=>p.alive&&['friend','partner','spouse'].includes(p.rel)).length>=5},
  {id:'best',n:'Labākais draugs',d:'Draudzība 80+',t:()=>S.people.some(p=>p.alive&&p.close>=80&&!['parent','sibling','child'].includes(p.rel))},
  {id:'kiss',n:'Pirmais skūpsts',d:'Noskūpsti kādu',t:()=>C().flags.kiss},
  {id:'partner',n:'Iemīlējies',d:'Sāc attiecības',t:()=>C().flags.partner},
  {id:'married',n:'Kāzu zvani',d:'Apprecies',t:()=>C().flags.married},
  {id:'child',n:'Ģimenes cilvēks',d:'Tev ir bērns',t:()=>S.people.some(p=>p.rel==='child')},
  {id:'gnome5',n:'Rūķu meklētājs',d:'Atrodi 5 rūķīšus',t:()=>S.gnomes.length>=5},
  {id:'gnomes',n:'Visi rūķīši',d:`Atrodi visus ${GNOMES} rūķīšus`,t:()=>S.gnomes.length>=GNOMES},
  {id:'promo',n:'Karjeras kāpnes',d:'Sasniedz augstāko amata līmeni',t:()=>C().job&&C().job.lvl>=2},
  {id:'dancer',n:'Deju grīdas karalis',d:'Dejo ar 90%+ precizitāti',t:()=>C().flags.dance90},
  {id:'vip',n:'VIP',d:'Tiec VIP klubā „Zelts”',t:()=>C().flags.vip},
  {id:'fame50',n:'Slavenība',d:'Slava 50+',t:()=>C().rep>=50},
  {id:'style40',n:'Stila ikona',d:'Stils 40+',t:()=>styleScore()>=40},
  {id:'rich',n:'Turīgs',d:'100 000 € kontā',t:()=>C().money>=100000},
  {id:'million',n:'Miljonārs',d:'1 000 000 € kontā',t:()=>C().money>=1000000},
  {id:'car',n:'Pie stūres',d:'Nopērc auto',t:()=>['car','sport'].includes(C().veh)},
  {id:'villa',n:'Dzīve pie jūras',d:'Nopērc villu',t:()=>C().home===4},
  {id:'degree',n:'Diploms',d:'Pabeidz universitāti',t:()=>C().degrees.length>0},
  {id:'quests5',n:'Palīgs',d:'Izpildi 5 uzdevumus',t:()=>(C().flags.quests||0)>=5},
  {id:'mayor',n:'Pilsētas tēvs',d:'Kļūsti par mēru',t:()=>C().offices.includes('mers')},
  {id:'pm',n:'Valsts vadītājs',d:'Kļūsti par Ministru prezidentu',t:()=>C().offices.includes('premjers')},
  {id:'pres',n:'Prezidents',d:'Kļūsti par Valsts prezidentu',t:()=>C().offices.includes('prezidents')}
];
