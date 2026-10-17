/* ===================== Zīmēšana ===================== */
const cv=$('#world');let ctx=cv.getContext('2d');
let DPR=Math.min(window.devicePixelRatio||1,2),ZOOM=innerWidth<600?.95:1.2,K=1,CW=0,CH=0;
const cam={x:0,y:0,init:false};
let HITS=[],EMIS=[],NIGHT=0,DUSK=0,TIME=0;
const iso=(x,y)=>({x:(x-y)*HW,y:(x+y)*HH});
function resizeCanvas(){DPR=Math.min(window.devicePixelRatio||1,2);CW=cv.width=Math.round(innerWidth*DPR);CH=cv.height=Math.round(innerHeight*DPR);K=DPR*ZOOM;tileCache={}}
function setCam(){ctx.setTransform(K,0,0,K,CW/2-cam.x*K,CH/2-cam.y*K)}
function poly(pts,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fill()}
function ell(x,y,rx,ry,col){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function rrect(x,y,w,h,r,col){ctx.fillStyle=col;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);ctx.fill()}
function withFace(axis,X,Y,z,fn){ctx.save();const o=iso(X,Y);if(axis==='y')ctx.transform(HW,HH,0,-1,o.x,o.y-z);else ctx.transform(-HW,HH,0,-1,o.x,o.y-z);fn();ctx.restore()}
function withTile(x,y,fn){ctx.save();const o=iso(x,y);ctx.transform(HW,HH,-HW,HH,o.x,o.y);fn();ctx.restore()}
function textOnFace(axis,X,Y,u,v,text,col,size,bg,emis){
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

/* ---------- Zemes flīzes ---------- */
let tileCache={},KINDS=null;
function computeKinds(){KINDS=new Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=grid[gi(x,y)];let k;
    if(t===T.ROAD){const hr=ROADS.some(r=>y===r||y===r+1),vr=ROADS.some(r=>x===r||x===r+1);
      if(hr&&!vr&&ROADS.some(a=>x===a-1||x===a+2))k='zebraY';else if(vr&&!hr&&ROADS.some(b=>y===b-1||y===b+2))k='zebraX';
      else if(hr&&!vr&&ROADS.includes(y))k='roadH';else if(vr&&!hr&&ROADS.includes(x))k='roadV';else k='road'}
    else if(t===T.WALK)k='walk';else if(t===T.SAND)k='sand';else if(t===T.PROM)k='prom';else if(t===T.PLAZA)k='plaza';else if(t===T.PIER)k='pier';
    else if(t===T.WATER){const e=Math.max(x,y);k=e<=61?'water0':e===62?'water1':'water2'}
    else if(t===T.PARK)k=(x+y)%2?'park0':'park1';else k=(hash(x,y)<.5)?'grass0':'grass1';
    KINDS[gi(x,y)]=k}}
function paintTile(g,k){
  const R_=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)},rr=mulberry(k.length*97+k.charCodeAt(0));
  const base={grass0:'#8cc96b',grass1:'#86c466',park0:'#7ec062',park1:'#79bb5d',road:'#5c6070',roadH:'#5c6070',roadV:'#5c6070',zebraX:'#5c6070',zebraY:'#5c6070',walk:'#ece4d4',sand:'#f4e1aa',prom:'#cf9b63',plaza:'#efe5d3',pier:'#b07f4f',water0:'#5fd3df',water1:'#3fb8d6',water2:'#2a9cc8'}[k];
  R_(base,-.03,-.03,1.06,1.06);
  if(k.startsWith('grass')||k.startsWith('park')){for(let i=0;i<10;i++)R_(rr()<.5?'rgba(255,255,255,.08)':'rgba(0,60,0,.08)',rr(),rr(),.08,.03);if(k.startsWith('park')&&rr()<.9)for(let i=0;i<3;i++)R_(pick(['#ffe36b','#ff8fb8','#ffffff']),rr()*.9,rr()*.9,.05,.05)}
  if(k.startsWith('road')||k.startsWith('zebra')){for(let i=0;i<14;i++)R_(rr()<.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.06)',rr(),rr(),.04,.04)}
  if(k==='roadH')R_('#f6e7a8',.28,.955,.44,.045);
  if(k==='roadV')R_('#f6e7a8',.955,.28,.045,.44);
  if(k==='zebraY')for(let i=0;i<5;i++)R_('rgba(250,250,245,.92)',.08+i*.18,.06,.1,.88);
  if(k==='zebraX')for(let i=0;i<5;i++)R_('rgba(250,250,245,.92)',.06,.08+i*.18,.88,.1);
  if(k==='walk'){g.fillStyle='rgba(120,105,85,.16)';for(let i=0;i<=4;i++){g.fillRect(i*.25,0,.012,1);g.fillRect(0,i*.25,1,.012)}}
  if(k==='plaza'){g.fillStyle='rgba(150,130,100,.18)';g.fillRect(0,0,1,.02);g.fillRect(0,0,.02,1);g.fillRect(.5,0,.01,1);g.fillRect(0,.5,1,.01)}
  if(k==='sand')for(let i=0;i<18;i++)R_(rr()<.5?'rgba(200,160,90,.18)':'rgba(255,255,255,.35)',rr(),rr(),.03,.03);
  if(k==='prom'){g.fillStyle='rgba(90,55,25,.3)';for(let i=1;i<6;i++)g.fillRect(0,i/6,1,.015)}
  if(k==='pier'){g.fillStyle='rgba(70,45,20,.4)';for(let i=1;i<6;i++)g.fillRect(i/6,0,.02,1)}
  if(k.startsWith('water'))for(let i=0;i<4;i++)R_('rgba(255,255,255,.07)',rr(),rr(),.3,.02);
}
function tileSprite(k){
  const key=k+'@'+K.toFixed(2);if(tileCache[key])return tileCache[key];
  const w=Math.ceil(TW*K)+2,h=Math.ceil(TH*K)+2,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  g.translate(1,1);g.scale(K,K);g.translate(HW,0);g.transform(HW,HH,-HW,HH,0,0);paintTile(g,k);return tileCache[key]=c;
}

/* ---------- Koki (kešoti) ---------- */
const sprCache={};
function treeSprite(kind,s){
  const key=kind+K.toFixed(2);if(sprCache[key])return sprCache[key];
  const W_=110,H_=150,c=document.createElement('canvas');c.width=Math.ceil(W_*K);c.height=Math.ceil(H_*K);const g=c.getContext('2d');g.scale(K,K);g.translate(W_/2,H_-12);
  const blob=(x,y,r,col)=>{g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()};
  if(kind==='palm'){
    g.strokeStyle='#8a6237';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(10,-45,4,-92);g.stroke();
    g.strokeStyle='rgba(60,35,10,.35)';g.lineWidth=6;for(let i=0;i<9;i++){const t=i/9,yy=-t*92,xx=10*2*t*(1-t)*1+4*t*t;g.beginPath();g.moveTo(xx-3,yy);g.lineTo(xx+3,yy);g.stroke()}
    const fr=(a,len,col)=>{g.save();g.translate(4,-92);g.rotate(a);g.fillStyle=col;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.5,-14,len,6);g.quadraticCurveTo(len*.5,-2,0,4);g.fill();g.restore()};
    [-2.6,-1.9,-1.2,-.3,.4,1.1,2.9].forEach((a,i)=>fr(a,40+(i%3)*6,i%2?'#3f9a45':'#4fb04f'));[-2.2,-.8,.8].forEach(a=>fr(a,30,'#62c25a'));
    blob(6,-90,4,'#7a5a2a');blob(1,-88,4,'#6b4e24');
  } else if(kind==='pine'){
    g.fillStyle='#6b4a2a';g.fillRect(-3,-16,6,16);
    [[34,-14,'#2f7a44'],[28,-36,'#348a4b'],[21,-56,'#3c9a52'],[13,-72,'#46a85b']].forEach(([w,y,col])=>{g.fillStyle=col;g.beginPath();g.moveTo(-w,y);g.lineTo(w,y);g.lineTo(0,y-30);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(-w,y);g.lineTo(0,y);g.lineTo(0,y-30);g.closePath();g.fill()});
  } else {
    g.fillStyle='#7a5432';g.fillRect(-3,-22,6,22);
    blob(-12,-36,17,'#4e9e46');blob(12,-38,17,'#4e9e46');blob(0,-52,20,'#58ab4e');blob(-6,-40,14,'#63b857');blob(8,-56,10,'#73c464');
  }
  return sprCache[key]=c;
}
function drawTreeAt(kind,x,y,s=1){const c=treeSprite(kind);const p=iso(x+.5,y+.5);ell(p.x+6,p.y,kind==='palm'?16:20,7,'rgba(20,40,40,.18)');ctx.drawImage(c,p.x-55*s,p.y-138*s,110*s,150*s)}

