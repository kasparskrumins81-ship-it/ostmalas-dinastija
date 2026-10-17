/* ===================== Pilsētas karte ===================== */
const W=64,H=64,ROADS=[9,19,29,39,49];
const BR=[[0,7],[12,17],[22,27],[32,37],[42,47],[52,58]];
const T={GRASS:0,ROAD:1,WALK:2,WATER:3,SAND:4,PLAZA:5,BLD:6,PROM:7,PIER:8,PARK:9};
// tips → izskats un darba laiks
const BT={
  uni:{style:'classic',hours:[8,20],wall:'#efe1c4',acc:'#3f6fb5'},library:{style:'classic',hours:[9,21],wall:'#e9dcc2',acc:'#7a4b2a'},
  museum:{style:'classic',hours:[10,19],wall:'#f2ede2',acc:'#9b5bd6'},gov:{style:'classic',hours:[9,19],wall:'#f1e7cf',acc:'#c9a227'},
  party:{style:'deco',hours:[9,22],wall:'#f6c9b5',acc:'#d9534f'},police:{style:'deco',hours:[0,26],wall:'#c9d6f2',acc:'#2b3a67'},
  media:{style:'glass',hours:[9,22],wall:'#5b6fb8',acc:'#9b6bff'},agency:{style:'deco',hours:[10,19],wall:'#f2c1d8',acc:'#ff4fa3'},
  hotel:{style:'deco',hours:[0,26],wall:'#bfe3dc',acc:'#2fb7b0'},bank:{style:'classic',hours:[9,17],wall:'#e7e1d3',acc:'#2a9d8f'},
  realestate:{style:'shop',hours:[9,19],wall:'#d8e8f0',acc:'#2b6cb0'},office:{style:'glass',hours:[8,20],wall:'#6e9cc4',acc:'#24364f'},
  cafe:{style:'shop',hours:[8,20],wall:'#f3e1a6',acc:'#c0643a'},mall:{style:'deco',hours:[10,21],wall:'#f7e9d7',acc:'#f2a541'},
  cinema:{style:'deco',hours:[12,25],wall:'#d8cbe8',acc:'#e03c6b',neon:'KINO'},restaurant:{style:'shop',hours:[11,24],wall:'#f6d7c3',acc:'#9e2a2b'},
  beachbar:{style:'hut',hours:[11,26],wall:'#f1d9a7',acc:'#2fb7b0'},gym:{style:'shop',hours:[7,23],wall:'#dff1ea',acc:'#2fbf8f'},
  apt:{style:'apt',hours:[0,26]},super:{style:'shop',hours:[8,22],wall:'#e8f2df',acc:'#46b06b'},
  elec:{style:'shop',hours:[10,20],wall:'#dfe5f5',acc:'#3f7fd8'},hosp:{style:'deco',hours:[0,26],wall:'#f4f7f8',acc:'#e04f5f'},
  boutique:{style:'shop',hours:[10,20],wall:'#fbe4ec',acc:'#ff6f91'},salon:{style:'shop',hours:[9,19],wall:'#e3f4f7',acc:'#2fb7b0'},
  flowers:{style:'shop',hours:[8,19],wall:'#eaf5e3',acc:'#e85d9b'},luxe:{style:'deco',hours:[10,20],wall:'#1f1f2b',acc:'#d8b45a'},
  furniture:{style:'shop',hours:[10,20],wall:'#efe3d0',acc:'#8a5a36'},club:{style:'deco',hours:[20,26],wall:'#3b2a55',acc:'#ff4fa3',neon:'NEONS'},
  parents:{style:'house',hours:[0,26],wall:'#f3e6cf',acc:'#8a5a36',roof:'#b5533c'},carshop:{style:'glass',hours:[9,19],wall:'#c7d3dc',acc:'#e04f5f'},
  vip:{style:'deco',hours:[21,26],wall:'#151018',acc:'#d8b45a',neon:'ZELTS'},casino:{style:'deco',hours:[18,26],wall:'#5a1730',acc:'#ffc857',neon:'FORTŪNA'},
  pub:{style:'shop',hours:[15,26],wall:'#c9a27a',acc:'#2e5e3a'},villa:{style:'villa',hours:[0,26],wall:'#ffffff',acc:'#2fb7b0',roof:'#d9744a'},
  house:{style:'house',hours:[0,26],wall:'#e7eef0',acc:'#3f6fb5',roof:'#5b6676'},dance:{style:'shop',hours:[10,22],wall:'#f3d7ec',acc:'#9b5bd6'},
  pizza:{style:'shop',hours:[11,24],wall:'#f8e2c8',acc:'#d64933'},port:{style:'warehouse',hours:[0,26],wall:'#8a97a3',acc:'#c46a2b'},
  yacht:{style:'hut',hours:[9,22],wall:'#e6f1f7',acc:'#2b6cb0'},icecream:{style:'hut',hours:[10,22],wall:'#fff0f5',acc:'#ff8fb8'}
};
const APTWALL=['#f6c9b5','#bfe3dc','#f3e1a6','#c9d6f2','#f2c1d8','#e9e4d8','#d8cbe8','#ffd6a8'];
const BLD_SPEC=[
  ['uni','uni','Universitāte',0,0,0,1,8,7,104,'y',4],['lib','library','Bibliotēka',1,0,0,3,3,5,72,'y',1],['museum','museum','Mākslas muzejs',1,0,3,2,3,6,80,'y',1],
  ['gov','gov','Valdības nams',2,0,0,2,6,6,108,'y',3],['party','party','Partiju mītne',3,0,0,3,3,5,84,'y',1],['police','police','Policija',3,0,3,3,3,5,70,'y',1],
  ['media','media','Mediju centrs',4,0,0,1,4,7,156,'y',2],['agency','agency','Modeļu aģentūra „Zvaigzne”',4,0,4,2,2,6,92,'x',3],['hotel','hotel','Viesnīca „Jūras pērle”',5,0,2,0,5,6,196,'x',3],
  ['bank','bank','Banka',0,1,0,1,4,5,112,'y',2],['realestate','realestate','Nekustamie īpašumi',0,1,4,2,4,4,66,'y',2],['office','office','Biznesa centrs',2,1,0,0,4,6,236,'y',2],
  ['cafe','cafe','Kafejnīca „Rīts”',2,1,4,2,2,4,58,'x',2],['mall','mall','Tirdzniecības centrs',3,1,0,1,6,5,92,'y',3],['cinema','cinema','Kino „Rivjēra”',4,1,0,1,3,5,84,'y',1],
  ['restaurant','restaurant','Restorāns „Dzintars”',4,1,3,2,3,4,60,'y',1],['beachbar','beachbar','Pludmales bārs „Viļņi”',5,1,3,3,4,3,46,'x',1],['gym','gym','Sporta zāle „Spēks”',5,1,0,2,3,4,64,'y',1],
  ['apt_liepas','apt','Nams „Liepas”',0,2,0,1,3,5,112,'y',1],['apt_klavas','apt','Nams „Kļavas”',0,2,4,1,4,5,90,'y',2],['super','super','Lielveikals',1,2,0,2,4,4,56,'y',2],
  ['elec','elec','Elektronika',1,2,4,2,2,4,56,'x',2],['hosp','hosp','Slimnīca',2,2,0,0,6,6,122,'y',3],['boutique','boutique','Butiks „Stils”',3,2,0,3,2,3,56,'y',1],
  ['salon','salon','Skaistumkopšanas salons',3,2,2,3,2,3,56,'y',1],['flowers','flowers','Ziedu veikals',3,2,4,3,2,3,46,'y',1],['luxe','luxe','Butiks „Luxe”',4,2,0,2,3,4,72,'y',1],
  ['furniture','furniture','Mēbeļu salons',4,2,3,1,3,5,66,'y',1],['club','club','Klubs „Neons”',5,2,2,1,5,5,78,'x',2],
  ['parents','parents','Vecāku māja',0,3,0,2,3,4,56,'y',1],['apt_berzi','apt','Nams „Bērzi”',0,3,4,1,4,5,120,'y',2],['carshop','carshop','Auto salons',2,3,0,2,4,4,56,'y',2],
  ['apt_centrs','apt','Nams „Centrs”',2,3,4,0,2,6,170,'x',3],['vip','vip','VIP klubs „Zelts”',3,3,0,2,3,4,70,'y',1],['casino','casino','Kazino „Fortūna”',3,3,3,1,3,5,86,'y',1],
  ['pub','pub','Krogs „Enkurs”',4,3,0,3,3,3,52,'y',1],['villa','villa','Villa „Saulriets”',5,3,2,1,5,5,62,'x',2],
  ['house_ozoli','house','Privātmāja „Ozoli”',0,4,1,2,4,4,56,'y',2],['apt_priedes','apt','Nams „Priedes”',1,4,0,1,3,5,100,'y',1],['dance','dance','Deju studija „Ritms”',1,4,3,2,3,4,56,'y',1],
  ['pizza','pizza','Picērija „Bella”',2,4,0,3,3,3,50,'y',1],['apt_ievas','apt','Nams „Ievas”',2,4,3,1,3,5,92,'y',1],['port1','port','Ostas noliktava',4,4,0,2,6,4,58,'y',3],
  ['yacht','yacht','Jahtklubs „Bura”',5,4,0,1,4,5,58,'y',2],
  ['apt_jurmala','apt','Nams „Jūrmala”',0,5,1,2,4,5,92,'y',2],['icecream','icecream','Saldējuma kiosks',1,5,0,4,2,3,40,'y',1],['apt_vilni','apt','Nams „Viļņi”',3,5,1,2,4,5,82,'y',2],
  ['port2','port','Kravu terminālis',4,5,0,2,6,5,54,'y',3]
];
const BLDS=[];
const grid=new Uint8Array(W*H), blockG=new Uint8Array(W*H);
const gi=(x,y)=>y*W+x, inB=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const DECO=[]; let LAMPS=[], GNOME_SPOTS=[], TAXIS=[], CITY_OBJS=[];
function buildCity(){
  const rr=mulberry(2026);
  grid.fill(T.GRASS);
  for(let i=0;i<59;i++)for(const r of ROADS)for(const k of [r,r+1]){grid[gi(i,k)]=T.ROAD;grid[gi(k,i)]=T.ROAD}
  for(let i=0;i<59;i++)for(const r of ROADS)for(const k of [r-1,r+2]){if(grid[gi(i,k)]!==T.ROAD)grid[gi(i,k)]=T.WALK;if(grid[gi(k,i)]!==T.ROAD)grid[gi(k,i)]=T.WALK}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const e=Math.max(x,y);if(e>=61)grid[gi(x,y)]=T.WATER;else if(e===59&&Math.min(x,y)<=59)grid[gi(x,y)]=T.PROM;else if(e>=59)grid[gi(x,y)]=T.SAND}
  for(let x=61;x<64;x++){grid[gi(x,45)]=T.PIER;grid[gi(x,46)]=T.PIER}
  // parki
  const park=(i,j)=>{for(let y=BR[j][0];y<=BR[j][1];y++)for(let x=BR[i][0];x<=BR[i][1];x++)grid[gi(x,y)]=T.PARK};
  [[1,1],[1,3],[3,4],[2,5],[5,5],[4,0]].forEach(([i,j])=>{if(!(i===4&&j===0))park(i,j)});
  for(let y=13;y<=16;y++)for(let x=13;x<=16;x++)grid[gi(x,y)]=T.PLAZA;
  BLD_SPEC.forEach(([id,type,n,i,j,rx,ry,w,d,h,side,off],k)=>{
    const bx=BR[i][0]+rx,by=BR[j][0]+ry,meta=BT[type];
    const door=side==='y'?[bx+off,by+d]:[bx+w,by+off];
    const b={id,type,n,bx,by,w,d,h,side,door,style:meta.style,hours:meta.hours,wall:meta.wall||APTWALL[k%APTWALL.length],acc:meta.acc||pick(['#2fb7b0','#ff6f61','#3f7fd8','#e8a93a']),roof:meta.roof,neon:meta.neon,seed:k*13+7};
    if(type==='apt'){b.wall=APTWALL[k%APTWALL.length];b.acc=['#2fb7b0','#ff6f61','#3f7fd8','#e8a93a','#9b5bd6'][k%5]}
    BLDS.push(b);for(let y=by;y<by+d;y++)for(let x=bx;x<bx+w;x++){grid[gi(x,y)]=T.BLD;blockG[gi(x,y)]=1}
  });
  const isDoor=(x,y)=>BLDS.some(b=>b.door[0]===x&&b.door[1]===y);
  const free=(x,y)=>inB(x,y)&&!blockG[gi(x,y)]&&!isDoor(x,y);
  const addObj=(o,blocks)=>{CITY_OBJS.push(o);if(blocks)blockG[gi(o.x,o.y)]=1};
  // koki
  const tree=(x,y,kind)=>{if(free(x,y)&&(grid[gi(x,y)]===T.GRASS||grid[gi(x,y)]===T.PARK)){addObj({k:'tree',kind,x,y,s:.85+rr()*.35},true)}};
  for(let i=0;i<260;i++){const x=Math.floor(rr()*59),y=Math.floor(rr()*59);const t=grid[gi(x,y)];if((t===T.PARK&&rr()<.5)||(t===T.GRASS&&rr()<.35))tree(x,y,rr()<.45?'pine':rr()<.6?'round':'palm')}
  // palmas gar pludmali un pludmales ielu
  for(let i=1;i<59;i+=3){if(free(60,i)&&grid[gi(60,i)]===T.SAND)addObj({k:'tree',kind:'palm',x:60,y:i,s:1+rr()*.2},true);if(free(i,60)&&grid[gi(i,60)]===T.SAND)addObj({k:'tree',kind:'palm',x:i,y:60,s:1+rr()*.2},true)}
  for(let i=2;i<59;i+=4){if(grid[gi(51,i)]===T.WALK&&!isDoor(51,i))addObj({k:'tree',kind:'palm',x:51,y:i,s:.95,nb:1},false)}
  // centrālā parka strūklaka
  addObj({k:'fountain',x:14,y:14,act:'fountain'},true);
  // soliņi
  [[13,12],[16,17],[12,15],[17,14],[13,32],[16,35],[33,43],[36,46],[23,53],[26,56],[53,53],[56,56],[44,4],[14,33]].forEach(([x,y])=>{if(free(x,y))addObj({k:'bench',x,y,act:'bench'},true)});
  // pludmale: zvilņi, lietussargi, kioski, glābēju tornis
  for(let y=4;y<58;y+=4){if(free(60,y+1)&&grid[gi(60,y+1)]===T.SAND)addObj({k:'lounger',x:60,y:y+1,act:'lounger',c:pick(['#ff6f61','#2fb7b0','#ffc857','#ff4fa3'])},true)}
  for(let x=5;x<58;x+=5){if(free(x+1,60)&&grid[gi(x+1,60)]===T.SAND)addObj({k:'lounger',x:x+1,y:60,act:'lounger',c:pick(['#ff6f61','#2fb7b0','#ffc857','#ff4fa3'])},true)}
  [[60,10,'hotdog'],[60,31,'smoothie'],[20,60,'icecart']].forEach(([x,y,kind])=>{if(free(x,y))addObj({k:'cart',kind,x,y,act:'cart'},true)});
  addObj({k:'tower',x:60,y:40},true);
  // bankomāti
  [[18,15],[38,25],[48,35],[8,45],[28,5]].forEach(([x,y])=>{if(grid[gi(x,y)]===T.WALK&&!isDoor(x,y))addObj({k:'atm',x,y,act:'atm'},true)});
  // taksometru pieturas
  TAXIS=[{n:'Vecpilsēta',x:21,y:11},{n:'Centrs',x:31,y:21},{n:'Pludmale',x:51,y:21},{n:'Dzīvojamais rajons',x:11,y:31},{n:'Osta',x:41,y:51},{n:'Universitāte',x:11,y:8}];
  TAXIS.forEach(t=>addObj({k:'taxi',x:t.x,y:t.y,n:t.n,act:'taxi'},false));
  // laternas
  for(let i=2;i<58;i+=6)for(const r of ROADS){LAMPS.push({x:i,y:r-1,o:[0,.4]});LAMPS.push({x:r+2,y:i,o:[-.4,0]})}
  LAMPS=LAMPS.filter(l=>grid[gi(l.x,l.y)]===T.WALK&&!isDoor(l.x,l.y));
  // laivas
  DECO.push({k:'boat',x:62.5,y:42,c:'#f4f4f4'},{k:'boat',x:62.4,y:49,c:'#ff6f61'},{k:'boat',x:63,y:30,c:'#2fb7b0'},{k:'boat',x:50,y:62.6,c:'#ffc857'});
  // rūķīši
  const cand=[];for(let y=0;y<62;y++)for(let x=0;x<62;x++){const t=grid[gi(x,y)];if((t===T.GRASS||t===T.PARK||t===T.SAND)&&free(x,y))cand.push([x,y])}
  for(let i=0;i<GNOMES;i++)GNOME_SPOTS.push(cand.splice(Math.floor(rr()*cand.length),1)[0]);
}
buildCity();
function bld(id){return BLDS.find(b=>b.id===id)}
function walkCity(x,y){if(!inB(x,y))return false;const t=grid[gi(x,y)];return t!==T.WATER&&!blockG[gi(x,y)]}
function bfs(m,sx,sy,tx,ty,maxN=4200){
  const Wm=m.W,Hm=m.H,ok=(x,y)=>m.walk(x,y);
  if(!ok(tx,ty))return null;if(sx===tx&&sy===ty)return [];
  const prev=new Int32Array(Wm*Hm).fill(-1),s=sy*Wm+sx,q=[s];prev[s]=s;let h=0;const tgt=ty*Wm+tx;
  while(h<q.length&&h<maxN){const cur=q[h++];if(cur===tgt)break;const cx=cur%Wm,cy=(cur/Wm)|0;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=Wm||ny>=Hm)continue;const ni=ny*Wm+nx;if(prev[ni]<0&&ok(nx,ny)){prev[ni]=cur;q.push(ni)}}}
  if(prev[tgt]<0)return null;
  const path=[];let cur=tgt;while(cur!==s){path.push([cur%Wm,(cur/Wm)|0]);cur=prev[cur]}return path.reverse();
}
const CITY={kind:'city',W,H,walk:walkCity};

