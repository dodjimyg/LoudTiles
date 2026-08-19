/* =========================================================================
   LOUDTILES — hero.js
   Constructeur de géométrie du personnage principal + primitives partagées
   + GLSL des matériaux (source unique pour le film et le visualiseur).
   Le personnage est une silhouette STYLISÉE low-poly (boîtes + sphères),
   pas la reproduction photographique d'une personne réelle.
   ========================================================================= */
(function(){
'use strict';
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const len=a=>Math.hypot(a[0],a[1],a[2]);
const norm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l];};
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
function m3v(R,v){return R?[R[0]*v[0]+R[1]*v[1]+R[2]*v[2],R[3]*v[0]+R[4]*v[1]+R[5]*v[2],R[6]*v[0]+R[7]*v[1]+R[8]*v[2]]:v;}
function rotX(a){const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,c,-s,0,s,c];}
function rotY(a){const c=Math.cos(a),s=Math.sin(a);return[c,0,s,0,1,0,-s,0,c];}
function rotZ(a){const c=Math.cos(a),s=Math.sin(a);return[c,-s,0,s,c,0,0,0,1];}

// A geometry accumulator with primitive builders that push into flat arrays.
function Geo(){
  const pos=[],nrm=[],mat=[];
  function tri(a,b,c,n,m){pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
    for(let i=0;i<3;i++){nrm.push(n[0],n[1],n[2]);mat.push(m);}}
  function boxT(c,s,m,R){
    const hx=s[0]/2,hy=s[1]/2,hz=s[2]/2;
    const F=[
      [[1,0,0],[[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz],[hx,-hy,hz]]],
      [[-1,0,0],[[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz],[-hx,-hy,-hz]]],
      [[0,1,0],[[-hx,hy,-hz],[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz]]],
      [[0,-1,0],[[-hx,-hy,hz],[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz]]],
      [[0,0,1],[[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]]],
      [[0,0,-1],[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]]],
    ];
    for(const[n0,q0]of F){const n=norm(m3v(R,n0));const q=q0.map(v=>add(c,m3v(R,v)));
      tri(q[0],q[1],q[2],n,m);tri(q[0],q[2],q[3],n,m);}
  }
  function box(cx,cy,cz,sx,sy,sz,m){boxT([cx,cy,cz],[sx,sy,sz],m,null);}
  function limb(p0,p1,r,m){
    const d=sub(p1,p0),L=len(d),zc=norm(d);
    let up=Math.abs(zc[1])>0.9?[1,0,0]:[0,1,0];
    const xc=norm(cross(up,zc)),yc=cross(zc,xc);
    const R=[xc[0],yc[0],zc[0],xc[1],yc[1],zc[1],xc[2],yc[2],zc[2]];
    boxT([(p0[0]+p1[0])/2,(p0[1]+p1[1])/2,(p0[2]+p1[2])/2],[r*2,r*2,L],m,R);
  }
  function sphere(cx,cy,cz,r,m,LA,LO){LA=LA||6;LO=LO||9;
    for(let i=0;i<LA;i++)for(let j=0;j<LO;j++){
      const t0=i/LA*Math.PI,t1=(i+1)/LA*Math.PI,p0=j/LO*2*Math.PI,p1=(j+1)/LO*2*Math.PI;
      const P=(t,p)=>[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)];
      const a=P(t0,p0),b=P(t1,p0),c=P(t1,p1),d=P(t0,p1),V=v=>[cx+v[0]*r,cy+v[1]*r,cz+v[2]*r];
      tri(V(a),V(b),V(c),a,m);tri(V(a),V(c),V(d),a,m);
    }
  }
  // squashed sphere (ellipsoid) for hair puffs / muscle mass
  function blob(cx,cy,cz,rx,ry,rz,m,LA,LO){LA=LA||5;LO=LO||7;
    for(let i=0;i<LA;i++)for(let j=0;j<LO;j++){
      const t0=i/LA*Math.PI,t1=(i+1)/LA*Math.PI,p0=j/LO*2*Math.PI,p1=(j+1)/LO*2*Math.PI;
      const P=(t,p)=>[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)];
      const N=v=>norm([v[0]/rx,v[1]/ry,v[2]/rz]);
      const V=v=>[cx+v[0]*rx,cy+v[1]*ry,cz+v[2]*rz];
      const a=P(t0,p0),b=P(t1,p0),c=P(t1,p1),d=P(t0,p1);
      tri(V(a),V(b),V(c),N(a),m);tri(V(a),V(c),V(d),N(a),m);
    }
  }
  return {pos,nrm,mat,tri,box,boxT,limb,sphere,blob};
}