/* ---------- Ēkas ---------- */
function drawBuilding(b){
  const {bx,by,w,d,h}=b,st=b.style,wall=b.wall;
  const p00=iso(bx,by),p10=iso(bx+w,by),p11=iso(bx+w,by+d),p01=iso(bx,by+d);
  const lit=k=>hash(b.seed,k)<.62;
  const doorFace=b.side,doorU=b.side==='y'?b.door[0]-bx+.5:(b.door[1]-by+.5);
  const fy=st==='glass'?'#6d93c2':shade(wall,.97),fx=st==='glass'?'#55779f':shade(wall,.8);
  // sienas
  poly([[p01.x,p01.y],[p11.x,p11.y],[p11.x,p11.y-h],[p01.x,p01.y-h]],fy);
  poly([[p10.x,p10.y],[p11.x,p11.y],[p11.x,p11.y-h],[p10.x,p10.y-h]],fx);
  const faces=[['y',bx,by+d,w],['x',bx+w,by,d]];
  const winY=[];const glow=[];
  faces.forEach(([ax,X,Y,len],fi)=>{
    const isDoor=ax===doorFace;
    withFace(ax,X,Y,0,()=>{
      // apakšējā josla
      ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(0,0,len,4);
      if(st==='glass'){
        for(let v=32;v<h-6;v+=22){for(let u=.04;u<len-.02;u+=.5){const L=lit(fi*1000+v*10+u*10);ctx.fillStyle=NIGHT>.3?(L?'#ffe3a1':'#253a5c'):(((u*10+v)|0)%3?'#9cc6ea':'#b9dcf6');ctx.fillRect(u,v,.46,18);if(L&&NIGHT>0)glow.push([ax,X,Y,u,v,.46,18])}}
        ctx.fillStyle='rgba(255,255,255,.35)';for(let v=30;v<h;v+=22)ctx.fillRect(0,v,len,1.2);
      } else if(st==='warehouse'){
        ctx.fillStyle='rgba(0,0,0,.12)';for(let u=0;u<len;u+=.12)ctx.fillRect(u,0,.03,h);
        for(let u=.3;u<len-.3;u+=.7){ctx.fillStyle=NIGHT>.3?'#e8c37a':'#cfe4ef';ctx.fillRect(u,h-16,.35,8)}
      } else if(st==='hut'){
        ctx.fillStyle='rgba(120,80,30,.25)';for(let v=4;v<h;v+=6)ctx.fillRect(0,v,len,1);
      } else {
        const fh=st==='classic'?32:26,gf=30;
        for(let v=gf;v<h-10;v+=fh){
          if(st==='deco'){ctx.fillStyle=b.acc;ctx.fillRect(0,v,len,2.5);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(0,v+fh-7,len,1.6)}
          for(let u=.12;u<len-.2;u+=.5){
            const ww=st==='classic'?.22:.28,hh=st==='classic'?20:13,vv=v+(st==='classic'?7:6);
            if(isDoor&&Math.abs(u+ww/2-doorU)<.25&&v===gf&&st==='classic')continue;
            const L=lit(fi*1000+v*10+u*10);
            ctx.fillStyle=NIGHT>.3?(L?'#ffd98a':'#2b3350'):'#a8d4ef';ctx.fillRect(u,vv,ww,hh);
            if(NIGHT<=.3){ctx.fillStyle='rgba(255,255,255,.45)';ctx.fillRect(u,vv+hh-4,ww*.4,4)}
            ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(u-.02,vv-1.5,ww+.04,1.5);
            if(st==='apt'&&fi===0){ctx.fillStyle=shade(wall,.75);ctx.fillRect(u-.06,vv-4,ww+.12,3);ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(u-.06,vv-1,ww+.12,.8)}
            if((st==='house'||st==='villa')){ctx.fillStyle=b.acc;ctx.fillRect(u-.07,vv,.05,hh);ctx.fillRect(u+ww+.02,vv,.05,hh)}
            if(L&&NIGHT>0)glow.push([ax,X,Y,u,vv,ww,hh]);
          }
        }
        if(st==='classic'){ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillRect(0,h-8,len,8);ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,h-10,len,2)}
        if(st==='deco'&&fi===0){ctx.fillStyle=b.acc;ctx.fillRect(len-.14,0,.14,h)}
        // pirmā stāva vitrīnas
        if(['shop','deco','apt'].includes(st)&&b.type!=='hosp'){
          for(let u=.1;u<len-.2;u+=.6){if(isDoor&&Math.abs(u+.25-doorU)<.4)continue;ctx.fillStyle=NIGHT>.2?'#ffe6b5':'#bfe0f3';ctx.fillRect(u,4,.48,19);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(u+.02,6,.12,15);if(NIGHT>0&&st!=='apt')glow.push([ax,X,Y,u,4,.48,19])}
        }
      }
      // ieejas durvis
      if(isDoor){
        const du=doorU;ctx.fillStyle=b.acc;ctx.fillRect(du-.24,0,.48,26);ctx.fillStyle=NIGHT>.2?'#ffe9b8':'#2d2a3a';ctx.fillRect(du-.17,0,.34,22);
        ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(du-.15,2,.08,18);if(NIGHT>0)glow.push([ax,X,Y,du-.17,0,.34,22]);
        if(st==='classic'){ctx.fillStyle='#fffaf0';for(const off of [-.42,-.3,.26,.38])ctx.fillRect(du+off,0,.06,30)}
      }
    });
    // markīze
    if(isDoor&&['shop','deco','hut'].includes(st)&&b.type!=='hosp'){
      const e=ax==='y'?[HW,HH]:[-HW,HH],n=ax==='y'?[-7,3.5]:[7,3.5],o=iso(X,Y),u0=Math.max(0,doorU-.7),u1=Math.min(len,doorU+.7),segs=8;
      for(let i=0;i<segs;i++){const a=u0+(u1-u0)*i/segs,bb=u0+(u1-u0)*(i+1)/segs;
        const A=[o.x+e[0]*a,o.y+e[1]*a-34],B=[o.x+e[0]*bb,o.y+e[1]*bb-34];
        poly([A,B,[B[0]+n[0],B[1]+n[1]+8],[A[0]+n[0],A[1]+n[1]+8]],i%2?'#ffffff':b.acc)}
    }
  });
  // izkārtne virs durvīm
  const sx=b.side==='y'?bx:bx+w,sy=b.side==='y'?by+d:by,signV=st==='glass'?34:(st==='hut'?h-6:Math.min(h-8,(st==='classic'?40:36)));
  const short=b.n.length>22?b.n.replace(/^(Dzīvojamais )?/,''):b.n;
  if(st!=='house'&&st!=='villa')textOnFace(b.side,sx,sy,doorU,signV,short,b.type==='luxe'||b.type==='vip'?'#ffd36b':'#ffffff',7.5,st==='apt'?'rgba(40,40,60,.55)':shade(b.acc,.8));
  // jumts
  if(st==='house'){
    const rh=26,rc=b.roof||'#b5533c';
    const ry=by+d/2;const A=iso(bx,by),B=iso(bx+w,by),C1=iso(bx+w,by+d),D=iso(bx,by+d),Ra=iso(bx,ry),Rb=iso(bx+w,ry);
    poly([[A.x,A.y-h],[B.x,B.y-h],[Rb.x,Rb.y-h-rh],[Ra.x,Ra.y-h-rh]],shade(rc,1.1));
    poly([[D.x,D.y-h],[C1.x,C1.y-h],[Rb.x,Rb.y-h-rh],[Ra.x,Ra.y-h-rh]],rc);
    poly([[C1.x,C1.y-h],[B.x,B.y-h],[Rb.x,Rb.y-h-rh]],shade(wall,.85));
    ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=1;for(let i=1;i<6;i++){const t=i/6;ctx.beginPath();ctx.moveTo(D.x+(Ra.x-D.x)*t,D.y-h+(Ra.y-h-rh-(D.y-h))*t);ctx.lineTo(C1.x+(Rb.x-C1.x)*t,C1.y-h+(Rb.y-h-rh-(C1.y-h))*t);ctx.stroke()}
    isoBox(bx+w*.7,by+d*.3,.35,.35,rh+10,'#9a6a4a',h);
  } else if(st==='hut'){
    const o=.25,A=iso(bx-o,by-o),B=iso(bx+w+o,by-o),C1=iso(bx+w+o,by+d+o),D=iso(bx-o,by+d+o),top=iso(bx+w/2,by+d/2);
    const rh=18;poly([[A.x,A.y-h],[B.x,B.y-h],[top.x,top.y-h-rh]],shade(b.acc,1.15));poly([[B.x,B.y-h],[C1.x,C1.y-h],[top.x,top.y-h-rh]],shade(b.acc,.8));poly([[D.x,D.y-h],[C1.x,C1.y-h],[top.x,top.y-h-rh]],b.acc);
    for(let i=0;i<6;i++){const t=i/6,t2=(i+.5)/6;poly([[D.x+(C1.x-D.x)*t,D.y+(C1.y-D.y)*t-h],[D.x+(C1.x-D.x)*t2,D.y+(C1.y-D.y)*t2-h],[top.x,top.y-h-rh]],'rgba(255,255,255,.45)')}
  } else {
    const rc=st==='glass'?'#7f93ad':(b.roof||shade(wall,.88));
    poly([[p00.x,p00.y-h],[p10.x,p10.y-h],[p11.x,p11.y-h],[p01.x,p01.y-h]],rc);
    const i0=iso(bx+.15,by+.15),i1=iso(bx+w-.15,by+.15),i2=iso(bx+w-.15,by+d-.15),i3=iso(bx+.15,by+d-.15);
    poly([[i0.x,i0.y-h],[i1.x,i1.y-h],[i2.x,i2.y-h],[i3.x,i3.y-h]],shade(rc,.86));
    roofExtras(b);
  }
  // vertikālās neona izkārtnes
  if(b.neon){const ax=b.side==='y'?'x':'y',X=ax==='x'?bx+w:bx,Y=ax==='x'?by:by+d,len=ax==='x'?d:w,u=ax==='x'?.25:len-.35;
    withFace(ax,X,Y,0,()=>{ctx.fillStyle='#14111c';ctx.fillRect(u-.15,h*.3,.3,h*.62)});
    const L=b.neon.length,step=h*.56/L;for(let i=0;i<L;i++)textOnFace(ax,X,Y,u,h*.88-i*step,b.neon[i],NIGHT>.2?'#fff':b.acc,9);
    if(NIGHT>0)EMIS.push(()=>{ctx.save();ctx.shadowColor=b.acc;ctx.shadowBlur=14;for(let i=0;i<L;i++)textOnFace(ax,X,Y,u,h*.88-i*step,b.neon[i],b.acc,9);ctx.restore()});
  }
  if(glow.length)EMIS.push(()=>{ctx.globalAlpha=Math.min(1,NIGHT*1.2);glow.forEach(([ax,X,Y,u,v,ww,hh])=>withFace(ax,X,Y,0,()=>{ctx.fillStyle='rgba(255,200,110,.75)';ctx.fillRect(u,v,ww,hh);ctx.fillStyle='rgba(255,190,100,.18)';ctx.fillRect(u-.06,v-3,ww+.12,hh+6)}));ctx.globalAlpha=1});
}
function roofExtras(b){
  const {bx,by,w,d,h}=b,cx=bx+w/2,cy=by+d/2;
  if(b.type==='gov'){const p=iso(cx,cy);ell(p.x,p.y-h-2,30,15,'#e9dfc6');ctx.fillStyle='#e0d3b2';ctx.fillRect(p.x-30,p.y-h-18,60,16);ell(p.x,p.y-h-18,30,15,'#efe5cc');
    const g=ctx.createRadialGradient(p.x-8,p.y-h-40,4,p.x,p.y-h-26,32);g.addColorStop(0,'#ffe9a0');g.addColorStop(1,'#b8901f');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(p.x,p.y-h-18,28,30,0,Math.PI,0);ctx.fill();
    ctx.fillStyle='#555';ctx.fillRect(p.x-1,p.y-h-78,2,32);const wv=Math.sin(TIME*3)*2;poly([[p.x+1,p.y-h-78],[p.x+20,p.y-h-76+wv],[p.x+20,p.y-h-66+wv],[p.x+1,p.y-h-68]],'#e8a93a');poly([[p.x+1,p.y-h-74],[p.x+20,p.y-h-72+wv],[p.x+20,p.y-h-70+wv],[p.x+1,p.y-h-72]],'#ffffff');return}
  if(b.type==='hosp'){const p=iso(cx,cy);ell(p.x,p.y-h,34,17,'#5d6878');ctx.save();ctx.translate(p.x,p.y-h);ctx.scale(1,.5);ctx.strokeStyle='#ffd36b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 30px Sora, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('H',0,2);ctx.restore();
    textOnFace('y',bx,by+d,w-.6,h-14,'✚','#e04f5f',22);return}
  if(b.type==='hotel'||b.type==='villa'){isoBox(bx+.6,by+.6,Math.min(2.2,w-1.2),Math.min(2,d-1.2),1,'#e9f6f8',h);const o=iso(bx+.75,by+.75),o2=iso(bx+.6+Math.min(2.2,w-1.2)-.15,by+.75),o3=iso(bx+.6+Math.min(2.2,w-1.2)-.15,by+.6+Math.min(2,d-1.2)-.15),o4=iso(bx+.75,by+.6+Math.min(2,d-1.2)-.15);
    const g=ctx.createLinearGradient(o.x,o.y-h,o3.x,o3.y-h);g.addColorStop(0,'#5fd7ea');g.addColorStop(1,'#2aa7d4');poly([[o.x,o.y-h-1],[o2.x,o2.y-h-1],[o3.x,o3.y-h-1],[o4.x,o4.y-h-1]],g);
    if(b.type==='hotel')[[w-1.2,d-1],[w-1.2,d-2]].forEach(([x,y])=>{const p=iso(bx+x,by+y);ctx.fillStyle='#fff';ctx.fillRect(p.x-1,p.y-h-18,2,18);poly([[p.x-10,p.y-h-16],[p.x+10,p.y-h-16],[p.x,p.y-h-26]],'#ff6f61')});
    return}
  if(b.type==='media'){const p=iso(cx,cy);ctx.fillStyle='#c9ccd2';ctx.fillRect(p.x-1,p.y-h-50,2,50);if(Math.floor(TIME*1.6)%2===0){ell(p.x,p.y-h-51,3,3,'#ff3b3b');EMIS.push(()=>ell(p.x,p.y-h-51,7,7,'rgba(255,60,60,.5)'))}
    ell(p.x+18,p.y-h-10,10,6,'#e8ecef');ell(p.x+18,p.y-h-10,6,3.5,'#c3c9cf')}
  if(b.type==='office'){const p=iso(cx,cy);ctx.fillStyle='#d6d9de';ctx.fillRect(p.x-1,p.y-h-40,2,40);if(Math.floor(TIME*1.2)%2===0){ell(p.x,p.y-h-41,3,3,'#ff3b3b');EMIS.push(()=>ell(p.x,p.y-h-41,7,7,'rgba(255,60,60,.5)'))}}
  if(b.style!=='warehouse'){isoBox(bx+.3,by+.3,.5,.4,9,'#c4c9d1',h);if(w>2)isoBox(bx+w-.9,by+d*.45,.45,.45,7,'#b5bac2',h)}
  if(b.style==='warehouse'){for(let i=0;i<w-1;i+=1.4){const p=iso(bx+.5+i,by+.4),p2=iso(bx+1+i,by+.4),p3=iso(bx+1+i,by+d-.4),p4=iso(bx+.5+i,by+d-.4);poly([[p.x,p.y-h-1],[p2.x,p2.y-h-1],[p3.x,p3.y-h-1],[p4.x,p4.y-h-1]],NIGHT>.3?'#d9b56a':'#a9c3d4')}}
  if(b.type==='apt'&&b.h>100){const p=iso(bx+w*.6,by+d*.35);ctx.fillStyle='#8a8f99';ctx.fillRect(p.x-8,p.y-h-22,16,18);ell(p.x,p.y-h-22,8,4,'#a3a8b1')}
}
function drawShadow(b){
  const {bx,by,w,d,h}=b,s=h/48,dx=.55*s,dy=-.12*s;
  const pts=[[bx,by],[bx+w,by],[bx+w,by+d],[bx,by+d],[bx+dx,by+dy],[bx+w+dx,by+dy],[bx+w+dx,by+d+dy],[bx+dx,by+d+dy]].map(([x,y])=>{const p=iso(x,y);return [p.x,p.y]});
  poly(hull(pts),`rgba(25,35,70,${(.2*(1-NIGHT)).toFixed(3)})`);
}
function hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];for(const p of P){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}return lo.slice(0,-1).concat(up.slice(0,-1))}

