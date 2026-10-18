/* ===================== Zīmēšana ===================== */
const cv=$('#world');let ctx=cv.getContext('2d');
let DPR=Math.min(window.devicePixelRatio||1,2),ZOOM=innerWidth<600?.9:1.15,K=1,CW=0,CH=0;
const cam={x:0,y:0,init:false};
let HITS=[],EMIS=[],NIGHT=0,DUSK=0,TIME=0,PDRAWN=false,ORD=0,DRAWN_B=[],SNOWY=false,WXP=[],WXK=null;
function occluded(x,y,ord){for(const d of DRAWN_B)if(d.ord>ord&&inPoly([x,y],d.hull))return true;return false}
const iso=(x,y)=>({x:(x-y)*HW,y:(x+y)*HH});
function resizeCanvas(){DPR=Math.min(window.devicePixelRatio||1,2);CW=cv.width=Math.round(innerWidth*DPR);CH=cv.height=Math.round(innerHeight*DPR);K=DPR*ZOOM;tileCache={}}
function setCam(){ctx.setTransform(K,0,0,K,CW/2-cam.x*K,CH/2-cam.y*K)}
function poly(pts,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fill()}
function ell(x,y,rx,ry,col){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);ctx.fill()}
function rrect(x,y,w,h,r,col){ctx.fillStyle=col;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);ctx.fill()}
function withFace(axis,X,Y,z,fn){ctx.save();const o=iso(X,Y);if(axis==='y')ctx.transform(HW,HH,0,-1,o.x,o.y-z);else ctx.transform(-HW,HH,0,-1,o.x,o.y-z);fn();ctx.restore()}
function withTile(x,y,fn){ctx.save();const o=iso(x,y);ctx.transform(HW,HH,-HW,HH,o.x,o.y);fn();ctx.restore()}
function textOnFace(axis,X,Y,u,v,text,col,size,bg){
  const o=iso(X,Y),px=o.x+(axis==='y'?u*HW:-u*HW),py=o.y+u*HH-v;
  ctx.save();ctx.transform(1,axis==='y'?.5:-.5,0,1,px,py);ctx.font=`700 ${size}px Sora, Figtree, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  const w=ctx.measureText(text).width;if(bg){rrect(-w/2-4,-size*.7,w+8,size*1.4,3,bg)}ctx.fillStyle=col;ctx.fillText(text,0,0);ctx.restore();return w;
}
function isoBox(x,y,w,d,h,c,z=0,cols){
  const t=cols?cols[0]:shade(c,1.12),l=cols?cols[1]:shade(c,.9),r=cols?cols[2]:shade(c,.74);
  const p00=iso(x,y),p10=iso(x+w,y),p11=iso(x+w,y+d),p01=iso(x,y+d);
  poly([[p01.x,p01.y-z],[p11.x,p11.y-z],[p11.x,p11.y-z-h],[p01.x,p01.y-z-h]],l);
  poly([[p10.x,p10.y-z],[p11.x,p11.y-z],[p11.x,p11.y-z-h],[p10.x,p10.y-z-h]],r);
  poly([[p00.x,p00.y-z-h],[p10.x,p10.y-z-h],[p11.x,p11.y-z-h],[p01.x,p01.y-z-h]],t);
}
function boxHull(x,y,w,d,h,z=0){const p00=iso(x,y),p10=iso(x+w,y),p11=iso(x+w,y+d),p01=iso(x,y+d);return [[p00.x,p00.y-z-h],[p10.x,p10.y-z-h],[p10.x,p10.y-z],[p11.x,p11.y-z],[p01.x,p01.y-z],[p01.x,p01.y-z-h]]}
function txt(s,x,y,col='#fff',size=10,weight=700){ctx.font=`${weight} ${size}px Figtree, sans-serif`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineWidth=3;ctx.strokeStyle='rgba(15,12,30,.75)';ctx.lineJoin='round';ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y)}
function hash(a,b,c=0){let h=(a*374761393+b*668265263+c*1442695041)|0;h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967296}
function inPoly(pt,poly){let ins=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))ins=!ins}return ins}

/* ---------- Zemes flīzes ---------- */
let tileCache={},KINDS=null;
function computeKinds(){KINDS=new Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=grid[gi(x,y)];let k;const d=distAt(x,y);
    if(t===T.ROAD){const hr=ROADS.some(r=>y===r||y===r+1),vr=ROADS.some(r=>x===r||x===r+1);
      if(hr&&!vr&&ROADS.some(a=>x===a-1||x===a+2))k='zebraY';else if(vr&&!hr&&ROADS.some(b=>y===b-1||y===b+2))k='zebraX';
      else if(hr&&!vr&&ROADS.includes(y))k='roadH';else if(vr&&!hr&&ROADS.includes(x))k='roadV';else k='road'}
    else if(t===T.WALK)k=d==='gv'?'walkB':d==='ct'?'walkC':d==='fa'?'walkF':'walk';
    else if(t===T.PROM)k='prom';else if(t===T.PLAZA)k='plaza';else if(t===T.PIER)k='pier';else if(t===T.PATH)k='path';else if(t===T.TSQ)k='tsq';else if(t===T.LOT)k='lot';
    else if(t===T.WATER){if(x<=37&&y<=17)k='lake';else{const e=Math.max(x,y);k=e<=61?'water0':e===62?'water1':'water2'}}
    else if(t===T.PARK)k=(x+y)%2?'park0':'park1';else k=(hash(x,y)<.5)?'grass0':'grass1';
    KINDS[gi(x,y)]=k}}
function paintTile(g,k){
  const R_=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)},rr=mulberry(k.length*97+k.charCodeAt(0)+k.charCodeAt(k.length-1)*7);
  const base={grass0:'#7fbf62',grass1:'#79b95d',park0:'#74b85a',park1:'#6fb355',road:'#4f535f',roadH:'#4f535f',roadV:'#4f535f',zebraX:'#4f535f',zebraY:'#4f535f',walk:'#c9c6bf',walkB:'#b98a74',walkC:'#c7b4a2',walkF:'#e0dace',
    prom:'#8a6a4a',plaza:'#d7d0c4',pier:'#9a7048',path:'#dccb9f',tsq:'#8d8a97',lot:'#a9a59e',lake:'#5bb2c4',water0:'#3f8db4',water1:'#357fa8',water2:'#2b6f98'}[k];
  R_(base,-.03,-.03,1.06,1.06);
  if(k.startsWith('grass')||k.startsWith('park')){for(let i=0;i<10;i++)R_(rr()<.5?'rgba(255,255,255,.07)':'rgba(0,60,0,.08)',rr(),rr(),.08,.03);if(k.startsWith('park')&&rr()<.7)for(let i=0;i<2;i++)R_(pick(['#ffe36b','#ff8fb8','#ffffff']),rr()*.9,rr()*.9,.05,.05)}
  if(k.startsWith('road')||k.startsWith('zebra')){for(let i=0;i<14;i++)R_(rr()<.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.07)',rr(),rr(),.04,.04)}
  if(k==='roadH')R_('#f2c94c',.1,.96,.8,.04);
  if(k==='roadV')R_('#f2c94c',.96,.1,.04,.8);
  if(k==='zebraY')for(let i=0;i<5;i++)R_('rgba(250,250,245,.92)',.08+i*.18,.06,.1,.88);
  if(k==='zebraX')for(let i=0;i<5;i++)R_('rgba(250,250,245,.92)',.06,.08+i*.18,.88,.1);
  if(k.startsWith('walk')){g.fillStyle=k==='walkB'?'rgba(90,40,25,.25)':'rgba(90,85,80,.18)';if(k==='walkB'){for(let i=0;i<=6;i++)g.fillRect(0,i/6,1,.015);for(let i=0;i<6;i++)for(let j=0;j<3;j++)g.fillRect(((j+(i%2)*.5)/3)%1,i/6,.012,1/6)}else{for(let i=0;i<=2;i++){g.fillRect(i*.5,0,.012,1);g.fillRect(0,i*.5,1,.012)}}}
  if(k==='plaza'||k==='lot'){g.fillStyle='rgba(120,110,100,.16)';g.fillRect(0,0,1,.02);g.fillRect(0,0,.02,1);g.fillRect(.5,0,.01,1);g.fillRect(0,.5,1,.01)}
  if(k==='tsq'){g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,0,1,.02);g.fillRect(0,0,.02,1);g.fillStyle='rgba(255,79,163,.12)';g.fillRect(.1,.1,.35,.35);g.fillStyle='rgba(47,224,208,.1)';g.fillRect(.55,.55,.35,.35)}
  if(k==='path')for(let i=0;i<16;i++)R_(rr()<.5?'rgba(150,120,70,.2)':'rgba(255,255,255,.25)',rr(),rr(),.03,.03);
  if(k==='prom'){g.fillStyle='rgba(50,30,15,.35)';for(let i=1;i<6;i++)g.fillRect(0,i/6,1,.015)}
  if(k==='pier'){g.fillStyle='rgba(50,30,15,.4)';for(let i=1;i<6;i++)g.fillRect(i/6,0,.02,1)}
  if(k.startsWith('water')||k==='lake')for(let i=0;i<4;i++)R_('rgba(255,255,255,.07)',rr(),rr(),.3,.02);
}
function paintSnow(g,k){const rr=mulberry(k.length*31+7);
  if(k.startsWith('water')||k==='lake')return;
  const a=k.startsWith('grass')||k.startsWith('park')?.82:k==='lot'||k==='plaza'||k==='path'?.6:k.startsWith('walk')||k==='prom'||k==='pier'||k==='tsq'?.38:.16;
  g.fillStyle=`rgba(250,252,255,${a})`;g.fillRect(-.03,-.03,1.06,1.06);for(let i=0;i<10;i++){g.fillStyle=rr()<.5?'rgba(255,255,255,.7)':'rgba(190,205,225,.35)';g.fillRect(rr(),rr(),.12,.06)}}
function tileSprite(k){
  const key=k+'@'+K.toFixed(2)+(SNOWY?'*':'');if(tileCache[key])return tileCache[key];
  const w=Math.ceil(TW*K)+2,h=Math.ceil(TH*K)+2,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  g.translate(1,1);g.scale(K,K);g.translate(HW,0);g.transform(HW,HH,-HW,HH,0,0);paintTile(g,k);if(SNOWY)paintSnow(g,k);return tileCache[key]=c;
}

/* ---------- Koki ---------- */
const sprCache={};
function treeSprite(kind){
  const key=kind+K.toFixed(2)+(SNOWY?'*':'');if(sprCache[key])return sprCache[key];
  const W_=110,H_=150,c=document.createElement('canvas');c.width=Math.ceil(W_*K);c.height=Math.ceil(H_*K);const g=c.getContext('2d');g.scale(K,K);g.translate(W_/2,H_-12);
  const blob=(x,y,r,col)=>{g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()};
  if(kind==='pine'){
    g.fillStyle='#6b4a2a';g.fillRect(-3,-16,6,16);
    [[34,-14,'#2f7a44'],[28,-36,'#348a4b'],[21,-56,'#3c9a52'],[13,-72,'#46a85b']].forEach(([w,y,col])=>{g.fillStyle=col;g.beginPath();g.moveTo(-w,y);g.lineTo(w,y);g.lineTo(0,y-30);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(-w,y);g.lineTo(0,y);g.lineTo(0,y-30);g.closePath();g.fill()});
  } else {
    g.fillStyle='#7a5432';g.fillRect(-3,-22,6,22);
    blob(-12,-36,17,'#4a9642');blob(12,-38,17,'#4a9642');blob(0,-52,20,'#54a44a');blob(-6,-40,14,'#5fb153');blob(8,-56,10,'#6fbf60');
  }
  if(SNOWY){if(kind==='pine'){[[34,-14],[28,-36],[21,-56],[13,-72]].forEach(([w,y])=>{g.fillStyle='rgba(255,255,255,.92)';g.beginPath();g.moveTo(-w*.55,y-12);g.lineTo(0,y-30);g.lineTo(w*.55,y-12);g.closePath();g.fill()})}else{blob(-12,-46,11,'#f4f8fc');blob(12,-48,11,'#f4f8fc');blob(0,-64,13,'#ffffff');blob(8,-62,7,'#ffffff')}}
  return sprCache[key]=c;
}
function drawTreeAt(kind,x,y,s=1){const c=treeSprite(kind);const p=iso(x+.5,y+.5);ell(p.x+6,p.y,20*s,7*s,'rgba(20,40,40,.18)');ctx.drawImage(c,p.x-55*s,p.y-138*s,110*s,150*s)}

/* ---------- Fasādes palīgi ---------- */
function windows(st,len,h,isDoor,doorU,fi,b,glow,ax,X,Y,z0){
  const lit=k=>hash(b.seed,k)<.6;
  if(st==='glass'||st==='empire'){
    const step=st==='empire'?14:22,ww=st==='empire'?.16:.46,hh=st==='empire'?9:18,du=st==='empire'?.3:.5;
    for(let v=(z0?6:32);v<h-6;v+=step){for(let u=.06;u<len-.1;u+=du){const L=lit(fi*1000+(v+z0)*10+u*10);ctx.fillStyle=NIGHT>.3?(L?'#ffe3a1':'#253a5c'):(st==='empire'?'#8fa7bf':(((u*10+v)|0)%3?'#9cc6ea':'#b9dcf6'));ctx.fillRect(u,v,ww,hh);if(L&&NIGHT>0)glow.push([ax,X,Y,u,v,ww,hh,z0])}}
    if(st==='glass'){ctx.fillStyle='rgba(255,255,255,.3)';for(let v=30;v<h;v+=22)ctx.fillRect(0,v,len,1.2)}
    else{ctx.fillStyle='rgba(255,255,255,.18)';for(let u=.02;u<len;u+=du)ctx.fillRect(u-.03,0,.02,h)}
    return}
  if(st==='bill'){
    // milzu LED reklāmas
    const hue=(b.seed*47)%360;
    for(let v=34,i=0;v<h-20;v+=Math.max(40,h/3.2),i++){const bh=Math.min(36,h-v-8);const g=ctx.createLinearGradient(0,v,len,v+bh);const t=TIME*.6+i+b.seed;
      g.addColorStop(0,`hsl(${(hue+t*40)%360} 85% ${NIGHT>.2?62:52}%)`);g.addColorStop(1,`hsl(${(hue+120+t*40)%360} 85% ${NIGHT>.2?58:46}%)`);ctx.fillStyle=g;ctx.fillRect(.08,v,len-.16,bh);
      ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(.08,v+bh*.62,len-.16,2);glow.push([ax,X,Y,.08,v,len-.16,bh,z0,`hsla(${(hue+60+t*40)%360},90%,60%,`])}
    ctx.fillStyle=NIGHT>.2?'#ffe6b5':'#bfe0f3';for(let u=.1;u<len-.2;u+=.6){if(isDoor&&Math.abs(u+.25-doorU)<.4)continue;ctx.fillRect(u,4,.48,20)}
    return}
  if(st==='warehouse'||st==='hut'){ctx.fillStyle='rgba(120,80,30,.25)';for(let v=4;v<h;v+=6)ctx.fillRect(0,v,len,1);for(let u=.4;u<len-.4;u+=.9){ctx.fillStyle=NIGHT>.3?'#ffe1a0':'#bfe0f3';ctx.fillRect(u,h*.35,.4,h*.35);if(NIGHT>0)glow.push([ax,X,Y,u,h*.35,.4,h*.35,z0])}return}
  const fh=st==='classic'?32:st==='brown'||st==='brick'?28:st==='china'?24:26,gf=st==='brown'?34:30;
  for(let v=gf;v<h-10;v+=fh){
    if(st==='deco'){ctx.fillStyle=b.acc;ctx.fillRect(0,v,len,2.5);ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(0,v+fh-7,len,1.6)}
    const dU=st==='brick'?.62:st==='china'?.55:.5;
    for(let u=.14;u<len-.2;u+=dU){
      const ww=st==='classic'?.22:st==='brick'?.46:st==='brown'?.2:.28,hh=st==='classic'?20:st==='brown'?18:st==='brick'?18:13,vv=v+(st==='classic'?7:5);
      if(isDoor&&Math.abs(u+ww/2-doorU)<.3&&v===gf)continue;
      const L=lit(fi*1000+v*10+u*10);
      if(st==='brown'){ctx.fillStyle='#f3ead8';ctx.fillRect(u-.04,vv-2,ww+.08,hh+4)}
      if(st==='china'){ctx.fillStyle='#2e8b57';ctx.fillRect(u-.04,vv-2,ww+.08,hh+4)}
      ctx.fillStyle=NIGHT>.3?(L?'#ffd98a':'#2b3350'):'#a8d4ef';ctx.fillRect(u,vv,ww,hh);
      if(st==='brick'){ctx.fillStyle='rgba(40,40,50,.6)';ctx.fillRect(u+ww/2-.01,vv,.02,hh);ctx.fillRect(u,vv+hh/2,ww,.8)}
      if(NIGHT<=.3){ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(u,vv+hh-4,ww*.4,4)}
      if(L&&NIGHT>0)glow.push([ax,X,Y,u,vv,ww,hh,z0]);
    }
  }
  if(st==='brick'){ctx.fillStyle='rgba(60,20,10,.12)';for(let v=6;v<h;v+=4)ctx.fillRect(0,v,len,.6)}
  if(st==='classic'){ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(0,h-8,len,8);ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,h-10,len,2)}
  if(st==='brown'||st==='brick'){ctx.fillStyle=shade(b.wall,.62);ctx.fillRect(0,h-7,len,7);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(0,h-8,len,1)}
  if(st==='china'){ctx.fillStyle='#ffc857';for(let u=.3;u<len;u+=1.1){ctx.fillRect(u,30,.16,h-44)}}
  if(['shop','deco','china','brown'].includes(st)&&b.type!=='hosp'){
    for(let u=.1;u<len-.2;u+=.6){if(isDoor&&Math.abs(u+.25-doorU)<.42)continue;if(st==='brown'&&!['pub','comedy','jazz'].includes(b.type))continue;ctx.fillStyle=NIGHT>.2?'#ffe6b5':'#bfe0f3';ctx.fillRect(u,4,.48,19);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(u+.02,6,.12,15);if(NIGHT>0)glow.push([ax,X,Y,u,4,.48,19,z0])}
  }
}

/* ---------- Ēkas ---------- */
function drawBuilding(b){
  if(b.style==='empire'){drawEmpire(b);return}
  const {bx,by,w,d,h}=b,st=b.style,wall=b.wall;
  const p00=iso(bx,by),p10=iso(bx+w,by),p11=iso(bx+w,by+d),p01=iso(bx,by+d);
  const doorFace=b.side,doorU=b.side==='y'?b.door[0]-bx+.5:(b.door[1]-by+.5);
  const fy=st==='glass'?shade(wall,1.08):st==='bill'?'#262338':shade(wall,.97),fx=st==='glass'?shade(wall,.86):st==='bill'?'#1d1a2c':shade(wall,.8);
  poly([[p01.x,p01.y],[p11.x,p11.y],[p11.x,p11.y-h],[p01.x,p01.y-h]],fy);
  poly([[p10.x,p10.y],[p11.x,p11.y],[p11.x,p11.y-h],[p10.x,p10.y-h]],fx);
  const faces=[['y',bx,by+d,w],['x',bx+w,by,d]];const glow=[];
  faces.forEach(([ax,X,Y,len],fi)=>{
    const isDoor=ax===doorFace;
    withFace(ax,X,Y,0,()=>{
      ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(0,0,len,4);
      windows(st,len,h,isDoor,doorU,fi,b,glow,ax,X,Y,0);
      if(st==='brown'&&ax==='x'&&h>70){ctx.strokeStyle='rgba(25,25,30,.85)';ctx.lineWidth=.04;for(let v=34;v<h-14;v+=28){ctx.fillStyle='rgba(25,25,30,.85)';ctx.fillRect(len*.3,v-2,len*.4,1.6);ctx.beginPath();ctx.moveTo(len*.3,v);ctx.lineTo(len*.7,v+24);ctx.stroke()}}
      if(isDoor){
        const du=doorU;ctx.fillStyle=st==='brown'?'#3b2a22':b.acc;ctx.fillRect(du-.24,0,.48,26);ctx.fillStyle=NIGHT>.2?'#ffe9b8':'#2d2a3a';ctx.fillRect(du-.17,0,.34,22);
        ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(du-.15,2,.08,18);if(NIGHT>0)glow.push([ax,X,Y,du-.17,0,.34,22,0]);
        if(st==='classic'){ctx.fillStyle='#fffaf0';for(const off of [-.62,-.42,.38,.58])ctx.fillRect(du+off,0,.08,h-14)}
      }
    });
    // markīze
    if(isDoor&&['shop','deco','hut','china','bill'].includes(st)){
      const e=ax==='y'?[HW,HH]:[-HW,HH],n=ax==='y'?[-7,3.5]:[7,3.5],o=iso(X,Y),u0=Math.max(0,doorU-.7),u1=Math.min(len,doorU+.7),segs=8;
      for(let i=0;i<segs;i++){const a=u0+(u1-u0)*i/segs,bb=u0+(u1-u0)*(i+1)/segs;
        const A=[o.x+e[0]*a,o.y+e[1]*a-34],B=[o.x+e[0]*bb,o.y+e[1]*bb-34];
        poly([A,B,[B[0]+n[0],B[1]+n[1]+8],[A[0]+n[0],A[1]+n[1]+8]],i%2?(st==='china'?'#ffc857':'#ffffff'):b.acc)}
    }
    // kāpnes pie brūnakmens namiem
    if(isDoor&&(st==='brown')){const du=doorU;if(ax==='y'){for(let i=0;i<3;i++)isoBox(bx+du-.32,by+d+i*.12,.64,.14,10-i*3,'#a8735c')}else{for(let i=0;i<3;i++)isoBox(bx+w+i*.12,by+du-.32,.14,.64,10-i*3,'#a8735c')}}
  });
  // lukturi Čainataunā
  if(st==='china'){const o=iso(bx,by+d),o2=iso(bx+w,by+d),ord=ORD;for(let i=0;i<=w*2;i++){const t=i/(w*2),x=o.x+(o2.x-o.x)*t,y=o.y+(o2.y-o.y)*t-40+Math.sin(t*Math.PI)*6;ell(x,y,3.4,4,'#e2303a');if(NIGHT>0)EMIS.push(()=>{if(!occluded(x,y,ord))ell(x,y,7,7,'rgba(255,90,60,.45)')})}}
  // izkārtne
  const sx=b.side==='y'?bx:bx+w,sy=b.side==='y'?by+d:by,signV=st==='glass'?34:(st==='hut'?h-6:Math.min(h-8,(st==='classic'?44:st==='brown'?28:36)));
  const short=b.n.length>24?b.n.split(' ').slice(0,3).join(' '):b.n;
  if(!['apt','apt_home','apt5','apt_loft','apt_pent'].includes(b.type)||b.id==='home')textOnFace(b.side,sx,sy,doorU,signV,b.id==='home'?'Blīkera 14':short,b.type==='luxe'?'#ffd36b':'#ffffff',7.5,st==='brown'?'rgba(30,20,15,.7)':shade(b.acc,.8));
  // jumts
  if(st==='hut'){
    const o=.25,A=iso(bx-o,by-o),B=iso(bx+w+o,by-o),C1=iso(bx+w+o,by+d+o),D=iso(bx-o,by+d+o),top=iso(bx+w/2,by+d/2);
    const rh=18;poly([[A.x,A.y-h],[B.x,B.y-h],[top.x,top.y-h-rh]],shade(b.acc,1.15));poly([[B.x,B.y-h],[C1.x,C1.y-h],[top.x,top.y-h-rh]],shade(b.acc,.8));poly([[D.x,D.y-h],[C1.x,C1.y-h],[top.x,top.y-h-rh]],b.acc);
  } else {
    const rc=st==='glass'?shade(wall,.85):st==='bill'?'#3a3650':(b.roof||shade(wall,.82));
    poly([[p00.x,p00.y-h],[p10.x,p10.y-h],[p11.x,p11.y-h],[p01.x,p01.y-h]],rc);
    const i0=iso(bx+.15,by+.15),i1=iso(bx+w-.15,by+.15),i2=iso(bx+w-.15,by+d-.15),i3=iso(bx+.15,by+d-.15);
    poly([[i0.x,i0.y-h],[i1.x,i1.y-h],[i2.x,i2.y-h],[i3.x,i3.y-h]],SNOWY?'#eef3f8':shade(rc,.86));
    if(st==='china'){const ov=.3,A=iso(bx-ov,by+d+ov),B2=iso(bx+w+ov,by+d+ov),C2=iso(bx+w+ov,by-ov);poly([[A.x,A.y-h+2],[B2.x,B2.y-h+2],[B2.x,B2.y-h-8],[A.x,A.y-h-8]],'#2e8b57');poly([[B2.x,B2.y-h+2],[C2.x,C2.y-h+2],[C2.x,C2.y-h-8],[B2.x,B2.y-h-8]],'#246f46');ell(A.x,A.y-h-9,3,3,'#ffc857');ell(B2.x,B2.y-h-9,3,3,'#ffc857')}
    roofExtras(b);
  }
  if(b.neon){const ax=b.side==='y'?'x':'y',X=ax==='x'?bx+w:bx,Y=ax==='x'?by:by+d,len=ax==='x'?d:w,u=ax==='x'?.3:len-.4;
    withFace(ax,X,Y,0,()=>{ctx.fillStyle='#14111c';ctx.fillRect(u-.17,h*.18,.34,h*.74)});
    const L=b.neon.length,step=Math.min(12,h*.68/L);for(let i=0;i<L;i++)textOnFace(ax,X,Y,u,h*.88-i*step,b.neon[i],NIGHT>.2?'#fff':b.acc,9);
    if(NIGHT>0)EMIS.push(()=>{ctx.save();ctx.shadowColor=b.acc;ctx.shadowBlur=14;for(let i=0;i<L;i++)textOnFace(ax,X,Y,u,h*.88-i*step,b.neon[i],b.acc,9);ctx.restore()});
  }
  if(glow.length)EMIS.push(()=>{glow.forEach(([ax,X,Y,u,v,ww,hh,z,led])=>withFace(ax,X,Y,z||0,()=>{ctx.globalAlpha=led?Math.min(1,.15+NIGHT*.7):Math.min(1,NIGHT*1.2);ctx.fillStyle=led?led+'.55)':'rgba(255,200,110,.75)';ctx.fillRect(u,v,ww,hh);if(!led){ctx.fillStyle='rgba(255,190,100,.18)';ctx.fillRect(u-.06,v-3,ww+.12,hh+6)}}));ctx.globalAlpha=1});
}
function towerSeg(b,x,y,w,d,z,h,wall,st,glow,fi0){
  const p00=iso(x,y),p10=iso(x+w,y),p11=iso(x+w,y+d),p01=iso(x,y+d);
  poly([[p01.x,p01.y-z],[p11.x,p11.y-z],[p11.x,p11.y-z-h],[p01.x,p01.y-z-h]],shade(wall,.98));
  poly([[p10.x,p10.y-z],[p11.x,p11.y-z],[p11.x,p11.y-z-h],[p10.x,p10.y-z-h]],shade(wall,.8));
  [['y',x,y+d,w],['x',x+w,y,d]].forEach(([ax,X,Y,len],fi)=>withFace(ax,X,Y,z,()=>windows(st,len,h,false,0,fi+fi0,b,glow,ax,X,Y,z||1)));
  poly([[p00.x,p00.y-z-h],[p10.x,p10.y-z-h],[p11.x,p11.y-z-h],[p01.x,p01.y-z-h]],SNOWY?'#eef3f8':shade(wall,1.12));
}
function drawEmpire(b){
  const {bx,by,w,d}=b,wall=b.wall,glow=[];
  const segs=[[0,0,w,d,0,110],[.35,.35,w-.7,d-.7,110,190],[.85,.85,w-1.7,d-1.7,300,110],[1.25,1.25,w-2.5,d-2.5,410,44]];
  segs.forEach(([ox,oy,sw,sd,z,h],i)=>towerSeg(b,bx+ox,by+oy,sw,sd,z,h,i===0?shade(wall,1.02):wall,'empire',glow,i*10));
  // ieeja un izkārtne
  const doorU=b.door[0]-bx+.5;
  withFace('y',bx,by+d,0,()=>{ctx.fillStyle=b.acc;ctx.fillRect(doorU-.4,0,.8,30);ctx.fillStyle=NIGHT>.2?'#ffe9b8':'#2d2a3a';ctx.fillRect(doorU-.3,0,.6,24)});
  textOnFace('y',bx,by+d,doorU,40,'EMPĪRA STEITA ĒKA','#ffffff',7,shade(b.acc,.75));
  const tp=iso(bx+w/2,by+d/2),top=454;
  ctx.fillStyle='#cfd3d8';ctx.fillRect(tp.x-3,tp.y-top-40,6,40);ctx.fillStyle='#e7e9ec';ctx.fillRect(tp.x-1.2,tp.y-top-96,2.4,58);
  const col=NIGHT>.2?['#ff4f6f','#ffffff','#4f8bff'][Math.floor(TIME/4)%3]:'#e8ecef';ell(tp.x,tp.y-top-30,5,3,col);
  if(NIGHT>0){EMIS.push(()=>{const g=ctx.createRadialGradient(tp.x,tp.y-top-30,2,tp.x,tp.y-top-30,60);g.addColorStop(0,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(tp.x-60,tp.y-top-90,120,120);ell(tp.x,tp.y-top-96,3,3,'#ff3b3b')})}
  if(glow.length)EMIS.push(()=>{ctx.globalAlpha=Math.min(1,NIGHT*1.2);glow.forEach(([ax,X,Y,u,v,ww,hh,z])=>withFace(ax,X,Y,z||0,()=>{ctx.fillStyle='rgba(255,200,110,.75)';ctx.fillRect(u,v,ww,hh)}));ctx.globalAlpha=1});
}
function roofExtras(b){
  const {bx,by,w,d,h}=b,cx=bx+w/2,cy=by+d/2;
  if(b.type==='hotel'){[[.6,.6],[w-1,.6]].forEach(([x,y])=>{const p=iso(bx+x,by+y);ctx.fillStyle='#fff';ctx.fillRect(p.x-1,p.y-h-26,2,26);const wv=Math.sin(TIME*3+x)*2;poly([[p.x+1,p.y-h-26],[p.x+16,p.y-h-24+wv],[p.x+16,p.y-h-16+wv],[p.x+1,p.y-h-18]],x<1?'#b22234':'#3c3b6e')});isoBox(bx+1.2,by+1.2,w-2.4,d-2.4,10,'#3f7a6a',h);return}
  if(b.style==='brick'||(b.style==='brown'&&h>90)){const p=iso(bx+w*.55,by+d*.4);ctx.fillStyle='#4a3a2a';[-7,-2,3,8].forEach(o=>ctx.fillRect(p.x+o,p.y-h-14,1.6,14));ctx.fillStyle='#8a5a36';ctx.fillRect(p.x-9,p.y-h-34,18,22);ell(p.x,p.y-h-34,9,4,'#a06a40');poly([[p.x-10,p.y-h-34],[p.x+10,p.y-h-34],[p.x,p.y-h-46]],'#5a3a26');return}
  if(b.type==='office'||b.type==='apt_pent'){const p=iso(cx,cy);ctx.fillStyle='#d6d9de';ctx.fillRect(p.x-1,p.y-h-40,2,40);if(Math.floor(TIME*1.2)%2===0){ell(p.x,p.y-h-41,3,3,'#ff3b3b');EMIS.push(()=>ell(p.x,p.y-h-41,7,7,'rgba(255,60,60,.5)'))}}
  if(b.type==='nyse'||b.type==='museum'||b.type==='bank'||b.type==='opera'){const p=iso(cx,by+d);poly([[iso(bx,by+d).x,iso(bx,by+d).y-h],[iso(bx+w,by+d).x,iso(bx+w,by+d).y-h],[p.x,p.y-h-24]],shade(b.wall,1.05));if(b.type==='nyse'){const q=iso(cx,cy);ctx.fillStyle='#999';ctx.fillRect(q.x-1,q.y-h-40,2,40);const wv=Math.sin(TIME*3)*2;poly([[q.x+1,q.y-h-40],[q.x+22,q.y-h-38+wv],[q.x+22,q.y-h-26+wv],[q.x+1,q.y-h-28]],'#b22234');poly([[q.x+1,q.y-h-40],[q.x+9,q.y-h-39+wv*.4],[q.x+9,q.y-h-33+wv*.4],[q.x+1,q.y-h-34]],'#3c3b6e')}return}
  if(b.style==='bill'){const p=iso(cx,cy);isoBox(bx+.3,by+.3,w-.6,.2,24,'#222',h);return}
  if(b.style!=='china'){isoBox(bx+.3,by+.3,.5,.4,9,'#c4c9d1',h);if(w>2)isoBox(bx+w-.9,by+d*.45,.45,.45,7,'#b5bac2',h)}
}
function drawShadow(b){
  const {bx,by,w,d}=b,h=b.style==='empire'?454:b.h,s=Math.min(h,260)/48,dx=.55*s,dy=-.12*s;
  const pts=[[bx,by],[bx+w,by],[bx+w,by+d],[bx,by+d],[bx+dx,by+dy],[bx+w+dx,by+dy],[bx+w+dx,by+d+dy],[bx+dx,by+d+dy]].map(([x,y])=>{const p=iso(x,y);return [p.x,p.y]});
  poly(hull(pts),`rgba(25,35,70,${(.2*(1-NIGHT)).toFixed(3)})`);
}
function hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];for(const p of P){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}return lo.slice(0,-1).concat(up.slice(0,-1))}
const bldH=b=>b.style==='empire'?550:b.h+(b.style==='hut'?18:b.style==='brick'?46:20);

/* ---------- Cilvēki ---------- */
function heart(x,y,s,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y+s*.9);ctx.bezierCurveTo(x-s*1.4,y-s*.1,x-s*.7,y-s*1.2,x,y-s*.35);ctx.bezierCurveTo(x+s*.7,y-s*1.2,x+s*1.4,y-s*.1,x,y+s*.9);ctx.fill()}
function drawPerson(sx,sy,L,sex,ph,moving,dir,o={}){
  const sc=o.scale||1;
  ctx.save();ctx.translate(sx,sy);ctx.scale(sc,sc);
  if(!o.noShadow)ell(0,0,11,4.5,'rgba(20,20,40,.25)');
  const front=dir<2,flip=(dir===0||dir===3);if(flip)ctx.scale(-1,1);
  const sw=moving?Math.sin(ph):0,bob=moving?Math.abs(Math.cos(ph))*1.2:Math.sin(TIME*2+sx)*.3;
  ctx.translate(0,-bob);
  const top=L.top,bot=L.bot,skin=L.skin,tt=top.t,dress=tt==='dress',coat=tt==='coat';
  const legCol=bot.t==='shorts'||bot.t==='skirt'||dress?skin:bot.c;
  const leg=(x,lift)=>{rrect(x,-14+lift*.3,5,14-lift,2,legCol);if(bot.t==='shorts')rrect(x-.3,-14,5.6,6,1.5,bot.c);ell(x+2.5,-lift*.6,3.4,2,L.shoe)};
  leg(-5.5+sw*1.4,Math.max(0,sw)*2.4);leg(.5-sw*1.4,Math.max(0,-sw)*2.4);
  if(bot.t==='skirt'){poly([[-7,-15],[7,-15],[8.5,-7],[-8.5,-7]],bot.c)}
  const tc=top.c,dark=shade(tc,.78);
  // ķermenis
  if(coat){rrect(-8.5,-29,17,23,5,tc);ctx.fillStyle=dark;ctx.fillRect(-8.5,-17,17,2);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(-.4,-27,.8,21);ell(-2,-23,.9,.9,dark);ell(-2,-19,.9,.9,dark)}
  else rrect(-7.5,-29,15,16,5,tt==='leather'?'#2a2a30':tc);
  if(dress)poly([[-7.5,-17],[7.5,-17],[10,-5],[-10,-5]],tc);
  ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(2.5,-28,5,15);
  if(tt==='jacket'||tt==='suit'){poly([[-2,-29],[2,-29],[0,-20]],'#f4f1ea');poly([[-5,-29],[-1.5,-29],[-1,-18]],dark);poly([[5,-29],[1.5,-29],[1,-18]],dark);if(tt==='suit'){poly([[-.9,-27],[.9,-27],[1.3,-19],[0,-17],[-1.3,-19]],L.tie||'#b22234')}}
  if(tt==='shirt'){poly([[-3.5,-29],[0,-26],[-1,-24]],'#ffffff');poly([[3.5,-29],[0,-26],[1,-24]],'#ffffff');ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(-.3,-25,.8,11)}
  if(tt==='hoodie'){ctx.fillStyle=dark;ctx.fillRect(-4,-19,8,1.4);ctx.strokeStyle=dark;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-2,-28);ctx.lineTo(-2,-23);ctx.moveTo(2,-28);ctx.lineTo(2,-23);ctx.stroke()}
  if(tt==='tank'){ctx.fillStyle=skin;ctx.fillRect(-7.5,-29,3,4);ctx.fillRect(4.5,-29,3,4)}
  if(tt==='sweater'){ctx.fillStyle=shade(tc,1.25);for(let y=-26;y<-14;y+=4)ctx.fillRect(-7.5,y,15,1.6);ctx.fillStyle=dark;ctx.fillRect(-7.5,-15,15,2)}
  if(tt==='leather'){poly([[-5,-29],[-1,-29],[-2,-22]],'#3e3e46');poly([[5,-29],[1,-29],[2,-22]],'#3e3e46');ctx.fillStyle='#bbb';ctx.fillRect(-.3,-27,.6,13);ctx.fillStyle=tc;ctx.fillRect(-2,-29,4,3)}
  const sleeve=['shirt','jacket','hoodie','sweater','coat','suit','leather'].includes(tt)?'long':tt==='tee'?'short':'none';
  const armC=tt==='leather'?'#2a2a30':tc;
  const holdU=o.umbrella;
  const arm=(x,a)=>{ctx.save();ctx.translate(x,-27);ctx.rotate(a);rrect(-2,0,4,13,2,sleeve==='long'?armC:skin);if(sleeve==='short')rrect(-2.2,0,4.4,5,2,tc);ell(0,13.5,2.4,2.4,skin);ctx.restore()};
  arm(-9,sw*.55);arm(9,holdU?-2.4:-sw*.55);
  if(L.acc==='bag'){ctx.strokeStyle='#5a3a26';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-5,-29);ctx.lineTo(6,-15);ctx.stroke();rrect(4,-17,7,7,2,L.bagC||'#8a5a36')}
  if(L.acc==='necklace'){ctx.strokeStyle='#ffd36b';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,-28,4,.2,Math.PI-.2);ctx.stroke()}
  // galva
  ctx.fillStyle=skin;ctx.fillRect(-2,-31,4,3);
  if(L.acc==='scarf'){rrect(-7,-32,14,4.5,2,L.scarfC||'#c0392b');rrect(2,-30,3.5,9,1.5,L.scarfC||'#c0392b')}
  const hc=L.hairC,hs=L.hair,hatOn=L.acc==='beanie'||L.acc==='copcap';
  if(!hatOn){
    if(hs==='afro')ell(0,-43,15.5,14,hc);
    if(front&&(hs==='long'||hs==='braids'))rrect(-11.5,-44,23,18,6,hc);
    if(front&&hs==='bob')rrect(-12,-45,24,14,6,hc);
    if(!front&&(hs==='long'||hs==='pony'||hs==='braids'||hs==='bob'))rrect(-11,-44,22,(hs==='long'||hs==='braids'?20:hs==='bob'?14:10),6,hc);
    if(front&&hs==='pony'){ctx.save();ctx.translate(-10,-40);ctx.rotate(.5+Math.sin(TIME*4)*.08);rrect(-3,0,6,12,3,hc);ctx.restore()}
  }
  ell(0,-39,10.5,10.8,skin);
  if(front){
    const ex=o.expr;
    if(ex==='happy'||ex==='laugh'){ctx.strokeStyle='#2a2230';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(-2.6,-37.6,1.8,Math.PI*1.1,Math.PI*1.9);ctx.stroke();ctx.beginPath();ctx.arc(4.4,-37.6,1.8,Math.PI*1.1,Math.PI*1.9);ctx.stroke()}
    else if(ex==='love'){heart(-2.6,-38.6,2.3,'#ff3d6e');heart(4.4,-38.6,2.3,'#ff3d6e')}
    else{ell(-2.6,-38.5,1.5,2.1,'#2a2230');ell(4.4,-38.5,1.5,2.1,'#2a2230');ell(-2.2,-39.2,.5,.6,'#fff');ell(4.8,-39.2,.5,.6,'#fff');
      if(ex==='bored'){ctx.fillStyle=skin;ctx.fillRect(-4.4,-41.2,3.6,2.4);ctx.fillRect(2.6,-41.2,3.6,2.4);ctx.fillStyle='#2a2230';ctx.fillRect(-4.4,-39,3.6,.6);ctx.fillRect(2.6,-39,3.6,.6)}}
    if(ex==='angry'||ex==='sad'){ctx.strokeStyle='#3a2a20';ctx.lineWidth=1.2;const d=ex==='angry'?1:-1;ctx.beginPath();ctx.moveTo(-4.6,-42.4-d*.9);ctx.lineTo(-.9,-41.4+d*.9);ctx.moveTo(6.4,-42.4-d*.9);ctx.lineTo(2.7,-41.4+d*.9);ctx.stroke()}
    ctx.strokeStyle='#8a4a3a';ctx.lineWidth=1;
    if(ex==='happy'){ctx.fillStyle='#8a2a3a';ctx.beginPath();ctx.arc(1.4,-35,2.6,0,Math.PI);ctx.fill()}
    else if(ex==='laugh'){ctx.fillStyle='#8a2a3a';ctx.beginPath();ctx.ellipse(1.4,-34.4,2.6,2.2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff8fa0';ctx.beginPath();ctx.ellipse(1.4,-33.4,1.5,.9,0,0,Math.PI*2);ctx.fill()}
    else if(ex==='bored'){ctx.beginPath();ctx.moveTo(-.4,-34);ctx.lineTo(3.2,-34);ctx.stroke()}
    else if(ex==='angry'||ex==='sad'){ctx.beginPath();ctx.arc(1.4,-32.4,2.1,Math.PI*1.15,Math.PI*1.85);ctx.stroke()}
    else{ctx.beginPath();ctx.arc(1.4,-34.5,2,.2,Math.PI-.2);ctx.stroke()}
    const bl=ex==='love'?'rgba(255,90,120,.55)':ex==='angry'?'rgba(255,60,60,.35)':'rgba(255,120,120,.35)';
    ell(-5.5,-35.5,1.8,1,bl);ell(7,-35.5,1.8,1,bl);
    ell(9.5,-38,1.6,2.4,shade(skin,.9));
    if(L.beard){ctx.fillStyle=hc;ctx.beginPath();ctx.ellipse(1,-32.5,7.5,4.2,0,0,Math.PI);ctx.fill();ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(1.4,-33.4,2.6,1.1,0,0,Math.PI*2);ctx.fill();if(ex==='happy'||ex==='laugh'){ctx.fillStyle='#8a2a3a';ctx.beginPath();ctx.arc(1.4,-34.2,2.2,0,Math.PI);ctx.fill()}}
  } else if(L.beard){}
  // mati priekšā
  ctx.fillStyle=hc;
  const cap=()=>{ctx.beginPath();ctx.ellipse(0,-41,11.2,9.5,0,Math.PI*1.02,Math.PI*1.98);ctx.fill();ctx.beginPath();ctx.ellipse(1,-44,10.5,6.5,0,0,Math.PI*2);ctx.fill()};
  if(hs!=='bald'&&!hatOn){
    if(!front&&hs!=='afro'){ell(0,-40,11,10.5,hc)}
    else if(hs==='afro'){ell(0,-48,13,8,hc);[[-11,-42],[11,-42],[-8,-50],[8,-50],[0,-53]].forEach(([x,y])=>ell(x,y,5,5,hc))}
    else if(hs==='mohawk'){rrect(-2,-55,5,14,2,hc);ctx.fillRect(-10,-42,2,4);ctx.fillRect(8,-42,2,4)}
    else if(hs==='curly'){[[-8,-44],[-3,-48],[3,-48],[8,-44],[10,-39],[-10,-39]].forEach(([x,y])=>ell(x,y,4.5,4.5,hc))}
    else if(hs==='spiky'){cap();for(let i=0;i<5;i++){const x=-9+i*4.5;poly([[x-2.5,-46],[x+2.5,-46],[x+1,-54+(i%2)*2]],hc)}}
    else if(hs==='buzz'){ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(0,-42,10.8,8.5,0,Math.PI,0);ctx.fill();ctx.globalAlpha=1}
    else if(hs==='slick'){cap();ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillRect(-6,-48,10,1.2)}
    else{cap();if(hs==='short'){ctx.beginPath();ctx.moveTo(-8,-44);ctx.quadraticCurveTo(2,-36,9,-44);ctx.fill()}else{ctx.beginPath();ctx.moveTo(-10,-42);ctx.quadraticCurveTo(-2,-37,10,-43);ctx.lineTo(10,-46);ctx.fill()}
      if(hs==='bun')ell(-1,-52,5,5,hc);if(hs==='long'||hs==='braids'){rrect(-11.5,-42,3.5,13,2,hc);rrect(8.5,-42,3,10,2,hc)}
      if(hs==='braids'){ctx.fillStyle=hc;for(let i=0;i<4;i++){ell(-10,-28+i*3.2,2.2,1.8,hc);ell(10,-28+i*3.2,2.2,1.8,hc)}}
      if(hs==='bob'){rrect(-12,-43,4,11,2,hc);rrect(8,-43,4,11,2,hc)}}
  }
  if(L.acc==='sunglasses'&&front){rrect(-5.5,-40.5,6,3.4,1.5,'#1b1b22');rrect(1.5,-40.5,6,3.4,1.5,'#1b1b22');ctx.fillStyle='#1b1b22';ctx.fillRect(.5,-39.5,1,.8)}
  if(L.acc==='cap'){ctx.fillStyle=o.capC||L.capC||'#2b3a67';ctx.beginPath();ctx.ellipse(0,-45,10.5,6.5,0,Math.PI,0);ctx.fill();if(front)rrect(4,-46,10,3,1.5,shade(L.capC||'#2b3a67',.8))}
  if(L.acc==='beanie'){ctx.fillStyle=o.capC||L.capC||'#c0392b';ctx.beginPath();ctx.ellipse(0,-44,11,9,0,Math.PI,0);ctx.fill();ctx.fillRect(-11,-45,22,4);ell(0,-53,3,3,'#f4f4f4')}
  if(L.acc==='copcap'){ctx.fillStyle='#1f2a4d';ctx.fillRect(-11,-49,22,6);rrect(-10,-55,20,7,2,'#1f2a4d');if(front){rrect(-8,-44,16,2.5,1,'#111');ell(0,-51,2.4,2.4,'#ffd36b')}}
  if(L.acc==='hat'){ell(0,-46,15,4.5,'#d9c38f');rrect(-8,-56,16,10,4,'#d9c38f');ctx.fillStyle='#8a5a36';ctx.fillRect(-8,-49,16,2.5)}
  if(L.acc==='headphones'){ctx.strokeStyle='#222';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-41,11.5,Math.PI*1.05,Math.PI*1.95);ctx.stroke();rrect(-13,-42,4,7,2,L.capC||'#e2303a');rrect(9,-42,4,7,2,L.capC||'#e2303a')}
  if(L.dirty){ctx.strokeStyle='rgba(120,160,60,.55)';ctx.lineWidth=1.2;for(let i=0;i<3;i++){const a=TIME*2+i*2;ctx.beginPath();ctx.moveTo(-6+i*6,-58);ctx.quadraticCurveTo(-3+i*6+Math.sin(a)*3,-64,-6+i*6,-70);ctx.stroke()}for(let i=0;i<3;i++){const a=TIME*7+i*2.1;ell(Math.cos(a)*13,-46+Math.sin(a*1.3)*8,1.1,1.1,'#222')}}
  if(holdU){ctx.strokeStyle='#333';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(12,-20);ctx.lineTo(4,-66);ctx.stroke();const uc=typeof holdU==='string'?holdU:'#2b3a67';
    ctx.fillStyle=uc;ctx.beginPath();ctx.moveTo(-16,-60);ctx.quadraticCurveTo(3,-86,24,-64);for(let i=0;i<5;i++){const x0=24-i*8;ctx.quadraticCurveTo(x0-4,-61,x0-8,-63)}ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(-8,-66);ctx.quadraticCurveTo(3,-82,10,-70);ctx.lineTo(3,-66);ctx.closePath();ctx.fill()}
  ctx.restore();
}
function dirFrom(dx,dy){if(Math.abs(dx)>Math.abs(dy))return dx>0?1:3;return dy>0?0:2}

/* ---------- Mašīnas ---------- */
function drawCar(c){
  const len=1.05,wid=.5,ax=c.ax,x0=ax==='x'?c.x-len/2:c.x-wid/2,y0=ax==='x'?c.y-wid/2:c.y-len/2,w=ax==='x'?len:wid,d=ax==='x'?wid:len;
  const p=iso(c.x,c.y);ell(p.x,p.y+2,26,10,'rgba(20,20,40,.22)');
  [[.15,.05],[.85,.05],[.15,.95],[.85,.95]].forEach(([a,b2])=>{const q=iso(x0+(ax==='x'?a*w:b2*w),y0+(ax==='x'?b2*d:a*d));ell(q.x,q.y-3,4,3,'#1a1a20')});
  isoBox(x0,y0,w,d,8,c.col,3);
  const cw=ax==='x'?w*.55:w*.9,cd=ax==='x'?d*.9:d*.55,cx=ax==='x'?x0+w*.2+(c.dir<0?w*.1:0):x0+w*.05,cy=ax==='x'?y0+d*.05:y0+d*.2+(c.dir<0?d*.1:0);
  isoBox(cx,cy,cw,cd,7,'#2b3446',11,['#3a4660','#9fc6e8','#7aa3c8']);
  if(c.taxi){const q=iso(c.x,c.y);rrect(q.x-6,q.y-26,12,5,2,'#fff6c8');ctx.fillStyle='#222';ctx.font='700 4px sans-serif';ctx.textAlign='center';ctx.fillText('TAXI',q.x,q.y-22.5);ctx.fillStyle='#111';ctx.fillRect(q.x-12,q.y-12,24,1.4)}
  if(NIGHT>0){const f=ax==='x'?(c.dir>0?iso(x0+w,c.y):iso(x0,c.y)):(c.dir>0?iso(c.x,y0+d):iso(c.x,y0)),ord=ORD;EMIS.push(()=>{if(occluded(f.x,f.y-6,ord))return;const g=ctx.createRadialGradient(f.x,f.y-6,1,f.x,f.y-6,30);g.addColorStop(0,`rgba(255,240,190,${.7*NIGHT})`);g.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=g;ctx.fillRect(f.x-30,f.y-36,60,60)})}
}

/* ---------- Pilsētas objekti ---------- */
function drawCityObj(o){
  const p=iso(o.x+.5,o.y+.5);
  switch(o.k){
  case 'tree':drawTreeAt(o.kind,o.x,o.y,o.s);return;
  case 'bench':isoBox(o.x+.15,o.y+.35,.7,.3,7,'#5a6b3a',5);isoBox(o.x+.15,o.y+.32,.7,.06,14,'#4a5a30',5);ctx.fillStyle='#222';ctx.fillRect(p.x-14,p.y-5,2,6);ctx.fillRect(p.x+12,p.y-5,2,6);return;
  case 'cart':isoBox(o.x+.15,o.y+.2,.7,.6,18,'#c0c4ca',4);ell(p.x-10,p.y-2,4,4,'#333');ell(p.x+8,p.y+2,4,4,'#333');ctx.fillStyle='#ccc';ctx.fillRect(p.x-1,p.y-50,2,30);poly([[p.x-22,p.y-46],[p.x+22,p.y-46],[p.x,p.y-58]],'#ffc857');poly([[p.x-22,p.y-46],[p.x-7,p.y-46],[p.x,p.y-58]],'#3f7fd8');textOnFace('y',o.x+.15,o.y+.8,.35,14,'HOT DOG','#c0392b',4.5);return;
  case 'atm':isoBox(o.x+.3,o.y+.3,.4,.3,28,'#3f6fb5');return;
  case 'taxi':ctx.fillStyle='#555';ctx.fillRect(p.x-1,p.y-40,2,40);rrect(p.x-12,p.y-52,24,12,3,'#ffd23f');ctx.fillStyle='#222';ctx.font='800 7px Sora, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('TAXI',p.x,p.y-46);return;
  case 'fountain':ell(p.x,p.y,40,20,'#cfc6b3');ell(p.x,p.y-4,36,18,'#bfb6a2');ell(p.x,p.y-5,32,16,'#57c3e6');ctx.fillStyle='#d8d0bf';ctx.fillRect(p.x-4,p.y-30,8,26);ell(p.x,p.y-30,14,6,'#e2dbc9');
    ctx.fillStyle='#7a8a7a';ctx.fillRect(p.x-2,p.y-48,4,18);ell(p.x,p.y-50,4,4,'#7a8a7a');poly([[p.x-2,p.y-46],[p.x-14,p.y-54],[p.x-3,p.y-42]],'#8a9a8a');poly([[p.x+2,p.y-46],[p.x+14,p.y-54],[p.x+3,p.y-42]],'#8a9a8a');
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+TIME;ell(p.x+Math.cos(a)*14,p.y-28+Math.sin(a)*6,1.5,1.5,'#eaffff')}return;
  case 'chess':isoBox(o.x+.25,o.y+.25,.5,.5,14,'#8a8f99');withTile(o.x+.25,o.y+.25,()=>{});{const q=iso(o.x+.5,o.y+.5);ctx.save();ctx.translate(q.x,q.y-14);ctx.scale(1,.5);ctx.rotate(Math.PI/4);for(let i=0;i<4;i++)for(let j=0;j<4;j++){ctx.fillStyle=(i+j)%2?'#222':'#eee';ctx.fillRect(-10+i*5,-10+j*5,5,5)}ctx.restore()}isoBox(o.x-.05,o.y+.4,.25,.25,8,'#6b6f7d');isoBox(o.x+.8,o.y+.4,.25,.25,8,'#6b6f7d');return;
  case 'picnic':withTile(o.x,o.y,()=>{for(let i=0;i<4;i++)for(let j=0;j<4;j++){ctx.fillStyle=(i+j)%2?'#e2303a':'#ffffff';ctx.fillRect(.1+i*.2,.1+j*.2,.2,.2)}});rrect(p.x-6,p.y-10,12,8,2,'#a0703a');ctx.strokeStyle='#7a5228';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(p.x,p.y-10,5,Math.PI,0);ctx.stroke();return;
  case 'carriage':{ell(p.x+14,p.y-2,20,8,'rgba(0,0,0,.18)');ctx.fillStyle='#f4f1ea';rrect(p.x+8,p.y-22,22,10,5,'#f4f1ea');ctx.fillStyle='#e6e1d8';[[10,-14],[14,-12],[24,-14],[28,-12]].forEach(([dx,dy])=>ctx.fillRect(p.x+dx,p.y+dy,2.4,12));rrect(p.x+26,p.y-32,7,14,3,'#f4f1ea');ell(p.x+32,p.y-33,4,3,'#f4f1ea');ctx.fillStyle='#9a6a3a';ctx.fillRect(p.x+25,p.y-31,2,8);
    isoBox(o.x-.2,o.y+.1,.55,.6,14,'#1b1b22',8);ell(p.x-14,p.y-2,7,7,'#3a3a44');ell(p.x-14,p.y-2,5,5,'#c9a227');ell(p.x-2,p.y+3,6,6,'#3a3a44');poly([[p.x-20,p.y-30],[p.x-4,p.y-26],[p.x-6,p.y-38],[p.x-18,p.y-40]],'#9b2335');return}
  case 'carousel':{ell(p.x,p.y,30,15,'#c9a227');ell(p.x,p.y-4,28,14,'#f4e3b0');for(let i=0;i<6;i++){const a=i/6*Math.PI*2+TIME*.8,x=p.x+Math.cos(a)*20,y=p.y-6+Math.sin(a)*9;ctx.fillStyle='#ddd';ctx.fillRect(x-.7,y-34,1.4,30);rrect(x-5,y-18+Math.sin(TIME*3+i)*3,10,6,3,['#ff6f61','#2fb7b0','#ffc857','#9b5bd6','#ff4fa3','#46b06b'][i])}
    poly([[p.x-32,p.y-38],[p.x+32,p.y-38],[p.x,p.y-60]],'#e2303a');poly([[p.x-32,p.y-38],[p.x-10,p.y-38],[p.x,p.y-60]],'#ffffff');ell(p.x,p.y-38,32,8,'#c9a227');if(NIGHT>0)EMIS.push(()=>{for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ell(p.x+Math.cos(a)*30,p.y-38+Math.sin(a)*7,2.5,2.5,'rgba(255,220,140,.8)')}});return}
  case 'jog':ctx.fillStyle='#5a3a26';ctx.fillRect(p.x-1,p.y-38,2.4,38);rrect(p.x-18,p.y-44,36,12,2,'#2e5e3a');ctx.fillStyle='#fff';ctx.font='700 5.5px Figtree, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('SKRIEŠANAS TAKA',p.x,p.y-38);return;
  case 'news':isoBox(o.x+.15,o.y+.2,.7,.6,30,'#2e5e3a');isoBox(o.x+.1,o.y+.15,.8,.7,3,'#244a2e',30);withFace('y',o.x+.15,o.y+.8,0,()=>{for(let i=0;i<4;i++){ctx.fillStyle=['#ff6f61','#ffc857','#f4f4f4','#3f7fd8'][i];ctx.fillRect(.06+i*.16,8,.12,12)}});textOnFace('y',o.x+.15,o.y+.8,.35,26,'NEWS','#fff',4.5);return;
  case 'bull':{isoBox(o.x+.1,o.y+.25,.8,.5,6,'#7a7a80');const b='#8a5a2a';rrect(p.x-16,p.y-24,30,13,6,b);ell(p.x+14,p.y-20,7,6,b);ctx.strokeStyle='#c9a26a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x+15,p.y-25);ctx.quadraticCurveTo(p.x+24,p.y-32,p.x+26,p.y-26);ctx.stroke();ctx.beginPath();ctx.moveTo(p.x+11,p.y-25);ctx.quadraticCurveTo(p.x+6,p.y-34,p.x+2,p.y-31);ctx.stroke();ctx.fillStyle=b;[[-13,-12],[-8,-12],[6,-12],[10,-12]].forEach(([dx,dy])=>ctx.fillRect(p.x+dx,p.y+dy,3,8));ctx.strokeStyle=b;ctx.beginPath();ctx.moveTo(p.x-16,p.y-22);ctx.quadraticCurveTo(p.x-26,p.y-30,p.x-22,p.y-38);ctx.stroke();ell(p.x-1,p.y-22,10,3,'rgba(255,220,160,.25)');return}
  case 'steps':for(let i=0;i<4;i++)isoBox(o.x+.05,o.y+.05+i*.22,.9,.24,22-i*5,'#c0303f');if(NIGHT>0||true)EMIS.push(()=>{ctx.globalAlpha=.35+NIGHT*.4;isoBox(o.x+.05,o.y+.05,.9,.9,2,'#ff4f6f',22);ctx.globalAlpha=1});return;
  case 'manhole':{ell(p.x,p.y,13,6.5,'#3a3d46');ell(p.x,p.y,11,5.5,'#4a4e58');ctx.strokeStyle='rgba(20,20,25,.6)';ctx.lineWidth=.8;for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(p.x+i*4-3,p.y-3.6);ctx.lineTo(p.x+i*4+3,p.y+3.6);ctx.stroke()}
    const cold=SNOWY||NIGHT>.3||(S&&S.weather==='rain')?1.4:1;for(let i=0;i<6;i++){const t=(TIME*.32+i/6+o.x*.13)%1,y=p.y-6-t*90,r=5+t*16,dx=Math.sin(t*5+i)*6+t*10;ctx.fillStyle=`rgba(245,245,250,${(1-t)*.28*cold})`;ctx.beginPath();ctx.arc(p.x+dx,y,r,0,Math.PI*2);ctx.fill()}return}
  case 'hydrant':rrect(p.x+8,p.y-14,6,12,2,'#d63a2f');ell(p.x+11,p.y-14,4,2.5,'#e85a4f');ctx.fillStyle='#b0302a';ctx.fillRect(p.x+6,p.y-10,10,2.5);return;
  case 'subway':{isoBox(o.x+.1,o.y+.2,.8,.6,2,'#1b1b22');[[.1,.2],[.9,.2],[.1,.8],[.9,.8]].forEach(([a,b])=>{const q=iso(o.x+a,o.y+b);ctx.fillStyle='#2e5e3a';ctx.fillRect(q.x-.8,q.y-16,1.6,16)});
    ctx.strokeStyle='#2e5e3a';ctx.lineWidth=1.6;[[[.1,.2],[.1,.8]],[[.9,.2],[.9,.8]],[[.1,.2],[.9,.2]]].forEach(([a,b])=>{const q1=iso(o.x+a[0],o.y+a[1]),q2=iso(o.x+b[0],o.y+b[1]);ctx.beginPath();ctx.moveTo(q1.x,q1.y-14);ctx.lineTo(q2.x,q2.y-14);ctx.stroke()});
    [[.1,.8],[.9,.8]].forEach(([a,b])=>{const q=iso(o.x+a,o.y+b);ctx.fillStyle='#2e5e3a';ctx.fillRect(q.x-1,q.y-34,2,20);ell(q.x,q.y-36,4.5,4.5,'#5fd38a');{const ord=ORD;if(NIGHT>0)EMIS.push(()=>{if(!occluded(q.x,q.y-36,ord))ell(q.x,q.y-36,10,10,'rgba(120,255,160,.4)')})}});
    const q=iso(o.x+.5,o.y+.2);rrect(q.x-8,q.y-30,16,10,2,'#111');ctx.fillStyle='#fff';ctx.font='800 7px Sora, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('M',q.x,q.y-25);return}
  }
}
function drawPigeon(g){const p=iso(g.x,g.y),z=g.z||0;
  if(z<120)ell(p.x,p.y,4*(1-z/160),1.6*(1-z/160),'rgba(0,0,0,.18)');
  ctx.save();ctx.translate(p.x,p.y-z);if(g.fx<0)ctx.scale(-1,1);
  const peck=g.st==='walk'&&Math.sin(TIME*6+g.ph)>.6;
  ell(0,-4,4.4,3,g.c);ell(-3.6,-4.6,2,1.4,shade(g.c,.8));
  ell(3.4,peck?-3:-7,2,2,shade(g.c,.85));ell(4.2,peck?-3.4:-7.4,.6,.6,'#ff9a3a');ctx.fillStyle='#ff9a3a';ctx.fillRect(5,peck?-3:-7.2,1.4,.8);
  ctx.fillStyle='rgba(120,200,160,.6)';ctx.fillRect(2.2,peck?-4.4:-5.8,1.6,1);
  if(g.st==='fly'){const f=Math.sin(TIME*28+g.ph)*7;ctx.fillStyle=shade(g.c,.9);ctx.beginPath();ctx.moveTo(-1,-5);ctx.lineTo(-4,-5-f);ctx.lineTo(3,-5);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(2,-4+f*.8);ctx.lineTo(4,-4);ctx.closePath();ctx.fill()}
  else{ctx.fillStyle='#d98a4a';ctx.fillRect(-1,-1.4,.8,1.6);ctx.fillRect(1,-1.4,.8,1.6)}
  ctx.restore()}
function drawWeather(dt){const wx=S&&S.weather;const Wc=innerWidth,Hc=innerHeight;
  if(wx!=='rain'&&wx!=='snow'){WXP.length=0;return}
  if(WXK!==wx){WXP.length=0;WXK=wx}
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const n=wx==='rain'?Math.round(Wc*Hc/2400):Math.round(Wc*Hc/3200);
  while(WXP.length<n)WXP.push({x:rnd()*Wc,y:rnd()*Hc,v:wx==='rain'?520+rnd()*260:30+rnd()*40,s:wx==='rain'?10+rnd()*10:1.2+rnd()*2.2,ph:rnd()*6,sp:0});
  if(wx==='rain'){ctx.strokeStyle='rgba(205,220,245,.45)';ctx.lineWidth=1;ctx.beginPath();
    for(const d of WXP){d.y+=d.v*dt;d.x+=d.v*dt*.18;if(d.y>Hc){if(rnd()<.35)d.sp=.35;d.sx=d.x;d.sy=Hc*(.35+rnd()*.6);d.y=-20;d.x=rnd()*Wc*1.1-Wc*.1}ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-d.s*.18,d.y-d.s)}ctx.stroke();
    for(const d of WXP)if(d.sp>0){d.sp-=dt;const k=1-d.sp/.35;ctx.strokeStyle=`rgba(220,232,255,${.5*(1-k)})`;ctx.beginPath();ctx.ellipse(d.sx,d.sy,2+k*6,1+k*2.4,0,0,Math.PI*2);ctx.stroke()}}
  else{ctx.fillStyle='rgba(255,255,255,.88)';for(const d of WXP){d.y+=d.v*dt;d.x+=Math.sin(TIME*1.3+d.ph)*12*dt;if(d.y>Hc){d.y=-6;d.x=rnd()*Wc}ctx.beginPath();ctx.arc(d.x,d.y,d.s,0,Math.PI*2);ctx.fill()}}
  setCam()}
function drawDeco(o){const p=iso(o.x,o.y);
  if(o.k==='boat'||o.k==='rowboat'){const bob=Math.sin(TIME*1.5+o.x)*1.5;ctx.save();ctx.translate(0,bob);if(o.k==='boat'){isoBox(o.x-.6,o.y-.2,1.2,.45,8,o.c,0);ctx.fillStyle='#ddd';ctx.fillRect(p.x-17,p.y-76,2,56);poly([[p.x-31,p.y-78],[p.x-31,p.y-38],[p.x-4,p.y-38]],'#ffffff')}else{ell(p.x,p.y,16,6,shade(o.c,.7));ell(p.x,p.y-3,14,5,o.c);ell(p.x,p.y-4,9,3,'#7a5228')}ctx.restore();return}
  if(o.k==='liberty'){ell(p.x,p.y,90,40,'#6fa35a');ell(p.x,p.y-4,80,34,'#86b86a');isoBox(o.x-1.2,o.y-1.2,2.4,2.4,40,'#c9c2b0',4);isoBox(o.x-.8,o.y-.8,1.6,1.6,46,'#d8d2c2',44);
    const s=p.y-90,g='#6fbfa0';poly([[p.x-14,s+2],[p.x+14,s+2],[p.x+9,s-62],[p.x-9,s-62]],g);poly([[p.x-9,s-62],[p.x+9,s-62],[p.x+5,s-70],[p.x-5,s-70]],shade(g,.9));ell(p.x,s-76,7,8,g);
    for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.35;poly([[p.x+Math.cos(a)*6,s-80+Math.sin(a)*4],[p.x+Math.cos(a)*16,s-80+Math.sin(a)*12],[p.x+Math.cos(a+.08)*6,s-80+Math.sin(a+.08)*4]],g)}
    ctx.fillStyle=g;ctx.save();ctx.translate(p.x+8,s-60);ctx.rotate(-.25);ctx.fillRect(-3,-34,6,36);ctx.restore();rrect(p.x+10,s-104,8,10,2,'#c9a227');ell(p.x+14,s-108,4,6,'#ffb238');ctx.fillStyle=shade(g,.85);ctx.fillRect(p.x-18,s-46,8,14);
    EMIS.push(()=>{const gg=ctx.createRadialGradient(p.x+14,s-108,1,p.x+14,s-108,26);gg.addColorStop(0,`rgba(255,200,90,${.5+NIGHT*.5})`);gg.addColorStop(1,'rgba(255,200,90,0)');ctx.fillStyle=gg;ctx.fillRect(p.x-12,s-134,52,52)});return}
  if(o.k==='bridge'){const a=iso(o.x,o.y),b=iso(o.x+24,o.y);poly([[a.x,a.y-26],[b.x,b.y-26],[b.x,b.y-20],[a.x,a.y-20]],'#8a8f99');poly([[a.x,a.y-20],[b.x,b.y-20],[b.x+HW*.2,b.y-18],[a.x+HW*.2,a.y-18]],'#6b6f7d');
    [6,16].forEach(t=>{const q=iso(o.x+t,o.y);isoBox(o.x+t-.4,o.y-.4,.8,.8,110,'#b39a7a',0);ctx.fillStyle='#4a3a2a';ctx.fillRect(q.x-4,q.y-90,8,26);
      ctx.strokeStyle='rgba(80,80,90,.8)';ctx.lineWidth=1;for(let i=0;i<8;i++){const tt=(i+1)/9;const L=iso(o.x+t-6*tt,o.y),Rr=iso(o.x+t+5*tt,o.y);ctx.beginPath();ctx.moveTo(q.x,q.y-104);ctx.lineTo(L.x,L.y-26);ctx.moveTo(q.x,q.y-104);ctx.lineTo(Rr.x,Rr.y-26);ctx.stroke()}});
    if(NIGHT>0)EMIS.push(()=>{for(let i=0;i<24;i+=1.5){const q=iso(o.x+i,o.y);ell(q.x,q.y-28,2,2,'rgba(255,220,150,.8)')}});return}
}
function drawLamp(l){const p=iso(l.x+.5+l.o[0],l.y+.5+l.o[1]),ord=ORD;ctx.fillStyle='#2f3b33';ctx.fillRect(p.x-1,p.y-48,2.4,48);ctx.fillRect(p.x-1,p.y-48,10,2);rrect(p.x+5,p.y-47,7,5,1.5,'#2f3b33');ell(p.x+8.5,p.y-41.5,3,1.6,NIGHT>.2?'#fff2c4':'#d9dde3');
  if(NIGHT>0)EMIS.push(()=>{if(occluded(p.x+8,p.y-42,ord))return;const g=ctx.createRadialGradient(p.x+8,p.y-42,1,p.x+8,p.y-42,20);g.addColorStop(0,`rgba(255,220,150,${.9*NIGHT})`);g.addColorStop(1,'rgba(255,215,140,0)');ctx.fillStyle=g;ctx.fillRect(p.x-14,p.y-64,44,44);ctx.save();ctx.translate(p.x+8,p.y);ctx.scale(1,.5);const g2=ctx.createRadialGradient(0,0,2,0,0,42);g2.addColorStop(0,`rgba(255,210,130,${.32*NIGHT})`);g2.addColorStop(1,'rgba(255,210,130,0)');ctx.fillStyle=g2;ctx.beginPath();ctx.arc(0,0,42,0,Math.PI*2);ctx.fill();ctx.restore()})}
function drawPin(x,y,z,col,label){const p=iso(x,y),yy=p.y-z+Math.sin(TIME*3)*3;ctx.fillStyle=col;ctx.beginPath();ctx.arc(p.x,yy-12,9,Math.PI,0);ctx.lineTo(p.x,yy+2);ctx.closePath();ctx.fill();ell(p.x,yy-12,4,4,'#fff');if(label)txt(label,p.x,yy-24,'#fff',10)}

/* ---------- Pilsētas kadrs ---------- */
function renderCity(dt){
  HITS=[];EMIS=[];PDRAWN=false;ORD=0;DRAWN_B=[];SNOWY=S.weather==='snow';
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=hexMix('#3f8db4','#0c1830',NIGHT);ctx.fillRect(0,0,CW,CH);
  setCam();
  const vw=CW/K,vh=CH/K,L=cam.x-vw/2-80,Rr=cam.x+vw/2+80,Tp=cam.y-vh/2-80,Bt=cam.y+vh/2+600;
  const a=iso(-60,-60),b2=iso(61,-60),c2=iso(61,0),d2=iso(0,0),e2=iso(0,18),f2=iso(-60,18);
  poly([[a.x,a.y],[b2.x,b2.y],[c2.x,c2.y],[d2.x,d2.y],[e2.x,e2.y],[f2.x,f2.y]],'#74b85a');
  if(!KINDS)computeKinds();
  const corners=[[L,Tp],[Rr,Tp],[L,Bt],[Rr,Bt]].map(([x,y])=>({x:(x/HW+y/HH)/2,y:(y/HH-x/HW)/2}));
  const x0=Math.max(0,Math.floor(Math.min(...corners.map(c=>c.x)))),x1=Math.min(W-1,Math.ceil(Math.max(...corners.map(c=>c.x)))),y0=Math.max(0,Math.floor(Math.min(...corners.map(c=>c.y)))),y1=Math.min(H-1,Math.ceil(Math.max(...corners.map(c=>c.y))));
  const sw=(TW*K+2)/K,sh=(TH*K+2)/K;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const p=iso(x,y);if(p.x<L-40||p.x>Rr+40||p.y<Tp-40||p.y>Bt)continue;ctx.drawImage(tileSprite(KINDS[gi(x,y)]),p.x-HW-1/K,p.y-1/K,sw,sh);
    const t=grid[gi(x,y)];
    if(t===T.WATER){const ph=Math.sin(TIME*1.4+x*.8+y*.5);if(ph>.3)withTile(x,y,()=>{ctx.fillStyle=`rgba(255,255,255,${(ph-.3)*.3})`;ctx.fillRect(.2+ph*.2,.45,.35,.03)})}
    if(t===T.WALK||t===T.PROM){withTile(x,y,()=>{ctx.fillStyle='rgba(90,90,95,.6)';if(grid[gi(x+1,y)]===T.ROAD)ctx.fillRect(.93,0,.07,1);if(x>0&&grid[gi(x-1,y)]===T.ROAD)ctx.fillRect(0,0,.07,1);if(grid[gi(x,y+1)]===T.ROAD)ctx.fillRect(0,.93,1,.07);if(y>0&&grid[gi(x,y-1)]===T.ROAD)ctx.fillRect(0,0,1,.07);
      if(t===T.PROM&&grid[gi(x+1,y)]===T.WATER){ctx.fillStyle='#3b3f4c';ctx.fillRect(.9,0,.1,1)}if(t===T.PROM&&grid[gi(x,y+1)]===T.WATER){ctx.fillStyle='#3b3f4c';ctx.fillRect(0,.9,1,.1)}})}
  }
  const vis=b=>{const p=iso(b.bx+b.w/2,b.by+b.d/2);return p.x>L-260&&p.x<Rr+260&&p.y>Tp-60&&p.y<Bt+60};
  const vb=BLDS.filter(vis);if(NIGHT<1)vb.forEach(drawShadow);
  const objs=[];
  vb.forEach(b=>objs.push({k:'b',o:b,x:b.bx,y:b.by,w:b.w,d:b.d}));
  CITY_OBJS.forEach(o=>{const p=iso(o.x,o.y);if(p.x>L&&p.x<Rr&&p.y>Tp&&p.y<Bt)objs.push({k:'o',o,x:o.x+.5,y:o.y+.5})});
  DECO.forEach(o=>objs.push({k:'d',o,x:o.x,y:o.y}));
  LAMPS.forEach(l=>{const p=iso(l.x,l.y);if(p.x>L&&p.x<Rr&&p.y>Tp&&p.y<Bt)objs.push({k:'l',o:l,x:l.x+.5+l.o[0],y:l.y+.5+l.o[1]})});
  CARS.forEach(c=>objs.push({k:'car',o:c,x:c.x,y:c.y}));
  NPCS.forEach(n=>objs.push({k:'n',o:n,x:n.x,y:n.y}));
  EXTRAS.forEach(n=>{const p=iso(n.x,n.y);if(p.x>L&&p.x<Rr&&p.y>Tp&&p.y<Bt)objs.push({k:'n',o:n,x:n.x,y:n.y})});
  PIGEONS.forEach(g=>objs.push({k:'pg',o:g,x:g.x,y:g.y}));
  objs.push({k:'p',x:P.x,y:P.y});
  sortObjs(objs);
  for(const o of objs)drawObjEntry(o);
  overlayNight();
  drawWeather(dt);
  NPCS.forEach(n=>npcLabel(n));
  const hb=bld(HOMES[C().home].b);drawPin(hb.door[0]+.5,hb.door[1]+.5,bldH(hb)+10,'#ff6f61','Mājas');
  (typeof storyPins==='function'?storyPins():[]).forEach(id=>{const b=bld(id);if(b&&b.id!==hb.id)drawPin(b.door[0]+.5,b.door[1]+.5,bldH(b)+10,'#ffc857','!')});
  S.quests.forEach(q=>{if(q.done)return;if((q.type==='meet'||q.type==='deliver')&&q.b){const b=bld(q.b);drawPin(b.door[0]+.5,b.door[1]+.5,bldH(b)+10,'#7be0ff','?')}});
  if(TARGET.t>0){TARGET.t-=dt;const p=iso(TARGET.x+.5,TARGET.y+.5);ctx.strokeStyle=`rgba(255,255,255,${TARGET.t})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,18,9,0,0,Math.PI*2);ctx.stroke()}
}
function objBox(o){if(o.k==='b'||o.k==='f'){const h=o.k==='b'?bldH(o.o):Math.max(24,o.o._h||24);const a=iso(o.x,o.y),b=iso(o.x+o.w,o.y),c=iso(o.x+o.w,o.y+o.d),d=iso(o.x,o.y+o.d);return [d.x,b.x,a.y-h,c.y]}
  const p=iso(o.x,o.y),tall=o.k==='o'&&o.o.k==='tree'?140:70,wide=o.k==='o'&&o.o.k==='tree'?50:o.k==='car'?30:16;return [p.x-wide,p.x+wide,p.y-tall,p.y+6]}
