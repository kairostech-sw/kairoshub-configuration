/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
function t(t, e, n, i) {
  var r, o = arguments.length,
      s = o < 3 ? e : null === i ? i = Object.getOwnPropertyDescriptor(e, n) : i;
  if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(t, e, n, i);
  else
      for (var a = t.length - 1; a >= 0; a--)(r = t[a]) && (s = (o < 3 ? r(s) : o > 3 ? r(e, n, s) : r(e, n)) || s);
  return o > 3 && s && Object.defineProperty(e, n, s), s
  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
}
const e = window,
  n = e.ShadowRoot && (void 0 === e.ShadyCSS || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype,
  i = Symbol(),
  r = new WeakMap;
class o {
  constructor(t, e, n) {
      if (this._$cssResult$ = !0, n !== i) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = t, this.t = e
  }
  get styleSheet() {
      let t = this.o;
      const e = this.t;
      if (n && void 0 === t) {
          const n = void 0 !== e && 1 === e.length;
          n && (t = r.get(e)), void 0 === t && ((this.o = t = new CSSStyleSheet).replaceSync(this.cssText), n && r.set(e, t))
      }
      return t
  }
  toString() {
      return this.cssText
  }
}
const s = (t, ...e) => {
      const n = 1 === t.length ? t[0] : e.reduce((e, n, i) => e + (t => {
          if (!0 === t._$cssResult$) return t.cssText;
          if ("number" == typeof t) return t;
          throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")
      })(n) + t[i + 1], t[0]);
      return new o(n, t, i)
  },
  a = (t, i) => {
      n ? t.adoptedStyleSheets = i.map(t => t instanceof CSSStyleSheet ? t : t.styleSheet) : i.forEach(n => {
          const i = document.createElement("style"),
              r = e.litNonce;
          void 0 !== r && i.setAttribute("nonce", r), i.textContent = n.cssText, t.appendChild(i)
      })
  },
  u = n ? t => t : t => t instanceof CSSStyleSheet ? (t => {
      let e = "";
      for (const n of t.cssRules) e += n.cssText;
      return (t => new o("string" == typeof t ? t : t + "", void 0, i))(e)
  })(t) : t
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
;
var c;
const l = window,
  d = l.trustedTypes,
  h = d ? d.emptyScript : "",
  m = l.reactiveElementPolyfillSupport,
  f = {
      toAttribute(t, e) {
          switch (e) {
              case Boolean:
                  t = t ? h : null;
                  break;
              case Object:
              case Array:
                  t = null == t ? t : JSON.stringify(t)
          }
          return t
      },
      fromAttribute(t, e) {
          let n = t;
          switch (e) {
              case Boolean:
                  n = null !== t;
                  break;
              case Number:
                  n = null === t ? null : Number(t);
                  break;
              case Object:
              case Array:
                  try {
                      n = JSON.parse(t)
                  } catch (t) {
                      n = null
                  }
          }
          return n
      }
  },
  g = (t, e) => e !== t && (e == e || t == t),
  v = {
      attribute: !0,
      type: String,
      converter: f,
      reflect: !1,
      hasChanged: g
  };
class p extends HTMLElement {
  constructor() {
      super(), this._$Ei = new Map, this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this.u()
  }
  static addInitializer(t) {
      var e;
      this.finalize(), (null !== (e = this.h) && void 0 !== e ? e : this.h = []).push(t)
  }
  static get observedAttributes() {
      this.finalize();
      const t = [];
      return this.elementProperties.forEach((e, n) => {
          const i = this._$Ep(n, e);
          void 0 !== i && (this._$Ev.set(i, n), t.push(i))
      }), t
  }
  static createProperty(t, e = v) {
      if (e.state && (e.attribute = !1), this.finalize(), this.elementProperties.set(t, e), !e.noAccessor && !this.prototype.hasOwnProperty(t)) {
          const n = "symbol" == typeof t ? Symbol() : "__" + t,
              i = this.getPropertyDescriptor(t, n, e);
          void 0 !== i && Object.defineProperty(this.prototype, t, i)
      }
  }
  static getPropertyDescriptor(t, e, n) {
      return {
          get() {
              return this[e]
          },
          set(i) {
              const r = this[t];
              this[e] = i, this.requestUpdate(t, r, n)
          },
          configurable: !0,
          enumerable: !0
      }
  }
  static getPropertyOptions(t) {
      return this.elementProperties.get(t) || v
  }
  static finalize() {
      if (this.hasOwnProperty("finalized")) return !1;
      this.finalized = !0;
      const t = Object.getPrototypeOf(this);
      if (t.finalize(), void 0 !== t.h && (this.h = [...t.h]), this.elementProperties = new Map(t.elementProperties), this._$Ev = new Map, this.hasOwnProperty("properties")) {
          const t = this.properties,
              e = [...Object.getOwnPropertyNames(t), ...Object.getOwnPropertySymbols(t)];
          for (const n of e) this.createProperty(n, t[n])
      }
      return this.elementStyles = this.finalizeStyles(this.styles), !0
  }
  static finalizeStyles(t) {
      const e = [];
      if (Array.isArray(t)) {
          const n = new Set(t.flat(1 / 0).reverse());
          for (const t of n) e.unshift(u(t))
      } else void 0 !== t && e.push(u(t));
      return e
  }
  static _$Ep(t, e) {
      const n = e.attribute;
      return !1 === n ? void 0 : "string" == typeof n ? n : "string" == typeof t ? t.toLowerCase() : void 0
  }
  u() {
      var t;
      this._$E_ = new Promise(t => this.enableUpdating = t), this._$AL = new Map, this._$Eg(), this.requestUpdate(), null === (t = this.constructor.h) || void 0 === t || t.forEach(t => t(this))
  }
  addController(t) {
      var e, n;
      (null !== (e = this._$ES) && void 0 !== e ? e : this._$ES = []).push(t), void 0 !== this.renderRoot && this.isConnected && (null === (n = t.hostConnected) || void 0 === n || n.call(t))
  }
  removeController(t) {
      var e;
      null === (e = this._$ES) || void 0 === e || e.splice(this._$ES.indexOf(t) >>> 0, 1)
  }
  _$Eg() {
      this.constructor.elementProperties.forEach((t, e) => {
          this.hasOwnProperty(e) && (this._$Ei.set(e, this[e]), delete this[e])
      })
  }
  createRenderRoot() {
      var t;
      const e = null !== (t = this.shadowRoot) && void 0 !== t ? t : this.attachShadow(this.constructor.shadowRootOptions);
      return a(e, this.constructor.elementStyles), e
  }
  connectedCallback() {
      var t;
      void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), null === (t = this._$ES) || void 0 === t || t.forEach(t => {
          var e;
          return null === (e = t.hostConnected) || void 0 === e ? void 0 : e.call(t)
      })
  }
  enableUpdating(t) {}
  disconnectedCallback() {
      var t;
      null === (t = this._$ES) || void 0 === t || t.forEach(t => {
          var e;
          return null === (e = t.hostDisconnected) || void 0 === e ? void 0 : e.call(t)
      })
  }
  attributeChangedCallback(t, e, n) {
      this._$AK(t, n)
  }
  _$EO(t, e, n = v) {
      var i;
      const r = this.constructor._$Ep(t, n);
      if (void 0 !== r && !0 === n.reflect) {
          const o = (void 0 !== (null === (i = n.converter) || void 0 === i ? void 0 : i.toAttribute) ? n.converter : f).toAttribute(e, n.type);
          this._$El = t, null == o ? this.removeAttribute(r) : this.setAttribute(r, o), this._$El = null
      }
  }
  _$AK(t, e) {
      var n;
      const i = this.constructor,
          r = i._$Ev.get(t);
      if (void 0 !== r && this._$El !== r) {
          const t = i.getPropertyOptions(r),
              o = "function" == typeof t.converter ? {
                  fromAttribute: t.converter
              } : void 0 !== (null === (n = t.converter) || void 0 === n ? void 0 : n.fromAttribute) ? t.converter : f;
          this._$El = r, this[r] = o.fromAttribute(e, t.type), this._$El = null
      }
  }
  requestUpdate(t, e, n) {
      let i = !0;
      void 0 !== t && (((n = n || this.constructor.getPropertyOptions(t)).hasChanged || g)(this[t], e) ? (this._$AL.has(t) || this._$AL.set(t, e), !0 === n.reflect && this._$El !== t && (void 0 === this._$EC && (this._$EC = new Map), this._$EC.set(t, n))) : i = !1), !this.isUpdatePending && i && (this._$E_ = this._$Ej())
  }
  async _$Ej() {
      this.isUpdatePending = !0;
      try {
          await this._$E_
      } catch (t) {
          Promise.reject(t)
      }
      const t = this.scheduleUpdate();
      return null != t && await t, !this.isUpdatePending
  }
  scheduleUpdate() {
      return this.performUpdate()
  }
  performUpdate() {
      var t;
      if (!this.isUpdatePending) return;
      this.hasUpdated, this._$Ei && (this._$Ei.forEach((t, e) => this[e] = t), this._$Ei = void 0);
      let e = !1;
      const n = this._$AL;
      try {
          e = this.shouldUpdate(n), e ? (this.willUpdate(n), null === (t = this._$ES) || void 0 === t || t.forEach(t => {
              var e;
              return null === (e = t.hostUpdate) || void 0 === e ? void 0 : e.call(t)
          }), this.update(n)) : this._$Ek()
      } catch (t) {
          throw e = !1, this._$Ek(), t
      }
      e && this._$AE(n)
  }
  willUpdate(t) {}
  _$AE(t) {
      var e;
      null === (e = this._$ES) || void 0 === e || e.forEach(t => {
          var e;
          return null === (e = t.hostUpdated) || void 0 === e ? void 0 : e.call(t)
      }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t)
  }
  _$Ek() {
      this._$AL = new Map, this.isUpdatePending = !1
  }
  get updateComplete() {
      return this.getUpdateComplete()
  }
  getUpdateComplete() {
      return this._$E_
  }
  shouldUpdate(t) {
      return !0
  }
  update(t) {
      void 0 !== this._$EC && (this._$EC.forEach((t, e) => this._$EO(e, this[e], t)), this._$EC = void 0), this._$Ek()
  }
  updated(t) {}
  firstUpdated(t) {}
}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var _;
p.finalized = !0, p.elementProperties = new Map, p.elementStyles = [], p.shadowRootOptions = {
  mode: "open"
}, null == m || m({
  ReactiveElement: p
}), (null !== (c = l.reactiveElementVersions) && void 0 !== c ? c : l.reactiveElementVersions = []).push("1.4.2");
const y = window,
  b = y.trustedTypes,
  w = b ? b.createPolicy("lit-html", {
      createHTML: t => t
  }) : void 0,
  $ = `lit$${(Math.random()+"").slice(9)}$`,
  k = "?" + $,
  S = `<${k}>`,
  A = document,
  x = (t = "") => A.createComment(t),
  C = t => null === t || "object" != typeof t && "function" != typeof t,
  O = Array.isArray,
  E = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
  M = /-->/g,
  D = />/g,
  F = RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)", "g"),
  H = /'/g,
  T = /"/g,
  j = /^(?:script|style|textarea|title)$/i,
  N = (t => (e, ...n) => ({
      _$litType$: t,
      strings: e,
      values: n
  }))(1),
  P = Symbol.for("lit-noChange"),
  z = Symbol.for("lit-nothing"),
  L = new WeakMap,
  U = A.createTreeWalker(A, 129, null, !1),
  R = (t, e) => {
      const n = t.length - 1,
          i = [];
      let r, o = 2 === e ? "<svg>" : "",
          s = E;
      for (let e = 0; e < n; e++) {
          const n = t[e];
          let a, u, c = -1,
              l = 0;
          for (; l < n.length && (s.lastIndex = l, u = s.exec(n), null !== u);) l = s.lastIndex, s === E ? "!--" === u[1] ? s = M : void 0 !== u[1] ? s = D : void 0 !== u[2] ? (j.test(u[2]) && (r = RegExp("</" + u[2], "g")), s = F) : void 0 !== u[3] && (s = F) : s === F ? ">" === u[0] ? (s = null != r ? r : E, c = -1) : void 0 === u[1] ? c = -2 : (c = s.lastIndex - u[2].length, a = u[1], s = void 0 === u[3] ? F : '"' === u[3] ? T : H) : s === T || s === H ? s = F : s === M || s === D ? s = E : (s = F, r = void 0);
          const d = s === F && t[e + 1].startsWith("/>") ? " " : "";
          o += s === E ? n + S : c >= 0 ? (i.push(a), n.slice(0, c) + "$lit$" + n.slice(c) + $ + d) : n + $ + (-2 === c ? (i.push(void 0), e) : d)
      }
      const a = o + (t[n] || "<?>") + (2 === e ? "</svg>" : "");
      if (!Array.isArray(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
      return [void 0 !== w ? w.createHTML(a) : a, i]
  };
class I {
  constructor({
      strings: t,
      _$litType$: e
  }, n) {
      let i;
      this.parts = [];
      let r = 0,
          o = 0;
      const s = t.length - 1,
          a = this.parts,
          [u, c] = R(t, e);
      if (this.el = I.createElement(u, n), U.currentNode = this.el.content, 2 === e) {
          const t = this.el.content,
              e = t.firstChild;
          e.remove(), t.append(...e.childNodes)
      }
      for (; null !== (i = U.nextNode()) && a.length < s;) {
          if (1 === i.nodeType) {
              if (i.hasAttributes()) {
                  const t = [];
                  for (const e of i.getAttributeNames())
                      if (e.endsWith("$lit$") || e.startsWith($)) {
                          const n = c[o++];
                          if (t.push(e), void 0 !== n) {
                              const t = i.getAttribute(n.toLowerCase() + "$lit$").split($),
                                  e = /([.?@])?(.*)/.exec(n);
                              a.push({
                                  type: 1,
                                  index: r,
                                  name: e[2],
                                  strings: t,
                                  ctor: "." === e[1] ? W : "?" === e[1] ? J : "@" === e[1] ? X : B
                              })
                          } else a.push({
                              type: 6,
                              index: r
                          })
                      }
                  for (const e of t) i.removeAttribute(e)
              }
              if (j.test(i.tagName)) {
                  const t = i.textContent.split($),
                      e = t.length - 1;
                  if (e > 0) {
                      i.textContent = b ? b.emptyScript : "";
                      for (let n = 0; n < e; n++) i.append(t[n], x()), U.nextNode(), a.push({
                          type: 2,
                          index: ++r
                      });
                      i.append(t[e], x())
                  }
              }
          } else if (8 === i.nodeType)
              if (i.data === k) a.push({
                  type: 2,
                  index: r
              });
              else {
                  let t = -1;
                  for (; - 1 !== (t = i.data.indexOf($, t + 1));) a.push({
                      type: 7,
                      index: r
                  }), t += $.length - 1
              }
          r++
      }
  }
  static createElement(t, e) {
      const n = A.createElement("template");
      return n.innerHTML = t, n
  }
}

function Y(t, e, n = t, i) {
  var r, o, s, a;
  if (e === P) return e;
  let u = void 0 !== i ? null === (r = n._$Co) || void 0 === r ? void 0 : r[i] : n._$Cl;
  const c = C(e) ? void 0 : e._$litDirective$;
  return (null == u ? void 0 : u.constructor) !== c && (null === (o = null == u ? void 0 : u._$AO) || void 0 === o || o.call(u, !1), void 0 === c ? u = void 0 : (u = new c(t), u._$AT(t, n, i)), void 0 !== i ? (null !== (s = (a = n)._$Co) && void 0 !== s ? s : a._$Co = [])[i] = u : n._$Cl = u), void 0 !== u && (e = Y(t, u._$AS(t, e.values), u, i)), e
}
class V {
  constructor(t, e) {
      this.u = [], this._$AN = void 0, this._$AD = t, this._$AM = e
  }
  get parentNode() {
      return this._$AM.parentNode
  }
  get _$AU() {
      return this._$AM._$AU
  }
  v(t) {
      var e;
      const {
          el: {
              content: n
          },
          parts: i
      } = this._$AD, r = (null !== (e = null == t ? void 0 : t.creationScope) && void 0 !== e ? e : A).importNode(n, !0);
      U.currentNode = r;
      let o = U.nextNode(),
          s = 0,
          a = 0,
          u = i[0];
      for (; void 0 !== u;) {
          if (s === u.index) {
              let e;
              2 === u.type ? e = new q(o, o.nextSibling, this, t) : 1 === u.type ? e = new u.ctor(o, u.name, u.strings, this, t) : 6 === u.type && (e = new K(o, this, t)), this.u.push(e), u = i[++a]
          }
          s !== (null == u ? void 0 : u.index) && (o = U.nextNode(), s++)
      }
      return r
  }
  p(t) {
      let e = 0;
      for (const n of this.u) void 0 !== n && (void 0 !== n.strings ? (n._$AI(t, n, e), e += n.strings.length - 2) : n._$AI(t[e])), e++
  }
}
class q {
  constructor(t, e, n, i) {
      var r;
      this.type = 2, this._$AH = z, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = n, this.options = i, this._$Cm = null === (r = null == i ? void 0 : i.isConnected) || void 0 === r || r
  }
  get _$AU() {
      var t, e;
      return null !== (e = null === (t = this._$AM) || void 0 === t ? void 0 : t._$AU) && void 0 !== e ? e : this._$Cm
  }
  get parentNode() {
      let t = this._$AA.parentNode;
      const e = this._$AM;
      return void 0 !== e && 11 === t.nodeType && (t = e.parentNode), t
  }
  get startNode() {
      return this._$AA
  }
  get endNode() {
      return this._$AB
  }
  _$AI(t, e = this) {
      t = Y(this, t, e), C(t) ? t === z || null == t || "" === t ? (this._$AH !== z && this._$AR(), this._$AH = z) : t !== this._$AH && t !== P && this.g(t) : void 0 !== t._$litType$ ? this.$(t) : void 0 !== t.nodeType ? this.T(t) : (t => O(t) || "function" == typeof(null == t ? void 0 : t[Symbol.iterator]))(t) ? this.k(t) : this.g(t)
  }
  O(t, e = this._$AB) {
      return this._$AA.parentNode.insertBefore(t, e)
  }
  T(t) {
      this._$AH !== t && (this._$AR(), this._$AH = this.O(t))
  }
  g(t) {
      this._$AH !== z && C(this._$AH) ? this._$AA.nextSibling.data = t : this.T(A.createTextNode(t)), this._$AH = t
  }
  $(t) {
      var e;
      const {
          values: n,
          _$litType$: i
      } = t, r = "number" == typeof i ? this._$AC(t) : (void 0 === i.el && (i.el = I.createElement(i.h, this.options)), i);
      if ((null === (e = this._$AH) || void 0 === e ? void 0 : e._$AD) === r) this._$AH.p(n);
      else {
          const t = new V(r, this),
              e = t.v(this.options);
          t.p(n), this.T(e), this._$AH = t
      }
  }
  _$AC(t) {
      let e = L.get(t.strings);
      return void 0 === e && L.set(t.strings, e = new I(t)), e
  }
  k(t) {
      O(this._$AH) || (this._$AH = [], this._$AR());
      const e = this._$AH;
      let n, i = 0;
      for (const r of t) i === e.length ? e.push(n = new q(this.O(x()), this.O(x()), this, this.options)) : n = e[i], n._$AI(r), i++;
      i < e.length && (this._$AR(n && n._$AB.nextSibling, i), e.length = i)
  }
  _$AR(t = this._$AA.nextSibling, e) {
      var n;
      for (null === (n = this._$AP) || void 0 === n || n.call(this, !1, !0, e); t && t !== this._$AB;) {
          const e = t.nextSibling;
          t.remove(), t = e
      }
  }
  setConnected(t) {
      var e;
      void 0 === this._$AM && (this._$Cm = t, null === (e = this._$AP) || void 0 === e || e.call(this, t))
  }
}
class B {
  constructor(t, e, n, i, r) {
      this.type = 1, this._$AH = z, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = r, n.length > 2 || "" !== n[0] || "" !== n[1] ? (this._$AH = Array(n.length - 1).fill(new String), this.strings = n) : this._$AH = z
  }
  get tagName() {
      return this.element.tagName
  }
  get _$AU() {
      return this._$AM._$AU
  }
  _$AI(t, e = this, n, i) {
      const r = this.strings;
      let o = !1;
      if (void 0 === r) t = Y(this, t, e, 0), o = !C(t) || t !== this._$AH && t !== P, o && (this._$AH = t);
      else {
          const i = t;
          let s, a;
          for (t = r[0], s = 0; s < r.length - 1; s++) a = Y(this, i[n + s], e, s), a === P && (a = this._$AH[s]), o || (o = !C(a) || a !== this._$AH[s]), a === z ? t = z : t !== z && (t += (null != a ? a : "") + r[s + 1]), this._$AH[s] = a
      }
      o && !i && this.j(t)
  }
  j(t) {
      t === z ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != t ? t : "")
  }
}
class W extends B {
  constructor() {
      super(...arguments), this.type = 3
  }
  j(t) {
      this.element[this.name] = t === z ? void 0 : t
  }
}
const Z = b ? b.emptyScript : "";
class J extends B {
  constructor() {
      super(...arguments), this.type = 4
  }
  j(t) {
      t && t !== z ? this.element.setAttribute(this.name, Z) : this.element.removeAttribute(this.name)
  }
}
class X extends B {
  constructor(t, e, n, i, r) {
      super(t, e, n, i, r), this.type = 5
  }
  _$AI(t, e = this) {
      var n;
      if ((t = null !== (n = Y(this, t, e, 0)) && void 0 !== n ? n : z) === P) return;
      const i = this._$AH,
          r = t === z && i !== z || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive,
          o = t !== z && (i === z || r);
      r && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, t), this._$AH = t
  }
  handleEvent(t) {
      var e, n;
      "function" == typeof this._$AH ? this._$AH.call(null !== (n = null === (e = this.options) || void 0 === e ? void 0 : e.host) && void 0 !== n ? n : this.element, t) : this._$AH.handleEvent(t)
  }
}
class K {
  constructor(t, e, n) {
      this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = n
  }
  get _$AU() {
      return this._$AM._$AU
  }
  _$AI(t) {
      Y(this, t)
  }
}
const G = y.litHtmlPolyfillSupport;
null == G || G(I, q), (null !== (_ = y.litHtmlVersions) && void 0 !== _ ? _ : y.litHtmlVersions = []).push("2.4.0");
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var Q, tt;
class et extends p {
  constructor() {
      super(...arguments), this.renderOptions = {
          host: this
      }, this._$Do = void 0
  }
  createRenderRoot() {
      var t, e;
      const n = super.createRenderRoot();
      return null !== (t = (e = this.renderOptions).renderBefore) && void 0 !== t || (e.renderBefore = n.firstChild), n
  }
  update(t) {
      const e = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ((t, e, n) => {
          var i, r;
          const o = null !== (i = null == n ? void 0 : n.renderBefore) && void 0 !== i ? i : e;
          let s = o._$litPart$;
          if (void 0 === s) {
              const t = null !== (r = null == n ? void 0 : n.renderBefore) && void 0 !== r ? r : null;
              o._$litPart$ = s = new q(e.insertBefore(x(), t), t, void 0, null != n ? n : {})
          }
          return s._$AI(t), s
      })(e, this.renderRoot, this.renderOptions)
  }
  connectedCallback() {
      var t;
      super.connectedCallback(), null === (t = this._$Do) || void 0 === t || t.setConnected(!0)
  }
  disconnectedCallback() {
      var t;
      super.disconnectedCallback(), null === (t = this._$Do) || void 0 === t || t.setConnected(!1)
  }
  render() {
      return P
  }
}
et.finalized = !0, et._$litElement$ = !0, null === (Q = globalThis.litElementHydrateSupport) || void 0 === Q || Q.call(globalThis, {
  LitElement: et
});
const nt = globalThis.litElementPolyfillSupport;
null == nt || nt({
  LitElement: et
}), (null !== (tt = globalThis.litElementVersions) && void 0 !== tt ? tt : globalThis.litElementVersions = []).push("3.2.2");
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const it = t => e => "function" == typeof e ? ((t, e) => (customElements.define(t, e), e))(t, e) : ((t, e) => {
      const {
          kind: n,
          elements: i
      } = e;
      return {
          kind: n,
          elements: i,
          finisher(e) {
              customElements.define(t, e)
          }
      }
  })(t, e)
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  ,
  rt = (t, e) => "method" === e.kind && e.descriptor && !("value" in e.descriptor) ? { ...e,
      finisher(n) {
          n.createProperty(e.key, t)
      }
  } : {
      kind: "field",
      key: Symbol(),
      placement: "own",
      descriptor: {},
      originalKey: e.key,
      initializer() {
          "function" == typeof e.initializer && (this[e.key] = e.initializer.call(this))
      },
      finisher(n) {
          n.createProperty(e.key, t)
      }
  };

