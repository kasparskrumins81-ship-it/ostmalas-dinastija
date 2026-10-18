/* ===================== Manhetenas ielu ekrāni (Miami Nights stilā) ===================== */
const T={GRASS:0,ROAD:1,WALK:2,WATER:3,LOT:4,PLAZA:5,BLD:6,PROM:7,PIER:8,PARK:9,PATH:10,TSQ:11};
const DISTS={cp:{n:'Centrālparks',c:'#46b06b'},fa:{n:'Piektā avēnija',c:'#d8b45a'},ts:{n:'Taimskvērs',c:'#ff4fa3'},gv:{n:'Grīnvičvilidža',c:'#ff8a5c'},ct:{n:'Čainataun',c:'#e2303a'},ws:{n:'Volstrīta',c:'#3f7fd8'}};
const BT={
  museum:{style:'classic',hours:[12,20],wall:'#efe7d6',acc:'#9b2335'},apt5:{style:'deco',hours:[0,30],wall:'#e9dcc5',acc:'#7a5a36'},hotel:{style:'deco',hours:[0,30],wall:'#f1e8d6',acc:'#c9a227'},
  opera:{style:'classic',hours:[12,24],wall:'#f2ede2',acc:'#9b2335'},boutique:{style:'shop',hours:[12,21],wall:'#f7e6d8',acc:'#2b2f3a'},salon:{style:'shop',hours:[12,20],wall:'#e3f4f7',acc:'#ff4fa3'},
  empire:{style:'empire',hours:[12,26],wall:'#d9d3c7',acc:'#c9a227'},dept:{style:'deco',hours:[12,21],wall:'#ead9c2',acc:'#9b2335'},luxe:{style:'deco',hours:[12,20],wall:'#2a2632',acc:'#d8b45a'},
  theater:{style:'bill',hours:[12,24],wall:'#5a2a3a',acc:'#ffc857',neon:'BRODVEJA'},club:{style:'bill',hours:[21,28],wall:'#2b1f45',acc:'#ff4fa3',neon:'SUPERNOVA'},arcade:{style:'bill',hours:[12,28],wall:'#2a2f4a',acc:'#2fe0d0'},
  pizza:{style:'shop',hours:[12,27],wall:'#f8e2c8',acc:'#d64933'},cinema:{style:'bill',hours:[12,26],wall:'#3a2a4a',acc:'#e03c6b',neon:'KINO'},
  apt_home:{style:'brown',hours:[0,30],wall:'#9c5a44',acc:'#2e5e3a'},deli:{style:'shop',hours:[0,30],wall:'#e8f2df',acc:'#46b06b'},cafe:{style:'shop',hours:[12,22],wall:'#f3e1a6',acc:'#c0643a'},
  flowers:{style:'shop',hours:[12,20],wall:'#eaf5e3',acc:'#e85d9b'},pub:{style:'brown',hours:[12,28],wall:'#7a4436',acc:'#2e5e3a'},comedy:{style:'brown',hours:[18,27],wall:'#8a4b3a',acc:'#ffc857',neon:'KOMĒDIJA'},
  gallery:{style:'shop',hours:[12,20],wall:'#f4f1ea',acc:'#2b2f3a'},records:{style:'shop',hours:[12,22],wall:'#d8cbe8',acc:'#9b5bd6'},gym:{style:'shop',hours:[12,24],wall:'#dff1ea',acc:'#2fbf8f'},
  apt_loft:{style:'brick',hours:[0,30],wall:'#a0523d',acc:'#3b3f4c'},jazz:{style:'brown',hours:[19,28],wall:'#6a3a30',acc:'#3f7fd8',neon:'DŽEZS'},apt:{style:'brown',hours:[0,30]},
  police:{style:'classic',hours:[0,30],wall:'#c9d6f2',acc:'#2b3a67'},
  dimsum:{style:'china',hours:[12,24],wall:'#c43b2f',acc:'#ffc857'},market:{style:'china',hours:[12,21],wall:'#d4553a',acc:'#2e8b57'},kungfu:{style:'china',hours:[12,22],wall:'#b8352c',acc:'#ffc857'},
  massage:{style:'china',hours:[12,24],wall:'#d9a441',acc:'#c43b2f'},karaoke:{style:'china',hours:[19,28],wall:'#8a2b4a',acc:'#ff4fa3',neon:'KARAOKE'},apt_ct:{style:'china',hours:[0,30],wall:'#c7754a',acc:'#2e8b57'},
  teahouse:{style:'china',hours:[12,21],wall:'#2e8b57',acc:'#ffc857'},pawn:{style:'shop',hours:[12,20],wall:'#b9a98f',acc:'#5a3a26'},
  bank:{style:'classic',hours:[12,18],wall:'#e7e1d3',acc:'#2a9d8f'},nyse:{style:'classic',hours:[12,18],wall:'#efe9dc',acc:'#2b3a67'},office:{style:'glass',hours:[12,22],wall:'#6e9cc4',acc:'#24364f'},
  realty:{style:'shop',hours:[12,19],wall:'#d8e8f0',acc:'#2b6cb0'},diner:{style:'shop',hours:[0,30],wall:'#e9eef0',acc:'#d64933'},apt_pent:{style:'glass',hours:[0,30],wall:'#5b7fa8',acc:'#d8b45a'},
  seaport:{style:'hut',hours:[12,25],wall:'#e6f1f7',acc:'#2b6cb0'},boathouse:{style:'hut',hours:[12,21],wall:'#e9dcc2',acc:'#2e5e3a'}
};
const APTWALL=['#9c5a44','#8a4b3a','#a8654a','#7a4436','#b0705a','#94523e'];
// [id, tips, nosaukums, fasādes augstums]
const BLD_LIST=[
  ['boathouse','boathouse','Laivu māja',70],['met','museum','Metropolitēna muzejs',150],['apt_fa','apt5','Piektās avēnijas nams',220],['plaza','hotel','Viesnīca „Plaza”',220],['lincoln','opera','Linkolna centrs',150],
  ['boutique','boutique','Butiks „Avēnija”',130],['salon','salon','Stila salons',110],['empire','empire','Empīra Steita ēka',330],['dept','dept','Universālveikals „Mega”',170],['luxe','luxe','Juvelieri „Dimants”',130],
  ['theater','theater','Brodvejas teātris',190],['club','club','Naktsklubs „Supernova”',200],['arcade','arcade','Spēļu zāle „Pikselis”',220],['pizza','pizza','Picērija „Rejs”',110],['cinema','cinema','Kinoteātris „Ekrāns”',180],
  ['home','apt_home','Blīkera iela 14',150],['deli','deli','Bodega „Uz stūra”',100],['cafe','cafe','Kafejnīca „Kafija & Co”',110],['flowers','flowers','Ziedi un dāvanas',100],['pub','pub','Bārs „Vecā pīpe”',130],['comedy','comedy','Komēdijas pagrabs',140],
  ['gallery','gallery','Galerija „Bohēma”',120],['records','records','Mūzikas veikals „Vinils”',110],['gym','gym','Sporta klubs „Titāns”',140],['loft','apt_loft','Lofts Hjūstonas ielā',190],['jazz','jazz','Džeza klubs „Zilā nots”',130],['apt_gv2','apt','Brūnakmens nams',150],
  ['police','police','6. policijas iecirknis',140],['apt_gv3','apt','Mortona ielas nams',160],
  ['dimsum','dimsum','Restorāns „Zelta pūķis”',120],['market','market','Ķīniešu tirgus',100],['kungfu','kungfu','Kung-fu skola „Tīģeris”',130],['massage','massage','Masāžas salons „Lotoss”',110],['karaoke','karaoke','Karaoke bārs „Mēness”',120],['apt_ct','apt_ct','Čainataunas studija',170],
  ['teahouse','teahouse','Tējnīca „Nefrīts”',100],['pawn','pawn','Lombards',110],
  ['bank','bank','Manhetenas banka',190],['nyse','nyse','Ņujorkas birža',180],['office','office','Volstrīta 1',240],['realty','realty','Nekustamie īpašumi',110],['diner','diner','Ēstuve „Vērsis”',100],['tower2','office','Finanšu tornis',230],
  ['penthouse','apt_pent','Volstrītas penthauss',240],['seaport','seaport','Restorāns „Pīrs 17”',90],['apt_ws','apt','Ūdensmalas nams',190]
];
// ainas: W×H staigājams laukums; back = fasādes pie aizmugures sienas (pa x), left = pie kreisās sienas (pa y); null = koki / margas
const SW=12,SH=7;
const SCENES={
  gv1:{n:'Blīkera iela',d:'gv',floor:'walkB',back:[['home',3],['deli',3],['cafe',3],['flowers',3]],left:[['pub',3],['comedy',2],['apt_gv3',2]],exits:['gv2','ct'],station:'Kristofera iela',mx:24,my:70,
    decor:[['tree',3,6],['tree',8,6],['lamp',1,6],['lamp',6,6],['hydrant',5,6],['bench',5,4],['news',8,3],['subway',2,4],['taxi',10,6]]},
  gv2:{n:'Makdugala iela',d:'gv',floor:'walkB',back:[['gallery',3],['records',2],['gym',4],['loft',3]],left:[['jazz',3],['apt_gv2',2],['police',2]],exits:['ts','gv1'],mx:32,my:60,
    decor:[['tree',2,6],['tree',6,6],['tree',9,6],['bench',4,4],['hydrant',7,3],['lamp',4,6],['lamp',11,6]]},
  ts:{n:'Taimskvērs',d:'ts',floor:'tsq',back:[['theater',4],['club',4],['arcade',4]],left:[['cinema',4],['pizza',3]],exits:['fa1','gv2'],station:'Taimskvērs – 42. iela',mx:42,my:46,
    decor:[['steps',5,3],['steps',6,3],['steps',5,4],['steps',6,4],['cart',9,4],['news',2,5],['subway',2,2],['lamp',1,6],['lamp',8,6],['taxi',10,6]]},
  fa1:{n:'Piektā avēnija',d:'fa',floor:'walkF',back:[['boutique',3],['salon',2],['dept',4],['luxe',3]],left:[['empire',7]],exits:['fa2','ts'],mx:58,my:40,
    decor:[['tree',3,6],['tree',6,6],['tree',9,6],['news',9,3],['bench',5,4],['lamp',1,6],['lamp',11,6]]},
  fa2:{n:'Centrālparka dienvidmala',d:'fa',floor:'walkF',back:[['plaza',5],['met',4],['lincoln',3]],left:[['apt_fa',4],[null,3]],exits:['cp','fa1'],station:'5. avēnija – 59. iela',mx:52,my:28,
    decor:[['fountain',5,4],['carriage',8,5],['bench',2,5],['subway',2,2],['lamp',1,6],['lamp',11,6],['taxi',10,6]]},
  cp:{n:'Centrālparks',d:'cp',floor:'park',park:1,back:[['boathouse',3],[null,9]],left:[[null,7]],exits:['fa2'],mx:40,my:12,water:[[7,0,5,3]],paths:[[0,4,12,1],[4,0,1,7]],
    decor:[['fountain',4,4],['bench',1,3],['bench',6,5],['bench',9,5],['chess',1,6],['chess',2,6],['cart',6,3],['carousel',9,3],['jog',11,4],['picnic',7,6],['tree',0,0],['tree',2,1],['tree',10,6],['rowboat',9,1],['rowboat',10.5,.8]],samSpot:[2,3]},
  ct:{n:'Kanāla iela',d:'ct',floor:'walkC',back:[['dimsum',3],['market',2],['kungfu',3],['massage',2],['teahouse',2]],left:[['karaoke',3],['apt_ct',2],['pawn',2]],exits:['gv1','ws1'],station:'Kanāla iela',mx:56,my:72,lanterns:1,
    decor:[['news',3,5],['subway',2,3],['hydrant',6,6],['cart',8,4],['lamp',1,6],['lamp',10,6]]},
  ws1:{n:'Volstrīta',d:'ws',floor:'walk',back:[['nyse',4],['bank',4],['office',4]],left:[['realty',2],['tower2',2],['diner',3]],exits:['ct','ws2'],station:'Volstrīta',mx:62,my:84,
    decor:[['bull',6,4],['news',9,3],['subway',2,3],['lamp',1,6],['lamp',5,6],['lamp',10,6],['taxi',8,6]]},
  ws2:{n:'Dienvidu ostas krastmala',d:'ws',floor:'prom',front:'water',back:[['seaport',4],['penthouse',4],['apt_ws',4]],left:[[null,7]],exits:['ws1'],mx:74,my:90,
    decor:[['bench',3,4],['bench',8,4],['cart',6,2],['lamp',1,6],['lamp',5,6],['lamp',9,6]]}
};
const ZONE_SCENES={gv:['gv1','gv2'],ts:['ts'],fa:['fa1','fa2'],cp:['cp'],ct:['ct'],ws:['ws1','ws2']};
const BLDS=[],SCENE_OF={};
BLD_LIST.forEach(([id,type,n,h],k)=>{const meta=BT[type];BLDS.push({id,type,n,h,style:meta.style,hours:meta.hours,wall:meta.wall||APTWALL[k%APTWALL.length],acc:meta.acc||pick(['#2e5e3a','#3b3f4c','#7a2b2b','#2b3a67']),roof:meta.roof,neon:meta.neon,seed:k*13+7,dist:'gv'})});
function bld(id){return BLDS.find(b=>b.id===id)}
const inB=(x,y)=>x>=0&&y>=0&&x<SW&&y<SH;
// ainas karte
function buildScene(id){const sc=SCENES[id];if(sc._m)return sc._m;
  const m={kind:'scene',id,sc,W:SW,H:SH,doors:[],objs:[],exits:[],tiles:new Array(SW*SH).fill(sc.floor),block:new Uint8Array(SW*SH)};
  let u=0;sc.back.forEach(([bid,w])=>{if(bid){const b=bld(bid);b.dist=sc.d;SCENE_OF[bid]=id;const dx=u+Math.floor(w/2);m.doors.push({b,ax:'y',u0:u,len:w,tile:[dx,0],doorU:dx-u+.5})}else m.doors.push({b:null,ax:'y',u0:u,len:w});u+=w});
  let v=0;sc.left.forEach(([bid,w])=>{if(bid){const b=bld(bid);b.dist=sc.d;SCENE_OF[bid]=id;const dy=v+Math.floor(w/2);m.doors.push({b,ax:'x',u0:v,len:w,tile:[0,dy],doorU:dy-v+.5})}else m.doors.push({b:null,ax:'x',u0:v,len:w});v+=w});
  (sc.paths||[]).forEach(([x0,y0,w,h])=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(inB(x,y))m.tiles[y*SW+x]='path'});
  (sc.water||[]).forEach(([x0,y0,w,h])=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(inB(x,y)){m.tiles[y*SW+x]='lake';m.block[y*SW+x]=1}});
  sc.decor.forEach(([k,x,y])=>{const o={k,x,y,act:{bench:'bench',cart:'cart',news:'news',subway:'subway',taxi:'taxi',fountain:'fountain',carriage:'carriage',chess:'chess',carousel:'carousel',jog:'jog',picnic:'picnic',bull:'bull',steps:'steps'}[k],kind:k==='cart'?'hotdog':k==='tree'?'round':undefined,s:k==='tree'?.95:undefined,n:sc.station,d:sc.d,c:k==='rowboat'?pick(['#c0643a','#3f7fd8']):undefined};
    if(k==='rowboat'){m.deco=m.deco||[];m.deco.push(o);return}
    m.objs.push(o);if(!['lamp','hydrant','picnic','taxi'].includes(k)&&Number.isInteger(x)&&inB(x,y))m.block[y*SW+x]=1});
  sc.exits.forEach((to,i)=>{const y=sc.exits.length===1?3:i===0?2:5;m.exits.push({to,x:SW-1,y});});
  m.walk=(x,y)=>inB(x,y)&&!m.block[y*SW+x];
  m.objs.sort((a,b)=>(a.x+a.y)-(b.x+b.y));
  return sc._m=m}