function sortObjs(objs){
  const bl=objs.filter(o=>o.k==='b'||o.k==='f').sort((a,b)=>(a.x+a.y+a.w+a.d)-(b.x+b.y+b.w+b.d));
  const bb=bl.map(objBox),gaps=bl.map(()=>[]),pre=[];
  for(const s of objs){if(s.k==='b'||s.k==='f')continue;const sb=objBox(s);let lo=-1,hi=-1,kIdx=-1;
    for(let i=0;i<bl.length;i++){const B=bl[i],r=bb[i];if((B.x+B.y+B.w+B.d)<=s.x+s.y+1)kIdx=i;
      if(sb[1]<r[0]||sb[0]>r[1]||sb[3]<r[2]||sb[2]>r[3])continue;
      const front=s.x>=B.x+B.w||s.y>=B.y+B.d;if(front)lo=i;else if(hi<0)hi=i}
    const g=hi>=0?hi-1:lo>=0?lo:kIdx;(g<0?pre:gaps[g]).push(s)}
  const ks=(a,b)=>(a.x+a.y)-(b.x+b.y);pre.sort(ks);gaps.forEach(g=>g.sort(ks));
  objs.length=0;objs.push(...pre);bl.forEach((b,i)=>{objs.push(b,...gaps[i])});
}
function drawObjEntry(o){ORD++;
  if(o.k==='b'){const b=o.o,hullP=boxHull(b.bx,b.by,b.w,b.d,bldH(b)-10);let fade=false;
    if(PDRAWN){const pp=iso(P.x,P.y);fade=inPoly([pp.x,pp.y-24],hullP)||inPoly([pp.x,pp.y-4],hullP)}
    if(fade)ctx.globalAlpha=.34;drawBuilding(b);ctx.globalAlpha=1;HITS.push({k:'bld',ref:b,poly:hullP});if(!fade)DRAWN_B.push({ord:ORD,hull:hullP})}
  else if(o.k==='o'){drawCityObj(o.o);if(o.o.act){const p=iso(o.o.x+.5,o.o.y+.5);HITS.push({k:'obj',ref:o.o,rect:[p.x-22,p.y-50,44,56]})}}
  else if(o.k==='d')drawDeco(o.o);
  else if(o.k==='pg')drawPigeon(o.o);
  else if(o.k==='l')drawLamp(o.o);
  else if(o.k==='car')drawCar(o.o);
  else if(o.k==='f'){drawFurn(o.o);if(o.o.act){HITS.push({k:'furn',ref:o.o,poly:boxHull(o.o.x,o.o.y,o.o.w,o.o.d,Math.max(18,o.o._h||20))})}}
  else if(o.k==='n'){const n=o.o,inf=npcInfo(n),p=iso(n.x,n.y);const wet=!S.where&&(S.weather==='rain'||S.weather==='snow');drawPerson(p.x,p.y,inf.look,inf.sex,n.ph||0,n.path.length>0&&!n.talking,n.dir||0,{scale:inf.scale||1,expr:n.exT>0?n.ex:null,umbrella:wet&&inf.look.umb&&(n.uR??(n.uR=rnd()))<(S.weather==='rain'?.75:.3)?inf.look.umb:null});if(!n.extra)HITS.push({k:'npc',ref:n,rect:[p.x-12,p.y-56,24,58]})}
  else if(o.k==='staff'){const s=o.o,p=iso(s.x,s.y);drawPerson(p.x,p.y,s.look,s.sex,0,false,0,{});HITS.push({k:'furn',ref:s.o,rect:[p.x-12,p.y-56,24,58]})}
  else if(o.k==='p'){const p=iso(P.x,P.y);drawPerson(p.x,p.y,myLook(),C().sex,P.ph,P.path.length>0,P.dir,{umbrella:!S.where&&(S.weather==='rain'||S.weather==='snow')&&C().inv.lietussargs?'#ff4fa3':null,expr:P.exT>0?P.ex:null});PDRAWN=true;
    const bob=Math.sin(TIME*4)*2;poly([[p.x-5,p.y-66+bob],[p.x+5,p.y-66+bob],[p.x,p.y-59+bob]],'#ff6f61')}
}
function overlayNight(){
  ctx.setTransform(1,0,0,1,0,0);
  const wx=S&&S.weather;if(wx==='rain'||wx==='cloudy'){ctx.globalCompositeOperation='multiply';ctx.fillStyle=wx==='rain'?'#b4bdd2':'#d6dbe4';ctx.fillRect(0,0,CW,CH)}
  if(DUSK>0&&NIGHT<1){ctx.globalCompositeOperation='multiply';ctx.fillStyle=hexMix('#ffffff','#ffc7a0',DUSK*(1-NIGHT));ctx.fillRect(0,0,CW,CH)}
  if(NIGHT>0){ctx.globalCompositeOperation='multiply';ctx.fillStyle=hexMix('#ffffff','#3a3f86',NIGHT);ctx.fillRect(0,0,CW,CH)}
  ctx.globalCompositeOperation='lighter';setCam();EMIS.forEach(f=>f());
  ctx.globalCompositeOperation='source-over';setCam();
}
function npcLabel(n){const inf=npcInfo(n),p=iso(n.x,n.y),near=Math.hypot(n.x-P.x,n.y-P.y)<5,y0=p.y-58*(inf.scale||1);
  const pr=inf.person;
  const mark=pr&&(pr.qOffer?'!':(typeof storyMark==='function'?storyMark(pr):null));
  if(mark){const col=mark==='!'?'#7be0ff':'#ffc857';ctx.fillStyle=col;ctx.beginPath();ctx.arc(p.x,y0-12+Math.sin(TIME*4)*2,7,0,Math.PI*2);ctx.fill();txt(mark==='!'?'?':'★',p.x,y0-6+Math.sin(TIME*4)*2,'#1a1530',10,900)}
  if(pr&&(pr.met||near||pr.cast)){const love=pr.steady||pr.rom>=40;txt(pr.met?pr.first:(pr.cast&&near?pr.first:'?'),p.x,y0,love?'#ffb3cf':!pr.met?'#e3e0f0':pr.cast?'#ffe6a0':'#c9fbf5',10)}
  if(n.exT>0)n.exT-=1/60;
  if(n.bub){n.bubT-=1/60;ctx.font='700 10px Figtree, sans-serif';const w=ctx.measureText(n.bub).width+12;rrect(p.x-w/2,y0-34,w,17,8,'#ffffff');poly([[p.x-4,y0-17],[p.x+4,y0-17],[p.x,y0-12]],'#ffffff');ctx.fillStyle='#1a1530';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.bub,p.x,y0-25.5);if(n.bubT<=0)n.bub=null}
  if(n===COMP_NPC){txt('♥ kopā',p.x,y0+12,'#ffb3cf',9)}
}