// material ids (shared with the shaders below)
const MATID={AS:0,SKIN:1,CAMO:2,GEAR:3,HAIR:4,GLASS:5,NEON:6,CONC:7,LEAF:8,BURN:9,
             SCARF:10,TRUNK:11,SOLE:12,LENS:13,METAL:14,PATCH:15};

// ------------------------------------------------------------------ HERO ----
// Joint-driven, pose-able character. A pose = named joint positions + a few
// body/head orientation vectors. assemble() turns joints into the full model.
function frameR(fwd,up){const f=norm(fwd);let u=norm(up);const r=norm(cross(u,f));u=cross(f,r);
  return{R:[r[0],u[0],f[0],r[1],u[1],f[1],r[2],u[2],f[2]],r,u,f};}
function onF(base,fr,o){return[base[0]+fr.r[0]*o[0]+fr.u[0]*o[1]+fr.f[0]*o[2],
  base[1]+fr.r[1]*o[0]+fr.u[1]*o[1]+fr.f[1]*o[2],
  base[2]+fr.r[2]*o[0]+fr.u[2]*o[1]+fr.f[2]*o[2]];}
const V=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const S=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const midp=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];

function assemble(g,J,P){
  const M=MATID; const {box,boxT,limb,sphere,blob}=g;
  const bF=frameR(P.bodyFwd,P.bodyUp), hF=frameR(P.headFwd,P.headUp);
  const footFwd=P.footFwd;
  // legs + arms
  for(const s of['L','R']){
    const foot=J['foot'+s],knee=J['knee'+s],hip=J['hip'+s],
          sh=J['shoulder'+s],el=J['elbow'+s],hand=J['hand'+s];
    const toe=V(foot,S(footFwd,0.30));
    limb(V(foot,[0,0.02,0]),V(toe,[0,-0.03,0]),0.115,M.GEAR);   // boot
    limb(V(foot,[0,-0.03,0]),V(toe,[0,-0.06,0]),0.12,M.SOLE);   // sole
    limb(foot,knee,0.13,M.CAMO);                                // shin
    limb(knee,hip,0.16,M.CAMO);                                 // thigh
    sphere(knee[0],knee[1],knee[2],0.145,M.GEAR,5,7);           // knee pad
    const am=midp(sh,el);
    sphere(sh[0],sh[1],sh[2],0.135,M.CAMO,5,7);                 // deltoid
    limb(sh,am,0.10,M.CAMO);                                    // sleeve
    limb(am,el,0.088,M.SKIN);                                   // lower upper arm
    sphere(el[0],el[1],el[2],0.09,M.SKIN,4,6);                  // elbow
    limb(el,hand,0.078,M.SKIN);                                 // forearm
    sphere(hand[0],hand[1],hand[2],0.098,M.SKIN,5,7);           // fist
  }
  // pelvis / torso
  const pel=J.pelvis,chest=J.chest,mid=midp(pel,chest);
  boxT(pel,[0.5,0.26,0.36],M.CAMO,bF.R);
  boxT(onF(pel,bF,[0,0.10,0.02]),[0.52,0.10,0.38],M.GEAR,bF.R);     // belt
  limb(pel,chest,0.25,M.CAMO);                                      // tee
  boxT(onF(mid,bF,[0,0.08,0.20]),[0.44,0.52,0.14],M.GEAR,bF.R);     // plate carrier
  for(let i=-1;i<=1;i++){const pp=onF(mid,bF,[i*0.14,-0.02,0.30]);box(pp[0],pp[1],pp[2],0.11,0.15,0.09,M.GEAR);}
  boxT(onF(mid,bF,[0,-0.18,0.06]),[0.50,0.18,0.36],M.GEAR,bF.R);    // cummerbund
  limb(onF(chest,bF,[-0.15,0.02,0.12]),onF(mid,bF,[-0.15,-0.15,0.16]),0.05,M.GEAR);
  limb(onF(chest,bF,[ 0.15,0.02,0.12]),onF(mid,bF,[ 0.15,-0.15,0.16]),0.05,M.GEAR);
  const patch=onF(chest,bF,[0.24,-0.10,0.15]);box(patch[0],patch[1],patch[2],0.12,0.08,0.03,M.PATCH);
  // backpack + antenna
  const bp=onF(chest,bF,[0,-0.05,-0.22]);boxT(bp,[0.42,0.54,0.20],M.GEAR,bF.R);
  const a0=onF(bp,bF,[0.17,0.10,-0.02]),a1=V(a0,S(bF.u,0.72));
  limb(a0,a1,0.02,M.METAL);sphere(a1[0],a1[1],a1[2],0.032,M.METAL,4,5);
  // neck / shemagh / head
  const neck=J.neck,head=J.head;
  limb(neck,head,0.09,M.SKIN);
  const sc=onF(neck,hF,[0,-0.02,0.03]);blob(sc[0],sc[1],sc[2],0.20,0.14,0.20,M.SCARF,5,8);
  const scf=onF(neck,hF,[0,-0.16,0.14]);boxT(scf,[0.26,0.22,0.06],M.SCARF,hF.R);
  sphere(head[0],head[1],head[2],0.17,M.SKIN,7,10);
  boxT(onF(head,hF,[0,-0.09,0.11]),[0.22,0.15,0.22],M.SKIN,hF.R);   // jaw
  boxT(onF(head,hF,[0,-0.03,0.18]),[0.06,0.08,0.07],M.SKIN,hF.R);   // nose
  // eyewear: white shades (Koffi) or dark goggles (soldier)
  const eyeMat=(P.eyes==='dark')?M.LENS:M.GLASS;
  boxT(onF(head,hF,[0,0.045,0.175]),[0.37,0.05,0.05],eyeMat,hF.R);
  boxT(onF(head,hF,[0,-0.005,0.170]),[0.37,0.022,0.05],eyeMat,hF.R);
  for(const s of[-1,1]){
    boxT(onF(head,hF,[s*0.095,0.015,0.195]),[0.155,0.085,0.02],M.LENS,hF.R);
    limb(onF(head,hF,[s*0.175,0.03,0.16]),onF(head,hF,[s*0.19,0.03,-0.06]),0.013,eyeMat);
  }
  boxT(onF(head,hF,[0,0.02,0.205]),[0.05,0.05,0.02],eyeMat,hF.R);
  if(P.headgear==='helmet'){
    // combat helmet dome + brim + chin strap
    blob(onF(head,hF,[0,0.08,-0.02])[0],onF(head,hF,[0,0.08,-0.02])[1],onF(head,hF,[0,0.08,-0.02])[2],0.20,0.17,0.21,M.GEAR,6,8);
    boxT(onF(head,hF,[0,0.14,0.10]),[0.36,0.06,0.10],M.GEAR,hF.R);   // brim
    limb(onF(head,hF,[-0.15,-0.06,0.10]),onF(head,hF,[0.15,-0.06,0.10]),0.02,M.GEAR); // strap
  } else {
    const puffs=[
      [0,0.21,-0.02],[0.23,0.15,0.0],[-0.23,0.15,0.0],[0.16,0.09,-0.21],[-0.16,0.09,-0.21],
      [0.28,0.01,-0.07],[-0.28,0.01,-0.07],[0.13,0.25,-0.08],[-0.13,0.25,-0.08],[0,0.13,-0.26],
      [0.21,0.21,-0.15],[-0.21,0.21,-0.15],[0.25,-0.11,0.0],[-0.25,-0.11,0.0],[0,0.28,0.03],
      [0.11,0.0,0.17],[-0.11,0.0,0.17],[0.05,0.30,-0.16],[-0.05,0.30,-0.16]];
    for(const p of puffs){const c=onF(head,hF,p);blob(c[0],c[1],c[2],0.17,0.16,0.17,M.HAIR,5,7);}
  }
  // weapon
  if(P.gun){
    const f=frameR(P.gunFwd||[0,0,1],[0,1,0]).f, hR=J.handR, hL=J.handL, gR=frameR(f,[0,1,0]).R;
    if(P.gun==='pistol'){
      limb(V(hR,S(f,-0.02)),V(hR,S(f,0.22)),0.026,M.METAL);         // slide/barrel
      boxT(V(hR,S(f,0.02)),[0.05,0.09,0.14],M.GEAR,gR);             // frame
      limb(V(hR,S(f,-0.01)),V(hR,[0,-0.14,0]),0.03,M.GEAR);         // grip
    } else {
      limb(V(hR,S(f,-0.10)),V(hR,S(f,0.55)),0.028,M.METAL);         // barrel/handguard
      limb(hL,V(hL,S(f,-0.32)),0.05,M.GEAR);                        // stock
      limb(V(hR,S(f,0.02)),V(hR,[0,-0.16,0]),0.04,M.GEAR);          // magazine
      boxT(V(hR,S(f,-0.02)),[0.06,0.12,0.30],M.GEAR,gR);            // receiver
    }
  }
}