/* ---------- Cilvēki ---------- */
function drawPerson(sx,sy,L,sex,ph,moving,dir,o={}){
  const sc=o.scale||1;
  ctx.save();ctx.translate(sx,sy);ctx.scale(sc,sc);
  ell(0,0,11,4.5,'rgba(20,20,40,.25)');
  if(o.vehicle==='scooter'&&moving){ctx.save();if(dir===0||dir===3)ctx.scale(-1,1);rrect(-14,-8,28,5,2,'#ff6f61');ell(-11,-2,4,4,'#222');ell(11,-2,4,4,'#222');ctx.fillStyle='#ccc';ctx.fillRect(9,-20,2,14);ctx.restore()}
  const front=dir<2,flip=(dir===0||dir===3);if(flip)ctx.scale(-1,1);
  const sw=moving?Math.sin(ph):0,bob=moving?Math.abs(Math.cos(ph))*1.2:Math.sin(TIME*2+sx)*.3;
  ctx.translate(0,-bob);
  const top=L.top,bot=L.bot,skin=L.skin,dress=top.t==='dress';
  const legCol=bot.t==='shorts'||bot.t==='skirt'||dress?skin:bot.c;
  const leg=(x,lift)=>{rrect(x,-14+lift*.3,5,14-lift,2,legCol);if(bot.t==='shorts')rrect(x-.3,-14,5.6,6,1.5,bot.c);ell(x+2.5,-lift*.6,3.4,2,L.shoe)};
  leg(-5.5+sw*1.4,Math.max(0,sw)*2.4);leg(.5-sw*1.4,Math.max(0,-sw)*2.4);
  if(bot.t==='skirt'){poly([[-7,-15],[7,-15],[8.5,-7],[-8.5,-7]],bot.c)}
  // ķermenis
  if(L.hair==='long'||L.hair==='pony'){}
  const tc=top.c,dark=shade(tc,.8);
  rrect(-7.5,-29,15,16,5,tc);
  if(dress)poly([[-7.5,-17],[7.5,-17],[10,-5],[-10,-5]],tc);
  ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(2.5,-28,5,15);
  if(top.t==='jacket'){poly([[-2,-29],[2,-29],[0,-20]],'#f4f1ea');poly([[-5,-29],[-1.5,-29],[-1,-18]],dark);poly([[5,-29],[1.5,-29],[1,-18]],dark)}
  if(top.t==='shirt'){poly([[-3.5,-29],[0,-26],[-1,-24]],'#ffffff');poly([[3.5,-29],[0,-26],[1,-24]],'#ffffff');ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(-.3,-25,.8,11)}
  if(top.t==='hoodie'){ctx.fillStyle=dark;ctx.fillRect(-4,-19,8,1.4)}
  if(top.t==='tank'){ctx.fillStyle=skin;ctx.fillRect(-7.5,-29,3,4);ctx.fillRect(4.5,-29,3,4)}
  const sleeve=['shirt','jacket','hoodie'].includes(top.t)?'long':top.t==='tee'?'short':'none';
  const arm=(x,a)=>{ctx.save();ctx.translate(x,-27);ctx.rotate(a);rrect(-2,0,4,13,2,sleeve==='long'?tc:skin);if(sleeve==='short')rrect(-2.2,0,4.4,5,2,tc);ell(0,13.5,2.4,2.4,skin);ctx.restore()};
  arm(-9,sw*.55);arm(9,-sw*.55);
  if(L.acc==='necklace'){ctx.strokeStyle='#ffd36b';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,-28,4,.2,Math.PI-.2);ctx.stroke()}
  // galva
  ctx.fillStyle=skin;ctx.fillRect(-2,-31,4,3);
  const hc=L.hairC;
  if(front&&(L.hair==='long'))rrect(-11.5,-44,23,18,6,hc);
  if(!front&&(L.hair==='long'||L.hair==='pony'))rrect(-11,-44,22,(L.hair==='long'?20:10),6,hc);
  if(front&&L.hair==='pony'){ctx.save();ctx.translate(-10,-40);ctx.rotate(.5+Math.sin(TIME*4)*.08);rrect(-3,0,6,12,3,hc);ctx.restore()}
  ell(0,-39,10.5,10.8,skin);
  if(front){
    ell(-3.6+1,-38.5,1.5,2.1,'#2a2230');ell(3.4+1,-38.5,1.5,2.1,'#2a2230');ell(-3.2+1,-39.2,.5,.6,'#fff');ell(3.8+1,-39.2,.5,.6,'#fff');
    ctx.strokeStyle='#8a4a3a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(1.4,-34.5,2,.2,Math.PI-.2);ctx.stroke();
    ell(-5.5,-35.5,1.8,1,'rgba(255,120,120,.35)');ell(7,-35.5,1.8,1,'rgba(255,120,120,.35)');
    ell(9.5,-38,1.6,2.4,shade(skin,.9));
  }
  // mati
  ctx.fillStyle=hc;
  const cap=()=>{ctx.beginPath();ctx.ellipse(0,-41,11.2,9.5,0,Math.PI*1.02,Math.PI*1.98);ctx.fill();ctx.beginPath();ctx.ellipse(1,-44,10.5,6.5,0,0,Math.PI*2);ctx.fill()};
  if(L.hair!=='bald'){
    if(!front){ell(0,-40,11,10.5,hc)}
    else if(L.hair==='mohawk'){rrect(-2,-55,5,14,2,hc);ctx.fillRect(-10,-42,2,4);ctx.fillRect(8,-42,2,4)}
    else if(L.hair==='curly'){[[-8,-44],[-3,-48],[3,-48],[8,-44],[10,-39],[-10,-39]].forEach(([x,y])=>ell(x,y,4.5,4.5,hc))}
    else{cap();if(L.hair==='short'){ctx.beginPath();ctx.moveTo(-8,-44);ctx.quadraticCurveTo(2,-36,9,-44);ctx.fill()}else{ctx.beginPath();ctx.moveTo(-10,-42);ctx.quadraticCurveTo(-2,-37,10,-43);ctx.lineTo(10,-46);ctx.fill()}
      if(L.hair==='bun')ell(-1,-52,5,5,hc);if(L.hair==='long'){rrect(-11.5,-42,3.5,13,2,hc);rrect(8.5,-42,3,10,2,hc)}}
  }
  if(L.acc==='sunglasses'&&front){rrect(-6.5,-40.5,6,3.4,1.5,'#1b1b22');rrect(1.5,-40.5,6,3.4,1.5,'#1b1b22');ctx.fillStyle='#1b1b22';ctx.fillRect(-.5,-39.5,2,.8)}
  if(L.acc==='cap'){ctx.fillStyle=o.capC||'#e04f5f';ctx.beginPath();ctx.ellipse(0,-45,10.5,6.5,0,Math.PI,0);ctx.fill();if(front)rrect(4,-46,10,3,1.5,'#c03d4d')}
  if(L.acc==='hat'){ell(0,-46,15,4.5,'#d9c38f');rrect(-8,-56,16,10,4,'#d9c38f');ctx.fillStyle='#8a5a36';ctx.fillRect(-8,-49,16,2.5)}
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
  if(c.taxi){const q=iso(c.x,c.y);rrect(q.x-6,q.y-26,12,5,2,'#ffe066');ctx.fillStyle='#222';ctx.font='700 4px sans-serif';ctx.textAlign='center';ctx.fillText('TAXI',q.x,q.y-22.5)}
  if(NIGHT>0){const f=ax==='x'?(c.dir>0?iso(x0+w,c.y):iso(x0,c.y)):(c.dir>0?iso(c.x,y0+d):iso(c.x,y0));EMIS.push(()=>{const g=ctx.createRadialGradient(f.x,f.y-6,1,f.x,f.y-6,30);g.addColorStop(0,`rgba(255,240,190,${.7*NIGHT})`);g.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=g;ctx.fillRect(f.x-30,f.y-36,60,60)})}
}