/* ---------- Interjers ---------- */
const WH=104;
function floorPaint(m,x,y){const k=m.floor;let c;
  withTile(x,y,()=>{
    if(k==='wood'||k==='parquet'||k==='deck'){c=k==='deck'?'#c99a62':k==='parquet'?'#c08a58':'#b98556';ctx.fillStyle=c;ctx.fillRect(-.02,-.02,1.04,1.04);ctx.fillStyle='rgba(60,30,10,.18)';for(let i=1;i<4;i++)ctx.fillRect(0,i/4,1,.015);ctx.fillRect(((x*3+y)%4)/4,0,.012,.25)}
    else if(k==='checker'){ctx.fillStyle=(x+y)%2?'#f4efe6':'#2f3440';ctx.fillRect(-.02,-.02,1.04,1.04)}
    else if(k==='marble'||k==='marbleW'||k==='shiny'){ctx.fillStyle=(x+y)%2?'#f3f0ea':'#e6e1d8';ctx.fillRect(-.02,-.02,1.04,1.04);ctx.fillStyle='rgba(160,150,140,.18)';ctx.fillRect(.1,.3+hash(x,y)*.3,.8,.01)}
    else if(k==='tile'){ctx.fillStyle='#eef1f3';ctx.fillRect(-.02,-.02,1.04,1.04);ctx.fillStyle='rgba(120,130,140,.22)';ctx.fillRect(0,0,1,.02);ctx.fillRect(0,0,.02,1);ctx.fillRect(.5,0,.01,1);ctx.fillRect(0,.5,1,.01)}
    else if(k==='carpet'){ctx.fillStyle=m.dark?'#4a2438':'#9aa9c4';ctx.fillRect(-.02,-.02,1.04,1.04);ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(.2,.2,.6,.6)}
    else if(k==='red'){ctx.fillStyle='#7a1d36';ctx.fillRect(-.02,-.02,1.04,1.04);ctx.fillStyle='rgba(255,210,110,.18)';ctx.fillRect(.45,.1,.1,.8);ctx.fillRect(.1,.45,.8,.1)}
    else if(k==='dark'){ctx.fillStyle='#231d33';ctx.fillRect(-.02,-.02,1.04,1.04);ctx.fillStyle='rgba(255,255,255,.04)';ctx.fillRect(0,0,1,.02);ctx.fillRect(0,0,.02,1)}
    else if(k==='rubber'){ctx.fillStyle='#3d4450';ctx.fillRect(-.02,-.02,1.04,1.04);ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(0,0,1,.02)}
    else {ctx.fillStyle='#a3a7ad';ctx.fillRect(-.02,-.02,1.04,1.04);ctx.fillStyle='rgba(0,0,0,.06)';ctx.fillRect(hash(x,y),.3,.2,.02)}
  })}