// ---- pose library (joint positions, before world offset O) ----
const POSES={
  crouch_fists:{ centerY:1.0, footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0,-0.2,1], headUp:[0,1,0.2],
    J:{footL:[-0.20,0.17,0.20],footR:[0.20,0.17,0.20],kneeL:[-0.27,0.55,0.46],kneeR:[0.27,0.55,0.46],
       hipL:[-0.17,0.60,-0.02],hipR:[0.17,0.60,-0.02],pelvis:[0,0.60,0],chest:[0,1.14,0.07],neck:[0,1.24,0.07],head:[0,1.49,0.10],
       shoulderL:[-0.30,1.14,0.04],shoulderR:[0.30,1.14,0.04],elbowL:[-0.33,0.80,0.24],elbowR:[0.33,0.80,0.24],
       handL:[-0.165,1.37,0.22],handR:[0.165,1.37,0.22]}},
  crouch_rest:{ centerY:0.95, footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0.15,-0.15,1], headUp:[0,1,0.15],
    J:{footL:[-0.20,0.17,0.20],footR:[0.24,0.17,0.24],kneeL:[-0.27,0.55,0.44],kneeR:[0.30,0.58,0.48],
       hipL:[-0.17,0.60,-0.02],hipR:[0.17,0.60,-0.02],pelvis:[0,0.60,0],chest:[0,1.14,0.06],neck:[0,1.24,0.06],head:[0.02,1.48,0.10],
       shoulderL:[-0.30,1.14,0.04],shoulderR:[0.30,1.14,0.04],elbowL:[-0.33,0.82,0.08],elbowR:[0.30,0.80,0.30],
       handL:[-0.30,0.50,0.14],handR:[0.03,0.66,0.44]}},
  sit_fists:{ centerY:0.82, footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0,-0.25,1], headUp:[0,1,0.25],
    J:{footL:[-0.30,0.10,0.55],footR:[0.30,0.10,0.55],kneeL:[-0.32,0.46,0.32],kneeR:[0.32,0.46,0.32],
       hipL:[-0.16,0.32,0.06],hipR:[0.16,0.32,0.06],pelvis:[0,0.32,0.04],chest:[0,0.95,0.06],neck:[0,1.05,0.06],head:[0,1.29,0.09],
       shoulderL:[-0.30,0.95,0.05],shoulderR:[0.30,0.95,0.05],elbowL:[-0.31,0.66,0.20],elbowR:[0.31,0.66,0.20],
       handL:[-0.14,1.16,0.15],handR:[0.14,1.16,0.15]}},
  grip_scarf:{ centerY:1.45, footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0,-0.1,1], headUp:[0,1,0.1],
    J:{footL:[-0.18,0.17,0.02],footR:[0.18,0.17,0.02],kneeL:[-0.17,0.62,0.06],kneeR:[0.17,0.62,0.06],
       hipL:[-0.16,1.02,0],hipR:[0.16,1.02,0],pelvis:[0,1.00,0],chest:[0,1.55,0.03],neck:[0,1.66,0.03],head:[0,1.90,0.05],
       shoulderL:[-0.32,1.55,0.03],shoulderR:[0.32,1.55,0.03],elbowL:[-0.34,1.28,0.14],elbowR:[0.34,1.28,0.14],
       handL:[-0.11,1.54,0.18],handR:[0.11,1.54,0.18]}},
  stand_profile:{ centerY:1.45, yaw:-0.7, footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0,-0.05,1], headUp:[0,1,0],
    J:{footL:[-0.16,0.17,-0.08],footR:[0.16,0.17,0.10],kneeL:[-0.15,0.62,-0.04],kneeR:[0.16,0.62,0.10],
       hipL:[-0.15,1.02,0],hipR:[0.15,1.02,0],pelvis:[0,1.00,0],chest:[0,1.55,0.03],neck:[0,1.66,0.03],head:[0,1.90,0.06],
       shoulderL:[-0.32,1.55,0.03],shoulderR:[0.32,1.55,0.03],elbowL:[-0.35,1.22,0.06],elbowR:[0.33,1.20,0.10],
       handL:[-0.33,0.92,0.10],handR:[0.30,0.90,0.16]}},
  prone_aim:{ centerY:0.5, footFwd:[0,0,-1], bodyFwd:[0,-0.15,1], bodyUp:[0,1,0.15], headFwd:[0,0.05,1], headUp:[0,1,0], gun:'rifle', gunFwd:[0,0,1],
    J:{footL:[-0.17,0.12,-1.65],footR:[0.17,0.12,-1.65],kneeL:[-0.18,0.18,-1.05],kneeR:[0.18,0.18,-1.05],
       hipL:[-0.16,0.26,-0.55],hipR:[0.16,0.26,-0.55],pelvis:[0,0.27,-0.55],chest:[0,0.34,0.12],neck:[0,0.38,0.28],head:[0,0.46,0.48],
       shoulderL:[-0.28,0.38,0.16],shoulderR:[0.28,0.38,0.16],elbowL:[-0.28,0.16,0.48],elbowR:[0.26,0.16,0.52],
       handL:[-0.06,0.22,0.74],handR:[0.06,0.22,0.80]}},
  // ---- extra Koffi poses for the scripted scene ----
  aim_pistol:{ centerY:1.45, footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0,-0.05,1], headUp:[0,1,0], gun:'pistol', gunFwd:[0,0,1],
    J:{footL:[-0.18,0.17,-0.05],footR:[0.16,0.17,0.10],kneeL:[-0.17,0.62,-0.02],kneeR:[0.16,0.62,0.10],
       hipL:[-0.16,1.02,0],hipR:[0.16,1.02,0],pelvis:[0,1.00,0],chest:[0,1.55,0.04],neck:[0,1.66,0.04],head:[0,1.90,0.06],
       shoulderL:[-0.32,1.55,0.03],shoulderR:[0.32,1.55,0.03],elbowL:[-0.20,1.48,0.30],elbowR:[0.30,1.52,0.34],
       handL:[0.02,1.50,0.52],handR:[0.12,1.52,0.60]}},
  stand:{ centerY:1.45, footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0,-0.03,1], headUp:[0,1,0],
    J:{footL:[-0.18,0.17,0.0],footR:[0.18,0.17,0.0],kneeL:[-0.17,0.62,0.04],kneeR:[0.17,0.62,0.04],
       hipL:[-0.16,1.02,0],hipR:[0.16,1.02,0],pelvis:[0,1.00,0],chest:[0,1.55,0.03],neck:[0,1.66,0.03],head:[0,1.90,0.05],
       shoulderL:[-0.32,1.55,0.03],shoulderR:[0.32,1.55,0.03],elbowL:[-0.34,1.24,0.06],elbowR:[0.34,1.24,0.06],
       handL:[-0.34,0.94,0.10],handR:[0.34,0.94,0.10]}},
  kneel_reach:{ centerY:1.0, footFwd:[0,0,1], bodyFwd:[0,-0.1,1], bodyUp:[0,1,0.1], headFwd:[0,-0.15,1], headUp:[0,1,0.15],
    J:{footL:[-0.18,0.17,0.35],footR:[0.20,0.10,-0.30],kneeL:[-0.18,0.60,0.34],kneeR:[0.20,0.16,-0.05],
       hipL:[-0.16,0.66,-0.02],hipR:[0.16,0.60,-0.08],pelvis:[0,0.64,-0.05],chest:[0,1.14,0.04],neck:[0,1.24,0.05],head:[0,1.46,0.10],
       shoulderL:[-0.30,1.14,0.05],shoulderR:[0.30,1.14,0.06],elbowL:[-0.30,0.90,0.18],elbowR:[0.28,0.95,0.34],
       handL:[-0.22,0.66,0.20],handR:[0.10,0.80,0.62]}},
  walk:{ centerY:1.45, footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0,-0.02,1], headUp:[0,1,0],
    J:{footL:[-0.16,0.20,0.30],footR:[0.16,0.14,-0.32],kneeL:[-0.16,0.64,0.18],kneeR:[0.16,0.56,-0.16],
       hipL:[-0.15,1.0,0.04],hipR:[0.15,1.0,-0.04],pelvis:[0,1.0,0],chest:[0,1.55,0.02],neck:[0,1.66,0.02],head:[0,1.90,0.04],
       shoulderL:[-0.32,1.55,0.02],shoulderR:[0.32,1.55,0.02],elbowL:[-0.33,1.3,-0.06],elbowR:[0.33,1.3,0.14],
       handL:[-0.30,1.06,-0.14],handR:[0.30,1.06,0.20]}},
};
const POSE_LIST=['crouch_fists','crouch_rest','sit_fists','grip_scarf','stand_profile','prone_aim'];