/* ---------- Pilsētas objekti ---------- */
function drawCityObj(o){
  const p=iso(o.x+.5,o.y+.5);
  if(o.k==='tree'){drawTreeAt(o.kind,o.x,o.y,o.s);return}
  if(o.k==='bench'){isoBox(o.x+.15,o.y+.35,.7,.3,7,'#a8693e',5);isoBox(o.x+.15,o.y+.32,.7,.06,14,'#8f5832',5);ctx.fillStyle='#333';ctx.fillRect(p.x-14,p.y-5,2,6);ctx.fillRect(p.x+12,p.y-5,2,6);return}
  if(o.k==='lounger'){isoBox(o.x+.25,o.y+.1,.5,.8,4,o.c,3);ctx.fillStyle='#ddd';ctx.fillRect(p.x-1,p.y-40,2,40);const t=iso(o.x+.5,o.y+.5);poly([[t.x-24,t.y-36],[t.x+24,t.y-36],[t.x,t.y-48]],o.c);poly([[t.x-24,t.y-36],[t.x-8,t.y-36],[t.x,t.y-48]],'#ffffff');return}
  if(o.k==='cart'){isoBox(o.x+.15,o.y+.2,.7,.6,18,{hotdog:'#ff6f61',smoothie:'#46b06b',icecart:'#ff8fb8'}[o.kind],4);ell(p.x-10,p.y-2,4,4,'#333');ell(p.x+8,p.y+2,4,4,'#333');ctx.fillStyle='#ccc';ctx.fillRect(p.x-1,p.y-50,2,30);poly([[p.x-22,p.y-46],[p.x+22,p.y-46],[p.x,p.y-58]],'#ffffff');poly([[p.x-22,p.y-46],[p.x-7,p.y-46],[p.x,p.y-58]],'#ffc857');return}
  if(o.k==='atm'){isoBox(o.x+.3,o.y+.3,.4,.3,28,'#3f6fb5');textOnFace('y',o.x+.3,o.y+.6,.2,22,'€','#fff',7);if(NIGHT>0)EMIS.push(()=>ell(p.x-4,p.y-22,8,8,'rgba(120,190,255,.35)'));return}
  if(o.k==='taxi'){ctx.fillStyle='#555';ctx.fillRect(p.x-1,p.y-40,2,40);rrect(p.x-12,p.y-52,24,12,3,'#ffe066');ctx.fillStyle='#222';ctx.font='800 7px Sora, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('TAXI',p.x,p.y-46);return}
  if(o.k==='fountain'){ell(p.x,p.y,40,20,'#cfc6b3');ell(p.x,p.y-4,36,18,'#bfb6a2');ell(p.x,p.y-5,32,16,'#57c3e6');ctx.fillStyle='#d8d0bf';ctx.fillRect(p.x-4,p.y-26,8,22);ell(p.x,p.y-26,12,6,'#e2dbc9');const j=Math.sin(TIME*6)*2;
    ctx.fillStyle='rgba(225,245,255,.85)';ctx.fillRect(p.x-1.5,p.y-52-j,3,26);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+TIME;ell(p.x+Math.cos(a)*10,p.y-28+Math.sin(a)*5,1.5,1.5,'#eaffff')}return}
  if(o.k==='tower'){isoBox(o.x+.2,o.y+.2,.6,.6,6,'#e04f5f',38);[[.2,.2],[.8,.2],[.2,.8],[.8,.8]].forEach(([a,b])=>{const q=iso(o.x+a,o.y+b);ctx.fillStyle='#d9d9d9';ctx.fillRect(q.x-1,q.y-38,2,38)});isoBox(o.x+.15,o.y+.15,.7,.7,4,'#ffffff',44);return}
  if(o.k==='boat'){const bob=Math.sin(TIME*1.5+o.x)*1.5;ctx.save();ctx.translate(0,bob);isoBox(o.x-.6,o.y-.2,1.2,.45,8,o.c,0);ctx.fillStyle='#ddd';ctx.fillRect(p.x-1-16,p.y-60-16,2,56);poly([[p.x-15-16,p.y-62-16],[p.x-15-16,p.y-22-16],[p.x+12-16,p.y-22-16]],'#ffffff');ctx.restore();return}
}
function drawGnome(x,y){const p=iso(x+.5,y+.5);ell(p.x,p.y,6,2.5,'rgba(0,0,0,.2)');rrect(p.x-5,p.y-12,10,11,3,'#3060c0');ell(p.x,p.y-15,5,5,'#f6d2b5');ell(p.x,p.y-12,5,4,'#ffffff');poly([[p.x-6,p.y-17],[p.x+6,p.y-17],[p.x+1,p.y-30]],'#e2303a')}
function drawCat(x,y){const p=iso(x+.5,y+.5);ell(p.x,p.y,7,2.5,'rgba(0,0,0,.2)');ell(p.x,p.y-6,8,5,'#f2a541');ell(p.x+7,p.y-11,4.5,4.5,'#f2a541');poly([[p.x+4,p.y-14],[p.x+6,p.y-19],[p.x+8,p.y-14]],'#f2a541');poly([[p.x+8,p.y-14],[p.x+10,p.y-19],[p.x+11,p.y-13]],'#f2a541');ctx.strokeStyle='#f2a541';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-7,p.y-6);ctx.quadraticCurveTo(p.x-14,p.y-14+Math.sin(TIME*5)*2,p.x-10,p.y-18);ctx.stroke()}
function drawLamp(l){const p=iso(l.x+.5+l.o[0],l.y+.5+l.o[1]);ctx.fillStyle='#3b3f4c';ctx.fillRect(p.x-1,p.y-46,2.2,46);ctx.fillRect(p.x-1,p.y-46,9,2);ell(p.x+8,p.y-43,3.5,2.5,NIGHT>.2?'#fff2c4':'#d9dde3');
  if(NIGHT>0)EMIS.push(()=>{const g=ctx.createRadialGradient(p.x+8,p.y-43,1,p.x+8,p.y-43,22);g.addColorStop(0,`rgba(255,220,150,${.9*NIGHT})`);g.addColorStop(1,'rgba(255,215,140,0)');ctx.fillStyle=g;ctx.fillRect(p.x-16,p.y-67,48,48);ctx.save();ctx.translate(p.x+8,p.y);ctx.scale(1,.5);const g2=ctx.createRadialGradient(0,0,2,0,0,44);g2.addColorStop(0,`rgba(255,210,130,${.35*NIGHT})`);g2.addColorStop(1,'rgba(255,210,130,0)');ctx.fillStyle=g2;ctx.beginPath();ctx.arc(0,0,44,0,Math.PI*2);ctx.fill();ctx.restore()})}