function windowSky(){return NIGHT>.5?'#1b2350':DUSK>.3?'#f6a978':'#a7dcf5'}
function drawWallDeco(m,dc){
  let [wl,pos,k,o]=dc;o=o||{};
  const face=(fn)=>{ctx.save();const oo=iso(0,0);if(wl==='b')ctx.transform(HW,HH,0,-1,oo.x,oo.y);else ctx.transform(-HW,HH,0,-1,oo.x,oo.y);fn();ctx.restore()};
  const u=pos,tx=(t,v,col,size)=>{const oo=iso(0,0),px=oo.x+(wl==='b'?u*HW:-u*HW),py=oo.y+u*HH-v;ctx.save();ctx.transform(1,wl==='b'?.5:-.5,0,1,px,py);ctx.font=`800 ${size}px Sora, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(t,0,0);ctx.restore()};
  const wp=v=>{const oo=iso(0,0);return {x:oo.x+(wl==='b'?u*HW:-u*HW),y:oo.y+u*HH-v}};
  if(k==='window')face(()=>{ctx.fillStyle='#ffffff';ctx.fillRect(u-.55,34,1.1,46);ctx.fillStyle=windowSky();ctx.fillRect(u-.5,37,1,40);if(NIGHT>.5){ctx.fillStyle='#fff';for(let i=0;i<4;i++)ctx.fillRect(u-.4+hash(i,u*10)*.8,45+hash(u,i)*28,.03,1)}if(S&&S.weather==='rain'){ctx.fillStyle='rgba(220,235,255,.6)';for(let i=0;i<7;i++){const yy=37+((TIME*60+i*13)%40);ctx.fillRect(u-.45+i*.13,yy,.015,5)}}if(S&&S.weather==='snow'){ctx.fillStyle='#fff';for(let i=0;i<8;i++){const yy=37+((TIME*12+i*9)%40);ctx.fillRect(u-.45+((i*.37+Math.sin(TIME+i)*.05)%.9),yy,.03,1.4)}}ctx.fillStyle='#ffffff';ctx.fillRect(u-.02,37,.04,40);ctx.fillRect(u-.5,56,1,1.5);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(u-.45,40,.2,34)});
  if(k==='skyline')face(()=>{ctx.fillStyle='#c9ccd2';ctx.fillRect(u-.62,18,1.24,80);ctx.fillStyle=windowSky();ctx.fillRect(u-.58,22,1.16,72);for(let i=0;i<9;i++){const bh=10+hash(i,u*7)*36;ctx.fillStyle=NIGHT>.5?'#0d1230':'#6d7f99';ctx.fillRect(u-.58+i*.13,22,.11,bh);if(NIGHT>.5){ctx.fillStyle='#ffd98a';for(let j=0;j<4;j++)if(hash(i,j,u*3)<.5)ctx.fillRect(u-.55+i*.13,26+j*6,.03,1.5)}}ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(u-.55,60,.25,30)});
  if(k==='painting')face(()=>{const sz=o.big?1:.7,col=['#ff6f61','#2fb7b0','#ffc857','#9b5bd6','#3f7fd8'];ctx.fillStyle='#8a5a36';ctx.fillRect(u-sz/2-.05,44,sz+.1,32+(o.big?10:0));ctx.fillStyle='#f6efe2';ctx.fillRect(u-sz/2,47,sz,26+(o.big?10:0));for(let i=0;i<3;i++){ctx.fillStyle=col[(Math.floor(u*7)+i)%5];ctx.fillRect(u-sz/2+.05+i*sz/3.3,50+i*5,sz/3,12)}});
  if(k==='poster'||k==='board'){face(()=>{ctx.fillStyle=k==='board'?'#2d2a3a':(m.b&&m.b.acc||'#ff6f61');ctx.fillRect(u-.8,50,1.6,26)});tx(o.t||'',63,'#ffffff',9)}
  if(k==='neon'){face(()=>{ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(u-.95,48,1.9,30)});tx(o.t,63,o.c||'#ff4fa3',12);EMIS.push(()=>{ctx.save();ctx.shadowColor=o.c;ctx.shadowBlur=16;tx(o.t,63,o.c||'#ff4fa3',12);ctx.restore()})}
  if(k==='screen'||k==='bigscreen'){const ww=k==='bigscreen'?2.4:1.4;face(()=>{ctx.fillStyle='#111';ctx.fillRect(u-ww/2-.05,32,ww+.1,58);const g=ctx.createLinearGradient(0,34,0,88);g.addColorStop(0,`hsl(${(TIME*40)%360} 70% 60%)`);g.addColorStop(1,`hsl(${(TIME*40+120)%360} 70% 45%)`);ctx.fillStyle=g;ctx.fillRect(u-ww/2,35,ww,52)});EMIS.push(()=>face(()=>{ctx.fillStyle='rgba(160,200,255,.25)';ctx.fillRect(u-ww/2,35,ww,52)}))}
  if(k==='mirrorw')face(()=>{ctx.fillStyle='#d9dde3';ctx.fillRect(u-.55,30,1.1,56);const g=ctx.createLinearGradient(0,30,0,86);g.addColorStop(0,'#eef4f8');g.addColorStop(1,'#b7c4cf');ctx.fillStyle=g;ctx.fillRect(u-.5,33,1,50)});
  if(k==='bottles')face(()=>{ctx.fillStyle='#5a3a26';ctx.fillRect(u-1.2,40,2.4,3);ctx.fillRect(u-1.2,60,2.4,3);for(let i=0;i<14;i++){ctx.fillStyle=['#46b06b','#c0643a','#ffd36b','#9bd3f0','#e04f5f'][i%5];ctx.fillRect(u-1.15+i*.17,43,.08,12);ctx.fillRect(u-1.1+i*.17,63,.08,10)}});
  if(k==='housepic')face(()=>{ctx.fillStyle='#ffffff';ctx.fillRect(u-.45,48,.9,26);ctx.fillStyle='#bfe3dc';ctx.fillRect(u-.4,50,.8,14);ctx.fillStyle='#9c5a44';ctx.fillRect(u-.25,56,.5,12)});
  if(k==='lantern'){const q=wp(78);ctx.strokeStyle='#5a3a26';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q.x,q.y-24);ctx.lineTo(q.x,q.y-8);ctx.stroke();ell(q.x,q.y,9,11,'#e2303a');ctx.fillStyle='#ffc857';ctx.fillRect(q.x-6,q.y-11,12,2);ctx.fillRect(q.x-6,q.y+9,12,2);EMIS.push(()=>ell(q.x,q.y,14,16,'rgba(255,90,60,.35)'))}
  if(k==='ticker'){face(()=>{ctx.fillStyle='#0d0d12';ctx.fillRect(u-1.4,50,2.8,30)});const items=['AAPL ▲2.1','IBM ▼0.8','GE ▲1.4','XOM ▼1.9','NYC ▲3.2','KO ▲0.6','GM ▼2.4'];const sh=(TIME*.35)%items.length;
    for(let i=0;i<3;i++){const it=items[Math.floor(sh+i)%items.length];tx(it,72-i*9,it.includes('▲')?'#3dff8a':'#ff5d5d',6.5)}EMIS.push(()=>face(()=>{ctx.fillStyle='rgba(60,255,140,.12)';ctx.fillRect(u-1.4,50,2.8,30)}))}
  if(k==='curtain')face(()=>{for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#9b2335':'#b52b40';ctx.fillRect(u-2.6+i*.52,8,.52,92)}ctx.fillStyle='#c9a227';ctx.fillRect(u-2.6,92,5.2,6)});
  if(k==='darts'){const q=wp(64);ell(q.x,q.y,10,11,'#1b1b22');ell(q.x,q.y,7,8,'#e2303a');ell(q.x,q.y,4,5,'#f4e3b0');ell(q.x,q.y,1.5,1.8,'#46b06b')}
}
function drawFurn(f){
  const {x,y,w,d}=f,c=f.c,p=iso(x+w/2,y+d/2);let h=20;
  switch(f.k){
    case 'counter':h=22;isoBox(x,y,w,d,h,c||'#c79a6b',0,[shade(c||'#efe3cf',1.05),c||'#c79a6b',shade(c||'#c79a6b',.8)]);if(f.act==='cafe')isoBox(x+.2,y+.2,.35,.35,14,'#9aa3ad',h);break;
    case 'bar':h=24;isoBox(x,y,w,d,h,c||'#5a3a26');for(let i=0;i<w*d*2;i++){const q=iso(x+.3+(i%Math.max(1,w*2))*.45,y+.4+Math.floor(i/Math.max(1,w*2))*.45);rrect(q.x-1.5,q.y-h-9,3,9,1,['#46b06b','#ffd36b','#9bd3f0','#e04f5f'][i%4])}break;
    case 'table':isoBox(x+.45,y+.45,.1,.1,14,'#555');ell(p.x,p.y-15,16,8,'#f4ece0');ell(p.x,p.y-16,16,8,'#fffaf0');isoBox(x-.05,y+.35,.3,.3,10,'#8a5a36');isoBox(x+.75,y+.35,.3,.3,10,'#8a5a36');h=16;break;
    case 'table4':isoBox(x+.15,y+.15,.7,.7,14,'#f4ece0',0,['#fffaf0','#d9cbb3','#c2b49c']);[[-.15,.35],[.85,.35],[.35,-.15],[.35,.85]].forEach(([a,b])=>isoBox(x+a,y+b,.3,.3,9,'#8a5a36'));ell(p.x,p.y-15,4,2,'#e04f5f');h=16;break;
    case 'plant':isoBox(x+.3,y+.3,.4,.4,10,'#c8693e');ell(p.x-5,p.y-20,8,8,'#3f9a45');ell(p.x+5,p.y-22,8,8,'#4fb04f');ell(p.x,p.y-30,8,8,'#62c25a');h=34;break;
    case 'sofa':{const col=c||(f.lux?'#5a3a26':'#5b7bd8');isoBox(x,y,w,.2,22,shade(col,.92),0);isoBox(x,y,.15,d,14,shade(col,.85));isoBox(x,y+.15,w,d-.15,9,col,0);isoBox(x+w-.15,y,.15,d,14,shade(col,.85));h=22;break}
    case 'bed':{isoBox(x,y,w,.12,26,'#7a4b2a');isoBox(x,y,w,d,9,'#8a5a36');isoBox(x+.05,y+.05,w-.1,d-.1,5,'#ffffff',9);isoBox(x+.05,y+Math.min(.6,d*.5),w-.1,d-Math.min(.65,d*.5+.05),2,f.lux===2?'#d8b45a':f.lux?'#9b5bd6':'#3f7fd8',14);isoBox(x+.15,y+.1,.6,.35,4,'#f4f4f4',14);if(w>1.5)isoBox(x+1.05,y+.1,.6,.35,4,'#f4f4f4',14);h=26;break}
    case 'tvstand':isoBox(x+.1,y+.2,.8,.5,10,'#2d2a3a');isoBox(x+.1,y+.35,.8,.08,24,'#111',10);withFace('y',x+.1,y+.43,10,()=>{ctx.fillStyle=`hsl(${(TIME*30)%360} 60% 55%)`;ctx.fillRect(.04,2,.72,20)});EMIS.push(()=>withFace('y',x+.1,y+.43,10,()=>{ctx.fillStyle='rgba(150,190,255,.3)';ctx.fillRect(.04,2,.72,20)}));h=34;break;
    case 'console':isoBox(x+.25,y+.3,.5,.4,6,'#222');ell(p.x+6,p.y-8,3,1.5,'#3fd0c9');h=8;break;
    case 'stereo':isoBox(x+.2,y+.2,.6,.4,26,'#2b2f3a');ell(p.x-4,p.y-14,4,4,'#555');ell(p.x-4,p.y-24,3,3,'#555');h=26;break;
    case 'aquarium':isoBox(x+.1,y+.2,.8,.5,10,'#5a3a26');isoBox(x+.1,y+.2,.8,.5,20,'#5fc6e8',10,['rgba(150,220,255,.55)','rgba(70,170,220,.7)','rgba(50,140,200,.7)']);for(let i=0;i<3;i++){const fx=p.x-8+((TIME*12+i*9)%18);ell(fx,p.y-18-i*5,2.5,1.5,['#ffb238','#ff6f61','#ffe066'][i])}h=30;break;
    case 'desk':isoBox(x,y,w,d,16,'#d9cbb3',0,['#efe6d6','#cbbda4','#b5a78e']);isoBox(x+w*.3,y+.15,.4,.08,14,'#222',16);withFace('y',x+w*.3,y+.23,18,()=>{ctx.fillStyle=NIGHT>.5?'#9fd3ff':'#bfe3ff';ctx.fillRect(.03,1,.34,10)});h=30;break;
    case 'lamp':ctx.fillStyle='#333';ctx.fillRect(p.x-1,p.y-40,2,40);poly([[p.x-8,p.y-38],[p.x+8,p.y-38],[p.x+5,p.y-50],[p.x-5,p.y-50]],'#f6e6c4');EMIS.push(()=>{const g=ctx.createRadialGradient(p.x,p.y-42,2,p.x,p.y-30,46);g.addColorStop(0,'rgba(255,220,150,.5)');g.addColorStop(1,'rgba(255,220,150,0)');ctx.fillStyle=g;ctx.fillRect(p.x-46,p.y-88,92,92)});h=50;break;
    case 'piano':isoBox(x,y,w,d,22,'#141418');isoBox(x,y+d-.2,w,.2,2,'#ffffff',22);h=26;break;
    case 'rug':withTile(x,y,()=>{ctx.save();ctx.scale(w,d);ctx.fillStyle='#c0643a';ctx.fillRect(.05,.08,.9,.84);ctx.fillStyle='#f3d9a4';ctx.fillRect(.12,.2,.76,.6);ctx.fillStyle='#2fb7b0';ctx.fillRect(.3,.35,.4,.3);ctx.restore()});h=1;break;
    case 'wardrobe':isoBox(x+.05,y+.1,.9,.6,48,'#a8794c');withFace('y',x+.05,y+.7,0,()=>{ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(.44,4,.02,40);ctx.fillStyle='#ffd36b';ctx.fillRect(.38,22,.03,5);ctx.fillRect(.5,22,.03,5)});h=48;break;
    case 'fridge':isoBox(x+.1,y+.1,.8,.7,44,'#f4f7f9',0,['#ffffff','#e6ebef','#cfd6dc']);withFace('y',x+.1,y+.8,0,()=>{ctx.fillStyle='#9aa3ad';ctx.fillRect(.65,18,.04,14);ctx.fillRect(0,30,.8,.8)});h=44;break;
    case 'fridgeD':isoBox(x,y,w,d,40,'#e6ebef');withFace('x',x+w,y,0,()=>{ctx.fillStyle='rgba(170,220,255,.6)';ctx.fillRect(.05,4,d-.1,32);for(let i=0;i<8;i++){ctx.fillStyle=['#ff6f61','#ffc857','#46b06b','#3f7fd8'][i%4];ctx.fillRect(.1+(i%4)*(d-.2)/4,8+Math.floor(i/4)*14,.25,8)}});h=40;break;
    case 'kitchen':isoBox(x,y,w,d,22,'#f4f1ea',0,['#d9d4ca','#e9e4da','#cfc9be']);ell(p.x,p.y-24,6,3,'#333');h=22;break;
    case 'oven':isoBox(x,y,w,d,30,'#b5533c');withFace('y',x,y+d,0,()=>{ctx.fillStyle='#ffb238';ctx.fillRect(.25,6,.5,10)});EMIS.push(()=>withFace('y',x,y+d,0,()=>{ctx.fillStyle='rgba(255,170,60,.6)';ctx.fillRect(.2,4,.6,14)}));h=30;break;
    case 'pool':isoBox(x,y,w,d,16,'#5a3a26');isoBox(x+.08,y+.08,w-.16,d-.16,1,'#2e8b57',16);ell(p.x-6,p.y-18,2.5,1.5,'#fff');ell(p.x+4,p.y-19,2.5,1.5,'#ff3b3b');h=18;break;
    case 'swim':{const a=iso(x,y),b=iso(x+w,y),cc=iso(x+w,y+d),dd=iso(x,y+d);poly([[a.x,a.y],[b.x,b.y],[cc.x,cc.y],[dd.x,dd.y]],'#e9f6f8');const g=ctx.createLinearGradient(a.x,a.y,cc.x,cc.y);g.addColorStop(0,'#62d6ea');g.addColorStop(1,'#2aa7d4');const i0=iso(x+.15,y+.15),i1=iso(x+w-.15,y+.15),i2=iso(x+w-.15,y+d-.15),i3=iso(x+.15,y+d-.15);poly([[i0.x,i0.y],[i1.x,i1.y],[i2.x,i2.y],[i3.x,i3.y]],g);h=2;break}
    case 'stage':isoBox(x,y,w,d,8,'#3a2a4a');ctx.fillStyle='#ccc';ctx.fillRect(p.x-1,p.y-36,2,28);ell(p.x,p.y-37,3,3,'#333');if(f.act==='comedyStage'||f.act==='jazzStage'||f.act==='karaoke')EMIS.push(()=>{const g=ctx.createRadialGradient(p.x,p.y-20,2,p.x,p.y-10,50);g.addColorStop(0,'rgba(255,230,160,.4)');g.addColorStop(1,'rgba(255,230,160,0)');ctx.fillStyle=g;ctx.fillRect(p.x-50,p.y-60,100,80)});h=10;break;
    case 'dance':{const cols=['#ff4fa3','#2fe0d0','#ffd36b','#9b5bd6'];for(let yy=0;yy<d;yy++)for(let xx=0;xx<w;xx++){const ci=(Math.floor(TIME*3)+xx*3+yy*5)%4;withTile(x+xx,y+yy,()=>{ctx.fillStyle=cols[ci];ctx.fillRect(.04,.04,.92,.92)});EMIS.push(()=>withTile(x+xx,y+yy,()=>{ctx.fillStyle=cols[ci]+'55';ctx.fillRect(.04,.04,.92,.92)}))}h=1;break}
    case 'dj':isoBox(x,y,w,d,22,'#1a1626');ell(p.x-10,p.y-23,6,3,'#444');ell(p.x+10,p.y-23,6,3,'#444');for(let i=0;i<5;i++){const col=['#ff4fa3','#2fe0d0','#ffd36b'][i%3];const q=iso(x+.2+i*.35,y+d);ell(q.x,q.y-10,2,2,Math.floor(TIME*4+i)%2?col:'#333')}h=22;break;
    case 'speaker':isoBox(x+.15,y+.15,.7,.6,40,'#151320');ell(p.x-3,p.y-14,5,5,'#2c2840');ell(p.x-3,p.y-30,3.5,3.5,'#2c2840');h=40;break;
    case 'rack':{ctx.fillStyle=f.gold?'#d8b45a':'#9aa3ad';const a=iso(x+.1,y+.5),b=iso(x+w-.1,y+d-.5);ctx.fillRect(a.x-1,a.y-36,2,36);ctx.fillRect(b.x-1,b.y-36,2,36);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y-36);ctx.lineTo(b.x,b.y-36);ctx.stroke();
      const n=Math.round((w+d)*3);for(let i=0;i<n;i++){const t=(i+.5)/n,qx=a.x+(b.x-a.x)*t,qy=a.y+(b.y-a.y)*t;rrect(qx-3,qy-35,6,18,2,COLORS[(i*3+x)%COLORS.length])}h=38;break}
    case 'mirror':isoBox(x+.3,y+.4,.4,.15,44,'#d8b45a');withFace('y',x+.32,y+.55,0,()=>{const g=ctx.createLinearGradient(0,4,0,42);g.addColorStop(0,'#eef4f8');g.addColorStop(1,'#a9b8c4');ctx.fillStyle=g;ctx.fillRect(0,4,.36,38)});h=44;break;
    case 'pedestal':isoBox(x+.25,y+.25,.5,.5,20,'#f4f4f4');ell(p.x,p.y-30,7,9,'#c9a227');ell(p.x+3,p.y-38,4,4,'#e2c35a');h=40;break;
    case 'salonchair':isoBox(x+.25,y+.3,.5,.5,10,'#2b2f3a');isoBox(x+.25,y+.25,.5,.12,26,'#2b2f3a');ctx.fillStyle='#aaa';ctx.fillRect(p.x-1,p.y-4,2,4);h=26;break;
    case 'flowerstand':isoBox(x+.15,y+.15,.7,.7,14,'#8a5a36');for(let i=0;i<8;i++){const q=iso(x+.3+(i%3)*.2,y+.3+Math.floor(i/3)*.2);ell(q.x,q.y-20,4,4,['#ff4fa3','#ffd36b','#ffffff','#ff6f61','#9b5bd6'][i%5]);ctx.fillStyle='#3f9a45';ctx.fillRect(q.x-.5,q.y-17,1,4)}h=26;break;
    case 'shelf':isoBox(x,y,w,d,32,'#e6e1d8');for(let r=0;r<3;r++)withFace(d>w?'x':'y',d>w?x+w:x,d>w?y:y+d,0,()=>{for(let i=0;i<(d>w?d:w)*5;i++){ctx.fillStyle=COLORS[(i+r*2)%COLORS.length];ctx.fillRect(.06+i*.2,5+r*9,.14,6)}});h=32;break;
    case 'teller':isoBox(x,y,w,d,24,'#c9b48f');isoBox(x,y+.4,w,.06,22,'#bfe3f5',24,['rgba(200,235,255,.6)','rgba(170,215,245,.5)','rgba(150,200,240,.5)']);h=46;break;
    case 'atmI':isoBox(x+.2,y+.2,.6,.5,36,'#3f6fb5');withFace('y',x+.2,y+.7,0,()=>{ctx.fillStyle='#bfe3ff';ctx.fillRect(.1,22,.4,9)});h=36;break;
    case 'cooler':isoBox(x+.3,y+.3,.4,.4,24,'#e6ebef');ell(p.x,p.y-30,6,7,'rgba(120,200,255,.7)');h=36;break;
    case 'seats':for(let i=0;i<w;i++){isoBox(x+i+.1,y+.2,.8,.6,8,c||'#9e2a2b');isoBox(x+i+.1,y+.15,.8,.15,18,shade(c||'#9e2a2b',.85))}h=18;break;
    case 'flagpole':ctx.fillStyle='#777';ctx.fillRect(p.x-1,p.y-70,2,70);{const wv=Math.sin(TIME*3)*2;poly([[p.x+1,p.y-70],[p.x+24,p.y-68+wv],[p.x+24,p.y-56+wv],[p.x+1,p.y-58]],'#b22234');for(let i=0;i<3;i++)poly([[p.x+1,p.y-67+i*4],[p.x+24,p.y-65+i*4+wv],[p.x+24,p.y-64+i*4+wv],[p.x+1,p.y-66+i*4]],'#fff');poly([[p.x+1,p.y-70],[p.x+10,p.y-69+wv*.4],[p.x+10,p.y-63+wv*.4],[p.x+1,p.y-64]],'#3c3b6e')}h=70;break;
    case 'hbed':isoBox(x+.1,y,.8,d,12,'#cfd6dc');isoBox(x+.15,y+.05,.7,d-.1,4,f.act==='tan'?'#9b5bd6':'#ffffff',12);if(f.act==='tan')EMIS.push(()=>{ctx.globalAlpha=.5;isoBox(x+.15,y+.05,.7,d-.1,2,'#b98cff',16);ctx.globalAlpha=1});h=20;break;
    case 'treadmill':isoBox(x+.15,y+.1,.7,d-.2,6,'#2b2f3a');isoBox(x+.15,y+.1,.7,.1,28,'#555');h=28;break;
    case 'weights':{isoBox(x+.2,y+.3,w-.4,.4,10,'#2b2f3a');const a=iso(x+.2,y+.5),b=iso(x+w-.2,y+.5);ctx.strokeStyle='#bbb';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y-24);ctx.lineTo(b.x,b.y-24);ctx.stroke();ell(a.x,a.y-24,4,7,'#333');ell(b.x,b.y-24,4,7,'#333');h=28;break}
    case 'mat':withTile(x,y,()=>{ctx.save();ctx.scale(w,d);ctx.fillStyle=f.act==='kungfu'?'#c0392b':'#9b5bd6';ctx.fillRect(.06,.08,.88,.84);ctx.fillStyle=f.act==='kungfu'?'#e2c35a':'#2fb7b0';ctx.fillRect(.4,.1,.2,.8);ctx.restore()});h=1;break;
    case 'boatmodel':isoBox(x+.25,y+.25,.5,.5,16,'#f4f4f4');poly([[p.x-10,p.y-22],[p.x+10,p.y-22],[p.x+6,p.y-17],[p.x-6,p.y-17]],'#2b6cb0');poly([[p.x,p.y-40],[p.x,p.y-22],[p.x+9,p.y-22]],'#fff');h=40;break;
    case 'mailbox':isoBox(x,y,w,.4,40,'#9aa3ad');withFace('y',x,y+.4,0,()=>{for(let i=0;i<w*4;i++)for(let r=0;r<3;r++){ctx.fillStyle='#c4cad1';ctx.fillRect(.05+i*.25,8+r*10,.2,8)}});h=40;break;
    case 'elevator':isoBox(x,y,w,.3,60,'#c4cad1');withFace('y',x,y+.3,0,()=>{ctx.fillStyle='#9aa3ad';ctx.fillRect(.1,0,.39,52);ctx.fillRect(.51,0,.39,52);ctx.fillStyle='#ffd36b';ctx.fillRect(.45,54,.1,3)});h=60;break;
    case 'bench':isoBox(x+.05,y+.3,w-.1,.4,10,'#a8693e');h=12;break;
    case 'fountainS':ell(p.x,p.y,34,17,'#d8d0bf');ell(p.x,p.y-4,30,15,'#57c3e6');ctx.fillStyle='rgba(225,245,255,.85)';ctx.fillRect(p.x-1.5,p.y-30-Math.sin(TIME*6)*2,3,26);h=10;break;
    case 'toilet':isoBox(x+.3,y+.1,.4,.2,26,'#f4f7f9',0,['#ffffff','#e6ebef','#cfd6dc']);ell(p.x,p.y-8,9,6,'#e6ebef');ell(p.x,p.y-12,8,5,'#ffffff');ell(p.x,p.y-12,5,3,'#cfe6f0');h=26;break;
    case 'shower':isoBox(x+.1,y+.1,.8,.8,2,'#dfe6ee');isoBox(x+.1,y+.1,.8,.8,52,'#bfe3f5',2,['rgba(220,240,255,.25)','rgba(190,225,245,.35)','rgba(170,210,240,.35)']);ctx.fillStyle='#9aa3ad';ctx.fillRect(p.x-1,p.y-56,2,12);ell(p.x+3,p.y-56,5,2,'#9aa3ad');h=54;break;
    case 'arcadem':isoBox(x+.15,y+.2,.7,.6,44,c||'#2b2f6a');withFace('y',x+.15,y+.8,0,()=>{ctx.fillStyle='#111';ctx.fillRect(.08,24,.54,14);ctx.fillStyle=`hsl(${(TIME*60+x*40)%360} 80% 55%)`;ctx.fillRect(.12,26,.46,10);ctx.fillStyle='#ff4f6f';ctx.fillRect(.18,16,.08,3);ctx.fillStyle='#ffd36b';ctx.fillRect(.36,16,.08,3)});EMIS.push(()=>ell(p.x-4,p.y-30,12,10,'rgba(120,200,255,.3)'));h=44;break;
    case 'telescope':ctx.fillStyle='#555';ctx.fillRect(p.x-1.5,p.y-30,3,30);rrect(p.x-8,p.y-40,16,10,4,'#2e8b57');ell(p.x-8,p.y-35,3,4,'#1b1b22');ell(p.x+8,p.y-35,3,4,'#1b1b22');h=40;break;
    case 'dummy':ctx.fillStyle='#8a5a36';ctx.fillRect(p.x-4,p.y-44,8,44);ctx.fillRect(p.x-14,p.y-36,10,3);ctx.fillRect(p.x+4,p.y-30,10,3);ctx.fillRect(p.x-2,p.y-20,12,3);ell(p.x,p.y-46,4,2,'#6a4426');h=46;break;
    case 'massagebed':isoBox(x+.05,y+.2,w-.1,.6,14,'#c49a6c');isoBox(x+.1,y+.25,w-.2,.5,3,'#f4f4f4',14);ell(p.x+10,p.y-20,4,2,'#e8d8c8');h=18;break;
    case 'tradedesk':isoBox(x,y,w,d,16,'#3a3f4c');for(let i=0;i<w*2;i++){isoBox(x+.15+i*.45,y+.15,.35,.08,16,'#111',16);withFace('y',x+.15+i*.45,y+.23,18,()=>{ctx.fillStyle='#0b2a1a';ctx.fillRect(.02,1,.31,13);ctx.strokeStyle=i%2?'#3dff8a':'#ff5d5d';ctx.lineWidth=.03;ctx.beginPath();for(let k=0;k<6;k++){const xx=.04+k*.05,yy=4+hash(i,k,Math.floor(TIME))*8;if(k)ctx.lineTo(xx,yy);else ctx.moveTo(xx,yy)}ctx.stroke()})}EMIS.push(()=>ell(p.x,p.y-26,20,8,'rgba(60,255,140,.15)'));h=34;break;
    case 'stall':isoBox(x,y,w,d,16,'#8a5a36');for(let i=0;i<w*4;i++){const q=iso(x+.2+(i%(w*2))*.4,y+.3+Math.floor(i/(w*2))*.4);ell(q.x,q.y-19,3.5,3,c==='#46b06b'?['#ff6f61','#ffc857','#46b06b','#ffb238'][i%4]:['#e2303a','#ffc857','#3f7fd8','#f4f4f4'][i%4])}{const a=iso(x,y+d),b=iso(x+w,y+d);for(let i=0;i<w*3;i++){const t=i/(w*3),t2=(i+1)/(w*3);poly([[a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-40],[a.x+(b.x-a.x)*t2,a.y+(b.y-a.y)*t2-40],[a.x+(b.x-a.x)*t2-6,a.y+(b.y-a.y)*t2-32],[a.x+(b.x-a.x)*t-6,a.y+(b.y-a.y)*t-32]],i%2?'#ffffff':'#e2303a')}}h=40;break;
    case 'dumbbell':isoBox(x+.2,y+.25,.6,.5,14,'#3a3f4c');for(let i=0;i<3;i++){const q=iso(x+.3+i*.2,y+.5);ell(q.x,q.y-16,3,3,'#222')}h=18;break;
    default:isoBox(x,y,w,d,16,'#999');
  }
  f._h=h;
}
function renderRoom(m,dt){
  HITS=[];EMIS=[];PDRAWN=false;ORD=0;DRAWN_B=[];
  ctx.setTransform(1,0,0,1,0,0);const bg=ctx.createLinearGradient(0,0,0,CH);bg.addColorStop(0,'#1b1830');bg.addColorStop(1,'#0e0c1c');ctx.fillStyle=bg;ctx.fillRect(0,0,CW,CH);
  setCam();
  for(let y=0;y<m.H;y++)for(let x=0;x<m.W;x++)floorPaint(m,x,y);
  const fl=iso(0,m.H),fr=iso(m.W,m.H),frr=iso(m.W,0);poly([[fl.x,fl.y],[fr.x,fr.y],[fr.x,fr.y+10],[fl.x,fl.y+10]],'#2a2638');poly([[fr.x,fr.y],[frr.x,frr.y],[frr.x,frr.y+10],[fr.x,fr.y+10]],'#221f30');
  const o=iso(0,0),bR=iso(m.W,0),bL=iso(0,m.H);
  poly([[o.x,o.y],[bR.x,bR.y],[bR.x,bR.y-WH],[o.x,o.y-WH]],m.dark?shade(m.wall,1.1):shade(m.wall,.96));
  poly([[o.x,o.y],[bL.x,bL.y],[bL.x,bL.y-WH],[o.x,o.y-WH]],m.dark?shade(m.wall,.85):shade(m.wall,.84));
  poly([[o.x,o.y-WH],[bR.x,bR.y-WH],[bR.x,bR.y-WH-6],[o.x,o.y-WH-6]],shade(m.wall,.7));poly([[o.x,o.y-WH],[bL.x,bL.y-WH],[bL.x,bL.y-WH-6],[o.x,o.y-WH-6]],shade(m.wall,.6));
  poly([[o.x,o.y],[bR.x,bR.y],[bR.x,bR.y-6],[o.x,o.y-6]],'rgba(0,0,0,.18)');poly([[o.x,o.y],[bL.x,bL.y],[bL.x,bL.y-6],[o.x,o.y-6]],'rgba(0,0,0,.22)');
  m.wdeco.forEach(dc=>drawWallDeco(m,dc));
  const ex=m.exit;withTile(ex[0],ex[1],()=>{ctx.fillStyle='#c0643a';ctx.fillRect(.1,.2,.8,.7);ctx.fillStyle='#e8a06a';ctx.fillRect(.18,.3,.64,.5)});
  const ep=iso(ex[0]+.5,ex[1]+.5);txt('IZEJA',ep.x,ep.y+22,'#ffd9b0',10);HITS.push({k:'exit',rect:[ep.x-26,ep.y-14,52,40]});
  const objs=[];
  m.furn.forEach(f=>{if(['rug','dance','mat','swim'].includes(f.k)){drawFurn(f);if(f.act)HITS.push({k:'furn',ref:f,poly:boxHull(f.x,f.y,f.w,f.d,4)})}else objs.push({k:'f',o:f,x:f.x,y:f.y,w:f.w,d:f.d})});
  (m.staffP||[]).forEach(s=>objs.push({k:'staff',o:s,x:s.x,y:s.y}));
  NPCS.forEach(n=>objs.push({k:'n',o:n,x:n.x,y:n.y}));
  objs.push({k:'p',x:P.x,y:P.y});
  sortObjs(objs);
  for(const ob of objs)drawObjEntry(ob);
  ctx.setTransform(1,0,0,1,0,0);
  if(m.dark){ctx.globalCompositeOperation='multiply';ctx.fillStyle='#a49ad0';ctx.fillRect(0,0,CW,CH)}
  ctx.globalCompositeOperation='lighter';setCam();EMIS.forEach(f=>f());
  if(m.dark&&m.b.type==='club'){for(let i=0;i<4;i++){const a=TIME*.8+i*1.6,src=iso(m.W/2,0),dst=iso(m.W/2+Math.cos(a)*3,m.H/2+Math.sin(a)*2);ctx.fillStyle=['rgba(255,79,163,.18)','rgba(47,224,208,.18)','rgba(255,211,107,.16)','rgba(155,91,214,.18)'][i];ctx.beginPath();ctx.moveTo(src.x-4,src.y-WH);ctx.lineTo(src.x+4,src.y-WH);ctx.lineTo(dst.x+40,dst.y);ctx.lineTo(dst.x-40,dst.y);ctx.closePath();ctx.fill()}}
  ctx.globalCompositeOperation='source-over';setCam();
  NPCS.forEach(n=>npcLabel(n));
  if(TARGET.t>0){TARGET.t-=dt}
}
