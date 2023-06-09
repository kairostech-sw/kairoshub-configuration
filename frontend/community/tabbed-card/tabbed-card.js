/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const D=window,J=D.ShadowRoot&&(D.ShadyCSS===void 0||D.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol(),tt=new WeakMap;let ft=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==Q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(J&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=tt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&tt.set(e,t))}return t}toString(){return this.cssText}};const At=i=>new ft(typeof i=="string"?i:i+"",void 0,Q),X=(i,...t)=>{const e=i.length===1?i[0]:t.reduce((s,o,n)=>s+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+i[n+1],i[0]);return new ft(e,i,Q)},St=(i,t)=>{J?i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(e=>{const s=document.createElement("style"),o=D.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=e.cssText,i.appendChild(s)})},et=J?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return At(e)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var V;const j=window,it=j.trustedTypes,wt=it?it.emptyScript:"",st=j.reactiveElementPolyfillSupport,Y={toAttribute(i,t){switch(t){case Boolean:i=i?wt:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},gt=(i,t)=>t!==i&&(t==t||i==i),W={attribute:!0,type:String,converter:Y,reflect:!1,hasChanged:gt};let T=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(t){var e;this.finalize(),((e=this.h)!==null&&e!==void 0?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,s)=>{const o=this._$Ep(s,e);o!==void 0&&(this._$Ev.set(o,s),t.push(o))}),t}static createProperty(t,e=W){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const s=typeof t=="symbol"?Symbol():"__"+t,o=this.getPropertyDescriptor(t,s,e);o!==void 0&&Object.defineProperty(this.prototype,t,o)}}static getPropertyDescriptor(t,e,s){return{get(){return this[e]},set(o){const n=this[t];this[e]=o,this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||W}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),t.h!==void 0&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,s=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const o of s)this.createProperty(o,e[o])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const o of s)e.unshift(et(o))}else t!==void 0&&e.push(et(t));return e}static _$Ep(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(t=this.constructor.h)===null||t===void 0||t.forEach(e=>e(this))}addController(t){var e,s;((e=this._$ES)!==null&&e!==void 0?e:this._$ES=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&((s=t.hostConnected)===null||s===void 0||s.call(t))}removeController(t){var e;(e=this._$ES)===null||e===void 0||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const e=(t=this.shadowRoot)!==null&&t!==void 0?t:this.attachShadow(this.constructor.shadowRootOptions);return St(e,this.constructor.elementStyles),e}connectedCallback(){var t;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$ES)===null||t===void 0||t.forEach(e=>{var s;return(s=e.hostConnected)===null||s===void 0?void 0:s.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$ES)===null||t===void 0||t.forEach(e=>{var s;return(s=e.hostDisconnected)===null||s===void 0?void 0:s.call(e)})}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$EO(t,e,s=W){var o;const n=this.constructor._$Ep(t,s);if(n!==void 0&&s.reflect===!0){const r=(((o=s.converter)===null||o===void 0?void 0:o.toAttribute)!==void 0?s.converter:Y).toAttribute(e,s.type);this._$El=t,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$El=null}}_$AK(t,e){var s;const o=this.constructor,n=o._$Ev.get(t);if(n!==void 0&&this._$El!==n){const r=o.getPropertyOptions(n),c=typeof r.converter=="function"?{fromAttribute:r.converter}:((s=r.converter)===null||s===void 0?void 0:s.fromAttribute)!==void 0?r.converter:Y;this._$El=n,this[n]=c.fromAttribute(e,r.type),this._$El=null}}requestUpdate(t,e,s){let o=!0;t!==void 0&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||gt)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),s.reflect===!0&&this._$El!==t&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(t,s))):o=!1),!this.isUpdatePending&&o&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((o,n)=>this[n]=o),this._$Ei=void 0);let e=!1;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),(t=this._$ES)===null||t===void 0||t.forEach(o=>{var n;return(n=o.hostUpdate)===null||n===void 0?void 0:n.call(o)}),this.update(s)):this._$Ek()}catch(o){throw e=!1,this._$Ek(),o}e&&this._$AE(s)}willUpdate(t){}_$AE(t){var e;(e=this._$ES)===null||e===void 0||e.forEach(s=>{var o;return(o=s.hostUpdated)===null||o===void 0?void 0:o.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){this._$EC!==void 0&&(this._$EC.forEach((e,s)=>this._$EO(s,this[s],e)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};T.finalized=!0,T.elementProperties=new Map,T.elementStyles=[],T.shadowRootOptions={mode:"open"},st==null||st({ReactiveElement:T}),((V=j.reactiveElementVersions)!==null&&V!==void 0?V:j.reactiveElementVersions=[]).push("1.6.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var q;const G=window,O=G.trustedTypes,ot=O?O.createPolicy("lit-html",{createHTML:i=>i}):void 0,E=`lit$${(Math.random()+"").slice(9)}$`,vt="?"+E,Tt=`<${vt}>`,U=document,k=(i="")=>U.createComment(i),R=i=>i===null||typeof i!="object"&&typeof i!="function",mt=Array.isArray,xt=i=>mt(i)||typeof(i==null?void 0:i[Symbol.iterator])=="function",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,nt=/-->/g,rt=/>/g,S=RegExp(`>|[ 	
\f\r](?:([^\\s"'>=/]+)([ 	
\f\r]*=[ 	
\f\r]*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),at=/'/g,lt=/"/g,$t=/^(?:script|style|textarea|title)$/i,Pt=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),b=Pt(1),w=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),ct=new WeakMap,x=U.createTreeWalker(U,129,null,!1),Ot=(i,t)=>{const e=i.length-1,s=[];let o,n=t===2?"<svg>":"",r=I;for(let a=0;a<e;a++){const l=i[a];let u,d,h=-1,_=0;for(;_<l.length&&(r.lastIndex=_,d=r.exec(l),d!==null);)_=r.lastIndex,r===I?d[1]==="!--"?r=nt:d[1]!==void 0?r=rt:d[2]!==void 0?($t.test(d[2])&&(o=RegExp("</"+d[2],"g")),r=S):d[3]!==void 0&&(r=S):r===S?d[0]===">"?(r=o??I,h=-1):d[1]===void 0?h=-2:(h=r.lastIndex-d[2].length,u=d[1],r=d[3]===void 0?S:d[3]==='"'?lt:at):r===lt||r===at?r=S:r===nt||r===rt?r=I:(r=S,o=void 0);const $=r===S&&i[a+1].startsWith("/>")?" ":"";n+=r===I?l+Tt:h>=0?(s.push(u),l.slice(0,h)+"$lit$"+l.slice(h)+E+$):l+E+(h===-2?(s.push(void 0),a):$)}const c=n+(i[e]||"<?>")+(t===2?"</svg>":"");if(!Array.isArray(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return[ot!==void 0?ot.createHTML(c):c,s]};class H{constructor({strings:t,_$litType$:e},s){let o;this.parts=[];let n=0,r=0;const c=t.length-1,a=this.parts,[l,u]=Ot(t,e);if(this.el=H.createElement(l,s),x.currentNode=this.el.content,e===2){const d=this.el.content,h=d.firstChild;h.remove(),d.append(...h.childNodes)}for(;(o=x.nextNode())!==null&&a.length<c;){if(o.nodeType===1){if(o.hasAttributes()){const d=[];for(const h of o.getAttributeNames())if(h.endsWith("$lit$")||h.startsWith(E)){const _=u[r++];if(d.push(h),_!==void 0){const $=o.getAttribute(_.toLowerCase()+"$lit$").split(E),y=/([.?@])?(.*)/.exec(_);a.push({type:1,index:n,name:y[2],strings:$,ctor:y[1]==="."?Mt:y[1]==="?"?Nt:y[1]==="@"?kt:z})}else a.push({type:6,index:n})}for(const h of d)o.removeAttribute(h)}if($t.test(o.tagName)){const d=o.textContent.split(E),h=d.length-1;if(h>0){o.textContent=O?O.emptyScript:"";for(let _=0;_<h;_++)o.append(d[_],k()),x.nextNode(),a.push({type:2,index:++n});o.append(d[h],k())}}}else if(o.nodeType===8)if(o.data===vt)a.push({type:2,index:n});else{let d=-1;for(;(d=o.data.indexOf(E,d+1))!==-1;)a.push({type:7,index:n}),d+=E.length-1}n++}}static createElement(t,e){const s=U.createElement("template");return s.innerHTML=t,s}}function M(i,t,e=i,s){var o,n,r,c;if(t===w)return t;let a=s!==void 0?(o=e._$Co)===null||o===void 0?void 0:o[s]:e._$Cl;const l=R(t)?void 0:t._$litDirective$;return(a==null?void 0:a.constructor)!==l&&((n=a==null?void 0:a._$AO)===null||n===void 0||n.call(a,!1),l===void 0?a=void 0:(a=new l(i),a._$AT(i,e,s)),s!==void 0?((r=(c=e)._$Co)!==null&&r!==void 0?r:c._$Co=[])[s]=a:e._$Cl=a),a!==void 0&&(t=M(i,a._$AS(i,t.values),a,s)),t}class Ut{constructor(t,e){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var e;const{el:{content:s},parts:o}=this._$AD,n=((e=t==null?void 0:t.creationScope)!==null&&e!==void 0?e:U).importNode(s,!0);x.currentNode=n;let r=x.nextNode(),c=0,a=0,l=o[0];for(;l!==void 0;){if(c===l.index){let u;l.type===2?u=new L(r,r.nextSibling,this,t):l.type===1?u=new l.ctor(r,l.name,l.strings,this,t):l.type===6&&(u=new Rt(r,this,t)),this.u.push(u),l=o[++a]}c!==(l==null?void 0:l.index)&&(r=x.nextNode(),c++)}return n}p(t){let e=0;for(const s of this.u)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class L{constructor(t,e,s,o){var n;this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=o,this._$Cm=(n=o==null?void 0:o.isConnected)===null||n===void 0||n}get _$AU(){var t,e;return(e=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&e!==void 0?e:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=M(this,t,e),R(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==w&&this.g(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):xt(t)?this.k(t):this.g(t)}O(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}g(t){this._$AH!==p&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(U.createTextNode(t)),this._$AH=t}$(t){var e;const{values:s,_$litType$:o}=t,n=typeof o=="number"?this._$AC(t):(o.el===void 0&&(o.el=H.createElement(o.h,this.options)),o);if(((e=this._$AH)===null||e===void 0?void 0:e._$AD)===n)this._$AH.p(s);else{const r=new Ut(n,this),c=r.v(this.options);r.p(s),this.T(c),this._$AH=r}}_$AC(t){let e=ct.get(t.strings);return e===void 0&&ct.set(t.strings,e=new H(t)),e}k(t){mt(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,o=0;for(const n of t)o===e.length?e.push(s=new L(this.O(k()),this.O(k()),this,this.options)):s=e[o],s._$AI(n),o++;o<e.length&&(this._$AR(s&&s._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,e);t&&t!==this._$AB;){const o=t.nextSibling;t.remove(),t=o}}setConnected(t){var e;this._$AM===void 0&&(this._$Cm=t,(e=this._$AP)===null||e===void 0||e.call(this,t))}}class z{constructor(t,e,s,o,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=p}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,s,o){const n=this.strings;let r=!1;if(n===void 0)t=M(this,t,e,0),r=!R(t)||t!==this._$AH&&t!==w,r&&(this._$AH=t);else{const c=t;let a,l;for(t=n[0],a=0;a<n.length-1;a++)l=M(this,c[s+a],e,a),l===w&&(l=this._$AH[a]),r||(r=!R(l)||l!==this._$AH[a]),l===p?t=p:t!==p&&(t+=(l??"")+n[a+1]),this._$AH[a]=l}r&&!o&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Mt extends z{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}}const It=O?O.emptyScript:"";class Nt extends z{constructor(){super(...arguments),this.type=4}j(t){t&&t!==p?this.element.setAttribute(this.name,It):this.element.removeAttribute(this.name)}}class kt extends z{constructor(t,e,s,o,n){super(t,e,s,o,n),this.type=5}_$AI(t,e=this){var s;if((t=(s=M(this,t,e,0))!==null&&s!==void 0?s:p)===w)return;const o=this._$AH,n=t===p&&o!==p||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,r=t!==p&&(o===p||n);n&&this.element.removeEventListener(this.name,this,o),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,s;typeof this._$AH=="function"?this._$AH.call((s=(e=this.options)===null||e===void 0?void 0:e.host)!==null&&s!==void 0?s:this.element,t):this._$AH.handleEvent(t)}}class Rt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t)}}const dt=G.litHtmlPolyfillSupport;dt==null||dt(H,L),((q=G.litHtmlVersions)!==null&&q!==void 0?q:G.litHtmlVersions=[]).push("2.6.1");const Ht=(i,t,e)=>{var s,o;const n=(s=e==null?void 0:e.renderBefore)!==null&&s!==void 0?s:t;let r=n._$litPart$;if(r===void 0){const c=(o=e==null?void 0:e.renderBefore)!==null&&o!==void 0?o:null;n._$litPart$=r=new L(t.insertBefore(k(),c),c,void 0,e??{})}return r._$AI(i),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var F,K;class P extends T{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var t,e;const s=super.createRenderRoot();return(t=(e=this.renderOptions).renderBefore)!==null&&t!==void 0||(e.renderBefore=s.firstChild),s}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=Ht(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Dt)===null||t===void 0||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Dt)===null||t===void 0||t.setConnected(!1)}render(){return w}}P.finalized=!0,P._$litElement$=!0,(F=globalThis.litElementHydrateSupport)===null||F===void 0||F.call(globalThis,{LitElement:P});const ht=globalThis.litElementPolyfillSupport;ht==null||ht({LitElement:P});((K=globalThis.litElementVersions)!==null&&K!==void 0?K:globalThis.litElementVersions=[]).push("3.2.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const yt=i=>t=>typeof t=="function"?((e,s)=>(customElements.define(e,s),s))(i,t):((e,s)=>{const{kind:o,elements:n}=s;return{kind:o,elements:n,finisher(r){customElements.define(e,r)}}})(i,t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Lt=(i,t)=>t.kind==="method"&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(e){e.createProperty(t.key,i)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){typeof t.initializer=="function"&&(this[t.key]=t.initializer.call(this))},finisher(e){e.createProperty(t.key,i)}};function A(i){return(t,e)=>e!==void 0?((s,o,n)=>{o.constructor.createProperty(n,s)})(i,t,e):Lt(i,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function m(i){return A({...i,state:!0})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Dt=({finisher:i,descriptor:t})=>(e,s)=>{var o;if(s===void 0){const n=(o=e.originalKey)!==null&&o!==void 0?o:e.key,r=t!=null?{kind:"method",placement:"prototype",key:n,descriptor:t(e.key)}:{...e,key:n};return i!=null&&(r.finisher=function(c){i(c,n)}),r}{const n=e.constructor;t!==void 0&&Object.defineProperty(e,s,t(s)),i==null||i(n,s)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function jt(i,t){return Dt({descriptor:e=>{const s={get(){var o,n;return(n=(o=this.renderRoot)===null||o===void 0?void 0:o.querySelector(i))!==null&&n!==void 0?n:null},enumerable:!0,configurable:!0};if(t){const o=typeof e=="symbol"?Symbol():"__"+e;s.get=function(){var n,r;return this[o]===void 0&&(this[o]=(r=(n=this.renderRoot)===null||n===void 0?void 0:n.querySelector(i))!==null&&r!==void 0?r:null),this[o]}}return s}})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Z;((Z=window.HTMLSlotElement)===null||Z===void 0?void 0:Z.prototype.assignedElements)!=null;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Gt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},zt=i=>(...t)=>({_$litDirective$:i,values:t});let Bt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ut=zt(class extends Bt{constructor(i){var t;if(super(i),i.type!==Gt.ATTRIBUTE||i.name!=="style"||((t=i.strings)===null||t===void 0?void 0:t.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(i){return Object.keys(i).reduce((t,e)=>{const s=i[e];return s==null?t:t+`${e=e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(i,[t]){const{style:e}=i.element;if(this.vt===void 0){this.vt=new Set;for(const s in t)this.vt.add(s);return this.render(t)}this.vt.forEach(s=>{t[s]==null&&(this.vt.delete(s),s.includes("-")?e.removeProperty(s):e[s]="")});for(const s in t){const o=t[s];o!=null&&(this.vt.add(s),s.includes("-")?e.setProperty(s,o):e[s]=o)}return w}});/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Vt=i=>i??p;var pt,_t;(function(i){i.language="language",i.system="system",i.comma_decimal="comma_decimal",i.decimal_comma="decimal_comma",i.space_comma="space_comma",i.none="none"})(pt||(pt={})),function(i){i.language="language",i.system="system",i.am_pm="12",i.twenty_four="24"}(_t||(_t={}));var bt=function(i,t,e,s){s=s||{},e=e??{};var o=new Event(t,{bubbles:s.bubbles===void 0||s.bubbles,cancelable:Boolean(s.cancelable),composed:s.composed===void 0||s.composed});return o.detail=e,i.dispatchEvent(o),o};const N=["attributes","styles","options"],Wt=[{type:"grid",name:"",column_min_width:"100px",schema:[{name:"label",label:"Tab Label",selector:{text:{}}},{name:"icon",label:"Tab Icon",selector:{icon:{placeholder:"mdi:home-assistant"}}}]},{type:"grid",name:"",column_min_width:"200px",schema:[{name:"stacked",label:"Stacked",selector:{boolean:{}}}]},{type:"constant",name:"Minimum Width:",value:""},{type:"grid",name:"",column_min_width:"200px",schema:[{name:"minWidth",label:"Tab",selector:{boolean:{}}},{name:"isMinWidthIndicator",label:"Indicator",selector:{boolean:{}}}]}],qt=[{name:"--mdc-theme-primary",label:"Tab Color",selector:{color_rgb:{}}},{name:"--mdc-tab-text-label-color-default",label:"Unactivated Text Color",selector:{color_rgb:{}}},{name:"--mdc-tab-color-default",label:"Unactivated Icon Color",selector:{color_rgb:{}}},{type:"constant"}];function Ft(i,t){if("tabs"in i)return t;const e=i==null?void 0:i.styles;return e?t.map(({name:o,label:n,selector:r,...c})=>{if(n){const a=Object.hasOwn(e,o)?"*":void 0;return{name:o,label:`${n}${a?`${a}`:""}`,selector:r}}return c}):t}const Kt=i=>"tabs"in i?[{type:"grid",name:"",column_min_width:"100px",schema:[{name:"defaultTabIndex",label:"Default Tab Index",selector:{number:{min:0,max:i.tabs.length,mode:"box"}}}]}]:[{type:"grid",name:"",column_min_width:"200px",schema:[{name:"isDefaultTab",label:"Default Tab",selector:{boolean:{}}}]}];function Zt(i,t){const e=t.name;return Object.hasOwn(i,e)?"*":void 0}function Yt(i,t){return"tabs"in i?t:"attributes"in i?t.map(e=>{if(e.schema){const s=e.schema.map(o=>{const n=Zt(i.attributes,o);return{...o,label:`${o.label}${n?`${n}`:""}`}});return{...e,schema:s}}return e}):t}const Jt=(i,t)=>{if(t=="attributes")return Yt(i,Wt);if(t=="styles")return Ft(i,qt);if(t=="options")return Kt(i)},Ct=X`
  :host {
    --activated-color: var(--primary-text-color);
    --unactivated-color: rgba(var(--rgb-primary-text-color), 0.8);
    /* Color of the activated tab's text, indicator, and ripple. */
    --mdc-theme-primary: var(--activated-color);
    /*Color of an unactivated tab label.*/
    --mdc-tab-text-label-color-default: var(--unactivated-color);
    /* Color of an unactivated icon. */
    --mdc-tab-color-default: var(--unactivated-color);
    --mdc-typography-button-font-size: 14px;
  }
`;var Qt=Object.defineProperty,Xt=Object.getOwnPropertyDescriptor,g=(i,t,e,s)=>{for(var o=s>1?void 0:s?Xt(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&Qt(t,e,o),o};let f=class extends P{constructor(){super(...arguments),this._tabSelection=0,this._globalConfigTabSelection=0,this._localConfigTabSelection=0,this._isGlobalConfigExpanded=!1,this._isLocalConfigExpanded=!1,this._cardGUIMode=!0,this._cardGUIModeAvailable=!0}setConfig(i){if(!i)throw new Error("No configuration.");this._config=i}async _handleSelectedTab(i){if(!this._config)throw new Error("No configuration.");if(i.target.id==="add-card"){this._tabSelection=this._config.tabs.length;return}if(i.target.id=="local-tabs"){this._localConfigTabSelection=i.detail.selected;return}if(i.target.id=="global-tabs"){this._globalConfigTabSelection=i.detail.selected;return}this._setMode(!0),this._cardGUIModeAvailable=!0,this._tabSelection=i.detail.selected,this._fireSelectedTabEvent()}_handleConfigChanged(i){if(i.stopPropagation(),!this._config)return;const t=i.detail.config,{card:e,...s}=this._config.tabs[this._tabSelection],o={card:t,...s},n=[...this._config.tabs];n[this._tabSelection]=o,this._config={...this._config,tabs:n},this._cardGUIModeAvailable=i.detail.guiModeAvailable,this._fireConfigChangedEvent()}_handleStyleConfigChanged(i){const t=Object.entries(i).filter(r=>Array.isArray(r[1])&&r[1].every(c=>typeof c=="number")),e=t.map(([r,c])=>[r,this.getRGBColor(r)]),s=t.filter(([r,c],a)=>c.some((l,u)=>l!==e[a][1][u])),o=s.map(([r,c])=>[r,`rgb(${c.toString().replaceAll(",",", ")})`]);return s?Object.fromEntries(o):{}}_handleExpandedFormConfigChanged(i){var e,s,o,n;if(!this._config)return;const t=i.detail.value;if(((e=i.currentTarget)==null?void 0:e.id)=="global-form"){const r=N[this._globalConfigTabSelection],c=r==="styles"?this._handleStyleConfigChanged(t):t,a={...(s=this._config)==null?void 0:s[r],...c};this._config={...this._config,[r]:a}}else{if(t==null?void 0:t.isDefaultTab){this._config={...this._config,options:{defaultTabIndex:this._tabSelection}},this._fireConfigChangedEvent();return}const c=[...(o=this._config)==null?void 0:o.tabs];let a=c[this._tabSelection];const l=N[this._localConfigTabSelection],u=(a==null?void 0:a[l])??{},h={...((n=this._config)==null?void 0:n[l])??{},...u},_=l==="styles"?this._handleStyleConfigChanged(t):t,$=Object.fromEntries(Object.entries(_).filter(([B,Et])=>!Object.is(h[B],Et))),y={...u,...$};a={...a,[l]:y},c[this._tabSelection]=a,this._config={...this._config,tabs:c}}this._fireConfigChangedEvent()}_handleGUIModeChanged(i){i.stopPropagation(),this._cardGUIMode=i.detail.guiMode,this._cardGUIModeAvailable=i.detail.guiModeAvailable}_handleCardPicked(i){if(i.stopPropagation(),!this._config)return;const e={card:i.detail.config,attributes:{label:`New Tab ${this._tabSelection}`}},s=[...this._config.tabs,e];this._config={...this._config,tabs:s},this._fireConfigChangedEvent(),this._fireSelectedTabEvent(),this._localConfigTabSelection=0,this._globalConfigTabSelection=0,this._isLocalConfigExpanded=!1,this._isGlobalConfigExpanded=!1}_handleDeleteCard(){if(!this._config)return;const i=[...this._config.tabs];i.splice(this._tabSelection,1),this._config={...this._config,tabs:i},this._tabSelection=this._tabSelection==0?this._tabSelection:this._tabSelection-1,this._fireConfigChangedEvent(),this._fireSelectedTabEvent()}_handleMove(i){var r;if(!this._config)return;const t=(r=i.currentTarget)==null?void 0:r.move,s=this._tabSelection+t,o=[...this._config.tabs],n=o.splice(this._tabSelection,1)[0];o.splice(s,0,n),this._config={...this._config,tabs:o},this._tabSelection=s,this._fireConfigChangedEvent(),this._fireSelectedTabEvent()}_setMode(i){this._cardGUIMode=i,this._cardEditorElement&&(this._cardEditorElement.GUImode=i)}_toggleMode(){var i;(i=this._cardEditorElement)==null||i.toggleMode()}focusYamlEditor(){var i;(i=this._cardEditorElement)==null||i.focusYamlEditor()}_fireConfigChangedEvent(){bt(this,"config-changed",{config:this._config})}_fireSelectedTabEvent(){bt(this,"tabbed-card",{selectedTab:this._tabSelection},{bubbles:!0,composed:!0})}_handleExpansionPanelChanged(i){i.currentTarget.id=="global-tab-configuration"&&(this._isGlobalConfigExpanded=!this._isGlobalConfigExpanded),i.currentTarget.id=="local-tab-configuration"&&(this._localConfigTabSelection=this._localConfigTabSelection,this._isLocalConfigExpanded=!this._isLocalConfigExpanded)}rgbToArray(i){return i.substring(i.indexOf("(")+1,i.indexOf(")")).split(",").map(t=>Number(t.trim()))}getCSSPropertyValue(i){return window.getComputedStyle(this).getPropertyValue(i)}convertToRGB(i){var s;const t=document.createElement("temp-element");t.style.color=i,(s=this.shadowRoot)==null||s.appendChild(t);const e=window.getComputedStyle(t).getPropertyValue("color");return t.remove(),e}getRGBColor(i){const t=this.getCSSPropertyValue(i),e=this.convertToRGB(t);return this.rgbToArray(e)}_renderConfigurationEditor(i){var l;const t="tabs"in i?"global":"local",e=t=="global"?this._globalConfigTabSelection:this._localConfigTabSelection,s=N[e],o=(l=this._config)==null?void 0:l[s],n=()=>{var d,h;const u=((h=(d=this._config)==null?void 0:d.options)==null?void 0:h.defaultTabIndex)||0;return t=="local"&&s=="options"?{isDefaultTab:u==this._tabSelection}:t=="global"&&s=="options"?{defaultTabIndex:u}:{}},r=n().isDefaultTab,c=()=>{var d;const u=["--mdc-theme-primary","--mdc-tab-text-label-color-default","--mdc-tab-color-default"];if(s=="styles"){const h={...(d=this._config)==null?void 0:d.styles,...i==null?void 0:i.styles},_=u.map($=>{const y=h==null?void 0:h[$],B=y?this.rgbToArray(y):this.getRGBColor($);return[[$],B]});return Object.fromEntries(_)}else return{}},a={...o,...i==null?void 0:i[s],...n(),...c()};return b`
      <ha-form
        id="${t}-form"
        .hass=${this.hass}
        .data=${a}
        .disabled=${r}
        .schema=${Jt(i,s)}
        .computeLabel=${u=>u.label??u.name}
        .label=${"This Forms Label"}
        @value-changed=${u=>this._handleExpandedFormConfigChanged(u)}
      ></ha-form>
    `}render(){var i;return!this.hass||!this._config?b``:b`
      <div class="card-config">
        ${this._tabSelection<this._config.tabs.length?b`
              <div
                id="global-tab-configuration"
                @expanded-changed=${this._handleExpansionPanelChanged}
              >
                <ha-expansion-panel outlined>
                  <div slot="header">Global Tab Configuration</div>
                  <div class="content">
                    <div class="toolbar">
                      <paper-tabs
                        id="global-tabs"
                        .selected=${this._globalConfigTabSelection}
                        @iron-activate=${this._handleSelectedTab}
                      >
                        <!-- workaround to allow selectionBar to establish itself -->
                        ${this._isGlobalConfigExpanded?N.map(t=>b`<paper-tab>${t}</paper-tab>`):""}
                      </paper-tabs>
                    </div>
                    ${this._isGlobalConfigExpanded?this._renderConfigurationEditor(this._config):""}
                  </div>
                </ha-expansion-panel>
              </div>

              <div class="toolbar">
                <paper-tabs
                  scrollable
                  .selected=${this._tabSelection}
                  @iron-activate=${this._handleSelectedTab}
                >
                  ${this._config.tabs.map((t,e)=>b` <paper-tab> ${e} </paper-tab> `)}
                </paper-tabs>
                <paper-tabs
                  id="add-card"
                  .selected=${this._tabSelection===this._config.tabs.length?"0":void 0}
                  @iron-activate=${this._handleSelectedTab}
                >
                  <paper-tab>
                    <ha-icon icon="mdi:plus"></ha-icon>
                  </paper-tab>
                </paper-tabs>
              </div>
              <div id="editor">
                <div id="card-options">
                  <mwc-button
                    @click=${this._toggleMode}
                    .disabled=${!this._cardGUIModeAvailable}
                    class="gui-mode-button"
                  >
                    ${this.hass.localize(!this._cardEditorElement||this._cardGUIMode?"ui.panel.lovelace.editor.edit_card.show_code_editor":"ui.panel.lovelace.editor.edit_card.show_visual_editor")}
                  </mwc-button>
                  <ha-icon-button
                    .disabled=${this._tabSelection===0}
                    .label=${this.hass.localize("ui.panel.lovelace.editor.edit_card.move_before")}
                    @click=${this._handleMove}
                    .move=${-1}
                  >
                    <ha-icon icon="mdi:arrow-left"></ha-icon>
                  </ha-icon-button>
                  <ha-icon-button
                    .label=${this.hass.localize("ui.panel.lovelace.editor.edit_card.move_after")}
                    .disabled=${this._tabSelection===this._config.tabs.length-1}
                    @click=${this._handleMove}
                    .move=${1}
                  >
                    <ha-icon icon="mdi:arrow-right"></ha-icon>
                  </ha-icon-button>
                  <ha-icon-button
                    .label=${this.hass.localize("ui.panel.lovelace.editor.edit_card.delete")}
                    @click=${this._handleDeleteCard}
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </ha-icon-button>
                </div>

                <div
                  id="local-tab-configuration"
                  @expanded-changed=${this._handleExpansionPanelChanged}
                >
                  <ha-expansion-panel outlined>
                    <div slot="header">Local Tab Configuration</div>
                    <div class="content">
                      <div class="toolbar">
                        <paper-tabs
                          id="local-tabs"
                          .selected=${this._localConfigTabSelection}
                          @iron-activate=${this._handleSelectedTab}
                        >
                          <!-- workaround to allow selectionBar to establish itself -->
                          ${this._isLocalConfigExpanded?N.map(t=>b`<paper-tab>${t}</paper-tab>`):""}
                        </paper-tabs>
                      </div>
                      ${this._isLocalConfigExpanded?this._renderConfigurationEditor(this._config.tabs[this._tabSelection]):""}
                    </div>
                  </ha-expansion-panel>
                </div>

                <hui-card-element-editor
                  .hass=${this.hass}
                  .value=${(i=this._config.tabs[this._tabSelection])==null?void 0:i.card}
                  .lovelace=${this.lovelace}
                  @config-changed=${this._handleConfigChanged}
                  @GUImode-changed=${this._handleGUIModeChanged}
                ></hui-card-element-editor>
              </div>
            `:b`
              <hui-card-picker
                .hass=${this.hass}
                .lovelace=${this.lovelace}
                @config-changed=${this._handleCardPicked}
              ></hui-card-picker>
            `}
      </div>
    `}};f.styles=[Ct,X`
      .toolbar {
        display: flex;
        --paper-tabs-selection-bar-color: var(--primary-color);
        --paper-tab-ink: var(--primary-color);
        text-transform: capitalize;
      }
      mwc-button {
        --mdc-theme-primary: var(--primary-text-color);
      }
      ha-form {
        --mdc-theme-primary: var(--primary-text-color);
      }
      paper-tabs {
        display: flex;
        font-size: 14px;
        flex-grow: 1;
      }
      #add-card {
        max-width: 32px;
        padding: 0;
      }
      #card-options {
        display: flex;
        justify-content: flex-end;
        width: 100%;
      }
      #editor {
        border: 1px solid var(--divider-color);
        padding: 12px;
      }
      @media (max-width: 450px) {
        #editor {
          margin: 0 -12px;
        }
      }
      .gui-mode-button {
        margin-right: auto;
      }
    `];g([A()],f.prototype,"hass",2);g([A()],f.prototype,"lovelace",2);g([m()],f.prototype,"_config",2);g([m()],f.prototype,"_tabSelection",2);g([m()],f.prototype,"_globalConfigTabSelection",2);g([m()],f.prototype,"_localConfigTabSelection",2);g([m()],f.prototype,"_isGlobalConfigExpanded",2);g([m()],f.prototype,"_isLocalConfigExpanded",2);g([m()],f.prototype,"_cardGUIMode",2);g([m()],f.prototype,"_cardGUIModeAvailable",2);g([jt("hui-card-element-editor")],f.prototype,"_cardEditorElement",2);f=g([yt("tabbed-card-editor")],f);var te=Object.defineProperty,ee=Object.getOwnPropertyDescriptor,C=(i,t,e,s)=>{for(var o=s>1?void 0:s?ee(t,e):t,n=i.length-1,r;n>=0;n--)(r=i[n])&&(o=(s?r(t,e,o):r(o))||o);return s&&o&&te(t,e,o),o};let v=class extends P{constructor(){super(...arguments),this.selectedTabIndex=0,this.focusOnActivate=!0,this._styles={}}connectedCallback(){var i;super.connectedCallback(),((i=this.parentNode)==null?void 0:i.nodeName)=="HUI-CARD-PREVIEW"&&(this.focusOnActivate=!1,this.controller=new AbortController,document.body.addEventListener("tabbed-card",t=>this._handleSelectedTab(t),{signal:this.controller.signal}))}disconnectedCallback(){super.disconnectedCallback(),this.controller&&this.controller.abort()}_handleSelectedTab(i){"selectedTab"in i.detail&&setTimeout(()=>{this.selectedEditorTabIndex=i.detail.selectedTab},1)}async loadCardHelpers(){this._helpers=await window.loadCardHelpers()}static async getConfigElement(){return document.createElement("tabbed-card-editor")}static getStubConfig(){return{tabs:[]}}setConfig(i){if(!i||!(i!=null&&i.tabs))throw new Error("No or incomplete configuration.");if(i.tabs.some(t=>Object.is(t==null?void 0:t.card,null)))throw new Error("No or incomplete configuration.");this._config=i,this._styles={...this._config.styles},this._createTabs(i)}updated(i){var t;i.has("hass")&&((t=this._tabs)!=null&&t.length)&&this._tabs.forEach(e=>e.card.hass=this.hass)}async _createTabs(i){await this.loadCardHelpers();const t=await Promise.all(i.tabs.map(async e=>({styles:e==null?void 0:e.styles,attributes:{...i==null?void 0:i.attributes,...e==null?void 0:e.attributes},card:await this._createCard(e.card)})));this._tabs=t}async _createCard(i){const t=await this._helpers.createCardElement(i);return t.hass=this.hass,t.addEventListener("ll-rebuild",e=>{e.stopPropagation(),this._rebuildCard(t,i)},{once:!0}),t}async _rebuildCard(i,t){console.log("_rebuildCard: ",i,t);const e=await this._createCard(t);i.replaceWith(e),this._tabs=this._tabs.map(s=>s.card===i?{...s,card:e}:s)}render(){var i,t,e,s;return!this.hass||!this._config||!this._helpers?b``:(i=this._tabs)!=null&&i.length?b`
      <mwc-tab-bar
        @MDCTabBar:activated=${o=>this.selectedTabIndex=o.detail.index}
        style=${ut(this._styles)}
        activeIndex=${Vt(this.selectedEditorTabIndex??((e=(t=this._config)==null?void 0:t.options)==null?void 0:e.defaultTabIndex)??void 0)}
      >
        <!-- no horizontal scrollbar shown when tabs overflow in chrome -->
        ${this._tabs.map(o=>{var n,r,c,a,l,u,d,h;return b`
              <mwc-tab
                style=${ut((o==null?void 0:o.styles)||{})}
                label="${((n=o==null?void 0:o.attributes)==null?void 0:n.label)||p}"
                ?hasImageIcon=${(r=o==null?void 0:o.attributes)==null?void 0:r.icon}
                ?isFadingIndicator=${(c=o==null?void 0:o.attributes)==null?void 0:c.isFadingIndicator}
                ?minWidth=${(a=o==null?void 0:o.attributes)==null?void 0:a.minWidth}
                ?isMinWidthIndicator=${(l=o==null?void 0:o.attributes)==null?void 0:l.isMinWidthIndicator}
                ?stacked=${(u=o==null?void 0:o.attributes)==null?void 0:u.stacked}
                .focusOnActivate=${this.focusOnActivate}
              >
                ${(d=o==null?void 0:o.attributes)!=null&&d.icon?b`<ha-icon
                      slot="icon"
                      icon="${(h=o==null?void 0:o.attributes)==null?void 0:h.icon}"
                    ></ha-icon>`:b``}
              </mwc-tab>
            `})}
      </mwc-tab-bar>
      <section>
        <article>
          ${(s=this._tabs.find((o,n)=>n==this.selectedTabIndex))==null?void 0:s.card}
        </article>
      </section>
    `:b`<div class="no-config">
        No cards have been added to Tabbed Card
      </div>`}};v.styles=[Ct,X`
      .no-config {
        text-align: center;
      }
      mwc-tab {
        --ha-icon-display: inline;
      }
    `];C([A({attribute:!1})],v.prototype,"hass",2);C([A()],v.prototype,"selectedTabIndex",2);C([A()],v.prototype,"selectedEditorTabIndex",2);C([A()],v.prototype,"_helpers",2);C([A()],v.prototype,"focusOnActivate",2);C([m()],v.prototype,"_config",2);C([m()],v.prototype,"_tabs",2);C([m()],v.prototype,"_styles",2);v=C([yt("tabbed-card")],v);window.customCards=window.customCards||[];window.customCards.push({type:"tabbed-card",name:"Tabbed Card",description:"A tabbed card of cards."});
