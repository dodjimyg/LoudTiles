/* =========================================================================
   LOUDTILES — world.js
   Shared environment builder (the hazy California motel street) used by both
   the film (index.html) and the scripted scene (scene.html).
   Requires hero.js (window.MATID, Geo primitives) loaded first.
   ========================================================================= */
(function(){
'use strict';
function buildWorld(g){
  const M=window.MATID;
  const {AS,CAMO,GEAR,NEON,CONC,LEAF,BURN,TRUNK}=M;
  const {box,boxT,limb}=g; const tri=g.tri;
  function m3v(R,v){return[R[0]*v[0]+R[1]*v[1]+R[2]*v[2],R[3]*v[0]+R[4]*v[1]+R[5]*v[2],R[6]*v[0]+R[7]*v[1]+R[8]*v[2]];}
  // ground
  const S=60;
  tri([-S,0,-S],[S,0,-S],[S,0,S],[0,1,0],AS);
  tri([-S,0,-S],[S,0,S],[-S,0,S],[0,1,0],AS);
  // buildings / wall
  box(7,2.6,-12, 10,5.2,7, CONC);
  box(-10,2.2,-9, 6,4.4,9, CONC);
  box(1,1.1,-16, 34,2.2,0.5, CONC);
  box(1,2.4,-16.2, 34,0.3,0.5, CONC);
  // motel sign
  limb([-5,0,-9.5],[-5,6.2,-9.5],0.13,GEAR);
  box(-5,6.6,-9.5, 2.8,1.7,0.3, NEON);
  box(-5,6.6,-9.4, 2.4,1.3,0.1, GEAR);
  box(-5,5.2,-9.5, 2.2,0.55,0.25, NEON);
  for(let i=0;i<4;i++)box(-3.4+Math.sin(i)*0.15, 4.6+i*0.5, -9.5, 0.12,0.5,0.12, NEON);
  // palms
  function palm(x,z,h,lean){
    const top=[x+lean,h,z]; limb([x,0,z],top,0.13,TRUNK);
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;
      const end=[top[0]+Math.cos(a)*1.7, h-0.4-Math.abs(Math.sin(a*1.3))*0.6, top[2]+Math.sin(a)*1.7];
      limb(top,end,0.09,LEAF);}
  }
  palm(-8,-13,7.5,0.3); palm(9,-14,8.2,-0.4); palm(-2,-15,6.8,0.2);
  palm(13,-11,7.9,-0.3); palm(-13,-12,7.2,0.4); palm(4,-15.5,8.5,0.1);
  // power poles + wire
  function pole(x,z){ limb([x,0,z],[x,6.5,z],0.1,TRUNK); box(x,6.0,z,1.6,0.15,0.15,TRUNK); }
  pole(11,-4); pole(-12,-2);
  box(-0.5,6.0,-3, 23,0.05,0.05, GEAR);
  // burning car (wrecked)
  (function car(){
    const R=[Math.cos(0.35),0,Math.sin(0.35), 0,1,0, -Math.sin(0.35),0,Math.cos(0.35)];
    const cx=-4.2,cz=-4.5;
    boxT([cx,0.45,cz],[2.1,0.6,4.4],BURN,R);
    boxT([cx-0.1,1.0,cz],[1.85,0.55,2.1],BURN,R);
    for(const[dx,dz]of[[0.9,1.5],[-0.9,1.5],[0.9,-1.5],[-0.9,-1.5]]){
      const w=m3v(R,[dx,-0.05,dz]); box(cx+w[0],0.28,cz+w[2],0.5,0.5,0.35,GEAR);
    }
  })();
  // rubble (deterministic)
  let seed=1;
  const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let i=0;i<14;i++){const a=i*2.4;
    box(Math.sin(a)*6-1, 0.08, -2-Math.cos(a*1.7)*6, 0.3+rnd()*0.4,0.16,0.3+rnd()*0.4, rnd()<0.5?BURN:CONC);}
}
window.buildWorld=buildWorld;
window.CARFRONT=[-4.6,0.4,-3.0];
})();