/* ===================== Interjeri ===================== */
// mēbele: [veids,x,y,w,d,{opcijas}] ; dekorācijas uz sienām: [siena 'b'|'l', pozīcija, veids, {opc}]
function F(k,x,y,w=1,d=1,o={}){return Object.assign({k,x,y,w,d},o)}
const TPL={
  cafe:()=>({W:7,H:6,floor:'wood',wall:'#f3e3c4',f:[F('counter',1,1,3,1,{act:'cafe',staff:1}),F('table',4,3,1,1,{act:'cafeTable'}),F('table',2,4,1,1,{act:'cafeTable'}),F('table',5,1,1,1,{act:'cafeTable'}),F('plant',6,4)],
    w:[['b',1.2,'board',{t:'KAFIJA'}],['l',1.5,'window'],['l',3.6,'window'],['b',5.2,'painting']]}),
  icecream:()=>({W:5,H:4,floor:'tile',wall:'#ffe5ef',f:[F('counter',1,1,3,1,{act:'icecream',staff:1,c:'#ffb3cf'})],w:[['b',1.5,'board',{t:'SALDĒJUMS'}]]}),
  restaurant:()=>({W:8,H:7,floor:'checker',wall:'#f4d9c6',f:[F('counter',1,1,2,1,{act:'restCounter',staff:1}),F('table4',4,2,1,1,{act:'restTable'}),F('table4',6,2,1,1,{act:'restTable'}),F('table4',4,4,1,1,{act:'restTable'}),F('table4',6,4,1,1,{act:'restTable'}),F('table4',2,5,1,1,{act:'restTable'}),F('plant',7,6),F('plant',0,1)],
    w:[['b',4.6,'painting'],['b',6.6,'painting'],['l',2.5,'window'],['l',4.8,'window']]}),
  pizza:()=>({W:7,H:6,floor:'checker',wall:'#f8e2c8',f:[F('counter',1,1,3,1,{act:'restCounter',staff:1}),F('oven',4,0,1,1),F('table4',4,3,1,1,{act:'restTable'}),F('table4',2,4,1,1,{act:'restTable'}),F('table4',5,4,1,1,{act:'restTable'})],w:[['b',1.2,'board',{t:'PICA'}],['l',3,'window']]}),
  pub:()=>({W:8,H:7,floor:'wood',wall:'#9c7a58',f:[F('bar',1,1,4,1,{act:'bar',staff:1}),F('pool',5,4,2,1,{act:'pool'}),F('stage',1,4,2,2,{act:'karaoke'}),F('table',6,1,1,1,{act:'bar'}),F('table',3,5,1,1,{act:'bar'})],w:[['b',2.2,'bottles'],['b',6,'neon',{t:'ENKURS',c:'#7bff9e'}],['l',2.5,'window']]}),
  beachbar:()=>({W:7,H:6,floor:'deck',wall:'#e9cf9a',f:[F('bar',1,1,4,1,{act:'bar',staff:1,c:'#c08a4a'}),F('table',5,3,1,1,{act:'bar'}),F('table',2,4,1,1,{act:'bar'}),F('plant',6,1,1,1,{palm:1})],w:[['b',2.2,'bottles'],['l',2,'window'],['l',4,'window']]}),
  club:()=>({W:10,H:8,floor:'dark',wall:'#1e1630',dark:1,f:[F('dance',3,3,4,3,{act:'dance',walk:1}),F('dj',4,1,2,1,{act:'dj',staff:1}),F('bar',0,3,1,4,{act:'bar',staff:1,c:'#2c2340'}),F('sofa',8,1,2,1,{c:'#7a2b5a'}),F('sofa',8,6,2,1,{c:'#7a2b5a'}),F('speaker',2,1),F('speaker',7,1)],w:[['b',4.4,'neon',{t:'NEONS',c:'#ff4fa3'}],['l',4.5,'neon',{t:'♪',c:'#2fe0d0'}]]}),
  vip:()=>({W:9,H:7,floor:'dark',wall:'#16121c',dark:1,gold:1,f:[F('dance',3,3,3,2,{act:'dance',walk:1}),F('bar',1,1,3,1,{act:'vipbar',staff:1,c:'#3a2e18'}),F('dj',6,1,2,1,{act:'dj',staff:1}),F('sofa',7,4,2,1,{c:'#d8b45a'}),F('sofa',1,5,2,1,{c:'#d8b45a'}),F('plant',8,1)],w:[['b',4.5,'neon',{t:'ZELTS',c:'#ffd36b'}]]}),
  boutique:()=>({W:7,H:6,floor:'marble',wall:'#fbe4ec',f:[F('rack',1,1,2,1,{act:'clothes'}),F('rack',4,1,2,1,{act:'clothes'}),F('rack',1,3,1,2,{act:'clothes'}),F('mirror',6,2,1,1,{act:'mirror'}),F('counter',4,4,2,1,{act:'shopCounter',staff:1})],w:[['b',3,'poster',{t:'STILS'}],['l',2,'window']]}),
  luxe:()=>({W:7,H:6,floor:'marble',wall:'#2a2632',dark:0,f:[F('rack',1,1,2,1,{act:'luxe',gold:1}),F('rack',4,1,2,1,{act:'luxe',gold:1}),F('pedestal',1,4,1,1),F('mirror',6,2,1,1,{act:'mirror'}),F('counter',4,4,2,1,{act:'shopCounter',staff:1,c:'#d8b45a'})],w:[['b',3,'neon',{t:'LUXE',c:'#ffd36b'}]]}),
  salon:()=>({W:6,H:5,floor:'tile',wall:'#e3f4f7',f:[F('salonchair',1,1,1,1,{act:'hair'}),F('salonchair',3,1,1,1,{act:'hair'}),F('counter',4,3,2,1,{act:'salon',staff:1}),F('plant',0,4)],w:[['b',1.5,'mirrorw'],['b',3.5,'mirrorw']]}),
  flowers:()=>({W:5,H:5,floor:'tile',wall:'#eaf5e3',f:[F('flowerstand',1,1,1,1),F('flowerstand',3,1,1,1),F('flowerstand',0,3,1,1),F('counter',3,3,2,1,{act:'flowers',staff:1})],w:[['b',2,'painting']]}),
  super:()=>({W:8,H:6,floor:'tile',wall:'#eef1ee',f:[F('shelf',1,1,3,1,{act:'grocery'}),F('shelf',5,1,2,1,{act:'grocery'}),F('shelf',1,3,3,1,{act:'grocery'}),F('fridgeD',7,3,1,2,{act:'grocery'}),F('counter',4,5,2,1,{act:'superCounter',staff:1})],w:[['b',3,'board',{t:'LIELVEIKALS'}]]}),
  elec:()=>({W:6,H:5,floor:'tile',wall:'#e3e8f5',f:[F('tvwall',1,1,3,1,{act:'elec'}),F('shelf',1,3,2,1,{act:'elec',tech:1}),F('counter',4,3,2,1,{act:'elecCounter',staff:1})],w:[['b',5,'poster',{t:'TECH'}]]}),
  furniture:()=>({W:8,H:6,floor:'wood',wall:'#efe3d0',f:[F('sofa',1,1,2,1,{act:'furn'}),F('bed',4,1,2,2,{act:'furn'}),F('tvstand',7,1,1,1,{act:'furn'}),F('plant',1,3,1,1,{act:'furn'}),F('aquarium',2,4,1,1,{act:'furn'}),F('counter',5,4,2,1,{act:'furnCounter',staff:1})],w:[['b',2,'painting'],['b',6,'painting']]}),
  mall:()=>({W:10,H:8,floor:'marble',wall:'#f2efe9',f:[F('rack',1,1,2,1,{act:'clothes'}),F('rack',1,3,2,1,{act:'clothes'}),F('counter',4,1,2,1,{act:'gifts',staff:1}),F('counter',7,1,2,1,{act:'foodcourt',staff:1,c:'#f2a541'}),F('table',7,4,1,1,{act:'foodcourt'}),F('table',8,6,1,1,{act:'foodcourt'}),F('fountainS',4,4,2,2),F('plant',9,3),F('plant',0,6),F('counter',1,6,2,1,{act:'shopCounter',staff:1})],w:[['b',2,'poster',{t:'MODE'}],['b',5,'poster',{t:'DĀVANAS'}],['b',8,'poster',{t:'ĒDIENS'}]]}),
  realestate:()=>({W:6,H:5,floor:'carpet',wall:'#e6eef2',f:[F('desk',1,1,2,1,{act:'realestate',staff:1}),F('desk',4,1,1,1,{act:'realestate'}),F('sofa',1,3,2,1),F('plant',5,4)],w:[['b',1.5,'housepic'],['b',3.5,'housepic'],['l',2.5,'housepic']]}),
  carshop:()=>({W:9,H:7,floor:'shiny',wall:'#e8ecef',f:[F('cardisp',1,1,2,1,{act:'cars',c:'#ff6f61'}),F('cardisp',4,1,2,1,{act:'cars',c:'#2b2f3a'}),F('cardisp',2,4,2,1,{act:'cars',c:'#ffc857'}),F('desk',6,4,2,1,{act:'cars',staff:1})],w:[['b',4,'poster',{t:'AUTO'}],['l',3,'window']]}),
  bank:()=>({W:8,H:6,floor:'marble',wall:'#efe9dc',f:[F('teller',1,1,4,1,{act:'bank',staff:1}),F('atmI',7,1,1,1,{act:'atm'}),F('sofa',1,4,2,1),F('plant',6,4),F('desk',5,3,1,1,{act:'bank'})],w:[['b',3,'board',{t:'BANKA'}],['l',3,'painting']]}),
  office:()=>({W:9,H:7,floor:'carpet',wall:'#e9eef3',f:[F('desk',1,1,2,1,{act:'work'}),F('desk',4,1,2,1,{act:'work'}),F('desk',1,4,2,1,{act:'work'}),F('desk',4,4,2,1,{act:'work'}),F('counter',7,3,2,1,{act:'officeJobs',staff:1}),F('plant',8,1),F('cooler',7,6)],w:[['l',2,'window'],['l',5,'window'],['b',7.5,'board',{t:'BIZNESS'}]]}),
  uni:()=>({W:10,H:7,floor:'wood',wall:'#efe5d2',f:[F('podium',4,1,1,1,{act:'lecture',staff:1}),F('lecdesk',2,3,2,1,{act:'lecture'}),F('lecdesk',5,3,2,1,{act:'lecture'}),F('lecdesk',2,5,2,1,{act:'lecture'}),F('lecdesk',5,5,2,1,{act:'lecture'}),F('desk',8,4,1,2,{act:'uniDesk',staff:1})],w:[['b',3.5,'blackboard'],['l',2,'window'],['l',4.5,'window']]}),
  library:()=>({W:8,H:6,floor:'wood',wall:'#efe2cc',f:[F('bookshelf',1,0,3,1,{act:'read'}),F('bookshelf',5,0,2,1,{act:'read'}),F('bookshelf',0,2,1,3,{act:'read'}),F('table4',3,3,1,1,{act:'read'}),F('table4',5,3,1,1,{act:'read'}),F('desk',6,5,2,1,{act:'libDesk',staff:1})],w:[]}),
  museum:()=>({W:9,H:7,floor:'marble',wall:'#f4f1ea',f:[F('pedestal',2,2,1,1,{act:'art'}),F('pedestal',5,2,1,1,{act:'art'}),F('pedestal',3,4,1,1,{act:'art'}),F('bench',6,5,2,1),F('desk',7,1,1,2,{act:'buyArt',staff:1})],w:[['b',1.5,'painting'],['b',3.5,'painting'],['b',5.5,'painting'],['l',2,'painting'],['l',4.5,'painting']]}),
  gov:()=>({W:10,H:8,floor:'marble',wall:'#efe6cf',f:[F('podium',4,1,2,1,{act:'govPodium'}),F('seats',2,3,6,1,{act:'govSeats'}),F('seats',2,5,6,1,{act:'govSeats'}),F('desk',8,6,2,1,{act:'govDesk',staff:1}),F('flagpole',1,1),F('flagpole',7,1)],w:[['b',5,'emblem'],['l',3,'painting'],['l',5.5,'window']]}),
  party:()=>({W:8,H:6,floor:'carpet',wall:'#f1e1d6',f:[F('desk',1,1,2,1,{act:'partyDesk',staff:1}),F('desk',4,1,2,1,{act:'phonebank'}),F('table4',3,4,1,1,{act:'partyDesk'}),F('plant',7,1)],w:[['b',2,'poster',{t:'BALSO!'}],['b',5,'poster',{t:'NĀKOTNE'}],['l',2.5,'window']]}),
  police:()=>({W:7,H:6,floor:'tile',wall:'#dfe6ee',f:[F('counter',1,1,3,1,{act:'police',staff:1}),F('bench',1,4,2,1),F('desk',5,2,1,1,{act:'police'})],w:[['b',2,'board',{t:'POLICIJA'}]]}),
  media:()=>({W:9,H:7,floor:'dark',wall:'#2c2a45',f:[F('sofa',2,2,2,1,{act:'tvshow',c:'#ff6f61'}),F('camera',3,5,1,1),F('camera',5,4,1,1),F('desk',5,1,2,1,{act:'news',staff:1}),F('counter',7,5,2,1,{act:'mediaDesk',staff:1})],w:[['b',2.5,'screen'],['b',6,'neon',{t:'ĒTERĀ',c:'#ff4f4f'}]]}),
  agency:()=>({W:7,H:6,floor:'marble',wall:'#f7eef4',f:[F('backdrop',1,0,3,1,{act:'photoshoot'}),F('lightstand',1,2),F('lightstand',4,2),F('mirror',6,1,1,1,{act:'mirror'}),F('desk',4,4,2,1,{act:'agencyDesk',staff:1})],w:[['l',3,'poster',{t:'MODE'}]]}),
  hotel:()=>({W:9,H:7,floor:'marble',wall:'#f3ead8',f:[F('counter',1,1,3,1,{act:'hotel',staff:1}),F('sofa',5,2,2,1),F('sofa',5,5,2,1),F('bar',8,2,1,3,{act:'bar',staff:1}),F('piano',1,4,2,1,{act:'piano'}),F('plant',4,1),F('plant',8,6)],w:[['b',2.5,'board',{t:'RECEPCIJA'}],['l',2,'window'],['l',4.5,'window']]}),
  hosp:()=>({W:9,H:7,floor:'tile',wall:'#eef4f6',f:[F('counter',1,1,3,1,{act:'hosp',staff:1}),F('hbed',6,1,1,2,{act:'hosp'}),F('hbed',8,1,1,2,{act:'hosp'}),F('bench',1,4,2,1),F('plant',0,6)],w:[['b',2.5,'board',{t:'REĢISTRATŪRA'}],['l',3,'window']]}),
  gym:()=>({W:9,H:7,floor:'rubber',wall:'#e4ecea',f:[F('treadmill',1,1,1,2,{act:'treadmill'}),F('treadmill',3,1,1,2,{act:'treadmill'}),F('weights',6,1,2,1,{act:'weights'}),F('weights',6,3,2,1,{act:'weights'}),F('mat',2,4,2,2,{act:'yoga',walk:1}),F('counter',7,5,2,1,{act:'gymDesk',staff:1})],w:[['b',5,'mirrorw'],['l',3,'poster',{t:'SPĒKS'}]]}),
  dance:()=>({W:8,H:6,floor:'wood',wall:'#f3d7ec',f:[F('dance',2,1,4,3,{act:'danceLesson',walk:1,soft:1}),F('counter',6,4,2,1,{act:'danceDesk',staff:1}),F('speaker',7,1)],w:[['b',2,'mirrorw'],['b',4,'mirrorw']]}),
  cinema:()=>({W:9,H:8,floor:'carpet',wall:'#3a2232',dark:1,f:[F('seats',1,3,6,1,{act:'movie'}),F('seats',1,5,6,1,{act:'movie'}),F('counter',7,6,2,1,{act:'snacks',staff:1})],w:[['b',3.5,'bigscreen']]}),
  casino:()=>({W:9,H:7,floor:'red',wall:'#3a1426',dark:1,f:[F('slot',1,1,1,1,{act:'slots'}),F('slot',2,1,1,1,{act:'slots'}),F('slot',3,1,1,1,{act:'slots'}),F('roulette',5,3,2,2,{act:'roulette',staff:1}),F('bar',8,1,1,3,{act:'bar',staff:1,c:'#3a2e18'})],w:[['b',6,'neon',{t:'FORTŪNA',c:'#ffd36b'}]]}),
  yacht:()=>({W:8,H:6,floor:'deck',wall:'#e6f1f7',f:[F('desk',1,1,2,1,{act:'yacht',staff:1}),F('boatmodel',4,1,1,1),F('bar',6,1,2,1,{act:'bar',staff:1}),F('sofa',2,4,2,1)],w:[['b',3.5,'painting'],['l',2,'window'],['l',4,'window']]}),
  port:()=>({W:9,H:7,floor:'concrete',wall:'#8a929b',f:[F('crates',1,1,2,2,{act:'smuggle'}),F('crates',5,1,2,1,{act:'smuggle'}),F('crates',6,4,2,2),F('desk',1,5,2,1,{act:'portDesk',staff:1})],w:[['b',4,'board',{t:'NOLIKTAVA'}]]}),
  lobby:()=>({W:6,H:5,floor:'tile',wall:'#eee5d8',f:[F('mailbox',1,0,2,1,{act:'mail'}),F('elevator',4,0,1,1,{act:'elevator'}),F('plant',0,3),F('bench',4,3,2,1)],w:[]}),
  flat:()=>({W:7,H:6,floor:'wood',wall:pick(['#f6e2d2','#e2eef0','#efe6f4','#f4f0dc']),f:[F('sofa',1,1,2,1,{act:'visit'}),F('tvstand',4,0,1,1),F('table4',4,3,1,1,{act:'visit'}),F('kitchen',6,1,1,2),F('plant',0,4),F('bed',1,4,2,2,{act:'visitBed'})],w:[['l',2.5,'window'],['b',2,'painting']]}),
};
// mājokļi pēc līmeņa: slotu pozīcijas
const HOME_TPL=[
  {W:6,H:5,floor:'wood',wall:'#f2e6d8',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',5,1,1,1,{act:'fridge'})],slots:{desk:[0,3,1,1],plant:[5,3,1,1],art:['b',3.5],rug:[2,3,2,1],lamp:[0,1,1,1]}},
  {W:6,H:5,floor:'wood',wall:'#e8eef2',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',5,1,1,1,{act:'fridge'})],slots:{sofa:[3,3,2,1],tv:[5,3,1,1],desk:[0,3,1,1],plant:[0,1,1,1],art:['b',3.5],rug:[2,4,2,1],lamp:[5,4,1,1]}},
  {W:8,H:6,floor:'parquet',wall:'#f4eee4',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',7,1,1,1,{act:'fridge'}),F('kitchen',7,2,1,2)],slots:{sofa:[3,4,2,1],tv:[5,4,1,1],console:[6,5,1,1],stereo:[0,4,1,1],aqua:[5,0,1,1],desk:[0,1,1,1],plant:[3,1,1,1],art:['l',4],rug:[3,3,2,1],lamp:[2,5,1,1]}},
  {W:9,H:7,floor:'parquet',wall:'#eef3ef',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',8,1,1,1,{act:'fridge'}),F('kitchen',8,2,1,2)],slots:{sofa:[3,5,2,1],tv:[5,5,1,1],console:[6,6,1,1],stereo:[0,5,1,1],aqua:[6,0,1,1],desk:[0,1,1,1],plant:[3,1,1,1],art:['l',4.5],rug:[3,4,2,1],lamp:[2,6,1,1],piano:[5,2,2,1]}},
  {W:10,H:8,floor:'marbleW',wall:'#ffffff',base:[F('bed',1,1,2,2,{act:'bed',slot:'bed'}),F('wardrobe',4,0,1,1,{act:'wardrobe'}),F('fridge',9,1,1,1,{act:'fridge'}),F('kitchen',9,2,1,2),F('swim',6,5,3,2,{act:'swim'})],slots:{sofa:[3,5,2,1],tv:[5,4,1,1],console:[4,7,1,1],stereo:[0,6,1,1],aqua:[6,0,1,1],desk:[0,1,1,1],plant:[3,1,1,1],art:['l',5],rug:[2,4,2,1],lamp:[2,7,1,1],piano:[6,2,2,1]}}
];
const FURN_KIND={sofa:'sofa',bed:'bed',tv:'tvstand',console:'console',stereo:'stereo',aqua:'aquarium',desk:'desk',plant:'plant',rug:'rug',lamp:'lamp',piano:'piano'};
function makeRoom(b,variant){
  let t,home=false,lvl=0;
  if(variant==='home'){lvl=HOMES[C().home].lvl;const h=HOME_TPL[lvl];home=true;
    t={W:h.W,H:h.H,floor:h.floor,wall:h.wall,f:h.base.map(o=>Object.assign({},o)),w:[['l',1.6,'window'],['b',Math.max(5,h.W-2.5),'window']]};
    const owned=C().furn||{};
    for(const s in h.slots){const id=owned[s];if(!id)continue;const fd=FURN.find(x=>x.id===id);const pos=h.slots[s];
      if(s==='bed'){const bd=t.f.find(o=>o.slot==='bed');if(bd)bd.lux=id==='bed3'?2:1;continue}
      if(s==='art'){t.w.push([pos[0],pos[1],'painting',{big:id==='paint2'}]);continue}
      if(!SLOTS_BY_LVL[lvl].includes(s))continue;
      t.f.push(F(FURN_KIND[s],pos[0],pos[1],pos[2],pos[3],{act:{sofa:'homeSofa',tv:'homeTv',console:'homeConsole',stereo:'homeStereo',aqua:'homeAqua',desk:'homeDesk',piano:'piano',rug:null,plant:null,lamp:null}[s]||undefined,walk:s==='rug'?1:0,soft:s==='rug',lux:fd.cf>8}))}
  } else if(variant==='flat'){t=TPL.flat()} else if(variant==='lobby'){t=TPL.lobby()}
  else t=(TPL[b.type]||TPL.lobby)();
  const m={kind:'room',b,variant,home,W:t.W,H:t.H,floor:t.floor,wall:t.wall,dark:t.dark,gold:t.gold,furn:t.f,wdeco:t.w||[],exit:[Math.floor(t.W/2),t.H-1]};
  m.block=new Uint8Array(m.W*m.H);
  m.furn.forEach(o=>{if(o.walk)return;for(let y=o.y;y<o.y+o.d;y++)for(let x=o.x;x<o.x+o.w;x++)if(x>=0&&y>=0&&x<m.W&&y<m.H)m.block[y*m.W+x]=1});
  // personāla vietas aiz letes
  m.staff=[];m.furn.forEach(o=>{if(o.staff){const sx=o.x+Math.floor(o.w/2),sy=o.y-1;if(sy>=0&&!m.block[sy*m.W+sx])m.staff.push({x:sx+.5,y:sy+.5,o});else m.staff.push({x:o.x+o.w+.5>m.W?o.x-.5:o.x+o.w+.5,y:o.y+.5,o})}});
  m.staff.forEach(s=>{const ix=Math.floor(s.x),iy=Math.floor(s.y);if(ix>=0&&iy>=0&&ix<m.W&&iy<m.H)m.block[iy*m.W+ix]=1});
  m.block[m.exit[1]*m.W+m.exit[0]]=0;
  m.walk=(x,y)=>x>=0&&y>=0&&x<m.W&&y<m.H&&!m.block[y*m.W+x];
  return m;
}
