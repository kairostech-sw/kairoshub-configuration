/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const R=window,q=R.ShadowRoot&&(R.ShadyCSS===void 0||R.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ot=Symbol(),K=new WeakMap;class ut{constructor(t,e,s){if(this._$cssResult$=!0,s!==ot)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(q&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=K.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&K.set(e,t))}return t}toString(){return this.cssText}}const pt=n=>new ut(typeof n=="string"?n:n+"",void 0,ot),$t=(n,t)=>{q?n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(e=>{const s=document.createElement("style"),i=R.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,n.appendChild(s)})},F=q?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return pt(e)})(n):n;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var z;const k=window,J=k.trustedTypes,vt=J?J.emptyScript:"",Y=k.reactiveElementPolyfillSupport,Z={toAttribute(n,t){switch(t){case Boolean:n=n?vt:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},lt=(n,t)=>t!==n&&(t==t||n==n),B={attribute:!0,type:String,converter:Z,reflect:!1,hasChanged:lt};class A extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(t){var e;(e=this.h)!==null&&e!==void 0||(this.h=[]),this.h.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,s)=>{const i=this._$Ep(s,e);i!==void 0&&(this._$Ev.set(i,s),t.push(i))}),t}static createProperty(t,e=B){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const s=typeof t=="symbol"?Symbol():"__"+t,i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Object.defineProperty(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){return{get(){return this[e]},set(i){const r=this[t];this[e]=i,this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||B}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,s=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const i of s)this.createProperty(i,e[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)e.unshift(F(i))}else t!==void 0&&e.push(F(t));return e}static _$Ep(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(t=this.constructor.h)===null||t===void 0||t.forEach(e=>e(this))}addController(t){var e,s;((e=this._$ES)!==null&&e!==void 0?e:this._$ES=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&((s=t.hostConnected)===null||s===void 0||s.call(t))}removeController(t){var e;(e=this._$ES)===null||e===void 0||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const e=(t=this.shadowRoot)!==null&&t!==void 0?t:this.attachShadow(this.constructor.shadowRootOptions);return $t(e,this.constructor.elementStyles),e}connectedCallback(){var t;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$ES)===null||t===void 0||t.forEach(e=>{var s;return(s=e.hostConnected)===null||s===void 0?void 0:s.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$ES)===null||t===void 0||t.forEach(e=>{var s;return(s=e.hostDisconnected)===null||s===void 0?void 0:s.call(e)})}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$EO(t,e,s=B){var i;const r=this.constructor._$Ep(t,s);if(r!==void 0&&s.reflect===!0){const o=(((i=s.converter)===null||i===void 0?void 0:i.toAttribute)!==void 0?s.converter:Z).toAttribute(e,s.type);this._$El=t,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$El=null}}_$AK(t,e){var s;const i=this.constructor,r=i._$Ev.get(t);if(r!==void 0&&this._$El!==r){const o=i.getPropertyOptions(r),d=typeof o.converter=="function"?{fromAttribute:o.converter}:((s=o.converter)===null||s===void 0?void 0:s.fromAttribute)!==void 0?o.converter:Z;this._$El=r,this[r]=d.fromAttribute(e,o.type),this._$El=null}}requestUpdate(t,e,s){let i=!0;t!==void 0&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||lt)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),s.reflect===!0&&this._$El!==t&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(t,s))):i=!1),!this.isUpdatePending&&i&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((i,r)=>this[r]=i),this._$Ei=void 0);let e=!1;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),(t=this._$ES)===null||t===void 0||t.forEach(i=>{var r;return(r=i.hostUpdate)===null||r===void 0?void 0:r.call(i)}),this.update(s)):this._$Ek()}catch(i){throw e=!1,this._$Ek(),i}e&&this._$AE(s)}willUpdate(t){}_$AE(t){var e;(e=this._$ES)===null||e===void 0||e.forEach(s=>{var i;return(i=s.hostUpdated)===null||i===void 0?void 0:i.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){this._$EC!==void 0&&(this._$EC.forEach((e,s)=>this._$EO(s,this[s],e)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}A.finalized=!0,A.elementProperties=new Map,A.elementStyles=[],A.shadowRootOptions={mode:"open"},Y==null||Y({ReactiveElement:A}),((z=k.reactiveElementVersions)!==null&&z!==void 0?z:k.reactiveElementVersions=[]).push("1.4.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var D;const I=window,E=I.trustedTypes,G=E?E.createPolicy("lit-html",{createHTML:n=>n}):void 0,v=`lit$${(Math.random()+"").slice(9)}$`,ht="?"+v,_t=`<${ht}>`,w=document,x=(n="")=>w.createComment(n),P=n=>n===null||typeof n!="object"&&typeof n!="function",at=Array.isArray,yt=n=>at(n)||typeof(n==null?void 0:n[Symbol.iterator])=="function",C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Q=/-->/g,X=/>/g,y=RegExp(`>|[ 	
\f\r](?:([^\\s"'>=/]+)([ 	
\f\r]*=[ 	
\f\r]*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),tt=/'/g,et=/"/g,dt=/^(?:script|style|textarea|title)$/i,ft=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),b=ft(1),f=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),st=new WeakMap,g=w.createTreeWalker(w,129,null,!1),mt=(n,t)=>{const e=n.length-1,s=[];let i,r=t===2?"<svg>":"",o=C;for(let l=0;l<e;l++){const h=n[l];let $,a,c=-1,p=0;for(;p<h.length&&(o.lastIndex=p,a=o.exec(h),a!==null);)p=o.lastIndex,o===C?a[1]==="!--"?o=Q:a[1]!==void 0?o=X:a[2]!==void 0?(dt.test(a[2])&&(i=RegExp("</"+a[2],"g")),o=y):a[3]!==void 0&&(o=y):o===y?a[0]===">"?(o=i!=null?i:C,c=-1):a[1]===void 0?c=-2:(c=o.lastIndex-a[2].length,$=a[1],o=a[3]===void 0?y:a[3]==='"'?et:tt):o===et||o===tt?o=y:o===Q||o===X?o=C:(o=y,i=void 0);const N=o===y&&n[l+1].startsWith("/>")?" ":"";r+=o===C?h+_t:c>=0?(s.push($),h.slice(0,c)+"$lit$"+h.slice(c)+v+N):h+v+(c===-2?(s.push(void 0),l):N)}const d=r+(n[e]||"<?>")+(t===2?"</svg>":"");if(!Array.isArray(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return[G!==void 0?G.createHTML(d):d,s]};class U{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,o=0;const d=t.length-1,l=this.parts,[h,$]=mt(t,e);if(this.el=U.createElement(h,s),g.currentNode=this.el.content,e===2){const a=this.el.content,c=a.firstChild;c.remove(),a.append(...c.childNodes)}for(;(i=g.nextNode())!==null&&l.length<d;){if(i.nodeType===1){if(i.hasAttributes()){const a=[];for(const c of i.getAttributeNames())if(c.endsWith("$lit$")||c.startsWith(v)){const p=$[o++];if(a.push(c),p!==void 0){const N=i.getAttribute(p.toLowerCase()+"$lit$").split(v),M=/([.?@])?(.*)/.exec(p);l.push({type:1,index:r,name:M[2],strings:N,ctor:M[1]==="."?gt:M[1]==="?"?wt:M[1]==="@"?St:L})}else l.push({type:6,index:r})}for(const c of a)i.removeAttribute(c)}if(dt.test(i.tagName)){const a=i.textContent.split(v),c=a.length-1;if(c>0){i.textContent=E?E.emptyScript:"";for(let p=0;p<c;p++)i.append(a[p],x()),g.nextNode(),l.push({type:2,index:++r});i.append(a[c],x())}}}else if(i.nodeType===8)if(i.data===ht)l.push({type:2,index:r});else{let a=-1;for(;(a=i.data.indexOf(v,a+1))!==-1;)l.push({type:7,index:r}),a+=v.length-1}r++}}static createElement(t,e){const s=w.createElement("template");return s.innerHTML=t,s}}function S(n,t,e=n,s){var i,r,o,d;if(t===f)return t;let l=s!==void 0?(i=e._$Co)===null||i===void 0?void 0:i[s]:e._$Cl;const h=P(t)?void 0:t._$litDirective$;return(l==null?void 0:l.constructor)!==h&&((r=l==null?void 0:l._$AO)===null||r===void 0||r.call(l,!1),h===void 0?l=void 0:(l=new h(n),l._$AT(n,e,s)),s!==void 0?((o=(d=e)._$Co)!==null&&o!==void 0?o:d._$Co=[])[s]=l:e._$Cl=l),l!==void 0&&(t=S(n,l._$AS(n,t.values),l,s)),t}class At{constructor(t,e){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var e;const{el:{content:s},parts:i}=this._$AD,r=((e=t==null?void 0:t.creationScope)!==null&&e!==void 0?e:w).importNode(s,!0);g.currentNode=r;let o=g.nextNode(),d=0,l=0,h=i[0];for(;h!==void 0;){if(d===h.index){let $;h.type===2?$=new O(o,o.nextSibling,this,t):h.type===1?$=new h.ctor(o,h.name,h.strings,this,t):h.type===6&&($=new Ct(o,this,t)),this.u.push($),h=i[++l]}d!==(h==null?void 0:h.index)&&(o=g.nextNode(),d++)}return r}p(t){let e=0;for(const s of this.u)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class O{constructor(t,e,s,i){var r;this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cm=(r=i==null?void 0:i.isConnected)===null||r===void 0||r}get _$AU(){var t,e;return(e=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&e!==void 0?e:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=S(this,t,e),P(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==f&&this.g(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):yt(t)?this.k(t):this.g(t)}O(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}g(t){this._$AH!==u&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(w.createTextNode(t)),this._$AH=t}$(t){var e;const{values:s,_$litType$:i}=t,r=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=U.createElement(i.h,this.options)),i);if(((e=this._$AH)===null||e===void 0?void 0:e._$AD)===r)this._$AH.p(s);else{const o=new At(r,this),d=o.v(this.options);o.p(s),this.T(d),this._$AH=o}}_$AC(t){let e=st.get(t.strings);return e===void 0&&st.set(t.strings,e=new U(t)),e}k(t){at(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const r of t)i===e.length?e.push(s=new O(this.O(x()),this.O(x()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,e);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i}}setConnected(t){var e;this._$AM===void 0&&(this._$Cm=t,(e=this._$AP)===null||e===void 0||e.call(this,t))}}class L{constructor(t,e,s,i,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,s,i){const r=this.strings;let o=!1;if(r===void 0)t=S(this,t,e,0),o=!P(t)||t!==this._$AH&&t!==f,o&&(this._$AH=t);else{const d=t;let l,h;for(t=r[0],l=0;l<r.length-1;l++)h=S(this,d[s+l],e,l),h===f&&(h=this._$AH[l]),o||(o=!P(h)||h!==this._$AH[l]),h===u?t=u:t!==u&&(t+=(h!=null?h:"")+r[l+1]),this._$AH[l]=h}o&&!i&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t!=null?t:"")}}class gt extends L{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}}const Et=E?E.emptyScript:"";class wt extends L{constructor(){super(...arguments),this.type=4}j(t){t&&t!==u?this.element.setAttribute(this.name,Et):this.element.removeAttribute(this.name)}}class St extends L{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){var s;if((t=(s=S(this,t,e,0))!==null&&s!==void 0?s:u)===f)return;const i=this._$AH,r=t===u&&i!==u||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==u&&(i===u||r);r&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,s;typeof this._$AH=="function"?this._$AH.call((s=(e=this.options)===null||e===void 0?void 0:e.host)!==null&&s!==void 0?s:this.element,t):this._$AH.handleEvent(t)}}class Ct{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t)}}const it=I.litHtmlPolyfillSupport;it==null||it(U,O),((D=I.litHtmlVersions)!==null&&D!==void 0?D:I.litHtmlVersions=[]).push("2.4.0");const bt=(n,t,e)=>{var s,i;const r=(s=e==null?void 0:e.renderBefore)!==null&&s!==void 0?s:t;let o=r._$litPart$;if(o===void 0){const d=(i=e==null?void 0:e.renderBefore)!==null&&i!==void 0?i:null;r._$litPart$=o=new O(t.insertBefore(x(),d),d,void 0,e!=null?e:{})}return o._$AI(n),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var j,W;class T extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var t,e;const s=super.createRenderRoot();return(t=(e=this.renderOptions).renderBefore)!==null&&t!==void 0||(e.renderBefore=s.firstChild),s}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=bt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Dt)===null||t===void 0||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Dt)===null||t===void 0||t.setConnected(!1)}render(){return f}}T.finalized=!0,T._$litElement$=!0,(j=globalThis.litElementHydrateSupport)===null||j===void 0||j.call(globalThis,{LitElement:T});const nt=globalThis.litElementPolyfillSupport;nt==null||nt({LitElement:T});((W=globalThis.litElementVersions)!==null&&W!==void 0?W:globalThis.litElementVersions=[]).push("3.2.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Tt=n=>t=>typeof t=="function"?((e,s)=>(customElements.define(e,s),s))(n,t):((e,s)=>{const{kind:i,elements:r}=s;return{kind:i,elements:r,finisher(o){customElements.define(e,o)}}})(n,t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const xt=(n,t)=>t.kind==="method"&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(e){e.createProperty(t.key,n)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){typeof t.initializer=="function"&&(this[t.key]=t.initializer.call(this))},finisher(e){e.createProperty(t.key,n)}};function H(n){return(t,e)=>e!==void 0?((s,i,r)=>{i.constructor.createProperty(r,s)})(n,t,e):xt(n,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ct(n){return H({...n,state:!0})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var V;((V=window.HTMLSlotElement)===null||V===void 0?void 0:V.prototype.assignedElements)!=null;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Pt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ut=n=>(...t)=>({_$litDirective$:n,values:t});class Ot{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const rt=Ut(class extends Ot{constructor(n){var t;if(super(n),n.type!==Pt.ATTRIBUTE||n.name!=="style"||((t=n.strings)===null||t===void 0?void 0:t.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(n){return Object.keys(n).reduce((t,e)=>{const s=n[e];return s==null?t:t+`${e=e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(n,[t]){const{style:e}=n.element;if(this.vt===void 0){this.vt=new Set;for(const s in t)this.vt.add(s);return this.render(t)}this.vt.forEach(s=>{t[s]==null&&(this.vt.delete(s),s.includes("-")?e.removeProperty(s):e[s]="")});for(const s in t){const i=t[s];i!=null&&(this.vt.add(s),s.includes("-")?e.setProperty(s,i):e[s]=i)}return f}});var Ht=Object.defineProperty,Nt=Object.getOwnPropertyDescriptor,m=(n,t,e,s)=>{for(var i=s>1?void 0:s?Nt(t,e):t,r=n.length-1,o;r>=0;r--)(o=n[r])&&(i=(s?o(t,e,i):o(i))||i);return s&&i&&Ht(t,e,i),i};let _=class extends T{constructor(){super(...arguments),this.selectedTabIndex=0,this._styles={"--mdc-ripple-color":"transparent","--mdc-theme-primary":"var(--primary-text-color)","--mdc-tab-text-label-color-default":"#000000","--mdc-tab-color-default":"#000000","--mdc-typography-button-font-size":"14px","--mdc-typography-button-text-transform":"capitalize"}}async loadCardHelpers(){this._helpers=await window.loadCardHelpers()}static getStubConfig(){return{options:{},tabs:[{label:"Sun",card:{type:"entity",entity:"sun.sun"}}]}}setConfig(n){if(!n)throw new Error("No configuration.");this._config=n,this._styles={...this._styles,...this._config.styles},this.loadCardHelpers()}willUpdate(n){var t;n.has("_helpers")&&this._createTabs(this._config),n.has("hass")&&((t=this._tabs)==null?void 0:t.length)&&this._tabs.forEach(e=>{const{attributes:s,styles:i}=this.updateStyles(e);e.attributes={...s},e.styles={...i},e.card.hass=this.hass})}updateStyles(n){var t={...n==null?void 0:n.attributes},e={...n==null?void 0:n.styles};if(n.entity){t.id||(t.id=t.label);var s=this.hass.states[n.entity].state;(s==="unknown"||s==="unavailable")&&!n.show_unknown?(t.label="",e.display="none"):(t.label=s+n.suffix,e.display=null)}return{styles:e,attributes:t}}async _createTabs(n){const t=await Promise.all(n.tabs.map(async e=>{var{styles:s,attributes:i}=this.updateStyles(e);return{styles:s,attributes:{...n==null?void 0:n.attributes,...i},entity:e==null?void 0:e.entity,suffix:e==null?void 0:e.suffix,card:await this._createCard(e.card)}}));this._tabs=t}async _createCard(n){const t=await this._helpers.createCardElement(n);return t.hass=this.hass,t.addEventListener("ll-rebuild",e=>{e.stopPropagation(),this._rebuildCard(t,n)},{once:!0}),t}async _rebuildCard(n,t){const e=await this._helpers.createCardElement(t);n.replaceWith(e)}render(){var n,t,e,s;return!this.hass||!this._config||!this._helpers||!((n=this._tabs)!=null&&n.length)?b``:b`
      <mwc-tab-bar
        @MDCTabBar:activated=${i=>this.selectedTabIndex=i.detail.index}
        style=${rt(this._styles)}
        activeIndex=${(e=(t=this._config)==null?void 0:t.options)==null?void 0:e.defaultTabIndex}
      >

        ${this._tabs.map(i=>{var r,o,d,l,h,$,a,c,p;return b`
              <mwc-tab
                style=${rt((i==null?void 0:i.styles)||{})}
                label="${((r=i==null?void 0:i.attributes)==null?void 0:r.label)||u}"
                id="${((o=i.attributes)==null?void 0:o.id)||u}"
                ?hasImageIcon=${(d=i==null?void 0:i.attributes)==null?void 0:d.icon}
                ?isFadingIndicator=${(l=i==null?void 0:i.attributes)==null?void 0:l.isFadingIndicator}
                ?minWidth=${(h=i==null?void 0:i.attributes)==null?void 0:h.minWidth}
                ?isMinWidthIndicator=${($=i==null?void 0:i.attributes)==null?void 0:$.isMinWidthIndicator}
                ?stacked=${(a=i==null?void 0:i.attributes)==null?void 0:a.stacked}
              >
                ${(c=i==null?void 0:i.attributes)!=null&&c.icon?b`<ha-icon
                      slot="icon"
                      icon="${(p=i==null?void 0:i.attributes)==null?void 0:p.icon}"
                      style="display: inline-flex;"
                    ></ha-icon>`:b``}
              </mwc-tab>
            `})}
      </mwc-tab-bar>
      <section>
        <article>
          ${(s=this._tabs.find((i,r)=>r==this.selectedTabIndex))==null?void 0:s.card}
        </article>
      </section>
    `}};m([H({attribute:!1})],_.prototype,"hass",2);m([H()],_.prototype,"selectedTabIndex",2);m([H()],_.prototype,"_helpers",2);m([ct()],_.prototype,"_config",2);m([ct()],_.prototype,"_tabs",2);m([H()],_.prototype,"_styles",2);_=m([Tt("tabbed-card")],_);window.customCards=window.customCards||[];window.customCards.push({type:"tabbed-card",name:"Tabbed Card",description:"A tabbed card of cards."});
