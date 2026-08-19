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
// Pose: deep tactical crouch, forearms up, fists at cheeks (signature look).
function buildHero(g,O){
  O=O||[0,0,0]; const M=MATID;
  const {box,boxT,limb,sphere,blob}=g;
  const T=(x,y,z)=>[O[0]+x,O[1]+y,O[2]+z];

  // ---- LEGS (deep crouch) ----
  for(const s of[-1,1]){
    const ankle=T(s*0.20,0.17,0.20), knee=T(s*0.27,0.55,0.46), hip=T(s*0.17,0.60,-0.02);
    box(O[0]+s*0.21,O[1]+0.08,O[2]+0.30, 0.21,0.15,0.46, M.GEAR);   // boot upper
    box(O[0]+s*0.21,O[1]+0.03,O[2]+0.32, 0.23,0.06,0.52, M.SOLE);   // sole
    box(O[0]+s*0.20,O[1]+0.27,O[2]+0.16, 0.19,0.24,0.22, M.GEAR);   // ankle shaft (laces)
    limb(ankle,knee,0.13,M.CAMO);   // shin
    limb(knee,hip,0.16,M.CAMO);     // thigh
    sphere(knee[0],knee[1],knee[2],0.145,M.GEAR,5,7); // knee pad
    box(O[0]+s*0.35,O[1]+0.45,O[2]+0.30, 0.10,0.20,0.17, M.CAMO);   // cargo pocket
  }
  // ---- PELVIS / BELT ----
  box(O[0],O[1]+0.60,O[2]-0.01, 0.50,0.26,0.36, M.CAMO);
  box(O[0],O[1]+0.71,O[2]+0.02, 0.52,0.10,0.38, M.GEAR);            // belt
  box(O[0]-0.24,O[1]+0.66,O[2]+0.16, 0.12,0.18,0.10, M.GEAR);       // side pouch
  box(O[0]+0.24,O[1]+0.60,O[2]+0.18, 0.11,0.22,0.11, M.GEAR);       // holster
  // ---- TORSO ----
  const pelT=T(0,0.72,0.0), chest=T(0,1.14,0.07);
  limb(pelT,chest,0.25,M.CAMO);                                     // tee
  boxT(T(0,1.00,0.22),[0.44,0.52,0.14],M.GEAR,rotX(-0.12));         // plate carrier front
  for(let i=0;i<3;i++) box(O[0]-0.14+i*0.14,O[1]+0.92,O[2]+0.31, 0.11,0.15,0.09, M.GEAR); // mag pouches
  box(O[0],O[1]+0.82,O[2]+0.06, 0.50,0.18,0.36, M.GEAR);           // cummerbund
  limb(T(-0.15,1.20,0.16),T(-0.15,0.82,0.20),0.05,M.GEAR);         // strap L
  limb(T( 0.15,1.20,0.16),T( 0.15,0.82,0.20),0.05,M.GEAR);         // strap R
  box(O[0]+0.25,O[1]+1.03,O[2]+0.15, 0.12,0.08,0.03, M.PATCH);     // BABY INVASION patch
  // ---- BACKPACK + ANTENNA ----
  box(O[0],O[1]+1.02,O[2]-0.21, 0.42,0.54,0.20, M.GEAR);
  limb(T(0.17,1.28,-0.24),T(0.21,2.00,-0.26),0.02,M.METAL);        // radio antenna
  sphere(O[0]+0.21,O[1]+2.00,O[2]-0.26,0.032,M.METAL,4,5);
  // ---- ARMS (fists at cheeks) ----
  for(const s of[-1,1]){
    const sh=T(s*0.30,1.14,0.04), mid=T(s*0.34,0.98,0.15), el=T(s*0.33,0.80,0.24), hand=T(s*0.165,1.37,0.22);
    sphere(sh[0],sh[1],sh[2],0.135,M.CAMO,5,7);   // deltoid (sleeve)
    limb(sh,mid,0.10,M.CAMO);                      // upper arm sleeve
    limb(mid,el,0.088,M.SKIN);                     // lower upper arm (skin)
    sphere(el[0],el[1],el[2],0.092,M.SKIN,4,6);    // elbow
    limb(el,hand,0.078,M.SKIN);                    // forearm (tattoo)
    sphere(hand[0],hand[1],hand[2],0.098,M.SKIN,5,7);           // fist
    box(hand[0],hand[1]+0.05,hand[2]+0.02,0.10,0.07,0.11,M.SKIN); // knuckles
  }
  // ---- NECK / SHEMAGH ----
  const headBase=T(0,1.34,0.08), head=T(0,1.49,0.10);
  limb(T(0,1.20,0.07),headBase,0.09,M.SKIN);
  blob(O[0],O[1]+1.20,O[2]+0.11, 0.20,0.14,0.20, M.SCARF,5,8);     // scarf around neck
  box(O[0],O[1]+1.03,O[2]+0.22, 0.26,0.22,0.06, M.SCARF);          // hanging front
  // ---- HEAD ----
  sphere(head[0],head[1],head[2],0.17,M.SKIN,7,10);
  box(O[0],O[1]+1.41,O[2]+0.12, 0.22,0.15,0.22, M.SKIN);          // jaw
  box(O[0],O[1]+1.47,O[2]+0.27, 0.06,0.08,0.07, M.SKIN);          // nose
  box(O[0],O[1]+1.42,O[2]+0.25, 0.10,0.05,0.05, M.SKIN);          // moustache/lip shade area
  // ---- SUNGLASSES (white frame, dark lens, temples) ----
  box(O[0],O[1]+1.535,O[2]+0.265, 0.37,0.05,0.05, M.GLASS);        // top bar
  box(O[0],O[1]+1.475,O[2]+0.260, 0.37,0.022,0.05, M.GLASS);       // bottom bar
  for(const s of[-1,1]){
    box(O[0]+s*0.095,O[1]+1.505,O[2]+0.288, 0.155,0.085,0.02, M.LENS); // lens
    limb(T(s*0.175,1.52,0.26),T(s*0.19,1.52,0.03),0.013,M.GLASS);      // temple arm
  }
  box(O[0],O[1]+1.515,O[2]+0.30, 0.05,0.05,0.02, M.GLASS);         // bridge
  // ---- AFRO (big rounded cluster) ----
  const hc=[O[0],O[1]+1.57,O[2]+0.04];
  const puffs=[
    [0,0.21,0],[0.23,0.15,0.02],[-0.23,0.15,0.02],[0.16,0.09,-0.19],[-0.16,0.09,-0.19],
    [0.28,0.01,-0.05],[-0.28,0.01,-0.05],[0.13,0.25,-0.06],[-0.13,0.25,-0.06],[0,0.13,-0.24],
    [0.21,0.21,-0.13],[-0.21,0.21,-0.13],[0.25,-0.11,0.02],[-0.25,-0.11,0.02],[0,0.28,0.05],
    [0.11,0.0,0.19],[-0.11,0.0,0.19],[0.05,0.30,-0.14],[-0.05,0.30,-0.14]];
  for(let i=0;i<puffs.length;i++){const p=puffs[i];
    blob(hc[0]+p[0],hc[1]+p[1],hc[2]+p[2], 0.17,0.16,0.17, M.HAIR,5,7);}
}

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
})();
