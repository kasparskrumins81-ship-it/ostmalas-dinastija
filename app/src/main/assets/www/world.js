/* ===================== Manhetenas karte ===================== */
const W=64,H=64,ROADS=[9,19,29,39,49];
const BR=[[0,7],[12,17],[22,27],[32,37],[42,47],[52,58]];
const T={GRASS:0,ROAD:1,WALK:2,WATER:3,LOT:4,PLAZA:5,BLD:6,PROM:7,PIER:8,PARK:9,PATH:10,TSQ:11};
const DISTS={cp:{n:'Centrālparks',c:'#46b06b'},fa:{n:'Piektā avēnija',c:'#d8b45a'},ts:{n:'Taimskvērs',c:'#ff4fa3'},gv:{n:'Grīnvičvilidža',c:'#ff8a5c'},ct:{n:'Čainataun',c:'#e2303a'},ws:{n:'Volstrīta',c:'#3f7fd8'}};
const DMAP=[['cp','cp','cp','cp','fa','fa'],['cp','cp','cp','cp','fa','fa'],['ts','ts','ts','fa','fa','fa'],['gv','gv','ts','ct','ct','ws'],['gv','gv','gv','ct','ws','ws'],['gv','gv','ct','ws','ws','ws']];
const bIdx=v=>v<10?0:v<20?1:v<30?2:v<40?3:v<50?4:5;
function distAt(x,y){if(x<=37&&y<=17)return 'cp';return DMAP[bIdx(Math.max(0,Math.min(63,y)))][bIdx(Math.max(0,Math.min(63,x)))]}
// tips → izskats un darba laiks (stundas pēc 24 = nākamā nakts)
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
// [id, tips, nosaukums, bloks i, bloks j, rx, ry, w, d, h, durvju puse, nobīde]  (i<0: absolūtās koordinātas)
const BLD_SPEC=[
  // Centrālparks
  ['boathouse','boathouse','Laivu māja',-1,-1,20,10,3,2,40,'y',1],
  // Piektā avēnija
  ['met','museum','Metropolitēna muzejs',4,0,0,2,6,6,120,'y',3],['apt_fa','apt5','Piektās avēnijas nams',5,0,1,0,6,8,250,'x',4],
  ['plaza','hotel','Viesnīca „Plaza”',4,1,0,0,6,6,200,'y',3],['lincoln','opera','Linkolna centrs',5,1,0,0,7,6,110,'y',3],
  ['boutique','boutique','Butiks „Avēnija”',3,2,0,0,3,6,96,'y',1],['salon','salon','Stila salons',3,2,3,2,3,4,62,'y',1],
  ['empire','empire','Empīra Steita ēka',4,2,1,1,4,5,500,'y',2],['dept','dept','Universālveikals „Mega”',5,2,0,0,4,6,130,'y',2],['luxe','luxe','Juvelieri „Dimants”',5,2,4,2,3,4,72,'y',1],
  // Taimskvērs
  ['theater','theater','Brodvejas teātris',0,2,0,0,8,6,120,'y',4],['club','club','Naktsklubs „Supernova”',1,2,0,0,6,6,150,'y',3],
  ['arcade','arcade','Spēļu zāle „Pikselis”',2,2,0,0,6,2,210,'y',3],['pizza','pizza','Picērija „Rejs”',2,3,0,3,3,3,60,'y',1],['cinema','cinema','Kinoteātris „Ekrāns”',2,3,3,0,3,6,110,'y',1],
  // Grīnvičvilidža
  ['home','apt_home','Blīkera iela 14',0,3,0,1,4,5,96,'y',2],['deli','deli','Bodega „Uz stūra”',0,3,4,3,4,3,50,'y',2],
  ['cafe','cafe','Kafejnīca „Kafija & Co”',1,3,0,3,3,3,56,'y',1],['flowers','flowers','Ziedi un dāvanas',1,3,3,2,3,4,52,'y',1],
  ['pub','pub','Bārs „Vecā pīpe”',0,4,0,2,4,4,62,'y',2],['comedy','comedy','Komēdijas pagrabs',0,4,4,1,4,5,72,'y',2],
  ['gallery','gallery','Galerija „Bohēma”',1,4,0,1,3,5,70,'y',1],['records','records','Mūzikas veikals „Vinils”',1,4,3,3,3,3,52,'y',1],
  ['gym','gym','Sporta klubs „Titāns”',2,4,0,0,4,6,90,'y',2],['loft','apt_loft','Lofts Hjūstonas ielā',2,4,4,0,2,6,150,'y',1],
  ['jazz','jazz','Džeza klubs „Zilā nots”',0,5,0,0,4,7,72,'y',2],['apt_gv2','apt','Brūnakmens nams',0,5,4,2,4,5,100,'y',2],
  ['police','police','6. policijas iecirknis',1,5,0,1,3,6,82,'y',1],['apt_gv3','apt','Mortona ielas nams',1,5,3,1,3,6,120,'y',1],
  // Čainataun
  ['dimsum','dimsum','Restorāns „Zelta pūķis”',3,3,0,1,4,5,72,'y',2],['market','market','Ķīniešu tirgus',3,3,4,2,2,4,50,'y',1],
  ['kungfu','kungfu','Kung-fu skola „Tīģeris”',4,3,0,0,3,6,82,'y',1],['massage','massage','Masāžas salons „Lotoss”',4,3,3,2,3,4,60,'y',1],
  ['karaoke','karaoke','Karaoke bārs „Mēness”',3,4,0,2,3,4,70,'y',1],['apt_ct','apt_ct','Čainataunas studija',3,4,3,0,3,6,130,'y',1],
  ['teahouse','teahouse','Tējnīca „Nefrīts”',2,5,0,3,3,4,52,'y',1],['pawn','pawn','Lombards',2,5,3,2,3,5,62,'y',1],
  // Volstrīta
  ['bank','bank','Manhetenas banka',5,3,0,0,7,6,150,'y',3],['nyse','nyse','Ņujorkas birža',4,4,0,0,6,6,124,'y',3],
  ['office','office','Volstrīta 1',5,4,0,0,5,6,330,'y',2],['realty','realty','Nekustamie īpašumi',5,4,5,2,2,4,60,'y',1],
  ['diner','diner','Ēstuve „Vērsis”',3,5,0,3,3,4,56,'y',1],['tower2','office','Finanšu tornis',3,5,3,0,3,7,280,'y',1],
  ['penthouse','apt_pent','Volstrītas penthauss',4,5,0,0,4,7,380,'y',2],['seaport','seaport','Restorāns „Pīrs 17”',5,5,0,2,4,5,60,'y',2],['apt_ws','apt','Ūdensmalas nams',5,5,4,0,3,7,170,'y',1]
];
const BLDS=[];
const grid=new Uint8Array(W*H), blockG=new Uint8Array(W*H);
const gi=(x,y)=>y*W+x, inB=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const DECO=[]; let LAMPS=[], STATIONS=[], CITY_OBJS=[];
function buildCity(){
  const rr=mulberry(1905);
  grid.fill(T.LOT);
  for(let i=0;i<59;i++)for(const r of ROADS)for(const k of [r,r+1]){grid[gi(i,k)]=T.ROAD;grid[gi(k,i)]=T.ROAD}
  for(let i=0;i<59;i++)for(const r of ROADS)for(const k of [r-1,r+2]){if(grid[gi(i,k)]!==T.ROAD)grid[gi(i,k)]=T.WALK;if(grid[gi(k,i)]!==T.ROAD)grid[gi(k,i)]=T.WALK}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const e=Math.max(x,y);if(e>=61)grid[gi(x,y)]=T.WATER;else if(e===60)grid[gi(x,y)]=T.PROM;else if(e===59)grid[gi(x,y)]=T.WALK}
  for(let x=61;x<64;x++){grid[gi(x,45)]=T.PIER;grid[gi(x,46)]=T.PIER}
  for(let y=61;y<64;y++){grid[gi(30,y)]=T.PIER;grid[gi(31,y)]=T.PIER}
  // Grīnvičas dārziņi
  for(let y=0;y<59;y++)for(let x=0;x<59;x++)if(grid[gi(x,y)]===T.LOT&&distAt(x,y)==='gv')grid[gi(x,y)]=T.GRASS;
  // Centrālparks
  for(let y=0;y<=17;y++)for(let x=0;x<=37;x++){
    let t=T.PARK;const lk=((x+.5-17.5)/5.2)**2+((y+.5-4.6)/2.7)**2,pd=((x+.5-32.5)/2.6)**2+((y+.5-3.5)/1.7)**2;
    if(lk<1||pd<1)t=T.WATER;
    else if(y===13||x===6||x===27||((y===1||y===9)&&x>=10&&x<=25)||((x===10||x===25)&&y>=1&&y<=9)||(x===16&&y>=9))t=T.PATH;
    if(x>=14&&x<=17&&y>=10&&y<=12)t=T.PLAZA;
    grid[gi(x,y)]=t}
  // Taimskvērs
  for(let y=22;y<=27;y++)for(let x=22;x<=27;x++)grid[gi(x,y)]=T.TSQ;
  for(let y=52;y<=58;y++)for(let x=46;x<=47;x++)grid[gi(x,y)]=T.PLAZA;
  BLD_SPEC.forEach(([id,type,n,i,j,rx,ry,w,d,h,side,off],k)=>{
    const bx=i<0?rx:BR[i][0]+rx,by=j<0?ry:BR[j][0]+ry,meta=BT[type];
    const door=side==='y'?[bx+off,by+d]:[bx+w,by+off];
    const b={id,type,n,bx,by,w,d,h,side,door,style:meta.style,hours:meta.hours,wall:meta.wall||APTWALL[k%APTWALL.length],acc:meta.acc||pick(['#2e5e3a','#3b3f4c','#7a2b2b','#2b3a67']),roof:meta.roof,neon:meta.neon,seed:k*13+7,dist:distAt(bx+w/2,by+d/2)};
    BLDS.push(b);for(let y=by;y<by+d;y++)for(let x=bx;x<bx+w;x++){grid[gi(x,y)]=T.BLD;blockG[gi(x,y)]=1}
  });
  const isDoor=(x,y)=>BLDS.some(b=>b.door[0]===x&&b.door[1]===y);
  const free=(x,y)=>inB(x,y)&&!blockG[gi(x,y)]&&!isDoor(x,y)&&grid[gi(x,y)]!==T.WATER&&grid[gi(x,y)]!==T.ROAD;
  const addObj=(o,blocks)=>{if(!free(o.x,o.y))return false;CITY_OBJS.push(o);if(blocks)blockG[gi(o.x,o.y)]=1;return true};
  const near=(x,y,kind)=>{for(let r=0;r<6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const a=x+dx,b=y+dy;if(free(a,b)&&grid[gi(a,b)]===kind)return [a,b]}return [x,y]};
  // objekti parkā
  addObj({k:'fountain',x:15,y:11,act:'fountain'},true);
  [[5,12],[9,14],[20,14],[28,6],[28,10],[11,5],[24,3],[3,14],[33,14],[17,14],[7,2],[30,16],[2,8]].forEach(([x,y])=>addObj({k:'bench',x,y,act:'bench'},true));
  [[7,14],[26,12],[13,16],[24,24],[44,51]].forEach(([x,y])=>addObj({k:'cart',kind:'hotdog',x,y,act:'cart'},true));
  [[3,12],[4,12]].forEach(([x,y])=>addObj({k:'chess',x,y,act:'chess'},true));
  [[3,4],[33,8],[35,12],[21,16]].forEach(([x,y])=>addObj({k:'picnic',x,y,act:'picnic'},false));
  addObj({k:'carriage',x:35,y:16,act:'carriage'},true);
  addObj({k:'carousel',x:31,y:10,act:'carousel'},true);
  addObj({k:'jog',x:5,y:16,act:'jog'},true);
  // koki
  const tree=(x,y,kind,s)=>{const t=grid[gi(x,y)];if(free(x,y)&&(t===T.GRASS||t===T.PARK))addObj({k:'tree',kind,x,y,s:s||.85+rr()*.35},true)};
  for(let i=0;i<520;i++){const x=Math.floor(rr()*38),y=Math.floor(rr()*18);if(grid[gi(x,y)]===T.PARK&&rr()<.55)tree(x,y,rr()<.35?'pine':'round')}
  for(let i=0;i<200;i++){const x=Math.floor(rr()*59),y=Math.floor(rr()*59);if(grid[gi(x,y)]===T.GRASS&&rr()<.4)tree(x,y,'round',.75+rr()*.25)}
  for(let i=2;i<58;i+=5)for(const r of ROADS){[[i,r-1],[i,r+2],[r-1,i],[r+2,i]].forEach(([x,y])=>{const dd=distAt(x,y);if((dd==='gv'||dd==='fa')&&grid[gi(x,y)]===T.WALK&&free(x,y)&&rr()<.55)CITY_OBJS.push({k:'tree',kind:'round',x,y,s:.7,nb:1})})}
  // metro stacijas
  STATIONS=[['cp','59. iela – Centrālparks',13,18],['fa','5. avēnija – 53. iela',44,21],['ts','Taimskvērs – 42. iela',5,21],['gv','Kristofera iela',6,41],['ct','Kanāla iela',35,41],['ws','Volstrīta',55,48]].map(([d,n,x,y])=>{const p=near(x,y,T.WALK);const o={k:'subway',x:p[0],y:p[1],n,d,act:'subway'};addObj(o,true);return o});
  // taksometri, avīžu kioski, vērsis, Taimskvēra kāpnes
  [[21,31],[41,21],[48,41],[11,48],[38,38]].forEach(([x,y])=>{const p=near(x,y,T.WALK);addObj({k:'taxi',x:p[0],y:p[1],act:'taxi'},false)});
  [[18,21],[51,38],[8,38]].forEach(([x,y])=>{const p=near(x,y,T.WALK);addObj({k:'news',x:p[0],y:p[1],act:'news'},true)});
  addObj({k:'bull',x:46,y:55,act:'bull'},true);
  addObj({k:'steps',x:24,y:26,act:'steps'},true);addObj({k:'steps',x:25,y:26,act:'steps'},true);
  // hidranti (dekors)
  for(let i=4;i<58;i+=9)for(const r of ROADS){const x=i,y=r+2;if(grid[gi(x,y)]===T.WALK&&free(x,y)&&distAt(x,y)!=='cp')CITY_OBJS.push({k:'hydrant',x,y,nb:1})}
  // laternas
  for(let i=2;i<58;i+=6)for(const r of ROADS){LAMPS.push({x:i,y:r-1,o:[0,.4]});LAMPS.push({x:r+2,y:i,o:[-.4,0]})}
  LAMPS=LAMPS.filter(l=>grid[gi(l.x,l.y)]===T.WALK&&!isDoor(l.x,l.y));
  for(let x=2;x<37;x+=7)LAMPS.push({x,y:13,o:[0,.4]});
  // tāli orientieri
  DECO.push({k:'liberty',x:67.5,y:66},{k:'bridge',x:61,y:52.5},{k:'boat',x:62.5,y:40,c:'#f4f4f4'},{k:'boat',x:40,y:62.6,c:'#ffc857'},{k:'rowboat',x:16,y:4.5,c:'#c0643a'},{k:'rowboat',x:20,y:3.5,c:'#3f7fd8'});
}
buildCity();
function bld(id){return BLDS.find(b=>b.id===id)}
function walkCity(x,y){if(!inB(x,y))return false;const t=grid[gi(x,y)];return t!==T.WATER&&!blockG[gi(x,y)]}
function bfs(m,sx,sy,tx,ty,maxN=4600){
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