Object.keys(SCENES).forEach(buildScene);
function bfs(m,sx,sy,tx,ty,maxN=4600){
  const Wm=m.W,Hm=m.H,ok=(x,y)=>m.walk(x,y);
  if(!ok(tx,ty))return null;if(sx===tx&&sy===ty)return [];
  const prev=new Int32Array(Wm*Hm).fill(-1),s=sy*Wm+sx,q=[s];prev[s]=s;let h=0;const tgt=ty*Wm+tx;
  while(h<q.length&&h<maxN){const cur=q[h++];if(cur===tgt)break;const cx=cur%Wm,cy=(cur/Wm)|0;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=Wm||ny>=Hm)continue;const ni=ny*Wm+nx;if(prev[ni]<0&&ok(nx,ny)){prev[ni]=cur;q.push(ni)}}}
  if(prev[tgt]<0)return null;
  const path=[];let cur=tgt;while(cur!==s){path.push([cur%Wm,(cur/Wm)|0]);cur=prev[cur]}return path.reverse();
}

/* ===================== Interjeri ===================== */
function F(k,x,y,w=1,d=1,o={}){return Object.assign({k,x,y,w,d},o)}
const TPL={
  cafe:()=>({W:7,H:6,floor:'wood',wall:'#f3e3c4',f:[F('counter',1,1,3,1,{act:'cafe',staff:1}),F('table',4,3,1,1,{act:'cafeTable'}),F('table',1,4,1,1,{act:'cafeTable'}),F('table',5,1,1,1,{act:'cafeTable'}),F('toilet',6,4,1,1,{act:'wc'}),F('plant',0,2)],
    w:[['b',1.6,'board',{t:'KAFIJA'}],['l',1.5,'window'],['l',3.6,'window'],['b',5.2,'painting']]}),
  deli:()=>({W:7,H:5,floor:'tile',wall:'#eef1ee',f:[F('shelf',1,1,3,1,{act:'grocery'}),F('shelf',1,3,2,1,{act:'grocery'}),F('fridgeD',6,1,1,2,{act:'grocery'}),F('counter',4,3,2,1,{act:'deli',staff:1})],w:[['b',2.5,'board',{t:'BODEGA'}],['l',2,'window']]}),
  pizza:()=>({W:7,H:6,floor:'checker',wall:'#f8e2c8',f:[F('counter',1,1,3,1,{act:'pizza',staff:1}),F('oven',4,0,1,1),F('table4',4,3,1,1,{act:'pizzaTable'}),F('table4',1,4,1,1,{act:'pizzaTable'}),F('table4',5,4,1,1,{act:'pizzaTable'}),F('toilet',6,1,1,1,{act:'wc'})],w:[['b',1.6,'board',{t:'PICA'}],['l',3,'window']]}),
  diner:()=>({W:7,H:6,floor:'checker',wall:'#e9eef0',f:[F('counter',1,1,4,1,{act:'diner',staff:1}),F('table4',1,3,1,1,{act:'dinerTable'}),F('table4',5,3,1,1,{act:'dinerTable'}),F('toilet',6,1,1,1,{act:'wc'}),F('plant',0,1)],w:[['b',3,'neon',{t:'ĒSTUVE',c:'#ff4f4f'}],['l',3,'window']]}),
  dimsum:()=>({W:8,H:7,floor:'red',wall:'#7a1d2a',f:[F('counter',1,1,2,1,{act:'dimsum',staff:1}),F('table4',4,2,1,1,{act:'dimsumTable'}),F('table4',6,2,1,1,{act:'dimsumTable'}),F('table4',4,4,1,1,{act:'dimsumTable'}),F('table4',6,4,1,1,{act:'dimsumTable'}),F('table4',1,5,1,1,{act:'dimsumTable'}),F('plant',7,6),F('toilet',0,3,1,1,{act:'wc'})],
    w:[['b',2.5,'lantern'],['b',5.5,'lantern'],['b',4,'neon',{t:'PŪĶIS',c:'#ffd36b'}],['l',3,'lantern']]}),
  seaport:()=>({W:8,H:7,floor:'deck',wall:'#e6f1f7',f:[F('counter',1,1,2,1,{act:'seaportBar',staff:1}),F('table4',4,2,1,1,{act:'seaportTable'}),F('table4',6,2,1,1,{act:'seaportTable'}),F('table4',4,4,1,1,{act:'seaportTable'}),F('table4',6,4,1,1,{act:'seaportTable'}),F('toilet',0,4,1,1,{act:'wc'}),F('plant',7,6)],w:[['b',4.6,'painting'],['l',2.5,'window'],['l',4.8,'window'],['b',6.6,'window']]}),
  pub:()=>({W:8,H:7,floor:'wood',wall:'#9c7a58',f:[F('bar',1,1,4,1,{act:'pub',staff:1}),F('pool',5,4,2,1,{act:'pool'}),F('table',6,1,1,1,{act:'pubTable'}),F('table',2,4,1,1,{act:'pubTable'}),F('toilet',7,3,1,1,{act:'wc'})],w:[['b',2.2,'bottles'],['b',6,'neon',{t:'PĪPE',c:'#7bff9e'}],['l',2.5,'darts',{act:1}],['l',4.6,'window']]}),
  comedy:()=>({W:8,H:7,floor:'carpet',wall:'#3a2a3a',dark:1,f:[F('stage',3,0,3,2,{act:'comedyStage'}),F('table',2,3,1,1,{act:'comedyTable'}),F('table',5,3,1,1,{act:'comedyTable'}),F('table',1,5,1,1,{act:'comedyTable'}),F('table',6,5,1,1,{act:'comedyTable'}),F('bar',7,1,1,2,{act:'bar',staff:1,c:'#3a2e18'})],w:[['b',4.5,'neon',{t:'HA HA',c:'#ffd36b'}],['l',3,'poster',{t:'STAND-UP'}]]}),
  gallery:()=>({W:8,H:6,floor:'marble',wall:'#fbfaf6',f:[F('pedestal',2,2,1,1,{act:'gallery'}),F('pedestal',5,2,1,1,{act:'gallery'}),F('pedestal',3,4,1,1,{act:'gallery'}),F('desk',6,4,2,1,{act:'galleryDesk',staff:1})],w:[['b',1.5,'painting',{big:1}],['b',3.5,'painting'],['b',5.8,'painting',{big:1}],['l',2,'painting'],['l',4.2,'painting']]}),
  records:()=>({W:6,H:5,floor:'wood',wall:'#d8cbe8',f:[F('shelf',1,1,3,1,{act:'records'}),F('shelf',0,3,2,1,{act:'records'}),F('counter',4,3,2,1,{act:'recordsDesk',staff:1}),F('stereo',5,1,1,1,{act:'listen'})],w:[['b',2.5,'poster',{t:'VINILS'}],['l',2,'poster',{t:'ROKS'}]]}),
  gym:()=>({W:9,H:7,floor:'rubber',wall:'#e4ecea',f:[F('treadmill',1,1,1,2,{act:'treadmill'}),F('treadmill',3,1,1,2,{act:'treadmill'}),F('weights',5,1,2,1,{act:'weights'}),F('weights',5,3,2,1,{act:'weights'}),F('mat',1,4,2,2,{act:'yoga',walk:1}),F('shower',8,1,1,1,{act:'shower'}),F('counter',7,5,2,1,{act:'gymDesk',staff:1})],w:[['b',5,'mirrorw'],['l',3,'poster',{t:'TITĀNS'}]]}),
  kungfu:()=>({W:8,H:6,floor:'wood',wall:'#f1e2c6',f:[F('mat',1,2,3,2,{act:'kungfu',walk:1}),F('dummy',5,1,1,1,{act:'kungfu'}),F('dummy',6,2,1,1,{act:'kungfu'}),F('counter',5,4,2,1,{act:'kfDesk',staff:1}),F('plant',0,1)],w:[['b',2.5,'poster',{t:'KUNG-FU'}],['b',5,'lantern'],['l',3,'lantern']]}),
  massage:()=>({W:7,H:5,floor:'tile',wall:'#f4ead8',f:[F('massagebed',1,1,2,1,{act:'massage'}),F('massagebed',4,1,2,1,{act:'massage'}),F('counter',4,3,2,1,{act:'massageDesk',staff:1}),F('plant',0,3)],w:[['b',3.5,'lantern'],['l',2,'painting']]}),
  karaoke:()=>({W:8,H:7,floor:'dark',wall:'#2a1630',dark:1,f:[F('stage',1,1,2,2,{act:'karaoke'}),F('sofa',5,1,2,1,{c:'#a83a6a'}),F('sofa',5,4,2,1,{c:'#a83a6a'}),F('bar',0,4,1,2,{act:'bar',staff:1,c:'#2c2340'}),F('table',4,2,1,1,{act:'bar'}),F('speaker',3,1)],w:[['b',4.5,'neon',{t:'♪ KARAOKE',c:'#ff4fa3'}],['b',2,'screen']]}),
  teahouse:()=>({W:6,H:5,floor:'wood',wall:'#e8f0e0',f:[F('counter',3,1,2,1,{act:'teaDesk',staff:1}),F('table4',1,3,1,1,{act:'tea'}),F('table4',4,3,1,1,{act:'tea'}),F('plant',0,1)],w:[['b',1.5,'lantern'],['l',2.5,'painting']]}),
  market:()=>({W:8,H:6,floor:'concrete',wall:'#b9a98f',f:[F('stall',1,1,2,1,{act:'market',staff:1}),F('stall',4,1,2,1,{act:'marketFruit',staff:1,c:'#46b06b'}),F('stall',1,3,2,1,{act:'market'}),F('stall',5,3,2,1,{act:'marketFruit'})],w:[['b',3,'lantern'],['b',6,'lantern'],['l',3,'lantern']]}),
  pawn:()=>({W:6,H:5,floor:'tile',wall:'#cfc5b3',f:[F('counter',1,1,3,1,{act:'pawn',staff:1}),F('shelf',0,3,2,1,{act:'pawn'}),F('pedestal',4,3,1,1)],w:[['b',2.5,'board',{t:'LOMBARDS'}]]}),
  bank:()=>({W:8,H:6,floor:'marble',wall:'#efe9dc',f:[F('teller',1,1,4,1,{act:'bank',staff:1}),F('atmI',7,1,1,1,{act:'bank'}),F('sofa',1,4,2,1),F('plant',6,4)],w:[['b',3,'board',{t:'BANKA'}],['l',3,'painting']]}),
  nyse:()=>({W:10,H:8,floor:'marble',wall:'#e9e3d6',f:[F('tradedesk',1,3,2,1,{act:'nyse'}),F('tradedesk',4,3,2,1,{act:'nyse'}),F('tradedesk',7,3,2,1,{act:'nyse'}),F('tradedesk',1,5,2,1,{act:'nyse'}),F('tradedesk',7,5,2,1,{act:'nyse'}),F('counter',7,0,2,1,{act:'nyseInfo',staff:1}),F('flagpole',0,1)],w:[['b',3.5,'ticker'],['l',3,'ticker'],['l',5.5,'window']]}),
  office:()=>({W:9,H:7,floor:'carpet',wall:'#e9eef3',f:[F('desk',1,1,2,1,{act:'officeDesk'}),F('desk',4,1,2,1,{act:'officeDesk'}),F('desk',1,4,2,1,{act:'officeDesk'}),F('desk',4,4,2,1,{act:'officeDesk'}),F('counter',7,3,2,1,{act:'officeJobs',staff:1}),F('plant',8,1),F('cooler',7,6),F('toilet',8,5,1,1,{act:'wc'})],w:[['l',2,'window'],['l',5,'window'],['b',7.5,'board',{t:'BIZNESS'}]]}),
  realty:()=>({W:6,H:5,floor:'carpet',wall:'#e6eef2',f:[F('desk',1,1,2,1,{act:'realestate',staff:1}),F('sofa',1,3,2,1),F('plant',5,4)],w:[['b',1.5,'housepic'],['b',3.5,'housepic'],['l',2.5,'housepic']]}),
  hotel:()=>({W:9,H:7,floor:'marble',wall:'#f3ead8',f:[F('counter',1,1,3,1,{act:'hotel',staff:1}),F('sofa',5,2,2,1,{act:'hotelTea'}),F('sofa',5,5,2,1,{act:'hotelTea'}),F('bar',8,2,1,3,{act:'plazaBar',staff:1}),F('piano',1,4,2,1,{act:'piano'}),F('plant',4,1),F('plant',8,6),F('toilet',0,6,1,1,{act:'wc'})],w:[['b',2.5,'board',{t:'PLAZA'}],['l',2,'window'],['l',4.5,'window']]}),
  opera:()=>({W:10,H:8,floor:'carpet',wall:'#3a1d2a',dark:1,f:[F('stage',2,0,6,2,{act:'opera'}),F('seats',1,3,8,1,{act:'opera',c:'#9e2a2b'}),F('seats',1,5,8,1,{act:'opera',c:'#9e2a2b'}),F('counter',7,6,2,1,{act:'snacks',staff:1})],w:[['b',5,'curtain'],['l',3,'painting']]}),
  theater:()=>({W:10,H:8,floor:'carpet',wall:'#4a1d2a',dark:1,f:[F('stage',2,0,6,2,{act:'play'}),F('seats',1,3,8,1,{act:'play'}),F('seats',1,5,8,1,{act:'play'}),F('counter',7,6,2,1,{act:'snacks',staff:1}),F('toilet',0,6,1,1,{act:'wc'})],w:[['b',5,'curtain'],['l',3,'poster',{t:'IZRĀDE'}]]}),
  cinema:()=>({W:9,H:8,floor:'carpet',wall:'#3a2232',dark:1,f:[F('seats',1,3,6,1,{act:'movie'}),F('seats',1,5,6,1,{act:'movie'}),F('counter',7,6,2,1,{act:'snacks',staff:1}),F('toilet',8,3,1,1,{act:'wc'})],w:[['b',3.5,'bigscreen']]}),
  club:()=>({W:10,H:8,floor:'dark',wall:'#1e1630',dark:1,f:[F('dance',3,3,4,3,{act:'dance',walk:1}),F('dj',4,1,2,1,{act:'dj',staff:1}),F('bar',0,3,1,4,{act:'bar',staff:1,c:'#2c2340'}),F('sofa',8,1,2,1,{c:'#7a2b5a'}),F('counter',8,4,2,1,{act:'clubDesk',staff:1,c:'#2c2340'}),F('speaker',2,1),F('speaker',7,1),F('toilet',9,7,1,1,{act:'wc'})],w:[['b',4.4,'neon',{t:'SUPERNOVA',c:'#ff4fa3'}],['l',4.5,'neon',{t:'♪',c:'#2fe0d0'}]]}),
  arcade:()=>({W:8,H:6,floor:'dark',wall:'#1d2240',dark:1,f:[F('arcadem',1,1,1,1,{act:'arcade'}),F('arcadem',2,1,1,1,{act:'arcade'}),F('arcadem',3,1,1,1,{act:'arcade'}),F('arcadem',5,1,1,1,{act:'arcade'}),F('arcadem',6,1,1,1,{act:'arcade'}),F('pool',1,3,2,1,{act:'pool'}),F('counter',5,4,2,1,{act:'arcadeDesk',staff:1,c:'#2c2340'})],w:[['b',4,'neon',{t:'PIKSELIS',c:'#2fe0d0'}],['l',3,'neon',{t:'1UP',c:'#ffd36b'}]]}),
  empire:()=>({W:9,H:7,floor:'marble',wall:'#d9d3c7',f:[F('telescope',1,2,1,1,{act:'view'}),F('telescope',4,1,1,1,{act:'view'}),F('telescope',7,2,1,1,{act:'view'}),F('counter',6,5,2,1,{act:'empireShop',staff:1}),F('plant',0,5)],w:[['b',1.5,'skyline'],['b',4,'skyline'],['b',6.5,'skyline'],['l',2,'skyline'],['l',4.6,'skyline']]}),
  boathouse:()=>({W:7,H:5,floor:'deck',wall:'#e9dcc2',f:[F('counter',1,1,3,1,{act:'boathouse',staff:1}),F('table',5,1,1,1,{act:'cafeTable'}),F('table',1,3,1,1,{act:'cafeTable'}),F('boatmodel',5,3,1,1)],w:[['l',2,'window'],['l',3.6,'window'],['b',5,'window']]}),
  boutique:()=>({W:7,H:6,floor:'marble',wall:'#fbe4ec',f:[F('rack',1,1,2,1,{act:'clothes'}),F('rack',4,1,2,1,{act:'clothes'}),F('rack',1,3,1,2,{act:'clothes'}),F('mirror',6,2,1,1,{act:'mirror'}),F('counter',4,4,2,1,{act:'shopCounter',staff:1})],w:[['b',3,'poster',{t:'MODE'}],['l',2,'window']]}),
  dept:()=>({W:9,H:7,floor:'marble',wall:'#f2efe9',f:[F('rack',1,1,2,1,{act:'clothes'}),F('rack',1,3,2,1,{act:'clothes'}),F('counter',4,1,2,1,{act:'gifts',staff:1}),F('counter',7,1,2,1,{act:'perfume',staff:1,c:'#f2a541'}),F('fountainS',4,4,2,2),F('mirror',8,4,1,1,{act:'mirror'}),F('toilet',8,6,1,1,{act:'wc'})],w:[['b',2,'poster',{t:'MODE'}],['b',5,'poster',{t:'DĀVANAS'}],['b',8,'poster',{t:'SMARŽAS'}]]}),
  luxe:()=>({W:7,H:6,floor:'marble',wall:'#2a2632',f:[F('rack',1,1,2,1,{act:'luxe',gold:1}),F('rack',4,1,2,1,{act:'luxe',gold:1}),F('pedestal',1,4,1,1,{act:'jewel'}),F('mirror',6,2,1,1,{act:'mirror'}),F('counter',4,4,2,1,{act:'jewel',staff:1,c:'#d8b45a'})],w:[['b',3,'neon',{t:'DIMANTS',c:'#ffd36b'}]]}),
  salon:()=>({W:7,H:5,floor:'tile',wall:'#e3f4f7',f:[F('salonchair',1,1,1,1,{act:'hair'}),F('salonchair',3,1,1,1,{act:'hair'}),F('hbed',6,1,1,2,{act:'tan'}),F('counter',4,3,2,1,{act:'salon',staff:1}),F('plant',0,3)],w:[['b',1.5,'mirrorw'],['b',3.5,'mirrorw'],['l',2,'poster',{t:'STILS'}]]}),
  flowers:()=>({W:6,H:5,floor:'tile',wall:'#eaf5e3',f:[F('flowerstand',1,1,1,1,{act:'flowers'}),F('flowerstand',3,1,1,1,{act:'flowers'}),F('flowerstand',0,3,1,1,{act:'flowers'}),F('counter',4,3,2,1,{act:'flowers',staff:1})],w:[['b',2,'painting']]}),
  museum:()=>({W:9,H:7,floor:'marble',wall:'#f4f1ea',f:[F('pedestal',2,2,1,1,{act:'art'}),F('pedestal',5,2,1,1,{act:'art'}),F('pedestal',3,4,1,1,{act:'art'}),F('bench',6,5,2,1),F('desk',7,1,1,2,{act:'museumDesk',staff:1})],w:[['b',1.5,'painting'],['b',3.5,'painting',{big:1}],['b',5.5,'painting'],['l',2,'painting'],['l',4.5,'painting']]}),
  police:()=>({W:7,H:6,floor:'tile',wall:'#dfe6ee',f:[F('counter',1,1,3,1,{act:'police',staff:1}),F('bench',1,4,2,1),F('desk',5,2,1,1,{act:'police'})],w:[['b',2,'board',{t:'NYPD'}],['l',3,'poster',{t:'MEKLĒ'}]]}),
  jazz:()=>({W:8,H:7,floor:'wood',wall:'#2a2440',dark:1,f:[F('stage',2,0,3,2,{act:'jazzStage'}),F('piano',5,0,2,1),F('table',2,3,1,1,{act:'jazzTable'}),F('table',5,3,1,1,{act:'jazzTable'}),F('table',1,5,1,1,{act:'jazzTable'}),F('bar',7,3,1,3,{act:'bar',staff:1,c:'#3a2e18'})],w:[['b',3.5,'neon',{t:'ZILĀ NOTS',c:'#5fa8ff'}],['l',3,'poster',{t:'DŽEZS'}]]}),
  lobby:()=>({W:6,H:5,floor:'tile',wall:'#eee5d8',f:[F('mailbox',1,0,2,1,{act:'mail'}),F('elevator',4,0,1,1,{act:'elevator'}),F('plant',0,3),F('bench',4,3,2,1)],w:[]}),
  flat:()=>({W:7,H:6,floor:'wood',wall:pick(['#f6e2d2','#e2eef0','#efe6f4','#f4f0dc']),f:[F('sofa',1,1,2,1,{act:'visit'}),F('tvstand',4,0,1,1),F('table4',4,3,1,1,{act:'visit'}),F('kitchen',6,1,1,2),F('plant',0,4),F('bed',1,4,2,1,{act:'visit'})],w:[['l',2.5,'window'],['b',2,'painting']]})
};
// mājokļi pēc līmeņa
const HOME_TPL=[
  {W:7,H:6,floor:'wood',wall:'#f2e6d8',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',6,1,1,1,{act:'fridge'}),F('shower',6,3,1,1,{act:'shower'}),F('toilet',6,4,1,1,{act:'wc'}),F('dumbbell',5,0,1,1,{act:'dumbbell'}),F('sofa',0,4,1,1,{c:'#7a8a5a'})],slots:{desk:[0,3,1,1],tv:[4,4,1,1],console:[5,4,1,1],plant:[0,1,1,1],art:['b',3],rug:[2,3,2,1],lamp:[3,1,1,1]}},
  {W:6,H:5,floor:'wood',wall:'#e8eef2',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',5,1,1,1,{act:'fridge'}),F('shower',5,2,1,1,{act:'shower'}),F('toilet',5,3,1,1,{act:'wc'}),F('dumbbell',3,0,1,1,{act:'dumbbell'})],slots:{sofa:[0,3,1,1],tv:[4,3,1,1],console:[2,3,1,1],desk:[0,1,1,1],plant:[4,1,1,1],art:['b',3.5],rug:[1,3,1,1],lamp:[3,1,1,1]}},
  {W:8,H:6,floor:'parquet',wall:'#f4eee4',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',7,1,1,1,{act:'fridge'}),F('kitchen',7,2,1,1),F('shower',7,3,1,1,{act:'shower'}),F('toilet',7,4,1,1,{act:'wc'}),F('dumbbell',5,0,1,1,{act:'dumbbell'})],slots:{sofa:[3,4,2,1],tv:[5,4,1,1],console:[6,5,1,1],stereo:[0,4,1,1],aqua:[6,0,1,1],desk:[0,1,1,1],plant:[3,1,1,1],art:['l',4],rug:[3,3,2,1],lamp:[2,5,1,1]}},
  {W:9,H:7,floor:'parquet',wall:'#eef3ef',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',8,1,1,1,{act:'fridge'}),F('kitchen',8,2,1,1),F('shower',8,4,1,1,{act:'shower'}),F('toilet',8,5,1,1,{act:'wc'}),F('dumbbell',5,0,1,1,{act:'dumbbell'})],slots:{sofa:[3,5,2,1],tv:[5,5,1,1],console:[6,6,1,1],stereo:[0,5,1,1],aqua:[7,0,1,1],desk:[0,1,1,1],plant:[3,1,1,1],art:['l',4.5],rug:[3,4,2,1],lamp:[2,6,1,1],piano:[5,2,2,1]}},
  {W:10,H:8,floor:'marbleW',wall:'#ffffff',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',9,1,1,1,{act:'fridge'}),F('kitchen',9,2,1,1),F('shower',9,3,1,1,{act:'shower'}),F('toilet',9,4,1,1,{act:'wc'}),F('swim',6,5,3,2,{act:'swim'}),F('dumbbell',5,0,1,1,{act:'dumbbell'})],slots:{sofa:[3,5,2,1],tv:[5,4,1,1],console:[4,7,1,1],stereo:[0,6,1,1],aqua:[7,0,1,1],desk:[0,1,1,1],plant:[3,1,1,1],art:['l',5],rug:[2,4,2,1],lamp:[2,7,1,1],piano:[6,2,2,1]}}
];
const FURN_KIND={sofa:'sofa',bed:'bed',tv:'tvstand',console:'console',stereo:'stereo',aqua:'aquarium',desk:'desk',plant:'plant',rug:'rug',lamp:'lamp',piano:'piano'};
const FURN_ACT={sofa:'homeSofa',tv:'homeTv',console:'homeConsole',stereo:'homeStereo',aqua:'homeAqua',desk:'homeDesk',piano:'piano'};
function makeRoom(b,variant){
  let t,home=false,lvl=0;
  if(variant==='home'){lvl=HOMES[C().home].lvl;const h=HOME_TPL[lvl];home=true;
    t={W:h.W,H:h.H,floor:h.floor,wall:h.wall,f:h.base.map(o=>Object.assign({},o)),w:[['l',1.6,'window'],['b',Math.max(5,h.W-2.5),'window']]};
    const owned=C().furn||{};
    for(const s in h.slots){const id=owned[s];if(!id)continue;const pos=h.slots[s];
      if(s==='bed'){const bd=t.f.find(o=>o.slot==='bed');if(bd)bd.lux=id==='bed3'?2:1;continue}
      if(s==='art'){t.w.push([pos[0],pos[1],'painting',{big:id==='paint2'}]);continue}
      if(!SLOTS_BY_LVL[lvl].includes(s))continue;const fd=FURN.find(x=>x.id===id);
      t.f.push(F(FURN_KIND[s],pos[0],pos[1],pos[2],pos[3],{act:FURN_ACT[s],walk:s==='rug'?1:0,lux:fd&&fd.cf>8}))}
  } else if(variant==='flat'){t=TPL.flat()} else if(variant==='lobby'){t=TPL.lobby()}
  else t=(TPL[b.type]||TPL.lobby)();
  const m={kind:'room',b,variant,home,W:t.W,H:t.H,floor:t.floor,wall:t.wall,dark:t.dark,furn:t.f,wdeco:t.w||[],exit:[Math.floor(t.W/2),t.H-1]};
  m.block=new Uint8Array(m.W*m.H);
  m.furn.forEach(o=>{if(o.walk)return;for(let y=o.y;y<o.y+o.d;y++)for(let x=o.x;x<o.x+o.w;x++)if(x>=0&&y>=0&&x<m.W&&y<m.H)m.block[y*m.W+x]=1});
  m.staff=[];m.furn.forEach(o=>{if(o.staff){const sx=o.x+Math.floor(o.w/2),sy=o.y-1;if(sy>=0&&!m.block[sy*m.W+sx])m.staff.push({x:sx+.5,y:sy+.5,o});else m.staff.push({x:o.x+o.w+.5>m.W?o.x-.5:o.x+o.w+.5,y:o.y+.5,o})}});
  m.staff.forEach(s=>{const ix=Math.floor(s.x),iy=Math.floor(s.y);if(ix>=0&&iy>=0&&ix<m.W&&iy<m.H)m.block[iy*m.W+ix]=1});
  m.block[m.exit[1]*m.W+m.exit[0]]=0;
  m.walk=(x,y)=>x>=0&&y>=0&&x<m.W&&y<m.H&&!m.block[y*m.W+x];
  return m;
}