function drawPin(x,y,z,col,label){const p=iso(x,y),yy=p.y-z+Math.sin(TIME*3)*3;ctx.fillStyle=col;ctx.beginPath();ctx.arc(p.x,yy-12,9,Math.PI,0);ctx.lineTo(p.x,yy+2);ctx.closePath();ctx.fill();ell(p.x,yy-12,4,4,'#fff');if(label)txt(label,p.x,yy-24,'#fff',10)}

/* ---------- Pilsētas kadrs ---------- */
function skyCol(){const day='#7fd0f0',dusk='#f7a072',night='#141838';return hexMix(hexMix(day,dusk,DUSK*(1-NIGHT)),night,NIGHT)}
function renderCity(dt){
  HITS=[];EMIS=[];
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=hexMix('#2a9cc8','#0e1a3a',NIGHT);ctx.fillRect(0,0,CW,CH);
  setCam();
  const vw=CW/K,vh=CH/K,L=cam.x-vw/2-80,Rr=cam.x+vw/2+80,Tp=cam.y-vh/2-80,Bt=cam.y+vh/2+280;
  // ārpuse (zeme ziemeļos/rietumos)
  const a=iso(-60,-60),b2=iso(61,-60),c2=iso(61,0),d2=iso(0,0),e2=iso(0,61),f2=iso(-60,61);
  poly([[a.x,a.y],[b2.x,b2.y],[c2.x,c2.y],[d2.x,d2.y],[e2.x,e2.y],[f2.x,f2.y]],'#86c466');
  if(!KINDS)computeKinds();
  const corners=[[L,Tp],[Rr,Tp],[L,Bt],[Rr,Bt]].map(([x,y])=>({x:(x/HW+y/HH)/2,y:(y/HH-x/HW)/2}));
  const x0=Math.max(0,Math.floor(Math.min(...corners.map(c=>c.x)))),x1=Math.min(W-1,Math.ceil(Math.max(...corners.map(c=>c.x)))),y0=Math.max(0,Math.floor(Math.min(...corners.map(c=>c.y)))),y1=Math.min(H-1,Math.ceil(Math.max(...corners.map(c=>c.y))));
  const sw=(TW*K+2)/K,sh=(TH*K+2)/K;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const p=iso(x,y);if(p.x<L-40||p.x>Rr+40||p.y<Tp-40||p.y>Bt)continue;ctx.drawImage(tileSprite(KINDS[gi(x,y)]),p.x-HW-1/K,p.y-1/K,sw,sh);
    const t=grid[gi(x,y)];
    if(t===T.WATER){const ph=Math.sin(TIME*1.4+x*.8+y*.5);if(ph>.3)withTile(x,y,()=>{ctx.fillStyle=`rgba(255,255,255,${(ph-.3)*.35})`;ctx.fillRect(.2+ph*.2,.45,.35,.03)});
      if(grid[gi(x-1,y)]===T.SAND||grid[gi(x,y-1)]===T.SAND){const f=.5+Math.sin(TIME*2+x+y)*.5;withTile(x,y,()=>{ctx.fillStyle=`rgba(255,255,255,${.35+f*.3})`;if(grid[gi(x-1,y)]===T.SAND)ctx.fillRect(0,0,.06+f*.06,1);if(grid[gi(x,y-1)]===T.SAND)ctx.fillRect(0,0,1,.06+f*.06)})}}
    if(t===T.WALK){withTile(x,y,()=>{ctx.fillStyle='rgba(110,100,90,.45)';if(grid[gi(x+1,y)]===T.ROAD)ctx.fillRect(.94,0,.06,1);if(x>0&&grid[gi(x-1,y)]===T.ROAD)ctx.fillRect(0,0,.06,1);if(grid[gi(x,y+1)]===T.ROAD)ctx.fillRect(0,.94,1,.06);if(y>0&&grid[gi(x,y-1)]===T.ROAD)ctx.fillRect(0,0,1,.06)})}
  }
  // ēnas
  const vis=b=>{const p=iso(b.bx+b.w/2,b.by+b.d/2);return p.x>L-200&&p.x<Rr+200&&p.y>Tp-60&&p.y<Bt+60};
  const vb=BLDS.filter(vis);if(NIGHT<1)vb.forEach(drawShadow);
  // objekti
  const objs=[];
  vb.forEach(b=>objs.push({k:'b',o:b,x:b.bx,y:b.by,w:b.w,d:b.d}));
  CITY_OBJS.forEach(o=>{const p=iso(o.x,o.y);if(p.x>L&&p.x<Rr&&p.y>Tp&&p.y<Bt)objs.push({k:'o',o,x:o.x+.5,y:o.y+.5})});
  DECO.forEach(o=>objs.push({k:'o',o,x:o.x,y:o.y}));
  LAMPS.forEach(l=>{const p=iso(l.x,l.y);if(p.x>L&&p.x<Rr&&p.y>Tp&&p.y<Bt)objs.push({k:'l',o:l,x:l.x+.5+l.o[0],y:l.y+.5+l.o[1]})});
  GNOME_SPOTS.forEach((g,i)=>{if(!S.gnomes.includes(i))objs.push({k:'g',o:g,x:g[0]+.5,y:g[1]+.5})});
  S.quests.forEach(q=>{if(q.type==='pet'&&!q.found&&q.pet)objs.push({k:'cat',o:q.pet,x:q.pet[0]+.5,y:q.pet[1]+.5})});
  CARS.forEach(c=>objs.push({k:'car',o:c,x:c.x,y:c.y}));
  NPCS.forEach(n=>objs.push({k:'n',o:n,x:n.x,y:n.y}));
  if(!C().jail)objs.push({k:'p',x:P.x,y:P.y});
  sortObjs(objs);
  for(const o of objs)drawObjEntry(o);
  overlayNight();
  // birkas, pin
  NPCS.forEach(n=>npcLabel(n));
  const hb=bld(HOMES[C().home].b);drawPin(hb.door[0]+.5,hb.door[1]+.5,hb.h+30,'#ff6f61','Mājas');
  S.quests.forEach(q=>{if(q.done)return;if((q.type==='meet'||q.type==='deliver')&&q.b){const b=bld(q.b);drawPin(b.door[0]+.5,b.door[1]+.5,b.h+30,'#ffc857','!')}});
  if(TARGET.t>0){TARGET.t-=dt;const p=iso(TARGET.x+.5,TARGET.y+.5);ctx.strokeStyle=`rgba(255,255,255,${TARGET.t})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,18,9,0,0,Math.PI*2);ctx.stroke()}
}
function objBox(o){if(o.k==='b'||o.k==='f'){const h=o.k==='b'?o.o.h+(o.o.style==='house'?30:o.o.type==='gov'?80:20):Math.max(24,o.o._h||24);const a=iso(o.x,o.y),b=iso(o.x+o.w,o.y),c=iso(o.x+o.w,o.y+o.d),d=iso(o.x,o.y+o.d);return [d.x,b.x,a.y-h,c.y]}
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
function drawObjEntry(o){
  if(o.k==='b'){drawBuilding(o.o);HITS.push({k:'bld',ref:o.o,poly:boxHull(o.o.bx,o.o.by,o.o.w,o.o.d,o.o.h+(o.o.style==='house'?26:0))})}
  else if(o.k==='o'){drawCityObj(o.o);if(o.o.act){const p=iso(o.o.x+.5,o.o.y+.5);HITS.push({k:'obj',ref:o.o,rect:[p.x-20,p.y-50,40,56]})}}
  else if(o.k==='l')drawLamp(o.o);
  else if(o.k==='g')drawGnome(o.o[0],o.o[1]);
  else if(o.k==='cat')drawCat(o.o[0],o.o[1]);
  else if(o.k==='car')drawCar(o.o);
  else if(o.k==='f'){drawFurn(o.o);if(o.o.act){HITS.push({k:'furn',ref:o.o,poly:boxHull(o.o.x,o.o.y,o.o.w,o.o.d,Math.max(18,o.o._h||20))})}}
  else if(o.k==='n'){const n=o.o,inf=npcInfo(n),p=iso(n.x,n.y);drawPerson(p.x,p.y,inf.look,inf.sex,n.ph||0,n.path.length>0&&!n.talking,n.dir||0,{scale:inf.scale||1});HITS.push({k:'npc',ref:n,rect:[p.x-12,p.y-56,24,58]})}
  else if(o.k==='staff'){const s=o.o,p=iso(s.x,s.y);drawPerson(p.x,p.y,s.look,s.sex,0,false,0,{});HITS.push({k:'furn',ref:s.o,rect:[p.x-12,p.y-56,24,58]})}
  else if(o.k==='p'){const p=iso(P.x,P.y);drawPerson(p.x,p.y,myLook(),C().sex,P.ph,P.path.length>0,P.dir,{vehicle:S.where?null:C().veh});
    const bob=Math.sin(TIME*4)*2;poly([[p.x-5,p.y-66+bob],[p.x+5,p.y-66+bob],[p.x,p.y-59+bob]],'#ff6f61')}
}
function overlayNight(){
  ctx.setTransform(1,0,0,1,0,0);
  if(DUSK>0&&NIGHT<1){ctx.globalCompositeOperation='multiply';ctx.fillStyle=hexMix('#ffffff','#ffc7a0',DUSK*(1-NIGHT));ctx.fillRect(0,0,CW,CH)}
  if(NIGHT>0){ctx.globalCompositeOperation='multiply';ctx.fillStyle=hexMix('#ffffff','#3a3f86',NIGHT);ctx.fillRect(0,0,CW,CH)}
  ctx.globalCompositeOperation='lighter';setCam();EMIS.forEach(f=>f());
  ctx.globalCompositeOperation='source-over';setCam();
}
function npcLabel(n){const inf=npcInfo(n),p=iso(n.x,n.y),near=Math.hypot(n.x-P.x,n.y-P.y)<5,y0=p.y-58*(inf.scale||1);
  const pr=inf.person;
  if(pr&&pr.qOffer){ctx.fillStyle='#ffc857';ctx.beginPath();ctx.arc(p.x,y0-12+Math.sin(TIME*4)*2,7,0,Math.PI*2);ctx.fill();txt('!',p.x,y0-6+Math.sin(TIME*4)*2,'#3a2400',11,900)}
  if(pr&&(pr.rel!=='none'||near)){const love=['partner','spouse'].includes(pr.rel)||pr.rom>=40;txt(pr.rel==='none'?'?':pr.first,p.x,y0,love?'#ffb3cf':pr.rel==='none'?'#e3e0f0':'#c9fbf5',10)}
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
  let [wl,pos,k,o]=dc;const ax=wl==='b'?'y':'x',X=0,Y=0;o=o||{};
  // b siena: plakne y=0, pārvietojas pa x ; l siena: plakne x=0, pārvietojas pa y
  const face=(fn)=>{ctx.save();const oo=iso(0,0);if(wl==='b')ctx.transform(HW,HH,0,-1,oo.x,oo.y);else ctx.transform(-HW,HH,0,-1,oo.x,oo.y);fn();ctx.restore()};
  const u=pos,tx=(t,v,col,size)=>{const oo=iso(0,0),px=oo.x+(wl==='b'?u*HW:-u*HW),py=oo.y+u*HH-v;ctx.save();ctx.transform(1,wl==='b'?.5:-.5,0,1,px,py);ctx.font=`800 ${size}px Sora, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(t,0,0);ctx.restore()};
  if(k==='window')face(()=>{ctx.fillStyle='#ffffff';ctx.fillRect(u-.55,34,1.1,46);ctx.fillStyle=windowSky();ctx.fillRect(u-.5,37,1,40);if(NIGHT>.5){ctx.fillStyle='#fff';for(let i=0;i<4;i++)ctx.fillRect(u-.4+hash(i,u*10)*.8,45+hash(u,i)*28,.03,1)}ctx.fillStyle='#ffffff';ctx.fillRect(u-.02,37,.04,40);ctx.fillRect(u-.5,56,1,1.5);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(u-.45,40,.2,34)});
  if(k==='painting')face(()=>{const sz=o.big?1:.7,col=['#ff6f61','#2fb7b0','#ffc857','#9b5bd6','#3f7fd8'];ctx.fillStyle='#8a5a36';ctx.fillRect(u-sz/2-.05,44,sz+.1,32+(o.big?10:0));ctx.fillStyle='#f6efe2';ctx.fillRect(u-sz/2,47,sz,26+(o.big?10:0));for(let i=0;i<3;i++){ctx.fillStyle=col[(Math.floor(u*7)+i)%5];ctx.fillRect(u-sz/2+.05+i*sz/3.3,50+i*5,sz/3,12)}});
  if(k==='poster'||k==='board'){face(()=>{ctx.fillStyle=k==='board'?'#2d2a3a':(m.b&&m.b.acc||'#ff6f61');ctx.fillRect(u-.8,50,1.6,26)});tx(o.t||'',63,'#ffffff',9)}
  if(k==='neon'){face(()=>{ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(u-.9,48,1.8,30)});tx(o.t,63,o.c||'#ff4fa3',14);EMIS.push(()=>{ctx.save();ctx.shadowColor=o.c;ctx.shadowBlur=16;tx(o.t,63,o.c||'#ff4fa3',14);ctx.restore()})}
  if(k==='screen'||k==='bigscreen'){const ww=k==='bigscreen'?2.4:1.4;face(()=>{ctx.fillStyle='#111';ctx.fillRect(u-ww/2-.05,32,ww+.1,58);const g=ctx.createLinearGradient(0,34,0,88);g.addColorStop(0,`hsl(${(TIME*40)%360} 70% 60%)`);g.addColorStop(1,`hsl(${(TIME*40+120)%360} 70% 45%)`);ctx.fillStyle=g;ctx.fillRect(u-ww/2,35,ww,52)});EMIS.push(()=>face(()=>{ctx.fillStyle='rgba(160,200,255,.25)';ctx.fillRect(u-ww/2,35,ww,52)}))}
  if(k==='mirrorw')face(()=>{ctx.fillStyle='#d9dde3';ctx.fillRect(u-.55,30,1.1,56);const g=ctx.createLinearGradient(0,30,0,86);g.addColorStop(0,'#eef4f8');g.addColorStop(1,'#b7c4cf');ctx.fillStyle=g;ctx.fillRect(u-.5,33,1,50)});
  if(k==='bottles')face(()=>{ctx.fillStyle='#5a3a26';ctx.fillRect(u-1.2,40,2.4,3);ctx.fillRect(u-1.2,60,2.4,3);for(let i=0;i<14;i++){ctx.fillStyle=['#46b06b','#c0643a','#ffd36b','#9bd3f0','#e04f5f'][i%5];ctx.fillRect(u-1.15+i*.17,43,.08,12);ctx.fillRect(u-1.1+i*.17,63,.08,10)}});
  if(k==='blackboard'){face(()=>{ctx.fillStyle='#8a5a36';ctx.fillRect(u-1.55,40,3.1,42);ctx.fillStyle='#2f5a43';ctx.fillRect(u-1.5,42,3,38)});tx('E = mc²',66,'#e9f3ea',10);tx('Ostmalas universitāte',52,'#cfe3d3',6)}
  if(k==='emblem'){face(()=>{ctx.fillStyle='#e8a93a';ctx.fillRect(u-.5,44,1,36)});tx('DZINTARIJA',62,'#fff',7)}
  if(k==='housepic')face(()=>{ctx.fillStyle='#ffffff';ctx.fillRect(u-.45,48,.9,26);ctx.fillStyle='#bfe3dc';ctx.fillRect(u-.4,50,.8,14);ctx.fillStyle='#d9744a';ctx.fillRect(u-.25,60,.5,8)});
}
function drawFurn(f){
  const {x,y,w,d}=f,c=f.c,p=iso(x+w/2,y+d/2);let h=20;
  switch(f.k){
    case 'counter':h=22;isoBox(x,y,w,d,h,c||'#c79a6b',0,[shade(c||'#efe3cf',1.05),c||'#c79a6b',shade(c||'#c79a6b',.8)]);if(f.staff)isoBox(x+w/2-.15,y+.2,.3,.3,8,'#2d2a3a',h);if(f.act==='cafe')isoBox(x+.2,y+.2,.35,.35,14,'#9aa3ad',h);break;
    case 'bar':h=24;isoBox(x,y,w,d,h,c||'#5a3a26');for(let i=0;i<w*d*2;i++){const q=iso(x+.3+(i%Math.max(1,w*2))*.45,y+.4+Math.floor(i/Math.max(1,w*2))*.45);rrect(q.x-1.5,q.y-h-9,3,9,1,['#46b06b','#ffd36b','#9bd3f0','#e04f5f'][i%4])}break;
    case 'table':isoBox(x+.45,y+.45,.1,.1,14,'#555');ell(p.x,p.y-15,16,8,'#f4ece0');ell(p.x,p.y-16,16,8,'#fffaf0');isoBox(x-.05,y+.35,.3,.3,10,'#8a5a36');isoBox(x+.75,y+.35,.3,.3,10,'#8a5a36');h=16;break;
    case 'table4':isoBox(x+.15,y+.15,.7,.7,14,'#f4ece0',0,['#fffaf0','#d9cbb3','#c2b49c']);[[-.15,.35],[.85,.35],[.35,-.15],[.35,.85]].forEach(([a,b])=>isoBox(x+a,y+b,.3,.3,9,'#8a5a36'));ell(p.x,p.y-15,4,2,'#e04f5f');h=16;break;
    case 'plant':isoBox(x+.3,y+.3,.4,.4,10,'#c8693e');if(f.palm){ctx.strokeStyle='#3f9a45';ctx.lineWidth=3;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(p.x,p.y-12);ctx.quadraticCurveTo(p.x+Math.cos(i)*14,p.y-40,p.x+Math.cos(i)*22,p.y-28);ctx.stroke()}}else{ell(p.x-5,p.y-20,8,8,'#3f9a45');ell(p.x+5,p.y-22,8,8,'#4fb04f');ell(p.x,p.y-30,8,8,'#62c25a')}h=34;break;
    case 'sofa':{const col=c||(f.lux?'#5a3a26':'#5b7bd8');isoBox(x,y,w,.2,22,shade(col,.92),0);isoBox(x,y,.15,d,14,shade(col,.85));isoBox(x,y+.15,w,d-.15,9,col,0);isoBox(x+w-.15,y,.15,d,14,shade(col,.85));h=22;break}
    case 'bed':{isoBox(x,y,w,.12,26,'#7a4b2a');isoBox(x,y,w,d,9,'#8a5a36');isoBox(x+.05,y+.05,w-.1,d-.1,5,'#ffffff',9);isoBox(x+.05,y+.6,w-.1,d-.65,2,f.lux===2?'#d8b45a':f.lux?'#9b5bd6':'#3f7fd8',14);isoBox(x+.15,y+.1,.6,.35,4,'#f4f4f4',14);if(w>1.5)isoBox(x+1.05,y+.1,.6,.35,4,'#f4f4f4',14);h=26;break}
    case 'tvstand':isoBox(x+.1,y+.2,.8,.5,10,'#2d2a3a');isoBox(x+.1,y+.35,.8,.08,24,'#111',10);{const sc=iso(x+.1,y+.43);withFace('y',x+.1,y+.43,10,()=>{ctx.fillStyle=`hsl(${(TIME*30)%360} 60% 55%)`;ctx.fillRect(.04,2,.72,20)});EMIS.push(()=>withFace('y',x+.1,y+.43,10,()=>{ctx.fillStyle='rgba(150,190,255,.3)';ctx.fillRect(.04,2,.72,20)}))}h=34;break;
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
    case 'kitchen':isoBox(x,y,w,d,22,'#f4f1ea',0,['#d9d4ca','#e9e4da','#cfc9be']);ell(p.x,p.y-24,6,3,'#333');ell(p.x+4,p.y-20,6,3,'#333');h=22;break;
    case 'oven':isoBox(x,y,w,d,30,'#b5533c');withFace('y',x,y+d,0,()=>{ctx.fillStyle='#ffb238';ctx.fillRect(.25,6,.5,10)});EMIS.push(()=>withFace('y',x,y+d,0,()=>{ctx.fillStyle='rgba(255,170,60,.6)';ctx.fillRect(.2,4,.6,14)}));h=30;break;
    case 'pool':isoBox(x,y,w,d,16,'#5a3a26');isoBox(x+.08,y+.08,w-.16,d-.16,1,'#2e8b57',16);ell(p.x-6,p.y-18,2.5,1.5,'#fff');ell(p.x+4,p.y-19,2.5,1.5,'#ff3b3b');h=18;break;
    case 'swim':{const a=iso(x,y),b=iso(x+w,y),cc=iso(x+w,y+d),dd=iso(x,y+d);poly([[a.x,a.y],[b.x,b.y],[cc.x,cc.y],[dd.x,dd.y]],'#e9f6f8');const g=ctx.createLinearGradient(a.x,a.y,cc.x,cc.y);g.addColorStop(0,'#62d6ea');g.addColorStop(1,'#2aa7d4');const i0=iso(x+.15,y+.15),i1=iso(x+w-.15,y+.15),i2=iso(x+w-.15,y+d-.15),i3=iso(x+.15,y+d-.15);poly([[i0.x,i0.y],[i1.x,i1.y],[i2.x,i2.y],[i3.x,i3.y]],g);h=2;break}
    case 'stage':isoBox(x,y,w,d,6,'#3a2a4a');ctx.fillStyle='#ccc';ctx.fillRect(p.x-1,p.y-34,2,28);ell(p.x,p.y-35,3,3,'#333');h=8;break;
    case 'dance':{const cols=['#ff4fa3','#2fe0d0','#ffd36b','#9b5bd6'];for(let yy=0;yy<d;yy++)for(let xx=0;xx<w;xx++){const ci=(Math.floor(TIME*3)+xx*3+yy*5)%4;withTile(x+xx,y+yy,()=>{ctx.fillStyle=f.soft?'#d7b98d':cols[ci];ctx.fillRect(.04,.04,.92,.92)});if(!f.soft)EMIS.push(()=>withTile(x+xx,y+yy,()=>{ctx.fillStyle=cols[ci]+'55';ctx.fillRect(.04,.04,.92,.92)}))}h=1;break}
    case 'dj':isoBox(x,y,w,d,22,'#1a1626');ell(p.x-10,p.y-23,6,3,'#444');ell(p.x+10,p.y-23,6,3,'#444');for(let i=0;i<5;i++){const col=['#ff4fa3','#2fe0d0','#ffd36b'][i%3];const q=iso(x+.2+i*.35,y+d);ell(q.x,q.y-10,2,2,Math.floor(TIME*4+i)%2?col:'#333')}h=22;break;
    case 'speaker':isoBox(x+.15,y+.15,.7,.6,40,'#151320');ell(p.x-3,p.y-14,5,5,'#2c2840');ell(p.x-3,p.y-30,3.5,3.5,'#2c2840');h=40;break;
    case 'rack':{ctx.fillStyle=f.gold?'#d8b45a':'#9aa3ad';const a=iso(x+.1,y+.5),b=iso(x+w-.1,y+d-.5+(d>1?0:0));ctx.fillRect(a.x-1,a.y-36,2,36);ctx.fillRect(b.x-1,b.y-36,2,36);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y-36);ctx.lineTo(b.x,b.y-36);ctx.stroke();
      const n=Math.round((w+d)*3);for(let i=0;i<n;i++){const t=(i+.5)/n,qx=a.x+(b.x-a.x)*t,qy=a.y+(b.y-a.y)*t;rrect(qx-3,qy-35,6,18,2,COLORS[(i*3+x)%COLORS.length])}h=38;break}
    case 'mirror':isoBox(x+.3,y+.4,.4,.15,44,'#d8b45a');withFace('y',x+.32,y+.55,0,()=>{const g=ctx.createLinearGradient(0,4,0,42);g.addColorStop(0,'#eef4f8');g.addColorStop(1,'#a9b8c4');ctx.fillStyle=g;ctx.fillRect(0,4,.36,38)});h=44;break;
    case 'pedestal':isoBox(x+.25,y+.25,.5,.5,20,'#f4f4f4');ell(p.x,p.y-30,7,9,'#c9a227');ell(p.x+3,p.y-38,4,4,'#e2c35a');h=40;break;
    case 'salonchair':isoBox(x+.25,y+.3,.5,.5,10,'#2b2f3a');isoBox(x+.25,y+.25,.5,.12,26,'#2b2f3a');ctx.fillStyle='#aaa';ctx.fillRect(p.x-1,p.y-4,2,4);h=26;break;
    case 'flowerstand':isoBox(x+.15,y+.15,.7,.7,14,'#8a5a36');for(let i=0;i<8;i++){const q=iso(x+.3+(i%3)*.2,y+.3+Math.floor(i/3)*.2);ell(q.x,q.y-20,4,4,['#ff4fa3','#ffd36b','#ffffff','#ff6f61','#9b5bd6'][i%5]);ctx.fillStyle='#3f9a45';ctx.fillRect(q.x-.5,q.y-17,1,4)}h=26;break;
    case 'shelf':isoBox(x,y,w,d,32,'#e6e1d8');for(let r=0;r<3;r++)withFace(d>w?'x':'y',d>w?x+w:x,d>w?y:y+d,0,()=>{for(let i=0;i<(d>w?d:w)*5;i++){ctx.fillStyle=f.tech?['#222','#3f7fd8','#888'][i%3]:COLORS[(i+r*2)%COLORS.length];ctx.fillRect(.06+i*.2,5+r*9,.14,6)}});h=32;break;
    case 'tvwall':isoBox(x,y,w,d,36,'#d9dde3');withFace('y',x,y+d,0,()=>{for(let i=0;i<w*2;i++){ctx.fillStyle='#111';ctx.fillRect(.08+i*.5,10,.42,20);ctx.fillStyle=`hsl(${(TIME*40+i*60)%360} 60% 55%)`;ctx.fillRect(.1+i*.5,12,.38,16)}});h=36;break;
    case 'cardisp':isoBox(x,y,w,d,4,'#d9dde3');drawCar({x:x+w/2,y:y+d/2+.0,ax:'x',dir:1,col:c||'#ff6f61'});h=24;break;
    case 'teller':isoBox(x,y,w,d,24,'#c9b48f');isoBox(x,y+.4,w,.06,22,'#bfe3f5',24,['rgba(200,235,255,.6)','rgba(170,215,245,.5)','rgba(150,200,240,.5)']);h=46;break;
    case 'atmI':isoBox(x+.2,y+.2,.6,.5,36,'#3f6fb5');withFace('y',x+.2,y+.7,0,()=>{ctx.fillStyle='#bfe3ff';ctx.fillRect(.1,22,.4,9)});h=36;break;
    case 'cooler':isoBox(x+.3,y+.3,.4,.4,24,'#e6ebef');ell(p.x,p.y-30,6,7,'rgba(120,200,255,.7)');h=36;break;
    case 'podium':isoBox(x+.15,y+.25,w-.3,.5,28,'#7a4b2a');isoBox(x+.1,y+.2,w-.2,.6,3,'#5a3a26',28);h=32;break;
    case 'lecdesk':isoBox(x,y,w,d,14,'#c08a58');for(let i=0;i<w*2;i++)isoBox(x+.15+i*.5,y+d,.25,.25,8,'#555');h=14;break;
    case 'bookshelf':isoBox(x,y,w,d,46,'#7a4b2a');withFace(d>w?'x':'y',d>w?x+w:x,d>w?y:y+d,0,()=>{const L_=d>w?d:w;for(let r=0;r<4;r++)for(let i=0;i<L_*7;i++){ctx.fillStyle=['#c0392b','#2e86de','#27ae60','#f39c12','#8e44ad','#e8e1d3'][(i*7+r*3)%6];ctx.fillRect(.04+i*.14,4+r*10.5,.1,8)}});h=46;break;
    case 'seats':for(let i=0;i<w;i++){isoBox(x+i+.1,y+.2,.8,.6,8,c||'#9e2a2b');isoBox(x+i+.1,y+.15,.8,.15,18,shade(c||'#9e2a2b',.85))}h=18;break;
    case 'flagpole':ctx.fillStyle='#777';ctx.fillRect(p.x-1,p.y-70,2,70);{const wv=Math.sin(TIME*3)*2;poly([[p.x+1,p.y-70],[p.x+24,p.y-68+wv],[p.x+24,p.y-56+wv],[p.x+1,p.y-58]],'#e8a93a');poly([[p.x+1,p.y-65],[p.x+24,p.y-63+wv],[p.x+24,p.y-61+wv],[p.x+1,p.y-63]],'#fff')}h=70;break;
    case 'camera':ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-8,p.y);ctx.lineTo(p.x,p.y-26);ctx.lineTo(p.x+8,p.y);ctx.stroke();isoBox(x+.35,y+.35,.3,.3,10,'#222',26);if(Math.floor(TIME*2)%2)ell(p.x+4,p.y-32,2,2,'#ff3b3b');h=36;break;
    case 'backdrop':isoBox(x,y,w,.15,60,'#f7eef4');{const a=iso(x,y+.15),b=iso(x+w,y+.15),cc=iso(x+w,y+d),dd=iso(x,y+d);poly([[a.x,a.y],[b.x,b.y],[cc.x,cc.y],[dd.x,dd.y]],'#fbf3f8')}h=60;break;
    case 'lightstand':ctx.fillStyle='#333';ctx.fillRect(p.x-1,p.y-44,2,44);rrect(p.x-9,p.y-58,18,14,3,'#f4f4f4');EMIS.push(()=>ell(p.x,p.y-51,14,10,'rgba(255,255,240,.35)'));h=58;break;
    case 'hbed':isoBox(x+.1,y,.8,d,12,'#cfd6dc');isoBox(x+.15,y+.05,.7,d-.1,4,'#ffffff',12);isoBox(x+.15,y+.05,.7,.35,4,'#bfe3f5',16);h=20;break;
    case 'treadmill':isoBox(x+.15,y+.1,.7,d-.2,6,'#2b2f3a');isoBox(x+.15,y+.1,.7,.1,28,'#555');h=28;break;
    case 'weights':isoBox(x+.2,y+.3,w-.4,.4,10,'#2b2f3a');ctx.fillStyle='#aaa';{const a=iso(x+.2,y+.5),b=iso(x+w-.2,y+.5);ctx.strokeStyle='#bbb';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y-24);ctx.lineTo(b.x,b.y-24);ctx.stroke();ell(a.x,a.y-24,4,7,'#333');ell(b.x,b.y-24,4,7,'#333')}h=28;break;
    case 'mat':withTile(x,y,()=>{ctx.save();ctx.scale(w,d);ctx.fillStyle='#9b5bd6';ctx.fillRect(.1,.15,.35,.7);ctx.fillStyle='#2fb7b0';ctx.fillRect(.55,.15,.35,.7);ctx.restore()});h=1;break;
    case 'slot':isoBox(x+.15,y+.2,.7,.6,40,'#c9a227');withFace('y',x+.15,y+.8,0,()=>{ctx.fillStyle='#111';ctx.fillRect(.1,20,.5,12);ctx.fillStyle=['#ff3b3b','#ffd36b','#2fe0d0'][Math.floor(TIME*6)%3];ctx.fillRect(.14,22,.12,8);ctx.fillRect(.3,22,.12,8);ctx.fillRect(.46,22,.1,8)});EMIS.push(()=>ell(p.x-4,p.y-30,14,10,'rgba(255,210,100,.25)'));h=40;break;
    case 'roulette':isoBox(x,y,w,d,16,'#1f6b3a',0,['#2e8b57','#5a3a26','#4a2e1e']);ell(p.x,p.y-18,12,6,'#5a3a26');ctx.save();ctx.translate(p.x,p.y-18);ctx.scale(1,.5);ctx.rotate(TIME*3);for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#c0392b':'#111';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,10,i*Math.PI/4,(i+1)*Math.PI/4);ctx.fill()}ctx.restore();h=18;break;
    case 'boatmodel':isoBox(x+.25,y+.25,.5,.5,16,'#f4f4f4');poly([[p.x-10,p.y-22],[p.x+10,p.y-22],[p.x+6,p.y-17],[p.x-6,p.y-17]],'#2b6cb0');poly([[p.x,p.y-40],[p.x,p.y-22],[p.x+9,p.y-22]],'#fff');h=40;break;
    case 'crates':for(let i=0;i<w;i++)for(let j=0;j<d;j++){isoBox(x+i+.05,y+j+.05,.9,.9,20,'#b3874f');if((i+j)%2===0)isoBox(x+i+.15,y+j+.15,.7,.7,16,'#c49a5e',20)}h=36;break;
    case 'mailbox':isoBox(x,y,w,.4,40,'#9aa3ad');withFace('y',x,y+.4,0,()=>{for(let i=0;i<w*4;i++)for(let r=0;r<3;r++){ctx.fillStyle='#c4cad1';ctx.fillRect(.05+i*.25,8+r*10,.2,8)}});h=40;break;
    case 'elevator':isoBox(x,y,w,.3,60,'#c4cad1');withFace('y',x,y+.3,0,()=>{ctx.fillStyle='#9aa3ad';ctx.fillRect(.1,0,.39,52);ctx.fillRect(.51,0,.39,52);ctx.fillStyle='#ffd36b';ctx.fillRect(.45,54,.1,3)});h=60;break;
    case 'bench':isoBox(x+.05,y+.3,w-.1,.4,10,'#a8693e');h=12;break;
    case 'fountainS':ell(p.x,p.y,34,17,'#d8d0bf');ell(p.x,p.y-4,30,15,'#57c3e6');ctx.fillStyle='rgba(225,245,255,.85)';ctx.fillRect(p.x-1.5,p.y-30-Math.sin(TIME*6)*2,3,26);h=10;break;
    default:isoBox(x,y,w,d,16,'#999');
  }
  f._h=h;
}
function renderRoom(m,dt){
  HITS=[];EMIS=[];
  ctx.setTransform(1,0,0,1,0,0);const bg=ctx.createLinearGradient(0,0,0,CH);bg.addColorStop(0,'#1b1830');bg.addColorStop(1,'#0e0c1c');ctx.fillStyle=bg;ctx.fillRect(0,0,CW,CH);
  setCam();
  for(let y=0;y<m.H;y++)for(let x=0;x<m.W;x++)floorPaint(m,x,y);
  // grīdas mala
  const fl=iso(0,m.H),fr=iso(m.W,m.H),frr=iso(m.W,0);poly([[fl.x,fl.y],[fr.x,fr.y],[fr.x,fr.y+10],[fl.x,fl.y+10]],'#2a2638');poly([[fr.x,fr.y],[frr.x,frr.y],[frr.x,frr.y+10],[fr.x,fr.y+10]],'#221f30');
  // sienas
  const o=iso(0,0),bR=iso(m.W,0),bL=iso(0,m.H);
  poly([[o.x,o.y],[bR.x,bR.y],[bR.x,bR.y-WH],[o.x,o.y-WH]],m.dark?shade(m.wall,1.1):shade(m.wall,.96));
  poly([[o.x,o.y],[bL.x,bL.y],[bL.x,bL.y-WH],[o.x,o.y-WH]],m.dark?shade(m.wall,.85):shade(m.wall,.84));
  poly([[o.x,o.y-WH],[bR.x,bR.y-WH],[bR.x,bR.y-WH-6],[o.x,o.y-WH-6]],shade(m.wall,.7));poly([[o.x,o.y-WH],[bL.x,bL.y-WH],[bL.x,bL.y-WH-6],[o.x,o.y-WH-6]],shade(m.wall,.6));
  poly([[o.x,o.y],[bR.x,bR.y],[bR.x,bR.y-6],[o.x,o.y-6]],'rgba(0,0,0,.18)');poly([[o.x,o.y],[bL.x,bL.y],[bL.x,bL.y-6],[o.x,o.y-6]],'rgba(0,0,0,.22)');
  m.wdeco.forEach(dc=>drawWallDeco(m,dc));
  // izeja
  const ex=m.exit;withTile(ex[0],ex[1],()=>{ctx.fillStyle='#c0643a';ctx.fillRect(.1,.2,.8,.7);ctx.fillStyle='#e8a06a';ctx.fillRect(.18,.3,.64,.5)});
  const ep=iso(ex[0]+.5,ex[1]+.5);txt('IZEJA',ep.x,ep.y+22,'#ffd9b0',10);HITS.push({k:'exit',rect:[ep.x-26,ep.y-14,52,40]});
  const objs=[];
  m.furn.forEach(f=>{if(['rug','dance','mat','swim'].includes(f.k)){drawFurn(f);if(f.act)HITS.push({k:'furn',ref:f,poly:boxHull(f.x,f.y,f.w,f.d,4)})}else objs.push({k:'f',o:f,x:f.x,y:f.y,w:f.w,d:f.d})});
  (m.staffP||[]).forEach(s=>objs.push({k:'staff',o:s,x:s.x,y:s.y}));
  NPCS.forEach(n=>objs.push({k:'n',o:n,x:n.x,y:n.y}));
  objs.push({k:'p',x:P.x,y:P.y});
  sortObjs(objs);
  for(const ob of objs)drawObjEntry(ob);
  // apgaismojums
  ctx.setTransform(1,0,0,1,0,0);
  if(m.dark){ctx.globalCompositeOperation='multiply';ctx.fillStyle='#a49ad0';ctx.fillRect(0,0,CW,CH)}
  ctx.globalCompositeOperation='lighter';setCam();EMIS.forEach(f=>f());
  if(m.dark&&(m.b.type==='club'||m.b.type==='vip')){for(let i=0;i<4;i++){const a=TIME*.8+i*1.6,src=iso(m.W/2,0),dst=iso(m.W/2+Math.cos(a)*3,m.H/2+Math.sin(a)*2);ctx.fillStyle=['rgba(255,79,163,.18)','rgba(47,224,208,.18)','rgba(255,211,107,.16)','rgba(155,91,214,.18)'][i];ctx.beginPath();ctx.moveTo(src.x-4,src.y-WH);ctx.lineTo(src.x+4,src.y-WH);ctx.lineTo(dst.x+40,dst.y);ctx.lineTo(dst.x-40,dst.y);ctx.closePath();ctx.fill()}}
  ctx.globalCompositeOperation='source-over';setCam();
  NPCS.forEach(n=>npcLabel(n));
  if(TARGET.t>0){TARGET.t-=dt}
}