function ot(t) {
  return (e, n) => void 0 !== n ? ((t, e, n) => {
      e.constructor.createProperty(n, t)
  })(t, e, n) : rt(t, e)
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
}

function st(t) {
  return ot({ ...t,
      state: !0
  })
}
/**
* @license
* Copyright 2021 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var at;
null === (at = window.HTMLSlotElement) || void 0 === at || at.prototype.assignedElements;
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const ut = 1,
  ct = t => (...e) => ({
      _$litDirective$: t,
      values: e
  });
class lt {
  constructor(t) {}
  get _$AU() {
      return this._$AM._$AU
  }
  _$AT(t, e, n) {
      this._$Ct = t, this._$AM = e, this._$Ci = n
  }
  _$AS(t, e) {
      return this.update(t, e)
  }
  update(t, e) {
      return this.render(...e)
  }
}
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const dt = ct(class extends lt {
  constructor(t) {
      var e;
      if (super(t), t.type !== ut || "style" !== t.name || (null === (e = t.strings) || void 0 === e ? void 0 : e.length) > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")
  }
  render(t) {
      return Object.keys(t).reduce((e, n) => {
          const i = t[n];
          return null == i ? e : e + `${n=n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`
      }, "")
  }
  update(t, [e]) {
      const {
          style: n
      } = t.element;
      if (void 0 === this.vt) {
          this.vt = new Set;
          for (const t in e) this.vt.add(t);
          return this.render(e)
      }
      this.vt.forEach(t => {
          null == e[t] && (this.vt.delete(t), t.includes("-") ? n.removeProperty(t) : n[t] = "")
      });
      for (const t in e) {
          const i = e[t];
          null != i && (this.vt.add(t), t.includes("-") ? n.setProperty(t, i) : n[t] = i)
      }
      return P
  }
});
var ht = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,
  mt = "[^\\s]+",
  ft = /\[([^]*?)\]/gm;

function gt(t, e) {
  for (var n = [], i = 0, r = t.length; i < r; i++) n.push(t[i].substr(0, e));
  return n
}
var vt = function(t) {
  return function(e, n) {
      var i = n[t].map((function(t) {
          return t.toLowerCase()
      })).indexOf(e.toLowerCase());
      return i > -1 ? i : null
  }
};

function pt(t) {
  for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
  for (var i = 0, r = e; i < r.length; i++) {
      var o = r[i];
      for (var s in o) t[s] = o[s]
  }
  return t
}
var _t = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  yt = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  bt = gt(yt, 3),
  wt = {
      dayNamesShort: gt(_t, 3),
      dayNames: _t,
      monthNamesShort: bt,
      monthNames: yt,
      amPm: ["am", "pm"],
      DoFn: function(t) {
          return t + ["th", "st", "nd", "rd"][t % 10 > 3 ? 0 : (t - t % 10 != 10 ? 1 : 0) * t % 10]
      }
  },
  $t = pt({}, wt),
  kt = function(t, e) {
      for (void 0 === e && (e = 2), t = String(t); t.length < e;) t = "0" + t;
      return t
  },
  St = {
      D: function(t) {
          return String(t.getDate())
      },
      DD: function(t) {
          return kt(t.getDate())
      },
      Do: function(t, e) {
          return e.DoFn(t.getDate())
      },
      d: function(t) {
          return String(t.getDay())
      },
      dd: function(t) {
          return kt(t.getDay())
      },
      ddd: function(t, e) {
          return e.dayNamesShort[t.getDay()]
      },
      dddd: function(t, e) {
          return e.dayNames[t.getDay()]
      },
      M: function(t) {
          return String(t.getMonth() + 1)
      },
      MM: function(t) {
          return kt(t.getMonth() + 1)
      },
      MMM: function(t, e) {
          return e.monthNamesShort[t.getMonth()]
      },
      MMMM: function(t, e) {
          return e.monthNames[t.getMonth()]
      },
      YY: function(t) {
          return kt(String(t.getFullYear()), 4).substr(2)
      },
      YYYY: function(t) {
          return kt(t.getFullYear(), 4)
      },
      h: function(t) {
          return String(t.getHours() % 12 || 12)
      },
      hh: function(t) {
          return kt(t.getHours() % 12 || 12)
      },
      H: function(t) {
          return String(t.getHours())
      },
      HH: function(t) {
          return kt(t.getHours())
      },
      m: function(t) {
          return String(t.getMinutes())
      },
      mm: function(t) {
          return kt(t.getMinutes())
      },
      s: function(t) {
          return String(t.getSeconds())
      },
      ss: function(t) {
          return kt(t.getSeconds())
      },
      S: function(t) {
          return String(Math.round(t.getMilliseconds() / 100))
      },
      SS: function(t) {
          return kt(Math.round(t.getMilliseconds() / 10), 2)
      },
      SSS: function(t) {
          return kt(t.getMilliseconds(), 3)
      },
      a: function(t, e) {
          return t.getHours() < 12 ? e.amPm[0] : e.amPm[1]
      },
      A: function(t, e) {
          return t.getHours() < 12 ? e.amPm[0].toUpperCase() : e.amPm[1].toUpperCase()
      },
      ZZ: function(t) {
          var e = t.getTimezoneOffset();
          return (e > 0 ? "-" : "+") + kt(100 * Math.floor(Math.abs(e) / 60) + Math.abs(e) % 60, 4)
      },
      Z: function(t) {
          var e = t.getTimezoneOffset();
          return (e > 0 ? "-" : "+") + kt(Math.floor(Math.abs(e) / 60), 2) + ":" + kt(Math.abs(e) % 60, 2)
      }
  },
  At = function(t) {
      return +t - 1
  },
  xt = [null, "[1-9]\\d?"],
  Ct = [null, mt],
  Ot = ["isPm", mt, function(t, e) {
      var n = t.toLowerCase();
      return n === e.amPm[0] ? 0 : n === e.amPm[1] ? 1 : null
  }],
  Et = ["timezoneOffset", "[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?", function(t) {
      var e = (t + "").match(/([+-]|\d\d)/gi);
      if (e) {
          var n = 60 * +e[1] + parseInt(e[2], 10);
          return "+" === e[0] ? n : -n
      }
      return 0
  }],
  Mt = (vt("monthNamesShort"), vt("monthNames"), {
      default: "ddd MMM DD YYYY HH:mm:ss",
      shortDate: "M/D/YY",
      mediumDate: "MMM D, YYYY",
      longDate: "MMMM D, YYYY",
      fullDate: "dddd, MMMM D, YYYY",
      isoDate: "YYYY-MM-DD",
      isoDateTime: "YYYY-MM-DDTHH:mm:ssZ",
      shortTime: "HH:mm",
      mediumTime: "HH:mm:ss",
      longTime: "HH:mm:ss.SSS"
  }),
  Dt = function(t, e, n) {
      if (void 0 === e && (e = Mt.default), void 0 === n && (n = {}), "number" == typeof t && (t = new Date(t)), "[object Date]" !== Object.prototype.toString.call(t) || isNaN(t.getTime())) throw new Error("Invalid Date pass to format");
      var i = [];
      e = (e = Mt[e] || e).replace(ft, (function(t, e) {
          return i.push(e), "@@@"
      }));
      var r = pt(pt({}, $t), n);
      return (e = e.replace(ht, (function(e) {
          return St[e](t, r)
      }))).replace(/@@@/g, (function() {
          return i.shift()
      }))
  };
var Ft, Ht = Dt,
  Tt = function() {
      try {
          (new Date).toLocaleDateString("i")
      } catch (t) {
          return "RangeError" === t.name
      }
      return !1
  }() ? function(t, e) {
      return t.toLocaleDateString(e.language, {
          year: "numeric",
          month: "long",
          day: "numeric"
      })
  } : function(t) {
      return Ht(t, "mediumDate")
  },
  jt = function() {
      try {
          (new Date).toLocaleString("i")
      } catch (t) {
          return "RangeError" === t.name
      }
      return !1
  }() ? function(t, e) {
      return t.toLocaleString(e.language, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit"
      })
  } : function(t) {
      return Ht(t, "haDateTime")
  },
  Nt = function() {
      try {
          (new Date).toLocaleTimeString("i")
      } catch (t) {
          return "RangeError" === t.name
      }
      return !1
  }() ? function(t, e) {
      return t.toLocaleTimeString(e.language, {
          hour: "numeric",
          minute: "2-digit"
      })
  } : function(t) {
      return Ht(t, "shortTime")
  };

function Pt(t) {
  return t.substr(0, t.indexOf("."))
}! function(t) {
  t.language = "language", t.system = "system", t.comma_decimal = "comma_decimal", t.decimal_comma = "decimal_comma", t.space_comma = "space_comma", t.none = "none"
}(Ft || (Ft = {}));
var zt = function(t, e, n) {
      var i;
      switch (null == e ? void 0 : e.number_format) {
          case Ft.comma_decimal:
              i = ["en-US", "en"];
              break;
          case Ft.decimal_comma:
              i = ["de", "es", "it"];
              break;
          case Ft.space_comma:
              i = ["fr", "sv", "cs"];
              break;
          case Ft.system:
              i = void 0;
              break;
          default:
              i = null == e ? void 0 : e.language
      }
      if (Number.isNaN = Number.isNaN || function t(e) {
              return "number" == typeof e && t(e)
          }, !Number.isNaN(Number(t)) && Intl && (null == e ? void 0 : e.number_format) !== Ft.none) try {
          return new Intl.NumberFormat(i, Lt(t, n)).format(Number(t))
      } catch (e) {
          return console.error(e), new Intl.NumberFormat(void 0, Lt(t, n)).format(Number(t))
      }
      return t ? t.toString() : ""
  },
  Lt = function(t, e) {
      var n = e || {};
      if ("string" != typeof t) return n;
      if (!e || !e.minimumFractionDigits && !e.maximumFractionDigits) {
          var i = t.indexOf(".") > -1 ? t.split(".")[1].length : 0;
          n.minimumFractionDigits = i, n.maximumFractionDigits = i
      }
      return n
  };

function Ut(t, e, n, i) {
  var r = void 0 !== i ? i : e.state;
  if ("unknown" === r || "unavailable" === r) return t("state.default." + r);
  if (e.attributes.unit_of_measurement) return zt(r, n) + " " + e.attributes.unit_of_measurement;
  var o = function(t) {
      return Pt(t.entity_id)
  }(e);
  if ("input_datetime" === o) {
      var s;
      if (!e.attributes.has_time) return s = new Date(e.attributes.year, e.attributes.month - 1, e.attributes.day), Tt(s, n);
      if (!e.attributes.has_date) {
          var a = new Date;
          return s = new Date(a.getFullYear(), a.getMonth(), a.getDay(), e.attributes.hour, e.attributes.minute), Nt(s, n)
      }
      return s = new Date(e.attributes.year, e.attributes.month - 1, e.attributes.day, e.attributes.hour, e.attributes.minute), jt(s, n)
  }
  return "humidifier" === o && "on" === r && e.attributes.humidity ? e.attributes.humidity + " %" : "counter" === o || "number" === o ? zt(r, n) : e.attributes.device_class && t("component." + o + ".state." + e.attributes.device_class + "." + e.state) || t("component." + o + ".state._." + e.state) || e.state
}
var Rt = ["closed", "locked", "off"],
  It = function(t, e, n, i) {
      i = i || {}, n = null == n ? {} : n;
      var r = new Event(e, {
          bubbles: void 0 === i.bubbles || i.bubbles,
          cancelable: Boolean(i.cancelable),
          composed: void 0 === i.composed || i.composed
      });
      return r.detail = n, t.dispatchEvent(r), r
  },
  Yt = {
      alert: "hass:alert",
      automation: "hass:playlist-play",
      calendar: "hass:calendar",
      camera: "hass:video",
      climate: "hass:thermostat",
      configurator: "hass:settings",
      conversation: "hass:text-to-speech",
      device_tracker: "hass:account",
      fan: "hass:fan",
      group: "hass:google-circles-communities",
      history_graph: "hass:chart-line",
      homeassistant: "hass:home-assistant",
      homekit: "hass:home-automation",
      image_processing: "hass:image-filter-frames",
      input_boolean: "hass:drawing",
      input_datetime: "hass:calendar-clock",
      input_number: "hass:ray-vertex",
      input_select: "hass:format-list-bulleted",
      input_text: "hass:textbox",
      light: "hass:lightbulb",
      mailbox: "hass:mailbox",
      notify: "hass:comment-alert",
      person: "hass:account",
      plant: "hass:flower",
      proximity: "hass:apple-safari",
      remote: "hass:remote",
      scene: "hass:google-pages",
      script: "hass:file-document",
      sensor: "hass:eye",
      simple_alarm: "hass:bell",
      sun: "hass:white-balance-sunny",
      switch: "hass:flash",
      timer: "hass:timer",
      updater: "hass:cloud-upload",
      vacuum: "hass:robot-vacuum",
      water_heater: "hass:thermometer",
      weblink: "hass:open-in-new"
  };

function Vt(t, e) {
  if (t in Yt) return Yt[t];
  switch (t) {
      case "alarm_control_panel":
          switch (e) {
              case "armed_home":
                  return "hass:bell-plus";
              case "armed_night":
                  return "hass:bell-sleep";
              case "disarmed":
                  return "hass:bell-outline";
              case "triggered":
                  return "hass:bell-ring";
              default:
                  return "hass:bell"
          }
      case "binary_sensor":
          return e && "off" === e ? "hass:radiobox-blank" : "hass:checkbox-marked-circle";
      case "cover":
          return "closed" === e ? "hass:window-closed" : "hass:window-open";
      case "lock":
          return e && "unlocked" === e ? "hass:lock-open" : "hass:lock";
      case "media_player":
          return e && "off" !== e && "idle" !== e ? "hass:cast-connected" : "hass:cast";
      case "zwave":
          switch (e) {
              case "dead":
                  return "hass:emoticon-dead";
              case "sleeping":
                  return "hass:sleep";
              case "initializing":
                  return "hass:timer-sand";
              default:
                  return "hass:z-wave"
          }
      default:
          return console.warn("Unable to find icon for domain " + t + " (" + e + ")"), "hass:bookmark"
  }
}
var qt = function(t) {
      It(window, "haptic", t)
  },
  Bt = function(t, e) {
      return function(t, e, n) {
          void 0 === n && (n = !0);
          var i, r = Pt(e),
              o = "group" === r ? "homeassistant" : r;
          switch (r) {
              case "lock":
                  i = n ? "unlock" : "lock";
                  break;
              case "cover":
                  i = n ? "open_cover" : "close_cover";
                  break;
              default:
                  i = n ? "turn_on" : "turn_off"
          }
          return t.callService(o, i, {
              entity_id: e
          })
      }(t, e, Rt.includes(t.states[e].state))
  },
  Wt = function(t, e, n, i) {
      if (i || (i = {
              action: "more-info"
          }), !i.confirmation || i.confirmation.exemptions && i.confirmation.exemptions.some((function(t) {
              return t.user === e.user.id
          })) || (qt("warning"), confirm(i.confirmation.text || "Are you sure you want to " + i.action + "?"))) switch (i.action) {
          case "more-info":
              (n.entity || n.camera_image) && It(t, "hass-more-info", {
                  entityId: n.entity ? n.entity : n.camera_image
              });
              break;
          case "navigate":
              i.navigation_path && function(t, e, n) {
                  void 0 === n && (n = !1), n ? history.replaceState(null, "", e) : history.pushState(null, "", e), It(window, "location-changed", {
                      replace: n
                  })
              }(0, i.navigation_path);
              break;
          case "url":
              i.url_path && window.open(i.url_path);
              break;
          case "toggle":
              n.entity && (Bt(e, n.entity), qt("success"));
              break;
          case "call-service":
              if (!i.service) return void qt("failure");
              var r = i.service.split(".", 2);
              e.callService(r[0], r[1], i.service_data), qt("success");
              break;
          case "fire-dom-event":
              It(t, "ll-custom", i)
      }
  };

function Zt(t) {
  return void 0 !== t && "none" !== t.action
}
var Jt = {
      humidity: "hass:water-percent",
      illuminance: "hass:brightness-5",
      temperature: "hass:thermometer",
      pressure: "hass:gauge",
      power: "hass:flash",
      signal_strength: "hass:wifi"
  },
  Xt = {
      binary_sensor: function(t) {
          var e = t.state && "off" === t.state;
          switch (t.attributes.device_class) {
              case "battery":
                  return e ? "hass:battery" : "hass:battery-outline";
              case "cold":
                  return e ? "hass:thermometer" : "hass:snowflake";
              case "connectivity":
                  return e ? "hass:server-network-off" : "hass:server-network";
              case "door":
                  return e ? "hass:door-closed" : "hass:door-open";
              case "garage_door":
                  return e ? "hass:garage" : "hass:garage-open";
              case "gas":
              case "power":
              case "problem":
              case "safety":
              case "smoke":
                  return e ? "hass:shield-check" : "hass:alert";
              case "heat":
                  return e ? "hass:thermometer" : "hass:fire";
              case "light":
                  return e ? "hass:brightness-5" : "hass:brightness-7";
              case "lock":
                  return e ? "hass:lock" : "hass:lock-open";
              case "moisture":
                  return e ? "hass:water-off" : "hass:water";
              case "motion":
                  return e ? "hass:walk" : "hass:run";
              case "occupancy":
                  return e ? "hass:home-outline" : "hass:home";
              case "opening":
                  return e ? "hass:square" : "hass:square-outline";
              case "plug":
                  return e ? "hass:power-plug-off" : "hass:power-plug";
              case "presence":
                  return e ? "hass:home-outline" : "hass:home";
              case "sound":
                  return e ? "hass:music-note-off" : "hass:music-note";
              case "vibration":
                  return e ? "hass:crop-portrait" : "hass:vibrate";
              case "window":
                  return e ? "hass:window-closed" : "hass:window-open";
              default:
                  return e ? "hass:radiobox-blank" : "hass:checkbox-marked-circle"
          }
      },
      cover: function(t) {
          var e = "closed" !== t.state;
          switch (t.attributes.device_class) {
              case "garage":
                  return e ? "hass:garage-open" : "hass:garage";
              case "door":
                  return e ? "hass:door-open" : "hass:door-closed";
              case "shutter":
                  return e ? "hass:window-shutter-open" : "hass:window-shutter";
              case "blind":
                  return e ? "hass:blinds-open" : "hass:blinds";
              case "window":
                  return e ? "hass:window-open" : "hass:window-closed";
              default:
                  return Vt("cover", t.state)
          }
      },
      sensor: function(t) {
          var e = t.attributes.device_class;
          if (e && e in Jt) return Jt[e];
          if ("battery" === e) {
              var n = Number(t.state);
              if (isNaN(n)) return "hass:battery-unknown";
              var i = 10 * Math.round(n / 10);
              return i >= 100 ? "hass:battery" : i <= 0 ? "hass:battery-alert" : "hass:battery-" + i
          }
          var r = t.attributes.unit_of_measurement;
          return "°C" === r || "°F" === r ? "hass:thermometer" : Vt("sensor")
      },
      input_datetime: function(t) {
          return t.attributes.has_date ? t.attributes.has_time ? Vt("input_datetime") : "hass:calendar" : "hass:clock"
      }
  };
const Kt = {
      state: !0,
      duration: !0,
      start_date: !0,
      end_date: !0,
      icon: !0,
      separator: !1
  },
  Gt = {
      largest: 1,
      labels: void 0,
      delimiter: void 0,
      units: ["w", "d", "h", "m", "s"]
  },
  Qt = {
      width: 1,
      style: "solid",
      color: "var(--divider-color)"
  },
  te = {
      required: {
          icon: "tune",
          name: "Required",
          secondary: "Required options for this card to function",
          show: !0
      },
      showOptions: {
          icon: "toggle-switch",
          name: "Show",
          secondary: "Customize what to display",
          show: !1
      },
      appearance: {
          icon: "palette",
          name: "Appearance",
          secondary: "Customize the title, number of events to display, etc",
          show: !1
      }
  };
let ee = class extends et {
  constructor() {
      super(...arguments), this._initialized = !1
  }
  setConfig(t) {
      this._config = t, this.loadCardHelpers()
  }
  get _title() {
      return this._config && this._config.title || ""
  }
  get _entity() {
      return this._config && this._config.entity || ""
  }
  get _history() {
      return this._config && this._config.history || 5
  }
  get _desc() {
      return !this._config || void 0 === this._config.desc || this._config.desc
  }
  get _date_format() {
      return this._config && this._config.date_format || ""
  }
  get _no_event() {
      return this._config && this._config.no_event || ""
  }
  get _max_items() {
      return this._config && this._config.max_items || -1
  }
  get _collapse() {
      if (this._config) return this._config.collapse
  }
  get _show_state() {
      var t;
      return !this._config || !this._config.show || (null === (t = this._config.show) || void 0 === t ? void 0 : t.state)
  }
  get _show_duration() {
      var t;
      return !this._config || !this._config.show || (null === (t = this._config.show) || void 0 === t ? void 0 : t.duration)
  }
  get _show_start_date() {
      var t;
      return !this._config || !this._config.show || (null === (t = this._config.show) || void 0 === t ? void 0 : t.start_date)
  }
  get _show_end_date() {
      var t;
      return !this._config || !this._config.show || (null === (t = this._config.show) || void 0 === t ? void 0 : t.end_date)
  }
  get _show_icon() {
      var t;
      return !this._config || !this._config.show || (null === (t = this._config.show) || void 0 === t ? void 0 : t.icon)
  }
  get _show_separator() {
      var t;
      return !(!this._config || !this._config.show) && (null === (t = this._config.show) || void 0 === t ? void 0 : t.separator)
  }
  render() {
      if (!this.hass) return N ``;
      const t = Object.keys(this.hass.states).sort();
      return N `
    <div class="card-config">
      <div class="option" @click=${this._toggleOption} .option=${"required"}>
        <ha-icon class="option-icon" .icon=${"mdi:"+te.required.icon}></ha-icon>
        <div class="option-title">${te.required.name}</div>
        <div class="option-secondary">${te.required.secondary}</div>
      </div>
      ${te.required.show?N`
            <div class="values">
              <ha-select
                naturalMenuWidth
                fixedMenuPosition
                label="Entity (Required)"
                .configValue=${"entity"}
                .value=${this._entity}
                @selected=${this._valueChanged}
                @closed=${t=>t.stopPropagation()}
              >
                ${t.map(t=>N`
                    <mwc-list-item .value=${t}>${t}</mwc-list-item>
                  `)}
              </ha-select>
            </div>
          `:""}
      <div class="option" @click=${this._toggleOption} .option=${"appearance"}>
        <ha-icon class="option-icon" .icon=${"mdi:"+te.appearance.icon}></ha-icon>
        <div class="option-title">${te.appearance.name}</div>
        <div class="option-secondary">${te.appearance.secondary}</div>
      </div>
      ${te.appearance.show?N`
            <div class="values">
              <ha-textfield
                label="Title (Optional)"
                .value=${this._title}
                .configValue=${"title"}
                @input=${this._valueChanged}
              ></ha-textfield>
              <ha-textfield
                type="number"
                label="History: Numbers of days of history of the logbook"
                min="1"
                .value=${this._history}
                .configValue=${"history"}
                @input=${this._valueChanged}
              ></ha-textfield>
              <ha-textfield
                type="number"
                min="-1"
                label="Max Items: Maximum of events to display (-1 to display all events)"
                .value=${this._max_items}
                .configValue=${"max_items"}
                @input=${this._valueChanged}
              ></ha-textfield>
              <ha-textfield
                label="Text when no event"
                .value=${this._no_event}
                .configValue=${"no_event"}
                @input=${this._valueChanged}
              ></ha-textfield>
              <ha-textfield
                type="number"
                label="Collapse: Number of entities to show. Rest will be available in expandable section"
                .value=${this._collapse}
                .configValue=${"collapse"}
                @input=${this._valueChanged}
              ></ha-textfield>
              <ha-textfield
                label="Date format"
                .value=${this._date_format}
                .configValue=${"date_format"}
                @input=${this._valueChanged}
              ></ha-textfield>
              <p>
                <ha-formfield .label=${"Display events descending "+(this._desc?"on":"off")}>
                  <ha-switch
                    aria-label=${"Toggle desc "+(this._desc?"on":"off")}
                    .checked=${!1!==this._desc}
                    .configValue=${"desc"}
                    @change=${this._valueChanged}
                  ></mwv-switch>
                </ha-formfield>
              </p>
            </div>
          `:""}
      <div class="option" @click=${this._toggleOption} .option=${"showOptions"}>
        <ha-icon class="option-icon" .icon=${"mdi:"+te.showOptions.icon}></ha-icon>
        <div class="option-title">${te.showOptions.name}</div>
        <div class="option-secondary">${te.showOptions.secondary}</div>
      </div>
      ${te.showOptions.show?N`
            <div class="values">
              <ha-formfield .label=${"Display state"}>
                <ha-switch
                  aria-label=${"Toggle display of state "+(this._show_state?"off":"on")}
                  .checked=${!1!==this._show_state}
                  .configValue=${"state"}
                  @change=${this._showOptionChanged}
                ></ha-switch>
              </ha-formfield>
              <ha-formfield .label=${"Display duration"}>
                <ha-switch
                  aria-label=${"Toggle display of duration "+(this._show_state?"off":"on")}
                  .checked=${!1!==this._show_duration}
                  .configValue=${"duration"}
                  @change=${this._showOptionChanged}
                ></ha-switch>
              </ha-formfield>
              <ha-formfield .label=${"Display start date"}>
                <ha-switch
                  aria-label=${"Toggle display of start date "+(this._show_start_date?"off":"on")}
                  .checked=${!1!==this._show_start_date}
                  .configValue=${"start_date"}
                  @change=${this._showOptionChanged}
                ></ha-switch>
              </ha-formfield>
              <ha-formfield .label=${"Display end date"}>
                <ha-switch
                  aria-label=${"Toggle display of end date "+(this._show_end_date?"off":"on")}
                  .checked=${!1!==this._show_end_date}
                  .configValue=${"end_date"}
                  @change=${this._showOptionChanged}
                ></ha-switch>
              </ha-formfield>
              <ha-formfield .label=${"Display icon"}>
                <ha-switch
                  aria-label=${"Toggle display of icon "+(this._show_icon?"off":"on")}
                  .checked=${!0===this._show_icon}
                  .configValue=${"icon"}
                  @change=${this._showOptionChanged}
                ></ha-switch>
              </ha-formfield>
              <ha-formfield .label=${"Display separator"}>
                <ha-switch
                  aria-label=${"Toggle display of event separator "+(this._show_separator?"off":"on")}
                  .checked=${!1!==this._show_separator}
                  .configValue=${"separator"}
                  @change=${this._showOptionChanged}
                ></ha-switch>
              </ha-formfield>
            </div>
          `:""}
    </div>

    <p class="note">
      Note: Setting hidden_state, duration_labels, attributes, separator_style, state_map are available exclusively
      using Code Editor.
    </p>
  `
  }
  _initialize() {
      void 0 !== this.hass && void 0 !== this._config && void 0 !== this._helpers && (this._initialized = !0)
  }
  async loadCardHelpers() {
      this._helpers = await window.loadCardHelpers()
  }
  _toggleOption(t) {
      this._toggleThing(t, te)
  }
  _toggleThing(t, e) {
      const n = !e[t.target.option].show;
      for (const [t] of Object.entries(e)) e[t].show = !1;
      e[t.target.option].show = n, this._toggle = !this._toggle
  }
  _valueChanged(t) {
      if (!this._config || !this.hass) return;
      const e = t.target;
      if (this["_" + e.configValue] !== e.value) {
          if (e.configValue)
              if ("" === e.value) {
                  const t = Object.assign({}, this._config);
                  delete t[e.configValue], this._config = t
              } else this._config = Object.assign(Object.assign({}, this._config), {
                  [e.configValue]: void 0 !== e.checked ? e.checked : e.attributes.type && "number" === e.attributes.type.value && Number.parseInt(e.value) ? Number.parseInt(e.value) : e.value
              });
          It(this, "config-changed", {
              config: this._config
          })
      }
  }
  _showOptionChanged(t) {
      if (!this._config || !this.hass) return;
      const e = t.target;
      e.configValue && (this._config = Object.assign(Object.assign({}, this._config), {
          show: Object.assign(Object.assign({}, this._config.show || Kt), {
              [e.configValue]: e.checked
          })
      })), It(this, "config-changed", {
          config: this._config
      })
  }
  static get styles() {
      return s `
    .option {
      padding-block: 0.5rem;
      cursor: pointer;
      display: grid;
      grid-template-areas:
        'icon title'
        'icon secondary';
      grid-template-columns: 2rem auto;
      column-gap: 0.5rem;
    }
    .option > * {
      pointer-events: none;
    }
    .option-title {
      grid-area: title;
    }
    .option-icon {
      grid-area: icon;
      align-self: center;
    }
    .option-secondary {
      grid-area: secondary;
    }
    .values {
      padding-inline: 1rem;
      padding-block: 0.5rem;
    }
    ha-select,
    ha-textfield {
      margin-bottom: 1rem;
      display: block;
    }
    ha-formfield {
      display: block;
      margin-inline: 0.5rem;
      margin-block: 1rem;
    }
    ha-switch {
      --mdc-theme-secondary: var(--switch-checked-color);
    }
    .note {
      font-weight: bold;
    }
  `
  }
};
t([ot({
  attribute: !1
})], ee.prototype, "hass", void 0), t([st()], ee.prototype, "_config", void 0), t([st()], ee.prototype, "_toggle", void 0), t([st()], ee.prototype, "_helpers", void 0), ee = t([it("logbook-card-editor")], ee);
var ne = function() {
      function t() {
          var t = this;
          this.languages = {
              ar: {
                  y: function(t) {
                      return 1 === t ? "سنة" : "سنوات"
                  },
                  mo: function(t) {
                      return 1 === t ? "شهر" : "أشهر"
                  },
                  w: function(t) {
                      return 1 === t ? "أسبوع" : "أسابيع"
                  },
                  d: function(t) {
                      return 1 === t ? "يوم" : "أيام"
                  },
                  h: function(t) {
                      return 1 === t ? "ساعة" : "ساعات"
                  },
                  m: function(e) {
                      return ["دقيقة", "دقائق"][t.getArabicForm(e)]
                  },
                  s: function(t) {
                      return 1 === t ? "ثانية" : "ثواني"
                  },
                  ms: function(t) {
                      return 1 === t ? "جزء من الثانية" : "أجزاء من الثانية"
                  },
                  decimal: ","
              },
              bg: {
                  y: function(e) {
                      return ["години", "година", "години"][t.getSlavicForm(e)]
                  },
                  mo: function(e) {
                      return ["месеца", "месец", "месеца"][t.getSlavicForm(e)]
                  },
                  w: function(e) {
                      return ["седмици", "седмица", "седмици"][t.getSlavicForm(e)]
                  },
                  d: function(e) {
                      return ["дни", "ден", "дни"][t.getSlavicForm(e)]
                  },
                  h: function(e) {
                      return ["часа", "час", "часа"][t.getSlavicForm(e)]
                  },
                  m: function(e) {
                      return ["минути", "минута", "минути"][t.getSlavicForm(e)]
                  },
                  s: function(e) {
                      return ["секунди", "секунда", "секунди"][t.getSlavicForm(e)]
                  },
                  ms: function(e) {
                      return ["милисекунди", "милисекунда", "милисекунди"][t.getSlavicForm(e)]
                  },
                  decimal: ","
              },
              ca: {
                  y: function(t) {
                      return "any" + (1 === t ? "" : "s")
                  },
                  mo: function(t) {
                      return "mes" + (1 === t ? "" : "os")
                  },
                  w: function(t) {
                      return "setman" + (1 === t ? "a" : "es")
                  },
                  d: function(t) {
                      return "di" + (1 === t ? "a" : "es")
                  },
                  h: function(t) {
                      return "hor" + (1 === t ? "a" : "es")
                  },
                  m: function(t) {
                      return "minut" + (1 === t ? "" : "s")
                  },
                  s: function(t) {
                      return "segon" + (1 === t ? "" : "s")
                  },
                  ms: function(t) {
                      return "milisegon" + (1 === t ? "" : "s")
                  },
                  decimal: ","
              },
              cs: {
                  y: function(e) {
                      return ["rok", "roku", "roky", "let"][t.getCzechOrSlovakForm(e)]
                  },
                  mo: function(e) {
                      return ["měsíc", "měsíce", "měsíce", "měsíců"][t.getCzechOrSlovakForm(e)]
                  },
                  w: function(e) {
                      return ["týden", "týdne", "týdny", "týdnů"][t.getCzechOrSlovakForm(e)]
                  },
                  d: function(e) {
                      return ["den", "dne", "dny", "dní"][t.getCzechOrSlovakForm(e)]
                  },
                  h: function(e) {
                      return ["hodina", "hodiny", "hodiny", "hodin"][t.getCzechOrSlovakForm(e)]
                  },
                  m: function(e) {
                      return ["minuta", "minuty", "minuty", "minut"][t.getCzechOrSlovakForm(e)]
                  },
                  s: function(e) {
                      return ["sekunda", "sekundy", "sekundy", "sekund"][t.getCzechOrSlovakForm(e)]
                  },
                  ms: function(e) {
                      return ["milisekunda", "milisekundy", "milisekundy", "milisekund"][t.getCzechOrSlovakForm(e)]
                  },
                  decimal: ","
              },
              da: {
                  y: function() {
                      return "år"
                  },
                  mo: function(t) {
                      return "måned" + (1 === t ? "" : "er")
                  },
                  w: function(t) {
                      return "uge" + (1 === t ? "" : "r")
                  },
                  d: function(t) {
                      return "dag" + (1 === t ? "" : "e")
                  },
                  h: function(t) {
                      return "time" + (1 === t ? "" : "r")
                  },
                  m: function(t) {
                      return "minut" + (1 === t ? "" : "ter")
                  },
                  s: function(t) {
                      return "sekund" + (1 === t ? "" : "er")
                  },
                  ms: function(t) {
                      return "millisekund" + (1 === t ? "" : "er")
                  },
                  decimal: ","
              },
              de: {
                  y: function(t) {
                      return "Jahr" + (1 === t ? "" : "e")
                  },
                  mo: function(t) {
                      return "Monat" + (1 === t ? "" : "e")
                  },
                  w: function(t) {
                      return "Woche" + (1 === t ? "" : "n")
                  },
                  d: function(t) {
                      return "Tag" + (1 === t ? "" : "e")
                  },
                  h: function(t) {
                      return "Stunde" + (1 === t ? "" : "n")
                  },
                  m: function(t) {
                      return "Minute" + (1 === t ? "" : "n")
                  },
                  s: function(t) {
                      return "Sekunde" + (1 === t ? "" : "n")
                  },
                  ms: function(t) {
                      return "Millisekunde" + (1 === t ? "" : "n")
                  },
                  decimal: ","
              },
              el: {
                  y: function(t) {
                      return 1 === t ? "χρόνος" : "χρόνια"
                  },
                  mo: function(t) {
                      return 1 === t ? "μήνας" : "μήνες"
                  },
                  w: function(t) {
                      return 1 === t ? "εβδομάδα" : "εβδομάδες"
                  },
                  d: function(t) {
                      return 1 === t ? "μέρα" : "μέρες"
                  },
                  h: function(t) {
                      return 1 === t ? "ώρα" : "ώρες"
                  },
                  m: function(t) {
                      return 1 === t ? "λεπτό" : "λεπτά"
                  },
                  s: function(t) {
                      return 1 === t ? "δευτερόλεπτο" : "δευτερόλεπτα"
                  },
                  ms: function(t) {
                      return 1 === t ? "χιλιοστό του δευτερολέπτου" : "χιλιοστά του δευτερολέπτου"
                  },
                  decimal: ","
              },
              en: {
                  y: function(t) {
                      return "year" + (1 === t ? "" : "s")
                  },
                  mo: function(t) {
                      return "month" + (1 === t ? "" : "s")
                  },
                  w: function(t) {
                      return "week" + (1 === t ? "" : "s")
                  },
                  d: function(t) {
                      return "day" + (1 === t ? "" : "s")
                  },
                  h: function(t) {
                      return "hour" + (1 === t ? "" : "s")
                  },
                  m: function(t) {
                      return "minute" + (1 === t ? "" : "s")
                  },
                  s: function(t) {
                      return "second" + (1 === t ? "" : "s")
                  },
                  ms: function(t) {
                      return "millisecond" + (1 === t ? "" : "s")
                  },
                  decimal: "."
              },
              es: {
                  y: function(t) {
                      return "año" + (1 === t ? "" : "s")
                  },
                  mo: function(t) {
                      return "mes" + (1 === t ? "" : "es")
                  },
                  w: function(t) {
                      return "semana" + (1 === t ? "" : "s")
                  },
                  d: function(t) {
                      return "día" + (1 === t ? "" : "s")
                  },
                  h: function(t) {
                      return "hora" + (1 === t ? "" : "s")
                  },
                  m: function(t) {
                      return "minuto" + (1 === t ? "" : "s")
                  },
                  s: function(t) {
                      return "segundo" + (1 === t ? "" : "s")
                  },
                  ms: function(t) {
                      return "milisegundo" + (1 === t ? "" : "s")
                  },
                  decimal: ","
              },
              et: {
                  y: function(t) {
                      return "aasta" + (1 === t ? "" : "t")
                  },
                  mo: function(t) {
                      return "kuu" + (1 === t ? "" : "d")
                  },
                  w: function(t) {
                      return "nädal" + (1 === t ? "" : "at")
                  },
                  d: function(t) {
                      return "päev" + (1 === t ? "" : "a")
                  },
                  h: function(t) {
                      return "tund" + (1 === t ? "" : "i")
                  },
                  m: function(t) {
                      return "minut" + (1 === t ? "" : "it")
                  },
                  s: function(t) {
                      return "sekund" + (1 === t ? "" : "it")
                  },
                  ms: function(t) {
                      return "millisekund" + (1 === t ? "" : "it")
                  },
                  decimal: ","
              },
              fa: {
                  y: function() {
                      return "سال"
                  },
                  mo: function() {
                      return "ماه"
                  },
                  w: function() {
                      return "هفته"
                  },
                  d: function() {
                      return "روز"
                  },
                  h: function() {
                      return "ساعت"
                  },
                  m: function() {
                      return "دقیقه"
                  },
                  s: function() {
                      return "ثانیه"
                  },
                  ms: function() {
                      return "میلی ثانیه"
                  },
                  decimal: "."
              },
              fi: {
                  y: function(t) {
                      return 1 === t ? "vuosi" : "vuotta"
                  },
                  mo: function(t) {
                      return 1 === t ? "kuukausi" : "kuukautta"
                  },
                  w: function(t) {
                      return "viikko" + (1 === t ? "" : "a")
                  },
                  d: function(t) {
                      return "päivä" + (1 === t ? "" : "ä")
                  },
                  h: function(t) {
                      return "tunti" + (1 === t ? "" : "a")
                  },
                  m: function(t) {
                      return "minuutti" + (1 === t ? "" : "a")
                  },
                  s: function(t) {
                      return "sekunti" + (1 === t ? "" : "a")
                  },
                  ms: function(t) {
                      return "millisekunti" + (1 === t ? "" : "a")
                  },
                  decimal: ","
              },
              fo: {
                  y: function() {
                      return "ár"
                  },
                  mo: function(t) {
                      return 1 === t ? "mánaður" : "mánaðir"
                  },
                  w: function(t) {
                      return 1 === t ? "vika" : "vikur"
                  },
                  d: function(t) {
                      return 1 === t ? "dagur" : "dagar"
                  },
                  h: function(t) {
                      return 1 === t ? "tími" : "tímar"
                  },
                  m: function(t) {
                      return 1 === t ? "minuttur" : "minuttir"
                  },
                  s: function() {
                      return "sekund"
                  },
                  ms: function() {
                      return "millisekund"
                  },
                  decimal: ","
              },
              fr: {
                  y: function(t) {
                      return "an" + (t >= 2 ? "s" : "")
                  },
                  mo: function() {
                      return "mois"
                  },
                  w: function(t) {
                      return "semaine" + (t >= 2 ? "s" : "")
                  },
                  d: function(t) {
                      return "jour" + (t >= 2 ? "s" : "")
                  },
                  h: function(t) {
                      return "heure" + (t >= 2 ? "s" : "")
                  },
                  m: function(t) {
                      return "minute" + (t >= 2 ? "s" : "")
                  },
                  s: function(t) {
                      return "seconde" + (t >= 2 ? "s" : "")
                  },
                  ms: function(t) {
                      return "milliseconde" + (t >= 2 ? "s" : "")
                  },
                  decimal: ","
              },
              hr: {
                  y: function(t) {
                      return t % 10 == 2 || t % 10 == 3 || t % 10 == 4 ? "godine" : "godina"
                  },
                  mo: function(t) {
                      return 1 === t ? "mjesec" : 2 === t || 3 === t || 4 === t ? "mjeseca" : "mjeseci"
                  },
                  w: function(t) {
                      return t % 10 == 1 && 11 !== t ? "tjedan" : "tjedna"
                  },
                  d: function(t) {
                      return 1 === t ? "dan" : "dana"
                  },
                  h: function(t) {
                      return 1 === t ? "sat" : 2 === t || 3 === t || 4 === t ? "sata" : "sati"
                  },
                  m: function(t) {
                      var e = t % 10;
                      return 2 !== e && 3 !== e && 4 !== e || !(t < 10 || t > 14) ? "minuta" : "minute"
                  },
                  s: function(t) {
                      return 10 === t || 11 === t || 12 === t || 13 === t || 14 === t || 16 === t || 17 === t || 18 === t || 19 === t || t % 10 == 5 ? "sekundi" : t % 10 == 1 ? "sekunda" : t % 10 == 2 || t % 10 == 3 || t % 10 == 4 ? "sekunde" : "sekundi"
                  },
                  ms: function(t) {
                      return 1 === t ? "milisekunda" : t % 10 == 2 || t % 10 == 3 || t % 10 == 4 ? "milisekunde" : "milisekundi"
                  },
                  decimal: ","
              },
              hu: {
                  y: function() {
                      return "év"
                  },
                  mo: function() {
                      return "hónap"
                  },
                  w: function() {
                      return "hét"
                  },
                  d: function() {
                      return "nap"
                  },
                  h: function() {
                      return "óra"
                  },
                  m: function() {
                      return "perc"
                  },
                  s: function() {
                      return "másodperc"
                  },
                  ms: function() {
                      return "ezredmásodperc"
                  },
                  decimal: ","
              },
              id: {
                  y: function() {
                      return "tahun"
                  },
                  mo: function() {
                      return "bulan"
                  },
                  w: function() {
                      return "minggu"
                  },
                  d: function() {
                      return "hari"
                  },
                  h: function() {
                      return "jam"
                  },
                  m: function() {
                      return "menit"
                  },
                  s: function() {
                      return "detik"
                  },
                  ms: function() {
                      return "milidetik"
                  },
                  decimal: "."
              },
              is: {
                  y: function() {
                      return "ár"
                  },
                  mo: function(t) {
                      return "mánuð" + (1 === t ? "ur" : "ir")
                  },
                  w: function(t) {
                      return "vik" + (1 === t ? "a" : "ur")
                  },
                  d: function(t) {
                      return "dag" + (1 === t ? "ur" : "ar")
                  },
                  h: function(t) {
                      return "klukkutím" + (1 === t ? "i" : "ar")
                  },
                  m: function(t) {
                      return "mínút" + (1 === t ? "a" : "ur")
                  },
                  s: function(t) {
                      return "sekúnd" + (1 === t ? "a" : "ur")
                  },
                  ms: function(t) {
                      return "millisekúnd" + (1 === t ? "a" : "ur")
                  },
                  decimal: "."
              },
              it: {
                  y: function(t) {
                      return "ann" + (1 === t ? "o" : "i")
                  },
                  mo: function(t) {
                      return "mes" + (1 === t ? "e" : "i")
                  },
                  w: function(t) {
                      return "settiman" + (1 === t ? "a" : "e")
                  },
                  d: function(t) {
                      return "giorn" + (1 === t ? "o" : "i")
                  },
                  h: function(t) {
                      return "or" + (1 === t ? "a" : "e")
                  },
                  m: function(t) {
                      return "minut" + (1 === t ? "o" : "i")
                  },
                  s: function(t) {
                      return "second" + (1 === t ? "o" : "i")
                  },
                  ms: function(t) {
                      return "millisecond" + (1 === t ? "o" : "i")
                  },
                  decimal: ","
              },
              ja: {
                  y: function() {
                      return "年"
                  },
                  mo: function() {
                      return "月"
                  },
                  w: function() {
                      return "週"
                  },
                  d: function() {
                      return "日"
                  },
                  h: function() {
                      return "時間"
                  },
                  m: function() {
                      return "分"
                  },
                  s: function() {
                      return "秒"
                  },
                  ms: function() {
                      return "ミリ秒"
                  },
                  decimal: "."
              },
              ko: {
                  y: function() {
                      return "년"
                  },
                  mo: function() {
                      return "개월"
                  },
                  w: function() {
                      return "주일"
                  },
                  d: function() {
                      return "일"
                  },
                  h: function() {
                      return "시간"
                  },
                  m: function() {
                      return "분"
                  },
                  s: function() {
                      return "초"
                  },
                  ms: function() {
                      return "밀리 초"
                  },
                  decimal: "."
              },
              lo: {
                  y: function() {
                      return "ປີ"
                  },
                  mo: function() {
                      return "ເດືອນ"
                  },
                  w: function() {
                      return "ອາທິດ"
                  },
                  d: function() {
                      return "ມື້"
                  },
                  h: function() {
                      return "ຊົ່ວໂມງ"
                  },
                  m: function() {
                      return "ນາທີ"
                  },
                  s: function() {
                      return "ວິນາທີ"
                  },
                  ms: function() {
                      return "ມິນລິວິນາທີ"
                  },
                  decimal: ","
              },
              lt: {
                  y: function(t) {
                      return t % 10 == 0 || t % 100 >= 10 && t % 100 <= 20 ? "metų" : "metai"
                  },
                  mo: function(e) {
                      return ["mėnuo", "mėnesiai", "mėnesių"][t.getLithuanianForm(e)]
                  },
                  w: function(e) {
                      return ["savaitė", "savaitės", "savaičių"][t.getLithuanianForm(e)]
                  },
                  d: function(e) {
                      return ["diena", "dienos", "dienų"][t.getLithuanianForm(e)]
                  },
                  h: function(e) {
                      return ["valanda", "valandos", "valandų"][t.getLithuanianForm(e)]
                  },
                  m: function(e) {
                      return ["minutė", "minutės", "minučių"][t.getLithuanianForm(e)]
                  },
                  s: function(e) {
                      return ["sekundė", "sekundės", "sekundžių"][t.getLithuanianForm(e)]
                  },
                  ms: function(e) {
                      return ["milisekundė", "milisekundės", "milisekundžių"][t.getLithuanianForm(e)]
                  },
                  decimal: ","
              },
              lv: {
                  y: function(e) {
                      return ["gads", "gadi"][t.getLatvianForm(e)]
                  },
                  mo: function(e) {
                      return ["mēnesis", "mēneši"][t.getLatvianForm(e)]
                  },
                  w: function(e) {
                      return ["nedēļa", "nedēļas"][t.getLatvianForm(e)]
                  },
                  d: function(e) {
                      return ["diena", "dienas"][t.getLatvianForm(e)]
                  },
                  h: function(e) {
                      return ["stunda", "stundas"][t.getLatvianForm(e)]
                  },
                  m: function(e) {
                      return ["minūte", "minūtes"][t.getLatvianForm(e)]
                  },
                  s: function(e) {
                      return ["sekunde", "sekundes"][t.getLatvianForm(e)]
                  },
                  ms: function(e) {
                      return ["milisekunde", "milisekundes"][t.getLatvianForm(e)]
                  },
                  decimal: ","
              },
              ms: {
                  y: function() {
                      return "tahun"
                  },
                  mo: function() {
                      return "bulan"
                  },
                  w: function() {
                      return "minggu"
                  },
                  d: function() {
                      return "hari"
                  },
                  h: function() {
                      return "jam"
                  },
                  m: function() {
                      return "minit"
                  },
                  s: function() {
                      return "saat"
                  },
                  ms: function() {
                      return "milisaat"
                  },
                  decimal: "."
              },
              nl: {
                  y: function() {
                      return "jaar"
                  },
                  mo: function(t) {
                      return 1 === t ? "maand" : "maanden"
                  },
                  w: function(t) {
                      return 1 === t ? "week" : "weken"
                  },
                  d: function(t) {
                      return 1 === t ? "dag" : "dagen"
                  },
                  h: function() {
                      return "uur"
                  },
                  m: function(t) {
                      return 1 === t ? "minuut" : "minuten"
                  },
                  s: function(t) {
                      return 1 === t ? "seconde" : "seconden"
                  },
                  ms: function(t) {
                      return 1 === t ? "milliseconde" : "milliseconden"
                  },
                  decimal: ","
              },
              no: {
                  y: function() {
                      return "år"
                  },
                  mo: function(t) {
                      return "måned" + (1 === t ? "" : "er")
                  },
                  w: function(t) {
                      return "uke" + (1 === t ? "" : "r")
                  },
                  d: function(t) {
                      return "dag" + (1 === t ? "" : "er")
                  },
                  h: function(t) {
                      return "time" + (1 === t ? "" : "r")
                  },
                  m: function(t) {
                      return "minutt" + (1 === t ? "" : "er")
                  },
                  s: function(t) {
                      return "sekund" + (1 === t ? "" : "er")
                  },
                  ms: function(t) {
                      return "millisekund" + (1 === t ? "" : "er")
                  },
                  decimal: ","
              },
              pl: {
                  y: function(e) {
                      return ["rok", "roku", "lata", "lat"][t.getPolishForm(e)]
                  },
                  mo: function(e) {
                      return ["miesiąc", "miesiąca", "miesiące", "miesięcy"][t.getPolishForm(e)]
                  },
                  w: function(e) {
                      return ["tydzień", "tygodnia", "tygodnie", "tygodni"][t.getPolishForm(e)]
                  },
                  d: function(e) {
                      return ["dzień", "dnia", "dni", "dni"][t.getPolishForm(e)]
                  },
                  h: function(e) {
                      return ["godzina", "godziny", "godziny", "godzin"][t.getPolishForm(e)]
                  },
                  m: function(e) {
                      return ["minuta", "minuty", "minuty", "minut"][t.getPolishForm(e)]
                  },
                  s: function(e) {
                      return ["sekunda", "sekundy", "sekundy", "sekund"][t.getPolishForm(e)]
                  },
                  ms: function(e) {
                      return ["milisekunda", "milisekundy", "milisekundy", "milisekund"][t.getPolishForm(e)]
                  },
                  decimal: ","
              },
              pt: {
                  y: function(t) {
                      return "ano" + (1 === t ? "" : "s")
                  },
                  mo: function(t) {
                      return 1 === t ? "mês" : "meses"
                  },
                  w: function(t) {
                      return "semana" + (1 === t ? "" : "s")
                  },
                  d: function(t) {
                      return "dia" + (1 === t ? "" : "s")
                  },
                  h: function(t) {
                      return "hora" + (1 === t ? "" : "s")
                  },
                  m: function(t) {
                      return "minuto" + (1 === t ? "" : "s")
                  },
                  s: function(t) {
                      return "segundo" + (1 === t ? "" : "s")
                  },
                  ms: function(t) {
                      return "milissegundo" + (1 === t ? "" : "s")
                  },
                  decimal: ","
              },
              ro: {
                  y: function(t) {
                      return 1 === t ? "an" : "ani"
                  },
                  mo: function(t) {
                      return 1 === t ? "lună" : "luni"
                  },
                  w: function(t) {
                      return 1 === t ? "săptămână" : "săptămâni"
                  },
                  d: function(t) {
                      return 1 === t ? "zi" : "zile"
                  },
                  h: function(t) {
                      return 1 === t ? "oră" : "ore"
                  },
                  m: function(t) {
                      return 1 === t ? "minut" : "minute"
                  },
                  s: function(t) {
                      return 1 === t ? "secundă" : "secunde"
                  },
                  ms: function(t) {
                      return 1 === t ? "milisecundă" : "milisecunde"
                  },
                  decimal: ","
              },
              ru: {
                  y: function(e) {
                      return ["лет", "год", "года"][t.getSlavicForm(e)]
                  },
                  mo: function(e) {
                      return ["месяцев", "месяц", "месяца"][t.getSlavicForm(e)]
                  },
                  w: function(e) {
                      return ["недель", "неделя", "недели"][t.getSlavicForm(e)]
                  },
                  d: function(e) {
                      return ["дней", "день", "дня"][t.getSlavicForm(e)]
                  },
                  h: function(e) {
                      return ["часов", "час", "часа"][t.getSlavicForm(e)]
                  },
                  m: function(e) {
                      return ["минут", "минута", "минуты"][t.getSlavicForm(e)]
                  },
                  s: function(e) {
                      return ["секунд", "секунда", "секунды"][t.getSlavicForm(e)]
                  },
                  ms: function(e) {
                      return ["миллисекунд", "миллисекунда", "миллисекунды"][t.getSlavicForm(e)]
                  },
                  decimal: ","
              },
              uk: {
                  y: function(e) {
                      return ["років", "рік", "роки"][t.getSlavicForm(e)]
                  },
                  mo: function(e) {
                      return ["місяців", "місяць", "місяці"][t.getSlavicForm(e)]
                  },
                  w: function(e) {
                      return ["тижнів", "тиждень", "тижні"][t.getSlavicForm(e)]
                  },
                  d: function(e) {
                      return ["днів", "день", "дні"][t.getSlavicForm(e)]
                  },
                  h: function(e) {
                      return ["годин", "година", "години"][t.getSlavicForm(e)]
                  },
                  m: function(e) {
                      return ["хвилин", "хвилина", "хвилини"][t.getSlavicForm(e)]
                  },
                  s: function(e) {
                      return ["секунд", "секунда", "секунди"][t.getSlavicForm(e)]
                  },
                  ms: function(e) {
                      return ["мілісекунд", "мілісекунда", "мілісекунди"][t.getSlavicForm(e)]
                  },
                  decimal: ","
              },
              ur: {
                  y: function() {
                      return "سال"
                  },
                  mo: function(t) {
                      return 1 === t ? "مہینہ" : "مہینے"
                  },
                  w: function(t) {
                      return 1 === t ? "ہفتہ" : "ہفتے"
                  },
                  d: function() {
                      return "دن"
                  },
                  h: function(t) {
                      return 1 === t ? "گھنٹہ" : "گھنٹے"
                  },
                  m: function() {
                      return "منٹ"
                  },
                  s: function() {
                      return "سیکنڈ"
                  },
                  ms: function() {
                      return "ملی سیکنڈ"
                  },
                  decimal: "."
              },
              sk: {
                  y: function(e) {
                      return ["rok", "roky", "roky", "rokov"][t.getCzechOrSlovakForm(e)]
                  },
                  mo: function(e) {
                      return ["mesiac", "mesiace", "mesiace", "mesiacov"][t.getCzechOrSlovakForm(e)]
                  },
                  w: function(e) {
                      return ["týždeň", "týždne", "týždne", "týždňov"][t.getCzechOrSlovakForm(e)]
                  },
                  d: function(e) {
                      return ["deň", "dni", "dni", "dní"][t.getCzechOrSlovakForm(e)]
                  },
                  h: function(e) {
                      return ["hodina", "hodiny", "hodiny", "hodín"][t.getCzechOrSlovakForm(e)]
                  },
                  m: function(e) {
                      return ["minúta", "minúty", "minúty", "minút"][t.getCzechOrSlovakForm(e)]
                  },
                  s: function(e) {
                      return ["sekunda", "sekundy", "sekundy", "sekúnd"][t.getCzechOrSlovakForm(e)]
                  },
                  ms: function(e) {
                      return ["milisekunda", "milisekundy", "milisekundy", "milisekúnd"][t.getCzechOrSlovakForm(e)]
                  },
                  decimal: ","
              },
              sv: {
                  y: function() {
                      return "år"
                  },
                  mo: function(t) {
                      return "månad" + (1 === t ? "" : "er")
                  },
                  w: function(t) {
                      return "veck" + (1 === t ? "a" : "or")
                  },
                  d: function(t) {
                      return "dag" + (1 === t ? "" : "ar")
                  },
                  h: function(t) {
                      return "timm" + (1 === t ? "e" : "ar")
                  },
                  m: function(t) {
                      return "minut" + (1 === t ? "" : "er")
                  },
                  s: function(t) {
                      return "sekund" + (1 === t ? "" : "er")
                  },
                  ms: function(t) {
                      return "millisekund" + (1 === t ? "" : "er")
                  },
                  decimal: ","
              },
              tr: {
                  y: function() {
                      return "yıl"
                  },
                  mo: function() {
                      return "ay"
                  },
                  w: function() {
                      return "hafta"
                  },
                  d: function() {
                      return "gün"
                  },
                  h: function() {
                      return "saat"
                  },
                  m: function() {
                      return "dakika"
                  },
                  s: function() {
                      return "saniye"
                  },
                  ms: function() {
                      return "milisaniye"
                  },
                  decimal: ","
              },
              th: {
                  y: function() {
                      return "ปี"
                  },
                  mo: function() {
                      return "เดือน"
                  },
                  w: function() {
                      return "อาทิตย์"
                  },
                  d: function() {
                      return "วัน"
                  },
                  h: function() {
                      return "ชั่วโมง"
                  },
                  m: function() {
                      return "นาที"
                  },
                  s: function() {
                      return "วินาที"
                  },
                  ms: function() {
                      return "มิลลิวินาที"
                  },
                  decimal: "."
              },
              vi: {
                  y: function() {
                      return "năm"
                  },
                  mo: function() {
                      return "tháng"
                  },
                  w: function() {
                      return "tuần"
                  },
                  d: function() {
                      return "ngày"
                  },
                  h: function() {
                      return "giờ"
                  },
                  m: function() {
                      return "phút"
                  },
                  s: function() {
                      return "giây"
                  },
                  ms: function() {
                      return "mili giây"
                  },
                  decimal: ","
              },
              zh_CN: {
                  y: function() {
                      return "年"
                  },
                  mo: function() {
                      return "个月"
                  },
                  w: function() {
                      return "周"
                  },
                  d: function() {
                      return "天"
                  },
                  h: function() {
                      return "小时"
                  },
                  m: function() {
                      return "分钟"
                  },
                  s: function() {
                      return "秒"
                  },
                  ms: function() {
                      return "毫秒"
                  },
                  decimal: "."
              },
              zh_TW: {
                  y: function() {
                      return "年"
                  },
                  mo: function() {
                      return "個月"
                  },
                  w: function() {
                      return "周"
                  },
                  d: function() {
                      return "天"
                  },
                  h: function() {
                      return "小時"
                  },
                  m: function() {
                      return "分鐘"
                  },
                  s: function() {
                      return "秒"
                  },
                  ms: function() {
                      return "毫秒"
                  },
                  decimal: "."
              }
          }
      }
      return t.prototype.addLanguage = function(t, e) {
          this.languages[t] = e
      }, t.prototype.getCzechForm = function(t) {
          return 1 === t ? 0 : Math.floor(t) !== t ? 1 : t % 10 >= 2 && t % 10 <= 4 && t % 100 < 10 ? 2 : 3
      }, t.prototype.getPolishForm = function(t) {
          return 1 === t ? 0 : Math.floor(t) !== t ? 1 : t % 10 >= 2 && t % 10 <= 4 && !(t % 100 > 10 && t % 100 < 20) ? 2 : 3
      }, t.prototype.getSlavicForm = function(t) {
          return Math.floor(t) !== t ? 2 : t >= 5 && t <= 20 || t % 10 >= 5 && t % 10 <= 9 || t % 10 == 0 ? 0 : t % 10 == 1 ? 1 : t > 1 ? 2 : 0
      }, t.prototype.getLithuanianForm = function(t) {
          return 1 === t || t % 10 == 1 && t % 100 > 20 ? 0 : Math.floor(t) !== t || t % 10 >= 2 && t % 100 > 20 || t % 10 >= 2 && t % 100 < 10 ? 1 : 2
      }, t.prototype.getArabicForm = function(t) {
          return t <= 2 ? 0 : t > 2 && t < 11 ? 1 : 0
      }, t.prototype.getCzechOrSlovakForm = function(t) {
          return 1 === t ? 0 : Math.floor(t) !== t ? 1 : t % 10 >= 2 && t % 10 <= 4 && t % 100 < 10 ? 2 : 3
      }, t.prototype.getLatvianForm = function(t) {
          return 1 === t || t % 10 == 1 && t % 100 != 11 ? 0 : 1
      }, t
  }(),
  ie = function() {
      function t(t) {
          this.languageUtil = t, this.defaultOptions = {
              language: "en",
              delimiter: ", ",
              spacer: " ",
              conjunction: "",
              serialComma: !0,
              units: ["y", "mo", "w", "d", "h", "m", "s"],
              languages: {},
              largest: 10,
              decimal: ".",
              round: !1,
              unitMeasures: {
                  y: 315576e5,
                  mo: 26298e5,
                  w: 6048e5,
                  d: 864e5,
                  h: 36e5,
                  m: 6e4,
                  s: 1e3,
                  ms: 1
              }
          }, this.options = void 0, this.options = this.defaultOptions
      }
      return t.prototype.humanize = function(t, e) {
          var n = void 0 !== e ? this.extend(this.options, e) : this.defaultOptions;
          return this.doHumanization(t, n)
      }, t.prototype.setOptions = function(t) {
          this.options = void 0 !== t ? this.extend(this.defaultOptions, t) : this.defaultOptions
      }, t.prototype.getSupportedLanguages = function() {
          var t = [];
          for (var e in this.languageUtil.languages) this.languageUtil.languages.hasOwnProperty(e) && t.push(e);
          return t
      }, t.prototype.addLanguage = function(t, e) {
          this.languageUtil.addLanguage(t, e)
      }, t.prototype.doHumanization = function(t, e) {
          var n, i, r;
          t = Math.abs(t);
          var o = e.languages[e.language] || this.languageUtil.languages[e.language];
          if (!o) throw new Error("No language " + o + ".");
          var s, a, u, c = [];
          for (n = 0, i = e.units.length; n < i; n++) s = e.units[n], a = e.unitMeasures[s], u = n + 1 === i ? t / a : Math.floor(t / a), c.push({
              unitCount: u,
              unitName: s
          }), t -= u * a;
          var l = 0;
          for (n = 0; n < c.length; n++)
              if (c[n].unitCount) {
                  l = n;
                  break
              }
          if (e.round) {
              var d = void 0,
                  h = void 0;
              for (n = c.length - 1; n >= 0 && ((r = c[n]).unitCount = Math.round(r.unitCount), 0 !== n); n--) h = c[n - 1], d = e.unitMeasures[h.unitName] / e.unitMeasures[r.unitName], (r.unitCount % d == 0 || e.largest && e.largest - 1 < n - l) && (h.unitCount += r.unitCount / d, r.unitCount = 0)
          }
          var m = [];
          for (n = 0, c.length; n < i && ((r = c[n]).unitCount && m.push(this.render(r.unitCount, r.unitName, o, e)), m.length !== e.largest); n++);
          return m.length ? e.conjunction && 1 !== m.length ? 2 === m.length ? m.join(e.conjunction) : m.length > 2 ? m.slice(0, -1).join(e.delimiter) + (e.serialComma ? "," : "") + e.conjunction + m.slice(-1) : void 0 : m.join(e.delimiter) : this.render(0, e.units[e.units.length - 1], o, e)
      }, t.prototype.render = function(t, e, n, i) {
          var r;
          r = void 0 === i.decimal ? n.decimal : i.decimal;
          var o = t.toString().replace(".", r.toString()),
              s = n[e](t);
          return o + i.spacer + s
      }, t.prototype.extend = function(t, e) {
          for (var n in e) t.hasOwnProperty(n) && (t[n] = e[n]);
          return t
      }, t
  }(),
  re = {
      version: "Version",
      invalid_configuration: "Invalid configuration",
      show_warning: "Show Warning"
  },
  oe = {
      common: re
  },
  se = {
      version: "Version",
      invalid_configuration: "Configuration invalide",
      show_warning: "Afficher les warning"
  },
  ae = {
      common: se
  },
  ue = {
      version: "Versjon",
      invalid_configuration: "Ikke gyldig konfiguration",
      show_warning: "Vis advarsel"
  },
  ce = {
      common: ue
  };
const le = {
  en: Object.freeze({
      __proto__: null,
      common: re,
      default: oe
  }),
  fr: Object.freeze({
      __proto__: null,
      common: se,
      default: ae
  }),
  nb: Object.freeze({
      __proto__: null,
      common: ue,
      default: ce
  })
};
const de = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.maxTouchPoints > 0;
class he extends HTMLElement {
  constructor() {
      super(), this.holdTime = 500, this.held = !1, this.ripple = document.createElement("mwc-ripple")
  }
  connectedCallback() {
      Object.assign(this.style, {
          position: "absolute",
          width: de ? "100px" : "50px",
          height: de ? "100px" : "50px",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: "999"
      }), this.appendChild(this.ripple), this.ripple.primary = !0, ["touchcancel", "mouseout", "mouseup", "touchmove", "mousewheel", "wheel", "scroll"].forEach(t => {
          document.addEventListener(t, () => {
              clearTimeout(this.timer), this.stopAnimation(), this.timer = void 0
          }, {
              passive: !0
          })
      })
  }
  bind(t, e) {
      if (t.actionHandler) return;
      t.actionHandler = !0, t.addEventListener("contextmenu", t => {
          const e = t || window.event;
          return e.preventDefault && e.preventDefault(), e.stopPropagation && e.stopPropagation(), e.cancelBubble = !0, e.returnValue = !1, !1
      });
      const n = t => {
              let e, n;
              this.held = !1, t.touches ? (e = t.touches[0].pageX, n = t.touches[0].pageY) : (e = t.pageX, n = t.pageY), this.timer = window.setTimeout(() => {
                  this.startAnimation(e, n), this.held = !0
              }, this.holdTime)
          },
          i = n => {
              n.preventDefault(), ["touchend", "touchcancel"].includes(n.type) && void 0 === this.timer || (clearTimeout(this.timer), this.stopAnimation(), this.timer = void 0, this.held ? It(t, "action", {
                  action: "hold"
              }) : e.hasDoubleClick ? "click" === n.type && n.detail < 2 || !this.dblClickTimeout ? this.dblClickTimeout = window.setTimeout(() => {
                  this.dblClickTimeout = void 0, It(t, "action", {
                      action: "tap"
                  })
              }, 250) : (clearTimeout(this.dblClickTimeout), this.dblClickTimeout = void 0, It(t, "action", {
                  action: "double_tap"
              })) : It(t, "action", {
                  action: "tap"
              }))
          };
      t.addEventListener("touchstart", n, {
          passive: !0
      }), t.addEventListener("touchend", i), t.addEventListener("touchcancel", i), t.addEventListener("mousedown", n, {
          passive: !0
      }), t.addEventListener("click", i), t.addEventListener("keyup", t => {
          13 === t.keyCode && i(t)
      })
  }
  startAnimation(t, e) {
      Object.assign(this.style, {
          left: t + "px",
          top: e + "px",
          display: null
      }), this.ripple.disabled = !1, this.ripple.active = !0, this.ripple.unbounded = !0
  }
  stopAnimation() {
      this.ripple.active = !1, this.ripple.disabled = !0, this.style.display = "none"
  }
}
customElements.define("action-handler-logbook-card", he);
const me = (t, e) => {
      const n = (() => {
          const t = document.body;
          if (t.querySelector("action-handler-logbook-card")) return t.querySelector("action-handler-logbook-card");
          const e = document.createElement("action-handler-logbook-card");
          return t.appendChild(e), e
      })();
      n && n.bind(t, e)
  },
  fe = ct(class extends lt {
      update(t, [e]) {
          return me(t.element, e), P
      }
      render(t) {}
  });

function ge(t) {
  return t.replace(/\\/g, "\\\\").replace(/\u0008/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/'/g, "\\'").replace(/"/g, '\\"')
}

function ve(t) {
  return new RegExp("^" + t.split(/\*+/).map(t => function(t) {
      return t.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
  }(t)).join(".*") + "$")
}
console.info("%c LOGBOOK-CARD %c 1.9.3 ", "color: orange; font-weight: bold; background: black", "color: darkblue; font-weight: bold; background: white"), window.customCards = window.customCards || [], window.customCards.push({
  type: "logbook-card",
  name: "Logbook Card",
  preview: !0,
  description: "A custom card to display entity history"
});
let pe = class extends et {
  constructor() {
      super(...arguments), this.MAX_UPDATE_DURATION = 5e3, this.hiddenStateRegexp = new Array
  }
  static async getConfigElement() {
      return document.createElement("logbook-card-editor")
  }
  static getStubConfig(t, e) {
      return {
          entity: e[0]
      }
  }
  setConfig(t) {
      var e, n, i, r;
      if (!t) throw new Error(function(t, e = "", n = "") {
          const i = t.split(".")[0],
              r = t.split(".")[1],
              o = (localStorage.getItem("selectedLanguage") || "en").replace(/['"]+/g, "").replace("-", "_");
          let s;
          try {
              s = le[o][i][r]
          } catch (t) {
              s = le.en[i][r]
          }
          return void 0 === s && (s = le.en[i][r]), "" !== e && "" !== n && (s = s.replace(e, n)), s
      }("common.invalid_configuration"));
      if (!t.entity) throw new Error("Please define an entity.");
      if (void 0 !== t.max_items && !Number.isInteger(t.max_items)) throw new Error("max_items must be an Integer.");
      if (t.hidden_state && !Array.isArray(t.hidden_state)) throw new Error("hidden_state must be an array");
      if (t.state_map && !Array.isArray(t.state_map)) throw new Error("state_map must be an array");
      if (t.attributes && !Array.isArray(t.attributes)) throw new Error("attributes must be an array");
      if (t.desc && "boolean" != typeof t.desc) throw new Error("desc must be a boolean");
      if (t.collapse && !Number.isInteger(t.collapse)) throw new Error("collapse must be a number");
      if (t.collapse && t.max_items && t.max_items > 0 && t.collapse > t.max_items) throw new Error("collapse must be lower than max-items");
      if ((null === (e = t.duration) || void 0 === e ? void 0 : e.units) && !Array.isArray(t.duration.units)) throw new Error("duration.units must be an array");
      if ((null === (n = t.duration) || void 0 === n ? void 0 : n.largest) && !Number.isInteger(t.duration.largest) && "full" !== t.duration.largest) throw new Error("duration.largest should be a number or `full`");
      this.config = Object.assign(Object.assign({
          history: 5,
          hidden_state: [],
          desc: !0,
          max_items: -1,
          no_event: "No event on the period",
          attributes: [],
          scroll: !0
      }, t), {
          state_map: null !== (r = null === (i = t.state_map) || void 0 === i ? void 0 : i.map(t => {
              var e;
              return Object.assign(Object.assign({}, t), {
                  regexp: ve(null !== (e = t.value) && void 0 !== e ? e : "")
              })
          })) && void 0 !== r ? r : [],
          show: Object.assign(Object.assign({}, Kt), t.show),
          duration: Object.assign(Object.assign({}, Gt), t.duration),
          duration_labels: Object.assign({}, t.duration_labels),
          separator_style: Object.assign(Object.assign({}, Qt), t.separator_style)
      }), this.config.hidden_state && (this.hiddenStateRegexp = this.config.hidden_state.map(t => ve(t)))
  }
  mapState(t) {
      var e, n;
      const i = null === (n = null === (e = this.config) || void 0 === e ? void 0 : e.state_map) || void 0 === n ? void 0 : n.find(e => {
          var n;
          return null === (n = e.regexp) || void 0 === n ? void 0 : n.test(t.state)
      });
      return void 0 !== i && i.label ? i.label : this.hass ? Ut(this.hass.localize, t, this.hass.locale) : t.state
  }
  mapIcon(t) {
      var e, n;
      const i = null === (n = null === (e = this.config) || void 0 === e ? void 0 : e.state_map) || void 0 === n ? void 0 : n.find(e => {
          var n;
          return null === (n = e.regexp) || void 0 === n ? void 0 : n.test(ge(t.state))
      });
      if (console.log(i, null == i ? void 0 : i.icon, null == i ? void 0 : i.icon_color), void 0 === i || void 0 === i.icon && void 0 === i.icon_color) return null;
      return {
          icon: void 0 !== i && i.icon ? i.icon : function(t) {
              if (!t) return "hass:bookmark";
              if (t.attributes.icon) return t.attributes.icon;
              var e = Pt(t.entity_id);
              return e in Xt ? Xt[e](t) : Vt(e, t.state)
          }(t),
          color: (null == i ? void 0 : i.icon_color) || null
      }
  }
  squashSameState(t, e) {
      const n = t[t.length - 1];
      return !n || n.state !== e.state && "unknown" !== e.state ? t.push(e) : (n.end = e.end, n.duration += e.duration), t
  }
  extractAttributes(t) {
      var e, n;
      return null == (null === (e = this.config) || void 0 === e ? void 0 : e.attributes) ? [] : null === (n = this.config) || void 0 === n ? void 0 : n.attributes.reduce((e, n) => {
          if (t.attributes[n.value]) {
              const i = t.attributes[n.value];
              if ("object" != typeof i || Array.isArray(i)) Array.isArray(i) ? e.push({
                  name: n.label ? n.label : n.value,
                  value: this.formatAttributeValue(i.join(","), void 0)
              }) : e.push({
                  name: n.label ? n.label : n.value,
                  value: this.formatAttributeValue(i, n.type)
              });
              else {
                  Object.keys(i).forEach(t => {
                      e.push({
                          name: t,
                          value: this.formatAttributeValue(i[t], void 0)
                      })
                  })
              }
          }
          return e
      }, [])
  }
  getDuration(t) {
      var e, n, i, r, o, s, a, u, c, l, d, h, m;
      if (!t) return "";
      const f = new ie(new ne);
      let g = f.getSupportedLanguages().includes(null !== (n = null === (e = this.hass) || void 0 === e ? void 0 : e.language) && void 0 !== n ? n : "en") ? null === (i = this.hass) || void 0 === i ? void 0 : i.language : "en";
      (null === (o = null === (r = this.config) || void 0 === r ? void 0 : r.duration) || void 0 === o ? void 0 : o.labels) && (f.addLanguage("custom", {
          y: () => "y",
          mo: () => {
              var t, e, n, i;
              return null !== (i = null === (n = null === (e = null === (t = this.config) || void 0 === t ? void 0 : t.duration) || void 0 === e ? void 0 : e.labels) || void 0 === n ? void 0 : n.month) && void 0 !== i ? i : "mo"
          },
          w: () => {
              var t, e, n, i;
              return null !== (i = null === (n = null === (e = null === (t = this.config) || void 0 === t ? void 0 : t.duration) || void 0 === e ? void 0 : e.labels) || void 0 === n ? void 0 : n.week) && void 0 !== i ? i : "w"
          },
          d: () => {
              var t, e, n, i;
              return null !== (i = null === (n = null === (e = null === (t = this.config) || void 0 === t ? void 0 : t.duration) || void 0 === e ? void 0 : e.labels) || void 0 === n ? void 0 : n.day) && void 0 !== i ? i : "d"
          },
          h: () => {
              var t, e, n, i;
              return null !== (i = null === (n = null === (e = null === (t = this.config) || void 0 === t ? void 0 : t.duration) || void 0 === e ? void 0 : e.labels) || void 0 === n ? void 0 : n.hour) && void 0 !== i ? i : "h"
          },
          m: () => {
              var t, e, n, i;
              return null !== (i = null === (n = null === (e = null === (t = this.config) || void 0 === t ? void 0 : t.duration) || void 0 === e ? void 0 : e.labels) || void 0 === n ? void 0 : n.minute) && void 0 !== i ? i : "m"
          },
          s: () => {
              var t, e, n, i;
              return null !== (i = null === (n = null === (e = null === (t = this.config) || void 0 === t ? void 0 : t.duration) || void 0 === e ? void 0 : e.labels) || void 0 === n ? void 0 : n.second) && void 0 !== i ? i : "s"
          },
          ms: () => "ms",
          decimal: ""
      }), g = "custom");
      const v = {
          language: g,
          units: null === (a = null === (s = this.config) || void 0 === s ? void 0 : s.duration) || void 0 === a ? void 0 : a.units,
          round: !0
      };
      return "full" !== (null === (c = null === (u = this.config) || void 0 === u ? void 0 : u.duration) || void 0 === c ? void 0 : c.largest) && (v.largest = null === (d = null === (l = this.config) || void 0 === l ? void 0 : l.duration) || void 0 === d ? void 0 : d.largest), void 0 !== (null === (m = null === (h = this.config) || void 0 === h ? void 0 : h.duration) || void 0 === m ? void 0 : m.delimiter) && (v.delimiter = this.config.duration.delimiter), f.humanize(t, v)
  }
  formatAttributeValue(t, e) {
      return "date" === e ? this._displayDate(new Date(t)) : t
  }
  _displayDate(t) {
      var e, n, i;
      return (null === (e = this.config) || void 0 === e ? void 0 : e.date_format) ? Dt(t, null !== (i = null === (n = this.config) || void 0 === n ? void 0 : n.date_format) && void 0 !== i ? i : void 0) : jt(t, this.hass.locale)
  }
  updateHistory() {
      var t, e, n;
      const i = this.hass;
      if (i && this.config && this.config.entity) {
          const r = this.config.entity in i.states ? i.states[this.config.entity] : null;
          if (r) {
              this.config.title = null !== (e = null === (t = this.config) || void 0 === t ? void 0 : t.title) && void 0 !== e ? e : r.attributes.friendly_name + " History";
              const o = "history/period/" + new Date((new Date).setDate((new Date).getDate() - (null !== (n = this.config.history) && void 0 !== n ? n : 5))).toISOString() + "?filter_entity_id=" + this.config.entity + "&end_time=" + (new Date).toISOString();
              let s = [];
              i.callApi("GET", o).then(t => {
                  var e, n;
                  s = (t[0] || []).map(t => ({
                      stateObj: t,
                      state: t.state,
                      label: this.mapState(t),
                      start: new Date(t.last_changed),
                      attributes: this.extractAttributes(t),
                      icon: this.mapIcon(t)
                  })).map((t, e, n) => e < n.length - 1 ? Object.assign(Object.assign({}, t), {
                      end: n[e + 1].start
                  }) : Object.assign(Object.assign({}, t), {
                      end: new Date
                  })).map(t => Object.assign(Object.assign({}, t), {
                      duration: t.end - t.start
                  })).reduce(this.squashSameState, []).filter(t => !this.hiddenStateRegexp.some(e => e.test(ge(t.state)))).map(t => Object.assign(Object.assign({}, t), {
                      duration: this.getDuration(t.duration)
                  })), s && (null === (e = this.config) || void 0 === e ? void 0 : e.desc) && (s = s.reverse()), s && this.config && this.config.max_items && this.config.max_items > 0 && (s = s.splice(0, null === (n = this.config) || void 0 === n ? void 0 : n.max_items)), this.history = s
              })
          }
          this.lastHistoryChanged = new Date
      }
  }
  shouldUpdate(t) {
      return !!t.has("history") || (t.delete("history"), (!this.lastHistoryChanged || function(t, e, n) {
          if (e.has("config") || n) return !0;
          if (t.config.entity) {
              var i = e.get("hass");
              return !i || i.states[t.config.entity] !== t.hass.states[t.config.entity]
          }
          return !1
      }(this, t, !1) || (new Date).getTime() - this.lastHistoryChanged.getTime() > this.MAX_UPDATE_DURATION) && this.updateHistory(), !1)
  }
  _handleAction(t) {
      this.hass && this.config && t.detail.action && function(t, e, n, i) {
          var r;
          "double_tap" === i && n.double_tap_action ? r = n.double_tap_action : "hold" === i && n.hold_action ? r = n.hold_action : "tap" === i && n.tap_action && (r = n.tap_action), Wt(t, e, n, r)
      }(this, this.hass, this.config, t.detail.action)
  }
  render() {
      if (!this.config || !this.hass) return N ``;
      const t = this.config.scroll ? "card-content-scroll" : "";
      return N `
    <ha-card tabindex="0">
      <h1
        aria-label=${""+this.config.title}
        class="card-header"
        @action=${this._handleAction}
        .actionHandler=${fe({hasHold:Zt(this.config.hold_action),hasDoubleClick:Zt(this.config.double_tap_action)})}
      >
        ${this.config.title}
      </h1>
      <div class="card-content ${t} grid" style="[[contentStyle]]">
        ${this.renderHistory(this.history,this.config)}
      </div>
    </ha-card>
  `
  }
  renderHistory(t, e) {
      if (!t || 0 === (null == t ? void 0 : t.length)) return N `
      <p>
        ${e.no_event}
      </p>
    `;
      if (e.collapse && t.length > e.collapse) {
          const n = "expander" + Math.random().toString(10).substring(2);
          return N `
      ${this.renderHistoryItems(t.slice(0,e.collapse))}
      <input type="checkbox" class="expand" id="${n}" />
      <label for="${n}"><div>&lsaquo;</div></label>
      <div>
        ${this.renderHistoryItems(t.slice(e.collapse))}
      </div>
    `
      }
      return this.renderHistoryItems(t)
  }
  renderHistoryItems(t) {
      return N `
    ${null==t?void 0:t.map((t,e,n)=>this.renderHistoryItem(t,e+1===n.length))}
  `
  }
  renderHistoryItem(t, e) {
      var n, i, r, o, s;
      return N `
    <div class="item">
      ${this.renderIcon(t)}
      <div class="item-content">
        ${(null===(i=null===(n=this.config)||void 0===n?void 0:n.show)||void 0===i?void 0:i.state)?N`
              <span class="state">${t.label}</span>
            `:N``}
        ${(null===(o=null===(r=this.config)||void 0===r?void 0:r.show)||void 0===o?void 0:o.duration)?N`
              <span class="duration">${t.duration}</span>
            `:N``}
        ${this.renderHistoryDate(t)}${null===(s=t.attributes)||void 0===s?void 0:s.map(this.renderAttributes)}
      </div>
    </div>
    ${e?"":this.renderSeparator()}
  `
  }
  renderSeparator() {
      var t, e, n, i, r, o, s, a;
      const u = {
          border: "0",
          "border-top": `${null===(e=null===(t=this.config)||void 0===t?void 0:t.separator_style)||void 0===e?void 0:e.width}px ${null===(i=null===(n=this.config)||void 0===n?void 0:n.separator_style)||void 0===i?void 0:i.style} ${null===(o=null===(r=this.config)||void 0===r?void 0:r.separator_style)||void 0===o?void 0:o.color}`
      };
      if (null === (a = null === (s = this.config) || void 0 === s ? void 0 : s.show) || void 0 === a ? void 0 : a.separator) return N `
      <hr style=${dt(u)} aria-hidden="true" />
    `
  }
  renderIcon(t) {
      var e, n;
      if (null === (n = null === (e = this.config) || void 0 === e ? void 0 : e.show) || void 0 === n ? void 0 : n.icon) return null !== t.icon ? N `
        <div class="item-icon">
          <ha-icon .icon=${t.icon.icon} style=${t.icon.color?"color: "+t.icon.color:""}></ha-icon>
        </div>
      ` : N `
      <div class="item-icon">
        <state-badge stateObj=${t.stateObj} stateColor="${!0}"></state-badge>
      </div>
    `
  }
  renderHistoryDate(t) {
      var e, n, i, r, o, s, a, u;
      return (null === (n = null === (e = this.config) || void 0 === e ? void 0 : e.show) || void 0 === n ? void 0 : n.start_date) && (null === (r = null === (i = this.config) || void 0 === i ? void 0 : i.show) || void 0 === r ? void 0 : r.end_date) ? N `
      <div class="date">${this._displayDate(t.start)} - ${this._displayDate(t.end)}</div>
    ` : (null === (s = null === (o = this.config) || void 0 === o ? void 0 : o.show) || void 0 === s ? void 0 : s.end_date) ? N `
      <div class="date">${this._displayDate(t.end)}</div>
    ` : (null === (u = null === (a = this.config) || void 0 === a ? void 0 : a.show) || void 0 === u ? void 0 : u.start_date) ? N `
      <div class="date">${this._displayDate(t.start)}</div>
    ` : N ``
  }
  renderAttributes(t) {
      return N `
    <div class="attribute">
      <div class="key">${t.name}</div>
      <div class="value">${t.value}</div>
    </div>
  `
  }
  static get styles() {
      return s `
    .card-content-scroll {
      max-height: 345px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-gutter: stable;
    }
    .item {
      clear: both;
      padding: 5px 0;
      display: flex;
      line-height: var(--paper-font-body1_-_line-height);
    }
    .item-content {
      flex: 1;
    }
    .item-icon {
      flex: 0 0 40px;
      color: var(--paper-item-icon-color, #44739e);
    }
    state-badge {
      width: 1.5rem;
      line-height: 1.5rem;
    }
    .state {
      white-space: pre-wrap;
    }
    .duration {
      font-size: 0.85rem;
      font-style: italic;
      float: right;
    }
    .date,
    .attribute {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .attribute {
      display: flex;
      justify-content: space-between;
    }
    .expand {
      display: none;
    }
    .expand + label {
      display: block;
      text-align: right;
      cursor: pointer;
    }
    .expand + label > div {
      display: inline-block;
      transform: rotate(-90deg);
      font-size: 26px;
      height: 29px;
      width: 29px;
      text-align: center;
    }
    .expand + label > div,
    .expand + label + div {
      transition: 0.5s ease-in-out;
    }
    .expand:checked + label > div {
      transform: rotate(-90deg) scaleX(-1);
    }
    .expand + label + div {
      display: none;
      overflow: hidden;
    }
    .expand:checked + label + div {
      display: block;
    }
  `
  }
};
t([ot()], pe.prototype, "hass", void 0), t([st()], pe.prototype, "config", void 0), t([ot()], pe.prototype, "history", void 0), pe = t([it("logbook-card")], pe);
export {
  pe as LogbookCard
};