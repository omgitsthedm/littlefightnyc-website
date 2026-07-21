(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const lo="182",$m=0,Kh=1,qm=2,Zo=1,Km=2,wa=3,or=0,li=1,rn=2,Fi=0,Ws=1,Zh=2,jh=3,Jh=4,Zm=5,Jr=100,jm=101,Jm=102,Qm=103,eg=104,tg=200,ig=201,ng=202,rg=203,Ic=204,Nc=205,sg=206,ag=207,og=208,lg=209,cg=210,ug=211,hg=212,fg=213,dg=214,Fc=0,fl=1,Oc=2,Qs=3,Bc=4,zc=5,kc=6,Hc=7,Nd=0,pg=1,mg=2,Hn=0,Fd=1,Od=2,Bd=3,zd=4,kd=5,Hd=6,Vd=7,Gd=300,hs=301,ea=302,Vc=303,Gc=304,Rl=306,Wc=1e3,ir=1001,Xc=1002,di=1003,gg=1004,go=1005,Zt=1006,Bl=1007,es=1008,Kt=1009,Wd=1010,Xd=1011,Za=1012,ih=1013,Rn=1014,Fn=1015,lr=1016,nh=1017,rh=1018,ta=1020,Yd=35902,$d=35899,qd=1021,Kd=1022,An=1023,cr=1026,Er=1027,Zd=1028,sh=1029,ia=1030,ah=1031,oh=1033,jo=33776,Jo=33777,Qo=33778,el=33779,Yc=35840,$c=35841,qc=35842,Kc=35843,Zc=36196,jc=37492,Jc=37496,Qc=37488,eu=37489,tu=37490,iu=37491,nu=37808,ru=37809,su=37810,au=37811,ou=37812,lu=37813,cu=37814,uu=37815,hu=37816,fu=37817,du=37818,pu=37819,mu=37820,gu=37821,_u=36492,vu=36494,xu=36495,Su=36283,Mu=36284,Eu=36285,yu=36286,co=3200,jd=0,_g=1,In="",yt="srgb",Lr="srgb-linear",dl="linear",Et="srgb",Ms=7680,Qh=519,vg=512,xg=513,Sg=514,lh=515,Mg=516,Eg=517,ch=518,yg=519,ef=35044,tf="300 es",On=2e3,pl=2001;function Jd(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function ml(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function bg(){const n=ml("canvas");return n.style.display="block",n}const nf={};function rf(...n){const e="THREE."+n.shift();console.log(e,...n)}function $e(...n){const e="THREE."+n.shift();console.warn(e,...n)}function gt(...n){const e="THREE."+n.shift();console.error(e,...n)}function ja(...n){const e=n.join(" ");e in nf||(nf[e]=!0,$e(...n))}function Tg(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}class fr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const r=i[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const xi=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],zl=Math.PI/180,bu=180/Math.PI;function uo(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(xi[n&255]+xi[n>>8&255]+xi[n>>16&255]+xi[n>>24&255]+"-"+xi[e&255]+xi[e>>8&255]+"-"+xi[e>>16&15|64]+xi[e>>24&255]+"-"+xi[t&63|128]+xi[t>>8&255]+"-"+xi[t>>16&255]+xi[t>>24&255]+xi[i&255]+xi[i>>8&255]+xi[i>>16&255]+xi[i>>24&255]).toLowerCase()}function lt(n,e,t){return Math.max(e,Math.min(t,n))}function wg(n,e){return(n%e+e)%e}function kl(n,e,t){return(1-t)*n+t*e}function ma(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function ki(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class Ve{constructor(e=0,t=0){Ve.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=lt(this.x,e.x,t.x),this.y=lt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=lt(this.x,e,t),this.y=lt(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(lt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(lt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ho{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,a,o){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3],f=s[a+0],d=s[a+1],_=s[a+2],g=s[a+3];if(o<=0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(o>=1){e[t+0]=f,e[t+1]=d,e[t+2]=_,e[t+3]=g;return}if(h!==g||l!==f||c!==d||u!==_){let m=l*f+c*d+u*_+h*g;m<0&&(f=-f,d=-d,_=-_,g=-g,m=-m);let p=1-o;if(m<.9995){const x=Math.acos(m),y=Math.sin(x);p=Math.sin(p*x)/y,o=Math.sin(o*x)/y,l=l*p+f*o,c=c*p+d*o,u=u*p+_*o,h=h*p+g*o}else{l=l*p+f*o,c=c*p+d*o,u=u*p+_*o,h=h*p+g*o;const x=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=x,c*=x,u*=x,h*=x}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,a){const o=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[a],f=s[a+1],d=s[a+2],_=s[a+3];return e[t]=o*_+u*h+l*d-c*f,e[t+1]=l*_+u*f+c*h-o*d,e[t+2]=c*_+u*d+o*f-l*h,e[t+3]=u*_-o*h-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),u=o(r/2),h=o(s/2),f=l(i/2),d=l(r/2),_=l(s/2);switch(a){case"XYZ":this._x=f*u*h+c*d*_,this._y=c*d*h-f*u*_,this._z=c*u*_+f*d*h,this._w=c*u*h-f*d*_;break;case"YXZ":this._x=f*u*h+c*d*_,this._y=c*d*h-f*u*_,this._z=c*u*_-f*d*h,this._w=c*u*h+f*d*_;break;case"ZXY":this._x=f*u*h-c*d*_,this._y=c*d*h+f*u*_,this._z=c*u*_+f*d*h,this._w=c*u*h-f*d*_;break;case"ZYX":this._x=f*u*h-c*d*_,this._y=c*d*h+f*u*_,this._z=c*u*_-f*d*h,this._w=c*u*h+f*d*_;break;case"YZX":this._x=f*u*h+c*d*_,this._y=c*d*h+f*u*_,this._z=c*u*_-f*d*h,this._w=c*u*h-f*d*_;break;case"XZY":this._x=f*u*h-c*d*_,this._y=c*d*h-f*u*_,this._z=c*u*_+f*d*h,this._w=c*u*h+f*d*_;break;default:$e("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],h=t[10],f=i+o+h;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-l)*d,this._y=(s-c)*d,this._z=(a-r)*d}else if(i>o&&i>h){const d=2*Math.sqrt(1+i-o-h);this._w=(u-l)/d,this._x=.25*d,this._y=(r+a)/d,this._z=(s+c)/d}else if(o>h){const d=2*Math.sqrt(1+o-i-h);this._w=(s-c)/d,this._x=(r+a)/d,this._y=.25*d,this._z=(l+u)/d}else{const d=2*Math.sqrt(1+h-i-o);this._w=(a-r)/d,this._x=(s+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(lt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+a*o+r*c-s*l,this._y=r*u+a*l+s*o-i*c,this._z=s*u+a*c+i*l-r*o,this._w=a*u-i*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let i=e._x,r=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,r=-r,s=-s,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+i*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class W{constructor(e=0,t=0,i=0){W.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(sf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(sf.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*r-o*i),u=2*(o*t-s*r),h=2*(s*i-a*t);return this.x=t+l*c+a*h-o*u,this.y=i+l*u+o*c-s*h,this.z=r+l*h+s*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=lt(this.x,e.x,t.x),this.y=lt(this.y,e.y,t.y),this.z=lt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=lt(this.x,e,t),this.y=lt(this.y,e,t),this.z=lt(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(lt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Hl.copy(this).projectOnVector(e),this.sub(Hl)}reflect(e){return this.sub(Hl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(lt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Hl=new W,sf=new ho;class je{constructor(e,t,i,r,s,a,o,l,c){je.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,a,o,l,c)}set(e,t,i,r,s,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=o,u[3]=t,u[4]=s,u[5]=l,u[6]=i,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],u=i[4],h=i[7],f=i[2],d=i[5],_=i[8],g=r[0],m=r[3],p=r[6],x=r[1],y=r[4],M=r[7],T=r[2],A=r[5],w=r[8];return s[0]=a*g+o*x+l*T,s[3]=a*m+o*y+l*A,s[6]=a*p+o*M+l*w,s[1]=c*g+u*x+h*T,s[4]=c*m+u*y+h*A,s[7]=c*p+u*M+h*w,s[2]=f*g+d*x+_*T,s[5]=f*m+d*y+_*A,s[8]=f*p+d*M+_*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-i*s*u+i*o*l+r*s*c-r*a*l}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=u*a-o*c,f=o*l-u*s,d=c*s-a*l,_=t*h+i*f+r*d;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/_;return e[0]=h*g,e[1]=(r*c-u*i)*g,e[2]=(o*i-r*a)*g,e[3]=f*g,e[4]=(u*t-r*l)*g,e[5]=(r*s-o*t)*g,e[6]=d*g,e[7]=(i*l-c*t)*g,e[8]=(a*t-i*s)*g,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Vl.makeScale(e,t)),this}rotate(e){return this.premultiply(Vl.makeRotation(-e)),this}translate(e,t){return this.premultiply(Vl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Vl=new je,af=new je().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),of=new je().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ag(){const n={enabled:!0,workingColorSpace:Lr,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===Et&&(r.r=sr(r.r),r.g=sr(r.g),r.b=sr(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Et&&(r.r=Xs(r.r),r.g=Xs(r.g),r.b=Xs(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===In?dl:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return ja("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return ja("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Lr]:{primaries:e,whitePoint:i,transfer:dl,toXYZ:af,fromXYZ:of,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:yt},outputColorSpaceConfig:{drawingBufferColorSpace:yt}},[yt]:{primaries:e,whitePoint:i,transfer:Et,toXYZ:af,fromXYZ:of,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:yt}}}),n}const ht=Ag();function sr(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Xs(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Es;class Rg{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Es===void 0&&(Es=ml("canvas")),Es.width=e.width,Es.height=e.height;const r=Es.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=Es}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ml("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=sr(s[a]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(sr(t[i]/255)*255):t[i]=sr(t[i]);return{data:t,width:e.width,height:e.height}}else return $e("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Cg=0;class uh{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Cg++}),this.uuid=uo(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Gl(r[a].image)):s.push(Gl(r[a]))}else s=Gl(r);i.url=s}return t||(e.images[this.uuid]=i),i}}function Gl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Rg.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:($e("Texture: Unable to serialize Texture."),{})}let Pg=0;const Wl=new W;class mi extends fr{constructor(e=mi.DEFAULT_IMAGE,t=mi.DEFAULT_MAPPING,i=ir,r=ir,s=Zt,a=es,o=An,l=Kt,c=mi.DEFAULT_ANISOTROPY,u=In){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Pg++}),this.uuid=uo(),this.name="",this.source=new uh(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ve(0,0),this.repeat=new Ve(1,1),this.center=new Ve(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Wl).x}get height(){return this.source.getSize(Wl).y}get depth(){return this.source.getSize(Wl).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){$e(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){$e(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Gd)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Wc:e.x=e.x-Math.floor(e.x);break;case ir:e.x=e.x<0?0:1;break;case Xc:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Wc:e.y=e.y-Math.floor(e.y);break;case ir:e.y=e.y<0?0:1;break;case Xc:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}mi.DEFAULT_IMAGE=null;mi.DEFAULT_MAPPING=Gd;mi.DEFAULT_ANISOTROPY=1;class It{constructor(e=0,t=0,i=0,r=1){It.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*i+a[11]*r+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s;const l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],d=l[5],_=l[9],g=l[2],m=l[6],p=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-g)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+g)<.1&&Math.abs(_+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,M=(d+1)/2,T=(p+1)/2,A=(u+f)/4,w=(h+g)/4,C=(_+m)/4;return y>M&&y>T?y<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(y),r=A/i,s=w/i):M>T?M<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(M),i=A/r,s=C/r):T<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(T),i=w/s,r=C/s),this.set(i,r,s,t),this}let x=Math.sqrt((m-_)*(m-_)+(h-g)*(h-g)+(f-u)*(f-u));return Math.abs(x)<.001&&(x=1),this.x=(m-_)/x,this.y=(h-g)/x,this.z=(f-u)/x,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=lt(this.x,e.x,t.x),this.y=lt(this.y,e.y,t.y),this.z=lt(this.z,e.z,t.z),this.w=lt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=lt(this.x,e,t),this.y=lt(this.y,e,t),this.z=lt(this.z,e,t),this.w=lt(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(lt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Dg extends fr{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Zt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new It(0,0,e,t),this.scissorTest=!1,this.viewport=new It(0,0,e,t);const r={width:e,height:t,depth:i.depth},s=new mi(r);this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:Zt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new uh(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ci extends Dg{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Qd extends mi{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=di,this.minFilter=di,this.wrapR=ir,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Lg extends mi{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=di,this.minFilter=di,this.wrapR=ir,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class fo{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(En.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(En.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=En.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,En):En.fromBufferAttribute(s,a),En.applyMatrix4(e.matrixWorld),this.expandByPoint(En);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),_o.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),_o.copy(i.boundingBox)),_o.applyMatrix4(e.matrixWorld),this.union(_o)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,En),En.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ga),vo.subVectors(this.max,ga),ys.subVectors(e.a,ga),bs.subVectors(e.b,ga),Ts.subVectors(e.c,ga),dr.subVectors(bs,ys),pr.subVectors(Ts,bs),zr.subVectors(ys,Ts);let t=[0,-dr.z,dr.y,0,-pr.z,pr.y,0,-zr.z,zr.y,dr.z,0,-dr.x,pr.z,0,-pr.x,zr.z,0,-zr.x,-dr.y,dr.x,0,-pr.y,pr.x,0,-zr.y,zr.x,0];return!Xl(t,ys,bs,Ts,vo)||(t=[1,0,0,0,1,0,0,0,1],!Xl(t,ys,bs,Ts,vo))?!1:(xo.crossVectors(dr,pr),t=[xo.x,xo.y,xo.z],Xl(t,ys,bs,Ts,vo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,En).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(En).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:($n[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),$n[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),$n[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),$n[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),$n[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),$n[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),$n[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),$n[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints($n),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const $n=[new W,new W,new W,new W,new W,new W,new W,new W],En=new W,_o=new fo,ys=new W,bs=new W,Ts=new W,dr=new W,pr=new W,zr=new W,ga=new W,vo=new W,xo=new W,kr=new W;function Xl(n,e,t,i,r){for(let s=0,a=n.length-3;s<=a;s+=3){kr.fromArray(n,s);const o=r.x*Math.abs(kr.x)+r.y*Math.abs(kr.y)+r.z*Math.abs(kr.z),l=e.dot(kr),c=t.dot(kr),u=i.dot(kr);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const Ug=new fo,_a=new W,Yl=new W;class hh{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Ug.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;_a.subVectors(e,this.center);const t=_a.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(_a,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Yl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(_a.copy(e.center).add(Yl)),this.expandByPoint(_a.copy(e.center).sub(Yl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const qn=new W,$l=new W,So=new W,mr=new W,ql=new W,Mo=new W,Kl=new W;class Ig{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,qn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=qn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(qn.copy(this.origin).addScaledVector(this.direction,t),qn.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){$l.copy(e).add(t).multiplyScalar(.5),So.copy(t).sub(e).normalize(),mr.copy(this.origin).sub($l);const s=e.distanceTo(t)*.5,a=-this.direction.dot(So),o=mr.dot(this.direction),l=-mr.dot(So),c=mr.lengthSq(),u=Math.abs(1-a*a);let h,f,d,_;if(u>0)if(h=a*l-o,f=a*o-l,_=s*u,h>=0)if(f>=-_)if(f<=_){const g=1/u;h*=g,f*=g,d=h*(h+a*f+2*o)+f*(a*h+f+2*l)+c}else f=s,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*l)+c;else f=-s,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*l)+c;else f<=-_?(h=Math.max(0,-(-a*s+o)),f=h>0?-s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+c):f<=_?(h=0,f=Math.min(Math.max(-s,-l),s),d=f*(f+2*l)+c):(h=Math.max(0,-(a*s+o)),f=h>0?s:Math.min(Math.max(-s,-l),s),d=-h*h+f*(f+2*l)+c);else f=a>0?-s:s,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy($l).addScaledVector(So,f),d}intersectSphere(e,t){qn.subVectors(e.center,this.origin);const i=qn.dot(this.direction),r=qn.dot(qn)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(i=(e.min.x-f.x)*c,r=(e.max.x-f.x)*c):(i=(e.max.x-f.x)*c,r=(e.min.x-f.x)*c),u>=0?(s=(e.min.y-f.y)*u,a=(e.max.y-f.y)*u):(s=(e.max.y-f.y)*u,a=(e.min.y-f.y)*u),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),h>=0?(o=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(o=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),i>l||o>r)||((o>i||i!==i)&&(i=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,qn)!==null}intersectTriangle(e,t,i,r,s){ql.subVectors(t,e),Mo.subVectors(i,e),Kl.crossVectors(ql,Mo);let a=this.direction.dot(Kl),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;mr.subVectors(this.origin,e);const l=o*this.direction.dot(Mo.crossVectors(mr,Mo));if(l<0)return null;const c=o*this.direction.dot(ql.cross(mr));if(c<0||l+c>a)return null;const u=-o*mr.dot(Kl);return u<0?null:this.at(u/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ht{constructor(e,t,i,r,s,a,o,l,c,u,h,f,d,_,g,m){Ht.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,a,o,l,c,u,h,f,d,_,g,m)}set(e,t,i,r,s,a,o,l,c,u,h,f,d,_,g,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=r,p[1]=s,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=f,p[3]=d,p[7]=_,p[11]=g,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ht().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,i=e.elements,r=1/ws.setFromMatrixColumn(e,0).length(),s=1/ws.setFromMatrixColumn(e,1).length(),a=1/ws.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const f=a*u,d=a*h,_=o*u,g=o*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=d+_*c,t[5]=f-g*c,t[9]=-o*l,t[2]=g-f*c,t[6]=_+d*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*u,d=l*h,_=c*u,g=c*h;t[0]=f+g*o,t[4]=_*o-d,t[8]=a*c,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=d*o-_,t[6]=g+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*u,d=l*h,_=c*u,g=c*h;t[0]=f-g*o,t[4]=-a*h,t[8]=_+d*o,t[1]=d+_*o,t[5]=a*u,t[9]=g-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*u,d=a*h,_=o*u,g=o*h;t[0]=l*u,t[4]=_*c-d,t[8]=f*c+g,t[1]=l*h,t[5]=g*c+f,t[9]=d*c-_,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,d=a*c,_=o*l,g=o*c;t[0]=l*u,t[4]=g-f*h,t[8]=_*h+d,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=d*h+_,t[10]=f-g*h}else if(e.order==="XZY"){const f=a*l,d=a*c,_=o*l,g=o*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=f*h+g,t[5]=a*u,t[9]=d*h-_,t[2]=_*h-d,t[6]=o*u,t[10]=g*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ng,e,Fg)}lookAt(e,t,i){const r=this.elements;return Zi.subVectors(e,t),Zi.lengthSq()===0&&(Zi.z=1),Zi.normalize(),gr.crossVectors(i,Zi),gr.lengthSq()===0&&(Math.abs(i.z)===1?Zi.x+=1e-4:Zi.z+=1e-4,Zi.normalize(),gr.crossVectors(i,Zi)),gr.normalize(),Eo.crossVectors(Zi,gr),r[0]=gr.x,r[4]=Eo.x,r[8]=Zi.x,r[1]=gr.y,r[5]=Eo.y,r[9]=Zi.y,r[2]=gr.z,r[6]=Eo.z,r[10]=Zi.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],u=i[1],h=i[5],f=i[9],d=i[13],_=i[2],g=i[6],m=i[10],p=i[14],x=i[3],y=i[7],M=i[11],T=i[15],A=r[0],w=r[4],C=r[8],v=r[12],E=r[1],D=r[5],U=r[9],B=r[13],H=r[2],V=r[6],k=r[10],O=r[14],q=r[3],ne=r[7],P=r[11],re=r[15];return s[0]=a*A+o*E+l*H+c*q,s[4]=a*w+o*D+l*V+c*ne,s[8]=a*C+o*U+l*k+c*P,s[12]=a*v+o*B+l*O+c*re,s[1]=u*A+h*E+f*H+d*q,s[5]=u*w+h*D+f*V+d*ne,s[9]=u*C+h*U+f*k+d*P,s[13]=u*v+h*B+f*O+d*re,s[2]=_*A+g*E+m*H+p*q,s[6]=_*w+g*D+m*V+p*ne,s[10]=_*C+g*U+m*k+p*P,s[14]=_*v+g*B+m*O+p*re,s[3]=x*A+y*E+M*H+T*q,s[7]=x*w+y*D+M*V+T*ne,s[11]=x*C+y*U+M*k+T*P,s[15]=x*v+y*B+M*O+T*re,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],d=e[14],_=e[3],g=e[7],m=e[11],p=e[15],x=l*d-c*f,y=o*d-c*h,M=o*f-l*h,T=a*d-c*u,A=a*f-l*u,w=a*h-o*u;return t*(g*x-m*y+p*M)-i*(_*x-m*T+p*A)+r*(_*y-g*T+p*w)-s*(_*M-g*A+m*w)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],d=e[11],_=e[12],g=e[13],m=e[14],p=e[15],x=h*m*c-g*f*c+g*l*d-o*m*d-h*l*p+o*f*p,y=_*f*c-u*m*c-_*l*d+a*m*d+u*l*p-a*f*p,M=u*g*c-_*h*c+_*o*d-a*g*d-u*o*p+a*h*p,T=_*h*l-u*g*l-_*o*f+a*g*f+u*o*m-a*h*m,A=t*x+i*y+r*M+s*T;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/A;return e[0]=x*w,e[1]=(g*f*s-h*m*s-g*r*d+i*m*d+h*r*p-i*f*p)*w,e[2]=(o*m*s-g*l*s+g*r*c-i*m*c-o*r*p+i*l*p)*w,e[3]=(h*l*s-o*f*s-h*r*c+i*f*c+o*r*d-i*l*d)*w,e[4]=y*w,e[5]=(u*m*s-_*f*s+_*r*d-t*m*d-u*r*p+t*f*p)*w,e[6]=(_*l*s-a*m*s-_*r*c+t*m*c+a*r*p-t*l*p)*w,e[7]=(a*f*s-u*l*s+u*r*c-t*f*c-a*r*d+t*l*d)*w,e[8]=M*w,e[9]=(_*h*s-u*g*s-_*i*d+t*g*d+u*i*p-t*h*p)*w,e[10]=(a*g*s-_*o*s+_*i*c-t*g*c-a*i*p+t*o*p)*w,e[11]=(u*o*s-a*h*s-u*i*c+t*h*c+a*i*d-t*o*d)*w,e[12]=T*w,e[13]=(u*g*r-_*h*r+_*i*f-t*g*f-u*i*m+t*h*m)*w,e[14]=(_*o*r-a*g*r-_*i*l+t*g*l+a*i*m-t*o*m)*w,e[15]=(a*h*r-u*o*r+u*i*l-t*h*l-a*i*f+t*o*f)*w,this}scale(e){const t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),s=1-i,a=e.x,o=e.y,l=e.z,c=s*a,u=s*o;return this.set(c*a+i,c*o-r*l,c*l+r*o,0,c*o+r*l,u*o+i,u*l-r*a,0,c*l-r*o,u*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,u=a+a,h=o+o,f=s*c,d=s*u,_=s*h,g=a*u,m=a*h,p=o*h,x=l*c,y=l*u,M=l*h,T=i.x,A=i.y,w=i.z;return r[0]=(1-(g+p))*T,r[1]=(d+M)*T,r[2]=(_-y)*T,r[3]=0,r[4]=(d-M)*A,r[5]=(1-(f+p))*A,r[6]=(m+x)*A,r[7]=0,r[8]=(_+y)*w,r[9]=(m-x)*w,r[10]=(1-(f+g))*w,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;if(e.x=r[12],e.y=r[13],e.z=r[14],this.determinant()===0)return i.set(1,1,1),t.identity(),this;let s=ws.set(r[0],r[1],r[2]).length();const a=ws.set(r[4],r[5],r[6]).length(),o=ws.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),yn.copy(this);const c=1/s,u=1/a,h=1/o;return yn.elements[0]*=c,yn.elements[1]*=c,yn.elements[2]*=c,yn.elements[4]*=u,yn.elements[5]*=u,yn.elements[6]*=u,yn.elements[8]*=h,yn.elements[9]*=h,yn.elements[10]*=h,t.setFromRotationMatrix(yn),i.x=s,i.y=a,i.z=o,this}makePerspective(e,t,i,r,s,a,o=On,l=!1){const c=this.elements,u=2*s/(t-e),h=2*s/(i-r),f=(t+e)/(t-e),d=(i+r)/(i-r);let _,g;if(l)_=s/(a-s),g=a*s/(a-s);else if(o===On)_=-(a+s)/(a-s),g=-2*a*s/(a-s);else if(o===pl)_=-a/(a-s),g=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=h,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,r,s,a,o=On,l=!1){const c=this.elements,u=2/(t-e),h=2/(i-r),f=-(t+e)/(t-e),d=-(i+r)/(i-r);let _,g;if(l)_=1/(a-s),g=a/(a-s);else if(o===On)_=-2/(a-s),g=-(a+s)/(a-s);else if(o===pl)_=-1/(a-s),g=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=h,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=_,c[14]=g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const ws=new W,yn=new Ht,Ng=new W(0,0,0),Fg=new W(1,1,1),gr=new W,Eo=new W,Zi=new W,lf=new Ht,cf=new ho;class Wn{constructor(e=0,t=0,i=0,r=Wn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],u=r[9],h=r[2],f=r[6],d=r[10];switch(t){case"XYZ":this._y=Math.asin(lt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-lt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(lt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-lt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(lt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-lt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,d),this._y=0);break;default:$e("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return lf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(lf,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return cf.setFromEuler(this),this.setFromQuaternion(cf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Wn.DEFAULT_ORDER="XYZ";class ep{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Og=0;const uf=new W,As=new ho,Kn=new Ht,yo=new W,va=new W,Bg=new W,zg=new ho,hf=new W(1,0,0),ff=new W(0,1,0),df=new W(0,0,1),pf={type:"added"},kg={type:"removed"},Rs={type:"childadded",child:null},Zl={type:"childremoved",child:null};class Ti extends fr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Og++}),this.uuid=uo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ti.DEFAULT_UP.clone();const e=new W,t=new Wn,i=new ho,r=new W(1,1,1);function s(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ht},normalMatrix:{value:new je}}),this.matrix=new Ht,this.matrixWorld=new Ht,this.matrixAutoUpdate=Ti.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ti.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ep,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return As.setFromAxisAngle(e,t),this.quaternion.multiply(As),this}rotateOnWorldAxis(e,t){return As.setFromAxisAngle(e,t),this.quaternion.premultiply(As),this}rotateX(e){return this.rotateOnAxis(hf,e)}rotateY(e){return this.rotateOnAxis(ff,e)}rotateZ(e){return this.rotateOnAxis(df,e)}translateOnAxis(e,t){return uf.copy(e).applyQuaternion(this.quaternion),this.position.add(uf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(hf,e)}translateY(e){return this.translateOnAxis(ff,e)}translateZ(e){return this.translateOnAxis(df,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Kn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?yo.copy(e):yo.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),va.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Kn.lookAt(va,yo,this.up):Kn.lookAt(yo,va,this.up),this.quaternion.setFromRotationMatrix(Kn),r&&(Kn.extractRotation(r.matrixWorld),As.setFromRotationMatrix(Kn),this.quaternion.premultiply(As.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(gt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(pf),Rs.child=e,this.dispatchEvent(Rs),Rs.child=null):gt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(kg),Zl.child=e,this.dispatchEvent(Zl),Zl.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Kn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Kn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Kn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(pf),Rs.child=e,this.dispatchEvent(Rs),Rs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(va,e,Bg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(va,zg,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),h=a(e.shapes),f=a(e.skeletons),d=a(e.animations),_=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),_.length>0&&(i.nodes=_)}return i.object=r,i;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}Ti.DEFAULT_UP=new W(0,1,0);Ti.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ti.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const bn=new W,Zn=new W,jl=new W,jn=new W,Cs=new W,Ps=new W,mf=new W,Jl=new W,Ql=new W,ec=new W,tc=new It,ic=new It,nc=new It;class wn{constructor(e=new W,t=new W,i=new W){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),bn.subVectors(e,t),r.cross(bn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){bn.subVectors(r,t),Zn.subVectors(i,t),jl.subVectors(e,t);const a=bn.dot(bn),o=bn.dot(Zn),l=bn.dot(jl),c=Zn.dot(Zn),u=Zn.dot(jl),h=a*c-o*o;if(h===0)return s.set(0,0,0),null;const f=1/h,d=(c*l-o*u)*f,_=(a*u-o*l)*f;return s.set(1-d-_,_,d)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,jn)===null?!1:jn.x>=0&&jn.y>=0&&jn.x+jn.y<=1}static getInterpolation(e,t,i,r,s,a,o,l){return this.getBarycoord(e,t,i,r,jn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,jn.x),l.addScaledVector(a,jn.y),l.addScaledVector(o,jn.z),l)}static getInterpolatedAttribute(e,t,i,r,s,a){return tc.setScalar(0),ic.setScalar(0),nc.setScalar(0),tc.fromBufferAttribute(e,t),ic.fromBufferAttribute(e,i),nc.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(tc,s.x),a.addScaledVector(ic,s.y),a.addScaledVector(nc,s.z),a}static isFrontFacing(e,t,i,r){return bn.subVectors(i,t),Zn.subVectors(e,t),bn.cross(Zn).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return bn.subVectors(this.c,this.b),Zn.subVectors(this.a,this.b),bn.cross(Zn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return wn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return wn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return wn.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return wn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return wn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,s=this.c;let a,o;Cs.subVectors(r,i),Ps.subVectors(s,i),Jl.subVectors(e,i);const l=Cs.dot(Jl),c=Ps.dot(Jl);if(l<=0&&c<=0)return t.copy(i);Ql.subVectors(e,r);const u=Cs.dot(Ql),h=Ps.dot(Ql);if(u>=0&&h<=u)return t.copy(r);const f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(i).addScaledVector(Cs,a);ec.subVectors(e,s);const d=Cs.dot(ec),_=Ps.dot(ec);if(_>=0&&d<=_)return t.copy(s);const g=d*c-l*_;if(g<=0&&c>=0&&_<=0)return o=c/(c-_),t.copy(i).addScaledVector(Ps,o);const m=u*_-d*h;if(m<=0&&h-u>=0&&d-_>=0)return mf.subVectors(s,r),o=(h-u)/(h-u+(d-_)),t.copy(r).addScaledVector(mf,o);const p=1/(m+g+f);return a=g*p,o=f*p,t.copy(i).addScaledVector(Cs,a).addScaledVector(Ps,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const tp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_r={h:0,s:0,l:0},bo={h:0,s:0,l:0};function rc(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class tt{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ht.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=ht.workingColorSpace){return this.r=e,this.g=t,this.b=i,ht.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=ht.workingColorSpace){if(e=wg(e,1),t=lt(t,0,1),i=lt(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,a=2*i-s;this.r=rc(a,s,e+1/3),this.g=rc(a,s,e),this.b=rc(a,s,e-1/3)}return ht.colorSpaceToWorking(this,r),this}setStyle(e,t=yt){function i(s){s!==void 0&&parseFloat(s)<1&&$e("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:$e("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);$e("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yt){const i=tp[e.toLowerCase()];return i!==void 0?this.setHex(i,t):$e("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=sr(e.r),this.g=sr(e.g),this.b=sr(e.b),this}copyLinearToSRGB(e){return this.r=Xs(e.r),this.g=Xs(e.g),this.b=Xs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yt){return ht.workingToColorSpace(Si.copy(this),e),Math.round(lt(Si.r*255,0,255))*65536+Math.round(lt(Si.g*255,0,255))*256+Math.round(lt(Si.b*255,0,255))}getHexString(e=yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ht.workingColorSpace){ht.workingToColorSpace(Si.copy(this),t);const i=Si.r,r=Si.g,s=Si.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ht.workingColorSpace){return ht.workingToColorSpace(Si.copy(this),t),e.r=Si.r,e.g=Si.g,e.b=Si.b,e}getStyle(e=yt){ht.workingToColorSpace(Si.copy(this),e);const t=Si.r,i=Si.g,r=Si.b;return e!==yt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(_r),this.setHSL(_r.h+e,_r.s+t,_r.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(_r),e.getHSL(bo);const i=kl(_r.h,bo.h,t),r=kl(_r.s,bo.s,t),s=kl(_r.l,bo.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Si=new tt;tt.NAMES=tp;let Hg=0;class gs extends fr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Hg++}),this.uuid=uo(),this.name="",this.type="Material",this.blending=Ws,this.side=or,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ic,this.blendDst=Nc,this.blendEquation=Jr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new tt(0,0,0),this.blendAlpha=0,this.depthFunc=Qs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Qh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ms,this.stencilZFail=Ms,this.stencilZPass=Ms,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){$e(`Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){$e(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ws&&(i.blending=this.blending),this.side!==or&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ic&&(i.blendSrc=this.blendSrc),this.blendDst!==Nc&&(i.blendDst=this.blendDst),this.blendEquation!==Jr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Qs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Qh&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ms&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ms&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ms&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class fh extends gs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new tt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.combine=Nd,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Yt=new W,To=new Ve;let Vg=0;class Sn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Vg++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=ef,this.updateRanges=[],this.gpuType=Fn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)To.fromBufferAttribute(this,t),To.applyMatrix3(e),this.setXY(t,To.x,To.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Yt.fromBufferAttribute(this,t),Yt.applyMatrix3(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Yt.fromBufferAttribute(this,t),Yt.applyMatrix4(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Yt.fromBufferAttribute(this,t),Yt.applyNormalMatrix(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Yt.fromBufferAttribute(this,t),Yt.transformDirection(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=ma(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ki(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ma(t,this.array)),t}setX(e,t){return this.normalized&&(t=ki(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ma(t,this.array)),t}setY(e,t){return this.normalized&&(t=ki(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ma(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ki(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ma(t,this.array)),t}setW(e,t){return this.normalized&&(t=ki(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=ki(t,this.array),i=ki(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=ki(t,this.array),i=ki(i,this.array),r=ki(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=ki(t,this.array),i=ki(i,this.array),r=ki(r,this.array),s=ki(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ef&&(e.usage=this.usage),e}}class ip extends Sn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class np extends Sn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class ui extends Sn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Gg=0;const pn=new Ht,sc=new Ti,Ds=new W,ji=new fo,xa=new fo,si=new W;class fn extends fr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Gg++}),this.uuid=uo(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Jd(e)?np:ip)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new je().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return pn.makeRotationFromQuaternion(e),this.applyMatrix4(pn),this}rotateX(e){return pn.makeRotationX(e),this.applyMatrix4(pn),this}rotateY(e){return pn.makeRotationY(e),this.applyMatrix4(pn),this}rotateZ(e){return pn.makeRotationZ(e),this.applyMatrix4(pn),this}translate(e,t,i){return pn.makeTranslation(e,t,i),this.applyMatrix4(pn),this}scale(e,t,i){return pn.makeScale(e,t,i),this.applyMatrix4(pn),this}lookAt(e){return sc.lookAt(e),sc.updateMatrix(),this.applyMatrix4(sc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ds).negate(),this.translate(Ds.x,Ds.y,Ds.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let r=0,s=e.length;r<s;r++){const a=e[r];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ui(i,3))}else{const i=Math.min(e.length,t.count);for(let r=0;r<i;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&$e("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new fo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){gt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const s=t[i];ji.setFromBufferAttribute(s),this.morphTargetsRelative?(si.addVectors(this.boundingBox.min,ji.min),this.boundingBox.expandByPoint(si),si.addVectors(this.boundingBox.max,ji.max),this.boundingBox.expandByPoint(si)):(this.boundingBox.expandByPoint(ji.min),this.boundingBox.expandByPoint(ji.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&gt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new hh);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){gt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new W,1/0);return}if(e){const i=this.boundingSphere.center;if(ji.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];xa.setFromBufferAttribute(o),this.morphTargetsRelative?(si.addVectors(ji.min,xa.min),ji.expandByPoint(si),si.addVectors(ji.max,xa.max),ji.expandByPoint(si)):(ji.expandByPoint(xa.min),ji.expandByPoint(xa.max))}ji.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)si.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(si));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)si.fromBufferAttribute(o,c),l&&(Ds.fromBufferAttribute(e,c),si.add(Ds)),r=Math.max(r,i.distanceToSquared(si))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&gt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){gt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Sn(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let C=0;C<i.count;C++)o[C]=new W,l[C]=new W;const c=new W,u=new W,h=new W,f=new Ve,d=new Ve,_=new Ve,g=new W,m=new W;function p(C,v,E){c.fromBufferAttribute(i,C),u.fromBufferAttribute(i,v),h.fromBufferAttribute(i,E),f.fromBufferAttribute(s,C),d.fromBufferAttribute(s,v),_.fromBufferAttribute(s,E),u.sub(c),h.sub(c),d.sub(f),_.sub(f);const D=1/(d.x*_.y-_.x*d.y);isFinite(D)&&(g.copy(u).multiplyScalar(_.y).addScaledVector(h,-d.y).multiplyScalar(D),m.copy(h).multiplyScalar(d.x).addScaledVector(u,-_.x).multiplyScalar(D),o[C].add(g),o[v].add(g),o[E].add(g),l[C].add(m),l[v].add(m),l[E].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let C=0,v=x.length;C<v;++C){const E=x[C],D=E.start,U=E.count;for(let B=D,H=D+U;B<H;B+=3)p(e.getX(B+0),e.getX(B+1),e.getX(B+2))}const y=new W,M=new W,T=new W,A=new W;function w(C){T.fromBufferAttribute(r,C),A.copy(T);const v=o[C];y.copy(v),y.sub(T.multiplyScalar(T.dot(v))).normalize(),M.crossVectors(A,v);const D=M.dot(l[C])<0?-1:1;a.setXYZW(C,y.x,y.y,y.z,D)}for(let C=0,v=x.length;C<v;++C){const E=x[C],D=E.start,U=E.count;for(let B=D,H=D+U;B<H;B+=3)w(e.getX(B+0)),w(e.getX(B+1)),w(e.getX(B+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Sn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);const r=new W,s=new W,a=new W,o=new W,l=new W,c=new W,u=new W,h=new W;if(e)for(let f=0,d=e.count;f<d;f+=3){const _=e.getX(f+0),g=e.getX(f+1),m=e.getX(f+2);r.fromBufferAttribute(t,_),s.fromBufferAttribute(t,g),a.fromBufferAttribute(t,m),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),o.fromBufferAttribute(i,_),l.fromBufferAttribute(i,g),c.fromBufferAttribute(i,m),o.add(u),l.add(u),c.add(u),i.setXYZ(_,o.x,o.y,o.z),i.setXYZ(g,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)r.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)si.fromBufferAttribute(e,t),si.normalize(),e.setXYZ(t,si.x,si.y,si.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,h=o.normalized,f=new c.constructor(l.length*u);let d=0,_=0;for(let g=0,m=l.length;g<m;g++){o.isInterleavedBufferAttribute?d=l[g]*o.data.stride+o.offset:d=l[g]*u;for(let p=0;p<u;p++)f[_++]=c[d++]}return new Sn(f,u,h)}if(this.index===null)return $e("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new fn,i=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,i);t.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let u=0,h=c.length;u<h;u++){const f=c[u],d=e(f,i);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){const d=c[h];u.push(d.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],h=s[c];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const gf=new Ht,Hr=new Ig,wo=new hh,_f=new W,Ao=new W,Ro=new W,Co=new W,ac=new W,Po=new W,vf=new W,Do=new W;class fi extends Ti{constructor(e=new fn,t=new fh){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){Po.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=o[l],h=s[l];u!==0&&(ac.fromBufferAttribute(h,e),a?Po.addScaledVector(ac,u):Po.addScaledVector(ac.sub(t),u))}t.add(Po)}return t}raycast(e,t){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),wo.copy(i.boundingSphere),wo.applyMatrix4(s),Hr.copy(e.ray).recast(e.near),!(wo.containsPoint(Hr.origin)===!1&&(Hr.intersectSphere(wo,_f)===null||Hr.origin.distanceToSquared(_f)>(e.far-e.near)**2))&&(gf.copy(s).invert(),Hr.copy(e.ray).applyMatrix4(gf),!(i.boundingBox!==null&&Hr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Hr)))}_computeIntersections(e,t,i){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,f=s.groups,d=s.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,g=f.length;_<g;_++){const m=f[_],p=a[m.materialIndex],x=Math.max(m.start,d.start),y=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let M=x,T=y;M<T;M+=3){const A=o.getX(M),w=o.getX(M+1),C=o.getX(M+2);r=Lo(this,p,e,i,c,u,h,A,w,C),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const _=Math.max(0,d.start),g=Math.min(o.count,d.start+d.count);for(let m=_,p=g;m<p;m+=3){const x=o.getX(m),y=o.getX(m+1),M=o.getX(m+2);r=Lo(this,a,e,i,c,u,h,x,y,M),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,g=f.length;_<g;_++){const m=f[_],p=a[m.materialIndex],x=Math.max(m.start,d.start),y=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let M=x,T=y;M<T;M+=3){const A=M,w=M+1,C=M+2;r=Lo(this,p,e,i,c,u,h,A,w,C),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const _=Math.max(0,d.start),g=Math.min(l.count,d.start+d.count);for(let m=_,p=g;m<p;m+=3){const x=m,y=m+1,M=m+2;r=Lo(this,a,e,i,c,u,h,x,y,M),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function Wg(n,e,t,i,r,s,a,o){let l;if(e.side===li?l=i.intersectTriangle(a,s,r,!0,o):l=i.intersectTriangle(r,s,a,e.side===or,o),l===null)return null;Do.copy(o),Do.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(Do);return c<t.near||c>t.far?null:{distance:c,point:Do.clone(),object:n}}function Lo(n,e,t,i,r,s,a,o,l,c){n.getVertexPosition(o,Ao),n.getVertexPosition(l,Ro),n.getVertexPosition(c,Co);const u=Wg(n,e,t,i,Ao,Ro,Co,vf);if(u){const h=new W;wn.getBarycoord(vf,Ao,Ro,Co,h),r&&(u.uv=wn.getInterpolatedAttribute(r,o,l,c,h,new Ve)),s&&(u.uv1=wn.getInterpolatedAttribute(s,o,l,c,h,new Ve)),a&&(u.normal=wn.getInterpolatedAttribute(a,o,l,c,h,new W),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new W,materialIndex:0};wn.getNormal(Ao,Ro,Co,f.normal),u.face=f,u.barycoord=h}return u}class fs extends fn{constructor(e=1,t=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],u=[],h=[];let f=0,d=0;_("z","y","x",-1,-1,i,t,e,a,s,0),_("z","y","x",1,-1,i,t,-e,a,s,1),_("x","z","y",1,1,e,i,t,r,a,2),_("x","z","y",1,-1,e,i,-t,r,a,3),_("x","y","z",1,-1,e,t,i,r,s,4),_("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new ui(c,3)),this.setAttribute("normal",new ui(u,3)),this.setAttribute("uv",new ui(h,2));function _(g,m,p,x,y,M,T,A,w,C,v){const E=M/w,D=T/C,U=M/2,B=T/2,H=A/2,V=w+1,k=C+1;let O=0,q=0;const ne=new W;for(let P=0;P<k;P++){const re=P*D-B;for(let Le=0;Le<V;Le++){const Oe=Le*E-U;ne[g]=Oe*x,ne[m]=re*y,ne[p]=H,c.push(ne.x,ne.y,ne.z),ne[g]=0,ne[m]=0,ne[p]=A>0?1:-1,u.push(ne.x,ne.y,ne.z),h.push(Le/w),h.push(1-P/C),O+=1}}for(let P=0;P<C;P++)for(let re=0;re<w;re++){const Le=f+re+V*P,Oe=f+re+V*(P+1),We=f+(re+1)+V*(P+1),qe=f+(re+1)+V*P;l.push(Le,Oe,qe),l.push(Oe,We,qe),q+=6}o.addGroup(d,q,v),d+=q,f+=O}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new fs(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function na(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?($e("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Pi(n){const e={};for(let t=0;t<n.length;t++){const i=na(n[t]);for(const r in i)e[r]=i[r]}return e}function Xg(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function rp(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ht.workingColorSpace}const Yg={clone:na,merge:Pi};var $g=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,qg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class _i extends gs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=$g,this.fragmentShader=qg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=na(e.uniforms),this.uniformsGroups=Xg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class sp extends Ti{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ht,this.projectionMatrix=new Ht,this.projectionMatrixInverse=new Ht,this.coordinateSystem=On,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const vr=new W,xf=new Ve,Sf=new Ve;class tn extends sp{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=bu*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(zl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return bu*2*Math.atan(Math.tan(zl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){vr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(vr.x,vr.y).multiplyScalar(-e/vr.z),vr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(vr.x,vr.y).multiplyScalar(-e/vr.z)}getViewSize(e,t){return this.getViewBounds(e,xf,Sf),t.subVectors(Sf,xf)}setViewOffset(e,t,i,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(zl*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,t-=a.offsetY*i/c,r*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ls=-90,Us=1;class Kg extends Ti{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new tn(Ls,Us,e,t);r.layers=this.layers,this.add(r);const s=new tn(Ls,Us,e,t);s.layers=this.layers,this.add(s);const a=new tn(Ls,Us,e,t);a.layers=this.layers,this.add(a);const o=new tn(Ls,Us,e,t);o.layers=this.layers,this.add(o);const l=new tn(Ls,Us,e,t);l.layers=this.layers,this.add(l);const c=new tn(Ls,Us,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,s,a,o,l]=t;for(const c of t)this.remove(c);if(e===On)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===pl)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const g=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,a),e.setRenderTarget(i,2,r),e.render(t,o),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,c),i.texture.generateMipmaps=g,e.setRenderTarget(i,5,r),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class ap extends mi{constructor(e=[],t=hs,i,r,s,a,o,l,c,u){super(e,t,i,r,s,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class op extends ci{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new ap(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new fs(5,5,5),s=new _i({name:"CubemapFromEquirect",uniforms:na(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:li,blending:Fi});s.uniforms.tEquirect.value=t;const a=new fi(r,s),o=t.minFilter;return t.minFilter===es&&(t.minFilter=Zt),new Kg(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,r);e.setRenderTarget(s)}}class ks extends Ti{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Zg={type:"move"};class oc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ks,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ks,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ks,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const g of e.hand.values()){const m=t.getJointPose(g,i),p=this._getHandJoint(c,g);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,_=.005;c.inputState.pinching&&f>d+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Zg)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new ks;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class dh{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new tt(e),this.near=t,this.far=i}clone(){return new dh(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Tu extends Ti{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wn,this.environmentIntensity=1,this.environmentRotation=new Wn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class jg extends mi{constructor(e=null,t=1,i=1,r,s,a,o,l,c=di,u=di,h,f){super(null,a,o,l,c,u,r,s,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const lc=new W,Jg=new W,Qg=new je;class $r{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=lc.subVectors(i,t).cross(Jg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(lc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Qg.getNormalMatrix(e),r=this.coplanarPoint(lc).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Vr=new hh,e_=new Ve(.5,.5),Uo=new W;class ph{constructor(e=new $r,t=new $r,i=new $r,r=new $r,s=new $r,a=new $r){this.planes=[e,t,i,r,s,a]}set(e,t,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=On,i=!1){const r=this.planes,s=e.elements,a=s[0],o=s[1],l=s[2],c=s[3],u=s[4],h=s[5],f=s[6],d=s[7],_=s[8],g=s[9],m=s[10],p=s[11],x=s[12],y=s[13],M=s[14],T=s[15];if(r[0].setComponents(c-a,d-u,p-_,T-x).normalize(),r[1].setComponents(c+a,d+u,p+_,T+x).normalize(),r[2].setComponents(c+o,d+h,p+g,T+y).normalize(),r[3].setComponents(c-o,d-h,p-g,T-y).normalize(),i)r[4].setComponents(l,f,m,M).normalize(),r[5].setComponents(c-l,d-f,p-m,T-M).normalize();else if(r[4].setComponents(c-l,d-f,p-m,T-M).normalize(),t===On)r[5].setComponents(c+l,d+f,p+m,T+M).normalize();else if(t===pl)r[5].setComponents(l,f,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Vr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Vr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Vr)}intersectsSprite(e){Vr.center.set(0,0,0);const t=e_.distanceTo(e.center);return Vr.radius=.7071067811865476+t,Vr.applyMatrix4(e.matrixWorld),this.intersectsSphere(Vr)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(Uo.x=r.normal.x>0?e.max.x:e.min.x,Uo.y=r.normal.y>0?e.max.y:e.min.y,Uo.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Uo)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class ra extends mi{constructor(e,t,i=Rn,r,s,a,o=di,l=di,c,u=cr,h=1){if(u!==cr&&u!==Er)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:h};super(f,r,s,a,o,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new uh(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class t_ extends ra{constructor(e,t=Rn,i=hs,r,s,a=di,o=di,l,c=cr){const u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,i,r,s,a,o,l,c),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class lp extends mi{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class mh extends fn{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);const s=[],a=[],o=[],l=[],c=new W,u=new Ve;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let h=0,f=3;h<=t;h++,f+=3){const d=i+h/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[f]/e+1)/2,u.y=(a[f+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new ui(a,3)),this.setAttribute("normal",new ui(o,3)),this.setAttribute("uv",new ui(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mh(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class gh extends fn{constructor(e=1,t=1,i=1,r=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const u=[],h=[],f=[],d=[];let _=0;const g=[],m=i/2;let p=0;x(),a===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(u),this.setAttribute("position",new ui(h,3)),this.setAttribute("normal",new ui(f,3)),this.setAttribute("uv",new ui(d,2));function x(){const M=new W,T=new W;let A=0;const w=(t-e)/i;for(let C=0;C<=s;C++){const v=[],E=C/s,D=E*(t-e)+e;for(let U=0;U<=r;U++){const B=U/r,H=B*l+o,V=Math.sin(H),k=Math.cos(H);T.x=D*V,T.y=-E*i+m,T.z=D*k,h.push(T.x,T.y,T.z),M.set(V,w,k).normalize(),f.push(M.x,M.y,M.z),d.push(B,1-E),v.push(_++)}g.push(v)}for(let C=0;C<r;C++)for(let v=0;v<s;v++){const E=g[v][C],D=g[v+1][C],U=g[v+1][C+1],B=g[v][C+1];(e>0||v!==0)&&(u.push(E,D,B),A+=3),(t>0||v!==s-1)&&(u.push(D,U,B),A+=3)}c.addGroup(p,A,0),p+=A}function y(M){const T=_,A=new Ve,w=new W;let C=0;const v=M===!0?e:t,E=M===!0?1:-1;for(let U=1;U<=r;U++)h.push(0,m*E,0),f.push(0,E,0),d.push(.5,.5),_++;const D=_;for(let U=0;U<=r;U++){const H=U/r*l+o,V=Math.cos(H),k=Math.sin(H);w.x=v*k,w.y=m*E,w.z=v*V,h.push(w.x,w.y,w.z),f.push(0,E,0),A.x=V*.5+.5,A.y=k*.5*E+.5,d.push(A.x,A.y),_++}for(let U=0;U<r;U++){const B=T+U,H=D+U;M===!0?u.push(H,H+1,B):u.push(H+1,H,B),C+=3}c.addGroup(p,C,M===!0?1:2),p+=C}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new gh(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class po extends fn{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const s=e/2,a=t/2,o=Math.floor(i),l=Math.floor(r),c=o+1,u=l+1,h=e/o,f=t/l,d=[],_=[],g=[],m=[];for(let p=0;p<u;p++){const x=p*f-a;for(let y=0;y<c;y++){const M=y*h-s;_.push(M,-x,0),g.push(0,0,1),m.push(y/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<o;x++){const y=x+c*p,M=x+c*(p+1),T=x+1+c*(p+1),A=x+1+c*p;d.push(y,M,A),d.push(M,T,A)}this.setIndex(d),this.setAttribute("position",new ui(_,3)),this.setAttribute("normal",new ui(g,3)),this.setAttribute("uv",new ui(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new po(e.width,e.height,e.widthSegments,e.heightSegments)}}class _h extends fn{constructor(e=1,t=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);const a=[],o=[],l=[],c=[],u=new W,h=new W,f=new W;for(let d=0;d<=i;d++)for(let _=0;_<=r;_++){const g=_/r*s,m=d/i*Math.PI*2;h.x=(e+t*Math.cos(m))*Math.cos(g),h.y=(e+t*Math.cos(m))*Math.sin(g),h.z=t*Math.sin(m),o.push(h.x,h.y,h.z),u.x=e*Math.cos(g),u.y=e*Math.sin(g),f.subVectors(h,u).normalize(),l.push(f.x,f.y,f.z),c.push(_/r),c.push(d/i)}for(let d=1;d<=i;d++)for(let _=1;_<=r;_++){const g=(r+1)*d+_-1,m=(r+1)*(d-1)+_-1,p=(r+1)*(d-1)+_,x=(r+1)*d+_;a.push(g,m,x),a.push(m,p,x)}this.setIndex(a),this.setAttribute("position",new ui(o,3)),this.setAttribute("normal",new ui(l,3)),this.setAttribute("uv",new ui(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new _h(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class i_ extends _i{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Na extends gs{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new tt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new tt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=jd,this.normalScale=new Ve(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class n_ extends Na{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ve(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return lt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new tt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new tt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new tt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class r_ extends gs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=co,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class s_ extends gs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class cp extends Ti{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new tt(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const cc=new Ht,Mf=new W,Ef=new W;class a_{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ve(512,512),this.mapType=Kt,this.map=null,this.mapPass=null,this.matrix=new Ht,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ph,this._frameExtents=new Ve(1,1),this._viewportCount=1,this._viewports=[new It(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;Mf.setFromMatrixPosition(e.matrixWorld),t.position.copy(Mf),Ef.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ef),t.updateMatrixWorld(),cc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(cc,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(cc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Cl extends sp{constructor(e=-1,t=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class o_ extends a_{constructor(){super(new Cl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class up extends cp{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ti.DEFAULT_UP),this.updateMatrix(),this.target=new Ti,this.shadow=new o_}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class l_ extends cp{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class c_ extends tn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class ft{constructor(e){this.value=e}clone(){return new ft(this.value.clone===void 0?this.value:this.value.clone())}}function yf(n,e,t,i){const r=u_(i);switch(t){case qd:return n*e;case Zd:return n*e/r.components*r.byteLength;case sh:return n*e/r.components*r.byteLength;case ia:return n*e*2/r.components*r.byteLength;case ah:return n*e*2/r.components*r.byteLength;case Kd:return n*e*3/r.components*r.byteLength;case An:return n*e*4/r.components*r.byteLength;case oh:return n*e*4/r.components*r.byteLength;case jo:case Jo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Qo:case el:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case $c:case Kc:return Math.max(n,16)*Math.max(e,8)/4;case Yc:case qc:return Math.max(n,8)*Math.max(e,8)/2;case Zc:case jc:case Qc:case eu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Jc:case tu:case iu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case nu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case ru:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case su:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case au:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case ou:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case lu:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case cu:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case uu:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case hu:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case fu:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case du:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case pu:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case mu:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case gu:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case _u:case vu:case xu:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Su:case Mu:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Eu:case yu:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function u_(n){switch(n){case Kt:case Wd:return{byteLength:1,components:1};case Za:case Xd:case lr:return{byteLength:2,components:1};case nh:case rh:return{byteLength:2,components:4};case Rn:case ih:case Fn:return{byteLength:4,components:1};case Yd:case $d:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:lo}}));typeof window<"u"&&(window.__THREE__?$e("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=lo);function hp(){let n=null,e=!1,t=null,i=null;function r(s,a){t(s,a),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function h_(n){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,h=c.byteLength,f=n.createBuffer();n.bindBuffer(l,f),n.bufferData(l,c,u),o.onUploadCallback();let d;if(c instanceof Float32Array)d=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=n.SHORT;else if(c instanceof Uint32Array)d=n.UNSIGNED_INT;else if(c instanceof Int32Array)d=n.INT;else if(c instanceof Int8Array)d=n.BYTE;else if(c instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function i(o,l,c){const u=l.array,h=l.updateRanges;if(n.bindBuffer(c,o),h.length===0)n.bufferSubData(c,0,u);else{h.sort((d,_)=>d.start-_.start);let f=0;for(let d=1;d<h.length;d++){const _=h[f],g=h[d];g.start<=_.start+_.count+1?_.count=Math.max(_.count,g.start+g.count-_.start):(++f,h[f]=g)}h.length=f+1;for(let d=0,_=h.length;d<_;d++){const g=h[d];n.bufferSubData(c,g.start*u.BYTES_PER_ELEMENT,u,g.start,g.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:r,remove:s,update:a}}var f_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,d_=`#ifdef USE_ALPHAHASH
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
#endif`,p_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,m_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,g_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,__=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,v_=`#ifdef USE_AOMAP
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
#endif`,x_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,S_=`#ifdef USE_BATCHING
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
#endif`,M_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,E_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,y_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,b_=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,T_=`#ifdef USE_IRIDESCENCE
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
#endif`,w_=`#ifdef USE_BUMPMAP
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
#endif`,A_=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,R_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,C_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,P_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,D_=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,L_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,U_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,I_=`#if defined( USE_COLOR_ALPHA )
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
#endif`,N_=`#define PI 3.141592653589793
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
} // validated`,F_=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,O_=`vec3 transformedNormal = objectNormal;
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
#endif`,B_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,z_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,k_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,H_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,V_="gl_FragColor = linearToOutputTexel( gl_FragColor );",G_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,W_=`#ifdef USE_ENVMAP
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
#endif`,X_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Y_=`#ifdef USE_ENVMAP
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
#endif`,$_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,q_=`#ifdef USE_ENVMAP
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
#endif`,K_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Z_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,j_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,J_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Q_=`#ifdef USE_GRADIENTMAP
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
}`,e0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,t0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,i0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,n0=`uniform bool receiveShadow;
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
#endif`,r0=`#ifdef USE_ENVMAP
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
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
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
#endif`,s0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,a0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,o0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,l0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,c0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
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
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
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
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
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
#endif`,u0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
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
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
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
		return v;
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
	vec3 f0 = material.specularColorBlended;
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
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
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
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
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
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
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
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
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
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,h0=`
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
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
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
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
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
#endif`,f0=`#if defined( RE_IndirectDiffuse )
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
#endif`,d0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,p0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,m0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,g0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,v0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,x0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,S0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,M0=`#if defined( USE_POINTS_UV )
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
#endif`,E0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,y0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,b0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,T0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,w0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,A0=`#ifdef USE_MORPHTARGETS
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
#endif`,R0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,C0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,P0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,D0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,L0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,U0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,I0=`#ifdef USE_NORMALMAP
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
#endif`,N0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,F0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,O0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,B0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,z0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,k0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,H0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,V0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,G0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,W0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,X0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Y0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
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
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
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
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
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
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,q0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,K0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Z0=`float getShadowMask() {
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
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
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
}`,j0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,J0=`#ifdef USE_SKINNING
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
#endif`,Q0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ev=`#ifdef USE_SKINNING
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
#endif`,tv=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,iv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,nv=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,rv=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,sv=`#ifdef USE_TRANSMISSION
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
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,av=`#ifdef USE_TRANSMISSION
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
#endif`,ov=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,lv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,cv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uv=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const hv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,fv=`uniform sampler2D t2D;
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
}`,dv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,pv=`#ifdef ENVMAP_TYPE_CUBE
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
}`,mv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gv=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_v=`#include <common>
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
}`,vv=`#if DEPTH_PACKING == 3200
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
}`,xv=`#define DISTANCE
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
}`,Sv=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
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
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Mv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ev=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yv=`uniform float scale;
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
}`,bv=`uniform vec3 diffuse;
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
}`,Tv=`#include <common>
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
}`,wv=`uniform vec3 diffuse;
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
}`,Av=`#define LAMBERT
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
}`,Rv=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
}`,Cv=`#define MATCAP
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
}`,Pv=`#define MATCAP
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
}`,Dv=`#define NORMAL
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
}`,Lv=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
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
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Uv=`#define PHONG
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
}`,Iv=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
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
}`,Nv=`#define STANDARD
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
}`,Fv=`#define STANDARD
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
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
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
}`,Ov=`#define TOON
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
}`,Bv=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
}`,zv=`uniform float size;
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
}`,kv=`uniform vec3 diffuse;
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
}`,Hv=`#include <common>
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
}`,Vv=`uniform vec3 color;
uniform float opacity;
#include <common>
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
}`,Gv=`uniform float rotation;
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
}`,Wv=`uniform vec3 diffuse;
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
}`,Je={alphahash_fragment:f_,alphahash_pars_fragment:d_,alphamap_fragment:p_,alphamap_pars_fragment:m_,alphatest_fragment:g_,alphatest_pars_fragment:__,aomap_fragment:v_,aomap_pars_fragment:x_,batching_pars_vertex:S_,batching_vertex:M_,begin_vertex:E_,beginnormal_vertex:y_,bsdfs:b_,iridescence_fragment:T_,bumpmap_pars_fragment:w_,clipping_planes_fragment:A_,clipping_planes_pars_fragment:R_,clipping_planes_pars_vertex:C_,clipping_planes_vertex:P_,color_fragment:D_,color_pars_fragment:L_,color_pars_vertex:U_,color_vertex:I_,common:N_,cube_uv_reflection_fragment:F_,defaultnormal_vertex:O_,displacementmap_pars_vertex:B_,displacementmap_vertex:z_,emissivemap_fragment:k_,emissivemap_pars_fragment:H_,colorspace_fragment:V_,colorspace_pars_fragment:G_,envmap_fragment:W_,envmap_common_pars_fragment:X_,envmap_pars_fragment:Y_,envmap_pars_vertex:$_,envmap_physical_pars_fragment:r0,envmap_vertex:q_,fog_vertex:K_,fog_pars_vertex:Z_,fog_fragment:j_,fog_pars_fragment:J_,gradientmap_pars_fragment:Q_,lightmap_pars_fragment:e0,lights_lambert_fragment:t0,lights_lambert_pars_fragment:i0,lights_pars_begin:n0,lights_toon_fragment:s0,lights_toon_pars_fragment:a0,lights_phong_fragment:o0,lights_phong_pars_fragment:l0,lights_physical_fragment:c0,lights_physical_pars_fragment:u0,lights_fragment_begin:h0,lights_fragment_maps:f0,lights_fragment_end:d0,logdepthbuf_fragment:p0,logdepthbuf_pars_fragment:m0,logdepthbuf_pars_vertex:g0,logdepthbuf_vertex:_0,map_fragment:v0,map_pars_fragment:x0,map_particle_fragment:S0,map_particle_pars_fragment:M0,metalnessmap_fragment:E0,metalnessmap_pars_fragment:y0,morphinstance_vertex:b0,morphcolor_vertex:T0,morphnormal_vertex:w0,morphtarget_pars_vertex:A0,morphtarget_vertex:R0,normal_fragment_begin:C0,normal_fragment_maps:P0,normal_pars_fragment:D0,normal_pars_vertex:L0,normal_vertex:U0,normalmap_pars_fragment:I0,clearcoat_normal_fragment_begin:N0,clearcoat_normal_fragment_maps:F0,clearcoat_pars_fragment:O0,iridescence_pars_fragment:B0,opaque_fragment:z0,packing:k0,premultiplied_alpha_fragment:H0,project_vertex:V0,dithering_fragment:G0,dithering_pars_fragment:W0,roughnessmap_fragment:X0,roughnessmap_pars_fragment:Y0,shadowmap_pars_fragment:$0,shadowmap_pars_vertex:q0,shadowmap_vertex:K0,shadowmask_pars_fragment:Z0,skinbase_vertex:j0,skinning_pars_vertex:J0,skinning_vertex:Q0,skinnormal_vertex:ev,specularmap_fragment:tv,specularmap_pars_fragment:iv,tonemapping_fragment:nv,tonemapping_pars_fragment:rv,transmission_fragment:sv,transmission_pars_fragment:av,uv_pars_fragment:ov,uv_pars_vertex:lv,uv_vertex:cv,worldpos_vertex:uv,background_vert:hv,background_frag:fv,backgroundCube_vert:dv,backgroundCube_frag:pv,cube_vert:mv,cube_frag:gv,depth_vert:_v,depth_frag:vv,distance_vert:xv,distance_frag:Sv,equirect_vert:Mv,equirect_frag:Ev,linedashed_vert:yv,linedashed_frag:bv,meshbasic_vert:Tv,meshbasic_frag:wv,meshlambert_vert:Av,meshlambert_frag:Rv,meshmatcap_vert:Cv,meshmatcap_frag:Pv,meshnormal_vert:Dv,meshnormal_frag:Lv,meshphong_vert:Uv,meshphong_frag:Iv,meshphysical_vert:Nv,meshphysical_frag:Fv,meshtoon_vert:Ov,meshtoon_frag:Bv,points_vert:zv,points_frag:kv,shadow_vert:Hv,shadow_frag:Vv,sprite_vert:Gv,sprite_frag:Wv},me={common:{diffuse:{value:new tt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new je}},envmap:{envMap:{value:null},envMapRotation:{value:new je},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new je}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new je}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new je},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new je},normalScale:{value:new Ve(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new je},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new je}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new je}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new je}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new tt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new tt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0},uvTransform:{value:new je}},sprite:{diffuse:{value:new tt(16777215)},opacity:{value:1},center:{value:new Ve(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}}},Un={basic:{uniforms:Pi([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Je.meshbasic_vert,fragmentShader:Je.meshbasic_frag},lambert:{uniforms:Pi([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new tt(0)}}]),vertexShader:Je.meshlambert_vert,fragmentShader:Je.meshlambert_frag},phong:{uniforms:Pi([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new tt(0)},specular:{value:new tt(1118481)},shininess:{value:30}}]),vertexShader:Je.meshphong_vert,fragmentShader:Je.meshphong_frag},standard:{uniforms:Pi([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new tt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Je.meshphysical_vert,fragmentShader:Je.meshphysical_frag},toon:{uniforms:Pi([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new tt(0)}}]),vertexShader:Je.meshtoon_vert,fragmentShader:Je.meshtoon_frag},matcap:{uniforms:Pi([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Je.meshmatcap_vert,fragmentShader:Je.meshmatcap_frag},points:{uniforms:Pi([me.points,me.fog]),vertexShader:Je.points_vert,fragmentShader:Je.points_frag},dashed:{uniforms:Pi([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Je.linedashed_vert,fragmentShader:Je.linedashed_frag},depth:{uniforms:Pi([me.common,me.displacementmap]),vertexShader:Je.depth_vert,fragmentShader:Je.depth_frag},normal:{uniforms:Pi([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Je.meshnormal_vert,fragmentShader:Je.meshnormal_frag},sprite:{uniforms:Pi([me.sprite,me.fog]),vertexShader:Je.sprite_vert,fragmentShader:Je.sprite_frag},background:{uniforms:{uvTransform:{value:new je},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Je.background_vert,fragmentShader:Je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new je}},vertexShader:Je.backgroundCube_vert,fragmentShader:Je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Je.cube_vert,fragmentShader:Je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Je.equirect_vert,fragmentShader:Je.equirect_frag},distance:{uniforms:Pi([me.common,me.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Je.distance_vert,fragmentShader:Je.distance_frag},shadow:{uniforms:Pi([me.lights,me.fog,{color:{value:new tt(0)},opacity:{value:1}}]),vertexShader:Je.shadow_vert,fragmentShader:Je.shadow_frag}};Un.physical={uniforms:Pi([Un.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new je},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new je},clearcoatNormalScale:{value:new Ve(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new je},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new je},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new je},sheen:{value:0},sheenColor:{value:new tt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new je},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new je},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new je},transmissionSamplerSize:{value:new Ve},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new je},attenuationDistance:{value:0},attenuationColor:{value:new tt(0)},specularColor:{value:new tt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new je},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new je},anisotropyVector:{value:new Ve},anisotropyMap:{value:null},anisotropyMapTransform:{value:new je}}]),vertexShader:Je.meshphysical_vert,fragmentShader:Je.meshphysical_frag};const Io={r:0,b:0,g:0},Gr=new Wn,Xv=new Ht;function Yv(n,e,t,i,r,s,a){const o=new tt(0);let l=s===!0?0:1,c,u,h=null,f=0,d=null;function _(y){let M=y.isScene===!0?y.background:null;return M&&M.isTexture&&(M=(y.backgroundBlurriness>0?t:e).get(M)),M}function g(y){let M=!1;const T=_(y);T===null?p(o,l):T&&T.isColor&&(p(T,1),M=!0);const A=n.xr.getEnvironmentBlendMode();A==="additive"?i.buffers.color.setClear(0,0,0,1,a):A==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||M)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(y,M){const T=_(M);T&&(T.isCubeTexture||T.mapping===Rl)?(u===void 0&&(u=new fi(new fs(1,1,1),new _i({name:"BackgroundCubeMaterial",uniforms:na(Un.backgroundCube.uniforms),vertexShader:Un.backgroundCube.vertexShader,fragmentShader:Un.backgroundCube.fragmentShader,side:li,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(A,w,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),Gr.copy(M.backgroundRotation),Gr.x*=-1,Gr.y*=-1,Gr.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(Gr.y*=-1,Gr.z*=-1),u.material.uniforms.envMap.value=T,u.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Xv.makeRotationFromEuler(Gr)),u.material.toneMapped=ht.getTransfer(T.colorSpace)!==Et,(h!==T||f!==T.version||d!==n.toneMapping)&&(u.material.needsUpdate=!0,h=T,f=T.version,d=n.toneMapping),u.layers.enableAll(),y.unshift(u,u.geometry,u.material,0,0,null)):T&&T.isTexture&&(c===void 0&&(c=new fi(new po(2,2),new _i({name:"BackgroundMaterial",uniforms:na(Un.background.uniforms),vertexShader:Un.background.vertexShader,fragmentShader:Un.background.fragmentShader,side:or,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=T,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=ht.getTransfer(T.colorSpace)!==Et,T.matrixAutoUpdate===!0&&T.updateMatrix(),c.material.uniforms.uvTransform.value.copy(T.matrix),(h!==T||f!==T.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,h=T,f=T.version,d=n.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function p(y,M){y.getRGB(Io,rp(n)),i.buffers.color.setClear(Io.r,Io.g,Io.b,M,a)}function x(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,M=1){o.set(y),l=M,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,p(o,l)},render:g,addToRenderList:m,dispose:x}}function $v(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=f(null);let s=r,a=!1;function o(E,D,U,B,H){let V=!1;const k=h(B,U,D);s!==k&&(s=k,c(s.object)),V=d(E,B,U,H),V&&_(E,B,U,H),H!==null&&e.update(H,n.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,M(E,D,U,B),H!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return n.createVertexArray()}function c(E){return n.bindVertexArray(E)}function u(E){return n.deleteVertexArray(E)}function h(E,D,U){const B=U.wireframe===!0;let H=i[E.id];H===void 0&&(H={},i[E.id]=H);let V=H[D.id];V===void 0&&(V={},H[D.id]=V);let k=V[B];return k===void 0&&(k=f(l()),V[B]=k),k}function f(E){const D=[],U=[],B=[];for(let H=0;H<t;H++)D[H]=0,U[H]=0,B[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:U,attributeDivisors:B,object:E,attributes:{},index:null}}function d(E,D,U,B){const H=s.attributes,V=D.attributes;let k=0;const O=U.getAttributes();for(const q in O)if(O[q].location>=0){const P=H[q];let re=V[q];if(re===void 0&&(q==="instanceMatrix"&&E.instanceMatrix&&(re=E.instanceMatrix),q==="instanceColor"&&E.instanceColor&&(re=E.instanceColor)),P===void 0||P.attribute!==re||re&&P.data!==re.data)return!0;k++}return s.attributesNum!==k||s.index!==B}function _(E,D,U,B){const H={},V=D.attributes;let k=0;const O=U.getAttributes();for(const q in O)if(O[q].location>=0){let P=V[q];P===void 0&&(q==="instanceMatrix"&&E.instanceMatrix&&(P=E.instanceMatrix),q==="instanceColor"&&E.instanceColor&&(P=E.instanceColor));const re={};re.attribute=P,P&&P.data&&(re.data=P.data),H[q]=re,k++}s.attributes=H,s.attributesNum=k,s.index=B}function g(){const E=s.newAttributes;for(let D=0,U=E.length;D<U;D++)E[D]=0}function m(E){p(E,0)}function p(E,D){const U=s.newAttributes,B=s.enabledAttributes,H=s.attributeDivisors;U[E]=1,B[E]===0&&(n.enableVertexAttribArray(E),B[E]=1),H[E]!==D&&(n.vertexAttribDivisor(E,D),H[E]=D)}function x(){const E=s.newAttributes,D=s.enabledAttributes;for(let U=0,B=D.length;U<B;U++)D[U]!==E[U]&&(n.disableVertexAttribArray(U),D[U]=0)}function y(E,D,U,B,H,V,k){k===!0?n.vertexAttribIPointer(E,D,U,H,V):n.vertexAttribPointer(E,D,U,B,H,V)}function M(E,D,U,B){g();const H=B.attributes,V=U.getAttributes(),k=D.defaultAttributeValues;for(const O in V){const q=V[O];if(q.location>=0){let ne=H[O];if(ne===void 0&&(O==="instanceMatrix"&&E.instanceMatrix&&(ne=E.instanceMatrix),O==="instanceColor"&&E.instanceColor&&(ne=E.instanceColor)),ne!==void 0){const P=ne.normalized,re=ne.itemSize,Le=e.get(ne);if(Le===void 0)continue;const Oe=Le.buffer,We=Le.type,qe=Le.bytesPerElement,K=We===n.INT||We===n.UNSIGNED_INT||ne.gpuType===ih;if(ne.isInterleavedBufferAttribute){const J=ne.data,fe=J.stride,Ce=ne.offset;if(J.isInstancedInterleavedBuffer){for(let Se=0;Se<q.locationSize;Se++)p(q.location+Se,J.meshPerAttribute);E.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let Se=0;Se<q.locationSize;Se++)m(q.location+Se);n.bindBuffer(n.ARRAY_BUFFER,Oe);for(let Se=0;Se<q.locationSize;Se++)y(q.location+Se,re/q.locationSize,We,P,fe*qe,(Ce+re/q.locationSize*Se)*qe,K)}else{if(ne.isInstancedBufferAttribute){for(let J=0;J<q.locationSize;J++)p(q.location+J,ne.meshPerAttribute);E.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let J=0;J<q.locationSize;J++)m(q.location+J);n.bindBuffer(n.ARRAY_BUFFER,Oe);for(let J=0;J<q.locationSize;J++)y(q.location+J,re/q.locationSize,We,P,re*qe,re/q.locationSize*J*qe,K)}}else if(k!==void 0){const P=k[O];if(P!==void 0)switch(P.length){case 2:n.vertexAttrib2fv(q.location,P);break;case 3:n.vertexAttrib3fv(q.location,P);break;case 4:n.vertexAttrib4fv(q.location,P);break;default:n.vertexAttrib1fv(q.location,P)}}}}x()}function T(){C();for(const E in i){const D=i[E];for(const U in D){const B=D[U];for(const H in B)u(B[H].object),delete B[H];delete D[U]}delete i[E]}}function A(E){if(i[E.id]===void 0)return;const D=i[E.id];for(const U in D){const B=D[U];for(const H in B)u(B[H].object),delete B[H];delete D[U]}delete i[E.id]}function w(E){for(const D in i){const U=i[D];if(U[E.id]===void 0)continue;const B=U[E.id];for(const H in B)u(B[H].object),delete B[H];delete U[E.id]}}function C(){v(),a=!0,s!==r&&(s=r,c(s.object))}function v(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:C,resetDefaultState:v,dispose:T,releaseStatesOfGeometry:A,releaseStatesOfProgram:w,initAttributes:g,enableAttribute:m,disableUnusedAttributes:x}}function qv(n,e,t){let i;function r(c){i=c}function s(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function a(c,u,h){h!==0&&(n.drawArraysInstanced(i,c,u,h),t.update(u,i,h))}function o(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let d=0;for(let _=0;_<h;_++)d+=u[_];t.update(d,i,1)}function l(c,u,h,f){if(h===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let _=0;_<c.length;_++)a(c[_],u[_],f[_]);else{d.multiDrawArraysInstancedWEBGL(i,c,0,u,0,f,0,h);let _=0;for(let g=0;g<h;g++)_+=u[g]*f[g];t.update(_,i,1)}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Kv(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(w){return!(w!==An&&i.convert(w)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const C=w===lr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==Kt&&i.convert(w)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Fn&&!C)}function l(w){if(w==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&($e("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),x=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),y=n.getParameter(n.MAX_VARYING_VECTORS),M=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),T=n.getParameter(n.MAX_SAMPLES),A=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:_,maxTextureSize:g,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:x,maxVaryings:y,maxFragmentUniforms:M,maxSamples:T,samples:A}}function Zv(n){const e=this;let t=null,i=0,r=!1,s=!1;const a=new $r,o=new je,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){const d=h.length!==0||f||i!==0||r;return r=f,i=h.length,d},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){const _=h.clippingPlanes,g=h.clipIntersection,m=h.clipShadows,p=n.get(h);if(!r||_===null||_.length===0||s&&!m)s?u(null):c();else{const x=s?0:i,y=x*4;let M=p.clippingState||null;l.value=M,M=u(_,f,y,d);for(let T=0;T!==y;++T)M[T]=t[T];p.clippingState=M,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,f,d,_){const g=h!==null?h.length:0;let m=null;if(g!==0){if(m=l.value,_!==!0||m===null){const p=d+g*4,x=f.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<p)&&(m=new Float32Array(p));for(let y=0,M=d;y!==g;++y,M+=4)a.copy(h[y]).applyMatrix4(x,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,m}}function jv(n){let e=new WeakMap;function t(a,o){return o===Vc?a.mapping=hs:o===Gc&&(a.mapping=ea),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===Vc||o===Gc)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new op(l.height);return c.fromEquirectangularTexture(n,a),e.set(a,c),a.addEventListener("dispose",r),t(c.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}const yr=4,bf=[.125,.215,.35,.446,.526,.582],Qr=20,Jv=256,Sa=new Cl,Tf=new tt;let uc=null,hc=0,fc=0,dc=!1;const Qv=new W;class wf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,r=100,s={}){const{size:a=256,position:o=Qv}=s;uc=this._renderer.getRenderTarget(),hc=this._renderer.getActiveCubeFace(),fc=this._renderer.getActiveMipmapLevel(),dc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,r,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Cf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Rf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(uc,hc,fc),this._renderer.xr.enabled=dc,e.scissorTest=!1,Is(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===hs||e.mapping===ea?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),uc=this._renderer.getRenderTarget(),hc=this._renderer.getActiveCubeFace(),fc=this._renderer.getActiveMipmapLevel(),dc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Zt,minFilter:Zt,generateMipmaps:!1,type:lr,format:An,colorSpace:Lr,depthBuffer:!1},r=Af(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Af(e,t,i);const{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=ex(s)),this._blurMaterial=ix(s,e,t),this._ggxMaterial=tx(s,e,t)}return r}_compileMaterial(e){const t=new fi(new fn,e);this._renderer.compile(t,Sa)}_sceneToCubeUV(e,t,i,r,s){const l=new tn(90,1,t,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,d=h.toneMapping;h.getClearColor(Tf),h.toneMapping=Hn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(r),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new fi(new fs,new fh({name:"PMREM.Background",side:li,depthWrite:!1,depthTest:!1})));const g=this._backgroundBox,m=g.material;let p=!1;const x=e.background;x?x.isColor&&(m.color.copy(x),e.background=null,p=!0):(m.color.copy(Tf),p=!0);for(let y=0;y<6;y++){const M=y%3;M===0?(l.up.set(0,c[y],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+u[y],s.y,s.z)):M===1?(l.up.set(0,0,c[y]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+u[y],s.z)):(l.up.set(0,c[y],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+u[y]));const T=this._cubeSize;Is(r,M*T,y>2?T:0,T,T),h.setRenderTarget(r),p&&h.render(g,l),h.render(e,l)}h.toneMapping=d,h.autoClear=f,e.background=x}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===hs||e.mapping===ea;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Cf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Rf());const s=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=s;const o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;Is(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,Sa)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const r=this._lodMeshes.length;for(let s=1;s<r;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=i}_applyGGXFilter(e,t,i){const r=this._renderer,s=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;const l=a.uniforms,c=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(c*c-u*u),f=0+c*1.25,d=h*f,{_lodMax:_}=this,g=this._sizeLods[i],m=3*g*(i>_-yr?i-_+yr:0),p=4*(this._cubeSize-g);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=_-t,Is(s,m,p,3*g,2*g),r.setRenderTarget(s),r.render(o,Sa),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=_-i,Is(e,m,p,3*g,2*g),r.setRenderTarget(e),r.render(o,Sa)}_blur(e,t,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,r,"latitudinal",s),this._halfBlur(a,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&gt("blur direction must be either latitudinal or longitudinal!");const u=3,h=this._lodMeshes[r];h.material=c;const f=c.uniforms,d=this._sizeLods[i]-1,_=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Qr-1),g=s/_,m=isFinite(s)?1+Math.floor(u*g):Qr;m>Qr&&$e(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Qr}`);const p=[];let x=0;for(let w=0;w<Qr;++w){const C=w/g,v=Math.exp(-C*C/2);p.push(v),w===0?x+=v:w<m&&(x+=2*v)}for(let w=0;w<p.length;w++)p[w]=p[w]/x;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:y}=this;f.dTheta.value=_,f.mipInt.value=y-i;const M=this._sizeLods[r],T=3*M*(r>y-yr?r-y+yr:0),A=4*(this._cubeSize-M);Is(t,T,A,3*M,2*M),l.setRenderTarget(t),l.render(h,Sa)}}function ex(n){const e=[],t=[],i=[];let r=n;const s=n-yr+1+bf.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);e.push(o);let l=1/o;a>n-yr?l=bf[a-n+yr-1]:a===0&&(l=0),t.push(l);const c=1/(o-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,_=6,g=3,m=2,p=1,x=new Float32Array(g*_*d),y=new Float32Array(m*_*d),M=new Float32Array(p*_*d);for(let A=0;A<d;A++){const w=A%3*2/3-1,C=A>2?0:-1,v=[w,C,0,w+2/3,C,0,w+2/3,C+1,0,w,C,0,w+2/3,C+1,0,w,C+1,0];x.set(v,g*_*A),y.set(f,m*_*A);const E=[A,A,A,A,A,A];M.set(E,p*_*A)}const T=new fn;T.setAttribute("position",new Sn(x,g)),T.setAttribute("uv",new Sn(y,m)),T.setAttribute("faceIndex",new Sn(M,p)),i.push(new fi(T,null)),r>yr&&r--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function Af(n,e,t){const i=new ci(n,e,t);return i.texture.mapping=Rl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Is(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function tx(n,e,t){return new _i({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Jv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Pl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function ix(n,e,t){const i=new Float32Array(Qr),r=new W(0,1,0);return new _i({name:"SphericalGaussianBlur",defines:{n:Qr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Pl(),fragmentShader:`

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
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function Rf(){return new _i({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Pl(),fragmentShader:`

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
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function Cf(){return new _i({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Pl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function Pl(){return`

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
	`}function nx(n){let e=new WeakMap,t=null;function i(o){if(o&&o.isTexture){const l=o.mapping,c=l===Vc||l===Gc,u=l===hs||l===ea;if(c||u){let h=e.get(o);const f=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new wf(n)),h=c?t.fromEquirectangular(o,h):t.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),h.texture;if(h!==void 0)return h.texture;{const d=o.image;return c&&d&&d.height>0||u&&d&&r(d)?(t===null&&(t=new wf(n)),h=c?t.fromEquirectangular(o):t.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),o.addEventListener("dispose",s),h.texture):null}}}return o}function r(o){let l=0;const c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function s(o){const l=o.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:a}}function rx(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const r=n.getExtension(i);return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const r=t(i);return r===null&&ja("WebGLRenderer: "+i+" extension not supported."),r}}}function sx(n,e,t,i){const r={},s=new WeakMap;function a(h){const f=h.target;f.index!==null&&e.remove(f.index);for(const _ in f.attributes)e.remove(f.attributes[_]);f.removeEventListener("dispose",a),delete r[f.id];const d=s.get(f);d&&(e.remove(d),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(h,f){return r[f.id]===!0||(f.addEventListener("dispose",a),r[f.id]=!0,t.memory.geometries++),f}function l(h){const f=h.attributes;for(const d in f)e.update(f[d],n.ARRAY_BUFFER)}function c(h){const f=[],d=h.index,_=h.attributes.position;let g=0;if(d!==null){const x=d.array;g=d.version;for(let y=0,M=x.length;y<M;y+=3){const T=x[y+0],A=x[y+1],w=x[y+2];f.push(T,A,A,w,w,T)}}else if(_!==void 0){const x=_.array;g=_.version;for(let y=0,M=x.length/3-1;y<M;y+=3){const T=y+0,A=y+1,w=y+2;f.push(T,A,A,w,w,T)}}else return;const m=new(Jd(f)?np:ip)(f,1);m.version=g;const p=s.get(h);p&&e.remove(p),s.set(h,m)}function u(h){const f=s.get(h);if(f){const d=h.index;d!==null&&f.version<d.version&&c(h)}else c(h);return s.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function ax(n,e,t){let i;function r(f){i=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function l(f,d){n.drawElements(i,d,s,f*a),t.update(d,i,1)}function c(f,d,_){_!==0&&(n.drawElementsInstanced(i,d,s,f*a,_),t.update(d,i,_))}function u(f,d,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,s,f,0,_);let m=0;for(let p=0;p<_;p++)m+=d[p];t.update(m,i,1)}function h(f,d,_,g){if(_===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)c(f[p]/a,d[p],g[p]);else{m.multiDrawElementsInstancedWEBGL(i,d,0,s,f,0,g,0,_);let p=0;for(let x=0;x<_;x++)p+=d[x]*g[x];t.update(p,i,1)}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function ox(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(s/3);break;case n.LINES:t.lines+=o*(s/2);break;case n.LINE_STRIP:t.lines+=o*(s-1);break;case n.LINE_LOOP:t.lines+=o*s;break;case n.POINTS:t.points+=o*s;break;default:gt("WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function lx(n,e,t){const i=new WeakMap,r=new It;function s(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let f=i.get(o);if(f===void 0||f.count!==h){let E=function(){C.dispose(),i.delete(o),o.removeEventListener("dispose",E)};var d=E;f!==void 0&&f.texture.dispose();const _=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],x=o.morphAttributes.normal||[],y=o.morphAttributes.color||[];let M=0;_===!0&&(M=1),g===!0&&(M=2),m===!0&&(M=3);let T=o.attributes.position.count*M,A=1;T>e.maxTextureSize&&(A=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const w=new Float32Array(T*A*4*h),C=new Qd(w,T,A,h);C.type=Fn,C.needsUpdate=!0;const v=M*4;for(let D=0;D<h;D++){const U=p[D],B=x[D],H=y[D],V=T*A*4*D;for(let k=0;k<U.count;k++){const O=k*v;_===!0&&(r.fromBufferAttribute(U,k),w[V+O+0]=r.x,w[V+O+1]=r.y,w[V+O+2]=r.z,w[V+O+3]=0),g===!0&&(r.fromBufferAttribute(B,k),w[V+O+4]=r.x,w[V+O+5]=r.y,w[V+O+6]=r.z,w[V+O+7]=0),m===!0&&(r.fromBufferAttribute(H,k),w[V+O+8]=r.x,w[V+O+9]=r.y,w[V+O+10]=r.z,w[V+O+11]=H.itemSize===4?r.w:1)}}f={count:h,texture:C,size:new Ve(T,A)},i.set(o,f),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let _=0;for(let m=0;m<c.length;m++)_+=c[m];const g=o.morphTargetsRelative?1:1-_;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:s}}function cx(n,e,t,i){let r=new WeakMap;function s(l){const c=i.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==c&&(f.update(),r.set(f,c))}return h}function a(){r=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:a}}const ux={[Fd]:"LINEAR_TONE_MAPPING",[Od]:"REINHARD_TONE_MAPPING",[Bd]:"CINEON_TONE_MAPPING",[zd]:"ACES_FILMIC_TONE_MAPPING",[Hd]:"AGX_TONE_MAPPING",[Vd]:"NEUTRAL_TONE_MAPPING",[kd]:"CUSTOM_TONE_MAPPING"};function hx(n,e,t,i,r){const s=new ci(e,t,{type:n,depthBuffer:i,stencilBuffer:r}),a=new ci(e,t,{type:lr,depthBuffer:!1,stencilBuffer:!1}),o=new fn;o.setAttribute("position",new ui([-1,3,0,-1,-1,0,3,-1,0],3)),o.setAttribute("uv",new ui([0,2,0,0,2,0],2));const l=new i_({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new fi(o,l),u=new Cl(-1,1,1,-1,0,1);let h=null,f=null,d=!1,_,g=null,m=[],p=!1;this.setSize=function(x,y){s.setSize(x,y),a.setSize(x,y);for(let M=0;M<m.length;M++){const T=m[M];T.setSize&&T.setSize(x,y)}},this.setEffects=function(x){m=x,p=m.length>0&&m[0].isRenderPass===!0;const y=s.width,M=s.height;for(let T=0;T<m.length;T++){const A=m[T];A.setSize&&A.setSize(y,M)}},this.begin=function(x,y){if(d||x.toneMapping===Hn&&m.length===0)return!1;if(g=y,y!==null){const M=y.width,T=y.height;(s.width!==M||s.height!==T)&&this.setSize(M,T)}return p===!1&&x.setRenderTarget(s),_=x.toneMapping,x.toneMapping=Hn,!0},this.hasRenderPass=function(){return p},this.end=function(x,y){x.toneMapping=_,d=!0;let M=s,T=a;for(let A=0;A<m.length;A++){const w=m[A];if(w.enabled!==!1&&(w.render(x,T,M,y),w.needsSwap!==!1)){const C=M;M=T,T=C}}if(h!==x.outputColorSpace||f!==x.toneMapping){h=x.outputColorSpace,f=x.toneMapping,l.defines={},ht.getTransfer(h)===Et&&(l.defines.SRGB_TRANSFER="");const A=ux[f];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=M.texture,x.setRenderTarget(g),x.render(c,u),g=null,d=!1},this.isCompositing=function(){return d},this.dispose=function(){s.dispose(),a.dispose(),o.dispose(),l.dispose()}}const fp=new mi,wu=new ra(1,1),dp=new Qd,pp=new Lg,mp=new ap,Pf=[],Df=[],Lf=new Float32Array(16),Uf=new Float32Array(9),If=new Float32Array(4);function da(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let s=Pf[r];if(s===void 0&&(s=new Float32Array(r),Pf[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(s,o)}return s}function ti(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function ii(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Dl(n,e){let t=Df[e];t===void 0&&(t=new Int32Array(e),Df[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function fx(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function dx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ti(t,e))return;n.uniform2fv(this.addr,e),ii(t,e)}}function px(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ti(t,e))return;n.uniform3fv(this.addr,e),ii(t,e)}}function mx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ti(t,e))return;n.uniform4fv(this.addr,e),ii(t,e)}}function gx(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(ti(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),ii(t,e)}else{if(ti(t,i))return;If.set(i),n.uniformMatrix2fv(this.addr,!1,If),ii(t,i)}}function _x(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(ti(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),ii(t,e)}else{if(ti(t,i))return;Uf.set(i),n.uniformMatrix3fv(this.addr,!1,Uf),ii(t,i)}}function vx(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(ti(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),ii(t,e)}else{if(ti(t,i))return;Lf.set(i),n.uniformMatrix4fv(this.addr,!1,Lf),ii(t,i)}}function xx(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Sx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ti(t,e))return;n.uniform2iv(this.addr,e),ii(t,e)}}function Mx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ti(t,e))return;n.uniform3iv(this.addr,e),ii(t,e)}}function Ex(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ti(t,e))return;n.uniform4iv(this.addr,e),ii(t,e)}}function yx(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function bx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ti(t,e))return;n.uniform2uiv(this.addr,e),ii(t,e)}}function Tx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ti(t,e))return;n.uniform3uiv(this.addr,e),ii(t,e)}}function wx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ti(t,e))return;n.uniform4uiv(this.addr,e),ii(t,e)}}function Ax(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(wu.compareFunction=t.isReversedDepthBuffer()?ch:lh,s=wu):s=fp,t.setTexture2D(e||s,r)}function Rx(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||pp,r)}function Cx(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||mp,r)}function Px(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||dp,r)}function Dx(n){switch(n){case 5126:return fx;case 35664:return dx;case 35665:return px;case 35666:return mx;case 35674:return gx;case 35675:return _x;case 35676:return vx;case 5124:case 35670:return xx;case 35667:case 35671:return Sx;case 35668:case 35672:return Mx;case 35669:case 35673:return Ex;case 5125:return yx;case 36294:return bx;case 36295:return Tx;case 36296:return wx;case 35678:case 36198:case 36298:case 36306:case 35682:return Ax;case 35679:case 36299:case 36307:return Rx;case 35680:case 36300:case 36308:case 36293:return Cx;case 36289:case 36303:case 36311:case 36292:return Px}}function Lx(n,e){n.uniform1fv(this.addr,e)}function Ux(n,e){const t=da(e,this.size,2);n.uniform2fv(this.addr,t)}function Ix(n,e){const t=da(e,this.size,3);n.uniform3fv(this.addr,t)}function Nx(n,e){const t=da(e,this.size,4);n.uniform4fv(this.addr,t)}function Fx(n,e){const t=da(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Ox(n,e){const t=da(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Bx(n,e){const t=da(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function zx(n,e){n.uniform1iv(this.addr,e)}function kx(n,e){n.uniform2iv(this.addr,e)}function Hx(n,e){n.uniform3iv(this.addr,e)}function Vx(n,e){n.uniform4iv(this.addr,e)}function Gx(n,e){n.uniform1uiv(this.addr,e)}function Wx(n,e){n.uniform2uiv(this.addr,e)}function Xx(n,e){n.uniform3uiv(this.addr,e)}function Yx(n,e){n.uniform4uiv(this.addr,e)}function $x(n,e,t){const i=this.cache,r=e.length,s=Dl(t,r);ti(i,s)||(n.uniform1iv(this.addr,s),ii(i,s));let a;this.type===n.SAMPLER_2D_SHADOW?a=wu:a=fp;for(let o=0;o!==r;++o)t.setTexture2D(e[o]||a,s[o])}function qx(n,e,t){const i=this.cache,r=e.length,s=Dl(t,r);ti(i,s)||(n.uniform1iv(this.addr,s),ii(i,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||pp,s[a])}function Kx(n,e,t){const i=this.cache,r=e.length,s=Dl(t,r);ti(i,s)||(n.uniform1iv(this.addr,s),ii(i,s));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||mp,s[a])}function Zx(n,e,t){const i=this.cache,r=e.length,s=Dl(t,r);ti(i,s)||(n.uniform1iv(this.addr,s),ii(i,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||dp,s[a])}function jx(n){switch(n){case 5126:return Lx;case 35664:return Ux;case 35665:return Ix;case 35666:return Nx;case 35674:return Fx;case 35675:return Ox;case 35676:return Bx;case 5124:case 35670:return zx;case 35667:case 35671:return kx;case 35668:case 35672:return Hx;case 35669:case 35673:return Vx;case 5125:return Gx;case 36294:return Wx;case 36295:return Xx;case 36296:return Yx;case 35678:case 36198:case 36298:case 36306:case 35682:return $x;case 35679:case 36299:case 36307:return qx;case 35680:case 36300:case 36308:case 36293:return Kx;case 36289:case 36303:case 36311:case 36292:return Zx}}class Jx{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Dx(t.type)}}class Qx{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=jx(t.type)}}class eS{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,t[o.id],i)}}}const pc=/(\w+)(\])?(\[|\.)?/g;function Nf(n,e){n.seq.push(e),n.map[e.id]=e}function tS(n,e,t){const i=n.name,r=i.length;for(pc.lastIndex=0;;){const s=pc.exec(i),a=pc.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){Nf(t,c===void 0?new Jx(o,n,e):new Qx(o,n,e));break}else{let h=t.map[o];h===void 0&&(h=new eS(o),Nf(t,h)),t=h}}}class tl{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);tS(o,l,this)}const r=[],s=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(a):s.push(a);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,i,r){const s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in t&&i.push(a)}return i}}function Ff(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const iS=37297;let nS=0;function rS(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}const Of=new je;function sS(n){ht._getMatrix(Of,ht.workingColorSpace,n);const e=`mat3( ${Of.elements.map(t=>t.toFixed(4))} )`;switch(ht.getTransfer(n)){case dl:return[e,"LinearTransferOETF"];case Et:return[e,"sRGBTransferOETF"];default:return $e("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Bf(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),s=(n.getShaderInfoLog(e)||"").trim();if(i&&s==="")return"";const a=/ERROR: 0:(\d+)/.exec(s);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+rS(n.getShaderSource(e),o)}else return s}function aS(n,e){const t=sS(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const oS={[Fd]:"Linear",[Od]:"Reinhard",[Bd]:"Cineon",[zd]:"ACESFilmic",[Hd]:"AgX",[Vd]:"Neutral",[kd]:"Custom"};function lS(n,e){const t=oS[e];return t===void 0?($e("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const No=new W;function cS(){ht.getLuminanceCoefficients(No);const n=No.x.toFixed(4),e=No.y.toFixed(4),t=No.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function uS(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Aa).join(`
`)}function hS(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function fS(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=n.getActiveAttrib(e,r),a=s.name;let o=1;s.type===n.FLOAT_MAT2&&(o=2),s.type===n.FLOAT_MAT3&&(o=3),s.type===n.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Aa(n){return n!==""}function zf(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function kf(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const dS=/^[ \t]*#include +<([\w\d./]+)>/gm;function Au(n){return n.replace(dS,mS)}const pS=new Map;function mS(n,e){let t=Je[e];if(t===void 0){const i=pS.get(e);if(i!==void 0)t=Je[i],$e('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Au(t)}const gS=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Hf(n){return n.replace(gS,_S)}function _S(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Vf(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}const vS={[Zo]:"SHADOWMAP_TYPE_PCF",[wa]:"SHADOWMAP_TYPE_VSM"};function xS(n){return vS[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const SS={[hs]:"ENVMAP_TYPE_CUBE",[ea]:"ENVMAP_TYPE_CUBE",[Rl]:"ENVMAP_TYPE_CUBE_UV"};function MS(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":SS[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const ES={[ea]:"ENVMAP_MODE_REFRACTION"};function yS(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":ES[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const bS={[Nd]:"ENVMAP_BLENDING_MULTIPLY",[pg]:"ENVMAP_BLENDING_MIX",[mg]:"ENVMAP_BLENDING_ADD"};function TS(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":bS[n.combine]||"ENVMAP_BLENDING_NONE"}function wS(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function AS(n,e,t,i){const r=n.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=xS(t),c=MS(t),u=yS(t),h=TS(t),f=wS(t),d=uS(t),_=hS(s),g=r.createProgram();let m,p,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Aa).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Aa).join(`
`),p.length>0&&(p+=`
`)):(m=[Vf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Aa).join(`
`),p=[Vf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Hn?"#define TONE_MAPPING":"",t.toneMapping!==Hn?Je.tonemapping_pars_fragment:"",t.toneMapping!==Hn?lS("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Je.colorspace_pars_fragment,aS("linearToOutputTexel",t.outputColorSpace),cS(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Aa).join(`
`)),a=Au(a),a=zf(a,t),a=kf(a,t),o=Au(o),o=zf(o,t),o=kf(o,t),a=Hf(a),o=Hf(o),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===tf?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===tf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=x+m+a,M=x+p+o,T=Ff(r,r.VERTEX_SHADER,y),A=Ff(r,r.FRAGMENT_SHADER,M);r.attachShader(g,T),r.attachShader(g,A),t.index0AttributeName!==void 0?r.bindAttribLocation(g,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(g,0,"position"),r.linkProgram(g);function w(D){if(n.debug.checkShaderErrors){const U=r.getProgramInfoLog(g)||"",B=r.getShaderInfoLog(T)||"",H=r.getShaderInfoLog(A)||"",V=U.trim(),k=B.trim(),O=H.trim();let q=!0,ne=!0;if(r.getProgramParameter(g,r.LINK_STATUS)===!1)if(q=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,g,T,A);else{const P=Bf(r,T,"vertex"),re=Bf(r,A,"fragment");gt("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(g,r.VALIDATE_STATUS)+`

Material Name: `+D.name+`
Material Type: `+D.type+`

Program Info Log: `+V+`
`+P+`
`+re)}else V!==""?$e("WebGLProgram: Program Info Log:",V):(k===""||O==="")&&(ne=!1);ne&&(D.diagnostics={runnable:q,programLog:V,vertexShader:{log:k,prefix:m},fragmentShader:{log:O,prefix:p}})}r.deleteShader(T),r.deleteShader(A),C=new tl(r,g),v=fS(r,g)}let C;this.getUniforms=function(){return C===void 0&&w(this),C};let v;this.getAttributes=function(){return v===void 0&&w(this),v};let E=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=r.getProgramParameter(g,iS)),E},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=nS++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=T,this.fragmentShader=A,this}let RS=0;class CS{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new PS(e),t.set(e,i)),i}}class PS{constructor(e){this.id=RS++,this.code=e,this.usedTimes=0}}function DS(n,e,t,i,r,s,a){const o=new ep,l=new CS,c=new Set,u=[],h=new Map,f=r.logarithmicDepthBuffer;let d=r.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(v){return c.add(v),v===0?"uv":`uv${v}`}function m(v,E,D,U,B){const H=U.fog,V=B.geometry,k=v.isMeshStandardMaterial?U.environment:null,O=(v.isMeshStandardMaterial?t:e).get(v.envMap||k),q=O&&O.mapping===Rl?O.image.height:null,ne=_[v.type];v.precision!==null&&(d=r.getMaxPrecision(v.precision),d!==v.precision&&$e("WebGLProgram.getParameters:",v.precision,"not supported, using",d,"instead."));const P=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,re=P!==void 0?P.length:0;let Le=0;V.morphAttributes.position!==void 0&&(Le=1),V.morphAttributes.normal!==void 0&&(Le=2),V.morphAttributes.color!==void 0&&(Le=3);let Oe,We,qe,K;if(ne){const ge=Un[ne];Oe=ge.vertexShader,We=ge.fragmentShader}else Oe=v.vertexShader,We=v.fragmentShader,l.update(v),qe=l.getVertexShaderID(v),K=l.getFragmentShaderID(v);const J=n.getRenderTarget(),fe=n.state.buffers.depth.getReversed(),Ce=B.isInstancedMesh===!0,Se=B.isBatchedMesh===!0,ke=!!v.map,ut=!!v.matcap,be=!!O,Be=!!v.aoMap,Ke=!!v.lightMap,Ie=!!v.bumpMap,G=!!v.normalMap,I=!!v.displacementMap,vt=!!v.emissiveMap,Qe=!!v.metalnessMap,ze=!!v.roughnessMap,Me=v.anisotropy>0,R=v.clearcoat>0,S=v.dispersion>0,N=v.iridescence>0,Z=v.sheen>0,j=v.transmission>0,$=Me&&!!v.anisotropyMap,xe=R&&!!v.clearcoatMap,se=R&&!!v.clearcoatNormalMap,Te=R&&!!v.clearcoatRoughnessMap,ye=N&&!!v.iridescenceMap,ie=N&&!!v.iridescenceThicknessMap,ae=Z&&!!v.sheenColorMap,Ee=Z&&!!v.sheenRoughnessMap,we=!!v.specularMap,oe=!!v.specularColorMap,Ge=!!v.specularIntensityMap,L=j&&!!v.transmissionMap,ue=j&&!!v.thicknessMap,te=!!v.gradientMap,he=!!v.alphaMap,ee=v.alphaTest>0,Q=!!v.alphaHash,ce=!!v.extensions;let Ue=Hn;v.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(Ue=n.toneMapping);const dt={shaderID:ne,shaderType:v.type,shaderName:v.name,vertexShader:Oe,fragmentShader:We,defines:v.defines,customVertexShaderID:qe,customFragmentShaderID:K,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:d,batching:Se,batchingColor:Se&&B._colorsTexture!==null,instancing:Ce,instancingColor:Ce&&B.instanceColor!==null,instancingMorph:Ce&&B.morphTexture!==null,outputColorSpace:J===null?n.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:Lr,alphaToCoverage:!!v.alphaToCoverage,map:ke,matcap:ut,envMap:be,envMapMode:be&&O.mapping,envMapCubeUVHeight:q,aoMap:Be,lightMap:Ke,bumpMap:Ie,normalMap:G,displacementMap:I,emissiveMap:vt,normalMapObjectSpace:G&&v.normalMapType===_g,normalMapTangentSpace:G&&v.normalMapType===jd,metalnessMap:Qe,roughnessMap:ze,anisotropy:Me,anisotropyMap:$,clearcoat:R,clearcoatMap:xe,clearcoatNormalMap:se,clearcoatRoughnessMap:Te,dispersion:S,iridescence:N,iridescenceMap:ye,iridescenceThicknessMap:ie,sheen:Z,sheenColorMap:ae,sheenRoughnessMap:Ee,specularMap:we,specularColorMap:oe,specularIntensityMap:Ge,transmission:j,transmissionMap:L,thicknessMap:ue,gradientMap:te,opaque:v.transparent===!1&&v.blending===Ws&&v.alphaToCoverage===!1,alphaMap:he,alphaTest:ee,alphaHash:Q,combine:v.combine,mapUv:ke&&g(v.map.channel),aoMapUv:Be&&g(v.aoMap.channel),lightMapUv:Ke&&g(v.lightMap.channel),bumpMapUv:Ie&&g(v.bumpMap.channel),normalMapUv:G&&g(v.normalMap.channel),displacementMapUv:I&&g(v.displacementMap.channel),emissiveMapUv:vt&&g(v.emissiveMap.channel),metalnessMapUv:Qe&&g(v.metalnessMap.channel),roughnessMapUv:ze&&g(v.roughnessMap.channel),anisotropyMapUv:$&&g(v.anisotropyMap.channel),clearcoatMapUv:xe&&g(v.clearcoatMap.channel),clearcoatNormalMapUv:se&&g(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Te&&g(v.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&g(v.iridescenceMap.channel),iridescenceThicknessMapUv:ie&&g(v.iridescenceThicknessMap.channel),sheenColorMapUv:ae&&g(v.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&g(v.sheenRoughnessMap.channel),specularMapUv:we&&g(v.specularMap.channel),specularColorMapUv:oe&&g(v.specularColorMap.channel),specularIntensityMapUv:Ge&&g(v.specularIntensityMap.channel),transmissionMapUv:L&&g(v.transmissionMap.channel),thicknessMapUv:ue&&g(v.thicknessMap.channel),alphaMapUv:he&&g(v.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(G||Me),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!V.attributes.uv&&(ke||he),fog:!!H,useFog:v.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:v.flatShading===!0&&v.wireframe===!1,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:fe,skinning:B.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:Le,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&D.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ue,decodeVideoTexture:ke&&v.map.isVideoTexture===!0&&ht.getTransfer(v.map.colorSpace)===Et,decodeVideoTextureEmissive:vt&&v.emissiveMap.isVideoTexture===!0&&ht.getTransfer(v.emissiveMap.colorSpace)===Et,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===rn,flipSided:v.side===li,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:ce&&v.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ce&&v.extensions.multiDraw===!0||Se)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return dt.vertexUv1s=c.has(1),dt.vertexUv2s=c.has(2),dt.vertexUv3s=c.has(3),c.clear(),dt}function p(v){const E=[];if(v.shaderID?E.push(v.shaderID):(E.push(v.customVertexShaderID),E.push(v.customFragmentShaderID)),v.defines!==void 0)for(const D in v.defines)E.push(D),E.push(v.defines[D]);return v.isRawShaderMaterial===!1&&(x(E,v),y(E,v),E.push(n.outputColorSpace)),E.push(v.customProgramCacheKey),E.join()}function x(v,E){v.push(E.precision),v.push(E.outputColorSpace),v.push(E.envMapMode),v.push(E.envMapCubeUVHeight),v.push(E.mapUv),v.push(E.alphaMapUv),v.push(E.lightMapUv),v.push(E.aoMapUv),v.push(E.bumpMapUv),v.push(E.normalMapUv),v.push(E.displacementMapUv),v.push(E.emissiveMapUv),v.push(E.metalnessMapUv),v.push(E.roughnessMapUv),v.push(E.anisotropyMapUv),v.push(E.clearcoatMapUv),v.push(E.clearcoatNormalMapUv),v.push(E.clearcoatRoughnessMapUv),v.push(E.iridescenceMapUv),v.push(E.iridescenceThicknessMapUv),v.push(E.sheenColorMapUv),v.push(E.sheenRoughnessMapUv),v.push(E.specularMapUv),v.push(E.specularColorMapUv),v.push(E.specularIntensityMapUv),v.push(E.transmissionMapUv),v.push(E.thicknessMapUv),v.push(E.combine),v.push(E.fogExp2),v.push(E.sizeAttenuation),v.push(E.morphTargetsCount),v.push(E.morphAttributeCount),v.push(E.numDirLights),v.push(E.numPointLights),v.push(E.numSpotLights),v.push(E.numSpotLightMaps),v.push(E.numHemiLights),v.push(E.numRectAreaLights),v.push(E.numDirLightShadows),v.push(E.numPointLightShadows),v.push(E.numSpotLightShadows),v.push(E.numSpotLightShadowsWithMaps),v.push(E.numLightProbes),v.push(E.shadowMapType),v.push(E.toneMapping),v.push(E.numClippingPlanes),v.push(E.numClipIntersection),v.push(E.depthPacking)}function y(v,E){o.disableAll(),E.instancing&&o.enable(0),E.instancingColor&&o.enable(1),E.instancingMorph&&o.enable(2),E.matcap&&o.enable(3),E.envMap&&o.enable(4),E.normalMapObjectSpace&&o.enable(5),E.normalMapTangentSpace&&o.enable(6),E.clearcoat&&o.enable(7),E.iridescence&&o.enable(8),E.alphaTest&&o.enable(9),E.vertexColors&&o.enable(10),E.vertexAlphas&&o.enable(11),E.vertexUv1s&&o.enable(12),E.vertexUv2s&&o.enable(13),E.vertexUv3s&&o.enable(14),E.vertexTangents&&o.enable(15),E.anisotropy&&o.enable(16),E.alphaHash&&o.enable(17),E.batching&&o.enable(18),E.dispersion&&o.enable(19),E.batchingColor&&o.enable(20),E.gradientMap&&o.enable(21),v.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reversedDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),v.push(o.mask)}function M(v){const E=_[v.type];let D;if(E){const U=Un[E];D=Yg.clone(U.uniforms)}else D=v.uniforms;return D}function T(v,E){let D=h.get(E);return D!==void 0?++D.usedTimes:(D=new AS(n,E,v,s),u.push(D),h.set(E,D)),D}function A(v){if(--v.usedTimes===0){const E=u.indexOf(v);u[E]=u[u.length-1],u.pop(),h.delete(v.cacheKey),v.destroy()}}function w(v){l.remove(v)}function C(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:M,acquireProgram:T,releaseProgram:A,releaseShaderCache:w,programs:u,dispose:C}}function LS(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function r(a,o,l){n.get(a)[o]=l}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function US(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Gf(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Wf(){const n=[];let e=0;const t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function a(h,f,d,_,g,m){let p=n[e];return p===void 0?(p={id:h.id,object:h,geometry:f,material:d,groupOrder:_,renderOrder:h.renderOrder,z:g,group:m},n[e]=p):(p.id=h.id,p.object=h,p.geometry=f,p.material=d,p.groupOrder=_,p.renderOrder=h.renderOrder,p.z=g,p.group=m),e++,p}function o(h,f,d,_,g,m){const p=a(h,f,d,_,g,m);d.transmission>0?i.push(p):d.transparent===!0?r.push(p):t.push(p)}function l(h,f,d,_,g,m){const p=a(h,f,d,_,g,m);d.transmission>0?i.unshift(p):d.transparent===!0?r.unshift(p):t.unshift(p)}function c(h,f){t.length>1&&t.sort(h||US),i.length>1&&i.sort(f||Gf),r.length>1&&r.sort(f||Gf)}function u(){for(let h=e,f=n.length;h<f;h++){const d=n[h];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:o,unshift:l,finish:u,sort:c}}function IS(){let n=new WeakMap;function e(i,r){const s=n.get(i);let a;return s===void 0?(a=new Wf,n.set(i,[a])):r>=s.length?(a=new Wf,s.push(a)):a=s[r],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function NS(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new W,color:new tt};break;case"SpotLight":t={position:new W,direction:new W,color:new tt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new W,color:new tt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new W,skyColor:new tt,groundColor:new tt};break;case"RectAreaLight":t={color:new tt,position:new W,halfWidth:new W,halfHeight:new W};break}return n[e.id]=t,t}}}function FS(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ve};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ve};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ve,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let OS=0;function BS(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function zS(n){const e=new NS,t=FS(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new W);const r=new W,s=new Ht,a=new Ht;function o(c){let u=0,h=0,f=0;for(let v=0;v<9;v++)i.probe[v].set(0,0,0);let d=0,_=0,g=0,m=0,p=0,x=0,y=0,M=0,T=0,A=0,w=0;c.sort(BS);for(let v=0,E=c.length;v<E;v++){const D=c[v],U=D.color,B=D.intensity,H=D.distance;let V=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===ia?V=D.shadow.map.texture:V=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)u+=U.r*B,h+=U.g*B,f+=U.b*B;else if(D.isLightProbe){for(let k=0;k<9;k++)i.probe[k].addScaledVector(D.sh.coefficients[k],B);w++}else if(D.isDirectionalLight){const k=e.get(D);if(k.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){const O=D.shadow,q=t.get(D);q.shadowIntensity=O.intensity,q.shadowBias=O.bias,q.shadowNormalBias=O.normalBias,q.shadowRadius=O.radius,q.shadowMapSize=O.mapSize,i.directionalShadow[d]=q,i.directionalShadowMap[d]=V,i.directionalShadowMatrix[d]=D.shadow.matrix,x++}i.directional[d]=k,d++}else if(D.isSpotLight){const k=e.get(D);k.position.setFromMatrixPosition(D.matrixWorld),k.color.copy(U).multiplyScalar(B),k.distance=H,k.coneCos=Math.cos(D.angle),k.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),k.decay=D.decay,i.spot[g]=k;const O=D.shadow;if(D.map&&(i.spotLightMap[T]=D.map,T++,O.updateMatrices(D),D.castShadow&&A++),i.spotLightMatrix[g]=O.matrix,D.castShadow){const q=t.get(D);q.shadowIntensity=O.intensity,q.shadowBias=O.bias,q.shadowNormalBias=O.normalBias,q.shadowRadius=O.radius,q.shadowMapSize=O.mapSize,i.spotShadow[g]=q,i.spotShadowMap[g]=V,M++}g++}else if(D.isRectAreaLight){const k=e.get(D);k.color.copy(U).multiplyScalar(B),k.halfWidth.set(D.width*.5,0,0),k.halfHeight.set(0,D.height*.5,0),i.rectArea[m]=k,m++}else if(D.isPointLight){const k=e.get(D);if(k.color.copy(D.color).multiplyScalar(D.intensity),k.distance=D.distance,k.decay=D.decay,D.castShadow){const O=D.shadow,q=t.get(D);q.shadowIntensity=O.intensity,q.shadowBias=O.bias,q.shadowNormalBias=O.normalBias,q.shadowRadius=O.radius,q.shadowMapSize=O.mapSize,q.shadowCameraNear=O.camera.near,q.shadowCameraFar=O.camera.far,i.pointShadow[_]=q,i.pointShadowMap[_]=V,i.pointShadowMatrix[_]=D.shadow.matrix,y++}i.point[_]=k,_++}else if(D.isHemisphereLight){const k=e.get(D);k.skyColor.copy(D.color).multiplyScalar(B),k.groundColor.copy(D.groundColor).multiplyScalar(B),i.hemi[p]=k,p++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=me.LTC_FLOAT_1,i.rectAreaLTC2=me.LTC_FLOAT_2):(i.rectAreaLTC1=me.LTC_HALF_1,i.rectAreaLTC2=me.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=f;const C=i.hash;(C.directionalLength!==d||C.pointLength!==_||C.spotLength!==g||C.rectAreaLength!==m||C.hemiLength!==p||C.numDirectionalShadows!==x||C.numPointShadows!==y||C.numSpotShadows!==M||C.numSpotMaps!==T||C.numLightProbes!==w)&&(i.directional.length=d,i.spot.length=g,i.rectArea.length=m,i.point.length=_,i.hemi.length=p,i.directionalShadow.length=x,i.directionalShadowMap.length=x,i.pointShadow.length=y,i.pointShadowMap.length=y,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=x,i.pointShadowMatrix.length=y,i.spotLightMatrix.length=M+T-A,i.spotLightMap.length=T,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=w,C.directionalLength=d,C.pointLength=_,C.spotLength=g,C.rectAreaLength=m,C.hemiLength=p,C.numDirectionalShadows=x,C.numPointShadows=y,C.numSpotShadows=M,C.numSpotMaps=T,C.numLightProbes=w,i.version=OS++)}function l(c,u){let h=0,f=0,d=0,_=0,g=0;const m=u.matrixWorldInverse;for(let p=0,x=c.length;p<x;p++){const y=c[p];if(y.isDirectionalLight){const M=i.directional[h];M.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),h++}else if(y.isSpotLight){const M=i.spot[d];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),d++}else if(y.isRectAreaLight){const M=i.rectArea[_];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),a.identity(),s.copy(y.matrixWorld),s.premultiply(m),a.extractRotation(s),M.halfWidth.set(y.width*.5,0,0),M.halfHeight.set(0,y.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),_++}else if(y.isPointLight){const M=i.point[f];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),f++}else if(y.isHemisphereLight){const M=i.hemi[g];M.direction.setFromMatrixPosition(y.matrixWorld),M.direction.transformDirection(m),g++}}}return{setup:o,setupView:l,state:i}}function Xf(n){const e=new zS(n),t=[],i=[];function r(u){c.camera=u,t.length=0,i.length=0}function s(u){t.push(u)}function a(u){i.push(u)}function o(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function kS(n){let e=new WeakMap;function t(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new Xf(n),e.set(r,[o])):s>=a.length?(o=new Xf(n),a.push(o)):o=a[s],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const HS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,VS=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,GS=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],WS=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],Yf=new Ht,Ma=new W,mc=new W;function XS(n,e,t){let i=new ph;const r=new Ve,s=new Ve,a=new It,o=new r_,l=new s_,c={},u=t.maxTextureSize,h={[or]:li,[li]:or,[rn]:rn},f=new _i({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ve},radius:{value:4}},vertexShader:HS,fragmentShader:VS}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const _=new fn;_.setAttribute("position",new Sn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new fi(_,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zo;let p=this.type;this.render=function(A,w,C){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;A.type===Km&&($e("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),A.type=Zo);const v=n.getRenderTarget(),E=n.getActiveCubeFace(),D=n.getActiveMipmapLevel(),U=n.state;U.setBlending(Fi),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);const B=p!==this.type;B&&w.traverse(function(H){H.material&&(Array.isArray(H.material)?H.material.forEach(V=>V.needsUpdate=!0):H.material.needsUpdate=!0)});for(let H=0,V=A.length;H<V;H++){const k=A[H],O=k.shadow;if(O===void 0){$e("WebGLShadowMap:",k,"has no shadow.");continue}if(O.autoUpdate===!1&&O.needsUpdate===!1)continue;r.copy(O.mapSize);const q=O.getFrameExtents();if(r.multiply(q),s.copy(O.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/q.x),r.x=s.x*q.x,O.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/q.y),r.y=s.y*q.y,O.mapSize.y=s.y)),O.map===null||B===!0){if(O.map!==null&&(O.map.depthTexture!==null&&(O.map.depthTexture.dispose(),O.map.depthTexture=null),O.map.dispose()),this.type===wa){if(k.isPointLight){$e("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}O.map=new ci(r.x,r.y,{format:ia,type:lr,minFilter:Zt,magFilter:Zt,generateMipmaps:!1}),O.map.texture.name=k.name+".shadowMap",O.map.depthTexture=new ra(r.x,r.y,Fn),O.map.depthTexture.name=k.name+".shadowMapDepth",O.map.depthTexture.format=cr,O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=di,O.map.depthTexture.magFilter=di}else{k.isPointLight?(O.map=new op(r.x),O.map.depthTexture=new t_(r.x,Rn)):(O.map=new ci(r.x,r.y),O.map.depthTexture=new ra(r.x,r.y,Rn)),O.map.depthTexture.name=k.name+".shadowMap",O.map.depthTexture.format=cr;const P=n.state.buffers.depth.getReversed();this.type===Zo?(O.map.depthTexture.compareFunction=P?ch:lh,O.map.depthTexture.minFilter=Zt,O.map.depthTexture.magFilter=Zt):(O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=di,O.map.depthTexture.magFilter=di)}O.camera.updateProjectionMatrix()}const ne=O.map.isWebGLCubeRenderTarget?6:1;for(let P=0;P<ne;P++){if(O.map.isWebGLCubeRenderTarget)n.setRenderTarget(O.map,P),n.clear();else{P===0&&(n.setRenderTarget(O.map),n.clear());const re=O.getViewport(P);a.set(s.x*re.x,s.y*re.y,s.x*re.z,s.y*re.w),U.viewport(a)}if(k.isPointLight){const re=O.camera,Le=O.matrix,Oe=k.distance||re.far;Oe!==re.far&&(re.far=Oe,re.updateProjectionMatrix()),Ma.setFromMatrixPosition(k.matrixWorld),re.position.copy(Ma),mc.copy(re.position),mc.add(GS[P]),re.up.copy(WS[P]),re.lookAt(mc),re.updateMatrixWorld(),Le.makeTranslation(-Ma.x,-Ma.y,-Ma.z),Yf.multiplyMatrices(re.projectionMatrix,re.matrixWorldInverse),O._frustum.setFromProjectionMatrix(Yf,re.coordinateSystem,re.reversedDepth)}else O.updateMatrices(k);i=O.getFrustum(),M(w,C,O.camera,k,this.type)}O.isPointLightShadow!==!0&&this.type===wa&&x(O,C),O.needsUpdate=!1}p=this.type,m.needsUpdate=!1,n.setRenderTarget(v,E,D)};function x(A,w){const C=e.update(g);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,d.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new ci(r.x,r.y,{format:ia,type:lr})),f.uniforms.shadow_pass.value=A.map.depthTexture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,n.setRenderTarget(A.mapPass),n.clear(),n.renderBufferDirect(w,null,C,f,g,null),d.uniforms.shadow_pass.value=A.mapPass.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,n.setRenderTarget(A.map),n.clear(),n.renderBufferDirect(w,null,C,d,g,null)}function y(A,w,C,v){let E=null;const D=C.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(D!==void 0)E=D;else if(E=C.isPointLight===!0?l:o,n.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const U=E.uuid,B=w.uuid;let H=c[U];H===void 0&&(H={},c[U]=H);let V=H[B];V===void 0&&(V=E.clone(),H[B]=V,w.addEventListener("dispose",T)),E=V}if(E.visible=w.visible,E.wireframe=w.wireframe,v===wa?E.side=w.shadowSide!==null?w.shadowSide:w.side:E.side=w.shadowSide!==null?w.shadowSide:h[w.side],E.alphaMap=w.alphaMap,E.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,E.map=w.map,E.clipShadows=w.clipShadows,E.clippingPlanes=w.clippingPlanes,E.clipIntersection=w.clipIntersection,E.displacementMap=w.displacementMap,E.displacementScale=w.displacementScale,E.displacementBias=w.displacementBias,E.wireframeLinewidth=w.wireframeLinewidth,E.linewidth=w.linewidth,C.isPointLight===!0&&E.isMeshDistanceMaterial===!0){const U=n.properties.get(E);U.light=C}return E}function M(A,w,C,v,E){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&E===wa)&&(!A.frustumCulled||i.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,A.matrixWorld);const B=e.update(A),H=A.material;if(Array.isArray(H)){const V=B.groups;for(let k=0,O=V.length;k<O;k++){const q=V[k],ne=H[q.materialIndex];if(ne&&ne.visible){const P=y(A,ne,v,E);A.onBeforeShadow(n,A,w,C,B,P,q),n.renderBufferDirect(C,null,B,P,A,q),A.onAfterShadow(n,A,w,C,B,P,q)}}}else if(H.visible){const V=y(A,H,v,E);A.onBeforeShadow(n,A,w,C,B,V,null),n.renderBufferDirect(C,null,B,V,A,null),A.onAfterShadow(n,A,w,C,B,V,null)}}const U=A.children;for(let B=0,H=U.length;B<H;B++)M(U[B],w,C,v,E)}function T(A){A.target.removeEventListener("dispose",T);for(const C in c){const v=c[C],E=A.target.uuid;E in v&&(v[E].dispose(),delete v[E])}}}const YS={[Fc]:fl,[Oc]:kc,[Bc]:Hc,[Qs]:zc,[fl]:Fc,[kc]:Oc,[Hc]:Bc,[zc]:Qs};function $S(n,e){function t(){let L=!1;const ue=new It;let te=null;const he=new It(0,0,0,0);return{setMask:function(ee){te!==ee&&!L&&(n.colorMask(ee,ee,ee,ee),te=ee)},setLocked:function(ee){L=ee},setClear:function(ee,Q,ce,Ue,dt){dt===!0&&(ee*=Ue,Q*=Ue,ce*=Ue),ue.set(ee,Q,ce,Ue),he.equals(ue)===!1&&(n.clearColor(ee,Q,ce,Ue),he.copy(ue))},reset:function(){L=!1,te=null,he.set(-1,0,0,0)}}}function i(){let L=!1,ue=!1,te=null,he=null,ee=null;return{setReversed:function(Q){if(ue!==Q){const ce=e.get("EXT_clip_control");Q?ce.clipControlEXT(ce.LOWER_LEFT_EXT,ce.ZERO_TO_ONE_EXT):ce.clipControlEXT(ce.LOWER_LEFT_EXT,ce.NEGATIVE_ONE_TO_ONE_EXT),ue=Q;const Ue=ee;ee=null,this.setClear(Ue)}},getReversed:function(){return ue},setTest:function(Q){Q?J(n.DEPTH_TEST):fe(n.DEPTH_TEST)},setMask:function(Q){te!==Q&&!L&&(n.depthMask(Q),te=Q)},setFunc:function(Q){if(ue&&(Q=YS[Q]),he!==Q){switch(Q){case Fc:n.depthFunc(n.NEVER);break;case fl:n.depthFunc(n.ALWAYS);break;case Oc:n.depthFunc(n.LESS);break;case Qs:n.depthFunc(n.LEQUAL);break;case Bc:n.depthFunc(n.EQUAL);break;case zc:n.depthFunc(n.GEQUAL);break;case kc:n.depthFunc(n.GREATER);break;case Hc:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}he=Q}},setLocked:function(Q){L=Q},setClear:function(Q){ee!==Q&&(ue&&(Q=1-Q),n.clearDepth(Q),ee=Q)},reset:function(){L=!1,te=null,he=null,ee=null,ue=!1}}}function r(){let L=!1,ue=null,te=null,he=null,ee=null,Q=null,ce=null,Ue=null,dt=null;return{setTest:function(ge){L||(ge?J(n.STENCIL_TEST):fe(n.STENCIL_TEST))},setMask:function(ge){ue!==ge&&!L&&(n.stencilMask(ge),ue=ge)},setFunc:function(ge,Re,Ze){(te!==ge||he!==Re||ee!==Ze)&&(n.stencilFunc(ge,Re,Ze),te=ge,he=Re,ee=Ze)},setOp:function(ge,Re,Ze){(Q!==ge||ce!==Re||Ue!==Ze)&&(n.stencilOp(ge,Re,Ze),Q=ge,ce=Re,Ue=Ze)},setLocked:function(ge){L=ge},setClear:function(ge){dt!==ge&&(n.clearStencil(ge),dt=ge)},reset:function(){L=!1,ue=null,te=null,he=null,ee=null,Q=null,ce=null,Ue=null,dt=null}}}const s=new t,a=new i,o=new r,l=new WeakMap,c=new WeakMap;let u={},h={},f=new WeakMap,d=[],_=null,g=!1,m=null,p=null,x=null,y=null,M=null,T=null,A=null,w=new tt(0,0,0),C=0,v=!1,E=null,D=null,U=null,B=null,H=null;const V=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let k=!1,O=0;const q=n.getParameter(n.VERSION);q.indexOf("WebGL")!==-1?(O=parseFloat(/^WebGL (\d)/.exec(q)[1]),k=O>=1):q.indexOf("OpenGL ES")!==-1&&(O=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),k=O>=2);let ne=null,P={};const re=n.getParameter(n.SCISSOR_BOX),Le=n.getParameter(n.VIEWPORT),Oe=new It().fromArray(re),We=new It().fromArray(Le);function qe(L,ue,te,he){const ee=new Uint8Array(4),Q=n.createTexture();n.bindTexture(L,Q),n.texParameteri(L,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(L,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let ce=0;ce<te;ce++)L===n.TEXTURE_3D||L===n.TEXTURE_2D_ARRAY?n.texImage3D(ue,0,n.RGBA,1,1,he,0,n.RGBA,n.UNSIGNED_BYTE,ee):n.texImage2D(ue+ce,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ee);return Q}const K={};K[n.TEXTURE_2D]=qe(n.TEXTURE_2D,n.TEXTURE_2D,1),K[n.TEXTURE_CUBE_MAP]=qe(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[n.TEXTURE_2D_ARRAY]=qe(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),K[n.TEXTURE_3D]=qe(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),J(n.DEPTH_TEST),a.setFunc(Qs),Ie(!1),G(Kh),J(n.CULL_FACE),Be(Fi);function J(L){u[L]!==!0&&(n.enable(L),u[L]=!0)}function fe(L){u[L]!==!1&&(n.disable(L),u[L]=!1)}function Ce(L,ue){return h[L]!==ue?(n.bindFramebuffer(L,ue),h[L]=ue,L===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=ue),L===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=ue),!0):!1}function Se(L,ue){let te=d,he=!1;if(L){te=f.get(ue),te===void 0&&(te=[],f.set(ue,te));const ee=L.textures;if(te.length!==ee.length||te[0]!==n.COLOR_ATTACHMENT0){for(let Q=0,ce=ee.length;Q<ce;Q++)te[Q]=n.COLOR_ATTACHMENT0+Q;te.length=ee.length,he=!0}}else te[0]!==n.BACK&&(te[0]=n.BACK,he=!0);he&&n.drawBuffers(te)}function ke(L){return _!==L?(n.useProgram(L),_=L,!0):!1}const ut={[Jr]:n.FUNC_ADD,[jm]:n.FUNC_SUBTRACT,[Jm]:n.FUNC_REVERSE_SUBTRACT};ut[Qm]=n.MIN,ut[eg]=n.MAX;const be={[tg]:n.ZERO,[ig]:n.ONE,[ng]:n.SRC_COLOR,[Ic]:n.SRC_ALPHA,[cg]:n.SRC_ALPHA_SATURATE,[og]:n.DST_COLOR,[sg]:n.DST_ALPHA,[rg]:n.ONE_MINUS_SRC_COLOR,[Nc]:n.ONE_MINUS_SRC_ALPHA,[lg]:n.ONE_MINUS_DST_COLOR,[ag]:n.ONE_MINUS_DST_ALPHA,[ug]:n.CONSTANT_COLOR,[hg]:n.ONE_MINUS_CONSTANT_COLOR,[fg]:n.CONSTANT_ALPHA,[dg]:n.ONE_MINUS_CONSTANT_ALPHA};function Be(L,ue,te,he,ee,Q,ce,Ue,dt,ge){if(L===Fi){g===!0&&(fe(n.BLEND),g=!1);return}if(g===!1&&(J(n.BLEND),g=!0),L!==Zm){if(L!==m||ge!==v){if((p!==Jr||M!==Jr)&&(n.blendEquation(n.FUNC_ADD),p=Jr,M=Jr),ge)switch(L){case Ws:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Zh:n.blendFunc(n.ONE,n.ONE);break;case jh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Jh:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:gt("WebGLState: Invalid blending: ",L);break}else switch(L){case Ws:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Zh:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case jh:gt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Jh:gt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:gt("WebGLState: Invalid blending: ",L);break}x=null,y=null,T=null,A=null,w.set(0,0,0),C=0,m=L,v=ge}return}ee=ee||ue,Q=Q||te,ce=ce||he,(ue!==p||ee!==M)&&(n.blendEquationSeparate(ut[ue],ut[ee]),p=ue,M=ee),(te!==x||he!==y||Q!==T||ce!==A)&&(n.blendFuncSeparate(be[te],be[he],be[Q],be[ce]),x=te,y=he,T=Q,A=ce),(Ue.equals(w)===!1||dt!==C)&&(n.blendColor(Ue.r,Ue.g,Ue.b,dt),w.copy(Ue),C=dt),m=L,v=!1}function Ke(L,ue){L.side===rn?fe(n.CULL_FACE):J(n.CULL_FACE);let te=L.side===li;ue&&(te=!te),Ie(te),L.blending===Ws&&L.transparent===!1?Be(Fi):Be(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),s.setMask(L.colorWrite);const he=L.stencilWrite;o.setTest(he),he&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),vt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?J(n.SAMPLE_ALPHA_TO_COVERAGE):fe(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(L){E!==L&&(L?n.frontFace(n.CW):n.frontFace(n.CCW),E=L)}function G(L){L!==$m?(J(n.CULL_FACE),L!==D&&(L===Kh?n.cullFace(n.BACK):L===qm?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):fe(n.CULL_FACE),D=L}function I(L){L!==U&&(k&&n.lineWidth(L),U=L)}function vt(L,ue,te){L?(J(n.POLYGON_OFFSET_FILL),(B!==ue||H!==te)&&(n.polygonOffset(ue,te),B=ue,H=te)):fe(n.POLYGON_OFFSET_FILL)}function Qe(L){L?J(n.SCISSOR_TEST):fe(n.SCISSOR_TEST)}function ze(L){L===void 0&&(L=n.TEXTURE0+V-1),ne!==L&&(n.activeTexture(L),ne=L)}function Me(L,ue,te){te===void 0&&(ne===null?te=n.TEXTURE0+V-1:te=ne);let he=P[te];he===void 0&&(he={type:void 0,texture:void 0},P[te]=he),(he.type!==L||he.texture!==ue)&&(ne!==te&&(n.activeTexture(te),ne=te),n.bindTexture(L,ue||K[L]),he.type=L,he.texture=ue)}function R(){const L=P[ne];L!==void 0&&L.type!==void 0&&(n.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function S(){try{n.compressedTexImage2D(...arguments)}catch(L){gt("WebGLState:",L)}}function N(){try{n.compressedTexImage3D(...arguments)}catch(L){gt("WebGLState:",L)}}function Z(){try{n.texSubImage2D(...arguments)}catch(L){gt("WebGLState:",L)}}function j(){try{n.texSubImage3D(...arguments)}catch(L){gt("WebGLState:",L)}}function $(){try{n.compressedTexSubImage2D(...arguments)}catch(L){gt("WebGLState:",L)}}function xe(){try{n.compressedTexSubImage3D(...arguments)}catch(L){gt("WebGLState:",L)}}function se(){try{n.texStorage2D(...arguments)}catch(L){gt("WebGLState:",L)}}function Te(){try{n.texStorage3D(...arguments)}catch(L){gt("WebGLState:",L)}}function ye(){try{n.texImage2D(...arguments)}catch(L){gt("WebGLState:",L)}}function ie(){try{n.texImage3D(...arguments)}catch(L){gt("WebGLState:",L)}}function ae(L){Oe.equals(L)===!1&&(n.scissor(L.x,L.y,L.z,L.w),Oe.copy(L))}function Ee(L){We.equals(L)===!1&&(n.viewport(L.x,L.y,L.z,L.w),We.copy(L))}function we(L,ue){let te=c.get(ue);te===void 0&&(te=new WeakMap,c.set(ue,te));let he=te.get(L);he===void 0&&(he=n.getUniformBlockIndex(ue,L.name),te.set(L,he))}function oe(L,ue){const he=c.get(ue).get(L);l.get(ue)!==he&&(n.uniformBlockBinding(ue,he,L.__bindingPointIndex),l.set(ue,he))}function Ge(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},ne=null,P={},h={},f=new WeakMap,d=[],_=null,g=!1,m=null,p=null,x=null,y=null,M=null,T=null,A=null,w=new tt(0,0,0),C=0,v=!1,E=null,D=null,U=null,B=null,H=null,Oe.set(0,0,n.canvas.width,n.canvas.height),We.set(0,0,n.canvas.width,n.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:J,disable:fe,bindFramebuffer:Ce,drawBuffers:Se,useProgram:ke,setBlending:Be,setMaterial:Ke,setFlipSided:Ie,setCullFace:G,setLineWidth:I,setPolygonOffset:vt,setScissorTest:Qe,activeTexture:ze,bindTexture:Me,unbindTexture:R,compressedTexImage2D:S,compressedTexImage3D:N,texImage2D:ye,texImage3D:ie,updateUBOMapping:we,uniformBlockBinding:oe,texStorage2D:se,texStorage3D:Te,texSubImage2D:Z,texSubImage3D:j,compressedTexSubImage2D:$,compressedTexSubImage3D:xe,scissor:ae,viewport:Ee,reset:Ge}}function qS(n,e,t,i,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ve,u=new WeakMap;let h;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(R,S){return d?new OffscreenCanvas(R,S):ml("canvas")}function g(R,S,N){let Z=1;const j=Me(R);if((j.width>N||j.height>N)&&(Z=N/Math.max(j.width,j.height)),Z<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const $=Math.floor(Z*j.width),xe=Math.floor(Z*j.height);h===void 0&&(h=_($,xe));const se=S?_($,xe):h;return se.width=$,se.height=xe,se.getContext("2d").drawImage(R,0,0,$,xe),$e("WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+$+"x"+xe+")."),se}else return"data"in R&&$e("WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),R;return R}function m(R){return R.generateMipmaps}function p(R){n.generateMipmap(R)}function x(R){return R.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?n.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function y(R,S,N,Z,j=!1){if(R!==null){if(n[R]!==void 0)return n[R];$e("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let $=S;if(S===n.RED&&(N===n.FLOAT&&($=n.R32F),N===n.HALF_FLOAT&&($=n.R16F),N===n.UNSIGNED_BYTE&&($=n.R8)),S===n.RED_INTEGER&&(N===n.UNSIGNED_BYTE&&($=n.R8UI),N===n.UNSIGNED_SHORT&&($=n.R16UI),N===n.UNSIGNED_INT&&($=n.R32UI),N===n.BYTE&&($=n.R8I),N===n.SHORT&&($=n.R16I),N===n.INT&&($=n.R32I)),S===n.RG&&(N===n.FLOAT&&($=n.RG32F),N===n.HALF_FLOAT&&($=n.RG16F),N===n.UNSIGNED_BYTE&&($=n.RG8)),S===n.RG_INTEGER&&(N===n.UNSIGNED_BYTE&&($=n.RG8UI),N===n.UNSIGNED_SHORT&&($=n.RG16UI),N===n.UNSIGNED_INT&&($=n.RG32UI),N===n.BYTE&&($=n.RG8I),N===n.SHORT&&($=n.RG16I),N===n.INT&&($=n.RG32I)),S===n.RGB_INTEGER&&(N===n.UNSIGNED_BYTE&&($=n.RGB8UI),N===n.UNSIGNED_SHORT&&($=n.RGB16UI),N===n.UNSIGNED_INT&&($=n.RGB32UI),N===n.BYTE&&($=n.RGB8I),N===n.SHORT&&($=n.RGB16I),N===n.INT&&($=n.RGB32I)),S===n.RGBA_INTEGER&&(N===n.UNSIGNED_BYTE&&($=n.RGBA8UI),N===n.UNSIGNED_SHORT&&($=n.RGBA16UI),N===n.UNSIGNED_INT&&($=n.RGBA32UI),N===n.BYTE&&($=n.RGBA8I),N===n.SHORT&&($=n.RGBA16I),N===n.INT&&($=n.RGBA32I)),S===n.RGB&&(N===n.UNSIGNED_INT_5_9_9_9_REV&&($=n.RGB9_E5),N===n.UNSIGNED_INT_10F_11F_11F_REV&&($=n.R11F_G11F_B10F)),S===n.RGBA){const xe=j?dl:ht.getTransfer(Z);N===n.FLOAT&&($=n.RGBA32F),N===n.HALF_FLOAT&&($=n.RGBA16F),N===n.UNSIGNED_BYTE&&($=xe===Et?n.SRGB8_ALPHA8:n.RGBA8),N===n.UNSIGNED_SHORT_4_4_4_4&&($=n.RGBA4),N===n.UNSIGNED_SHORT_5_5_5_1&&($=n.RGB5_A1)}return($===n.R16F||$===n.R32F||$===n.RG16F||$===n.RG32F||$===n.RGBA16F||$===n.RGBA32F)&&e.get("EXT_color_buffer_float"),$}function M(R,S){let N;return R?S===null||S===Rn||S===ta?N=n.DEPTH24_STENCIL8:S===Fn?N=n.DEPTH32F_STENCIL8:S===Za&&(N=n.DEPTH24_STENCIL8,$e("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Rn||S===ta?N=n.DEPTH_COMPONENT24:S===Fn?N=n.DEPTH_COMPONENT32F:S===Za&&(N=n.DEPTH_COMPONENT16),N}function T(R,S){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==di&&R.minFilter!==Zt?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function A(R){const S=R.target;S.removeEventListener("dispose",A),C(S),S.isVideoTexture&&u.delete(S)}function w(R){const S=R.target;S.removeEventListener("dispose",w),E(S)}function C(R){const S=i.get(R);if(S.__webglInit===void 0)return;const N=R.source,Z=f.get(N);if(Z){const j=Z[S.__cacheKey];j.usedTimes--,j.usedTimes===0&&v(R),Object.keys(Z).length===0&&f.delete(N)}i.remove(R)}function v(R){const S=i.get(R);n.deleteTexture(S.__webglTexture);const N=R.source,Z=f.get(N);delete Z[S.__cacheKey],a.memory.textures--}function E(R){const S=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(S.__webglFramebuffer[Z]))for(let j=0;j<S.__webglFramebuffer[Z].length;j++)n.deleteFramebuffer(S.__webglFramebuffer[Z][j]);else n.deleteFramebuffer(S.__webglFramebuffer[Z]);S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer[Z])}else{if(Array.isArray(S.__webglFramebuffer))for(let Z=0;Z<S.__webglFramebuffer.length;Z++)n.deleteFramebuffer(S.__webglFramebuffer[Z]);else n.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&n.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let Z=0;Z<S.__webglColorRenderbuffer.length;Z++)S.__webglColorRenderbuffer[Z]&&n.deleteRenderbuffer(S.__webglColorRenderbuffer[Z]);S.__webglDepthRenderbuffer&&n.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const N=R.textures;for(let Z=0,j=N.length;Z<j;Z++){const $=i.get(N[Z]);$.__webglTexture&&(n.deleteTexture($.__webglTexture),a.memory.textures--),i.remove(N[Z])}i.remove(R)}let D=0;function U(){D=0}function B(){const R=D;return R>=r.maxTextures&&$e("WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+r.maxTextures),D+=1,R}function H(R){const S=[];return S.push(R.wrapS),S.push(R.wrapT),S.push(R.wrapR||0),S.push(R.magFilter),S.push(R.minFilter),S.push(R.anisotropy),S.push(R.internalFormat),S.push(R.format),S.push(R.type),S.push(R.generateMipmaps),S.push(R.premultiplyAlpha),S.push(R.flipY),S.push(R.unpackAlignment),S.push(R.colorSpace),S.join()}function V(R,S){const N=i.get(R);if(R.isVideoTexture&&Qe(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&N.__version!==R.version){const Z=R.image;if(Z===null)$e("WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)$e("WebGLRenderer: Texture marked for update but image is incomplete");else{K(N,R,S);return}}else R.isExternalTexture&&(N.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,N.__webglTexture,n.TEXTURE0+S)}function k(R,S){const N=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&N.__version!==R.version){K(N,R,S);return}else R.isExternalTexture&&(N.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,N.__webglTexture,n.TEXTURE0+S)}function O(R,S){const N=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&N.__version!==R.version){K(N,R,S);return}t.bindTexture(n.TEXTURE_3D,N.__webglTexture,n.TEXTURE0+S)}function q(R,S){const N=i.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&N.__version!==R.version){J(N,R,S);return}t.bindTexture(n.TEXTURE_CUBE_MAP,N.__webglTexture,n.TEXTURE0+S)}const ne={[Wc]:n.REPEAT,[ir]:n.CLAMP_TO_EDGE,[Xc]:n.MIRRORED_REPEAT},P={[di]:n.NEAREST,[gg]:n.NEAREST_MIPMAP_NEAREST,[go]:n.NEAREST_MIPMAP_LINEAR,[Zt]:n.LINEAR,[Bl]:n.LINEAR_MIPMAP_NEAREST,[es]:n.LINEAR_MIPMAP_LINEAR},re={[vg]:n.NEVER,[yg]:n.ALWAYS,[xg]:n.LESS,[lh]:n.LEQUAL,[Sg]:n.EQUAL,[ch]:n.GEQUAL,[Mg]:n.GREATER,[Eg]:n.NOTEQUAL};function Le(R,S){if(S.type===Fn&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===Zt||S.magFilter===Bl||S.magFilter===go||S.magFilter===es||S.minFilter===Zt||S.minFilter===Bl||S.minFilter===go||S.minFilter===es)&&$e("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(R,n.TEXTURE_WRAP_S,ne[S.wrapS]),n.texParameteri(R,n.TEXTURE_WRAP_T,ne[S.wrapT]),(R===n.TEXTURE_3D||R===n.TEXTURE_2D_ARRAY)&&n.texParameteri(R,n.TEXTURE_WRAP_R,ne[S.wrapR]),n.texParameteri(R,n.TEXTURE_MAG_FILTER,P[S.magFilter]),n.texParameteri(R,n.TEXTURE_MIN_FILTER,P[S.minFilter]),S.compareFunction&&(n.texParameteri(R,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(R,n.TEXTURE_COMPARE_FUNC,re[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===di||S.minFilter!==go&&S.minFilter!==es||S.type===Fn&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){const N=e.get("EXT_texture_filter_anisotropic");n.texParameterf(R,N.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,r.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function Oe(R,S){let N=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",A));const Z=S.source;let j=f.get(Z);j===void 0&&(j={},f.set(Z,j));const $=H(S);if($!==R.__cacheKey){j[$]===void 0&&(j[$]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,N=!0),j[$].usedTimes++;const xe=j[R.__cacheKey];xe!==void 0&&(j[R.__cacheKey].usedTimes--,xe.usedTimes===0&&v(S)),R.__cacheKey=$,R.__webglTexture=j[$].texture}return N}function We(R,S,N){return Math.floor(Math.floor(R/N)/S)}function qe(R,S,N,Z){const $=R.updateRanges;if($.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,S.width,S.height,N,Z,S.data);else{$.sort((ie,ae)=>ie.start-ae.start);let xe=0;for(let ie=1;ie<$.length;ie++){const ae=$[xe],Ee=$[ie],we=ae.start+ae.count,oe=We(Ee.start,S.width,4),Ge=We(ae.start,S.width,4);Ee.start<=we+1&&oe===Ge&&We(Ee.start+Ee.count-1,S.width,4)===oe?ae.count=Math.max(ae.count,Ee.start+Ee.count-ae.start):(++xe,$[xe]=Ee)}$.length=xe+1;const se=n.getParameter(n.UNPACK_ROW_LENGTH),Te=n.getParameter(n.UNPACK_SKIP_PIXELS),ye=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,S.width);for(let ie=0,ae=$.length;ie<ae;ie++){const Ee=$[ie],we=Math.floor(Ee.start/4),oe=Math.ceil(Ee.count/4),Ge=we%S.width,L=Math.floor(we/S.width),ue=oe,te=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ge),n.pixelStorei(n.UNPACK_SKIP_ROWS,L),t.texSubImage2D(n.TEXTURE_2D,0,Ge,L,ue,te,N,Z,S.data)}R.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,se),n.pixelStorei(n.UNPACK_SKIP_PIXELS,Te),n.pixelStorei(n.UNPACK_SKIP_ROWS,ye)}}function K(R,S,N){let Z=n.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(Z=n.TEXTURE_2D_ARRAY),S.isData3DTexture&&(Z=n.TEXTURE_3D);const j=Oe(R,S),$=S.source;t.bindTexture(Z,R.__webglTexture,n.TEXTURE0+N);const xe=i.get($);if($.version!==xe.__version||j===!0){t.activeTexture(n.TEXTURE0+N);const se=ht.getPrimaries(ht.workingColorSpace),Te=S.colorSpace===In?null:ht.getPrimaries(S.colorSpace),ye=S.colorSpace===In||se===Te?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let ie=g(S.image,!1,r.maxTextureSize);ie=ze(S,ie);const ae=s.convert(S.format,S.colorSpace),Ee=s.convert(S.type);let we=y(S.internalFormat,ae,Ee,S.colorSpace,S.isVideoTexture);Le(Z,S);let oe;const Ge=S.mipmaps,L=S.isVideoTexture!==!0,ue=xe.__version===void 0||j===!0,te=$.dataReady,he=T(S,ie);if(S.isDepthTexture)we=M(S.format===Er,S.type),ue&&(L?t.texStorage2D(n.TEXTURE_2D,1,we,ie.width,ie.height):t.texImage2D(n.TEXTURE_2D,0,we,ie.width,ie.height,0,ae,Ee,null));else if(S.isDataTexture)if(Ge.length>0){L&&ue&&t.texStorage2D(n.TEXTURE_2D,he,we,Ge[0].width,Ge[0].height);for(let ee=0,Q=Ge.length;ee<Q;ee++)oe=Ge[ee],L?te&&t.texSubImage2D(n.TEXTURE_2D,ee,0,0,oe.width,oe.height,ae,Ee,oe.data):t.texImage2D(n.TEXTURE_2D,ee,we,oe.width,oe.height,0,ae,Ee,oe.data);S.generateMipmaps=!1}else L?(ue&&t.texStorage2D(n.TEXTURE_2D,he,we,ie.width,ie.height),te&&qe(S,ie,ae,Ee)):t.texImage2D(n.TEXTURE_2D,0,we,ie.width,ie.height,0,ae,Ee,ie.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){L&&ue&&t.texStorage3D(n.TEXTURE_2D_ARRAY,he,we,Ge[0].width,Ge[0].height,ie.depth);for(let ee=0,Q=Ge.length;ee<Q;ee++)if(oe=Ge[ee],S.format!==An)if(ae!==null)if(L){if(te)if(S.layerUpdates.size>0){const ce=yf(oe.width,oe.height,S.format,S.type);for(const Ue of S.layerUpdates){const dt=oe.data.subarray(Ue*ce/oe.data.BYTES_PER_ELEMENT,(Ue+1)*ce/oe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ee,0,0,Ue,oe.width,oe.height,1,ae,dt)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ee,0,0,0,oe.width,oe.height,ie.depth,ae,oe.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ee,we,oe.width,oe.height,ie.depth,0,oe.data,0,0);else $e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?te&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ee,0,0,0,oe.width,oe.height,ie.depth,ae,Ee,oe.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ee,we,oe.width,oe.height,ie.depth,0,ae,Ee,oe.data)}else{L&&ue&&t.texStorage2D(n.TEXTURE_2D,he,we,Ge[0].width,Ge[0].height);for(let ee=0,Q=Ge.length;ee<Q;ee++)oe=Ge[ee],S.format!==An?ae!==null?L?te&&t.compressedTexSubImage2D(n.TEXTURE_2D,ee,0,0,oe.width,oe.height,ae,oe.data):t.compressedTexImage2D(n.TEXTURE_2D,ee,we,oe.width,oe.height,0,oe.data):$e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?te&&t.texSubImage2D(n.TEXTURE_2D,ee,0,0,oe.width,oe.height,ae,Ee,oe.data):t.texImage2D(n.TEXTURE_2D,ee,we,oe.width,oe.height,0,ae,Ee,oe.data)}else if(S.isDataArrayTexture)if(L){if(ue&&t.texStorage3D(n.TEXTURE_2D_ARRAY,he,we,ie.width,ie.height,ie.depth),te)if(S.layerUpdates.size>0){const ee=yf(ie.width,ie.height,S.format,S.type);for(const Q of S.layerUpdates){const ce=ie.data.subarray(Q*ee/ie.data.BYTES_PER_ELEMENT,(Q+1)*ee/ie.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,Q,ie.width,ie.height,1,ae,Ee,ce)}S.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,ae,Ee,ie.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,we,ie.width,ie.height,ie.depth,0,ae,Ee,ie.data);else if(S.isData3DTexture)L?(ue&&t.texStorage3D(n.TEXTURE_3D,he,we,ie.width,ie.height,ie.depth),te&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,ae,Ee,ie.data)):t.texImage3D(n.TEXTURE_3D,0,we,ie.width,ie.height,ie.depth,0,ae,Ee,ie.data);else if(S.isFramebufferTexture){if(ue)if(L)t.texStorage2D(n.TEXTURE_2D,he,we,ie.width,ie.height);else{let ee=ie.width,Q=ie.height;for(let ce=0;ce<he;ce++)t.texImage2D(n.TEXTURE_2D,ce,we,ee,Q,0,ae,Ee,null),ee>>=1,Q>>=1}}else if(Ge.length>0){if(L&&ue){const ee=Me(Ge[0]);t.texStorage2D(n.TEXTURE_2D,he,we,ee.width,ee.height)}for(let ee=0,Q=Ge.length;ee<Q;ee++)oe=Ge[ee],L?te&&t.texSubImage2D(n.TEXTURE_2D,ee,0,0,ae,Ee,oe):t.texImage2D(n.TEXTURE_2D,ee,we,ae,Ee,oe);S.generateMipmaps=!1}else if(L){if(ue){const ee=Me(ie);t.texStorage2D(n.TEXTURE_2D,he,we,ee.width,ee.height)}te&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ae,Ee,ie)}else t.texImage2D(n.TEXTURE_2D,0,we,ae,Ee,ie);m(S)&&p(Z),xe.__version=$.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function J(R,S,N){if(S.image.length!==6)return;const Z=Oe(R,S),j=S.source;t.bindTexture(n.TEXTURE_CUBE_MAP,R.__webglTexture,n.TEXTURE0+N);const $=i.get(j);if(j.version!==$.__version||Z===!0){t.activeTexture(n.TEXTURE0+N);const xe=ht.getPrimaries(ht.workingColorSpace),se=S.colorSpace===In?null:ht.getPrimaries(S.colorSpace),Te=S.colorSpace===In||xe===se?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);const ye=S.isCompressedTexture||S.image[0].isCompressedTexture,ie=S.image[0]&&S.image[0].isDataTexture,ae=[];for(let Q=0;Q<6;Q++)!ye&&!ie?ae[Q]=g(S.image[Q],!0,r.maxCubemapSize):ae[Q]=ie?S.image[Q].image:S.image[Q],ae[Q]=ze(S,ae[Q]);const Ee=ae[0],we=s.convert(S.format,S.colorSpace),oe=s.convert(S.type),Ge=y(S.internalFormat,we,oe,S.colorSpace),L=S.isVideoTexture!==!0,ue=$.__version===void 0||Z===!0,te=j.dataReady;let he=T(S,Ee);Le(n.TEXTURE_CUBE_MAP,S);let ee;if(ye){L&&ue&&t.texStorage2D(n.TEXTURE_CUBE_MAP,he,Ge,Ee.width,Ee.height);for(let Q=0;Q<6;Q++){ee=ae[Q].mipmaps;for(let ce=0;ce<ee.length;ce++){const Ue=ee[ce];S.format!==An?we!==null?L?te&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce,0,0,Ue.width,Ue.height,we,Ue.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce,Ge,Ue.width,Ue.height,0,Ue.data):$e("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce,0,0,Ue.width,Ue.height,we,oe,Ue.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce,Ge,Ue.width,Ue.height,0,we,oe,Ue.data)}}}else{if(ee=S.mipmaps,L&&ue){ee.length>0&&he++;const Q=Me(ae[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,he,Ge,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(ie){L?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,ae[Q].width,ae[Q].height,we,oe,ae[Q].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Ge,ae[Q].width,ae[Q].height,0,we,oe,ae[Q].data);for(let ce=0;ce<ee.length;ce++){const dt=ee[ce].image[Q].image;L?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce+1,0,0,dt.width,dt.height,we,oe,dt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce+1,Ge,dt.width,dt.height,0,we,oe,dt.data)}}else{L?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,we,oe,ae[Q]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Ge,we,oe,ae[Q]);for(let ce=0;ce<ee.length;ce++){const Ue=ee[ce];L?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce+1,0,0,we,oe,Ue.image[Q]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ce+1,Ge,we,oe,Ue.image[Q])}}}m(S)&&p(n.TEXTURE_CUBE_MAP),$.__version=j.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function fe(R,S,N,Z,j,$){const xe=s.convert(N.format,N.colorSpace),se=s.convert(N.type),Te=y(N.internalFormat,xe,se,N.colorSpace),ye=i.get(S),ie=i.get(N);if(ie.__renderTarget=S,!ye.__hasExternalTextures){const ae=Math.max(1,S.width>>$),Ee=Math.max(1,S.height>>$);j===n.TEXTURE_3D||j===n.TEXTURE_2D_ARRAY?t.texImage3D(j,$,Te,ae,Ee,S.depth,0,xe,se,null):t.texImage2D(j,$,Te,ae,Ee,0,xe,se,null)}t.bindFramebuffer(n.FRAMEBUFFER,R),vt(S)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Z,j,ie.__webglTexture,0,I(S)):(j===n.TEXTURE_2D||j>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,Z,j,ie.__webglTexture,$),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ce(R,S,N){if(n.bindRenderbuffer(n.RENDERBUFFER,R),S.depthBuffer){const Z=S.depthTexture,j=Z&&Z.isDepthTexture?Z.type:null,$=M(S.stencilBuffer,j),xe=S.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;vt(S)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,I(S),$,S.width,S.height):N?n.renderbufferStorageMultisample(n.RENDERBUFFER,I(S),$,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,$,S.width,S.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,xe,n.RENDERBUFFER,R)}else{const Z=S.textures;for(let j=0;j<Z.length;j++){const $=Z[j],xe=s.convert($.format,$.colorSpace),se=s.convert($.type),Te=y($.internalFormat,xe,se,$.colorSpace);vt(S)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,I(S),Te,S.width,S.height):N?n.renderbufferStorageMultisample(n.RENDERBUFFER,I(S),Te,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,Te,S.width,S.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Se(R,S,N){const Z=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,R),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const j=i.get(S.depthTexture);if(j.__renderTarget=S,(!j.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),Z){if(j.__webglInit===void 0&&(j.__webglInit=!0,S.depthTexture.addEventListener("dispose",A)),j.__webglTexture===void 0){j.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,j.__webglTexture),Le(n.TEXTURE_CUBE_MAP,S.depthTexture);const ye=s.convert(S.depthTexture.format),ie=s.convert(S.depthTexture.type);let ae;S.depthTexture.format===cr?ae=n.DEPTH_COMPONENT24:S.depthTexture.format===Er&&(ae=n.DEPTH24_STENCIL8);for(let Ee=0;Ee<6;Ee++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,ae,S.width,S.height,0,ye,ie,null)}}else V(S.depthTexture,0);const $=j.__webglTexture,xe=I(S),se=Z?n.TEXTURE_CUBE_MAP_POSITIVE_X+N:n.TEXTURE_2D,Te=S.depthTexture.format===Er?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(S.depthTexture.format===cr)vt(S)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Te,se,$,0,xe):n.framebufferTexture2D(n.FRAMEBUFFER,Te,se,$,0);else if(S.depthTexture.format===Er)vt(S)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Te,se,$,0,xe):n.framebufferTexture2D(n.FRAMEBUFFER,Te,se,$,0);else throw new Error("Unknown depthTexture format")}function ke(R){const S=i.get(R),N=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){const Z=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),Z){const j=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,Z.removeEventListener("dispose",j)};Z.addEventListener("dispose",j),S.__depthDisposeCallback=j}S.__boundDepthTexture=Z}if(R.depthTexture&&!S.__autoAllocateDepthBuffer)if(N)for(let Z=0;Z<6;Z++)Se(S.__webglFramebuffer[Z],R,Z);else{const Z=R.texture.mipmaps;Z&&Z.length>0?Se(S.__webglFramebuffer[0],R,0):Se(S.__webglFramebuffer,R,0)}else if(N){S.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[Z]),S.__webglDepthbuffer[Z]===void 0)S.__webglDepthbuffer[Z]=n.createRenderbuffer(),Ce(S.__webglDepthbuffer[Z],R,!1);else{const j=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,$=S.__webglDepthbuffer[Z];n.bindRenderbuffer(n.RENDERBUFFER,$),n.framebufferRenderbuffer(n.FRAMEBUFFER,j,n.RENDERBUFFER,$)}}else{const Z=R.texture.mipmaps;if(Z&&Z.length>0?t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=n.createRenderbuffer(),Ce(S.__webglDepthbuffer,R,!1);else{const j=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,$=S.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,$),n.framebufferRenderbuffer(n.FRAMEBUFFER,j,n.RENDERBUFFER,$)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ut(R,S,N){const Z=i.get(R);S!==void 0&&fe(Z.__webglFramebuffer,R,R.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),N!==void 0&&ke(R)}function be(R){const S=R.texture,N=i.get(R),Z=i.get(S);R.addEventListener("dispose",w);const j=R.textures,$=R.isWebGLCubeRenderTarget===!0,xe=j.length>1;if(xe||(Z.__webglTexture===void 0&&(Z.__webglTexture=n.createTexture()),Z.__version=S.version,a.memory.textures++),$){N.__webglFramebuffer=[];for(let se=0;se<6;se++)if(S.mipmaps&&S.mipmaps.length>0){N.__webglFramebuffer[se]=[];for(let Te=0;Te<S.mipmaps.length;Te++)N.__webglFramebuffer[se][Te]=n.createFramebuffer()}else N.__webglFramebuffer[se]=n.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){N.__webglFramebuffer=[];for(let se=0;se<S.mipmaps.length;se++)N.__webglFramebuffer[se]=n.createFramebuffer()}else N.__webglFramebuffer=n.createFramebuffer();if(xe)for(let se=0,Te=j.length;se<Te;se++){const ye=i.get(j[se]);ye.__webglTexture===void 0&&(ye.__webglTexture=n.createTexture(),a.memory.textures++)}if(R.samples>0&&vt(R)===!1){N.__webglMultisampledFramebuffer=n.createFramebuffer(),N.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,N.__webglMultisampledFramebuffer);for(let se=0;se<j.length;se++){const Te=j[se];N.__webglColorRenderbuffer[se]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,N.__webglColorRenderbuffer[se]);const ye=s.convert(Te.format,Te.colorSpace),ie=s.convert(Te.type),ae=y(Te.internalFormat,ye,ie,Te.colorSpace,R.isXRRenderTarget===!0),Ee=I(R);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ee,ae,R.width,R.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+se,n.RENDERBUFFER,N.__webglColorRenderbuffer[se])}n.bindRenderbuffer(n.RENDERBUFFER,null),R.depthBuffer&&(N.__webglDepthRenderbuffer=n.createRenderbuffer(),Ce(N.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if($){t.bindTexture(n.TEXTURE_CUBE_MAP,Z.__webglTexture),Le(n.TEXTURE_CUBE_MAP,S);for(let se=0;se<6;se++)if(S.mipmaps&&S.mipmaps.length>0)for(let Te=0;Te<S.mipmaps.length;Te++)fe(N.__webglFramebuffer[se][Te],R,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Te);else fe(N.__webglFramebuffer[se],R,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0);m(S)&&p(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(xe){for(let se=0,Te=j.length;se<Te;se++){const ye=j[se],ie=i.get(ye);let ae=n.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ae=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ae,ie.__webglTexture),Le(ae,ye),fe(N.__webglFramebuffer,R,ye,n.COLOR_ATTACHMENT0+se,ae,0),m(ye)&&p(ae)}t.unbindTexture()}else{let se=n.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(se=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(se,Z.__webglTexture),Le(se,S),S.mipmaps&&S.mipmaps.length>0)for(let Te=0;Te<S.mipmaps.length;Te++)fe(N.__webglFramebuffer[Te],R,S,n.COLOR_ATTACHMENT0,se,Te);else fe(N.__webglFramebuffer,R,S,n.COLOR_ATTACHMENT0,se,0);m(S)&&p(se),t.unbindTexture()}R.depthBuffer&&ke(R)}function Be(R){const S=R.textures;for(let N=0,Z=S.length;N<Z;N++){const j=S[N];if(m(j)){const $=x(R),xe=i.get(j).__webglTexture;t.bindTexture($,xe),p($),t.unbindTexture()}}}const Ke=[],Ie=[];function G(R){if(R.samples>0){if(vt(R)===!1){const S=R.textures,N=R.width,Z=R.height;let j=n.COLOR_BUFFER_BIT;const $=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,xe=i.get(R),se=S.length>1;if(se)for(let ye=0;ye<S.length;ye++)t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ye,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ye,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer);const Te=R.texture.mipmaps;Te&&Te.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,xe.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let ye=0;ye<S.length;ye++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(j|=n.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(j|=n.STENCIL_BUFFER_BIT)),se){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,xe.__webglColorRenderbuffer[ye]);const ie=i.get(S[ye]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,ie,0)}n.blitFramebuffer(0,0,N,Z,0,0,N,Z,j,n.NEAREST),l===!0&&(Ke.length=0,Ie.length=0,Ke.push(n.COLOR_ATTACHMENT0+ye),R.depthBuffer&&R.resolveDepthBuffer===!1&&(Ke.push($),Ie.push($),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Ie)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Ke))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),se)for(let ye=0;ye<S.length;ye++){t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ye,n.RENDERBUFFER,xe.__webglColorRenderbuffer[ye]);const ie=i.get(S[ye]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ye,n.TEXTURE_2D,ie,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const S=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[S])}}}function I(R){return Math.min(r.maxSamples,R.samples)}function vt(R){const S=i.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Qe(R){const S=a.render.frame;u.get(R)!==S&&(u.set(R,S),R.update())}function ze(R,S){const N=R.colorSpace,Z=R.format,j=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||N!==Lr&&N!==In&&(ht.getTransfer(N)===Et?(Z!==An||j!==Kt)&&$e("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):gt("WebGLTextures: Unsupported texture color space:",N)),S}function Me(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=U,this.setTexture2D=V,this.setTexture2DArray=k,this.setTexture3D=O,this.setTextureCube=q,this.rebindTextures=ut,this.setupRenderTarget=be,this.updateRenderTargetMipmap=Be,this.updateMultisampleRenderTarget=G,this.setupDepthRenderbuffer=ke,this.setupFrameBufferTexture=fe,this.useMultisampledRTT=vt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function KS(n,e){function t(i,r=In){let s;const a=ht.getTransfer(r);if(i===Kt)return n.UNSIGNED_BYTE;if(i===nh)return n.UNSIGNED_SHORT_4_4_4_4;if(i===rh)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Yd)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===$d)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Wd)return n.BYTE;if(i===Xd)return n.SHORT;if(i===Za)return n.UNSIGNED_SHORT;if(i===ih)return n.INT;if(i===Rn)return n.UNSIGNED_INT;if(i===Fn)return n.FLOAT;if(i===lr)return n.HALF_FLOAT;if(i===qd)return n.ALPHA;if(i===Kd)return n.RGB;if(i===An)return n.RGBA;if(i===cr)return n.DEPTH_COMPONENT;if(i===Er)return n.DEPTH_STENCIL;if(i===Zd)return n.RED;if(i===sh)return n.RED_INTEGER;if(i===ia)return n.RG;if(i===ah)return n.RG_INTEGER;if(i===oh)return n.RGBA_INTEGER;if(i===jo||i===Jo||i===Qo||i===el)if(a===Et)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===jo)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Jo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Qo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===el)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===jo)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Jo)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Qo)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===el)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Yc||i===$c||i===qc||i===Kc)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===Yc)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===$c)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===qc)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Kc)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Zc||i===jc||i===Jc||i===Qc||i===eu||i===tu||i===iu)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===Zc||i===jc)return a===Et?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Jc)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===Qc)return s.COMPRESSED_R11_EAC;if(i===eu)return s.COMPRESSED_SIGNED_R11_EAC;if(i===tu)return s.COMPRESSED_RG11_EAC;if(i===iu)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===nu||i===ru||i===su||i===au||i===ou||i===lu||i===cu||i===uu||i===hu||i===fu||i===du||i===pu||i===mu||i===gu)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===nu)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ru)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===su)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===au)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ou)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===lu)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===cu)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===uu)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===hu)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===fu)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===du)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===pu)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===mu)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===gu)return a===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===_u||i===vu||i===xu)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===_u)return a===Et?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===vu)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===xu)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Su||i===Mu||i===Eu||i===yu)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Su)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Mu)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Eu)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===yu)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ta?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const ZS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,jS=`
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

}`;class JS{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new lp(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new _i({vertexShader:ZS,fragmentShader:jS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new fi(new po(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class QS extends fr{constructor(e,t){super();const i=this;let r=null,s=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,f=null,d=null,_=null;const g=typeof XRWebGLBinding<"u",m=new JS,p={},x=t.getContextAttributes();let y=null,M=null;const T=[],A=[],w=new Ve;let C=null;const v=new tn;v.viewport=new It;const E=new tn;E.viewport=new It;const D=[v,E],U=new c_;let B=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let J=T[K];return J===void 0&&(J=new oc,T[K]=J),J.getTargetRaySpace()},this.getControllerGrip=function(K){let J=T[K];return J===void 0&&(J=new oc,T[K]=J),J.getGripSpace()},this.getHand=function(K){let J=T[K];return J===void 0&&(J=new oc,T[K]=J),J.getHandSpace()};function V(K){const J=A.indexOf(K.inputSource);if(J===-1)return;const fe=T[J];fe!==void 0&&(fe.update(K.inputSource,K.frame,c||a),fe.dispatchEvent({type:K.type,data:K.inputSource}))}function k(){r.removeEventListener("select",V),r.removeEventListener("selectstart",V),r.removeEventListener("selectend",V),r.removeEventListener("squeeze",V),r.removeEventListener("squeezestart",V),r.removeEventListener("squeezeend",V),r.removeEventListener("end",k),r.removeEventListener("inputsourceschange",O);for(let K=0;K<T.length;K++){const J=A[K];J!==null&&(A[K]=null,T[K].disconnect(J))}B=null,H=null,m.reset();for(const K in p)delete p[K];e.setRenderTarget(y),d=null,f=null,h=null,r=null,M=null,qe.stop(),i.isPresenting=!1,e.setPixelRatio(C),e.setSize(w.width,w.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){s=K,i.isPresenting===!0&&$e("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,i.isPresenting===!0&&$e("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h===null&&g&&(h=new XRWebGLBinding(r,t)),h},this.getFrame=function(){return _},this.getSession=function(){return r},this.setSession=async function(K){if(r=K,r!==null){if(y=e.getRenderTarget(),r.addEventListener("select",V),r.addEventListener("selectstart",V),r.addEventListener("selectend",V),r.addEventListener("squeeze",V),r.addEventListener("squeezestart",V),r.addEventListener("squeezeend",V),r.addEventListener("end",k),r.addEventListener("inputsourceschange",O),x.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(w),g&&"createProjectionLayer"in XRWebGLBinding.prototype){let fe=null,Ce=null,Se=null;x.depth&&(Se=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,fe=x.stencil?Er:cr,Ce=x.stencil?ta:Rn);const ke={colorFormat:t.RGBA8,depthFormat:Se,scaleFactor:s};h=this.getBinding(),f=h.createProjectionLayer(ke),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),M=new ci(f.textureWidth,f.textureHeight,{format:An,type:Kt,depthTexture:new ra(f.textureWidth,f.textureHeight,Ce,void 0,void 0,void 0,void 0,void 0,void 0,fe),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const fe={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(r,t,fe),r.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),M=new ci(d.framebufferWidth,d.framebufferHeight,{format:An,type:Kt,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(o),qe.setContext(r),qe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function O(K){for(let J=0;J<K.removed.length;J++){const fe=K.removed[J],Ce=A.indexOf(fe);Ce>=0&&(A[Ce]=null,T[Ce].disconnect(fe))}for(let J=0;J<K.added.length;J++){const fe=K.added[J];let Ce=A.indexOf(fe);if(Ce===-1){for(let ke=0;ke<T.length;ke++)if(ke>=A.length){A.push(fe),Ce=ke;break}else if(A[ke]===null){A[ke]=fe,Ce=ke;break}if(Ce===-1)break}const Se=T[Ce];Se&&Se.connect(fe)}}const q=new W,ne=new W;function P(K,J,fe){q.setFromMatrixPosition(J.matrixWorld),ne.setFromMatrixPosition(fe.matrixWorld);const Ce=q.distanceTo(ne),Se=J.projectionMatrix.elements,ke=fe.projectionMatrix.elements,ut=Se[14]/(Se[10]-1),be=Se[14]/(Se[10]+1),Be=(Se[9]+1)/Se[5],Ke=(Se[9]-1)/Se[5],Ie=(Se[8]-1)/Se[0],G=(ke[8]+1)/ke[0],I=ut*Ie,vt=ut*G,Qe=Ce/(-Ie+G),ze=Qe*-Ie;if(J.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(ze),K.translateZ(Qe),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Se[10]===-1)K.projectionMatrix.copy(J.projectionMatrix),K.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{const Me=ut+Qe,R=be+Qe,S=I-ze,N=vt+(Ce-ze),Z=Be*be/R*Me,j=Ke*be/R*Me;K.projectionMatrix.makePerspective(S,N,Z,j,Me,R),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function re(K,J){J===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(J.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(r===null)return;let J=K.near,fe=K.far;m.texture!==null&&(m.depthNear>0&&(J=m.depthNear),m.depthFar>0&&(fe=m.depthFar)),U.near=E.near=v.near=J,U.far=E.far=v.far=fe,(B!==U.near||H!==U.far)&&(r.updateRenderState({depthNear:U.near,depthFar:U.far}),B=U.near,H=U.far),U.layers.mask=K.layers.mask|6,v.layers.mask=U.layers.mask&3,E.layers.mask=U.layers.mask&5;const Ce=K.parent,Se=U.cameras;re(U,Ce);for(let ke=0;ke<Se.length;ke++)re(Se[ke],Ce);Se.length===2?P(U,v,E):U.projectionMatrix.copy(v.projectionMatrix),Le(K,U,Ce)};function Le(K,J,fe){fe===null?K.matrix.copy(J.matrixWorld):(K.matrix.copy(fe.matrixWorld),K.matrix.invert(),K.matrix.multiply(J.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(J.projectionMatrix),K.projectionMatrixInverse.copy(J.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=bu*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(K){l=K,f!==null&&(f.fixedFoveation=K),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(U)},this.getCameraTexture=function(K){return p[K]};let Oe=null;function We(K,J){if(u=J.getViewerPose(c||a),_=J,u!==null){const fe=u.views;d!==null&&(e.setRenderTargetFramebuffer(M,d.framebuffer),e.setRenderTarget(M));let Ce=!1;fe.length!==U.cameras.length&&(U.cameras.length=0,Ce=!0);for(let be=0;be<fe.length;be++){const Be=fe[be];let Ke=null;if(d!==null)Ke=d.getViewport(Be);else{const G=h.getViewSubImage(f,Be);Ke=G.viewport,be===0&&(e.setRenderTargetTextures(M,G.colorTexture,G.depthStencilTexture),e.setRenderTarget(M))}let Ie=D[be];Ie===void 0&&(Ie=new tn,Ie.layers.enable(be),Ie.viewport=new It,D[be]=Ie),Ie.matrix.fromArray(Be.transform.matrix),Ie.matrix.decompose(Ie.position,Ie.quaternion,Ie.scale),Ie.projectionMatrix.fromArray(Be.projectionMatrix),Ie.projectionMatrixInverse.copy(Ie.projectionMatrix).invert(),Ie.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),be===0&&(U.matrix.copy(Ie.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),Ce===!0&&U.cameras.push(Ie)}const Se=r.enabledFeatures;if(Se&&Se.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&g){h=i.getBinding();const be=h.getDepthInformation(fe[0]);be&&be.isValid&&be.texture&&m.init(be,r.renderState)}if(Se&&Se.includes("camera-access")&&g){e.state.unbindTexture(),h=i.getBinding();for(let be=0;be<fe.length;be++){const Be=fe[be].camera;if(Be){let Ke=p[Be];Ke||(Ke=new lp,p[Be]=Ke);const Ie=h.getCameraImage(Be);Ke.sourceTexture=Ie}}}}for(let fe=0;fe<T.length;fe++){const Ce=A[fe],Se=T[fe];Ce!==null&&Se!==void 0&&Se.update(Ce,J,c||a)}Oe&&Oe(K,J),J.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:J}),_=null}const qe=new hp;qe.setAnimationLoop(We),this.setAnimationLoop=function(K){Oe=K},this.dispose=function(){}}}const Wr=new Wn,eM=new Ht;function tM(n,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,rp(n)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function r(m,p,x,y,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),h(m,p)):p.isMeshPhongMaterial?(s(m,p),u(m,p)):p.isMeshStandardMaterial?(s(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,M)):p.isMeshMatcapMaterial?(s(m,p),_(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),g(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,x,y):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===li&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===li&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const x=e.get(p),y=x.envMap,M=x.envMapRotation;y&&(m.envMap.value=y,Wr.copy(M),Wr.x*=-1,Wr.y*=-1,Wr.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Wr.y*=-1,Wr.z*=-1),m.envMapRotation.value.setFromMatrix4(eM.makeRotationFromEuler(Wr)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,x,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*x,m.scale.value=y*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,x){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===li&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,p){p.matcap&&(m.matcap.value=p.matcap)}function g(m,p){const x=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function iM(n,e,t,i){let r={},s={},a=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,y){const M=y.program;i.uniformBlockBinding(x,M)}function c(x,y){let M=r[x.id];M===void 0&&(_(x),M=u(x),r[x.id]=M,x.addEventListener("dispose",m));const T=y.program;i.updateUBOMapping(x,T);const A=e.render.frame;s[x.id]!==A&&(f(x),s[x.id]=A)}function u(x){const y=h();x.__bindingPointIndex=y;const M=n.createBuffer(),T=x.__size,A=x.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,T,A),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,y,M),M}function h(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return gt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(x){const y=r[x.id],M=x.uniforms,T=x.__cache;n.bindBuffer(n.UNIFORM_BUFFER,y);for(let A=0,w=M.length;A<w;A++){const C=Array.isArray(M[A])?M[A]:[M[A]];for(let v=0,E=C.length;v<E;v++){const D=C[v];if(d(D,A,v,T)===!0){const U=D.__offset,B=Array.isArray(D.value)?D.value:[D.value];let H=0;for(let V=0;V<B.length;V++){const k=B[V],O=g(k);typeof k=="number"||typeof k=="boolean"?(D.__data[0]=k,n.bufferSubData(n.UNIFORM_BUFFER,U+H,D.__data)):k.isMatrix3?(D.__data[0]=k.elements[0],D.__data[1]=k.elements[1],D.__data[2]=k.elements[2],D.__data[3]=0,D.__data[4]=k.elements[3],D.__data[5]=k.elements[4],D.__data[6]=k.elements[5],D.__data[7]=0,D.__data[8]=k.elements[6],D.__data[9]=k.elements[7],D.__data[10]=k.elements[8],D.__data[11]=0):(k.toArray(D.__data,H),H+=O.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,U,D.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(x,y,M,T){const A=x.value,w=y+"_"+M;if(T[w]===void 0)return typeof A=="number"||typeof A=="boolean"?T[w]=A:T[w]=A.clone(),!0;{const C=T[w];if(typeof A=="number"||typeof A=="boolean"){if(C!==A)return T[w]=A,!0}else if(C.equals(A)===!1)return C.copy(A),!0}return!1}function _(x){const y=x.uniforms;let M=0;const T=16;for(let w=0,C=y.length;w<C;w++){const v=Array.isArray(y[w])?y[w]:[y[w]];for(let E=0,D=v.length;E<D;E++){const U=v[E],B=Array.isArray(U.value)?U.value:[U.value];for(let H=0,V=B.length;H<V;H++){const k=B[H],O=g(k),q=M%T,ne=q%O.boundary,P=q+ne;M+=ne,P!==0&&T-P<O.storage&&(M+=T-P),U.__data=new Float32Array(O.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=M,M+=O.storage}}}const A=M%T;return A>0&&(M+=T-A),x.__size=M,x.__cache={},this}function g(x){const y={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(y.boundary=4,y.storage=4):x.isVector2?(y.boundary=8,y.storage=8):x.isVector3||x.isColor?(y.boundary=16,y.storage=12):x.isVector4?(y.boundary=16,y.storage=16):x.isMatrix3?(y.boundary=48,y.storage=48):x.isMatrix4?(y.boundary=64,y.storage=64):x.isTexture?$e("WebGLRenderer: Texture samplers can not be part of an uniforms group."):$e("WebGLRenderer: Unsupported uniform value type.",x),y}function m(x){const y=x.target;y.removeEventListener("dispose",m);const M=a.indexOf(y.__bindingPointIndex);a.splice(M,1),n.deleteBuffer(r[y.id]),delete r[y.id],delete s[y.id]}function p(){for(const x in r)n.deleteBuffer(r[x]);a=[],r={},s={}}return{bind:l,update:c,dispose:p}}const nM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Pn=null;function rM(){return Pn===null&&(Pn=new jg(nM,16,16,ia,lr),Pn.name="DFG_LUT",Pn.minFilter=Zt,Pn.magFilter=Zt,Pn.wrapS=ir,Pn.wrapT=ir,Pn.generateMipmaps=!1,Pn.needsUpdate=!0),Pn}class sM{constructor(e={}){const{canvas:t=bg(),context:i=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:f=!1,outputBufferType:d=Kt}=e;this.isWebGLRenderer=!0;let _;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=i.getContextAttributes().alpha}else _=a;const g=d,m=new Set([oh,ah,sh]),p=new Set([Kt,Rn,Za,ta,nh,rh]),x=new Uint32Array(4),y=new Int32Array(4);let M=null,T=null;const A=[],w=[];let C=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Hn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const v=this;let E=!1;this._outputColorSpace=yt;let D=0,U=0,B=null,H=-1,V=null;const k=new It,O=new It;let q=null;const ne=new tt(0);let P=0,re=t.width,Le=t.height,Oe=1,We=null,qe=null;const K=new It(0,0,re,Le),J=new It(0,0,re,Le);let fe=!1;const Ce=new ph;let Se=!1,ke=!1;const ut=new Ht,be=new W,Be=new It,Ke={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ie=!1;function G(){return B===null?Oe:1}let I=i;function vt(b,F){return t.getContext(b,F)}try{const b={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${lo}`),t.addEventListener("webglcontextlost",Ue,!1),t.addEventListener("webglcontextrestored",dt,!1),t.addEventListener("webglcontextcreationerror",ge,!1),I===null){const F="webgl2";if(I=vt(F,b),I===null)throw vt(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw gt("WebGLRenderer: "+b.message),b}let Qe,ze,Me,R,S,N,Z,j,$,xe,se,Te,ye,ie,ae,Ee,we,oe,Ge,L,ue,te,he,ee;function Q(){Qe=new rx(I),Qe.init(),te=new KS(I,Qe),ze=new Kv(I,Qe,e,te),Me=new $S(I,Qe),ze.reversedDepthBuffer&&f&&Me.buffers.depth.setReversed(!0),R=new ox(I),S=new LS,N=new qS(I,Qe,Me,S,ze,te,R),Z=new jv(v),j=new nx(v),$=new h_(I),he=new $v(I,$),xe=new sx(I,$,R,he),se=new cx(I,xe,$,R),Ge=new lx(I,ze,N),Ee=new Zv(S),Te=new DS(v,Z,j,Qe,ze,he,Ee),ye=new tM(v,S),ie=new IS,ae=new kS(Qe),oe=new Yv(v,Z,j,Me,se,_,l),we=new XS(v,se,ze),ee=new iM(I,R,ze,Me),L=new qv(I,Qe,R),ue=new ax(I,Qe,R),R.programs=Te.programs,v.capabilities=ze,v.extensions=Qe,v.properties=S,v.renderLists=ie,v.shadowMap=we,v.state=Me,v.info=R}Q(),g!==Kt&&(C=new hx(g,t.width,t.height,r,s));const ce=new QS(v,I);this.xr=ce,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const b=Qe.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Qe.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return Oe},this.setPixelRatio=function(b){b!==void 0&&(Oe=b,this.setSize(re,Le,!1))},this.getSize=function(b){return b.set(re,Le)},this.setSize=function(b,F,Y=!0){if(ce.isPresenting){$e("WebGLRenderer: Can't change size while VR device is presenting.");return}re=b,Le=F,t.width=Math.floor(b*Oe),t.height=Math.floor(F*Oe),Y===!0&&(t.style.width=b+"px",t.style.height=F+"px"),C!==null&&C.setSize(t.width,t.height),this.setViewport(0,0,b,F)},this.getDrawingBufferSize=function(b){return b.set(re*Oe,Le*Oe).floor()},this.setDrawingBufferSize=function(b,F,Y){re=b,Le=F,Oe=Y,t.width=Math.floor(b*Y),t.height=Math.floor(F*Y),this.setViewport(0,0,b,F)},this.setEffects=function(b){if(g===Kt){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let F=0;F<b.length;F++)if(b[F].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}C.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(k)},this.getViewport=function(b){return b.copy(K)},this.setViewport=function(b,F,Y,X){b.isVector4?K.set(b.x,b.y,b.z,b.w):K.set(b,F,Y,X),Me.viewport(k.copy(K).multiplyScalar(Oe).round())},this.getScissor=function(b){return b.copy(J)},this.setScissor=function(b,F,Y,X){b.isVector4?J.set(b.x,b.y,b.z,b.w):J.set(b,F,Y,X),Me.scissor(O.copy(J).multiplyScalar(Oe).round())},this.getScissorTest=function(){return fe},this.setScissorTest=function(b){Me.setScissorTest(fe=b)},this.setOpaqueSort=function(b){We=b},this.setTransparentSort=function(b){qe=b},this.getClearColor=function(b){return b.copy(oe.getClearColor())},this.setClearColor=function(){oe.setClearColor(...arguments)},this.getClearAlpha=function(){return oe.getClearAlpha()},this.setClearAlpha=function(){oe.setClearAlpha(...arguments)},this.clear=function(b=!0,F=!0,Y=!0){let X=0;if(b){let z=!1;if(B!==null){const le=B.texture.format;z=m.has(le)}if(z){const le=B.texture.type,_e=p.has(le),de=oe.getClearColor(),ve=oe.getClearAlpha(),Pe=de.r,He=de.g,Ne=de.b;_e?(x[0]=Pe,x[1]=He,x[2]=Ne,x[3]=ve,I.clearBufferuiv(I.COLOR,0,x)):(y[0]=Pe,y[1]=He,y[2]=Ne,y[3]=ve,I.clearBufferiv(I.COLOR,0,y))}else X|=I.COLOR_BUFFER_BIT}F&&(X|=I.DEPTH_BUFFER_BIT),Y&&(X|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Ue,!1),t.removeEventListener("webglcontextrestored",dt,!1),t.removeEventListener("webglcontextcreationerror",ge,!1),oe.dispose(),ie.dispose(),ae.dispose(),S.dispose(),Z.dispose(),j.dispose(),se.dispose(),he.dispose(),ee.dispose(),Te.dispose(),ce.dispose(),ce.removeEventListener("sessionstart",Vt),ce.removeEventListener("sessionend",it),St.stop()};function Ue(b){b.preventDefault(),rf("WebGLRenderer: Context Lost."),E=!0}function dt(){rf("WebGLRenderer: Context Restored."),E=!1;const b=R.autoReset,F=we.enabled,Y=we.autoUpdate,X=we.needsUpdate,z=we.type;Q(),R.autoReset=b,we.enabled=F,we.autoUpdate=Y,we.needsUpdate=X,we.type=z}function ge(b){gt("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Re(b){const F=b.target;F.removeEventListener("dispose",Re),Ze(F)}function Ze(b){pe(b),S.remove(b)}function pe(b){const F=S.get(b).programs;F!==void 0&&(F.forEach(function(Y){Te.releaseProgram(Y)}),b.isShaderMaterial&&Te.releaseShaderCache(b))}this.renderBufferDirect=function(b,F,Y,X,z,le){F===null&&(F=Ke);const _e=z.isMesh&&z.matrixWorld.determinant()<0,de=jt(b,F,Y,X,z);Me.setMaterial(X,_e);let ve=Y.index,Pe=1;if(X.wireframe===!0){if(ve=xe.getWireframeAttribute(Y),ve===void 0)return;Pe=2}const He=Y.drawRange,Ne=Y.attributes.position;let nt=He.start*Pe,Tt=(He.start+He.count)*Pe;le!==null&&(nt=Math.max(nt,le.start*Pe),Tt=Math.min(Tt,(le.start+le.count)*Pe)),ve!==null?(nt=Math.max(nt,0),Tt=Math.min(Tt,ve.count)):Ne!=null&&(nt=Math.max(nt,0),Tt=Math.min(Tt,Ne.count));const Bt=Tt-nt;if(Bt<0||Bt===1/0)return;he.setup(z,X,de,Y,ve);let zt,At=L;if(ve!==null&&(zt=$.get(ve),At=ue,At.setIndex(zt)),z.isMesh)X.wireframe===!0?(Me.setLineWidth(X.wireframeLinewidth*G()),At.setMode(I.LINES)):At.setMode(I.TRIANGLES);else if(z.isLine){let Fe=X.linewidth;Fe===void 0&&(Fe=1),Me.setLineWidth(Fe*G()),z.isLineSegments?At.setMode(I.LINES):z.isLineLoop?At.setMode(I.LINE_LOOP):At.setMode(I.LINE_STRIP)}else z.isPoints?At.setMode(I.POINTS):z.isSprite&&At.setMode(I.TRIANGLES);if(z.isBatchedMesh)if(z._multiDrawInstances!==null)ja("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),At.renderMultiDrawInstances(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount,z._multiDrawInstances);else if(Qe.get("WEBGL_multi_draw"))At.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{const Fe=z._multiDrawStarts,Mt=z._multiDrawCounts,mt=z._multiDrawCount,qi=ve?$.get(ve).bytesPerElement:1,Ss=S.get(X).currentProgram.getUniforms();for(let Ki=0;Ki<mt;Ki++)Ss.setValue(I,"_gl_DrawID",Ki),At.render(Fe[Ki]/qi,Mt[Ki])}else if(z.isInstancedMesh)At.renderInstances(nt,Bt,z.count);else if(Y.isInstancedBufferGeometry){const Fe=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Mt=Math.min(Y.instanceCount,Fe);At.renderInstances(nt,Bt,Mt)}else At.render(nt,Bt)};function Xe(b,F,Y){b.transparent===!0&&b.side===rn&&b.forceSinglePass===!1?(b.side=li,b.needsUpdate=!0,bt(b,F,Y),b.side=or,b.needsUpdate=!0,bt(b,F,Y),b.side=rn):bt(b,F,Y)}this.compile=function(b,F,Y=null){Y===null&&(Y=b),T=ae.get(Y),T.init(F),w.push(T),Y.traverseVisible(function(z){z.isLight&&z.layers.test(F.layers)&&(T.pushLight(z),z.castShadow&&T.pushShadow(z))}),b!==Y&&b.traverseVisible(function(z){z.isLight&&z.layers.test(F.layers)&&(T.pushLight(z),z.castShadow&&T.pushShadow(z))}),T.setupLights();const X=new Set;return b.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;const le=z.material;if(le)if(Array.isArray(le))for(let _e=0;_e<le.length;_e++){const de=le[_e];Xe(de,Y,z),X.add(de)}else Xe(le,Y,z),X.add(le)}),T=w.pop(),X},this.compileAsync=function(b,F,Y=null){const X=this.compile(b,F,Y);return new Promise(z=>{function le(){if(X.forEach(function(_e){S.get(_e).currentProgram.isReady()&&X.delete(_e)}),X.size===0){z(b);return}setTimeout(le,10)}Qe.get("KHR_parallel_shader_compile")!==null?le():setTimeout(le,10)})};let De=null;function Ye(b){De&&De(b)}function Vt(){St.stop()}function it(){St.start()}const St=new hp;St.setAnimationLoop(Ye),typeof self<"u"&&St.setContext(self),this.setAnimationLoop=function(b){De=b,ce.setAnimationLoop(b),b===null?St.stop():St.start()},ce.addEventListener("sessionstart",Vt),ce.addEventListener("sessionend",it),this.render=function(b,F){if(F!==void 0&&F.isCamera!==!0){gt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;const Y=ce.enabled===!0&&ce.isPresenting===!0,X=C!==null&&(B===null||Y)&&C.begin(v,B);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),ce.enabled===!0&&ce.isPresenting===!0&&(C===null||C.isCompositing()===!1)&&(ce.cameraAutoUpdate===!0&&ce.updateCamera(F),F=ce.getCamera()),b.isScene===!0&&b.onBeforeRender(v,b,F,B),T=ae.get(b,w.length),T.init(F),w.push(T),ut.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),Ce.setFromProjectionMatrix(ut,On,F.reversedDepth),ke=this.localClippingEnabled,Se=Ee.init(this.clippingPlanes,ke),M=ie.get(b,A.length),M.init(),A.push(M),ce.enabled===!0&&ce.isPresenting===!0){const _e=v.xr.getDepthSensingMesh();_e!==null&&Xt(_e,F,-1/0,v.sortObjects)}Xt(b,F,0,v.sortObjects),M.finish(),v.sortObjects===!0&&M.sort(We,qe),Ie=ce.enabled===!1||ce.isPresenting===!1||ce.hasDepthSensing()===!1,Ie&&oe.addToRenderList(M,b),this.info.render.frame++,Se===!0&&Ee.beginShadows();const z=T.state.shadowsArray;if(we.render(z,b,F),Se===!0&&Ee.endShadows(),this.info.autoReset===!0&&this.info.reset(),(X&&C.hasRenderPass())===!1){const _e=M.opaque,de=M.transmissive;if(T.setupLights(),F.isArrayCamera){const ve=F.cameras;if(de.length>0)for(let Pe=0,He=ve.length;Pe<He;Pe++){const Ne=ve[Pe];wt(_e,de,b,Ne)}Ie&&oe.render(b);for(let Pe=0,He=ve.length;Pe<He;Pe++){const Ne=ve[Pe];Lt(M,b,Ne,Ne.viewport)}}else de.length>0&&wt(_e,de,b,F),Ie&&oe.render(b),Lt(M,b,F)}B!==null&&U===0&&(N.updateMultisampleRenderTarget(B),N.updateRenderTargetMipmap(B)),X&&C.end(v),b.isScene===!0&&b.onAfterRender(v,b,F),he.resetDefaultState(),H=-1,V=null,w.pop(),w.length>0?(T=w[w.length-1],Se===!0&&Ee.setGlobalState(v.clippingPlanes,T.state.camera)):T=null,A.pop(),A.length>0?M=A[A.length-1]:M=null};function Xt(b,F,Y,X){if(b.visible===!1)return;if(b.layers.test(F.layers)){if(b.isGroup)Y=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(F);else if(b.isLight)T.pushLight(b),b.castShadow&&T.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||Ce.intersectsSprite(b)){X&&Be.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ut);const _e=se.update(b),de=b.material;de.visible&&M.push(b,_e,de,Y,Be.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||Ce.intersectsObject(b))){const _e=se.update(b),de=b.material;if(X&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Be.copy(b.boundingSphere.center)):(_e.boundingSphere===null&&_e.computeBoundingSphere(),Be.copy(_e.boundingSphere.center)),Be.applyMatrix4(b.matrixWorld).applyMatrix4(ut)),Array.isArray(de)){const ve=_e.groups;for(let Pe=0,He=ve.length;Pe<He;Pe++){const Ne=ve[Pe],nt=de[Ne.materialIndex];nt&&nt.visible&&M.push(b,_e,nt,Y,Be.z,Ne)}}else de.visible&&M.push(b,_e,de,Y,Be.z,null)}}const le=b.children;for(let _e=0,de=le.length;_e<de;_e++)Xt(le[_e],F,Y,X)}function Lt(b,F,Y,X){const{opaque:z,transmissive:le,transparent:_e}=b;T.setupLightsView(Y),Se===!0&&Ee.setGlobalState(v.clippingPlanes,Y),X&&Me.viewport(k.copy(X)),z.length>0&&pt(z,F,Y),le.length>0&&pt(le,F,Y),_e.length>0&&pt(_e,F,Y),Me.buffers.depth.setTest(!0),Me.buffers.depth.setMask(!0),Me.buffers.color.setMask(!0),Me.setPolygonOffset(!1)}function wt(b,F,Y,X){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[X.id]===void 0){const nt=Qe.has("EXT_color_buffer_half_float")||Qe.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[X.id]=new ci(1,1,{generateMipmaps:!0,type:nt?lr:Kt,minFilter:es,samples:ze.samples,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ht.workingColorSpace})}const le=T.state.transmissionRenderTarget[X.id],_e=X.viewport||k;le.setSize(_e.z*v.transmissionResolutionScale,_e.w*v.transmissionResolutionScale);const de=v.getRenderTarget(),ve=v.getActiveCubeFace(),Pe=v.getActiveMipmapLevel();v.setRenderTarget(le),v.getClearColor(ne),P=v.getClearAlpha(),P<1&&v.setClearColor(16777215,.5),v.clear(),Ie&&oe.render(Y);const He=v.toneMapping;v.toneMapping=Hn;const Ne=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),T.setupLightsView(X),Se===!0&&Ee.setGlobalState(v.clippingPlanes,X),pt(b,Y,X),N.updateMultisampleRenderTarget(le),N.updateRenderTargetMipmap(le),Qe.has("WEBGL_multisampled_render_to_texture")===!1){let nt=!1;for(let Tt=0,Bt=F.length;Tt<Bt;Tt++){const zt=F[Tt],{object:At,geometry:Fe,material:Mt,group:mt}=zt;if(Mt.side===rn&&At.layers.test(X.layers)){const qi=Mt.side;Mt.side=li,Mt.needsUpdate=!0,Oi(At,Y,X,Fe,Mt,mt),Mt.side=qi,Mt.needsUpdate=!0,nt=!0}}nt===!0&&(N.updateMultisampleRenderTarget(le),N.updateRenderTargetMipmap(le))}v.setRenderTarget(de,ve,Pe),v.setClearColor(ne,P),Ne!==void 0&&(X.viewport=Ne),v.toneMapping=He}function pt(b,F,Y){const X=F.isScene===!0?F.overrideMaterial:null;for(let z=0,le=b.length;z<le;z++){const _e=b[z],{object:de,geometry:ve,group:Pe}=_e;let He=_e.material;He.allowOverride===!0&&X!==null&&(He=X),de.layers.test(Y.layers)&&Oi(de,F,Y,ve,He,Pe)}}function Oi(b,F,Y,X,z,le){b.onBeforeRender(v,F,Y,X,z,le),b.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),z.onBeforeRender(v,F,Y,X,b,le),z.transparent===!0&&z.side===rn&&z.forceSinglePass===!1?(z.side=li,z.needsUpdate=!0,v.renderBufferDirect(Y,F,X,z,b,le),z.side=or,z.needsUpdate=!0,v.renderBufferDirect(Y,F,X,z,b,le),z.side=rn):v.renderBufferDirect(Y,F,X,z,b,le),b.onAfterRender(v,F,Y,X,z,le)}function bt(b,F,Y){F.isScene!==!0&&(F=Ke);const X=S.get(b),z=T.state.lights,le=T.state.shadowsArray,_e=z.state.version,de=Te.getParameters(b,z.state,le,F,Y),ve=Te.getProgramCacheKey(de);let Pe=X.programs;X.environment=b.isMeshStandardMaterial?F.environment:null,X.fog=F.fog,X.envMap=(b.isMeshStandardMaterial?j:Z).get(b.envMap||X.environment),X.envMapRotation=X.environment!==null&&b.envMap===null?F.environmentRotation:b.envMapRotation,Pe===void 0&&(b.addEventListener("dispose",Re),Pe=new Map,X.programs=Pe);let He=Pe.get(ve);if(He!==void 0){if(X.currentProgram===He&&X.lightsStateVersion===_e)return $i(b,de),He}else de.uniforms=Te.getUniforms(b),b.onBeforeCompile(de,v),He=Te.acquireProgram(de,ve),Pe.set(ve,He),X.uniforms=de.uniforms;const Ne=X.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Ne.clippingPlanes=Ee.uniform),$i(b,de),X.needsLights=ni(b),X.lightsStateVersion=_e,X.needsLights&&(Ne.ambientLightColor.value=z.state.ambient,Ne.lightProbe.value=z.state.probe,Ne.directionalLights.value=z.state.directional,Ne.directionalLightShadows.value=z.state.directionalShadow,Ne.spotLights.value=z.state.spot,Ne.spotLightShadows.value=z.state.spotShadow,Ne.rectAreaLights.value=z.state.rectArea,Ne.ltc_1.value=z.state.rectAreaLTC1,Ne.ltc_2.value=z.state.rectAreaLTC2,Ne.pointLights.value=z.state.point,Ne.pointLightShadows.value=z.state.pointShadow,Ne.hemisphereLights.value=z.state.hemi,Ne.directionalShadowMap.value=z.state.directionalShadowMap,Ne.directionalShadowMatrix.value=z.state.directionalShadowMatrix,Ne.spotShadowMap.value=z.state.spotShadowMap,Ne.spotLightMatrix.value=z.state.spotLightMatrix,Ne.spotLightMap.value=z.state.spotLightMap,Ne.pointShadowMap.value=z.state.pointShadowMap,Ne.pointShadowMatrix.value=z.state.pointShadowMatrix),X.currentProgram=He,X.uniformsList=null,He}function vi(b){if(b.uniformsList===null){const F=b.currentProgram.getUniforms();b.uniformsList=tl.seqWithValue(F.seq,b.uniforms)}return b.uniformsList}function $i(b,F){const Y=S.get(b);Y.outputColorSpace=F.outputColorSpace,Y.batching=F.batching,Y.batchingColor=F.batchingColor,Y.instancing=F.instancing,Y.instancingColor=F.instancingColor,Y.instancingMorph=F.instancingMorph,Y.skinning=F.skinning,Y.morphTargets=F.morphTargets,Y.morphNormals=F.morphNormals,Y.morphColors=F.morphColors,Y.morphTargetsCount=F.morphTargetsCount,Y.numClippingPlanes=F.numClippingPlanes,Y.numIntersection=F.numClipIntersection,Y.vertexAlphas=F.vertexAlphas,Y.vertexTangents=F.vertexTangents,Y.toneMapping=F.toneMapping}function jt(b,F,Y,X,z){F.isScene!==!0&&(F=Ke),N.resetTextureUnits();const le=F.fog,_e=X.isMeshStandardMaterial?F.environment:null,de=B===null?v.outputColorSpace:B.isXRRenderTarget===!0?B.texture.colorSpace:Lr,ve=(X.isMeshStandardMaterial?j:Z).get(X.envMap||_e),Pe=X.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,He=!!Y.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),Ne=!!Y.morphAttributes.position,nt=!!Y.morphAttributes.normal,Tt=!!Y.morphAttributes.color;let Bt=Hn;X.toneMapped&&(B===null||B.isXRRenderTarget===!0)&&(Bt=v.toneMapping);const zt=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,At=zt!==void 0?zt.length:0,Fe=S.get(X),Mt=T.state.lights;if(Se===!0&&(ke===!0||b!==V)){const Ai=b===V&&X.id===H;Ee.setState(X,b,Ai)}let mt=!1;X.version===Fe.__version?(Fe.needsLights&&Fe.lightsStateVersion!==Mt.state.version||Fe.outputColorSpace!==de||z.isBatchedMesh&&Fe.batching===!1||!z.isBatchedMesh&&Fe.batching===!0||z.isBatchedMesh&&Fe.batchingColor===!0&&z.colorTexture===null||z.isBatchedMesh&&Fe.batchingColor===!1&&z.colorTexture!==null||z.isInstancedMesh&&Fe.instancing===!1||!z.isInstancedMesh&&Fe.instancing===!0||z.isSkinnedMesh&&Fe.skinning===!1||!z.isSkinnedMesh&&Fe.skinning===!0||z.isInstancedMesh&&Fe.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&Fe.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&Fe.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&Fe.instancingMorph===!1&&z.morphTexture!==null||Fe.envMap!==ve||X.fog===!0&&Fe.fog!==le||Fe.numClippingPlanes!==void 0&&(Fe.numClippingPlanes!==Ee.numPlanes||Fe.numIntersection!==Ee.numIntersection)||Fe.vertexAlphas!==Pe||Fe.vertexTangents!==He||Fe.morphTargets!==Ne||Fe.morphNormals!==nt||Fe.morphColors!==Tt||Fe.toneMapping!==Bt||Fe.morphTargetsCount!==At)&&(mt=!0):(mt=!0,Fe.__version=X.version);let qi=Fe.currentProgram;mt===!0&&(qi=bt(X,F,z));let Ss=!1,Ki=!1,pa=!1;const Pt=qi.getUniforms(),Bi=Fe.uniforms;if(Me.useProgram(qi.program)&&(Ss=!0,Ki=!0,pa=!0),X.id!==H&&(H=X.id,Ki=!0),Ss||V!==b){Me.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),Pt.setValue(I,"projectionMatrix",b.projectionMatrix),Pt.setValue(I,"viewMatrix",b.matrixWorldInverse);const zi=Pt.map.cameraPosition;zi!==void 0&&zi.setValue(I,be.setFromMatrixPosition(b.matrixWorld)),ze.logarithmicDepthBuffer&&Pt.setValue(I,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&Pt.setValue(I,"isOrthographic",b.isOrthographicCamera===!0),V!==b&&(V=b,Ki=!0,pa=!0)}if(Fe.needsLights&&(Mt.state.directionalShadowMap.length>0&&Pt.setValue(I,"directionalShadowMap",Mt.state.directionalShadowMap,N),Mt.state.spotShadowMap.length>0&&Pt.setValue(I,"spotShadowMap",Mt.state.spotShadowMap,N),Mt.state.pointShadowMap.length>0&&Pt.setValue(I,"pointShadowMap",Mt.state.pointShadowMap,N)),z.isSkinnedMesh){Pt.setOptional(I,z,"bindMatrix"),Pt.setOptional(I,z,"bindMatrixInverse");const Ai=z.skeleton;Ai&&(Ai.boneTexture===null&&Ai.computeBoneTexture(),Pt.setValue(I,"boneTexture",Ai.boneTexture,N))}z.isBatchedMesh&&(Pt.setOptional(I,z,"batchingTexture"),Pt.setValue(I,"batchingTexture",z._matricesTexture,N),Pt.setOptional(I,z,"batchingIdTexture"),Pt.setValue(I,"batchingIdTexture",z._indirectTexture,N),Pt.setOptional(I,z,"batchingColorTexture"),z._colorsTexture!==null&&Pt.setValue(I,"batchingColorTexture",z._colorsTexture,N));const dn=Y.morphAttributes;if((dn.position!==void 0||dn.normal!==void 0||dn.color!==void 0)&&Ge.update(z,Y,qi),(Ki||Fe.receiveShadow!==z.receiveShadow)&&(Fe.receiveShadow=z.receiveShadow,Pt.setValue(I,"receiveShadow",z.receiveShadow)),X.isMeshGouraudMaterial&&X.envMap!==null&&(Bi.envMap.value=ve,Bi.flipEnvMap.value=ve.isCubeTexture&&ve.isRenderTargetTexture===!1?-1:1),X.isMeshStandardMaterial&&X.envMap===null&&F.environment!==null&&(Bi.envMapIntensity.value=F.environmentIntensity),Bi.dfgLUT!==void 0&&(Bi.dfgLUT.value=rM()),Ki&&(Pt.setValue(I,"toneMappingExposure",v.toneMappingExposure),Fe.needsLights&&Jt(Bi,pa),le&&X.fog===!0&&ye.refreshFogUniforms(Bi,le),ye.refreshMaterialUniforms(Bi,X,Oe,Le,T.state.transmissionRenderTarget[b.id]),tl.upload(I,vi(Fe),Bi,N)),X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(tl.upload(I,vi(Fe),Bi,N),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&Pt.setValue(I,"center",z.center),Pt.setValue(I,"modelViewMatrix",z.modelViewMatrix),Pt.setValue(I,"normalMatrix",z.normalMatrix),Pt.setValue(I,"modelMatrix",z.matrixWorld),X.isShaderMaterial||X.isRawShaderMaterial){const Ai=X.uniformsGroups;for(let zi=0,Ol=Ai.length;zi<Ol;zi++){const Br=Ai[zi];ee.update(Br,qi),ee.bind(Br,qi)}}return qi}function Jt(b,F){b.ambientLightColor.needsUpdate=F,b.lightProbe.needsUpdate=F,b.directionalLights.needsUpdate=F,b.directionalLightShadows.needsUpdate=F,b.pointLights.needsUpdate=F,b.pointLightShadows.needsUpdate=F,b.spotLights.needsUpdate=F,b.spotLightShadows.needsUpdate=F,b.rectAreaLights.needsUpdate=F,b.hemisphereLights.needsUpdate=F}function ni(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return D},this.getActiveMipmapLevel=function(){return U},this.getRenderTarget=function(){return B},this.setRenderTargetTextures=function(b,F,Y){const X=S.get(b);X.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,X.__autoAllocateDepthBuffer===!1&&(X.__useRenderToTexture=!1),S.get(b.texture).__webglTexture=F,S.get(b.depthTexture).__webglTexture=X.__autoAllocateDepthBuffer?void 0:Y,X.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,F){const Y=S.get(b);Y.__webglFramebuffer=F,Y.__useDefaultFramebuffer=F===void 0};const Yn=I.createFramebuffer();this.setRenderTarget=function(b,F=0,Y=0){B=b,D=F,U=Y;let X=null,z=!1,le=!1;if(b){const de=S.get(b);if(de.__useDefaultFramebuffer!==void 0){Me.bindFramebuffer(I.FRAMEBUFFER,de.__webglFramebuffer),k.copy(b.viewport),O.copy(b.scissor),q=b.scissorTest,Me.viewport(k),Me.scissor(O),Me.setScissorTest(q),H=-1;return}else if(de.__webglFramebuffer===void 0)N.setupRenderTarget(b);else if(de.__hasExternalTextures)N.rebindTextures(b,S.get(b.texture).__webglTexture,S.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const He=b.depthTexture;if(de.__boundDepthTexture!==He){if(He!==null&&S.has(He)&&(b.width!==He.image.width||b.height!==He.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");N.setupDepthRenderbuffer(b)}}const ve=b.texture;(ve.isData3DTexture||ve.isDataArrayTexture||ve.isCompressedArrayTexture)&&(le=!0);const Pe=S.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Pe[F])?X=Pe[F][Y]:X=Pe[F],z=!0):b.samples>0&&N.useMultisampledRTT(b)===!1?X=S.get(b).__webglMultisampledFramebuffer:Array.isArray(Pe)?X=Pe[Y]:X=Pe,k.copy(b.viewport),O.copy(b.scissor),q=b.scissorTest}else k.copy(K).multiplyScalar(Oe).floor(),O.copy(J).multiplyScalar(Oe).floor(),q=fe;if(Y!==0&&(X=Yn),Me.bindFramebuffer(I.FRAMEBUFFER,X)&&Me.drawBuffers(b,X),Me.viewport(k),Me.scissor(O),Me.setScissorTest(q),z){const de=S.get(b.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+F,de.__webglTexture,Y)}else if(le){const de=F;for(let ve=0;ve<b.textures.length;ve++){const Pe=S.get(b.textures[ve]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+ve,Pe.__webglTexture,Y,de)}}else if(b!==null&&Y!==0){const de=S.get(b.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,de.__webglTexture,Y)}H=-1},this.readRenderTargetPixels=function(b,F,Y,X,z,le,_e,de=0){if(!(b&&b.isWebGLRenderTarget)){gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ve=S.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&_e!==void 0&&(ve=ve[_e]),ve){Me.bindFramebuffer(I.FRAMEBUFFER,ve);try{const Pe=b.textures[de],He=Pe.format,Ne=Pe.type;if(!ze.textureFormatReadable(He)){gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ze.textureTypeReadable(Ne)){gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=b.width-X&&Y>=0&&Y<=b.height-z&&(b.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+de),I.readPixels(F,Y,X,z,te.convert(He),te.convert(Ne),le))}finally{const Pe=B!==null?S.get(B).__webglFramebuffer:null;Me.bindFramebuffer(I.FRAMEBUFFER,Pe)}}},this.readRenderTargetPixelsAsync=async function(b,F,Y,X,z,le,_e,de=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ve=S.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&_e!==void 0&&(ve=ve[_e]),ve)if(F>=0&&F<=b.width-X&&Y>=0&&Y<=b.height-z){Me.bindFramebuffer(I.FRAMEBUFFER,ve);const Pe=b.textures[de],He=Pe.format,Ne=Pe.type;if(!ze.textureFormatReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ze.textureTypeReadable(Ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const nt=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,nt),I.bufferData(I.PIXEL_PACK_BUFFER,le.byteLength,I.STREAM_READ),b.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+de),I.readPixels(F,Y,X,z,te.convert(He),te.convert(Ne),0);const Tt=B!==null?S.get(B).__webglFramebuffer:null;Me.bindFramebuffer(I.FRAMEBUFFER,Tt);const Bt=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Tg(I,Bt,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,nt),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,le),I.deleteBuffer(nt),I.deleteSync(Bt),le}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,F=null,Y=0){const X=Math.pow(2,-Y),z=Math.floor(b.image.width*X),le=Math.floor(b.image.height*X),_e=F!==null?F.x:0,de=F!==null?F.y:0;N.setTexture2D(b,0),I.copyTexSubImage2D(I.TEXTURE_2D,Y,0,0,_e,de,z,le),Me.unbindTexture()};const xs=I.createFramebuffer(),ri=I.createFramebuffer();this.copyTextureToTexture=function(b,F,Y=null,X=null,z=0,le=null){le===null&&(z!==0?(ja("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),le=z,z=0):le=0);let _e,de,ve,Pe,He,Ne,nt,Tt,Bt;const zt=b.isCompressedTexture?b.mipmaps[le]:b.image;if(Y!==null)_e=Y.max.x-Y.min.x,de=Y.max.y-Y.min.y,ve=Y.isBox3?Y.max.z-Y.min.z:1,Pe=Y.min.x,He=Y.min.y,Ne=Y.isBox3?Y.min.z:0;else{const dn=Math.pow(2,-z);_e=Math.floor(zt.width*dn),de=Math.floor(zt.height*dn),b.isDataArrayTexture?ve=zt.depth:b.isData3DTexture?ve=Math.floor(zt.depth*dn):ve=1,Pe=0,He=0,Ne=0}X!==null?(nt=X.x,Tt=X.y,Bt=X.z):(nt=0,Tt=0,Bt=0);const At=te.convert(F.format),Fe=te.convert(F.type);let Mt;F.isData3DTexture?(N.setTexture3D(F,0),Mt=I.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(N.setTexture2DArray(F,0),Mt=I.TEXTURE_2D_ARRAY):(N.setTexture2D(F,0),Mt=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,F.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,F.unpackAlignment);const mt=I.getParameter(I.UNPACK_ROW_LENGTH),qi=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Ss=I.getParameter(I.UNPACK_SKIP_PIXELS),Ki=I.getParameter(I.UNPACK_SKIP_ROWS),pa=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,zt.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,zt.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Pe),I.pixelStorei(I.UNPACK_SKIP_ROWS,He),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Ne);const Pt=b.isDataArrayTexture||b.isData3DTexture,Bi=F.isDataArrayTexture||F.isData3DTexture;if(b.isDepthTexture){const dn=S.get(b),Ai=S.get(F),zi=S.get(dn.__renderTarget),Ol=S.get(Ai.__renderTarget);Me.bindFramebuffer(I.READ_FRAMEBUFFER,zi.__webglFramebuffer),Me.bindFramebuffer(I.DRAW_FRAMEBUFFER,Ol.__webglFramebuffer);for(let Br=0;Br<ve;Br++)Pt&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,S.get(b).__webglTexture,z,Ne+Br),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,S.get(F).__webglTexture,le,Bt+Br)),I.blitFramebuffer(Pe,He,_e,de,nt,Tt,_e,de,I.DEPTH_BUFFER_BIT,I.NEAREST);Me.bindFramebuffer(I.READ_FRAMEBUFFER,null),Me.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(z!==0||b.isRenderTargetTexture||S.has(b)){const dn=S.get(b),Ai=S.get(F);Me.bindFramebuffer(I.READ_FRAMEBUFFER,xs),Me.bindFramebuffer(I.DRAW_FRAMEBUFFER,ri);for(let zi=0;zi<ve;zi++)Pt?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,dn.__webglTexture,z,Ne+zi):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,dn.__webglTexture,z),Bi?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ai.__webglTexture,le,Bt+zi):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Ai.__webglTexture,le),z!==0?I.blitFramebuffer(Pe,He,_e,de,nt,Tt,_e,de,I.COLOR_BUFFER_BIT,I.NEAREST):Bi?I.copyTexSubImage3D(Mt,le,nt,Tt,Bt+zi,Pe,He,_e,de):I.copyTexSubImage2D(Mt,le,nt,Tt,Pe,He,_e,de);Me.bindFramebuffer(I.READ_FRAMEBUFFER,null),Me.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else Bi?b.isDataTexture||b.isData3DTexture?I.texSubImage3D(Mt,le,nt,Tt,Bt,_e,de,ve,At,Fe,zt.data):F.isCompressedArrayTexture?I.compressedTexSubImage3D(Mt,le,nt,Tt,Bt,_e,de,ve,At,zt.data):I.texSubImage3D(Mt,le,nt,Tt,Bt,_e,de,ve,At,Fe,zt):b.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,le,nt,Tt,_e,de,At,Fe,zt.data):b.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,le,nt,Tt,zt.width,zt.height,At,zt.data):I.texSubImage2D(I.TEXTURE_2D,le,nt,Tt,_e,de,At,Fe,zt);I.pixelStorei(I.UNPACK_ROW_LENGTH,mt),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,qi),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Ss),I.pixelStorei(I.UNPACK_SKIP_ROWS,Ki),I.pixelStorei(I.UNPACK_SKIP_IMAGES,pa),le===0&&F.generateMipmaps&&I.generateMipmap(Mt),Me.unbindTexture()},this.initRenderTarget=function(b){S.get(b).__webglFramebuffer===void 0&&N.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?N.setTextureCube(b,0):b.isData3DTexture?N.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?N.setTexture2DArray(b,0):N.setTexture2D(b,0),Me.unbindTexture()},this.resetState=function(){D=0,U=0,B=null,Me.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return On}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ht._getDrawingBufferColorSpace(e),t.unpackColorSpace=ht._getUnpackColorSpace()}}var aM="1.3.17";function gp(n,e,t){return Math.max(n,Math.min(e,t))}function oM(n,e,t){return(1-t)*n+t*e}function lM(n,e,t,i){return oM(n,e,1-Math.exp(-t*i))}function cM(n,e){return(n%e+e)%e}var uM=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(n){if(!this.isRunning)return;let e=!1;if(this.duration&&this.easing){this.currentTime+=n;const t=gp(0,this.currentTime/this.duration,1);e=t>=1;const i=e?1:this.easing(t);this.value=this.from+(this.to-this.from)*i}else this.lerp?(this.value=lM(this.value,this.to,this.lerp*60,n),Math.round(this.value)===this.to&&(this.value=this.to,e=!0)):(this.value=this.to,e=!0);e&&this.stop(),this.onUpdate?.(this.value,e)}stop(){this.isRunning=!1}fromTo(n,e,{lerp:t,duration:i,easing:r,onStart:s,onUpdate:a}){this.from=this.value=n,this.to=e,this.lerp=t,this.duration=i,this.easing=r,this.currentTime=0,this.isRunning=!0,s?.(),this.onUpdate=a}};function hM(n,e){let t;return function(...i){let r=this;clearTimeout(t),t=setTimeout(()=>{t=void 0,n.apply(r,i)},e)}}var fM=class{constructor(n,e,{autoResize:t=!0,debounce:i=250}={}){this.wrapper=n,this.content=e,t&&(this.debouncedResize=hM(this.resize,i),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize,!1):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize,!1)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},_p=class{events={};emit(n,...e){let t=this.events[n]||[];for(let i=0,r=t.length;i<r;i++)t[i]?.(...e)}on(n,e){return this.events[n]?.push(e)||(this.events[n]=[e]),()=>{this.events[n]=this.events[n]?.filter(t=>e!==t)}}off(n,e){this.events[n]=this.events[n]?.filter(t=>e!==t)}destroy(){this.events={}}},$f=100/6,xr={passive:!1},dM=class{constructor(n,e={wheelMultiplier:1,touchMultiplier:1}){this.element=n,this.options=e,window.addEventListener("resize",this.onWindowResize,!1),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,xr),this.element.addEventListener("touchstart",this.onTouchStart,xr),this.element.addEventListener("touchmove",this.onTouchMove,xr),this.element.addEventListener("touchend",this.onTouchEnd,xr)}touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new _p;on(n,e){return this.emitter.on(n,e)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize,!1),this.element.removeEventListener("wheel",this.onWheel,xr),this.element.removeEventListener("touchstart",this.onTouchStart,xr),this.element.removeEventListener("touchmove",this.onTouchMove,xr),this.element.removeEventListener("touchend",this.onTouchEnd,xr)}onTouchStart=n=>{const{clientX:e,clientY:t}=n.targetTouches?n.targetTouches[0]:n;this.touchStart.x=e,this.touchStart.y=t,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:n})};onTouchMove=n=>{const{clientX:e,clientY:t}=n.targetTouches?n.targetTouches[0]:n,i=-(e-this.touchStart.x)*this.options.touchMultiplier,r=-(t-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=e,this.touchStart.y=t,this.lastDelta={x:i,y:r},this.emitter.emit("scroll",{deltaX:i,deltaY:r,event:n})};onTouchEnd=n=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:n})};onWheel=n=>{let{deltaX:e,deltaY:t,deltaMode:i}=n;const r=i===1?$f:i===2?this.window.width:1,s=i===1?$f:i===2?this.window.height:1;e*=r,t*=s,e*=this.options.wheelMultiplier,t*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:e,deltaY:t,event:n})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}},qf=n=>Math.min(1,1.001-Math.pow(2,-10*n)),pM=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;_rafId=null;isTouching;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new uM;emitter=new _p;dimensions;virtualScroll;constructor({wrapper:n=window,content:e=document.documentElement,eventsTarget:t=n,smoothWheel:i=!0,syncTouch:r=!1,syncTouchLerp:s=.075,touchInertiaExponent:a=1.7,duration:o,easing:l,lerp:c=.1,infinite:u=!1,orientation:h="vertical",gestureOrientation:f=h==="horizontal"?"both":"vertical",touchMultiplier:d=1,wheelMultiplier:_=1,autoResize:g=!0,prevent:m,virtualScroll:p,overscroll:x=!0,autoRaf:y=!1,anchors:M=!1,autoToggle:T=!1,allowNestedScroll:A=!1,__experimental__naiveDimensions:w=!1,naiveDimensions:C=w,stopInertiaOnNavigate:v=!1}={}){window.lenisVersion=aM,(!n||n===document.documentElement)&&(n=window),typeof o=="number"&&typeof l!="function"?l=qf:typeof l=="function"&&typeof o!="number"&&(o=1),this.options={wrapper:n,content:e,eventsTarget:t,smoothWheel:i,syncTouch:r,syncTouchLerp:s,touchInertiaExponent:a,duration:o,easing:l,lerp:c,infinite:u,gestureOrientation:f,orientation:h,touchMultiplier:d,wheelMultiplier:_,autoResize:g,prevent:m,virtualScroll:p,overscroll:x,autoRaf:y,anchors:M,autoToggle:T,allowNestedScroll:A,naiveDimensions:C,stopInertiaOnNavigate:v},this.dimensions=new fM(n,e,{autoResize:g}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll,!1),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick,!1),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown,!1),this.virtualScroll=new dM(t,{touchMultiplier:d,wheelMultiplier:_}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd,{passive:!0})),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll,!1),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown,!1),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick,!1),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(n,e){return this.emitter.on(n,e)}off(n,e){return this.emitter.off(n,e)}onScrollEnd=n=>{n instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&n.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};get overflow(){const n=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[n]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}onTransitionEnd=n=>{n.propertyName.includes("overflow")&&this.checkOverflow()};setScroll(n){this.isHorizontal?this.options.wrapper.scrollTo({left:n,behavior:"instant"}):this.options.wrapper.scrollTo({top:n,behavior:"instant"})}onClick=n=>{const t=n.composedPath().filter(i=>i instanceof HTMLAnchorElement&&i.getAttribute("href"));if(this.options.anchors){const i=t.find(r=>r.getAttribute("href")?.includes("#"));if(i){const r=i.getAttribute("href");if(r){const s=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,a=`#${r.split("#")[1]}`;this.scrollTo(a,s)}}}this.options.stopInertiaOnNavigate&&t.find(r=>r.host===window.location.host)&&this.reset()};onPointerDown=n=>{n.button===1&&this.reset()};onVirtualScroll=n=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(n)===!1)return;const{deltaX:e,deltaY:t,event:i}=n;if(this.emitter.emit("virtual-scroll",{deltaX:e,deltaY:t,event:i}),i.ctrlKey||i.lenisStopPropagation)return;const r=i.type.includes("touch"),s=i.type.includes("wheel");this.isTouching=i.type==="touchstart"||i.type==="touchmove";const a=e===0&&t===0;if(this.options.syncTouch&&r&&i.type==="touchstart"&&a&&!this.isStopped&&!this.isLocked){this.reset();return}const l=this.options.gestureOrientation==="vertical"&&t===0||this.options.gestureOrientation==="horizontal"&&e===0;if(a||l)return;let c=i.composedPath();c=c.slice(0,c.indexOf(this.rootElement));const u=this.options.prevent;if(c.find(m=>m instanceof HTMLElement&&(typeof u=="function"&&u?.(m)||m.hasAttribute?.("data-lenis-prevent")||r&&m.hasAttribute?.("data-lenis-prevent-touch")||s&&m.hasAttribute?.("data-lenis-prevent-wheel")||this.options.allowNestedScroll&&this.checkNestedScroll(m,{deltaX:e,deltaY:t}))))return;if(this.isStopped||this.isLocked){i.cancelable&&i.preventDefault();return}if(!(this.options.syncTouch&&r||this.options.smoothWheel&&s)){this.isScrolling="native",this.animate.stop(),i.lenisStopPropagation=!0;return}let f=t;this.options.gestureOrientation==="both"?f=Math.abs(t)>Math.abs(e)?t:e:this.options.gestureOrientation==="horizontal"&&(f=e),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&t>0||this.animatedScroll===this.limit&&t<0))&&(i.lenisStopPropagation=!0),i.cancelable&&i.preventDefault();const d=r&&this.options.syncTouch,g=r&&i.type==="touchend";g&&(f=Math.sign(this.velocity)*Math.pow(Math.abs(this.velocity),this.options.touchInertiaExponent)),this.scrollTo(this.targetScroll+f,{programmatic:!1,...d?{lerp:g?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}onNativeScroll=()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){const n=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-n,this.direction=Math.sign(this.animatedScroll-n),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=n=>{const e=n-(this.time||n);this.time=n,this.animate.advance(e*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))};scrollTo(n,{offset:e=0,immediate:t=!1,lock:i=!1,programmatic:r=!0,lerp:s=r?this.options.lerp:void 0,duration:a=r?this.options.duration:void 0,easing:o=r?this.options.easing:void 0,onStart:l,onComplete:c,force:u=!1,userData:h}={}){if(!((this.isStopped||this.isLocked)&&!u)){if(typeof n=="string"&&["top","left","start","#"].includes(n))n=0;else if(typeof n=="string"&&["bottom","right","end"].includes(n))n=this.limit;else{let f;if(typeof n=="string"?(f=document.querySelector(n),f||(n==="#top"?n=0:console.warn("Lenis: Target not found",n))):n instanceof HTMLElement&&n?.nodeType&&(f=n),f){if(this.options.wrapper!==window){const _=this.rootElement.getBoundingClientRect();e-=this.isHorizontal?_.left:_.top}const d=f.getBoundingClientRect();n=(this.isHorizontal?d.left:d.top)+this.animatedScroll}}if(typeof n=="number"){if(n+=e,n=Math.round(n),this.options.infinite){if(r){this.targetScroll=this.animatedScroll=this.scroll;const f=n-this.animatedScroll;f>this.limit/2?n=n-this.limit:f<-this.limit/2&&(n=n+this.limit)}}else n=gp(0,n,this.limit);if(n===this.targetScroll){l?.(this),c?.(this);return}if(this.userData=h??{},t){this.animatedScroll=this.targetScroll=n,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),c?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}r||(this.targetScroll=n),typeof a=="number"&&typeof o!="function"?o=qf:typeof o=="function"&&typeof a!="number"&&(a=1),this.animate.fromTo(this.animatedScroll,n,{duration:a,easing:o,lerp:s,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling="smooth",l?.(this)},onUpdate:(f,d)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=f-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=f,this.setScroll(this.scroll),r&&(this.targetScroll=f),d||this.emit(),d&&(this.reset(),this.emit(),c?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}checkNestedScroll(n,{deltaX:e,deltaY:t}){const i=Date.now(),r=n._lenis??={};let s,a,o,l,c,u,h,f;const d=this.options.gestureOrientation;if(i-(r.time??0)>2e3){r.time=Date.now();const T=window.getComputedStyle(n);r.computedStyle=T;const A=T.overflowX,w=T.overflowY;if(s=["auto","overlay","scroll"].includes(A),a=["auto","overlay","scroll"].includes(w),r.hasOverflowX=s,r.hasOverflowY=a,!s&&!a||d==="vertical"&&!a||d==="horizontal"&&!s)return!1;c=n.scrollWidth,u=n.scrollHeight,h=n.clientWidth,f=n.clientHeight,o=c>h,l=u>f,r.isScrollableX=o,r.isScrollableY=l,r.scrollWidth=c,r.scrollHeight=u,r.clientWidth=h,r.clientHeight=f}else o=r.isScrollableX,l=r.isScrollableY,s=r.hasOverflowX,a=r.hasOverflowY,c=r.scrollWidth,u=r.scrollHeight,h=r.clientWidth,f=r.clientHeight;if(!s&&!a||!o&&!l||d==="vertical"&&(!a||!l)||d==="horizontal"&&(!s||!o))return!1;let _;if(d==="horizontal")_="x";else if(d==="vertical")_="y";else{const T=e!==0,A=t!==0;T&&s&&o&&(_="x"),A&&a&&l&&(_="y")}if(!_)return!1;let g,m,p,x,y;if(_==="x")g=n.scrollLeft,m=c-h,p=e,x=s,y=o;else if(_==="y")g=n.scrollTop,m=u-f,p=t,x=a,y=l;else return!1;return(p>0?g<m:g>0)&&x&&y}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){const n=this.options.wrapper;return this.isHorizontal?n.scrollX??n.scrollLeft:n.scrollY??n.scrollTop}get scroll(){return this.options.infinite?cM(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(n){this._isScrolling!==n&&(this._isScrolling=n,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(n){this._isStopped!==n&&(this._isStopped=n,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(n){this._isLocked!==n&&(this._isLocked=n,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get className(){let n="lenis";return this.options.autoToggle&&(n+=" lenis-autoToggle"),this.isStopped&&(n+=" lenis-stopped"),this.isLocked&&(n+=" lenis-locked"),this.isScrolling&&(n+=" lenis-scrolling"),this.isScrolling==="smooth"&&(n+=" lenis-smooth"),n}updateClassName(){this.cleanUpClassName(),this.rootElement.className=`${this.rootElement.className} ${this.className}`.trim()}cleanUpClassName(){this.rootElement.className=this.rootElement.className.replace(/lenis(-\w+)?/g,"").trim()}};function Jn(n){if(n===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return n}function vp(n,e){n.prototype=Object.create(e.prototype),n.prototype.constructor=n,n.__proto__=e}var cn={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},sa={duration:.5,overwrite:!1,delay:0},vh,gi,Ut,vn=1e8,Ct=1/vn,Ru=Math.PI*2,mM=Ru/4,gM=0,xp=Math.sqrt,_M=Math.cos,vM=Math.sin,hi=function(e){return typeof e=="string"},kt=function(e){return typeof e=="function"},ur=function(e){return typeof e=="number"},xh=function(e){return typeof e>"u"},Xn=function(e){return typeof e=="object"},Vi=function(e){return e!==!1},Sh=function(){return typeof window<"u"},Fo=function(e){return kt(e)||hi(e)},Sp=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},wi=Array.isArray,xM=/random\([^)]+\)/g,SM=/,\s*/g,Kf=/(?:-?\.?\d|\.)+/gi,Mp=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,Hs=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,gc=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,Ep=/[+-]=-?[.\d]+/,MM=/[^,'"\[\]\s]+/gi,EM=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,Ft,Dn,Cu,Mh,un={},gl={},yp,bp=function(e){return(gl=aa(e,un))&&Yi},Eh=function(e,t){return console.warn("Invalid property",e,"set to",t,"Missing plugin? gsap.registerPlugin()")},Ja=function(e,t){return!t&&console.warn(e)},Tp=function(e,t){return e&&(un[e]=t)&&gl&&(gl[e]=t)||un},Qa=function(){return 0},yM={suppressEvents:!0,isStart:!0,kill:!1},il={suppressEvents:!0,kill:!1},bM={suppressEvents:!0},yh={},Cr=[],Pu={},wp,en={},_c={},Zf=30,nl=[],bh="",Th=function(e){var t=e[0],i,r;if(Xn(t)||kt(t)||(e=[e]),!(i=(t._gsap||{}).harness)){for(r=nl.length;r--&&!nl[r].targetTest(t););i=nl[r]}for(r=e.length;r--;)e[r]&&(e[r]._gsap||(e[r]._gsap=new Zp(e[r],i)))||e.splice(r,1);return e},ns=function(e){return e._gsap||Th(xn(e))[0]._gsap},Ap=function(e,t,i){return(i=e[t])&&kt(i)?e[t]():xh(i)&&e.getAttribute&&e.getAttribute(t)||i},Gi=function(e,t){return(e=e.split(",")).forEach(t)||e},Gt=function(e){return Math.round(e*1e5)/1e5||0},Nt=function(e){return Math.round(e*1e7)/1e7||0},Ys=function(e,t){var i=t.charAt(0),r=parseFloat(t.substr(2));return e=parseFloat(e),i==="+"?e+r:i==="-"?e-r:i==="*"?e*r:e/r},TM=function(e,t){for(var i=t.length,r=0;e.indexOf(t[r])<0&&++r<i;);return r<i},_l=function(){var e=Cr.length,t=Cr.slice(0),i,r;for(Pu={},Cr.length=0,i=0;i<e;i++)r=t[i],r&&r._lazy&&(r.render(r._lazy[0],r._lazy[1],!0)._lazy=0)},wh=function(e){return!!(e._initted||e._startAt||e.add)},Rp=function(e,t,i,r){Cr.length&&!gi&&_l(),e.render(t,i,!!(gi&&t<0&&wh(e))),Cr.length&&!gi&&_l()},Cp=function(e){var t=parseFloat(e);return(t||t===0)&&(e+"").match(MM).length<2?t:hi(e)?e.trim():e},Pp=function(e){return e},hn=function(e,t){for(var i in t)i in e||(e[i]=t[i]);return e},wM=function(e){return function(t,i){for(var r in i)r in t||r==="duration"&&e||r==="ease"||(t[r]=i[r])}},aa=function(e,t){for(var i in t)e[i]=t[i];return e},jf=function n(e,t){for(var i in t)i!=="__proto__"&&i!=="constructor"&&i!=="prototype"&&(e[i]=Xn(t[i])?n(e[i]||(e[i]={}),t[i]):t[i]);return e},vl=function(e,t){var i={},r;for(r in e)r in t||(i[r]=e[r]);return i},Fa=function(e){var t=e.parent||Ft,i=e.keyframes?wM(wi(e.keyframes)):hn;if(Vi(e.inherit))for(;t;)i(e,t.vars.defaults),t=t.parent||t._dp;return e},AM=function(e,t){for(var i=e.length,r=i===t.length;r&&i--&&e[i]===t[i];);return i<0},Dp=function(e,t,i,r,s){var a=e[r],o;if(s)for(o=t[s];a&&a[s]>o;)a=a._prev;return a?(t._next=a._next,a._next=t):(t._next=e[i],e[i]=t),t._next?t._next._prev=t:e[r]=t,t._prev=a,t.parent=t._dp=e,t},Ll=function(e,t,i,r){i===void 0&&(i="_first"),r===void 0&&(r="_last");var s=t._prev,a=t._next;s?s._next=a:e[i]===t&&(e[i]=a),a?a._prev=s:e[r]===t&&(e[r]=s),t._next=t._prev=t.parent=null},Ur=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},rs=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var i=e;i;)i._dirty=1,i=i.parent;return e},RM=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},Du=function(e,t,i,r){return e._startAt&&(gi?e._startAt.revert(il):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,r))},CM=function n(e){return!e||e._ts&&n(e.parent)},Jf=function(e){return e._repeat?oa(e._tTime,e=e.duration()+e._rDelay)*e:0},oa=function(e,t){var i=Math.floor(e=Nt(e/t));return e&&i===e?i-1:i},xl=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},Ul=function(e){return e._end=Nt(e._start+(e._tDur/Math.abs(e._ts||e._rts||Ct)||0))},Il=function(e,t){var i=e._dp;return i&&i.smoothChildTiming&&e._ts&&(e._start=Nt(i._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),Ul(e),i._dirty||rs(i,e)),e},Lp=function(e,t){var i;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(i=xl(e.rawTime(),t),(!t._dur||mo(0,t.totalDuration(),i)-t._tTime>Ct)&&t.render(i,!0)),rs(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(i=e;i._dp;)i.rawTime()>=0&&i.totalTime(i._tTime),i=i._dp;e._zTime=-Ct}},Nn=function(e,t,i,r){return t.parent&&Ur(t),t._start=Nt((ur(i)?i:i||e!==Ft?mn(e,i,t):e._time)+t._delay),t._end=Nt(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),Dp(e,t,"_first","_last",e._sort?"_start":0),Lu(t)||(e._recent=t),r||Lp(e,t),e._ts<0&&Il(e,e._tTime),e},Up=function(e,t){return(un.ScrollTrigger||Eh("scrollTrigger",t))&&un.ScrollTrigger.create(t,e)},Ip=function(e,t,i,r,s){if(Rh(e,t,s),!e._initted)return 1;if(!i&&e._pt&&!gi&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&wp!==sn.frame)return Cr.push(e),e._lazy=[s,r],1},PM=function n(e){var t=e.parent;return t&&t._ts&&t._initted&&!t._lock&&(t.rawTime()<0||n(t))},Lu=function(e){var t=e.data;return t==="isFromStart"||t==="isStart"},DM=function(e,t,i,r){var s=e.ratio,a=t<0||!t&&(!e._start&&PM(e)&&!(!e._initted&&Lu(e))||(e._ts<0||e._dp._ts<0)&&!Lu(e))?0:1,o=e._rDelay,l=0,c,u,h;if(o&&e._repeat&&(l=mo(0,e._tDur,t),u=oa(l,o),e._yoyo&&u&1&&(a=1-a),u!==oa(e._tTime,o)&&(s=1-a,e.vars.repeatRefresh&&e._initted&&e.invalidate())),a!==s||gi||r||e._zTime===Ct||!t&&e._zTime){if(!e._initted&&Ip(e,t,r,i,l))return;for(h=e._zTime,e._zTime=t||(i?Ct:0),i||(i=t&&!h),e.ratio=a,e._from&&(a=1-a),e._time=0,e._tTime=l,c=e._pt;c;)c.r(a,c.d),c=c._next;t<0&&Du(e,t,i,!0),e._onUpdate&&!i&&on(e,"onUpdate"),l&&e._repeat&&!i&&e.parent&&on(e,"onRepeat"),(t>=e._tDur||t<0)&&e.ratio===a&&(a&&Ur(e,1),!i&&!gi&&(on(e,a?"onComplete":"onReverseComplete",!0),e._prom&&e._prom()))}else e._zTime||(e._zTime=t)},LM=function(e,t,i){var r;if(i>t)for(r=e._first;r&&r._start<=i;){if(r.data==="isPause"&&r._start>t)return r;r=r._next}else for(r=e._last;r&&r._start>=i;){if(r.data==="isPause"&&r._start<t)return r;r=r._prev}},la=function(e,t,i,r){var s=e._repeat,a=Nt(t)||0,o=e._tTime/e._tDur;return o&&!r&&(e._time*=a/e._dur),e._dur=a,e._tDur=s?s<0?1e10:Nt(a*(s+1)+e._rDelay*s):a,o>0&&!r&&Il(e,e._tTime=e._tDur*o),e.parent&&Ul(e),i||rs(e.parent,e),e},Qf=function(e){return e instanceof Ii?rs(e):la(e,e._dur)},UM={_start:0,endTime:Qa,totalDuration:Qa},mn=function n(e,t,i){var r=e.labels,s=e._recent||UM,a=e.duration()>=vn?s.endTime(!1):e._dur,o,l,c;return hi(t)&&(isNaN(t)||t in r)?(l=t.charAt(0),c=t.substr(-1)==="%",o=t.indexOf("="),l==="<"||l===">"?(o>=0&&(t=t.replace(/=/,"")),(l==="<"?s._start:s.endTime(s._repeat>=0))+(parseFloat(t.substr(1))||0)*(c?(o<0?s:i).totalDuration()/100:1)):o<0?(t in r||(r[t]=a),r[t]):(l=parseFloat(t.charAt(o-1)+t.substr(o+1)),c&&i&&(l=l/100*(wi(i)?i[0]:i).totalDuration()),o>1?n(e,t.substr(0,o-1),i)+l:a+l)):t==null?a:+t},Oa=function(e,t,i){var r=ur(t[1]),s=(r?2:1)+(e<2?0:1),a=t[s],o,l;if(r&&(a.duration=t[1]),a.parent=i,e){for(o=a,l=i;l&&!("immediateRender"in o);)o=l.vars.defaults||{},l=Vi(l.vars.inherit)&&l.parent;a.immediateRender=Vi(o.immediateRender),e<2?a.runBackwards=1:a.startAt=t[s-1]}return new qt(t[0],a,t[s+1])},Or=function(e,t){return e||e===0?t(e):t},mo=function(e,t,i){return i<e?e:i>t?t:i},yi=function(e,t){return!hi(e)||!(t=EM.exec(e))?"":t[1]},IM=function(e,t,i){return Or(i,function(r){return mo(e,t,r)})},Uu=[].slice,Np=function(e,t){return e&&Xn(e)&&"length"in e&&(!t&&!e.length||e.length-1 in e&&Xn(e[0]))&&!e.nodeType&&e!==Dn},NM=function(e,t,i){return i===void 0&&(i=[]),e.forEach(function(r){var s;return hi(r)&&!t||Np(r,1)?(s=i).push.apply(s,xn(r)):i.push(r)})||i},xn=function(e,t,i){return Ut&&!t&&Ut.selector?Ut.selector(e):hi(e)&&!i&&(Cu||!ca())?Uu.call((t||Mh).querySelectorAll(e),0):wi(e)?NM(e,i):Np(e)?Uu.call(e,0):e?[e]:[]},Iu=function(e){return e=xn(e)[0]||Ja("Invalid scope")||{},function(t){var i=e.current||e.nativeElement||e;return xn(t,i.querySelectorAll?i:i===e?Ja("Invalid scope")||Mh.createElement("div"):e)}},Fp=function(e){return e.sort(function(){return .5-Math.random()})},Op=function(e){if(kt(e))return e;var t=Xn(e)?e:{each:e},i=ss(t.ease),r=t.from||0,s=parseFloat(t.base)||0,a={},o=r>0&&r<1,l=isNaN(r)||o,c=t.axis,u=r,h=r;return hi(r)?u=h={center:.5,edges:.5,end:1}[r]||0:!o&&l&&(u=r[0],h=r[1]),function(f,d,_){var g=(_||t).length,m=a[g],p,x,y,M,T,A,w,C,v;if(!m){if(v=t.grid==="auto"?0:(t.grid||[1,vn])[1],!v){for(w=-vn;w<(w=_[v++].getBoundingClientRect().left)&&v<g;);v<g&&v--}for(m=a[g]=[],p=l?Math.min(v,g)*u-.5:r%v,x=v===vn?0:l?g*h/v-.5:r/v|0,w=0,C=vn,A=0;A<g;A++)y=A%v-p,M=x-(A/v|0),m[A]=T=c?Math.abs(c==="y"?M:y):xp(y*y+M*M),T>w&&(w=T),T<C&&(C=T);r==="random"&&Fp(m),m.max=w-C,m.min=C,m.v=g=(parseFloat(t.amount)||parseFloat(t.each)*(v>g?g-1:c?c==="y"?g/v:v:Math.max(v,g/v))||0)*(r==="edges"?-1:1),m.b=g<0?s-g:s,m.u=yi(t.amount||t.each)||0,i=i&&g<0?$p(i):i}return g=(m[f]-m.min)/m.max||0,Nt(m.b+(i?i(g):g)*m.v)+m.u}},Nu=function(e){var t=Math.pow(10,((e+"").split(".")[1]||"").length);return function(i){var r=Nt(Math.round(parseFloat(i)/e)*e*t);return(r-r%1)/t+(ur(i)?0:yi(i))}},Bp=function(e,t){var i=wi(e),r,s;return!i&&Xn(e)&&(r=i=e.radius||vn,e.values?(e=xn(e.values),(s=!ur(e[0]))&&(r*=r)):e=Nu(e.increment)),Or(t,i?kt(e)?function(a){return s=e(a),Math.abs(s-a)<=r?s:a}:function(a){for(var o=parseFloat(s?a.x:a),l=parseFloat(s?a.y:0),c=vn,u=0,h=e.length,f,d;h--;)s?(f=e[h].x-o,d=e[h].y-l,f=f*f+d*d):f=Math.abs(e[h]-o),f<c&&(c=f,u=h);return u=!r||c<=r?e[u]:a,s||u===a||ur(a)?u:u+yi(a)}:Nu(e))},zp=function(e,t,i,r){return Or(wi(e)?!t:i===!0?!!(i=0):!r,function(){return wi(e)?e[~~(Math.random()*e.length)]:(i=i||1e-5)&&(r=i<1?Math.pow(10,(i+"").length-2):1)&&Math.floor(Math.round((e-i/2+Math.random()*(t-e+i*.99))/i)*i*r)/r})},FM=function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];return function(r){return t.reduce(function(s,a){return a(s)},r)}},OM=function(e,t){return function(i){return e(parseFloat(i))+(t||yi(i))}},BM=function(e,t,i){return Hp(e,t,0,1,i)},kp=function(e,t,i){return Or(i,function(r){return e[~~t(r)]})},zM=function n(e,t,i){var r=t-e;return wi(e)?kp(e,n(0,e.length),t):Or(i,function(s){return(r+(s-e)%r)%r+e})},kM=function n(e,t,i){var r=t-e,s=r*2;return wi(e)?kp(e,n(0,e.length-1),t):Or(i,function(a){return a=(s+(a-e)%s)%s||0,e+(a>r?s-a:a)})},eo=function(e){return e.replace(xM,function(t){var i=t.indexOf("[")+1,r=t.substring(i||7,i?t.indexOf("]"):t.length-1).split(SM);return zp(i?r:+r[0],i?0:+r[1],+r[2]||1e-5)})},Hp=function(e,t,i,r,s){var a=t-e,o=r-i;return Or(s,function(l){return i+((l-e)/a*o||0)})},HM=function n(e,t,i,r){var s=isNaN(e+t)?0:function(d){return(1-d)*e+d*t};if(!s){var a=hi(e),o={},l,c,u,h,f;if(i===!0&&(r=1)&&(i=null),a)e={p:e},t={p:t};else if(wi(e)&&!wi(t)){for(u=[],h=e.length,f=h-2,c=1;c<h;c++)u.push(n(e[c-1],e[c]));h--,s=function(_){_*=h;var g=Math.min(f,~~_);return u[g](_-g)},i=t}else r||(e=aa(wi(e)?[]:{},e));if(!u){for(l in t)Ah.call(o,e,l,"get",t[l]);s=function(_){return Dh(_,o)||(a?e.p:e)}}}return Or(i,s)},ed=function(e,t,i){var r=e.labels,s=vn,a,o,l;for(a in r)o=r[a]-t,o<0==!!i&&o&&s>(o=Math.abs(o))&&(l=a,s=o);return l},on=function(e,t,i){var r=e.vars,s=r[t],a=Ut,o=e._ctx,l,c,u;if(s)return l=r[t+"Params"],c=r.callbackScope||e,i&&Cr.length&&_l(),o&&(Ut=o),u=l?s.apply(c,l):s.call(c),Ut=a,u},Ra=function(e){return Ur(e),e.scrollTrigger&&e.scrollTrigger.kill(!!gi),e.progress()<1&&on(e,"onInterrupt"),e},Vs,Vp=[],Gp=function(e){if(e)if(e=!e.name&&e.default||e,Sh()||e.headless){var t=e.name,i=kt(e),r=t&&!i&&e.init?function(){this._props=[]}:e,s={init:Qa,render:Dh,add:Ah,kill:nE,modifier:iE,rawVars:0},a={targetTest:0,get:0,getSetter:Ph,aliases:{},register:0};if(ca(),e!==r){if(en[t])return;hn(r,hn(vl(e,s),a)),aa(r.prototype,aa(s,vl(e,a))),en[r.prop=t]=r,e.targetTest&&(nl.push(r),yh[t]=1),t=(t==="css"?"CSS":t.charAt(0).toUpperCase()+t.substr(1))+"Plugin"}Tp(t,r),e.register&&e.register(Yi,r,Wi)}else Vp.push(e)},Rt=255,Ca={aqua:[0,Rt,Rt],lime:[0,Rt,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,Rt],navy:[0,0,128],white:[Rt,Rt,Rt],olive:[128,128,0],yellow:[Rt,Rt,0],orange:[Rt,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[Rt,0,0],pink:[Rt,192,203],cyan:[0,Rt,Rt],transparent:[Rt,Rt,Rt,0]},vc=function(e,t,i){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(i-t)*e*6:e<.5?i:e*3<2?t+(i-t)*(2/3-e)*6:t)*Rt+.5|0},Wp=function(e,t,i){var r=e?ur(e)?[e>>16,e>>8&Rt,e&Rt]:0:Ca.black,s,a,o,l,c,u,h,f,d,_;if(!r){if(e.substr(-1)===","&&(e=e.substr(0,e.length-1)),Ca[e])r=Ca[e];else if(e.charAt(0)==="#"){if(e.length<6&&(s=e.charAt(1),a=e.charAt(2),o=e.charAt(3),e="#"+s+s+a+a+o+o+(e.length===5?e.charAt(4)+e.charAt(4):"")),e.length===9)return r=parseInt(e.substr(1,6),16),[r>>16,r>>8&Rt,r&Rt,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),r=[e>>16,e>>8&Rt,e&Rt]}else if(e.substr(0,3)==="hsl"){if(r=_=e.match(Kf),!t)l=+r[0]%360/360,c=+r[1]/100,u=+r[2]/100,a=u<=.5?u*(c+1):u+c-u*c,s=u*2-a,r.length>3&&(r[3]*=1),r[0]=vc(l+1/3,s,a),r[1]=vc(l,s,a),r[2]=vc(l-1/3,s,a);else if(~e.indexOf("="))return r=e.match(Mp),i&&r.length<4&&(r[3]=1),r}else r=e.match(Kf)||Ca.transparent;r=r.map(Number)}return t&&!_&&(s=r[0]/Rt,a=r[1]/Rt,o=r[2]/Rt,h=Math.max(s,a,o),f=Math.min(s,a,o),u=(h+f)/2,h===f?l=c=0:(d=h-f,c=u>.5?d/(2-h-f):d/(h+f),l=h===s?(a-o)/d+(a<o?6:0):h===a?(o-s)/d+2:(s-a)/d+4,l*=60),r[0]=~~(l+.5),r[1]=~~(c*100+.5),r[2]=~~(u*100+.5)),i&&r.length<4&&(r[3]=1),r},Xp=function(e){var t=[],i=[],r=-1;return e.split(Pr).forEach(function(s){var a=s.match(Hs)||[];t.push.apply(t,a),i.push(r+=a.length+1)}),t.c=i,t},td=function(e,t,i){var r="",s=(e+r).match(Pr),a=t?"hsla(":"rgba(",o=0,l,c,u,h;if(!s)return e;if(s=s.map(function(f){return(f=Wp(f,t,1))&&a+(t?f[0]+","+f[1]+"%,"+f[2]+"%,"+f[3]:f.join(","))+")"}),i&&(u=Xp(e),l=i.c,l.join(r)!==u.c.join(r)))for(c=e.replace(Pr,"1").split(Hs),h=c.length-1;o<h;o++)r+=c[o]+(~l.indexOf(o)?s.shift()||a+"0,0,0,0)":(u.length?u:s.length?s:i).shift());if(!c)for(c=e.split(Pr),h=c.length-1;o<h;o++)r+=c[o]+s[o];return r+c[h]},Pr=(function(){var n="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",e;for(e in Ca)n+="|"+e+"\\b";return new RegExp(n+")","gi")})(),VM=/hsl[a]?\(/,Yp=function(e){var t=e.join(" "),i;if(Pr.lastIndex=0,Pr.test(t))return i=VM.test(t),e[1]=td(e[1],i),e[0]=td(e[0],i,Xp(e[1])),!0},to,sn=(function(){var n=Date.now,e=500,t=33,i=n(),r=i,s=1e3/240,a=s,o=[],l,c,u,h,f,d,_=function g(m){var p=n()-r,x=m===!0,y,M,T,A;if((p>e||p<0)&&(i+=p-t),r+=p,T=r-i,y=T-a,(y>0||x)&&(A=++h.frame,f=T-h.time*1e3,h.time=T=T/1e3,a+=y+(y>=s?4:s-y),M=1),x||(l=c(g)),M)for(d=0;d<o.length;d++)o[d](T,f,A,m)};return h={time:0,frame:0,tick:function(){_(!0)},deltaRatio:function(m){return f/(1e3/(m||60))},wake:function(){yp&&(!Cu&&Sh()&&(Dn=Cu=window,Mh=Dn.document||{},un.gsap=Yi,(Dn.gsapVersions||(Dn.gsapVersions=[])).push(Yi.version),bp(gl||Dn.GreenSockGlobals||!Dn.gsap&&Dn||{}),Vp.forEach(Gp)),u=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&h.sleep(),c=u||function(m){return setTimeout(m,a-h.time*1e3+1|0)},to=1,_(2))},sleep:function(){(u?cancelAnimationFrame:clearTimeout)(l),to=0,c=Qa},lagSmoothing:function(m,p){e=m||1/0,t=Math.min(p||33,e)},fps:function(m){s=1e3/(m||240),a=h.time*1e3+s},add:function(m,p,x){var y=p?function(M,T,A,w){m(M,T,A,w),h.remove(y)}:m;return h.remove(m),o[x?"unshift":"push"](y),ca(),y},remove:function(m,p){~(p=o.indexOf(m))&&o.splice(p,1)&&d>=p&&d--},_listeners:o},h})(),ca=function(){return!to&&sn.wake()},ct={},GM=/^[\d.\-M][\d.\-,\s]/,WM=/["']/g,XM=function(e){for(var t={},i=e.substr(1,e.length-3).split(":"),r=i[0],s=1,a=i.length,o,l,c;s<a;s++)l=i[s],o=s!==a-1?l.lastIndexOf(","):l.length,c=l.substr(0,o),t[r]=isNaN(c)?c.replace(WM,"").trim():+c,r=l.substr(o+1).trim();return t},YM=function(e){var t=e.indexOf("(")+1,i=e.indexOf(")"),r=e.indexOf("(",t);return e.substring(t,~r&&r<i?e.indexOf(")",i+1):i)},$M=function(e){var t=(e+"").split("("),i=ct[t[0]];return i&&t.length>1&&i.config?i.config.apply(null,~e.indexOf("{")?[XM(t[1])]:YM(e).split(",").map(Cp)):ct._CE&&GM.test(e)?ct._CE("",e):i},$p=function(e){return function(t){return 1-e(1-t)}},qp=function n(e,t){for(var i=e._first,r;i;)i instanceof Ii?n(i,t):i.vars.yoyoEase&&(!i._yoyo||!i._repeat)&&i._yoyo!==t&&(i.timeline?n(i.timeline,t):(r=i._ease,i._ease=i._yEase,i._yEase=r,i._yoyo=t)),i=i._next},ss=function(e,t){return e&&(kt(e)?e:ct[e]||$M(e))||t},_s=function(e,t,i,r){i===void 0&&(i=function(l){return 1-t(1-l)}),r===void 0&&(r=function(l){return l<.5?t(l*2)/2:1-t((1-l)*2)/2});var s={easeIn:t,easeOut:i,easeInOut:r},a;return Gi(e,function(o){ct[o]=un[o]=s,ct[a=o.toLowerCase()]=i;for(var l in s)ct[a+(l==="easeIn"?".in":l==="easeOut"?".out":".inOut")]=ct[o+"."+l]=s[l]}),s},Kp=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},xc=function n(e,t,i){var r=t>=1?t:1,s=(i||(e?.3:.45))/(t<1?t:1),a=s/Ru*(Math.asin(1/r)||0),o=function(u){return u===1?1:r*Math.pow(2,-10*u)*vM((u-a)*s)+1},l=e==="out"?o:e==="in"?function(c){return 1-o(1-c)}:Kp(o);return s=Ru/s,l.config=function(c,u){return n(e,c,u)},l},Sc=function n(e,t){t===void 0&&(t=1.70158);var i=function(a){return a?--a*a*((t+1)*a+t)+1:0},r=e==="out"?i:e==="in"?function(s){return 1-i(1-s)}:Kp(i);return r.config=function(s){return n(e,s)},r};Gi("Linear,Quad,Cubic,Quart,Quint,Strong",function(n,e){var t=e<5?e+1:e;_s(n+",Power"+(t-1),e?function(i){return Math.pow(i,t)}:function(i){return i},function(i){return 1-Math.pow(1-i,t)},function(i){return i<.5?Math.pow(i*2,t)/2:1-Math.pow((1-i)*2,t)/2})});ct.Linear.easeNone=ct.none=ct.Linear.easeIn;_s("Elastic",xc("in"),xc("out"),xc());(function(n,e){var t=1/e,i=2*t,r=2.5*t,s=function(o){return o<t?n*o*o:o<i?n*Math.pow(o-1.5/e,2)+.75:o<r?n*(o-=2.25/e)*o+.9375:n*Math.pow(o-2.625/e,2)+.984375};_s("Bounce",function(a){return 1-s(1-a)},s)})(7.5625,2.75);_s("Expo",function(n){return Math.pow(2,10*(n-1))*n+n*n*n*n*n*n*(1-n)});_s("Circ",function(n){return-(xp(1-n*n)-1)});_s("Sine",function(n){return n===1?1:-_M(n*mM)+1});_s("Back",Sc("in"),Sc("out"),Sc());ct.SteppedEase=ct.steps=un.SteppedEase={config:function(e,t){e===void 0&&(e=1);var i=1/e,r=e+(t?0:1),s=t?1:0,a=1-Ct;return function(o){return((r*mo(0,a,o)|0)+s)*i}}};sa.ease=ct["quad.out"];Gi("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(n){return bh+=n+","+n+"Params,"});var Zp=function(e,t){this.id=gM++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:Ap,this.set=t?t.getSetter:Ph},io=(function(){function n(t){this.vars=t,this._delay=+t.delay||0,(this._repeat=t.repeat===1/0?-2:t.repeat||0)&&(this._rDelay=t.repeatDelay||0,this._yoyo=!!t.yoyo||!!t.yoyoEase),this._ts=1,la(this,+t.duration,1,1),this.data=t.data,Ut&&(this._ctx=Ut,Ut.data.push(this)),to||sn.wake()}var e=n.prototype;return e.delay=function(i){return i||i===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+i-this._delay),this._delay=i,this):this._delay},e.duration=function(i){return arguments.length?this.totalDuration(this._repeat>0?i+(i+this._rDelay)*this._repeat:i):this.totalDuration()&&this._dur},e.totalDuration=function(i){return arguments.length?(this._dirty=0,la(this,this._repeat<0?i:(i-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},e.totalTime=function(i,r){if(ca(),!arguments.length)return this._tTime;var s=this._dp;if(s&&s.smoothChildTiming&&this._ts){for(Il(this,i),!s._dp||s.parent||Lp(s,this);s&&s.parent;)s.parent._time!==s._start+(s._ts>=0?s._tTime/s._ts:(s.totalDuration()-s._tTime)/-s._ts)&&s.totalTime(s._tTime,!0),s=s.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&i<this._tDur||this._ts<0&&i>0||!this._tDur&&!i)&&Nn(this._dp,this,this._start-this._delay)}return(this._tTime!==i||!this._dur&&!r||this._initted&&Math.abs(this._zTime)===Ct||!this._initted&&this._dur&&i||!i&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=i),Rp(this,i,r)),this},e.time=function(i,r){return arguments.length?this.totalTime(Math.min(this.totalDuration(),i+Jf(this))%(this._dur+this._rDelay)||(i?this._dur:0),r):this._time},e.totalProgress=function(i,r){return arguments.length?this.totalTime(this.totalDuration()*i,r):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},e.progress=function(i,r){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-i:i)+Jf(this),r):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},e.iteration=function(i,r){var s=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(i-1)*s,r):this._repeat?oa(this._tTime,s)+1:1},e.timeScale=function(i,r){if(!arguments.length)return this._rts===-Ct?0:this._rts;if(this._rts===i)return this;var s=this.parent&&this._ts?xl(this.parent._time,this):this._tTime;return this._rts=+i||0,this._ts=this._ps||i===-Ct?0:this._rts,this.totalTime(mo(-Math.abs(this._delay),this.totalDuration(),s),r!==!1),Ul(this),RM(this)},e.paused=function(i){return arguments.length?(this._ps!==i&&(this._ps=i,i?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(ca(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==Ct&&(this._tTime-=Ct)))),this):this._ps},e.startTime=function(i){if(arguments.length){this._start=Nt(i);var r=this.parent||this._dp;return r&&(r._sort||!this.parent)&&Nn(r,this,this._start-this._delay),this}return this._start},e.endTime=function(i){return this._start+(Vi(i)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},e.rawTime=function(i){var r=this.parent||this._dp;return r?i&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?xl(r.rawTime(i),this):this._tTime:this._tTime},e.revert=function(i){i===void 0&&(i=bM);var r=gi;return gi=i,wh(this)&&(this.timeline&&this.timeline.revert(i),this.totalTime(-.01,i.suppressEvents)),this.data!=="nested"&&i.kill!==!1&&this.kill(),gi=r,this},e.globalTime=function(i){for(var r=this,s=arguments.length?i:r.rawTime();r;)s=r._start+s/(Math.abs(r._ts)||1),r=r._dp;return!this.parent&&this._sat?this._sat.globalTime(i):s},e.repeat=function(i){return arguments.length?(this._repeat=i===1/0?-2:i,Qf(this)):this._repeat===-2?1/0:this._repeat},e.repeatDelay=function(i){if(arguments.length){var r=this._time;return this._rDelay=i,Qf(this),r?this.time(r):this}return this._rDelay},e.yoyo=function(i){return arguments.length?(this._yoyo=i,this):this._yoyo},e.seek=function(i,r){return this.totalTime(mn(this,i),Vi(r))},e.restart=function(i,r){return this.play().totalTime(i?-this._delay:0,Vi(r)),this._dur||(this._zTime=-Ct),this},e.play=function(i,r){return i!=null&&this.seek(i,r),this.reversed(!1).paused(!1)},e.reverse=function(i,r){return i!=null&&this.seek(i||this.totalDuration(),r),this.reversed(!0).paused(!1)},e.pause=function(i,r){return i!=null&&this.seek(i,r),this.paused(!0)},e.resume=function(){return this.paused(!1)},e.reversed=function(i){return arguments.length?(!!i!==this.reversed()&&this.timeScale(-this._rts||(i?-Ct:0)),this):this._rts<0},e.invalidate=function(){return this._initted=this._act=0,this._zTime=-Ct,this},e.isActive=function(){var i=this.parent||this._dp,r=this._start,s;return!!(!i||this._ts&&this._initted&&i.isActive()&&(s=i.rawTime(!0))>=r&&s<this.endTime(!0)-Ct)},e.eventCallback=function(i,r,s){var a=this.vars;return arguments.length>1?(r?(a[i]=r,s&&(a[i+"Params"]=s),i==="onUpdate"&&(this._onUpdate=r)):delete a[i],this):a[i]},e.then=function(i){var r=this,s=r._prom;return new Promise(function(a){var o=kt(i)?i:Pp,l=function(){var u=r.then;r.then=null,s&&s(),kt(o)&&(o=o(r))&&(o.then||o===r)&&(r.then=u),a(o),r.then=u};r._initted&&r.totalProgress()===1&&r._ts>=0||!r._tTime&&r._ts<0?l():r._prom=l})},e.kill=function(){Ra(this)},n})();hn(io.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-Ct,_prom:0,_ps:!1,_rts:1});var Ii=(function(n){vp(e,n);function e(i,r){var s;return i===void 0&&(i={}),s=n.call(this,i)||this,s.labels={},s.smoothChildTiming=!!i.smoothChildTiming,s.autoRemoveChildren=!!i.autoRemoveChildren,s._sort=Vi(i.sortChildren),Ft&&Nn(i.parent||Ft,Jn(s),r),i.reversed&&s.reverse(),i.paused&&s.paused(!0),i.scrollTrigger&&Up(Jn(s),i.scrollTrigger),s}var t=e.prototype;return t.to=function(r,s,a){return Oa(0,arguments,this),this},t.from=function(r,s,a){return Oa(1,arguments,this),this},t.fromTo=function(r,s,a,o){return Oa(2,arguments,this),this},t.set=function(r,s,a){return s.duration=0,s.parent=this,Fa(s).repeatDelay||(s.repeat=0),s.immediateRender=!!s.immediateRender,new qt(r,s,mn(this,a),1),this},t.call=function(r,s,a){return Nn(this,qt.delayedCall(0,r,s),a)},t.staggerTo=function(r,s,a,o,l,c,u){return a.duration=s,a.stagger=a.stagger||o,a.onComplete=c,a.onCompleteParams=u,a.parent=this,new qt(r,a,mn(this,l)),this},t.staggerFrom=function(r,s,a,o,l,c,u){return a.runBackwards=1,Fa(a).immediateRender=Vi(a.immediateRender),this.staggerTo(r,s,a,o,l,c,u)},t.staggerFromTo=function(r,s,a,o,l,c,u,h){return o.startAt=a,Fa(o).immediateRender=Vi(o.immediateRender),this.staggerTo(r,s,o,l,c,u,h)},t.render=function(r,s,a){var o=this._time,l=this._dirty?this.totalDuration():this._tDur,c=this._dur,u=r<=0?0:Nt(r),h=this._zTime<0!=r<0&&(this._initted||!c),f,d,_,g,m,p,x,y,M,T,A,w;if(this!==Ft&&u>l&&r>=0&&(u=l),u!==this._tTime||a||h){if(o!==this._time&&c&&(u+=this._time-o,r+=this._time-o),f=u,M=this._start,y=this._ts,p=!y,h&&(c||(o=this._zTime),(r||!s)&&(this._zTime=r)),this._repeat){if(A=this._yoyo,m=c+this._rDelay,this._repeat<-1&&r<0)return this.totalTime(m*100+r,s,a);if(f=Nt(u%m),u===l?(g=this._repeat,f=c):(T=Nt(u/m),g=~~T,g&&g===T&&(f=c,g--),f>c&&(f=c)),T=oa(this._tTime,m),!o&&this._tTime&&T!==g&&this._tTime-T*m-this._dur<=0&&(T=g),A&&g&1&&(f=c-f,w=1),g!==T&&!this._lock){var C=A&&T&1,v=C===(A&&g&1);if(g<T&&(C=!C),o=C?0:u%c?c:u,this._lock=1,this.render(o||(w?0:Nt(g*m)),s,!c)._lock=0,this._tTime=u,!s&&this.parent&&on(this,"onRepeat"),this.vars.repeatRefresh&&!w&&(this.invalidate()._lock=1,T=g),o&&o!==this._time||p!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(c=this._dur,l=this._tDur,v&&(this._lock=2,o=C?c:-1e-4,this.render(o,!0),this.vars.repeatRefresh&&!w&&this.invalidate()),this._lock=0,!this._ts&&!p)return this;qp(this,w)}}if(this._hasPause&&!this._forcing&&this._lock<2&&(x=LM(this,Nt(o),Nt(f)),x&&(u-=f-(f=x._start))),this._tTime=u,this._time=f,this._act=!y,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=r,o=0),!o&&u&&c&&!s&&!T&&(on(this,"onStart"),this._tTime!==u))return this;if(f>=o&&r>=0)for(d=this._first;d;){if(_=d._next,(d._act||f>=d._start)&&d._ts&&x!==d){if(d.parent!==this)return this.render(r,s,a);if(d.render(d._ts>0?(f-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(f-d._start)*d._ts,s,a),f!==this._time||!this._ts&&!p){x=0,_&&(u+=this._zTime=-Ct);break}}d=_}else{d=this._last;for(var E=r<0?r:f;d;){if(_=d._prev,(d._act||E<=d._end)&&d._ts&&x!==d){if(d.parent!==this)return this.render(r,s,a);if(d.render(d._ts>0?(E-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(E-d._start)*d._ts,s,a||gi&&wh(d)),f!==this._time||!this._ts&&!p){x=0,_&&(u+=this._zTime=E?-Ct:Ct);break}}d=_}}if(x&&!s&&(this.pause(),x.render(f>=o?0:-Ct)._zTime=f>=o?1:-1,this._ts))return this._start=M,Ul(this),this.render(r,s,a);this._onUpdate&&!s&&on(this,"onUpdate",!0),(u===l&&this._tTime>=this.totalDuration()||!u&&o)&&(M===this._start||Math.abs(y)!==Math.abs(this._ts))&&(this._lock||((r||!c)&&(u===l&&this._ts>0||!u&&this._ts<0)&&Ur(this,1),!s&&!(r<0&&!o)&&(u||o||!l)&&(on(this,u===l&&r>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(u<l&&this.timeScale()>0)&&this._prom())))}return this},t.add=function(r,s){var a=this;if(ur(s)||(s=mn(this,s,r)),!(r instanceof io)){if(wi(r))return r.forEach(function(o){return a.add(o,s)}),this;if(hi(r))return this.addLabel(r,s);if(kt(r))r=qt.delayedCall(0,r);else return this}return this!==r?Nn(this,r,s):this},t.getChildren=function(r,s,a,o){r===void 0&&(r=!0),s===void 0&&(s=!0),a===void 0&&(a=!0),o===void 0&&(o=-vn);for(var l=[],c=this._first;c;)c._start>=o&&(c instanceof qt?s&&l.push(c):(a&&l.push(c),r&&l.push.apply(l,c.getChildren(!0,s,a)))),c=c._next;return l},t.getById=function(r){for(var s=this.getChildren(1,1,1),a=s.length;a--;)if(s[a].vars.id===r)return s[a]},t.remove=function(r){return hi(r)?this.removeLabel(r):kt(r)?this.killTweensOf(r):(r.parent===this&&Ll(this,r),r===this._recent&&(this._recent=this._last),rs(this))},t.totalTime=function(r,s){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=Nt(sn.time-(this._ts>0?r/this._ts:(this.totalDuration()-r)/-this._ts))),n.prototype.totalTime.call(this,r,s),this._forcing=0,this):this._tTime},t.addLabel=function(r,s){return this.labels[r]=mn(this,s),this},t.removeLabel=function(r){return delete this.labels[r],this},t.addPause=function(r,s,a){var o=qt.delayedCall(0,s||Qa,a);return o.data="isPause",this._hasPause=1,Nn(this,o,mn(this,r))},t.removePause=function(r){var s=this._first;for(r=mn(this,r);s;)s._start===r&&s.data==="isPause"&&Ur(s),s=s._next},t.killTweensOf=function(r,s,a){for(var o=this.getTweensOf(r,a),l=o.length;l--;)br!==o[l]&&o[l].kill(r,s);return this},t.getTweensOf=function(r,s){for(var a=[],o=xn(r),l=this._first,c=ur(s),u;l;)l instanceof qt?TM(l._targets,o)&&(c?(!br||l._initted&&l._ts)&&l.globalTime(0)<=s&&l.globalTime(l.totalDuration())>s:!s||l.isActive())&&a.push(l):(u=l.getTweensOf(o,s)).length&&a.push.apply(a,u),l=l._next;return a},t.tweenTo=function(r,s){s=s||{};var a=this,o=mn(a,r),l=s,c=l.startAt,u=l.onStart,h=l.onStartParams,f=l.immediateRender,d,_=qt.to(a,hn({ease:s.ease||"none",lazy:!1,immediateRender:!1,time:o,overwrite:"auto",duration:s.duration||Math.abs((o-(c&&"time"in c?c.time:a._time))/a.timeScale())||Ct,onStart:function(){if(a.pause(),!d){var m=s.duration||Math.abs((o-(c&&"time"in c?c.time:a._time))/a.timeScale());_._dur!==m&&la(_,m,0,1).render(_._time,!0,!0),d=1}u&&u.apply(_,h||[])}},s));return f?_.render(0):_},t.tweenFromTo=function(r,s,a){return this.tweenTo(s,hn({startAt:{time:mn(this,r)}},a))},t.recent=function(){return this._recent},t.nextLabel=function(r){return r===void 0&&(r=this._time),ed(this,mn(this,r))},t.previousLabel=function(r){return r===void 0&&(r=this._time),ed(this,mn(this,r),1)},t.currentLabel=function(r){return arguments.length?this.seek(r,!0):this.previousLabel(this._time+Ct)},t.shiftChildren=function(r,s,a){a===void 0&&(a=0);var o=this._first,l=this.labels,c;for(r=Nt(r);o;)o._start>=a&&(o._start+=r,o._end+=r),o=o._next;if(s)for(c in l)l[c]>=a&&(l[c]+=r);return rs(this)},t.invalidate=function(r){var s=this._first;for(this._lock=0;s;)s.invalidate(r),s=s._next;return n.prototype.invalidate.call(this,r)},t.clear=function(r){r===void 0&&(r=!0);for(var s=this._first,a;s;)a=s._next,this.remove(s),s=a;return this._dp&&(this._time=this._tTime=this._pTime=0),r&&(this.labels={}),rs(this)},t.totalDuration=function(r){var s=0,a=this,o=a._last,l=vn,c,u,h;if(arguments.length)return a.timeScale((a._repeat<0?a.duration():a.totalDuration())/(a.reversed()?-r:r));if(a._dirty){for(h=a.parent;o;)c=o._prev,o._dirty&&o.totalDuration(),u=o._start,u>l&&a._sort&&o._ts&&!a._lock?(a._lock=1,Nn(a,o,u-o._delay,1)._lock=0):l=u,u<0&&o._ts&&(s-=u,(!h&&!a._dp||h&&h.smoothChildTiming)&&(a._start+=Nt(u/a._ts),a._time-=u,a._tTime-=u),a.shiftChildren(-u,!1,-1/0),l=0),o._end>s&&o._ts&&(s=o._end),o=c;la(a,a===Ft&&a._time>s?a._time:s,1,1),a._dirty=0}return a._tDur},e.updateRoot=function(r){if(Ft._ts&&(Rp(Ft,xl(r,Ft)),wp=sn.frame),sn.frame>=Zf){Zf+=cn.autoSleep||120;var s=Ft._first;if((!s||!s._ts)&&cn.autoSleep&&sn._listeners.length<2){for(;s&&!s._ts;)s=s._next;s||sn.sleep()}}},e})(io);hn(Ii.prototype,{_lock:0,_hasPause:0,_forcing:0});var qM=function(e,t,i,r,s,a,o){var l=new Wi(this._pt,e,t,0,1,im,null,s),c=0,u=0,h,f,d,_,g,m,p,x;for(l.b=i,l.e=r,i+="",r+="",(p=~r.indexOf("random("))&&(r=eo(r)),a&&(x=[i,r],a(x,e,t),i=x[0],r=x[1]),f=i.match(gc)||[];h=gc.exec(r);)_=h[0],g=r.substring(c,h.index),d?d=(d+1)%5:g.substr(-5)==="rgba("&&(d=1),_!==f[u++]&&(m=parseFloat(f[u-1])||0,l._pt={_next:l._pt,p:g||u===1?g:",",s:m,c:_.charAt(1)==="="?Ys(m,_)-m:parseFloat(_)-m,m:d&&d<4?Math.round:0},c=gc.lastIndex);return l.c=c<r.length?r.substring(c,r.length):"",l.fp=o,(Ep.test(r)||p)&&(l.e=0),this._pt=l,l},Ah=function(e,t,i,r,s,a,o,l,c,u){kt(r)&&(r=r(s||0,e,a));var h=e[t],f=i!=="get"?i:kt(h)?c?e[t.indexOf("set")||!kt(e["get"+t.substr(3)])?t:"get"+t.substr(3)](c):e[t]():h,d=kt(h)?c?QM:em:Ch,_;if(hi(r)&&(~r.indexOf("random(")&&(r=eo(r)),r.charAt(1)==="="&&(_=Ys(f,r)+(yi(f)||0),(_||_===0)&&(r=_))),!u||f!==r||Fu)return!isNaN(f*r)&&r!==""?(_=new Wi(this._pt,e,t,+f||0,r-(f||0),typeof h=="boolean"?tE:tm,0,d),c&&(_.fp=c),o&&_.modifier(o,this,e),this._pt=_):(!h&&!(t in e)&&Eh(t,r),qM.call(this,e,t,f,r,d,l||cn.stringFilter,c))},KM=function(e,t,i,r,s){if(kt(e)&&(e=Ba(e,s,t,i,r)),!Xn(e)||e.style&&e.nodeType||wi(e)||Sp(e))return hi(e)?Ba(e,s,t,i,r):e;var a={},o;for(o in e)a[o]=Ba(e[o],s,t,i,r);return a},jp=function(e,t,i,r,s,a){var o,l,c,u;if(en[e]&&(o=new en[e]).init(s,o.rawVars?t[e]:KM(t[e],r,s,a,i),i,r,a)!==!1&&(i._pt=l=new Wi(i._pt,s,e,0,1,o.render,o,0,o.priority),i!==Vs))for(c=i._ptLookup[i._targets.indexOf(s)],u=o._props.length;u--;)c[o._props[u]]=l;return o},br,Fu,Rh=function n(e,t,i){var r=e.vars,s=r.ease,a=r.startAt,o=r.immediateRender,l=r.lazy,c=r.onUpdate,u=r.runBackwards,h=r.yoyoEase,f=r.keyframes,d=r.autoRevert,_=e._dur,g=e._startAt,m=e._targets,p=e.parent,x=p&&p.data==="nested"?p.vars.targets:m,y=e._overwrite==="auto"&&!vh,M=e.timeline,T,A,w,C,v,E,D,U,B,H,V,k,O;if(M&&(!f||!s)&&(s="none"),e._ease=ss(s,sa.ease),e._yEase=h?$p(ss(h===!0?s:h,sa.ease)):0,h&&e._yoyo&&!e._repeat&&(h=e._yEase,e._yEase=e._ease,e._ease=h),e._from=!M&&!!r.runBackwards,!M||f&&!r.stagger){if(U=m[0]?ns(m[0]).harness:0,k=U&&r[U.prop],T=vl(r,yh),g&&(g._zTime<0&&g.progress(1),t<0&&u&&o&&!d?g.render(-1,!0):g.revert(u&&_?il:yM),g._lazy=0),a){if(Ur(e._startAt=qt.set(m,hn({data:"isStart",overwrite:!1,parent:p,immediateRender:!0,lazy:!g&&Vi(l),startAt:null,delay:0,onUpdate:c&&function(){return on(e,"onUpdate")},stagger:0},a))),e._startAt._dp=0,e._startAt._sat=e,t<0&&(gi||!o&&!d)&&e._startAt.revert(il),o&&_&&t<=0&&i<=0){t&&(e._zTime=t);return}}else if(u&&_&&!g){if(t&&(o=!1),w=hn({overwrite:!1,data:"isFromStart",lazy:o&&!g&&Vi(l),immediateRender:o,stagger:0,parent:p},T),k&&(w[U.prop]=k),Ur(e._startAt=qt.set(m,w)),e._startAt._dp=0,e._startAt._sat=e,t<0&&(gi?e._startAt.revert(il):e._startAt.render(-1,!0)),e._zTime=t,!o)n(e._startAt,Ct,Ct);else if(!t)return}for(e._pt=e._ptCache=0,l=_&&Vi(l)||l&&!_,A=0;A<m.length;A++){if(v=m[A],D=v._gsap||Th(m)[A]._gsap,e._ptLookup[A]=H={},Pu[D.id]&&Cr.length&&_l(),V=x===m?A:x.indexOf(v),U&&(B=new U).init(v,k||T,e,V,x)!==!1&&(e._pt=C=new Wi(e._pt,v,B.name,0,1,B.render,B,0,B.priority),B._props.forEach(function(q){H[q]=C}),B.priority&&(E=1)),!U||k)for(w in T)en[w]&&(B=jp(w,T,e,V,v,x))?B.priority&&(E=1):H[w]=C=Ah.call(e,v,w,"get",T[w],V,x,0,r.stringFilter);e._op&&e._op[A]&&e.kill(v,e._op[A]),y&&e._pt&&(br=e,Ft.killTweensOf(v,H,e.globalTime(t)),O=!e.parent,br=0),e._pt&&l&&(Pu[D.id]=1)}E&&nm(e),e._onInit&&e._onInit(e)}e._onUpdate=c,e._initted=(!e._op||e._pt)&&!O,f&&t<=0&&M.render(vn,!0,!0)},ZM=function(e,t,i,r,s,a,o,l){var c=(e._pt&&e._ptCache||(e._ptCache={}))[t],u,h,f,d;if(!c)for(c=e._ptCache[t]=[],f=e._ptLookup,d=e._targets.length;d--;){if(u=f[d][t],u&&u.d&&u.d._pt)for(u=u.d._pt;u&&u.p!==t&&u.fp!==t;)u=u._next;if(!u)return Fu=1,e.vars[t]="+=0",Rh(e,o),Fu=0,l?Ja(t+" not eligible for reset"):1;c.push(u)}for(d=c.length;d--;)h=c[d],u=h._pt||h,u.s=(r||r===0)&&!s?r:u.s+(r||0)+a*u.c,u.c=i-u.s,h.e&&(h.e=Gt(i)+yi(h.e)),h.b&&(h.b=u.s+yi(h.b))},jM=function(e,t){var i=e[0]?ns(e[0]).harness:0,r=i&&i.aliases,s,a,o,l;if(!r)return t;s=aa({},t);for(a in r)if(a in s)for(l=r[a].split(","),o=l.length;o--;)s[l[o]]=s[a];return s},JM=function(e,t,i,r){var s=t.ease||r||"power1.inOut",a,o;if(wi(t))o=i[e]||(i[e]=[]),t.forEach(function(l,c){return o.push({t:c/(t.length-1)*100,v:l,e:s})});else for(a in t)o=i[a]||(i[a]=[]),a==="ease"||o.push({t:parseFloat(e),v:t[a],e:s})},Ba=function(e,t,i,r,s){return kt(e)?e.call(t,i,r,s):hi(e)&&~e.indexOf("random(")?eo(e):e},Jp=bh+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",Qp={};Gi(Jp+",id,stagger,delay,duration,paused,scrollTrigger",function(n){return Qp[n]=1});var qt=(function(n){vp(e,n);function e(i,r,s,a){var o;typeof r=="number"&&(s.duration=r,r=s,s=null),o=n.call(this,a?r:Fa(r))||this;var l=o.vars,c=l.duration,u=l.delay,h=l.immediateRender,f=l.stagger,d=l.overwrite,_=l.keyframes,g=l.defaults,m=l.scrollTrigger,p=l.yoyoEase,x=r.parent||Ft,y=(wi(i)||Sp(i)?ur(i[0]):"length"in r)?[i]:xn(i),M,T,A,w,C,v,E,D;if(o._targets=y.length?Th(y):Ja("GSAP target "+i+" not found. https://gsap.com",!cn.nullTargetWarn)||[],o._ptLookup=[],o._overwrite=d,_||f||Fo(c)||Fo(u)){if(r=o.vars,M=o.timeline=new Ii({data:"nested",defaults:g||{},targets:x&&x.data==="nested"?x.vars.targets:y}),M.kill(),M.parent=M._dp=Jn(o),M._start=0,f||Fo(c)||Fo(u)){if(w=y.length,E=f&&Op(f),Xn(f))for(C in f)~Jp.indexOf(C)&&(D||(D={}),D[C]=f[C]);for(T=0;T<w;T++)A=vl(r,Qp),A.stagger=0,p&&(A.yoyoEase=p),D&&aa(A,D),v=y[T],A.duration=+Ba(c,Jn(o),T,v,y),A.delay=(+Ba(u,Jn(o),T,v,y)||0)-o._delay,!f&&w===1&&A.delay&&(o._delay=u=A.delay,o._start+=u,A.delay=0),M.to(v,A,E?E(T,v,y):0),M._ease=ct.none;M.duration()?c=u=0:o.timeline=0}else if(_){Fa(hn(M.vars.defaults,{ease:"none"})),M._ease=ss(_.ease||r.ease||"none");var U=0,B,H,V;if(wi(_))_.forEach(function(k){return M.to(y,k,">")}),M.duration();else{A={};for(C in _)C==="ease"||C==="easeEach"||JM(C,_[C],A,_.easeEach);for(C in A)for(B=A[C].sort(function(k,O){return k.t-O.t}),U=0,T=0;T<B.length;T++)H=B[T],V={ease:H.e,duration:(H.t-(T?B[T-1].t:0))/100*c},V[C]=H.v,M.to(y,V,U),U+=V.duration;M.duration()<c&&M.to({},{duration:c-M.duration()})}}c||o.duration(c=M.duration())}else o.timeline=0;return d===!0&&!vh&&(br=Jn(o),Ft.killTweensOf(y),br=0),Nn(x,Jn(o),s),r.reversed&&o.reverse(),r.paused&&o.paused(!0),(h||!c&&!_&&o._start===Nt(x._time)&&Vi(h)&&CM(Jn(o))&&x.data!=="nested")&&(o._tTime=-Ct,o.render(Math.max(0,-u)||0)),m&&Up(Jn(o),m),o}var t=e.prototype;return t.render=function(r,s,a){var o=this._time,l=this._tDur,c=this._dur,u=r<0,h=r>l-Ct&&!u?l:r<Ct?0:r,f,d,_,g,m,p,x,y,M;if(!c)DM(this,r,s,a);else if(h!==this._tTime||!r||a||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==u||this._lazy){if(f=h,y=this.timeline,this._repeat){if(g=c+this._rDelay,this._repeat<-1&&u)return this.totalTime(g*100+r,s,a);if(f=Nt(h%g),h===l?(_=this._repeat,f=c):(m=Nt(h/g),_=~~m,_&&_===m?(f=c,_--):f>c&&(f=c)),p=this._yoyo&&_&1,p&&(M=this._yEase,f=c-f),m=oa(this._tTime,g),f===o&&!a&&this._initted&&_===m)return this._tTime=h,this;_!==m&&(y&&this._yEase&&qp(y,p),this.vars.repeatRefresh&&!p&&!this._lock&&f!==g&&this._initted&&(this._lock=a=1,this.render(Nt(g*_),!0).invalidate()._lock=0))}if(!this._initted){if(Ip(this,u?r:f,a,s,h))return this._tTime=0,this;if(o!==this._time&&!(a&&this.vars.repeatRefresh&&_!==m))return this;if(c!==this._dur)return this.render(r,s,a)}if(this._tTime=h,this._time=f,!this._act&&this._ts&&(this._act=1,this._lazy=0),this.ratio=x=(M||this._ease)(f/c),this._from&&(this.ratio=x=1-x),!o&&h&&!s&&!m&&(on(this,"onStart"),this._tTime!==h))return this;for(d=this._pt;d;)d.r(x,d.d),d=d._next;y&&y.render(r<0?r:y._dur*y._ease(f/this._dur),s,a)||this._startAt&&(this._zTime=r),this._onUpdate&&!s&&(u&&Du(this,r,s,a),on(this,"onUpdate")),this._repeat&&_!==m&&this.vars.onRepeat&&!s&&this.parent&&on(this,"onRepeat"),(h===this._tDur||!h)&&this._tTime===h&&(u&&!this._onUpdate&&Du(this,r,!0,!0),(r||!c)&&(h===this._tDur&&this._ts>0||!h&&this._ts<0)&&Ur(this,1),!s&&!(u&&!o)&&(h||o||p)&&(on(this,h===l?"onComplete":"onReverseComplete",!0),this._prom&&!(h<l&&this.timeScale()>0)&&this._prom()))}return this},t.targets=function(){return this._targets},t.invalidate=function(r){return(!r||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(r),n.prototype.invalidate.call(this,r)},t.resetTo=function(r,s,a,o,l){to||sn.wake(),this._ts||this.play();var c=Math.min(this._dur,(this._dp._time-this._start)*this._ts),u;return this._initted||Rh(this,c),u=this._ease(c/this._dur),ZM(this,r,s,a,o,u,c,l)?this.resetTo(r,s,a,o,1):(Il(this,0),this.parent||Dp(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},t.kill=function(r,s){if(s===void 0&&(s="all"),!r&&(!s||s==="all"))return this._lazy=this._pt=0,this.parent?Ra(this):this.scrollTrigger&&this.scrollTrigger.kill(!!gi),this;if(this.timeline){var a=this.timeline.totalDuration();return this.timeline.killTweensOf(r,s,br&&br.vars.overwrite!==!0)._first||Ra(this),this.parent&&a!==this.timeline.totalDuration()&&la(this,this._dur*this.timeline._tDur/a,0,1),this}var o=this._targets,l=r?xn(r):o,c=this._ptLookup,u=this._pt,h,f,d,_,g,m,p;if((!s||s==="all")&&AM(o,l))return s==="all"&&(this._pt=0),Ra(this);for(h=this._op=this._op||[],s!=="all"&&(hi(s)&&(g={},Gi(s,function(x){return g[x]=1}),s=g),s=jM(o,s)),p=o.length;p--;)if(~l.indexOf(o[p])){f=c[p],s==="all"?(h[p]=s,_=f,d={}):(d=h[p]=h[p]||{},_=s);for(g in _)m=f&&f[g],m&&((!("kill"in m.d)||m.d.kill(g)===!0)&&Ll(this,m,"_pt"),delete f[g]),d!=="all"&&(d[g]=1)}return this._initted&&!this._pt&&u&&Ra(this),this},e.to=function(r,s){return new e(r,s,arguments[2])},e.from=function(r,s){return Oa(1,arguments)},e.delayedCall=function(r,s,a,o){return new e(s,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:r,onComplete:s,onReverseComplete:s,onCompleteParams:a,onReverseCompleteParams:a,callbackScope:o})},e.fromTo=function(r,s,a){return Oa(2,arguments)},e.set=function(r,s){return s.duration=0,s.repeatDelay||(s.repeat=0),new e(r,s)},e.killTweensOf=function(r,s,a){return Ft.killTweensOf(r,s,a)},e})(io);hn(qt.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});Gi("staggerTo,staggerFrom,staggerFromTo",function(n){qt[n]=function(){var e=new Ii,t=Uu.call(arguments,0);return t.splice(n==="staggerFromTo"?5:4,0,0),e[n].apply(e,t)}});var Ch=function(e,t,i){return e[t]=i},em=function(e,t,i){return e[t](i)},QM=function(e,t,i,r){return e[t](r.fp,i)},eE=function(e,t,i){return e.setAttribute(t,i)},Ph=function(e,t){return kt(e[t])?em:xh(e[t])&&e.setAttribute?eE:Ch},tm=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},tE=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},im=function(e,t){var i=t._pt,r="";if(!e&&t.b)r=t.b;else if(e===1&&t.e)r=t.e;else{for(;i;)r=i.p+(i.m?i.m(i.s+i.c*e):Math.round((i.s+i.c*e)*1e4)/1e4)+r,i=i._next;r+=t.c}t.set(t.t,t.p,r,t)},Dh=function(e,t){for(var i=t._pt;i;)i.r(e,i.d),i=i._next},iE=function(e,t,i,r){for(var s=this._pt,a;s;)a=s._next,s.p===r&&s.modifier(e,t,i),s=a},nE=function(e){for(var t=this._pt,i,r;t;)r=t._next,t.p===e&&!t.op||t.op===e?Ll(this,t,"_pt"):t.dep||(i=1),t=r;return!i},rE=function(e,t,i,r){r.mSet(e,t,r.m.call(r.tween,i,r.mt),r)},nm=function(e){for(var t=e._pt,i,r,s,a;t;){for(i=t._next,r=s;r&&r.pr>t.pr;)r=r._next;(t._prev=r?r._prev:a)?t._prev._next=t:s=t,(t._next=r)?r._prev=t:a=t,t=i}e._pt=s},Wi=(function(){function n(t,i,r,s,a,o,l,c,u){this.t=i,this.s=s,this.c=a,this.p=r,this.r=o||tm,this.d=l||this,this.set=c||Ch,this.pr=u||0,this._next=t,t&&(t._prev=this)}var e=n.prototype;return e.modifier=function(i,r,s){this.mSet=this.mSet||this.set,this.set=rE,this.m=i,this.mt=s,this.tween=r},n})();Gi(bh+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",function(n){return yh[n]=1});un.TweenMax=un.TweenLite=qt;un.TimelineLite=un.TimelineMax=Ii;Ft=new Ii({sortChildren:!1,defaults:sa,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});cn.stringFilter=Yp;var as=[],rl={},sE=[],id=0,aE=0,Mc=function(e){return(rl[e]||sE).map(function(t){return t()})},Ou=function(){var e=Date.now(),t=[];e-id>2&&(Mc("matchMediaInit"),as.forEach(function(i){var r=i.queries,s=i.conditions,a,o,l,c;for(o in r)a=Dn.matchMedia(r[o]).matches,a&&(l=1),a!==s[o]&&(s[o]=a,c=1);c&&(i.revert(),l&&t.push(i))}),Mc("matchMediaRevert"),t.forEach(function(i){return i.onMatch(i,function(r){return i.add(null,r)})}),id=e,Mc("matchMedia"))},rm=(function(){function n(t,i){this.selector=i&&Iu(i),this.data=[],this._r=[],this.isReverted=!1,this.id=aE++,t&&this.add(t)}var e=n.prototype;return e.add=function(i,r,s){kt(i)&&(s=r,r=i,i=kt);var a=this,o=function(){var c=Ut,u=a.selector,h;return c&&c!==a&&c.data.push(a),s&&(a.selector=Iu(s)),Ut=a,h=r.apply(a,arguments),kt(h)&&a._r.push(h),Ut=c,a.selector=u,a.isReverted=!1,h};return a.last=o,i===kt?o(a,function(l){return a.add(null,l)}):i?a[i]=o:o},e.ignore=function(i){var r=Ut;Ut=null,i(this),Ut=r},e.getTweens=function(){var i=[];return this.data.forEach(function(r){return r instanceof n?i.push.apply(i,r.getTweens()):r instanceof qt&&!(r.parent&&r.parent.data==="nested")&&i.push(r)}),i},e.clear=function(){this._r.length=this.data.length=0},e.kill=function(i,r){var s=this;if(i?(function(){for(var o=s.getTweens(),l=s.data.length,c;l--;)c=s.data[l],c.data==="isFlip"&&(c.revert(),c.getChildren(!0,!0,!1).forEach(function(u){return o.splice(o.indexOf(u),1)}));for(o.map(function(u){return{g:u._dur||u._delay||u._sat&&!u._sat.vars.immediateRender?u.globalTime(0):-1/0,t:u}}).sort(function(u,h){return h.g-u.g||-1/0}).forEach(function(u){return u.t.revert(i)}),l=s.data.length;l--;)c=s.data[l],c instanceof Ii?c.data!=="nested"&&(c.scrollTrigger&&c.scrollTrigger.revert(),c.kill()):!(c instanceof qt)&&c.revert&&c.revert(i);s._r.forEach(function(u){return u(i,s)}),s.isReverted=!0})():this.data.forEach(function(o){return o.kill&&o.kill()}),this.clear(),r)for(var a=as.length;a--;)as[a].id===this.id&&as.splice(a,1)},e.revert=function(i){this.kill(i||{})},n})(),oE=(function(){function n(t){this.contexts=[],this.scope=t,Ut&&Ut.data.push(this)}var e=n.prototype;return e.add=function(i,r,s){Xn(i)||(i={matches:i});var a=new rm(0,s||this.scope),o=a.conditions={},l,c,u;Ut&&!a.selector&&(a.selector=Ut.selector),this.contexts.push(a),r=a.add("onMatch",r),a.queries=i;for(c in i)c==="all"?u=1:(l=Dn.matchMedia(i[c]),l&&(as.indexOf(a)<0&&as.push(a),(o[c]=l.matches)&&(u=1),l.addListener?l.addListener(Ou):l.addEventListener("change",Ou)));return u&&r(a,function(h){return a.add(null,h)}),this},e.revert=function(i){this.kill(i||{})},e.kill=function(i){this.contexts.forEach(function(r){return r.kill(i,!0)})},n})(),Sl={registerPlugin:function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];t.forEach(function(r){return Gp(r)})},timeline:function(e){return new Ii(e)},getTweensOf:function(e,t){return Ft.getTweensOf(e,t)},getProperty:function(e,t,i,r){hi(e)&&(e=xn(e)[0]);var s=ns(e||{}).get,a=i?Pp:Cp;return i==="native"&&(i=""),e&&(t?a((en[t]&&en[t].get||s)(e,t,i,r)):function(o,l,c){return a((en[o]&&en[o].get||s)(e,o,l,c))})},quickSetter:function(e,t,i){if(e=xn(e),e.length>1){var r=e.map(function(u){return Yi.quickSetter(u,t,i)}),s=r.length;return function(u){for(var h=s;h--;)r[h](u)}}e=e[0]||{};var a=en[t],o=ns(e),l=o.harness&&(o.harness.aliases||{})[t]||t,c=a?function(u){var h=new a;Vs._pt=0,h.init(e,i?u+i:u,Vs,0,[e]),h.render(1,h),Vs._pt&&Dh(1,Vs)}:o.set(e,l);return a?c:function(u){return c(e,l,i?u+i:u,o,1)}},quickTo:function(e,t,i){var r,s=Yi.to(e,hn((r={},r[t]="+=0.1",r.paused=!0,r.stagger=0,r),i||{})),a=function(l,c,u){return s.resetTo(t,l,c,u)};return a.tween=s,a},isTweening:function(e){return Ft.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=ss(e.ease,sa.ease)),jf(sa,e||{})},config:function(e){return jf(cn,e||{})},registerEffect:function(e){var t=e.name,i=e.effect,r=e.plugins,s=e.defaults,a=e.extendTimeline;(r||"").split(",").forEach(function(o){return o&&!en[o]&&!un[o]&&Ja(t+" effect requires "+o+" plugin.")}),_c[t]=function(o,l,c){return i(xn(o),hn(l||{},s),c)},a&&(Ii.prototype[t]=function(o,l,c){return this.add(_c[t](o,Xn(l)?l:(c=l)&&{},this),c)})},registerEase:function(e,t){ct[e]=ss(t)},parseEase:function(e,t){return arguments.length?ss(e,t):ct},getById:function(e){return Ft.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var i=new Ii(e),r,s;for(i.smoothChildTiming=Vi(e.smoothChildTiming),Ft.remove(i),i._dp=0,i._time=i._tTime=Ft._time,r=Ft._first;r;)s=r._next,(t||!(!r._dur&&r instanceof qt&&r.vars.onComplete===r._targets[0]))&&Nn(i,r,r._start-r._delay),r=s;return Nn(Ft,i,0),i},context:function(e,t){return e?new rm(e,t):Ut},matchMedia:function(e){return new oE(e)},matchMediaRefresh:function(){return as.forEach(function(e){var t=e.conditions,i,r;for(r in t)t[r]&&(t[r]=!1,i=1);i&&e.revert()})||Ou()},addEventListener:function(e,t){var i=rl[e]||(rl[e]=[]);~i.indexOf(t)||i.push(t)},removeEventListener:function(e,t){var i=rl[e],r=i&&i.indexOf(t);r>=0&&i.splice(r,1)},utils:{wrap:zM,wrapYoyo:kM,distribute:Op,random:zp,snap:Bp,normalize:BM,getUnit:yi,clamp:IM,splitColor:Wp,toArray:xn,selector:Iu,mapRange:Hp,pipe:FM,unitize:OM,interpolate:HM,shuffle:Fp},install:bp,effects:_c,ticker:sn,updateRoot:Ii.updateRoot,plugins:en,globalTimeline:Ft,core:{PropTween:Wi,globals:Tp,Tween:qt,Timeline:Ii,Animation:io,getCache:ns,_removeLinkedListItem:Ll,reverting:function(){return gi},context:function(e){return e&&Ut&&(Ut.data.push(e),e._ctx=Ut),Ut},suppressOverwrites:function(e){return vh=e}}};Gi("to,from,fromTo,delayedCall,set,killTweensOf",function(n){return Sl[n]=qt[n]});sn.add(Ii.updateRoot);Vs=Sl.to({},{duration:0});var lE=function(e,t){for(var i=e._pt;i&&i.p!==t&&i.op!==t&&i.fp!==t;)i=i._next;return i},cE=function(e,t){var i=e._targets,r,s,a;for(r in t)for(s=i.length;s--;)a=e._ptLookup[s][r],a&&(a=a.d)&&(a._pt&&(a=lE(a,r)),a&&a.modifier&&a.modifier(t[r],e,i[s],r))},Ec=function(e,t){return{name:e,headless:1,rawVars:1,init:function(r,s,a){a._onInit=function(o){var l,c;if(hi(s)&&(l={},Gi(s,function(u){return l[u]=1}),s=l),t){l={};for(c in s)l[c]=t(s[c]);s=l}cE(o,s)}}}},Yi=Sl.registerPlugin({name:"attr",init:function(e,t,i,r,s){var a,o,l;this.tween=i;for(a in t)l=e.getAttribute(a)||"",o=this.add(e,"setAttribute",(l||0)+"",t[a],r,s,0,0,a),o.op=a,o.b=l,this._props.push(a)},render:function(e,t){for(var i=t._pt;i;)gi?i.set(i.t,i.p,i.b,i):i.r(e,i.d),i=i._next}},{name:"endArray",headless:1,init:function(e,t){for(var i=t.length;i--;)this.add(e,i,e[i]||0,t[i],0,0,0,0,0,1)}},Ec("roundProps",Nu),Ec("modifiers"),Ec("snap",Bp))||Sl;qt.version=Ii.version=Yi.version="3.14.2";yp=1;Sh()&&ca();ct.Power0;ct.Power1;ct.Power2;ct.Power3;ct.Power4;ct.Linear;ct.Quad;ct.Cubic;ct.Quart;ct.Quint;ct.Strong;ct.Elastic;ct.Back;ct.SteppedEase;ct.Bounce;ct.Sine;ct.Expo;ct.Circ;var nd,Tr,$s,Lh,ts,rd,Uh,uE=function(){return typeof window<"u"},hr={},qr=180/Math.PI,qs=Math.PI/180,Ns=Math.atan2,sd=1e8,Ih=/([A-Z])/g,hE=/(left|right|width|margin|padding|x)/i,fE=/[\s,\(]\S/,Bn={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},Bu=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},dE=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},pE=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},mE=function(e,t){return t.set(t.t,t.p,e===1?t.e:e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},gE=function(e,t){var i=t.s+t.c*e;t.set(t.t,t.p,~~(i+(i<0?-.5:.5))+t.u,t)},sm=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},am=function(e,t){return t.set(t.t,t.p,e!==1?t.b:t.e,t)},_E=function(e,t,i){return e.style[t]=i},vE=function(e,t,i){return e.style.setProperty(t,i)},xE=function(e,t,i){return e._gsap[t]=i},SE=function(e,t,i){return e._gsap.scaleX=e._gsap.scaleY=i},ME=function(e,t,i,r,s){var a=e._gsap;a.scaleX=a.scaleY=i,a.renderTransform(s,a)},EE=function(e,t,i,r,s){var a=e._gsap;a[t]=i,a.renderTransform(s,a)},Ot="transform",Xi=Ot+"Origin",yE=function n(e,t){var i=this,r=this.target,s=r.style,a=r._gsap;if(e in hr&&s){if(this.tfm=this.tfm||{},e!=="transform")e=Bn[e]||e,~e.indexOf(",")?e.split(",").forEach(function(o){return i.tfm[o]=Qn(r,o)}):this.tfm[e]=a.x?a[e]:Qn(r,e),e===Xi&&(this.tfm.zOrigin=a.zOrigin);else return Bn.transform.split(",").forEach(function(o){return n.call(i,o,t)});if(this.props.indexOf(Ot)>=0)return;a.svg&&(this.svgo=r.getAttribute("data-svg-origin"),this.props.push(Xi,t,"")),e=Ot}(s||t)&&this.props.push(e,t,s[e])},om=function(e){e.translate&&(e.removeProperty("translate"),e.removeProperty("scale"),e.removeProperty("rotate"))},bE=function(){var e=this.props,t=this.target,i=t.style,r=t._gsap,s,a;for(s=0;s<e.length;s+=3)e[s+1]?e[s+1]===2?t[e[s]](e[s+2]):t[e[s]]=e[s+2]:e[s+2]?i[e[s]]=e[s+2]:i.removeProperty(e[s].substr(0,2)==="--"?e[s]:e[s].replace(Ih,"-$1").toLowerCase());if(this.tfm){for(a in this.tfm)r[a]=this.tfm[a];r.svg&&(r.renderTransform(),t.setAttribute("data-svg-origin",this.svgo||"")),s=Uh(),(!s||!s.isStart)&&!i[Ot]&&(om(i),r.zOrigin&&i[Xi]&&(i[Xi]+=" "+r.zOrigin+"px",r.zOrigin=0,r.renderTransform()),r.uncache=1)}},lm=function(e,t){var i={target:e,props:[],revert:bE,save:yE};return e._gsap||Yi.core.getCache(e),t&&e.style&&e.nodeType&&t.split(",").forEach(function(r){return i.save(r)}),i},cm,zu=function(e,t){var i=Tr.createElementNS?Tr.createElementNS((t||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),e):Tr.createElement(e);return i&&i.style?i:Tr.createElement(e)},ln=function n(e,t,i){var r=getComputedStyle(e);return r[t]||r.getPropertyValue(t.replace(Ih,"-$1").toLowerCase())||r.getPropertyValue(t)||!i&&n(e,ua(t)||t,1)||""},ad="O,Moz,ms,Ms,Webkit".split(","),ua=function(e,t,i){var r=t||ts,s=r.style,a=5;if(e in s&&!i)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);a--&&!(ad[a]+e in s););return a<0?null:(a===3?"ms":a>=0?ad[a]:"")+e},ku=function(){uE()&&window.document&&(nd=window,Tr=nd.document,$s=Tr.documentElement,ts=zu("div")||{style:{}},zu("div"),Ot=ua(Ot),Xi=Ot+"Origin",ts.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",cm=!!ua("perspective"),Uh=Yi.core.reverting,Lh=1)},od=function(e){var t=e.ownerSVGElement,i=zu("svg",t&&t.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),r=e.cloneNode(!0),s;r.style.display="block",i.appendChild(r),$s.appendChild(i);try{s=r.getBBox()}catch{}return i.removeChild(r),$s.removeChild(i),s},ld=function(e,t){for(var i=t.length;i--;)if(e.hasAttribute(t[i]))return e.getAttribute(t[i])},um=function(e){var t,i;try{t=e.getBBox()}catch{t=od(e),i=1}return t&&(t.width||t.height)||i||(t=od(e)),t&&!t.width&&!t.x&&!t.y?{x:+ld(e,["x","cx","x1"])||0,y:+ld(e,["y","cy","y1"])||0,width:0,height:0}:t},hm=function(e){return!!(e.getCTM&&(!e.parentNode||e.ownerSVGElement)&&um(e))},Ir=function(e,t){if(t){var i=e.style,r;t in hr&&t!==Xi&&(t=Ot),i.removeProperty?(r=t.substr(0,2),(r==="ms"||t.substr(0,6)==="webkit")&&(t="-"+t),i.removeProperty(r==="--"?t:t.replace(Ih,"-$1").toLowerCase())):i.removeAttribute(t)}},wr=function(e,t,i,r,s,a){var o=new Wi(e._pt,t,i,0,1,a?am:sm);return e._pt=o,o.b=r,o.e=s,e._props.push(i),o},cd={deg:1,rad:1,turn:1},TE={grid:1,flex:1},Nr=function n(e,t,i,r){var s=parseFloat(i)||0,a=(i+"").trim().substr((s+"").length)||"px",o=ts.style,l=hE.test(t),c=e.tagName.toLowerCase()==="svg",u=(c?"client":"offset")+(l?"Width":"Height"),h=100,f=r==="px",d=r==="%",_,g,m,p;if(r===a||!s||cd[r]||cd[a])return s;if(a!=="px"&&!f&&(s=n(e,t,i,"px")),p=e.getCTM&&hm(e),(d||a==="%")&&(hr[t]||~t.indexOf("adius")))return _=p?e.getBBox()[l?"width":"height"]:e[u],Gt(d?s/_*h:s/100*_);if(o[l?"width":"height"]=h+(f?a:r),g=r!=="rem"&&~t.indexOf("adius")||r==="em"&&e.appendChild&&!c?e:e.parentNode,p&&(g=(e.ownerSVGElement||{}).parentNode),(!g||g===Tr||!g.appendChild)&&(g=Tr.body),m=g._gsap,m&&d&&m.width&&l&&m.time===sn.time&&!m.uncache)return Gt(s/m.width*h);if(d&&(t==="height"||t==="width")){var x=e.style[t];e.style[t]=h+r,_=e[u],x?e.style[t]=x:Ir(e,t)}else(d||a==="%")&&!TE[ln(g,"display")]&&(o.position=ln(e,"position")),g===e&&(o.position="static"),g.appendChild(ts),_=ts[u],g.removeChild(ts),o.position="absolute";return l&&d&&(m=ns(g),m.time=sn.time,m.width=g[u]),Gt(f?_*s/h:_&&s?h/_*s:0)},Qn=function(e,t,i,r){var s;return Lh||ku(),t in Bn&&t!=="transform"&&(t=Bn[t],~t.indexOf(",")&&(t=t.split(",")[0])),hr[t]&&t!=="transform"?(s=ro(e,r),s=t!=="transformOrigin"?s[t]:s.svg?s.origin:El(ln(e,Xi))+" "+s.zOrigin+"px"):(s=e.style[t],(!s||s==="auto"||r||~(s+"").indexOf("calc("))&&(s=Ml[t]&&Ml[t](e,t,i)||ln(e,t)||Ap(e,t)||(t==="opacity"?1:0))),i&&!~(s+"").trim().indexOf(" ")?Nr(e,t,s,i)+i:s},wE=function(e,t,i,r){if(!i||i==="none"){var s=ua(t,e,1),a=s&&ln(e,s,1);a&&a!==i?(t=s,i=a):t==="borderColor"&&(i=ln(e,"borderTopColor"))}var o=new Wi(this._pt,e.style,t,0,1,im),l=0,c=0,u,h,f,d,_,g,m,p,x,y,M,T;if(o.b=i,o.e=r,i+="",r+="",r.substring(0,6)==="var(--"&&(r=ln(e,r.substring(4,r.indexOf(")")))),r==="auto"&&(g=e.style[t],e.style[t]=r,r=ln(e,t)||r,g?e.style[t]=g:Ir(e,t)),u=[i,r],Yp(u),i=u[0],r=u[1],f=i.match(Hs)||[],T=r.match(Hs)||[],T.length){for(;h=Hs.exec(r);)m=h[0],x=r.substring(l,h.index),_?_=(_+1)%5:(x.substr(-5)==="rgba("||x.substr(-5)==="hsla(")&&(_=1),m!==(g=f[c++]||"")&&(d=parseFloat(g)||0,M=g.substr((d+"").length),m.charAt(1)==="="&&(m=Ys(d,m)+M),p=parseFloat(m),y=m.substr((p+"").length),l=Hs.lastIndex-y.length,y||(y=y||cn.units[t]||M,l===r.length&&(r+=y,o.e+=y)),M!==y&&(d=Nr(e,t,g,y)||0),o._pt={_next:o._pt,p:x||c===1?x:",",s:d,c:p-d,m:_&&_<4||t==="zIndex"?Math.round:0});o.c=l<r.length?r.substring(l,r.length):""}else o.r=t==="display"&&r==="none"?am:sm;return Ep.test(r)&&(o.e=0),this._pt=o,o},ud={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},AE=function(e){var t=e.split(" "),i=t[0],r=t[1]||"50%";return(i==="top"||i==="bottom"||r==="left"||r==="right")&&(e=i,i=r,r=e),t[0]=ud[i]||i,t[1]=ud[r]||r,t.join(" ")},RE=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var i=t.t,r=i.style,s=t.u,a=i._gsap,o,l,c;if(s==="all"||s===!0)r.cssText="",l=1;else for(s=s.split(","),c=s.length;--c>-1;)o=s[c],hr[o]&&(l=1,o=o==="transformOrigin"?Xi:Ot),Ir(i,o);l&&(Ir(i,Ot),a&&(a.svg&&i.removeAttribute("transform"),r.scale=r.rotate=r.translate="none",ro(i,1),a.uncache=1,om(r)))}},Ml={clearProps:function(e,t,i,r,s){if(s.data!=="isFromStart"){var a=e._pt=new Wi(e._pt,t,i,0,0,RE);return a.u=r,a.pr=-10,a.tween=s,e._props.push(i),1}}},no=[1,0,0,1,0,0],fm={},dm=function(e){return e==="matrix(1, 0, 0, 1, 0, 0)"||e==="none"||!e},hd=function(e){var t=ln(e,Ot);return dm(t)?no:t.substr(7).match(Mp).map(Gt)},Nh=function(e,t){var i=e._gsap||ns(e),r=e.style,s=hd(e),a,o,l,c;return i.svg&&e.getAttribute("transform")?(l=e.transform.baseVal.consolidate().matrix,s=[l.a,l.b,l.c,l.d,l.e,l.f],s.join(",")==="1,0,0,1,0,0"?no:s):(s===no&&!e.offsetParent&&e!==$s&&!i.svg&&(l=r.display,r.display="block",a=e.parentNode,(!a||!e.offsetParent&&!e.getBoundingClientRect().width)&&(c=1,o=e.nextElementSibling,$s.appendChild(e)),s=hd(e),l?r.display=l:Ir(e,"display"),c&&(o?a.insertBefore(e,o):a?a.appendChild(e):$s.removeChild(e))),t&&s.length>6?[s[0],s[1],s[4],s[5],s[12],s[13]]:s)},Hu=function(e,t,i,r,s,a){var o=e._gsap,l=s||Nh(e,!0),c=o.xOrigin||0,u=o.yOrigin||0,h=o.xOffset||0,f=o.yOffset||0,d=l[0],_=l[1],g=l[2],m=l[3],p=l[4],x=l[5],y=t.split(" "),M=parseFloat(y[0])||0,T=parseFloat(y[1])||0,A,w,C,v;i?l!==no&&(w=d*m-_*g)&&(C=M*(m/w)+T*(-g/w)+(g*x-m*p)/w,v=M*(-_/w)+T*(d/w)-(d*x-_*p)/w,M=C,T=v):(A=um(e),M=A.x+(~y[0].indexOf("%")?M/100*A.width:M),T=A.y+(~(y[1]||y[0]).indexOf("%")?T/100*A.height:T)),r||r!==!1&&o.smooth?(p=M-c,x=T-u,o.xOffset=h+(p*d+x*g)-p,o.yOffset=f+(p*_+x*m)-x):o.xOffset=o.yOffset=0,o.xOrigin=M,o.yOrigin=T,o.smooth=!!r,o.origin=t,o.originIsAbsolute=!!i,e.style[Xi]="0px 0px",a&&(wr(a,o,"xOrigin",c,M),wr(a,o,"yOrigin",u,T),wr(a,o,"xOffset",h,o.xOffset),wr(a,o,"yOffset",f,o.yOffset)),e.setAttribute("data-svg-origin",M+" "+T)},ro=function(e,t){var i=e._gsap||new Zp(e);if("x"in i&&!t&&!i.uncache)return i;var r=e.style,s=i.scaleX<0,a="px",o="deg",l=getComputedStyle(e),c=ln(e,Xi)||"0",u,h,f,d,_,g,m,p,x,y,M,T,A,w,C,v,E,D,U,B,H,V,k,O,q,ne,P,re,Le,Oe,We,qe;return u=h=f=g=m=p=x=y=M=0,d=_=1,i.svg=!!(e.getCTM&&hm(e)),l.translate&&((l.translate!=="none"||l.scale!=="none"||l.rotate!=="none")&&(r[Ot]=(l.translate!=="none"?"translate3d("+(l.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(l.rotate!=="none"?"rotate("+l.rotate+") ":"")+(l.scale!=="none"?"scale("+l.scale.split(" ").join(",")+") ":"")+(l[Ot]!=="none"?l[Ot]:"")),r.scale=r.rotate=r.translate="none"),w=Nh(e,i.svg),i.svg&&(i.uncache?(q=e.getBBox(),c=i.xOrigin-q.x+"px "+(i.yOrigin-q.y)+"px",O=""):O=!t&&e.getAttribute("data-svg-origin"),Hu(e,O||c,!!O||i.originIsAbsolute,i.smooth!==!1,w)),T=i.xOrigin||0,A=i.yOrigin||0,w!==no&&(D=w[0],U=w[1],B=w[2],H=w[3],u=V=w[4],h=k=w[5],w.length===6?(d=Math.sqrt(D*D+U*U),_=Math.sqrt(H*H+B*B),g=D||U?Ns(U,D)*qr:0,x=B||H?Ns(B,H)*qr+g:0,x&&(_*=Math.abs(Math.cos(x*qs))),i.svg&&(u-=T-(T*D+A*B),h-=A-(T*U+A*H))):(qe=w[6],Oe=w[7],P=w[8],re=w[9],Le=w[10],We=w[11],u=w[12],h=w[13],f=w[14],C=Ns(qe,Le),m=C*qr,C&&(v=Math.cos(-C),E=Math.sin(-C),O=V*v+P*E,q=k*v+re*E,ne=qe*v+Le*E,P=V*-E+P*v,re=k*-E+re*v,Le=qe*-E+Le*v,We=Oe*-E+We*v,V=O,k=q,qe=ne),C=Ns(-B,Le),p=C*qr,C&&(v=Math.cos(-C),E=Math.sin(-C),O=D*v-P*E,q=U*v-re*E,ne=B*v-Le*E,We=H*E+We*v,D=O,U=q,B=ne),C=Ns(U,D),g=C*qr,C&&(v=Math.cos(C),E=Math.sin(C),O=D*v+U*E,q=V*v+k*E,U=U*v-D*E,k=k*v-V*E,D=O,V=q),m&&Math.abs(m)+Math.abs(g)>359.9&&(m=g=0,p=180-p),d=Gt(Math.sqrt(D*D+U*U+B*B)),_=Gt(Math.sqrt(k*k+qe*qe)),C=Ns(V,k),x=Math.abs(C)>2e-4?C*qr:0,M=We?1/(We<0?-We:We):0),i.svg&&(O=e.getAttribute("transform"),i.forceCSS=e.setAttribute("transform","")||!dm(ln(e,Ot)),O&&e.setAttribute("transform",O))),Math.abs(x)>90&&Math.abs(x)<270&&(s?(d*=-1,x+=g<=0?180:-180,g+=g<=0?180:-180):(_*=-1,x+=x<=0?180:-180)),t=t||i.uncache,i.x=u-((i.xPercent=u&&(!t&&i.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-u)?-50:0)))?e.offsetWidth*i.xPercent/100:0)+a,i.y=h-((i.yPercent=h&&(!t&&i.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-h)?-50:0)))?e.offsetHeight*i.yPercent/100:0)+a,i.z=f+a,i.scaleX=Gt(d),i.scaleY=Gt(_),i.rotation=Gt(g)+o,i.rotationX=Gt(m)+o,i.rotationY=Gt(p)+o,i.skewX=x+o,i.skewY=y+o,i.transformPerspective=M+a,(i.zOrigin=parseFloat(c.split(" ")[2])||!t&&i.zOrigin||0)&&(r[Xi]=El(c)),i.xOffset=i.yOffset=0,i.force3D=cn.force3D,i.renderTransform=i.svg?PE:cm?pm:CE,i.uncache=0,i},El=function(e){return(e=e.split(" "))[0]+" "+e[1]},yc=function(e,t,i){var r=yi(t);return Gt(parseFloat(t)+parseFloat(Nr(e,"x",i+"px",r)))+r},CE=function(e,t){t.z="0px",t.rotationY=t.rotationX="0deg",t.force3D=0,pm(e,t)},Xr="0deg",Ea="0px",Yr=") ",pm=function(e,t){var i=t||this,r=i.xPercent,s=i.yPercent,a=i.x,o=i.y,l=i.z,c=i.rotation,u=i.rotationY,h=i.rotationX,f=i.skewX,d=i.skewY,_=i.scaleX,g=i.scaleY,m=i.transformPerspective,p=i.force3D,x=i.target,y=i.zOrigin,M="",T=p==="auto"&&e&&e!==1||p===!0;if(y&&(h!==Xr||u!==Xr)){var A=parseFloat(u)*qs,w=Math.sin(A),C=Math.cos(A),v;A=parseFloat(h)*qs,v=Math.cos(A),a=yc(x,a,w*v*-y),o=yc(x,o,-Math.sin(A)*-y),l=yc(x,l,C*v*-y+y)}m!==Ea&&(M+="perspective("+m+Yr),(r||s)&&(M+="translate("+r+"%, "+s+"%) "),(T||a!==Ea||o!==Ea||l!==Ea)&&(M+=l!==Ea||T?"translate3d("+a+", "+o+", "+l+") ":"translate("+a+", "+o+Yr),c!==Xr&&(M+="rotate("+c+Yr),u!==Xr&&(M+="rotateY("+u+Yr),h!==Xr&&(M+="rotateX("+h+Yr),(f!==Xr||d!==Xr)&&(M+="skew("+f+", "+d+Yr),(_!==1||g!==1)&&(M+="scale("+_+", "+g+Yr),x.style[Ot]=M||"translate(0, 0)"},PE=function(e,t){var i=t||this,r=i.xPercent,s=i.yPercent,a=i.x,o=i.y,l=i.rotation,c=i.skewX,u=i.skewY,h=i.scaleX,f=i.scaleY,d=i.target,_=i.xOrigin,g=i.yOrigin,m=i.xOffset,p=i.yOffset,x=i.forceCSS,y=parseFloat(a),M=parseFloat(o),T,A,w,C,v;l=parseFloat(l),c=parseFloat(c),u=parseFloat(u),u&&(u=parseFloat(u),c+=u,l+=u),l||c?(l*=qs,c*=qs,T=Math.cos(l)*h,A=Math.sin(l)*h,w=Math.sin(l-c)*-f,C=Math.cos(l-c)*f,c&&(u*=qs,v=Math.tan(c-u),v=Math.sqrt(1+v*v),w*=v,C*=v,u&&(v=Math.tan(u),v=Math.sqrt(1+v*v),T*=v,A*=v)),T=Gt(T),A=Gt(A),w=Gt(w),C=Gt(C)):(T=h,C=f,A=w=0),(y&&!~(a+"").indexOf("px")||M&&!~(o+"").indexOf("px"))&&(y=Nr(d,"x",a,"px"),M=Nr(d,"y",o,"px")),(_||g||m||p)&&(y=Gt(y+_-(_*T+g*w)+m),M=Gt(M+g-(_*A+g*C)+p)),(r||s)&&(v=d.getBBox(),y=Gt(y+r/100*v.width),M=Gt(M+s/100*v.height)),v="matrix("+T+","+A+","+w+","+C+","+y+","+M+")",d.setAttribute("transform",v),x&&(d.style[Ot]=v)},DE=function(e,t,i,r,s){var a=360,o=hi(s),l=parseFloat(s)*(o&&~s.indexOf("rad")?qr:1),c=l-r,u=r+c+"deg",h,f;return o&&(h=s.split("_")[1],h==="short"&&(c%=a,c!==c%(a/2)&&(c+=c<0?a:-a)),h==="cw"&&c<0?c=(c+a*sd)%a-~~(c/a)*a:h==="ccw"&&c>0&&(c=(c-a*sd)%a-~~(c/a)*a)),e._pt=f=new Wi(e._pt,t,i,r,c,dE),f.e=u,f.u="deg",e._props.push(i),f},fd=function(e,t){for(var i in t)e[i]=t[i];return e},LE=function(e,t,i){var r=fd({},i._gsap),s="perspective,force3D,transformOrigin,svgOrigin",a=i.style,o,l,c,u,h,f,d,_;r.svg?(c=i.getAttribute("transform"),i.setAttribute("transform",""),a[Ot]=t,o=ro(i,1),Ir(i,Ot),i.setAttribute("transform",c)):(c=getComputedStyle(i)[Ot],a[Ot]=t,o=ro(i,1),a[Ot]=c);for(l in hr)c=r[l],u=o[l],c!==u&&s.indexOf(l)<0&&(d=yi(c),_=yi(u),h=d!==_?Nr(i,l,c,_):parseFloat(c),f=parseFloat(u),e._pt=new Wi(e._pt,o,l,h,f-h,Bu),e._pt.u=_||0,e._props.push(l));fd(o,r)};Gi("padding,margin,Width,Radius",function(n,e){var t="Top",i="Right",r="Bottom",s="Left",a=(e<3?[t,i,r,s]:[t+s,t+i,r+i,r+s]).map(function(o){return e<2?n+o:"border"+o+n});Ml[e>1?"border"+n:n]=function(o,l,c,u,h){var f,d;if(arguments.length<4)return f=a.map(function(_){return Qn(o,_,c)}),d=f.join(" "),d.split(f[0]).length===5?f[0]:d;f=(u+"").split(" "),d={},a.forEach(function(_,g){return d[_]=f[g]=f[g]||f[(g-1)/2|0]}),o.init(l,d,h)}});var mm={name:"css",register:ku,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,i,r,s){var a=this._props,o=e.style,l=i.vars.startAt,c,u,h,f,d,_,g,m,p,x,y,M,T,A,w,C,v;Lh||ku(),this.styles=this.styles||lm(e),C=this.styles.props,this.tween=i;for(g in t)if(g!=="autoRound"&&(u=t[g],!(en[g]&&jp(g,t,i,r,e,s)))){if(d=typeof u,_=Ml[g],d==="function"&&(u=u.call(i,r,e,s),d=typeof u),d==="string"&&~u.indexOf("random(")&&(u=eo(u)),_)_(this,e,g,u,i)&&(w=1);else if(g.substr(0,2)==="--")c=(getComputedStyle(e).getPropertyValue(g)+"").trim(),u+="",Pr.lastIndex=0,Pr.test(c)||(m=yi(c),p=yi(u),p?m!==p&&(c=Nr(e,g,c,p)+p):m&&(u+=m)),this.add(o,"setProperty",c,u,r,s,0,0,g),a.push(g),C.push(g,0,o[g]);else if(d!=="undefined"){if(l&&g in l?(c=typeof l[g]=="function"?l[g].call(i,r,e,s):l[g],hi(c)&&~c.indexOf("random(")&&(c=eo(c)),yi(c+"")||c==="auto"||(c+=cn.units[g]||yi(Qn(e,g))||""),(c+"").charAt(1)==="="&&(c=Qn(e,g))):c=Qn(e,g),f=parseFloat(c),x=d==="string"&&u.charAt(1)==="="&&u.substr(0,2),x&&(u=u.substr(2)),h=parseFloat(u),g in Bn&&(g==="autoAlpha"&&(f===1&&Qn(e,"visibility")==="hidden"&&h&&(f=0),C.push("visibility",0,o.visibility),wr(this,o,"visibility",f?"inherit":"hidden",h?"inherit":"hidden",!h)),g!=="scale"&&g!=="transform"&&(g=Bn[g],~g.indexOf(",")&&(g=g.split(",")[0]))),y=g in hr,y){if(this.styles.save(g),v=u,d==="string"&&u.substring(0,6)==="var(--"){if(u=ln(e,u.substring(4,u.indexOf(")"))),u.substring(0,5)==="calc("){var E=e.style.perspective;e.style.perspective=u,u=ln(e,"perspective"),E?e.style.perspective=E:Ir(e,"perspective")}h=parseFloat(u)}if(M||(T=e._gsap,T.renderTransform&&!t.parseTransform||ro(e,t.parseTransform),A=t.smoothOrigin!==!1&&T.smooth,M=this._pt=new Wi(this._pt,o,Ot,0,1,T.renderTransform,T,0,-1),M.dep=1),g==="scale")this._pt=new Wi(this._pt,T,"scaleY",T.scaleY,(x?Ys(T.scaleY,x+h):h)-T.scaleY||0,Bu),this._pt.u=0,a.push("scaleY",g),g+="X";else if(g==="transformOrigin"){C.push(Xi,0,o[Xi]),u=AE(u),T.svg?Hu(e,u,0,A,0,this):(p=parseFloat(u.split(" ")[2])||0,p!==T.zOrigin&&wr(this,T,"zOrigin",T.zOrigin,p),wr(this,o,g,El(c),El(u)));continue}else if(g==="svgOrigin"){Hu(e,u,1,A,0,this);continue}else if(g in fm){DE(this,T,g,f,x?Ys(f,x+u):u);continue}else if(g==="smoothOrigin"){wr(this,T,"smooth",T.smooth,u);continue}else if(g==="force3D"){T[g]=u;continue}else if(g==="transform"){LE(this,u,e);continue}}else g in o||(g=ua(g)||g);if(y||(h||h===0)&&(f||f===0)&&!fE.test(u)&&g in o)m=(c+"").substr((f+"").length),h||(h=0),p=yi(u)||(g in cn.units?cn.units[g]:m),m!==p&&(f=Nr(e,g,c,p)),this._pt=new Wi(this._pt,y?T:o,g,f,(x?Ys(f,x+h):h)-f,!y&&(p==="px"||g==="zIndex")&&t.autoRound!==!1?gE:Bu),this._pt.u=p||0,y&&v!==u?(this._pt.b=c,this._pt.e=v,this._pt.r=mE):m!==p&&p!=="%"&&(this._pt.b=c,this._pt.r=pE);else if(g in o)wE.call(this,e,g,c,x?x+u:u);else if(g in e)this.add(e,g,c||e[g],x?x+u:u,r,s);else if(g!=="parseTransform"){Eh(g,u);continue}y||(g in o?C.push(g,0,o[g]):typeof e[g]=="function"?C.push(g,2,e[g]()):C.push(g,1,c||e[g])),a.push(g)}}w&&nm(this)},render:function(e,t){if(t.tween._time||!Uh())for(var i=t._pt;i;)i.r(e,i.d),i=i._next;else t.styles.revert()},get:Qn,aliases:Bn,getSetter:function(e,t,i){var r=Bn[t];return r&&r.indexOf(",")<0&&(t=r),t in hr&&t!==Xi&&(e._gsap.x||Qn(e,"x"))?i&&rd===i?t==="scale"?SE:xE:(rd=i||{})&&(t==="scale"?ME:EE):e.style&&!xh(e.style[t])?_E:~t.indexOf("-")?vE:Ph(e,t)},core:{_removeProperty:Ir,_getMatrix:Nh}};Yi.utils.checkPrefix=ua;Yi.core.getStyleSaver=lm;(function(n,e,t,i){var r=Gi(n+","+e+","+t,function(s){hr[s]=1});Gi(e,function(s){cn.units[s]="deg",fm[s]=1}),Bn[r[13]]=n+","+e,Gi(i,function(s){var a=s.split(":");Bn[a[1]]=r[a[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");Gi("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(n){cn.units[n]="px"});Yi.registerPlugin(mm);var nr=Yi.registerPlugin(mm)||Yi;nr.core.Tween;function UE(n,e){for(var t=0;t<e.length;t++){var i=e[t];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(n,i.key,i)}}function IE(n,e,t){return e&&UE(n.prototype,e),n}var pi,sl,an,Ar,Rr,Ks,gm,Kr,za,_m,rr,Tn,vm,xm=function(){return pi||typeof window<"u"&&(pi=window.gsap)&&pi.registerPlugin&&pi},Sm=1,Gs=[],st=[],Vn=[],ka=Date.now,Vu=function(e,t){return t},NE=function(){var e=za.core,t=e.bridge||{},i=e._scrollers,r=e._proxies;i.push.apply(i,st),r.push.apply(r,Vn),st=i,Vn=r,Vu=function(a,o){return t[a](o)}},Dr=function(e,t){return~Vn.indexOf(e)&&Vn[Vn.indexOf(e)+1][t]},Ha=function(e){return!!~_m.indexOf(e)},Ci=function(e,t,i,r,s){return e.addEventListener(t,i,{passive:r!==!1,capture:!!s})},Ri=function(e,t,i,r){return e.removeEventListener(t,i,!!r)},Oo="scrollLeft",Bo="scrollTop",Gu=function(){return rr&&rr.isPressed||st.cache++},yl=function(e,t){var i=function r(s){if(s||s===0){Sm&&(an.history.scrollRestoration="manual");var a=rr&&rr.isPressed;s=r.v=Math.round(s)||(rr&&rr.iOS?1:0),e(s),r.cacheID=st.cache,a&&Vu("ss",s)}else(t||st.cache!==r.cacheID||Vu("ref"))&&(r.cacheID=st.cache,r.v=e());return r.v+r.offset};return i.offset=0,e&&i},Ni={s:Oo,p:"left",p2:"Left",os:"right",os2:"Right",d:"width",d2:"Width",a:"x",sc:yl(function(n){return arguments.length?an.scrollTo(n,ei.sc()):an.pageXOffset||Ar[Oo]||Rr[Oo]||Ks[Oo]||0})},ei={s:Bo,p:"top",p2:"Top",os:"bottom",os2:"Bottom",d:"height",d2:"Height",a:"y",op:Ni,sc:yl(function(n){return arguments.length?an.scrollTo(Ni.sc(),n):an.pageYOffset||Ar[Bo]||Rr[Bo]||Ks[Bo]||0})},Hi=function(e,t){return(t&&t._ctx&&t._ctx.selector||pi.utils.toArray)(e)[0]||(typeof e=="string"&&pi.config().nullTargetWarn!==!1?console.warn("Element not found:",e):null)},FE=function(e,t){for(var i=t.length;i--;)if(t[i]===e||t[i].contains(e))return!0;return!1},Fr=function(e,t){var i=t.s,r=t.sc;Ha(e)&&(e=Ar.scrollingElement||Rr);var s=st.indexOf(e),a=r===ei.sc?1:2;!~s&&(s=st.push(e)-1),st[s+a]||Ci(e,"scroll",Gu);var o=st[s+a],l=o||(st[s+a]=yl(Dr(e,i),!0)||(Ha(e)?r:yl(function(c){return arguments.length?e[i]=c:e[i]})));return l.target=e,o||(l.smooth=pi.getProperty(e,"scrollBehavior")==="smooth"),l},Wu=function(e,t,i){var r=e,s=e,a=ka(),o=a,l=t||50,c=Math.max(500,l*3),u=function(_,g){var m=ka();g||m-a>l?(s=r,r=_,o=a,a=m):i?r+=_:r=s+(_-s)/(m-o)*(a-o)},h=function(){s=r=i?0:r,o=a=0},f=function(_){var g=o,m=s,p=ka();return(_||_===0)&&_!==r&&u(_),a===o||p-o>c?0:(r+(i?m:-m))/((i?p:a)-g)*1e3};return{update:u,reset:h,getVelocity:f}},ya=function(e,t){return t&&!e._gsapAllow&&e.preventDefault(),e.changedTouches?e.changedTouches[0]:e},dd=function(e){var t=Math.max.apply(Math,e),i=Math.min.apply(Math,e);return Math.abs(t)>=Math.abs(i)?t:i},Mm=function(){za=pi.core.globals().ScrollTrigger,za&&za.core&&NE()},Em=function(e){return pi=e||xm(),!sl&&pi&&typeof document<"u"&&document.body&&(an=window,Ar=document,Rr=Ar.documentElement,Ks=Ar.body,_m=[an,Ar,Rr,Ks],pi.utils.clamp,vm=pi.core.context||function(){},Kr="onpointerenter"in Ks?"pointer":"mouse",gm=Wt.isTouch=an.matchMedia&&an.matchMedia("(hover: none), (pointer: coarse)").matches?1:"ontouchstart"in an||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0?2:0,Tn=Wt.eventTypes=("ontouchstart"in Rr?"touchstart,touchmove,touchcancel,touchend":"onpointerdown"in Rr?"pointerdown,pointermove,pointercancel,pointerup":"mousedown,mousemove,mouseup,mouseup").split(","),setTimeout(function(){return Sm=0},500),Mm(),sl=1),sl};Ni.op=ei;st.cache=0;var Wt=(function(){function n(t){this.init(t)}var e=n.prototype;return e.init=function(i){sl||Em(pi)||console.warn("Please gsap.registerPlugin(Observer)"),za||Mm();var r=i.tolerance,s=i.dragMinimum,a=i.type,o=i.target,l=i.lineHeight,c=i.debounce,u=i.preventDefault,h=i.onStop,f=i.onStopDelay,d=i.ignore,_=i.wheelSpeed,g=i.event,m=i.onDragStart,p=i.onDragEnd,x=i.onDrag,y=i.onPress,M=i.onRelease,T=i.onRight,A=i.onLeft,w=i.onUp,C=i.onDown,v=i.onChangeX,E=i.onChangeY,D=i.onChange,U=i.onToggleX,B=i.onToggleY,H=i.onHover,V=i.onHoverEnd,k=i.onMove,O=i.ignoreCheck,q=i.isNormalizer,ne=i.onGestureStart,P=i.onGestureEnd,re=i.onWheel,Le=i.onEnable,Oe=i.onDisable,We=i.onClick,qe=i.scrollSpeed,K=i.capture,J=i.allowClicks,fe=i.lockAxis,Ce=i.onLockAxis;this.target=o=Hi(o)||Rr,this.vars=i,d&&(d=pi.utils.toArray(d)),r=r||1e-9,s=s||0,_=_||1,qe=qe||1,a=a||"wheel,touch,pointer",c=c!==!1,l||(l=parseFloat(an.getComputedStyle(Ks).lineHeight)||22);var Se,ke,ut,be,Be,Ke,Ie,G=this,I=0,vt=0,Qe=i.passive||!u&&i.passive!==!1,ze=Fr(o,Ni),Me=Fr(o,ei),R=ze(),S=Me(),N=~a.indexOf("touch")&&!~a.indexOf("pointer")&&Tn[0]==="pointerdown",Z=Ha(o),j=o.ownerDocument||Ar,$=[0,0,0],xe=[0,0,0],se=0,Te=function(){return se=ka()},ye=function(Re,Ze){return(G.event=Re)&&d&&FE(Re.target,d)||Ze&&N&&Re.pointerType!=="touch"||O&&O(Re,Ze)},ie=function(){G._vx.reset(),G._vy.reset(),ke.pause(),h&&h(G)},ae=function(){var Re=G.deltaX=dd($),Ze=G.deltaY=dd(xe),pe=Math.abs(Re)>=r,Xe=Math.abs(Ze)>=r;D&&(pe||Xe)&&D(G,Re,Ze,$,xe),pe&&(T&&G.deltaX>0&&T(G),A&&G.deltaX<0&&A(G),v&&v(G),U&&G.deltaX<0!=I<0&&U(G),I=G.deltaX,$[0]=$[1]=$[2]=0),Xe&&(C&&G.deltaY>0&&C(G),w&&G.deltaY<0&&w(G),E&&E(G),B&&G.deltaY<0!=vt<0&&B(G),vt=G.deltaY,xe[0]=xe[1]=xe[2]=0),(be||ut)&&(k&&k(G),ut&&(m&&ut===1&&m(G),x&&x(G),ut=0),be=!1),Ke&&!(Ke=!1)&&Ce&&Ce(G),Be&&(re(G),Be=!1),Se=0},Ee=function(Re,Ze,pe){$[pe]+=Re,xe[pe]+=Ze,G._vx.update(Re),G._vy.update(Ze),c?Se||(Se=requestAnimationFrame(ae)):ae()},we=function(Re,Ze){fe&&!Ie&&(G.axis=Ie=Math.abs(Re)>Math.abs(Ze)?"x":"y",Ke=!0),Ie!=="y"&&($[2]+=Re,G._vx.update(Re,!0)),Ie!=="x"&&(xe[2]+=Ze,G._vy.update(Ze,!0)),c?Se||(Se=requestAnimationFrame(ae)):ae()},oe=function(Re){if(!ye(Re,1)){Re=ya(Re,u);var Ze=Re.clientX,pe=Re.clientY,Xe=Ze-G.x,De=pe-G.y,Ye=G.isDragging;G.x=Ze,G.y=pe,(Ye||(Xe||De)&&(Math.abs(G.startX-Ze)>=s||Math.abs(G.startY-pe)>=s))&&(ut||(ut=Ye?2:1),Ye||(G.isDragging=!0),we(Xe,De))}},Ge=G.onPress=function(ge){ye(ge,1)||ge&&ge.button||(G.axis=Ie=null,ke.pause(),G.isPressed=!0,ge=ya(ge),I=vt=0,G.startX=G.x=ge.clientX,G.startY=G.y=ge.clientY,G._vx.reset(),G._vy.reset(),Ci(q?o:j,Tn[1],oe,Qe,!0),G.deltaX=G.deltaY=0,y&&y(G))},L=G.onRelease=function(ge){if(!ye(ge,1)){Ri(q?o:j,Tn[1],oe,!0);var Re=!isNaN(G.y-G.startY),Ze=G.isDragging,pe=Ze&&(Math.abs(G.x-G.startX)>3||Math.abs(G.y-G.startY)>3),Xe=ya(ge);!pe&&Re&&(G._vx.reset(),G._vy.reset(),u&&J&&pi.delayedCall(.08,function(){if(ka()-se>300&&!ge.defaultPrevented){if(ge.target.click)ge.target.click();else if(j.createEvent){var De=j.createEvent("MouseEvents");De.initMouseEvent("click",!0,!0,an,1,Xe.screenX,Xe.screenY,Xe.clientX,Xe.clientY,!1,!1,!1,!1,0,null),ge.target.dispatchEvent(De)}}})),G.isDragging=G.isGesturing=G.isPressed=!1,h&&Ze&&!q&&ke.restart(!0),ut&&ae(),p&&Ze&&p(G),M&&M(G,pe)}},ue=function(Re){return Re.touches&&Re.touches.length>1&&(G.isGesturing=!0)&&ne(Re,G.isDragging)},te=function(){return(G.isGesturing=!1)||P(G)},he=function(Re){if(!ye(Re)){var Ze=ze(),pe=Me();Ee((Ze-R)*qe,(pe-S)*qe,1),R=Ze,S=pe,h&&ke.restart(!0)}},ee=function(Re){if(!ye(Re)){Re=ya(Re,u),re&&(Be=!0);var Ze=(Re.deltaMode===1?l:Re.deltaMode===2?an.innerHeight:1)*_;Ee(Re.deltaX*Ze,Re.deltaY*Ze,0),h&&!q&&ke.restart(!0)}},Q=function(Re){if(!ye(Re)){var Ze=Re.clientX,pe=Re.clientY,Xe=Ze-G.x,De=pe-G.y;G.x=Ze,G.y=pe,be=!0,h&&ke.restart(!0),(Xe||De)&&we(Xe,De)}},ce=function(Re){G.event=Re,H(G)},Ue=function(Re){G.event=Re,V(G)},dt=function(Re){return ye(Re)||ya(Re,u)&&We(G)};ke=G._dc=pi.delayedCall(f||.25,ie).pause(),G.deltaX=G.deltaY=0,G._vx=Wu(0,50,!0),G._vy=Wu(0,50,!0),G.scrollX=ze,G.scrollY=Me,G.isDragging=G.isGesturing=G.isPressed=!1,vm(this),G.enable=function(ge){return G.isEnabled||(Ci(Z?j:o,"scroll",Gu),a.indexOf("scroll")>=0&&Ci(Z?j:o,"scroll",he,Qe,K),a.indexOf("wheel")>=0&&Ci(o,"wheel",ee,Qe,K),(a.indexOf("touch")>=0&&gm||a.indexOf("pointer")>=0)&&(Ci(o,Tn[0],Ge,Qe,K),Ci(j,Tn[2],L),Ci(j,Tn[3],L),J&&Ci(o,"click",Te,!0,!0),We&&Ci(o,"click",dt),ne&&Ci(j,"gesturestart",ue),P&&Ci(j,"gestureend",te),H&&Ci(o,Kr+"enter",ce),V&&Ci(o,Kr+"leave",Ue),k&&Ci(o,Kr+"move",Q)),G.isEnabled=!0,G.isDragging=G.isGesturing=G.isPressed=be=ut=!1,G._vx.reset(),G._vy.reset(),R=ze(),S=Me(),ge&&ge.type&&Ge(ge),Le&&Le(G)),G},G.disable=function(){G.isEnabled&&(Gs.filter(function(ge){return ge!==G&&Ha(ge.target)}).length||Ri(Z?j:o,"scroll",Gu),G.isPressed&&(G._vx.reset(),G._vy.reset(),Ri(q?o:j,Tn[1],oe,!0)),Ri(Z?j:o,"scroll",he,K),Ri(o,"wheel",ee,K),Ri(o,Tn[0],Ge,K),Ri(j,Tn[2],L),Ri(j,Tn[3],L),Ri(o,"click",Te,!0),Ri(o,"click",dt),Ri(j,"gesturestart",ue),Ri(j,"gestureend",te),Ri(o,Kr+"enter",ce),Ri(o,Kr+"leave",Ue),Ri(o,Kr+"move",Q),G.isEnabled=G.isPressed=G.isDragging=!1,Oe&&Oe(G))},G.kill=G.revert=function(){G.disable();var ge=Gs.indexOf(G);ge>=0&&Gs.splice(ge,1),rr===G&&(rr=0)},Gs.push(G),q&&Ha(o)&&(rr=G),G.enable(g)},IE(n,[{key:"velocityX",get:function(){return this._vx.getVelocity()}},{key:"velocityY",get:function(){return this._vy.getVelocity()}}]),n})();Wt.version="3.14.2";Wt.create=function(n){return new Wt(n)};Wt.register=Em;Wt.getAll=function(){return Gs.slice()};Wt.getById=function(n){return Gs.filter(function(e){return e.vars.id===n})[0]};xm()&&pi.registerPlugin(Wt);var Ae,Bs,rt,Dt,nn,xt,Fh,bl,so,Va,Pa,zo,Mi,Nl,Xu,Li,pd,md,zs,ym,bc,bm,Di,Yu,Tm,wm,Mr,$u,Oh,Zs,Bh,Ga,qu,Tc,ko=1,Ei=Date.now,wc=Ei(),Mn=0,Da=0,gd=function(e,t,i){var r=Qi(e)&&(e.substr(0,6)==="clamp("||e.indexOf("max")>-1);return i["_"+t+"Clamp"]=r,r?e.substr(6,e.length-7):e},_d=function(e,t){return t&&(!Qi(e)||e.substr(0,6)!=="clamp(")?"clamp("+e+")":e},OE=function n(){return Da&&requestAnimationFrame(n)},vd=function(){return Nl=1},xd=function(){return Nl=0},Ln=function(e){return e},La=function(e){return Math.round(e*1e5)/1e5||0},Am=function(){return typeof window<"u"},Rm=function(){return Ae||Am()&&(Ae=window.gsap)&&Ae.registerPlugin&&Ae},ds=function(e){return!!~Fh.indexOf(e)},Cm=function(e){return(e==="Height"?Bh:rt["inner"+e])||nn["client"+e]||xt["client"+e]},Pm=function(e){return Dr(e,"getBoundingClientRect")||(ds(e)?function(){return ul.width=rt.innerWidth,ul.height=Bh,ul}:function(){return er(e)})},BE=function(e,t,i){var r=i.d,s=i.d2,a=i.a;return(a=Dr(e,"getBoundingClientRect"))?function(){return a()[r]}:function(){return(t?Cm(s):e["client"+s])||0}},zE=function(e,t){return!t||~Vn.indexOf(e)?Pm(e):function(){return ul}},zn=function(e,t){var i=t.s,r=t.d2,s=t.d,a=t.a;return Math.max(0,(i="scroll"+r)&&(a=Dr(e,i))?a()-Pm(e)()[s]:ds(e)?(nn[i]||xt[i])-Cm(r):e[i]-e["offset"+r])},Ho=function(e,t){for(var i=0;i<zs.length;i+=3)(!t||~t.indexOf(zs[i+1]))&&e(zs[i],zs[i+1],zs[i+2])},Qi=function(e){return typeof e=="string"},bi=function(e){return typeof e=="function"},Ua=function(e){return typeof e=="number"},Zr=function(e){return typeof e=="object"},ba=function(e,t,i){return e&&e.progress(t?0:1)&&i&&e.pause()},Ac=function(e,t){if(e.enabled){var i=e._ctx?e._ctx.add(function(){return t(e)}):t(e);i&&i.totalTime&&(e.callbackAnimation=i)}},Fs=Math.abs,Dm="left",Lm="top",zh="right",kh="bottom",os="width",ls="height",Wa="Right",Xa="Left",Ya="Top",$a="Bottom",$t="padding",gn="margin",ha="Width",Hh="Height",Qt="px",_n=function(e){return rt.getComputedStyle(e)},kE=function(e){var t=_n(e).position;e.style.position=t==="absolute"||t==="fixed"?t:"relative"},Sd=function(e,t){for(var i in t)i in e||(e[i]=t[i]);return e},er=function(e,t){var i=t&&_n(e)[Xu]!=="matrix(1, 0, 0, 1, 0, 0)"&&Ae.to(e,{x:0,y:0,xPercent:0,yPercent:0,rotation:0,rotationX:0,rotationY:0,scale:1,skewX:0,skewY:0}).progress(1),r=e.getBoundingClientRect();return i&&i.progress(0).kill(),r},Tl=function(e,t){var i=t.d2;return e["offset"+i]||e["client"+i]||0},Um=function(e){var t=[],i=e.labels,r=e.duration(),s;for(s in i)t.push(i[s]/r);return t},HE=function(e){return function(t){return Ae.utils.snap(Um(e),t)}},Vh=function(e){var t=Ae.utils.snap(e),i=Array.isArray(e)&&e.slice(0).sort(function(r,s){return r-s});return i?function(r,s,a){a===void 0&&(a=.001);var o;if(!s)return t(r);if(s>0){for(r-=a,o=0;o<i.length;o++)if(i[o]>=r)return i[o];return i[o-1]}else for(o=i.length,r+=a;o--;)if(i[o]<=r)return i[o];return i[0]}:function(r,s,a){a===void 0&&(a=.001);var o=t(r);return!s||Math.abs(o-r)<a||o-r<0==s<0?o:t(s<0?r-e:r+e)}},VE=function(e){return function(t,i){return Vh(Um(e))(t,i.direction)}},Vo=function(e,t,i,r){return i.split(",").forEach(function(s){return e(t,s,r)})},oi=function(e,t,i,r,s){return e.addEventListener(t,i,{passive:!r,capture:!!s})},ai=function(e,t,i,r){return e.removeEventListener(t,i,!!r)},Go=function(e,t,i){i=i&&i.wheelHandler,i&&(e(t,"wheel",i),e(t,"touchmove",i))},Md={startColor:"green",endColor:"red",indent:0,fontSize:"16px",fontWeight:"normal"},Wo={toggleActions:"play",anticipatePin:0},wl={top:0,left:0,center:.5,bottom:1,right:1},al=function(e,t){if(Qi(e)){var i=e.indexOf("="),r=~i?+(e.charAt(i-1)+1)*parseFloat(e.substr(i+1)):0;~i&&(e.indexOf("%")>i&&(r*=t/100),e=e.substr(0,i-1)),e=r+(e in wl?wl[e]*t:~e.indexOf("%")?parseFloat(e)*t/100:parseFloat(e)||0)}return e},Xo=function(e,t,i,r,s,a,o,l){var c=s.startColor,u=s.endColor,h=s.fontSize,f=s.indent,d=s.fontWeight,_=Dt.createElement("div"),g=ds(i)||Dr(i,"pinType")==="fixed",m=e.indexOf("scroller")!==-1,p=g?xt:i,x=e.indexOf("start")!==-1,y=x?c:u,M="border-color:"+y+";font-size:"+h+";color:"+y+";font-weight:"+d+";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";return M+="position:"+((m||l)&&g?"fixed;":"absolute;"),(m||l||!g)&&(M+=(r===ei?zh:kh)+":"+(a+parseFloat(f))+"px;"),o&&(M+="box-sizing:border-box;text-align:left;width:"+o.offsetWidth+"px;"),_._isStart=x,_.setAttribute("class","gsap-marker-"+e+(t?" marker-"+t:"")),_.style.cssText=M,_.innerText=t||t===0?e+"-"+t:e,p.children[0]?p.insertBefore(_,p.children[0]):p.appendChild(_),_._offset=_["offset"+r.op.d2],ol(_,0,r,x),_},ol=function(e,t,i,r){var s={display:"block"},a=i[r?"os2":"p2"],o=i[r?"p2":"os2"];e._isFlipped=r,s[i.a+"Percent"]=r?-100:0,s[i.a]=r?"1px":0,s["border"+a+ha]=1,s["border"+o+ha]=0,s[i.p]=t+"px",Ae.set(e,s)},et=[],Ku={},ao,Ed=function(){return Ei()-Mn>34&&(ao||(ao=requestAnimationFrame(ar)))},Os=function(){(!Di||!Di.isPressed||Di.startX>xt.clientWidth)&&(st.cache++,Di?ao||(ao=requestAnimationFrame(ar)):ar(),Mn||ms("scrollStart"),Mn=Ei())},Rc=function(){wm=rt.innerWidth,Tm=rt.innerHeight},Ia=function(e){st.cache++,(e===!0||!Mi&&!bm&&!Dt.fullscreenElement&&!Dt.webkitFullscreenElement&&(!Yu||wm!==rt.innerWidth||Math.abs(rt.innerHeight-Tm)>rt.innerHeight*.25))&&bl.restart(!0)},ps={},GE=[],Im=function n(){return ai(at,"scrollEnd",n)||is(!0)},ms=function(e){return ps[e]&&ps[e].map(function(t){return t()})||GE},Ji=[],Nm=function(e){for(var t=0;t<Ji.length;t+=5)(!e||Ji[t+4]&&Ji[t+4].query===e)&&(Ji[t].style.cssText=Ji[t+1],Ji[t].getBBox&&Ji[t].setAttribute("transform",Ji[t+2]||""),Ji[t+3].uncache=1)},Fm=function(){return st.forEach(function(e){return bi(e)&&++e.cacheID&&(e.rec=e())})},Gh=function(e,t){var i;for(Li=0;Li<et.length;Li++)i=et[Li],i&&(!t||i._ctx===t)&&(e?i.kill(1):i.revert(!0,!0));Ga=!0,t&&Nm(t),t||ms("revert")},Om=function(e,t){st.cache++,(t||!Ui)&&st.forEach(function(i){return bi(i)&&i.cacheID++&&(i.rec=0)}),Qi(e)&&(rt.history.scrollRestoration=Oh=e)},Ui,cs=0,yd,WE=function(){if(yd!==cs){var e=yd=cs;requestAnimationFrame(function(){return e===cs&&is(!0)})}},Bm=function(){xt.appendChild(Zs),Bh=!Di&&Zs.offsetHeight||rt.innerHeight,xt.removeChild(Zs)},bd=function(e){return so(".gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end").forEach(function(t){return t.style.display=e?"none":"block"})},is=function(e,t){if(nn=Dt.documentElement,xt=Dt.body,Fh=[rt,Dt,nn,xt],Mn&&!e&&!Ga){oi(at,"scrollEnd",Im);return}Bm(),Ui=at.isRefreshing=!0,Ga||Fm();var i=ms("refreshInit");ym&&at.sort(),t||Gh(),st.forEach(function(r){bi(r)&&(r.smooth&&(r.target.style.scrollBehavior="auto"),r(0))}),et.slice(0).forEach(function(r){return r.refresh()}),Ga=!1,et.forEach(function(r){if(r._subPinOffset&&r.pin){var s=r.vars.horizontal?"offsetWidth":"offsetHeight",a=r.pin[s];r.revert(!0,1),r.adjustPinSpacing(r.pin[s]-a),r.refresh()}}),qu=1,bd(!0),et.forEach(function(r){var s=zn(r.scroller,r._dir),a=r.vars.end==="max"||r._endClamp&&r.end>s,o=r._startClamp&&r.start>=s;(a||o)&&r.setPositions(o?s-1:r.start,a?Math.max(o?s:r.start+1,s):r.end,!0)}),bd(!1),qu=0,i.forEach(function(r){return r&&r.render&&r.render(-1)}),st.forEach(function(r){bi(r)&&(r.smooth&&requestAnimationFrame(function(){return r.target.style.scrollBehavior="smooth"}),r.rec&&r(r.rec))}),Om(Oh,1),bl.pause(),cs++,Ui=2,ar(2),et.forEach(function(r){return bi(r.vars.onRefresh)&&r.vars.onRefresh(r)}),Ui=at.isRefreshing=!1,ms("refresh")},Zu=0,ll=1,qa,ar=function(e){if(e===2||!Ui&&!Ga){at.isUpdating=!0,qa&&qa.update(0);var t=et.length,i=Ei(),r=i-wc>=50,s=t&&et[0].scroll();if(ll=Zu>s?-1:1,Ui||(Zu=s),r&&(Mn&&!Nl&&i-Mn>200&&(Mn=0,ms("scrollEnd")),Pa=wc,wc=i),ll<0){for(Li=t;Li-- >0;)et[Li]&&et[Li].update(0,r);ll=1}else for(Li=0;Li<t;Li++)et[Li]&&et[Li].update(0,r);at.isUpdating=!1}ao=0},ju=[Dm,Lm,kh,zh,gn+$a,gn+Wa,gn+Ya,gn+Xa,"display","flexShrink","float","zIndex","gridColumnStart","gridColumnEnd","gridRowStart","gridRowEnd","gridArea","justifySelf","alignSelf","placeSelf","order"],cl=ju.concat([os,ls,"boxSizing","max"+ha,"max"+Hh,"position",gn,$t,$t+Ya,$t+Wa,$t+$a,$t+Xa]),XE=function(e,t,i){js(i);var r=e._gsap;if(r.spacerIsNative)js(r.spacerState);else if(e._gsap.swappedIn){var s=t.parentNode;s&&(s.insertBefore(e,t),s.removeChild(t))}e._gsap.swappedIn=!1},Cc=function(e,t,i,r){if(!e._gsap.swappedIn){for(var s=ju.length,a=t.style,o=e.style,l;s--;)l=ju[s],a[l]=i[l];a.position=i.position==="absolute"?"absolute":"relative",i.display==="inline"&&(a.display="inline-block"),o[kh]=o[zh]="auto",a.flexBasis=i.flexBasis||"auto",a.overflow="visible",a.boxSizing="border-box",a[os]=Tl(e,Ni)+Qt,a[ls]=Tl(e,ei)+Qt,a[$t]=o[gn]=o[Lm]=o[Dm]="0",js(r),o[os]=o["max"+ha]=i[os],o[ls]=o["max"+Hh]=i[ls],o[$t]=i[$t],e.parentNode!==t&&(e.parentNode.insertBefore(t,e),t.appendChild(e)),e._gsap.swappedIn=!0}},YE=/([A-Z])/g,js=function(e){if(e){var t=e.t.style,i=e.length,r=0,s,a;for((e.t._gsap||Ae.core.getCache(e.t)).uncache=1;r<i;r+=2)a=e[r+1],s=e[r],a?t[s]=a:t[s]&&t.removeProperty(s.replace(YE,"-$1").toLowerCase())}},Yo=function(e){for(var t=cl.length,i=e.style,r=[],s=0;s<t;s++)r.push(cl[s],i[cl[s]]);return r.t=e,r},$E=function(e,t,i){for(var r=[],s=e.length,a=i?8:0,o;a<s;a+=2)o=e[a],r.push(o,o in t?t[o]:e[a+1]);return r.t=e.t,r},ul={left:0,top:0},Td=function(e,t,i,r,s,a,o,l,c,u,h,f,d,_){bi(e)&&(e=e(l)),Qi(e)&&e.substr(0,3)==="max"&&(e=f+(e.charAt(4)==="="?al("0"+e.substr(3),i):0));var g=d?d.time():0,m,p,x;if(d&&d.seek(0),isNaN(e)||(e=+e),Ua(e))d&&(e=Ae.utils.mapRange(d.scrollTrigger.start,d.scrollTrigger.end,0,f,e)),o&&ol(o,i,r,!0);else{bi(t)&&(t=t(l));var y=(e||"0").split(" "),M,T,A,w;x=Hi(t,l)||xt,M=er(x)||{},(!M||!M.left&&!M.top)&&_n(x).display==="none"&&(w=x.style.display,x.style.display="block",M=er(x),w?x.style.display=w:x.style.removeProperty("display")),T=al(y[0],M[r.d]),A=al(y[1]||"0",i),e=M[r.p]-c[r.p]-u+T+s-A,o&&ol(o,A,r,i-A<20||o._isStart&&A>20),i-=i-A}if(_&&(l[_]=e||-.001,e<0&&(e=0)),a){var C=e+i,v=a._isStart;m="scroll"+r.d2,ol(a,C,r,v&&C>20||!v&&(h?Math.max(xt[m],nn[m]):a.parentNode[m])<=C+1),h&&(c=er(o),h&&(a.style[r.op.p]=c[r.op.p]-r.op.m-a._offset+Qt))}return d&&x&&(m=er(x),d.seek(f),p=er(x),d._caScrollDist=m[r.p]-p[r.p],e=e/d._caScrollDist*f),d&&d.seek(g),d?e:Math.round(e)},qE=/(webkit|moz|length|cssText|inset)/i,wd=function(e,t,i,r){if(e.parentNode!==t){var s=e.style,a,o;if(t===xt){e._stOrig=s.cssText,o=_n(e);for(a in o)!+a&&!qE.test(a)&&o[a]&&typeof s[a]=="string"&&a!=="0"&&(s[a]=o[a]);s.top=i,s.left=r}else s.cssText=e._stOrig;Ae.core.getCache(e).uncache=1,t.appendChild(e)}},zm=function(e,t,i){var r=t,s=r;return function(a){var o=Math.round(e());return o!==r&&o!==s&&Math.abs(o-r)>3&&Math.abs(o-s)>3&&(a=o,i&&i()),s=r,r=Math.round(a),r}},$o=function(e,t,i){var r={};r[t.p]="+="+i,Ae.set(e,r)},Ad=function(e,t){var i=Fr(e,t),r="_scroll"+t.p2,s=function a(o,l,c,u,h){var f=a.tween,d=l.onComplete,_={};c=c||i();var g=zm(i,c,function(){f.kill(),a.tween=0});return h=u&&h||0,u=u||o-c,f&&f.kill(),l[r]=o,l.inherit=!1,l.modifiers=_,_[r]=function(){return g(c+u*f.ratio+h*f.ratio*f.ratio)},l.onUpdate=function(){st.cache++,a.tween&&ar()},l.onComplete=function(){a.tween=0,d&&d.call(f)},f=a.tween=Ae.to(e,l),f};return e[r]=i,i.wheelHandler=function(){return s.tween&&s.tween.kill()&&(s.tween=0)},oi(e,"wheel",i.wheelHandler),at.isTouch&&oi(e,"touchmove",i.wheelHandler),s},at=(function(){function n(t,i){Bs||n.register(Ae)||console.warn("Please gsap.registerPlugin(ScrollTrigger)"),$u(this),this.init(t,i)}var e=n.prototype;return e.init=function(i,r){if(this.progress=this.start=0,this.vars&&this.kill(!0,!0),!Da){this.update=this.refresh=this.kill=Ln;return}i=Sd(Qi(i)||Ua(i)||i.nodeType?{trigger:i}:i,Wo);var s=i,a=s.onUpdate,o=s.toggleClass,l=s.id,c=s.onToggle,u=s.onRefresh,h=s.scrub,f=s.trigger,d=s.pin,_=s.pinSpacing,g=s.invalidateOnRefresh,m=s.anticipatePin,p=s.onScrubComplete,x=s.onSnapComplete,y=s.once,M=s.snap,T=s.pinReparent,A=s.pinSpacer,w=s.containerAnimation,C=s.fastScrollEnd,v=s.preventOverlaps,E=i.horizontal||i.containerAnimation&&i.horizontal!==!1?Ni:ei,D=!h&&h!==0,U=Hi(i.scroller||rt),B=Ae.core.getCache(U),H=ds(U),V=("pinType"in i?i.pinType:Dr(U,"pinType")||H&&"fixed")==="fixed",k=[i.onEnter,i.onLeave,i.onEnterBack,i.onLeaveBack],O=D&&i.toggleActions.split(" "),q="markers"in i?i.markers:Wo.markers,ne=H?0:parseFloat(_n(U)["border"+E.p2+ha])||0,P=this,re=i.onRefreshInit&&function(){return i.onRefreshInit(P)},Le=BE(U,H,E),Oe=zE(U,H),We=0,qe=0,K=0,J=Fr(U,E),fe,Ce,Se,ke,ut,be,Be,Ke,Ie,G,I,vt,Qe,ze,Me,R,S,N,Z,j,$,xe,se,Te,ye,ie,ae,Ee,we,oe,Ge,L,ue,te,he,ee,Q,ce,Ue;if(P._startClamp=P._endClamp=!1,P._dir=E,m*=45,P.scroller=U,P.scroll=w?w.time.bind(w):J,ke=J(),P.vars=i,r=r||i.animation,"refreshPriority"in i&&(ym=1,i.refreshPriority===-9999&&(qa=P)),B.tweenScroll=B.tweenScroll||{top:Ad(U,ei),left:Ad(U,Ni)},P.tweenTo=fe=B.tweenScroll[E.p],P.scrubDuration=function(pe){ue=Ua(pe)&&pe,ue?L?L.duration(pe):L=Ae.to(r,{ease:"expo",totalProgress:"+=0",inherit:!1,duration:ue,paused:!0,onComplete:function(){return p&&p(P)}}):(L&&L.progress(1).kill(),L=0)},r&&(r.vars.lazy=!1,r._initted&&!P.isReverted||r.vars.immediateRender!==!1&&i.immediateRender!==!1&&r.duration()&&r.render(0,!0,!0),P.animation=r.pause(),r.scrollTrigger=P,P.scrubDuration(h),oe=0,l||(l=r.vars.id)),M&&((!Zr(M)||M.push)&&(M={snapTo:M}),"scrollBehavior"in xt.style&&Ae.set(H?[xt,nn]:U,{scrollBehavior:"auto"}),st.forEach(function(pe){return bi(pe)&&pe.target===(H?Dt.scrollingElement||nn:U)&&(pe.smooth=!1)}),Se=bi(M.snapTo)?M.snapTo:M.snapTo==="labels"?HE(r):M.snapTo==="labelsDirectional"?VE(r):M.directional!==!1?function(pe,Xe){return Vh(M.snapTo)(pe,Ei()-qe<500?0:Xe.direction)}:Ae.utils.snap(M.snapTo),te=M.duration||{min:.1,max:2},te=Zr(te)?Va(te.min,te.max):Va(te,te),he=Ae.delayedCall(M.delay||ue/2||.1,function(){var pe=J(),Xe=Ei()-qe<500,De=fe.tween;if((Xe||Math.abs(P.getVelocity())<10)&&!De&&!Nl&&We!==pe){var Ye=(pe-be)/ze,Vt=r&&!D?r.totalProgress():Ye,it=Xe?0:(Vt-Ge)/(Ei()-Pa)*1e3||0,St=Ae.utils.clamp(-Ye,1-Ye,Fs(it/2)*it/.185),Xt=Ye+(M.inertia===!1?0:St),Lt,wt,pt=M,Oi=pt.onStart,bt=pt.onInterrupt,vi=pt.onComplete;if(Lt=Se(Xt,P),Ua(Lt)||(Lt=Xt),wt=Math.max(0,Math.round(be+Lt*ze)),pe<=Be&&pe>=be&&wt!==pe){if(De&&!De._initted&&De.data<=Fs(wt-pe))return;M.inertia===!1&&(St=Lt-Ye),fe(wt,{duration:te(Fs(Math.max(Fs(Xt-Vt),Fs(Lt-Vt))*.185/it/.05||0)),ease:M.ease||"power3",data:Fs(wt-pe),onInterrupt:function(){return he.restart(!0)&&bt&&bt(P)},onComplete:function(){P.update(),We=J(),r&&!D&&(L?L.resetTo("totalProgress",Lt,r._tTime/r._tDur):r.progress(Lt)),oe=Ge=r&&!D?r.totalProgress():P.progress,x&&x(P),vi&&vi(P)}},pe,St*ze,wt-pe-St*ze),Oi&&Oi(P,fe.tween)}}else P.isActive&&We!==pe&&he.restart(!0)}).pause()),l&&(Ku[l]=P),f=P.trigger=Hi(f||d!==!0&&d),Ue=f&&f._gsap&&f._gsap.stRevert,Ue&&(Ue=Ue(P)),d=d===!0?f:Hi(d),Qi(o)&&(o={targets:f,className:o}),d&&(_===!1||_===gn||(_=!_&&d.parentNode&&d.parentNode.style&&_n(d.parentNode).display==="flex"?!1:$t),P.pin=d,Ce=Ae.core.getCache(d),Ce.spacer?Me=Ce.pinState:(A&&(A=Hi(A),A&&!A.nodeType&&(A=A.current||A.nativeElement),Ce.spacerIsNative=!!A,A&&(Ce.spacerState=Yo(A))),Ce.spacer=N=A||Dt.createElement("div"),N.classList.add("pin-spacer"),l&&N.classList.add("pin-spacer-"+l),Ce.pinState=Me=Yo(d)),i.force3D!==!1&&Ae.set(d,{force3D:!0}),P.spacer=N=Ce.spacer,we=_n(d),Te=we[_+E.os2],j=Ae.getProperty(d),$=Ae.quickSetter(d,E.a,Qt),Cc(d,N,we),S=Yo(d)),q){vt=Zr(q)?Sd(q,Md):Md,G=Xo("scroller-start",l,U,E,vt,0),I=Xo("scroller-end",l,U,E,vt,0,G),Z=G["offset"+E.op.d2];var dt=Hi(Dr(U,"content")||U);Ke=this.markerStart=Xo("start",l,dt,E,vt,Z,0,w),Ie=this.markerEnd=Xo("end",l,dt,E,vt,Z,0,w),w&&(ce=Ae.quickSetter([Ke,Ie],E.a,Qt)),!V&&!(Vn.length&&Dr(U,"fixedMarkers")===!0)&&(kE(H?xt:U),Ae.set([G,I],{force3D:!0}),ie=Ae.quickSetter(G,E.a,Qt),Ee=Ae.quickSetter(I,E.a,Qt))}if(w){var ge=w.vars.onUpdate,Re=w.vars.onUpdateParams;w.eventCallback("onUpdate",function(){P.update(0,0,1),ge&&ge.apply(w,Re||[])})}if(P.previous=function(){return et[et.indexOf(P)-1]},P.next=function(){return et[et.indexOf(P)+1]},P.revert=function(pe,Xe){if(!Xe)return P.kill(!0);var De=pe!==!1||!P.enabled,Ye=Mi;De!==P.isReverted&&(De&&(ee=Math.max(J(),P.scroll.rec||0),K=P.progress,Q=r&&r.progress()),Ke&&[Ke,Ie,G,I].forEach(function(Vt){return Vt.style.display=De?"none":"block"}),De&&(Mi=P,P.update(De)),d&&(!T||!P.isActive)&&(De?XE(d,N,Me):Cc(d,N,_n(d),ye)),De||P.update(De),Mi=Ye,P.isReverted=De)},P.refresh=function(pe,Xe,De,Ye){if(!((Mi||!P.enabled)&&!Xe)){if(d&&pe&&Mn){oi(n,"scrollEnd",Im);return}!Ui&&re&&re(P),Mi=P,fe.tween&&!De&&(fe.tween.kill(),fe.tween=0),L&&L.pause(),g&&r&&(r.revert({kill:!1}).invalidate(),r.getChildren?r.getChildren(!0,!0,!1).forEach(function(ve){return ve.vars.immediateRender&&ve.render(0,!0,!0)}):r.vars.immediateRender&&r.render(0,!0,!0)),P.isReverted||P.revert(!0,!0),P._subPinOffset=!1;var Vt=Le(),it=Oe(),St=w?w.duration():zn(U,E),Xt=ze<=.01||!ze,Lt=0,wt=Ye||0,pt=Zr(De)?De.end:i.end,Oi=i.endTrigger||f,bt=Zr(De)?De.start:i.start||(i.start===0||!f?0:d?"0 0":"0 100%"),vi=P.pinnedContainer=i.pinnedContainer&&Hi(i.pinnedContainer,P),$i=f&&Math.max(0,et.indexOf(P))||0,jt=$i,Jt,ni,Yn,xs,ri,b,F,Y,X,z,le,_e,de;for(q&&Zr(De)&&(_e=Ae.getProperty(G,E.p),de=Ae.getProperty(I,E.p));jt-- >0;)b=et[jt],b.end||b.refresh(0,1)||(Mi=P),F=b.pin,F&&(F===f||F===d||F===vi)&&!b.isReverted&&(z||(z=[]),z.unshift(b),b.revert(!0,!0)),b!==et[jt]&&($i--,jt--);for(bi(bt)&&(bt=bt(P)),bt=gd(bt,"start",P),be=Td(bt,f,Vt,E,J(),Ke,G,P,it,ne,V,St,w,P._startClamp&&"_startClamp")||(d?-.001:0),bi(pt)&&(pt=pt(P)),Qi(pt)&&!pt.indexOf("+=")&&(~pt.indexOf(" ")?pt=(Qi(bt)?bt.split(" ")[0]:"")+pt:(Lt=al(pt.substr(2),Vt),pt=Qi(bt)?bt:(w?Ae.utils.mapRange(0,w.duration(),w.scrollTrigger.start,w.scrollTrigger.end,be):be)+Lt,Oi=f)),pt=gd(pt,"end",P),Be=Math.max(be,Td(pt||(Oi?"100% 0":St),Oi,Vt,E,J()+Lt,Ie,I,P,it,ne,V,St,w,P._endClamp&&"_endClamp"))||-.001,Lt=0,jt=$i;jt--;)b=et[jt]||{},F=b.pin,F&&b.start-b._pinPush<=be&&!w&&b.end>0&&(Jt=b.end-(P._startClamp?Math.max(0,b.start):b.start),(F===f&&b.start-b._pinPush<be||F===vi)&&isNaN(bt)&&(Lt+=Jt*(1-b.progress)),F===d&&(wt+=Jt));if(be+=Lt,Be+=Lt,P._startClamp&&(P._startClamp+=Lt),P._endClamp&&!Ui&&(P._endClamp=Be||-.001,Be=Math.min(Be,zn(U,E))),ze=Be-be||(be-=.01)&&.001,Xt&&(K=Ae.utils.clamp(0,1,Ae.utils.normalize(be,Be,ee))),P._pinPush=wt,Ke&&Lt&&(Jt={},Jt[E.a]="+="+Lt,vi&&(Jt[E.p]="-="+J()),Ae.set([Ke,Ie],Jt)),d&&!(qu&&P.end>=zn(U,E)))Jt=_n(d),xs=E===ei,Yn=J(),xe=parseFloat(j(E.a))+wt,!St&&Be>1&&(le=(H?Dt.scrollingElement||nn:U).style,le={style:le,value:le["overflow"+E.a.toUpperCase()]},H&&_n(xt)["overflow"+E.a.toUpperCase()]!=="scroll"&&(le.style["overflow"+E.a.toUpperCase()]="scroll")),Cc(d,N,Jt),S=Yo(d),ni=er(d,!0),Y=V&&Fr(U,xs?Ni:ei)(),_?(ye=[_+E.os2,ze+wt+Qt],ye.t=N,jt=_===$t?Tl(d,E)+ze+wt:0,jt&&(ye.push(E.d,jt+Qt),N.style.flexBasis!=="auto"&&(N.style.flexBasis=jt+Qt)),js(ye),vi&&et.forEach(function(ve){ve.pin===vi&&ve.vars.pinSpacing!==!1&&(ve._subPinOffset=!0)}),V&&J(ee)):(jt=Tl(d,E),jt&&N.style.flexBasis!=="auto"&&(N.style.flexBasis=jt+Qt)),V&&(ri={top:ni.top+(xs?Yn-be:Y)+Qt,left:ni.left+(xs?Y:Yn-be)+Qt,boxSizing:"border-box",position:"fixed"},ri[os]=ri["max"+ha]=Math.ceil(ni.width)+Qt,ri[ls]=ri["max"+Hh]=Math.ceil(ni.height)+Qt,ri[gn]=ri[gn+Ya]=ri[gn+Wa]=ri[gn+$a]=ri[gn+Xa]="0",ri[$t]=Jt[$t],ri[$t+Ya]=Jt[$t+Ya],ri[$t+Wa]=Jt[$t+Wa],ri[$t+$a]=Jt[$t+$a],ri[$t+Xa]=Jt[$t+Xa],R=$E(Me,ri,T),Ui&&J(0)),r?(X=r._initted,bc(1),r.render(r.duration(),!0,!0),se=j(E.a)-xe+ze+wt,ae=Math.abs(ze-se)>1,V&&ae&&R.splice(R.length-2,2),r.render(0,!0,!0),X||r.invalidate(!0),r.parent||r.totalTime(r.totalTime()),bc(0)):se=ze,le&&(le.value?le.style["overflow"+E.a.toUpperCase()]=le.value:le.style.removeProperty("overflow-"+E.a));else if(f&&J()&&!w)for(ni=f.parentNode;ni&&ni!==xt;)ni._pinOffset&&(be-=ni._pinOffset,Be-=ni._pinOffset),ni=ni.parentNode;z&&z.forEach(function(ve){return ve.revert(!1,!0)}),P.start=be,P.end=Be,ke=ut=Ui?ee:J(),!w&&!Ui&&(ke<ee&&J(ee),P.scroll.rec=0),P.revert(!1,!0),qe=Ei(),he&&(We=-1,he.restart(!0)),Mi=0,r&&D&&(r._initted||Q)&&r.progress()!==Q&&r.progress(Q||0,!0).render(r.time(),!0,!0),(Xt||K!==P.progress||w||g||r&&!r._initted)&&(r&&!D&&(r._initted||K||r.vars.immediateRender!==!1)&&r.totalProgress(w&&be<-.001&&!K?Ae.utils.normalize(be,Be,0):K,!0),P.progress=Xt||(ke-be)/ze===K?0:K),d&&_&&(N._pinOffset=Math.round(P.progress*se)),L&&L.invalidate(),isNaN(_e)||(_e-=Ae.getProperty(G,E.p),de-=Ae.getProperty(I,E.p),$o(G,E,_e),$o(Ke,E,_e-(Ye||0)),$o(I,E,de),$o(Ie,E,de-(Ye||0))),Xt&&!Ui&&P.update(),u&&!Ui&&!Qe&&(Qe=!0,u(P),Qe=!1)}},P.getVelocity=function(){return(J()-ut)/(Ei()-Pa)*1e3||0},P.endAnimation=function(){ba(P.callbackAnimation),r&&(L?L.progress(1):r.paused()?D||ba(r,P.direction<0,1):ba(r,r.reversed()))},P.labelToScroll=function(pe){return r&&r.labels&&(be||P.refresh()||be)+r.labels[pe]/r.duration()*ze||0},P.getTrailing=function(pe){var Xe=et.indexOf(P),De=P.direction>0?et.slice(0,Xe).reverse():et.slice(Xe+1);return(Qi(pe)?De.filter(function(Ye){return Ye.vars.preventOverlaps===pe}):De).filter(function(Ye){return P.direction>0?Ye.end<=be:Ye.start>=Be})},P.update=function(pe,Xe,De){if(!(w&&!De&&!pe)){var Ye=Ui===!0?ee:P.scroll(),Vt=pe?0:(Ye-be)/ze,it=Vt<0?0:Vt>1?1:Vt||0,St=P.progress,Xt,Lt,wt,pt,Oi,bt,vi,$i;if(Xe&&(ut=ke,ke=w?J():Ye,M&&(Ge=oe,oe=r&&!D?r.totalProgress():it)),m&&d&&!Mi&&!ko&&Mn&&(!it&&be<Ye+(Ye-ut)/(Ei()-Pa)*m?it=1e-4:it===1&&Be>Ye+(Ye-ut)/(Ei()-Pa)*m&&(it=.9999)),it!==St&&P.enabled){if(Xt=P.isActive=!!it&&it<1,Lt=!!St&&St<1,bt=Xt!==Lt,Oi=bt||!!it!=!!St,P.direction=it>St?1:-1,P.progress=it,Oi&&!Mi&&(wt=it&&!St?0:it===1?1:St===1?2:3,D&&(pt=!bt&&O[wt+1]!=="none"&&O[wt+1]||O[wt],$i=r&&(pt==="complete"||pt==="reset"||pt in r))),v&&(bt||$i)&&($i||h||!r)&&(bi(v)?v(P):P.getTrailing(v).forEach(function(Yn){return Yn.endAnimation()})),D||(L&&!Mi&&!ko?(L._dp._time-L._start!==L._time&&L.render(L._dp._time-L._start),L.resetTo?L.resetTo("totalProgress",it,r._tTime/r._tDur):(L.vars.totalProgress=it,L.invalidate().restart())):r&&r.totalProgress(it,!!(Mi&&(qe||pe)))),d){if(pe&&_&&(N.style[_+E.os2]=Te),!V)$(La(xe+se*it));else if(Oi){if(vi=!pe&&it>St&&Be+1>Ye&&Ye+1>=zn(U,E),T)if(!pe&&(Xt||vi)){var jt=er(d,!0),Jt=Ye-be;wd(d,xt,jt.top+(E===ei?Jt:0)+Qt,jt.left+(E===ei?0:Jt)+Qt)}else wd(d,N);js(Xt||vi?R:S),ae&&it<1&&Xt||$(xe+(it===1&&!vi?se:0))}}M&&!fe.tween&&!Mi&&!ko&&he.restart(!0),o&&(bt||y&&it&&(it<1||!Tc))&&so(o.targets).forEach(function(Yn){return Yn.classList[Xt||y?"add":"remove"](o.className)}),a&&!D&&!pe&&a(P),Oi&&!Mi?(D&&($i&&(pt==="complete"?r.pause().totalProgress(1):pt==="reset"?r.restart(!0).pause():pt==="restart"?r.restart(!0):r[pt]()),a&&a(P)),(bt||!Tc)&&(c&&bt&&Ac(P,c),k[wt]&&Ac(P,k[wt]),y&&(it===1?P.kill(!1,1):k[wt]=0),bt||(wt=it===1?1:3,k[wt]&&Ac(P,k[wt]))),C&&!Xt&&Math.abs(P.getVelocity())>(Ua(C)?C:2500)&&(ba(P.callbackAnimation),L?L.progress(1):ba(r,pt==="reverse"?1:!it,1))):D&&a&&!Mi&&a(P)}if(Ee){var ni=w?Ye/w.duration()*(w._caScrollDist||0):Ye;ie(ni+(G._isFlipped?1:0)),Ee(ni)}ce&&ce(-Ye/w.duration()*(w._caScrollDist||0))}},P.enable=function(pe,Xe){P.enabled||(P.enabled=!0,oi(U,"resize",Ia),H||oi(U,"scroll",Os),re&&oi(n,"refreshInit",re),pe!==!1&&(P.progress=K=0,ke=ut=We=J()),Xe!==!1&&P.refresh())},P.getTween=function(pe){return pe&&fe?fe.tween:L},P.setPositions=function(pe,Xe,De,Ye){if(w){var Vt=w.scrollTrigger,it=w.duration(),St=Vt.end-Vt.start;pe=Vt.start+St*pe/it,Xe=Vt.start+St*Xe/it}P.refresh(!1,!1,{start:_d(pe,De&&!!P._startClamp),end:_d(Xe,De&&!!P._endClamp)},Ye),P.update()},P.adjustPinSpacing=function(pe){if(ye&&pe){var Xe=ye.indexOf(E.d)+1;ye[Xe]=parseFloat(ye[Xe])+pe+Qt,ye[1]=parseFloat(ye[1])+pe+Qt,js(ye)}},P.disable=function(pe,Xe){if(pe!==!1&&P.revert(!0,!0),P.enabled&&(P.enabled=P.isActive=!1,Xe||L&&L.pause(),ee=0,Ce&&(Ce.uncache=1),re&&ai(n,"refreshInit",re),he&&(he.pause(),fe.tween&&fe.tween.kill()&&(fe.tween=0)),!H)){for(var De=et.length;De--;)if(et[De].scroller===U&&et[De]!==P)return;ai(U,"resize",Ia),H||ai(U,"scroll",Os)}},P.kill=function(pe,Xe){P.disable(pe,Xe),L&&!Xe&&L.kill(),l&&delete Ku[l];var De=et.indexOf(P);De>=0&&et.splice(De,1),De===Li&&ll>0&&Li--,De=0,et.forEach(function(Ye){return Ye.scroller===P.scroller&&(De=1)}),De||Ui||(P.scroll.rec=0),r&&(r.scrollTrigger=null,pe&&r.revert({kill:!1}),Xe||r.kill()),Ke&&[Ke,Ie,G,I].forEach(function(Ye){return Ye.parentNode&&Ye.parentNode.removeChild(Ye)}),qa===P&&(qa=0),d&&(Ce&&(Ce.uncache=1),De=0,et.forEach(function(Ye){return Ye.pin===d&&De++}),De||(Ce.spacer=0)),i.onKill&&i.onKill(P)},et.push(P),P.enable(!1,!1),Ue&&Ue(P),r&&r.add&&!ze){var Ze=P.update;P.update=function(){P.update=Ze,st.cache++,be||Be||P.refresh()},Ae.delayedCall(.01,P.update),ze=.01,be=Be=0}else P.refresh();d&&WE()},n.register=function(i){return Bs||(Ae=i||Rm(),Am()&&window.document&&n.enable(),Bs=Da),Bs},n.defaults=function(i){if(i)for(var r in i)Wo[r]=i[r];return Wo},n.disable=function(i,r){Da=0,et.forEach(function(a){return a[r?"kill":"disable"](i)}),ai(rt,"wheel",Os),ai(Dt,"scroll",Os),clearInterval(zo),ai(Dt,"touchcancel",Ln),ai(xt,"touchstart",Ln),Vo(ai,Dt,"pointerdown,touchstart,mousedown",vd),Vo(ai,Dt,"pointerup,touchend,mouseup",xd),bl.kill(),Ho(ai);for(var s=0;s<st.length;s+=3)Go(ai,st[s],st[s+1]),Go(ai,st[s],st[s+2])},n.enable=function(){if(rt=window,Dt=document,nn=Dt.documentElement,xt=Dt.body,Ae&&(so=Ae.utils.toArray,Va=Ae.utils.clamp,$u=Ae.core.context||Ln,bc=Ae.core.suppressOverwrites||Ln,Oh=rt.history.scrollRestoration||"auto",Zu=rt.pageYOffset||0,Ae.core.globals("ScrollTrigger",n),xt)){Da=1,Zs=document.createElement("div"),Zs.style.height="100vh",Zs.style.position="absolute",Bm(),OE(),Wt.register(Ae),n.isTouch=Wt.isTouch,Mr=Wt.isTouch&&/(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent),Yu=Wt.isTouch===1,oi(rt,"wheel",Os),Fh=[rt,Dt,nn,xt],Ae.matchMedia?(n.matchMedia=function(c){var u=Ae.matchMedia(),h;for(h in c)u.add(h,c[h]);return u},Ae.addEventListener("matchMediaInit",function(){Fm(),Gh()}),Ae.addEventListener("matchMediaRevert",function(){return Nm()}),Ae.addEventListener("matchMedia",function(){is(0,1),ms("matchMedia")}),Ae.matchMedia().add("(orientation: portrait)",function(){return Rc(),Rc})):console.warn("Requires GSAP 3.11.0 or later"),Rc(),oi(Dt,"scroll",Os);var i=xt.hasAttribute("style"),r=xt.style,s=r.borderTopStyle,a=Ae.core.Animation.prototype,o,l;for(a.revert||Object.defineProperty(a,"revert",{value:function(){return this.time(-.01,!0)}}),r.borderTopStyle="solid",o=er(xt),ei.m=Math.round(o.top+ei.sc())||0,Ni.m=Math.round(o.left+Ni.sc())||0,s?r.borderTopStyle=s:r.removeProperty("border-top-style"),i||(xt.setAttribute("style",""),xt.removeAttribute("style")),zo=setInterval(Ed,250),Ae.delayedCall(.5,function(){return ko=0}),oi(Dt,"touchcancel",Ln),oi(xt,"touchstart",Ln),Vo(oi,Dt,"pointerdown,touchstart,mousedown",vd),Vo(oi,Dt,"pointerup,touchend,mouseup",xd),Xu=Ae.utils.checkPrefix("transform"),cl.push(Xu),Bs=Ei(),bl=Ae.delayedCall(.2,is).pause(),zs=[Dt,"visibilitychange",function(){var c=rt.innerWidth,u=rt.innerHeight;Dt.hidden?(pd=c,md=u):(pd!==c||md!==u)&&Ia()},Dt,"DOMContentLoaded",is,rt,"load",is,rt,"resize",Ia],Ho(oi),et.forEach(function(c){return c.enable(0,1)}),l=0;l<st.length;l+=3)Go(ai,st[l],st[l+1]),Go(ai,st[l],st[l+2])}},n.config=function(i){"limitCallbacks"in i&&(Tc=!!i.limitCallbacks);var r=i.syncInterval;r&&clearInterval(zo)||(zo=r)&&setInterval(Ed,r),"ignoreMobileResize"in i&&(Yu=n.isTouch===1&&i.ignoreMobileResize),"autoRefreshEvents"in i&&(Ho(ai)||Ho(oi,i.autoRefreshEvents||"none"),bm=(i.autoRefreshEvents+"").indexOf("resize")===-1)},n.scrollerProxy=function(i,r){var s=Hi(i),a=st.indexOf(s),o=ds(s);~a&&st.splice(a,o?6:2),r&&(o?Vn.unshift(rt,r,xt,r,nn,r):Vn.unshift(s,r))},n.clearMatchMedia=function(i){et.forEach(function(r){return r._ctx&&r._ctx.query===i&&r._ctx.kill(!0,!0)})},n.isInViewport=function(i,r,s){var a=(Qi(i)?Hi(i):i).getBoundingClientRect(),o=a[s?os:ls]*r||0;return s?a.right-o>0&&a.left+o<rt.innerWidth:a.bottom-o>0&&a.top+o<rt.innerHeight},n.positionInViewport=function(i,r,s){Qi(i)&&(i=Hi(i));var a=i.getBoundingClientRect(),o=a[s?os:ls],l=r==null?o/2:r in wl?wl[r]*o:~r.indexOf("%")?parseFloat(r)*o/100:parseFloat(r)||0;return s?(a.left+l)/rt.innerWidth:(a.top+l)/rt.innerHeight},n.killAll=function(i){if(et.slice(0).forEach(function(s){return s.vars.id!=="ScrollSmoother"&&s.kill()}),i!==!0){var r=ps.killAll||[];ps={},r.forEach(function(s){return s()})}},n})();at.version="3.14.2";at.saveStyles=function(n){return n?so(n).forEach(function(e){if(e&&e.style){var t=Ji.indexOf(e);t>=0&&Ji.splice(t,5),Ji.push(e,e.style.cssText,e.getBBox&&e.getAttribute("transform"),Ae.core.getCache(e),$u())}}):Ji};at.revert=function(n,e){return Gh(!n,e)};at.create=function(n,e){return new at(n,e)};at.refresh=function(n){return n?Ia(!0):(Bs||at.register())&&is(!0)};at.update=function(n){return++st.cache&&ar(n===!0?2:0)};at.clearScrollMemory=Om;at.maxScroll=function(n,e){return zn(n,e?Ni:ei)};at.getScrollFunc=function(n,e){return Fr(Hi(n),e?Ni:ei)};at.getById=function(n){return Ku[n]};at.getAll=function(){return et.filter(function(n){return n.vars.id!=="ScrollSmoother"})};at.isScrolling=function(){return!!Mn};at.snapDirectional=Vh;at.addEventListener=function(n,e){var t=ps[n]||(ps[n]=[]);~t.indexOf(e)||t.push(e)};at.removeEventListener=function(n,e){var t=ps[n],i=t&&t.indexOf(e);i>=0&&t.splice(i,1)};at.batch=function(n,e){var t=[],i={},r=e.interval||.016,s=e.batchMax||1e9,a=function(c,u){var h=[],f=[],d=Ae.delayedCall(r,function(){u(h,f),h=[],f=[]}).pause();return function(_){h.length||d.restart(!0),h.push(_.trigger),f.push(_),s<=h.length&&d.progress(1)}},o;for(o in e)i[o]=o.substr(0,2)==="on"&&bi(e[o])&&o!=="onRefreshInit"?a(o,e[o]):e[o];return bi(s)&&(s=s(),oi(at,"refresh",function(){return s=e.batchMax()})),so(n).forEach(function(l){var c={};for(o in i)c[o]=i[o];c.trigger=l,t.push(at.create(c))}),t};var Rd=function(e,t,i,r){return t>r?e(r):t<0&&e(0),i>r?(r-t)/(i-t):i<0?t/(t-i):1},Pc=function n(e,t){t===!0?e.style.removeProperty("touch-action"):e.style.touchAction=t===!0?"auto":t?"pan-"+t+(Wt.isTouch?" pinch-zoom":""):"none",e===nn&&n(xt,t)},qo={auto:1,scroll:1},KE=function(e){var t=e.event,i=e.target,r=e.axis,s=(t.changedTouches?t.changedTouches[0]:t).target,a=s._gsap||Ae.core.getCache(s),o=Ei(),l;if(!a._isScrollT||o-a._isScrollT>2e3){for(;s&&s!==xt&&(s.scrollHeight<=s.clientHeight&&s.scrollWidth<=s.clientWidth||!(qo[(l=_n(s)).overflowY]||qo[l.overflowX]));)s=s.parentNode;a._isScroll=s&&s!==i&&!ds(s)&&(qo[(l=_n(s)).overflowY]||qo[l.overflowX]),a._isScrollT=o}(a._isScroll||r==="x")&&(t.stopPropagation(),t._gsapAllow=!0)},km=function(e,t,i,r){return Wt.create({target:e,capture:!0,debounce:!1,lockAxis:!0,type:t,onWheel:r=r&&KE,onPress:r,onDrag:r,onScroll:r,onEnable:function(){return i&&oi(Dt,Wt.eventTypes[0],Pd,!1,!0)},onDisable:function(){return ai(Dt,Wt.eventTypes[0],Pd,!0)}})},ZE=/(input|label|select|textarea)/i,Cd,Pd=function(e){var t=ZE.test(e.target.tagName);(t||Cd)&&(e._gsapAllow=!0,Cd=t)},jE=function(e){Zr(e)||(e={}),e.preventDefault=e.isNormalizer=e.allowClicks=!0,e.type||(e.type="wheel,touch"),e.debounce=!!e.debounce,e.id=e.id||"normalizer";var t=e,i=t.normalizeScrollX,r=t.momentum,s=t.allowNestedScroll,a=t.onRelease,o,l,c=Hi(e.target)||nn,u=Ae.core.globals().ScrollSmoother,h=u&&u.get(),f=Mr&&(e.content&&Hi(e.content)||h&&e.content!==!1&&!h.smooth()&&h.content()),d=Fr(c,ei),_=Fr(c,Ni),g=1,m=(Wt.isTouch&&rt.visualViewport?rt.visualViewport.scale*rt.visualViewport.width:rt.outerWidth)/rt.innerWidth,p=0,x=bi(r)?function(){return r(o)}:function(){return r||2.8},y,M,T=km(c,e.type,!0,s),A=function(){return M=!1},w=Ln,C=Ln,v=function(){l=zn(c,ei),C=Va(Mr?1:0,l),i&&(w=Va(0,zn(c,Ni))),y=cs},E=function(){f._gsap.y=La(parseFloat(f._gsap.y)+d.offset)+"px",f.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+parseFloat(f._gsap.y)+", 0, 1)",d.offset=d.cacheID=0},D=function(){if(M){requestAnimationFrame(A);var q=La(o.deltaY/2),ne=C(d.v-q);if(f&&ne!==d.v+d.offset){d.offset=ne-d.v;var P=La((parseFloat(f&&f._gsap.y)||0)-d.offset);f.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+P+", 0, 1)",f._gsap.y=P+"px",d.cacheID=st.cache,ar()}return!0}d.offset&&E(),M=!0},U,B,H,V,k=function(){v(),U.isActive()&&U.vars.scrollY>l&&(d()>l?U.progress(1)&&d(l):U.resetTo("scrollY",l))};return f&&Ae.set(f,{y:"+=0"}),e.ignoreCheck=function(O){return Mr&&O.type==="touchmove"&&D()||g>1.05&&O.type!=="touchstart"||o.isGesturing||O.touches&&O.touches.length>1},e.onPress=function(){M=!1;var O=g;g=La((rt.visualViewport&&rt.visualViewport.scale||1)/m),U.pause(),O!==g&&Pc(c,g>1.01?!0:i?!1:"x"),B=_(),H=d(),v(),y=cs},e.onRelease=e.onGestureStart=function(O,q){if(d.offset&&E(),!q)V.restart(!0);else{st.cache++;var ne=x(),P,re;i&&(P=_(),re=P+ne*.05*-O.velocityX/.227,ne*=Rd(_,P,re,zn(c,Ni)),U.vars.scrollX=w(re)),P=d(),re=P+ne*.05*-O.velocityY/.227,ne*=Rd(d,P,re,zn(c,ei)),U.vars.scrollY=C(re),U.invalidate().duration(ne).play(.01),(Mr&&U.vars.scrollY>=l||P>=l-1)&&Ae.to({},{onUpdate:k,duration:ne})}a&&a(O)},e.onWheel=function(){U._ts&&U.pause(),Ei()-p>1e3&&(y=0,p=Ei())},e.onChange=function(O,q,ne,P,re){if(cs!==y&&v(),q&&i&&_(w(P[2]===q?B+(O.startX-O.x):_()+q-P[1])),ne){d.offset&&E();var Le=re[2]===ne,Oe=Le?H+O.startY-O.y:d()+ne-re[1],We=C(Oe);Le&&Oe!==We&&(H+=We-Oe),d(We)}(ne||q)&&ar()},e.onEnable=function(){Pc(c,i?!1:"x"),at.addEventListener("refresh",k),oi(rt,"resize",k),d.smooth&&(d.target.style.scrollBehavior="auto",d.smooth=_.smooth=!1),T.enable()},e.onDisable=function(){Pc(c,!0),ai(rt,"resize",k),at.removeEventListener("refresh",k),T.kill()},e.lockAxis=e.lockAxis!==!1,o=new Wt(e),o.iOS=Mr,Mr&&!d()&&d(1),Mr&&Ae.ticker.add(Ln),V=o._dc,U=Ae.to(o,{ease:"power4",paused:!0,inherit:!1,scrollX:i?"+=0.1":"+=0",scrollY:"+=0.1",modifiers:{scrollY:zm(d,d(),function(){return U.pause()})},onUpdate:ar,onComplete:V.vars.onComplete}),o};at.sort=function(n){if(bi(n))return et.sort(n);var e=rt.pageYOffset||0;return at.getAll().forEach(function(t){return t._sortY=t.trigger?e+t.trigger.getBoundingClientRect().top:t.start+rt.innerHeight}),et.sort(n||function(t,i){return(t.vars.refreshPriority||0)*-1e6+(t.vars.containerAnimation?1e6:t._sortY)-((i.vars.containerAnimation?1e6:i._sortY)+(i.vars.refreshPriority||0)*-1e6)})};at.observe=function(n){return new Wt(n)};at.normalizeScroll=function(n){if(typeof n>"u")return Di;if(n===!0&&Di)return Di.enable();if(n===!1){Di&&Di.kill(),Di=n;return}var e=n instanceof Wt?n:jE(n);return Di&&Di.target===e.target&&Di.kill(),ds(e.target)&&(Di=e),e};at.core={_getVelocityProp:Wu,_inputObserver:km,_scrollers:st,_proxies:Vn,bridge:{ss:function(){Mn||ms("scrollStart"),Mn=Ei()},ref:function(){return Mi}}};Rm()&&Ae.registerPlugin(at);class Gn{constructor(e,t,i,r,s="div"){this.parent=e,this.object=t,this.property=i,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(s),this.domElement.classList.add("lil-controller"),this.domElement.classList.add(r),this.$name=document.createElement("div"),this.$name.classList.add("lil-name"),Gn.nextNameID=Gn.nextNameID||0,this.$name.id=`lil-gui-name-${++Gn.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("lil-widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",a=>a.stopPropagation()),this.domElement.addEventListener("keyup",a=>a.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(i)}name(e){return this._name=e,this.$name.textContent=e,this}onChange(e){return this._onChange=e,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(e=!0){return this.disable(!e)}disable(e=!0){return e===this._disabled?this:(this._disabled=e,this.domElement.classList.toggle("lil-disabled",e),this.$disable.toggleAttribute("disabled",e),this)}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(e){const t=this.parent.add(this.object,this.property,e);return t.name(this._name),this.destroy(),t}min(e){return this}max(e){return this}step(e){return this}decimals(e){return this}listen(e=!0){return this._listening=e,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const e=this.save();e!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=e}getValue(){return this.object[this.property]}setValue(e){return this.getValue()!==e&&(this.object[this.property]=e,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(e){return this.setValue(e),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class JE extends Gn{constructor(e,t,i){super(e,t,i,"lil-boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function Ju(n){let e,t;return(e=n.match(/(#|0x)?([a-f0-9]{6})/i))?t=e[2]:(e=n.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?t=parseInt(e[1]).toString(16).padStart(2,0)+parseInt(e[2]).toString(16).padStart(2,0)+parseInt(e[3]).toString(16).padStart(2,0):(e=n.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(t=e[1]+e[1]+e[2]+e[2]+e[3]+e[3]),t?"#"+t:!1}const QE={isPrimitive:!0,match:n=>typeof n=="string",fromHexString:Ju,toHexString:Ju},oo={isPrimitive:!0,match:n=>typeof n=="number",fromHexString:n=>parseInt(n.substring(1),16),toHexString:n=>"#"+n.toString(16).padStart(6,0)},ey={isPrimitive:!1,match:n=>Array.isArray(n)||ArrayBuffer.isView(n),fromHexString(n,e,t=1){const i=oo.fromHexString(n);e[0]=(i>>16&255)/255*t,e[1]=(i>>8&255)/255*t,e[2]=(i&255)/255*t},toHexString([n,e,t],i=1){i=255/i;const r=n*i<<16^e*i<<8^t*i<<0;return oo.toHexString(r)}},ty={isPrimitive:!1,match:n=>Object(n)===n,fromHexString(n,e,t=1){const i=oo.fromHexString(n);e.r=(i>>16&255)/255*t,e.g=(i>>8&255)/255*t,e.b=(i&255)/255*t},toHexString({r:n,g:e,b:t},i=1){i=255/i;const r=n*i<<16^e*i<<8^t*i<<0;return oo.toHexString(r)}},iy=[QE,oo,ey,ty];function ny(n){return iy.find(e=>e.match(n))}class ry extends Gn{constructor(e,t,i,r){super(e,t,i,"lil-color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=ny(this.initialValue),this._rgbScale=r,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const s=Ju(this.$text.value);s&&this._setValueFromHexString(s)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(e){if(this._format.isPrimitive){const t=this._format.fromHexString(e);this.setValue(t)}else this._format.fromHexString(e,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(e){return this._setValueFromHexString(e),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class Dc extends Gn{constructor(e,t,i){super(e,t,i,"lil-function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",r=>{r.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class sy extends Gn{constructor(e,t,i,r,s,a){super(e,t,i,"lil-number"),this._initInput(),this.min(r),this.max(s);const o=a!==void 0;this.step(o?a:this._getImplicitStep(),o),this.updateDisplay()}decimals(e){return this._decimals=e,this.updateDisplay(),this}min(e){return this._min=e,this._onUpdateMinMax(),this}max(e){return this._max=e,this._onUpdateMinMax(),this}step(e,t=!0){return this._step=e,this._stepExplicit=t,this}updateDisplay(){const e=this.getValue();if(this._hasSlider){let t=(e-this._min)/(this._max-this._min);t=Math.max(0,Math.min(t,1)),this.$fill.style.width=t*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?e:e.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches&&(this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any")),this.$widget.appendChild(this.$input),this.$disable=this.$input;const t=()=>{let x=parseFloat(this.$input.value);isNaN(x)||(this._stepExplicit&&(x=this._snap(x)),this.setValue(this._clamp(x)))},i=x=>{const y=parseFloat(this.$input.value);isNaN(y)||(this._snapClampSetValue(y+x),this.$input.value=this.getValue())},r=x=>{x.key==="Enter"&&this.$input.blur(),x.code==="ArrowUp"&&(x.preventDefault(),i(this._step*this._arrowKeyMultiplier(x))),x.code==="ArrowDown"&&(x.preventDefault(),i(this._step*this._arrowKeyMultiplier(x)*-1))},s=x=>{this._inputFocused&&(x.preventDefault(),i(this._step*this._normalizeMouseWheel(x)))};let a=!1,o,l,c,u,h;const f=5,d=x=>{o=x.clientX,l=c=x.clientY,a=!0,u=this.getValue(),h=0,window.addEventListener("mousemove",_),window.addEventListener("mouseup",g)},_=x=>{if(a){const y=x.clientX-o,M=x.clientY-l;Math.abs(M)>f?(x.preventDefault(),this.$input.blur(),a=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(y)>f&&g()}if(!a){const y=x.clientY-c;h-=y*this._step*this._arrowKeyMultiplier(x),u+h>this._max?h=this._max-u:u+h<this._min&&(h=this._min-u),this._snapClampSetValue(u+h)}c=x.clientY},g=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",_),window.removeEventListener("mouseup",g)},m=()=>{this._inputFocused=!0},p=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",t),this.$input.addEventListener("keydown",r),this.$input.addEventListener("wheel",s,{passive:!1}),this.$input.addEventListener("mousedown",d),this.$input.addEventListener("focus",m),this.$input.addEventListener("blur",p)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("lil-slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("lil-fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("lil-has-slider");const e=(p,x,y,M,T)=>(p-x)/(y-x)*(T-M)+M,t=p=>{const x=this.$slider.getBoundingClientRect();let y=e(p,x.left,x.right,this._min,this._max);this._snapClampSetValue(y)},i=p=>{this._setDraggingStyle(!0),t(p.clientX),window.addEventListener("mousemove",r),window.addEventListener("mouseup",s)},r=p=>{t(p.clientX)},s=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",r),window.removeEventListener("mouseup",s)};let a=!1,o,l;const c=p=>{p.preventDefault(),this._setDraggingStyle(!0),t(p.touches[0].clientX),a=!1},u=p=>{p.touches.length>1||(this._hasScrollBar?(o=p.touches[0].clientX,l=p.touches[0].clientY,a=!0):c(p),window.addEventListener("touchmove",h,{passive:!1}),window.addEventListener("touchend",f))},h=p=>{if(a){const x=p.touches[0].clientX-o,y=p.touches[0].clientY-l;Math.abs(x)>Math.abs(y)?c(p):(window.removeEventListener("touchmove",h),window.removeEventListener("touchend",f))}else p.preventDefault(),t(p.touches[0].clientX)},f=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",h),window.removeEventListener("touchend",f)},d=this._callOnFinishChange.bind(this),_=400;let g;const m=p=>{if(Math.abs(p.deltaX)<Math.abs(p.deltaY)&&this._hasScrollBar)return;p.preventDefault();const y=this._normalizeMouseWheel(p)*this._step;this._snapClampSetValue(this.getValue()+y),this.$input.value=this.getValue(),clearTimeout(g),g=setTimeout(d,_)};this.$slider.addEventListener("mousedown",i),this.$slider.addEventListener("touchstart",u,{passive:!1}),this.$slider.addEventListener("wheel",m,{passive:!1})}_setDraggingStyle(e,t="horizontal"){this.$slider&&this.$slider.classList.toggle("lil-active",e),document.body.classList.toggle("lil-dragging",e),document.body.classList.toggle(`lil-${t}`,e)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(e){let{deltaX:t,deltaY:i}=e;return Math.floor(e.deltaY)!==e.deltaY&&e.wheelDelta&&(t=0,i=-e.wheelDelta/120,i*=this._stepExplicit?1:10),t+-i}_arrowKeyMultiplier(e){let t=this._stepExplicit?1:10;return e.shiftKey?t*=10:e.altKey&&(t/=10),t}_snap(e){let t=0;return this._hasMin?t=this._min:this._hasMax&&(t=this._max),e-=t,e=Math.round(e/this._step)*this._step,e+=t,e=parseFloat(e.toPrecision(15)),e}_clamp(e){return e<this._min&&(e=this._min),e>this._max&&(e=this._max),e}_snapClampSetValue(e){this.setValue(this._clamp(this._snap(e)))}get _hasScrollBar(){const e=this.parent.root.$children;return e.scrollHeight>e.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class ay extends Gn{constructor(e,t,i,r){super(e,t,i,"lil-option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("lil-focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("lil-focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(r)}options(e){return this._values=Array.isArray(e)?e:Object.values(e),this._names=Array.isArray(e)?e:Object.keys(e),this.$select.replaceChildren(),this._names.forEach(t=>{const i=document.createElement("option");i.textContent=t,this.$select.appendChild(i)}),this.updateDisplay(),this}updateDisplay(){const e=this.getValue(),t=this._values.indexOf(e);return this.$select.selectedIndex=t,this.$display.textContent=t===-1?e:this._names[t],this}}class oy extends Gn{constructor(e,t,i){super(e,t,i,"lil-string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",r=>{r.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}var ly=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "▸";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;function cy(n){const e=document.createElement("style");e.innerHTML=n;const t=document.querySelector("head link[rel=stylesheet], head style");t?document.head.insertBefore(e,t):document.head.appendChild(e)}let Dd=!1;class Wh{constructor({parent:e,autoPlace:t=e===void 0,container:i,width:r,title:s="Controls",closeFolders:a=!1,injectStyles:o=!0,touchStyles:l=!0}={}){if(this.parent=e,this.root=e?e.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("button"),this.$title.classList.add("lil-title"),this.$title.setAttribute("aria-expanded",!0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("lil-children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(s),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("lil-root"),l&&this.domElement.classList.add("lil-allow-touch-styles"),!Dd&&o&&(cy(ly),Dd=!0),i?i.appendChild(this.domElement):t&&(this.domElement.classList.add("lil-auto-place","autoPlace"),document.body.appendChild(this.domElement)),r&&this.domElement.style.setProperty("--width",r+"px"),this._closeFolders=a}add(e,t,i,r,s){if(Object(i)===i)return new ay(this,e,t,i);const a=e[t];switch(typeof a){case"number":return new sy(this,e,t,i,r,s);case"boolean":return new JE(this,e,t);case"string":return new oy(this,e,t);case"function":return new Dc(this,e,t)}console.error(`gui.add failed
	property:`,t,`
	object:`,e,`
	value:`,a)}addColor(e,t,i=1){return new ry(this,e,t,i)}addFolder(e){const t=new Wh({parent:this,title:e});return this.root._closeFolders&&t.close(),t}load(e,t=!0){return e.controllers&&this.controllers.forEach(i=>{i instanceof Dc||i._name in e.controllers&&i.load(e.controllers[i._name])}),t&&e.folders&&this.folders.forEach(i=>{i._title in e.folders&&i.load(e.folders[i._title])}),this}save(e=!0){const t={controllers:{},folders:{}};return this.controllers.forEach(i=>{if(!(i instanceof Dc)){if(i._name in t.controllers)throw new Error(`Cannot save GUI with duplicate property "${i._name}"`);t.controllers[i._name]=i.save()}}),e&&this.folders.forEach(i=>{if(i._title in t.folders)throw new Error(`Cannot save GUI with duplicate folder "${i._title}"`);t.folders[i._title]=i.save()}),t}open(e=!0){return this._setClosed(!e),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("lil-closed",this._closed),this}close(){return this.open(!1)}_setClosed(e){this._closed!==e&&(this._closed=e,this._callOnOpenClose(this))}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(e=!0){return this._setClosed(!e),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const t=this.$children.clientHeight;this.$children.style.height=t+"px",this.domElement.classList.add("lil-transition");const i=s=>{s.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("lil-transition"),this.$children.removeEventListener("transitionend",i))};this.$children.addEventListener("transitionend",i);const r=e?this.$children.scrollHeight:0;this.domElement.classList.toggle("lil-closed",!e),requestAnimationFrame(()=>{this.$children.style.height=r+"px"})}),this}title(e){return this._title=e,this.$title.textContent=e,this}reset(e=!0){return(e?this.controllersRecursive():this.controllers).forEach(i=>i.reset()),this}onChange(e){return this._onChange=e,this}_callOnChange(e){this.parent&&this.parent._callOnChange(e),this._onChange!==void 0&&this._onChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(e){this.parent&&this.parent._callOnFinishChange(e),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onOpenClose(e){return this._onOpenClose=e,this}_callOnOpenClose(e){this.parent&&this.parent._callOnOpenClose(e),this._onOpenClose!==void 0&&this._onOpenClose.call(this,e)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(e=>e.destroy())}controllersRecursive(){let e=Array.from(this.controllers);return this.folders.forEach(t=>{e=e.concat(t.controllersRecursive())}),e}foldersRecursive(){let e=Array.from(this.folders);return this.folders.forEach(t=>{e=e.concat(t.foldersRecursive())}),e}}var Lc=1/1e3,uy=1e3,hy=class{constructor(){this.startTime=performance.now(),this.previousTime=0,this.currentTime=0,this._delta=0,this._elapsed=0,this._fixedDelta=1e3/60,this.timescale=1,this.useFixedDelta=!1,this._autoReset=!1}get autoReset(){return this._autoReset}set autoReset(n){typeof document<"u"&&document.hidden!==void 0&&(n?document.addEventListener("visibilitychange",this):document.removeEventListener("visibilitychange",this),this._autoReset=n)}get delta(){return this._delta*Lc}get fixedDelta(){return this._fixedDelta*Lc}set fixedDelta(n){this._fixedDelta=n*uy}get elapsed(){return this._elapsed*Lc}update(n){this.useFixedDelta?this._delta=this.fixedDelta:(this.previousTime=this.currentTime,this.currentTime=(n!==void 0?n:performance.now())-this.startTime,this._delta=this.currentTime-this.previousTime),this._delta*=this.timescale,this._elapsed+=this._delta}reset(){this._delta=0,this._elapsed=0,this.currentTime=performance.now()-this.startTime}getDelta(){return this.delta}getElapsed(){return this.elapsed}handleEvent(n){document.hidden||(this.currentTime=performance.now()-this.startTime)}dispose(){this.autoReset=!1}},fy=(()=>{const n=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),e=new Float32Array([0,0,2,0,0,2]),t=new fn;return t.setAttribute("position",new Sn(n,3)),t.setAttribute("uv",new Sn(e,2)),t})(),Cn=class Qu{static get fullscreenGeometry(){return fy}constructor(e="Pass",t=new Tu,i=new Cl){this.name=e,this.renderer=null,this.scene=t,this.camera=i,this.screen=null,this.rtt=!0,this.needsSwap=!0,this.needsDepthTexture=!1,this.enabled=!0}get renderToScreen(){return!this.rtt}set renderToScreen(e){if(this.rtt===e){const t=this.fullscreenMaterial;t!==null&&(t.needsUpdate=!0),this.rtt=!e}}set mainScene(e){}set mainCamera(e){}setRenderer(e){this.renderer=e}isEnabled(){return this.enabled}setEnabled(e){this.enabled=e}get fullscreenMaterial(){return this.screen!==null?this.screen.material:null}set fullscreenMaterial(e){let t=this.screen;t!==null?t.material=e:(t=new fi(Qu.fullscreenGeometry,e),t.frustumCulled=!1,this.scene===null&&(this.scene=new Tu),this.scene.add(t),this.screen=t)}getFullscreenMaterial(){return this.fullscreenMaterial}setFullscreenMaterial(e){this.fullscreenMaterial=e}getDepthTexture(){return null}setDepthTexture(e,t=co){}render(e,t,i,r,s){throw new Error("Render method not implemented!")}setSize(e,t){}initialize(e,t,i){}dispose(){for(const e of Object.keys(this)){const t=this[e];(t instanceof ci||t instanceof gs||t instanceof mi||t instanceof Qu)&&this[e].dispose()}this.fullscreenMaterial!==null&&this.fullscreenMaterial.dispose()}},dy=class extends Cn{constructor(){super("ClearMaskPass",null,null),this.needsSwap=!1}render(n,e,t,i,r){const s=n.state.buffers.stencil;s.setLocked(!1),s.setTest(!1)}},py=`#ifdef COLOR_WRITE
#include <common>
#include <dithering_pars_fragment>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#endif
#ifdef DEPTH_WRITE
#include <packing>
#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
return unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
return texture2D(depthBuffer,uv).r;
#endif
}
#endif
#ifdef USE_WEIGHTS
uniform vec4 channelWeights;
#endif
uniform float opacity;varying vec2 vUv;void main(){
#ifdef COLOR_WRITE
vec4 texel=texture2D(inputBuffer,vUv);
#ifdef USE_WEIGHTS
texel*=channelWeights;
#endif
gl_FragColor=opacity*texel;
#ifdef COLOR_SPACE_CONVERSION
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
#else
gl_FragColor=vec4(0.0);
#endif
#ifdef DEPTH_WRITE
gl_FragDepth=readDepth(vUv);
#endif
}`,Hm="varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}",Vm=class extends _i{constructor(){super({name:"CopyMaterial",defines:{COLOR_SPACE_CONVERSION:"1",DEPTH_PACKING:"0",COLOR_WRITE:"1"},uniforms:{inputBuffer:new ft(null),depthBuffer:new ft(null),channelWeights:new ft(null),opacity:new ft(1)},blending:Fi,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:py,vertexShader:Hm}),this.depthFunc=fl}get inputBuffer(){return this.uniforms.inputBuffer.value}set inputBuffer(n){const e=n!==null;this.colorWrite!==e&&(e?this.defines.COLOR_WRITE=!0:delete this.defines.COLOR_WRITE,this.colorWrite=e,this.needsUpdate=!0),this.uniforms.inputBuffer.value=n}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(n){const e=n!==null;this.depthWrite!==e&&(e?this.defines.DEPTH_WRITE=!0:delete this.defines.DEPTH_WRITE,this.depthTest=e,this.depthWrite=e,this.needsUpdate=!0),this.uniforms.depthBuffer.value=n}set depthPacking(n){this.defines.DEPTH_PACKING=n.toFixed(0),this.needsUpdate=!0}get colorSpaceConversion(){return this.defines.COLOR_SPACE_CONVERSION!==void 0}set colorSpaceConversion(n){this.colorSpaceConversion!==n&&(n?this.defines.COLOR_SPACE_CONVERSION=!0:delete this.defines.COLOR_SPACE_CONVERSION,this.needsUpdate=!0)}get channelWeights(){return this.uniforms.channelWeights.value}set channelWeights(n){n!==null?(this.defines.USE_WEIGHTS="1",this.uniforms.channelWeights.value=n):delete this.defines.USE_WEIGHTS,this.needsUpdate=!0}setInputBuffer(n){this.uniforms.inputBuffer.value=n}getOpacity(n){return this.uniforms.opacity.value}setOpacity(n){this.uniforms.opacity.value=n}},my=class extends Cn{constructor(n,e=!0){super("CopyPass"),this.fullscreenMaterial=new Vm,this.needsSwap=!1,this.renderTarget=n,n===void 0&&(this.renderTarget=new ci(1,1,{minFilter:Zt,magFilter:Zt,stencilBuffer:!1,depthBuffer:!1}),this.renderTarget.texture.name="CopyPass.Target"),this.autoResize=e}get resize(){return this.autoResize}set resize(n){this.autoResize=n}get texture(){return this.renderTarget.texture}getTexture(){return this.renderTarget.texture}setAutoResizeEnabled(n){this.autoResize=n}render(n,e,t,i,r){this.fullscreenMaterial.inputBuffer=e.texture,n.setRenderTarget(this.renderToScreen?null:this.renderTarget),n.render(this.scene,this.camera)}setSize(n,e){this.autoResize&&this.renderTarget.setSize(n,e)}initialize(n,e,t){t!==void 0&&(this.renderTarget.texture.type=t,t!==Kt?this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1":n!==null&&n.outputColorSpace===yt&&(this.renderTarget.texture.colorSpace=yt))}},Ld=new tt,Gm=class extends Cn{constructor(n=!0,e=!0,t=!1){super("ClearPass",null,null),this.needsSwap=!1,this.color=n,this.depth=e,this.stencil=t,this.overrideClearColor=null,this.overrideClearAlpha=-1}setClearFlags(n,e,t){this.color=n,this.depth=e,this.stencil=t}getOverrideClearColor(){return this.overrideClearColor}setOverrideClearColor(n){this.overrideClearColor=n}getOverrideClearAlpha(){return this.overrideClearAlpha}setOverrideClearAlpha(n){this.overrideClearAlpha=n}render(n,e,t,i,r){const s=this.overrideClearColor,a=this.overrideClearAlpha,o=n.getClearAlpha(),l=s!==null,c=a>=0;l?(n.getClearColor(Ld),n.setClearColor(s,c?a:o)):c&&n.setClearAlpha(a),n.setRenderTarget(this.renderToScreen?null:e),n.clear(this.color,this.depth,this.stencil),l?n.setClearColor(Ld,o):c&&n.setClearAlpha(o)}},gy=class extends Cn{constructor(n,e){super("MaskPass",n,e),this.needsSwap=!1,this.clearPass=new Gm(!1,!1,!0),this.inverse=!1}set mainScene(n){this.scene=n}set mainCamera(n){this.camera=n}get inverted(){return this.inverse}set inverted(n){this.inverse=n}get clear(){return this.clearPass.enabled}set clear(n){this.clearPass.enabled=n}getClearPass(){return this.clearPass}isInverted(){return this.inverted}setInverted(n){this.inverted=n}render(n,e,t,i,r){const s=n.getContext(),a=n.state.buffers,o=this.scene,l=this.camera,c=this.clearPass,u=this.inverted?0:1,h=1-u;a.color.setMask(!1),a.depth.setMask(!1),a.color.setLocked(!0),a.depth.setLocked(!0),a.stencil.setTest(!0),a.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),a.stencil.setFunc(s.ALWAYS,u,4294967295),a.stencil.setClear(h),a.stencil.setLocked(!0),this.clearPass.enabled&&(this.renderToScreen?c.render(n,null):(c.render(n,e),c.render(n,t))),this.renderToScreen?(n.setRenderTarget(null),n.render(o,l)):(n.setRenderTarget(e),n.render(o,l),n.setRenderTarget(t),n.render(o,l)),a.color.setLocked(!1),a.depth.setLocked(!1),a.stencil.setLocked(!1),a.stencil.setFunc(s.EQUAL,1,4294967295),a.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),a.stencil.setLocked(!0)}},_y=class{constructor(n=null,{depthBuffer:e=!0,stencilBuffer:t=!1,multisampling:i=0,frameBufferType:r}={}){this.renderer=null,this.inputBuffer=this.createBuffer(e,t,r,i),this.outputBuffer=this.inputBuffer.clone(),this.copyPass=new my,this.depthTexture=null,this.passes=[],this.timer=new hy,this.autoRenderToScreen=!0,this.setRenderer(n)}get multisampling(){return this.inputBuffer.samples||0}set multisampling(n){const e=this.inputBuffer,t=this.multisampling;t>0&&n>0?(this.inputBuffer.samples=n,this.outputBuffer.samples=n,this.inputBuffer.dispose(),this.outputBuffer.dispose()):t!==n&&(this.inputBuffer.dispose(),this.outputBuffer.dispose(),this.inputBuffer=this.createBuffer(e.depthBuffer,e.stencilBuffer,e.texture.type,n),this.inputBuffer.depthTexture=this.depthTexture,this.outputBuffer=this.inputBuffer.clone())}getTimer(){return this.timer}getRenderer(){return this.renderer}setRenderer(n){if(this.renderer=n,n!==null){const e=n.getSize(new Ve),t=n.getContext().getContextAttributes().alpha,i=this.inputBuffer.texture.type;i===Kt&&n.outputColorSpace===yt&&(this.inputBuffer.texture.colorSpace=yt,this.outputBuffer.texture.colorSpace=yt,this.inputBuffer.dispose(),this.outputBuffer.dispose()),n.autoClear=!1,this.setSize(e.width,e.height);for(const r of this.passes)r.initialize(n,t,i)}}replaceRenderer(n,e=!0){const t=this.renderer,i=t.domElement.parentNode;return this.setRenderer(n),e&&i!==null&&(i.removeChild(t.domElement),i.appendChild(n.domElement)),t}createDepthTexture(){const n=this.depthTexture=new ra;return this.inputBuffer.depthTexture=n,this.inputBuffer.dispose(),this.inputBuffer.stencilBuffer?(n.format=Er,n.type=ta):n.type=Rn,n}deleteDepthTexture(){if(this.depthTexture!==null){this.depthTexture.dispose(),this.depthTexture=null,this.inputBuffer.depthTexture=null,this.inputBuffer.dispose();for(const n of this.passes)n.setDepthTexture(null)}}createBuffer(n,e,t,i){const r=this.renderer,s=r===null?new Ve:r.getDrawingBufferSize(new Ve),a={minFilter:Zt,magFilter:Zt,stencilBuffer:e,depthBuffer:n,type:t},o=new ci(s.width,s.height,a);return i>0&&(o.samples=i),t===Kt&&r!==null&&r.outputColorSpace===yt&&(o.texture.colorSpace=yt),o.texture.name="EffectComposer.Buffer",o.texture.generateMipmaps=!1,o}setMainScene(n){for(const e of this.passes)e.mainScene=n}setMainCamera(n){for(const e of this.passes)e.mainCamera=n}addPass(n,e){const t=this.passes,i=this.renderer,r=i.getDrawingBufferSize(new Ve),s=i.getContext().getContextAttributes().alpha,a=this.inputBuffer.texture.type;if(n.setRenderer(i),n.setSize(r.width,r.height),n.initialize(i,s,a),this.autoRenderToScreen&&(t.length>0&&(t[t.length-1].renderToScreen=!1),n.renderToScreen&&(this.autoRenderToScreen=!1)),e!==void 0?t.splice(e,0,n):t.push(n),this.autoRenderToScreen&&(t[t.length-1].renderToScreen=!0),n.needsDepthTexture||this.depthTexture!==null)if(this.depthTexture===null){const o=this.createDepthTexture();for(n of t)n.setDepthTexture(o)}else n.setDepthTexture(this.depthTexture)}removePass(n){const e=this.passes,t=e.indexOf(n);if(t!==-1&&e.splice(t,1).length>0){if(this.depthTexture!==null){const s=(o,l)=>o||l.needsDepthTexture;e.reduce(s,!1)||(n.getDepthTexture()===this.depthTexture&&n.setDepthTexture(null),this.deleteDepthTexture())}this.autoRenderToScreen&&t===e.length&&(n.renderToScreen=!1,e.length>0&&(e[e.length-1].renderToScreen=!0))}}removeAllPasses(){const n=this.passes;this.deleteDepthTexture(),n.length>0&&(this.autoRenderToScreen&&(n[n.length-1].renderToScreen=!1),this.passes=[])}render(n){const e=this.renderer,t=this.copyPass;let i=this.inputBuffer,r=this.outputBuffer,s=!1,a,o,l;n===void 0&&(this.timer.update(),n=this.timer.getDelta());for(const c of this.passes)c.enabled&&(c.render(e,i,r,n,s),c.needsSwap&&(s&&(t.renderToScreen=c.renderToScreen,a=e.getContext(),o=e.state.buffers.stencil,o.setFunc(a.NOTEQUAL,1,4294967295),t.render(e,i,r,n,s),o.setFunc(a.EQUAL,1,4294967295)),l=i,i=r,r=l),c instanceof gy?s=!0:c instanceof dy&&(s=!1))}setSize(n,e,t){const i=this.renderer,r=i.getSize(new Ve);(n===void 0||e===void 0)&&(n=r.width,e=r.height),(r.width!==n||r.height!==e)&&i.setSize(n,e,t);const s=i.getDrawingBufferSize(new Ve);this.inputBuffer.setSize(s.width,s.height),this.outputBuffer.setSize(s.width,s.height);for(const a of this.passes)a.setSize(s.width,s.height)}reset(){this.dispose(),this.autoRenderToScreen=!0}dispose(){for(const n of this.passes)n.dispose();this.passes=[],this.inputBuffer!==null&&this.inputBuffer.dispose(),this.outputBuffer!==null&&this.outputBuffer.dispose(),this.deleteDepthTexture(),this.copyPass.dispose(),this.timer.dispose(),Cn.fullscreenGeometry.dispose()}},us={NONE:0,DEPTH:1,CONVOLUTION:2},_t={FRAGMENT_HEAD:"FRAGMENT_HEAD",FRAGMENT_MAIN_UV:"FRAGMENT_MAIN_UV",FRAGMENT_MAIN_IMAGE:"FRAGMENT_MAIN_IMAGE",VERTEX_HEAD:"VERTEX_HEAD",VERTEX_MAIN_SUPPORT:"VERTEX_MAIN_SUPPORT"},vy=class{constructor(){this.shaderParts=new Map([[_t.FRAGMENT_HEAD,null],[_t.FRAGMENT_MAIN_UV,null],[_t.FRAGMENT_MAIN_IMAGE,null],[_t.VERTEX_HEAD,null],[_t.VERTEX_MAIN_SUPPORT,null]]),this.defines=new Map,this.uniforms=new Map,this.blendModes=new Map,this.extensions=new Set,this.attributes=us.NONE,this.varyings=new Set,this.uvTransformation=!1,this.readDepth=!1,this.colorSpace=Lr}},Uc=!1,Ud=class{constructor(n=null){this.originalMaterials=new Map,this.material=null,this.materials=null,this.materialsBackSide=null,this.materialsDoubleSide=null,this.materialsFlatShaded=null,this.materialsFlatShadedBackSide=null,this.materialsFlatShadedDoubleSide=null,this.setMaterial(n),this.meshCount=0,this.replaceMaterial=e=>{if(e.isMesh){let t;if(e.material.flatShading)switch(e.material.side){case rn:t=this.materialsFlatShadedDoubleSide;break;case li:t=this.materialsFlatShadedBackSide;break;default:t=this.materialsFlatShaded;break}else switch(e.material.side){case rn:t=this.materialsDoubleSide;break;case li:t=this.materialsBackSide;break;default:t=this.materials;break}this.originalMaterials.set(e,e.material),e.isSkinnedMesh?e.material=t[2]:e.isInstancedMesh?e.material=t[1]:e.material=t[0],++this.meshCount}}}cloneMaterial(n){if(!(n instanceof _i))return n.clone();const e=n.uniforms,t=new Map;for(const r in e){const s=e[r].value;s.isRenderTargetTexture&&(e[r].value=null,t.set(r,s))}const i=n.clone();for(const r of t)e[r[0]].value=r[1],i.uniforms[r[0]].value=r[1];return i}setMaterial(n){if(this.disposeMaterials(),this.material=n,n!==null){const e=this.materials=[this.cloneMaterial(n),this.cloneMaterial(n),this.cloneMaterial(n)];for(const t of e)t.uniforms=Object.assign({},n.uniforms),t.side=or;e[2].skinning=!0,this.materialsBackSide=e.map(t=>{const i=this.cloneMaterial(t);return i.uniforms=Object.assign({},n.uniforms),i.side=li,i}),this.materialsDoubleSide=e.map(t=>{const i=this.cloneMaterial(t);return i.uniforms=Object.assign({},n.uniforms),i.side=rn,i}),this.materialsFlatShaded=e.map(t=>{const i=this.cloneMaterial(t);return i.uniforms=Object.assign({},n.uniforms),i.flatShading=!0,i}),this.materialsFlatShadedBackSide=e.map(t=>{const i=this.cloneMaterial(t);return i.uniforms=Object.assign({},n.uniforms),i.flatShading=!0,i.side=li,i}),this.materialsFlatShadedDoubleSide=e.map(t=>{const i=this.cloneMaterial(t);return i.uniforms=Object.assign({},n.uniforms),i.flatShading=!0,i.side=rn,i})}}render(n,e,t){const i=n.shadowMap.enabled;if(n.shadowMap.enabled=!1,Uc){const r=this.originalMaterials;this.meshCount=0,e.traverse(this.replaceMaterial),n.render(e,t);for(const s of r)s[0].material=s[1];this.meshCount!==r.size&&r.clear()}else{const r=e.overrideMaterial;e.overrideMaterial=this.material,n.render(e,t),e.overrideMaterial=r}n.shadowMap.enabled=i}disposeMaterials(){if(this.material!==null){const n=this.materials.concat(this.materialsBackSide).concat(this.materialsDoubleSide).concat(this.materialsFlatShaded).concat(this.materialsFlatShadedBackSide).concat(this.materialsFlatShadedDoubleSide);for(const e of n)e.dispose()}}dispose(){this.originalMaterials.clear(),this.disposeMaterials()}static get workaroundEnabled(){return Uc}static set workaroundEnabled(n){Uc=n}},Sr=-1,kn=class extends fr{constructor(n,e=Sr,t=Sr,i=1){super(),this.resizable=n,this.baseSize=new Ve(1,1),this.preferredSize=new Ve(e,t),this.target=this.preferredSize,this.s=i,this.effectiveSize=new Ve,this.addEventListener("change",()=>this.updateEffectiveSize()),this.updateEffectiveSize()}updateEffectiveSize(){const n=this.baseSize,e=this.preferredSize,t=this.effectiveSize,i=this.scale;e.width!==Sr?t.width=e.width:e.height!==Sr?t.width=Math.round(e.height*(n.width/Math.max(n.height,1))):t.width=Math.round(n.width*i),e.height!==Sr?t.height=e.height:e.width!==Sr?t.height=Math.round(e.width/Math.max(n.width/Math.max(n.height,1),1)):t.height=Math.round(n.height*i)}get width(){return this.effectiveSize.width}set width(n){this.preferredWidth=n}get height(){return this.effectiveSize.height}set height(n){this.preferredHeight=n}getWidth(){return this.width}getHeight(){return this.height}get scale(){return this.s}set scale(n){this.s!==n&&(this.s=n,this.preferredSize.setScalar(Sr),this.dispatchEvent({type:"change"}),this.resizable.setSize(this.baseSize.width,this.baseSize.height))}getScale(){return this.scale}setScale(n){this.scale=n}get baseWidth(){return this.baseSize.width}set baseWidth(n){this.baseSize.width!==n&&(this.baseSize.width=n,this.dispatchEvent({type:"change"}),this.resizable.setSize(this.baseSize.width,this.baseSize.height))}getBaseWidth(){return this.baseWidth}setBaseWidth(n){this.baseWidth=n}get baseHeight(){return this.baseSize.height}set baseHeight(n){this.baseSize.height!==n&&(this.baseSize.height=n,this.dispatchEvent({type:"change"}),this.resizable.setSize(this.baseSize.width,this.baseSize.height))}getBaseHeight(){return this.baseHeight}setBaseHeight(n){this.baseHeight=n}setBaseSize(n,e){(this.baseSize.width!==n||this.baseSize.height!==e)&&(this.baseSize.set(n,e),this.dispatchEvent({type:"change"}),this.resizable.setSize(this.baseSize.width,this.baseSize.height))}get preferredWidth(){return this.preferredSize.width}set preferredWidth(n){this.preferredSize.width!==n&&(this.preferredSize.width=n,this.dispatchEvent({type:"change"}),this.resizable.setSize(this.baseSize.width,this.baseSize.height))}getPreferredWidth(){return this.preferredWidth}setPreferredWidth(n){this.preferredWidth=n}get preferredHeight(){return this.preferredSize.height}set preferredHeight(n){this.preferredSize.height!==n&&(this.preferredSize.height=n,this.dispatchEvent({type:"change"}),this.resizable.setSize(this.baseSize.width,this.baseSize.height))}getPreferredHeight(){return this.preferredHeight}setPreferredHeight(n){this.preferredHeight=n}setPreferredSize(n,e){(this.preferredSize.width!==n||this.preferredSize.height!==e)&&(this.preferredSize.set(n,e),this.dispatchEvent({type:"change"}),this.resizable.setSize(this.baseSize.width,this.baseSize.height))}copy(n){this.s=n.scale,this.baseSize.set(n.baseWidth,n.baseHeight),this.preferredSize.set(n.preferredWidth,n.preferredHeight),this.dispatchEvent({type:"change"}),this.resizable.setSize(this.baseSize.width,this.baseSize.height)}static get AUTO_SIZE(){return Sr}},ot={ADD:0,ALPHA:1,AVERAGE:2,COLOR:3,COLOR_BURN:4,COLOR_DODGE:5,DARKEN:6,DIFFERENCE:7,DIVIDE:8,DST:9,EXCLUSION:10,HARD_LIGHT:11,HARD_MIX:12,HUE:13,INVERT:14,INVERT_RGB:15,LIGHTEN:16,LINEAR_BURN:17,LINEAR_DODGE:18,LINEAR_LIGHT:19,LUMINOSITY:20,MULTIPLY:21,NEGATION:22,NORMAL:23,OVERLAY:24,PIN_LIGHT:25,REFLECT:26,SATURATION:27,SCREEN:28,SOFT_LIGHT:29,SRC:30,SUBTRACT:31,VIVID_LIGHT:32},xy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Sy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,src.a*opacity);}",My="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=(dst.rgb+src.rgb)*0.5;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ey="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.xy,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",yy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=mix(step(0.0,b)*(1.0-min(vec3(1.0),(1.0-a)/max(b,1e-9))),vec3(1.0),step(1.0,a));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",by="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=step(0.0,a)*mix(min(vec3(1.0),a/max(1.0-b,1e-9)),vec3(1.0),step(1.0,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ty="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",wy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=abs(dst.rgb-src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ay="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb/max(src.rgb,1e-9);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ry="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-2.0*dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Cy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb,1.0);vec3 b=min(src.rgb,1.0);vec3 c=mix(2.0*a*b,1.0-2.0*(1.0-a)*(1.0-b),step(0.5,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Py="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=step(1.0,dst.rgb+src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Dy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.x,a.yz));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ly="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Uy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=src.rgb*max(1.0-dst.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Iy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ny="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Fy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb+src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Oy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(2.0*src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",By="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.xy,b.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",zy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",ky="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-abs(1.0-dst.rgb-src.rgb),0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Hy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,opacity);}",Vy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=2.0*src.rgb*dst.rgb;vec3 b=1.0-2.0*(1.0-src.rgb)*(1.0-dst.rgb);vec3 c=mix(a,b,step(0.5,dst.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Gy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 c=mix(mix(src2,dst.rgb,step(0.5*dst.rgb,src.rgb)),max(src2-1.0,vec3(0.0)),step(dst.rgb,src2-1.0));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Wy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb*dst.rgb/max(1.0-src.rgb,1e-9),1.0);vec3 c=mix(a,src.rgb,step(1.0,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Xy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.x,b.y,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Yy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-min(dst.rgb*src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",$y="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 d=dst.rgb+(src2-1.0);vec3 w=step(0.5,src.rgb);vec3 a=dst.rgb-(1.0-src2)*dst.rgb*(1.0-dst.rgb);vec3 b=mix(d*(sqrt(dst.rgb)-dst.rgb),d*dst.rgb*((16.0*dst.rgb-12.0)*dst.rgb+3.0),w*(1.0-step(0.25,dst.rgb)));vec3 c=mix(a,b,w);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",qy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return src;}",Ky="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Zy="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=mix(max(1.0-min((1.0-dst.rgb)/(2.0*src.rgb),1.0),0.0),min(dst.rgb/(2.0*(1.0-src.rgb)),1.0),step(0.5,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",jy=new Map([[ot.ADD,xy],[ot.ALPHA,Sy],[ot.AVERAGE,My],[ot.COLOR,Ey],[ot.COLOR_BURN,yy],[ot.COLOR_DODGE,by],[ot.DARKEN,Ty],[ot.DIFFERENCE,wy],[ot.DIVIDE,Ay],[ot.DST,null],[ot.EXCLUSION,Ry],[ot.HARD_LIGHT,Cy],[ot.HARD_MIX,Py],[ot.HUE,Dy],[ot.INVERT,Ly],[ot.INVERT_RGB,Uy],[ot.LIGHTEN,Iy],[ot.LINEAR_BURN,Ny],[ot.LINEAR_DODGE,Fy],[ot.LINEAR_LIGHT,Oy],[ot.LUMINOSITY,By],[ot.MULTIPLY,zy],[ot.NEGATION,ky],[ot.NORMAL,Hy],[ot.OVERLAY,Vy],[ot.PIN_LIGHT,Gy],[ot.REFLECT,Wy],[ot.SATURATION,Xy],[ot.SCREEN,Yy],[ot.SOFT_LIGHT,$y],[ot.SRC,qy],[ot.SUBTRACT,Ky],[ot.VIVID_LIGHT,Zy]]),Jy=class extends fr{constructor(n,e=1){super(),this._blendFunction=n,this.opacity=new ft(e)}getOpacity(){return this.opacity.value}setOpacity(n){this.opacity.value=n}get blendFunction(){return this._blendFunction}set blendFunction(n){this._blendFunction=n,this.dispatchEvent({type:"change"})}getBlendFunction(){return this.blendFunction}setBlendFunction(n){this.blendFunction=n}getShaderCode(){return jy.get(this.blendFunction)}},Xh=class extends fr{constructor(n,e,{attributes:t=us.NONE,blendFunction:i=ot.NORMAL,defines:r=new Map,uniforms:s=new Map,extensions:a=null,vertexShader:o=null}={}){super(),this.name=n,this.renderer=null,this.attributes=t,this.fragmentShader=e,this.vertexShader=o,this.defines=r,this.uniforms=s,this.extensions=a,this.blendMode=new Jy(i),this.blendMode.addEventListener("change",l=>this.setChanged()),this._inputColorSpace=Lr,this._outputColorSpace=In}get inputColorSpace(){return this._inputColorSpace}set inputColorSpace(n){this._inputColorSpace=n,this.setChanged()}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(n){this._outputColorSpace=n,this.setChanged()}set mainScene(n){}set mainCamera(n){}getName(){return this.name}setRenderer(n){this.renderer=n}getDefines(){return this.defines}getUniforms(){return this.uniforms}getExtensions(){return this.extensions}getBlendMode(){return this.blendMode}getAttributes(){return this.attributes}setAttributes(n){this.attributes=n,this.setChanged()}getFragmentShader(){return this.fragmentShader}setFragmentShader(n){this.fragmentShader=n,this.setChanged()}getVertexShader(){return this.vertexShader}setVertexShader(n){this.vertexShader=n,this.setChanged()}setChanged(){this.dispatchEvent({type:"change"})}setDepthTexture(n,e=co){}update(n,e,t){}setSize(n,e){}initialize(n,e,t){}dispose(){for(const n of Object.keys(this)){const e=this[n];(e instanceof ci||e instanceof gs||e instanceof mi||e instanceof Cn)&&this[n].dispose()}}},Yh={MEDIUM:2,LARGE:3},Qy=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec4 sum=texture2D(inputBuffer,vUv0);sum+=texture2D(inputBuffer,vUv1);sum+=texture2D(inputBuffer,vUv2);sum+=texture2D(inputBuffer,vUv3);gl_FragColor=sum*0.25;
#include <colorspace_fragment>
}`,eb="uniform vec4 texelSize;uniform float kernel;uniform float scale;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vec2 dUv=(texelSize.xy*vec2(kernel)+texelSize.zw)*scale;vUv0=vec2(uv.x-dUv.x,uv.y+dUv.y);vUv1=vec2(uv.x+dUv.x,uv.y+dUv.y);vUv2=vec2(uv.x+dUv.x,uv.y-dUv.y);vUv3=vec2(uv.x-dUv.x,uv.y-dUv.y);gl_Position=vec4(position.xy,1.0,1.0);}",tb=[new Float32Array([0,0]),new Float32Array([0,1,1]),new Float32Array([0,1,1,2]),new Float32Array([0,1,2,2,3]),new Float32Array([0,1,2,3,4,4,5]),new Float32Array([0,1,2,3,4,5,7,8,9,10])],ib=class extends _i{constructor(n=new It){super({name:"KawaseBlurMaterial",uniforms:{inputBuffer:new ft(null),texelSize:new ft(new It),scale:new ft(1),kernel:new ft(0)},blending:Fi,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:Qy,vertexShader:eb}),this.setTexelSize(n.x,n.y),this.kernelSize=Yh.MEDIUM}set inputBuffer(n){this.uniforms.inputBuffer.value=n}setInputBuffer(n){this.inputBuffer=n}get kernelSequence(){return tb[this.kernelSize]}get scale(){return this.uniforms.scale.value}set scale(n){this.uniforms.scale.value=n}getScale(){return this.uniforms.scale.value}setScale(n){this.uniforms.scale.value=n}getKernel(){return null}get kernel(){return this.uniforms.kernel.value}set kernel(n){this.uniforms.kernel.value=n}setKernel(n){this.kernel=n}setTexelSize(n,e){this.uniforms.texelSize.value.set(n,e,n*.5,e*.5)}setSize(n,e){const t=1/n,i=1/e;this.uniforms.texelSize.value.set(t,i,t*.5,i*.5)}},nb=class extends Cn{constructor({kernelSize:n=Yh.MEDIUM,resolutionScale:e=.5,width:t=kn.AUTO_SIZE,height:i=kn.AUTO_SIZE,resolutionX:r=t,resolutionY:s=i}={}){super("KawaseBlurPass"),this.renderTargetA=new ci(1,1,{depthBuffer:!1}),this.renderTargetA.texture.name="Blur.Target.A",this.renderTargetB=this.renderTargetA.clone(),this.renderTargetB.texture.name="Blur.Target.B";const a=this.resolution=new kn(this,r,s,e);a.addEventListener("change",o=>this.setSize(a.baseWidth,a.baseHeight)),this._blurMaterial=new ib,this._blurMaterial.kernelSize=n,this.copyMaterial=new Vm}getResolution(){return this.resolution}get blurMaterial(){return this._blurMaterial}set blurMaterial(n){this._blurMaterial=n}get dithering(){return this.copyMaterial.dithering}set dithering(n){this.copyMaterial.dithering=n}get kernelSize(){return this.blurMaterial.kernelSize}set kernelSize(n){this.blurMaterial.kernelSize=n}get width(){return this.resolution.width}set width(n){this.resolution.preferredWidth=n}get height(){return this.resolution.height}set height(n){this.resolution.preferredHeight=n}get scale(){return this.blurMaterial.scale}set scale(n){this.blurMaterial.scale=n}getScale(){return this.blurMaterial.scale}setScale(n){this.blurMaterial.scale=n}getKernelSize(){return this.kernelSize}setKernelSize(n){this.kernelSize=n}getResolutionScale(){return this.resolution.scale}setResolutionScale(n){this.resolution.scale=n}render(n,e,t,i,r){const s=this.scene,a=this.camera,o=this.renderTargetA,l=this.renderTargetB,c=this.blurMaterial,u=c.kernelSequence;let h=e;this.fullscreenMaterial=c;for(let f=0,d=u.length;f<d;++f){const _=(f&1)===0?o:l;c.kernel=u[f],c.inputBuffer=h.texture,n.setRenderTarget(_),n.render(s,a),h=_}this.fullscreenMaterial=this.copyMaterial,this.copyMaterial.inputBuffer=h.texture,n.setRenderTarget(this.renderToScreen?null:t),n.render(s,a)}setSize(n,e){const t=this.resolution;t.setBaseSize(n,e);const i=t.width,r=t.height;this.renderTargetA.setSize(i,r),this.renderTargetB.setSize(i,r),this.blurMaterial.setSize(n,e)}initialize(n,e,t){t!==void 0&&(this.renderTargetA.texture.type=t,this.renderTargetB.texture.type=t,t!==Kt?(this.blurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1",this.copyMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1"):n!==null&&n.outputColorSpace===yt&&(this.renderTargetA.texture.colorSpace=yt,this.renderTargetB.texture.colorSpace=yt))}static get AUTO_SIZE(){return kn.AUTO_SIZE}},rb=`#include <common>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#ifdef RANGE
uniform vec2 range;
#elif defined(THRESHOLD)
uniform float threshold;uniform float smoothing;
#endif
varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);float l=luminance(texel.rgb);float mask=1.0;
#ifdef RANGE
float low=step(range.x,l);float high=step(l,range.y);mask=low*high;
#elif defined(THRESHOLD)
mask=smoothstep(threshold,threshold+smoothing,l);
#endif
#ifdef COLOR
gl_FragColor=texel*mask;
#else
gl_FragColor=vec4(l*mask);
#endif
}`,sb=class extends _i{constructor(n=!1,e=null){super({name:"LuminanceMaterial",defines:{THREE_REVISION:lo.replace(/\D+/g,"")},uniforms:{inputBuffer:new ft(null),threshold:new ft(0),smoothing:new ft(1),range:new ft(null)},blending:Fi,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:rb,vertexShader:Hm}),this.colorOutput=n,this.luminanceRange=e}set inputBuffer(n){this.uniforms.inputBuffer.value=n}setInputBuffer(n){this.uniforms.inputBuffer.value=n}get threshold(){return this.uniforms.threshold.value}set threshold(n){this.smoothing>0||n>0?this.defines.THRESHOLD="1":delete this.defines.THRESHOLD,this.uniforms.threshold.value=n}getThreshold(){return this.threshold}setThreshold(n){this.threshold=n}get smoothing(){return this.uniforms.smoothing.value}set smoothing(n){this.threshold>0||n>0?this.defines.THRESHOLD="1":delete this.defines.THRESHOLD,this.uniforms.smoothing.value=n}getSmoothingFactor(){return this.smoothing}setSmoothingFactor(n){this.smoothing=n}get useThreshold(){return this.threshold>0||this.smoothing>0}set useThreshold(n){}get colorOutput(){return this.defines.COLOR!==void 0}set colorOutput(n){n?this.defines.COLOR="1":delete this.defines.COLOR,this.needsUpdate=!0}isColorOutputEnabled(n){return this.colorOutput}setColorOutputEnabled(n){this.colorOutput=n}get useRange(){return this.luminanceRange!==null}set useRange(n){this.luminanceRange=null}get luminanceRange(){return this.uniforms.range.value}set luminanceRange(n){n!==null?this.defines.RANGE="1":delete this.defines.RANGE,this.uniforms.range.value=n,this.needsUpdate=!0}getLuminanceRange(){return this.luminanceRange}setLuminanceRange(n){this.luminanceRange=n}},ab=class extends Cn{constructor({renderTarget:n,luminanceRange:e,colorOutput:t,resolutionScale:i=1,width:r=kn.AUTO_SIZE,height:s=kn.AUTO_SIZE,resolutionX:a=r,resolutionY:o=s}={}){super("LuminancePass"),this.fullscreenMaterial=new sb(t,e),this.needsSwap=!1,this.renderTarget=n,this.renderTarget===void 0&&(this.renderTarget=new ci(1,1,{depthBuffer:!1}),this.renderTarget.texture.name="LuminancePass.Target");const l=this.resolution=new kn(this,a,o,i);l.addEventListener("change",c=>this.setSize(l.baseWidth,l.baseHeight))}get texture(){return this.renderTarget.texture}getTexture(){return this.renderTarget.texture}getResolution(){return this.resolution}render(n,e,t,i,r){const s=this.fullscreenMaterial;s.inputBuffer=e.texture,n.setRenderTarget(this.renderToScreen?null:this.renderTarget),n.render(this.scene,this.camera)}setSize(n,e){const t=this.resolution;t.setBaseSize(n,e),this.renderTarget.setSize(t.width,t.height)}initialize(n,e,t){t!==void 0&&t!==Kt&&(this.renderTarget.texture.type=t,this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1")}},ob=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#define WEIGHT_INNER 0.125
#define WEIGHT_OUTER 0.0555555
varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;float clampToBorder(const in vec2 uv){return float(uv.s>=0.0&&uv.s<=1.0&&uv.t>=0.0&&uv.t<=1.0);}void main(){vec4 c=vec4(0.0);vec4 w=WEIGHT_INNER*vec4(clampToBorder(vUv00),clampToBorder(vUv01),clampToBorder(vUv02),clampToBorder(vUv03));c+=w.x*texture2D(inputBuffer,vUv00);c+=w.y*texture2D(inputBuffer,vUv01);c+=w.z*texture2D(inputBuffer,vUv02);c+=w.w*texture2D(inputBuffer,vUv03);w=WEIGHT_OUTER*vec4(clampToBorder(vUv04),clampToBorder(vUv05),clampToBorder(vUv06),clampToBorder(vUv07));c+=w.x*texture2D(inputBuffer,vUv04);c+=w.y*texture2D(inputBuffer,vUv05);c+=w.z*texture2D(inputBuffer,vUv06);c+=w.w*texture2D(inputBuffer,vUv07);w=WEIGHT_OUTER*vec4(clampToBorder(vUv08),clampToBorder(vUv09),clampToBorder(vUv10),clampToBorder(vUv11));c+=w.x*texture2D(inputBuffer,vUv08);c+=w.y*texture2D(inputBuffer,vUv09);c+=w.z*texture2D(inputBuffer,vUv10);c+=w.w*texture2D(inputBuffer,vUv11);c+=WEIGHT_OUTER*texture2D(inputBuffer,vUv);gl_FragColor=c;
#include <colorspace_fragment>
}`,lb="uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;void main(){vUv=position.xy*0.5+0.5;vUv00=vUv+texelSize*vec2(-1.0,1.0);vUv01=vUv+texelSize*vec2(1.0,1.0);vUv02=vUv+texelSize*vec2(-1.0,-1.0);vUv03=vUv+texelSize*vec2(1.0,-1.0);vUv04=vUv+texelSize*vec2(-2.0,2.0);vUv05=vUv+texelSize*vec2(0.0,2.0);vUv06=vUv+texelSize*vec2(2.0,2.0);vUv07=vUv+texelSize*vec2(-2.0,0.0);vUv08=vUv+texelSize*vec2(2.0,0.0);vUv09=vUv+texelSize*vec2(-2.0,-2.0);vUv10=vUv+texelSize*vec2(0.0,-2.0);vUv11=vUv+texelSize*vec2(2.0,-2.0);gl_Position=vec4(position.xy,1.0,1.0);}",cb=class extends _i{constructor(){super({name:"DownsamplingMaterial",uniforms:{inputBuffer:new ft(null),texelSize:new ft(new Ve)},blending:Fi,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:ob,vertexShader:lb})}set inputBuffer(n){this.uniforms.inputBuffer.value=n}setSize(n,e){this.uniforms.texelSize.value.set(1/n,1/e)}},ub=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;uniform mediump sampler2D supportBuffer;
#else
uniform lowp sampler2D inputBuffer;uniform lowp sampler2D supportBuffer;
#endif
uniform float radius;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vec4 c=vec4(0.0);c+=texture2D(inputBuffer,vUv0)*0.0625;c+=texture2D(inputBuffer,vUv1)*0.125;c+=texture2D(inputBuffer,vUv2)*0.0625;c+=texture2D(inputBuffer,vUv3)*0.125;c+=texture2D(inputBuffer,vUv)*0.25;c+=texture2D(inputBuffer,vUv4)*0.125;c+=texture2D(inputBuffer,vUv5)*0.0625;c+=texture2D(inputBuffer,vUv6)*0.125;c+=texture2D(inputBuffer,vUv7)*0.0625;vec4 baseColor=texture2D(supportBuffer,vUv);gl_FragColor=mix(baseColor,c,radius);
#include <colorspace_fragment>
}`,hb="uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vUv=position.xy*0.5+0.5;vUv0=vUv+texelSize*vec2(-1.0,1.0);vUv1=vUv+texelSize*vec2(0.0,1.0);vUv2=vUv+texelSize*vec2(1.0,1.0);vUv3=vUv+texelSize*vec2(-1.0,0.0);vUv4=vUv+texelSize*vec2(1.0,0.0);vUv5=vUv+texelSize*vec2(-1.0,-1.0);vUv6=vUv+texelSize*vec2(0.0,-1.0);vUv7=vUv+texelSize*vec2(1.0,-1.0);gl_Position=vec4(position.xy,1.0,1.0);}",fb=class extends _i{constructor(){super({name:"UpsamplingMaterial",uniforms:{inputBuffer:new ft(null),supportBuffer:new ft(null),texelSize:new ft(new Ve),radius:new ft(.85)},blending:Fi,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:ub,vertexShader:hb})}set inputBuffer(n){this.uniforms.inputBuffer.value=n}set supportBuffer(n){this.uniforms.supportBuffer.value=n}get radius(){return this.uniforms.radius.value}set radius(n){this.uniforms.radius.value=n}setSize(n,e){this.uniforms.texelSize.value.set(1/n,1/e)}},db=class extends Cn{constructor(){super("MipmapBlurPass"),this.needsSwap=!1,this.renderTarget=new ci(1,1,{depthBuffer:!1}),this.renderTarget.texture.name="Upsampling.Mipmap0",this.downsamplingMipmaps=[],this.upsamplingMipmaps=[],this.downsamplingMaterial=new cb,this.upsamplingMaterial=new fb,this.resolution=new Ve}get texture(){return this.renderTarget.texture}get levels(){return this.downsamplingMipmaps.length}set levels(n){if(this.levels!==n){const e=this.renderTarget;this.dispose(),this.downsamplingMipmaps=[],this.upsamplingMipmaps=[];for(let t=0;t<n;++t){const i=e.clone();i.texture.name="Downsampling.Mipmap"+t,this.downsamplingMipmaps.push(i)}this.upsamplingMipmaps.push(e);for(let t=1,i=n-1;t<i;++t){const r=e.clone();r.texture.name="Upsampling.Mipmap"+t,this.upsamplingMipmaps.push(r)}this.setSize(this.resolution.x,this.resolution.y)}}get radius(){return this.upsamplingMaterial.radius}set radius(n){this.upsamplingMaterial.radius=n}render(n,e,t,i,r){const{scene:s,camera:a}=this,{downsamplingMaterial:o,upsamplingMaterial:l}=this,{downsamplingMipmaps:c,upsamplingMipmaps:u}=this;let h=e;this.fullscreenMaterial=o;for(let f=0,d=c.length;f<d;++f){const _=c[f];o.setSize(h.width,h.height),o.inputBuffer=h.texture,n.setRenderTarget(_),n.render(s,a),h=_}this.fullscreenMaterial=l;for(let f=u.length-1;f>=0;--f){const d=u[f];l.setSize(h.width,h.height),l.inputBuffer=h.texture,l.supportBuffer=c[f].texture,n.setRenderTarget(d),n.render(s,a),h=d}}setSize(n,e){const t=this.resolution;t.set(n,e);let i=t.width,r=t.height;for(let s=0,a=this.downsamplingMipmaps.length;s<a;++s)i=Math.round(i*.5),r=Math.round(r*.5),this.downsamplingMipmaps[s].setSize(i,r),s<this.upsamplingMipmaps.length&&this.upsamplingMipmaps[s].setSize(i,r)}initialize(n,e,t){if(t!==void 0){const i=this.downsamplingMipmaps.concat(this.upsamplingMipmaps);for(const r of i)r.texture.type=t;if(t!==Kt)this.downsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1",this.upsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1";else if(n!==null&&n.outputColorSpace===yt)for(const r of i)r.texture.colorSpace=yt}}dispose(){super.dispose();for(const n of this.downsamplingMipmaps.concat(this.upsamplingMipmaps))n.dispose()}},pb=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D map;
#else
uniform lowp sampler2D map;
#endif
uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=texture2D(map,uv)*intensity;}`,mb=class extends Xh{constructor({blendFunction:n=ot.SCREEN,luminanceThreshold:e=1,luminanceSmoothing:t=.03,mipmapBlur:i=!0,intensity:r=1,radius:s=.85,levels:a=8,kernelSize:o=Yh.LARGE,resolutionScale:l=.5,width:c=kn.AUTO_SIZE,height:u=kn.AUTO_SIZE,resolutionX:h=c,resolutionY:f=u}={}){super("BloomEffect",pb,{blendFunction:n,uniforms:new Map([["map",new ft(null)],["intensity",new ft(r)]])}),this.renderTarget=new ci(1,1,{depthBuffer:!1}),this.renderTarget.texture.name="Bloom.Target",this.blurPass=new nb({kernelSize:o}),this.luminancePass=new ab({colorOutput:!0}),this.luminanceMaterial.threshold=e,this.luminanceMaterial.smoothing=t,this.mipmapBlurPass=new db,this.mipmapBlurPass.enabled=i,this.mipmapBlurPass.radius=s,this.mipmapBlurPass.levels=a,this.uniforms.get("map").value=i?this.mipmapBlurPass.texture:this.renderTarget.texture;const d=this.resolution=new kn(this,h,f,l);d.addEventListener("change",_=>this.setSize(d.baseWidth,d.baseHeight))}get texture(){return this.mipmapBlurPass.enabled?this.mipmapBlurPass.texture:this.renderTarget.texture}getTexture(){return this.texture}getResolution(){return this.resolution}getBlurPass(){return this.blurPass}getLuminancePass(){return this.luminancePass}get luminanceMaterial(){return this.luminancePass.fullscreenMaterial}getLuminanceMaterial(){return this.luminancePass.fullscreenMaterial}get width(){return this.resolution.width}set width(n){this.resolution.preferredWidth=n}get height(){return this.resolution.height}set height(n){this.resolution.preferredHeight=n}get dithering(){return this.blurPass.dithering}set dithering(n){this.blurPass.dithering=n}get kernelSize(){return this.blurPass.kernelSize}set kernelSize(n){this.blurPass.kernelSize=n}get distinction(){return console.warn(this.name,"distinction was removed"),1}set distinction(n){console.warn(this.name,"distinction was removed")}get intensity(){return this.uniforms.get("intensity").value}set intensity(n){this.uniforms.get("intensity").value=n}getIntensity(){return this.intensity}setIntensity(n){this.intensity=n}getResolutionScale(){return this.resolution.scale}setResolutionScale(n){this.resolution.scale=n}update(n,e,t){const i=this.renderTarget,r=this.luminancePass;r.enabled?(r.render(n,e),this.mipmapBlurPass.enabled?this.mipmapBlurPass.render(n,r.renderTarget):this.blurPass.render(n,r.renderTarget,i)):this.mipmapBlurPass.enabled?this.mipmapBlurPass.render(n,e):this.blurPass.render(n,e,i)}setSize(n,e){const t=this.resolution;t.setBaseSize(n,e),this.renderTarget.setSize(t.width,t.height),this.blurPass.resolution.copy(t),this.luminancePass.setSize(n,e),this.mipmapBlurPass.setSize(n,e)}initialize(n,e,t){this.blurPass.initialize(n,e,t),this.luminancePass.initialize(n,e,t),this.mipmapBlurPass.initialize(n,e,t),t!==void 0&&(this.renderTarget.texture.type=t,n!==null&&n.outputColorSpace===yt&&(this.renderTarget.texture.colorSpace=yt))}},gb=class extends Cn{constructor(n,e,t=null){super("RenderPass",n,e),this.needsSwap=!1,this.clearPass=new Gm,this.overrideMaterialManager=t===null?null:new Ud(t),this.ignoreBackground=!1,this.skipShadowMapUpdate=!1,this.selection=null}set mainScene(n){this.scene=n}set mainCamera(n){this.camera=n}get renderToScreen(){return super.renderToScreen}set renderToScreen(n){super.renderToScreen=n,this.clearPass.renderToScreen=n}get overrideMaterial(){const n=this.overrideMaterialManager;return n!==null?n.material:null}set overrideMaterial(n){const e=this.overrideMaterialManager;n!==null?e!==null?e.setMaterial(n):this.overrideMaterialManager=new Ud(n):e!==null&&(e.dispose(),this.overrideMaterialManager=null)}getOverrideMaterial(){return this.overrideMaterial}setOverrideMaterial(n){this.overrideMaterial=n}get clear(){return this.clearPass.enabled}set clear(n){this.clearPass.enabled=n}getSelection(){return this.selection}setSelection(n){this.selection=n}isBackgroundDisabled(){return this.ignoreBackground}setBackgroundDisabled(n){this.ignoreBackground=n}isShadowMapDisabled(){return this.skipShadowMapUpdate}setShadowMapDisabled(n){this.skipShadowMapUpdate=n}getClearPass(){return this.clearPass}render(n,e,t,i,r){const s=this.scene,a=this.camera,o=this.selection,l=a.layers.mask,c=s.background,u=n.shadowMap.autoUpdate,h=this.renderToScreen?null:e;o!==null&&a.layers.set(o.getLayer()),this.skipShadowMapUpdate&&(n.shadowMap.autoUpdate=!1),(this.ignoreBackground||this.clearPass.overrideClearColor!==null)&&(s.background=null),this.clearPass.enabled&&this.clearPass.render(n,e),n.setRenderTarget(h),this.overrideMaterialManager!==null?this.overrideMaterialManager.render(n,s,a):n.render(s,a),a.layers.mask=l,s.background=c,n.shadowMap.autoUpdate=u}},Ta={DEFAULT:0,ESKIL:1},_b=`void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 noise=vec3(rand(uv*(1.0+time)));
#ifdef PREMULTIPLY
outputColor=vec4(min(inputColor.rgb*noise,vec3(1.0)),inputColor.a);
#else
outputColor=vec4(noise,inputColor.a);
#endif
}`,vb=class extends Xh{constructor({blendFunction:n=ot.SCREEN,premultiply:e=!1}={}){super("NoiseEffect",_b,{blendFunction:n}),this.premultiply=e}get premultiply(){return this.defines.has("PREMULTIPLY")}set premultiply(n){this.premultiply!==n&&(n?this.defines.set("PREMULTIPLY","1"):this.defines.delete("PREMULTIPLY"),this.setChanged())}isPremultiplied(){return this.premultiply}setPremultiplied(n){this.premultiply=n}},xb=`uniform float offset;uniform float darkness;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){const vec2 center=vec2(0.5);vec3 color=inputColor.rgb;
#if VIGNETTE_TECHNIQUE == 0
float d=distance(uv,center);color*=smoothstep(0.8,offset*0.799,d*(darkness+offset));
#else
vec2 coord=(uv-center)*vec2(offset);color=mix(color,vec3(1.0-darkness),dot(coord,coord));
#endif
outputColor=vec4(color,inputColor.a);}`,Sb=class extends Xh{constructor({blendFunction:n,eskil:e=!1,technique:t=e?Ta.ESKIL:Ta.DEFAULT,offset:i=.5,darkness:r=.5}={}){super("VignetteEffect",xb,{blendFunction:n,defines:new Map([["VIGNETTE_TECHNIQUE",t.toFixed(0)]]),uniforms:new Map([["offset",new ft(i)],["darkness",new ft(r)]])})}get technique(){return Number(this.defines.get("VIGNETTE_TECHNIQUE"))}set technique(n){this.technique!==n&&(this.defines.set("VIGNETTE_TECHNIQUE",n.toFixed(0)),this.setChanged())}get eskil(){return this.technique===Ta.ESKIL}set eskil(n){this.technique=n?Ta.ESKIL:Ta.DEFAULT}getTechnique(){return this.technique}setTechnique(n){this.technique=n}get offset(){return this.uniforms.get("offset").value}set offset(n){this.uniforms.get("offset").value=n}getOffset(){return this.offset}setOffset(n){this.offset=n}get darkness(){return this.uniforms.get("darkness").value}set darkness(n){this.uniforms.get("darkness").value=n}getDarkness(){return this.darkness}setDarkness(n){this.darkness=n}},Mb=`#include <common>
#include <packing>
#include <dithering_pars_fragment>
#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#if DEPTH_PACKING == 3201
uniform lowp sampler2D depthBuffer;
#elif defined(GL_FRAGMENT_PRECISION_HIGH)
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;vec4 sRGBToLinear(const in vec4 value){return vec4(mix(pow(value.rgb*0.9478672986+vec3(0.0521327014),vec3(2.4)),value.rgb*0.0773993808,vec3(lessThanEqual(value.rgb,vec3(0.04045)))),value.a);}float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
float depth=unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
float depth=texture2D(depthBuffer,uv).r;
#endif
#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)
float d=pow(2.0,depth*log2(cameraFar+1.0))-1.0;float a=cameraFar/(cameraFar-cameraNear);float b=cameraFar*cameraNear/(cameraNear-cameraFar);depth=a+b/d;
#elif defined(USE_REVERSED_DEPTH_BUFFER)
depth=1.0-depth;
#endif
return depth;}float getViewZ(const in float depth){
#ifdef PERSPECTIVE_CAMERA
return perspectiveDepthToViewZ(depth,cameraNear,cameraFar);
#else
return orthographicDepthToViewZ(depth,cameraNear,cameraFar);
#endif
}vec3 RGBToHCV(const in vec3 RGB){vec4 P=mix(vec4(RGB.bg,-1.0,2.0/3.0),vec4(RGB.gb,0.0,-1.0/3.0),step(RGB.b,RGB.g));vec4 Q=mix(vec4(P.xyw,RGB.r),vec4(RGB.r,P.yzx),step(P.x,RGB.r));float C=Q.x-min(Q.w,Q.y);float H=abs((Q.w-Q.y)/(6.0*C+EPSILON)+Q.z);return vec3(H,C,Q.x);}vec3 RGBToHSL(const in vec3 RGB){vec3 HCV=RGBToHCV(RGB);float L=HCV.z-HCV.y*0.5;float S=HCV.y/(1.0-abs(L*2.0-1.0)+EPSILON);return vec3(HCV.x,S,L);}vec3 HueToRGB(const in float H){float R=abs(H*6.0-3.0)-1.0;float G=2.0-abs(H*6.0-2.0);float B=2.0-abs(H*6.0-4.0);return clamp(vec3(R,G,B),0.0,1.0);}vec3 HSLToRGB(const in vec3 HSL){vec3 RGB=HueToRGB(HSL.x);float C=(1.0-abs(2.0*HSL.z-1.0))*HSL.y;return(RGB-0.5)*C+HSL.z;}FRAGMENT_HEAD void main(){FRAGMENT_MAIN_UV vec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGE color0.a=clamp(color0.a,0.0,1.0);gl_FragColor=color0;
#ifdef ENCODE_OUTPUT
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
}`,Eb="uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEAD void main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORT gl_Position=vec4(position.xy,1.0,1.0);}",yb=class extends _i{constructor(n,e,t,i,r=!1){super({name:"EffectMaterial",defines:{THREE_REVISION:lo.replace(/\D+/g,""),DEPTH_PACKING:"0",ENCODE_OUTPUT:"1"},uniforms:{inputBuffer:new ft(null),depthBuffer:new ft(null),resolution:new ft(new Ve),texelSize:new ft(new Ve),cameraNear:new ft(.3),cameraFar:new ft(1e3),aspect:new ft(1),time:new ft(0)},blending:Fi,toneMapped:!1,depthWrite:!1,depthTest:!1,dithering:r}),n&&this.setShaderParts(n),e&&this.setDefines(e),t&&this.setUniforms(t),this.copyCameraSettings(i)}set inputBuffer(n){this.uniforms.inputBuffer.value=n}setInputBuffer(n){this.uniforms.inputBuffer.value=n}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(n){this.uniforms.depthBuffer.value=n}get depthPacking(){return Number(this.defines.DEPTH_PACKING)}set depthPacking(n){this.defines.DEPTH_PACKING=n.toFixed(0),this.needsUpdate=!0}setDepthBuffer(n,e=co){this.depthBuffer=n,this.depthPacking=e}setShaderData(n){this.setShaderParts(n.shaderParts),this.setDefines(n.defines),this.setUniforms(n.uniforms),this.setExtensions(n.extensions)}setShaderParts(n){return this.fragmentShader=Mb.replace(_t.FRAGMENT_HEAD,n.get(_t.FRAGMENT_HEAD)||"").replace(_t.FRAGMENT_MAIN_UV,n.get(_t.FRAGMENT_MAIN_UV)||"").replace(_t.FRAGMENT_MAIN_IMAGE,n.get(_t.FRAGMENT_MAIN_IMAGE)||""),this.vertexShader=Eb.replace(_t.VERTEX_HEAD,n.get(_t.VERTEX_HEAD)||"").replace(_t.VERTEX_MAIN_SUPPORT,n.get(_t.VERTEX_MAIN_SUPPORT)||""),this.needsUpdate=!0,this}setDefines(n){for(const e of n.entries())this.defines[e[0]]=e[1];return this.needsUpdate=!0,this}setUniforms(n){for(const e of n.entries())this.uniforms[e[0]]=e[1];return this}setExtensions(n){this.extensions={};for(const e of n)this.extensions[e]=!0;return this}get encodeOutput(){return this.defines.ENCODE_OUTPUT!==void 0}set encodeOutput(n){this.encodeOutput!==n&&(n?this.defines.ENCODE_OUTPUT="1":delete this.defines.ENCODE_OUTPUT,this.needsUpdate=!0)}isOutputEncodingEnabled(n){return this.encodeOutput}setOutputEncodingEnabled(n){this.encodeOutput=n}get time(){return this.uniforms.time.value}set time(n){this.uniforms.time.value=n}setDeltaTime(n){this.uniforms.time.value+=n}adoptCameraSettings(n){this.copyCameraSettings(n)}copyCameraSettings(n){n&&(this.uniforms.cameraNear.value=n.near,this.uniforms.cameraFar.value=n.far,n instanceof tn?this.defines.PERSPECTIVE_CAMERA="1":delete this.defines.PERSPECTIVE_CAMERA,this.needsUpdate=!0)}setSize(n,e){const t=this.uniforms;t.resolution.value.set(n,e),t.texelSize.value.set(1/n,1/e),t.aspect.value=n/e}static get Section(){return _t}};function Id(n,e,t){for(const i of e){const r="$1"+n+i.charAt(0).toUpperCase()+i.slice(1),s=new RegExp("([^\\.])(\\b"+i+"\\b)","g");for(const a of t.entries())a[1]!==null&&t.set(a[0],a[1].replace(s,r))}}function bb(n,e,t){let i=e.getFragmentShader(),r=e.getVertexShader();const s=i!==void 0&&/mainImage/.test(i),a=i!==void 0&&/mainUv/.test(i);if(t.attributes|=e.getAttributes(),i===void 0)throw new Error(`Missing fragment shader (${e.name})`);if(a&&(t.attributes&us.CONVOLUTION)!==0)throw new Error(`Effects that transform UVs are incompatible with convolution effects (${e.name})`);if(!s&&!a)throw new Error(`Could not find mainImage or mainUv function (${e.name})`);{const o=/\w+\s+(\w+)\([\w\s,]*\)\s*{/g,l=t.shaderParts;let c=l.get(_t.FRAGMENT_HEAD)||"",u=l.get(_t.FRAGMENT_MAIN_UV)||"",h=l.get(_t.FRAGMENT_MAIN_IMAGE)||"",f=l.get(_t.VERTEX_HEAD)||"",d=l.get(_t.VERTEX_MAIN_SUPPORT)||"";const _=new Set,g=new Set;if(a&&(u+=`	${n}MainUv(UV);
`,t.uvTransformation=!0),r!==null&&/mainSupport/.test(r)){const x=/mainSupport *\([\w\s]*?uv\s*?\)/.test(r);d+=`	${n}MainSupport(`,d+=x?`vUv);
`:`);
`;for(const y of r.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g))for(const M of y[1].split(/\s*,\s*/))t.varyings.add(M),_.add(M),g.add(M);for(const y of r.matchAll(o))g.add(y[1])}for(const x of i.matchAll(o))g.add(x[1]);for(const x of e.defines.keys())g.add(x.replace(/\([\w\s,]*\)/g,""));for(const x of e.uniforms.keys())g.add(x);g.delete("while"),g.delete("for"),g.delete("if"),e.uniforms.forEach((x,y)=>t.uniforms.set(n+y.charAt(0).toUpperCase()+y.slice(1),x)),e.defines.forEach((x,y)=>t.defines.set(n+y.charAt(0).toUpperCase()+y.slice(1),x));const m=new Map([["fragment",i],["vertex",r]]);Id(n,g,t.defines),Id(n,g,m),i=m.get("fragment"),r=m.get("vertex");const p=e.blendMode;if(t.blendModes.set(p.blendFunction,p),s){e.inputColorSpace!==null&&e.inputColorSpace!==t.colorSpace&&(h+=e.inputColorSpace===yt?`color0 = sRGBTransferOETF(color0);
	`:`color0 = sRGBToLinear(color0);
	`),e.outputColorSpace!==In?t.colorSpace=e.outputColorSpace:e.inputColorSpace!==null&&(t.colorSpace=e.inputColorSpace);const x=/MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;h+=`${n}MainImage(color0, UV, `,(t.attributes&us.DEPTH)!==0&&x.test(i)&&(h+="depth, ",t.readDepth=!0),h+=`color1);
	`;const y=n+"BlendOpacity";t.uniforms.set(y,p.opacity),h+=`color0 = blend${p.blendFunction}(color0, color1, ${y});

	`,c+=`uniform float ${y};

`}if(c+=i+`
`,r!==null&&(f+=r+`
`),l.set(_t.FRAGMENT_HEAD,c),l.set(_t.FRAGMENT_MAIN_UV,u),l.set(_t.FRAGMENT_MAIN_IMAGE,h),l.set(_t.VERTEX_HEAD,f),l.set(_t.VERTEX_MAIN_SUPPORT,d),e.extensions!==null)for(const x of e.extensions)t.extensions.add(x)}}var Tb=class extends Cn{constructor(n,...e){super("EffectPass"),this.fullscreenMaterial=new yb(null,null,null,n),this.listener=t=>this.handleEvent(t),this.effects=[],this.setEffects(e),this.skipRendering=!1,this.minTime=1,this.maxTime=Number.POSITIVE_INFINITY,this.timeScale=1}set mainScene(n){for(const e of this.effects)e.mainScene=n}set mainCamera(n){this.fullscreenMaterial.copyCameraSettings(n);for(const e of this.effects)e.mainCamera=n}get encodeOutput(){return this.fullscreenMaterial.encodeOutput}set encodeOutput(n){this.fullscreenMaterial.encodeOutput=n}get dithering(){return this.fullscreenMaterial.dithering}set dithering(n){const e=this.fullscreenMaterial;e.dithering=n,e.needsUpdate=!0}setEffects(n){for(const e of this.effects)e.removeEventListener("change",this.listener);this.effects=n.sort((e,t)=>t.attributes-e.attributes);for(const e of this.effects)e.addEventListener("change",this.listener)}updateMaterial(){const n=new vy;let e=0;for(const a of this.effects)if(a.blendMode.blendFunction===ot.DST)n.attributes|=a.getAttributes()&us.DEPTH;else{if((n.attributes&a.getAttributes()&us.CONVOLUTION)!==0)throw new Error(`Convolution effects cannot be merged (${a.name})`);bb("e"+e++,a,n)}let t=n.shaderParts.get(_t.FRAGMENT_HEAD),i=n.shaderParts.get(_t.FRAGMENT_MAIN_IMAGE),r=n.shaderParts.get(_t.FRAGMENT_MAIN_UV);const s=/\bblend\b/g;for(const a of n.blendModes.values())t+=a.getShaderCode().replace(s,`blend${a.blendFunction}`)+`
`;(n.attributes&us.DEPTH)!==0?(n.readDepth&&(i=`float depth = readDepth(UV);

	`+i),this.needsDepthTexture=this.getDepthTexture()===null):this.needsDepthTexture=!1,n.colorSpace===yt&&(i+=`color0 = sRGBToLinear(color0);
	`),n.uvTransformation?(r=`vec2 transformedUv = vUv;
`+r,n.defines.set("UV","transformedUv")):n.defines.set("UV","vUv"),n.shaderParts.set(_t.FRAGMENT_HEAD,t),n.shaderParts.set(_t.FRAGMENT_MAIN_IMAGE,i),n.shaderParts.set(_t.FRAGMENT_MAIN_UV,r);for(const[a,o]of n.shaderParts)o!==null&&n.shaderParts.set(a,o.trim().replace(/^#/,`
#`));this.skipRendering=e===0,this.needsSwap=!this.skipRendering,this.fullscreenMaterial.setShaderData(n)}recompile(){this.updateMaterial()}getDepthTexture(){return this.fullscreenMaterial.depthBuffer}setDepthTexture(n,e=co){this.fullscreenMaterial.depthBuffer=n,this.fullscreenMaterial.depthPacking=e;for(const t of this.effects)t.setDepthTexture(n,e)}render(n,e,t,i,r){for(const s of this.effects)s.update(n,e,i);if(!this.skipRendering||this.renderToScreen){const s=this.fullscreenMaterial;s.inputBuffer=e.texture,s.time+=i*this.timeScale,n.setRenderTarget(this.renderToScreen?null:t),n.render(this.scene,this.camera)}}setSize(n,e){this.fullscreenMaterial.setSize(n,e);for(const t of this.effects)t.setSize(n,e)}initialize(n,e,t){this.renderer=n;for(const i of this.effects)i.initialize(n,e,t);this.updateMaterial(),t!==void 0&&t!==Kt&&(this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1")}dispose(){super.dispose();for(const n of this.effects)n.removeEventListener("change",this.listener),n.dispose()}handleEvent(n){n.type==="change"&&this.recompile()}};nr.registerPlugin(at);const tr=document.getElementById("scene"),vs=new Tu;vs.fog=new dh(725792,16,72);const fa=new tn(48,tr.clientWidth/tr.clientHeight,.1,200);fa.position.set(18,14,22);const wb=new l_(9029119,.6);vs.add(wb);const $h=new up(13103871,1.25);$h.position.set(14,22,10);vs.add($h);const Wm=new up(3585791,.75);Wm.position.set(-18,10,-16);vs.add(Wm);const qh=new fi(new mh(34,80),new Na({color:661027,roughness:.9,metalness:.08}));qh.rotation.x=-Math.PI/2;qh.position.y=-.02;vs.add(qh);let jr=null,Ka=null,eh=null,th=null,Fl=!0;try{jr=new sM({antialias:!0,alpha:!0}),jr.setPixelRatio(Math.min(window.devicePixelRatio,2)),jr.setSize(tr.clientWidth,tr.clientHeight),jr.outputColorSpace=yt,tr.appendChild(jr.domElement),Ka=new _y(jr),Ka.addPass(new gb(vs,fa)),eh=new mb({intensity:.65,luminanceThreshold:.22,mipmapBlur:!0}),th=new vb({premultiply:!0,blendFunction:1});const n=new Sb({eskil:!1,offset:.28,darkness:.5});Ka.addPass(new Tb(fa,eh,th,n))}catch{Fl=!1,tr.classList.add("scene-fallback"),tr.innerHTML='<div class="fallback-note">WebGL unavailable in this browser context.</div>'}const Js=new ks;vs.add(Js);function Ab(n){const e=new ks,t=n.building,i=n.windows,r=new fi(new fs(n.ground.width,n.ground.height,n.ground.depth),new Na({color:1057592,roughness:.7,metalness:.2}));r.position.y=n.ground.height/2,e.add(r);const s=new n_({color:new tt(t.wallColor),roughness:.22,metalness:.22,clearcoat:1,clearcoatRoughness:.2,transmission:.08}),a=new Na({color:new tt(t.glassColor),emissive:new tt(t.glassColor),emissiveIntensity:.16,roughness:.1,metalness:.6});let o=t.width,l=t.depth;for(let h=0;h<t.floors;h+=1){h>0&&h%t.setbackEvery===0&&(o=Math.max(o-t.setbackAmount,4.6),l=Math.max(l-t.setbackAmount,4.2));const f=n.ground.height+t.floorHeight*(h+.5),d=new fi(new fs(o,t.floorHeight,l),s);d.position.set(0,f,0),e.add(d);const _=l/2+i.inset,g=-l/2-i.inset;for(let m=0;m<i.rowsPerFloor;m+=1){const p=n.ground.height+t.floorHeight*h+.68+m*1.08;for(let x=0;x<i.columnsFront;x+=1){const y=-o/2+(x+1)*o/(i.columnsFront+1),M=new po(i.windowWidth,i.windowHeight),T=new fi(M,a);T.position.set(y,p,_),e.add(T);const A=new fi(M,a);A.position.set(y,p,g),A.rotation.y=Math.PI,e.add(A)}}}const c=new fi(new gh(1.5,2.4,4.6,20),new Na({color:5032447,emissive:1797554,emissiveIntensity:.5}));c.position.y=n.ground.height+t.floors*t.floorHeight+2.1,e.add(c);const u=new fi(new _h(2.4,.08,18,50),new fh({color:8246268}));return u.rotation.x=Math.PI/2,u.position.y=c.position.y-1.4,e.add(u),e}async function Rb(){const e=await(await fetch("/examples/lab/concepts/terminal-3d/data/building.json")).json();Js.add(Ab(e)),nr.timeline({defaults:{ease:"power2.out"}}).from(".site-header",{y:-24,opacity:0,duration:.7}).from(".eyebrow",{y:12,opacity:0,stagger:.12,duration:.6},"-=0.35").from("h1",{y:18,opacity:0,duration:.8},"-=0.3").from(".lead",{y:18,opacity:0,duration:.6},"-=0.45").from("#scene",{scale:.98,opacity:0,duration:.9},"-=0.45"),nr.to(Js.rotation,{y:Math.PI*.82,ease:"none",scrollTrigger:{trigger:"#story-3",start:"top bottom",end:"bottom top",scrub:1}}),nr.to(fa.position,{x:8,y:16,z:14,ease:"none",scrollTrigger:{trigger:"#story-2",start:"top bottom",end:"bottom top",scrub:1}}),nr.to(".split",{opacity:1,y:0,stagger:.16,ease:"power2.out",scrollTrigger:{trigger:"#story-1",start:"top 80%"}})}function Cb(){if(!Fl)return;const n=tr.clientWidth,e=tr.clientHeight;fa.aspect=n/e,fa.updateProjectionMatrix(),jr.setSize(n,e),Ka.setSize(n,e)}const Xm=new pM({duration:1.05,smoothWheel:!0,wheelMultiplier:.95});Xm.on("scroll",at.update);nr.ticker.add(n=>{Xm.raf(n*1e3)});nr.ticker.lagSmoothing(0);const Al={x:0,y:0};window.addEventListener("pointermove",n=>{Al.x=(n.clientX/window.innerWidth-.5)*2,Al.y=(n.clientY/window.innerHeight-.5)*2});const hl={bloomIntensity:.65,sceneSpin:.08,grain:.15},Ko=new Wh({width:260,title:"Creative Tuning"});Fl?(Ko.add(hl,"bloomIntensity",0,1.5,.01).onChange(n=>{eh.intensity=n}),Ko.add(hl,"sceneSpin",0,.6,.01),Ko.add(hl,"grain",0,.6,.01).onChange(n=>{th.blendMode.opacity.value=n})):Ko.hide();function Ym(){const n=performance.now()*.001;Js.rotation.y+=hl.sceneSpin*.0018,Js.rotation.x=Al.y*.03,Js.position.x=Al.x*.4,$h.intensity=1+Math.sin(n*.7)*.12,Fl&&Ka.render(),requestAnimationFrame(Ym)}window.addEventListener("resize",Cb);nr.set(".split",{opacity:0,y:36});Rb();Ym();
