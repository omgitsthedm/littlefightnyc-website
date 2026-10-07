var Ki={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},$i={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},fc=0,Xa=1,pc=2;var qa=1,mc=2,wi=3,Pi=0,Ht=1,Wt=2,Li=0,an=1,Ya=2,Za=3,Ja=4,_c=5,Xi=100,gc=101,yc=102,xc=103,vc=104,wc=200,Mc=201,bc=202,Sc=203,Ps=204,Is=205,Tc=206,Ec=207,Ac=208,Cc=209,Rc=210,Pc=211,Ic=212,Dc=213,Lc=214,oo=0,ao=1,lo=2,ln=3,co=4,ho=5,uo=6,fo=7,Ka=0,Uc=1,Nc=2,Ui=0,Fc=1,kc=2,Oc=3,Bc=4,zc=5,Vc=6,Gc=7;var $a=300,fn=301,pn=302,po=303,mo=304,jr=306,kn=1e3,Wi=1001,Ds=1002,Yt=1003,Hc=1004;var Qr=1005;var ti=1006,_o=1007;var ji=1008,ja=1008,_i=1009,Qa=1010,el=1011,$n=1012,go=1013,Qi=1014,Mi=1015,jn=1016,yo=1017,xo=1018,Qn=1020,tl=35902,il=35899,nl=1021,rl=1022,Jt=1023,On=1026,er=1027,sl=1028,vo=1029,ol=1030,wo=1031;var Mo=1033,es=33776,ts=33777,is=33778,ns=33779,bo=35840,So=35841,To=35842,Eo=35843,Ao=36196,Co=37492,Ro=37496,Po=37808,Io=37809,Do=37810,Lo=37811,Uo=37812,No=37813,Fo=37814,ko=37815,Oo=37816,Bo=37817,zo=37818,Vo=37819,Go=37820,Ho=37821,Wo=36492,Xo=36494,qo=36495,Yo=36283,Zo=36284,Jo=36285,Ko=36286;var gr=2300,Ls=2301,Rs=2302,Da=2400,La=2401,Ua=2402;var Wc=3200,Xc=3201;var al=0,qc=1,Ni="",Dt="srgb",cn="srgb-linear",yr="linear",at="srgb";var on=7680;var Na=519,Yc=512,Zc=513,Jc=514,ll=515,Kc=516,$c=517,jc=518,Qc=519,Fa=35044;var cl="300 es",fi=2e3,xr=2001;var yi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let r=i[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Nt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],kl=1234567,fr=Math.PI/180,Bn=180/Math.PI;function mn(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Nt[n&255]+Nt[n>>8&255]+Nt[n>>16&255]+Nt[n>>24&255]+"-"+Nt[e&255]+Nt[e>>8&255]+"-"+Nt[e>>16&15|64]+Nt[e>>24&255]+"-"+Nt[t&63|128]+Nt[t>>8&255]+"-"+Nt[t>>16&255]+Nt[t>>24&255]+Nt[i&255]+Nt[i>>8&255]+Nt[i>>16&255]+Nt[i>>24&255]).toLowerCase()}function We(n,e,t){return Math.max(e,Math.min(t,n))}function hl(n,e){return(n%e+e)%e}function Jh(n,e,t,i,r){return i+(n-e)*(r-i)/(t-e)}function Kh(n,e,t){return n!==e?(t-n)/(e-n):0}function pr(n,e,t){return(1-t)*n+t*e}function $h(n,e,t,i){return pr(n,e,1-Math.exp(-t*i))}function jh(n,e=1){return e-Math.abs(hl(n,e*2)-e)}function Qh(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function ed(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function td(n,e){return n+Math.floor(Math.random()*(e-n+1))}function id(n,e){return n+Math.random()*(e-n)}function nd(n){return n*(.5-Math.random())}function rd(n){n!==void 0&&(kl=n);let e=kl+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function sd(n){return n*fr}function od(n){return n*Bn}function ad(n){return(n&n-1)===0&&n!==0}function ld(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function cd(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function hd(n,e,t,i,r){let s=Math.cos,o=Math.sin,a=s(t/2),c=o(t/2),l=s((e+i)/2),d=o((e+i)/2),h=s((e-i)/2),p=o((e-i)/2),f=s((i-e)/2),g=o((i-e)/2);switch(r){case"XYX":n.set(a*d,c*h,c*p,a*l);break;case"YZY":n.set(c*p,a*d,c*h,a*l);break;case"ZXZ":n.set(c*h,c*p,a*d,a*l);break;case"XZX":n.set(a*d,c*g,c*f,a*l);break;case"YXY":n.set(c*f,a*d,c*g,a*l);break;case"ZYZ":n.set(c*g,c*f,a*d,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Nn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Vt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var ci={DEG2RAD:fr,RAD2DEG:Bn,generateUUID:mn,clamp:We,euclideanModulo:hl,mapLinear:Jh,inverseLerp:Kh,lerp:pr,damp:$h,pingpong:jh,smoothstep:Qh,smootherstep:ed,randInt:td,randFloat:id,randFloatSpread:nd,seededRandom:rd,degToRad:sd,radToDeg:od,isPowerOfTwo:ad,ceilPowerOfTwo:ld,floorPowerOfTwo:cd,setQuaternionFromProperEuler:hd,normalize:Vt,denormalize:Nn},me=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(We(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(We(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},li=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let c=i[r+0],l=i[r+1],d=i[r+2],h=i[r+3],p=s[o+0],f=s[o+1],g=s[o+2],w=s[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=d,e[t+3]=h;return}if(a===1){e[t+0]=p,e[t+1]=f,e[t+2]=g,e[t+3]=w;return}if(h!==w||c!==p||l!==f||d!==g){let m=1-a,u=c*p+l*f+d*g+h*w,R=u>=0?1:-1,T=1-u*u;if(T>Number.EPSILON){let F=Math.sqrt(T),E=Math.atan2(F,u*R);m=Math.sin(m*E)/F,a=Math.sin(a*E)/F}let M=a*R;if(c=c*m+p*M,l=l*m+f*M,d=d*m+g*M,h=h*m+w*M,m===1-a){let F=1/Math.sqrt(c*c+l*l+d*d+h*h);c*=F,l*=F,d*=F,h*=F}}e[t]=c,e[t+1]=l,e[t+2]=d,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,o){let a=i[r],c=i[r+1],l=i[r+2],d=i[r+3],h=s[o],p=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+d*h+c*f-l*p,e[t+1]=c*g+d*p+l*h-a*f,e[t+2]=l*g+d*f+a*p-c*h,e[t+3]=d*g-a*h-c*p-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(i/2),d=a(r/2),h=a(s/2),p=c(i/2),f=c(r/2),g=c(s/2);switch(o){case"XYZ":this._x=p*d*h+l*f*g,this._y=l*f*h-p*d*g,this._z=l*d*g+p*f*h,this._w=l*d*h-p*f*g;break;case"YXZ":this._x=p*d*h+l*f*g,this._y=l*f*h-p*d*g,this._z=l*d*g-p*f*h,this._w=l*d*h+p*f*g;break;case"ZXY":this._x=p*d*h-l*f*g,this._y=l*f*h+p*d*g,this._z=l*d*g+p*f*h,this._w=l*d*h-p*f*g;break;case"ZYX":this._x=p*d*h-l*f*g,this._y=l*f*h+p*d*g,this._z=l*d*g-p*f*h,this._w=l*d*h+p*f*g;break;case"YZX":this._x=p*d*h+l*f*g,this._y=l*f*h+p*d*g,this._z=l*d*g-p*f*h,this._w=l*d*h-p*f*g;break;case"XZY":this._x=p*d*h-l*f*g,this._y=l*f*h-p*d*g,this._z=l*d*g+p*f*h,this._w=l*d*h+p*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],c=t[9],l=t[2],d=t[6],h=t[10],p=i+a+h;if(p>0){let f=.5/Math.sqrt(p+1);this._w=.25/f,this._x=(d-c)*f,this._y=(s-l)*f,this._z=(o-r)*f}else if(i>a&&i>h){let f=2*Math.sqrt(1+i-a-h);this._w=(d-c)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+l)/f}else if(a>h){let f=2*Math.sqrt(1+a-i-h);this._w=(s-l)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(c+d)/f}else{let f=2*Math.sqrt(1+h-i-a);this._w=(o-r)/f,this._x=(s+l)/f,this._y=(c+d)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,c=t._y,l=t._z,d=t._w;return this._x=i*d+o*a+r*l-s*c,this._y=r*d+o*c+s*a-i*l,this._z=s*d+o*l+i*c-r*a,this._w=o*d-i*a-r*c-s*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;let c=1-a*a;if(c<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*i+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}let l=Math.sqrt(c),d=Math.atan2(l,a),h=Math.sin((1-t)*d)/l,p=Math.sin(t*d)/l;return this._w=o*h+this._w*p,this._x=i*h+this._x*p,this._y=r*h+this._y*p,this._z=s*h+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},N=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ol.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ol.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*r-a*i),d=2*(a*t-s*r),h=2*(s*i-o*t);return this.x=t+c*l+o*h-a*d,this.y=i+c*d+a*l-s*h,this.z=r+c*h+s*d-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(We(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,c=t.z;return this.x=r*c-s*a,this.y=s*o-i*c,this.z=i*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return oa.copy(this).projectOnVector(e),this.sub(oa)}reflect(e){return this.sub(oa.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(We(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},oa=new N,Ol=new li,He=class n{constructor(e,t,i,r,s,o,a,c,l){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,c,l)}set(e,t,i,r,s,o,a,c,l){let d=this.elements;return d[0]=e,d[1]=r,d[2]=a,d[3]=t,d[4]=s,d[5]=c,d[6]=i,d[7]=o,d[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],d=i[4],h=i[7],p=i[2],f=i[5],g=i[8],w=r[0],m=r[3],u=r[6],R=r[1],T=r[4],M=r[7],F=r[2],E=r[5],U=r[8];return s[0]=o*w+a*R+c*F,s[3]=o*m+a*T+c*E,s[6]=o*u+a*M+c*U,s[1]=l*w+d*R+h*F,s[4]=l*m+d*T+h*E,s[7]=l*u+d*M+h*U,s[2]=p*w+f*R+g*F,s[5]=p*m+f*T+g*E,s[8]=p*u+f*M+g*U,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],d=e[8];return t*o*d-t*a*l-i*s*d+i*a*c+r*s*l-r*o*c}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],d=e[8],h=d*o-a*l,p=a*c-d*s,f=l*s-o*c,g=t*h+i*p+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let w=1/g;return e[0]=h*w,e[1]=(r*l-d*i)*w,e[2]=(a*i-r*o)*w,e[3]=p*w,e[4]=(d*t-r*c)*w,e[5]=(r*s-a*t)*w,e[6]=f*w,e[7]=(i*c-l*t)*w,e[8]=(o*t-i*s)*w,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){let c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*o+l*a)+o+e,-r*l,r*c,-r*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(aa.makeScale(e,t)),this}rotate(e){return this.premultiply(aa.makeRotation(-e)),this}translate(e,t){return this.premultiply(aa.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},aa=new He;function dl(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function vr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function eh(){let n=vr("canvas");return n.style.display="block",n}var Bl={};function zn(n){n in Bl||(Bl[n]=!0,console.warn(n))}function th(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}var zl=new He().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Vl=new He().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function dd(){let n={enabled:!0,workingColorSpace:cn,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===at&&(r.r=Ri(r.r),r.g=Ri(r.g),r.b=Ri(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===at&&(r.r=Fn(r.r),r.g=Fn(r.g),r.b=Fn(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Ni?yr:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return zn("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return zn("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[cn]:{primaries:e,whitePoint:i,transfer:yr,toXYZ:zl,fromXYZ:Vl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Dt},outputColorSpaceConfig:{drawingBufferColorSpace:Dt}},[Dt]:{primaries:e,whitePoint:i,transfer:at,toXYZ:zl,fromXYZ:Vl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Dt}}}),n}var tt=dd();function Ri(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Fn(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var bn,Us=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{bn===void 0&&(bn=vr("canvas")),bn.width=e.width,bn.height=e.height;let r=bn.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=bn}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=vr("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Ri(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Ri(t[i]/255)*255):t[i]=Ri(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ud=0,Vn=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ud++}),this.uuid=mn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(la(r[o].image)):s.push(la(r[o]))}else s=la(r);i.url=s}return t||(e.images[this.uuid]=i),i}};function la(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Us.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var fd=0,ca=new N,Zt=class n extends yi{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Wi,r=Wi,s=ti,o=ji,a=Jt,c=_i,l=n.DEFAULT_ANISOTROPY,d=Ni){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:fd++}),this.uuid=mn(),this.name="",this.source=new Vn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new me(0,0),this.repeat=new me(1,1),this.center=new me(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new He,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(ca).x}get height(){return this.source.getSize(ca).y}get depth(){return this.source.getSize(ca).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==$a)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case kn:e.x=e.x-Math.floor(e.x);break;case Wi:e.x=e.x<0?0:1;break;case Ds:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case kn:e.y=e.y-Math.floor(e.y);break;case Wi:e.y=e.y<0?0:1;break;case Ds:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Zt.DEFAULT_IMAGE=null;Zt.DEFAULT_MAPPING=$a;Zt.DEFAULT_ANISOTROPY=1;var vt=class n{constructor(e=0,t=0,i=0,r=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s,c=e.elements,l=c[0],d=c[4],h=c[8],p=c[1],f=c[5],g=c[9],w=c[2],m=c[6],u=c[10];if(Math.abs(d-p)<.01&&Math.abs(h-w)<.01&&Math.abs(g-m)<.01){if(Math.abs(d+p)<.1&&Math.abs(h+w)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+u-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let T=(l+1)/2,M=(f+1)/2,F=(u+1)/2,E=(d+p)/4,U=(h+w)/4,I=(g+m)/4;return T>M&&T>F?T<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(T),r=E/i,s=U/i):M>F?M<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(M),i=E/r,s=I/r):F<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(F),i=U/s,r=I/s),this.set(i,r,s,t),this}let R=Math.sqrt((m-g)*(m-g)+(h-w)*(h-w)+(p-d)*(p-d));return Math.abs(R)<.001&&(R=1),this.x=(m-g)/R,this.y=(h-w)/R,this.z=(p-d)/R,this.w=Math.acos((l+f+u-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(We(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ns=class extends yi{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ti,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t);let r={width:e,height:t,depth:i.depth},s=new Zt(r);this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){let t={minFilter:ti,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new Vn(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},xi=class extends Ns{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},wr=class extends Zt{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Yt,this.minFilter=Yt,this.wrapR=Wi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Fs=class extends Zt{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Yt,this.minFilter=Yt,this.wrapR=Wi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ii=class{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(hi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(hi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=hi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,hi):hi.fromBufferAttribute(s,o),hi.applyMatrix4(e.matrixWorld),this.expandByPoint(hi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ss.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ss.copy(i.boundingBox)),ss.applyMatrix4(e.matrixWorld),this.union(ss)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,hi),hi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ar),os.subVectors(this.max,ar),Sn.subVectors(e.a,ar),Tn.subVectors(e.b,ar),En.subVectors(e.c,ar),ki.subVectors(Tn,Sn),Oi.subVectors(En,Tn),tn.subVectors(Sn,En);let t=[0,-ki.z,ki.y,0,-Oi.z,Oi.y,0,-tn.z,tn.y,ki.z,0,-ki.x,Oi.z,0,-Oi.x,tn.z,0,-tn.x,-ki.y,ki.x,0,-Oi.y,Oi.x,0,-tn.y,tn.x,0];return!ha(t,Sn,Tn,En,os)||(t=[1,0,0,0,1,0,0,0,1],!ha(t,Sn,Tn,En,os))?!1:(as.crossVectors(ki,Oi),t=[as.x,as.y,as.z],ha(t,Sn,Tn,En,os))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,hi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(hi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Si),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Si=[new N,new N,new N,new N,new N,new N,new N,new N],hi=new N,ss=new ii,Sn=new N,Tn=new N,En=new N,ki=new N,Oi=new N,tn=new N,ar=new N,os=new N,as=new N,nn=new N;function ha(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){nn.fromArray(n,s);let a=r.x*Math.abs(nn.x)+r.y*Math.abs(nn.y)+r.z*Math.abs(nn.z),c=e.dot(nn),l=t.dot(nn),d=i.dot(nn);if(Math.max(-Math.max(c,l,d),Math.min(c,l,d))>a)return!1}return!0}var pd=new ii,lr=new N,da=new N,hn=class{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):pd.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;lr.subVectors(e,this.center);let t=lr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(lr,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(da.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(lr.copy(e.center).add(da)),this.expandByPoint(lr.copy(e.center).sub(da))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Ti=new N,ua=new N,ls=new N,Bi=new N,fa=new N,cs=new N,pa=new N,qi=class{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ti)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ti.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ti.copy(this.origin).addScaledVector(this.direction,t),Ti.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){ua.copy(e).add(t).multiplyScalar(.5),ls.copy(t).sub(e).normalize(),Bi.copy(this.origin).sub(ua);let s=e.distanceTo(t)*.5,o=-this.direction.dot(ls),a=Bi.dot(this.direction),c=-Bi.dot(ls),l=Bi.lengthSq(),d=Math.abs(1-o*o),h,p,f,g;if(d>0)if(h=o*c-a,p=o*a-c,g=s*d,h>=0)if(p>=-g)if(p<=g){let w=1/d;h*=w,p*=w,f=h*(h+o*p+2*a)+p*(o*h+p+2*c)+l}else p=s,h=Math.max(0,-(o*p+a)),f=-h*h+p*(p+2*c)+l;else p=-s,h=Math.max(0,-(o*p+a)),f=-h*h+p*(p+2*c)+l;else p<=-g?(h=Math.max(0,-(-o*s+a)),p=h>0?-s:Math.min(Math.max(-s,-c),s),f=-h*h+p*(p+2*c)+l):p<=g?(h=0,p=Math.min(Math.max(-s,-c),s),f=p*(p+2*c)+l):(h=Math.max(0,-(o*s+a)),p=h>0?s:Math.min(Math.max(-s,-c),s),f=-h*h+p*(p+2*c)+l);else p=o>0?-s:s,h=Math.max(0,-(o*p+a)),f=-h*h+p*(p+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(ua).addScaledVector(ls,p),f}intersectSphere(e,t){Ti.subVectors(e.center,this.origin);let i=Ti.dot(this.direction),r=Ti.dot(Ti)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,c,l=1/this.direction.x,d=1/this.direction.y,h=1/this.direction.z,p=this.origin;return l>=0?(i=(e.min.x-p.x)*l,r=(e.max.x-p.x)*l):(i=(e.max.x-p.x)*l,r=(e.min.x-p.x)*l),d>=0?(s=(e.min.y-p.y)*d,o=(e.max.y-p.y)*d):(s=(e.max.y-p.y)*d,o=(e.min.y-p.y)*d),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-p.z)*h,c=(e.max.z-p.z)*h):(a=(e.max.z-p.z)*h,c=(e.min.z-p.z)*h),i>c||a>r)||((a>i||i!==i)&&(i=a),(c<r||r!==r)&&(r=c),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,Ti)!==null}intersectTriangle(e,t,i,r,s){fa.subVectors(t,e),cs.subVectors(i,e),pa.crossVectors(fa,cs);let o=this.direction.dot(pa),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Bi.subVectors(this.origin,e);let c=a*this.direction.dot(cs.crossVectors(Bi,cs));if(c<0)return null;let l=a*this.direction.dot(fa.cross(Bi));if(l<0||c+l>o)return null;let d=-a*Bi.dot(pa);return d<0?null:this.at(d/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},_t=class n{constructor(e,t,i,r,s,o,a,c,l,d,h,p,f,g,w,m){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,c,l,d,h,p,f,g,w,m)}set(e,t,i,r,s,o,a,c,l,d,h,p,f,g,w,m){let u=this.elements;return u[0]=e,u[4]=t,u[8]=i,u[12]=r,u[1]=s,u[5]=o,u[9]=a,u[13]=c,u[2]=l,u[6]=d,u[10]=h,u[14]=p,u[3]=f,u[7]=g,u[11]=w,u[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,r=1/An.setFromMatrixColumn(e,0).length(),s=1/An.setFromMatrixColumn(e,1).length(),o=1/An.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(r),l=Math.sin(r),d=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let p=o*d,f=o*h,g=a*d,w=a*h;t[0]=c*d,t[4]=-c*h,t[8]=l,t[1]=f+g*l,t[5]=p-w*l,t[9]=-a*c,t[2]=w-p*l,t[6]=g+f*l,t[10]=o*c}else if(e.order==="YXZ"){let p=c*d,f=c*h,g=l*d,w=l*h;t[0]=p+w*a,t[4]=g*a-f,t[8]=o*l,t[1]=o*h,t[5]=o*d,t[9]=-a,t[2]=f*a-g,t[6]=w+p*a,t[10]=o*c}else if(e.order==="ZXY"){let p=c*d,f=c*h,g=l*d,w=l*h;t[0]=p-w*a,t[4]=-o*h,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*d,t[9]=w-p*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let p=o*d,f=o*h,g=a*d,w=a*h;t[0]=c*d,t[4]=g*l-f,t[8]=p*l+w,t[1]=c*h,t[5]=w*l+p,t[9]=f*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let p=o*c,f=o*l,g=a*c,w=a*l;t[0]=c*d,t[4]=w-p*h,t[8]=g*h+f,t[1]=h,t[5]=o*d,t[9]=-a*d,t[2]=-l*d,t[6]=f*h+g,t[10]=p-w*h}else if(e.order==="XZY"){let p=o*c,f=o*l,g=a*c,w=a*l;t[0]=c*d,t[4]=-h,t[8]=l*d,t[1]=p*h+w,t[5]=o*d,t[9]=f*h-g,t[2]=g*h-f,t[6]=a*d,t[10]=w*h+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(md,e,_d)}lookAt(e,t,i){let r=this.elements;return Qt.subVectors(e,t),Qt.lengthSq()===0&&(Qt.z=1),Qt.normalize(),zi.crossVectors(i,Qt),zi.lengthSq()===0&&(Math.abs(i.z)===1?Qt.x+=1e-4:Qt.z+=1e-4,Qt.normalize(),zi.crossVectors(i,Qt)),zi.normalize(),hs.crossVectors(Qt,zi),r[0]=zi.x,r[4]=hs.x,r[8]=Qt.x,r[1]=zi.y,r[5]=hs.y,r[9]=Qt.y,r[2]=zi.z,r[6]=hs.z,r[10]=Qt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],d=i[1],h=i[5],p=i[9],f=i[13],g=i[2],w=i[6],m=i[10],u=i[14],R=i[3],T=i[7],M=i[11],F=i[15],E=r[0],U=r[4],I=r[8],y=r[12],x=r[1],C=r[5],z=r[9],X=r[13],G=r[2],K=r[6],j=r[10],he=r[14],ee=r[3],ye=r[7],Se=r[11],Ee=r[15];return s[0]=o*E+a*x+c*G+l*ee,s[4]=o*U+a*C+c*K+l*ye,s[8]=o*I+a*z+c*j+l*Se,s[12]=o*y+a*X+c*he+l*Ee,s[1]=d*E+h*x+p*G+f*ee,s[5]=d*U+h*C+p*K+f*ye,s[9]=d*I+h*z+p*j+f*Se,s[13]=d*y+h*X+p*he+f*Ee,s[2]=g*E+w*x+m*G+u*ee,s[6]=g*U+w*C+m*K+u*ye,s[10]=g*I+w*z+m*j+u*Se,s[14]=g*y+w*X+m*he+u*Ee,s[3]=R*E+T*x+M*G+F*ee,s[7]=R*U+T*C+M*K+F*ye,s[11]=R*I+T*z+M*j+F*Se,s[15]=R*y+T*X+M*he+F*Ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],c=e[9],l=e[13],d=e[2],h=e[6],p=e[10],f=e[14],g=e[3],w=e[7],m=e[11],u=e[15];return g*(+s*c*h-r*l*h-s*a*p+i*l*p+r*a*f-i*c*f)+w*(+t*c*f-t*l*p+s*o*p-r*o*f+r*l*d-s*c*d)+m*(+t*l*h-t*a*f-s*o*h+i*o*f+s*a*d-i*l*d)+u*(-r*a*d-t*c*h+t*a*p+r*o*h-i*o*p+i*c*d)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],d=e[8],h=e[9],p=e[10],f=e[11],g=e[12],w=e[13],m=e[14],u=e[15],R=h*m*l-w*p*l+w*c*f-a*m*f-h*c*u+a*p*u,T=g*p*l-d*m*l-g*c*f+o*m*f+d*c*u-o*p*u,M=d*w*l-g*h*l+g*a*f-o*w*f-d*a*u+o*h*u,F=g*h*c-d*w*c-g*a*p+o*w*p+d*a*m-o*h*m,E=t*R+i*T+r*M+s*F;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let U=1/E;return e[0]=R*U,e[1]=(w*p*s-h*m*s-w*r*f+i*m*f+h*r*u-i*p*u)*U,e[2]=(a*m*s-w*c*s+w*r*l-i*m*l-a*r*u+i*c*u)*U,e[3]=(h*c*s-a*p*s-h*r*l+i*p*l+a*r*f-i*c*f)*U,e[4]=T*U,e[5]=(d*m*s-g*p*s+g*r*f-t*m*f-d*r*u+t*p*u)*U,e[6]=(g*c*s-o*m*s-g*r*l+t*m*l+o*r*u-t*c*u)*U,e[7]=(o*p*s-d*c*s+d*r*l-t*p*l-o*r*f+t*c*f)*U,e[8]=M*U,e[9]=(g*h*s-d*w*s-g*i*f+t*w*f+d*i*u-t*h*u)*U,e[10]=(o*w*s-g*a*s+g*i*l-t*w*l-o*i*u+t*a*u)*U,e[11]=(d*a*s-o*h*s-d*i*l+t*h*l+o*i*f-t*a*f)*U,e[12]=F*U,e[13]=(d*w*r-g*h*r+g*i*p-t*w*p-d*i*m+t*h*m)*U,e[14]=(g*a*r-o*w*r-g*i*c+t*w*c+o*i*m-t*a*m)*U,e[15]=(o*h*r-d*a*r+d*i*c-t*h*c-o*i*p+t*a*p)*U,this}scale(e){let t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,c=e.z,l=s*o,d=s*a;return this.set(l*o+i,l*a-r*c,l*c+r*a,0,l*a+r*c,d*a+i,d*c-r*o,0,l*c-r*a,d*c+r*o,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,s=t._x,o=t._y,a=t._z,c=t._w,l=s+s,d=o+o,h=a+a,p=s*l,f=s*d,g=s*h,w=o*d,m=o*h,u=a*h,R=c*l,T=c*d,M=c*h,F=i.x,E=i.y,U=i.z;return r[0]=(1-(w+u))*F,r[1]=(f+M)*F,r[2]=(g-T)*F,r[3]=0,r[4]=(f-M)*E,r[5]=(1-(p+u))*E,r[6]=(m+R)*E,r[7]=0,r[8]=(g+T)*U,r[9]=(m-R)*U,r[10]=(1-(p+w))*U,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements,s=An.set(r[0],r[1],r[2]).length(),o=An.set(r[4],r[5],r[6]).length(),a=An.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],di.copy(this);let l=1/s,d=1/o,h=1/a;return di.elements[0]*=l,di.elements[1]*=l,di.elements[2]*=l,di.elements[4]*=d,di.elements[5]*=d,di.elements[6]*=d,di.elements[8]*=h,di.elements[9]*=h,di.elements[10]*=h,t.setFromRotationMatrix(di),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=fi,c=!1){let l=this.elements,d=2*s/(t-e),h=2*s/(i-r),p=(t+e)/(t-e),f=(i+r)/(i-r),g,w;if(c)g=s/(o-s),w=o*s/(o-s);else if(a===fi)g=-(o+s)/(o-s),w=-2*o*s/(o-s);else if(a===xr)g=-o/(o-s),w=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=d,l[4]=0,l[8]=p,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=w,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=fi,c=!1){let l=this.elements,d=2/(t-e),h=2/(i-r),p=-(t+e)/(t-e),f=-(i+r)/(i-r),g,w;if(c)g=1/(o-s),w=o/(o-s);else if(a===fi)g=-2/(o-s),w=-(o+s)/(o-s);else if(a===xr)g=-1/(o-s),w=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=d,l[4]=0,l[8]=0,l[12]=p,l[1]=0,l[5]=h,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=w,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},An=new N,di=new _t,md=new N(0,0,0),_d=new N(1,1,1),zi=new N,hs=new N,Qt=new N,Gl=new _t,Hl=new li,pi=class n{constructor(e=0,t=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],c=r[1],l=r[5],d=r[9],h=r[2],p=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(We(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(p,l),this._z=0);break;case"YXZ":this._x=Math.asin(-We(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(We(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-We(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(p,f),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(We(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,l),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-We(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,l),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-d,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Gl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Gl,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Hl.setFromEuler(this),this.setFromQuaternion(Hl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};pi.DEFAULT_ORDER="XYZ";var Gn=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},gd=0,Wl=new N,Cn=new li,Ei=new _t,ds=new N,cr=new N,yd=new N,xd=new li,Xl=new N(1,0,0),ql=new N(0,1,0),Yl=new N(0,0,1),Zl={type:"added"},vd={type:"removed"},Rn={type:"childadded",child:null},ma={type:"childremoved",child:null},Ut=class n extends yi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:gd++}),this.uuid=mn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new N,t=new pi,i=new li,r=new N(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new _t},normalMatrix:{value:new He}}),this.matrix=new _t,this.matrixWorld=new _t,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Gn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Cn.setFromAxisAngle(e,t),this.quaternion.multiply(Cn),this}rotateOnWorldAxis(e,t){return Cn.setFromAxisAngle(e,t),this.quaternion.premultiply(Cn),this}rotateX(e){return this.rotateOnAxis(Xl,e)}rotateY(e){return this.rotateOnAxis(ql,e)}rotateZ(e){return this.rotateOnAxis(Yl,e)}translateOnAxis(e,t){return Wl.copy(e).applyQuaternion(this.quaternion),this.position.add(Wl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Xl,e)}translateY(e){return this.translateOnAxis(ql,e)}translateZ(e){return this.translateOnAxis(Yl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ei.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ds.copy(e):ds.set(e,t,i);let r=this.parent;this.updateWorldMatrix(!0,!1),cr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ei.lookAt(cr,ds,this.up):Ei.lookAt(ds,cr,this.up),this.quaternion.setFromRotationMatrix(Ei),r&&(Ei.extractRotation(r.matrixWorld),Cn.setFromRotationMatrix(Ei),this.quaternion.premultiply(Cn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Zl),Rn.child=e,this.dispatchEvent(Rn),Rn.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(vd),ma.child=e,this.dispatchEvent(ma),ma.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ei.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ei.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ei),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Zl),Rn.child=e,this.dispatchEvent(Rn),Rn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(cr,e,yd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(cr,xd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,d=c.length;l<d;l++){let h=c[l];s(e.shapes,h)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(s(e.materials,this.material[c]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];r.animations.push(s(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),d=o(e.images),h=o(e.shapes),p=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),d.length>0&&(i.images=d),h.length>0&&(i.shapes=h),p.length>0&&(i.skeletons=p),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){let c=[];for(let l in a){let d=a[l];delete d.metadata,c.push(d)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};Ut.DEFAULT_UP=new N(0,1,0);Ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ui=new N,Ai=new N,_a=new N,Ci=new N,Pn=new N,In=new N,Jl=new N,ga=new N,ya=new N,xa=new N,va=new vt,wa=new vt,Ma=new vt,Hi=class n{constructor(e=new N,t=new N,i=new N){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),ui.subVectors(e,t),r.cross(ui);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){ui.subVectors(r,t),Ai.subVectors(i,t),_a.subVectors(e,t);let o=ui.dot(ui),a=ui.dot(Ai),c=ui.dot(_a),l=Ai.dot(Ai),d=Ai.dot(_a),h=o*l-a*a;if(h===0)return s.set(0,0,0),null;let p=1/h,f=(l*c-a*d)*p,g=(o*d-a*c)*p;return s.set(1-f-g,g,f)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,Ci)===null?!1:Ci.x>=0&&Ci.y>=0&&Ci.x+Ci.y<=1}static getInterpolation(e,t,i,r,s,o,a,c){return this.getBarycoord(e,t,i,r,Ci)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Ci.x),c.addScaledVector(o,Ci.y),c.addScaledVector(a,Ci.z),c)}static getInterpolatedAttribute(e,t,i,r,s,o){return va.setScalar(0),wa.setScalar(0),Ma.setScalar(0),va.fromBufferAttribute(e,t),wa.fromBufferAttribute(e,i),Ma.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(va,s.x),o.addScaledVector(wa,s.y),o.addScaledVector(Ma,s.z),o}static isFrontFacing(e,t,i,r){return ui.subVectors(i,t),Ai.subVectors(e,t),ui.cross(Ai).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ui.subVectors(this.c,this.b),Ai.subVectors(this.a,this.b),ui.cross(Ai).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,s=this.c,o,a;Pn.subVectors(r,i),In.subVectors(s,i),ga.subVectors(e,i);let c=Pn.dot(ga),l=In.dot(ga);if(c<=0&&l<=0)return t.copy(i);ya.subVectors(e,r);let d=Pn.dot(ya),h=In.dot(ya);if(d>=0&&h<=d)return t.copy(r);let p=c*h-d*l;if(p<=0&&c>=0&&d<=0)return o=c/(c-d),t.copy(i).addScaledVector(Pn,o);xa.subVectors(e,s);let f=Pn.dot(xa),g=In.dot(xa);if(g>=0&&f<=g)return t.copy(s);let w=f*l-c*g;if(w<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(i).addScaledVector(In,a);let m=d*g-f*h;if(m<=0&&h-d>=0&&f-g>=0)return Jl.subVectors(s,r),a=(h-d)/(h-d+(f-g)),t.copy(r).addScaledVector(Jl,a);let u=1/(m+w+p);return o=w*u,a=p*u,t.copy(i).addScaledVector(Pn,o).addScaledVector(In,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ih={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vi={h:0,s:0,l:0},us={h:0,s:0,l:0};function ba(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ye=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=tt.workingColorSpace){return this.r=e,this.g=t,this.b=i,tt.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=tt.workingColorSpace){if(e=hl(e,1),t=We(t,0,1),i=We(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=ba(o,s,e+1/3),this.g=ba(o,s,e),this.b=ba(o,s,e-1/3)}return tt.colorSpaceToWorking(this,r),this}setStyle(e,t=Dt){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Dt){let i=ih[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ri(e.r),this.g=Ri(e.g),this.b=Ri(e.b),this}copyLinearToSRGB(e){return this.r=Fn(e.r),this.g=Fn(e.g),this.b=Fn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Dt){return tt.workingToColorSpace(Ft.copy(this),e),Math.round(We(Ft.r*255,0,255))*65536+Math.round(We(Ft.g*255,0,255))*256+Math.round(We(Ft.b*255,0,255))}getHexString(e=Dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tt.workingColorSpace){tt.workingToColorSpace(Ft.copy(this),t);let i=Ft.r,r=Ft.g,s=Ft.b,o=Math.max(i,r,s),a=Math.min(i,r,s),c,l,d=(a+o)/2;if(a===o)c=0,l=0;else{let h=o-a;switch(l=d<=.5?h/(o+a):h/(2-o-a),o){case i:c=(r-s)/h+(r<s?6:0);break;case r:c=(s-i)/h+2;break;case s:c=(i-r)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=d,e}getRGB(e,t=tt.workingColorSpace){return tt.workingToColorSpace(Ft.copy(this),t),e.r=Ft.r,e.g=Ft.g,e.b=Ft.b,e}getStyle(e=Dt){tt.workingToColorSpace(Ft.copy(this),e);let t=Ft.r,i=Ft.g,r=Ft.b;return e!==Dt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(Vi),this.setHSL(Vi.h+e,Vi.s+t,Vi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Vi),e.getHSL(us);let i=pr(Vi.h,us.h,t),r=pr(Vi.s,us.s,t),s=pr(Vi.l,us.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ft=new Ye;Ye.NAMES=ih;var wd=0,Ii=class extends yi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wd++}),this.uuid=mn(),this.name="",this.type="Material",this.blending=an,this.side=Pi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ps,this.blendDst=Is,this.blendEquation=Xi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ye(0,0,0),this.blendAlpha=0,this.depthFunc=ln,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Na,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=on,this.stencilZFail=on,this.stencilZPass=on,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==an&&(i.blending=this.blending),this.side!==Pi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ps&&(i.blendSrc=this.blendSrc),this.blendDst!==Is&&(i.blendDst=this.blendDst),this.blendEquation!==Xi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ln&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Na&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==on&&(i.stencilFail=this.stencilFail),this.stencilZFail!==on&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==on&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let c=s[a];delete c.metadata,o.push(c)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Mr=class extends Ii{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=Ka,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var bt=new N,fs=new me,Md=0,Gt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Md++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Fa,this.updateRanges=[],this.gpuType=Mi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)fs.fromBufferAttribute(this,t),fs.applyMatrix3(e),this.setXY(t,fs.x,fs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix3(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix4(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)bt.fromBufferAttribute(this,t),bt.applyNormalMatrix(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)bt.fromBufferAttribute(this,t),bt.transformDirection(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Nn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Vt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Nn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Nn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Nn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Nn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),i=Vt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),i=Vt(i,this.array),r=Vt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),i=Vt(i,this.array),r=Vt(r,this.array),s=Vt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Fa&&(e.usage=this.usage),e}};var br=class extends Gt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var Sr=class extends Gt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var lt=class extends Gt{constructor(e,t,i){super(new Float32Array(e),t,i)}},bd=0,ai=new _t,Sa=new Ut,Dn=new N,ei=new ii,hr=new ii,Rt=new N,Pt=class n extends yi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:bd++}),this.uuid=mn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(dl(e)?Sr:br)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new He().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ai.makeRotationFromQuaternion(e),this.applyMatrix4(ai),this}rotateX(e){return ai.makeRotationX(e),this.applyMatrix4(ai),this}rotateY(e){return ai.makeRotationY(e),this.applyMatrix4(ai),this}rotateZ(e){return ai.makeRotationZ(e),this.applyMatrix4(ai),this}translate(e,t,i){return ai.makeTranslation(e,t,i),this.applyMatrix4(ai),this}scale(e,t,i){return ai.makeScale(e,t,i),this.applyMatrix4(ai),this}lookAt(e){return Sa.lookAt(e),Sa.updateMatrix(),this.applyMatrix4(Sa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Dn).negate(),this.translate(Dn.x,Dn.y,Dn.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let r=0,s=e.length;r<s;r++){let o=e[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new lt(i,3))}else{let i=Math.min(e.length,t.count);for(let r=0;r<i;r++){let s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ii);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let s=t[i];ei.setFromBufferAttribute(s),this.morphTargetsRelative?(Rt.addVectors(this.boundingBox.min,ei.min),this.boundingBox.expandByPoint(Rt),Rt.addVectors(this.boundingBox.max,ei.max),this.boundingBox.expandByPoint(Rt)):(this.boundingBox.expandByPoint(ei.min),this.boundingBox.expandByPoint(ei.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new hn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){let i=this.boundingSphere.center;if(ei.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];hr.setFromBufferAttribute(a),this.morphTargetsRelative?(Rt.addVectors(ei.min,hr.min),ei.expandByPoint(Rt),Rt.addVectors(ei.max,hr.max),ei.expandByPoint(Rt)):(ei.expandByPoint(hr.min),ei.expandByPoint(hr.max))}ei.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Rt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Rt));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],c=this.morphTargetsRelative;for(let l=0,d=a.count;l<d;l++)Rt.fromBufferAttribute(a,l),c&&(Dn.fromBufferAttribute(e,l),Rt.add(Dn)),r=Math.max(r,i.distanceToSquared(Rt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Gt(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],c=[];for(let I=0;I<i.count;I++)a[I]=new N,c[I]=new N;let l=new N,d=new N,h=new N,p=new me,f=new me,g=new me,w=new N,m=new N;function u(I,y,x){l.fromBufferAttribute(i,I),d.fromBufferAttribute(i,y),h.fromBufferAttribute(i,x),p.fromBufferAttribute(s,I),f.fromBufferAttribute(s,y),g.fromBufferAttribute(s,x),d.sub(l),h.sub(l),f.sub(p),g.sub(p);let C=1/(f.x*g.y-g.x*f.y);isFinite(C)&&(w.copy(d).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(C),m.copy(h).multiplyScalar(f.x).addScaledVector(d,-g.x).multiplyScalar(C),a[I].add(w),a[y].add(w),a[x].add(w),c[I].add(m),c[y].add(m),c[x].add(m))}let R=this.groups;R.length===0&&(R=[{start:0,count:e.count}]);for(let I=0,y=R.length;I<y;++I){let x=R[I],C=x.start,z=x.count;for(let X=C,G=C+z;X<G;X+=3)u(e.getX(X+0),e.getX(X+1),e.getX(X+2))}let T=new N,M=new N,F=new N,E=new N;function U(I){F.fromBufferAttribute(r,I),E.copy(F);let y=a[I];T.copy(y),T.sub(F.multiplyScalar(F.dot(y))).normalize(),M.crossVectors(E,y);let C=M.dot(c[I])<0?-1:1;o.setXYZW(I,T.x,T.y,T.z,C)}for(let I=0,y=R.length;I<y;++I){let x=R[I],C=x.start,z=x.count;for(let X=C,G=C+z;X<G;X+=3)U(e.getX(X+0)),U(e.getX(X+1)),U(e.getX(X+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Gt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,f=i.count;p<f;p++)i.setXYZ(p,0,0,0);let r=new N,s=new N,o=new N,a=new N,c=new N,l=new N,d=new N,h=new N;if(e)for(let p=0,f=e.count;p<f;p+=3){let g=e.getX(p+0),w=e.getX(p+1),m=e.getX(p+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,w),o.fromBufferAttribute(t,m),d.subVectors(o,s),h.subVectors(r,s),d.cross(h),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,w),l.fromBufferAttribute(i,m),a.add(d),c.add(d),l.add(d),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(w,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let p=0,f=t.count;p<f;p+=3)r.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),d.subVectors(o,s),h.subVectors(r,s),d.cross(h),i.setXYZ(p+0,d.x,d.y,d.z),i.setXYZ(p+1,d.x,d.y,d.z),i.setXYZ(p+2,d.x,d.y,d.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Rt.fromBufferAttribute(e,t),Rt.normalize(),e.setXYZ(t,Rt.x,Rt.y,Rt.z)}toNonIndexed(){function e(a,c){let l=a.array,d=a.itemSize,h=a.normalized,p=new l.constructor(c.length*d),f=0,g=0;for(let w=0,m=c.length;w<m;w++){a.isInterleavedBufferAttribute?f=c[w]*a.data.stride+a.offset:f=c[w]*d;for(let u=0;u<d;u++)p[g++]=l[f++]}return new Gt(p,d,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let c=r[a],l=e(c,i);t.setAttribute(a,l)}let s=this.morphAttributes;for(let a in s){let c=[],l=s[a];for(let d=0,h=l.length;d<h;d++){let p=l[d],f=e(p,i);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let r={},s=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],d=[];for(let h=0,p=l.length;h<p;h++){let f=l[h];d.push(f.toJSON(e.data))}d.length>0&&(r[c]=d,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let r=e.attributes;for(let l in r){let d=r[l];this.setAttribute(l,d.clone(t))}let s=e.morphAttributes;for(let l in s){let d=[],h=s[l];for(let p=0,f=h.length;p<f;p++)d.push(h[p].clone(t));this.morphAttributes[l]=d}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,d=o.length;l<d;l++){let h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Kl=new _t,rn=new qi,ps=new hn,$l=new N,ms=new N,_s=new N,gs=new N,Ta=new N,ys=new N,jl=new N,xs=new N,Ke=class extends Ut{constructor(e=new Pt,t=new Mr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){ys.set(0,0,0);for(let c=0,l=s.length;c<l;c++){let d=a[c],h=s[c];d!==0&&(Ta.fromBufferAttribute(h,e),o?ys.addScaledVector(Ta,d):ys.addScaledVector(Ta.sub(t),d))}t.add(ys)}return t}raycast(e,t){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),ps.copy(i.boundingSphere),ps.applyMatrix4(s),rn.copy(e.ray).recast(e.near),!(ps.containsPoint(rn.origin)===!1&&(rn.intersectSphere(ps,$l)===null||rn.origin.distanceToSquared($l)>(e.far-e.near)**2))&&(Kl.copy(s).invert(),rn.copy(e.ray).applyMatrix4(Kl),!(i.boundingBox!==null&&rn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,rn)))}_computeIntersections(e,t,i){let r,s=this.geometry,o=this.material,a=s.index,c=s.attributes.position,l=s.attributes.uv,d=s.attributes.uv1,h=s.attributes.normal,p=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,w=p.length;g<w;g++){let m=p[g],u=o[m.materialIndex],R=Math.max(m.start,f.start),T=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let M=R,F=T;M<F;M+=3){let E=a.getX(M),U=a.getX(M+1),I=a.getX(M+2);r=vs(this,u,e,i,l,d,h,E,U,I),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),w=Math.min(a.count,f.start+f.count);for(let m=g,u=w;m<u;m+=3){let R=a.getX(m),T=a.getX(m+1),M=a.getX(m+2);r=vs(this,o,e,i,l,d,h,R,T,M),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,w=p.length;g<w;g++){let m=p[g],u=o[m.materialIndex],R=Math.max(m.start,f.start),T=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let M=R,F=T;M<F;M+=3){let E=M,U=M+1,I=M+2;r=vs(this,u,e,i,l,d,h,E,U,I),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),w=Math.min(c.count,f.start+f.count);for(let m=g,u=w;m<u;m+=3){let R=m,T=m+1,M=m+2;r=vs(this,o,e,i,l,d,h,R,T,M),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};function Sd(n,e,t,i,r,s,o,a){let c;if(e.side===Ht?c=i.intersectTriangle(o,s,r,!0,a):c=i.intersectTriangle(r,s,o,e.side===Pi,a),c===null)return null;xs.copy(a),xs.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(xs);return l<t.near||l>t.far?null:{distance:l,point:xs.clone(),object:n}}function vs(n,e,t,i,r,s,o,a,c,l){n.getVertexPosition(a,ms),n.getVertexPosition(c,_s),n.getVertexPosition(l,gs);let d=Sd(n,e,t,i,ms,_s,gs,jl);if(d){let h=new N;Hi.getBarycoord(jl,ms,_s,gs,h),r&&(d.uv=Hi.getInterpolatedAttribute(r,a,c,l,h,new me)),s&&(d.uv1=Hi.getInterpolatedAttribute(s,a,c,l,h,new me)),o&&(d.normal=Hi.getInterpolatedAttribute(o,a,c,l,h,new N),d.normal.dot(i.direction)>0&&d.normal.multiplyScalar(-1));let p={a,b:c,c:l,normal:new N,materialIndex:0};Hi.getNormal(ms,_s,gs,p.normal),d.face=p,d.barycoord=h}return d}var St=class n extends Pt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let c=[],l=[],d=[],h=[],p=0,f=0;g("z","y","x",-1,-1,i,t,e,o,s,0),g("z","y","x",1,-1,i,t,-e,o,s,1),g("x","z","y",1,1,e,i,t,r,o,2),g("x","z","y",1,-1,e,i,-t,r,o,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(c),this.setAttribute("position",new lt(l,3)),this.setAttribute("normal",new lt(d,3)),this.setAttribute("uv",new lt(h,2));function g(w,m,u,R,T,M,F,E,U,I,y){let x=M/U,C=F/I,z=M/2,X=F/2,G=E/2,K=U+1,j=I+1,he=0,ee=0,ye=new N;for(let Se=0;Se<j;Se++){let Ee=Se*C-X;for(let Ge=0;Ge<K;Ge++){let $e=Ge*x-z;ye[w]=$e*R,ye[m]=Ee*T,ye[u]=G,l.push(ye.x,ye.y,ye.z),ye[w]=0,ye[m]=0,ye[u]=E>0?1:-1,d.push(ye.x,ye.y,ye.z),h.push(Ge/U),h.push(1-Se/I),he+=1}}for(let Se=0;Se<I;Se++)for(let Ee=0;Ee<U;Ee++){let Ge=p+Ee+K*Se,$e=p+Ee+K*(Se+1),it=p+(Ee+1)+K*(Se+1),Ze=p+(Ee+1)+K*Se;c.push(Ge,$e,Ze),c.push($e,it,Ze),ee+=6}a.addGroup(f,ee,y),f+=ee,p+=he}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function _n(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Ot(n){let e={};for(let t=0;t<n.length;t++){let i=_n(n[t]);for(let r in i)e[r]=i[r]}return e}function Td(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ul(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}var nh={clone:_n,merge:Ot},Ed=`void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ad=`void main() {
  gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,mi=class extends Ii{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ed,this.fragmentShader=Ad,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=_n(e.uniforms),this.uniformsGroups=Td(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},Tr=class extends Ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new _t,this.projectionMatrix=new _t,this.projectionMatrixInverse=new _t,this.coordinateSystem=fi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Gi=new N,Ql=new me,ec=new me,kt=class extends Tr{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Bn*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(fr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Bn*2*Math.atan(Math.tan(fr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Gi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Gi.x,Gi.y).multiplyScalar(-e/Gi.z),Gi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Gi.x,Gi.y).multiplyScalar(-e/Gi.z)}getViewSize(e,t){return this.getViewBounds(e,Ql,ec),t.subVectors(ec,Ql)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(fr*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;s+=o.offsetX*r/c,t-=o.offsetY*i/l,r*=o.width/c,i*=o.height/l}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ln=-90,Un=1,ks=class extends Ut{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new kt(Ln,Un,e,t);r.layers=this.layers,this.add(r);let s=new kt(Ln,Un,e,t);s.layers=this.layers,this.add(s);let o=new kt(Ln,Un,e,t);o.layers=this.layers,this.add(o);let a=new kt(Ln,Un,e,t);a.layers=this.layers,this.add(a);let c=new kt(Ln,Un,e,t);c.layers=this.layers,this.add(c);let l=new kt(Ln,Un,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,c]=t;for(let l of t)this.remove(l);if(e===fi)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===xr)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,c,l,d]=this.children,h=e.getRenderTarget(),p=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let w=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,c),e.setRenderTarget(i,4,r),e.render(t,l),i.texture.generateMipmaps=w,e.setRenderTarget(i,5,r),e.render(t,d),e.setRenderTarget(h,p,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Er=class extends Zt{constructor(e=[],t=fn,i,r,s,o,a,c,l,d){super(e,t,i,r,s,o,a,c,l,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Os=class extends xi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Er(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

        varying vec3 vWorldDirection;

        vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

          return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

        }

        void main() {

          vWorldDirection = transformDirection( position, modelMatrix );

          #include <begin_vertex>
          #include <project_vertex>

        }
      `,fragmentShader:`

        uniform sampler2D tEquirect;

        varying vec3 vWorldDirection;

        #include <common>

        void main() {

          vec3 direction = normalize( vWorldDirection );

          vec2 sampleUV = equirectUv( direction );

          gl_FragColor = texture2D( tEquirect, sampleUV );

        }
      `},r=new St(5,5,5),s=new mi({name:"CubemapFromEquirect",uniforms:_n(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ht,blending:Li});s.uniforms.tEquirect.value=t;let o=new Ke(r,s),a=t.minFilter;return t.minFilter===ji&&(t.minFilter=ti),new ks(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}},Lt=class extends Ut{constructor(){super(),this.isGroup=!0,this.type="Group"}},Cd={type:"move"},Hn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Lt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Lt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Lt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let w of e.hand.values()){let m=t.getJointPose(w,i),u=this._getHandJoint(l,w);m!==null&&(u.matrix.fromArray(m.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=m.radius),u.visible=m!==null}let d=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],p=d.position.distanceTo(h.position),f=.02,g=.005;l.inputState.pinching&&p>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&p<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Cd)))}return a!==null&&(a.visible=r!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Lt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}};var Ar=class extends Ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pi,this.environmentIntensity=1,this.environmentRotation=new pi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var Cr=class extends Zt{constructor(e=null,t=1,i=1,r,s,o,a,c,l=Yt,d=Yt,h,p){super(null,o,a,c,l,d,r,s,h,p),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ea=new N,Rd=new N,Pd=new He,qt=class{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=Ea.subVectors(i,t).cross(Rd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(Ea),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||Pd.getNormalMatrix(e),r=this.coplanarPoint(Ea).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},sn=new hn,Id=new me(.5,.5),ws=new N,Wn=class{constructor(e=new qt,t=new qt,i=new qt,r=new qt,s=new qt,o=new qt){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=fi,i=!1){let r=this.planes,s=e.elements,o=s[0],a=s[1],c=s[2],l=s[3],d=s[4],h=s[5],p=s[6],f=s[7],g=s[8],w=s[9],m=s[10],u=s[11],R=s[12],T=s[13],M=s[14],F=s[15];if(r[0].setComponents(l-o,f-d,u-g,F-R).normalize(),r[1].setComponents(l+o,f+d,u+g,F+R).normalize(),r[2].setComponents(l+a,f+h,u+w,F+T).normalize(),r[3].setComponents(l-a,f-h,u-w,F-T).normalize(),i)r[4].setComponents(c,p,m,M).normalize(),r[5].setComponents(l-c,f-p,u-m,F-M).normalize();else if(r[4].setComponents(l-c,f-p,u-m,F-M).normalize(),t===fi)r[5].setComponents(l+c,f+p,u+m,F+M).normalize();else if(t===xr)r[5].setComponents(c,p,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),sn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),sn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(sn)}intersectsSprite(e){sn.center.set(0,0,0);let t=Id.distanceTo(e.center);return sn.radius=.7071067811865476+t,sn.applyMatrix4(e.matrixWorld),this.intersectsSphere(sn)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(ws.x=r.normal.x>0?e.max.x:e.min.x,ws.y=r.normal.y>0?e.max.y:e.min.y,ws.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ws)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Yi=class extends Ii{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ye(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Bs=new N,zs=new N,tc=new _t,dr=new qi,Ms=new hn,Aa=new N,ic=new N,Xn=class extends Ut{constructor(e=new Pt,t=new Yi){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let r=1,s=t.count;r<s;r++)Bs.fromBufferAttribute(t,r-1),zs.fromBufferAttribute(t,r),i[r]=i[r-1],i[r]+=Bs.distanceTo(zs);e.setAttribute("lineDistance",new lt(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let i=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Ms.copy(i.boundingSphere),Ms.applyMatrix4(r),Ms.radius+=s,e.ray.intersectsSphere(Ms)===!1)return;tc.copy(r).invert(),dr.copy(e.ray).applyMatrix4(tc);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,d=i.index,p=i.attributes.position;if(d!==null){let f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let w=f,m=g-1;w<m;w+=l){let u=d.getX(w),R=d.getX(w+1),T=bs(this,e,dr,c,u,R,w);T&&t.push(T)}if(this.isLineLoop){let w=d.getX(g-1),m=d.getX(f),u=bs(this,e,dr,c,w,m,g-1);u&&t.push(u)}}else{let f=Math.max(0,o.start),g=Math.min(p.count,o.start+o.count);for(let w=f,m=g-1;w<m;w+=l){let u=bs(this,e,dr,c,w,w+1,w);u&&t.push(u)}if(this.isLineLoop){let w=bs(this,e,dr,c,g-1,f,g-1);w&&t.push(w)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function bs(n,e,t,i,r,s,o){let a=n.geometry.attributes.position;if(Bs.fromBufferAttribute(a,r),zs.fromBufferAttribute(a,s),t.distanceSqToSegment(Bs,zs,Aa,ic)>i)return;Aa.applyMatrix4(n.matrixWorld);let l=e.ray.origin.distanceTo(Aa);if(!(l<e.near||l>e.far))return{distance:l,point:ic.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}var nc=new N,rc=new N,Vs=class extends Xn{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let r=0,s=t.count;r<s;r+=2)nc.fromBufferAttribute(t,r),rc.fromBufferAttribute(t,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+nc.distanceTo(rc);e.setAttribute("lineDistance",new lt(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Rr=class extends Zt{constructor(e,t,i=Qi,r,s,o,a=Yt,c=Yt,l,d=On,h=1){if(d!==On&&d!==er)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let p={width:e,height:t,depth:h};super(p,r,s,o,a,c,d,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Vn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Pr=class extends Zt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var vi=class n extends Pt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:c};let l=this;r=Math.floor(r),s=Math.floor(s);let d=[],h=[],p=[],f=[],g=0,w=[],m=i/2,u=0;R(),o===!1&&(e>0&&T(!0),t>0&&T(!1)),this.setIndex(d),this.setAttribute("position",new lt(h,3)),this.setAttribute("normal",new lt(p,3)),this.setAttribute("uv",new lt(f,2));function R(){let M=new N,F=new N,E=0,U=(t-e)/i;for(let I=0;I<=s;I++){let y=[],x=I/s,C=x*(t-e)+e;for(let z=0;z<=r;z++){let X=z/r,G=X*c+a,K=Math.sin(G),j=Math.cos(G);F.x=C*K,F.y=-x*i+m,F.z=C*j,h.push(F.x,F.y,F.z),M.set(K,U,j).normalize(),p.push(M.x,M.y,M.z),f.push(X,1-x),y.push(g++)}w.push(y)}for(let I=0;I<r;I++)for(let y=0;y<s;y++){let x=w[y][I],C=w[y+1][I],z=w[y+1][I+1],X=w[y][I+1];(e>0||y!==0)&&(d.push(x,C,X),E+=3),(t>0||y!==s-1)&&(d.push(C,z,X),E+=3)}l.addGroup(u,E,0),u+=E}function T(M){let F=g,E=new me,U=new N,I=0,y=M===!0?e:t,x=M===!0?1:-1;for(let z=1;z<=r;z++)h.push(0,m*x,0),p.push(0,x,0),f.push(.5,.5),g++;let C=g;for(let z=0;z<=r;z++){let G=z/r*c+a,K=Math.cos(G),j=Math.sin(G);U.x=y*j,U.y=m*x,U.z=y*K,h.push(U.x,U.y,U.z),p.push(0,x,0),E.x=K*.5+.5,E.y=j*.5*x+.5,f.push(E.x,E.y),g++}for(let z=0;z<r;z++){let X=F+z,G=C+z;M===!0?d.push(G,G+1,X):d.push(G+1,G,X),I+=3}l.addGroup(u,I,M===!0?1:2),u+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var ni=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),r=0,s=i.length,o;t?o=t:o=e*i[s-1];let a=0,c=s-1,l;for(;a<=c;)if(r=Math.floor(a+(c-a)/2),l=i[r]-o,l<0)a=r+1;else if(l>0)c=r-1;else{c=r;break}if(r=c,i[r]===o)return r/(s-1);let d=i[r],p=i[r+1]-d,f=(o-d)/p;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),c=t||(o.isVector2?new me:new N);return c.copy(a).sub(o).normalize(),c}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new N,r=[],s=[],o=[],a=new N,c=new _t;for(let f=0;f<=e;f++){let g=f/e;r[f]=this.getTangentAt(g,new N)}s[0]=new N,o[0]=new N;let l=Number.MAX_VALUE,d=Math.abs(r[0].x),h=Math.abs(r[0].y),p=Math.abs(r[0].z);d<=l&&(l=d,i.set(1,0,0)),h<=l&&(l=h,i.set(0,1,0)),p<=l&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(We(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(c.makeRotationAxis(a,g))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(We(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let g=1;g<=e;g++)s[g].applyMatrix4(c.makeRotationAxis(r[g],f*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},qn=class extends ni{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(e,t=new me){let i=t,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let d=Math.cos(this.aRotation),h=Math.sin(this.aRotation),p=c-this.aX,f=l-this.aY;c=p*d-f*h+this.aX,l=p*h+f*d+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Gs=class extends qn{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function fl(){let n=0,e=0,t=0,i=0;function r(s,o,a,c){n=s,e=a,t=-3*s+3*o-2*a-c,i=2*s-2*o+a+c}return{initCatmullRom:function(s,o,a,c,l){r(o,a,l*(a-s),l*(c-o))},initNonuniformCatmullRom:function(s,o,a,c,l,d,h){let p=(o-s)/l-(a-s)/(l+d)+(a-o)/d,f=(a-o)/d-(c-o)/(d+h)+(c-a)/h;p*=d,f*=d,r(o,a,p,f)},calc:function(s){let o=s*s,a=o*s;return n+e*s+t*o+i*a}}}var Ss=new N,Ca=new fl,Ra=new fl,Pa=new fl,Hs=class extends ni{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new N){let i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:c===0&&a===s-1&&(a=s-2,c=1);let l,d;this.closed||a>0?l=r[(a-1)%s]:(Ss.subVectors(r[0],r[1]).add(r[0]),l=Ss);let h=r[a%s],p=r[(a+1)%s];if(this.closed||a+2<s?d=r[(a+2)%s]:(Ss.subVectors(r[s-1],r[s-2]).add(r[s-1]),d=Ss),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(l.distanceToSquared(h),f),w=Math.pow(h.distanceToSquared(p),f),m=Math.pow(p.distanceToSquared(d),f);w<1e-4&&(w=1),g<1e-4&&(g=w),m<1e-4&&(m=w),Ca.initNonuniformCatmullRom(l.x,h.x,p.x,d.x,g,w,m),Ra.initNonuniformCatmullRom(l.y,h.y,p.y,d.y,g,w,m),Pa.initNonuniformCatmullRom(l.z,h.z,p.z,d.z,g,w,m)}else this.curveType==="catmullrom"&&(Ca.initCatmullRom(l.x,h.x,p.x,d.x,this.tension),Ra.initCatmullRom(l.y,h.y,p.y,d.y,this.tension),Pa.initCatmullRom(l.z,h.z,p.z,d.z,this.tension));return i.set(Ca.calc(c),Ra.calc(c),Pa.calc(c)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new N().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function sc(n,e,t,i,r){let s=(i-e)*.5,o=(r-t)*.5,a=n*n,c=n*a;return(2*t-2*i+s+o)*c+(-3*t+3*i-2*s-o)*a+s*n+t}function Dd(n,e){let t=1-n;return t*t*e}function Ld(n,e){return 2*(1-n)*n*e}function Ud(n,e){return n*n*e}function mr(n,e,t,i){return Dd(n,e)+Ld(n,t)+Ud(n,i)}function Nd(n,e){let t=1-n;return t*t*t*e}function Fd(n,e){let t=1-n;return 3*t*t*n*e}function kd(n,e){return 3*(1-n)*n*n*e}function Od(n,e){return n*n*n*e}function _r(n,e,t,i,r){return Nd(n,e)+Fd(n,t)+kd(n,i)+Od(n,r)}var Ir=class extends ni{constructor(e=new me,t=new me,i=new me,r=new me){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new me){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(_r(e,r.x,s.x,o.x,a.x),_r(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ws=class extends ni{constructor(e=new N,t=new N,i=new N,r=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new N){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(_r(e,r.x,s.x,o.x,a.x),_r(e,r.y,s.y,o.y,a.y),_r(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Dr=class extends ni{constructor(e=new me,t=new me){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new me){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new me){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Xs=class extends ni{constructor(e=new N,t=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new N){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new N){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Lr=class extends ni{constructor(e=new me,t=new me,i=new me){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new me){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(mr(e,r.x,s.x,o.x),mr(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},qs=class extends ni{constructor(e=new N,t=new N,i=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new N){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(mr(e,r.x,s.x,o.x),mr(e,r.y,s.y,o.y),mr(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ur=class extends ni{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new me){let i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,c=r[o===0?o:o-1],l=r[o],d=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return i.set(sc(a,c.x,l.x,d.x,h.x),sc(a,c.y,l.y,d.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new me().fromArray(r))}return this}},ka=Object.freeze({__proto__:null,ArcCurve:Gs,CatmullRomCurve3:Hs,CubicBezierCurve:Ir,CubicBezierCurve3:Ws,EllipseCurve:qn,LineCurve:Dr,LineCurve3:Xs,QuadraticBezierCurve:Lr,QuadraticBezierCurve3:qs,SplineCurve:Ur}),Ys=class extends ni{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ka[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let o=r[s]-i,a=this.curves[s],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,c=o.getPoints(a);for(let l=0;l<c.length;l++){let d=c[l];i&&i.equals(d)||(t.push(d),i=d)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(new ka[r.type]().fromJSON(r))}return this}},Nr=class extends Ys{constructor(e){super(),this.type="Path",this.currentPoint=new me,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new Dr(this.currentPoint.clone(),new me(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){let s=new Lr(this.currentPoint.clone(),new me(e,t),new me(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){let a=new Ir(this.currentPoint.clone(),new me(e,t),new me(i,r),new me(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Ur(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,c){let l=this.currentPoint.x,d=this.currentPoint.y;return this.absellipse(e+l,t+d,i,r,s,o,a,c),this}absellipse(e,t,i,r,s,o,a,c){let l=new qn(e,t,i,r,s,o,a,c);if(this.curves.length>0){let h=l.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(l);let d=l.getPoint(1);return this.currentPoint.copy(d),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Di=class extends Nr{constructor(e){super(e),this.uuid=mn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(new Nr().fromJSON(r))}return this}};function Bd(n,e,t=2){let i=e&&e.length,r=i?e[0]*t:n.length,s=rh(n,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,c,l;if(i&&(s=Wd(n,e,s,t)),n.length>80*t){a=1/0,c=1/0;let d=-1/0,h=-1/0;for(let p=t;p<r;p+=t){let f=n[p],g=n[p+1];f<a&&(a=f),g<c&&(c=g),f>d&&(d=f),g>h&&(h=g)}l=Math.max(d-a,h-c),l=l!==0?32767/l:0}return Fr(s,o,t,a,c,l,0),o}function rh(n,e,t,i,r){let s;if(r===tu(n,e,t,i)>0)for(let o=e;o<t;o+=i)s=oc(o/i|0,n[o],n[o+1],s);else for(let o=t-i;o>=e;o-=i)s=oc(o/i|0,n[o],n[o+1],s);return s&&Yn(s,s.next)&&(Or(s),s=s.next),s}function dn(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(Yn(t,t.next)||xt(t.prev,t,t.next)===0)){if(Or(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Fr(n,e,t,i,r,s,o){if(!n)return;!o&&s&&Jd(n,i,r,s);let a=n;for(;n.prev!==n.next;){let c=n.prev,l=n.next;if(s?Vd(n,i,r,s):zd(n)){e.push(c.i,n.i,l.i),Or(n),n=l.next,a=l.next;continue}if(n=l,n===a){o?o===1?(n=Gd(dn(n),e),Fr(n,e,t,i,r,s,2)):o===2&&Hd(n,e,t,i,r,s):Fr(dn(n),e,t,i,r,s,1);break}}}function zd(n){let e=n.prev,t=n,i=n.next;if(xt(e,t,i)>=0)return!1;let r=e.x,s=t.x,o=i.x,a=e.y,c=t.y,l=i.y,d=Math.min(r,s,o),h=Math.min(a,c,l),p=Math.max(r,s,o),f=Math.max(a,c,l),g=i.next;for(;g!==e;){if(g.x>=d&&g.x<=p&&g.y>=h&&g.y<=f&&ur(r,a,s,c,o,l,g.x,g.y)&&xt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Vd(n,e,t,i){let r=n.prev,s=n,o=n.next;if(xt(r,s,o)>=0)return!1;let a=r.x,c=s.x,l=o.x,d=r.y,h=s.y,p=o.y,f=Math.min(a,c,l),g=Math.min(d,h,p),w=Math.max(a,c,l),m=Math.max(d,h,p),u=Oa(f,g,e,t,i),R=Oa(w,m,e,t,i),T=n.prevZ,M=n.nextZ;for(;T&&T.z>=u&&M&&M.z<=R;){if(T.x>=f&&T.x<=w&&T.y>=g&&T.y<=m&&T!==r&&T!==o&&ur(a,d,c,h,l,p,T.x,T.y)&&xt(T.prev,T,T.next)>=0||(T=T.prevZ,M.x>=f&&M.x<=w&&M.y>=g&&M.y<=m&&M!==r&&M!==o&&ur(a,d,c,h,l,p,M.x,M.y)&&xt(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;T&&T.z>=u;){if(T.x>=f&&T.x<=w&&T.y>=g&&T.y<=m&&T!==r&&T!==o&&ur(a,d,c,h,l,p,T.x,T.y)&&xt(T.prev,T,T.next)>=0)return!1;T=T.prevZ}for(;M&&M.z<=R;){if(M.x>=f&&M.x<=w&&M.y>=g&&M.y<=m&&M!==r&&M!==o&&ur(a,d,c,h,l,p,M.x,M.y)&&xt(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function Gd(n,e){let t=n;do{let i=t.prev,r=t.next.next;!Yn(i,r)&&oh(i,t,t.next,r)&&kr(i,r)&&kr(r,i)&&(e.push(i.i,t.i,r.i),Or(t),Or(t.next),t=n=r),t=t.next}while(t!==n);return dn(t)}function Hd(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&jd(o,a)){let c=ah(o,a);o=dn(o,o.next),c=dn(c,c.next),Fr(o,e,t,i,r,s,0),Fr(c,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function Wd(n,e,t,i){let r=[];for(let s=0,o=e.length;s<o;s++){let a=e[s]*i,c=s<o-1?e[s+1]*i:n.length,l=rh(n,a,c,i,!1);l===l.next&&(l.steiner=!0),r.push($d(l))}r.sort(Xd);for(let s=0;s<r.length;s++)t=qd(r[s],t);return t}function Xd(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),r=(e.next.y-e.y)/(e.next.x-e.x);t=i-r}return t}function qd(n,e){let t=Yd(n,e);if(!t)return e;let i=ah(t,n);return dn(i,i.next),dn(t,t.next)}function Yd(n,e){let t=e,i=n.x,r=n.y,s=-1/0,o;if(Yn(n,t))return t;do{if(Yn(n,t.next))return t.next;if(r<=t.y&&r>=t.next.y&&t.next.y!==t.y){let h=t.x+(r-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=i&&h>s&&(s=h,o=t.x<t.next.x?t:t.next,h===i))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,c=o.x,l=o.y,d=1/0;t=o;do{if(i>=t.x&&t.x>=c&&i!==t.x&&sh(r<l?i:s,r,c,l,r<l?s:i,r,t.x,t.y)){let h=Math.abs(r-t.y)/(i-t.x);kr(t,n)&&(h<d||h===d&&(t.x>o.x||t.x===o.x&&Zd(o,t)))&&(o=t,d=h)}t=t.next}while(t!==a);return o}function Zd(n,e){return xt(n.prev,n,e.prev)<0&&xt(e.next,n,n.next)<0}function Jd(n,e,t,i){let r=n;do r.z===0&&(r.z=Oa(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,Kd(r)}function Kd(n){let e,t=1;do{let i=n,r;n=null;let s=null;for(e=0;i;){e++;let o=i,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||i.z<=o.z)?(r=i,i=i.nextZ,a--):(r=o,o=o.nextZ,c--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;i=o}s.nextZ=null,t*=2}while(e>1);return n}function Oa(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function $d(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function sh(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function ur(n,e,t,i,r,s,o,a){return!(n===o&&e===a)&&sh(n,e,t,i,r,s,o,a)}function jd(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!Qd(n,e)&&(kr(n,e)&&kr(e,n)&&eu(n,e)&&(xt(n.prev,n,e.prev)||xt(n,e.prev,e))||Yn(n,e)&&xt(n.prev,n,n.next)>0&&xt(e.prev,e,e.next)>0)}function xt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function Yn(n,e){return n.x===e.x&&n.y===e.y}function oh(n,e,t,i){let r=Es(xt(n,e,t)),s=Es(xt(n,e,i)),o=Es(xt(t,i,n)),a=Es(xt(t,i,e));return!!(r!==s&&o!==a||r===0&&Ts(n,t,e)||s===0&&Ts(n,i,e)||o===0&&Ts(t,n,i)||a===0&&Ts(t,e,i))}function Ts(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Es(n){return n>0?1:n<0?-1:0}function Qd(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&oh(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function kr(n,e){return xt(n.prev,n,n.next)<0?xt(n,e,n.next)>=0&&xt(n,n.prev,e)>=0:xt(n,e,n.prev)<0||xt(n,n.next,e)<0}function eu(n,e){let t=n,i=!1,r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function ah(n,e){let t=Ba(n.i,n.x,n.y),i=Ba(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function oc(n,e,t,i){let r=Ba(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function Or(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Ba(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function tu(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}var za=class{static triangulate(e,t,i=2){return Bd(e,t,i)}},gi=class n{static area(e){let t=e.length,i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],r=[],s=[];ac(e),lc(i,e);let o=e.length;t.forEach(ac);for(let c=0;c<t.length;c++)r.push(o),o+=t[c].length,lc(i,t[c]);let a=za.triangulate(i,r);for(let c=0;c<a.length;c+=3)s.push(a.slice(c,c+3));return s}};function ac(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function lc(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var Zn=class n extends Pt{constructor(e=new Di([new me(.5,.5),new me(-.5,.5),new me(-.5,-.5),new me(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,r=[],s=[];for(let a=0,c=e.length;a<c;a++){let l=e[a];o(l)}this.setAttribute("position",new lt(r,3)),this.setAttribute("uv",new lt(s,2)),this.computeVertexNormals();function o(a){let c=[],l=t.curveSegments!==void 0?t.curveSegments:12,d=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,p=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,w=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,u=t.extrudePath,R=t.UVGenerator!==void 0?t.UVGenerator:iu,T,M=!1,F,E,U,I;u&&(T=u.getSpacedPoints(d),M=!0,p=!1,F=u.computeFrenetFrames(d,!1),E=new N,U=new N,I=new N),p||(m=0,f=0,g=0,w=0);let y=a.extractPoints(l),x=y.shape,C=y.holes;if(!gi.isClockWise(x)){x=x.reverse();for(let ue=0,ce=C.length;ue<ce;ue++){let le=C[ue];gi.isClockWise(le)&&(C[ue]=le.reverse())}}function X(ue){let le=10000000000000001e-36,oe=ue[0];for(let xe=1;xe<=ue.length;xe++){let pe=xe%ue.length,ve=ue[pe],Ve=ve.x-oe.x,ke=ve.y-oe.y,A=Ve*Ve+ke*ke,v=Math.max(Math.abs(ve.x),Math.abs(ve.y),Math.abs(oe.x),Math.abs(oe.y)),Y=le*v*v;if(A<=Y){ue.splice(pe,1),xe--;continue}oe=ve}}X(x),C.forEach(X);let G=C.length,K=x;for(let ue=0;ue<G;ue++){let ce=C[ue];x=x.concat(ce)}function j(ue,ce,le){return ce||console.error("THREE.ExtrudeGeometry: vec does not exist"),ue.clone().addScaledVector(ce,le)}let he=x.length;function ee(ue,ce,le){let oe,xe,pe,ve=ue.x-ce.x,Ve=ue.y-ce.y,ke=le.x-ue.x,A=le.y-ue.y,v=ve*ve+Ve*Ve,Y=ve*A-Ve*ke;if(Math.abs(Y)>Number.EPSILON){let ne=Math.sqrt(v),de=Math.sqrt(ke*ke+A*A),re=ce.x-Ve/ne,Ie=ce.y+ve/ne,ge=le.x-A/de,we=le.y+ke/de,De=((ge-re)*A-(we-Ie)*ke)/(ve*A-Ve*ke);oe=re+ve*De-ue.x,xe=Ie+Ve*De-ue.y;let fe=oe*oe+xe*xe;if(fe<=2)return new me(oe,xe);pe=Math.sqrt(fe/2)}else{let ne=!1;ve>Number.EPSILON?ke>Number.EPSILON&&(ne=!0):ve<-Number.EPSILON?ke<-Number.EPSILON&&(ne=!0):Math.sign(Ve)===Math.sign(A)&&(ne=!0),ne?(oe=-Ve,xe=ve,pe=Math.sqrt(v)):(oe=ve,xe=Ve,pe=Math.sqrt(v/2))}return new me(oe/pe,xe/pe)}let ye=[];for(let ue=0,ce=K.length,le=ce-1,oe=ue+1;ue<ce;ue++,le++,oe++)le===ce&&(le=0),oe===ce&&(oe=0),ye[ue]=ee(K[ue],K[le],K[oe]);let Se=[],Ee,Ge=ye.concat();for(let ue=0,ce=G;ue<ce;ue++){let le=C[ue];Ee=[];for(let oe=0,xe=le.length,pe=xe-1,ve=oe+1;oe<xe;oe++,pe++,ve++)pe===xe&&(pe=0),ve===xe&&(ve=0),Ee[oe]=ee(le[oe],le[pe],le[ve]);Se.push(Ee),Ge=Ge.concat(Ee)}let $e;if(m===0)$e=gi.triangulateShape(K,C);else{let ue=[],ce=[];for(let le=0;le<m;le++){let oe=le/m,xe=f*Math.cos(oe*Math.PI/2),pe=g*Math.sin(oe*Math.PI/2)+w;for(let ve=0,Ve=K.length;ve<Ve;ve++){let ke=j(K[ve],ye[ve],pe);Ne(ke.x,ke.y,-xe),oe===0&&ue.push(ke)}for(let ve=0,Ve=G;ve<Ve;ve++){let ke=C[ve];Ee=Se[ve];let A=[];for(let v=0,Y=ke.length;v<Y;v++){let ne=j(ke[v],Ee[v],pe);Ne(ne.x,ne.y,-xe),oe===0&&A.push(ne)}oe===0&&ce.push(A)}}$e=gi.triangulateShape(ue,ce)}let it=$e.length,Ze=g+w;for(let ue=0;ue<he;ue++){let ce=p?j(x[ue],Ge[ue],Ze):x[ue];M?(U.copy(F.normals[0]).multiplyScalar(ce.x),E.copy(F.binormals[0]).multiplyScalar(ce.y),I.copy(T[0]).add(U).add(E),Ne(I.x,I.y,I.z)):Ne(ce.x,ce.y,0)}for(let ue=1;ue<=d;ue++)for(let ce=0;ce<he;ce++){let le=p?j(x[ce],Ge[ce],Ze):x[ce];M?(U.copy(F.normals[ue]).multiplyScalar(le.x),E.copy(F.binormals[ue]).multiplyScalar(le.y),I.copy(T[ue]).add(U).add(E),Ne(I.x,I.y,I.z)):Ne(le.x,le.y,h/d*ue)}for(let ue=m-1;ue>=0;ue--){let ce=ue/m,le=f*Math.cos(ce*Math.PI/2),oe=g*Math.sin(ce*Math.PI/2)+w;for(let xe=0,pe=K.length;xe<pe;xe++){let ve=j(K[xe],ye[xe],oe);Ne(ve.x,ve.y,h+le)}for(let xe=0,pe=C.length;xe<pe;xe++){let ve=C[xe];Ee=Se[xe];for(let Ve=0,ke=ve.length;Ve<ke;Ve++){let A=j(ve[Ve],Ee[Ve],oe);M?Ne(A.x,A.y+T[d-1].y,T[d-1].x+le):Ne(A.x,A.y,h+le)}}}ae(),se();function ae(){let ue=r.length/3;if(p){let ce=0,le=he*ce;for(let oe=0;oe<it;oe++){let xe=$e[oe];Pe(xe[2]+le,xe[1]+le,xe[0]+le)}ce=d+m*2,le=he*ce;for(let oe=0;oe<it;oe++){let xe=$e[oe];Pe(xe[0]+le,xe[1]+le,xe[2]+le)}}else{for(let ce=0;ce<it;ce++){let le=$e[ce];Pe(le[2],le[1],le[0])}for(let ce=0;ce<it;ce++){let le=$e[ce];Pe(le[0]+he*d,le[1]+he*d,le[2]+he*d)}}i.addGroup(ue,r.length/3-ue,0)}function se(){let ue=r.length/3,ce=0;Ce(K,ce),ce+=K.length;for(let le=0,oe=C.length;le<oe;le++){let xe=C[le];Ce(xe,ce),ce+=xe.length}i.addGroup(ue,r.length/3-ue,1)}function Ce(ue,ce){let le=ue.length;for(;--le>=0;){let oe=le,xe=le-1;xe<0&&(xe=ue.length-1);for(let pe=0,ve=d+m*2;pe<ve;pe++){let Ve=he*pe,ke=he*(pe+1),A=ce+oe+Ve,v=ce+xe+Ve,Y=ce+xe+ke,ne=ce+oe+ke;qe(A,v,Y,ne)}}}function Ne(ue,ce,le){c.push(ue),c.push(ce),c.push(le)}function Pe(ue,ce,le){st(ue),st(ce),st(le);let oe=r.length/3,xe=R.generateTopUV(i,r,oe-3,oe-2,oe-1);D(xe[0]),D(xe[1]),D(xe[2])}function qe(ue,ce,le,oe){st(ue),st(ce),st(oe),st(ce),st(le),st(oe);let xe=r.length/3,pe=R.generateSideWallUV(i,r,xe-6,xe-3,xe-2,xe-1);D(pe[0]),D(pe[1]),D(pe[3]),D(pe[1]),D(pe[2]),D(pe[3])}function st(ue){r.push(c[ue*3+0]),r.push(c[ue*3+1]),r.push(c[ue*3+2])}function D(ue){s.push(ue.x),s.push(ue.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return nu(t,i,e)}static fromJSON(e,t){let i=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];i.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new ka[r.type]().fromJSON(r)),new n(i,e.options)}},iu={generateTopUV:function(n,e,t,i,r){let s=e[t*3],o=e[t*3+1],a=e[i*3],c=e[i*3+1],l=e[r*3],d=e[r*3+1];return[new me(s,o),new me(a,c),new me(l,d)]},generateSideWallUV:function(n,e,t,i,r,s){let o=e[t*3],a=e[t*3+1],c=e[t*3+2],l=e[i*3],d=e[i*3+1],h=e[i*3+2],p=e[r*3],f=e[r*3+1],g=e[r*3+2],w=e[s*3],m=e[s*3+1],u=e[s*3+2];return Math.abs(a-d)<Math.abs(o-l)?[new me(o,1-c),new me(l,1-h),new me(p,1-g),new me(w,1-u)]:[new me(a,1-c),new me(d,1-h),new me(f,1-g),new me(m,1-u)]}};function nu(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,r=n.length;i<r;i++){let s=n[i];t.shapes.push(s.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Br=class n extends Pt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(i),c=Math.floor(r),l=a+1,d=c+1,h=e/a,p=t/c,f=[],g=[],w=[],m=[];for(let u=0;u<d;u++){let R=u*p-o;for(let T=0;T<l;T++){let M=T*h-s;g.push(M,-R,0),w.push(0,0,1),m.push(T/a),m.push(1-u/c)}}for(let u=0;u<c;u++)for(let R=0;R<a;R++){let T=R+l*u,M=R+l*(u+1),F=R+1+l*(u+1),E=R+1+l*u;f.push(T,M,E),f.push(M,F,E)}this.setIndex(f),this.setAttribute("position",new lt(g,3)),this.setAttribute("normal",new lt(w,3)),this.setAttribute("uv",new lt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}};var zr=class n extends Pt{constructor(e=new Di([new me(0,.5),new me(-.5,-.5),new me(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],r=[],s=[],o=[],a=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let d=0;d<e.length;d++)l(e[d]),this.addGroup(a,c,d),a+=c,c=0;this.setIndex(i),this.setAttribute("position",new lt(r,3)),this.setAttribute("normal",new lt(s,3)),this.setAttribute("uv",new lt(o,2));function l(d){let h=r.length/3,p=d.extractPoints(t),f=p.shape,g=p.holes;gi.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,u=g.length;m<u;m++){let R=g[m];gi.isClockWise(R)===!0&&(g[m]=R.reverse())}let w=gi.triangulateShape(f,g);for(let m=0,u=g.length;m<u;m++){let R=g[m];f=f.concat(R)}for(let m=0,u=f.length;m<u;m++){let R=f[m];r.push(R.x,R.y,0),s.push(0,0,1),o.push(R.x,R.y)}for(let m=0,u=w.length;m<u;m++){let R=w[m],T=R[0]+h,M=R[1]+h,F=R[2]+h;i.push(T,M,F),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return ru(t,e)}static fromJSON(e,t){let i=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];i.push(o)}return new n(i,e.curveSegments)}};function ru(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}var Jn=class n extends Pt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(o+a,Math.PI),l=0,d=[],h=new N,p=new N,f=[],g=[],w=[],m=[];for(let u=0;u<=i;u++){let R=[],T=u/i,M=0;u===0&&o===0?M=.5/t:u===i&&c===Math.PI&&(M=-.5/t);for(let F=0;F<=t;F++){let E=F/t;h.x=-e*Math.cos(r+E*s)*Math.sin(o+T*a),h.y=e*Math.cos(o+T*a),h.z=e*Math.sin(r+E*s)*Math.sin(o+T*a),g.push(h.x,h.y,h.z),p.copy(h).normalize(),w.push(p.x,p.y,p.z),m.push(E+M,1-T),R.push(l++)}d.push(R)}for(let u=0;u<i;u++)for(let R=0;R<t;R++){let T=d[u][R+1],M=d[u][R],F=d[u+1][R],E=d[u+1][R+1];(u!==0||o>0)&&f.push(T,M,E),(u!==i-1||c<Math.PI)&&f.push(M,F,E)}this.setIndex(f),this.setAttribute("position",new lt(g,3)),this.setAttribute("normal",new lt(w,3)),this.setAttribute("uv",new lt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Vr=class n extends Pt{constructor(e=1,t=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);let o=[],a=[],c=[],l=[],d=new N,h=new N,p=new N;for(let f=0;f<=i;f++)for(let g=0;g<=r;g++){let w=g/r*s,m=f/i*Math.PI*2;h.x=(e+t*Math.cos(m))*Math.cos(w),h.y=(e+t*Math.cos(m))*Math.sin(w),h.z=t*Math.sin(m),a.push(h.x,h.y,h.z),d.x=e*Math.cos(w),d.y=e*Math.sin(w),p.subVectors(h,d).normalize(),c.push(p.x,p.y,p.z),l.push(g/r),l.push(f/i)}for(let f=1;f<=i;f++)for(let g=1;g<=r;g++){let w=(r+1)*f+g-1,m=(r+1)*(f-1)+g-1,u=(r+1)*(f-1)+g,R=(r+1)*f+g;o.push(w,m,R),o.push(m,u,R)}this.setIndex(o),this.setAttribute("position",new lt(a,3)),this.setAttribute("normal",new lt(c,3)),this.setAttribute("uv",new lt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Gr=class extends Ii{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ye(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=al,this.normalScale=new me(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Zs=class extends Ii{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Wc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Js=class extends Ii{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};var Hr=class extends Yi{constructor(e){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}};function As(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function su(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var un=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],s=t[i-1];i:{e:{let o;t:{n:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(i=2,s=a);for(let c=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(r=s,s=t[--i-1],e>=s)break e}o=i,i=0;break t}break i}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Ks=class extends un{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Da,endingEnd:Da}}intervalChanged_(e,t,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],c=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case La:s=e,a=2*t-i;break;case Ua:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case La:o=e,c=2*i-t;break;case Ua:o=1,c=i+r[1]-r[0];break;default:o=e-1,c=t}let l=(i-t)*.5,d=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-i),this._offsetPrev=s*d,this._offsetNext=o*d}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,d=this._offsetPrev,h=this._offsetNext,p=this._weightPrev,f=this._weightNext,g=(i-t)/(r-t),w=g*g,m=w*g,u=-p*m+2*p*w-p*g,R=(1+p)*m+(-1.5-2*p)*w+(-.5+p)*g+1,T=(-1-f)*m+(1.5+f)*w+.5*g,M=f*m-f*w;for(let F=0;F!==a;++F)s[F]=u*o[d+F]+R*o[l+F]+T*o[c+F]+M*o[h+F];return s}},$s=class extends un{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,d=(i-t)/(r-t),h=1-d;for(let p=0;p!==a;++p)s[p]=o[l+p]*h+o[c+p]*d;return s}},js=class extends un{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},ri=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=As(t,this.TimeBufferType),this.values=As(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:As(e.times,Array),values:As(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new js(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new $s(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ks(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case gr:t=this.InterpolantFactoryMethodDiscrete;break;case Ls:t=this.InterpolantFactoryMethodLinear;break;case Rs:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return gr;case this.InterpolantFactoryMethodLinear:return Ls;case this.InterpolantFactoryMethodSmooth:return Rs}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let c=i[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(r!==void 0&&su(r))for(let a=0,c=r.length;a!==c;++a){let l=r[a];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===Rs,s=e.length-1,o=1;for(let a=1;a<s;++a){let c=!1,l=e[a],d=e[a+1];if(l!==d&&(a!==1||l!==e[0]))if(r)c=!0;else{let h=a*i,p=h-i,f=h+i;for(let g=0;g!==i;++g){let w=t[h+g];if(w!==t[p+g]||w!==t[f+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let h=a*i,p=o*i;for(let f=0;f!==i;++f)t[p+f]=t[h+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,c=o*i,l=0;l!==i;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};ri.prototype.ValueTypeName="";ri.prototype.TimeBufferType=Float32Array;ri.prototype.ValueBufferType=Float32Array;ri.prototype.DefaultInterpolation=Ls;var Zi=class extends ri{constructor(e,t,i){super(e,t,i)}};Zi.prototype.ValueTypeName="bool";Zi.prototype.ValueBufferType=Array;Zi.prototype.DefaultInterpolation=gr;Zi.prototype.InterpolantFactoryMethodLinear=void 0;Zi.prototype.InterpolantFactoryMethodSmooth=void 0;var Qs=class extends ri{constructor(e,t,i,r){super(e,t,i,r)}};Qs.prototype.ValueTypeName="color";var eo=class extends ri{constructor(e,t,i,r){super(e,t,i,r)}};eo.prototype.ValueTypeName="number";var to=class extends un{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(i-t)/(r-t),l=e*a;for(let d=l+a;l!==d;l+=4)li.slerpFlat(s,0,o,l-a,o,l,c);return s}},Wr=class extends ri{constructor(e,t,i,r){super(e,t,i,r)}InterpolantFactoryMethodLinear(e){return new to(this.times,this.values,this.getValueSize(),e)}};Wr.prototype.ValueTypeName="quaternion";Wr.prototype.InterpolantFactoryMethodSmooth=void 0;var Ji=class extends ri{constructor(e,t,i){super(e,t,i)}};Ji.prototype.ValueTypeName="string";Ji.prototype.ValueBufferType=Array;Ji.prototype.DefaultInterpolation=gr;Ji.prototype.InterpolantFactoryMethodLinear=void 0;Ji.prototype.InterpolantFactoryMethodSmooth=void 0;var io=class extends ri{constructor(e,t,i,r){super(e,t,i,r)}};io.prototype.ValueTypeName="vector";var no=class{constructor(e,t,i){let r=this,s=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.abortController=new AbortController,this.itemStart=function(d){a++,s===!1&&r.onStart!==void 0&&r.onStart(d,o,a),s=!0},this.itemEnd=function(d){o++,r.onProgress!==void 0&&r.onProgress(d,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(d){r.onError!==void 0&&r.onError(d)},this.resolveURL=function(d){return c?c(d):d},this.setURLModifier=function(d){return c=d,this},this.addHandler=function(d,h){return l.push(d,h),this},this.removeHandler=function(d){let h=l.indexOf(d);return h!==-1&&l.splice(h,2),this},this.getHandler=function(d){for(let h=0,p=l.length;h<p;h+=2){let f=l[h],g=l[h+1];if(f.global&&(f.lastIndex=0),f.test(d))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},lh=new no,ro=class{constructor(e){this.manager=e!==void 0?e:lh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ro.DEFAULT_MATERIAL_NAME="__DEFAULT";var Xr=class extends Ut{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ye(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},qr=class extends Xr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ye(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Ia=new _t,cc=new N,hc=new N,Va=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new me(512,512),this.mapType=_i,this.map=null,this.mapPass=null,this.matrix=new _t,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Wn,this._frameExtents=new me(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;cc.setFromMatrixPosition(e.matrixWorld),t.position.copy(cc),hc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(hc),t.updateMatrixWorld(),Ia.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ia,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Ia)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Yr=class extends Tr{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+t,c=r-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,o=s+l*this.view.width,a-=d*this.view.offsetY,c=a-d*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ga=class extends Va{constructor(){super(new Yr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Zr=class extends Xr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.shadow=new Ga}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var so=class extends kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var pl="\\[\\]\\.:\\/",ou=new RegExp("["+pl+"]","g"),ml="[^"+pl+"]",au="[^"+pl.replace("\\.","")+"]",lu=/((?:WC+[\/:])*)/.source.replace("WC",ml),cu=/(WCOD+)?/.source.replace("WCOD",au),hu=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ml),du=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ml),uu=new RegExp("^"+lu+cu+hu+du+"$"),fu=["material","materials","bones","map"],Ha=class{constructor(e,t,i){let r=i||mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},mt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(ou,"")}static parseTrackName(e){let t=uu.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);fu.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let c=i(a.children);if(c)return c}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===l){l=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let o=e[r];if(o===void 0){let l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};mt.Composite=Ha;mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};mt.prototype.GetterByBindingType=[mt.prototype._getValue_direct,mt.prototype._getValue_array,mt.prototype._getValue_arrayElement,mt.prototype._getValue_toArray];mt.prototype.SetterByBindingTypeAndVersioning=[[mt.prototype._setValue_direct,mt.prototype._setValue_direct_setNeedsUpdate,mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_array,mt.prototype._setValue_array_setNeedsUpdate,mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_arrayElement,mt.prototype._setValue_arrayElement_setNeedsUpdate,mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_fromArray,mt.prototype._setValue_fromArray_setNeedsUpdate,mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var a1=new Float32Array(1);var dc=new _t,Jr=class{constructor(e,t,i=0,r=1/0){this.ray=new qi(e,t),this.near=i,this.far=r,this.camera=null,this.layers=new Gn,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return dc.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(dc),this}intersectObject(e,t=!0,i=[]){return Wa(e,this,i,t),i.sort(uc),i}intersectObjects(e,t=!0,i=[]){for(let r=0,s=e.length;r<s;r++)Wa(e[r],this,i,t);return i.sort(uc),i}};function uc(n,e){return n.distance-e.distance}function Wa(n,e,t,i){let r=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(r=!1),r===!0&&i===!0){let s=n.children;for(let o=0,a=s.length;o<a;o++)Wa(s[o],e,t,!0)}}var Kn=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=We(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(We(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Cs=new ii,Kr=class extends Vs{constructor(e,t=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),r=new Float32Array(24),s=new Pt;s.setIndex(new Gt(i,1)),s.setAttribute("position",new Gt(r,3)),super(s,new Yi({color:t,toneMapped:!1})),this.object=e,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(){if(this.object!==void 0&&Cs.setFromObject(this.object),Cs.isEmpty())return;let e=Cs.min,t=Cs.max,i=this.geometry.attributes.position,r=i.array;r[0]=t.x,r[1]=t.y,r[2]=t.z,r[3]=e.x,r[4]=t.y,r[5]=t.z,r[6]=e.x,r[7]=e.y,r[8]=t.z,r[9]=t.x,r[10]=e.y,r[11]=t.z,r[12]=t.x,r[13]=t.y,r[14]=e.z,r[15]=e.x,r[16]=t.y,r[17]=e.z,r[18]=e.x,r[19]=e.y,r[20]=e.z,r[21]=t.x,r[22]=e.y,r[23]=e.z,i.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}copy(e,t){return super.copy(e,t),this.object=e.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}};var $r=class extends yi{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function _l(n,e,t,i){let r=pu(i);switch(t){case nl:return n*e;case sl:return n*e/r.components*r.byteLength;case vo:return n*e/r.components*r.byteLength;case ol:return n*e*2/r.components*r.byteLength;case wo:return n*e*2/r.components*r.byteLength;case rl:return n*e*3/r.components*r.byteLength;case Jt:return n*e*4/r.components*r.byteLength;case Mo:return n*e*4/r.components*r.byteLength;case es:case ts:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case is:case ns:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case So:case Eo:return Math.max(n,16)*Math.max(e,8)/4;case bo:case To:return Math.max(n,8)*Math.max(e,8)/2;case Ao:case Co:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Ro:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Po:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Io:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Do:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Lo:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Uo:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case No:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Fo:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case ko:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Oo:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Bo:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case zo:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Vo:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Go:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Ho:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Wo:case Xo:case qo:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Yo:case Zo:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Jo:case Ko:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function pu(n){switch(n){case _i:case Qa:return{byteLength:1,components:1};case $n:case el:case jn:return{byteLength:2,components:1};case yo:case xo:return{byteLength:2,components:4};case Qi:case go:case Mi:return{byteLength:4,components:1};case tl:case il:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function Dh(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function _u(n){let e=new WeakMap;function t(a,c){let l=a.array,d=a.usage,h=l.byteLength,p=n.createBuffer();n.bindBuffer(c,p),n.bufferData(c,l,d),a.onUploadCallback();let f;if(l instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=n.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=n.SHORT;else if(l instanceof Uint32Array)f=n.UNSIGNED_INT;else if(l instanceof Int32Array)f=n.INT;else if(l instanceof Int8Array)f=n.BYTE;else if(l instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:p,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,c,l){let d=c.array,h=c.updateRanges;if(n.bindBuffer(l,a),h.length===0)n.bufferSubData(l,0,d);else{h.sort((f,g)=>f.start-g.start);let p=0;for(let f=1;f<h.length;f++){let g=h[p],w=h[f];w.start<=g.start+g.count+1?g.count=Math.max(g.count,w.start+w.count-g.start):(++p,h[p]=w)}h.length=p+1;for(let f=0,g=h.length;f<g;f++){let w=h[f];n.bufferSubData(l,w.start*d.BYTES_PER_ELEMENT,d,w.start,w.count)}c.clearUpdateRanges()}c.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(n.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let d=e.get(a);(!d||d.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:r,remove:s,update:o}}var gu=`#ifdef USE_ALPHAHASH
  if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,yu=`#ifdef USE_ALPHAHASH
  const float ALPHA_HASH_SCALE = 0.05;
  float hash2D( vec2 value ) {
    return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
  }
  float hash3D( vec3 value ) {
    return hash2D( vec2( hash2D( value.xy ), value.z ) );
  }
  float getAlphaHashThreshold( vec3 position ) {
    float maxDeriv = max(
      length( dFdx( position.xyz ) ),
      length( dFdy( position.xyz ) )
    );
    float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
    vec2 pixScales = vec2(
      exp2( floor( log2( pixScale ) ) ),
      exp2( ceil( log2( pixScale ) ) )
    );
    vec2 alpha = vec2(
      hash3D( floor( pixScales.x * position.xyz ) ),
      hash3D( floor( pixScales.y * position.xyz ) )
    );
    float lerpFactor = fract( log2( pixScale ) );
    float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
    float a = min( lerpFactor, 1.0 - lerpFactor );
    vec3 cases = vec3(
      x * x / ( 2.0 * a * ( 1.0 - a ) ),
      ( x - 0.5 * a ) / ( 1.0 - a ),
      1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
    );
    float threshold = ( x < ( 1.0 - a ) )
      ? ( ( x < a ) ? cases.x : cases.y )
      : cases.z;
    return clamp( threshold , 1.0e-6, 1.0 );
  }
#endif`,xu=`#ifdef USE_ALPHAMAP
  diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,vu=`#ifdef USE_ALPHAMAP
  uniform sampler2D alphaMap;
#endif`,wu=`#ifdef USE_ALPHATEST
  #ifdef ALPHA_TO_COVERAGE
  diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
  if ( diffuseColor.a == 0.0 ) discard;
  #else
  if ( diffuseColor.a < alphaTest ) discard;
  #endif
#endif`,Mu=`#ifdef USE_ALPHATEST
  uniform float alphaTest;
#endif`,bu=`#ifdef USE_AOMAP
  float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
  reflectedLight.indirectDiffuse *= ambientOcclusion;
  #if defined( USE_CLEARCOAT )
    clearcoatSpecularIndirect *= ambientOcclusion;
  #endif
  #if defined( USE_SHEEN )
    sheenSpecularIndirect *= ambientOcclusion;
  #endif
  #if defined( USE_ENVMAP ) && defined( STANDARD )
    float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
    reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
  #endif
#endif`,Su=`#ifdef USE_AOMAP
  uniform sampler2D aoMap;
  uniform float aoMapIntensity;
#endif`,Tu=`#ifdef USE_BATCHING
  #if ! defined( GL_ANGLE_multi_draw )
  #define gl_DrawID _gl_DrawID
  uniform int _gl_DrawID;
  #endif
  uniform highp sampler2D batchingTexture;
  uniform highp usampler2D batchingIdTexture;
  mat4 getBatchingMatrix( const in float i ) {
    int size = textureSize( batchingTexture, 0 ).x;
    int j = int( i ) * 4;
    int x = j % size;
    int y = j / size;
    vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
    vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
    vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
    vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
    return mat4( v1, v2, v3, v4 );
  }
  float getIndirectIndex( const in int i ) {
    int size = textureSize( batchingIdTexture, 0 ).x;
    int x = i % size;
    int y = i / size;
    return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
  }
#endif
#ifdef USE_BATCHING_COLOR
  uniform sampler2D batchingColorTexture;
  vec3 getBatchingColor( const in float i ) {
    int size = textureSize( batchingColorTexture, 0 ).x;
    int j = int( i );
    int x = j % size;
    int y = j / size;
    return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
  }
#endif`,Eu=`#ifdef USE_BATCHING
  mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Au=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
  vPosition = vec3( position );
#endif`,Cu=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
  vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ru=`float G_BlinnPhong_Implicit( ) {
  return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
  return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
  vec3 halfDir = normalize( lightDir + viewDir );
  float dotNH = saturate( dot( normal, halfDir ) );
  float dotVH = saturate( dot( viewDir, halfDir ) );
  vec3 F = F_Schlick( specularColor, 1.0, dotVH );
  float G = G_BlinnPhong_Implicit( );
  float D = D_BlinnPhong( shininess, dotNH );
  return F * ( G * D );
} // validated`,Pu=`#ifdef USE_IRIDESCENCE
  const mat3 XYZ_TO_REC709 = mat3(
     3.2404542, -0.9692660,  0.0556434,
    -1.5371385,  1.8760108, -0.2040259,
    -0.4985314,  0.0415560,  1.0572252
  );
  vec3 Fresnel0ToIor( vec3 fresnel0 ) {
    vec3 sqrtF0 = sqrt( fresnel0 );
    return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
  }
  vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
    return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
  }
  float IorToFresnel0( float transmittedIor, float incidentIor ) {
    return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
  }
  vec3 evalSensitivity( float OPD, vec3 shift ) {
    float phase = 2.0 * PI * OPD * 1.0e-9;
    vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
    vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
    vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
    vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
    xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
    xyz /= 1.0685e-7;
    vec3 rgb = XYZ_TO_REC709 * xyz;
    return rgb;
  }
  vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
    vec3 I;
    float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
    float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
    float cosTheta2Sq = 1.0 - sinTheta2Sq;
    if ( cosTheta2Sq < 0.0 ) {
      return vec3( 1.0 );
    }
    float cosTheta2 = sqrt( cosTheta2Sq );
    float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
    float R12 = F_Schlick( R0, 1.0, cosTheta1 );
    float T121 = 1.0 - R12;
    float phi12 = 0.0;
    if ( iridescenceIOR < outsideIOR ) phi12 = PI;
    float phi21 = PI - phi12;
    vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
    vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
    vec3 phi23 = vec3( 0.0 );
    if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
    if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
    if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
    float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
    vec3 phi = vec3( phi21 ) + phi23;
    vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
    vec3 r123 = sqrt( R123 );
    vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
    vec3 C0 = R12 + Rs;
    I = C0;
    vec3 Cm = Rs - T121;
    for ( int m = 1; m <= 2; ++ m ) {
      Cm *= r123;
      vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
      I += Cm * Sm;
    }
    return max( I, vec3( 0.0 ) );
  }
#endif`,Iu=`#ifdef USE_BUMPMAP
  uniform sampler2D bumpMap;
  uniform float bumpScale;
  vec2 dHdxy_fwd() {
    vec2 dSTdx = dFdx( vBumpMapUv );
    vec2 dSTdy = dFdy( vBumpMapUv );
    float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
    float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
    float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
    return vec2( dBx, dBy );
  }
  vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
    vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
    vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
    vec3 vN = surf_norm;
    vec3 R1 = cross( vSigmaY, vN );
    vec3 R2 = cross( vN, vSigmaX );
    float fDet = dot( vSigmaX, R1 ) * faceDirection;
    vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
    return normalize( abs( fDet ) * surf_norm - vGrad );
  }
#endif`,Du=`#if NUM_CLIPPING_PLANES > 0
  vec4 plane;
  #ifdef ALPHA_TO_COVERAGE
    float distanceToPlane, distanceGradient;
    float clipOpacity = 1.0;
    #pragma unroll_loop_start
    for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
      plane = clippingPlanes[ i ];
      distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
      distanceGradient = fwidth( distanceToPlane ) / 2.0;
      clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
      if ( clipOpacity == 0.0 ) discard;
    }
    #pragma unroll_loop_end
    #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
      float unionClipOpacity = 1.0;
      #pragma unroll_loop_start
      for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
        plane = clippingPlanes[ i ];
        distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
        distanceGradient = fwidth( distanceToPlane ) / 2.0;
        unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
      }
      #pragma unroll_loop_end
      clipOpacity *= 1.0 - unionClipOpacity;
    #endif
    diffuseColor.a *= clipOpacity;
    if ( diffuseColor.a == 0.0 ) discard;
  #else
    #pragma unroll_loop_start
    for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
      plane = clippingPlanes[ i ];
      if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
    }
    #pragma unroll_loop_end
    #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
      bool clipped = true;
      #pragma unroll_loop_start
      for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
        plane = clippingPlanes[ i ];
        clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
      }
      #pragma unroll_loop_end
      if ( clipped ) discard;
    #endif
  #endif
#endif`,Lu=`#if NUM_CLIPPING_PLANES > 0
  varying vec3 vClipPosition;
  uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Uu=`#if NUM_CLIPPING_PLANES > 0
  varying vec3 vClipPosition;
#endif`,Nu=`#if NUM_CLIPPING_PLANES > 0
  vClipPosition = - mvPosition.xyz;
#endif`,Fu=`#if defined( USE_COLOR_ALPHA )
  diffuseColor *= vColor;
#elif defined( USE_COLOR )
  diffuseColor.rgb *= vColor;
#endif`,ku=`#if defined( USE_COLOR_ALPHA )
  varying vec4 vColor;
#elif defined( USE_COLOR )
  varying vec3 vColor;
#endif`,Ou=`#if defined( USE_COLOR_ALPHA )
  varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
  varying vec3 vColor;
#endif`,Bu=`#if defined( USE_COLOR_ALPHA )
  vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
  vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
  vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
  vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
  vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
  vColor.xyz *= batchingColor.xyz;
#endif`,zu=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
  return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
  float precisionSafeLength( vec3 v ) { return length( v ); }
#else
  float precisionSafeLength( vec3 v ) {
    float maxComponent = max3( abs( v ) );
    return length( v / maxComponent ) * maxComponent;
  }
#endif
struct IncidentLight {
  vec3 color;
  vec3 direction;
  bool visible;
};
struct ReflectedLight {
  vec3 directDiffuse;
  vec3 directSpecular;
  vec3 indirectDiffuse;
  vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
  varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
  mat3 tmp;
  tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
  tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
  tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
  return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
  return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
  float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
  float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
  return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
  return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
  float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
  return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
  float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
  return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Vu=`#ifdef ENVMAP_TYPE_CUBE_UV
  #define cubeUV_minMipLevel 4.0
  #define cubeUV_minTileSize 16.0
  float getFace( vec3 direction ) {
    vec3 absDirection = abs( direction );
    float face = - 1.0;
    if ( absDirection.x > absDirection.z ) {
      if ( absDirection.x > absDirection.y )
        face = direction.x > 0.0 ? 0.0 : 3.0;
      else
        face = direction.y > 0.0 ? 1.0 : 4.0;
    } else {
      if ( absDirection.z > absDirection.y )
        face = direction.z > 0.0 ? 2.0 : 5.0;
      else
        face = direction.y > 0.0 ? 1.0 : 4.0;
    }
    return face;
  }
  vec2 getUV( vec3 direction, float face ) {
    vec2 uv;
    if ( face == 0.0 ) {
      uv = vec2( direction.z, direction.y ) / abs( direction.x );
    } else if ( face == 1.0 ) {
      uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
    } else if ( face == 2.0 ) {
      uv = vec2( - direction.x, direction.y ) / abs( direction.z );
    } else if ( face == 3.0 ) {
      uv = vec2( - direction.z, direction.y ) / abs( direction.x );
    } else if ( face == 4.0 ) {
      uv = vec2( - direction.x, direction.z ) / abs( direction.y );
    } else {
      uv = vec2( direction.x, direction.y ) / abs( direction.z );
    }
    return 0.5 * ( uv + 1.0 );
  }
  vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
    float face = getFace( direction );
    float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
    mipInt = max( mipInt, cubeUV_minMipLevel );
    float faceSize = exp2( mipInt );
    highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
    if ( face > 2.0 ) {
      uv.y += faceSize;
      face -= 3.0;
    }
    uv.x += face * faceSize;
    uv.x += filterInt * 3.0 * cubeUV_minTileSize;
    uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
    uv.x *= CUBEUV_TEXEL_WIDTH;
    uv.y *= CUBEUV_TEXEL_HEIGHT;
    #ifdef texture2DGradEXT
      return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
    #else
      return texture2D( envMap, uv ).rgb;
    #endif
  }
  #define cubeUV_r0 1.0
  #define cubeUV_m0 - 2.0
  #define cubeUV_r1 0.8
  #define cubeUV_m1 - 1.0
  #define cubeUV_r4 0.4
  #define cubeUV_m4 2.0
  #define cubeUV_r5 0.305
  #define cubeUV_m5 3.0
  #define cubeUV_r6 0.21
  #define cubeUV_m6 4.0
  float roughnessToMip( float roughness ) {
    float mip = 0.0;
    if ( roughness >= cubeUV_r1 ) {
      mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
    } else if ( roughness >= cubeUV_r4 ) {
      mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
    } else if ( roughness >= cubeUV_r5 ) {
      mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
    } else if ( roughness >= cubeUV_r6 ) {
      mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
    } else {
      mip = - 2.0 * log2( 1.16 * roughness );		}
    return mip;
  }
  vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
    float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
    float mipF = fract( mip );
    float mipInt = floor( mip );
    vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
    if ( mipF == 0.0 ) {
      return vec4( color0, 1.0 );
    } else {
      vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
      return vec4( mix( color0, color1, mipF ), 1.0 );
    }
  }
#endif`,Gu=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
  vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
  mat3 bm = mat3( batchingMatrix );
  transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
  transformedNormal = bm * transformedNormal;
  #ifdef USE_TANGENT
    transformedTangent = bm * transformedTangent;
  #endif
#endif
#ifdef USE_INSTANCING
  mat3 im = mat3( instanceMatrix );
  transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
  transformedNormal = im * transformedNormal;
  #ifdef USE_TANGENT
    transformedTangent = im * transformedTangent;
  #endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
  transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
  transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
  #ifdef FLIP_SIDED
    transformedTangent = - transformedTangent;
  #endif
#endif`,Hu=`#ifdef USE_DISPLACEMENTMAP
  uniform sampler2D displacementMap;
  uniform float displacementScale;
  uniform float displacementBias;
#endif`,Wu=`#ifdef USE_DISPLACEMENTMAP
  transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Xu=`#ifdef USE_EMISSIVEMAP
  vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
  #ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
    emissiveColor = sRGBTransferEOTF( emissiveColor );
  #endif
  totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,qu=`#ifdef USE_EMISSIVEMAP
  uniform sampler2D emissiveMap;
#endif`,Yu="gl_FragColor = linearToOutputTexel( gl_FragColor );",Zu=`vec4 LinearTransferOETF( in vec4 value ) {
  return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
  return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
  return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ju=`#ifdef USE_ENVMAP
  #ifdef ENV_WORLDPOS
    vec3 cameraToFrag;
    if ( isOrthographic ) {
      cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
    } else {
      cameraToFrag = normalize( vWorldPosition - cameraPosition );
    }
    vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
    #ifdef ENVMAP_MODE_REFLECTION
      vec3 reflectVec = reflect( cameraToFrag, worldNormal );
    #else
      vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
    #endif
  #else
    vec3 reflectVec = vReflect;
  #endif
  #ifdef ENVMAP_TYPE_CUBE
    vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
  #else
    vec4 envColor = vec4( 0.0 );
  #endif
  #ifdef ENVMAP_BLENDING_MULTIPLY
    outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
  #elif defined( ENVMAP_BLENDING_MIX )
    outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
  #elif defined( ENVMAP_BLENDING_ADD )
    outgoingLight += envColor.xyz * specularStrength * reflectivity;
  #endif
#endif`,Ku=`#ifdef USE_ENVMAP
  uniform float envMapIntensity;
  uniform float flipEnvMap;
  uniform mat3 envMapRotation;
  #ifdef ENVMAP_TYPE_CUBE
    uniform samplerCube envMap;
  #else
    uniform sampler2D envMap;
  #endif

#endif`,$u=`#ifdef USE_ENVMAP
  uniform float reflectivity;
  #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
    #define ENV_WORLDPOS
  #endif
  #ifdef ENV_WORLDPOS
    varying vec3 vWorldPosition;
    uniform float refractionRatio;
  #else
    varying vec3 vReflect;
  #endif
#endif`,ju=`#ifdef USE_ENVMAP
  #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
    #define ENV_WORLDPOS
  #endif
  #ifdef ENV_WORLDPOS

    varying vec3 vWorldPosition;
  #else
    varying vec3 vReflect;
    uniform float refractionRatio;
  #endif
#endif`,Qu=`#ifdef USE_ENVMAP
  #ifdef ENV_WORLDPOS
    vWorldPosition = worldPosition.xyz;
  #else
    vec3 cameraToVertex;
    if ( isOrthographic ) {
      cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
    } else {
      cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
    }
    vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
    #ifdef ENVMAP_MODE_REFLECTION
      vReflect = reflect( cameraToVertex, worldNormal );
    #else
      vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
    #endif
  #endif
#endif`,ef=`#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
#endif`,tf=`#ifdef USE_FOG
  varying float vFogDepth;
#endif`,nf=`#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rf=`#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif`,sf=`#ifdef USE_GRADIENTMAP
  uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
  float dotNL = dot( normal, lightDirection );
  vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
  #ifdef USE_GRADIENTMAP
    return vec3( texture2D( gradientMap, coord ).r );
  #else
    vec2 fw = fwidth( coord ) * 0.5;
    return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
  #endif
}`,of=`#ifdef USE_LIGHTMAP
  uniform sampler2D lightMap;
  uniform float lightMapIntensity;
#endif`,af=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lf=`varying vec3 vViewPosition;
struct LambertMaterial {
  vec3 diffuseColor;
  float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
  uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
  float x = normal.x, y = normal.y, z = normal.z;
  vec3 result = shCoefficients[ 0 ] * 0.886227;
  result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
  result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
  result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
  result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
  result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
  result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
  result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
  result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
  return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
  vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
  vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
  return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
  vec3 irradiance = ambientLightColor;
  return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
  float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
  if ( cutoffDistance > 0.0 ) {
    distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
  }
  return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
  return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
  struct DirectionalLight {
    vec3 direction;
    vec3 color;
  };
  uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
  void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
    light.color = directionalLight.color;
    light.direction = directionalLight.direction;
    light.visible = true;
  }
#endif
#if NUM_POINT_LIGHTS > 0
  struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;
  };
  uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
  void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
    vec3 lVector = pointLight.position - geometryPosition;
    light.direction = normalize( lVector );
    float lightDistance = length( lVector );
    light.color = pointLight.color;
    light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
    light.visible = ( light.color != vec3( 0.0 ) );
  }
#endif
#if NUM_SPOT_LIGHTS > 0
  struct SpotLight {
    vec3 position;
    vec3 direction;
    vec3 color;
    float distance;
    float decay;
    float coneCos;
    float penumbraCos;
  };
  uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
  void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
    vec3 lVector = spotLight.position - geometryPosition;
    light.direction = normalize( lVector );
    float angleCos = dot( light.direction, spotLight.direction );
    float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
    if ( spotAttenuation > 0.0 ) {
      float lightDistance = length( lVector );
      light.color = spotLight.color * spotAttenuation;
      light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
      light.visible = ( light.color != vec3( 0.0 ) );
    } else {
      light.color = vec3( 0.0 );
      light.visible = false;
    }
  }
#endif
#if NUM_RECT_AREA_LIGHTS > 0
  struct RectAreaLight {
    vec3 color;
    vec3 position;
    vec3 halfWidth;
    vec3 halfHeight;
  };
  uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
  uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
  struct HemisphereLight {
    vec3 direction;
    vec3 skyColor;
    vec3 groundColor;
  };
  uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
  vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
    float dotNL = dot( normal, hemiLight.direction );
    float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
    vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
    return irradiance;
  }
#endif`,hf=`#ifdef USE_ENVMAP
  vec3 getIBLIrradiance( const in vec3 normal ) {
    #ifdef ENVMAP_TYPE_CUBE_UV
      vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
      vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
      return PI * envMapColor.rgb * envMapIntensity;
    #else
      return vec3( 0.0 );
    #endif
  }
  vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
    #ifdef ENVMAP_TYPE_CUBE_UV
      vec3 reflectVec = reflect( - viewDir, normal );
      reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
      reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
      vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
      return envMapColor.rgb * envMapIntensity;
    #else
      return vec3( 0.0 );
    #endif
  }
  #ifdef USE_ANISOTROPY
    vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
      #ifdef ENVMAP_TYPE_CUBE_UV
        vec3 bentNormal = cross( bitangent, viewDir );
        bentNormal = normalize( cross( bentNormal, bitangent ) );
        bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
        return getIBLRadiance( viewDir, bentNormal, roughness );
      #else
        return vec3( 0.0 );
      #endif
    }
  #endif
#endif`,df=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,uf=`varying vec3 vViewPosition;
struct ToonMaterial {
  vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
  vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ff=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,pf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
  vec3 diffuseColor;
  vec3 specularColor;
  float specularShininess;
  float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
  reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,mf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
  material.ior = ior;
  #ifdef USE_SPECULAR
    float specularIntensityFactor = specularIntensity;
    vec3 specularColorFactor = specularColor;
    #ifdef USE_SPECULAR_COLORMAP
      specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
    #endif
    #ifdef USE_SPECULAR_INTENSITYMAP
      specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
    #endif
    material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
  #else
    float specularIntensityFactor = 1.0;
    vec3 specularColorFactor = vec3( 1.0 );
    material.specularF90 = 1.0;
  #endif
  material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
  material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
  material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
  material.clearcoat = clearcoat;
  material.clearcoatRoughness = clearcoatRoughness;
  material.clearcoatF0 = vec3( 0.04 );
  material.clearcoatF90 = 1.0;
  #ifdef USE_CLEARCOATMAP
    material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
  #endif
  #ifdef USE_CLEARCOAT_ROUGHNESSMAP
    material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
  #endif
  material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
  material.clearcoatRoughness += geometryRoughness;
  material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
  material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
  material.iridescence = iridescence;
  material.iridescenceIOR = iridescenceIOR;
  #ifdef USE_IRIDESCENCEMAP
    material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
  #endif
  #ifdef USE_IRIDESCENCE_THICKNESSMAP
    material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
  #else
    material.iridescenceThickness = iridescenceThicknessMaximum;
  #endif
#endif
#ifdef USE_SHEEN
  material.sheenColor = sheenColor;
  #ifdef USE_SHEEN_COLORMAP
    material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
  #endif
  material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
  #ifdef USE_SHEEN_ROUGHNESSMAP
    material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
  #endif
#endif
#ifdef USE_ANISOTROPY
  #ifdef USE_ANISOTROPYMAP
    mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
    vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
    vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
  #else
    vec2 anisotropyV = anisotropyVector;
  #endif
  material.anisotropy = length( anisotropyV );
  if( material.anisotropy == 0.0 ) {
    anisotropyV = vec2( 1.0, 0.0 );
  } else {
    anisotropyV /= material.anisotropy;
    material.anisotropy = saturate( material.anisotropy );
  }
  material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
  material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
  material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,_f=`struct PhysicalMaterial {
  vec3 diffuseColor;
  float roughness;
  vec3 specularColor;
  float specularF90;
  float dispersion;
  #ifdef USE_CLEARCOAT
    float clearcoat;
    float clearcoatRoughness;
    vec3 clearcoatF0;
    float clearcoatF90;
  #endif
  #ifdef USE_IRIDESCENCE
    float iridescence;
    float iridescenceIOR;
    float iridescenceThickness;
    vec3 iridescenceFresnel;
    vec3 iridescenceF0;
  #endif
  #ifdef USE_SHEEN
    vec3 sheenColor;
    float sheenRoughness;
  #endif
  #ifdef IOR
    float ior;
  #endif
  #ifdef USE_TRANSMISSION
    float transmission;
    float transmissionAlpha;
    float thickness;
    float attenuationDistance;
    vec3 attenuationColor;
  #endif
  #ifdef USE_ANISOTROPY
    float anisotropy;
    float alphaT;
    vec3 anisotropyT;
    vec3 anisotropyB;
  #endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
  float a2 = pow2( alpha );
  float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
  float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
  return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
  float a2 = pow2( alpha );
  float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
  return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
  float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
    float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
    float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
    float v = 0.5 / ( gv + gl );
    return saturate(v);
  }
  float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
    float a2 = alphaT * alphaB;
    highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
    highp float v2 = dot( v, v );
    float w2 = a2 / v2;
    return RECIPROCAL_PI * a2 * pow2 ( w2 );
  }
#endif
#ifdef USE_CLEARCOAT
  vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
    vec3 f0 = material.clearcoatF0;
    float f90 = material.clearcoatF90;
    float roughness = material.clearcoatRoughness;
    float alpha = pow2( roughness );
    vec3 halfDir = normalize( lightDir + viewDir );
    float dotNL = saturate( dot( normal, lightDir ) );
    float dotNV = saturate( dot( normal, viewDir ) );
    float dotNH = saturate( dot( normal, halfDir ) );
    float dotVH = saturate( dot( viewDir, halfDir ) );
    vec3 F = F_Schlick( f0, f90, dotVH );
    float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
    float D = D_GGX( alpha, dotNH );
    return F * ( V * D );
  }
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
  vec3 f0 = material.specularColor;
  float f90 = material.specularF90;
  float roughness = material.roughness;
  float alpha = pow2( roughness );
  vec3 halfDir = normalize( lightDir + viewDir );
  float dotNL = saturate( dot( normal, lightDir ) );
  float dotNV = saturate( dot( normal, viewDir ) );
  float dotNH = saturate( dot( normal, halfDir ) );
  float dotVH = saturate( dot( viewDir, halfDir ) );
  vec3 F = F_Schlick( f0, f90, dotVH );
  #ifdef USE_IRIDESCENCE
    F = mix( F, material.iridescenceFresnel, material.iridescence );
  #endif
  #ifdef USE_ANISOTROPY
    float dotTL = dot( material.anisotropyT, lightDir );
    float dotTV = dot( material.anisotropyT, viewDir );
    float dotTH = dot( material.anisotropyT, halfDir );
    float dotBL = dot( material.anisotropyB, lightDir );
    float dotBV = dot( material.anisotropyB, viewDir );
    float dotBH = dot( material.anisotropyB, halfDir );
    float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
    float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
  #else
    float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
    float D = D_GGX( alpha, dotNH );
  #endif
  return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
  const float LUT_SIZE = 64.0;
  const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
  const float LUT_BIAS = 0.5 / LUT_SIZE;
  float dotNV = saturate( dot( N, V ) );
  vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
  uv = uv * LUT_SCALE + LUT_BIAS;
  return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
  float l = length( f );
  return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
  float x = dot( v1, v2 );
  float y = abs( x );
  float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
  float b = 3.4175940 + ( 4.1616724 + y ) * y;
  float v = a / b;
  float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
  return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
  vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
  vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
  vec3 lightNormal = cross( v1, v2 );
  if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
  vec3 T1, T2;
  T1 = normalize( V - N * dot( V, N ) );
  T2 = - cross( N, T1 );
  mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
  vec3 coords[ 4 ];
  coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
  coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
  coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
  coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
  coords[ 0 ] = normalize( coords[ 0 ] );
  coords[ 1 ] = normalize( coords[ 1 ] );
  coords[ 2 ] = normalize( coords[ 2 ] );
  coords[ 3 ] = normalize( coords[ 3 ] );
  vec3 vectorFormFactor = vec3( 0.0 );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
  float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
  return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
  float alpha = pow2( roughness );
  float invAlpha = 1.0 / alpha;
  float cos2h = dotNH * dotNH;
  float sin2h = max( 1.0 - cos2h, 0.0078125 );
  return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
  return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
  vec3 halfDir = normalize( lightDir + viewDir );
  float dotNL = saturate( dot( normal, lightDir ) );
  float dotNV = saturate( dot( normal, viewDir ) );
  float dotNH = saturate( dot( normal, halfDir ) );
  float D = D_Charlie( sheenRoughness, dotNH );
  float V = V_Neubelt( dotNV, dotNL );
  return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
  float dotNV = saturate( dot( normal, viewDir ) );
  float r2 = roughness * roughness;
  float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
  float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
  float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
  return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
  float dotNV = saturate( dot( normal, viewDir ) );
  const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
  const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
  vec4 r = roughness * c0 + c1;
  float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
  vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
  return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
  vec2 fab = DFGApprox( normal, viewDir, roughness );
  return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
  vec2 fab = DFGApprox( normal, viewDir, roughness );
  #ifdef USE_IRIDESCENCE
    vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
  #else
    vec3 Fr = specularColor;
  #endif
  vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
  float Ess = fab.x + fab.y;
  float Ems = 1.0 - Ess;
  vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
  singleScatter += FssEss;
  multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
  void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
    vec3 normal = geometryNormal;
    vec3 viewDir = geometryViewDir;
    vec3 position = geometryPosition;
    vec3 lightPos = rectAreaLight.position;
    vec3 halfWidth = rectAreaLight.halfWidth;
    vec3 halfHeight = rectAreaLight.halfHeight;
    vec3 lightColor = rectAreaLight.color;
    float roughness = material.roughness;
    vec3 rectCoords[ 4 ];
    rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
    rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
    rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
    vec2 uv = LTC_Uv( normal, viewDir, roughness );
    vec4 t1 = texture2D( ltc_1, uv );
    vec4 t2 = texture2D( ltc_2, uv );
    mat3 mInv = mat3(
      vec3( t1.x, 0, t1.y ),
      vec3(    0, 1,    0 ),
      vec3( t1.z, 0, t1.w )
    );
    vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
    reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
    reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
  }
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  #ifdef USE_CLEARCOAT
    float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
    vec3 ccIrradiance = dotNLcc * directLight.color;
    clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
  #endif
  #ifdef USE_SHEEN
    sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
  #endif
  reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  #ifdef USE_CLEARCOAT
    clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
  #endif
  #ifdef USE_SHEEN
    sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
  #endif
  vec3 singleScattering = vec3( 0.0 );
  vec3 multiScattering = vec3( 0.0 );
  vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
  #ifdef USE_IRIDESCENCE
    computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
  #else
    computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
  #endif
  vec3 totalScattering = singleScattering + multiScattering;
  vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
  reflectedLight.indirectSpecular += radiance * singleScattering;
  reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
  reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
  return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,gf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
  geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
  float dotNVi = saturate( dot( normal, geometryViewDir ) );
  if ( material.iridescenceThickness == 0.0 ) {
    material.iridescence = 0.0;
  } else {
    material.iridescence = saturate( material.iridescence );
  }
  if ( material.iridescence > 0.0 ) {
    material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
    material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
  }
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
  PointLight pointLight;
  #if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
  PointLightShadow pointLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
    pointLight = pointLights[ i ];
    getPointLightInfo( pointLight, geometryPosition, directLight );
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
    pointLightShadow = pointLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
  SpotLight spotLight;
  vec4 spotColor;
  vec3 spotLightCoord;
  bool inSpotLightMap;
  #if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
  SpotLightShadow spotLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
    spotLight = spotLights[ i ];
    getSpotLightInfo( spotLight, geometryPosition, directLight );
    #if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
    #define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
    #elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
    #define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
    #else
    #define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
    #endif
    #if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
      spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
      inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
      spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
      directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
    #endif
    #undef SPOT_LIGHT_MAP_INDEX
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
    spotLightShadow = spotLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
  DirectionalLight directionalLight;
  #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
  DirectionalLightShadow directionalLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
    directionalLight = directionalLights[ i ];
    getDirectionalLightInfo( directionalLight, directLight );
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
    directionalLightShadow = directionalLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
  RectAreaLight rectAreaLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
    rectAreaLight = rectAreaLights[ i ];
    RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
  vec3 iblIrradiance = vec3( 0.0 );
  vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
  #if defined( USE_LIGHT_PROBES )
    irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
  #endif
  #if ( NUM_HEMI_LIGHTS > 0 )
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
      irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
    }
    #pragma unroll_loop_end
  #endif
#endif
#if defined( RE_IndirectSpecular )
  vec3 radiance = vec3( 0.0 );
  vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,yf=`#if defined( RE_IndirectDiffuse )
  #ifdef USE_LIGHTMAP
    vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
    vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
    irradiance += lightMapIrradiance;
  #endif
  #if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
    iblIrradiance += getIBLIrradiance( geometryNormal );
  #endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
  #ifdef USE_ANISOTROPY
    radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
  #else
    radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
  #endif
  #ifdef USE_CLEARCOAT
    clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
  #endif
#endif`,xf=`#if defined( RE_IndirectDiffuse )
  RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
  RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,vf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
  gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,wf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
  uniform float logDepthBufFC;
  varying float vFragDepth;
  varying float vIsPerspective;
#endif`,Mf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
  varying float vFragDepth;
  varying float vIsPerspective;
#endif`,bf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
  vFragDepth = 1.0 + gl_Position.w;
  vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Sf=`#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D( map, vMapUv );
  #ifdef DECODE_VIDEO_TEXTURE
    sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
  #endif
  diffuseColor *= sampledDiffuseColor;
#endif`,Tf=`#ifdef USE_MAP
  uniform sampler2D map;
#endif`,Ef=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
  #if defined( USE_POINTS_UV )
    vec2 uv = vUv;
  #else
    vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
  #endif
#endif
#ifdef USE_MAP
  diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
  diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Af=`#if defined( USE_POINTS_UV )
  varying vec2 vUv;
#else
  #if defined( USE_MAP ) || defined( USE_ALPHAMAP )
    uniform mat3 uvTransform;
  #endif
#endif
#ifdef USE_MAP
  uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
  uniform sampler2D alphaMap;
#endif`,Cf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
  vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
  metalnessFactor *= texelMetalness.b;
#endif`,Rf=`#ifdef USE_METALNESSMAP
  uniform sampler2D metalnessMap;
#endif`,Pf=`#ifdef USE_INSTANCING_MORPH
  float morphTargetInfluences[ MORPHTARGETS_COUNT ];
  float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
  }
#endif`,If=`#if defined( USE_MORPHCOLORS )
  vColor *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    #if defined( USE_COLOR_ALPHA )
      if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
    #elif defined( USE_COLOR )
      if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
    #endif
  }
#endif`,Df=`#ifdef USE_MORPHNORMALS
  objectNormal *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
  }
#endif`,Lf=`#ifdef USE_MORPHTARGETS
  #ifndef USE_INSTANCING_MORPH
    uniform float morphTargetBaseInfluence;
    uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
  #endif
  uniform sampler2DArray morphTargetsTexture;
  uniform ivec2 morphTargetsTextureSize;
  vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
    int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
    int y = texelIndex / morphTargetsTextureSize.x;
    int x = texelIndex - y * morphTargetsTextureSize.x;
    ivec3 morphUV = ivec3( x, y, morphTargetIndex );
    return texelFetch( morphTargetsTexture, morphUV, 0 );
  }
#endif`,Uf=`#ifdef USE_MORPHTARGETS
  transformed *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
  }
#endif`,Nf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
  vec3 fdx = dFdx( vViewPosition );
  vec3 fdy = dFdy( vViewPosition );
  vec3 normal = normalize( cross( fdx, fdy ) );
#else
  vec3 normal = normalize( vNormal );
  #ifdef DOUBLE_SIDED
    normal *= faceDirection;
  #endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
  #ifdef USE_TANGENT
    mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
  #else
    mat3 tbn = getTangentFrame( - vViewPosition, normal,
    #if defined( USE_NORMALMAP )
      vNormalMapUv
    #elif defined( USE_CLEARCOAT_NORMALMAP )
      vClearcoatNormalMapUv
    #else
      vUv
    #endif
    );
  #endif
  #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
    tbn[0] *= faceDirection;
    tbn[1] *= faceDirection;
  #endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  #ifdef USE_TANGENT
    mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
  #else
    mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
  #endif
  #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
    tbn2[0] *= faceDirection;
    tbn2[1] *= faceDirection;
  #endif
#endif
vec3 nonPerturbedNormal = normal;`,Ff=`#ifdef USE_NORMALMAP_OBJECTSPACE
  normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
  #ifdef FLIP_SIDED
    normal = - normal;
  #endif
  #ifdef DOUBLE_SIDED
    normal = normal * faceDirection;
  #endif
  normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
  vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
  mapN.xy *= normalScale;
  normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
  normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,kf=`#ifndef FLAT_SHADED
  varying vec3 vNormal;
  #ifdef USE_TANGENT
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif`,Of=`#ifndef FLAT_SHADED
  varying vec3 vNormal;
  #ifdef USE_TANGENT
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif`,Bf=`#ifndef FLAT_SHADED
  vNormal = normalize( transformedNormal );
  #ifdef USE_TANGENT
    vTangent = normalize( transformedTangent );
    vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
  #endif
#endif`,zf=`#ifdef USE_NORMALMAP
  uniform sampler2D normalMap;
  uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
  uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
  mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
    vec3 q0 = dFdx( eye_pos.xyz );
    vec3 q1 = dFdy( eye_pos.xyz );
    vec2 st0 = dFdx( uv.st );
    vec2 st1 = dFdy( uv.st );
    vec3 N = surf_norm;
    vec3 q1perp = cross( q1, N );
    vec3 q0perp = cross( N, q0 );
    vec3 T = q1perp * st0.x + q0perp * st1.x;
    vec3 B = q1perp * st0.y + q0perp * st1.y;
    float det = max( dot( T, T ), dot( B, B ) );
    float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
    return mat3( T * scale, B * scale, N );
  }
#endif`,Vf=`#ifdef USE_CLEARCOAT
  vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Gf=`#ifdef USE_CLEARCOAT_NORMALMAP
  vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
  clearcoatMapN.xy *= clearcoatNormalScale;
  clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Hf=`#ifdef USE_CLEARCOATMAP
  uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  uniform sampler2D clearcoatNormalMap;
  uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  uniform sampler2D clearcoatRoughnessMap;
#endif`,Wf=`#ifdef USE_IRIDESCENCEMAP
  uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  uniform sampler2D iridescenceThicknessMap;
#endif`,Xf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,qf=`vec3 packNormalToRGB( const in vec3 normal ) {
  return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
  return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
  if( v <= 0.0 )
    return vec4( 0., 0., 0., 0. );
  if( v >= 1.0 )
    return vec4( 1., 1., 1., 1. );
  float vuf;
  float af = modf( v * PackFactors.a, vuf );
  float bf = modf( vuf * ShiftRight8, vuf );
  float gf = modf( vuf * ShiftRight8, vuf );
  return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
  if( v <= 0.0 )
    return vec3( 0., 0., 0. );
  if( v >= 1.0 )
    return vec3( 1., 1., 1. );
  float vuf;
  float bf = modf( v * PackFactors.b, vuf );
  float gf = modf( vuf * ShiftRight8, vuf );
  return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
  if( v <= 0.0 )
    return vec2( 0., 0. );
  if( v >= 1.0 )
    return vec2( 1., 1. );
  float vuf;
  float gf = modf( v * 256., vuf );
  return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
  return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
  return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
  return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
  vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
  return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
  return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
  return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
  return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
  return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
  return ( near * far ) / ( ( far - near ) * depth - far );
}`,Yf=`#ifdef PREMULTIPLIED_ALPHA
  gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Zf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Jf=`#ifdef DITHERING
  gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Kf=`#ifdef DITHERING
  vec3 dithering( vec3 color ) {
    float grid_position = rand( gl_FragCoord.xy );
    vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
    dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
    return color + dither_shift_RGB;
  }
#endif`,$f=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
  vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
  roughnessFactor *= texelRoughness.g;
#endif`,jf=`#ifdef USE_ROUGHNESSMAP
  uniform sampler2D roughnessMap;
#endif`,Qf=`#if NUM_SPOT_LIGHT_COORDS > 0
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
  uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
  #if NUM_DIR_LIGHT_SHADOWS > 0
    uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
    varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
    struct DirectionalLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
  #endif
  #if NUM_SPOT_LIGHT_SHADOWS > 0
    uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
    struct SpotLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
    uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
    varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
    struct PointLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
      float shadowCameraNear;
      float shadowCameraFar;
    };
    uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
  #endif
  float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
    float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
    #ifdef USE_REVERSED_DEPTH_BUFFER
      return step( depth, compare );
    #else
      return step( compare, depth );
    #endif
  }
  vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
    return unpackRGBATo2Half( texture2D( shadow, uv ) );
  }
  float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
    float occlusion = 1.0;
    vec2 distribution = texture2DDistribution( shadow, uv );
    #ifdef USE_REVERSED_DEPTH_BUFFER
      float hard_shadow = step( distribution.x, compare );
    #else
      float hard_shadow = step( compare, distribution.x );
    #endif
    if ( hard_shadow != 1.0 ) {
      float distance = compare - distribution.x;
      float variance = max( 0.00000, distribution.y * distribution.y );
      float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
    }
    return occlusion;
  }
  float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
    float shadow = 1.0;
    shadowCoord.xyz /= shadowCoord.w;
    shadowCoord.z += shadowBias;
    bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
    bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
    if ( frustumTest ) {
    #if defined( SHADOWMAP_TYPE_PCF )
      vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
      float dx0 = - texelSize.x * shadowRadius;
      float dy0 = - texelSize.y * shadowRadius;
      float dx1 = + texelSize.x * shadowRadius;
      float dy1 = + texelSize.y * shadowRadius;
      float dx2 = dx0 / 2.0;
      float dy2 = dy0 / 2.0;
      float dx3 = dx1 / 2.0;
      float dy3 = dy1 / 2.0;
      shadow = (
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
      ) * ( 1.0 / 17.0 );
    #elif defined( SHADOWMAP_TYPE_PCF_SOFT )
      vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
      float dx = texelSize.x;
      float dy = texelSize.y;
      vec2 uv = shadowCoord.xy;
      vec2 f = fract( uv * shadowMapSize + 0.5 );
      uv -= f * texelSize;
      shadow = (
        texture2DCompare( shadowMap, uv, shadowCoord.z ) +
        texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
        texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
        mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
           texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
           f.x ) +
        mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
           texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
           f.x ) +
        mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
           texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
           f.y ) +
        mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
           texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
           f.y ) +
        mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
              texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
              f.x ),
           mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
              texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
              f.x ),
           f.y )
      ) * ( 1.0 / 9.0 );
    #elif defined( SHADOWMAP_TYPE_VSM )
      shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
    #else
      shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
    #endif
    }
    return mix( 1.0, shadow, shadowIntensity );
  }
  vec2 cubeToUV( vec3 v, float texelSizeY ) {
    vec3 absV = abs( v );
    float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
    absV *= scaleToCube;
    v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
    vec2 planar = v.xy;
    float almostATexel = 1.5 * texelSizeY;
    float almostOne = 1.0 - almostATexel;
    if ( absV.z >= almostOne ) {
      if ( v.z > 0.0 )
        planar.x = 4.0 - v.x;
    } else if ( absV.x >= almostOne ) {
      float signX = sign( v.x );
      planar.x = v.z * signX + 2.0 * signX;
    } else if ( absV.y >= almostOne ) {
      float signY = sign( v.y );
      planar.x = v.x + 2.0 * signY + 2.0;
      planar.y = v.z * signY - 2.0;
    }
    return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
  }
  float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
    float shadow = 1.0;
    vec3 lightToPosition = shadowCoord.xyz;

    float lightToPositionLength = length( lightToPosition );
    if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
      float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
      vec3 bd3D = normalize( lightToPosition );
      vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
      #if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
        vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
        shadow = (
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
          texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
        ) * ( 1.0 / 9.0 );
      #else
        shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
      #endif
    }
    return mix( 1.0, shadow, shadowIntensity );
  }
#endif`,ep=`#if NUM_SPOT_LIGHT_COORDS > 0
  uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
  #if NUM_DIR_LIGHT_SHADOWS > 0
    uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
    varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
    struct DirectionalLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
  #endif
  #if NUM_SPOT_LIGHT_SHADOWS > 0
    struct SpotLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
    uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
    varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
    struct PointLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
      float shadowCameraNear;
      float shadowCameraFar;
    };
    uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
  #endif
#endif`,tp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
  vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
  vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
  #if NUM_DIR_LIGHT_SHADOWS > 0
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
      shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
      vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
    }
    #pragma unroll_loop_end
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
      shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
      vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
    }
    #pragma unroll_loop_end
  #endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
    shadowWorldPosition = worldPosition;
    #if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
      shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
    #endif
    vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
  }
  #pragma unroll_loop_end
#endif`,ip=`float getShadowMask() {
  float shadow = 1.0;
  #ifdef USE_SHADOWMAP
  #if NUM_DIR_LIGHT_SHADOWS > 0
  DirectionalLightShadow directionalLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
    directionalLight = directionalLightShadows[ i ];
    shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #if NUM_SPOT_LIGHT_SHADOWS > 0
  SpotLightShadow spotLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
    spotLight = spotLightShadows[ i ];
    shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
  PointLightShadow pointLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
    pointLight = pointLightShadows[ i ];
    shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #endif
  return shadow;
}`,np=`#ifdef USE_SKINNING
  mat4 boneMatX = getBoneMatrix( skinIndex.x );
  mat4 boneMatY = getBoneMatrix( skinIndex.y );
  mat4 boneMatZ = getBoneMatrix( skinIndex.z );
  mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,rp=`#ifdef USE_SKINNING
  uniform mat4 bindMatrix;
  uniform mat4 bindMatrixInverse;
  uniform highp sampler2D boneTexture;
  mat4 getBoneMatrix( const in float i ) {
    int size = textureSize( boneTexture, 0 ).x;
    int j = int( i ) * 4;
    int x = j % size;
    int y = j / size;
    vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
    vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
    vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
    vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
    return mat4( v1, v2, v3, v4 );
  }
#endif`,sp=`#ifdef USE_SKINNING
  vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
  vec4 skinned = vec4( 0.0 );
  skinned += boneMatX * skinVertex * skinWeight.x;
  skinned += boneMatY * skinVertex * skinWeight.y;
  skinned += boneMatZ * skinVertex * skinWeight.z;
  skinned += boneMatW * skinVertex * skinWeight.w;
  transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,op=`#ifdef USE_SKINNING
  mat4 skinMatrix = mat4( 0.0 );
  skinMatrix += skinWeight.x * boneMatX;
  skinMatrix += skinWeight.y * boneMatY;
  skinMatrix += skinWeight.z * boneMatZ;
  skinMatrix += skinWeight.w * boneMatW;
  skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
  objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
  #ifdef USE_TANGENT
    objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
  #endif
#endif`,ap=`float specularStrength;
#ifdef USE_SPECULARMAP
  vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
  specularStrength = texelSpecular.r;
#else
  specularStrength = 1.0;
#endif`,lp=`#ifdef USE_SPECULARMAP
  uniform sampler2D specularMap;
#endif`,cp=`#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,hp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
  return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  color = max( vec3( 0.0 ), color - 0.004 );
  return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
  vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
  vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
  return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
  const mat3 ACESInputMat = mat3(
    vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
    vec3( 0.04823, 0.01566, 0.83777 )
  );
  const mat3 ACESOutputMat = mat3(
    vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
    vec3( -0.07367, -0.00605,  1.07602 )
  );
  color *= toneMappingExposure / 0.6;
  color = ACESInputMat * color;
  color = RRTAndODTFit( color );
  color = ACESOutputMat * color;
  return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
  vec3( 1.6605, - 0.1246, - 0.0182 ),
  vec3( - 0.5876, 1.1329, - 0.1006 ),
  vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
  vec3( 0.6274, 0.0691, 0.0164 ),
  vec3( 0.3293, 0.9195, 0.0880 ),
  vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
  vec3 x2 = x * x;
  vec3 x4 = x2 * x2;
  return + 15.5 * x4 * x2
    - 40.14 * x4 * x
    + 31.96 * x4
    - 6.868 * x2 * x
    + 0.4298 * x2
    + 0.1191 * x
    - 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
  const mat3 AgXInsetMatrix = mat3(
    vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
    vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
    vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
  );
  const mat3 AgXOutsetMatrix = mat3(
    vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
    vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
    vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
  );
  const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
  color *= toneMappingExposure;
  color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
  color = AgXInsetMatrix * color;
  color = max( color, 1e-10 );	color = log2( color );
  color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
  color = clamp( color, 0.0, 1.0 );
  color = agxDefaultContrastApprox( color );
  color = AgXOutsetMatrix * color;
  color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
  color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
  color = clamp( color, 0.0, 1.0 );
  return color;
}
vec3 NeutralToneMapping( vec3 color ) {
  const float StartCompression = 0.8 - 0.04;
  const float Desaturation = 0.15;
  color *= toneMappingExposure;
  float x = min( color.r, min( color.g, color.b ) );
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max( color.r, max( color.g, color.b ) );
  if ( peak < StartCompression ) return color;
  float d = 1. - StartCompression;
  float newPeak = 1. - d * d / ( peak + d - StartCompression );
  color *= newPeak / peak;
  float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
  return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,dp=`#ifdef USE_TRANSMISSION
  material.transmission = transmission;
  material.transmissionAlpha = 1.0;
  material.thickness = thickness;
  material.attenuationDistance = attenuationDistance;
  material.attenuationColor = attenuationColor;
  #ifdef USE_TRANSMISSIONMAP
    material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
  #endif
  #ifdef USE_THICKNESSMAP
    material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
  #endif
  vec3 pos = vWorldPosition;
  vec3 v = normalize( cameraPosition - pos );
  vec3 n = inverseTransformDirection( normal, viewMatrix );
  vec4 transmitted = getIBLVolumeRefraction(
    n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
    pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
    material.attenuationColor, material.attenuationDistance );
  material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
  totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,up=`#ifdef USE_TRANSMISSION
  uniform float transmission;
  uniform float thickness;
  uniform float attenuationDistance;
  uniform vec3 attenuationColor;
  #ifdef USE_TRANSMISSIONMAP
    uniform sampler2D transmissionMap;
  #endif
  #ifdef USE_THICKNESSMAP
    uniform sampler2D thicknessMap;
  #endif
  uniform vec2 transmissionSamplerSize;
  uniform sampler2D transmissionSamplerMap;
  uniform mat4 modelMatrix;
  uniform mat4 projectionMatrix;
  varying vec3 vWorldPosition;
  float w0( float a ) {
    return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
  }
  float w1( float a ) {
    return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
  }
  float w2( float a ){
    return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
  }
  float w3( float a ) {
    return ( 1.0 / 6.0 ) * ( a * a * a );
  }
  float g0( float a ) {
    return w0( a ) + w1( a );
  }
  float g1( float a ) {
    return w2( a ) + w3( a );
  }
  float h0( float a ) {
    return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
  }
  float h1( float a ) {
    return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
  }
  vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
    uv = uv * texelSize.zw + 0.5;
    vec2 iuv = floor( uv );
    vec2 fuv = fract( uv );
    float g0x = g0( fuv.x );
    float g1x = g1( fuv.x );
    float h0x = h0( fuv.x );
    float h1x = h1( fuv.x );
    float h0y = h0( fuv.y );
    float h1y = h1( fuv.y );
    vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
    vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
    vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
    vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
    return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
      g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
  }
  vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
    vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
    vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
    vec2 fLodSizeInv = 1.0 / fLodSize;
    vec2 cLodSizeInv = 1.0 / cLodSize;
    vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
    vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
    return mix( fSample, cSample, fract( lod ) );
  }
  vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
    vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
    vec3 modelScale;
    modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
    modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
    modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
    return normalize( refractionVector ) * thickness * modelScale;
  }
  float applyIorToRoughness( const in float roughness, const in float ior ) {
    return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
  }
  vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
    float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
    return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
  }
  vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
    if ( isinf( attenuationDistance ) ) {
      return vec3( 1.0 );
    } else {
      vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
      vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
    }
  }
  vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
    const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
    const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
    const in vec3 attenuationColor, const in float attenuationDistance ) {
    vec4 transmittedLight;
    vec3 transmittance;
    #ifdef USE_DISPERSION
      float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
      vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
      for ( int i = 0; i < 3; i ++ ) {
        vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
        vec3 refractedRayExit = position + transmissionRay;
        vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
        vec2 refractionCoords = ndcPos.xy / ndcPos.w;
        refractionCoords += 1.0;
        refractionCoords /= 2.0;
        vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
        transmittedLight[ i ] = transmissionSample[ i ];
        transmittedLight.a += transmissionSample.a;
        transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
      }
      transmittedLight.a /= 3.0;
    #else
      vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
      vec3 refractedRayExit = position + transmissionRay;
      vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
      vec2 refractionCoords = ndcPos.xy / ndcPos.w;
      refractionCoords += 1.0;
      refractionCoords /= 2.0;
      transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
      transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
    #endif
    vec3 attenuatedColor = transmittance * transmittedLight.rgb;
    vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
    float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
    return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
  }
#endif`,fp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
  varying vec2 vUv;
#endif
#ifdef USE_MAP
  varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
  varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
  varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
  varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
  varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
  varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
  varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
  varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
  varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
  varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
  varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
  varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
  varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
  varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
  varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
  varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
  varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
  uniform mat3 transmissionMapTransform;
  varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
  uniform mat3 thicknessMapTransform;
  varying vec2 vThicknessMapUv;
#endif`,pp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
  varying vec2 vUv;
#endif
#ifdef USE_MAP
  uniform mat3 mapTransform;
  varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
  uniform mat3 alphaMapTransform;
  varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
  uniform mat3 lightMapTransform;
  varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
  uniform mat3 aoMapTransform;
  varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
  uniform mat3 bumpMapTransform;
  varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
  uniform mat3 normalMapTransform;
  varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
  uniform mat3 displacementMapTransform;
  varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
  uniform mat3 emissiveMapTransform;
  varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
  uniform mat3 metalnessMapTransform;
  varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
  uniform mat3 roughnessMapTransform;
  varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
  uniform mat3 anisotropyMapTransform;
  varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
  uniform mat3 clearcoatMapTransform;
  varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  uniform mat3 clearcoatNormalMapTransform;
  varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  uniform mat3 clearcoatRoughnessMapTransform;
  varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
  uniform mat3 sheenColorMapTransform;
  varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
  uniform mat3 sheenRoughnessMapTransform;
  varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
  uniform mat3 iridescenceMapTransform;
  varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  uniform mat3 iridescenceThicknessMapTransform;
  varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
  uniform mat3 specularMapTransform;
  varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
  uniform mat3 specularColorMapTransform;
  varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
  uniform mat3 specularIntensityMapTransform;
  varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
  uniform mat3 transmissionMapTransform;
  varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
  uniform mat3 thicknessMapTransform;
  varying vec2 vThicknessMapUv;
#endif`,mp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
  vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
  vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
  vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
  vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
  vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
  vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
  vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
  vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
  vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
  vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
  vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
  vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
  vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
  vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
  vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
  vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
  vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
  vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
  vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
  vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
  vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,_p=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
  vec4 worldPosition = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    worldPosition = batchingMatrix * worldPosition;
  #endif
  #ifdef USE_INSTANCING
    worldPosition = instanceMatrix * worldPosition;
  #endif
  worldPosition = modelMatrix * worldPosition;
#endif`,gp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
  vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
  gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,yp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
  vec4 texColor = texture2D( t2D, vUv );
  #ifdef DECODE_VIDEO_TEXTURE
    texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
  #endif
  texColor.rgb *= backgroundIntensity;
  gl_FragColor = texColor;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,xp=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
  gl_Position.z = gl_Position.w;
}`,vp=`#ifdef ENVMAP_TYPE_CUBE
  uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
  uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
  #ifdef ENVMAP_TYPE_CUBE
    vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
  #elif defined( ENVMAP_TYPE_CUBE_UV )
    vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
  #else
    vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
  #endif
  texColor.rgb *= backgroundIntensity;
  gl_FragColor = texColor;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,wp=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
  gl_Position.z = gl_Position.w;
}`,Mp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
  vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
  gl_FragColor = texColor;
  gl_FragColor.a *= opacity;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,bp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
  #include <uv_vertex>
  #include <batching_vertex>
  #include <skinbase_vertex>
  #include <morphinstance_vertex>
  #ifdef USE_DISPLACEMENTMAP
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinnormal_vertex>
  #endif
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vHighPrecisionZW = gl_Position.zw;
}`,Sp=`#if DEPTH_PACKING == 3200
  uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
  vec4 diffuseColor = vec4( 1.0 );
  #include <clipping_planes_fragment>
  #if DEPTH_PACKING == 3200
    diffuseColor.a = opacity;
  #endif
  #include <map_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <logdepthbuf_fragment>
  #ifdef USE_REVERSED_DEPTH_BUFFER
    float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
  #else
    float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
  #endif
  #if DEPTH_PACKING == 3200
    gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
  #elif DEPTH_PACKING == 3201
    gl_FragColor = packDepthToRGBA( fragCoordZ );
  #elif DEPTH_PACKING == 3202
    gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
  #elif DEPTH_PACKING == 3203
    gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
  #endif
}`,Tp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <batching_vertex>
  #include <skinbase_vertex>
  #include <morphinstance_vertex>
  #ifdef USE_DISPLACEMENTMAP
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinnormal_vertex>
  #endif
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <worldpos_vertex>
  #include <clipping_planes_vertex>
  vWorldPosition = worldPosition.xyz;
}`,Ep=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
  vec4 diffuseColor = vec4( 1.0 );
  #include <clipping_planes_fragment>
  #include <map_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  float dist = length( vWorldPosition - referencePosition );
  dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
  dist = saturate( dist );
  gl_FragColor = packDepthToRGBA( dist );
}`,Ap=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
}`,Cp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
  vec3 direction = normalize( vWorldDirection );
  vec2 sampleUV = equirectUv( direction );
  gl_FragColor = texture2D( tEquirect, sampleUV );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Rp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  vLineDistance = scale * lineDistance;
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
}`,Pp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  if ( mod( vLineDistance, totalSize ) > dashSize ) {
    discard;
  }
  vec3 outgoingLight = vec3( 0.0 );
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  outgoingLight = diffuseColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
}`,Ip=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
  #endif
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <fog_vertex>
}`,Dp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  #ifdef USE_LIGHTMAP
    vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
    reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
  #else
    reflectedLight.indirectDiffuse += vec3( 1.0 );
  #endif
  #include <aomap_fragment>
  reflectedLight.indirectDiffuse *= diffuseColor.rgb;
  vec3 outgoingLight = reflectedLight.indirectDiffuse;
  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Lp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,Up=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_lambert_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Np=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
  vViewPosition = - mvPosition.xyz;
}`,Fp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  vec3 viewDir = normalize( vViewPosition );
  vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
  vec3 y = cross( viewDir, x );
  vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
  #ifdef USE_MATCAP
    vec4 matcapColor = texture2D( matcap, uv );
  #else
    vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
  #endif
  vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,kp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
  varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
  vViewPosition = - mvPosition.xyz;
#endif
}`,Op=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
  varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
  #ifdef OPAQUE
    gl_FragColor.a = 1.0;
  #endif
}`,Bp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,zp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_phong_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Vp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
  varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
#ifdef USE_TRANSMISSION
  vWorldPosition = worldPosition.xyz;
#endif
}`,Gp=`#define STANDARD
#ifdef PHYSICAL
  #define IOR
  #define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
  uniform float ior;
#endif
#ifdef USE_SPECULAR
  uniform float specularIntensity;
  uniform vec3 specularColor;
  #ifdef USE_SPECULAR_COLORMAP
    uniform sampler2D specularColorMap;
  #endif
  #ifdef USE_SPECULAR_INTENSITYMAP
    uniform sampler2D specularIntensityMap;
  #endif
#endif
#ifdef USE_CLEARCOAT
  uniform float clearcoat;
  uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
  uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
  uniform float iridescence;
  uniform float iridescenceIOR;
  uniform float iridescenceThicknessMinimum;
  uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
  uniform vec3 sheenColor;
  uniform float sheenRoughness;
  #ifdef USE_SHEEN_COLORMAP
    uniform sampler2D sheenColorMap;
  #endif
  #ifdef USE_SHEEN_ROUGHNESSMAP
    uniform sampler2D sheenRoughnessMap;
  #endif
#endif
#ifdef USE_ANISOTROPY
  uniform vec2 anisotropyVector;
  #ifdef USE_ANISOTROPYMAP
    uniform sampler2D anisotropyMap;
  #endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <roughnessmap_fragment>
  #include <metalnessmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <clearcoat_normal_fragment_begin>
  #include <clearcoat_normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_physical_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
  #include <transmission_fragment>
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
  #ifdef USE_SHEEN
    float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
    outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
  #endif
  #ifdef USE_CLEARCOAT
    float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
    vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
    outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
  #endif
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Hp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,Wp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_toon_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,Xp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
  varying vec2 vUv;
  uniform mat3 uvTransform;
#endif
void main() {
  #ifdef USE_POINTS_UV
    vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
  #endif
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <project_vertex>
  gl_PointSize = size;
  #ifdef USE_SIZEATTENUATION
    bool isPerspective = isPerspectiveMatrix( projectionMatrix );
    if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
  #endif
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <fog_vertex>
}`,qp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  vec3 outgoingLight = vec3( 0.0 );
  #include <logdepthbuf_fragment>
  #include <map_particle_fragment>
  #include <color_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  outgoingLight = diffuseColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
}`,Yp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,Zp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
  #include <logdepthbuf_fragment>
  gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`,Jp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  vec4 mvPosition = modelViewMatrix[ 3 ];
  vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
  #ifndef USE_SIZEATTENUATION
    bool isPerspective = isPerspectiveMatrix( projectionMatrix );
    if ( isPerspective ) scale *= - mvPosition.z;
  #endif
  vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
  vec2 rotatedPosition;
  rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
  rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
  mvPosition.xy += rotatedPosition;
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
}`,Kp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  vec3 outgoingLight = vec3( 0.0 );
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  outgoingLight = diffuseColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`,Xe={alphahash_fragment:gu,alphahash_pars_fragment:yu,alphamap_fragment:xu,alphamap_pars_fragment:vu,alphatest_fragment:wu,alphatest_pars_fragment:Mu,aomap_fragment:bu,aomap_pars_fragment:Su,batching_pars_vertex:Tu,batching_vertex:Eu,begin_vertex:Au,beginnormal_vertex:Cu,bsdfs:Ru,iridescence_fragment:Pu,bumpmap_pars_fragment:Iu,clipping_planes_fragment:Du,clipping_planes_pars_fragment:Lu,clipping_planes_pars_vertex:Uu,clipping_planes_vertex:Nu,color_fragment:Fu,color_pars_fragment:ku,color_pars_vertex:Ou,color_vertex:Bu,common:zu,cube_uv_reflection_fragment:Vu,defaultnormal_vertex:Gu,displacementmap_pars_vertex:Hu,displacementmap_vertex:Wu,emissivemap_fragment:Xu,emissivemap_pars_fragment:qu,colorspace_fragment:Yu,colorspace_pars_fragment:Zu,envmap_fragment:Ju,envmap_common_pars_fragment:Ku,envmap_pars_fragment:$u,envmap_pars_vertex:ju,envmap_physical_pars_fragment:hf,envmap_vertex:Qu,fog_vertex:ef,fog_pars_vertex:tf,fog_fragment:nf,fog_pars_fragment:rf,gradientmap_pars_fragment:sf,lightmap_pars_fragment:of,lights_lambert_fragment:af,lights_lambert_pars_fragment:lf,lights_pars_begin:cf,lights_toon_fragment:df,lights_toon_pars_fragment:uf,lights_phong_fragment:ff,lights_phong_pars_fragment:pf,lights_physical_fragment:mf,lights_physical_pars_fragment:_f,lights_fragment_begin:gf,lights_fragment_maps:yf,lights_fragment_end:xf,logdepthbuf_fragment:vf,logdepthbuf_pars_fragment:wf,logdepthbuf_pars_vertex:Mf,logdepthbuf_vertex:bf,map_fragment:Sf,map_pars_fragment:Tf,map_particle_fragment:Ef,map_particle_pars_fragment:Af,metalnessmap_fragment:Cf,metalnessmap_pars_fragment:Rf,morphinstance_vertex:Pf,morphcolor_vertex:If,morphnormal_vertex:Df,morphtarget_pars_vertex:Lf,morphtarget_vertex:Uf,normal_fragment_begin:Nf,normal_fragment_maps:Ff,normal_pars_fragment:kf,normal_pars_vertex:Of,normal_vertex:Bf,normalmap_pars_fragment:zf,clearcoat_normal_fragment_begin:Vf,clearcoat_normal_fragment_maps:Gf,clearcoat_pars_fragment:Hf,iridescence_pars_fragment:Wf,opaque_fragment:Xf,packing:qf,premultiplied_alpha_fragment:Yf,project_vertex:Zf,dithering_fragment:Jf,dithering_pars_fragment:Kf,roughnessmap_fragment:$f,roughnessmap_pars_fragment:jf,shadowmap_pars_fragment:Qf,shadowmap_pars_vertex:ep,shadowmap_vertex:tp,shadowmask_pars_fragment:ip,skinbase_vertex:np,skinning_pars_vertex:rp,skinning_vertex:sp,skinnormal_vertex:op,specularmap_fragment:ap,specularmap_pars_fragment:lp,tonemapping_fragment:cp,tonemapping_pars_fragment:hp,transmission_fragment:dp,transmission_pars_fragment:up,uv_pars_fragment:fp,uv_pars_vertex:pp,uv_vertex:mp,worldpos_vertex:_p,background_vert:gp,background_frag:yp,backgroundCube_vert:xp,backgroundCube_frag:vp,cube_vert:wp,cube_frag:Mp,depth_vert:bp,depth_frag:Sp,distanceRGBA_vert:Tp,distanceRGBA_frag:Ep,equirect_vert:Ap,equirect_frag:Cp,linedashed_vert:Rp,linedashed_frag:Pp,meshbasic_vert:Ip,meshbasic_frag:Dp,meshlambert_vert:Lp,meshlambert_frag:Up,meshmatcap_vert:Np,meshmatcap_frag:Fp,meshnormal_vert:kp,meshnormal_frag:Op,meshphong_vert:Bp,meshphong_frag:zp,meshphysical_vert:Vp,meshphysical_frag:Gp,meshtoon_vert:Hp,meshtoon_frag:Wp,points_vert:Xp,points_frag:qp,shadow_vert:Yp,shadow_frag:Zp,sprite_vert:Jp,sprite_frag:Kp},be={common:{diffuse:{value:new Ye(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new He}},envmap:{envMap:{value:null},envMapRotation:{value:new He},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new He}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new He}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new He},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new He},normalScale:{value:new me(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new He},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new He}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new He}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new He}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ye(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ye(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0},uvTransform:{value:new He}},sprite:{diffuse:{value:new Ye(16777215)},opacity:{value:1},center:{value:new me(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}}},bi={basic:{uniforms:Ot([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:Xe.meshbasic_vert,fragmentShader:Xe.meshbasic_frag},lambert:{uniforms:Ot([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ye(0)}}]),vertexShader:Xe.meshlambert_vert,fragmentShader:Xe.meshlambert_frag},phong:{uniforms:Ot([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ye(0)},specular:{value:new Ye(1118481)},shininess:{value:30}}]),vertexShader:Xe.meshphong_vert,fragmentShader:Xe.meshphong_frag},standard:{uniforms:Ot([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new Ye(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag},toon:{uniforms:Ot([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new Ye(0)}}]),vertexShader:Xe.meshtoon_vert,fragmentShader:Xe.meshtoon_frag},matcap:{uniforms:Ot([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:Xe.meshmatcap_vert,fragmentShader:Xe.meshmatcap_frag},points:{uniforms:Ot([be.points,be.fog]),vertexShader:Xe.points_vert,fragmentShader:Xe.points_frag},dashed:{uniforms:Ot([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xe.linedashed_vert,fragmentShader:Xe.linedashed_frag},depth:{uniforms:Ot([be.common,be.displacementmap]),vertexShader:Xe.depth_vert,fragmentShader:Xe.depth_frag},normal:{uniforms:Ot([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:Xe.meshnormal_vert,fragmentShader:Xe.meshnormal_frag},sprite:{uniforms:Ot([be.sprite,be.fog]),vertexShader:Xe.sprite_vert,fragmentShader:Xe.sprite_frag},background:{uniforms:{uvTransform:{value:new He},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xe.background_vert,fragmentShader:Xe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new He}},vertexShader:Xe.backgroundCube_vert,fragmentShader:Xe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xe.cube_vert,fragmentShader:Xe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xe.equirect_vert,fragmentShader:Xe.equirect_frag},distanceRGBA:{uniforms:Ot([be.common,be.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xe.distanceRGBA_vert,fragmentShader:Xe.distanceRGBA_frag},shadow:{uniforms:Ot([be.lights,be.fog,{color:{value:new Ye(0)},opacity:{value:1}}]),vertexShader:Xe.shadow_vert,fragmentShader:Xe.shadow_frag}};bi.physical={uniforms:Ot([bi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new He},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new He},clearcoatNormalScale:{value:new me(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new He},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new He},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new He},sheen:{value:0},sheenColor:{value:new Ye(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new He},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new He},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new He},transmissionSamplerSize:{value:new me},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new He},attenuationDistance:{value:0},attenuationColor:{value:new Ye(0)},specularColor:{value:new Ye(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new He},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new He},anisotropyVector:{value:new me},anisotropyMap:{value:null},anisotropyMapTransform:{value:new He}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag};var $o={r:0,b:0,g:0},gn=new pi,$p=new _t;function jp(n,e,t,i,r,s,o){let a=new Ye(0),c=s===!0?0:1,l,d,h=null,p=0,f=null;function g(T){let M=T.isScene===!0?T.background:null;return M&&M.isTexture&&(M=(T.backgroundBlurriness>0?t:e).get(M)),M}function w(T){let M=!1,F=g(T);F===null?u(a,c):F&&F.isColor&&(u(F,1),M=!0);let E=n.xr.getEnvironmentBlendMode();E==="additive"?i.buffers.color.setClear(0,0,0,1,o):E==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||M)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(T,M){let F=g(M);F&&(F.isCubeTexture||F.mapping===jr)?(d===void 0&&(d=new Ke(new St(1,1,1),new mi({name:"BackgroundCubeMaterial",uniforms:_n(bi.backgroundCube.uniforms),vertexShader:bi.backgroundCube.vertexShader,fragmentShader:bi.backgroundCube.fragmentShader,side:Ht,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(E,U,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(d)),gn.copy(M.backgroundRotation),gn.x*=-1,gn.y*=-1,gn.z*=-1,F.isCubeTexture&&F.isRenderTargetTexture===!1&&(gn.y*=-1,gn.z*=-1),d.material.uniforms.envMap.value=F,d.material.uniforms.flipEnvMap.value=F.isCubeTexture&&F.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4($p.makeRotationFromEuler(gn)),d.material.toneMapped=tt.getTransfer(F.colorSpace)!==at,(h!==F||p!==F.version||f!==n.toneMapping)&&(d.material.needsUpdate=!0,h=F,p=F.version,f=n.toneMapping),d.layers.enableAll(),T.unshift(d,d.geometry,d.material,0,0,null)):F&&F.isTexture&&(l===void 0&&(l=new Ke(new Br(2,2),new mi({name:"BackgroundMaterial",uniforms:_n(bi.background.uniforms),vertexShader:bi.background.vertexShader,fragmentShader:bi.background.fragmentShader,side:Pi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(l)),l.material.uniforms.t2D.value=F,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=tt.getTransfer(F.colorSpace)!==at,F.matrixAutoUpdate===!0&&F.updateMatrix(),l.material.uniforms.uvTransform.value.copy(F.matrix),(h!==F||p!==F.version||f!==n.toneMapping)&&(l.material.needsUpdate=!0,h=F,p=F.version,f=n.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null))}function u(T,M){T.getRGB($o,ul(n)),i.buffers.color.setClear($o.r,$o.g,$o.b,M,o)}function R(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(T,M=1){a.set(T),c=M,u(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(T){c=T,u(a,c)},render:w,addToRenderList:m,dispose:R}}function Qp(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=p(null),s=r,o=!1;function a(x,C,z,X,G){let K=!1,j=h(X,z,C);s!==j&&(s=j,l(s.object)),K=f(x,X,z,G),K&&g(x,X,z,G),G!==null&&e.update(G,n.ELEMENT_ARRAY_BUFFER),(K||o)&&(o=!1,M(x,C,z,X),G!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function c(){return n.createVertexArray()}function l(x){return n.bindVertexArray(x)}function d(x){return n.deleteVertexArray(x)}function h(x,C,z){let X=z.wireframe===!0,G=i[x.id];G===void 0&&(G={},i[x.id]=G);let K=G[C.id];K===void 0&&(K={},G[C.id]=K);let j=K[X];return j===void 0&&(j=p(c()),K[X]=j),j}function p(x){let C=[],z=[],X=[];for(let G=0;G<t;G++)C[G]=0,z[G]=0,X[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:z,attributeDivisors:X,object:x,attributes:{},index:null}}function f(x,C,z,X){let G=s.attributes,K=C.attributes,j=0,he=z.getAttributes();for(let ee in he)if(he[ee].location>=0){let Se=G[ee],Ee=K[ee];if(Ee===void 0&&(ee==="instanceMatrix"&&x.instanceMatrix&&(Ee=x.instanceMatrix),ee==="instanceColor"&&x.instanceColor&&(Ee=x.instanceColor)),Se===void 0||Se.attribute!==Ee||Ee&&Se.data!==Ee.data)return!0;j++}return s.attributesNum!==j||s.index!==X}function g(x,C,z,X){let G={},K=C.attributes,j=0,he=z.getAttributes();for(let ee in he)if(he[ee].location>=0){let Se=K[ee];Se===void 0&&(ee==="instanceMatrix"&&x.instanceMatrix&&(Se=x.instanceMatrix),ee==="instanceColor"&&x.instanceColor&&(Se=x.instanceColor));let Ee={};Ee.attribute=Se,Se&&Se.data&&(Ee.data=Se.data),G[ee]=Ee,j++}s.attributes=G,s.attributesNum=j,s.index=X}function w(){let x=s.newAttributes;for(let C=0,z=x.length;C<z;C++)x[C]=0}function m(x){u(x,0)}function u(x,C){let z=s.newAttributes,X=s.enabledAttributes,G=s.attributeDivisors;z[x]=1,X[x]===0&&(n.enableVertexAttribArray(x),X[x]=1),G[x]!==C&&(n.vertexAttribDivisor(x,C),G[x]=C)}function R(){let x=s.newAttributes,C=s.enabledAttributes;for(let z=0,X=C.length;z<X;z++)C[z]!==x[z]&&(n.disableVertexAttribArray(z),C[z]=0)}function T(x,C,z,X,G,K,j){j===!0?n.vertexAttribIPointer(x,C,z,G,K):n.vertexAttribPointer(x,C,z,X,G,K)}function M(x,C,z,X){w();let G=X.attributes,K=z.getAttributes(),j=C.defaultAttributeValues;for(let he in K){let ee=K[he];if(ee.location>=0){let ye=G[he];if(ye===void 0&&(he==="instanceMatrix"&&x.instanceMatrix&&(ye=x.instanceMatrix),he==="instanceColor"&&x.instanceColor&&(ye=x.instanceColor)),ye!==void 0){let Se=ye.normalized,Ee=ye.itemSize,Ge=e.get(ye);if(Ge===void 0)continue;let $e=Ge.buffer,it=Ge.type,Ze=Ge.bytesPerElement,ae=it===n.INT||it===n.UNSIGNED_INT||ye.gpuType===go;if(ye.isInterleavedBufferAttribute){let se=ye.data,Ce=se.stride,Ne=ye.offset;if(se.isInstancedInterleavedBuffer){for(let Pe=0;Pe<ee.locationSize;Pe++)u(ee.location+Pe,se.meshPerAttribute);x.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let Pe=0;Pe<ee.locationSize;Pe++)m(ee.location+Pe);n.bindBuffer(n.ARRAY_BUFFER,$e);for(let Pe=0;Pe<ee.locationSize;Pe++)T(ee.location+Pe,Ee/ee.locationSize,it,Se,Ce*Ze,(Ne+Ee/ee.locationSize*Pe)*Ze,ae)}else{if(ye.isInstancedBufferAttribute){for(let se=0;se<ee.locationSize;se++)u(ee.location+se,ye.meshPerAttribute);x.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=ye.meshPerAttribute*ye.count)}else for(let se=0;se<ee.locationSize;se++)m(ee.location+se);n.bindBuffer(n.ARRAY_BUFFER,$e);for(let se=0;se<ee.locationSize;se++)T(ee.location+se,Ee/ee.locationSize,it,Se,Ee*Ze,Ee/ee.locationSize*se*Ze,ae)}}else if(j!==void 0){let Se=j[he];if(Se!==void 0)switch(Se.length){case 2:n.vertexAttrib2fv(ee.location,Se);break;case 3:n.vertexAttrib3fv(ee.location,Se);break;case 4:n.vertexAttrib4fv(ee.location,Se);break;default:n.vertexAttrib1fv(ee.location,Se)}}}}R()}function F(){I();for(let x in i){let C=i[x];for(let z in C){let X=C[z];for(let G in X)d(X[G].object),delete X[G];delete C[z]}delete i[x]}}function E(x){if(i[x.id]===void 0)return;let C=i[x.id];for(let z in C){let X=C[z];for(let G in X)d(X[G].object),delete X[G];delete C[z]}delete i[x.id]}function U(x){for(let C in i){let z=i[C];if(z[x.id]===void 0)continue;let X=z[x.id];for(let G in X)d(X[G].object),delete X[G];delete z[x.id]}}function I(){y(),o=!0,s!==r&&(s=r,l(s.object))}function y(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:I,resetDefaultState:y,dispose:F,releaseStatesOfGeometry:E,releaseStatesOfProgram:U,initAttributes:w,enableAttribute:m,disableUnusedAttributes:R}}function e0(n,e,t){let i;function r(l){i=l}function s(l,d){n.drawArrays(i,l,d),t.update(d,i,1)}function o(l,d,h){h!==0&&(n.drawArraysInstanced(i,l,d,h),t.update(d,i,h))}function a(l,d,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,d,0,h);let f=0;for(let g=0;g<h;g++)f+=d[g];t.update(f,i,1)}function c(l,d,h,p){if(h===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<l.length;g++)o(l[g],d[g],p[g]);else{f.multiDrawArraysInstancedWEBGL(i,l,0,d,0,p,0,h);let g=0;for(let w=0;w<h;w++)g+=d[w]*p[w];t.update(g,i,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function t0(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let U=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(U){return!(U!==Jt&&i.convert(U)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(U){let I=U===jn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(U!==_i&&i.convert(U)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&U!==Mi&&!I)}function c(U){if(U==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";U="mediump"}return U==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",d=c(l);d!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",d,"instead."),l=d);let h=t.logarithmicDepthBuffer===!0,p=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),w=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),u=n.getParameter(n.MAX_VERTEX_ATTRIBS),R=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),T=n.getParameter(n.MAX_VARYING_VECTORS),M=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),F=g>0,E=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:p,maxTextures:f,maxVertexTextures:g,maxTextureSize:w,maxCubemapSize:m,maxAttributes:u,maxVertexUniforms:R,maxVaryings:T,maxFragmentUniforms:M,vertexTextures:F,maxSamples:E}}function i0(n){let e=this,t=null,i=0,r=!1,s=!1,o=new qt,a=new He,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,p){let f=h.length!==0||p||i!==0||r;return r=p,i=h.length,f},this.beginShadows=function(){s=!0,d(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,p){t=d(h,p,0)},this.setState=function(h,p,f){let g=h.clippingPlanes,w=h.clipIntersection,m=h.clipShadows,u=n.get(h);if(!r||g===null||g.length===0||s&&!m)s?d(null):l();else{let R=s?0:i,T=R*4,M=u.clippingState||null;c.value=M,M=d(g,p,T,f);for(let F=0;F!==T;++F)M[F]=t[F];u.clippingState=M,this.numIntersection=w?this.numPlanes:0,this.numPlanes+=R}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function d(h,p,f,g){let w=h!==null?h.length:0,m=null;if(w!==0){if(m=c.value,g!==!0||m===null){let u=f+w*4,R=p.matrixWorldInverse;a.getNormalMatrix(R),(m===null||m.length<u)&&(m=new Float32Array(u));for(let T=0,M=f;T!==w;++T,M+=4)o.copy(h[T]).applyMatrix4(R,a),o.normal.toArray(m,M),m[M+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=w,e.numIntersection=0,m}}function n0(n){let e=new WeakMap;function t(o,a){return a===po?o.mapping=fn:a===mo&&(o.mapping=pn),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===po||a===mo)if(e.has(o)){let c=e.get(o).texture;return t(c,o.mapping)}else{let c=o.image;if(c&&c.height>0){let l=new Os(c.height);return l.fromEquirectangularTexture(n,o),e.set(o,l),o.addEventListener("dispose",r),t(l.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}var ir=4,ch=[.125,.215,.35,.446,.526,.582],vn=20,gl=new Yr,hh=new Ye,yl=null,xl=0,vl=0,wl=!1,xn=(1+Math.sqrt(5))/2,tr=1/xn,dh=[new N(-xn,tr,0),new N(xn,tr,0),new N(-tr,0,xn),new N(tr,0,xn),new N(0,xn,-tr),new N(0,xn,tr),new N(-1,1,-1),new N(1,1,-1),new N(-1,1,1),new N(1,1,1)],r0=new N,ea=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100,s={}){let{size:o=256,position:a=r0}=s;yl=this._renderer.getRenderTarget(),xl=this._renderer.getActiveCubeFace(),vl=this._renderer.getActiveMipmapLevel(),wl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,r,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ph(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=fh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(yl,xl,vl),this._renderer.xr.enabled=wl,e.scissorTest=!1,jo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===fn||e.mapping===pn?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),yl=this._renderer.getRenderTarget(),xl=this._renderer.getActiveCubeFace(),vl=this._renderer.getActiveMipmapLevel(),wl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:ti,minFilter:ti,generateMipmaps:!1,type:jn,format:Jt,colorSpace:cn,depthBuffer:!1},r=uh(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=uh(e,t,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=s0(s)),this._blurMaterial=o0(s,e,t)}return r}_compileMaterial(e){let t=new Ke(this._lodPlanes[0],e);this._renderer.compile(t,gl)}_sceneToCubeUV(e,t,i,r,s){let c=new kt(90,1,t,i),l=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],h=this._renderer,p=h.autoClear,f=h.toneMapping;h.getClearColor(hh),h.toneMapping=Ui,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(r),h.clearDepth(),h.setRenderTarget(null));let w=new Mr({name:"PMREM.Background",side:Ht,depthWrite:!1,depthTest:!1}),m=new Ke(new St,w),u=!1,R=e.background;R?R.isColor&&(w.color.copy(R),e.background=null,u=!0):(w.color.copy(hh),u=!0);for(let T=0;T<6;T++){let M=T%3;M===0?(c.up.set(0,l[T],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x+d[T],s.y,s.z)):M===1?(c.up.set(0,0,l[T]),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y+d[T],s.z)):(c.up.set(0,l[T],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y,s.z+d[T]));let F=this._cubeSize;jo(r,M*F,T>2?F:0,F,F),h.setRenderTarget(r),u&&h.render(m,c),h.render(e,c)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=p,e.background=R}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===fn||e.mapping===pn;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=ph()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=fh());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new Ke(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let c=this._cubeSize;jo(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(o,gl)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let s=1;s<r;s++){let o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=dh[(r-s-1)%dh.length];this._blur(e,s-1,s,o,a)}t.autoClear=i}_blur(e,t,i,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let d=3,h=new Ke(this._lodPlanes[r],l),p=l.uniforms,f=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*vn-1),w=s/g,m=isFinite(s)?1+Math.floor(d*w):vn;m>vn&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${vn}`);let u=[],R=0;for(let U=0;U<vn;++U){let I=U/w,y=Math.exp(-I*I/2);u.push(y),U===0?R+=y:U<m&&(R+=2*y)}for(let U=0;U<u.length;U++)u[U]=u[U]/R;p.envMap.value=e.texture,p.samples.value=m,p.weights.value=u,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);let{_lodMax:T}=this;p.dTheta.value=g,p.mipInt.value=T-i;let M=this._sizeLods[r],F=3*M*(r>T-ir?r-T+ir:0),E=4*(this._cubeSize-M);jo(t,F,E,3*M,2*M),c.setRenderTarget(t),c.render(h,gl)}};function s0(n){let e=[],t=[],i=[],r=n,s=n-ir+1+ch.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let c=1/a;o>n-ir?c=ch[o-n+ir-1]:o===0&&(c=0),i.push(c);let l=1/(a-2),d=-l,h=1+l,p=[d,d,h,d,h,h,d,d,h,h,d,h],f=6,g=6,w=3,m=2,u=1,R=new Float32Array(w*g*f),T=new Float32Array(m*g*f),M=new Float32Array(u*g*f);for(let E=0;E<f;E++){let U=E%3*2/3-1,I=E>2?0:-1,y=[U,I,0,U+2/3,I,0,U+2/3,I+1,0,U,I,0,U+2/3,I+1,0,U,I+1,0];R.set(y,w*g*E),T.set(p,m*g*E);let x=[E,E,E,E,E,E];M.set(x,u*g*E)}let F=new Pt;F.setAttribute("position",new Gt(R,w)),F.setAttribute("uv",new Gt(T,m)),F.setAttribute("faceIndex",new Gt(M,u)),e.push(F),r>ir&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function uh(n,e,t){let i=new xi(n,e,t);return i.texture.mapping=jr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function jo(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function o0(n,e,t){let i=new Float32Array(vn),r=new N(0,1,0);return new mi({name:"SphericalGaussianBlur",defines:{n:vn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Il(),fragmentShader:`

      precision mediump float;
      precision mediump int;

      varying vec3 vOutputDirection;

      uniform sampler2D envMap;
      uniform int samples;
      uniform float weights[ n ];
      uniform bool latitudinal;
      uniform float dTheta;
      uniform float mipInt;
      uniform vec3 poleAxis;

      #define ENVMAP_TYPE_CUBE_UV
      #include <cube_uv_reflection_fragment>

      vec3 getSample( float theta, vec3 axis ) {

        float cosTheta = cos( theta );
        // Rodrigues' axis-angle rotation
        vec3 sampleDirection = vOutputDirection * cosTheta
          + cross( axis, vOutputDirection ) * sin( theta )
          + axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

        return bilinearCubeUV( envMap, sampleDirection, mipInt );

      }

      void main() {

        vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

        if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

          axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

        }

        axis = normalize( axis );

        gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
        gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

        for ( int i = 1; i < n; i++ ) {

          if ( i >= samples ) {

            break;

          }

          float theta = dTheta * float( i );
          gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
          gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

        }

      }
    `,blending:Li,depthTest:!1,depthWrite:!1})}function fh(){return new mi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Il(),fragmentShader:`

      precision mediump float;
      precision mediump int;

      varying vec3 vOutputDirection;

      uniform sampler2D envMap;

      #include <common>

      void main() {

        vec3 outputDirection = normalize( vOutputDirection );
        vec2 uv = equirectUv( outputDirection );

        gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

      }
    `,blending:Li,depthTest:!1,depthWrite:!1})}function ph(){return new mi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Il(),fragmentShader:`

      precision mediump float;
      precision mediump int;

      uniform float flipEnvMap;

      varying vec3 vOutputDirection;

      uniform samplerCube envMap;

      void main() {

        gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

      }
    `,blending:Li,depthTest:!1,depthWrite:!1})}function Il(){return`

    precision mediump float;
    precision mediump int;

    attribute float faceIndex;

    varying vec3 vOutputDirection;

    // RH coordinate system; PMREM face-indexing convention
    vec3 getDirection( vec2 uv, float face ) {

      uv = 2.0 * uv - 1.0;

      vec3 direction = vec3( uv, 1.0 );

      if ( face == 0.0 ) {

        direction = direction.zyx; // ( 1, v, u ) pos x

      } else if ( face == 1.0 ) {

        direction = direction.xzy;
        direction.xz *= -1.0; // ( -u, 1, -v ) pos y

      } else if ( face == 2.0 ) {

        direction.x *= -1.0; // ( -u, v, 1 ) pos z

      } else if ( face == 3.0 ) {

        direction = direction.zyx;
        direction.xz *= -1.0; // ( -1, v, -u ) neg x

      } else if ( face == 4.0 ) {

        direction = direction.xzy;
        direction.xy *= -1.0; // ( -u, -1, v ) neg y

      } else if ( face == 5.0 ) {

        direction.z *= -1.0; // ( u, v, -1 ) neg z

      }

      return direction;

    }

    void main() {

      vOutputDirection = getDirection( uv, faceIndex );
      gl_Position = vec4( position, 1.0 );

    }
  `}function a0(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let c=a.mapping,l=c===po||c===mo,d=c===fn||c===pn;if(l||d){let h=e.get(a),p=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return t===null&&(t=new ea(n)),h=l?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let f=a.image;return l&&f&&f.height>0||d&&f&&r(f)?(t===null&&(t=new ea(n)),h=l?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function r(a){let c=0,l=6;for(let d=0;d<l;d++)a[d]!==void 0&&c++;return c===l}function s(a){let c=a.target;c.removeEventListener("dispose",s);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function l0(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let r=t(i);return r===null&&zn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function c0(n,e,t,i){let r={},s=new WeakMap;function o(h){let p=h.target;p.index!==null&&e.remove(p.index);for(let g in p.attributes)e.remove(p.attributes[g]);p.removeEventListener("dispose",o),delete r[p.id];let f=s.get(p);f&&(e.remove(f),s.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(h,p){return r[p.id]===!0||(p.addEventListener("dispose",o),r[p.id]=!0,t.memory.geometries++),p}function c(h){let p=h.attributes;for(let f in p)e.update(p[f],n.ARRAY_BUFFER)}function l(h){let p=[],f=h.index,g=h.attributes.position,w=0;if(f!==null){let R=f.array;w=f.version;for(let T=0,M=R.length;T<M;T+=3){let F=R[T+0],E=R[T+1],U=R[T+2];p.push(F,E,E,U,U,F)}}else if(g!==void 0){let R=g.array;w=g.version;for(let T=0,M=R.length/3-1;T<M;T+=3){let F=T+0,E=T+1,U=T+2;p.push(F,E,E,U,U,F)}}else return;let m=new(dl(p)?Sr:br)(p,1);m.version=w;let u=s.get(h);u&&e.remove(u),s.set(h,m)}function d(h){let p=s.get(h);if(p){let f=h.index;f!==null&&p.version<f.version&&l(h)}else l(h);return s.get(h)}return{get:a,update:c,getWireframeAttribute:d}}function h0(n,e,t){let i;function r(p){i=p}let s,o;function a(p){s=p.type,o=p.bytesPerElement}function c(p,f){n.drawElements(i,f,s,p*o),t.update(f,i,1)}function l(p,f,g){g!==0&&(n.drawElementsInstanced(i,f,s,p*o,g),t.update(f,i,g))}function d(p,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,s,p,0,g);let m=0;for(let u=0;u<g;u++)m+=f[u];t.update(m,i,1)}function h(p,f,g,w){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let u=0;u<p.length;u++)l(p[u]/o,f[u],w[u]);else{m.multiDrawElementsInstancedWEBGL(i,f,0,s,p,0,w,0,g);let u=0;for(let R=0;R<g;R++)u+=f[R]*w[R];t.update(u,i,1)}}this.setMode=r,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=d,this.renderMultiDrawInstances=h}function d0(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function u0(n,e,t){let i=new WeakMap,r=new vt;function s(o,a,c){let l=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=d!==void 0?d.length:0,p=i.get(a);if(p===void 0||p.count!==h){let y=function(){U.dispose(),i.delete(a),a.removeEventListener("dispose",y)};p!==void 0&&p.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,w=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],u=a.morphAttributes.normal||[],R=a.morphAttributes.color||[],T=0;f===!0&&(T=1),g===!0&&(T=2),w===!0&&(T=3);let M=a.attributes.position.count*T,F=1;M>e.maxTextureSize&&(F=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let E=new Float32Array(M*F*4*h),U=new wr(E,M,F,h);U.type=Mi,U.needsUpdate=!0;let I=T*4;for(let x=0;x<h;x++){let C=m[x],z=u[x],X=R[x],G=M*F*4*x;for(let K=0;K<C.count;K++){let j=K*I;f===!0&&(r.fromBufferAttribute(C,K),E[G+j+0]=r.x,E[G+j+1]=r.y,E[G+j+2]=r.z,E[G+j+3]=0),g===!0&&(r.fromBufferAttribute(z,K),E[G+j+4]=r.x,E[G+j+5]=r.y,E[G+j+6]=r.z,E[G+j+7]=0),w===!0&&(r.fromBufferAttribute(X,K),E[G+j+8]=r.x,E[G+j+9]=r.y,E[G+j+10]=r.z,E[G+j+11]=X.itemSize===4?r.w:1)}}p={count:h,texture:U,size:new me(M,F)},i.set(a,p),a.addEventListener("dispose",y)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let w=0;w<l.length;w++)f+=l[w];let g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(n,"morphTargetBaseInfluence",g),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",p.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",p.size)}return{update:s}}function f0(n,e,t,i){let r=new WeakMap;function s(c){let l=i.render.frame,d=c.geometry,h=e.get(c,d);if(r.get(h)!==l&&(e.update(h),r.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),r.get(c)!==l&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,l))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==l&&(p.update(),r.set(p,l))}return h}function o(){r=new WeakMap}function a(c){let l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:s,dispose:o}}var Lh=new Zt,mh=new Rr(1,1),Uh=new wr,Nh=new Fs,Fh=new Er,_h=[],gh=[],yh=new Float32Array(16),xh=new Float32Array(9),vh=new Float32Array(4);function rr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,s=_h[r];if(s===void 0&&(s=new Float32Array(r),_h[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Tt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Et(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function ia(n,e){let t=gh[e];t===void 0&&(t=new Int32Array(e),gh[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function p0(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function m0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;n.uniform2fv(this.addr,e),Et(t,e)}}function _0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Tt(t,e))return;n.uniform3fv(this.addr,e),Et(t,e)}}function g0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;n.uniform4fv(this.addr,e),Et(t,e)}}function y0(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Tt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Et(t,e)}else{if(Tt(t,i))return;vh.set(i),n.uniformMatrix2fv(this.addr,!1,vh),Et(t,i)}}function x0(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Tt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Et(t,e)}else{if(Tt(t,i))return;xh.set(i),n.uniformMatrix3fv(this.addr,!1,xh),Et(t,i)}}function v0(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Tt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Et(t,e)}else{if(Tt(t,i))return;yh.set(i),n.uniformMatrix4fv(this.addr,!1,yh),Et(t,i)}}function w0(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function M0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;n.uniform2iv(this.addr,e),Et(t,e)}}function b0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;n.uniform3iv(this.addr,e),Et(t,e)}}function S0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;n.uniform4iv(this.addr,e),Et(t,e)}}function T0(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function E0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;n.uniform2uiv(this.addr,e),Et(t,e)}}function A0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;n.uniform3uiv(this.addr,e),Et(t,e)}}function C0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;n.uniform4uiv(this.addr,e),Et(t,e)}}function R0(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(mh.compareFunction=ll,s=mh):s=Lh,t.setTexture2D(e||s,r)}function P0(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||Nh,r)}function I0(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||Fh,r)}function D0(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||Uh,r)}function L0(n){switch(n){case 5126:return p0;case 35664:return m0;case 35665:return _0;case 35666:return g0;case 35674:return y0;case 35675:return x0;case 35676:return v0;case 5124:case 35670:return w0;case 35667:case 35671:return M0;case 35668:case 35672:return b0;case 35669:case 35673:return S0;case 5125:return T0;case 36294:return E0;case 36295:return A0;case 36296:return C0;case 35678:case 36198:case 36298:case 36306:case 35682:return R0;case 35679:case 36299:case 36307:return P0;case 35680:case 36300:case 36308:case 36293:return I0;case 36289:case 36303:case 36311:case 36292:return D0}}function U0(n,e){n.uniform1fv(this.addr,e)}function N0(n,e){let t=rr(e,this.size,2);n.uniform2fv(this.addr,t)}function F0(n,e){let t=rr(e,this.size,3);n.uniform3fv(this.addr,t)}function k0(n,e){let t=rr(e,this.size,4);n.uniform4fv(this.addr,t)}function O0(n,e){let t=rr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function B0(n,e){let t=rr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function z0(n,e){let t=rr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function V0(n,e){n.uniform1iv(this.addr,e)}function G0(n,e){n.uniform2iv(this.addr,e)}function H0(n,e){n.uniform3iv(this.addr,e)}function W0(n,e){n.uniform4iv(this.addr,e)}function X0(n,e){n.uniform1uiv(this.addr,e)}function q0(n,e){n.uniform2uiv(this.addr,e)}function Y0(n,e){n.uniform3uiv(this.addr,e)}function Z0(n,e){n.uniform4uiv(this.addr,e)}function J0(n,e,t){let i=this.cache,r=e.length,s=ia(t,r);Tt(i,s)||(n.uniform1iv(this.addr,s),Et(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||Lh,s[o])}function K0(n,e,t){let i=this.cache,r=e.length,s=ia(t,r);Tt(i,s)||(n.uniform1iv(this.addr,s),Et(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||Nh,s[o])}function $0(n,e,t){let i=this.cache,r=e.length,s=ia(t,r);Tt(i,s)||(n.uniform1iv(this.addr,s),Et(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Fh,s[o])}function j0(n,e,t){let i=this.cache,r=e.length,s=ia(t,r);Tt(i,s)||(n.uniform1iv(this.addr,s),Et(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||Uh,s[o])}function Q0(n){switch(n){case 5126:return U0;case 35664:return N0;case 35665:return F0;case 35666:return k0;case 35674:return O0;case 35675:return B0;case 35676:return z0;case 5124:case 35670:return V0;case 35667:case 35671:return G0;case 35668:case 35672:return H0;case 35669:case 35673:return W0;case 5125:return X0;case 36294:return q0;case 36295:return Y0;case 36296:return Z0;case 35678:case 36198:case 36298:case 36306:case 35682:return J0;case 35679:case 36299:case 36307:return K0;case 35680:case 36300:case 36308:case 36293:return $0;case 36289:case 36303:case 36311:case 36292:return j0}}var bl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=L0(t.type)}},Sl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Q0(t.type)}},Tl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],i)}}},Ml=/(\w+)(\])?(\[|\.)?/g;function wh(n,e){n.seq.push(e),n.map[e.id]=e}function em(n,e,t){let i=n.name,r=i.length;for(Ml.lastIndex=0;;){let s=Ml.exec(i),o=Ml.lastIndex,a=s[1],c=s[2]==="]",l=s[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===r){wh(t,l===void 0?new bl(a,n,e):new Sl(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new Tl(a),wh(t,h)),t=h}}}var nr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);em(s,o,this)}}setValue(e,t,i,r){let s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&i.push(o)}return i}};function Mh(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var tm=37297,im=0;function nm(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}var bh=new He;function rm(n){tt._getMatrix(bh,tt.workingColorSpace,n);let e=`mat3( ${bh.elements.map(t=>t.toFixed(4))} )`;switch(tt.getTransfer(n)){case yr:return[e,"LinearTransferOETF"];case at:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Sh(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),s=(n.getShaderInfoLog(e)||"").trim();if(i&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+nm(n.getShaderSource(e),a)}else return s}function sm(n,e){let t=rm(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function om(n,e){let t;switch(e){case Fc:t="Linear";break;case kc:t="Reinhard";break;case Oc:t="Cineon";break;case Bc:t="ACESFilmic";break;case Vc:t="AgX";break;case Gc:t="Neutral";break;case zc:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Qo=new N;function am(){tt.getLuminanceCoefficients(Qo);let n=Qo.x.toFixed(4),e=Qo.y.toFixed(4),t=Qo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function lm(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(rs).join(`
`)}function cm(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function hm(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(e,r),o=s.name,a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function rs(n){return n!==""}function Th(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Eh(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var dm=/^[ \t]*#include +<([\w\d./]+)>/gm;function El(n){return n.replace(dm,fm)}var um=new Map;function fm(n,e){let t=Xe[e];if(t===void 0){let i=um.get(e);if(i!==void 0)t=Xe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return El(t)}var pm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ah(n){return n.replace(pm,mm)}function mm(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Ch(n){let e=`precision ${n.precision} float;
  precision ${n.precision} int;
  precision ${n.precision} sampler2D;
  precision ${n.precision} samplerCube;
  precision ${n.precision} sampler3D;
  precision ${n.precision} sampler2DArray;
  precision ${n.precision} sampler2DShadow;
  precision ${n.precision} samplerCubeShadow;
  precision ${n.precision} sampler2DArrayShadow;
  precision ${n.precision} isampler2D;
  precision ${n.precision} isampler3D;
  precision ${n.precision} isamplerCube;
  precision ${n.precision} isampler2DArray;
  precision ${n.precision} usampler2D;
  precision ${n.precision} usampler3D;
  precision ${n.precision} usamplerCube;
  precision ${n.precision} usampler2DArray;
  `;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function _m(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===qa?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===mc?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===wi&&(e="SHADOWMAP_TYPE_VSM"),e}function gm(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case fn:case pn:e="ENVMAP_TYPE_CUBE";break;case jr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function ym(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case pn:e="ENVMAP_MODE_REFRACTION";break}return e}function xm(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Ka:e="ENVMAP_BLENDING_MULTIPLY";break;case Uc:e="ENVMAP_BLENDING_MIX";break;case Nc:e="ENVMAP_BLENDING_ADD";break}return e}function vm(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function wm(n,e,t,i){let r=n.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,c=_m(t),l=gm(t),d=ym(t),h=xm(t),p=vm(t),f=lm(t),g=cm(s),w=r.createProgram(),m,u,R=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(rs).join(`
`),m.length>0&&(m+=`
`),u=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(rs).join(`
`),u.length>0&&(u+=`
`)):(m=[Ch(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(rs).join(`
`),u=[Ch(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+d:"",t.envMap?"#define "+h:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ui?"#define TONE_MAPPING":"",t.toneMapping!==Ui?Xe.tonemapping_pars_fragment:"",t.toneMapping!==Ui?om("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Xe.colorspace_pars_fragment,sm("linearToOutputTexel",t.outputColorSpace),am(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(rs).join(`
`)),o=El(o),o=Th(o,t),o=Eh(o,t),a=El(a),a=Th(a,t),a=Eh(a,t),o=Ah(o),a=Ah(a),t.isRawShaderMaterial!==!0&&(R=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,u=["#define varying in",t.glslVersion===cl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===cl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+u);let T=R+m+o,M=R+u+a,F=Mh(r,r.VERTEX_SHADER,T),E=Mh(r,r.FRAGMENT_SHADER,M);r.attachShader(w,F),r.attachShader(w,E),t.index0AttributeName!==void 0?r.bindAttribLocation(w,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(w,0,"position"),r.linkProgram(w);function U(C){if(n.debug.checkShaderErrors){let z=r.getProgramInfoLog(w)||"",X=r.getShaderInfoLog(F)||"",G=r.getShaderInfoLog(E)||"",K=z.trim(),j=X.trim(),he=G.trim(),ee=!0,ye=!0;if(r.getProgramParameter(w,r.LINK_STATUS)===!1)if(ee=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,w,F,E);else{let Se=Sh(r,F,"vertex"),Ee=Sh(r,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(w,r.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+K+`
`+Se+`
`+Ee)}else K!==""?console.warn("THREE.WebGLProgram: Program Info Log:",K):(j===""||he==="")&&(ye=!1);ye&&(C.diagnostics={runnable:ee,programLog:K,vertexShader:{log:j,prefix:m},fragmentShader:{log:he,prefix:u}})}r.deleteShader(F),r.deleteShader(E),I=new nr(r,w),y=hm(r,w)}let I;this.getUniforms=function(){return I===void 0&&U(this),I};let y;this.getAttributes=function(){return y===void 0&&U(this),y};let x=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=r.getProgramParameter(w,tm)),x},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(w),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=im++,this.cacheKey=e,this.usedTimes=1,this.program=w,this.vertexShader=F,this.fragmentShader=E,this}var Mm=0,Al=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Cl(e),t.set(e,i)),i}},Cl=class{constructor(e){this.id=Mm++,this.code=e,this.usedTimes=0}};function bm(n,e,t,i,r,s,o){let a=new Gn,c=new Al,l=new Set,d=[],h=r.logarithmicDepthBuffer,p=r.vertexTextures,f=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function w(y){return l.add(y),y===0?"uv":`uv${y}`}function m(y,x,C,z,X){let G=z.fog,K=X.geometry,j=y.isMeshStandardMaterial?z.environment:null,he=(y.isMeshStandardMaterial?t:e).get(y.envMap||j),ee=he&&he.mapping===jr?he.image.height:null,ye=g[y.type];y.precision!==null&&(f=r.getMaxPrecision(y.precision),f!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",f,"instead."));let Se=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Ee=Se!==void 0?Se.length:0,Ge=0;K.morphAttributes.position!==void 0&&(Ge=1),K.morphAttributes.normal!==void 0&&(Ge=2),K.morphAttributes.color!==void 0&&(Ge=3);let $e,it,Ze,ae;if(ye){let Le=bi[ye];$e=Le.vertexShader,it=Le.fragmentShader}else $e=y.vertexShader,it=y.fragmentShader,c.update(y),Ze=c.getVertexShaderID(y),ae=c.getFragmentShaderID(y);let se=n.getRenderTarget(),Ce=n.state.buffers.depth.getReversed(),Ne=X.isInstancedMesh===!0,Pe=X.isBatchedMesh===!0,qe=!!y.map,st=!!y.matcap,D=!!he,ue=!!y.aoMap,ce=!!y.lightMap,le=!!y.bumpMap,oe=!!y.normalMap,xe=!!y.displacementMap,pe=!!y.emissiveMap,ve=!!y.metalnessMap,Ve=!!y.roughnessMap,ke=y.anisotropy>0,A=y.clearcoat>0,v=y.dispersion>0,Y=y.iridescence>0,ne=y.sheen>0,de=y.transmission>0,re=ke&&!!y.anisotropyMap,Ie=A&&!!y.clearcoatMap,ge=A&&!!y.clearcoatNormalMap,we=A&&!!y.clearcoatRoughnessMap,De=Y&&!!y.iridescenceMap,fe=Y&&!!y.iridescenceThicknessMap,Te=ne&&!!y.sheenColorMap,_=ne&&!!y.sheenRoughnessMap,L=!!y.specularMap,B=!!y.specularColorMap,J=!!y.specularIntensityMap,S=de&&!!y.transmissionMap,V=de&&!!y.thicknessMap,O=!!y.gradientMap,P=!!y.alphaMap,W=y.alphaTest>0,k=!!y.alphaHash,ie=!!y.extensions,Z=Ui;y.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(Z=n.toneMapping);let Me={shaderID:ye,shaderType:y.type,shaderName:y.name,vertexShader:$e,fragmentShader:it,defines:y.defines,customVertexShaderID:Ze,customFragmentShaderID:ae,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:f,batching:Pe,batchingColor:Pe&&X._colorsTexture!==null,instancing:Ne,instancingColor:Ne&&X.instanceColor!==null,instancingMorph:Ne&&X.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:se===null?n.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:cn,alphaToCoverage:!!y.alphaToCoverage,map:qe,matcap:st,envMap:D,envMapMode:D&&he.mapping,envMapCubeUVHeight:ee,aoMap:ue,lightMap:ce,bumpMap:le,normalMap:oe,displacementMap:p&&xe,emissiveMap:pe,normalMapObjectSpace:oe&&y.normalMapType===qc,normalMapTangentSpace:oe&&y.normalMapType===al,metalnessMap:ve,roughnessMap:Ve,anisotropy:ke,anisotropyMap:re,clearcoat:A,clearcoatMap:Ie,clearcoatNormalMap:ge,clearcoatRoughnessMap:we,dispersion:v,iridescence:Y,iridescenceMap:De,iridescenceThicknessMap:fe,sheen:ne,sheenColorMap:Te,sheenRoughnessMap:_,specularMap:L,specularColorMap:B,specularIntensityMap:J,transmission:de,transmissionMap:S,thicknessMap:V,gradientMap:O,opaque:y.transparent===!1&&y.blending===an&&y.alphaToCoverage===!1,alphaMap:P,alphaTest:W,alphaHash:k,combine:y.combine,mapUv:qe&&w(y.map.channel),aoMapUv:ue&&w(y.aoMap.channel),lightMapUv:ce&&w(y.lightMap.channel),bumpMapUv:le&&w(y.bumpMap.channel),normalMapUv:oe&&w(y.normalMap.channel),displacementMapUv:xe&&w(y.displacementMap.channel),emissiveMapUv:pe&&w(y.emissiveMap.channel),metalnessMapUv:ve&&w(y.metalnessMap.channel),roughnessMapUv:Ve&&w(y.roughnessMap.channel),anisotropyMapUv:re&&w(y.anisotropyMap.channel),clearcoatMapUv:Ie&&w(y.clearcoatMap.channel),clearcoatNormalMapUv:ge&&w(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:we&&w(y.clearcoatRoughnessMap.channel),iridescenceMapUv:De&&w(y.iridescenceMap.channel),iridescenceThicknessMapUv:fe&&w(y.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&w(y.sheenColorMap.channel),sheenRoughnessMapUv:_&&w(y.sheenRoughnessMap.channel),specularMapUv:L&&w(y.specularMap.channel),specularColorMapUv:B&&w(y.specularColorMap.channel),specularIntensityMapUv:J&&w(y.specularIntensityMap.channel),transmissionMapUv:S&&w(y.transmissionMap.channel),thicknessMapUv:V&&w(y.thicknessMap.channel),alphaMapUv:P&&w(y.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(oe||ke),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:X.isPoints===!0&&!!K.attributes.uv&&(qe||P),fog:!!G,useFog:y.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:y.flatShading===!0&&y.wireframe===!1,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Ce,skinning:X.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:Ee,morphTextureStride:Ge,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&C.length>0,shadowMapType:n.shadowMap.type,toneMapping:Z,decodeVideoTexture:qe&&y.map.isVideoTexture===!0&&tt.getTransfer(y.map.colorSpace)===at,decodeVideoTextureEmissive:pe&&y.emissiveMap.isVideoTexture===!0&&tt.getTransfer(y.emissiveMap.colorSpace)===at,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Wt,flipSided:y.side===Ht,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:ie&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ie&&y.extensions.multiDraw===!0||Pe)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Me.vertexUv1s=l.has(1),Me.vertexUv2s=l.has(2),Me.vertexUv3s=l.has(3),l.clear(),Me}function u(y){let x=[];if(y.shaderID?x.push(y.shaderID):(x.push(y.customVertexShaderID),x.push(y.customFragmentShaderID)),y.defines!==void 0)for(let C in y.defines)x.push(C),x.push(y.defines[C]);return y.isRawShaderMaterial===!1&&(R(x,y),T(x,y),x.push(n.outputColorSpace)),x.push(y.customProgramCacheKey),x.join()}function R(y,x){y.push(x.precision),y.push(x.outputColorSpace),y.push(x.envMapMode),y.push(x.envMapCubeUVHeight),y.push(x.mapUv),y.push(x.alphaMapUv),y.push(x.lightMapUv),y.push(x.aoMapUv),y.push(x.bumpMapUv),y.push(x.normalMapUv),y.push(x.displacementMapUv),y.push(x.emissiveMapUv),y.push(x.metalnessMapUv),y.push(x.roughnessMapUv),y.push(x.anisotropyMapUv),y.push(x.clearcoatMapUv),y.push(x.clearcoatNormalMapUv),y.push(x.clearcoatRoughnessMapUv),y.push(x.iridescenceMapUv),y.push(x.iridescenceThicknessMapUv),y.push(x.sheenColorMapUv),y.push(x.sheenRoughnessMapUv),y.push(x.specularMapUv),y.push(x.specularColorMapUv),y.push(x.specularIntensityMapUv),y.push(x.transmissionMapUv),y.push(x.thicknessMapUv),y.push(x.combine),y.push(x.fogExp2),y.push(x.sizeAttenuation),y.push(x.morphTargetsCount),y.push(x.morphAttributeCount),y.push(x.numDirLights),y.push(x.numPointLights),y.push(x.numSpotLights),y.push(x.numSpotLightMaps),y.push(x.numHemiLights),y.push(x.numRectAreaLights),y.push(x.numDirLightShadows),y.push(x.numPointLightShadows),y.push(x.numSpotLightShadows),y.push(x.numSpotLightShadowsWithMaps),y.push(x.numLightProbes),y.push(x.shadowMapType),y.push(x.toneMapping),y.push(x.numClippingPlanes),y.push(x.numClipIntersection),y.push(x.depthPacking)}function T(y,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),x.gradientMap&&a.enable(22),y.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.reversedDepthBuffer&&a.enable(4),x.skinning&&a.enable(5),x.morphTargets&&a.enable(6),x.morphNormals&&a.enable(7),x.morphColors&&a.enable(8),x.premultipliedAlpha&&a.enable(9),x.shadowMapEnabled&&a.enable(10),x.doubleSided&&a.enable(11),x.flipSided&&a.enable(12),x.useDepthPacking&&a.enable(13),x.dithering&&a.enable(14),x.transmission&&a.enable(15),x.sheen&&a.enable(16),x.opaque&&a.enable(17),x.pointsUvs&&a.enable(18),x.decodeVideoTexture&&a.enable(19),x.decodeVideoTextureEmissive&&a.enable(20),x.alphaToCoverage&&a.enable(21),y.push(a.mask)}function M(y){let x=g[y.type],C;if(x){let z=bi[x];C=nh.clone(z.uniforms)}else C=y.uniforms;return C}function F(y,x){let C;for(let z=0,X=d.length;z<X;z++){let G=d[z];if(G.cacheKey===x){C=G,++C.usedTimes;break}}return C===void 0&&(C=new wm(n,x,y,s),d.push(C)),C}function E(y){if(--y.usedTimes===0){let x=d.indexOf(y);d[x]=d[d.length-1],d.pop(),y.destroy()}}function U(y){c.remove(y)}function I(){c.dispose()}return{getParameters:m,getProgramCacheKey:u,getUniforms:M,acquireProgram:F,releaseProgram:E,releaseShaderCache:U,programs:d,dispose:I}}function Sm(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function r(o,a,c){n.get(o)[a]=c}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function Tm(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Rh(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Ph(){let n=[],e=0,t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(h,p,f,g,w,m){let u=n[e];return u===void 0?(u={id:h.id,object:h,geometry:p,material:f,groupOrder:g,renderOrder:h.renderOrder,z:w,group:m},n[e]=u):(u.id=h.id,u.object=h,u.geometry=p,u.material=f,u.groupOrder=g,u.renderOrder=h.renderOrder,u.z=w,u.group=m),e++,u}function a(h,p,f,g,w,m){let u=o(h,p,f,g,w,m);f.transmission>0?i.push(u):f.transparent===!0?r.push(u):t.push(u)}function c(h,p,f,g,w,m){let u=o(h,p,f,g,w,m);f.transmission>0?i.unshift(u):f.transparent===!0?r.unshift(u):t.unshift(u)}function l(h,p){t.length>1&&t.sort(h||Tm),i.length>1&&i.sort(p||Rh),r.length>1&&r.sort(p||Rh)}function d(){for(let h=e,p=n.length;h<p;h++){let f=n[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:c,finish:d,sort:l}}function Em(){let n=new WeakMap;function e(i,r){let s=n.get(i),o;return s===void 0?(o=new Ph,n.set(i,[o])):r>=s.length?(o=new Ph,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function Am(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new N,color:new Ye};break;case"SpotLight":t={position:new N,direction:new N,color:new Ye,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new Ye,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new Ye,groundColor:new Ye};break;case"RectAreaLight":t={color:new Ye,position:new N,halfWidth:new N,halfHeight:new N};break}return n[e.id]=t,t}}}function Cm(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var Rm=0;function Pm(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Im(n){let e=new Am,t=Cm(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new N);let r=new N,s=new _t,o=new _t;function a(l){let d=0,h=0,p=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let f=0,g=0,w=0,m=0,u=0,R=0,T=0,M=0,F=0,E=0,U=0;l.sort(Pm);for(let y=0,x=l.length;y<x;y++){let C=l[y],z=C.color,X=C.intensity,G=C.distance,K=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)d+=z.r*X,h+=z.g*X,p+=z.b*X;else if(C.isLightProbe){for(let j=0;j<9;j++)i.probe[j].addScaledVector(C.sh.coefficients[j],X);U++}else if(C.isDirectionalLight){let j=e.get(C);if(j.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let he=C.shadow,ee=t.get(C);ee.shadowIntensity=he.intensity,ee.shadowBias=he.bias,ee.shadowNormalBias=he.normalBias,ee.shadowRadius=he.radius,ee.shadowMapSize=he.mapSize,i.directionalShadow[f]=ee,i.directionalShadowMap[f]=K,i.directionalShadowMatrix[f]=C.shadow.matrix,R++}i.directional[f]=j,f++}else if(C.isSpotLight){let j=e.get(C);j.position.setFromMatrixPosition(C.matrixWorld),j.color.copy(z).multiplyScalar(X),j.distance=G,j.coneCos=Math.cos(C.angle),j.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),j.decay=C.decay,i.spot[w]=j;let he=C.shadow;if(C.map&&(i.spotLightMap[F]=C.map,F++,he.updateMatrices(C),C.castShadow&&E++),i.spotLightMatrix[w]=he.matrix,C.castShadow){let ee=t.get(C);ee.shadowIntensity=he.intensity,ee.shadowBias=he.bias,ee.shadowNormalBias=he.normalBias,ee.shadowRadius=he.radius,ee.shadowMapSize=he.mapSize,i.spotShadow[w]=ee,i.spotShadowMap[w]=K,M++}w++}else if(C.isRectAreaLight){let j=e.get(C);j.color.copy(z).multiplyScalar(X),j.halfWidth.set(C.width*.5,0,0),j.halfHeight.set(0,C.height*.5,0),i.rectArea[m]=j,m++}else if(C.isPointLight){let j=e.get(C);if(j.color.copy(C.color).multiplyScalar(C.intensity),j.distance=C.distance,j.decay=C.decay,C.castShadow){let he=C.shadow,ee=t.get(C);ee.shadowIntensity=he.intensity,ee.shadowBias=he.bias,ee.shadowNormalBias=he.normalBias,ee.shadowRadius=he.radius,ee.shadowMapSize=he.mapSize,ee.shadowCameraNear=he.camera.near,ee.shadowCameraFar=he.camera.far,i.pointShadow[g]=ee,i.pointShadowMap[g]=K,i.pointShadowMatrix[g]=C.shadow.matrix,T++}i.point[g]=j,g++}else if(C.isHemisphereLight){let j=e.get(C);j.skyColor.copy(C.color).multiplyScalar(X),j.groundColor.copy(C.groundColor).multiplyScalar(X),i.hemi[u]=j,u++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=be.LTC_FLOAT_1,i.rectAreaLTC2=be.LTC_FLOAT_2):(i.rectAreaLTC1=be.LTC_HALF_1,i.rectAreaLTC2=be.LTC_HALF_2)),i.ambient[0]=d,i.ambient[1]=h,i.ambient[2]=p;let I=i.hash;(I.directionalLength!==f||I.pointLength!==g||I.spotLength!==w||I.rectAreaLength!==m||I.hemiLength!==u||I.numDirectionalShadows!==R||I.numPointShadows!==T||I.numSpotShadows!==M||I.numSpotMaps!==F||I.numLightProbes!==U)&&(i.directional.length=f,i.spot.length=w,i.rectArea.length=m,i.point.length=g,i.hemi.length=u,i.directionalShadow.length=R,i.directionalShadowMap.length=R,i.pointShadow.length=T,i.pointShadowMap.length=T,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=R,i.pointShadowMatrix.length=T,i.spotLightMatrix.length=M+F-E,i.spotLightMap.length=F,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=U,I.directionalLength=f,I.pointLength=g,I.spotLength=w,I.rectAreaLength=m,I.hemiLength=u,I.numDirectionalShadows=R,I.numPointShadows=T,I.numSpotShadows=M,I.numSpotMaps=F,I.numLightProbes=U,i.version=Rm++)}function c(l,d){let h=0,p=0,f=0,g=0,w=0,m=d.matrixWorldInverse;for(let u=0,R=l.length;u<R;u++){let T=l[u];if(T.isDirectionalLight){let M=i.directional[h];M.direction.setFromMatrixPosition(T.matrixWorld),r.setFromMatrixPosition(T.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),h++}else if(T.isSpotLight){let M=i.spot[f];M.position.setFromMatrixPosition(T.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(T.matrixWorld),r.setFromMatrixPosition(T.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),f++}else if(T.isRectAreaLight){let M=i.rectArea[g];M.position.setFromMatrixPosition(T.matrixWorld),M.position.applyMatrix4(m),o.identity(),s.copy(T.matrixWorld),s.premultiply(m),o.extractRotation(s),M.halfWidth.set(T.width*.5,0,0),M.halfHeight.set(0,T.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),g++}else if(T.isPointLight){let M=i.point[p];M.position.setFromMatrixPosition(T.matrixWorld),M.position.applyMatrix4(m),p++}else if(T.isHemisphereLight){let M=i.hemi[w];M.direction.setFromMatrixPosition(T.matrixWorld),M.direction.transformDirection(m),w++}}}return{setup:a,setupView:c,state:i}}function Ih(n){let e=new Im(n),t=[],i=[];function r(d){l.camera=d,t.length=0,i.length=0}function s(d){t.push(d)}function o(d){i.push(d)}function a(){e.setup(t)}function c(d){e.setupView(t,d)}let l={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:l,setupLights:a,setupLightsView:c,pushLight:s,pushShadow:o}}function Dm(n){let e=new WeakMap;function t(r,s=0){let o=e.get(r),a;return o===void 0?(a=new Ih(n),e.set(r,[a])):s>=o.length?(a=new Ih(n),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var Lm=`void main() {
  gl_Position = vec4( position, 1.0 );
}`,Um=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
  const float samples = float( VSM_SAMPLES );
  float mean = 0.0;
  float squared_mean = 0.0;
  float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
  float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
  for ( float i = 0.0; i < samples; i ++ ) {
    float uvOffset = uvStart + i * uvStride;
    #ifdef HORIZONTAL_PASS
      vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
      mean += distribution.x;
      squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
    #else
      float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
      mean += depth;
      squared_mean += depth * depth;
    #endif
  }
  mean = mean / samples;
  squared_mean = squared_mean / samples;
  float std_dev = sqrt( squared_mean - mean * mean );
  gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Nm(n,e,t){let i=new Wn,r=new me,s=new me,o=new vt,a=new Zs({depthPacking:Xc}),c=new Js,l={},d=t.maxTextureSize,h={[Pi]:Ht,[Ht]:Pi,[Wt]:Wt},p=new mi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new me},radius:{value:4}},vertexShader:Lm,fragmentShader:Um}),f=p.clone();f.defines.HORIZONTAL_PASS=1;let g=new Pt;g.setAttribute("position",new Gt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let w=new Ke(g,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=qa;let u=this.type;this.render=function(E,U,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;let y=n.getRenderTarget(),x=n.getActiveCubeFace(),C=n.getActiveMipmapLevel(),z=n.state;z.setBlending(Li),z.buffers.depth.getReversed()===!0?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let X=u!==wi&&this.type===wi,G=u===wi&&this.type!==wi;for(let K=0,j=E.length;K<j;K++){let he=E[K],ee=he.shadow;if(ee===void 0){console.warn("THREE.WebGLShadowMap:",he,"has no shadow.");continue}if(ee.autoUpdate===!1&&ee.needsUpdate===!1)continue;r.copy(ee.mapSize);let ye=ee.getFrameExtents();if(r.multiply(ye),s.copy(ee.mapSize),(r.x>d||r.y>d)&&(r.x>d&&(s.x=Math.floor(d/ye.x),r.x=s.x*ye.x,ee.mapSize.x=s.x),r.y>d&&(s.y=Math.floor(d/ye.y),r.y=s.y*ye.y,ee.mapSize.y=s.y)),ee.map===null||X===!0||G===!0){let Ee=this.type!==wi?{minFilter:Yt,magFilter:Yt}:{};ee.map!==null&&ee.map.dispose(),ee.map=new xi(r.x,r.y,Ee),ee.map.texture.name=he.name+".shadowMap",ee.camera.updateProjectionMatrix()}n.setRenderTarget(ee.map),n.clear();let Se=ee.getViewportCount();for(let Ee=0;Ee<Se;Ee++){let Ge=ee.getViewport(Ee);o.set(s.x*Ge.x,s.y*Ge.y,s.x*Ge.z,s.y*Ge.w),z.viewport(o),ee.updateMatrices(he,Ee),i=ee.getFrustum(),M(U,I,ee.camera,he,this.type)}ee.isPointLightShadow!==!0&&this.type===wi&&R(ee,I),ee.needsUpdate=!1}u=this.type,m.needsUpdate=!1,n.setRenderTarget(y,x,C)};function R(E,U){let I=e.update(w);p.defines.VSM_SAMPLES!==E.blurSamples&&(p.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,p.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new xi(r.x,r.y)),p.uniforms.shadow_pass.value=E.map.texture,p.uniforms.resolution.value=E.mapSize,p.uniforms.radius.value=E.radius,n.setRenderTarget(E.mapPass),n.clear(),n.renderBufferDirect(U,null,I,p,w,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,n.setRenderTarget(E.map),n.clear(),n.renderBufferDirect(U,null,I,f,w,null)}function T(E,U,I,y){let x=null,C=I.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(C!==void 0)x=C;else if(x=I.isPointLight===!0?c:a,n.localClippingEnabled&&U.clipShadows===!0&&Array.isArray(U.clippingPlanes)&&U.clippingPlanes.length!==0||U.displacementMap&&U.displacementScale!==0||U.alphaMap&&U.alphaTest>0||U.map&&U.alphaTest>0||U.alphaToCoverage===!0){let z=x.uuid,X=U.uuid,G=l[z];G===void 0&&(G={},l[z]=G);let K=G[X];K===void 0&&(K=x.clone(),G[X]=K,U.addEventListener("dispose",F)),x=K}if(x.visible=U.visible,x.wireframe=U.wireframe,y===wi?x.side=U.shadowSide!==null?U.shadowSide:U.side:x.side=U.shadowSide!==null?U.shadowSide:h[U.side],x.alphaMap=U.alphaMap,x.alphaTest=U.alphaToCoverage===!0?.5:U.alphaTest,x.map=U.map,x.clipShadows=U.clipShadows,x.clippingPlanes=U.clippingPlanes,x.clipIntersection=U.clipIntersection,x.displacementMap=U.displacementMap,x.displacementScale=U.displacementScale,x.displacementBias=U.displacementBias,x.wireframeLinewidth=U.wireframeLinewidth,x.linewidth=U.linewidth,I.isPointLight===!0&&x.isMeshDistanceMaterial===!0){let z=n.properties.get(x);z.light=I}return x}function M(E,U,I,y,x){if(E.visible===!1)return;if(E.layers.test(U.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&x===wi)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,E.matrixWorld);let X=e.update(E),G=E.material;if(Array.isArray(G)){let K=X.groups;for(let j=0,he=K.length;j<he;j++){let ee=K[j],ye=G[ee.materialIndex];if(ye&&ye.visible){let Se=T(E,ye,y,x);E.onBeforeShadow(n,E,U,I,X,Se,ee),n.renderBufferDirect(I,null,X,Se,E,ee),E.onAfterShadow(n,E,U,I,X,Se,ee)}}}else if(G.visible){let K=T(E,G,y,x);E.onBeforeShadow(n,E,U,I,X,K,null),n.renderBufferDirect(I,null,X,K,E,null),E.onAfterShadow(n,E,U,I,X,K,null)}}let z=E.children;for(let X=0,G=z.length;X<G;X++)M(z[X],U,I,y,x)}function F(E){E.target.removeEventListener("dispose",F);for(let I in l){let y=l[I],x=E.target.uuid;x in y&&(y[x].dispose(),delete y[x])}}}var Fm={[oo]:ao,[lo]:uo,[co]:fo,[ln]:ho,[ao]:oo,[uo]:lo,[fo]:co,[ho]:ln};function km(n,e){function t(){let S=!1,V=new vt,O=null,P=new vt(0,0,0,0);return{setMask:function(W){O!==W&&!S&&(n.colorMask(W,W,W,W),O=W)},setLocked:function(W){S=W},setClear:function(W,k,ie,Z,Me){Me===!0&&(W*=Z,k*=Z,ie*=Z),V.set(W,k,ie,Z),P.equals(V)===!1&&(n.clearColor(W,k,ie,Z),P.copy(V))},reset:function(){S=!1,O=null,P.set(-1,0,0,0)}}}function i(){let S=!1,V=!1,O=null,P=null,W=null;return{setReversed:function(k){if(V!==k){let ie=e.get("EXT_clip_control");k?ie.clipControlEXT(ie.LOWER_LEFT_EXT,ie.ZERO_TO_ONE_EXT):ie.clipControlEXT(ie.LOWER_LEFT_EXT,ie.NEGATIVE_ONE_TO_ONE_EXT),V=k;let Z=W;W=null,this.setClear(Z)}},getReversed:function(){return V},setTest:function(k){k?se(n.DEPTH_TEST):Ce(n.DEPTH_TEST)},setMask:function(k){O!==k&&!S&&(n.depthMask(k),O=k)},setFunc:function(k){if(V&&(k=Fm[k]),P!==k){switch(k){case oo:n.depthFunc(n.NEVER);break;case ao:n.depthFunc(n.ALWAYS);break;case lo:n.depthFunc(n.LESS);break;case ln:n.depthFunc(n.LEQUAL);break;case co:n.depthFunc(n.EQUAL);break;case ho:n.depthFunc(n.GEQUAL);break;case uo:n.depthFunc(n.GREATER);break;case fo:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}P=k}},setLocked:function(k){S=k},setClear:function(k){W!==k&&(V&&(k=1-k),n.clearDepth(k),W=k)},reset:function(){S=!1,O=null,P=null,W=null,V=!1}}}function r(){let S=!1,V=null,O=null,P=null,W=null,k=null,ie=null,Z=null,Me=null;return{setTest:function(Le){S||(Le?se(n.STENCIL_TEST):Ce(n.STENCIL_TEST))},setMask:function(Le){V!==Le&&!S&&(n.stencilMask(Le),V=Le)},setFunc:function(Le,ct,ot){(O!==Le||P!==ct||W!==ot)&&(n.stencilFunc(Le,ct,ot),O=Le,P=ct,W=ot)},setOp:function(Le,ct,ot){(k!==Le||ie!==ct||Z!==ot)&&(n.stencilOp(Le,ct,ot),k=Le,ie=ct,Z=ot)},setLocked:function(Le){S=Le},setClear:function(Le){Me!==Le&&(n.clearStencil(Le),Me=Le)},reset:function(){S=!1,V=null,O=null,P=null,W=null,k=null,ie=null,Z=null,Me=null}}}let s=new t,o=new i,a=new r,c=new WeakMap,l=new WeakMap,d={},h={},p=new WeakMap,f=[],g=null,w=!1,m=null,u=null,R=null,T=null,M=null,F=null,E=null,U=new Ye(0,0,0),I=0,y=!1,x=null,C=null,z=null,X=null,G=null,K=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,he=0,ee=n.getParameter(n.VERSION);ee.indexOf("WebGL")!==-1?(he=parseFloat(/^WebGL (\d)/.exec(ee)[1]),j=he>=1):ee.indexOf("OpenGL ES")!==-1&&(he=parseFloat(/^OpenGL ES (\d)/.exec(ee)[1]),j=he>=2);let ye=null,Se={},Ee=n.getParameter(n.SCISSOR_BOX),Ge=n.getParameter(n.VIEWPORT),$e=new vt().fromArray(Ee),it=new vt().fromArray(Ge);function Ze(S,V,O,P){let W=new Uint8Array(4),k=n.createTexture();n.bindTexture(S,k),n.texParameteri(S,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(S,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let ie=0;ie<O;ie++)S===n.TEXTURE_3D||S===n.TEXTURE_2D_ARRAY?n.texImage3D(V,0,n.RGBA,1,1,P,0,n.RGBA,n.UNSIGNED_BYTE,W):n.texImage2D(V+ie,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,W);return k}let ae={};ae[n.TEXTURE_2D]=Ze(n.TEXTURE_2D,n.TEXTURE_2D,1),ae[n.TEXTURE_CUBE_MAP]=Ze(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),ae[n.TEXTURE_2D_ARRAY]=Ze(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ae[n.TEXTURE_3D]=Ze(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),se(n.DEPTH_TEST),o.setFunc(ln),le(!1),oe(Xa),se(n.CULL_FACE),ue(Li);function se(S){d[S]!==!0&&(n.enable(S),d[S]=!0)}function Ce(S){d[S]!==!1&&(n.disable(S),d[S]=!1)}function Ne(S,V){return h[S]!==V?(n.bindFramebuffer(S,V),h[S]=V,S===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=V),S===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=V),!0):!1}function Pe(S,V){let O=f,P=!1;if(S){O=p.get(V),O===void 0&&(O=[],p.set(V,O));let W=S.textures;if(O.length!==W.length||O[0]!==n.COLOR_ATTACHMENT0){for(let k=0,ie=W.length;k<ie;k++)O[k]=n.COLOR_ATTACHMENT0+k;O.length=W.length,P=!0}}else O[0]!==n.BACK&&(O[0]=n.BACK,P=!0);P&&n.drawBuffers(O)}function qe(S){return g!==S?(n.useProgram(S),g=S,!0):!1}let st={[Xi]:n.FUNC_ADD,[gc]:n.FUNC_SUBTRACT,[yc]:n.FUNC_REVERSE_SUBTRACT};st[xc]=n.MIN,st[vc]=n.MAX;let D={[wc]:n.ZERO,[Mc]:n.ONE,[bc]:n.SRC_COLOR,[Ps]:n.SRC_ALPHA,[Rc]:n.SRC_ALPHA_SATURATE,[Ac]:n.DST_COLOR,[Tc]:n.DST_ALPHA,[Sc]:n.ONE_MINUS_SRC_COLOR,[Is]:n.ONE_MINUS_SRC_ALPHA,[Cc]:n.ONE_MINUS_DST_COLOR,[Ec]:n.ONE_MINUS_DST_ALPHA,[Pc]:n.CONSTANT_COLOR,[Ic]:n.ONE_MINUS_CONSTANT_COLOR,[Dc]:n.CONSTANT_ALPHA,[Lc]:n.ONE_MINUS_CONSTANT_ALPHA};function ue(S,V,O,P,W,k,ie,Z,Me,Le){if(S===Li){w===!0&&(Ce(n.BLEND),w=!1);return}if(w===!1&&(se(n.BLEND),w=!0),S!==_c){if(S!==m||Le!==y){if((u!==Xi||M!==Xi)&&(n.blendEquation(n.FUNC_ADD),u=Xi,M=Xi),Le)switch(S){case an:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ya:n.blendFunc(n.ONE,n.ONE);break;case Za:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Ja:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",S);break}else switch(S){case an:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ya:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Za:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ja:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",S);break}R=null,T=null,F=null,E=null,U.set(0,0,0),I=0,m=S,y=Le}return}W=W||V,k=k||O,ie=ie||P,(V!==u||W!==M)&&(n.blendEquationSeparate(st[V],st[W]),u=V,M=W),(O!==R||P!==T||k!==F||ie!==E)&&(n.blendFuncSeparate(D[O],D[P],D[k],D[ie]),R=O,T=P,F=k,E=ie),(Z.equals(U)===!1||Me!==I)&&(n.blendColor(Z.r,Z.g,Z.b,Me),U.copy(Z),I=Me),m=S,y=!1}function ce(S,V){S.side===Wt?Ce(n.CULL_FACE):se(n.CULL_FACE);let O=S.side===Ht;V&&(O=!O),le(O),S.blending===an&&S.transparent===!1?ue(Li):ue(S.blending,S.blendEquation,S.blendSrc,S.blendDst,S.blendEquationAlpha,S.blendSrcAlpha,S.blendDstAlpha,S.blendColor,S.blendAlpha,S.premultipliedAlpha),o.setFunc(S.depthFunc),o.setTest(S.depthTest),o.setMask(S.depthWrite),s.setMask(S.colorWrite);let P=S.stencilWrite;a.setTest(P),P&&(a.setMask(S.stencilWriteMask),a.setFunc(S.stencilFunc,S.stencilRef,S.stencilFuncMask),a.setOp(S.stencilFail,S.stencilZFail,S.stencilZPass)),pe(S.polygonOffset,S.polygonOffsetFactor,S.polygonOffsetUnits),S.alphaToCoverage===!0?se(n.SAMPLE_ALPHA_TO_COVERAGE):Ce(n.SAMPLE_ALPHA_TO_COVERAGE)}function le(S){x!==S&&(S?n.frontFace(n.CW):n.frontFace(n.CCW),x=S)}function oe(S){S!==fc?(se(n.CULL_FACE),S!==C&&(S===Xa?n.cullFace(n.BACK):S===pc?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ce(n.CULL_FACE),C=S}function xe(S){S!==z&&(j&&n.lineWidth(S),z=S)}function pe(S,V,O){S?(se(n.POLYGON_OFFSET_FILL),(X!==V||G!==O)&&(n.polygonOffset(V,O),X=V,G=O)):Ce(n.POLYGON_OFFSET_FILL)}function ve(S){S?se(n.SCISSOR_TEST):Ce(n.SCISSOR_TEST)}function Ve(S){S===void 0&&(S=n.TEXTURE0+K-1),ye!==S&&(n.activeTexture(S),ye=S)}function ke(S,V,O){O===void 0&&(ye===null?O=n.TEXTURE0+K-1:O=ye);let P=Se[O];P===void 0&&(P={type:void 0,texture:void 0},Se[O]=P),(P.type!==S||P.texture!==V)&&(ye!==O&&(n.activeTexture(O),ye=O),n.bindTexture(S,V||ae[S]),P.type=S,P.texture=V)}function A(){let S=Se[ye];S!==void 0&&S.type!==void 0&&(n.bindTexture(S.type,null),S.type=void 0,S.texture=void 0)}function v(){try{n.compressedTexImage2D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function Y(){try{n.compressedTexImage3D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function ne(){try{n.texSubImage2D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function de(){try{n.texSubImage3D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function re(){try{n.compressedTexSubImage2D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function Ie(){try{n.compressedTexSubImage3D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function ge(){try{n.texStorage2D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function we(){try{n.texStorage3D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function De(){try{n.texImage2D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function fe(){try{n.texImage3D(...arguments)}catch(S){console.error("THREE.WebGLState:",S)}}function Te(S){$e.equals(S)===!1&&(n.scissor(S.x,S.y,S.z,S.w),$e.copy(S))}function _(S){it.equals(S)===!1&&(n.viewport(S.x,S.y,S.z,S.w),it.copy(S))}function L(S,V){let O=l.get(V);O===void 0&&(O=new WeakMap,l.set(V,O));let P=O.get(S);P===void 0&&(P=n.getUniformBlockIndex(V,S.name),O.set(S,P))}function B(S,V){let P=l.get(V).get(S);c.get(V)!==P&&(n.uniformBlockBinding(V,P,S.__bindingPointIndex),c.set(V,P))}function J(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),d={},ye=null,Se={},h={},p=new WeakMap,f=[],g=null,w=!1,m=null,u=null,R=null,T=null,M=null,F=null,E=null,U=new Ye(0,0,0),I=0,y=!1,x=null,C=null,z=null,X=null,G=null,$e.set(0,0,n.canvas.width,n.canvas.height),it.set(0,0,n.canvas.width,n.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:se,disable:Ce,bindFramebuffer:Ne,drawBuffers:Pe,useProgram:qe,setBlending:ue,setMaterial:ce,setFlipSided:le,setCullFace:oe,setLineWidth:xe,setPolygonOffset:pe,setScissorTest:ve,activeTexture:Ve,bindTexture:ke,unbindTexture:A,compressedTexImage2D:v,compressedTexImage3D:Y,texImage2D:De,texImage3D:fe,updateUBOMapping:L,uniformBlockBinding:B,texStorage2D:ge,texStorage3D:we,texSubImage2D:ne,texSubImage3D:de,compressedTexSubImage2D:re,compressedTexSubImage3D:Ie,scissor:Te,viewport:_,reset:J}}function Om(n,e,t,i,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new me,d=new WeakMap,h,p=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,v){return f?new OffscreenCanvas(A,v):vr("canvas")}function w(A,v,Y){let ne=1,de=ke(A);if((de.width>Y||de.height>Y)&&(ne=Y/Math.max(de.width,de.height)),ne<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let re=Math.floor(ne*de.width),Ie=Math.floor(ne*de.height);h===void 0&&(h=g(re,Ie));let ge=v?g(re,Ie):h;return ge.width=re,ge.height=Ie,ge.getContext("2d").drawImage(A,0,0,re,Ie),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+de.width+"x"+de.height+") to ("+re+"x"+Ie+")."),ge}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+de.width+"x"+de.height+")."),A;return A}function m(A){return A.generateMipmaps}function u(A){n.generateMipmap(A)}function R(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function T(A,v,Y,ne,de=!1){if(A!==null){if(n[A]!==void 0)return n[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let re=v;if(v===n.RED&&(Y===n.FLOAT&&(re=n.R32F),Y===n.HALF_FLOAT&&(re=n.R16F),Y===n.UNSIGNED_BYTE&&(re=n.R8)),v===n.RED_INTEGER&&(Y===n.UNSIGNED_BYTE&&(re=n.R8UI),Y===n.UNSIGNED_SHORT&&(re=n.R16UI),Y===n.UNSIGNED_INT&&(re=n.R32UI),Y===n.BYTE&&(re=n.R8I),Y===n.SHORT&&(re=n.R16I),Y===n.INT&&(re=n.R32I)),v===n.RG&&(Y===n.FLOAT&&(re=n.RG32F),Y===n.HALF_FLOAT&&(re=n.RG16F),Y===n.UNSIGNED_BYTE&&(re=n.RG8)),v===n.RG_INTEGER&&(Y===n.UNSIGNED_BYTE&&(re=n.RG8UI),Y===n.UNSIGNED_SHORT&&(re=n.RG16UI),Y===n.UNSIGNED_INT&&(re=n.RG32UI),Y===n.BYTE&&(re=n.RG8I),Y===n.SHORT&&(re=n.RG16I),Y===n.INT&&(re=n.RG32I)),v===n.RGB_INTEGER&&(Y===n.UNSIGNED_BYTE&&(re=n.RGB8UI),Y===n.UNSIGNED_SHORT&&(re=n.RGB16UI),Y===n.UNSIGNED_INT&&(re=n.RGB32UI),Y===n.BYTE&&(re=n.RGB8I),Y===n.SHORT&&(re=n.RGB16I),Y===n.INT&&(re=n.RGB32I)),v===n.RGBA_INTEGER&&(Y===n.UNSIGNED_BYTE&&(re=n.RGBA8UI),Y===n.UNSIGNED_SHORT&&(re=n.RGBA16UI),Y===n.UNSIGNED_INT&&(re=n.RGBA32UI),Y===n.BYTE&&(re=n.RGBA8I),Y===n.SHORT&&(re=n.RGBA16I),Y===n.INT&&(re=n.RGBA32I)),v===n.RGB&&(Y===n.UNSIGNED_INT_5_9_9_9_REV&&(re=n.RGB9_E5),Y===n.UNSIGNED_INT_10F_11F_11F_REV&&(re=n.R11F_G11F_B10F)),v===n.RGBA){let Ie=de?yr:tt.getTransfer(ne);Y===n.FLOAT&&(re=n.RGBA32F),Y===n.HALF_FLOAT&&(re=n.RGBA16F),Y===n.UNSIGNED_BYTE&&(re=Ie===at?n.SRGB8_ALPHA8:n.RGBA8),Y===n.UNSIGNED_SHORT_4_4_4_4&&(re=n.RGBA4),Y===n.UNSIGNED_SHORT_5_5_5_1&&(re=n.RGB5_A1)}return(re===n.R16F||re===n.R32F||re===n.RG16F||re===n.RG32F||re===n.RGBA16F||re===n.RGBA32F)&&e.get("EXT_color_buffer_float"),re}function M(A,v){let Y;return A?v===null||v===Qi||v===Qn?Y=n.DEPTH24_STENCIL8:v===Mi?Y=n.DEPTH32F_STENCIL8:v===$n&&(Y=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Qi||v===Qn?Y=n.DEPTH_COMPONENT24:v===Mi?Y=n.DEPTH_COMPONENT32F:v===$n&&(Y=n.DEPTH_COMPONENT16),Y}function F(A,v){return m(A)===!0||A.isFramebufferTexture&&A.minFilter!==Yt&&A.minFilter!==ti?Math.log2(Math.max(v.width,v.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?v.mipmaps.length:1}function E(A){let v=A.target;v.removeEventListener("dispose",E),I(v),v.isVideoTexture&&d.delete(v)}function U(A){let v=A.target;v.removeEventListener("dispose",U),x(v)}function I(A){let v=i.get(A);if(v.__webglInit===void 0)return;let Y=A.source,ne=p.get(Y);if(ne){let de=ne[v.__cacheKey];de.usedTimes--,de.usedTimes===0&&y(A),Object.keys(ne).length===0&&p.delete(Y)}i.remove(A)}function y(A){let v=i.get(A);n.deleteTexture(v.__webglTexture);let Y=A.source,ne=p.get(Y);delete ne[v.__cacheKey],o.memory.textures--}function x(A){let v=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(v.__webglFramebuffer[ne]))for(let de=0;de<v.__webglFramebuffer[ne].length;de++)n.deleteFramebuffer(v.__webglFramebuffer[ne][de]);else n.deleteFramebuffer(v.__webglFramebuffer[ne]);v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer[ne])}else{if(Array.isArray(v.__webglFramebuffer))for(let ne=0;ne<v.__webglFramebuffer.length;ne++)n.deleteFramebuffer(v.__webglFramebuffer[ne]);else n.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&n.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let ne=0;ne<v.__webglColorRenderbuffer.length;ne++)v.__webglColorRenderbuffer[ne]&&n.deleteRenderbuffer(v.__webglColorRenderbuffer[ne]);v.__webglDepthRenderbuffer&&n.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let Y=A.textures;for(let ne=0,de=Y.length;ne<de;ne++){let re=i.get(Y[ne]);re.__webglTexture&&(n.deleteTexture(re.__webglTexture),o.memory.textures--),i.remove(Y[ne])}i.remove(A)}let C=0;function z(){C=0}function X(){let A=C;return A>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+r.maxTextures),C+=1,A}function G(A){let v=[];return v.push(A.wrapS),v.push(A.wrapT),v.push(A.wrapR||0),v.push(A.magFilter),v.push(A.minFilter),v.push(A.anisotropy),v.push(A.internalFormat),v.push(A.format),v.push(A.type),v.push(A.generateMipmaps),v.push(A.premultiplyAlpha),v.push(A.flipY),v.push(A.unpackAlignment),v.push(A.colorSpace),v.join()}function K(A,v){let Y=i.get(A);if(A.isVideoTexture&&ve(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&Y.__version!==A.version){let ne=A.image;if(ne===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ae(Y,A,v);return}}else A.isExternalTexture&&(Y.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,Y.__webglTexture,n.TEXTURE0+v)}function j(A,v){let Y=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&Y.__version!==A.version){ae(Y,A,v);return}t.bindTexture(n.TEXTURE_2D_ARRAY,Y.__webglTexture,n.TEXTURE0+v)}function he(A,v){let Y=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&Y.__version!==A.version){ae(Y,A,v);return}t.bindTexture(n.TEXTURE_3D,Y.__webglTexture,n.TEXTURE0+v)}function ee(A,v){let Y=i.get(A);if(A.version>0&&Y.__version!==A.version){se(Y,A,v);return}t.bindTexture(n.TEXTURE_CUBE_MAP,Y.__webglTexture,n.TEXTURE0+v)}let ye={[kn]:n.REPEAT,[Wi]:n.CLAMP_TO_EDGE,[Ds]:n.MIRRORED_REPEAT},Se={[Yt]:n.NEAREST,[Hc]:n.NEAREST_MIPMAP_NEAREST,[Qr]:n.NEAREST_MIPMAP_LINEAR,[ti]:n.LINEAR,[_o]:n.LINEAR_MIPMAP_NEAREST,[ji]:n.LINEAR_MIPMAP_LINEAR},Ee={[Yc]:n.NEVER,[Qc]:n.ALWAYS,[Zc]:n.LESS,[ll]:n.LEQUAL,[Jc]:n.EQUAL,[jc]:n.GEQUAL,[Kc]:n.GREATER,[$c]:n.NOTEQUAL};function Ge(A,v){if(v.type===Mi&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===ti||v.magFilter===_o||v.magFilter===Qr||v.magFilter===ji||v.minFilter===ti||v.minFilter===_o||v.minFilter===Qr||v.minFilter===ji)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,ye[v.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,ye[v.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,ye[v.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,Se[v.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,Se[v.minFilter]),v.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,Ee[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Yt||v.minFilter!==Qr&&v.minFilter!==ji||v.type===Mi&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){let Y=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,Y.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,r.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function $e(A,v){let Y=!1;A.__webglInit===void 0&&(A.__webglInit=!0,v.addEventListener("dispose",E));let ne=v.source,de=p.get(ne);de===void 0&&(de={},p.set(ne,de));let re=G(v);if(re!==A.__cacheKey){de[re]===void 0&&(de[re]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,Y=!0),de[re].usedTimes++;let Ie=de[A.__cacheKey];Ie!==void 0&&(de[A.__cacheKey].usedTimes--,Ie.usedTimes===0&&y(v)),A.__cacheKey=re,A.__webglTexture=de[re].texture}return Y}function it(A,v,Y){return Math.floor(Math.floor(A/Y)/v)}function Ze(A,v,Y,ne){let re=A.updateRanges;if(re.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,v.width,v.height,Y,ne,v.data);else{re.sort((fe,Te)=>fe.start-Te.start);let Ie=0;for(let fe=1;fe<re.length;fe++){let Te=re[Ie],_=re[fe],L=Te.start+Te.count,B=it(_.start,v.width,4),J=it(Te.start,v.width,4);_.start<=L+1&&B===J&&it(_.start+_.count-1,v.width,4)===B?Te.count=Math.max(Te.count,_.start+_.count-Te.start):(++Ie,re[Ie]=_)}re.length=Ie+1;let ge=n.getParameter(n.UNPACK_ROW_LENGTH),we=n.getParameter(n.UNPACK_SKIP_PIXELS),De=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,v.width);for(let fe=0,Te=re.length;fe<Te;fe++){let _=re[fe],L=Math.floor(_.start/4),B=Math.ceil(_.count/4),J=L%v.width,S=Math.floor(L/v.width),V=B,O=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,J),n.pixelStorei(n.UNPACK_SKIP_ROWS,S),t.texSubImage2D(n.TEXTURE_2D,0,J,S,V,O,Y,ne,v.data)}A.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,ge),n.pixelStorei(n.UNPACK_SKIP_PIXELS,we),n.pixelStorei(n.UNPACK_SKIP_ROWS,De)}}function ae(A,v,Y){let ne=n.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(ne=n.TEXTURE_2D_ARRAY),v.isData3DTexture&&(ne=n.TEXTURE_3D);let de=$e(A,v),re=v.source;t.bindTexture(ne,A.__webglTexture,n.TEXTURE0+Y);let Ie=i.get(re);if(re.version!==Ie.__version||de===!0){t.activeTexture(n.TEXTURE0+Y);let ge=tt.getPrimaries(tt.workingColorSpace),we=v.colorSpace===Ni?null:tt.getPrimaries(v.colorSpace),De=v.colorSpace===Ni||ge===we?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,De);let fe=w(v.image,!1,r.maxTextureSize);fe=Ve(v,fe);let Te=s.convert(v.format,v.colorSpace),_=s.convert(v.type),L=T(v.internalFormat,Te,_,v.colorSpace,v.isVideoTexture);Ge(ne,v);let B,J=v.mipmaps,S=v.isVideoTexture!==!0,V=Ie.__version===void 0||de===!0,O=re.dataReady,P=F(v,fe);if(v.isDepthTexture)L=M(v.format===er,v.type),V&&(S?t.texStorage2D(n.TEXTURE_2D,1,L,fe.width,fe.height):t.texImage2D(n.TEXTURE_2D,0,L,fe.width,fe.height,0,Te,_,null));else if(v.isDataTexture)if(J.length>0){S&&V&&t.texStorage2D(n.TEXTURE_2D,P,L,J[0].width,J[0].height);for(let W=0,k=J.length;W<k;W++)B=J[W],S?O&&t.texSubImage2D(n.TEXTURE_2D,W,0,0,B.width,B.height,Te,_,B.data):t.texImage2D(n.TEXTURE_2D,W,L,B.width,B.height,0,Te,_,B.data);v.generateMipmaps=!1}else S?(V&&t.texStorage2D(n.TEXTURE_2D,P,L,fe.width,fe.height),O&&Ze(v,fe,Te,_)):t.texImage2D(n.TEXTURE_2D,0,L,fe.width,fe.height,0,Te,_,fe.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){S&&V&&t.texStorage3D(n.TEXTURE_2D_ARRAY,P,L,J[0].width,J[0].height,fe.depth);for(let W=0,k=J.length;W<k;W++)if(B=J[W],v.format!==Jt)if(Te!==null)if(S){if(O)if(v.layerUpdates.size>0){let ie=_l(B.width,B.height,v.format,v.type);for(let Z of v.layerUpdates){let Me=B.data.subarray(Z*ie/B.data.BYTES_PER_ELEMENT,(Z+1)*ie/B.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,Z,B.width,B.height,1,Te,Me)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,0,B.width,B.height,fe.depth,Te,B.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,W,L,B.width,B.height,fe.depth,0,B.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else S?O&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,0,B.width,B.height,fe.depth,Te,_,B.data):t.texImage3D(n.TEXTURE_2D_ARRAY,W,L,B.width,B.height,fe.depth,0,Te,_,B.data)}else{S&&V&&t.texStorage2D(n.TEXTURE_2D,P,L,J[0].width,J[0].height);for(let W=0,k=J.length;W<k;W++)B=J[W],v.format!==Jt?Te!==null?S?O&&t.compressedTexSubImage2D(n.TEXTURE_2D,W,0,0,B.width,B.height,Te,B.data):t.compressedTexImage2D(n.TEXTURE_2D,W,L,B.width,B.height,0,B.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):S?O&&t.texSubImage2D(n.TEXTURE_2D,W,0,0,B.width,B.height,Te,_,B.data):t.texImage2D(n.TEXTURE_2D,W,L,B.width,B.height,0,Te,_,B.data)}else if(v.isDataArrayTexture)if(S){if(V&&t.texStorage3D(n.TEXTURE_2D_ARRAY,P,L,fe.width,fe.height,fe.depth),O)if(v.layerUpdates.size>0){let W=_l(fe.width,fe.height,v.format,v.type);for(let k of v.layerUpdates){let ie=fe.data.subarray(k*W/fe.data.BYTES_PER_ELEMENT,(k+1)*W/fe.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,k,fe.width,fe.height,1,Te,_,ie)}v.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,fe.width,fe.height,fe.depth,Te,_,fe.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,L,fe.width,fe.height,fe.depth,0,Te,_,fe.data);else if(v.isData3DTexture)S?(V&&t.texStorage3D(n.TEXTURE_3D,P,L,fe.width,fe.height,fe.depth),O&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,fe.width,fe.height,fe.depth,Te,_,fe.data)):t.texImage3D(n.TEXTURE_3D,0,L,fe.width,fe.height,fe.depth,0,Te,_,fe.data);else if(v.isFramebufferTexture){if(V)if(S)t.texStorage2D(n.TEXTURE_2D,P,L,fe.width,fe.height);else{let W=fe.width,k=fe.height;for(let ie=0;ie<P;ie++)t.texImage2D(n.TEXTURE_2D,ie,L,W,k,0,Te,_,null),W>>=1,k>>=1}}else if(J.length>0){if(S&&V){let W=ke(J[0]);t.texStorage2D(n.TEXTURE_2D,P,L,W.width,W.height)}for(let W=0,k=J.length;W<k;W++)B=J[W],S?O&&t.texSubImage2D(n.TEXTURE_2D,W,0,0,Te,_,B):t.texImage2D(n.TEXTURE_2D,W,L,Te,_,B);v.generateMipmaps=!1}else if(S){if(V){let W=ke(fe);t.texStorage2D(n.TEXTURE_2D,P,L,W.width,W.height)}O&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Te,_,fe)}else t.texImage2D(n.TEXTURE_2D,0,L,Te,_,fe);m(v)&&u(ne),Ie.__version=re.version,v.onUpdate&&v.onUpdate(v)}A.__version=v.version}function se(A,v,Y){if(v.image.length!==6)return;let ne=$e(A,v),de=v.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+Y);let re=i.get(de);if(de.version!==re.__version||ne===!0){t.activeTexture(n.TEXTURE0+Y);let Ie=tt.getPrimaries(tt.workingColorSpace),ge=v.colorSpace===Ni?null:tt.getPrimaries(v.colorSpace),we=v.colorSpace===Ni||Ie===ge?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);let De=v.isCompressedTexture||v.image[0].isCompressedTexture,fe=v.image[0]&&v.image[0].isDataTexture,Te=[];for(let k=0;k<6;k++)!De&&!fe?Te[k]=w(v.image[k],!0,r.maxCubemapSize):Te[k]=fe?v.image[k].image:v.image[k],Te[k]=Ve(v,Te[k]);let _=Te[0],L=s.convert(v.format,v.colorSpace),B=s.convert(v.type),J=T(v.internalFormat,L,B,v.colorSpace),S=v.isVideoTexture!==!0,V=re.__version===void 0||ne===!0,O=de.dataReady,P=F(v,_);Ge(n.TEXTURE_CUBE_MAP,v);let W;if(De){S&&V&&t.texStorage2D(n.TEXTURE_CUBE_MAP,P,J,_.width,_.height);for(let k=0;k<6;k++){W=Te[k].mipmaps;for(let ie=0;ie<W.length;ie++){let Z=W[ie];v.format!==Jt?L!==null?S?O&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,ie,0,0,Z.width,Z.height,L,Z.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,ie,J,Z.width,Z.height,0,Z.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):S?O&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,ie,0,0,Z.width,Z.height,L,B,Z.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,ie,J,Z.width,Z.height,0,L,B,Z.data)}}}else{if(W=v.mipmaps,S&&V){W.length>0&&P++;let k=ke(Te[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,P,J,k.width,k.height)}for(let k=0;k<6;k++)if(fe){S?O&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,0,0,Te[k].width,Te[k].height,L,B,Te[k].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,J,Te[k].width,Te[k].height,0,L,B,Te[k].data);for(let ie=0;ie<W.length;ie++){let Me=W[ie].image[k].image;S?O&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,ie+1,0,0,Me.width,Me.height,L,B,Me.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,ie+1,J,Me.width,Me.height,0,L,B,Me.data)}}else{S?O&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,0,0,L,B,Te[k]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,J,L,B,Te[k]);for(let ie=0;ie<W.length;ie++){let Z=W[ie];S?O&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,ie+1,0,0,L,B,Z.image[k]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+k,ie+1,J,L,B,Z.image[k])}}}m(v)&&u(n.TEXTURE_CUBE_MAP),re.__version=de.version,v.onUpdate&&v.onUpdate(v)}A.__version=v.version}function Ce(A,v,Y,ne,de,re){let Ie=s.convert(Y.format,Y.colorSpace),ge=s.convert(Y.type),we=T(Y.internalFormat,Ie,ge,Y.colorSpace),De=i.get(v),fe=i.get(Y);if(fe.__renderTarget=v,!De.__hasExternalTextures){let Te=Math.max(1,v.width>>re),_=Math.max(1,v.height>>re);de===n.TEXTURE_3D||de===n.TEXTURE_2D_ARRAY?t.texImage3D(de,re,we,Te,_,v.depth,0,Ie,ge,null):t.texImage2D(de,re,we,Te,_,0,Ie,ge,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),pe(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ne,de,fe.__webglTexture,0,xe(v)):(de===n.TEXTURE_2D||de>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&de<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ne,de,fe.__webglTexture,re),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ne(A,v,Y){if(n.bindRenderbuffer(n.RENDERBUFFER,A),v.depthBuffer){let ne=v.depthTexture,de=ne&&ne.isDepthTexture?ne.type:null,re=M(v.stencilBuffer,de),Ie=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ge=xe(v);pe(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ge,re,v.width,v.height):Y?n.renderbufferStorageMultisample(n.RENDERBUFFER,ge,re,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,re,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ie,n.RENDERBUFFER,A)}else{let ne=v.textures;for(let de=0;de<ne.length;de++){let re=ne[de],Ie=s.convert(re.format,re.colorSpace),ge=s.convert(re.type),we=T(re.internalFormat,Ie,ge,re.colorSpace),De=xe(v);Y&&pe(v)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,De,we,v.width,v.height):pe(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,De,we,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,we,v.width,v.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Pe(A,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let ne=i.get(v.depthTexture);ne.__renderTarget=v,(!ne.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),K(v.depthTexture,0);let de=ne.__webglTexture,re=xe(v);if(v.depthTexture.format===On)pe(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,de,0,re):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,de,0);else if(v.depthTexture.format===er)pe(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,de,0,re):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,de,0);else throw new Error("Unknown depthTexture format")}function qe(A){let v=i.get(A),Y=A.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==A.depthTexture){let ne=A.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),ne){let de=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,ne.removeEventListener("dispose",de)};ne.addEventListener("dispose",de),v.__depthDisposeCallback=de}v.__boundDepthTexture=ne}if(A.depthTexture&&!v.__autoAllocateDepthBuffer){if(Y)throw new Error("target.depthTexture not supported in Cube render targets");let ne=A.texture.mipmaps;ne&&ne.length>0?Pe(v.__webglFramebuffer[0],A):Pe(v.__webglFramebuffer,A)}else if(Y){v.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[ne]),v.__webglDepthbuffer[ne]===void 0)v.__webglDepthbuffer[ne]=n.createRenderbuffer(),Ne(v.__webglDepthbuffer[ne],A,!1);else{let de=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,re=v.__webglDepthbuffer[ne];n.bindRenderbuffer(n.RENDERBUFFER,re),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,re)}}else{let ne=A.texture.mipmaps;if(ne&&ne.length>0?t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=n.createRenderbuffer(),Ne(v.__webglDepthbuffer,A,!1);else{let de=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,re=v.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,re),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,re)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function st(A,v,Y){let ne=i.get(A);v!==void 0&&Ce(ne.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),Y!==void 0&&qe(A)}function D(A){let v=A.texture,Y=i.get(A),ne=i.get(v);A.addEventListener("dispose",U);let de=A.textures,re=A.isWebGLCubeRenderTarget===!0,Ie=de.length>1;if(Ie||(ne.__webglTexture===void 0&&(ne.__webglTexture=n.createTexture()),ne.__version=v.version,o.memory.textures++),re){Y.__webglFramebuffer=[];for(let ge=0;ge<6;ge++)if(v.mipmaps&&v.mipmaps.length>0){Y.__webglFramebuffer[ge]=[];for(let we=0;we<v.mipmaps.length;we++)Y.__webglFramebuffer[ge][we]=n.createFramebuffer()}else Y.__webglFramebuffer[ge]=n.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){Y.__webglFramebuffer=[];for(let ge=0;ge<v.mipmaps.length;ge++)Y.__webglFramebuffer[ge]=n.createFramebuffer()}else Y.__webglFramebuffer=n.createFramebuffer();if(Ie)for(let ge=0,we=de.length;ge<we;ge++){let De=i.get(de[ge]);De.__webglTexture===void 0&&(De.__webglTexture=n.createTexture(),o.memory.textures++)}if(A.samples>0&&pe(A)===!1){Y.__webglMultisampledFramebuffer=n.createFramebuffer(),Y.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,Y.__webglMultisampledFramebuffer);for(let ge=0;ge<de.length;ge++){let we=de[ge];Y.__webglColorRenderbuffer[ge]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,Y.__webglColorRenderbuffer[ge]);let De=s.convert(we.format,we.colorSpace),fe=s.convert(we.type),Te=T(we.internalFormat,De,fe,we.colorSpace,A.isXRRenderTarget===!0),_=xe(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,_,Te,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.RENDERBUFFER,Y.__webglColorRenderbuffer[ge])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(Y.__webglDepthRenderbuffer=n.createRenderbuffer(),Ne(Y.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(re){t.bindTexture(n.TEXTURE_CUBE_MAP,ne.__webglTexture),Ge(n.TEXTURE_CUBE_MAP,v);for(let ge=0;ge<6;ge++)if(v.mipmaps&&v.mipmaps.length>0)for(let we=0;we<v.mipmaps.length;we++)Ce(Y.__webglFramebuffer[ge][we],A,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,we);else Ce(Y.__webglFramebuffer[ge],A,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0);m(v)&&u(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ie){for(let ge=0,we=de.length;ge<we;ge++){let De=de[ge],fe=i.get(De),Te=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(Te=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Te,fe.__webglTexture),Ge(Te,De),Ce(Y.__webglFramebuffer,A,De,n.COLOR_ATTACHMENT0+ge,Te,0),m(De)&&u(Te)}t.unbindTexture()}else{let ge=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ge=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ge,ne.__webglTexture),Ge(ge,v),v.mipmaps&&v.mipmaps.length>0)for(let we=0;we<v.mipmaps.length;we++)Ce(Y.__webglFramebuffer[we],A,v,n.COLOR_ATTACHMENT0,ge,we);else Ce(Y.__webglFramebuffer,A,v,n.COLOR_ATTACHMENT0,ge,0);m(v)&&u(ge),t.unbindTexture()}A.depthBuffer&&qe(A)}function ue(A){let v=A.textures;for(let Y=0,ne=v.length;Y<ne;Y++){let de=v[Y];if(m(de)){let re=R(A),Ie=i.get(de).__webglTexture;t.bindTexture(re,Ie),u(re),t.unbindTexture()}}}let ce=[],le=[];function oe(A){if(A.samples>0){if(pe(A)===!1){let v=A.textures,Y=A.width,ne=A.height,de=n.COLOR_BUFFER_BIT,re=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ie=i.get(A),ge=v.length>1;if(ge)for(let De=0;De<v.length;De++)t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+De,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+De,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer);let we=A.texture.mipmaps;we&&we.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer);for(let De=0;De<v.length;De++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(de|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(de|=n.STENCIL_BUFFER_BIT)),ge){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ie.__webglColorRenderbuffer[De]);let fe=i.get(v[De]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,fe,0)}n.blitFramebuffer(0,0,Y,ne,0,0,Y,ne,de,n.NEAREST),c===!0&&(ce.length=0,le.length=0,ce.push(n.COLOR_ATTACHMENT0+De),A.depthBuffer&&A.resolveDepthBuffer===!1&&(ce.push(re),le.push(re),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,le)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ce))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ge)for(let De=0;De<v.length;De++){t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+De,n.RENDERBUFFER,Ie.__webglColorRenderbuffer[De]);let fe=i.get(v[De]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+De,n.TEXTURE_2D,fe,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&c){let v=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[v])}}}function xe(A){return Math.min(r.maxSamples,A.samples)}function pe(A){let v=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function ve(A){let v=o.render.frame;d.get(A)!==v&&(d.set(A,v),A.update())}function Ve(A,v){let Y=A.colorSpace,ne=A.format,de=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||Y!==cn&&Y!==Ni&&(tt.getTransfer(Y)===at?(ne!==Jt||de!==_i)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",Y)),v}function ke(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(l.width=A.naturalWidth||A.width,l.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(l.width=A.displayWidth,l.height=A.displayHeight):(l.width=A.width,l.height=A.height),l}this.allocateTextureUnit=X,this.resetTextureUnits=z,this.setTexture2D=K,this.setTexture2DArray=j,this.setTexture3D=he,this.setTextureCube=ee,this.rebindTextures=st,this.setupRenderTarget=D,this.updateRenderTargetMipmap=ue,this.updateMultisampleRenderTarget=oe,this.setupDepthRenderbuffer=qe,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=pe}function Bm(n,e){function t(i,r=Ni){let s,o=tt.getTransfer(r);if(i===_i)return n.UNSIGNED_BYTE;if(i===yo)return n.UNSIGNED_SHORT_4_4_4_4;if(i===xo)return n.UNSIGNED_SHORT_5_5_5_1;if(i===tl)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===il)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Qa)return n.BYTE;if(i===el)return n.SHORT;if(i===$n)return n.UNSIGNED_SHORT;if(i===go)return n.INT;if(i===Qi)return n.UNSIGNED_INT;if(i===Mi)return n.FLOAT;if(i===jn)return n.HALF_FLOAT;if(i===nl)return n.ALPHA;if(i===rl)return n.RGB;if(i===Jt)return n.RGBA;if(i===On)return n.DEPTH_COMPONENT;if(i===er)return n.DEPTH_STENCIL;if(i===sl)return n.RED;if(i===vo)return n.RED_INTEGER;if(i===ol)return n.RG;if(i===wo)return n.RG_INTEGER;if(i===Mo)return n.RGBA_INTEGER;if(i===es||i===ts||i===is||i===ns)if(o===at)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===es)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===ts)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===is)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===ns)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===es)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===ts)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===is)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===ns)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===bo||i===So||i===To||i===Eo)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===bo)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===So)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===To)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Eo)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ao||i===Co||i===Ro)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===Ao||i===Co)return o===at?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Ro)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Po||i===Io||i===Do||i===Lo||i===Uo||i===No||i===Fo||i===ko||i===Oo||i===Bo||i===zo||i===Vo||i===Go||i===Ho)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Po)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Io)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Do)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Lo)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Uo)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===No)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Fo)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===ko)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Oo)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Bo)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===zo)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Vo)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Go)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Ho)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Wo||i===Xo||i===qo)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Wo)return o===at?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Xo)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===qo)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Yo||i===Zo||i===Jo||i===Ko)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Yo)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Zo)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Jo)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Ko)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Qn?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var zm=`
void main() {

  gl_Position = vec4( position, 1.0 );

}`,Vm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

  vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

  if ( coord.x >= 1.0 ) {

    gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

  } else {

    gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

  }

}`,Rl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new Pr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new mi({vertexShader:zm,fragmentShader:Vm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ke(new Br(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Pl=class extends yi{constructor(e,t){super();let i=this,r=null,s=1,o=null,a="local-floor",c=1,l=null,d=null,h=null,p=null,f=null,g=null,w=typeof XRWebGLBinding<"u",m=new Rl,u={},R=t.getContextAttributes(),T=null,M=null,F=[],E=[],U=new me,I=null,y=new kt;y.viewport=new vt;let x=new kt;x.viewport=new vt;let C=[y,x],z=new so,X=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ae){let se=F[ae];return se===void 0&&(se=new Hn,F[ae]=se),se.getTargetRaySpace()},this.getControllerGrip=function(ae){let se=F[ae];return se===void 0&&(se=new Hn,F[ae]=se),se.getGripSpace()},this.getHand=function(ae){let se=F[ae];return se===void 0&&(se=new Hn,F[ae]=se),se.getHandSpace()};function K(ae){let se=E.indexOf(ae.inputSource);if(se===-1)return;let Ce=F[se];Ce!==void 0&&(Ce.update(ae.inputSource,ae.frame,l||o),Ce.dispatchEvent({type:ae.type,data:ae.inputSource}))}function j(){r.removeEventListener("select",K),r.removeEventListener("selectstart",K),r.removeEventListener("selectend",K),r.removeEventListener("squeeze",K),r.removeEventListener("squeezestart",K),r.removeEventListener("squeezeend",K),r.removeEventListener("end",j),r.removeEventListener("inputsourceschange",he);for(let ae=0;ae<F.length;ae++){let se=E[ae];se!==null&&(E[ae]=null,F[ae].disconnect(se))}X=null,G=null,m.reset();for(let ae in u)delete u[ae];e.setRenderTarget(T),f=null,p=null,h=null,r=null,M=null,Ze.stop(),i.isPresenting=!1,e.setPixelRatio(I),e.setSize(U.width,U.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ae){s=ae,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ae){a=ae,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(ae){l=ae},this.getBaseLayer=function(){return p!==null?p:f},this.getBinding=function(){return h===null&&w&&(h=new XRWebGLBinding(r,t)),h},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(ae){if(r=ae,r!==null){if(T=e.getRenderTarget(),r.addEventListener("select",K),r.addEventListener("selectstart",K),r.addEventListener("selectend",K),r.addEventListener("squeeze",K),r.addEventListener("squeezestart",K),r.addEventListener("squeezeend",K),r.addEventListener("end",j),r.addEventListener("inputsourceschange",he),R.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(U),w&&"createProjectionLayer"in XRWebGLBinding.prototype){let Ce=null,Ne=null,Pe=null;R.depth&&(Pe=R.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Ce=R.stencil?er:On,Ne=R.stencil?Qn:Qi);let qe={colorFormat:t.RGBA8,depthFormat:Pe,scaleFactor:s};h=this.getBinding(),p=h.createProjectionLayer(qe),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),M=new xi(p.textureWidth,p.textureHeight,{format:Jt,type:_i,depthTexture:new Rr(p.textureWidth,p.textureHeight,Ne,void 0,void 0,void 0,void 0,void 0,void 0,Ce),stencilBuffer:R.stencil,colorSpace:e.outputColorSpace,samples:R.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{let Ce={antialias:R.antialias,alpha:!0,depth:R.depth,stencil:R.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,Ce),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),M=new xi(f.framebufferWidth,f.framebufferHeight,{format:Jt,type:_i,colorSpace:e.outputColorSpace,stencilBuffer:R.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await r.requestReferenceSpace(a),Ze.setContext(r),Ze.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function he(ae){for(let se=0;se<ae.removed.length;se++){let Ce=ae.removed[se],Ne=E.indexOf(Ce);Ne>=0&&(E[Ne]=null,F[Ne].disconnect(Ce))}for(let se=0;se<ae.added.length;se++){let Ce=ae.added[se],Ne=E.indexOf(Ce);if(Ne===-1){for(let qe=0;qe<F.length;qe++)if(qe>=E.length){E.push(Ce),Ne=qe;break}else if(E[qe]===null){E[qe]=Ce,Ne=qe;break}if(Ne===-1)break}let Pe=F[Ne];Pe&&Pe.connect(Ce)}}let ee=new N,ye=new N;function Se(ae,se,Ce){ee.setFromMatrixPosition(se.matrixWorld),ye.setFromMatrixPosition(Ce.matrixWorld);let Ne=ee.distanceTo(ye),Pe=se.projectionMatrix.elements,qe=Ce.projectionMatrix.elements,st=Pe[14]/(Pe[10]-1),D=Pe[14]/(Pe[10]+1),ue=(Pe[9]+1)/Pe[5],ce=(Pe[9]-1)/Pe[5],le=(Pe[8]-1)/Pe[0],oe=(qe[8]+1)/qe[0],xe=st*le,pe=st*oe,ve=Ne/(-le+oe),Ve=ve*-le;if(se.matrixWorld.decompose(ae.position,ae.quaternion,ae.scale),ae.translateX(Ve),ae.translateZ(ve),ae.matrixWorld.compose(ae.position,ae.quaternion,ae.scale),ae.matrixWorldInverse.copy(ae.matrixWorld).invert(),Pe[10]===-1)ae.projectionMatrix.copy(se.projectionMatrix),ae.projectionMatrixInverse.copy(se.projectionMatrixInverse);else{let ke=st+ve,A=D+ve,v=xe-Ve,Y=pe+(Ne-Ve),ne=ue*D/A*ke,de=ce*D/A*ke;ae.projectionMatrix.makePerspective(v,Y,ne,de,ke,A),ae.projectionMatrixInverse.copy(ae.projectionMatrix).invert()}}function Ee(ae,se){se===null?ae.matrixWorld.copy(ae.matrix):ae.matrixWorld.multiplyMatrices(se.matrixWorld,ae.matrix),ae.matrixWorldInverse.copy(ae.matrixWorld).invert()}this.updateCamera=function(ae){if(r===null)return;let se=ae.near,Ce=ae.far;m.texture!==null&&(m.depthNear>0&&(se=m.depthNear),m.depthFar>0&&(Ce=m.depthFar)),z.near=x.near=y.near=se,z.far=x.far=y.far=Ce,(X!==z.near||G!==z.far)&&(r.updateRenderState({depthNear:z.near,depthFar:z.far}),X=z.near,G=z.far),z.layers.mask=ae.layers.mask|6,y.layers.mask=z.layers.mask&3,x.layers.mask=z.layers.mask&5;let Ne=ae.parent,Pe=z.cameras;Ee(z,Ne);for(let qe=0;qe<Pe.length;qe++)Ee(Pe[qe],Ne);Pe.length===2?Se(z,y,x):z.projectionMatrix.copy(y.projectionMatrix),Ge(ae,z,Ne)};function Ge(ae,se,Ce){Ce===null?ae.matrix.copy(se.matrixWorld):(ae.matrix.copy(Ce.matrixWorld),ae.matrix.invert(),ae.matrix.multiply(se.matrixWorld)),ae.matrix.decompose(ae.position,ae.quaternion,ae.scale),ae.updateMatrixWorld(!0),ae.projectionMatrix.copy(se.projectionMatrix),ae.projectionMatrixInverse.copy(se.projectionMatrixInverse),ae.isPerspectiveCamera&&(ae.fov=Bn*2*Math.atan(1/ae.projectionMatrix.elements[5]),ae.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(p===null&&f===null))return c},this.setFoveation=function(ae){c=ae,p!==null&&(p.fixedFoveation=ae),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=ae)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(z)},this.getCameraTexture=function(ae){return u[ae]};let $e=null;function it(ae,se){if(d=se.getViewerPose(l||o),g=se,d!==null){let Ce=d.views;f!==null&&(e.setRenderTargetFramebuffer(M,f.framebuffer),e.setRenderTarget(M));let Ne=!1;Ce.length!==z.cameras.length&&(z.cameras.length=0,Ne=!0);for(let D=0;D<Ce.length;D++){let ue=Ce[D],ce=null;if(f!==null)ce=f.getViewport(ue);else{let oe=h.getViewSubImage(p,ue);ce=oe.viewport,D===0&&(e.setRenderTargetTextures(M,oe.colorTexture,oe.depthStencilTexture),e.setRenderTarget(M))}let le=C[D];le===void 0&&(le=new kt,le.layers.enable(D),le.viewport=new vt,C[D]=le),le.matrix.fromArray(ue.transform.matrix),le.matrix.decompose(le.position,le.quaternion,le.scale),le.projectionMatrix.fromArray(ue.projectionMatrix),le.projectionMatrixInverse.copy(le.projectionMatrix).invert(),le.viewport.set(ce.x,ce.y,ce.width,ce.height),D===0&&(z.matrix.copy(le.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Ne===!0&&z.cameras.push(le)}let Pe=r.enabledFeatures;if(Pe&&Pe.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&w){h=i.getBinding();let D=h.getDepthInformation(Ce[0]);D&&D.isValid&&D.texture&&m.init(D,r.renderState)}if(Pe&&Pe.includes("camera-access")&&w){e.state.unbindTexture(),h=i.getBinding();for(let D=0;D<Ce.length;D++){let ue=Ce[D].camera;if(ue){let ce=u[ue];ce||(ce=new Pr,u[ue]=ce);let le=h.getCameraImage(ue);ce.sourceTexture=le}}}}for(let Ce=0;Ce<F.length;Ce++){let Ne=E[Ce],Pe=F[Ce];Ne!==null&&Pe!==void 0&&Pe.update(Ne,se,l||o)}$e&&$e(ae,se),se.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:se}),g=null}let Ze=new Dh;Ze.setAnimationLoop(it),this.setAnimationLoop=function(ae){$e=ae},this.dispose=function(){}}},yn=new pi,Gm=new _t;function Hm(n,e){function t(m,u){m.matrixAutoUpdate===!0&&m.updateMatrix(),u.value.copy(m.matrix)}function i(m,u){u.color.getRGB(m.fogColor.value,ul(n)),u.isFog?(m.fogNear.value=u.near,m.fogFar.value=u.far):u.isFogExp2&&(m.fogDensity.value=u.density)}function r(m,u,R,T,M){u.isMeshBasicMaterial||u.isMeshLambertMaterial?s(m,u):u.isMeshToonMaterial?(s(m,u),h(m,u)):u.isMeshPhongMaterial?(s(m,u),d(m,u)):u.isMeshStandardMaterial?(s(m,u),p(m,u),u.isMeshPhysicalMaterial&&f(m,u,M)):u.isMeshMatcapMaterial?(s(m,u),g(m,u)):u.isMeshDepthMaterial?s(m,u):u.isMeshDistanceMaterial?(s(m,u),w(m,u)):u.isMeshNormalMaterial?s(m,u):u.isLineBasicMaterial?(o(m,u),u.isLineDashedMaterial&&a(m,u)):u.isPointsMaterial?c(m,u,R,T):u.isSpriteMaterial?l(m,u):u.isShadowMaterial?(m.color.value.copy(u.color),m.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function s(m,u){m.opacity.value=u.opacity,u.color&&m.diffuse.value.copy(u.color),u.emissive&&m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(m.map.value=u.map,t(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.bumpMap&&(m.bumpMap.value=u.bumpMap,t(u.bumpMap,m.bumpMapTransform),m.bumpScale.value=u.bumpScale,u.side===Ht&&(m.bumpScale.value*=-1)),u.normalMap&&(m.normalMap.value=u.normalMap,t(u.normalMap,m.normalMapTransform),m.normalScale.value.copy(u.normalScale),u.side===Ht&&m.normalScale.value.negate()),u.displacementMap&&(m.displacementMap.value=u.displacementMap,t(u.displacementMap,m.displacementMapTransform),m.displacementScale.value=u.displacementScale,m.displacementBias.value=u.displacementBias),u.emissiveMap&&(m.emissiveMap.value=u.emissiveMap,t(u.emissiveMap,m.emissiveMapTransform)),u.specularMap&&(m.specularMap.value=u.specularMap,t(u.specularMap,m.specularMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest);let R=e.get(u),T=R.envMap,M=R.envMapRotation;T&&(m.envMap.value=T,yn.copy(M),yn.x*=-1,yn.y*=-1,yn.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(yn.y*=-1,yn.z*=-1),m.envMapRotation.value.setFromMatrix4(Gm.makeRotationFromEuler(yn)),m.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=u.reflectivity,m.ior.value=u.ior,m.refractionRatio.value=u.refractionRatio),u.lightMap&&(m.lightMap.value=u.lightMap,m.lightMapIntensity.value=u.lightMapIntensity,t(u.lightMap,m.lightMapTransform)),u.aoMap&&(m.aoMap.value=u.aoMap,m.aoMapIntensity.value=u.aoMapIntensity,t(u.aoMap,m.aoMapTransform))}function o(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,u.map&&(m.map.value=u.map,t(u.map,m.mapTransform))}function a(m,u){m.dashSize.value=u.dashSize,m.totalSize.value=u.dashSize+u.gapSize,m.scale.value=u.scale}function c(m,u,R,T){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.size.value=u.size*R,m.scale.value=T*.5,u.map&&(m.map.value=u.map,t(u.map,m.uvTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function l(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.rotation.value=u.rotation,u.map&&(m.map.value=u.map,t(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function d(m,u){m.specular.value.copy(u.specular),m.shininess.value=Math.max(u.shininess,1e-4)}function h(m,u){u.gradientMap&&(m.gradientMap.value=u.gradientMap)}function p(m,u){m.metalness.value=u.metalness,u.metalnessMap&&(m.metalnessMap.value=u.metalnessMap,t(u.metalnessMap,m.metalnessMapTransform)),m.roughness.value=u.roughness,u.roughnessMap&&(m.roughnessMap.value=u.roughnessMap,t(u.roughnessMap,m.roughnessMapTransform)),u.envMap&&(m.envMapIntensity.value=u.envMapIntensity)}function f(m,u,R){m.ior.value=u.ior,u.sheen>0&&(m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),m.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(m.sheenColorMap.value=u.sheenColorMap,t(u.sheenColorMap,m.sheenColorMapTransform)),u.sheenRoughnessMap&&(m.sheenRoughnessMap.value=u.sheenRoughnessMap,t(u.sheenRoughnessMap,m.sheenRoughnessMapTransform))),u.clearcoat>0&&(m.clearcoat.value=u.clearcoat,m.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(m.clearcoatMap.value=u.clearcoatMap,t(u.clearcoatMap,m.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,t(u.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(m.clearcoatNormalMap.value=u.clearcoatNormalMap,t(u.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===Ht&&m.clearcoatNormalScale.value.negate())),u.dispersion>0&&(m.dispersion.value=u.dispersion),u.iridescence>0&&(m.iridescence.value=u.iridescence,m.iridescenceIOR.value=u.iridescenceIOR,m.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(m.iridescenceMap.value=u.iridescenceMap,t(u.iridescenceMap,m.iridescenceMapTransform)),u.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=u.iridescenceThicknessMap,t(u.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),u.transmission>0&&(m.transmission.value=u.transmission,m.transmissionSamplerMap.value=R.texture,m.transmissionSamplerSize.value.set(R.width,R.height),u.transmissionMap&&(m.transmissionMap.value=u.transmissionMap,t(u.transmissionMap,m.transmissionMapTransform)),m.thickness.value=u.thickness,u.thicknessMap&&(m.thicknessMap.value=u.thicknessMap,t(u.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=u.attenuationDistance,m.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(m.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(m.anisotropyMap.value=u.anisotropyMap,t(u.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=u.specularIntensity,m.specularColor.value.copy(u.specularColor),u.specularColorMap&&(m.specularColorMap.value=u.specularColorMap,t(u.specularColorMap,m.specularColorMapTransform)),u.specularIntensityMap&&(m.specularIntensityMap.value=u.specularIntensityMap,t(u.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,u){u.matcap&&(m.matcap.value=u.matcap)}function w(m,u){let R=e.get(u).light;m.referencePosition.value.setFromMatrixPosition(R.matrixWorld),m.nearDistance.value=R.shadow.camera.near,m.farDistance.value=R.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function Wm(n,e,t,i){let r={},s={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(R,T){let M=T.program;i.uniformBlockBinding(R,M)}function l(R,T){let M=r[R.id];M===void 0&&(g(R),M=d(R),r[R.id]=M,R.addEventListener("dispose",m));let F=T.program;i.updateUBOMapping(R,F);let E=e.render.frame;s[R.id]!==E&&(p(R),s[R.id]=E)}function d(R){let T=h();R.__bindingPointIndex=T;let M=n.createBuffer(),F=R.__size,E=R.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,F,E),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,T,M),M}function h(){for(let R=0;R<a;R++)if(o.indexOf(R)===-1)return o.push(R),R;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(R){let T=r[R.id],M=R.uniforms,F=R.__cache;n.bindBuffer(n.UNIFORM_BUFFER,T);for(let E=0,U=M.length;E<U;E++){let I=Array.isArray(M[E])?M[E]:[M[E]];for(let y=0,x=I.length;y<x;y++){let C=I[y];if(f(C,E,y,F)===!0){let z=C.__offset,X=Array.isArray(C.value)?C.value:[C.value],G=0;for(let K=0;K<X.length;K++){let j=X[K],he=w(j);typeof j=="number"||typeof j=="boolean"?(C.__data[0]=j,n.bufferSubData(n.UNIFORM_BUFFER,z+G,C.__data)):j.isMatrix3?(C.__data[0]=j.elements[0],C.__data[1]=j.elements[1],C.__data[2]=j.elements[2],C.__data[3]=0,C.__data[4]=j.elements[3],C.__data[5]=j.elements[4],C.__data[6]=j.elements[5],C.__data[7]=0,C.__data[8]=j.elements[6],C.__data[9]=j.elements[7],C.__data[10]=j.elements[8],C.__data[11]=0):(j.toArray(C.__data,G),G+=he.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,z,C.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(R,T,M,F){let E=R.value,U=T+"_"+M;if(F[U]===void 0)return typeof E=="number"||typeof E=="boolean"?F[U]=E:F[U]=E.clone(),!0;{let I=F[U];if(typeof E=="number"||typeof E=="boolean"){if(I!==E)return F[U]=E,!0}else if(I.equals(E)===!1)return I.copy(E),!0}return!1}function g(R){let T=R.uniforms,M=0,F=16;for(let U=0,I=T.length;U<I;U++){let y=Array.isArray(T[U])?T[U]:[T[U]];for(let x=0,C=y.length;x<C;x++){let z=y[x],X=Array.isArray(z.value)?z.value:[z.value];for(let G=0,K=X.length;G<K;G++){let j=X[G],he=w(j),ee=M%F,ye=ee%he.boundary,Se=ee+ye;M+=ye,Se!==0&&F-Se<he.storage&&(M+=F-Se),z.__data=new Float32Array(he.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=M,M+=he.storage}}}let E=M%F;return E>0&&(M+=F-E),R.__size=M,R.__cache={},this}function w(R){let T={boundary:0,storage:0};return typeof R=="number"||typeof R=="boolean"?(T.boundary=4,T.storage=4):R.isVector2?(T.boundary=8,T.storage=8):R.isVector3||R.isColor?(T.boundary=16,T.storage=12):R.isVector4?(T.boundary=16,T.storage=16):R.isMatrix3?(T.boundary=48,T.storage=48):R.isMatrix4?(T.boundary=64,T.storage=64):R.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",R),T}function m(R){let T=R.target;T.removeEventListener("dispose",m);let M=o.indexOf(T.__bindingPointIndex);o.splice(M,1),n.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function u(){for(let R in r)n.deleteBuffer(r[R]);o=[],r={},s={}}return{bind:c,update:l,dispose:u}}var ta=class{constructor(e={}){let{canvas:t=eh(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;let g=new Uint32Array(4),w=new Int32Array(4),m=null,u=null,R=[],T=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ui,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,F=!1;this._outputColorSpace=Dt;let E=0,U=0,I=null,y=-1,x=null,C=new vt,z=new vt,X=null,G=new Ye(0),K=0,j=t.width,he=t.height,ee=1,ye=null,Se=null,Ee=new vt(0,0,j,he),Ge=new vt(0,0,j,he),$e=!1,it=new Wn,Ze=!1,ae=!1,se=new _t,Ce=new N,Ne=new vt,Pe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},qe=!1;function st(){return I===null?ee:1}let D=i;function ue(b,H){return t.getContext(b,H)}try{let b={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:d,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",O,!1),t.addEventListener("webglcontextrestored",P,!1),t.addEventListener("webglcontextcreationerror",W,!1),D===null){let H="webgl2";if(D=ue(H,b),D===null)throw ue(H)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let ce,le,oe,xe,pe,ve,Ve,ke,A,v,Y,ne,de,re,Ie,ge,we,De,fe,Te,_,L,B,J;function S(){ce=new l0(D),ce.init(),L=new Bm(D,ce),le=new t0(D,ce,e,L),oe=new km(D,ce),le.reversedDepthBuffer&&p&&oe.buffers.depth.setReversed(!0),xe=new d0(D),pe=new Sm,ve=new Om(D,ce,oe,pe,le,L,xe),Ve=new n0(M),ke=new a0(M),A=new _u(D),B=new Qp(D,A),v=new c0(D,A,xe,B),Y=new f0(D,v,A,xe),fe=new u0(D,le,ve),ge=new i0(pe),ne=new bm(M,Ve,ke,ce,le,B,ge),de=new Hm(M,pe),re=new Em,Ie=new Dm(ce),De=new jp(M,Ve,ke,oe,Y,f,c),we=new Nm(M,Y,le),J=new Wm(D,xe,le,oe),Te=new e0(D,ce,xe),_=new h0(D,ce,xe),xe.programs=ne.programs,M.capabilities=le,M.extensions=ce,M.properties=pe,M.renderLists=re,M.shadowMap=we,M.state=oe,M.info=xe}S();let V=new Pl(M,D);this.xr=V,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let b=ce.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=ce.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(b){b!==void 0&&(ee=b,this.setSize(j,he,!1))},this.getSize=function(b){return b.set(j,he)},this.setSize=function(b,H,Q=!0){if(V.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}j=b,he=H,t.width=Math.floor(b*ee),t.height=Math.floor(H*ee),Q===!0&&(t.style.width=b+"px",t.style.height=H+"px"),this.setViewport(0,0,b,H)},this.getDrawingBufferSize=function(b){return b.set(j*ee,he*ee).floor()},this.setDrawingBufferSize=function(b,H,Q){j=b,he=H,ee=Q,t.width=Math.floor(b*Q),t.height=Math.floor(H*Q),this.setViewport(0,0,b,H)},this.getCurrentViewport=function(b){return b.copy(C)},this.getViewport=function(b){return b.copy(Ee)},this.setViewport=function(b,H,Q,te){b.isVector4?Ee.set(b.x,b.y,b.z,b.w):Ee.set(b,H,Q,te),oe.viewport(C.copy(Ee).multiplyScalar(ee).round())},this.getScissor=function(b){return b.copy(Ge)},this.setScissor=function(b,H,Q,te){b.isVector4?Ge.set(b.x,b.y,b.z,b.w):Ge.set(b,H,Q,te),oe.scissor(z.copy(Ge).multiplyScalar(ee).round())},this.getScissorTest=function(){return $e},this.setScissorTest=function(b){oe.setScissorTest($e=b)},this.setOpaqueSort=function(b){ye=b},this.setTransparentSort=function(b){Se=b},this.getClearColor=function(b){return b.copy(De.getClearColor())},this.setClearColor=function(){De.setClearColor(...arguments)},this.getClearAlpha=function(){return De.getClearAlpha()},this.setClearAlpha=function(){De.setClearAlpha(...arguments)},this.clear=function(b=!0,H=!0,Q=!0){let te=0;if(b){let q=!1;if(I!==null){let _e=I.texture.format;q=_e===Mo||_e===wo||_e===vo}if(q){let _e=I.texture.type,Ae=_e===_i||_e===Qi||_e===$n||_e===Qn||_e===yo||_e===xo,Ue=De.getClearColor(),Re=De.getClearAlpha(),Be=Ue.r,ze=Ue.g,Fe=Ue.b;Ae?(g[0]=Be,g[1]=ze,g[2]=Fe,g[3]=Re,D.clearBufferuiv(D.COLOR,0,g)):(w[0]=Be,w[1]=ze,w[2]=Fe,w[3]=Re,D.clearBufferiv(D.COLOR,0,w))}else te|=D.COLOR_BUFFER_BIT}H&&(te|=D.DEPTH_BUFFER_BIT),Q&&(te|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(te)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",O,!1),t.removeEventListener("webglcontextrestored",P,!1),t.removeEventListener("webglcontextcreationerror",W,!1),De.dispose(),re.dispose(),Ie.dispose(),pe.dispose(),Ve.dispose(),ke.dispose(),Y.dispose(),B.dispose(),J.dispose(),ne.dispose(),V.dispose(),V.removeEventListener("sessionstart",ot),V.removeEventListener("sessionend",je),Je.stop()};function O(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),F=!0}function P(){console.log("THREE.WebGLRenderer: Context Restored."),F=!1;let b=xe.autoReset,H=we.enabled,Q=we.autoUpdate,te=we.needsUpdate,q=we.type;S(),xe.autoReset=b,we.enabled=H,we.autoUpdate=Q,we.needsUpdate=te,we.type=q}function W(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function k(b){let H=b.target;H.removeEventListener("dispose",k),ie(H)}function ie(b){Z(b),pe.remove(b)}function Z(b){let H=pe.get(b).programs;H!==void 0&&(H.forEach(function(Q){ne.releaseProgram(Q)}),b.isShaderMaterial&&ne.releaseShaderCache(b))}this.renderBufferDirect=function(b,H,Q,te,q,_e){H===null&&(H=Pe);let Ae=q.isMesh&&q.matrixWorld.determinant()<0,Ue=Hh(b,H,Q,te,q);oe.setMaterial(te,Ae);let Re=Q.index,Be=1;if(te.wireframe===!0){if(Re=v.getWireframeAttribute(Q),Re===void 0)return;Be=2}let ze=Q.drawRange,Fe=Q.attributes.position,Qe=ze.start*Be,ht=(ze.start+ze.count)*Be;_e!==null&&(Qe=Math.max(Qe,_e.start*Be),ht=Math.min(ht,(_e.start+_e.count)*Be)),Re!==null?(Qe=Math.max(Qe,0),ht=Math.min(ht,Re.count)):Fe!=null&&(Qe=Math.max(Qe,0),ht=Math.min(ht,Fe.count));let wt=ht-Qe;if(wt<0||wt===1/0)return;B.setup(q,te,Ue,Q,Re);let pt,ft=Te;if(Re!==null&&(pt=A.get(Re),ft=_,ft.setIndex(pt)),q.isMesh)te.wireframe===!0?(oe.setLineWidth(te.wireframeLinewidth*st()),ft.setMode(D.LINES)):ft.setMode(D.TRIANGLES);else if(q.isLine){let Oe=te.linewidth;Oe===void 0&&(Oe=1),oe.setLineWidth(Oe*st()),q.isLineSegments?ft.setMode(D.LINES):q.isLineLoop?ft.setMode(D.LINE_LOOP):ft.setMode(D.LINE_STRIP)}else q.isPoints?ft.setMode(D.POINTS):q.isSprite&&ft.setMode(D.TRIANGLES);if(q.isBatchedMesh)if(q._multiDrawInstances!==null)zn("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ft.renderMultiDrawInstances(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount,q._multiDrawInstances);else if(ce.get("WEBGL_multi_draw"))ft.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{let Oe=q._multiDrawStarts,gt=q._multiDrawCounts,nt=q._multiDrawCount,$t=Re?A.get(Re).bytesPerElement:1,Mn=pe.get(te).currentProgram.getUniforms();for(let jt=0;jt<nt;jt++)Mn.setValue(D,"_gl_DrawID",jt),ft.render(Oe[jt]/$t,gt[jt])}else if(q.isInstancedMesh)ft.renderInstances(Qe,wt,q.count);else if(Q.isInstancedBufferGeometry){let Oe=Q._maxInstanceCount!==void 0?Q._maxInstanceCount:1/0,gt=Math.min(Q.instanceCount,Oe);ft.renderInstances(Qe,wt,gt)}else ft.render(Qe,wt)};function Me(b,H,Q){b.transparent===!0&&b.side===Wt&&b.forceSinglePass===!1?(b.side=Ht,b.needsUpdate=!0,Fi(b,H,Q),b.side=Pi,b.needsUpdate=!0,Fi(b,H,Q),b.side=Wt):Fi(b,H,Q)}this.compile=function(b,H,Q=null){Q===null&&(Q=b),u=Ie.get(Q),u.init(H),T.push(u),Q.traverseVisible(function(q){q.isLight&&q.layers.test(H.layers)&&(u.pushLight(q),q.castShadow&&u.pushShadow(q))}),b!==Q&&b.traverseVisible(function(q){q.isLight&&q.layers.test(H.layers)&&(u.pushLight(q),q.castShadow&&u.pushShadow(q))}),u.setupLights();let te=new Set;return b.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;let _e=q.material;if(_e)if(Array.isArray(_e))for(let Ae=0;Ae<_e.length;Ae++){let Ue=_e[Ae];Me(Ue,Q,q),te.add(Ue)}else Me(_e,Q,q),te.add(_e)}),u=T.pop(),te},this.compileAsync=function(b,H,Q=null){let te=this.compile(b,H,Q);return new Promise(q=>{function _e(){if(te.forEach(function(Ae){pe.get(Ae).currentProgram.isReady()&&te.delete(Ae)}),te.size===0){q(b);return}setTimeout(_e,10)}ce.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let Le=null;function ct(b){Le&&Le(b)}function ot(){Je.stop()}function je(){Je.start()}let Je=new Dh;Je.setAnimationLoop(ct),typeof self<"u"&&Je.setContext(self),this.setAnimationLoop=function(b){Le=b,V.setAnimationLoop(b),b===null?Je.stop():Je.start()},V.addEventListener("sessionstart",ot),V.addEventListener("sessionend",je),this.render=function(b,H){if(H!==void 0&&H.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(F===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),H.parent===null&&H.matrixWorldAutoUpdate===!0&&H.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(V.cameraAutoUpdate===!0&&V.updateCamera(H),H=V.getCamera()),b.isScene===!0&&b.onBeforeRender(M,b,H,I),u=Ie.get(b,T.length),u.init(H),T.push(u),se.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),it.setFromProjectionMatrix(se,fi,H.reversedDepth),ae=this.localClippingEnabled,Ze=ge.init(this.clippingPlanes,ae),m=re.get(b,R.length),m.init(),R.push(m),V.enabled===!0&&V.isPresenting===!0){let _e=M.xr.getDepthSensingMesh();_e!==null&&ut(_e,H,-1/0,M.sortObjects)}ut(b,H,0,M.sortObjects),m.finish(),M.sortObjects===!0&&m.sort(ye,Se),qe=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,qe&&De.addToRenderList(m,b),this.info.render.frame++,Ze===!0&&ge.beginShadows();let Q=u.state.shadowsArray;we.render(Q,b,H),Ze===!0&&ge.endShadows(),this.info.autoReset===!0&&this.info.reset();let te=m.opaque,q=m.transmissive;if(u.setupLights(),H.isArrayCamera){let _e=H.cameras;if(q.length>0)for(let Ae=0,Ue=_e.length;Ae<Ue;Ae++){let Re=_e[Ae];wn(te,q,b,Re)}qe&&De.render(b);for(let Ae=0,Ue=_e.length;Ae<Ue;Ae++){let Re=_e[Ae];Bt(m,b,Re,Re.viewport)}}else q.length>0&&wn(te,q,b,H),qe&&De.render(b),Bt(m,b,H);I!==null&&U===0&&(ve.updateMultisampleRenderTarget(I),ve.updateRenderTargetMipmap(I)),b.isScene===!0&&b.onAfterRender(M,b,H),B.resetDefaultState(),y=-1,x=null,T.pop(),T.length>0?(u=T[T.length-1],Ze===!0&&ge.setGlobalState(M.clippingPlanes,u.state.camera)):u=null,R.pop(),R.length>0?m=R[R.length-1]:m=null};function ut(b,H,Q,te){if(b.visible===!1)return;if(b.layers.test(H.layers)){if(b.isGroup)Q=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(H);else if(b.isLight)u.pushLight(b),b.castShadow&&u.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||it.intersectsSprite(b)){te&&Ne.setFromMatrixPosition(b.matrixWorld).applyMatrix4(se);let Ae=Y.update(b),Ue=b.material;Ue.visible&&m.push(b,Ae,Ue,Q,Ne.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||it.intersectsObject(b))){let Ae=Y.update(b),Ue=b.material;if(te&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Ne.copy(b.boundingSphere.center)):(Ae.boundingSphere===null&&Ae.computeBoundingSphere(),Ne.copy(Ae.boundingSphere.center)),Ne.applyMatrix4(b.matrixWorld).applyMatrix4(se)),Array.isArray(Ue)){let Re=Ae.groups;for(let Be=0,ze=Re.length;Be<ze;Be++){let Fe=Re[Be],Qe=Ue[Fe.materialIndex];Qe&&Qe.visible&&m.push(b,Ae,Qe,Q,Ne.z,Fe)}}else Ue.visible&&m.push(b,Ae,Ue,Q,Ne.z,null)}}let _e=b.children;for(let Ae=0,Ue=_e.length;Ae<Ue;Ae++)ut(_e[Ae],H,Q,te)}function Bt(b,H,Q,te){let q=b.opaque,_e=b.transmissive,Ae=b.transparent;u.setupLightsView(Q),Ze===!0&&ge.setGlobalState(M.clippingPlanes,Q),te&&oe.viewport(C.copy(te)),q.length>0&&Ct(q,H,Q),_e.length>0&&Ct(_e,H,Q),Ae.length>0&&Ct(Ae,H,Q),oe.buffers.depth.setTest(!0),oe.buffers.depth.setMask(!0),oe.buffers.color.setMask(!0),oe.setPolygonOffset(!1)}function wn(b,H,Q,te){if((Q.isScene===!0?Q.overrideMaterial:null)!==null)return;u.state.transmissionRenderTarget[te.id]===void 0&&(u.state.transmissionRenderTarget[te.id]=new xi(1,1,{generateMipmaps:!0,type:ce.has("EXT_color_buffer_half_float")||ce.has("EXT_color_buffer_float")?jn:_i,minFilter:ji,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:tt.workingColorSpace}));let _e=u.state.transmissionRenderTarget[te.id],Ae=te.viewport||C;_e.setSize(Ae.z*M.transmissionResolutionScale,Ae.w*M.transmissionResolutionScale);let Ue=M.getRenderTarget(),Re=M.getActiveCubeFace(),Be=M.getActiveMipmapLevel();M.setRenderTarget(_e),M.getClearColor(G),K=M.getClearAlpha(),K<1&&M.setClearColor(16777215,.5),M.clear(),qe&&De.render(Q);let ze=M.toneMapping;M.toneMapping=Ui;let Fe=te.viewport;if(te.viewport!==void 0&&(te.viewport=void 0),u.setupLightsView(te),Ze===!0&&ge.setGlobalState(M.clippingPlanes,te),Ct(b,Q,te),ve.updateMultisampleRenderTarget(_e),ve.updateRenderTargetMipmap(_e),ce.has("WEBGL_multisampled_render_to_texture")===!1){let Qe=!1;for(let ht=0,wt=H.length;ht<wt;ht++){let pt=H[ht],ft=pt.object,Oe=pt.geometry,gt=pt.material,nt=pt.group;if(gt.side===Wt&&ft.layers.test(te.layers)){let $t=gt.side;gt.side=Ht,gt.needsUpdate=!0,It(ft,Q,te,Oe,gt,nt),gt.side=$t,gt.needsUpdate=!0,Qe=!0}}Qe===!0&&(ve.updateMultisampleRenderTarget(_e),ve.updateRenderTargetMipmap(_e))}M.setRenderTarget(Ue,Re,Be),M.setClearColor(G,K),Fe!==void 0&&(te.viewport=Fe),M.toneMapping=ze}function Ct(b,H,Q){let te=H.isScene===!0?H.overrideMaterial:null;for(let q=0,_e=b.length;q<_e;q++){let Ae=b[q],Ue=Ae.object,Re=Ae.geometry,Be=Ae.group,ze=Ae.material;ze.allowOverride===!0&&te!==null&&(ze=te),Ue.layers.test(Q.layers)&&It(Ue,H,Q,Re,ze,Be)}}function It(b,H,Q,te,q,_e){b.onBeforeRender(M,H,Q,te,q,_e),b.modelViewMatrix.multiplyMatrices(Q.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),q.onBeforeRender(M,H,Q,te,b,_e),q.transparent===!0&&q.side===Wt&&q.forceSinglePass===!1?(q.side=Ht,q.needsUpdate=!0,M.renderBufferDirect(Q,H,te,q,b,_e),q.side=Pi,q.needsUpdate=!0,M.renderBufferDirect(Q,H,te,q,b,_e),q.side=Wt):M.renderBufferDirect(Q,H,te,q,b,_e),b.onAfterRender(M,H,Q,te,q,_e)}function Fi(b,H,Q){H.isScene!==!0&&(H=Pe);let te=pe.get(b),q=u.state.lights,_e=u.state.shadowsArray,Ae=q.state.version,Ue=ne.getParameters(b,q.state,_e,H,Q),Re=ne.getProgramCacheKey(Ue),Be=te.programs;te.environment=b.isMeshStandardMaterial?H.environment:null,te.fog=H.fog,te.envMap=(b.isMeshStandardMaterial?ke:Ve).get(b.envMap||te.environment),te.envMapRotation=te.environment!==null&&b.envMap===null?H.environmentRotation:b.envMapRotation,Be===void 0&&(b.addEventListener("dispose",k),Be=new Map,te.programs=Be);let ze=Be.get(Re);if(ze!==void 0){if(te.currentProgram===ze&&te.lightsStateVersion===Ae)return Fl(b,Ue),ze}else Ue.uniforms=ne.getUniforms(b),b.onBeforeCompile(Ue,M),ze=ne.acquireProgram(Ue,Re),Be.set(Re,ze),te.uniforms=Ue.uniforms;let Fe=te.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Fe.clippingPlanes=ge.uniform),Fl(b,Ue),te.needsLights=Xh(b),te.lightsStateVersion=Ae,te.needsLights&&(Fe.ambientLightColor.value=q.state.ambient,Fe.lightProbe.value=q.state.probe,Fe.directionalLights.value=q.state.directional,Fe.directionalLightShadows.value=q.state.directionalShadow,Fe.spotLights.value=q.state.spot,Fe.spotLightShadows.value=q.state.spotShadow,Fe.rectAreaLights.value=q.state.rectArea,Fe.ltc_1.value=q.state.rectAreaLTC1,Fe.ltc_2.value=q.state.rectAreaLTC2,Fe.pointLights.value=q.state.point,Fe.pointLightShadows.value=q.state.pointShadow,Fe.hemisphereLights.value=q.state.hemi,Fe.directionalShadowMap.value=q.state.directionalShadowMap,Fe.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Fe.spotShadowMap.value=q.state.spotShadowMap,Fe.spotLightMatrix.value=q.state.spotLightMatrix,Fe.spotLightMap.value=q.state.spotLightMap,Fe.pointShadowMap.value=q.state.pointShadowMap,Fe.pointShadowMatrix.value=q.state.pointShadowMatrix),te.currentProgram=ze,te.uniformsList=null,ze}function sr(b){if(b.uniformsList===null){let H=b.currentProgram.getUniforms();b.uniformsList=nr.seqWithValue(H.seq,b.uniforms)}return b.uniformsList}function Fl(b,H){let Q=pe.get(b);Q.outputColorSpace=H.outputColorSpace,Q.batching=H.batching,Q.batchingColor=H.batchingColor,Q.instancing=H.instancing,Q.instancingColor=H.instancingColor,Q.instancingMorph=H.instancingMorph,Q.skinning=H.skinning,Q.morphTargets=H.morphTargets,Q.morphNormals=H.morphNormals,Q.morphColors=H.morphColors,Q.morphTargetsCount=H.morphTargetsCount,Q.numClippingPlanes=H.numClippingPlanes,Q.numIntersection=H.numClipIntersection,Q.vertexAlphas=H.vertexAlphas,Q.vertexTangents=H.vertexTangents,Q.toneMapping=H.toneMapping}function Hh(b,H,Q,te,q){H.isScene!==!0&&(H=Pe),ve.resetTextureUnits();let _e=H.fog,Ae=te.isMeshStandardMaterial?H.environment:null,Ue=I===null?M.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:cn,Re=(te.isMeshStandardMaterial?ke:Ve).get(te.envMap||Ae),Be=te.vertexColors===!0&&!!Q.attributes.color&&Q.attributes.color.itemSize===4,ze=!!Q.attributes.tangent&&(!!te.normalMap||te.anisotropy>0),Fe=!!Q.morphAttributes.position,Qe=!!Q.morphAttributes.normal,ht=!!Q.morphAttributes.color,wt=Ui;te.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(wt=M.toneMapping);let pt=Q.morphAttributes.position||Q.morphAttributes.normal||Q.morphAttributes.color,ft=pt!==void 0?pt.length:0,Oe=pe.get(te),gt=u.state.lights;if(Ze===!0&&(ae===!0||b!==x)){let zt=b===x&&te.id===y;ge.setState(te,b,zt)}let nt=!1;te.version===Oe.__version?(Oe.needsLights&&Oe.lightsStateVersion!==gt.state.version||Oe.outputColorSpace!==Ue||q.isBatchedMesh&&Oe.batching===!1||!q.isBatchedMesh&&Oe.batching===!0||q.isBatchedMesh&&Oe.batchingColor===!0&&q.colorTexture===null||q.isBatchedMesh&&Oe.batchingColor===!1&&q.colorTexture!==null||q.isInstancedMesh&&Oe.instancing===!1||!q.isInstancedMesh&&Oe.instancing===!0||q.isSkinnedMesh&&Oe.skinning===!1||!q.isSkinnedMesh&&Oe.skinning===!0||q.isInstancedMesh&&Oe.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&Oe.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&Oe.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&Oe.instancingMorph===!1&&q.morphTexture!==null||Oe.envMap!==Re||te.fog===!0&&Oe.fog!==_e||Oe.numClippingPlanes!==void 0&&(Oe.numClippingPlanes!==ge.numPlanes||Oe.numIntersection!==ge.numIntersection)||Oe.vertexAlphas!==Be||Oe.vertexTangents!==ze||Oe.morphTargets!==Fe||Oe.morphNormals!==Qe||Oe.morphColors!==ht||Oe.toneMapping!==wt||Oe.morphTargetsCount!==ft)&&(nt=!0):(nt=!0,Oe.__version=te.version);let $t=Oe.currentProgram;nt===!0&&($t=Fi(te,H,q));let Mn=!1,jt=!1,or=!1,yt=$t.getUniforms(),si=Oe.uniforms;if(oe.useProgram($t.program)&&(Mn=!0,jt=!0,or=!0),te.id!==y&&(y=te.id,jt=!0),Mn||x!==b){oe.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),yt.setValue(D,"projectionMatrix",b.projectionMatrix),yt.setValue(D,"viewMatrix",b.matrixWorldInverse);let Xt=yt.map.cameraPosition;Xt!==void 0&&Xt.setValue(D,Ce.setFromMatrixPosition(b.matrixWorld)),le.logarithmicDepthBuffer&&yt.setValue(D,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(te.isMeshPhongMaterial||te.isMeshToonMaterial||te.isMeshLambertMaterial||te.isMeshBasicMaterial||te.isMeshStandardMaterial||te.isShaderMaterial)&&yt.setValue(D,"isOrthographic",b.isOrthographicCamera===!0),x!==b&&(x=b,jt=!0,or=!0)}if(q.isSkinnedMesh){yt.setOptional(D,q,"bindMatrix"),yt.setOptional(D,q,"bindMatrixInverse");let zt=q.skeleton;zt&&(zt.boneTexture===null&&zt.computeBoneTexture(),yt.setValue(D,"boneTexture",zt.boneTexture,ve))}q.isBatchedMesh&&(yt.setOptional(D,q,"batchingTexture"),yt.setValue(D,"batchingTexture",q._matricesTexture,ve),yt.setOptional(D,q,"batchingIdTexture"),yt.setValue(D,"batchingIdTexture",q._indirectTexture,ve),yt.setOptional(D,q,"batchingColorTexture"),q._colorsTexture!==null&&yt.setValue(D,"batchingColorTexture",q._colorsTexture,ve));let oi=Q.morphAttributes;if((oi.position!==void 0||oi.normal!==void 0||oi.color!==void 0)&&fe.update(q,Q,$t),(jt||Oe.receiveShadow!==q.receiveShadow)&&(Oe.receiveShadow=q.receiveShadow,yt.setValue(D,"receiveShadow",q.receiveShadow)),te.isMeshGouraudMaterial&&te.envMap!==null&&(si.envMap.value=Re,si.flipEnvMap.value=Re.isCubeTexture&&Re.isRenderTargetTexture===!1?-1:1),te.isMeshStandardMaterial&&te.envMap===null&&H.environment!==null&&(si.envMapIntensity.value=H.environmentIntensity),jt&&(yt.setValue(D,"toneMappingExposure",M.toneMappingExposure),Oe.needsLights&&Wh(si,or),_e&&te.fog===!0&&de.refreshFogUniforms(si,_e),de.refreshMaterialUniforms(si,te,ee,he,u.state.transmissionRenderTarget[b.id]),nr.upload(D,sr(Oe),si,ve)),te.isShaderMaterial&&te.uniformsNeedUpdate===!0&&(nr.upload(D,sr(Oe),si,ve),te.uniformsNeedUpdate=!1),te.isSpriteMaterial&&yt.setValue(D,"center",q.center),yt.setValue(D,"modelViewMatrix",q.modelViewMatrix),yt.setValue(D,"normalMatrix",q.normalMatrix),yt.setValue(D,"modelMatrix",q.matrixWorld),te.isShaderMaterial||te.isRawShaderMaterial){let zt=te.uniformsGroups;for(let Xt=0,sa=zt.length;Xt<sa;Xt++){let en=zt[Xt];J.update(en,$t),J.bind(en,$t)}}return $t}function Wh(b,H){b.ambientLightColor.needsUpdate=H,b.lightProbe.needsUpdate=H,b.directionalLights.needsUpdate=H,b.directionalLightShadows.needsUpdate=H,b.pointLights.needsUpdate=H,b.pointLightShadows.needsUpdate=H,b.spotLights.needsUpdate=H,b.spotLightShadows.needsUpdate=H,b.rectAreaLights.needsUpdate=H,b.hemisphereLights.needsUpdate=H}function Xh(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return U},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(b,H,Q){let te=pe.get(b);te.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,te.__autoAllocateDepthBuffer===!1&&(te.__useRenderToTexture=!1),pe.get(b.texture).__webglTexture=H,pe.get(b.depthTexture).__webglTexture=te.__autoAllocateDepthBuffer?void 0:Q,te.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,H){let Q=pe.get(b);Q.__webglFramebuffer=H,Q.__useDefaultFramebuffer=H===void 0};let qh=D.createFramebuffer();this.setRenderTarget=function(b,H=0,Q=0){I=b,E=H,U=Q;let te=!0,q=null,_e=!1,Ae=!1;if(b){let Re=pe.get(b);if(Re.__useDefaultFramebuffer!==void 0)oe.bindFramebuffer(D.FRAMEBUFFER,null),te=!1;else if(Re.__webglFramebuffer===void 0)ve.setupRenderTarget(b);else if(Re.__hasExternalTextures)ve.rebindTextures(b,pe.get(b.texture).__webglTexture,pe.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let Fe=b.depthTexture;if(Re.__boundDepthTexture!==Fe){if(Fe!==null&&pe.has(Fe)&&(b.width!==Fe.image.width||b.height!==Fe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ve.setupDepthRenderbuffer(b)}}let Be=b.texture;(Be.isData3DTexture||Be.isDataArrayTexture||Be.isCompressedArrayTexture)&&(Ae=!0);let ze=pe.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(ze[H])?q=ze[H][Q]:q=ze[H],_e=!0):b.samples>0&&ve.useMultisampledRTT(b)===!1?q=pe.get(b).__webglMultisampledFramebuffer:Array.isArray(ze)?q=ze[Q]:q=ze,C.copy(b.viewport),z.copy(b.scissor),X=b.scissorTest}else C.copy(Ee).multiplyScalar(ee).floor(),z.copy(Ge).multiplyScalar(ee).floor(),X=$e;if(Q!==0&&(q=qh),oe.bindFramebuffer(D.FRAMEBUFFER,q)&&te&&oe.drawBuffers(b,q),oe.viewport(C),oe.scissor(z),oe.setScissorTest(X),_e){let Re=pe.get(b.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+H,Re.__webglTexture,Q)}else if(Ae){let Re=H;for(let Be=0;Be<b.textures.length;Be++){let ze=pe.get(b.textures[Be]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Be,ze.__webglTexture,Q,Re)}}else if(b!==null&&Q!==0){let Re=pe.get(b.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Re.__webglTexture,Q)}y=-1},this.readRenderTargetPixels=function(b,H,Q,te,q,_e,Ae,Ue=0){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Re=pe.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ae!==void 0&&(Re=Re[Ae]),Re){oe.bindFramebuffer(D.FRAMEBUFFER,Re);try{let Be=b.textures[Ue],ze=Be.format,Fe=Be.type;if(!le.textureFormatReadable(ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!le.textureTypeReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}H>=0&&H<=b.width-te&&Q>=0&&Q<=b.height-q&&(b.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Ue),D.readPixels(H,Q,te,q,L.convert(ze),L.convert(Fe),_e))}finally{let Be=I!==null?pe.get(I).__webglFramebuffer:null;oe.bindFramebuffer(D.FRAMEBUFFER,Be)}}},this.readRenderTargetPixelsAsync=async function(b,H,Q,te,q,_e,Ae,Ue=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Re=pe.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ae!==void 0&&(Re=Re[Ae]),Re)if(H>=0&&H<=b.width-te&&Q>=0&&Q<=b.height-q){oe.bindFramebuffer(D.FRAMEBUFFER,Re);let Be=b.textures[Ue],ze=Be.format,Fe=Be.type;if(!le.textureFormatReadable(ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!le.textureTypeReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Qe=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Qe),D.bufferData(D.PIXEL_PACK_BUFFER,_e.byteLength,D.STREAM_READ),b.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Ue),D.readPixels(H,Q,te,q,L.convert(ze),L.convert(Fe),0);let ht=I!==null?pe.get(I).__webglFramebuffer:null;oe.bindFramebuffer(D.FRAMEBUFFER,ht);let wt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await th(D,wt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Qe),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,_e),D.deleteBuffer(Qe),D.deleteSync(wt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,H=null,Q=0){let te=Math.pow(2,-Q),q=Math.floor(b.image.width*te),_e=Math.floor(b.image.height*te),Ae=H!==null?H.x:0,Ue=H!==null?H.y:0;ve.setTexture2D(b,0),D.copyTexSubImage2D(D.TEXTURE_2D,Q,0,0,Ae,Ue,q,_e),oe.unbindTexture()};let Yh=D.createFramebuffer(),Zh=D.createFramebuffer();this.copyTextureToTexture=function(b,H,Q=null,te=null,q=0,_e=null){_e===null&&(q!==0?(zn("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),_e=q,q=0):_e=0);let Ae,Ue,Re,Be,ze,Fe,Qe,ht,wt,pt=b.isCompressedTexture?b.mipmaps[_e]:b.image;if(Q!==null)Ae=Q.max.x-Q.min.x,Ue=Q.max.y-Q.min.y,Re=Q.isBox3?Q.max.z-Q.min.z:1,Be=Q.min.x,ze=Q.min.y,Fe=Q.isBox3?Q.min.z:0;else{let oi=Math.pow(2,-q);Ae=Math.floor(pt.width*oi),Ue=Math.floor(pt.height*oi),b.isDataArrayTexture?Re=pt.depth:b.isData3DTexture?Re=Math.floor(pt.depth*oi):Re=1,Be=0,ze=0,Fe=0}te!==null?(Qe=te.x,ht=te.y,wt=te.z):(Qe=0,ht=0,wt=0);let ft=L.convert(H.format),Oe=L.convert(H.type),gt;H.isData3DTexture?(ve.setTexture3D(H,0),gt=D.TEXTURE_3D):H.isDataArrayTexture||H.isCompressedArrayTexture?(ve.setTexture2DArray(H,0),gt=D.TEXTURE_2D_ARRAY):(ve.setTexture2D(H,0),gt=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,H.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,H.unpackAlignment);let nt=D.getParameter(D.UNPACK_ROW_LENGTH),$t=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Mn=D.getParameter(D.UNPACK_SKIP_PIXELS),jt=D.getParameter(D.UNPACK_SKIP_ROWS),or=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,pt.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,pt.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Be),D.pixelStorei(D.UNPACK_SKIP_ROWS,ze),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Fe);let yt=b.isDataArrayTexture||b.isData3DTexture,si=H.isDataArrayTexture||H.isData3DTexture;if(b.isDepthTexture){let oi=pe.get(b),zt=pe.get(H),Xt=pe.get(oi.__renderTarget),sa=pe.get(zt.__renderTarget);oe.bindFramebuffer(D.READ_FRAMEBUFFER,Xt.__webglFramebuffer),oe.bindFramebuffer(D.DRAW_FRAMEBUFFER,sa.__webglFramebuffer);for(let en=0;en<Re;en++)yt&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,pe.get(b).__webglTexture,q,Fe+en),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,pe.get(H).__webglTexture,_e,wt+en)),D.blitFramebuffer(Be,ze,Ae,Ue,Qe,ht,Ae,Ue,D.DEPTH_BUFFER_BIT,D.NEAREST);oe.bindFramebuffer(D.READ_FRAMEBUFFER,null),oe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(q!==0||b.isRenderTargetTexture||pe.has(b)){let oi=pe.get(b),zt=pe.get(H);oe.bindFramebuffer(D.READ_FRAMEBUFFER,Yh),oe.bindFramebuffer(D.DRAW_FRAMEBUFFER,Zh);for(let Xt=0;Xt<Re;Xt++)yt?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,oi.__webglTexture,q,Fe+Xt):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,oi.__webglTexture,q),si?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,zt.__webglTexture,_e,wt+Xt):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,zt.__webglTexture,_e),q!==0?D.blitFramebuffer(Be,ze,Ae,Ue,Qe,ht,Ae,Ue,D.COLOR_BUFFER_BIT,D.NEAREST):si?D.copyTexSubImage3D(gt,_e,Qe,ht,wt+Xt,Be,ze,Ae,Ue):D.copyTexSubImage2D(gt,_e,Qe,ht,Be,ze,Ae,Ue);oe.bindFramebuffer(D.READ_FRAMEBUFFER,null),oe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else si?b.isDataTexture||b.isData3DTexture?D.texSubImage3D(gt,_e,Qe,ht,wt,Ae,Ue,Re,ft,Oe,pt.data):H.isCompressedArrayTexture?D.compressedTexSubImage3D(gt,_e,Qe,ht,wt,Ae,Ue,Re,ft,pt.data):D.texSubImage3D(gt,_e,Qe,ht,wt,Ae,Ue,Re,ft,Oe,pt):b.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,_e,Qe,ht,Ae,Ue,ft,Oe,pt.data):b.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,_e,Qe,ht,pt.width,pt.height,ft,pt.data):D.texSubImage2D(D.TEXTURE_2D,_e,Qe,ht,Ae,Ue,ft,Oe,pt);D.pixelStorei(D.UNPACK_ROW_LENGTH,nt),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,$t),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Mn),D.pixelStorei(D.UNPACK_SKIP_ROWS,jt),D.pixelStorei(D.UNPACK_SKIP_IMAGES,or),_e===0&&H.generateMipmaps&&D.generateMipmap(gt),oe.unbindTexture()},this.initRenderTarget=function(b){pe.get(b).__webglFramebuffer===void 0&&ve.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?ve.setTextureCube(b,0):b.isData3DTexture?ve.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?ve.setTexture2DArray(b,0):ve.setTexture2D(b,0),oe.unbindTexture()},this.resetState=function(){E=0,U=0,I=null,oe.reset(),B.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return fi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=tt._getDrawingBufferColorSpace(e),t.unpackColorSpace=tt._getUnpackColorSpace()}};var Oh={type:"change"},Ll={type:"start"},zh={type:"end"},na=new qi,Bh=new qt,Xm=Math.cos(70*ci.DEG2RAD),At=new N,Kt=2*Math.PI,dt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Dl=1e-6,ra=class extends $r{constructor(e,t=null){super(e,t),this.state=dt.NONE,this.target=new N,this.cursor=new N,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ki.ROTATE,MIDDLE:Ki.DOLLY,RIGHT:Ki.PAN},this.touches={ONE:$i.ROTATE,TWO:$i.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new N,this._lastQuaternion=new li,this._lastTargetPosition=new N,this._quat=new li().setFromUnitVectors(e.up,new N(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Kn,this._sphericalDelta=new Kn,this._scale=1,this._panOffset=new N,this._rotateStart=new me,this._rotateEnd=new me,this._rotateDelta=new me,this._panStart=new me,this._panEnd=new me,this._panDelta=new me,this._dollyStart=new me,this._dollyEnd=new me,this._dollyDelta=new me,this._dollyDirection=new N,this._mouse=new me,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Ym.bind(this),this._onPointerDown=qm.bind(this),this._onPointerUp=Zm.bind(this),this._onContextMenu=t1.bind(this),this._onMouseWheel=$m.bind(this),this._onKeyDown=jm.bind(this),this._onTouchStart=Qm.bind(this),this._onTouchMove=e1.bind(this),this._onMouseDown=Jm.bind(this),this._onMouseMove=Km.bind(this),this._interceptControlDown=i1.bind(this),this._interceptControlUp=n1.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Oh),this.update(),this.state=dt.NONE}update(e=null){let t=this.object.position;At.copy(t).sub(this.target),At.applyQuaternion(this._quat),this._spherical.setFromVector3(At),this.autoRotate&&this.state===dt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(i)&&isFinite(r)&&(i<-Math.PI?i+=Kt:i>Math.PI&&(i-=Kt),r<-Math.PI?r+=Kt:r>Math.PI&&(r-=Kt),i<=r?this._spherical.theta=Math.max(i,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+r)/2?Math.max(i,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=o!=this._spherical.radius}if(At.setFromSpherical(this._spherical),At.applyQuaternion(this._quatInverse),t.copy(this.target).add(At),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=At.length();o=this._clampDistance(a*this._scale);let c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),s=!!c}else if(this.object.isOrthographicCamera){let a=new N(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=c!==this.object.zoom;let l=new N(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=At.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(na.origin.copy(this.object.position),na.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(na.direction))<Xm?this.object.lookAt(this.target):(Bh.setFromNormalAndCoplanarPoint(this.object.up,this.target),na.intersectPlane(Bh,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>Dl||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Dl||this._lastTargetPosition.distanceToSquared(this.target)>Dl?(this.dispatchEvent(Oh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Kt/60*this.autoRotateSpeed*e:Kt/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){At.setFromMatrixColumn(t,0),At.multiplyScalar(-e),this._panOffset.add(At)}_panUp(e,t){this.screenSpacePanning===!0?At.setFromMatrixColumn(t,1):(At.setFromMatrixColumn(t,0),At.crossVectors(this.object.up,At)),At.multiplyScalar(e),this._panOffset.add(At)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;At.copy(r).sub(this.target);let s=At.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*s/i.clientHeight,this.object.matrix),this._panUp(2*t*s/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),r=e-i.left,s=t-i.top,o=i.width,a=i.height;this._mouse.x=r/o*2-1,this._mouse.y=-(s/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Kt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Kt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Kt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Kt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Kt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Kt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(i,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(i,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(i*i+r*r);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),r=.5*(e.pageX+i.x),s=.5*(e.pageY+i.y);this._rotateEnd.set(r,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Kt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Kt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(i,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(i*i+r*r);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new me,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function qm(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function Ym(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function Zm(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(zh),this.state=dt.NONE;break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Jm(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Ki.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=dt.DOLLY;break;case Ki.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=dt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=dt.ROTATE}break;case Ki.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=dt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=dt.PAN}break;default:this.state=dt.NONE}this.state!==dt.NONE&&this.dispatchEvent(Ll)}function Km(n){switch(this.state){case dt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case dt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case dt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function $m(n){this.enabled===!1||this.enableZoom===!1||this.state!==dt.NONE||(n.preventDefault(),this.dispatchEvent(Ll),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(zh))}function jm(n){this.enabled!==!1&&this._handleKeyDown(n)}function Qm(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case $i.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=dt.TOUCH_ROTATE;break;case $i.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=dt.TOUCH_PAN;break;default:this.state=dt.NONE}break;case 2:switch(this.touches.TWO){case $i.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=dt.TOUCH_DOLLY_PAN;break;case $i.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=dt.TOUCH_DOLLY_ROTATE;break;default:this.state=dt.NONE}break;default:this.state=dt.NONE}this.state!==dt.NONE&&this.dispatchEvent(Ll)}function e1(n){switch(this._trackPointer(n),this.state){case dt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case dt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case dt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case dt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=dt.NONE}}function t1(n){this.enabled!==!1&&n.preventDefault()}function i1(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function n1(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var rt={schema:"farm-house-construction-safe-v2",length_unit:"inches",render_unit:"metres",policy:"Geometry and uncertainty labels only. Not an as-built record.",local_placement:{east_ft:39.25,north_ft:142.4166667},house:{outline:[[171,0],[478,0],[478,348.5],[1030,348.5],[1030,208.5],[1158.5,208.5],[1158.5,43],[1310,43],[1310,775],[1038,775],[1038,806],[851,806],[851,844.5],[545,844.5],[545,709],[294,709],[294,849],[0,849],[0,243],[171,243]],openings:[{id:"opening-001",name:"Garage 12-foot vehicle door",wall_id:"wall-018",offset_in:328,width_in:144,height_in:96,sill_in:0,kind:"garage",confidence:"dimensioned"},{id:"opening-002",name:"Garage 16-foot vehicle door",wall_id:"wall-018",offset_in:129.5,width_in:192,height_in:96,sill_in:0,kind:"garage",confidence:"dimensioned"},{id:"opening-003",name:"Garage exterior pedestrian door",wall_id:"wall-018",offset_in:439.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-004",name:"Garage to laundry",wall_id:"wall-021",offset_in:269,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-005",name:"Laundry exterior door",wall_id:"wall-019",offset_in:138.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-006",name:"Front entry",wall_id:"wall-013",offset_in:64.5,width_in:40,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-007",name:"Entry north sidelight",wall_id:"wall-013",offset_in:103.5,width_in:24,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-008",name:"Entry south sidelight",wall_id:"wall-013",offset_in:30,width_in:24,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-009",name:"Living patio folding door",wall_id:"wall-003",offset_in:388,width_in:216,height_in:96,sill_in:0,kind:"folding",confidence:"dimensioned"},{id:"opening-010",name:"Garage front window",wall_id:"wall-017",offset_in:188.5,width_in:24,height_in:48,sill_in:48,kind:"window",confidence:"derived"},{id:"opening-011",name:"Garage front window",wall_id:"wall-017",offset_in:149,width_in:24,height_in:48,sill_in:48,kind:"window",confidence:"derived"},{id:"opening-012",name:"Garage front window",wall_id:"wall-017",offset_in:108,width_in:24,height_in:48,sill_in:48,kind:"window",confidence:"derived"},{id:"opening-013",name:"Office window",wall_id:"wall-015",offset_in:164,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-014",name:"Butler window",wall_id:"wall-015",offset_in:48,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-015",name:"Library north window",wall_id:"wall-013",offset_in:227.5,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-016",name:"Library south window",wall_id:"wall-013",offset_in:189.5,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-017",name:"Bedroom 3 north window",wall_id:"wall-011",offset_in:121.5,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-018",name:"Bedroom 3 south window",wall_id:"wall-011",offset_in:61.5,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-019",name:"Bedroom 4 window",wall_id:"wall-009",offset_in:109,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-020",name:"Master side window",wall_id:"wall-008",offset_in:334.5,width_in:32,height_in:72,sill_in:24,kind:"window",confidence:"derived"},{id:"opening-021",name:"Master side window",wall_id:"wall-008",offset_in:445.5,width_in:32,height_in:72,sill_in:24,kind:"window",confidence:"derived"},{id:"opening-022",name:"Laundry window",wall_id:"wall-018",offset_in:528.5,width_in:48,height_in:48,sill_in:48,kind:"window",confidence:"derived"},{id:"opening-023",name:"Guest WC window",wall_id:"wall-020",offset_in:24.5,width_in:24,height_in:36,sill_in:60,kind:"window",confidence:"derived"},{id:"opening-024",name:"Guest bath window",wall_id:"wall-020",offset_in:88,width_in:48,height_in:66,sill_in:30,kind:"window",confidence:"derived"},{id:"opening-025",name:"Master tub window",wall_id:"wall-006",offset_in:54.5,width_in:48,height_in:60,sill_in:36,kind:"window",confidence:"derived"},{id:"opening-026",name:"Shared shower window",wall_id:"wall-009",offset_in:242,width_in:36,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-027",name:"Kitchen sink window",wall_id:"wall-003",offset_in:134,width_in:72,height_in:52,sill_in:44,kind:"window",confidence:"derived"},{id:"opening-028",name:"Guest closet small window",wall_id:"wall-001",offset_in:82,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-029",name:"Master rear closet 1 small window",wall_id:"wall-007",offset_in:36.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-030",name:"Master rear closet 2 small window",wall_id:"wall-007",offset_in:100.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-031",name:"Master patio closet 1 small window",wall_id:"wall-005",offset_in:21,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-032",name:"Master patio closet 2 small window",wall_id:"wall-005",offset_in:79.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-033",name:"Master bath 1 small window",wall_id:"wall-008",offset_in:162.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-034",name:"Master bath 2 small window",wall_id:"wall-008",offset_in:235.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-035",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:54.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-036",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:100.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-037",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:144.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-038",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:249.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-039",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:289.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-040",name:"Guest courtyard door",wall_id:"wall-002",offset_in:329.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-041",name:"Kitchen courtyard door",wall_id:"wall-003",offset_in:231,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-042",name:"Master courtyard door",wall_id:"wall-058",offset_in:21.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-043",name:"Guest closet 1 door",wall_id:"wall-041",offset_in:31.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-044",name:"Guest closet 2 door",wall_id:"wall-039",offset_in:26.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-045",name:"Guest WC door",wall_id:"wall-046",offset_in:29.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-046",name:"Office closet door",wall_id:"wall-025",offset_in:71.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-047",name:"Office bath door",wall_id:"wall-034",offset_in:19,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-048",name:"Pantry door",wall_id:"wall-023",offset_in:33,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-049",name:"Pantry pocket door",wall_id:"wall-028",offset_in:47.5,width_in:36,height_in:96,sill_in:0,kind:"pocket",confidence:"derived"},{id:"opening-050",name:"Butler door",wall_id:"wall-030",offset_in:19,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-051",name:"Master suite door",wall_id:"wall-048",offset_in:152,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-052",name:"Master bath door",wall_id:"wall-056",offset_in:218,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-053",name:"Master patio closet door",wall_id:"wall-056",offset_in:47.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-054",name:"Master rear closet door",wall_id:"wall-051",offset_in:53.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-055",name:"Master WC door",wall_id:"wall-054",offset_in:31,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-056",name:"Powder door",wall_id:"wall-061",offset_in:46,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-057",name:"Bedroom 3 door",wall_id:"wall-068",offset_in:129.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-058",name:"Bedroom 3 closet door",wall_id:"wall-071",offset_in:26,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-059",name:"Bedroom 4 door",wall_id:"wall-073",offset_in:23.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-060",name:"Bedroom 4 closet door",wall_id:"wall-075",offset_in:60,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-061",name:"Shared bath door",wall_id:"wall-072",offset_in:24.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-062",name:"Storage door",wall_id:"wall-059",offset_in:30,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}],walls:[{id:"wall-001",name:"Exterior wall 1",a:[171,0],b:[478,0],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-028",name:"Guest closet small window",wall_id:"wall-001",offset_in:82,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"}]},{id:"wall-002",name:"Exterior wall 2",a:[478,0],b:[478,348.5],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-035",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:54.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-036",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:100.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-037",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:144.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-038",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:249.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-039",name:"Courtyard tall glazing",wall_id:"wall-002",offset_in:289.5,width_in:36,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-040",name:"Guest courtyard door",wall_id:"wall-002",offset_in:329.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-003",name:"Exterior wall 3",a:[478,348.5],b:[1030,348.5],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-009",name:"Living patio folding door",wall_id:"wall-003",offset_in:388,width_in:216,height_in:96,sill_in:0,kind:"folding",confidence:"dimensioned"},{id:"opening-027",name:"Kitchen sink window",wall_id:"wall-003",offset_in:134,width_in:72,height_in:52,sill_in:44,kind:"window",confidence:"derived"},{id:"opening-041",name:"Kitchen courtyard door",wall_id:"wall-003",offset_in:231,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-004",name:"Exterior wall 4",a:[1030,348.5],b:[1030,208.5],exterior:!0,core_in:5.5,height_in:120,openings:[]},{id:"wall-005",name:"Exterior wall 5",a:[1030,208.5],b:[1158.5,208.5],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-031",name:"Master patio closet 1 small window",wall_id:"wall-005",offset_in:21,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-032",name:"Master patio closet 2 small window",wall_id:"wall-005",offset_in:79.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"}]},{id:"wall-006",name:"Exterior wall 6",a:[1158.5,208.5],b:[1158.5,43],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-025",name:"Master tub window",wall_id:"wall-006",offset_in:54.5,width_in:48,height_in:60,sill_in:36,kind:"window",confidence:"derived"}]},{id:"wall-007",name:"Exterior wall 7",a:[1158.5,43],b:[1310,43],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-029",name:"Master rear closet 1 small window",wall_id:"wall-007",offset_in:36.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-030",name:"Master rear closet 2 small window",wall_id:"wall-007",offset_in:100.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"}]},{id:"wall-008",name:"Exterior wall 8",a:[1310,43],b:[1310,775],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-020",name:"Master side window",wall_id:"wall-008",offset_in:334.5,width_in:32,height_in:72,sill_in:24,kind:"window",confidence:"derived"},{id:"opening-021",name:"Master side window",wall_id:"wall-008",offset_in:445.5,width_in:32,height_in:72,sill_in:24,kind:"window",confidence:"derived"},{id:"opening-033",name:"Master bath 1 small window",wall_id:"wall-008",offset_in:162.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"},{id:"opening-034",name:"Master bath 2 small window",wall_id:"wall-008",offset_in:235.5,width_in:16,height_in:16,sill_in:80,kind:"window",confidence:"derived"}]},{id:"wall-009",name:"Exterior wall 9",a:[1310,775],b:[1038,775],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-019",name:"Bedroom 4 window",wall_id:"wall-009",offset_in:109,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-026",name:"Shared shower window",wall_id:"wall-009",offset_in:242,width_in:36,height_in:16,sill_in:80,kind:"window",confidence:"derived"}]},{id:"wall-010",name:"Exterior wall 10",a:[1038,775],b:[1038,806],exterior:!0,core_in:5.5,height_in:120,openings:[]},{id:"wall-011",name:"Exterior wall 11",a:[1038,806],b:[851,806],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-017",name:"Bedroom 3 north window",wall_id:"wall-011",offset_in:121.5,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-018",name:"Bedroom 3 south window",wall_id:"wall-011",offset_in:61.5,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"}]},{id:"wall-012",name:"Exterior wall 12",a:[851,806],b:[851,844.5],exterior:!0,core_in:5.5,height_in:120,openings:[]},{id:"wall-013",name:"Exterior wall 13",a:[851,844.5],b:[545,844.5],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-006",name:"Front entry",wall_id:"wall-013",offset_in:64.5,width_in:40,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-007",name:"Entry north sidelight",wall_id:"wall-013",offset_in:103.5,width_in:24,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-008",name:"Entry south sidelight",wall_id:"wall-013",offset_in:30,width_in:24,height_in:96,sill_in:0,kind:"window",confidence:"derived"},{id:"opening-015",name:"Library north window",wall_id:"wall-013",offset_in:227.5,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-016",name:"Library south window",wall_id:"wall-013",offset_in:189.5,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"}]},{id:"wall-014",name:"Exterior wall 14",a:[545,844.5],b:[545,709],exterior:!0,core_in:5.5,height_in:120,openings:[]},{id:"wall-015",name:"Exterior wall 15",a:[545,709],b:[294,709],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-013",name:"Office window",wall_id:"wall-015",offset_in:164,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"},{id:"opening-014",name:"Butler window",wall_id:"wall-015",offset_in:48,width_in:36,height_in:84,sill_in:12,kind:"window",confidence:"derived"}]},{id:"wall-016",name:"Exterior wall 16",a:[294,709],b:[294,849],exterior:!0,core_in:5.5,height_in:120,openings:[]},{id:"wall-017",name:"Exterior wall 17",a:[294,849],b:[0,849],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-010",name:"Garage front window",wall_id:"wall-017",offset_in:188.5,width_in:24,height_in:48,sill_in:48,kind:"window",confidence:"derived"},{id:"opening-011",name:"Garage front window",wall_id:"wall-017",offset_in:149,width_in:24,height_in:48,sill_in:48,kind:"window",confidence:"derived"},{id:"opening-012",name:"Garage front window",wall_id:"wall-017",offset_in:108,width_in:24,height_in:48,sill_in:48,kind:"window",confidence:"derived"}]},{id:"wall-018",name:"Exterior wall 18",a:[0,849],b:[0,243],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-001",name:"Garage 12-foot vehicle door",wall_id:"wall-018",offset_in:328,width_in:144,height_in:96,sill_in:0,kind:"garage",confidence:"dimensioned"},{id:"opening-002",name:"Garage 16-foot vehicle door",wall_id:"wall-018",offset_in:129.5,width_in:192,height_in:96,sill_in:0,kind:"garage",confidence:"dimensioned"},{id:"opening-003",name:"Garage exterior pedestrian door",wall_id:"wall-018",offset_in:439.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-022",name:"Laundry window",wall_id:"wall-018",offset_in:528.5,width_in:48,height_in:48,sill_in:48,kind:"window",confidence:"derived"}]},{id:"wall-019",name:"Exterior wall 19",a:[0,243],b:[171,243],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-005",name:"Laundry exterior door",wall_id:"wall-019",offset_in:138.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-020",name:"Exterior wall 20",a:[171,243],b:[171,0],exterior:!0,core_in:5.5,height_in:120,openings:[{id:"opening-023",name:"Guest WC window",wall_id:"wall-020",offset_in:24.5,width_in:24,height_in:36,sill_in:60,kind:"window",confidence:"derived"},{id:"opening-024",name:"Guest bath window",wall_id:"wall-020",offset_in:88,width_in:48,height_in:66,sill_in:30,kind:"window",confidence:"derived"}]},{id:"wall-021",name:"Garage / laundry",a:[0,385],b:[294,385],exterior:!1,core_in:5.5,height_in:120,openings:[{id:"opening-004",name:"Garage to laundry",wall_id:"wall-021",offset_in:269,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-022",name:"Garage / office",a:[294,385],b:[294,709],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-023",name:"Office / butler",a:[449.5,446],b:[449.5,709],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-048",name:"Pantry door",wall_id:"wall-023",offset_in:33,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-024",name:"Office closet north",a:[294,446],b:[400.5,446],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-025",name:"Office closet east",a:[400.5,446],b:[400.5,543],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-046",name:"Office closet door",wall_id:"wall-025",offset_in:71.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-026",name:"Office closet south",a:[294,543],b:[400.5,543],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-027",name:"Pantry north",a:[449.5,445],b:[545,445],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-028",name:"Pantry / butler",a:[449.5,543],b:[545,543],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-049",name:"Pantry pocket door",wall_id:"wall-028",offset_in:47.5,width_in:36,height_in:96,sill_in:0,kind:"pocket",confidence:"derived"}]},{id:"wall-029",name:"Pantry / kitchen",a:[545,445],b:[545,561.5],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-030",name:"Butler / dining",a:[545,561.5],b:[545,709],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-050",name:"Butler door",wall_id:"wall-030",offset_in:19,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-031",name:"Office bath north",a:[363,274],b:[427,274],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-032",name:"Office bath west",a:[363,274],b:[363,385],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-033",name:"Office bath east",a:[427,274],b:[427,385],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-034",name:"Office bath south",a:[363,385],b:[427,385],exterior:!1,core_in:5.5,height_in:120,openings:[{id:"opening-047",name:"Office bath door",wall_id:"wall-034",offset_in:19,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-035",name:"Laundry / guest",a:[171,246],b:[363,246],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-036",name:"Guest bedroom bath",a:[284.5,0],b:[284.5,195],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-037",name:"Guest bedroom hall",a:[284.5,195],b:[437.5,195],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-038",name:"Guest closet 2 west",a:[339.5,195],b:[339.5,246],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-039",name:"Guest closet 2 east",a:[427,195],b:[427,274],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-044",name:"Guest closet 2 door",wall_id:"wall-039",offset_in:26.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-041",name:"Guest closet upper south",a:[219.5,70.5],b:[284.5,70.5],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-043",name:"Guest closet 1 door",wall_id:"wall-041",offset_in:31.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-042",name:"Guest closet upper west",a:[219.5,0],b:[219.5,125],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-043",name:"Guest mechanical east",a:[219.5,0],b:[219.5,70.5],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-044",name:"Guest mechanical south",a:[171,70.5],b:[219.5,70.5],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-045",name:"Guest shower / tub",a:[171,125],b:[219.5,125],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-046",name:"Guest bath tub / WC",a:[171,185],b:[219.5,185],exterior:!1,core_in:5.5,height_in:120,openings:[{id:"opening-045",name:"Guest WC door",wall_id:"wall-046",offset_in:29.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-047",name:"Guest WC east",a:[219.5,185],b:[219.5,246],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-048",name:"Master / living",a:[1099,348.5],b:[1099,524],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-051",name:"Master suite door",wall_id:"wall-048",offset_in:152,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-049",name:"Master / bedroom 4",a:[1099,524],b:[1310,524],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-050",name:"Master rear closet south",a:[1158.5,125],b:[1229,125],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-051",name:"Master rear closet east",a:[1229,43],b:[1229,125],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-054",name:"Master rear closet door",wall_id:"wall-051",offset_in:53.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-052",name:"Master shower east",a:[1216,187.5],b:[1216,242],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-053",name:"Master shower north",a:[1158.5,187.5],b:[1216,187.5],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-054",name:"Master WC east",a:[1216,242],b:[1216,302],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-055",name:"Master WC door",wall_id:"wall-054",offset_in:31,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-055",name:"Master WC north",a:[1158.5,242],b:[1216,242],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-056",name:"Master bath south",a:[1030,302],b:[1310,302],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-052",name:"Master bath door",wall_id:"wall-056",offset_in:218,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"},{id:"opening-053",name:"Master patio closet door",wall_id:"wall-056",offset_in:47.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-057",name:"Master patio closet east",a:[1158.5,208.5],b:[1158.5,302],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-058",name:"Storage north",a:[1038,348.5],b:[1099,348.5],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-042",name:"Master courtyard door",wall_id:"wall-058",offset_in:21.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-059",name:"Storage south",a:[1038,485.5],b:[1099,485.5],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-062",name:"Storage door",wall_id:"wall-059",offset_in:30,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-060",name:"Storage west",a:[1038,348.5],b:[1038,485.5],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-061",name:"Powder north",a:[814.5,561.5],b:[887.5,561.5],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-056",name:"Powder door",wall_id:"wall-061",offset_in:46,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-062",name:"Powder west",a:[814.5,561.5],b:[814.5,634],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-063",name:"Powder south",a:[814.5,634],b:[887.5,634],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-064",name:"Powder east",a:[887.5,561.5],b:[887.5,634],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-065",name:"Coat closet west",a:[814.5,634],b:[814.5,682],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-066",name:"Coat closet south",a:[814.5,682],b:[851,682],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-067",name:"Coat closet east",a:[851,634],b:[851,682],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-068",name:"Bedroom 3 hall",a:[887.5,603],b:[1038,603],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-057",name:"Bedroom 3 door",wall_id:"wall-068",offset_in:129.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-069",name:"Bedroom 3 west",a:[851,634],b:[851,806],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-070",name:"Bedroom 3 closet south",a:[851,658.5],b:[987,658.5],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-071",name:"Bedroom 3 closet east",a:[987,603],b:[987,658.5],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-058",name:"Bedroom 3 closet door",wall_id:"wall-071",offset_in:26,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-072",name:"Bedroom 3 / shared bath",a:[1038,603],b:[1038,806],exterior:!1,core_in:5.5,height_in:120,openings:[{id:"opening-061",name:"Shared bath door",wall_id:"wall-072",offset_in:24.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-073",name:"Shared bath / bedroom 4",a:[1099,600],b:[1099,775],exterior:!1,core_in:5.5,height_in:120,openings:[{id:"opening-059",name:"Bedroom 4 door",wall_id:"wall-073",offset_in:23.5,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-074",name:"Shared bath south",a:[1038,775],b:[1099,775],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-075",name:"Bedroom 4 closet south",a:[1135,600],b:[1252.5,600],exterior:!1,core_in:3.5,height_in:120,openings:[{id:"opening-060",name:"Bedroom 4 closet door",wall_id:"wall-075",offset_in:60,width_in:36,height_in:96,sill_in:0,kind:"door",confidence:"derived"}]},{id:"wall-076",name:"Bedroom 4 closet east",a:[1252.5,524],b:[1252.5,600],exterior:!1,core_in:3.5,height_in:120,openings:[]},{id:"wall-078",name:"Bedroom 4 mechanical south",a:[1252.5,600],b:[1310,600],exterior:!1,core_in:5.5,height_in:120,openings:[]},{id:"wall-079",name:"Bedroom 4 closet west",a:[1135,524],b:[1135,600],exterior:!1,core_in:3.5,height_in:120,openings:[]}],rooms:[{id:"attached_garage",name:"Garage",polygon:[[0,385],[294,385],[294,849],[0,849]],center:[147,617],ceiling_in:120,finish:"concrete",confidence:"derived"},{id:"office",name:"Office",polygon:[[294,446],[449.5,446],[449.5,709],[294,709]],center:[371.75,577.5],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"office_closet",name:"Office closet",polygon:[[294,446],[400.5,446],[400.5,543],[294,543]],center:[347.25,494.5],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"laundry_pet_room",name:"Laundry / pet room",polygon:[[0,243],[171,243],[171,246],[363,246],[363,385],[0,385]],center:[178,291.3333333333333],ceiling_in:120,finish:"tile",confidence:"derived"},{id:"office_bath",name:"Office bathroom",polygon:[[363,274],[427,274],[427,385],[363,385]],center:[395,329.5],ceiling_in:108,finish:"tile",confidence:"derived"},{id:"guest_suite",name:"Guest suite",polygon:[[284.5,0],[478,0],[478,195],[284.5,195]],center:[381.25,97.5],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"guest_bath",name:"Guest bathroom",polygon:[[171,70.5],[284.5,70.5],[284.5,246],[171,246]],center:[227.75,158.25],ceiling_in:120,finish:"tile",confidence:"derived"},{id:"guest_closet",name:"Guest closet",polygon:[[219.5,0],[284.5,0],[284.5,70.5],[219.5,70.5]],center:[252,35.25],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"guest_closet_2",name:"Guest closet 2",polygon:[[339.5,195],[427,195],[427,274],[339.5,274]],center:[383.25,234.5],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"guest_mechanical",name:"Guest mechanical closet",polygon:[[171,0],[219.5,0],[219.5,70.5],[171,70.5]],center:[195.25,35.25],ceiling_in:120,finish:"concrete",confidence:"derived"},{id:"pantry",name:"Pantry",polygon:[[449.5,445],[545,445],[545,543],[449.5,543]],center:[497.25,494],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"butlers_pantry",name:"Butler pantry",polygon:[[449.5,543],[545,543],[545,709],[449.5,709]],center:[497.25,626],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"kitchen",name:"Kitchen",polygon:[[545,348.5],[745.5,348.5],[745.5,587],[545,587]],center:[645.25,467.75],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"dining_room",name:"Dining room",polygon:[[545,587],[745.5,587],[745.5,709],[545,709]],center:[645.25,648],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"library",name:"Library",polygon:[[545,709],[745.5,709],[745.5,844.5],[545,844.5]],center:[645.25,776.75],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"living_room",name:"Living room",polygon:[[745.5,348.5],[1038,348.5],[1038,603],[887.5,603],[887.5,561.5],[814.5,561.5],[814.5,587],[745.5,587]],center:[871.375,525],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"foyer",name:"Foyer",polygon:[[745.5,587],[851,587],[851,844.5],[745.5,844.5]],center:[798.25,715.75],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"powder",name:"Powder room",polygon:[[814.5,561.5],[887.5,561.5],[887.5,634],[814.5,634]],center:[851,597.75],ceiling_in:108,finish:"tile",confidence:"derived"},{id:"bedroom_3",name:"Bedroom 3",polygon:[[851,658.5],[1038,658.5],[1038,806],[851,806]],center:[944.5,732.25],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"bedroom_3_closet",name:"Bedroom 3 closet",polygon:[[887.5,603],[987,603],[987,658.5],[887.5,658.5]],center:[937.25,630.75],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"shared_bath",name:"Shared bathroom",polygon:[[1038,641.5],[1099,641.5],[1099,775],[1038,775]],center:[1068.5,708.25],ceiling_in:108,finish:"tile",confidence:"derived"},{id:"master_suite",name:"Master suite",polygon:[[1099,302],[1310,302],[1310,524],[1099,524]],center:[1204.5,413],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"master_bath",name:"Master bathroom",polygon:[[1158.5,125],[1310,125],[1310,302],[1158.5,302]],center:[1234.25,213.5],ceiling_in:108,finish:"tile",confidence:"derived"},{id:"master_back_closet",name:"Master rear closet",polygon:[[1158.5,43],[1310,43],[1310,125],[1158.5,125]],center:[1234.25,84],ceiling_in:108,finish:"wood",confidence:"derived"},{id:"master_patio_closet",name:"Master patio closet",polygon:[[1030,208.5],[1158.5,208.5],[1158.5,302],[1030,302]],center:[1094.25,255.25],ceiling_in:108,finish:"wood",confidence:"derived"},{id:"storage",name:"Storage room",polygon:[[1038,348.5],[1099,348.5],[1099,485.5],[1038,485.5]],center:[1068.5,417],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"bedroom_4",name:"Bedroom 4",polygon:[[1099,524],[1135,524],[1135,600],[1310,600],[1310,775],[1099,775]],center:[1181.3333333333333,633],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"bedroom_4_closet",name:"Bedroom 4 closet",polygon:[[1135,524],[1252.5,524],[1252.5,600],[1135,600]],center:[1193.75,562],ceiling_in:120,finish:"wood",confidence:"derived"},{id:"master_mechanical",name:"Bedroom wing mechanical closet",polygon:[[1252.5,524],[1310,524],[1310,600],[1252.5,600]],center:[1281.25,562],ceiling_in:120,finish:"concrete",confidence:"derived"}],fixtures:[{id:"fixture-001",name:"Guest lavatory 1",kind:"lavatory",at:[273.5,90],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-002",name:"Guest lavatory 2",kind:"lavatory",at:[273.5,175.5],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-003",name:"Office lavatory",kind:"lavatory",at:[410,360.5],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-004",name:"Master lavatory 1",kind:"lavatory",at:[1295,197],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-005",name:"Master lavatory 2",kind:"lavatory",at:[1295,281.5],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-006",name:"Shared lavatory 1",kind:"lavatory",at:[1086,667],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-007",name:"Shared lavatory 2",kind:"lavatory",at:[1086,698.5],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-008",name:"Powder lavatory",kind:"lavatory",at:[828.5,594.5],angle:-90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-009",name:"Guest WC",kind:"toilet",at:[194.5,225],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-010",name:"Office WC",kind:"toilet",at:[410,321.5],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-011",name:"Master WC",kind:"toilet",at:[1182,277.5],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-012",name:"Shared WC",kind:"toilet",at:[1077.5,733.5],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-013",name:"Powder WC",kind:"toilet",at:[834,617],angle:-90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-014",name:"Guest tub",kind:"tub",at:[199,153],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-015",name:"Office tub",kind:"tub",at:[393,289.5],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-016",name:"Master tub",kind:"tub",at:[1195,153],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-017",name:"Guest shower",kind:"shower",at:[199,97.5],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-018",name:"Master shower",kind:"shower",at:[1187.5,213],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-019",name:"Shared shower",kind:"shower",at:[1067,757],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-020",name:"Pet wash",kind:"shower",at:[199,264.5],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-021",name:"Kitchen sink",kind:"sink",at:[614,369],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-022",name:"Laundry sink",kind:"sink",at:[228,368],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-023",name:"Outdoor laundry tub",kind:"sink",at:[79.5,228],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-024",name:"Dishwasher",kind:"dishwasher",at:[560,369],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-025",name:"Kitchen refrigerator",kind:"refrigerator",at:[641,570],angle:180,room:"",size_in:null,confidence:"approximate"},{id:"fixture-026",name:"Laundry refrigerator 1",kind:"refrigerator",at:[287.5,264.5],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-027",name:"Laundry refrigerator 2",kind:"refrigerator",at:[336.5,264.5],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-028",name:"Washer",kind:"washer",at:[272.5,368],angle:180,room:"",size_in:null,confidence:"approximate"},{id:"fixture-029",name:"Dryer",kind:"dryer",at:[304.5,368],angle:180,room:"",size_in:null,confidence:"approximate"},{id:"fixture-030",name:"Cooktop",kind:"cooktop",at:[562,486.5],angle:90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-031",name:"Butler oven",kind:"oven",at:[465,572],angle:-90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-032",name:"Butler microwave",kind:"microwave",at:[465,602],angle:-90,room:"",size_in:null,confidence:"approximate"},{id:"fixture-033",name:"Guest water heater",kind:"waterHeater",at:[192.5,14],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-034",name:"Guest air handler",kind:"airHandler",at:[194.5,55.5],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-035",name:"Bedroom water heater",kind:"waterHeater",at:[1285.5,537],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-036",name:"Bedroom air handler",kind:"airHandler",at:[1284.5,578.5],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-037",name:"North heat pump 5 ton",kind:"heatPump",at:[148.5,97.5],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-038",name:"South heat pump 4 ton",kind:"heatPump",at:[1334.5,637.5],angle:0,room:"",size_in:null,confidence:"approximate"},{id:"fixture-039",name:"Kitchen island",kind:"counter",at:[645,470.5],angle:0,room:"",size_in:[94,36,36],confidence:"approximate"},{id:"fixture-040",name:"Kitchen sink counter",kind:"counter",at:[614,372],angle:90,room:"",size_in:[150,25,36],confidence:"approximate"},{id:"fixture-041",name:"Kitchen south counter",kind:"counter",at:[674.5,571],angle:90,room:"",size_in:[139,25,36],confidence:"approximate"},{id:"fixture-042",name:"Butler counter",kind:"counter",at:[535.5,643.5],angle:0,room:"",size_in:[145,25,36],confidence:"approximate"},{id:"fixture-043",name:"Laundry worktop",kind:"counter",at:[244.5,368],angle:90,room:"",size_in:[130,25,36],confidence:"approximate"}],porches:[{id:"front-porch",name:"Front porch",polygon:[[449.5,709],[545,709],[545,844.5],[851,844.5],[851,806],[1038,806],[1038,775],[1131,775],[1131,988],[449.5,988]],confidence:"approximate"},{id:"rear-patio",name:"Covered rear patio",polygon:[[478,208.5],[1030,208.5],[1030,348.5],[478,348.5]],confidence:"approximate"}]},truss_vectors:[{mark:"9V04",members:[{polygon_in:[[10.49991,3.49999],[5.08337,3.49999],[4.93329,3.69986],[24,18],[24,13.62492]],width_in:3.5},{polygon_in:[[24,13.62492],[24,17.99985],[43.06671,3.69986],[42.91663,3.49999],[37.50009,3.49999]],width_in:3.5},{polygon_in:[[.33331,-7e-5],[.33331,.24987],[4.66671,3.49999],[43.33329,3.49999],[47.6667,.24987],[47.6667,-7e-5]],width_in:3.5},{polygon_in:[[22.24997,3.49999],[25.75003,3.49999],[25.75003,12.31246],[24,13.62492],[22.24997,12.31246]],width_in:3.5}],confidence:"approximate"},{mark:"9V08",members:[{polygon_in:[[10.49994,3.5],[5.08346,3.5],[4.93324,3.69993],[48,36],[48,31.62483]],width_in:3.5},{polygon_in:[[48,31.62483],[48,36],[91.06676,3.69993],[90.91682,3.5],[85.50006,3.5]],width_in:3.5},{polygon_in:[[.3333,-7e-5],[.3333,.24983],[4.66677,3.5],[91.33351,3.5],[95.66669,.24983],[95.66669,-7e-5]],width_in:3.5},{polygon_in:[[46.2501,3.5],[49.75018,3.5],[49.75018,30.31249],[48,31.62483],[46.2501,30.31249]],width_in:3.5}],confidence:"approximate"},{mark:"9V12",members:[{polygon_in:[[10.50013,3.50001],[5.08347,3.50001],[4.93319,3.69999],[72,54],[72,49.625]],width_in:3.5},{polygon_in:[[72,49.625],[72,54],[139.0668,3.69999],[138.91692,3.50001],[133.49987,3.50001]],width_in:3.5},{polygon_in:[[.33318,11e-5],[.33318,.25017],[4.66681,3.50001],[139.33359,3.50001],[143.66682,.25017],[143.66682,11e-5]],width_in:3.5},{polygon_in:[[70.24985,3.50001],[73.75015,3.50001],[73.75015,48.3126],[72,49.625],[70.24985,48.3126]],width_in:3.5},{polygon_in:[[22.25025,3.50001],[25.75015,3.50001],[25.75015,14.93763],[22.25025,12.3128]],width_in:3.5},{polygon_in:[[118.24984,3.50001],[121.75015,3.50001],[121.75015,12.3128],[118.24984,14.93763]],width_in:3.5}],confidence:"approximate"},{mark:"9V16",members:[{polygon_in:[[10.49975,3.49986],[5.08338,3.49986],[4.93345,3.69977],[96.00026,72],[96.00026,67.62473]],width_in:3.5},{polygon_in:[[96.00026,67.62473],[96.00026,72],[187.06655,3.69977],[186.91662,3.49986],[181.49972,3.49986]],width_in:3.5},{polygon_in:[[.33352,-6e-5],[.33352,.24984],[4.66673,3.49986],[187.33326,3.49986],[191.66649,.24984],[191.66649,-6e-5]],width_in:3.5},{polygon_in:[[94.25004,3.49986],[97.74997,3.49986],[97.74997,66.3122],[95.99973,67.62473],[94.25004,66.3122]],width_in:3.5},{polygon_in:[[46.25017,3.49986],[49.75009,3.49986],[49.75009,32.93749],[46.25017,30.31242]],width_in:3.5},{polygon_in:[[142.24992,3.49986],[145.74983,3.49986],[145.74983,30.31242],[142.24992,32.93749]],width_in:3.5}],confidence:"approximate"},{mark:"9V20",members:[{polygon_in:[[10.51449,3.37948],[5.09033,3.37948],[4.94008,3.58004],[120.16692,90],[120.16692,85.6185]],width_in:3.5},{polygon_in:[[120.16692,85.61913],[120.16692,90],[235.39375,3.58004],[235.24351,3.37948],[229.81935,3.37948]],width_in:3.5},{polygon_in:[[.33383,-.12534],[.33383,.12486],[4.67289,3.37948],[120.12511,3.37948],[120.12511,-.12534]],width_in:3.5},{polygon_in:[[118.41482,3.37948],[121.91966,3.37948],[121.91966,84.30473],[120.16692,85.6185],[118.41482,84.30473]],width_in:3.5},{polygon_in:[[70.34807,3.37948],[73.85289,3.37948],[73.85289,50.88313],[70.34807,48.25435]],width_in:3.5},{polygon_in:[[22.2813,3.37948],[25.78613,3.37948],[25.78613,14.83271],[22.2813,12.20457]],width_in:3.5},{polygon_in:[[166.48159,3.37948],[169.98643,3.37948],[169.98643,48.25435],[166.48159,50.88313]],width_in:3.5},{polygon_in:[[214.54836,3.37948],[218.05318,3.37948],[218.05318,12.20457],[214.54836,14.83271]],width_in:3.5},{polygon_in:[[120.12511,-.12534],[120.12511,3.37948],[235.66094,3.37948],[240,.12486],[240,-.12534]],width_in:3.5}],confidence:"approximate"},{mark:"9V24",members:[{polygon_in:[[10.49997,3.49974],[5.083,3.49974],[4.93317,3.7003],[143.99999,108],[143.99999,103.62476]],width_in:3.5},{polygon_in:[[143.99999,103.62476],[143.99999,108],[283.06683,3.7003],[282.917,3.49974],[277.50004,3.49974]],width_in:3.5},{polygon_in:[[.33319,2e-5],[.33319,.24968],[4.6663,3.49974],[143.95865,3.49974],[143.95865,2e-5]],width_in:3.5},{polygon_in:[[142.24975,3.49974],[145.75025,3.49974],[145.75025,102.31226],[143.99999,103.62476],[142.24975,102.31226]],width_in:3.5},{polygon_in:[[94.25001,3.49974],[97.74974,3.49974],[97.74974,68.93725],[94.25001,66.31225]],width_in:3.5},{polygon_in:[[46.25027,3.49974],[49.75,3.49974],[49.75,32.93724],[46.25027,30.31224]],width_in:3.5},{polygon_in:[[190.25028,3.49974],[193.75,3.49974],[193.75,66.31225],[190.25028,68.93725]],width_in:3.5},{polygon_in:[[238.25002,3.49974],[241.75052,3.49974],[241.75052,30.31224],[238.25002,32.93724]],width_in:3.5},{polygon_in:[[143.95865,2e-5],[143.95865,3.49974],[283.33369,3.49974],[287.6668,.24968],[287.6668,2e-5]],width_in:3.5}],confidence:"approximate"},{mark:"9V28",members:[{polygon_in:[[74.09985,51.19958],[71.99987,54.00013],[168,126],[168,121.62468]],width_in:3.5},{polygon_in:[[168,121.62468],[168,126],[264.00013,54.00013],[261.90015,51.19958]],width_in:3.5},{polygon_in:[[.33357,-21e-5],[.33357,.25018],[4.66644,3.50008],[167.9584,3.50008],[167.9584,-21e-5]],width_in:3.5},{polygon_in:[[166.24985,3.50008],[169.75015,3.50008],[169.75015,120.31205],[168,121.62468],[166.24985,120.31205]],width_in:3.5},{polygon_in:[[118.25024,3.50008],[121.75052,3.50008],[121.75052,86.93732],[118.25024,84.31212]],width_in:3.5},{polygon_in:[[70.24972,3.50008],[73.75001,3.50008],[73.75001,50.93739],[70.24972,48.31218]],width_in:3.5},{polygon_in:[[22.25011,3.50008],[25.7504,3.50008],[25.7504,14.93745],[22.25011,12.31225]],width_in:3.5},{polygon_in:[[214.25036,3.50008],[217.74974,3.50008],[217.74974,84.31212],[214.25036,86.93732]],width_in:3.5},{polygon_in:[[262.24999,3.50008],[265.75025,3.50008],[265.75025,48.31218],[262.24999,50.93739]],width_in:3.5},{polygon_in:[[310.2505,3.50008],[313.74988,3.50008],[313.74988,12.31225],[310.2505,14.93745]],width_in:3.5},{polygon_in:[[10.49994,3.50008],[5.08318,3.50008],[4.93312,3.69988],[71.99987,54.00013],[74.09985,51.19958]],width_in:3.5},{polygon_in:[[261.90015,51.19958],[264.00013,54.00013],[331.06688,3.69988],[330.9168,3.50008],[325.50004,3.50008]],width_in:3.5},{polygon_in:[[167.9584,-21e-5],[167.9584,3.50008],[331.33354,3.50008],[335.66732,.25018],[335.66732,-21e-5]],width_in:3.5}],confidence:"approximate"},{mark:"9V32",members:[{polygon_in:[[98.09983,69.20032],[96,72.00081],[192,144],[192,139.6252]],width_in:3.5},{polygon_in:[[192,139.6252],[192,144],[288,72.00081],[285.90017,69.20032]],width_in:3.5},{polygon_in:[[.33384,55e-5],[.33384,.2509],[4.66642,3.50059],[191.95878,3.50059],[191.95878,55e-5]],width_in:3.5},{polygon_in:[[190.25048,3.50059],[193.74952,3.50059],[193.74952,138.31256],[192,139.6252],[190.25048,138.31256]],width_in:3.5},{polygon_in:[[142.24996,3.50059],[145.75004,3.50059],[145.75004,104.93771],[142.24996,102.31343]],width_in:3.5},{polygon_in:[[94.25048,3.50059],[97.74952,3.50059],[97.74952,68.93758],[94.25048,66.31331]],width_in:3.5},{polygon_in:[[46.24996,3.50059],[49.75004,3.50059],[49.75004,32.93852],[46.24996,30.31318]],width_in:3.5},{polygon_in:[[238.24996,3.50059],[241.75004,3.50059],[241.75004,102.31343],[238.24996,104.93771]],width_in:3.5},{polygon_in:[[286.25048,3.50059],[289.74952,3.50059],[289.74952,66.31331],[286.25048,68.93758]],width_in:3.5},{polygon_in:[[334.24996,3.50059],[337.75004,3.50059],[337.75004,30.31318],[334.24996,32.93852]],width_in:3.5},{polygon_in:[[10.50021,3.50059],[5.08371,3.50059],[4.93328,3.70051],[96,72.00081],[98.09983,69.20032]],width_in:3.5},{polygon_in:[[285.90017,69.20032],[288,72.00081],[379.0667,3.70051],[378.91627,3.50059],[373.49978,3.50059]],width_in:3.5},{polygon_in:[[191.95878,55e-5],[191.95878,3.50059],[379.33356,3.50059],[383.66616,.2509],[383.66616,55e-5]],width_in:3.5}],confidence:"approximate"},{mark:"9V36",members:[{polygon_in:[[122.0997,87.20064],[120.00033,90.00093],[216.00059,162],[216.00059,157.62537]],width_in:3.5},{polygon_in:[[216.00059,157.62537],[216.00059,162],[311.99968,90.00093],[309.9003,87.20064]],width_in:3.5},{polygon_in:[[.33312,44e-5],[.33312,.25029],[4.66722,3.50057],[167.8339,3.50057],[167.8339,44e-5]],width_in:3.5},{polygon_in:[[214.25052,3.50057],[217.75065,3.50057],[217.75065,156.31259],[216.00059,157.62537],[214.25052,156.31259]],width_in:3.5},{polygon_in:[[166.25037,3.50057],[169.7505,3.50057],[169.7505,122.93758],[166.25037,120.31301]],width_in:3.5},{polygon_in:[[118.25026,3.50057],[121.75039,3.50057],[121.75039,86.93801],[118.25026,84.31238]],width_in:3.5},{polygon_in:[[70.25013,3.50057],[73.75026,3.50057],[73.75026,50.93738],[70.25013,48.31288]],width_in:3.5},{polygon_in:[[22.25,3.50057],[25.75013,3.50057],[25.75013,14.93788],[22.25,12.31331]],width_in:3.5},{polygon_in:[[262.25063,3.50057],[265.7496,3.50057],[265.7496,120.31301],[262.25063,122.93758]],width_in:3.5},{polygon_in:[[310.24962,3.50057],[313.74975,3.50057],[313.74975,84.31238],[310.24962,86.93801]],width_in:3.5},{polygon_in:[[358.24973,3.50057],[361.74986,3.50057],[361.74986,48.31288],[358.24973,50.93738]],width_in:3.5},{polygon_in:[[406.24988,3.50057],[409.75001,3.50057],[409.75001,12.31331],[406.24988,14.93788]],width_in:3.5},{polygon_in:[[10.50038,3.50057],[5.08363,3.50057],[4.93326,3.70065],[120.00033,90.00093],[122.0997,87.20064]],width_in:3.5},{polygon_in:[[309.9003,87.20064],[311.99968,90.00093],[427.06676,3.70065],[426.91638,3.50057],[421.49961,3.50057]],width_in:3.5},{polygon_in:[[264.16728,44e-5],[264.16728,3.50057],[427.33394,3.50057],[431.66688,.25029],[431.66688,44e-5]],width_in:3.5},{polygon_in:[[167.8339,44e-5],[167.8339,3.50057],[264.16728,3.50057],[264.16728,44e-5]],width_in:3.5}],confidence:"approximate"},{mark:"A01",members:[{polygon_in:[[78.91693,59.43749],[75.61706,63.83735],[153.49998,122.25],[153.49998,115.37482]],width_in:5.5},{polygon_in:[[153.49998,115.37482],[153.49998,122.25],[231.38294,63.83735],[228.08307,59.43749]],width_in:5.5},{polygon_in:[[0,-21e-5],[0,.24935],[4.33296,3.50022],[114.99975,3.50022],[114.99975,-21e-5]],width_in:3.5},{polygon_in:[[190.12121,3.50022],[193.8231,3.50022],[155.99405,113.5047],[153.49998,115.37482],[153.49998,109.9936]],width_in:3.5},{polygon_in:[[193.08504,5.64574],[193.8231,3.50022],[195.87502,3.50022],[229.48964,58.38214],[226.67735,60.49203]],width_in:3.5},{polygon_in:[[113.17688,3.50022],[116.87788,3.50022],[153.49998,109.9936],[153.49998,115.37482],[151.00594,113.5047]],width_in:3.5},{polygon_in:[[111.12496,3.50022],[113.17688,3.50022],[113.91494,5.64574],[80.32262,60.49203],[77.51034,58.38301]],width_in:3.5},{polygon_in:[[-24.00026,-17.75017],[-27.30013,-13.35031],[75.61706,63.83735],[78.91693,59.43749]],width_in:5.5},{polygon_in:[[228.08307,59.43749],[231.38294,63.83735],[334.30011,-13.35031],[331.00024,-17.75017]],width_in:5.5},{polygon_in:[[114.99975,-21e-5],[114.99975,3.50022],[302.66614,3.50022],[307,.24935],[307,-21e-5]],width_in:3.5}],confidence:"approximate"},{mark:"A01G",members:[{polygon_in:[[78.91693,59.43749],[75.61706,63.83735],[153.49998,122.25],[153.49998,115.37482]],width_in:5.5},{polygon_in:[[153.49998,115.37482],[153.49998,122.25],[231.38294,63.83735],[228.08307,59.43749]],width_in:5.5},{polygon_in:[[0,-21e-5],[0,.24935],[4.33296,3.50022],[114.99975,3.50022],[114.99975,-21e-5]],width_in:3.5},{polygon_in:[[190.12121,3.50022],[193.8231,3.50022],[155.99405,113.5047],[153.49998,115.37482],[153.49998,109.9936]],width_in:3.5},{polygon_in:[[193.08504,5.64574],[193.8231,3.50022],[195.87502,3.50022],[229.48964,58.38214],[226.67735,60.49203]],width_in:3.5},{polygon_in:[[113.17688,3.50022],[116.87788,3.50022],[153.49998,109.9936],[153.49998,115.37482],[151.00594,113.5047]],width_in:3.5},{polygon_in:[[111.12496,3.50022],[113.17688,3.50022],[113.91494,5.64574],[80.32262,60.49203],[77.51034,58.38301]],width_in:3.5},{polygon_in:[[78.91693,59.43749],[75.61706,63.83735],[-27.30013,-13.35031],[-24.00026,-17.75017]],width_in:5.5},{polygon_in:[[228.08307,59.43749],[231.38294,63.83735],[334.30011,-13.35031],[331.00024,-17.75017]],width_in:5.5},{polygon_in:[[114.99975,-21e-5],[114.99975,3.50022],[302.66614,3.50022],[307,.24935],[307,-21e-5]],width_in:3.5},{polygon_in:[[151.75023,3.50022],[155.24976,3.50022],[155.24976,104.90471],[153.49998,109.9936],[151.75023,104.90471]],width_in:3.5},{polygon_in:[[135.75005,69.14011],[139.24958,79.31785],[139.24958,104.68725],[135.75005,102.06215]],width_in:3.5},{polygon_in:[[135.75005,3.50022],[139.24958,3.50022],[139.24958,68.55536],[135.75005,58.37768]],width_in:3.5},{polygon_in:[[119.7499,22.61303],[123.25033,32.79077],[123.25033,92.68754],[119.7499,90.06243]],width_in:3.5},{polygon_in:[[119.7499,3.50022],[123.25033,3.50022],[123.25033,22.02834],[119.7499,11.8506]],width_in:3.5},{polygon_in:[[103.74972,22.24226],[107.25015,16.52765],[107.25015,80.68695],[103.74972,78.0619]],width_in:3.5},{polygon_in:[[103.74972,3.50022],[107.25015,3.50022],[107.25015,9.82716],[103.74972,15.5409]],width_in:3.5},{polygon_in:[[87.74955,48.36577],[91.24998,42.65116],[91.24998,68.6873],[87.74955,66.06219]],width_in:3.5},{polygon_in:[[87.74955,3.50022],[91.24998,3.50022],[91.24998,35.9498],[87.74955,41.66441]],width_in:3.5},{polygon_in:[[71.75027,3.50022],[75.24981,3.50022],[75.24981,56.68764],[71.75027,54.06253]],width_in:3.5},{polygon_in:[[55.7501,3.50022],[59.24964,3.50022],[59.24964,44.68705],[55.7501,42.06195]],width_in:3.5},{polygon_in:[[39.74994,3.50022],[43.25037,3.50022],[43.25037,32.68734],[39.74994,30.06229]],width_in:3.5},{polygon_in:[[23.74977,3.50022],[27.2502,3.50022],[27.2502,20.68768],[23.74977,18.06258]],width_in:3.5},{polygon_in:[[7.74961,3.50022],[11.25002,3.50022],[11.25002,8.6871],[7.74961,6.062]],width_in:3.5},{polygon_in:[[167.74951,79.31785],[171.24994,69.14011],[171.24994,102.06215],[167.74951,104.68725]],width_in:3.5},{polygon_in:[[167.74951,3.50022],[171.24994,3.50022],[171.24994,58.37768],[167.74951,68.55536]],width_in:3.5},{polygon_in:[[183.74966,32.79077],[187.25009,22.61303],[187.25009,90.06243],[183.74966,92.68754]],width_in:3.5},{polygon_in:[[183.74966,3.50022],[187.25009,3.50022],[187.25009,11.8506],[183.74966,22.02834]],width_in:3.5},{polygon_in:[[199.74984,16.52765],[203.25027,22.24226],[203.25027,78.0619],[199.74984,80.68695]],width_in:3.5},{polygon_in:[[199.74984,3.50022],[203.25027,3.50022],[203.25027,15.5409],[199.74984,9.82629]],width_in:3.5},{polygon_in:[[215.75002,42.65116],[219.24955,48.36577],[219.24955,66.06219],[215.75002,68.6873]],width_in:3.5},{polygon_in:[[215.75002,3.50022],[219.24955,3.50022],[219.24955,41.66441],[215.75002,35.9498]],width_in:3.5},{polygon_in:[[231.75017,3.50022],[235.2497,3.50022],[235.2497,54.06253],[231.75017,56.68764]],width_in:3.5},{polygon_in:[[247.74945,3.50022],[251.24988,3.50022],[251.24988,42.06195],[247.74945,44.68705]],width_in:3.5},{polygon_in:[[263.74963,3.50022],[267.25006,3.50022],[267.25006,30.06229],[263.74963,32.68734]],width_in:3.5},{polygon_in:[[279.74978,3.50022],[283.25021,3.50022],[283.25021,18.06258],[279.74978,20.68768]],width_in:3.5},{polygon_in:[[295.74996,3.50022],[299.24949,3.50022],[299.24949,6.062],[295.74996,8.6871]],width_in:3.5}],confidence:"approximate"},{mark:"B01",members:[{polygon_in:[[99.72954,75.04705],[96.42919,79.44645],[179.99954,142.125],[179.99954,135.24983]],width_in:5.5},{polygon_in:[[179.99954,136.6244],[179.99954,142.125],[297.99946,142.125],[297.99946,136.6244]],width_in:5.5},{polygon_in:[[297.99946,135.24983],[297.99946,142.125],[381.57084,79.44645],[378.27048,75.04705]],width_in:5.5},{polygon_in:[[0,2e-5],[0,.25044],[4.33343,3.5005],[179.99954,3.5005],[179.99954,2e-5]],width_in:3.5},{polygon_in:[[96.22906,72.42145],[99.72954,75.04705],[99.72954,3.5005],[96.22906,3.5005]],width_in:3.5},{polygon_in:[[177.36972,3.5005],[179.99954,3.5005],[179.99954,5.84427],[101.15761,76.1178],[99.72954,75.04705],[99.72954,72.70224]],width_in:3.5},{polygon_in:[[179.99954,3.5005],[183.5,3.5005],[183.5,136.6244],[179.99954,136.6244]],width_in:3.5},{polygon_in:[[235.3628,3.5005],[237.24976,3.5005],[237.24976,8.17443],[185.38697,136.6244],[183.5,136.6244],[183.5,131.95046]],width_in:3.5},{polygon_in:[[237.24976,136.6244],[240.75024,136.6244],[240.75024,3.5005],[237.24976,3.5005]],width_in:3.5},{polygon_in:[[240.75024,8.17443],[240.75024,3.5005],[242.63721,3.5005],[294.50001,131.95046],[294.50001,136.6244],[292.61304,136.6244]],width_in:3.5},{polygon_in:[[294.50001,3.5005],[297.99946,3.5005],[297.99946,136.6244],[294.50001,136.6244]],width_in:3.5},{polygon_in:[[297.99946,5.84427],[297.99946,3.5005],[300.63031,3.5005],[378.27048,72.70224],[378.27048,75.04705],[376.84242,76.1178]],width_in:3.5},{polygon_in:[[378.27048,75.04705],[381.77097,72.42145],[381.77097,3.5005],[378.27048,3.5005]],width_in:3.5},{polygon_in:[[-24.00043,-17.74961],[-27.29974,-13.35021],[96.42919,79.44645],[99.72954,75.04705]],width_in:5.5},{polygon_in:[[378.27048,75.04705],[381.57084,79.44645],[478,7.12459],[478,.25044]],width_in:5.5},{polygon_in:[[297.99946,2e-5],[297.99946,3.5005],[473.66659,3.5005],[478,.25044],[478,2e-5]],width_in:3.5},{polygon_in:[[179.99954,2e-5],[179.99954,3.5005],[297.99946,3.5005],[297.99946,2e-5]],width_in:3.5}],confidence:"approximate"},{mark:"B01G",members:[{polygon_in:[[99.72929,75.046],[96.42928,79.44601],[179.99984,142.125],[179.99984,135.24918]],width_in:5.5},{polygon_in:[[179.99984,136.62497],[179.99984,142.125],[298.00013,142.125],[298.00013,136.62497]],width_in:5.5},{polygon_in:[[298.00013,135.24918],[298.00013,142.125],[381.5707,79.44601],[378.27068,75.04703]],width_in:5.5},{polygon_in:[[298.00013,-34e-5],[298.00013,3.49939],[473.66655,3.49939],[478,.2501],[478,-34e-5]],width_in:3.5},{polygon_in:[[96.22957,72.4212],[99.72929,75.046],[99.72929,3.49939],[96.22957,3.49939]],width_in:3.5},{polygon_in:[[173.93345,3.49939],[176.50012,3.49939],[176.50012,5.89169],[101.15157,76.11325],[99.72929,75.046],[99.72929,72.65473]],width_in:3.5},{polygon_in:[[176.50012,3.49939],[179.99984,3.49939],[179.99984,135.24918],[176.50012,132.62438]],width_in:3.5},{polygon_in:[[235.34548,3.49939],[237.24962,3.49939],[237.24962,7.92894],[181.90504,136.62497],[179.99984,136.62497],[179.99984,132.19536]],width_in:3.5},{polygon_in:[[237.24962,136.62497],[240.75038,136.62497],[240.75038,3.49939],[237.24962,3.49939]],width_in:3.5},{polygon_in:[[240.75038,8.17408],[240.75038,3.49939],[242.63762,3.49939],[294.50043,131.95022],[294.50043,136.62497],[292.61319,136.62497]],width_in:3.5},{polygon_in:[[294.50043,3.49939],[298.00013,3.49939],[298.00013,136.62497],[294.50043,136.62497]],width_in:3.5},{polygon_in:[[298.00013,5.84416],[298.00013,3.49939],[300.63022,3.49939],[378.27068,72.70227],[378.27068,75.04703],[376.84206,76.11744]],width_in:3.5},{polygon_in:[[378.27068,75.04703],[381.77041,72.4212],[381.77041,3.49939],[378.27068,3.49939]],width_in:3.5},{polygon_in:[[99.72929,75.046],[96.42928,79.44601],[-27.30033,-13.35044],[-24.00033,-17.75045]],width_in:5.5},{polygon_in:[[378.27068,75.04703],[381.5707,79.44601],[478,7.12482],[478,.2501]],width_in:5.5},{polygon_in:[[298.00013,-34e-5],[298.00013,3.49939],[179.99984,3.49939],[179.99984,-34e-5]],width_in:3.5},{polygon_in:[[179.99984,-34e-5],[179.99984,3.49939],[4.33344,3.49939],[0,.2501],[0,-34e-5]],width_in:3.5},{polygon_in:[[317.62478,120.53069],[322.20863,117.09332],[298.00013,98.93747],[298.00013,105.8122]],width_in:5.5},{polygon_in:[[294.50043,96.31164],[294.50043,103.18747],[277.84295,90.69437],[273.86138,80.83341]],width_in:5.5},{polygon_in:[[268.44697,76.77258],[272.42854,86.63353],[240.75038,62.87414],[240.75038,55.99935]],width_in:5.5},{polygon_in:[[237.24962,53.37455],[237.24962,60.24934],[220.23709,47.48994],[222.47302,42.2911]],width_in:5.5},{polygon_in:[[219.59144,40.13125],[217.35658,45.32905],[179.99984,17.31225],[179.99984,10.43752]],width_in:5.5},{polygon_in:[[280.25008,106.00562],[283.74978,114.67355],[283.74978,136.62497],[280.25008,136.62497]],width_in:3.5},{polygon_in:[[280.25008,92.49912],[283.74978,95.12501],[283.74978,105.32507],[280.25008,96.65714]],width_in:3.5},{polygon_in:[[264.24983,80.49952],[267.74956,83.12432],[267.74956,136.62497],[264.24983,136.62497]],width_in:3.5},{polygon_in:[[248.24961,68.49987],[251.7504,71.12467],[251.7504,136.62497],[248.24961,136.62497]],width_in:3.5},{polygon_in:[[232.25046,56.49918],[235.75019,59.12501],[235.75019,136.62497],[232.25046,136.62497]],width_in:3.5},{polygon_in:[[216.25024,56.76122],[219.74997,48.62272],[219.74997,136.62497],[216.25024,136.62497]],width_in:3.5},{polygon_in:[[200.25002,93.96578],[203.74975,85.82729],[203.74975,136.62497],[200.25002,136.62497]],width_in:3.5},{polygon_in:[[200.25002,32.49993],[203.74975,35.12467],[203.74975,76.96806],[200.25002,85.10662]],width_in:3.5},{polygon_in:[[184.2498,20.49918],[187.74953,23.12507],[187.74953,114.17372],[184.2498,122.31229]],width_in:3.5},{polygon_in:[[168.24958,13.58008],[171.75036,10.31814],[171.75036,129.06235],[168.24958,126.43755]],width_in:3.5},{polygon_in:[[152.25041,28.49192],[155.75013,25.22998],[155.75013,117.06269],[152.25041,114.43686]],width_in:3.5},{polygon_in:[[152.25041,3.49939],[155.75013,3.49939],[155.75013,20.44533],[152.25041,23.70727]],width_in:3.5},{polygon_in:[[136.25019,43.40273],[139.74991,40.14073],[139.74991,105.062],[136.25019,102.4372]],width_in:3.5},{polygon_in:[[136.25019,3.49939],[139.74991,3.49939],[139.74991,35.35607],[136.25019,38.61808]],width_in:3.5},{polygon_in:[[120.24997,58.31457],[123.74969,55.05257],[123.74969,93.06235],[120.24997,90.43755]],width_in:3.5},{polygon_in:[[120.24997,3.49939],[123.74969,3.49939],[123.74969,50.26791],[120.24997,53.52992]],width_in:3.5},{polygon_in:[[104.24976,73.22532],[107.75053,69.96338],[107.75053,81.06269],[104.24976,78.43686]],width_in:3.5},{polygon_in:[[104.24976,3.49939],[107.75053,3.49939],[107.75053,65.17872],[104.24976,68.44073]],width_in:3.5},{polygon_in:[[88.24954,3.49939],[91.75032,3.49939],[91.75032,69.062],[88.24954,66.4372]],width_in:3.5},{polygon_in:[[72.25037,3.49939],[75.75008,3.49939],[75.75008,57.06241],[72.25037,54.43761]],width_in:3.5},{polygon_in:[[56.25015,3.49939],[59.74986,3.49939],[59.74986,45.06172],[56.25015,42.43692]],width_in:3.5},{polygon_in:[[40.24993,3.49939],[43.74964,3.49939],[43.74964,33.06207],[40.24993,30.43727]],width_in:3.5},{polygon_in:[[24.24971,3.49939],[27.75048,3.49939],[27.75048,21.06241],[24.24971,18.43761]],width_in:3.5},{polygon_in:[[8.25054,3.49939],[11.75026,3.49939],[11.75026,9.06172],[8.25054,6.43693]],width_in:3.5},{polygon_in:[[312.25052,116.49946],[315.75021,119.12426],[315.75021,121.93712],[312.25052,124.56192]],width_in:3.5}],confidence:"approximate"},{mark:"B02",members:[{polygon_in:[[64.19475,48.39628],[60.89452,52.7959],[180.00002,142.125],[180.00002,135.25024]],width_in:5.5},{polygon_in:[[180.00002,136.62501],[180.00002,142.125],[297.99996,142.125],[297.99996,136.62501]],width_in:5.5},{polygon_in:[[297.99996,135.25024],[297.99996,142.125],[417.10548,52.7959],[413.80523,48.39628]],width_in:5.5},{polygon_in:[[0,36e-5],[0,.24994],[9.33347,7.25059],[180.00002,7.25059],[180.00002,36e-5]],width_in:7.25},{polygon_in:[[60.69444,45.77152],[64.19475,48.39628],[64.19475,7.25059],[60.69444,7.25059]],width_in:3.5},{polygon_in:[[116.54163,7.25059],[119.47267,7.25059],[119.47267,9.43183],[65.65406,49.49156],[64.19475,48.39628],[64.19475,46.21504]],width_in:3.5},{polygon_in:[[119.47267,89.85444],[122.97194,92.47914],[122.97194,7.25059],[119.47267,7.25059]],width_in:3.5},{polygon_in:[[177.89407,7.25059],[180.00002,7.25059],[180.00002,10.39713],[124.37454,93.53111],[122.97194,92.47914],[122.97194,89.33261]],width_in:3.5},{polygon_in:[[180.00002,7.25059],[183.50033,7.25059],[183.50033,136.62501],[180.00002,136.62501]],width_in:3.5},{polygon_in:[[235.35529,7.25059],[237.24983,7.25059],[237.24983,11.81211],[185.39488,136.62501],[183.50033,136.62501],[183.50033,132.06449]],width_in:3.5},{polygon_in:[[237.24983,136.62501],[240.75016,136.62501],[240.75016,7.25059],[237.24983,7.25059]],width_in:3.5},{polygon_in:[[240.75016,11.81211],[240.75016,7.25059],[242.64467,7.25059],[294.49963,132.06449],[294.49963,136.62501],[292.60511,136.62501]],width_in:3.5},{polygon_in:[[294.49963,7.25059],[297.99996,7.25059],[297.99996,136.62501],[294.49963,136.62501]],width_in:3.5},{polygon_in:[[297.99996,10.39713],[297.99996,7.25059],[300.10591,7.25059],[355.02802,89.33261],[355.02802,92.47914],[353.62544,93.53111]],width_in:3.5},{polygon_in:[[355.02802,92.47914],[358.52731,89.85444],[358.52731,7.25059],[355.02802,7.25059]],width_in:3.5},{polygon_in:[[358.52731,9.43183],[358.52731,7.25059],[361.45834,7.25059],[413.80523,46.21504],[413.80523,48.39628],[412.3459,49.49156]],width_in:3.5},{polygon_in:[[413.80523,48.39628],[417.30555,45.77152],[417.30555,7.25059],[413.80523,7.25059]],width_in:3.5},{polygon_in:[[0,.24994],[0,7.12577],[60.89452,52.7959],[64.19475,48.39628]],width_in:5.5},{polygon_in:[[413.80523,48.39628],[417.10548,52.7959],[478,7.12577],[478,.24994]],width_in:5.5},{polygon_in:[[297.99996,36e-5],[297.99996,7.25059],[468.66647,7.25059],[478,.24994],[478,36e-5]],width_in:7.25},{polygon_in:[[180.00002,36e-5],[180.00002,7.25059],[297.99996,7.25059],[297.99996,36e-5]],width_in:7.25}],confidence:"approximate"},{mark:"C01",members:[{polygon_in:[[75.66673,56.99996],[72.36677,61.4008],[146.99959,117.375],[146.99959,110.50048]],width_in:5.5},{polygon_in:[[146.99959,110.50048],[146.99959,117.375],[221.63326,61.39996],[218.33328,56.99996]],width_in:5.5},{polygon_in:[[0,47e-5],[0,.25017],[4.33303,3.50034],[102.00041,3.50034],[102.00041,47e-5]],width_in:3.5},{polygon_in:[[190.09478,3.50034],[191.99274,3.50034],[191.99274,8.01529],[149.77272,108.42061],[146.99959,110.50048],[146.99959,105.98552]],width_in:3.5},{polygon_in:[[191.99274,7.46274],[191.99274,3.50034],[193.94388,3.50034],[219.75761,55.93172],[216.90896,58.06909]],width_in:3.5},{polygon_in:[[102.00727,8.01529],[102.00727,3.50034],[103.90523,3.50034],[146.99959,105.98552],[146.99959,110.50048],[144.22729,108.42061]],width_in:3.5},{polygon_in:[[100.05612,3.50034],[102.00727,3.50034],[102.00727,7.46274],[77.09106,58.06909],[74.24242,55.93172]],width_in:3.5},{polygon_in:[[-23.99984,-17.74952],[-27.29981,-13.34958],[72.36677,61.4008],[75.66673,56.99996]],width_in:5.5},{polygon_in:[[218.33328,56.99996],[221.63326,61.39996],[321.29983,-13.34958],[317.99985,-17.74952]],width_in:5.5},{polygon_in:[[102.00041,47e-5],[102.00041,3.50034],[289.66612,3.50034],[294,.25017],[294,47e-5]],width_in:3.5}],confidence:"approximate"},{mark:"C01G",members:[{polygon_in:[[100.70003,75.77449],[97.39954,80.17424],[147,117.375],[147,110.49922]],width_in:5.5},{polygon_in:[[147,110.49922],[147,117.37416],[196.59961,80.17424],[193.29998,75.77449]],width_in:5.5},{polygon_in:[[0,-35e-5],[0,.24969],[6.99991,5.49959],[131.50018,5.49959],[131.50018,-35e-5]],width_in:5.5},{polygon_in:[[49.69462,37.52062],[53.19459,40.14563],[53.19459,5.49959],[49.69462,5.49959]],width_in:3.5},{polygon_in:[[94.63246,5.49959],[97.47232,5.49959],[97.47232,7.72134],[54.64405,41.23291],[53.19459,40.14563],[53.19459,37.92304]],width_in:3.5},{polygon_in:[[97.47232,73.35411],[100.97228,75.97907],[100.97228,5.49959],[97.47232,5.49959]],width_in:3.5},{polygon_in:[[129.59267,5.49959],[131.50018,5.49959],[131.50018,9.9028],[102.41148,77.05872],[100.97228,75.97907],[100.97228,71.57591]],width_in:3.5},{polygon_in:[[162.49982,9.9028],[162.49982,5.49959],[164.40733,5.49959],[193.02771,71.57591],[193.02771,75.97823],[191.58851,77.05783]],width_in:3.5},{polygon_in:[[240.80542,40.14563],[244.30537,37.52062],[244.30537,5.49959],[240.80542,5.49959]],width_in:3.5},{polygon_in:[[36.83348,27.87436],[29.49965,22.37441],[49.69462,22.37441],[49.69462,27.87436]],width_in:5.5},{polygon_in:[[53.19459,22.37441],[53.19459,27.87436],[66.03691,27.87436],[73.06593,22.37441]],width_in:5.5},{polygon_in:[[78.74566,22.37441],[71.71662,27.87436],[97.47232,27.87436],[97.47232,22.37441]],width_in:5.5},{polygon_in:[[100.97228,22.37441],[100.97228,27.87436],[119.90099,27.87436],[122.28369,22.37441]],width_in:5.5},{polygon_in:[[171.71631,22.37441],[174.09901,27.87436],[193.02771,27.87436],[193.02771,22.37441]],width_in:5.5},{polygon_in:[[220.93406,22.37441],[227.96311,27.87436],[240.80542,27.87436],[240.80542,22.37441]],width_in:5.5},{polygon_in:[[244.30537,22.37441],[244.30537,27.87436],[257.16652,27.87436],[264.49949,22.37441]],width_in:5.5},{polygon_in:[[135.00015,101.49936],[131.50018,98.87435],[131.50018,5.49959],[135.00015,5.49959]],width_in:3.5},{polygon_in:[[162.49982,98.87435],[158.99985,101.49936],[158.99985,5.49959],[162.49982,5.49959]],width_in:3.5},{polygon_in:[[123.71518,27.87436],[126.09784,22.37441],[131.50018,22.37441],[131.50018,27.87436]],width_in:5.5},{polygon_in:[[135.00015,22.37441],[135.00015,27.87436],[158.99985,27.87436],[158.99985,22.37441]],width_in:5.5},{polygon_in:[[162.49982,22.37441],[162.49982,27.87436],[170.28399,27.87436],[167.90216,22.37441]],width_in:5.5},{polygon_in:[[137.33315,103.24934],[135.00015,101.49936],[135.00015,99.74937],[158.99985,99.74937],[158.99985,101.49936],[156.66683,103.24934]],width_in:3.5},{polygon_in:[[196.52768,73.35328],[193.02771,75.97823],[193.02771,5.49959],[196.52768,5.49959]],width_in:3.5},{polygon_in:[[196.52768,7.72134],[196.52768,5.49959],[199.36753,5.49959],[240.80542,37.92304],[240.80542,40.14563],[239.3551,41.23291]],width_in:3.5},{polygon_in:[[196.52768,27.87436],[196.52768,22.37441],[215.25433,22.37441],[222.28338,27.87436]],width_in:5.5},{polygon_in:[[145.25001,103.24934],[148.74999,103.24934],[148.74999,109.18677],[147,110.49922],[145.25001,109.18677]],width_in:3.5},{polygon_in:[[113.24955,52.0359],[116.74949,43.95547],[116.74949,87.81202],[113.24955,85.18701]],width_in:3.5},{polygon_in:[[113.24955,27.87436],[116.74949,27.87436],[116.74949,35.14995],[113.24955,43.23032]],width_in:3.5},{polygon_in:[[81.24991,27.87436],[84.74987,27.87436],[84.74987,63.81226],[81.24991,61.18731]],width_in:3.5},{polygon_in:[[65.25009,32.93421],[68.75005,30.19623],[68.75005,51.8124],[65.25009,49.18745]],width_in:3.5},{polygon_in:[[177.24965,43.95547],[180.74962,52.0359],[180.74962,85.18701],[177.24965,87.81202]],width_in:3.5},{polygon_in:[[177.24965,27.87436],[180.74962,27.87436],[180.74962,43.23032],[177.24965,35.14995]],width_in:3.5},{polygon_in:[[209.25012,27.87436],[212.75009,27.87436],[212.75009,61.18731],[209.25012,63.81226]],width_in:3.5},{polygon_in:[[225.24995,30.19539],[228.74989,32.93421],[228.74989,49.18745],[225.24995,51.8124]],width_in:3.5},{polygon_in:[[-23.99973,-17.75014],[-27.3002,-13.35033],[97.39954,80.17424],[100.70003,75.77449]],width_in:5.5},{polygon_in:[[193.29998,75.77449],[196.59961,80.17424],[321.29933,-13.35033],[317.99973,-17.75014]],width_in:5.5},{polygon_in:[[131.50018,-35e-5],[131.50018,5.49959],[287.00009,5.49959],[294,.24969],[294,-35e-5]],width_in:5.5}],confidence:"approximate"},{mark:"C02",members:[{polygon_in:[[0,.25048],[0,7.12563],[147.00001,117.375],[147.00001,110.50066]],width_in:5.5},{polygon_in:[[147.00001,110.50066],[147.00001,117.375],[294,7.12563],[294,.25048]],width_in:5.5},{polygon_in:[[0,39e-5],[0,.25048],[9.33334,7.25027],[147.00001,7.25027],[147.00001,39e-5]],width_in:7.25},{polygon_in:[[145.25003,7.25027],[148.74995,7.25027],[148.74995,109.18823],[147.00001,110.50066],[145.25003,109.18823]],width_in:3.5},{polygon_in:[[148.74995,9.50952],[148.74995,7.25027],[151.51768,7.25027],[213.83327,58.11607],[213.83327,60.37532],[212.39121,61.45666]],width_in:3.5},{polygon_in:[[213.83327,60.37532],[217.33317,57.7504],[217.33317,7.25027],[213.83327,7.25027]],width_in:3.5},{polygon_in:[[142.48231,7.25027],[145.25003,7.25027],[145.25003,9.50952],[81.60879,61.45666],[80.16674,60.37532],[80.16674,58.11607]],width_in:3.5},{polygon_in:[[76.66683,57.7504],[80.16674,60.37532],[80.16674,7.25027],[76.66683,7.25027]],width_in:3.5},{polygon_in:[[147.00001,39e-5],[147.00001,7.25027],[284.66665,7.25027],[294,.25048],[294,39e-5]],width_in:7.25}],confidence:"approximate"},{mark:"D01",members:[{polygon_in:[[-23.9999,-17.74959],[-27.30015,-13.34992],[75.00025,63.375],[75.00025,56.50015]],width_in:5.5},{polygon_in:[[75.00025,56.50015],[75.00025,63.375],[177.30016,-13.34992],[173.99991,-17.74959]],width_in:5.5},{polygon_in:[[0,19e-5],[0,.25019],[4.33358,3.50025],[145.66693,3.50025],[150,.25019],[150,19e-5]],width_in:3.5},{polygon_in:[[73.25022,3.50025],[76.75027,3.50025],[76.75027,55.18751],[75.00025,56.50015],[73.25022,55.18751]],width_in:3.5}],confidence:"approximate"},{mark:"D01G",members:[{polygon_in:[[-23.9999,-17.74959],[-27.30015,-13.34992],[75.00025,63.375],[75.00025,56.50015]],width_in:5.5},{polygon_in:[[75.00025,56.50015],[75.00025,63.375],[177.30016,-13.34992],[173.99991,-17.74959]],width_in:5.5},{polygon_in:[[0,19e-5],[0,.25019],[4.33358,3.50025],[145.66693,3.50025],[150,.25019],[150,19e-5]],width_in:3.5},{polygon_in:[[73.25022,55.18751],[75.00025,56.50015],[76.75027,55.18751],[76.75027,3.50025],[73.25022,3.50025]],width_in:3.5},{polygon_in:[[57.24996,3.50025],[60.75002,3.50025],[60.75002,45.8126],[57.24996,43.1878]],width_in:3.5},{polygon_in:[[41.25019,3.50025],[44.75024,3.50025],[44.75024,33.8129],[41.25019,31.18761]],width_in:3.5},{polygon_in:[[25.24992,3.50025],[28.74998,3.50025],[28.74998,21.81271],[25.24992,19.18791]],width_in:3.5},{polygon_in:[[9.25016,3.50025],[12.75021,3.50025],[12.75021,9.81249],[9.25016,7.18769]],width_in:3.5},{polygon_in:[[89.24999,3.50025],[92.75005,3.50025],[92.75005,43.1878],[89.24999,45.8126]],width_in:3.5},{polygon_in:[[105.25025,3.50025],[108.75032,3.50025],[108.75032,31.18761],[105.25025,33.8129]],width_in:3.5},{polygon_in:[[121.25002,3.50025],[124.75008,3.50025],[124.75008,19.18791],[121.25002,21.81271]],width_in:3.5},{polygon_in:[[137.25028,3.50025],[140.75035,3.50025],[140.75035,7.18769],[137.25028,9.81249]],width_in:3.5}],confidence:"approximate"},{mark:"E01",members:[{polygon_in:[[72,54.2498],[68.70003,58.64975],[140.0004,112.125],[140.0004,105.25048]],width_in:5.5},{polygon_in:[[140.0004,105.25048],[140.0004,112.125],[280,7.12532],[280,.24999]],width_in:5.5},{polygon_in:[[0,6e-5],[0,.24999],[4.33338,3.49982],[94.77834,3.49982],[94.77834,6e-5]],width_in:3.5},{polygon_in:[[183.30777,3.49982],[185.22249,3.49982],[185.22249,7.80935],[142.87289,103.09574],[140.0004,105.25048],[140.0004,100.94095]],width_in:3.5},{polygon_in:[[185.22249,7.80935],[185.22249,3.49982],[187.13718,3.49982],[209.27015,53.29778],[206.39769,55.45252]],width_in:3.5},{polygon_in:[[94.77834,7.80935],[94.77834,3.49982],[96.69305,3.49982],[140.0004,100.94095],[140.0004,105.25048],[137.12794,103.09574]],width_in:3.5},{polygon_in:[[92.8628,3.49982],[94.77834,3.49982],[94.77834,7.80935],[73.60313,55.45252],[70.73065,53.29778]],width_in:3.5},{polygon_in:[[-23.99999,-17.75023],[-27.29996,-13.35028],[68.70003,58.64975],[72,54.2498]],width_in:5.5},{polygon_in:[[94.77834,6e-5],[94.77834,3.49982],[275.66744,3.49982],[280,.24999],[280,6e-5]],width_in:3.5}],confidence:"approximate"},{mark:"E01G",members:[{polygon_in:[[71.99964,54.24932],[68.69954,58.64973],[140.00042,112.125],[140.00042,105.2495]],width_in:5.5},{polygon_in:[[140.00042,105.2495],[140.00042,112.125],[280,7.12426],[280,.24958]],width_in:5.5},{polygon_in:[[0,-45e-5],[0,.24958],[4.33308,3.49916],[94.77798,3.49916],[94.77798,-45e-5]],width_in:3.5},{polygon_in:[[183.30764,3.49916],[185.22203,3.49916],[185.22203,7.80869],[142.87288,103.09515],[140.00042,105.2495],[140.00042,100.9408]],width_in:3.5},{polygon_in:[[185.22203,7.80869],[185.22203,3.49916],[187.13727,3.49916],[209.2699,53.29718],[206.39747,55.45148]],width_in:3.5},{polygon_in:[[94.77798,7.80869],[94.77798,3.49916],[96.69322,3.49916],[140.00042,100.9408],[140.00042,105.2495],[137.12714,103.09515]],width_in:3.5},{polygon_in:[[92.86272,3.49916],[94.77798,3.49916],[94.77798,7.80869],[73.6034,55.45148],[70.73012,53.29718]],width_in:3.5},{polygon_in:[[71.99964,54.24932],[68.69954,58.64973],[-27.29999,-13.35077],[-23.99988,-17.75032]],width_in:5.5},{polygon_in:[[94.77798,-45e-5],[94.77798,3.49916],[275.66695,3.49916],[280,.24958],[280,-45e-5]],width_in:3.5},{polygon_in:[[81.87471,61.65602],[77.2916,58.21786],[107.2098,35.77962],[109.50134,40.93604]],width_in:5.5},{polygon_in:[[110.08223,33.62532],[112.3738,38.78175],[159.41636,3.49916],[150.25014,3.49916]],width_in:5.5},{polygon_in:[[138.2502,19.3742],[141.74981,16.74929],[141.74981,97.00339],[140.00042,100.9408],[138.2502,97.00339]],width_in:3.5},{polygon_in:[[122.25055,69.6209],[125.75017,77.49571],[125.75017,94.56202],[122.25055,91.93705]],width_in:3.5},{polygon_in:[[122.25055,31.37417],[125.75017,28.74925],[125.75017,68.87841],[122.25055,61.0036]],width_in:3.5},{polygon_in:[[106.25006,43.37408],[109.50134,40.93604],[109.7497,41.49592],[109.7497,82.56205],[106.25006,79.93714]],width_in:3.5},{polygon_in:[[90.25043,55.37405],[93.75006,52.74913],[93.75006,70.56214],[90.25043,67.93717]],width_in:3.5},{polygon_in:[[154.24984,77.49571],[157.75031,69.6209],[157.75031,91.93705],[154.24984,94.56202]],width_in:3.5},{polygon_in:[[154.24984,7.37429],[157.75031,4.74932],[157.75031,61.0036],[154.24984,68.87841]],width_in:3.5},{polygon_in:[[170.25031,41.49592],[173.74995,33.62111],[173.74995,79.93714],[170.25031,82.56205]],width_in:3.5},{polygon_in:[[170.25031,3.49916],[173.74995,3.49916],[173.74995,25.00294],[170.25031,32.87857]],width_in:3.5},{polygon_in:[[186.24995,10.1213],[189.75042,17.9961],[189.75042,67.93717],[186.24995,70.56214]],width_in:3.5},{polygon_in:[[202.25044,46.12109],[205.75006,53.99589],[205.75006,55.93726],[202.25044,58.56218]],width_in:3.5},{polygon_in:[[202.25044,3.49916],[205.75006,3.49916],[205.75006,45.37772],[202.25044,37.50292]],width_in:3.5},{polygon_in:[[218.25006,3.49916],[221.75055,3.49916],[221.75055,43.93729],[218.25006,46.56226]],width_in:3.5},{polygon_in:[[234.25055,3.49916],[237.7502,3.49916],[237.7502,31.93738],[234.25055,34.5623]],width_in:3.5},{polygon_in:[[250.2502,3.49916],[253.74981,3.49916],[253.74981,19.93742],[250.2502,22.56239]],width_in:3.5},{polygon_in:[[266.24984,3.49916],[269.75031,3.49916],[269.75031,7.9375],[266.24984,10.56242]],width_in:3.5}],confidence:"approximate"},{mark:"E02",members:[{polygon_in:[[0,.24949],[0,7.12489],[139.9996,112.125],[139.9996,105.2496]],width_in:5.5},{polygon_in:[[139.9996,105.2496],[139.9996,112.125],[280,7.12489],[280,.24949]],width_in:5.5},{polygon_in:[[0,-14e-5],[0,.24949],[9.33309,7.24972],[139.9996,7.24972],[139.9996,-14e-5]],width_in:7.25},{polygon_in:[[138.24975,7.24972],[141.75025,7.24972],[141.75025,103.9374],[139.9996,105.2496],[138.24975,103.9374]],width_in:3.5},{polygon_in:[[141.75025,9.50594],[141.75025,7.24972],[144.52237,7.24972],[203.58301,55.3064],[203.58301,57.56266],[202.14045,58.64414]],width_in:3.5},{polygon_in:[[203.58301,57.56266],[207.08352,54.93748],[207.08352,7.24972],[203.58301,7.24972]],width_in:3.5},{polygon_in:[[135.47685,7.24972],[138.24975,7.24972],[138.24975,9.50594],[77.85955,58.64414],[76.417,57.56266],[76.417,55.3064]],width_in:3.5},{polygon_in:[[72.91649,54.93748],[76.417,57.56266],[76.417,7.24972],[72.91649,7.24972]],width_in:3.5},{polygon_in:[[139.9996,-14e-5],[139.9996,7.24972],[270.66691,7.24972],[280,.24949],[280,-14e-5]],width_in:7.25}],confidence:"approximate"},{mark:"G01",members:[{polygon_in:[[101.50014,25.617],[100.16619,30.95281],[189.6054,53.3125],[190.93934,47.97669]],width_in:5.5},{polygon_in:[[182.00019,45.74182],[185.5,46.61706],[185.5,3.49167],[182.00019,3.49167]],width_in:3.5},{polygon_in:[[0,-.00815],[0,.24186],[12.99999,3.49167],[185.5,3.49167],[185.5,-.00815]],width_in:3.5},{polygon_in:[[97.99992,24.74176],[101.50014,25.617],[101.50014,3.49167],[97.99992,3.49167]],width_in:3.5},{polygon_in:[[175.39667,3.49167],[182.00019,3.49167],[182.00019,5.30679],[104.95821,26.48142],[101.50014,25.617],[101.50014,23.80188]],width_in:3.5},{polygon_in:[[-23.99985,-5.7581],[-25.3338,-.42229],[100.16619,30.95281],[101.50014,25.617]],width_in:5.5}],confidence:"approximate"},{mark:"G02",members:[{polygon_in:[[101.49988,25.64166],[100.16589,30.97765],[212.25439,59],[213.5884,53.66401]],width_in:5.5},{polygon_in:[[181.99986,45.76688],[185.5,46.64202],[185.5,3.51701],[181.99986,3.51701]],width_in:3.5},{polygon_in:[[0,.01687],[0,.26692],[12.99993,3.51701],[185.5,3.51701],[185.5,.01687]],width_in:3.5},{polygon_in:[[97.99976,24.76697],[101.49988,25.64166],[101.49988,3.51701],[97.99976,3.51701]],width_in:3.5},{polygon_in:[[175.39638,3.51701],[181.99986,3.51701],[181.99986,5.33157],[104.95791,26.5066],[101.49988,25.64166],[101.49988,23.82708]],width_in:3.5},{polygon_in:[[101.49988,25.64166],[100.16589,30.97765],[-25.33396,-.39721],[-23.99997,-5.73321]],width_in:5.5}],confidence:"approximate"},{mark:"G03",members:[{polygon_in:[[101.49989,25.64206],[100.16583,30.97783],[212.25443,59],[213.58849,53.6642]],width_in:5.5},{polygon_in:[[146.00004,36.76686],[149.5,37.64219],[149.5,3.51697],[146.00004,3.51697]],width_in:3.5},{polygon_in:[[0,.01699],[0,.26697],[13,3.51697],[149.5,3.51697],[149.5,.01699]],width_in:3.5},{polygon_in:[[97.99993,24.76717],[101.49989,25.64206],[101.49989,3.51697],[97.99993,3.51697]],width_in:3.5},{polygon_in:[[142.06928,3.51697],[146.00004,3.51697],[146.00004,5.47135],[104.11537,26.2958],[101.49989,25.64206],[101.49989,23.68767]],width_in:3.5},{polygon_in:[[101.49989,25.64206],[100.16583,30.97783],[-25.33389,-.39731],[-23.99982,-5.73311]],width_in:5.5}],confidence:"approximate"},{mark:"G04",members:[{polygon_in:[[101.5001,25.61711],[100.16632,30.95265],[202.6057,56.5625],[203.93946,51.22695]],width_in:5.5},{polygon_in:[[145.99992,36.74206],[149.5,37.61673],[149.5,3.49197],[145.99992,3.49197]],width_in:3.5},{polygon_in:[[0,-.00813],[0,.24186],[12.99998,3.49197],[149.5,3.49197],[149.5,-.00813]],width_in:3.5},{polygon_in:[[98.00002,24.74197],[101.5001,25.61711],[101.5001,3.49197],[98.00002,3.49197]],width_in:3.5},{polygon_in:[[142.06931,3.49197],[145.99992,3.49197],[145.99992,5.44607],[104.11582,26.27081],[101.5001,25.61711],[101.5001,23.66255]],width_in:3.5},{polygon_in:[[101.5001,25.61711],[100.16632,30.95265],[-25.33395,-.42241],[-24.00017,-5.75796]],width_in:5.5}],confidence:"approximate"},{mark:"G05",members:[{polygon_in:[[101.50021,25.61709],[100.1662,30.95281],[178.60534,50.5625],[179.93936,45.22679]],width_in:5.5},{polygon_in:[[146.0002,36.742],[149.5,37.61703],[149.5,3.49207],[146.0002,3.49207]],width_in:3.5},{polygon_in:[[0,-.00812],[0,.24185],[13.00017,3.49207],[149.5,3.49207],[149.5,-.00812]],width_in:3.5},{polygon_in:[[98.00002,24.74204],[101.50021,25.61709],[101.50021,3.49207],[98.00002,3.49207]],width_in:3.5},{polygon_in:[[142.06937,3.49207],[146.0002,3.49207],[146.0002,5.44609],[104.11553,26.27092],[101.50021,25.61709],[101.50021,23.66269]],width_in:3.5},{polygon_in:[[101.50021,25.61709],[100.1662,30.95281],[-25.33392,-.42222],[-23.99989,-5.75793]],width_in:5.5}],confidence:"approximate"},{mark:"G06",members:[{polygon_in:[[101.50006,25.6169],[100.1663,30.95266],[154.6053,44.5625],[155.93942,39.22673]],width_in:5.5},{polygon_in:[[146.0003,36.74169],[149.5,37.61663],[149.5,3.49174],[146.0003,3.49174]],width_in:3.5},{polygon_in:[[0,-.00832],[0,.24163],[13.00014,3.49174],[149.5,3.49174],[149.5,-.00832]],width_in:3.5},{polygon_in:[[98.00001,24.74163],[101.50006,25.6169],[101.50006,3.49174],[98.00001,3.49174]],width_in:3.5},{polygon_in:[[142.06923,3.49174],[146.0003,3.49174],[146.0003,5.44599],[104.1158,26.27075],[101.50006,25.6169],[101.50006,23.6623]],width_in:3.5},{polygon_in:[[101.50006,25.6169],[100.1663,30.95266],[-25.33391,-.42265],[-24.00015,-5.75843]],width_in:5.5}],confidence:"approximate"},{mark:"G07",members:[{polygon_in:[[-23.99993,-5.73195],[-25.33401,-.39614],[94,29.4375],[94,23.76823]],width_in:5.5},{polygon_in:[[90.49998,22.89316],[94,23.76823],[94,3.51815],[90.49998,3.51815]],width_in:3.5},{polygon_in:[[0,.01813],[0,.26823],[12.99995,3.51815],[94,3.51815],[94,.01813]],width_in:3.5}],confidence:"approximate"},{mark:"G08",members:[{polygon_in:[[-23.99994,-5.73175],[-25.33382,-.396],[77,25.1875],[77,19.51816]],width_in:5.5},{polygon_in:[[73.49994,18.64316],[77,19.51816],[77,3.51821],[73.49994,3.51821]],width_in:3.5},{polygon_in:[[0,.01815],[0,.26828],[12.99994,3.51821],[77,3.51821],[77,.01815]],width_in:3.5}],confidence:"approximate"},{mark:"H01",members:[{polygon_in:[[99.91624,75.18833],[96.61636,79.58819],[179.9998,142.125],[179.9998,135.24999]],width_in:5.5},{polygon_in:[[179.9998,136.6252],[179.9998,142.125],[247.00021,142.125],[247.00021,136.6252]],width_in:5.5},{polygon_in:[[247.00021,135.24999],[247.00021,142.125],[330.38365,79.58819],[327.08375,75.18833]],width_in:5.5},{polygon_in:[[0,51e-5],[0,.2504],[4.33306,3.50073],[179.9998,3.50073],[179.9998,51e-5]],width_in:3.5},{polygon_in:[[96.417,72.56341],[99.91624,75.18833],[99.91624,3.50073],[96.417,3.50073]],width_in:3.5},{polygon_in:[[177.37587,3.50073],[179.9998,3.50073],[179.9998,5.84939],[101.34406,76.25899],[99.91624,75.18833],[99.91624,72.83967]],width_in:3.5},{polygon_in:[[179.9998,3.50073],[183.50002,3.50073],[183.50002,136.6252],[179.9998,136.6252]],width_in:3.5},{polygon_in:[[241.58036,3.50073],[243.49995,3.50073],[243.49995,7.7599],[185.41964,136.6252],[183.50002,136.6252],[183.50002,132.36604]],width_in:3.5},{polygon_in:[[243.49995,3.50073],[247.00021,3.50073],[247.00021,136.6252],[243.49995,136.6252]],width_in:3.5},{polygon_in:[[247.00021,5.84939],[247.00021,3.50073],[249.62411,3.50073],[327.08375,72.83967],[327.08375,75.18833],[325.65595,76.25899]],width_in:3.5},{polygon_in:[[327.08375,75.18833],[330.58299,72.56341],[330.58299,3.50073],[327.08375,3.50073]],width_in:3.5},{polygon_in:[[0,.2504],[0,7.12541],[96.61636,79.58819],[99.91624,75.18833]],width_in:5.5},{polygon_in:[[327.08375,75.18833],[330.38365,79.58819],[454.29965,-13.34984],[450.99978,-17.74964]],width_in:5.5},{polygon_in:[[247.00021,51e-5],[247.00021,3.50073],[422.66693,3.50073],[427,.2504],[427,51e-5]],width_in:3.5},{polygon_in:[[179.9998,51e-5],[179.9998,3.50073],[247.00021,3.50073],[247.00021,51e-5]],width_in:3.5}],confidence:"approximate"},{mark:"H01G",members:[{polygon_in:[[99.91705,75.18795],[96.61711,79.58783],[179.99997,142.125],[179.99997,135.24991]],width_in:5.5},{polygon_in:[[179.99997,136.62514],[179.99997,142.125],[247,142.125],[247,136.62514]],width_in:5.5},{polygon_in:[[247,135.24991],[247,142.125],[330.38288,79.58783],[327.08296,75.18795]],width_in:5.5},{polygon_in:[[247,53e-5],[247,3.50059],[422.66612,3.50059],[427,.25042],[427,53e-5]],width_in:3.5},{polygon_in:[[96.41702,72.56346],[99.91705,75.18795],[99.91705,3.50059],[96.41702,3.50059]],width_in:3.5},{polygon_in:[[177.37651,3.50059],[179.99997,3.50059],[179.99997,5.84885],[101.34407,76.25849],[99.91705,75.18795],[99.91705,72.8397]],width_in:3.5},{polygon_in:[[179.99997,3.50059],[183.5,3.50059],[183.5,136.62514],[179.99997,136.62514]],width_in:3.5},{polygon_in:[[211.70631,3.50059],[213.49999,3.50059],[213.49999,11.46041],[185.29368,136.62514],[183.5,136.62514],[183.5,128.66526]],width_in:3.5},{polygon_in:[[243.5,3.50059],[247,3.50059],[247,136.62514],[243.5,136.62514]],width_in:3.5},{polygon_in:[[247,5.84885],[247,3.50059],[249.6235,3.50059],[327.08296,72.8397],[327.08296,75.18795],[325.65594,76.25849]],width_in:3.5},{polygon_in:[[327.08296,75.18795],[330.58296,72.56346],[330.58296,3.50059],[327.08296,3.50059]],width_in:3.5},{polygon_in:[[99.91705,75.18795],[96.61711,79.58783],[0,7.12551],[0,.25042]],width_in:5.5},{polygon_in:[[327.08296,75.18795],[330.38288,79.58783],[454.29928,-13.34949],[450.99939,-17.74936]],width_in:5.5},{polygon_in:[[247,53e-5],[247,3.50059],[179.99997,3.50059],[179.99997,53e-5]],width_in:3.5},{polygon_in:[[179.99997,53e-5],[179.99997,3.50059],[4.33388,3.50059],[0,.25042],[0,53e-5]],width_in:3.5},{polygon_in:[[201.49978,136.62514],[197.99978,136.62514],[197.99978,80.24197],[201.49978,64.71126]],width_in:3.5},{polygon_in:[[229.00022,136.62514],[225.50019,136.62514],[225.50019,64.71126],[229.00022,80.24197]],width_in:3.5},{polygon_in:[[201.49978,112.62572],[201.49978,109.12572],[225.50019,109.12572],[225.50019,112.62572]],width_in:3.5},{polygon_in:[[213.49999,11.46141],[213.49999,3.50059],[215.29366,3.50059],[243.5,128.66526],[243.5,136.62514],[241.7063,136.62514]],width_in:3.5},{polygon_in:[[229.25008,81.35106],[232.75008,96.88276],[232.75008,136.62514],[229.25008,136.62514]],width_in:3.5},{polygon_in:[[229.25008,3.50059],[232.75008,3.50059],[232.75008,80.96206],[229.25008,65.43037]],width_in:3.5},{polygon_in:[[213.25013,12.57056],[213.49999,11.46141],[216.75016,25.88301],[216.75016,109.12572],[213.25013,109.12572]],width_in:3.5},{polygon_in:[[165.25035,19.05262],[168.75037,15.92023],[168.75037,126.81269],[165.25035,124.1882]],width_in:3.5},{polygon_in:[[165.25035,3.50059],[168.75037,3.50059],[168.75037,11.22274],[165.25035,14.35512]],width_in:3.5},{polygon_in:[[149.24941,33.37566],[152.74942,30.24228],[152.74942,114.81249],[149.24941,112.188]],width_in:3.5},{polygon_in:[[149.24941,3.50059],[152.74942,3.50059],[152.74942,25.54479],[149.24941,28.67817]],width_in:3.5},{polygon_in:[[133.24947,47.69765],[136.74949,44.56532],[136.74949,102.81328],[133.24947,100.1878]],width_in:3.5},{polygon_in:[[133.24947,3.50059],[136.74949,3.50059],[136.74949,39.86783],[133.24947,43.00015]],width_in:3.5},{polygon_in:[[117.24953,62.02075],[120.74955,58.88737],[120.74955,90.81307],[117.24953,88.18759]],width_in:3.5},{polygon_in:[[117.24953,3.50059],[120.74955,3.50059],[120.74955,54.18987],[117.24953,57.32325]],width_in:3.5},{polygon_in:[[101.24961,3.50059],[104.74963,3.50059],[104.74963,68.51291],[101.24961,71.64524]],width_in:3.5},{polygon_in:[[85.24968,3.50059],[88.74969,3.50059],[88.74969,66.81266],[85.24968,64.18817]],width_in:3.5},{polygon_in:[[69.24975,3.50059],[72.74977,3.50059],[72.74977,54.81246],[69.24975,52.18797]],width_in:3.5},{polygon_in:[[53.24982,3.50059],[56.74983,3.50059],[56.74983,42.81331],[53.24982,40.18777]],width_in:3.5},{polygon_in:[[37.24989,3.50059],[40.7499,3.50059],[40.7499,30.8131],[37.24989,28.18756]],width_in:3.5},{polygon_in:[[21.24995,3.50059],[24.74998,3.50059],[24.74998,18.8129],[21.24995,16.18841]],width_in:3.5},{polygon_in:[[261.24992,18.60572],[264.74996,21.73805],[264.74996,121.93746],[261.24992,124.56295]],width_in:3.5},{polygon_in:[[261.24992,3.50059],[264.74996,3.50059],[264.74996,17.04055],[261.24992,13.90823]],width_in:3.5},{polygon_in:[[277.24985,32.92771],[280.74988,36.06109],[280.74988,109.93825],[277.24985,112.56274]],width_in:3.5},{polygon_in:[[277.24985,3.50059],[280.74988,3.50059],[280.74988,31.36359],[277.24985,28.23021]],width_in:3.5},{polygon_in:[[293.2498,47.25081],[296.7498,50.38314],[296.7498,97.93805],[293.2498,100.56254]],width_in:3.5},{polygon_in:[[293.2498,3.50059],[296.7498,3.50059],[296.7498,45.68564],[293.2498,42.55331]],width_in:3.5},{polygon_in:[[309.24972,61.5728],[312.74975,64.70618],[312.74975,85.93784],[309.24972,88.56339]],width_in:3.5},{polygon_in:[[309.24972,3.50059],[312.74975,3.50059],[312.74975,60.00868],[309.24972,56.8753]],width_in:3.5},{polygon_in:[[341.24959,3.50059],[344.74959,3.50059],[344.74959,61.93849],[341.24959,64.56298]],width_in:3.5},{polygon_in:[[357.24951,3.50059],[360.74954,3.50059],[360.74954,49.93828],[357.24951,52.56277]],width_in:3.5},{polygon_in:[[373.24943,3.50059],[376.74947,3.50059],[376.74947,37.93808],[373.24943,40.56257]],width_in:3.5},{polygon_in:[[389.24939,3.50059],[392.74939,3.50059],[392.74939,25.93788],[389.24939,28.56336]],width_in:3.5},{polygon_in:[[405.24931,3.50059],[408.74931,3.50059],[408.74931,13.93767],[405.24931,16.56315]],width_in:3.5},{polygon_in:[[201.49978,48.79057],[197.99978,64.32121],[197.99978,3.50059],[201.49978,3.50059]],width_in:3.5}],confidence:"approximate"},{mark:"H02",members:[{polygon_in:[[99.91697,75.18743],[96.61634,79.58821],[180.00036,142.125],[180.00036,135.25018]],width_in:5.5},{polygon_in:[[180.00036,136.62496],[180.00036,142.125],[247.00062,142.125],[247.00062,136.62496]],width_in:5.5},{polygon_in:[[247.00062,135.25018],[247.00062,142.125],[330.38363,79.58821],[327.08401,75.18743]],width_in:5.5},{polygon_in:[[247.00062,26e-5],[247.00062,3.49984],[422.66679,3.49984],[427,.24992],[427,26e-5]],width_in:3.5},{polygon_in:[[96.4164,72.56324],[99.91697,75.18743],[99.91697,3.49984],[96.4164,3.49984]],width_in:3.5},{polygon_in:[[177.37617,3.49984],[180.00036,3.49984],[180.00036,5.84947],[101.34445,76.25875],[99.91697,75.18743],[99.91697,72.83877]],width_in:3.5},{polygon_in:[[180.00036,3.49984],[183.49994,3.49984],[183.49994,136.62496],[180.00036,136.62496]],width_in:3.5},{polygon_in:[[241.58115,3.49984],[243.50004,3.49984],[243.50004,7.7594],[185.41983,136.62496],[183.49994,136.62496],[183.49994,132.36638]],width_in:3.5},{polygon_in:[[243.50004,3.49984],[247.00062,3.49984],[247.00062,136.62496],[243.50004,136.62496]],width_in:3.5},{polygon_in:[[247.00062,5.84947],[247.00062,3.49984],[249.6238,3.49984],[327.08401,72.83877],[327.08401,75.18743],[325.65653,76.25875]],width_in:3.5},{polygon_in:[[327.08401,75.18743],[330.58359,72.56324],[330.58359,3.49984],[327.08401,3.49984]],width_in:3.5},{polygon_in:[[99.91697,75.18743],[96.61634,79.58821],[0,7.12571],[0,.24992]],width_in:5.5},{polygon_in:[[327.08401,75.18743],[330.38363,79.58821],[427,7.12571],[427,.24992]],width_in:5.5},{polygon_in:[[247.00062,26e-5],[247.00062,3.49984],[180.00036,3.49984],[180.00036,26e-5]],width_in:3.5},{polygon_in:[[180.00036,26e-5],[180.00036,3.49984],[4.33319,3.49984],[0,.24992],[0,26e-5]],width_in:3.5}],confidence:"approximate"},{mark:"J02",members:[{polygon_in:[[-24,-17.75008],[-27.3,-13.35007],[24,25.125],[24,18.25006]],width_in:5.5},{polygon_in:[[0,3e-5],[0,.24998],[4.33333,3.50004],[24,3.50004],[24,3e-5]],width_in:3.5}],confidence:"approximate"},{mark:"JH02",members:[{polygon_in:[[-33.93741,-17.07322],[-36.51395,-12.21474],[33.1875,24.75],[33.1875,18.52517]],width_in:5.5},{polygon_in:[[27.68807,15.60853],[31.18769,17.46466],[31.18769,3.52517],[27.68807,3.52517]],width_in:3.5},{polygon_in:[[0,.02555],[0,.92488],[4.90321,3.52517],[33.1875,3.52517],[33.1875,.02555]],width_in:3.5}],confidence:"approximate"},{mark:"JH12",members:[{polygon_in:[[89.54316,16.15057],[88.58585,21.56632],[208.4375,42.75],[208.4375,37.16518]],width_in:5.5},{polygon_in:[[204.93726,36.54647],[208.4375,37.16518],[208.4375,5.48951],[204.93726,5.48951]],width_in:3.5},{polygon_in:[[0,-.01032],[0,.32371],[29.22779,5.48951],[87.7935,5.48951],[87.7935,-.01032]],width_in:5.5},{polygon_in:[[86.04339,15.53186],[89.54316,16.15057],[89.54316,5.48951],[86.04339,5.48951]],width_in:3.5},{polygon_in:[[144.6091,5.48951],[144.6091,9.03496],[94.78527,17.0768],[89.54316,16.15057],[89.54316,14.37761]],width_in:3.5},{polygon_in:[[144.6091,25.88312],[148.10887,26.50183],[148.10887,5.48951],[144.6091,5.48951]],width_in:3.5},{polygon_in:[[199.89119,5.48951],[204.93726,5.48951],[204.93726,7.35568],[151.5232,27.10546],[148.10887,26.50183],[148.10887,24.63611]],width_in:3.5},{polygon_in:[[-33.93756,-5.67465],[-34.89487,-.25891],[88.58585,21.56632],[89.54316,16.15057]],width_in:5.5},{polygon_in:[[87.7935,-.01032],[87.7935,5.48951],[208.4375,5.48951],[208.4375,-.01032]],width_in:5.5}],confidence:"approximate"},{mark:"JH15",members:[{polygon_in:[[138.53556,24.8139],[137.57781,30.22975],[259.3125,51.75],[259.3125,46.16462]],width_in:5.5},{polygon_in:[[255.8127,45.54588],[259.3125,46.16462],[259.3125,5.48997],[255.8127,5.48997]],width_in:3.5},{polygon_in:[[0,-.00981],[0,.3242],[29.22362,5.48997],[77.25983,5.48997],[77.25983,-.00981]],width_in:5.5},{polygon_in:[[75.50993,13.67279],[79.00973,14.29153],[79.00973,5.48997],[75.50993,5.48997]],width_in:3.5},{polygon_in:[[135.0352,5.48997],[135.0352,9.01776],[84.84237,15.32258],[79.00973,14.29153],[79.00973,12.52763]],width_in:3.5},{polygon_in:[[135.0352,24.19516],[138.53556,24.8139],[138.53556,5.48997],[135.0352,5.48997]],width_in:3.5},{polygon_in:[[189.19383,5.48997],[194.56102,5.48997],[194.56102,7.34114],[142.08348,25.44101],[138.53556,24.8139],[138.53556,22.96273]],width_in:3.5},{polygon_in:[[194.56102,34.71808],[198.06083,35.33682],[198.06083,5.48997],[194.56102,5.48997]],width_in:3.5},{polygon_in:[[252.00072,5.48997],[255.8127,5.48997],[255.8127,7.46031],[200.90107,35.83862],[198.06083,35.33682],[198.06083,33.36707]],width_in:3.5},{polygon_in:[[-33.9374,-5.67515],[-34.89514,-.25931],[137.57781,30.22975],[138.53556,24.8139]],width_in:5.5},{polygon_in:[[77.25983,-.00981],[77.25983,5.48997],[259.3125,5.48997],[259.3125,-.00981]],width_in:5.5}],confidence:"approximate"},{mark:"JK02",members:[{polygon_in:[[-23.99991,-5.77863],[-25.33387,-.44278],[23.6875,11.8125],[23.6875,6.14328]],width_in:5.5},{polygon_in:[[0,-.0286],[0,.22138],[13.00003,3.47142],[23.6875,3.47142],[23.6875,-.0286]],width_in:3.5}],confidence:"approximate"},{mark:"JK04",members:[{polygon_in:[[-23.99821,-5.77785],[-25.33199,-.44241],[47.6875,17.8125],[47.6875,12.14362]],width_in:5.5},{polygon_in:[[0,-.02826],[0,.22166],[12.99902,3.47141],[47.6875,3.47141],[47.6875,-.02826]],width_in:3.5}],confidence:"approximate"},{mark:"JK06",members:[{polygon_in:[[-23.99878,-5.77792],[-25.33263,-.44254],[71.6875,23.8125],[71.6875,18.14349]],width_in:5.5},{polygon_in:[[0,-.02828],[0,.22167],[12.99939,3.47163],[71.6875,3.47163],[71.6875,-.02828]],width_in:3.5}],confidence:"approximate"},{mark:"JK08",members:[{polygon_in:[[-23.99915,-5.77802],[-25.33294,-.44262],[95.6875,29.8125],[95.6875,24.14363]],width_in:5.5},{polygon_in:[[0,-.02833],[0,.22169],[12.99953,3.47144],[95.6875,3.47144],[95.6875,-.02833]],width_in:3.5},{polygon_in:[[94.18763,23.76847],[90.68761,22.89353],[90.68761,3.47144],[94.18763,3.47144]],width_in:3.5}],confidence:"approximate"},{mark:"JK10",members:[{polygon_in:[[-23.99907,-5.77861],[-25.33317,-.44282],[119.6875,35.8125],[119.6875,30.14341]],width_in:5.5},{polygon_in:[[0,-.02866],[0,.22133],[12.99973,3.47124],[119.6875,3.47124],[119.6875,-.02866]],width_in:3.5},{polygon_in:[[114.68776,3.47124],[118.18766,3.47124],[118.18766,29.76815],[114.68776,28.89325]],width_in:3.5},{polygon_in:[[65.84565,3.47124],[69.34556,3.47124],[69.34556,17.55756],[65.84565,16.68265]],width_in:3.5},{polygon_in:[[72.61388,18.37485],[69.34556,17.55756],[69.34556,15.72535],[108.78954,3.47124],[114.68776,3.47124],[114.68776,5.30375]],width_in:3.5}],confidence:"approximate"},{mark:"JK12",members:[{polygon_in:[[-23.99938,-5.77834],[-25.33341,-.4429],[143.6875,41.8125],[143.6875,36.14346]],width_in:5.5},{polygon_in:[[0,-.02861],[0,.22141],[12.99965,3.47117],[143.6875,3.47117],[143.6875,-.02861]],width_in:3.5},{polygon_in:[[142.18765,35.76825],[138.68785,34.89331],[138.68785,3.47117],[142.18765,3.47117]],width_in:3.5},{polygon_in:[[132.6271,3.47117],[138.68785,3.47117],[138.68785,5.29923],[85.03434,21.48],[81.72041,20.65145],[81.72041,18.82372]],width_in:3.5},{polygon_in:[[81.72041,20.65145],[78.22063,19.77649],[78.22063,3.47117],[81.72041,3.47117]],width_in:3.5}],confidence:"approximate"},{mark:"JK14",members:[{polygon_in:[[94.15791,23.76084],[92.82376,29.0964],[167.6875,47.8125],[167.6875,42.14316]],width_in:5.5},{polygon_in:[[0,-.02862],[0,.22138],[12.99984,3.47133],[167.6875,3.47133],[167.6875,-.02862]],width_in:3.5},{polygon_in:[[166.1875,41.76817],[162.68755,40.89316],[162.68755,3.47133],[166.1875,3.47133]],width_in:3.5},{polygon_in:[[156.52323,3.47133],[162.68755,3.47133],[162.68755,5.29616],[97.49992,24.59644],[94.15791,23.76084],[94.15791,21.93565]],width_in:3.5},{polygon_in:[[94.15791,23.76084],[90.65795,22.88586],[90.65795,3.47133],[94.15791,3.47133]],width_in:3.5},{polygon_in:[[-23.99936,-5.77855],[-25.33315,-.44303],[92.82376,29.0964],[94.15791,23.76084]],width_in:5.5}],confidence:"approximate"},{mark:"K01",members:[{polygon_in:[[96.08854,72.31613],[92.7884,76.71596],[179.99976,142.125],[179.99976,135.24926]],width_in:5.5},{polygon_in:[[179.99976,136.62446],[179.99976,142.125],[317.00023,142.125],[317.00023,136.62446]],width_in:5.5},{polygon_in:[[317.00023,135.24926],[317.00023,142.125],[404.2116,76.71596],[400.91146,72.31613]],width_in:5.5},{polygon_in:[[180.45325,65.60691],[178.52198,70.75772],[248.49946,96.99862],[248.49946,91.12515]],width_in:5.5},{polygon_in:[[248.49946,91.12515],[248.49946,96.99862],[318.47802,70.75772],[316.54675,65.60691]],width_in:5.5},{polygon_in:[[92.58836,69.69051],[96.08854,72.31613],[96.08854,39.84467],[92.58836,38.53238]],width_in:3.5},{polygon_in:[[175.47737,69.61508],[179.99976,71.31175],[179.99976,73.06187],[98.38535,74.03901],[96.08854,72.31613],[96.08854,70.56608]],width_in:3.5},{polygon_in:[[179.99976,71.31175],[183.49994,72.62405],[183.49994,136.62446],[179.99976,136.62446]],width_in:3.5},{polygon_in:[[244.69975,95.57427],[246.74938,96.34302],[246.74938,98.41774],[186.75714,136.62446],[183.49994,136.62446],[183.49994,134.54968]],width_in:3.5},{polygon_in:[[246.74938,96.99862],[250.24958,96.99862],[250.24958,136.62446],[246.74938,136.62446]],width_in:3.5},{polygon_in:[[250.24958,98.41774],[250.24958,96.34302],[252.30023,95.57427],[313.50006,134.54968],[313.50006,136.62446],[310.24179,136.62446]],width_in:3.5},{polygon_in:[[313.50006,72.62405],[317.00023,71.31175],[317.00023,136.62446],[313.50006,136.62446]],width_in:3.5},{polygon_in:[[317.00023,73.06187],[317.00023,71.31175],[321.5226,69.61508],[400.91146,70.56608],[400.91146,72.31613],[398.61463,74.03901]],width_in:3.5},{polygon_in:[[400.91146,72.31613],[404.41162,69.69051],[404.41162,38.53238],[400.91146,39.84467]],width_in:3.5},{polygon_in:[[0,.25029],[0,7.12494],[92.7884,76.71596],[96.08854,72.31613]],width_in:5.5},{polygon_in:[[400.91146,72.31613],[404.2116,76.71596],[497,7.12494],[497,.25029]],width_in:5.5},{polygon_in:[[5.49954,-4e-5],[0,-4e-5],[0,.25029],[9.49721,7.37316],[178.52198,70.75772],[180.45325,65.60691]],width_in:5.5},{polygon_in:[[316.54675,65.60691],[318.47802,70.75772],[487.50171,7.37316],[497,.25029],[497,-4e-5],[491.4994,-4e-5]],width_in:5.5}],confidence:"approximate"},{mark:"K01G",members:[{polygon_in:[[96.08854,72.31613],[92.7884,76.71596],[179.99976,142.125],[179.99976,135.24926]],width_in:5.5},{polygon_in:[[179.99976,136.62446],[179.99976,142.125],[317.00023,142.125],[317.00023,136.62446]],width_in:5.5},{polygon_in:[[317.00023,135.24926],[317.00023,142.125],[404.2116,76.71596],[400.91146,72.31613]],width_in:5.5},{polygon_in:[[181.15496,65.87085],[179.22473,71.02058],[248.49946,96.99862],[248.49946,91.12515]],width_in:5.5},{polygon_in:[[248.49946,91.12515],[248.49946,96.99862],[317.77527,71.02058],[315.84397,65.87085]],width_in:5.5},{polygon_in:[[92.58836,69.69051],[96.08854,72.31613],[96.08854,39.84467],[92.58836,38.53238]],width_in:3.5},{polygon_in:[[175.47737,69.61508],[179.99976,71.31175],[179.99976,73.06187],[98.38535,74.03901],[96.08854,72.31613],[96.08854,70.56608]],width_in:3.5},{polygon_in:[[179.99976,71.31175],[183.49994,72.62405],[183.49994,136.62446],[179.99976,136.62446]],width_in:3.5},{polygon_in:[[246.74938,96.99862],[250.24958,96.99862],[250.24958,136.62446],[246.74938,136.62446]],width_in:3.5},{polygon_in:[[244.69975,95.57427],[246.74938,96.34302],[246.74938,98.41774],[186.75714,136.62446],[183.49994,136.62446],[183.49994,134.54968]],width_in:3.5},{polygon_in:[[313.50006,72.62405],[317.00023,71.31175],[317.00023,136.62446],[313.50006,136.62446]],width_in:3.5},{polygon_in:[[250.24958,98.41774],[250.24958,96.34302],[252.30023,95.57427],[313.50006,134.54968],[313.50006,136.62446],[310.24179,136.62446]],width_in:3.5},{polygon_in:[[317.00023,73.06187],[317.00023,71.31175],[321.5226,69.61508],[400.91146,70.56608],[400.91146,72.31613],[398.61463,74.03901]],width_in:3.5},{polygon_in:[[400.91146,72.31613],[404.41162,69.69051],[404.41162,38.53238],[400.91146,39.84467]],width_in:3.5},{polygon_in:[[96.08854,72.31613],[92.7884,76.71596],[0,7.12494],[0,.25029]],width_in:5.5},{polygon_in:[[400.91146,72.31613],[404.2116,76.71596],[497,7.12494],[497,.25029]],width_in:5.5},{polygon_in:[[181.15496,65.87085],[179.22473,71.02058],[9.49721,7.37316],[0,.25029],[0,-4e-5],[5.49954,-4e-5]],width_in:5.5},{polygon_in:[[315.84397,65.87085],[317.77527,71.02058],[487.50171,7.37316],[497,.25029],[497,-4e-5],[491.4994,-4e-5]],width_in:5.5},{polygon_in:[[273.91613,136.62446],[264.74986,136.62446],[285.64102,120.95635],[290.59805,124.11407]],width_in:5.5},{polygon_in:[[288.63219,118.71293],[293.59027,121.86963],[313.50006,106.9378],[313.50006,100.06206]],width_in:5.5},{polygon_in:[[317.00023,97.43746],[317.00023,104.31211],[358.01271,73.55306],[348.98995,73.44413]],width_in:5.5},{polygon_in:[[353.58353,69.99945],[362.60632,70.10729],[400.91146,41.37898],[400.91146,39.84467],[386.66879,45.18502]],width_in:5.5},{polygon_in:[[294.25009,126.4402],[297.75026,128.66892],[297.75026,136.62446],[294.25009,136.62446]],width_in:3.5},{polygon_in:[[326.25027,97.37462],[329.74941,94.74997],[329.74941,125.68711],[326.25027,128.31177]],width_in:3.5},{polygon_in:[[342.24931,85.37531],[345.74951,82.74969],[345.74951,113.68684],[342.24931,116.31245]],width_in:3.5},{polygon_in:[[358.24942,73.5551],[361.74961,73.59704],[361.74961,101.68752],[358.24942,104.31211]],width_in:3.5},{polygon_in:[[374.24952,73.74681],[377.74968,73.78868],[377.74968,89.68718],[374.24952,92.31286]],width_in:3.5},{polygon_in:[[374.24952,61.37469],[377.74968,58.75003],[377.74968,70.28852],[374.24952,70.24658]],width_in:3.5},{polygon_in:[[390.24959,49.37537],[393.74979,46.74969],[393.74979,70.48016],[390.24959,70.43829]],width_in:3.5},{polygon_in:[[406.24969,37.84321],[409.74989,36.52983],[409.74989,65.68758],[406.24969,68.31218]],width_in:3.5},{polygon_in:[[422.2498,31.84304],[425.74999,30.52966],[425.74999,53.68724],[422.2498,56.31184]],width_in:3.5},{polygon_in:[[438.2499,25.84287],[441.75006,24.53057],[441.75006,41.6869],[438.2499,44.31258]],width_in:3.5},{polygon_in:[[454.24997,19.8427],[457.75016,18.5304],[457.75016,29.68765],[454.24997,32.31224]],width_in:3.5},{polygon_in:[[470.25007,13.84253],[473.74921,12.53023],[473.74921,17.68731],[470.25007,20.3119]],width_in:3.5}],confidence:"approximate"},{mark:"K02",members:[{polygon_in:[[96.08795,72.31624],[92.78879,76.71581],[180.0004,142.125],[180.0004,135.24975]],width_in:5.5},{polygon_in:[[180.0004,136.62505],[180.0004,142.125],[316.99965,142.125],[316.99965,136.62505]],width_in:5.5},{polygon_in:[[316.99965,135.24975],[316.99965,142.125],[388.80002,88.27503],[385.49979,83.87546]],width_in:5.5},{polygon_in:[[180.45284,65.60797],[179.22451,68.88491],[258.00058,98.42515],[258.00058,94.68729]],width_in:3.5},{polygon_in:[[258.00058,136.62505],[261.5006,136.62505],[261.5006,3.49998],[258.00058,3.49998]],width_in:3.5},{polygon_in:[[216.24996,0],[216.24996,3.49998],[314.25019,3.49998],[314.25019,0]],width_in:3.5},{polygon_in:[[92.58794,69.69146],[96.08795,72.31624],[96.08795,37.70832],[92.58794,36.39645]],width_in:3.5},{polygon_in:[[175.75409,67.58362],[180.0004,69.17563],[180.0004,70.9272],[98.31207,73.98426],[96.08795,72.31624],[96.08795,70.5646]],width_in:3.5},{polygon_in:[[180.0004,69.17563],[183.50041,70.48854],[183.50041,136.62505],[180.0004,136.62505]],width_in:3.5},{polygon_in:[[255.78493,97.5953],[258.00058,98.42515],[258.00058,100.39241],[187.33552,136.62505],[183.50041,136.62505],[183.50041,134.65882]],width_in:3.5},{polygon_in:[[311.50492,3.49998],[313.49963,3.49998],[313.49963,7.14268],[263.49531,98.42515],[261.5006,98.42515],[261.5006,94.78349]],width_in:3.5},{polygon_in:[[261.5006,100.76552],[261.5006,98.42515],[264.22999,98.42515],[313.49963,134.45694],[313.49963,136.62505],[310.53558,136.62505]],width_in:3.5},{polygon_in:[[313.49963,3.49998],[316.99965,3.49998],[316.99965,136.62505],[313.49963,136.62505]],width_in:3.5},{polygon_in:[[316.99965,6.19766],[316.99965,3.49998],[319.29986,3.49998],[385.49979,81.17668],[385.49979,83.87546],[384.09705,84.92725]],width_in:3.5},{polygon_in:[[385.49979,83.87546],[388.99981,81.24965],[388.99981,3.49998],[385.49979,3.49998]],width_in:3.5},{polygon_in:[[457.49996,3.49998],[461,3.49998],[461,27.24948],[457.49996,29.87529]],width_in:3.5},{polygon_in:[[388.99981,5.37523],[388.99981,3.49998],[393.87086,3.49998],[457.49996,28.00004],[457.49996,29.87529],[455.84774,31.11419]],width_in:3.5},{polygon_in:[[229.74999,84.09424],[226.24997,82.78134],[226.24997,3.49998],[229.74999,3.49998]],width_in:3.5},{polygon_in:[[96.08795,72.31624],[92.78879,76.71581],[0,7.12474],[0,.24943]],width_in:5.5},{polygon_in:[[385.49979,83.87546],[388.80002,88.27503],[461,34.12479],[461,27.24948]],width_in:5.5},{polygon_in:[[180.45284,65.60797],[179.22451,68.88491],[3.80128,3.10144],[0,.24943],[0,0],[5.50002,0]],width_in:3.5},{polygon_in:[[314.25019,0],[314.25019,3.49998],[461,3.49998],[461,0]],width_in:3.5}],confidence:"approximate"},{mark:"K03",members:[{polygon_in:[[96.08795,72.31624],[92.78879,76.71581],[180.0004,142.125],[180.0004,135.24975]],width_in:5.5},{polygon_in:[[180.0004,136.62505],[180.0004,142.125],[316.99965,142.125],[316.99965,136.62505]],width_in:5.5},{polygon_in:[[385.49979,83.87546],[388.80002,88.27503],[461,34.12479],[461,27.24948]],width_in:5.5},{polygon_in:[[180.45284,65.60797],[179.22451,68.88491],[258.00058,98.42515],[258.00058,94.68729]],width_in:3.5},{polygon_in:[[258.00058,136.62505],[261.5006,136.62505],[261.5006,3.49998],[258.00058,3.49998]],width_in:3.5},{polygon_in:[[254.25004,0],[254.25004,3.49998],[314.25019,3.49998],[314.25019,0]],width_in:3.5},{polygon_in:[[92.58794,69.69146],[96.08795,72.31624],[96.08795,37.70832],[92.58794,36.39645]],width_in:3.5},{polygon_in:[[175.75409,67.58362],[180.0004,69.17563],[180.0004,70.9272],[98.31207,73.98426],[96.08795,72.31624],[96.08795,70.5646]],width_in:3.5},{polygon_in:[[180.0004,69.17563],[183.50041,70.48854],[183.50041,136.62505],[180.0004,136.62505]],width_in:3.5},{polygon_in:[[311.50492,3.49998],[313.49963,3.49998],[313.49963,7.14268],[263.49531,98.42515],[261.5006,98.42515],[261.5006,94.78349]],width_in:3.5},{polygon_in:[[261.5006,100.59745],[261.5006,98.42515],[264.4562,98.42515],[313.49963,134.45378],[313.49963,136.62505],[310.54404,136.62505]],width_in:3.5},{polygon_in:[[313.49963,3.49998],[316.99965,3.49998],[316.99965,136.62505],[313.49963,136.62505]],width_in:3.5},{polygon_in:[[316.99965,6.19766],[316.99965,3.49998],[319.29986,3.49998],[385.49979,81.17668],[385.49979,83.87546],[384.09705,84.92725]],width_in:3.5},{polygon_in:[[385.49979,83.87546],[388.99981,81.24965],[388.99981,3.49998],[385.49979,3.49998]],width_in:3.5},{polygon_in:[[457.49996,3.49998],[461,3.49998],[461,27.24948],[457.49996,29.87529]],width_in:3.5},{polygon_in:[[388.99981,5.37523],[388.99981,3.49998],[393.87086,3.49998],[457.49996,28.00004],[457.49996,29.87529],[455.84774,31.11419]],width_in:3.5},{polygon_in:[[255.78493,97.5953],[258.00058,98.42515],[258.00058,100.39241],[187.33552,136.62505],[183.50041,136.62505],[183.50041,134.65882]],width_in:3.5},{polygon_in:[[96.08795,72.31624],[92.78879,76.71581],[0,7.12474],[0,.24943]],width_in:5.5},{polygon_in:[[385.49979,83.87546],[388.80002,88.27503],[316.99965,142.125],[316.99965,135.24975]],width_in:5.5},{polygon_in:[[180.45284,65.60797],[179.22451,68.88491],[3.80128,3.10144],[0,.24943],[0,0],[5.50002,0]],width_in:3.5},{polygon_in:[[314.25019,0],[314.25019,3.49998],[461,3.49998],[461,0]],width_in:3.5}],confidence:"approximate"},{mark:"K03G",members:[{polygon_in:[[96.08796,72.31623],[92.7888,76.71581],[180.00041,142.125],[180.00041,135.24975]],width_in:5.5},{polygon_in:[[180.00041,136.62505],[180.00041,142.125],[316.99967,142.125],[316.99967,136.62505]],width_in:5.5},{polygon_in:[[316.99967,135.24975],[316.99967,142.125],[388.80005,88.27503],[385.49982,83.87545]],width_in:5.5},{polygon_in:[[180.45286,65.60796],[179.22452,68.8849],[258.0006,98.42515],[258.0006,94.68728]],width_in:3.5},{polygon_in:[[258.0006,136.62505],[261.50062,136.62505],[261.50062,3.49997],[258.0006,3.49997]],width_in:3.5},{polygon_in:[[254.25006,-1e-5],[254.25006,3.49997],[314.25021,3.49997],[314.25021,-1e-5]],width_in:3.5},{polygon_in:[[92.58795,69.69146],[96.08796,72.31623],[96.08796,37.70832],[92.58795,36.39645]],width_in:3.5},{polygon_in:[[180.00041,69.17563],[183.50043,70.48853],[183.50043,136.62505],[180.00041,136.62505]],width_in:3.5},{polygon_in:[[255.78494,97.5953],[258.0006,98.42515],[258.0006,100.39241],[187.33554,136.62505],[183.50043,136.62505],[183.50043,134.65882]],width_in:3.5},{polygon_in:[[311.50494,3.49997],[313.49966,3.49997],[313.49966,7.14267],[263.49533,98.42515],[261.50062,98.42515],[261.50062,94.78348]],width_in:3.5},{polygon_in:[[261.50062,100.59745],[261.50062,98.42515],[264.45621,98.42515],[313.49966,134.45378],[313.49966,136.62505],[310.54406,136.62505]],width_in:3.5},{polygon_in:[[175.75411,67.58361],[180.00041,69.17563],[180.00041,70.9272],[98.31207,73.98425],[96.08796,72.31623],[96.08796,70.5646]],width_in:3.5},{polygon_in:[[385.49982,83.87545],[388.99983,81.24965],[388.99983,3.49997],[385.49982,3.49997]],width_in:3.5},{polygon_in:[[457.49999,3.49997],[461,3.49997],[461,27.24947],[457.49999,29.87528]],width_in:3.5},{polygon_in:[[261.50062,127.81209],[261.50062,134.6874],[284.4626,117.46539],[279.83153,114.06367]],width_in:5.5},{polygon_in:[[313.49966,3.49997],[316.99967,3.49997],[316.99967,136.62505],[313.49966,136.62505]],width_in:3.5},{polygon_in:[[316.99967,6.19765],[316.99967,3.49997],[319.29988,3.49997],[385.49982,81.17668],[385.49982,83.87545],[384.09707,84.92725]],width_in:3.5},{polygon_in:[[96.08796,72.31623],[92.7888,76.71581],[0,7.12473],[0,.24942]],width_in:5.5},{polygon_in:[[385.49982,83.87545],[388.80005,88.27503],[461,34.12478],[461,27.24947]],width_in:5.5},{polygon_in:[[180.45286,65.60796],[179.22452,68.8849],[3.80128,3.10143],[0,.24942],[0,-1e-5],[5.50002,-1e-5]],width_in:3.5},{polygon_in:[[314.25021,-1e-5],[314.25021,3.49997],[461,3.49997],[461,-1e-5]],width_in:3.5},{polygon_in:[[282.75751,111.86917],[287.38755,115.27192],[313.49966,95.68727],[313.49966,88.81202]],width_in:5.5},{polygon_in:[[316.99967,86.18725],[316.99967,93.06256],[362.16363,59.19035],[358.58858,54.99589]],width_in:5.5},{polygon_in:[[361.39407,52.8923],[364.96912,57.08573],[385.49982,41.68716],[385.49982,34.81295]],width_in:5.5},{polygon_in:[[388.99983,32.18714],[388.99983,39.06245],[418.6796,16.80341],[412.62253,14.47039]],width_in:5.5},{polygon_in:[[388.99983,5.37522],[388.99983,3.49997],[393.87088,3.49997],[457.49999,28.00003],[457.49999,29.87528],[455.84778,31.11418]],width_in:3.5},{polygon_in:[[421.98406,14.32451],[415.92695,11.99259],[427.25045,3.49997],[436.41645,3.49997]],width_in:5.5},{polygon_in:[[278.25013,122.12497],[281.75011,119.50026],[281.75011,136.62505],[278.25013,136.62505]],width_in:3.5},{polygon_in:[[294.25015,124.65561],[297.75016,127.22645],[297.75016,136.62505],[294.25015,136.62505]],width_in:3.5},{polygon_in:[[294.25015,110.12496],[297.75016,107.50024],[297.75016,122.88398],[294.25015,120.31211]],width_in:3.5},{polygon_in:[[326.25023,86.12492],[329.75024,83.50015],[329.75024,125.68734],[326.25023,128.31212]],width_in:3.5},{polygon_in:[[342.25025,74.1249],[345.75026,71.50013],[345.75026,113.68733],[342.25025,116.3121]],width_in:3.5},{polygon_in:[[358.2503,62.12482],[361.75032,59.50011],[361.75032,101.68731],[358.2503,104.31202]],width_in:3.5},{polygon_in:[[374.25033,73.37222],[377.75034,77.47901],[377.75034,89.68729],[374.25033,92.312]],width_in:3.5},{polygon_in:[[374.25033,50.12481],[377.75034,47.5001],[377.75034,72.08364],[374.25033,67.97686]],width_in:3.5},{polygon_in:[[390.25038,38.12479],[393.75039,35.50008],[393.75039,77.68728],[390.25038,80.31199]],width_in:3.5},{polygon_in:[[406.2504,26.12477],[409.75042,23.5],[409.75042,65.68719],[406.2504,68.313]],width_in:3.5},{polygon_in:[[422.25046,18.1776],[425.75047,19.52541],[425.75047,53.68718],[422.25046,56.31195]],width_in:3.5},{polygon_in:[[438.25048,24.3383],[441.75049,25.68604],[441.75049,41.68716],[438.25048,44.31297]],width_in:3.5},{polygon_in:[[438.25048,3.49997],[441.75049,3.49997],[441.75049,21.93553],[438.25048,20.58772]],width_in:3.5}],confidence:"approximate"},{mark:"L01",members:[{polygon_in:[[99.91707,75.18763],[96.6173,79.58697],[180.00035,142.125],[180.00035,135.25036]],width_in:5.5},{polygon_in:[[180.00035,136.62505],[180.00035,142.125],[262.00066,142.125],[262.00066,136.62505]],width_in:5.5},{polygon_in:[[262.00066,135.25036],[262.00066,142.125],[345.38372,79.58697],[342.08393,75.18763]],width_in:5.5},{polygon_in:[[0,-25e-5],[0,.24982],[4.33308,3.49935],[180.00035,3.49935],[180.00035,-25e-5]],width_in:3.5},{polygon_in:[[96.41646,72.56266],[99.91707,75.18763],[99.91707,3.49935],[96.41646,3.49935]],width_in:3.5},{polygon_in:[[177.37642,3.49935],[180.00035,3.49935],[180.00035,5.8482],[101.34403,76.25808],[99.91707,75.18763],[99.91707,72.83884]],width_in:3.5},{polygon_in:[[180.00035,3.49935],[183.49997,3.49935],[183.49997,136.62505],[180.00035,136.62505]],width_in:3.5},{polygon_in:[[256.49167,3.49935],[258.50005,3.49935],[258.50005,7.06526],[185.50836,136.62505],[183.49997,136.62505],[183.49997,133.0592]],width_in:3.5},{polygon_in:[[258.50005,3.49935],[262.00066,3.49935],[262.00066,136.62505],[258.50005,136.62505]],width_in:3.5},{polygon_in:[[262.00066,5.8482],[262.00066,3.49935],[264.62462,3.49935],[342.08393,72.83884],[342.08393,75.18763],[340.65598,76.25808]],width_in:3.5},{polygon_in:[[342.08393,75.18763],[345.58353,72.56266],[345.58353,3.49935],[342.08393,3.49935]],width_in:3.5},{polygon_in:[[0,.24982],[0,7.12453],[96.6173,79.58697],[99.91707,75.18763]],width_in:5.5},{polygon_in:[[342.08393,75.18763],[345.38372,79.58697],[442,7.12453],[442,.24982]],width_in:5.5},{polygon_in:[[262.00066,-25e-5],[262.00066,3.49935],[437.66691,3.49935],[442,.24982],[442,-25e-5]],width_in:3.5},{polygon_in:[[180.00035,-25e-5],[180.00035,3.49935],[262.00066,3.49935],[262.00066,-25e-5]],width_in:3.5}],confidence:"approximate"},{mark:"L01G",members:[{polygon_in:[[95.2498,71.68678],[91.94978,76.0875],[179.99985,142.125],[179.99985,135.24982]],width_in:5.5},{polygon_in:[[179.99985,136.62467],[179.99985,142.125],[262.00018,142.125],[262.00018,136.62467]],width_in:5.5},{polygon_in:[[262.00018,135.24982],[262.00018,142.125],[350.05024,76.0875],[346.75021,71.68678]],width_in:5.5},{polygon_in:[[0,-29e-5],[0,.24966],[7.00018,5.5001],[179.99985,5.5001],[179.99985,-29e-5]],width_in:5.5},{polygon_in:[[179.99985,5.5001],[183.50043,5.5001],[183.50043,136.62467],[179.99985,136.62467]],width_in:3.5},{polygon_in:[[258.50061,5.5001],[262.00018,5.5001],[262.00018,136.62467],[258.50061,136.62467]],width_in:3.5},{polygon_in:[[209.00041,136.62467],[205.49983,136.62467],[205.49983,66.06243],[209.00041,53.824]],width_in:3.5},{polygon_in:[[209.00041,112.62446],[209.00041,109.12489],[233.0006,109.12489],[233.0006,112.62446]],width_in:3.5},{polygon_in:[[177.15743,5.5001],[179.99985,5.5001],[179.99985,7.7206],[96.70022,72.77538],[95.2498,71.68678],[95.2498,69.46628]],width_in:3.5},{polygon_in:[[95.2498,71.68678],[91.75021,69.06209],[91.75021,5.5001],[95.2498,5.5001]],width_in:3.5},{polygon_in:[[262.00018,7.7206],[262.00018,5.5001],[264.8436,5.5001],[346.75021,69.46628],[346.75021,71.68678],[345.29978,72.77538]],width_in:3.5},{polygon_in:[[350.24981,69.06209],[346.75021,71.68678],[346.75021,5.5001],[350.24981,5.5001]],width_in:3.5},{polygon_in:[[36.83333,27.87446],[29.49953,22.37512],[91.75021,22.37512],[91.75021,27.87446]],width_in:5.5},{polygon_in:[[95.2498,22.37512],[95.2498,27.87446],[148.50659,27.87446],[155.5491,22.37512]],width_in:5.5},{polygon_in:[[161.23593,22.37512],[154.19342,27.87446],[179.99985,27.87446],[179.99985,22.37512]],width_in:5.5},{polygon_in:[[183.50043,22.37512],[183.50043,27.87446],[212.78122,27.87446],[214.35361,22.37512]],width_in:5.5},{polygon_in:[[217.99431,22.37512],[216.4209,27.87446],[225.57909,27.87446],[224.00571,22.37512]],width_in:5.5},{polygon_in:[[227.64641,22.37512],[229.2188,27.87446],[258.50061,27.87446],[258.50061,22.37512]],width_in:5.5},{polygon_in:[[262.00018,22.37512],[262.00018,27.87446],[287.80761,27.87446],[280.76509,22.37512]],width_in:5.5},{polygon_in:[[286.45093,22.37512],[293.49345,27.87446],[346.75021,27.87446],[346.75021,22.37512]],width_in:5.5},{polygon_in:[[350.24981,22.37512],[350.24981,27.87446],[405.1667,27.87446],[412.50051,22.37512]],width_in:5.5},{polygon_in:[[244.25028,93.16203],[247.74985,105.40053],[247.74985,136.62467],[244.25028,136.62467]],width_in:3.5},{polygon_in:[[244.25028,27.87446],[247.74985,27.87446],[247.74985,92.67116],[244.25028,80.43272]],width_in:3.5},{polygon_in:[[228.25017,37.21505],[231.74974,49.45355],[231.74974,109.12489],[228.25017,109.12489]],width_in:3.5},{polygon_in:[[212.25003,42.46044],[215.75064,30.22194],[215.75064,109.12489],[212.25003,109.12489]],width_in:3.5},{polygon_in:[[196.24991,98.40637],[199.7505,86.16793],[199.7505,136.62467],[196.24991,136.62467]],width_in:3.5},{polygon_in:[[196.24991,27.87446],[199.7505,27.87446],[199.7505,73.43961],[196.24991,85.67805]],width_in:3.5},{polygon_in:[[164.24969,27.87446],[167.75027,27.87446],[167.75027,126.06241],[164.24969,123.43668]],width_in:3.5},{polygon_in:[[148.25058,32.51602],[151.75016,29.7825],[151.75016,114.06182],[148.25058,111.43712]],width_in:3.5},{polygon_in:[[132.25045,45.01149],[135.75004,42.27797],[135.75004,102.0622],[132.25045,99.43751]],width_in:3.5},{polygon_in:[[132.25045,27.87446],[135.75004,27.87446],[135.75004,37.83696],[132.25045,40.57054]],width_in:3.5},{polygon_in:[[116.25034,57.50702],[119.74992,54.77344],[119.74992,90.06265],[116.25034,87.43691]],width_in:3.5},{polygon_in:[[116.25034,27.87446],[119.74992,27.87446],[119.74992,50.33249],[116.25034,53.06601]],width_in:3.5},{polygon_in:[[100.25021,70.00249],[103.7498,67.26896],[103.7498,78.06205],[100.25021,75.43735]],width_in:3.5},{polygon_in:[[100.25021,27.87446],[103.7498,27.87446],[103.7498,62.82894],[100.25021,65.56147]],width_in:3.5},{polygon_in:[[84.2501,27.87446],[87.74968,27.87446],[87.74968,66.06243],[84.2501,63.43676]],width_in:3.5},{polygon_in:[[68.24997,27.87446],[71.74956,27.87446],[71.74956,54.06183],[68.24997,51.43714]],width_in:3.5},{polygon_in:[[52.24986,27.87446],[55.75044,27.87446],[55.75044,42.06228],[52.24986,39.43759]],width_in:3.5},{polygon_in:[[276.2505,27.87446],[279.75011,27.87446],[279.75011,121.93688],[276.2505,124.56255]],width_in:3.5},{polygon_in:[[292.25065,31.3448],[295.75022,34.07833],[295.75022,109.93726],[292.25065,112.56196]],width_in:3.5},{polygon_in:[[308.24974,43.84027],[311.75033,46.57385],[311.75033,97.93771],[308.24974,100.5624]],width_in:3.5},{polygon_in:[[308.24974,27.87446],[311.75033,27.87446],[311.75033,42.13284],[308.24974,39.39926]],width_in:3.5},{polygon_in:[[324.24986,56.3358],[327.75047,59.06932],[327.75047,85.93711],[324.24986,88.5618]],width_in:3.5},{polygon_in:[[324.24986,27.87446],[327.75047,27.87446],[327.75047,54.62831],[324.24986,51.89479]],width_in:3.5},{polygon_in:[[340.25,68.83127],[343.75058,71.56485],[343.75058,73.9375],[340.25,76.56219]],width_in:3.5},{polygon_in:[[340.25,27.87446],[343.75058,27.87446],[343.75058,67.12384],[340.25,64.39026]],width_in:3.5},{polygon_in:[[356.25011,27.87446],[359.7507,27.87446],[359.7507,61.93696],[356.25011,64.56263]],width_in:3.5},{polygon_in:[[372.25022,27.87446],[375.74982,27.87446],[375.74982,49.93734],[372.25022,52.56204]],width_in:3.5},{polygon_in:[[388.25034,27.87446],[391.74994,27.87446],[391.74994,37.93674],[388.25034,40.56242]],width_in:3.5},{polygon_in:[[0,.24966],[0,7.1249],[91.94978,76.0875],[95.2498,71.68678]],width_in:5.5},{polygon_in:[[346.75021,71.68678],[350.05024,76.0875],[442,7.1249],[442,.24966]],width_in:5.5},{polygon_in:[[262.00018,-29e-5],[262.00018,5.5001],[435.00086,5.5001],[442,.24966],[442,-29e-5]],width_in:5.5},{polygon_in:[[179.99985,-29e-5],[179.99985,5.5001],[262.00018,5.5001],[262.00018,-29e-5]],width_in:5.5},{polygon_in:[[185.32078,136.62467],[183.50043,136.62467],[183.50043,130.26048],[219.17965,5.5001],[221,5.5001],[221,11.86422]],width_in:3.5},{polygon_in:[[221,11.86422],[221,5.5001],[222.82034,5.5001],[258.50061,130.26048],[258.50061,136.62467],[256.68026,136.62467]],width_in:3.5},{polygon_in:[[236.5002,136.62467],[233.0006,136.62467],[233.0006,53.824],[236.5002,66.06243]],width_in:3.5}],confidence:"approximate"},{mark:"L02",members:[{polygon_in:[[99.91648,75.18715],[96.617,79.58781],[179.99959,142.125],[179.99959,135.25048]],width_in:5.5},{polygon_in:[[179.99959,136.62523],[179.99959,142.125],[262.0004,142.125],[262.0004,136.62523]],width_in:5.5},{polygon_in:[[262.0004,135.25048],[262.0004,142.125],[345.38299,79.58781],[342.08352,75.18715]],width_in:5.5},{polygon_in:[[262.0004,8e-5],[262.0004,3.50017],[437.66618,3.50017],[442,.25031],[442,8e-5]],width_in:3.5},{polygon_in:[[96.41641,72.56235],[99.91648,75.18715],[99.91648,3.50017],[96.41641,3.50017]],width_in:3.5},{polygon_in:[[177.37581,3.50017],[179.99959,3.50017],[179.99959,5.84839],[101.34387,76.25794],[99.91648,75.18715],[99.91648,72.83892]],width_in:3.5},{polygon_in:[[179.99959,3.50017],[183.49967,3.50017],[183.49967,136.62523],[179.99959,136.62523]],width_in:3.5},{polygon_in:[[256.49145,3.50017],[258.50032,3.50017],[258.50032,7.06505],[185.50851,136.62523],[183.49967,136.62523],[183.49967,133.0593]],width_in:3.5},{polygon_in:[[258.50032,3.50017],[262.0004,3.50017],[262.0004,136.62523],[258.50032,136.62523]],width_in:3.5},{polygon_in:[[262.0004,5.84839],[262.0004,3.50017],[264.62418,3.50017],[342.08352,72.83892],[342.08352,75.18715],[340.65512,76.25794]],width_in:3.5},{polygon_in:[[342.08352,75.18715],[345.58357,72.56235],[345.58357,3.50017],[342.08352,3.50017]],width_in:3.5},{polygon_in:[[99.91648,75.18715],[96.617,79.58781],[0,7.12484],[0,.25031]],width_in:5.5},{polygon_in:[[342.08352,75.18715],[345.38299,79.58781],[469.29949,-13.34978],[465.99999,-17.74945]],width_in:5.5},{polygon_in:[[262.0004,8e-5],[262.0004,3.50017],[179.99959,3.50017],[179.99959,8e-5]],width_in:3.5},{polygon_in:[[179.99959,8e-5],[179.99959,3.50017],[4.3338,3.50017],[0,.25031],[0,8e-5]],width_in:3.5}],confidence:"approximate"},{mark:"PB01",members:[{polygon_in:[[6.16659,-1.24998],[.66663,-1.24998],[.66663,-1.00003],[41,29.25],[41,24.87496]],width_in:3.5},{polygon_in:[[41,24.87496],[41,29.25],[81.33337,-1.00003],[81.33337,-1.24998],[75.83317,-1.24998]],width_in:3.5},{polygon_in:[[8.1667,3e-5],[8.1667,.24999],[12.49989,3.50011],[69.49987,3.50011],[73.8333,.24999],[73.8333,3e-5]],width_in:3.5},{polygon_in:[[39.24984,3.50011],[42.74992,3.50011],[42.74992,23.56251],[41,24.87496],[39.24984,23.56251]],width_in:3.5},{polygon_in:[[23.24986,3.50011],[26.74995,3.50011],[26.74995,14.18742],[23.24986,11.56252]],width_in:3.5},{polygon_in:[[55.25005,3.50011],[58.7499,3.50011],[58.7499,11.56252],[55.25005,14.18742]],width_in:3.5}],confidence:"approximate"},{mark:"PB02",members:[{polygon_in:[[6.16678,-1.24978],[.66655,-1.24978],[.66655,-.9999],[41,29.25],[41,24.87514]],width_in:3.5},{polygon_in:[[41,24.87514],[41,29.25],[81.3332,-.9999],[81.3332,-1.24978],[75.83322,-1.24978]],width_in:3.5},{polygon_in:[[8.16668,6e-5],[8.16668,.25015],[12.49989,3.50013],[69.49986,3.50013],[73.83331,.25015],[73.83331,6e-5]],width_in:3.5},{polygon_in:[[39.24996,3.50013],[42.75004,3.50013],[42.75004,23.56262],[41,24.87514],[39.24996,23.56262]],width_in:3.5}],confidence:"approximate"},{mark:"PB03",members:[{polygon_in:[[6.16676,-1.25013],[.6666,-1.25013],[.6666,-1.00015],[33.5,23.625],[33.5,19.24996]],width_in:3.5},{polygon_in:[[33.5,19.24996],[33.5,23.625],[66.33339,-1.00015],[66.33339,-1.25013],[60.83346,-1.25013]],width_in:3.5},{polygon_in:[[8.16658,-3e-5],[8.16658,.24995],[12.49995,3.49987],[54.50004,3.49987],[58.83342,.24995],[58.83342,-3e-5]],width_in:3.5},{polygon_in:[[31.75016,3.49987],[35.25006,3.49987],[35.25006,17.93736],[33.5,19.24996],[31.75016,17.93736]],width_in:3.5},{polygon_in:[[15.75009,3.49987],[19.24999,3.49987],[19.24999,8.56235],[15.75009,5.93736]],width_in:3.5},{polygon_in:[[47.75001,3.49987],[51.25012,3.49987],[51.25012,5.93736],[47.75001,8.56235]],width_in:3.5}],confidence:"approximate"},{mark:"PB04",members:[{polygon_in:[[6.16675,-1.24999],[.66667,-1.24999],[.66667,-.99995],[33.5,23.625],[33.5,19.25004]],width_in:3.5},{polygon_in:[[33.5,19.25004],[33.5,23.625],[66.33334,-.99995],[66.33334,-1.24999],[60.83324,-1.24999]],width_in:3.5},{polygon_in:[[8.16675,5e-5],[8.16675,.24989],[12.50007,3.49993],[54.49993,3.49993],[58.83325,.24989],[58.83325,5e-5]],width_in:3.5},{polygon_in:[[31.75006,3.49993],[35.24994,3.49993],[35.24994,17.93753],[33.5,19.25004],[31.75006,17.93732]],width_in:3.5}],confidence:"approximate"},{mark:"PB05",members:[{polygon_in:[[6.16661,-1.25024],[.66652,-1.25024],[.66652,-1.00001],[68.5,49.875],[68.5,45.49999]],width_in:3.5},{polygon_in:[[68.5,45.49999],[68.5,49.875],[136.33347,-1.00001],[136.33347,-1.25024],[130.83338,-1.25024]],width_in:3.5},{polygon_in:[[8.16655,-23e-5],[8.16655,.24998],[12.50004,3.49992],[124.49996,3.49992],[128.83346,.24998],[128.83346,-23e-5]],width_in:3.5},{polygon_in:[[66.74992,3.49992],[70.25008,3.49992],[70.25008,44.18733],[68.5,45.49999],[66.74992,44.18733]],width_in:3.5},{polygon_in:[[50.75009,3.49992],[54.24988,3.49992],[54.24988,34.81231],[50.75009,32.18737]],width_in:3.5},{polygon_in:[[34.74989,3.49992],[38.25005,3.49992],[38.25005,22.81233],[34.74989,20.18741]],width_in:3.5},{polygon_in:[[18.75006,3.49992],[22.24985,3.49992],[22.24985,10.81237],[18.75006,8.18743]],width_in:3.5},{polygon_in:[[82.75012,3.49992],[86.24991,3.49992],[86.24991,32.18737],[82.75012,34.81231]],width_in:3.5},{polygon_in:[[98.74994,3.49992],[102.25011,3.49992],[102.25011,20.18741],[98.74994,22.81233]],width_in:3.5},{polygon_in:[[114.74977,3.49992],[118.24994,3.49992],[118.24994,8.18743],[114.74977,10.81237]],width_in:3.5}],confidence:"approximate"},{mark:"PB06",members:[{polygon_in:[[6.16666,-1.25002],[.66652,-1.25002],[.66652,-.99997],[68.50018,49.875],[68.50018,45.50004]],width_in:3.5},{polygon_in:[[68.50018,45.50004],[68.50018,49.875],[136.33347,-.99997],[136.33347,-1.25002],[130.83334,-1.25002]],width_in:3.5},{polygon_in:[[8.16661,-18e-5],[8.16661,.24985],[12.50014,3.49999],[124.49986,3.49999],[128.83338,.24985],[128.83338,-18e-5]],width_in:3.5},{polygon_in:[[66.74991,3.49999],[70.2501,3.49999],[70.2501,44.18733],[68.50018,45.50004],[66.74991,44.18733]],width_in:3.5}],confidence:"approximate"},{mark:"PB07",members:[{polygon_in:[[6.1668,-1.25008],[.66679,-1.25008],[.66679,-.99987],[58.99983,42.75],[58.99983,38.37512]],width_in:3.5},{polygon_in:[[58.99983,38.37512],[58.99983,42.75],[117.33321,-.99987],[117.33321,-1.25008],[111.8332,-1.25008]],width_in:3.5},{polygon_in:[[8.1665,-1e-5],[8.1665,.25021],[12.49997,3.49996],[105.50004,3.49996],[109.83317,.25021],[109.83317,-1e-5]],width_in:3.5},{polygon_in:[[57.25001,3.49996],[60.74999,3.49996],[60.74999,37.06242],[58.99983,38.37512],[57.25001,37.06242]],width_in:3.5}],confidence:"approximate"},{mark:"PB08",members:[{polygon_in:[[6.16653,-1.25004],[.66677,-1.25004],[.66677,-.99995],[59.00017,42.75],[59.00017,38.37477]],width_in:3.5},{polygon_in:[[59.00017,38.37477],[59.00017,42.75],[117.33356,-.99995],[117.33356,-1.25004],[111.83348,-1.25004]],width_in:3.5},{polygon_in:[[8.16683,3e-5],[8.16683,.24977],[12.49999,3.49981],[105.50001,3.49981],[109.83351,.24977],[109.83351,3e-5]],width_in:3.5},{polygon_in:[[57.24994,3.49981],[60.75006,3.49981],[60.75006,37.06228],[59.00017,38.37477],[57.24994,37.06228]],width_in:3.5},{polygon_in:[[41.25017,3.49981],[44.74995,3.49981],[44.74995,27.68745],[41.25017,25.06245]],width_in:3.5},{polygon_in:[[25.25006,3.49981],[28.75018,3.49981],[28.75018,15.68729],[25.25006,13.06229]],width_in:3.5},{polygon_in:[[73.25005,3.49981],[76.75017,3.49981],[76.75017,25.06245],[73.25005,27.68745]],width_in:3.5},{polygon_in:[[89.25016,3.49981],[92.74994,3.49981],[92.74994,13.06229],[89.25016,15.68729]],width_in:3.5}],confidence:"approximate"}],trusses:[{mark:"9V04",type:"Valley",quantity:2,plies:1,profile_width_in:48,profile_height_in:18,top_chord_pitch_over_12:9},{mark:"9V08",type:"Valley",quantity:3,plies:1,profile_width_in:96,profile_height_in:36,top_chord_pitch_over_12:9},{mark:"9V12",type:"Valley",quantity:3,plies:1,profile_width_in:144,profile_height_in:54,top_chord_pitch_over_12:9},{mark:"9V16",type:"Valley",quantity:3,plies:1,profile_width_in:192,profile_height_in:72,top_chord_pitch_over_12:9},{mark:"9V20",type:"Valley",quantity:3,plies:1,profile_width_in:240,profile_height_in:90,top_chord_pitch_over_12:9},{mark:"9V24",type:"Valley",quantity:1,plies:1,profile_width_in:288,profile_height_in:108,top_chord_pitch_over_12:9},{mark:"9V28",type:"Valley",quantity:1,plies:1,profile_width_in:336,profile_height_in:126,top_chord_pitch_over_12:9},{mark:"9V32",type:"Valley",quantity:1,plies:1,profile_width_in:384,profile_height_in:144,top_chord_pitch_over_12:9},{mark:"9V36",type:"Valley",quantity:1,plies:1,profile_width_in:432,profile_height_in:162,top_chord_pitch_over_12:9},{mark:"A01",type:"Common",quantity:10,plies:1,profile_width_in:307,profile_height_in:122.25,top_chord_pitch_over_12:9},{mark:"A01G",type:"GABLE",quantity:1,plies:1,profile_width_in:307,profile_height_in:122.25,top_chord_pitch_over_12:9},{mark:"B01",type:"Piggyback Base",quantity:4,plies:1,profile_width_in:478,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"B01G",type:"GABLE l Gable l Gable COMMON l l Gable l",quantity:1,plies:1,profile_width_in:478,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"B02",type:"PIGGYBACK BASE GIRDE",quantity:1,plies:4,profile_width_in:478,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"C01",type:"Common",quantity:1,plies:1,profile_width_in:294,profile_height_in:117.375,top_chord_pitch_over_12:9},{mark:"C01G",type:"GABLE",quantity:1,plies:1,profile_width_in:294,profile_height_in:117.375,top_chord_pitch_over_12:9},{mark:"C02",type:"Common Girder",quantity:1,plies:3,profile_width_in:294,profile_height_in:117.375,top_chord_pitch_over_12:9},{mark:"D01",type:"Common",quantity:6,plies:1,profile_width_in:150,profile_height_in:63.375,top_chord_pitch_over_12:9},{mark:"D01G",type:"GABLE",quantity:1,plies:1,profile_width_in:150,profile_height_in:63.375,top_chord_pitch_over_12:9},{mark:"E01",type:"Common",quantity:5,plies:1,profile_width_in:280,profile_height_in:112.125,top_chord_pitch_over_12:9},{mark:"E01G",type:"GABLE",quantity:1,plies:1,profile_width_in:280,profile_height_in:112.125,top_chord_pitch_over_12:9},{mark:"E02",type:"Common Girder",quantity:1,plies:3,profile_width_in:280,profile_height_in:112.125,top_chord_pitch_over_12:9},{mark:"G01",type:"Monopitch",quantity:1,plies:1,profile_width_in:185.5,profile_height_in:53.3125,top_chord_pitch_over_12:3},{mark:"G02",type:"Monopitch",quantity:2,plies:1,profile_width_in:185.5,profile_height_in:59,top_chord_pitch_over_12:3},{mark:"G03",type:"Monopitch",quantity:8,plies:1,profile_width_in:149.5,profile_height_in:59,top_chord_pitch_over_12:3},{mark:"G04",type:"Monopitch",quantity:1,plies:1,profile_width_in:149.5,profile_height_in:56.5625,top_chord_pitch_over_12:3},{mark:"G05",type:"Monopitch",quantity:1,plies:1,profile_width_in:149.5,profile_height_in:50.5625,top_chord_pitch_over_12:3},{mark:"G06",type:"Monopitch",quantity:1,plies:1,profile_width_in:149.5,profile_height_in:44.5625,top_chord_pitch_over_12:3},{mark:"G07",type:"Monopitch",quantity:3,plies:1,profile_width_in:94,profile_height_in:29.4375,top_chord_pitch_over_12:3},{mark:"G08",type:"Monopitch",quantity:2,plies:1,profile_width_in:77,profile_height_in:25.1875,top_chord_pitch_over_12:3},{mark:"H01",type:"Piggyback Base",quantity:7,plies:1,profile_width_in:427,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"H01G",type:"GABLE",quantity:1,plies:1,profile_width_in:427,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"H02",type:"Piggyback Base",quantity:4,plies:1,profile_width_in:427,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"J02",type:"JACK-OPEN",quantity:30,plies:1,profile_width_in:24,profile_height_in:25.125,top_chord_pitch_over_12:9},{mark:"JH02",type:"Diagonal Hip Girder",quantity:2,plies:1,profile_width_in:33.1875,profile_height_in:24.75,top_chord_pitch_over_12:6.36},{mark:"JH12",type:"ROOF SPECIAL GIRDER",quantity:1,plies:2,profile_width_in:208.4375,profile_height_in:42.75,top_chord_pitch_over_12:2.12},{mark:"JH15",type:"ROOF SPECIAL GIRDER",quantity:1,plies:2,profile_width_in:259.3125,profile_height_in:51.75,top_chord_pitch_over_12:2.12},{mark:"JK02",type:"JACK-OPEN",quantity:4,plies:1,profile_width_in:23.6875,profile_height_in:11.8125,top_chord_pitch_over_12:3},{mark:"JK04",type:"Jack-Open",quantity:4,plies:1,profile_width_in:47.6875,profile_height_in:17.8125,top_chord_pitch_over_12:3},{mark:"JK06",type:"Jack-Open",quantity:4,plies:1,profile_width_in:71.6875,profile_height_in:23.8125,top_chord_pitch_over_12:3},{mark:"JK08",type:"Jack-Open",quantity:4,plies:1,profile_width_in:95.6875,profile_height_in:29.8125,top_chord_pitch_over_12:3},{mark:"JK10",type:"Jack-Open",quantity:4,plies:1,profile_width_in:119.6875,profile_height_in:35.8125,top_chord_pitch_over_12:3},{mark:"JK12",type:"Jack-Open",quantity:3,plies:1,profile_width_in:143.6875,profile_height_in:41.8125,top_chord_pitch_over_12:3},{mark:"JK14",type:"Jack-Open",quantity:2,plies:1,profile_width_in:167.6875,profile_height_in:47.8125,top_chord_pitch_over_12:3},{mark:"K01",type:"Piggyback Base",quantity:13,plies:1,profile_width_in:497,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"K01G",type:"GABLE l Gable l Gable COMMON l l Gable l",quantity:1,plies:1,profile_width_in:497,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"K02",type:"Piggyback Base",quantity:1,plies:1,profile_width_in:461,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"K03",type:"Piggyback Base",quantity:6,plies:1,profile_width_in:461,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"K03G",type:"GABLE l Gable l Gable COMMON l l Gable l",quantity:1,plies:1,profile_width_in:461,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"L01",type:"Piggyback Base",quantity:15,plies:1,profile_width_in:442,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"L01G",type:"GABLE",quantity:1,plies:2,profile_width_in:442,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"L02",type:"Piggyback Base",quantity:6,plies:1,profile_width_in:442,profile_height_in:142.125,top_chord_pitch_over_12:9},{mark:"PB01",type:"GABLE",quantity:1,plies:2,profile_width_in:82,profile_height_in:29.25,top_chord_pitch_over_12:9},{mark:"PB02",type:"Piggyback",quantity:21,plies:1,profile_width_in:82,profile_height_in:29.25,top_chord_pitch_over_12:9},{mark:"PB03",type:"GABLE",quantity:1,plies:1,profile_width_in:67,profile_height_in:23.625,top_chord_pitch_over_12:9},{mark:"PB04",type:"Piggyback",quantity:11,plies:1,profile_width_in:67,profile_height_in:23.625,top_chord_pitch_over_12:9},{mark:"PB05",type:"GABLE",quantity:2,plies:1,profile_width_in:137,profile_height_in:49.875,top_chord_pitch_over_12:9},{mark:"PB06",type:"Piggyback",quantity:20,plies:1,profile_width_in:137,profile_height_in:49.875,top_chord_pitch_over_12:9},{mark:"PB07",type:"Piggyback",quantity:5,plies:1,profile_width_in:118,profile_height_in:42.75,top_chord_pitch_over_12:9},{mark:"PB08",type:"GABLE",quantity:1,plies:1,profile_width_in:118,profile_height_in:42.75,top_chord_pitch_over_12:9}],electrical_devices:[{id:"electrical-001",kind:"recessed",at:[252,40.5],confidence:"derived",height_in:120},{id:"electrical-002",kind:"recessed",at:[336.5,48],confidence:"derived",height_in:120},{id:"electrical-003",kind:"recessed",at:[420.5,48],confidence:"derived",height_in:120},{id:"electrical-004",kind:"recessed",at:[336.5,155],confidence:"derived",height_in:120},{id:"electrical-005",kind:"recessed",at:[420.5,155],confidence:"derived",height_in:120},{id:"electrical-006",kind:"recessed",at:[250,89],confidence:"derived",height_in:120},{id:"electrical-007",kind:"recessed",at:[250,137],confidence:"derived",height_in:120},{id:"electrical-008",kind:"recessed",at:[250,176.5],confidence:"derived",height_in:120},{id:"electrical-009",kind:"recessed",at:[198,198],confidence:"derived",height_in:120},{id:"electrical-010",kind:"recessed",at:[395,220.5],confidence:"derived",height_in:120},{id:"electrical-011",kind:"recessed",at:[392,250.5],confidence:"derived",height_in:120},{id:"electrical-012",kind:"recessed",at:[451.5,219.5],confidence:"derived",height_in:120},{id:"electrical-013",kind:"recessed",at:[451.5,284],confidence:"derived",height_in:120},{id:"electrical-014",kind:"recessed",at:[451.5,337.5],confidence:"derived",height_in:120},{id:"electrical-015",kind:"recessed",at:[384.5,313],confidence:"derived",height_in:120},{id:"electrical-016",kind:"recessed",at:[393,358],confidence:"derived",height_in:120},{id:"electrical-017",kind:"recessed",at:[503.5,244],confidence:"derived",height_in:120},{id:"electrical-018",kind:"recessed",at:[587,244],confidence:"derived",height_in:120},{id:"electrical-019",kind:"recessed",at:[663.5,244],confidence:"derived",height_in:120},{id:"electrical-020",kind:"recessed",at:[743.5,244],confidence:"derived",height_in:120},{id:"electrical-021",kind:"recessed",at:[827.5,244],confidence:"derived",height_in:120},{id:"electrical-022",kind:"recessed",at:[905.5,249.5],confidence:"derived",height_in:120},{id:"electrical-023",kind:"recessed",at:[989.5,249.5],confidence:"derived",height_in:120},{id:"electrical-024",kind:"recessed",at:[501.5,308.5],confidence:"derived",height_in:120},{id:"electrical-025",kind:"recessed",at:[587,308.5],confidence:"derived",height_in:120},{id:"electrical-026",kind:"recessed",at:[663.5,313],confidence:"derived",height_in:120},{id:"electrical-027",kind:"recessed",at:[745.5,308.5],confidence:"derived",height_in:120},{id:"electrical-028",kind:"recessed",at:[827.5,308.5],confidence:"derived",height_in:120},{id:"electrical-029",kind:"recessed",at:[905.5,313],confidence:"derived",height_in:120},{id:"electrical-030",kind:"recessed",at:[989.5,315],confidence:"derived",height_in:120},{id:"electrical-031",kind:"recessed",at:[332.5,416],confidence:"derived",height_in:120},{id:"electrical-032",kind:"recessed",at:[383.5,416],confidence:"derived",height_in:120},{id:"electrical-033",kind:"recessed",at:[451.5,405.5],confidence:"derived",height_in:120},{id:"electrical-034",kind:"recessed",at:[528,405.5],confidence:"derived",height_in:120},{id:"electrical-035",kind:"recessed",at:[593.5,416],confidence:"derived",height_in:120},{id:"electrical-036",kind:"recessed",at:[678.5,416],confidence:"derived",height_in:120},{id:"electrical-037",kind:"recessed",at:[593.5,465],confidence:"derived",height_in:120},{id:"electrical-038",kind:"recessed",at:[682,468.5],confidence:"derived",height_in:120},{id:"electrical-039",kind:"recessed",at:[593.5,522],confidence:"derived",height_in:120},{id:"electrical-040",kind:"recessed",at:[678.5,522],confidence:"derived",height_in:120},{id:"electrical-041",kind:"recessed",at:[733.5,414],confidence:"derived",height_in:120},{id:"electrical-042",kind:"recessed",at:[818.5,416],confidence:"derived",height_in:120},{id:"electrical-043",kind:"recessed",at:[897,419],confidence:"derived",height_in:120},{id:"electrical-044",kind:"recessed",at:[980.5,420.5],confidence:"derived",height_in:120},{id:"electrical-045",kind:"recessed",at:[733.5,519.5],confidence:"derived",height_in:120},{id:"electrical-046",kind:"recessed",at:[814.5,523],confidence:"derived",height_in:120},{id:"electrical-047",kind:"recessed",at:[896,525],confidence:"derived",height_in:120},{id:"electrical-048",kind:"recessed",at:[980.5,526],confidence:"derived",height_in:120},{id:"electrical-049",kind:"recessed",at:[500.5,486.5],confidence:"derived",height_in:120},{id:"electrical-050",kind:"recessed",at:[500.5,523],confidence:"derived",height_in:120},{id:"electrical-051",kind:"recessed",at:[499.5,561.5],confidence:"derived",height_in:120},{id:"electrical-052",kind:"recessed",at:[499.5,601],confidence:"derived",height_in:120},{id:"electrical-053",kind:"recessed",at:[499.5,639.5],confidence:"derived",height_in:120},{id:"electrical-054",kind:"recessed",at:[499.5,685.5],confidence:"derived",height_in:120},{id:"electrical-055",kind:"recessed",at:[334.5,585],confidence:"derived",height_in:120},{id:"electrical-056",kind:"recessed",at:[412,590.5],confidence:"derived",height_in:120},{id:"electrical-057",kind:"recessed",at:[332.5,658.5],confidence:"derived",height_in:120},{id:"electrical-058",kind:"recessed",at:[409,664],confidence:"derived",height_in:120},{id:"electrical-059",kind:"recessed",at:[623.5,622.5],confidence:"derived",height_in:120},{id:"electrical-060",kind:"recessed",at:[700,626.5],confidence:"derived",height_in:120},{id:"electrical-061",kind:"recessed",at:[620.5,696],confidence:"derived",height_in:120},{id:"electrical-062",kind:"recessed",at:[697,700.5],confidence:"derived",height_in:120},{id:"electrical-063",kind:"recessed",at:[619.5,777.5],confidence:"derived",height_in:120},{id:"electrical-064",kind:"recessed",at:[696,781.5],confidence:"derived",height_in:120},{id:"electrical-065",kind:"recessed",at:[843.5,590.5],confidence:"derived",height_in:120},{id:"electrical-066",kind:"recessed",at:[870.5,624.5],confidence:"derived",height_in:120},{id:"electrical-067",kind:"recessed",at:[916.5,632],confidence:"derived",height_in:120},{id:"electrical-068",kind:"recessed",at:[952,632],confidence:"derived",height_in:120},{id:"electrical-069",kind:"recessed",at:[1071,504.5],confidence:"derived",height_in:120},{id:"electrical-070",kind:"recessed",at:[1071,557],confidence:"derived",height_in:120},{id:"electrical-071",kind:"recessed",at:[1070,617],confidence:"derived",height_in:120},{id:"electrical-072",kind:"recessed",at:[1055,707],confidence:"derived",height_in:120},{id:"electrical-073",kind:"recessed",at:[1157.5,359],confidence:"derived",height_in:120},{id:"electrical-074",kind:"recessed",at:[1241.5,359],confidence:"derived",height_in:120},{id:"electrical-075",kind:"recessed",at:[1157.5,465],confidence:"derived",height_in:120},{id:"electrical-076",kind:"recessed",at:[1241.5,465],confidence:"derived",height_in:120},{id:"electrical-077",kind:"recessed",at:[1078.5,328],confidence:"derived",height_in:120},{id:"electrical-078",kind:"recessed",at:[1067,397],confidence:"derived",height_in:120},{id:"electrical-079",kind:"recessed",at:[1062.5,250.5],confidence:"derived",height_in:120},{id:"electrical-080",kind:"recessed",at:[1125.5,249.5],confidence:"derived",height_in:120},{id:"electrical-081",kind:"recessed",at:[1101,284],confidence:"derived",height_in:120},{id:"electrical-082",kind:"recessed",at:[1238.5,95.5],confidence:"derived",height_in:120},{id:"electrical-083",kind:"recessed",at:[1273.5,95.5],confidence:"derived",height_in:120},{id:"electrical-084",kind:"recessed",at:[1195,149],confidence:"derived",height_in:120},{id:"electrical-085",kind:"recessed",at:[1254.5,149],confidence:"derived",height_in:120},{id:"electrical-086",kind:"recessed",at:[1255.5,196],confidence:"derived",height_in:120},{id:"electrical-087",kind:"recessed",at:[1255.5,237.5],confidence:"derived",height_in:120},{id:"electrical-088",kind:"recessed",at:[1256.5,277.5],confidence:"derived",height_in:120},{id:"electrical-089",kind:"recessed",at:[1183,254],confidence:"derived",height_in:120},{id:"electrical-090",kind:"recessed",at:[1171.5,574],confidence:"derived",height_in:120},{id:"electrical-091",kind:"recessed",at:[1216,574],confidence:"derived",height_in:120},{id:"electrical-092",kind:"recessed",at:[1266.5,557],confidence:"derived",height_in:120},{id:"electrical-093",kind:"recessed",at:[1161.5,626.5],confidence:"derived",height_in:120},{id:"electrical-094",kind:"recessed",at:[1246,627.5],confidence:"derived",height_in:120},{id:"electrical-095",kind:"recessed",at:[1161.5,732.5],confidence:"derived",height_in:120},{id:"electrical-096",kind:"recessed",at:[1246,733.5],confidence:"derived",height_in:120},{id:"electrical-097",kind:"recessed",at:[928,849],confidence:"derived",height_in:120},{id:"electrical-098",kind:"recessed",at:[1006.5,854.5],confidence:"derived",height_in:120},{id:"electrical-099",kind:"recessed",at:[1090.5,854.5],confidence:"derived",height_in:120},{id:"electrical-100",kind:"recessed",at:[509,916.5],confidence:"derived",height_in:120},{id:"electrical-101",kind:"recessed",at:[592.5,920.5],confidence:"derived",height_in:120},{id:"electrical-102",kind:"recessed",at:[670,925],confidence:"derived",height_in:120},{id:"electrical-103",kind:"recessed",at:[755,926],confidence:"derived",height_in:120},{id:"electrical-104",kind:"recessed",at:[845.5,921.5],confidence:"derived",height_in:120},{id:"electrical-105",kind:"recessed",at:[931.5,925],confidence:"derived",height_in:120},{id:"electrical-106",kind:"recessed",at:[1009.5,928],confidence:"derived",height_in:120},{id:"electrical-107",kind:"recessed",at:[1092.5,929],confidence:"derived",height_in:120},{id:"electrical-108",kind:"fan",at:[374,105],confidence:"derived",height_in:112},{id:"electrical-109",kind:"fan",at:[372.5,621.5],confidence:"derived",height_in:112},{id:"electrical-110",kind:"fan",at:[925,469.5],confidence:"derived",height_in:112},{id:"electrical-111",kind:"fan",at:[1199,418],confidence:"derived",height_in:112},{id:"electrical-112",kind:"fan",at:[934.5,731.5],confidence:"derived",height_in:112},{id:"electrical-113",kind:"fan",at:[1198,683.5],confidence:"derived",height_in:112},{id:"electrical-114",kind:"linear-light",at:[91.5,317],confidence:"derived",height_in:117},{id:"electrical-115",kind:"linear-light",at:[190.5,317],confidence:"derived",height_in:117},{id:"electrical-116",kind:"linear-light",at:[307,317],confidence:"derived",height_in:117},{id:"electrical-117",kind:"linear-light",at:[150.5,476],confidence:"derived",height_in:117},{id:"electrical-118",kind:"linear-light",at:[150.5,616],confidence:"derived",height_in:117},{id:"electrical-119",kind:"linear-light",at:[154,729.5],confidence:"derived",height_in:117},{id:"electrical-120",kind:"linear-light",at:[348,502.5],confidence:"derived",height_in:117},{id:"electrical-121",kind:"pendant",at:[641,470.5],confidence:"derived",height_in:96},{id:"electrical-122",kind:"pendant",at:[641,506],confidence:"derived",height_in:96},{id:"electrical-123",kind:"pendant",at:[662.5,664],confidence:"derived",height_in:96},{id:"electrical-124",kind:"pendant",at:[790.5,781.5],confidence:"derived",height_in:96},{id:"electrical-125",kind:"exhaust",at:[229.5,155],confidence:"derived",height_in:118},{id:"electrical-126",kind:"exhaust",at:[204.5,297],confidence:"derived",height_in:118},{id:"electrical-127",kind:"exhaust",at:[294,337.5],confidence:"derived",height_in:118},{id:"electrical-128",kind:"exhaust",at:[414,359],confidence:"derived",height_in:118},{id:"electrical-129",kind:"exhaust",at:[839,615],confidence:"derived",height_in:118},{id:"electrical-130",kind:"exhaust",at:[1231,197],confidence:"derived",height_in:118},{id:"electrical-131",kind:"exhaust",at:[1191.5,278.5],confidence:"derived",height_in:118},{id:"electrical-132",kind:"smoke-CO",at:[381,186.5],confidence:"derived",height_in:116},{id:"electrical-133",kind:"smoke-CO",at:[434.5,222.5],confidence:"derived",height_in:116},{id:"electrical-134",kind:"smoke-CO",at:[410,450],confidence:"derived",height_in:116},{id:"electrical-135",kind:"smoke-CO",at:[1049.5,600],confidence:"derived",height_in:116},{id:"electrical-136",kind:"smoke-CO",at:[1109.5,650],confidence:"derived",height_in:116},{id:"electrical-137",kind:"smoke-CO",at:[1109.5,440.5],confidence:"derived",height_in:116},{id:"electrical-138",kind:"smoke-CO",at:[1041,496],confidence:"derived",height_in:116},{id:"electrical-139",kind:"smoke-CO",at:[1281,111.5],confidence:"derived",height_in:116},{id:"electrical-140",kind:"receptacle",at:[313,13],confidence:"derived",height_in:18},{id:"electrical-141",kind:"receptacle",at:[431,13],confidence:"derived",height_in:18},{id:"electrical-142",kind:"receptacle",at:[293,43],confidence:"derived",height_in:18},{id:"electrical-143",kind:"receptacle",at:[293,140],confidence:"derived",height_in:18},{id:"electrical-144",kind:"receptacle",at:[466.5,152],confidence:"derived",height_in:18},{id:"electrical-145",kind:"receptacle",at:[346,185],confidence:"derived",height_in:18},{id:"electrical-146",kind:"receptacle",at:[68,255],confidence:"derived",height_in:18},{id:"electrical-147",kind:"receptacle",at:[253,256],confidence:"derived",height_in:18},{id:"electrical-148",kind:"receptacle",at:[283,256],confidence:"derived",height_in:18},{id:"electrical-149",kind:"receptacle",at:[310,256],confidence:"derived",height_in:18},{id:"electrical-150",kind:"receptacle",at:[343,256],confidence:"derived",height_in:18},{id:"electrical-151",kind:"receptacle",at:[13,289.5],confidence:"derived",height_in:18},{id:"electrical-152",kind:"receptacle",at:[26,374],confidence:"derived",height_in:18},{id:"electrical-153",kind:"receptacle",at:[94.5,374],confidence:"derived",height_in:18},{id:"electrical-154",kind:"receptacle",at:[182,374],confidence:"derived",height_in:18},{id:"electrical-155",kind:"receptacle",at:[200,374],confidence:"derived",height_in:18},{id:"electrical-156",kind:"receptacle",at:[251,374],confidence:"derived",height_in:18},{id:"electrical-157",kind:"receptacle",at:[286.5,374],confidence:"derived",height_in:18},{id:"electrical-158",kind:"receptacle",at:[314,374],confidence:"derived",height_in:18},{id:"electrical-159",kind:"receptacle",at:[353.5,319.5],confidence:"derived",height_in:18},{id:"electrical-160",kind:"receptacle",at:[59,391.5],confidence:"derived",height_in:18},{id:"electrical-161",kind:"receptacle",at:[234.5,392.5],confidence:"derived",height_in:18},{id:"electrical-162",kind:"receptacle",at:[12,438.5],confidence:"derived",height_in:18},{id:"electrical-163",kind:"receptacle",at:[13,607.5],confidence:"derived",height_in:18},{id:"electrical-164",kind:"receptacle",at:[13,825.5],confidence:"derived",height_in:18},{id:"electrical-165",kind:"receptacle",at:[221.5,836],confidence:"derived",height_in:18},{id:"electrical-166",kind:"receptacle",at:[283,791.5],confidence:"derived",height_in:18},{id:"electrical-167",kind:"receptacle",at:[283,658.5],confidence:"derived",height_in:18},{id:"electrical-168",kind:"receptacle",at:[283,500.5],confidence:"derived",height_in:18},{id:"electrical-169",kind:"receptacle",at:[301.5,574],confidence:"derived",height_in:18},{id:"electrical-170",kind:"receptacle",at:[301.5,669.5],confidence:"derived",height_in:18},{id:"electrical-171",kind:"receptacle",at:[336.5,701.5],confidence:"derived",height_in:18},{id:"electrical-172",kind:"receptacle",at:[421.5,701.5],confidence:"derived",height_in:18},{id:"electrical-173",kind:"receptacle",at:[444,622.5],confidence:"derived",height_in:18},{id:"electrical-174",kind:"receptacle",at:[364,553],confidence:"derived",height_in:18},{id:"electrical-175",kind:"receptacle",at:[460,678],confidence:"derived",height_in:18},{id:"electrical-176",kind:"receptacle",at:[460,638.5],confidence:"derived",height_in:18},{id:"electrical-177",kind:"receptacle",at:[460,600],confidence:"derived",height_in:18},{id:"electrical-178",kind:"receptacle",at:[461,562.5],confidence:"derived",height_in:18},{id:"electrical-179",kind:"receptacle",at:[461,525],confidence:"derived",height_in:18},{id:"electrical-180",kind:"receptacle",at:[539.5,598],confidence:"derived",height_in:18},{id:"electrical-181",kind:"receptacle",at:[539.5,648],confidence:"derived",height_in:18},{id:"electrical-182",kind:"receptacle",at:[539.5,694],confidence:"derived",height_in:18},{id:"electrical-183",kind:"receptacle",at:[558,780.5],confidence:"derived",height_in:18},{id:"electrical-184",kind:"receptacle",at:[558,693],confidence:"derived",height_in:18},{id:"electrical-185",kind:"receptacle",at:[558,625.5],confidence:"derived",height_in:18},{id:"electrical-186",kind:"receptacle",at:[558,450],confidence:"derived",height_in:18},{id:"electrical-187",kind:"receptacle",at:[558,492],confidence:"derived",height_in:18},{id:"electrical-188",kind:"receptacle",at:[558,522],confidence:"derived",height_in:18},{id:"electrical-189",kind:"receptacle",at:[584,362.5],confidence:"derived",height_in:18},{id:"electrical-190",kind:"receptacle",at:[650.5,416],confidence:"derived",height_in:18},{id:"electrical-191",kind:"receptacle",at:[648.5,526],confidence:"derived",height_in:18},{id:"electrical-192",kind:"receptacle",at:[609.5,593.5],confidence:"derived",height_in:18},{id:"electrical-193",kind:"receptacle",at:[641,578.5],confidence:"derived",height_in:18},{id:"electrical-194",kind:"receptacle",at:[684,578.5],confidence:"derived",height_in:18},{id:"electrical-195",kind:"receptacle",at:[710,593.5],confidence:"derived",height_in:18},{id:"electrical-196",kind:"receptacle",at:[741,362.5],confidence:"derived",height_in:18},{id:"electrical-197",kind:"receptacle",at:[830.5,365.5],confidence:"derived",height_in:18},{id:"electrical-198",kind:"receptacle",at:[908,365.5],confidence:"derived",height_in:18},{id:"electrical-199",kind:"receptacle",at:[978.5,366.5],confidence:"derived",height_in:18},{id:"electrical-200",kind:"receptacle",at:[856.5,678],confidence:"derived",height_in:18},{id:"electrical-201",kind:"receptacle",at:[840,734.5],confidence:"derived",height_in:18},{id:"electrical-202",kind:"receptacle",at:[857.5,784],confidence:"derived",height_in:18},{id:"electrical-203",kind:"receptacle",at:[895,797.5],confidence:"derived",height_in:18},{id:"electrical-204",kind:"receptacle",at:[1002,797.5],confidence:"derived",height_in:18},{id:"electrical-205",kind:"receptacle",at:[1027,757],confidence:"derived",height_in:18},{id:"electrical-206",kind:"receptacle",at:[948.5,665],confidence:"derived",height_in:18},{id:"electrical-207",kind:"receptacle",at:[919.5,596.5],confidence:"derived",height_in:18},{id:"electrical-208",kind:"receptacle",at:[1e3,596.5],confidence:"derived",height_in:18},{id:"electrical-209",kind:"receptacle",at:[1149,309.5],confidence:"derived",height_in:18},{id:"electrical-210",kind:"receptacle",at:[1107.5,372],confidence:"derived",height_in:18},{id:"electrical-211",kind:"receptacle",at:[1296,377.5],confidence:"derived",height_in:18},{id:"electrical-212",kind:"receptacle",at:[1296,467.5],confidence:"derived",height_in:18},{id:"electrical-213",kind:"receptacle",at:[1156.5,515.5],confidence:"derived",height_in:18},{id:"electrical-214",kind:"receptacle",at:[1284.5,514.5],confidence:"derived",height_in:18},{id:"electrical-215",kind:"receptacle",at:[1153,609.5],confidence:"derived",height_in:18},{id:"electrical-216",kind:"receptacle",at:[1253.5,610.5],confidence:"derived",height_in:18},{id:"electrical-217",kind:"receptacle",at:[1288.5,593.5],confidence:"derived",height_in:18},{id:"electrical-218",kind:"receptacle",at:[1107.5,734.5],confidence:"derived",height_in:18},{id:"electrical-219",kind:"receptacle",at:[1135,763.5],confidence:"derived",height_in:18},{id:"electrical-220",kind:"receptacle",at:[1240.5,763.5],confidence:"derived",height_in:18},{id:"electrical-221",kind:"receptacle",at:[1296,744],confidence:"derived",height_in:18},{id:"electrical-222",kind:"receptacle",at:[1186.5,114.5],confidence:"derived",height_in:18},{id:"electrical-223",kind:"receptacle",at:[1217,107],confidence:"derived",height_in:18},{id:"electrical-224",kind:"receptacle",at:[1296,225],confidence:"derived",height_in:18},{id:"electrical-225",kind:"receptacle",at:[1296,261.5],confidence:"derived",height_in:18},{id:"electrical-226",kind:"receptacle",at:[1297,186.5],confidence:"derived",height_in:18},{id:"electrical-227",kind:"receptacle",at:[1192.5,283],confidence:"derived",height_in:18},{id:"electrical-228",kind:"receptacle",at:[433.5,345],confidence:"derived",height_in:18},{id:"electrical-229",kind:"receptacle",at:[432.5,247.5],confidence:"derived",height_in:18},{id:"electrical-230",kind:"receptacle",at:[592.5,832],confidence:"derived",height_in:18},{id:"electrical-231",kind:"receptacle",at:[688.5,833],confidence:"derived",height_in:18},{id:"electrical-232",kind:"receptacle",at:[839,824.5],confidence:"derived",height_in:18},{id:"electrical-233",kind:"GFCI",at:[196,16],confidence:"derived",height_in:42},{id:"electrical-234",kind:"GFCI",at:[275.5,83.5],confidence:"derived",height_in:42},{id:"electrical-235",kind:"GFCI",at:[275.5,154],confidence:"derived",height_in:42},{id:"electrical-236",kind:"GFCI",at:[275.5,176.5],confidence:"derived",height_in:42},{id:"electrical-237",kind:"GFCI",at:[207.5,221.5],confidence:"derived",height_in:42},{id:"electrical-238",kind:"GFCI",at:[-6.5,376.5],confidence:"derived",height_in:42},{id:"electrical-239",kind:"GFCI",at:[539.5,344],confidence:"derived",height_in:42},{id:"electrical-240",kind:"GFCI",at:[986,344],confidence:"derived",height_in:42},{id:"electrical-241",kind:"GFCI",at:[561,362.5],confidence:"derived",height_in:42},{id:"electrical-242",kind:"GFCI",at:[664.5,362.5],confidence:"derived",height_in:42},{id:"electrical-243",kind:"GFCI",at:[1296,277.5],confidence:"derived",height_in:42},{id:"electrical-244",kind:"GFCI",at:[1296,197],confidence:"derived",height_in:42},{id:"electrical-245",kind:"GFCI",at:[1155.5,52.5],confidence:"derived",height_in:42},{id:"electrical-246",kind:"GFCI",at:[1320.5,615],confidence:"derived",height_in:42},{id:"electrical-247",kind:"GFCI",at:[1084,660],confidence:"derived",height_in:42},{id:"electrical-248",kind:"GFCI",at:[1084,693],confidence:"derived",height_in:42},{id:"electrical-249",kind:"GFCI",at:[873.5,816],confidence:"derived",height_in:42},{id:"electrical-250",kind:"GFCI",at:[1029,816],confidence:"derived",height_in:42},{id:"electrical-251",kind:"GFCI",at:[574,851],confidence:"derived",height_in:42},{id:"electrical-252",kind:"GFCI",at:[212,838.5],confidence:"derived",height_in:42},{id:"electrical-253",kind:"switch",at:[223,62],confidence:"derived",height_in:48},{id:"electrical-254",kind:"switch",at:[426,182],confidence:"derived",height_in:48},{id:"electrical-255",kind:"switch",at:[433.5,184],confidence:"derived",height_in:48},{id:"electrical-256",kind:"switch",at:[441,186.5],confidence:"derived",height_in:48},{id:"electrical-257",kind:"switch",at:[357,201.5],confidence:"derived",height_in:48},{id:"electrical-258",kind:"switch",at:[280,188.5],confidence:"derived",height_in:48},{id:"electrical-259",kind:"switch",at:[118.5,255],confidence:"derived",height_in:48},{id:"electrical-260",kind:"switch",at:[298.5,441.5],confidence:"derived",height_in:48},{id:"electrical-261",kind:"switch",at:[411,480],confidence:"derived",height_in:48},{id:"electrical-262",kind:"switch",at:[442,508],confidence:"derived",height_in:48},{id:"electrical-263",kind:"switch",at:[480,535.5],confidence:"derived",height_in:48},{id:"electrical-264",kind:"switch",at:[478,571],confidence:"derived",height_in:48},{id:"electrical-265",kind:"switch",at:[552.5,386],confidence:"derived",height_in:48},{id:"electrical-266",kind:"switch",at:[681,344],confidence:"derived",height_in:48},{id:"electrical-267",kind:"switch",at:[469.5,346.5],confidence:"derived",height_in:48},{id:"electrical-268",kind:"switch",at:[740,567],confidence:"derived",height_in:48},{id:"electrical-269",kind:"switch",at:[809,577.5],confidence:"derived",height_in:48},{id:"electrical-270",kind:"switch",at:[881,601],confidence:"derived",height_in:48},{id:"electrical-271",kind:"switch",at:[1030,654.5],confidence:"derived",height_in:48},{id:"electrical-272",kind:"switch",at:[1103,473.5],confidence:"derived",height_in:48},{id:"electrical-273",kind:"switch",at:[1103,650],confidence:"derived",height_in:48},{id:"electrical-274",kind:"switch",at:[1208.5,294.5],confidence:"derived",height_in:48},{id:"electrical-275",kind:"switch",at:[1235.5,129.5],confidence:"derived",height_in:48},{id:"electrical-276",kind:"switch",at:[1285.5,113.5],confidence:"derived",height_in:48},{id:"electrical-277",kind:"switch",at:[726,832],confidence:"derived",height_in:48},{id:"electrical-278",kind:"switch",at:[732.5,832],confidence:"derived",height_in:48},{id:"electrical-279",kind:"switch",at:[738,832],confidence:"derived",height_in:48},{id:"electrical-280",kind:"disconnect",at:[166.5,122],confidence:"derived",height_in:54},{id:"electrical-281",kind:"disconnect",at:[1314.5,668.5],confidence:"derived",height_in:54}]};var $=.0254,Mt=.3048,Ul=[["terrain","Ground & grading","#bfa782",!0],["landscaping","Finished landscape","#74864b",!0],["boundaries","Survey & easements","#89633c",!1],["hardscape","Driveways & patios","#c3beb1",!0],["fences","Fences & gates","#4e554b",!0],["foundation","Concrete foundations","#aaa69a",!0],["reinforcement","Rebar & anchors","#695f53",!1],["walls","Wall framing","#ba936b",!1],["insulation","Insulation","#d4c894",!1],["sheathing","Sheathing & EPS","#ceb797",!1],["finishes","Walls & finishes","#ece8dc",!0],["floors","Room floors","#c4ae8e",!0],["ceilings","Ceilings","#ede9dc",!0],["roof","Roof covering","#363f3b",!0],["trusses","Trusses & beams","#af815b",!1],["openings","Doors & windows","#33483f",!0],["fixtures","Fixtures & cabinets","#d9d7c9",!0],["water","Water supply \xB7 schematic","#397daf",!1],["waste","Waste & vents \xB7 schematic","#a26642",!1],["electrical","Electrical devices & circuits","#dca64e",!1],["hvac","HVAC \xB7 schematic ducts","#8ba6a1",!1],["septic","Septic tanks & drainfields","#718c65",!0],["barn","Barn steel & cladding","#d1d2c8",!0],["annotations","Room & site labels","#f1ecdd",!0],["proposals","Saved planning objects","#99774a",!0]];function Vh(){let n=new Lt;n.name="Farm House \xB7 drawing-based model";let e=Object.fromEntries(Ul.map(([_,L,B,J])=>{let S=new Lt;return S.name=L,S.visible=J,S.userData.layer=_,n.add(S),[_,S]})),t=[],i=[],r=[],s=[],o=[],a=0,c={};function l(_,L,B={}){return c[_]||(c[_]=new Gr({color:L,roughness:.8,...B})),c[_]}function d(){let L=new Uint8Array(65536),B=61729,J=()=>(B=Math.imul(B,1664525)+1013904223>>>0,B/4294967296),S=Array.from({length:105},()=>({x:J()*128,y:J()*128,rx:2+J()*4.4,ry:1.3+J()*3.1,t:J()*Math.PI,c:132+J()*37}));for(let O=0;O<128;O++)for(let P=0;P<128;P++){let W=148+Math.sin(P*.17+O*.11)*3,k=0;for(let Z of S){let Me=P-Z.x,Le=O-Z.y,ct=Math.cos(Z.t),ot=Math.sin(Z.t),je=(Me*ct+Le*ot)/Z.rx,Je=(-Me*ot+Le*ct)/Z.ry,ut=je*je+Je*Je;ut<1&&(W=Z.c,k+=(1-ut)*15+je*4-Je*8)}let ie=(O*128+P)*4;L[ie]=Math.max(0,Math.min(255,W+k-7)),L[ie+1]=Math.max(0,Math.min(255,W+k-3)),L[ie+2]=Math.max(0,Math.min(255,W+k+1)),L[ie+3]=255}let V=new Cr(L,128,128,Jt);return V.colorSpace=Dt,V.wrapS=V.wrapT=kn,V.magFilter=ti,V.minFilter=ja,V.needsUpdate=!0,V}let h={concrete:l("concrete","#aaa79d"),wood:l("wood","#b68b5f"),woodDark:l("woodDark","#75523a"),gypsum:l("gypsum","#ece8df"),clad:l("clad","#f0eee7",{roughness:.9}),roof:l("roof","#414340",{roughness:.94}),steel:l("steel","#816955",{metalness:.5}),barn:l("barn","#e2e0d4",{metalness:.25}),metal:l("metal","#3d4940",{metalness:.65}),glass:l("glass","#78988d",{transparent:!0,opacity:.34,roughness:.18,metalness:.15,side:Wt,depthWrite:!1}),floor:l("floor","#baa486"),tile:l("tile","#d3cdbf"),fixture:l("fixture","#f2eee1",{roughness:.25}),counter:l("counter","#ded6c4"),cabinet:l("cabinet","#a6ac98"),water:l("water","#358ab0"),hot:l("hot","#c55b4c"),waste:l("waste","#886349"),wire:l("wire","#c49237"),duct:l("duct","#8aadb0",{metalness:.25}),earth:l("earth","#b8a88c"),grass:l("grass","#425b35",{roughness:1}),riverRock:l("riverRock","#ffffff",{roughness:1,side:Wt,map:d()}),boulder:l("boulder","#696c66",{roughness:.94}),bark:l("bark","#604b35",{roughness:1}),foliage:l("foliage","#50683b",{roughness:.95}),septic:l("septic","#779582",{transparent:!0,opacity:.76,depthWrite:!1}),insulation:l("insulation","#d7c793",{transparent:!0,opacity:.83}),osb:l("osb","#b59a72"),eps:l("eps","#e5e1d3"),reinforcement:l("rebar","#74604c",{metalness:.6}),unknown:l("unknown","#c08d42"),highlight:l("highlight","#dba94d")};function p(){n.traverse(_=>{if(!_.isMesh||_.material!==h.riverRock||!_.geometry?.attributes?.position)return;let L=_.geometry.clone(),B=L.attributes.position,J=new Float32Array(B.count*2),S=new N;for(let V=0;V<B.count;V++)S.fromBufferAttribute(B,V).applyMatrix4(_.matrixWorld),J[V*2]=S.x*.78,J[V*2+1]=S.z*.78;L.setAttribute("uv",new lt(J,2)),_.geometry=L})}function f(_,L,B,J={}){let{source:S,notes:V,source_path_index:O,source_page:P,raw_tag:W,position_basis:k,at_original_plan:ie,...Z}=J;return _.name=B,_.userData={id:Z.id||"FH-"+String(++a).padStart(5,"0"),layer:L,name:B,confidence:Z.confidence||"approximate",...Z},_.castShadow=L!=="terrain",_.receiveShadow=!0,_.userData.baseY=_.position.y,e[L].add(_),t.push(_),_}function g(_,L,B,J,S,V={}){let O=new Ke(new St(...J),S);return O.position.set(...B),f(O,_,L,{dimensions_in:J.map(P=>P/$),...V}),O}function w(_,L,B,J,S,V={}){let O=new Ke(new Jn(1,18,12),S);return O.position.set(...B),O.scale.set(...J),f(O,_,L,V)}function m(_,L,B,J,S,V,O={}){let P=new N(...B),W=new N(...J),k=P.distanceTo(W),ie=new Ke(new vi(S,S,k,8),V);return ie.position.copy(P).add(W).multiplyScalar(.5),ie.quaternion.setFromUnitVectors(new N(0,1,0),W.sub(P).normalize()),f(ie,_,L,O)}function u(_,L,B,J,S,V,O,P={}){let W=new N(...B),k=new N(...J),ie=W.distanceTo(k),Z=new Ke(new St(S,V,ie),O);return Z.position.copy(W).add(k).multiplyScalar(.5),Z.quaternion.setFromUnitVectors(new N(0,0,1),k.sub(W).normalize()),f(Z,_,L,P)}function R(_,L,B,J,S={},V=!1){let O=new Pt().setFromPoints(B.map(W=>new N(...W))),P=new Xn(O,V?new Hr({color:J,dashSize:.45,gapSize:.22}):new Yi({color:J}));return V&&P.computeLineDistances(),f(P,_,L,S)}function T(_,L,B,J,S,V,O={}){let P=new Di;B.forEach(([ie,Z],Me)=>Me?P.lineTo(ie,-Z):P.moveTo(ie,-Z)),P.closePath();let W=new Zn(P,{depth:S,bevelEnabled:!1,curveSegments:1});W.rotateX(-Math.PI/2);let k=new Ke(W,V);return k.position.y=J-S,f(k,_,L,O)}function M(_,L,B,J,S={}){let V=new Pt,O=B.flat();V.setAttribute("position",new lt(O,3));let P=[];for(let k=1;k<B.length-1;k++)P.push(0,k,k+1);V.setIndex(P),V.computeVertexNormals();let W=new Ke(V,J);return W.material.side=Wt,f(W,_,L,S)}let F=rt.local_placement,E=(_,L,B=0)=>[(F.east_ft+(849-L)/12)*Mt,B,(-F.north_ft+_/12)*Mt],U=(_,L=0)=>E(_[0],_[1],L),I=(_,L,B=-.15)=>[_*Mt,B,-L*Mt],y=(_,L,B=0)=>[_*Mt,B,-L*Mt];function x(_,L,B,J=1){i.push({name:_,at:L,entity:B,scale:J})}function C(_,L,B,J,S,V={}){let O=new Lt;for(let P=1;P<B.length;P++){let W=new N(...B[P-1]),k=new N(...B[P]),ie=W.distanceTo(k);if(ie<.001)continue;let Z=new Ke(new vi(S/2,S/2,ie,7),J);Z.position.copy(W).add(k).multiplyScalar(.5),Z.quaternion.setFromUnitVectors(new N(0,1,0),k.sub(W).normalize()),O.add(Z)}return f(O,_,L,{confidence:"schematic",...V})}let z=rt.house.outline.map(_=>{let L=U(_);return[L[0],L[2]]}),X=rt.house.outline.map(_=>{let L=U(_);return[L[0],L[2]]});T("foundation","House concrete slab \xB7 4 inches",X,0,4*$,h.concrete,{id:"house-slab",source:"",confidence:"dimensioned",thickness_in:4,notes:""}),T("foundation","House ABC base \xB7 4 inches",X,-4*$,4*$,l("abc","#8f8471"),{source:"",confidence:"dimensioned",thickness_in:4}),T("floors","House floor finish \xB7 illustrative",X,.012,.012,h.floor,{source:"",confidence:"approximate",notes:""});for(let _ of rt.house.rooms){let L=_.polygon.map(S=>{let V=U(S);return[V[0],V[2]]});(_.finish==="tile"||_.finish==="concrete")&&T("floors",_.name+" floor",L,.017,.009,_.finish==="tile"?h.tile:h.concrete,{id:"room-floor-"+_.id,source:_.source,confidence:_.confidence,notes:_.notes,room:_.id});let B=U(_.center,.03);x(_.name,B,"room-"+_.id),s.push({..._,position:U(_.center,66*$)});let J=T("ceilings",_.name+" ceiling",L,_.ceiling_in*$,.5*$,h.gypsum,{id:"room-"+_.id,confidence:"derived",height_in:_.ceiling_in});if(["kitchen","living_room","dining_room","library","foyer"].includes(_.id)){let S=function(V,O){let P=[];for(let W=0;W<V.length;W++){let k=V[W],ie=V[(W+1)%V.length],Z=O?k[1]>=596.5:k[1]<=596.5,Me=O?ie[1]>=596.5:ie[1]<=596.5;if(Z&&P.push(k),Z!==Me){let Le=(596.5-k[1])/(ie[1]-k[1]);P.push([k[0]+(ie[0]-k[0])*Le,596.5])}}return P};J.visible=!1,J.userData.alwaysHidden=!0;for(let V of[!1,!0]){let O=S(_.polygon,V);if(O.length<3)continue;let P=new Di;O.forEach(([Z,Me],Le)=>Le?P.lineTo(Z,Me):P.moveTo(Z,Me)),P.closePath();let W=new zr(P),k=W.attributes.position;for(let Z=0;Z<k.count;Z++){let Me=k.getX(Z),Le=k.getY(Z),ct=(120+Math.max(0,Math.min(Le-348,845-Le))*.375)*$;k.setXYZ(Z,...E(Me,Le,ct))}W.computeVertexNormals();let ie=new Ke(W,h.gypsum);ie.material.side=Wt,f(ie,"ceilings",_.name+" vaulted ceiling",{source:"",confidence:"conflict",pitch:4.5,notes:""})}}}for(let _ of rt.house.porches){let L=_.polygon.map(B=>{let J=U(B);return[J[0],J[2]]});T("hardscape",_.name,L,-.025,4*$,h.concrete,{id:_.id,source:"",confidence:"derived",notes:""})}function G(_,L,B,J,S,V,O,P,W=0){if(B-L<.1||S-J<.1)return;let k=_.a,ie=_.b,Z=Math.hypot(ie[0]-k[0],ie[1]-k[1]),Me=(ie[0]-k[0])/Z,Le=(ie[1]-k[1])/Z,ct=[k[0]+Me*(L+B)/2-Le*W,k[1]+Le*(L+B)/2+Me*W],ot=g(V,_.name,U(ct,(S+J)/2*$),[(B-L)*$,(S-J)*$,P*$],O,{wall_id:_.id,confidence:"derived",dimensions_in:[B-L,S-J,P]}),je=U(k),Je=U(ie);return ot.rotation.y=-Math.atan2(Je[2]-je[2],Je[0]-je[0]),ot}for(let _ of rt.house.walls){let L=Math.hypot(_.b[0]-_.a[0],_.b[1]-_.a[1]),B=[..._.openings].sort((P,W)=>P.offset_in-W.offset_in),J=[],S=0;for(let P of B){let W=Math.max(S,P.offset_in-P.width_in/2),k=Math.min(L,P.offset_in+P.width_in/2);W>S&&J.push([S,W,0,_.height_in]),P.sill_in>0&&J.push([W,k,0,P.sill_in]),P.sill_in+P.height_in<_.height_in&&J.push([W,k,P.sill_in+P.height_in,_.height_in]),S=Math.max(S,k)}S<L&&J.push([S,L,0,_.height_in]);for(let P of J){G(_,...P,"insulation",h.insulation,_.core_in);for(let Me of[-1,1])G(_,...P,"finishes",_.exterior?h.clad:h.gypsum,.5,Me*(_.core_in/2+.25));_.exterior&&(G(_,...P,"sheathing",h.osb,.375,_.core_in/2+.1875),G(_,...P,"sheathing",h.eps,1,_.core_in/2+.875));let[W,k,ie,Z]=P;for(let Me=Math.ceil(W/16)*16;Me<k;Me+=16)G(_,Math.max(W,Me-.75),Math.min(k,Me+.75),ie,Z,"walls",h.wood,_.core_in);k-W>3&&(G(_,W,k,ie,ie+1.5,"walls",h.wood,_.core_in),G(_,W,k,Math.max(ie,Z-3),Z,"walls",h.wood,_.core_in))}let V=U(_.a,-.38),O=U(_.b,-.38);_.exterior&&u("foundation",_.name+" continuous footing",V,O,18*$,10*$,h.concrete,{source:"",confidence:"derived",dimensions_in:[18,10],notes:""});for(let P of B){let W=P.offset_in-P.width_in/2,k=P.offset_in+P.width_in/2;for(let Bt of[W-1.5,k+1.5])G(_,Bt-1.5,Bt+1.5,0,120,"walls",h.wood,_.core_in);G(_,W-3,k+3,P.height_in+P.sill_in,P.height_in+P.sill_in+7.25,"walls",h.woodDark,_.core_in);let ie=(_.b[0]-_.a[0])/L,Z=(_.b[1]-_.a[1])/L,Me=[_.a[0]+ie*P.offset_in,_.a[1]+Z*P.offset_in],Le=U(Me,(P.sill_in+P.height_in/2)*$),ct=U(_.a),ot=U(_.b),je=-Math.atan2(ot[2]-ct[2],ot[0]-ct[0]),Je=null,ut=Je?.children.length?Je:new Lt;if(ut.position.set(...Le),ut.rotation.y=je,!Je?.children.length){let Bt=["window","folding"].includes(P.kind)?h.glass:P.kind==="garage"?h.metal:h.cabinet,wn=new Ke(new St(Math.max(.1,(P.width_in-3)*$),(P.height_in-3)*$,1.5*$),Bt);ut.add(wn);for(let Ct of[-P.width_in/2+1,P.width_in/2-1]){let It=new Ke(new St(2*$,P.height_in*$,3*$),h.metal);It.position.x=Ct*$,ut.add(It)}for(let Ct of[-P.height_in/2+1,P.height_in/2-1]){let It=new Ke(new St(P.width_in*$,2*$,3*$),h.metal);It.position.y=Ct*$,ut.add(It)}if(P.kind==="garage")for(let Ct=-P.height_in/2+24;Ct<P.height_in/2;Ct+=24){let It=new Ke(new St(P.width_in*$,.025,.05),h.woodDark);It.position.y=Ct*$,ut.add(It)}if(P.kind==="folding")for(let Ct=-P.width_in/2+36;Ct<P.width_in/2;Ct+=36){let It=new Ke(new St(2*$,P.height_in*$,3*$),h.metal);It.position.x=Ct*$,ut.add(It)}if(P.kind==="window"&&P.width_in>=24){let Ct=new Ke(new St(.8*$,P.height_in*$,2*$),h.metal);ut.add(Ct);let It=P.height_in>=60?4:2;for(let Fi=1;Fi<It;Fi++){let sr=new Ke(new St(P.width_in*$,.8*$,2*$),h.metal);sr.position.y=(-P.height_in/2+P.height_in*Fi/It)*$,ut.add(sr)}}}f(ut,"openings",P.name,{...P,legacyOpening:Je?.userData.legacyOpening,confidence:P.confidence||"approximate",dimensions_in:[P.width_in,P.height_in],opening:!0}),P.kind!=="window"&&(ut.userData.operable=!0)}}let K=l("lower-exterior-trim","#eeeee6",{roughness:.55});for(let _ of rt.house.walls.filter(L=>L.exterior)){let L=Math.hypot(_.b[0]-_.a[0],_.b[1]-_.a[1]),B=0;for(let J of[..._.openings].filter(S=>S.sill_in<6).sort((S,V)=>S.offset_in-V.offset_in)){let S=Math.max(0,J.offset_in-J.width_in/2),V=Math.min(L,J.offset_in+J.width_in/2);if(S>B){let O=G(_,B,S,0,6,"finishes",K,1.25,-_.core_in/2-.625);O&&(O.name="Lower exterior trim \xB7 "+_.id,O.userData.restoredExteriorTrim=!0)}B=Math.max(B,V)}if(B<L){let J=G(_,B,L,0,6,"finishes",K,1.25,-_.core_in/2-.625);J&&(J.name="Lower exterior trim \xB7 "+_.id,J.userData.restoredExteriorTrim=!0)}}function j(_,L,B,J,S){let V=1-_,O=[];for(let P=0;P<B.length;P++){let W=B[P],k=B[(P+1)%B.length];(W[_]<=L&&k[_]>L||k[_]<=L&&W[_]>L)&&O.push(W[V]+(k[V]-W[V])*(L-W[_])/(k[_]-W[_]))}O.sort((P,W)=>P-W);for(let P=1;P<O.length;P+=2){let W=O[P-1]+3,k=O[P]-3;if(k<=W)continue;let ie=[[W,k]];S==="geometry"&&(_===0&&L<294&&(ie=ie.flatMap(([Z,Me])=>[[Z,Math.min(Me,382)],[Math.max(Z,852),Me]])),_===1&&L>=385&&L<=849&&(ie=ie.map(([Z,Me])=>[Math.max(Z,297),Me])));for(let[Z,Me]of ie)if(Me>Z){let Le=_===0?[L,Z]:[Z,L],ct=_===0?[L,Me]:[Me,L];m("reinforcement","#4 slab grid \xB7 "+J+"-inch spacing",U(Le,-(_===0?2:2.5)*$),U(ct,-(_===0?2:2.5)*$),.25*$,h.reinforcement,{source:S,confidence:"derived",notes:""})}}}for(let _=12;_<1310;_+=36)j(0,_,rt.house.outline,36,"geometry");for(let _=12;_<849;_+=36)j(1,_,rt.house.outline,36,"geometry");let he=[[0,385],[294,385],[294,849],[0,849]];for(let _=12;_<294;_+=24)j(0,_,he,24,"geometry");for(let _=397;_<849;_+=24)j(1,_,he,24,"geometry");let ee=[];for(let _=448;_<=1133;_+=137)ee.push([_,989]);for(let _ of[662,846])ee.push([_,208]);for(let[_,L]of ee){let B=E(_,L,60*$);g("trusses","Porch 6x6 post",B,[5.5*$,120*$,5.5*$],h.wood,{source:"",confidence:"derived",notes:""}),g("finishes","Porch post finish",B,[5.6*$,120*$,5.6*$],h.clad,{source:"",confidence:"approximate",notes:""}),g("foundation","Porch post pad footing",E(_,L,-.45),[30*$,10*$,30*$],h.concrete,{source:"",confidence:"approximate",notes:""})}u("trusses","Rear patio GLB beam",E(478,208,114*$),E(1030,208,114*$),5.125*$,18*$,h.woodDark,{source:"",confidence:"dimensioned",dimensions_in:[552,18,5.125],notes:""}),u("trusses","Front porch GLB beam",E(448,989,114*$),E(1133,989,114*$),5.125*$,12*$,h.woodDark,{source:"",confidence:"derived"});let ye=[],Se=[];function Ee(_,L,B,J,S,V="v",O=9,P=7.125){let W=V==="v"?S-B:J-L,k=120+P,ie=k+W/2*O/12,Z=18,Me=V==="v"?[[L-Z,B-Z,k-Z*O/12],[J+Z,B-Z,k-Z*O/12],[J+Z,(B+S)/2,ie],[L-Z,(B+S)/2,ie]]:[[L-Z,B-Z,k-Z*O/12],[L-Z,S+Z,k-Z*O/12],[(L+J)/2,S+Z,ie],[(L+J)/2,B-Z,ie]],Le=V==="v"?[[L-Z,(B+S)/2,ie],[J+Z,(B+S)/2,ie],[J+Z,S+Z,k-Z*O/12],[L-Z,S+Z,k-Z*O/12]]:[[(L+J)/2,B-Z,ie],[(L+J)/2,S+Z,ie],[J+Z,S+Z,k-Z*O/12],[J+Z,B-Z,k-Z*O/12]];for(let ct of[Me,Le]){let ot=M("roof",_+" roof plane",ct.map(([je,Je,ut])=>E(je,Je,ut*$)),h.roof,{source:"",confidence:"derived",pitch:O,notes:""});ye.push(ot)}for(let ct of[V==="v"?[[L,B],[L,S]]:[[L,B],[J,B]],V==="v"?[[J,B],[J,S]]:[[L,S],[J,S]]]){let[ot,je]=ct;M("roof",_+" gable infill",[E(...ot,120*$),E(...je,120*$),E((ot[0]+je[0])/2,(ot[1]+je[1])/2,ie*$)],h.clad,{source:"",confidence:"derived"})}}Ee("Main vaulted body",545,348,1038,845,"v"),Ee("Garage / office body",0,385,545,827,"v"),Ee("Master / bedroom wing",1038,348,1310,826,"v"),Ee("Guest cross gable",171,0,478,348,"u"),Ee("Laundry cross gable",0,243,478,385,"u"),Ee("Master bath cross gable",1030,208,1310,348,"u"),Ee("Master rear closet gable",1160,43,1310,208,"u"),Ee("Garage front cross gable",0,655,294,849,"u");let Ge=M("roof","Front porch roof \xB7 manufacturer 3:12 variant",[E(448,820,162*$),E(1133,820,162*$),E(1133,1007,115.25*$),E(448,1007,115.25*$)],h.roof,{source:"",confidence:"conflict",variant:"manufacturer",notes:""});ye.push(Ge);let $e=M("roof","Rear patio roof",[E(478,208,117*$),E(1030,208,117*$),E(1030,348,152*$),E(478,348,152*$)],h.roof,{source:"",confidence:"conflict",notes:""});ye.push($e);for(let _ of[660,805,945]){let B={source:"",confidence:"derived",notes:""};for(let J of[-1,1])M("roof","Dormer cheek",[E(_+J*32,665,180*$),E(_+J*32,775,180*$),E(_+J*32,775,240*$),E(_+J*32,665,240*$)],h.clad,B);for(let[J,S,V,O]of[[-32,-14,180,240],[14,32,180,240],[-14,14,180,185],[-14,14,237,240]])M("roof","Dormer front trim",[E(_+J,775,V*$),E(_+S,775,V*$),E(_+S,775,O*$),E(_+J,775,O*$)],h.clad,B);M("roof","Dormer gable",[E(_-32,775,240*$),E(_+32,775,240*$),E(_,775,264*$)],h.clad,B);for(let J of[-1,1])ye.push(M("roof","Dormer roof plane",[E(_+J*35,662,240*$),E(_+J*35,779,240*$),E(_,779,266*$),E(_,662,266*$)],h.roof,B));g("roof","Dormer glazing",E(_,775+.5,211*$),[1*$,52*$,28*$],h.glass,B);for(let J of[-14,0,14])g("roof","Dormer vertical muntin",E(_+J,776,211*$),[1.5*$,52*$,1.2*$],h.metal,B);for(let J of[185,198,211,224,237])g("roof","Dormer horizontal muntin",E(_,776,J*$),[1.5*$,1.2*$,28*$],h.metal,B)}let it=new Map(rt.truss_vectors.map(_=>[_.mark,_])),Ze=new Map;function ae(_){let L=rt.trusses.find(S=>S.mark===_),B=it.get(_),J=new Lt;return!L||!B||B.members.forEach((S,V)=>{let O=_+"-"+V;if(!Ze.has(O)){let W=new Di;S.polygon_in.forEach(([ie,Z],Me)=>Me?W.lineTo(ie*$,Z*$):W.moveTo(ie*$,Z*$)),W.closePath();let k=new Zn(W,{depth:1.5*L.plies*$,bevelEnabled:!1,curveSegments:1});k.translate(0,0,-.75*L.plies*$),Ze.set(O,k)}let P=new Ke(Ze.get(O),h.wood);P.userData={vectorMember:!0,member_width_in:S.width_in},J.add(P)}),J}function se(_,L,B,J="v",S=120){let V=rt.trusses.find(je=>je.mark===_);if(!V)return;let O=V.profile_width_in,P=V.profile_height_in,W=1.5*V.plies,k=V.top_chord_pitch_over_12/12;if(it.has(_)){let je=ae(_),Je=[];for(let[ut,Bt]of[...je.children].entries())Bt.position.set(...E(L,B,S*$)),Bt.rotation.y=J==="v"?Math.PI:-Math.PI/2,f(Bt,"trusses",_+" \xB7 lumber member "+(ut+1),{...Bt.userData,mark:_,quantity:V.quantity,plies:V.plies,profile_width_in:O,profile_height_in:P,confidence:"derived"}),Je.push(Bt);return Se.push(...Je),Je}let ie=(je,Je)=>J==="v"?E(L,B+je,(S+Je)*$):E(L+je,B,(S+Je)*$),Z;if(V.type.includes("Piggyback Base")){let je=(P-7.125)/k;Z=[[0,7.125],[Math.min(je,O/2),P],[Math.max(O-je,O/2),P],[O,7.125]]}else V.type.includes("Monopitch")||_.startsWith("G")||_.startsWith("JK")?Z=[[0,5.9375],[O,P]]:Z=[[0,7.125],[O/2,P],[O,7.125]];let Me=_.startsWith("K")?[[0,0],[O/2,Math.max(0,(O/2-5.5)*.375)],[O,0]]:[[0,0],[O,0]],Le=[],ct={source:"",confidence:"derived",mark:_,quantity:V.quantity,plies:V.plies,profile_width_in:O,profile_height_in:P,notes:""};for(let je of[Z,Me])for(let Je=1;Je<je.length;Je++)Le.push(u("trusses",_+" chord",ie(...je[Je-1]),ie(...je[Je]),W*$,5.5*$,h.wood,ct));let ot=Math.max(2,Math.ceil(O/75));for(let je=0;je<ot;je++){let Je=O*je/ot,ut=O*(je+1)/ot,Bt=Z.length===2?Z[0][1]+(P-Z[0][1])*ut/O:Math.min(P,7.125+Math.min(ut,O-ut)*k),wn=_.startsWith("K")?Math.min(Je,O-Je)*.375:0;Le.push(u("trusses",_+" web",ie(Je,wn),ie(ut,Bt),W*$,3.5*$,h.wood,ct))}return Se.push(...Le),Le}for(let _=0;_<10;_++)se("A01",171,12+_*24,"u");se("A01G",171,0,"u");for(let _=0;_<4;_++)se("B01",0,267+_*24,"u");se("B02",0,385,"u");for(let _=0;_<15;_++)se("L01",12+_*24,385);for(let _=0;_<6;_++)se("L02",376+_*24,385);for(let _=0;_<13;_++)se("K01",555+_*24,348);for(let _=0;_<6;_++)se("K03",886+_*24,348);for(let _=0;_<7;_++)se("H01",1049+_*24,348);for(let _=0;_<4;_++)se("H02",1220+_*24,348);for(let _=0;_<6;_++)se("D01",1160,52+_*24,"u");for(let _=0;_<5;_++)se("E01",1030,221+_*24,"u");for(let _=0;_<20;_++)se("PB06",555+_*24,348+360/2,"v",120+142.125-1.5);for(let _=0;_<21;_++)se("PB02",12+_*24,385+360/2,"v",120+142.125-1.5);for(let _=0;_<11;_++)se("PB04",1049+_*24,348+360/2,"v",120+142.125-1.5);for(let _=0;_<8;_++)se("G03",640+_*24,845,"v",111);se("B01G",0,243,"u"),se("C01G",0,849,"u"),se("C01",0,825,"u"),se("C02",0,801,"u"),se("D01G",1160,43,"u"),se("E01G",1030,208,"u"),se("H01G",1310,348),se("K01G",545,348),se("K03G",1038,348),se("L01G",0,385);let Ce=new Lt;Ce.name="Individual truss design inspection",Ce.visible=!1;function Ne(_){let L=_.at,[B,J,S]=U(_.at),V=new Lt;V.position.set(B,0,S),V.rotation.y=ci.degToRad(_.angle);let O=(k,ie,Z=h.fixture,Me=!1)=>{let Le=new Ke(Me?new Jn(1,20,12):new St(...k),Z);return Me&&Le.scale.set(...k),Le.position.set(...ie),Le.castShadow=!0,V.add(Le),Le},P=k=>k.map(ie=>ie*$);if(_.kind==="toilet")O(P([8,8,13]),P([0,10,4]),h.fixture,!0),O(P([18,22,7]),P([0,20,-9])),O(P([8,1,11]),P([0,17,5]),h.metal,!0);else if(_.kind==="tub")O(P([31,21,65]),P([0,10.5,0])),O(P([25,4,55]),P([0,21,0]),l("basin","#91a49a"));else if(_.kind==="shower")O(P([48,3,52]),P([0,1.5,0]),h.tile),O(P([.5,80,52]),P([24,41,0]),h.glass),O(P([48,80,.5]),P([0,41,-26]),h.glass),O(P([7,1,7]),P([0,78,-15]),h.metal);else if(_.kind==="lavatory"||_.kind==="sink"){let k=_.kind==="sink"?36:28;O(P([k,34,24]),P([0,17,0]),h.cabinet),O(P([k+1,2,25]),P([0,35,0]),h.counter),O(P([k/2-3,1,8]),P([0,36.1,1]),l("basin","#91a49a"),!0),O(P([1,9,1]),P([0,40,-9]),h.metal)}else if(_.kind==="waterHeater"){let k=new Ke(new vi(12*$,12*$,58*$,20),h.fixture);k.position.y=29*$,V.add(k)}else if(_.kind==="counter"){let[k,ie,Z]=_.size_in;O(P([k,Z-2,ie]),P([0,(Z-2)/2,0]),h.cabinet),O(P([k+1,2,ie+1]),P([0,Z-1,0]),h.counter)}else{let k={heatPump:[36,36,36],airHandler:[28,58,28],refrigerator:[36,70,32],washer:[28,40,30],dryer:[28,40,30],dishwasher:[24,34,24],cooktop:[30,36,25],oven:[30,56,26],microwave:[28,18,20]}[_.kind]||[30,36,28];if(O(P(k),P([0,k[1]/2,0]),_.kind==="heatPump"?l("condenser-housing","#777e75",{roughness:.58,metalness:.25}):_.kind==="airHandler"?h.duct:h.fixture),_.kind==="heatPump"){O(P([42,6,42]),P([0,-3,0]),h.concrete);let ie=new Ke(new vi(12*$,12*$,1*$,32),h.metal);ie.position.y=36.5*$,V.add(ie);for(let Z=1;Z<=5;Z++){let Me=new Ke(new Vr(Z*2.2*$,.18*$,4,28),h.duct);Me.rotation.x=Math.PI/2,Me.position.y=37.1*$,V.add(Me)}for(let Z=-15;Z<=15;Z+=3)for(let Me of[-1,1])O(P([.32,28,.32]),P([Z,18,Me*18.2]),h.metal),O(P([.32,28,.32]),P([Me*18.2,18,Z]),h.metal)}else O(P([k[0]-5,k[1]*.4,1]),P([0,k[1]*.6,k[2]/2+.5]),h.metal)}let W=["heatPump","airHandler"].includes(_.kind)?"hvac":"fixtures";return f(V,W,_.name,{..._,outdoorEquipment:_.kind==="heatPump",at_original_plan:L,source:"",confidence:_.confidence,notes:"",dimensions_in:_.size_in||null}),V}rt.house.fixtures.forEach(Ne);let Pe=rt.house.fixtures.filter(_=>["lavatory","sink","toilet","tub","shower","washer","dishwasher","waterHeater"].includes(_.kind)),qe=[E(1100,480,-.55),E(500,480,-.55),E(220,480,-.55),I(10,100,-.55)];C("waste","4-inch sanitary collector \xB7 schematic",qe,h.waste,4*$,{id:"sanitary-main",source:"",dimensions_in:[4],notes:""});for(let _ of Pe){let L=U(_.at),B=E(_.at[0],480,-.55);C("waste",_.name+" waste branch",[[L[0],.45,L[2]],[L[0],-.55,L[2]],B],h.waste,(_.kind==="toilet"?3:2)*$,{source:"",fixture_id:_.id}),_.kind!=="toilet"&&C("water",_.name+" hot water \xB7 schematic",[[L[0]-.05,.8,L[2]],[L[0]-.05,2.6,L[2]],[E(470,0)[0],2.6,L[2]]],h.hot,.5*$,{source:"",fixture_id:_.id}),C("water",_.name+" cold water \xB7 schematic",[[L[0]+.05,.8,L[2]],[L[0]+.05,2.7,L[2]],[E(475,0)[0],2.7,L[2]]],h.water,.75*$,{source:"",fixture_id:_.id})}for(let _ of[230,410,835,1040,1260])C("waste","Plumbing vent riser \xB7 schematic",[E(_,450,-.5),E(_,450,4.5)],h.waste,2*$,{source:"",confidence:"schematic"});let st=[{id:"panel-A",u:0,v:370,name:"Panel A \xB7 400 A service",rating:"400 A"},{id:"panel-B",u:1275,v:550,name:"Panel B \xB7 approximate service",rating:"Approximate"}];for(let _ of st){let L=E(_.u,_.v,1.45);g("electrical",_.name,L,[.13,.6,.42],h.metal,{id:_.id,source:"",confidence:_.id==="panel-B"?"conflict":"dimensioned",rating:_.rating,notes:""}),x(_.name,L,_.id)}for(let _ of rt.electrical_devices){let J=function(S,V,O){let P=new Ke(new St(...S),O);return P.position.set(...V),L.add(P),P},L=new Lt;L.position.set(...U(_.at,_.height_in*$));let B=l("lamp","#eee2bf",{emissive:"#f5ce89",emissiveIntensity:.3});if(_.kind==="fan"){let S=new Ke(new vi(.1,.1,.12,16),h.metal);L.add(S);for(let V=0;V<4;V++){let O=J([.62,.025,.1],[0,-.03,0],h.woodDark);O.rotation.y=V*Math.PI/2,O.position.set(Math.cos(V*Math.PI/2)*.3,-.03,Math.sin(V*Math.PI/2)*.3)}}else if(["recessed","pendant","smoke-CO","exhaust"].includes(_.kind)){let S=_.kind==="exhaust"?.12:_.kind==="smoke-CO"?.065:.08,V=new Ke(new vi(S,S,.035,16),_.kind==="smoke-CO"?h.fixture:B);L.add(V)}else _.kind==="linear-light"?J([1.2,.06,.22],[0,0,0],B):(J([.08,.13,.028],[0,0,0],_.kind==="disconnect"?h.metal:h.fixture),J([.012,.02,.032],[-.017,.025,0],h.metal),J([.012,.02,.032],[.017,.025,0],h.metal));f(L,"electrical",_.kind.replaceAll("-"," ")+" fixture",{..._,dimensions_in:null})}for(let _ of st){let L=_.id==="panel-A"?E(450,480,2.95):E(1180,600,2.95);R("electrical",_.name+" distribution path",[E(_.u,_.v,2.95),L],"#c89a40",{source:"",confidence:"schematic",notes:""},!0)}for(let _ of rt.house.rooms.filter(L=>!L.name.includes("closet")&&!L.name.includes("Garage")&&!L.name.includes("mechanical"))){let L=_.center[0]<700?E(200,58,2.8):E(1285,575,2.8),B=U(_.center,2.8);C("hvac",_.name+" duct branch \xB7 schematic",[L,[B[0],L[1],L[2]],B],h.duct,.23,{source:"",confidence:"schematic",notes:""}),g("hvac",_.name+" supply diffuser",B,[.35,.04,.25],h.fixture,{source:"",confidence:"schematic"})}let D=ci.degToRad(1+18/60+20/3600),ue=Math.cos(D),ce=Math.sin(D),le=(_,L)=>[_*ue+L*ce,-_*ce+L*ue],oe=[208.241483858,204.703896459],xe=ci.degToRad(3+8/3600)-D,pe=new me(Math.cos(xe),-Math.sin(xe)),ve=new me(Math.sin(xe),Math.cos(xe)),Ve=ci.degToRad(3+8/3600),ke=[-Math.sin(Ve),Math.cos(Ve)],A=ci.degToRad(21/60+14/3600),v=[-Math.cos(A),Math.sin(A)],Y=oe[0]*ke[0]+oe[1]*ke[1]-15,ne=oe[0]*v[0]+oe[1]*v[1]+10+4/12,de=ke[0]*v[1]-ke[1]*v[0],re=[(Y*v[1]-ke[1]*ne)/de,(ke[0]*ne-Y*v[0])/de],Ie=le(...re),ge=[Ie[0]*Mt,-Ie[1]*Mt],we=(_,L,B=0)=>[ge[0]+pe.x*(_-60)*Mt+ve.x*L*Mt,B,ge[1]+pe.y*(_-60)*Mt+ve.y*L*Mt],De=[we(0,0),we(60,0),we(60,40),we(0,40)].map(_=>[_[0],_[2]]);T("barn","Barn slab",De,0,5*$,h.concrete,{id:"barn-slab",confidence:"dimensioned"});function fe(_,L,B){let J=new N(...L),S=new N(...B),V=J.distanceTo(S),O=new Lt;O.position.copy(J).add(S).multiplyScalar(.5),O.quaternion.setFromUnitVectors(new N(0,0,1),S.sub(J).normalize());for(let[P,W,k]of[[6,.25,4.875],[6,.25,-4.875],[.2,9.5,0]]){let ie=new Ke(new St(P*$,W*$,V),h.steel);ie.position.y=k*$,O.add(ie)}f(O,"barn",_,{confidence:"derived",barnStructure:!0})}for(let _ of[0,20,40,60])fe("Barn frame "+(_/20+1)+" north column",we(_,0,0),we(_,0,18*Mt)),fe("Barn frame "+(_/20+1)+" south column",we(_,40,0),we(_,40,18*Mt)),fe("Barn frame "+(_/20+1)+" north rafter",we(_,0,18*Mt),we(_,20,(19+8/12)*Mt)),fe("Barn frame "+(_/20+1)+" south rafter",we(_,20,(19+8/12)*Mt),we(_,40,18*Mt));for(let _=0;_<=40;_+=5)u("barn","Barn roof purlin",we(0,_,(18+Math.min(_,40-_)/12)*Mt-4*$),we(60,_,(18+Math.min(_,40-_)/12)*Mt-4*$),2.5*$,8*$,h.steel,{confidence:"derived",barnStructure:!0});for(let _ of[44,88,120,156,192])for(let L of[.11,39.89])u("barn","Barn wall girt",we(0,L,_*$),we(60,L,_*$),2.5*$,8*$,h.steel,{confidence:"dimensioned",barnStructure:!0});for(let _ of[0,40])for(let[L,B]of[[[20,0],[40,18]],[[40,0],[20,18]]])m("barn","Barn cable bracing",we(L[0],_,L[1]*Mt),we(B[0],_,B[1]*Mt),.125*$,h.metal,{confidence:"derived",barnStructure:!0});n.updateMatrixWorld(!0);let Te=Object.fromEntries(t.map(_=>[_.userData.id,_]));return{root:n,layers:e,objects:t,registry:Te,labels:i,roomTargets:s,circuits:r,roofParts:ye,trussParts:Se,trussGallery:Ce,trussProfile:ae,barnTarget:we(30,20,3),batches:[],materials:h,P:E,SP:I,BP:y,helpers:{box:g,beam:u,line:R,route:C,register:f},metadata:{wallSegments:rt.house.walls.length,rooms:rt.house.rooms.length,houseOpenings:rt.house.openings.length,fixtureGroups:rt.house.fixtures.length,electricalSymbols:rt.electrical_devices.length,trussVectorContours:rt.truss_vectors.reduce((_,L)=>_+L.members.length,0)}}}function Gh(n,e){let t=[{id:"all",label:"Everything"},{id:"plumbing",label:"Plumbing"},{id:"electrical",label:"Outlets & electrical"},{id:"structure",label:"Studs & trusses"},{id:"drainage",label:"Drainage & septic"},{id:"hvac",label:"Heating & cooling"}],i=[...e.house.rooms.map(({id:y,name:x})=>({id:y,name:x})),{id:"outside",name:"Outside"},{id:"barn",name:"Barn"}],r=Object.fromEntries(i.map(y=>[y.id,y])),s=n.objects,o=[],a=new Map,c=new Set,l=y=>Math.abs(y.reduce((x,C,z)=>{let X=y[(z+1)%y.length];return x+C[0]*X[1]-X[0]*C[1]},0))/2,d=(y,x)=>{let C=!1;for(let z=0,X=x.length-1;z<x.length;X=z++){let G=x[z],K=x[X];G[1]>y[1]!=K[1]>y[1]&&y[0]<(K[0]-G[0])*(y[1]-G[1])/(K[1]-G[1])+G[0]&&(C=!C)}return C},h=(y,x)=>Math.min(...x.map((C,z)=>{let X=x[(z+1)%x.length],G=X[0]-C[0],K=X[1]-C[1],j=Math.max(0,Math.min(1,((y[0]-C[0])*G+(y[1]-C[1])*K)/(G*G+K*K||1)));return Math.hypot(y[0]-C[0]-j*G,y[1]-C[1]-j*K)}));function p(y){if(!y)return"outside";let x=e.house.rooms.map(X=>({r:X,d:h(y,X.polygon),inside:d(y,X.polygon),area:l(X.polygon)})),C=x.filter(X=>X.inside).sort((X,G)=>X.area-G.area);if(C.length)return C[0].r.id;let z=x.sort((X,G)=>X.d-G.d||X.area-G.area)[0];return z?.d<=18?z.r.id:"outside"}let f=y=>{let x=e.local_placement;return[(y.position.z/.3048+x.north_ft)*12,849-(y.position.x/.3048-x.east_ft)*12]};function g({id:y,name:x,category:C,roomId:z="outside",relatedIds:X=[],keywords:G="",roomIds:K,...j}){if(!n.registry[y]||c.has(y))return;c.add(y);let he={id:y,name:x,category:C,categoryLabel:t.find(ee=>ee.id===C)?.label,roomId:z,roomName:r[z]?.name||"Outside",roomIds:K||[z],relatedIds:[...new Set([y,...X].filter(ee=>n.registry[ee]))],keywords:G,...j};return he.searchText=E([he.name,he.category,he.roomName,he.keywords,...he.roomIds.map(ee=>r[ee]?.name||"")].join(" ")),o.push(he),a.set(y,he),he}let w=new Set(["lavatory","sink","toilet","tub","shower","washer","dishwasher","waterHeater"]);for(let y of e.house.fixtures)if(w.has(y.kind)){let x=s.filter(z=>z.userData.fixture_id===y.id),C=x.find(z=>z.userData.layer==="waste");g({id:C?.userData.id||y.id,fixtureId:y.id,name:y.name.replace(/\bWC\b/g,"toilet")+" \xB7 waste & water",category:"plumbing",roomId:p(y.at),relatedIds:[y.id,...x.map(z=>z.userData.id)],keywords:`${y.kind} drain line pipe hot cold supply waste water plumbing ${y.kind==="lavatory"?"sink basin":""}`})}else["heatPump","airHandler"].includes(y.kind)&&g({id:y.id,name:y.name,category:"hvac",roomId:y.kind==="heatPump"?"outside":p(y.at),keywords:"AC air conditioning condenser unit heating cooling HVAC"});let m={receptacle:"Outlet",GFCI:"GFCI outlet",switch:"Light switch",recessed:"Recessed light",pendant:"Pendant light",fan:"Ceiling fan",exhaust:"Exhaust fan","linear-light":"Linear light","smoke-CO":"Smoke / CO detector",disconnect:"Equipment disconnect"},u={};for(let y of e.electrical_devices){let x=p(y.at),C=x+":"+y.kind,z=u[C]=(u[C]||0)+1;g({id:y.id,name:`${m[y.kind]||y.kind} ${z}`,category:"electrical",roomId:x,keywords:`${y.kind} electrical device ${["GFCI","receptacle"].includes(y.kind)?"outlet plug socket receptacle power":""} ${["switch","recessed","pendant","linear-light"].includes(y.kind)?"lighting":""}`})}for(let y of["panel-A","panel-B"]){let x=n.registry[y];x&&g({id:y,name:x.name,category:"electrical",roomId:p(f(x)),keywords:"breaker panel circuit power service distribution wire wiring"})}for(let y of e.house.walls){let x=s.filter(G=>G.userData.wall_id===y.id&&G.userData.layer==="walls");if(!x.length)continue;let C=[(y.a[0]+y.b[0])/2,(y.a[1]+y.b[1])/2],z=p(C),X=e.house.rooms.filter(G=>h(C,G.polygon)<=12).map(G=>G.id);g({id:x[0].userData.id,name:y.name+" \xB7 studs & plates",category:"structure",roomId:z,roomIds:[...new Set([z,...X])],relatedIds:x.map(G=>G.userData.id),keywords:"stud framing wall timber wood plate header structure",wallId:y.id})}let R=new Map;for(let y of s){let x=y.userData;x.layer==="trusses"&&x.mark&&(R.has(x.mark)||R.set(x.mark,[]),R.get(x.mark).push(y))}for(let[y,x]of R){let C=x[0];g({id:C.userData.id,name:`Truss ${y}`,category:"structure",roomId:p(f(C)),relatedIds:x.map(z=>z.userData.id),keywords:"roof truss trusses rafter chord web framing timber structure",trussMark:y})}let T=new Map;for(let y of s){let x=y.userData;if(x.layer==="barn"&&!x.barnSkin&&/column|rafter|purlin|girt/.test(x.name)){let C=x.name.replace(/ · (web|flange.*)$/,"").replace(/ (web|flange.*)$/,"");T.has(C)||T.set(C,[]),T.get(C).push(y)}}for(let[y,x]of T)g({id:x[0].userData.id,name:y,category:"structure",roomId:"barn",relatedIds:x.map(C=>C.userData.id),keywords:"barn steel framing beam"});for(let y of s){let x=y.userData;if(!c.has(x.id))if((x.layer==="septic"||["sanitary-main","irrigation-channel"].includes(x.id))&&!/location marker|connection unverified/.test(x.name))g({id:x.id,name:x.name.replace(/ · schematic$/,""),category:"drainage",relatedIds:x.id==="sanitary-main"?["septic-tank-1","septic-tank-2"]:[],keywords:"drain drainage "+(x.id==="irrigation-channel"?"irrigation runoff":/disposal|drainfield/.test(x.name)?"wastewater sewer septic leach field":"wastewater sewer septic")});else if(x.layer==="hvac"&&/duct branch|supply diffuser/.test(x.name)){let C=e.house.rooms.find(z=>x.name.startsWith(z.name+" "));g({id:x.id,name:x.name.replace(/ · schematic$/,""),category:"hvac",roomId:C?.id||"outside",keywords:"AC duct vent air conditioning heating cooling supply HVAC"})}else x.layer==="waste"&&/vent riser/.test(x.name)&&g({id:x.id,name:x.name,category:"plumbing",roomId:p(f(y)),keywords:"vent stack plumbing pipe roof"})}let M={plugs:"outlet",plug:"outlet",sockets:"outlet",socket:"outlet",receptacles:"outlet",receptacle:"outlet",outlets:"outlet",toilets:"toilet",wc:"toilet",lavatory:"sink",lavatories:"sink",studs:"stud",trusses:"truss",trusts:"truss",trust:"truss",drains:"drain",drainage:"drain",draining:"drain",pipes:"pipe",lines:"line",wires:"wire",wiring:"wire",cables:"wire",cable:"wire",switches:"switch",lights:"light",electrical:"electric",electricity:"electric",bathrooms:"bathroom",bath:"bathroom"},F=new Set(["where","is","are","the","this","that","these","those","a","an","my","our","can","i","we","you","please","find","show","me","it","its","does","do","go","goes","to","from","in","of","for","and","with","which","how","look","at","want"]);function E(y){return String(y||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}function U(y){return E(y).split(/\s+/).filter(x=>x&&!F.has(x)).map(x=>M[x]||x)}for(let y of o)y.tokens=U(y.searchText);function I({query:y="",room:x="",category:C="all",limit:z=60}={}){let X=U(y);return o.filter(G=>(!x||G.roomIds.includes(x))&&(C==="all"||G.category===C)).map(G=>{let K=0;for(let j of X)if(G.tokens.includes(j))K+=8;else if(G.tokens.some(he=>he.startsWith(j)))K+=3;else return null;return X.includes("toilet")&&G.fixtureId&&(K+=5),X.includes("outlet")&&/outlet/.test(G.name.toLowerCase())&&(K+=5),/drainage|septic/.test(y.toLowerCase())&&G.category==="drainage"&&(K+=9),{e:G,score:K}}).filter(Boolean).sort((G,K)=>K.score-G.score||G.e.roomName.localeCompare(K.e.roomName)||G.e.name.localeCompare(K.e.name,void 0,{numeric:!0})).slice(0,z).map(G=>G.e)}return{rooms:i,categories:t,entries:o,search:I,get:y=>a.get(y),related:y=>a.get(y)?.relatedIds||[y],roomAt:p}}var et=n=>document.getElementById(n),s1={dimensioned:"Measured",derived:"Derived",approximate:"Approximate",schematic:"Illustrative",conflict:"Approximate"},Nl=n=>{if(parent!==window){parent.postMessage({type:n},location.origin);return}location.assign(n==="farm-house-property"?"/examples/lab/concepts/house-explorer/":"/")};function o1(){if(rt.schema!=="farm-house-construction-safe-v2")throw new Error("The construction study is unavailable.");let n=Vh();Object.assign(n.layers.walls,{visible:!0}),Object.assign(n.layers.trusses,{visible:!0}),Object.assign(n.layers.roof,{visible:!1}),Object.assign(n.layers.finishes,{visible:!1}),Object.assign(n.layers.ceilings,{visible:!1}),Object.assign(n.layers.barn,{visible:!1});let e=Gh(n,rt),t=new Ar;t.background=new Ye("#121317"),t.add(n.root,n.trussGallery);let i=new ta({antialias:!0});i.setPixelRatio(Math.min(devicePixelRatio,1.5)),i.outputColorSpace=Dt,i.shadowMap.enabled=!0,i.localClippingEnabled=!0,i.domElement.tabIndex=0,i.domElement.setAttribute("aria-label","Farm House construction model. Drag to orbit and scroll to zoom."),et("view").append(i.domElement);let r=new kt(42,1,.05,600),s=new ra(r,i.domElement);s.maxPolarAngle=Math.PI*.49,s.minDistance=.15,s.maxDistance=160,t.add(new qr("#fff2d3","#25312c",2.2));let o=new Zr("#fff3d9",3);o.position.set(-35,60,20),o.castShadow=!0,t.add(o);let a,c,l=!1,d=new N(...n.P(655,424,2)),h={target:d.clone(),size:44},p=new qt(new N(0,-1,0),0),f=()=>i.render(t,r);function g(I=d,y=44){if(l){let C=new ii().setFromObject(n.trussGallery),z=C.getSize(new N),X=Math.max(z.y/.43,z.x/r.aspect/.78,.2),G=X/(2*Math.tan(ci.degToRad(r.fov/2))),K=C.getCenter(new N);K.y+=X*.1,s.target.copy(K),r.position.copy(K).add(new N(0,G*.04,G)),s.update(),f();return}h={target:I.clone(),size:y};let x=y/Math.min(1,Math.max(r.aspect,.25));s.target.copy(I),r.position.copy(I).add(new N(-1,.8,.8).normalize().multiplyScalar(x/(2*Math.tan(ci.degToRad(r.fov/2))))),s.update(),f()}function w(){return l?(n.trussGallery.clear(),n.trussGallery.visible=!1,n.root.visible=!0,l=!1,et("view-title").textContent="See the build.",et("view-kicker").textContent="Construction study",g(),!0):!1}function m(){a=null,c&&(t.remove(c),c.geometry.dispose(),c.material.dispose(),c=null),et("selected").hidden=!0,n.objects.forEach(I=>{I.visible=!I.userData.alwaysHidden}),f()}function u(I){w();let y=n.registry[I],x=e.get(I);if(!y)return;m(),a=x||{id:I,name:y.name,category:y.userData.layer,confidence:y.userData.confidence,relatedIds:[I]},n.layers[y.userData.layer].visible=!0,E.get(y.userData.layer).checked=!0,n.objects.forEach(z=>{z.visible=(a.relatedIds||[I]).includes(z.userData.id)}),y.visible=!0,c=new Kr(y,"#ff7839"),c.material.depthTest=!1,t.add(c),et("selected").hidden=!1,et("selected-name").textContent=a.name||y.name,et("selected-meta").textContent=`${a.category||y.userData.layer} \xB7 ${s1[a.confidence]||"Approximate"}`;let C=new ii().setFromObject(y);g(C.getCenter(new N),Math.max(9,C.getSize(new N).length()*1.8)),R()}function R(){let I=e.search({query:et("search").value,limit:480});et("results").replaceChildren(...I.map(y=>{let x=document.createElement("button");return x.className="result",x.type="button",x.textContent=`${y.name} \xB7 ${y.roomName}`,x.addEventListener("click",()=>u(y.id)),x})),et("count").textContent=I.length?`${I.length} matches`:"Try outlet, toilet, truss, or air."}function T(I){n.trussGallery.clear();let y=n.trussProfile(I);if(!y.children.length)return;m(),n.root.visible=!1,n.trussGallery.visible=!0,n.trussGallery.add(y),l=!0;let x=new ii().setFromObject(y),C=x.getSize(new N);et("view-title").textContent=`Truss ${I}`,et("view-kicker").textContent="Individual profile \xB7 Illustrative placement",g(x.getCenter(new N),Math.max(C.x,C.y,C.z)*1.45)}function M(I){n.layers.barn.visible=I,et("barn-toggle").checked=I,E.has("barn")&&(E.get("barn").checked=I)}function F(){w(),m(),M(!0),g(new N(...n.barnTarget),28)}let E=new Map;for(let[I,y]of Ul){if(!n.layers[I].children.length)continue;let x=document.createElement("label"),C=document.createElement("input");x.className="layer",C.type="checkbox",C.checked=n.layers[I].visible,C.addEventListener("change",()=>{n.layers[I].visible=C.checked,I==="barn"&&(et("barn-toggle").checked=C.checked),f()}),E.set(I,C),x.append(C,document.createTextNode(y)),et("layers").append(x)}for(let I of rt.trusses){let y=document.createElement("option");y.value=I.mark,y.textContent=I.mark,et("truss").append(y)}et("truss").value=rt.trusses.find(I=>rt.truss_vectors.some(y=>y.mark===I.mark))?.mark||rt.trusses[0]?.mark||"",et("search").addEventListener("input",R),et("reset").addEventListener("click",()=>{w(),m(),g()}),et("property").addEventListener("click",()=>Nl("farm-house-property")),et("exit").addEventListener("click",()=>Nl("farm-house-exit")),et("clear").addEventListener("click",m),et("cut").addEventListener("input",()=>{let I=Number(et("cut").value);i.clippingPlanes=I===100?[]:[p],p.constant=I/100*8,f()}),et("barn-toggle").addEventListener("change",I=>{w(),M(I.target.checked),I.target.checked?g(new N(...n.barnTarget),28):g()}),et("show-barn").addEventListener("click",F),et("show-truss").addEventListener("click",()=>T(et("truss").value)),document.querySelectorAll("[data-q]").forEach(I=>I.addEventListener("click",()=>{et("search").value=I.dataset.q,R()})),document.addEventListener("keydown",I=>{if(I.key==="Escape"){if(w()){I.preventDefault();return}if(a){m(),I.preventDefault();return}Nl("farm-house-exit")}});let U=new Jr;i.domElement.addEventListener("click",I=>{if(l)return;let y=i.domElement.getBoundingClientRect();U.setFromCamera(new me((I.clientX-y.left)/y.width*2-1,-(I.clientY-y.top)/y.height*2+1),r);let C=U.intersectObjects(n.root.children,!0)[0]?.object;for(;C&&!C.userData?.id;)C=C.parent;C&&u(C.userData.id)}),new ResizeObserver(()=>{let I=et("view").getBoundingClientRect();i.setSize(I.width,I.height,!1),r.aspect=I.width/I.height,r.updateProjectionMatrix(),g(h.target,h.size)}).observe(et("view")),s.addEventListener("change",f),R(),g(),new URLSearchParams(location.search).get("collection")==="find"&&(et("search").setAttribute("aria-label","Find construction detail"),document.querySelector("aside").scrollTo({top:0}),matchMedia("(min-width: 701px)").matches&&requestAnimationFrame(()=>et("search").focus({preventScroll:!0}))),window.farmHouseInside=Object.freeze({model:n,renderer:i,camera:r,controls:s,frame:g,select:u,showBarn:F,setGallery:T,getState:()=>({safeData:!0,selected:a?.id||null,entries:e.entries.length,galleryOpen:l})})}try{o1()}catch(n){et("fallback").hidden=!1,et("fallback").textContent=n.message,console.error(n)}