// enemy soldiers: helmet + goggles + rifle
const SOLDIER_POSES={
  aim:{ centerY:1.45, headgear:'helmet', eyes:'dark', footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0,-0.05,1], headUp:[0,1,0], gun:'rifle', gunFwd:[0,0,1],
    J:{footL:[-0.18,0.17,0.0],footR:[0.18,0.17,0.05],kneeL:[-0.17,0.62,0.04],kneeR:[0.17,0.62,0.05],
       hipL:[-0.16,1.02,0],hipR:[0.16,1.02,0],pelvis:[0,1.00,0],chest:[0,1.52,0.03],neck:[0,1.63,0.03],head:[0,1.86,0.05],
       shoulderL:[-0.32,1.52,0.03],shoulderR:[0.32,1.52,0.03],elbowL:[-0.22,1.40,0.28],elbowR:[0.30,1.34,0.16],
       handL:[-0.04,1.44,0.46],handR:[0.10,1.40,0.30]}},
  advance:{ centerY:1.45, headgear:'helmet', eyes:'dark', footFwd:[0,0,1], bodyFwd:[0,0,1], bodyUp:[0,1,0], headFwd:[0,-0.05,1], headUp:[0,1,0], gun:'rifle', gunFwd:[0,0,1],
    J:{footL:[-0.16,0.20,0.28],footR:[0.16,0.14,-0.28],kneeL:[-0.16,0.64,0.16],kneeR:[0.16,0.56,-0.14],
       hipL:[-0.15,1.0,0.02],hipR:[0.15,1.0,-0.02],pelvis:[0,1.0,0],chest:[0,1.52,0.03],neck:[0,1.63,0.03],head:[0,1.86,0.05],
       shoulderL:[-0.32,1.52,0.03],shoulderR:[0.32,1.52,0.03],elbowL:[-0.24,1.36,0.22],elbowR:[0.30,1.30,0.12],
       handL:[-0.06,1.34,0.40],handR:[0.10,1.30,0.26]}},
};

function buildFrom(g,O,src){
  O=O||[0,0,0];
  const J={}; const yaw=src.yaw||0, cy=Math.cos(yaw), sy=Math.sin(yaw);
  for(const k in src.J){const p=src.J[k];
    const x=p[0]*cy+p[2]*sy, z=-p[0]*sy+p[2]*cy;      // yaw about vertical
    J[k]=[O[0]+x,O[1]+p[1],O[2]+z];}
  const rot=v=>[v[0]*cy+v[2]*sy,v[1],-v[0]*sy+v[2]*cy];
  const P={bodyFwd:rot(src.bodyFwd),bodyUp:rot(src.bodyUp),headFwd:rot(src.headFwd),headUp:rot(src.headUp),
    footFwd:rot(src.footFwd),gun:src.gun,gunFwd:src.gunFwd?rot(src.gunFwd):[0,0,1],
    headgear:src.headgear||'afro',eyes:src.eyes||'white'};
  assemble(g,J,P);
  return {centerY:src.centerY};
}
function buildHero(g,O,poseName){return buildFrom(g,O,POSES[poseName]||POSES.crouch_fists);}
function buildSoldier(g,O,poseName){return buildFrom(g,O,SOLDIER_POSES[poseName]||SOLDIER_POSES.aim);}

// ------------------------------------------------------- shared material GLSL
// noise + procedural materials. Requires uniforms: uSky (vec3), uTime (float).
const MAT_GLSL = `
float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec3 camoCol(vec3 p){float a=noise3(p*3.5),b=noise3(p*8.0+5.0);
 vec3 c=mix(vec3(0.20,0.22,0.13),vec3(0.40,0.36,0.24),step(0.45,a));
 return mix(c,vec3(0.09,0.10,0.07),step(0.62,b));}
vec3 skinCol(vec3 p){vec3 s=vec3(0.70,0.50,0.39);
 float t=noise3(p*11.0),m=smoothstep(0.55,0.62,noise3(p*5.0))*smoothstep(0.55,0.48,t);
 return mix(s,vec3(0.10,0.10,0.13),m*0.85);}
void material(float m,vec3 p,out vec3 alb,out vec3 emi){
 emi=vec3(0.0);
 if(m<0.5){float pud=smoothstep(0.5,0.78,noise3(p*0.7));alb=mix(vec3(0.055,0.055,0.062),vec3(0.02,0.02,0.028),pud);emi=uSky*pud*0.30;}
 else if(m<1.5){alb=skinCol(p);}
 else if(m<2.5){alb=camoCol(p);}
 else if(m<3.5){alb=vec3(0.035,0.035,0.04);}
 else if(m<4.5){alb=vec3(0.03,0.026,0.022);}
 else if(m<5.5){alb=vec3(0.9,0.93,1.0);emi=vec3(0.35,0.4,0.5);}
 else if(m<6.5){float f=0.7+0.3*sin(uTime*8.0+p.y*3.0);alb=vec3(0.5,0.05,0.04);emi=vec3(1.7,0.13,0.06)*f;}
 else if(m<7.5){alb=vec3(0.42,0.42,0.44);}
 else if(m<8.5){alb=vec3(0.05,0.075,0.045);}
 else if(m<9.5){float e=smoothstep(0.55,0.9,noise3(p*4.0+uTime*0.6));alb=vec3(0.03,0.028,0.026);emi=vec3(1.5,0.4,0.05)*e*0.7;}
 else if(m<10.5){alb=mix(vec3(0.5,0.45,0.32),vec3(0.1,0.09,0.08),step(0.5,noise3(p*22.0)));}
 else if(m<11.5){alb=vec3(0.28,0.23,0.17);}
 else if(m<12.5){alb=vec3(0.02,0.02,0.02);}                       // boot sole
 else if(m<13.5){alb=vec3(0.015,0.02,0.03);emi=vec3(0.06,0.07,0.10);} // sunglasses lens
 else if(m<14.5){alb=vec3(0.06,0.06,0.07);}                       // metal
 else{alb=vec3(0.34,0.31,0.20);}                                  // patch
}`;

window.Geo=Geo; window.MATID=MATID; window.buildHero=buildHero; window.MAT_GLSL=MAT_GLSL;
window.POSES=POSES; window.POSE_LIST=POSE_LIST;
window.buildSoldier=buildSoldier; window.SOLDIER_POSES=SOLDIER_POSES;
})();
