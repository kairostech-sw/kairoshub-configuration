!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = e())
    : "function" == typeof define && define.amd
    ? define(e)
    : ((t =
        "undefined" != typeof globalThis
          ? globalThis
          : t || self).ExpanderCard = e());
})(this, function () {
  "use strict";
  function t() {}
  const e = (t) => t;
  function n(t) {
    return t();
  }
  function o() {
    return Object.create(null);
  }
  function a(t) {
    t.forEach(n);
  }
  function r(t) {
    return "function" == typeof t;
  }
  function i(t, e) {
    return t != t
      ? e == e
      : t !== e || (t && "object" == typeof t) || "function" == typeof t;
  }
  const c = "undefined" != typeof window;
  let l = c ? () => window.performance.now() : () => Date.now(),
    s = c ? (t) => requestAnimationFrame(t) : t;
  const d = new Set();
  function u(t) {
    d.forEach((e) => {
      e.c(t) || (d.delete(e), e.f());
    }),
      0 !== d.size && s(u);
  }
  function h(t) {
    let e;
    return (
      0 === d.size && s(u),
      {
        promise: new Promise((n) => {
          d.add((e = { c: t, f: n }));
        }),
        abort() {
          d.delete(e);
        },
      }
    );
  }
  let f = !1;
  function p(t, e, n, o) {
    for (; t < e; ) {
      const a = t + ((e - t) >> 1);
      n(a) <= o ? (t = a + 1) : (e = a);
    }
    return t;
  }
  function g(t) {
    if (!t) return document;
    const e = t.getRootNode ? t.getRootNode() : t.ownerDocument;
    return e && e.host ? e : t.ownerDocument;
  }
  function m(t) {
    const e = $("style");
    return (
      (function (t, e) {
        (function (t, e) {
          t.appendChild(e);
        })(t.head || t, e),
          e.sheet;
      })(g(t), e),
      e.sheet
    );
  }
  function b(t, e) {
    if (f) {
      for (
        !(function (t) {
          if (t.hydrate_init) return;
          t.hydrate_init = !0;
          let e = t.childNodes;
          if ("HEAD" === t.nodeName) {
            const t = [];
            for (let n = 0; n < e.length; n++) {
              const o = e[n];
              void 0 !== o.claim_order && t.push(o);
            }
            e = t;
          }
          const n = new Int32Array(e.length + 1),
            o = new Int32Array(e.length);
          n[0] = -1;
          let a = 0;
          for (let t = 0; t < e.length; t++) {
            const r = e[t].claim_order,
              i =
                (a > 0 && e[n[a]].claim_order <= r
                  ? a + 1
                  : p(1, a, (t) => e[n[t]].claim_order, r)) - 1;
            o[t] = n[i] + 1;
            const c = i + 1;
            (n[c] = t), (a = Math.max(c, a));
          }
          const r = [],
            i = [];
          let c = e.length - 1;
          for (let t = n[a] + 1; 0 != t; t = o[t - 1]) {
            for (r.push(e[t - 1]); c >= t; c--) i.push(e[c]);
            c--;
          }
          for (; c >= 0; c--) i.push(e[c]);
          r.reverse(), i.sort((t, e) => t.claim_order - e.claim_order);
          for (let e = 0, n = 0; e < i.length; e++) {
            for (; n < r.length && i[e].claim_order >= r[n].claim_order; ) n++;
            const o = n < r.length ? r[n] : null;
            t.insertBefore(i[e], o);
          }
        })(t),
          (void 0 === t.actual_end_child ||
            (null !== t.actual_end_child &&
              t.actual_end_child.parentNode !== t)) &&
            (t.actual_end_child = t.firstChild);
        null !== t.actual_end_child &&
        void 0 === t.actual_end_child.claim_order;

      )
        t.actual_end_child = t.actual_end_child.nextSibling;
      e !== t.actual_end_child
        ? (void 0 === e.claim_order && e.parentNode === t) ||
          t.insertBefore(e, t.actual_end_child)
        : (t.actual_end_child = e.nextSibling);
    } else (e.parentNode === t && null === e.nextSibling) || t.appendChild(e);
  }
  function v(t, e, n) {
    f && !n
      ? b(t, e)
      : (e.parentNode === t && e.nextSibling == n) ||
        t.insertBefore(e, n || null);
  }
  function y(t) {
    t.parentNode && t.parentNode.removeChild(t);
  }
  function $(t) {
    return document.createElement(t);
  }
  function E(t) {
    return document.createTextNode(t);
  }
  function _() {
    return E(" ");
  }
  function w() {
    return E("");
  }
  function x(t, e, n, o) {
    return t.addEventListener(e, n, o), () => t.removeEventListener(e, n, o);
  }
  function C(t, e, n) {
    null == n
      ? t.removeAttribute(e)
      : t.getAttribute(e) !== n && t.setAttribute(e, n);
  }
  function k(t, e, n) {
    e in t ? (t[e] = ("boolean" == typeof t[e] && "" === n) || n) : C(t, e, n);
  }
  function T(t) {
    return Array.from(t.childNodes);
  }
  function A(t, e, n, o, a = !1) {
    !(function (t) {
      void 0 === t.claim_info &&
        (t.claim_info = { last_index: 0, total_claimed: 0 });
    })(t);
    const r = (() => {
      for (let o = t.claim_info.last_index; o < t.length; o++) {
        const r = t[o];
        if (e(r)) {
          const e = n(r);
          return (
            void 0 === e ? t.splice(o, 1) : (t[o] = e),
            a || (t.claim_info.last_index = o),
            r
          );
        }
      }
      for (let o = t.claim_info.last_index - 1; o >= 0; o--) {
        const r = t[o];
        if (e(r)) {
          const e = n(r);
          return (
            void 0 === e ? t.splice(o, 1) : (t[o] = e),
            a
              ? void 0 === e && t.claim_info.last_index--
              : (t.claim_info.last_index = o),
            r
          );
        }
      }
      return o();
    })();
    return (
      (r.claim_order = t.claim_info.total_claimed),
      (t.claim_info.total_claimed += 1),
      r
    );
  }
  function N(t, e, n) {
    return (function (t, e, n, o) {
      return A(
        t,
        (t) => t.nodeName === e,
        (t) => {
          const e = [];
          for (let o = 0; o < t.attributes.length; o++) {
            const a = t.attributes[o];
            n[a.name] || e.push(a.name);
          }
          e.forEach((e) => t.removeAttribute(e));
        },
        () => o(e)
      );
    })(t, e, n, $);
  }
  function I(t, e) {
    return A(
      t,
      (t) => 3 === t.nodeType,
      (t) => {
        const n = "" + e;
        if (t.data.startsWith(n)) {
          if (t.data.length !== n.length) return t.splitText(n.length);
        } else t.data = n;
      },
      () => E(e),
      !0
    );
  }
  function R(t) {
    return I(t, " ");
  }
  function O(t, e) {
    (e = "" + e), t.wholeText !== e && (t.data = e);
  }
  function P(t, e, n, o) {
    null === n
      ? t.style.removeProperty(e)
      : t.style.setProperty(e, n, o ? "important" : "");
  }
  function D(t) {
    const e = {};
    for (const n of t) e[n.name] = n.value;
    return e;
  }
  const H = new Map();
  let M,
    B = 0;
  function S(t, e, n, o, a, r, i, c = 0) {
    const l = 16.666 / o;
    let s = "{\n";
    for (let t = 0; t <= 1; t += l) {
      const o = e + (n - e) * r(t);
      s += 100 * t + `%{${i(o, 1 - o)}}\n`;
    }
    const d = s + `100% {${i(n, 1 - n)}}\n}`,
      u = `__svelte_${(function (t) {
        let e = 5381,
          n = t.length;
        for (; n--; ) e = ((e << 5) - e) ^ t.charCodeAt(n);
        return e >>> 0;
      })(d)}_${c}`,
      h = g(t),
      { stylesheet: f, rules: p } =
        H.get(h) ||
        (function (t, e) {
          const n = { stylesheet: m(e), rules: {} };
          return H.set(t, n), n;
        })(h, t);
    p[u] ||
      ((p[u] = !0), f.insertRule(`@keyframes ${u} ${d}`, f.cssRules.length));
    const b = t.style.animation || "";
    return (
      (t.style.animation = `${
        b ? `${b}, ` : ""
      }${u} ${o}ms linear ${a}ms 1 both`),
      (B += 1),
      u
    );
  }
  function L(t, e) {
    const n = (t.style.animation || "").split(", "),
      o = n.filter(
        e ? (t) => t.indexOf(e) < 0 : (t) => -1 === t.indexOf("__svelte")
      ),
      a = n.length - o.length;
    a &&
      ((t.style.animation = o.join(", ")),
      (B -= a),
      B ||
        s(() => {
          B ||
            (H.forEach((t) => {
              const { ownerNode: e } = t.stylesheet;
              e && y(e);
            }),
            H.clear());
        }));
  }
  function V(t) {
    const e = getComputedStyle(t);
    if ("absolute" !== e.position && "fixed" !== e.position) {
      const { width: n, height: o } = e,
        a = t.getBoundingClientRect();
      (t.style.position = "absolute"),
        (t.style.width = n),
        (t.style.height = o),
        (function (t, e) {
          const n = t.getBoundingClientRect();
          if (e.left !== n.left || e.top !== n.top) {
            const o = getComputedStyle(t),
              a = "none" === o.transform ? "" : o.transform;
            t.style.transform = `${a} translate(${e.left - n.left}px, ${
              e.top - n.top
            }px)`;
          }
        })(t, a);
    }
  }
  function j(t) {
    M = t;
  }
  function U() {
    if (!M) throw new Error("Function called outside component initialization");
    return M;
  }
  const F = [],
    W = [],
    q = [],
    z = [],
    K = Promise.resolve();
  let X = !1;
  function G(t) {
    q.push(t);
  }
  const J = new Set();
  let Q,
    Y = 0;
  function Z() {
    const t = M;
    do {
      for (; Y < F.length; ) {
        const t = F[Y];
        Y++, j(t), tt(t.$$);
      }
      for (j(null), F.length = 0, Y = 0; W.length; ) W.pop()();
      for (let t = 0; t < q.length; t += 1) {
        const e = q[t];
        J.has(e) || (J.add(e), e());
      }
      q.length = 0;
    } while (F.length);
    for (; z.length; ) z.pop()();
    (X = !1), J.clear(), j(t);
  }
  function tt(t) {
    if (null !== t.fragment) {
      t.update(), a(t.before_update);
      const e = t.dirty;
      (t.dirty = [-1]),
        t.fragment && t.fragment.p(t.ctx, e),
        t.after_update.forEach(G);
    }
  }
  function et() {
    return (
      Q ||
        ((Q = Promise.resolve()),
        Q.then(() => {
          Q = null;
        })),
      Q
    );
  }
  function nt(t, e, n) {
    t.dispatchEvent(
      (function (t, e, { bubbles: n = !1, cancelable: o = !1 } = {}) {
        const a = document.createEvent("CustomEvent");
        return a.initCustomEvent(t, n, o, e), a;
      })(`${e ? "intro" : "outro"}${n}`)
    );
  }
  const ot = new Set();
  let at;
  function rt() {
    at = { r: 0, c: [], p: at };
  }
  function it() {
    at.r || a(at.c), (at = at.p);
  }
  function ct(t, e) {
    t && t.i && (ot.delete(t), t.i(e));
  }
  function lt(t, e, n, o) {
    if (t && t.o) {
      if (ot.has(t)) return;
      ot.add(t),
        at.c.push(() => {
          ot.delete(t), o && (n && t.d(1), o());
        }),
        t.o(e);
    } else o && o();
  }
  const st = { duration: 0 };
  function dt(t, e) {
    t.d(1), e.delete(t.key);
  }
  function ut(t, e) {
    t.f(),
      (function (t, e) {
        lt(t, 1, 1, () => {
          e.delete(t.key);
        });
      })(t, e);
  }
  function ht(t, e, n, o, a, r, i, c, l, s, d, u) {
    let h = t.length,
      f = r.length,
      p = h;
    const g = {};
    for (; p--; ) g[t[p].key] = p;
    const m = [],
      b = new Map(),
      v = new Map();
    for (p = f; p--; ) {
      const t = u(a, r, p),
        c = n(t);
      let l = i.get(c);
      l ? o && l.p(t, e) : ((l = s(c, t)), l.c()),
        b.set(c, (m[p] = l)),
        c in g && v.set(c, Math.abs(p - g[c]));
    }
    const y = new Set(),
      $ = new Set();
    function E(t) {
      ct(t, 1), t.m(c, d), i.set(t.key, t), (d = t.first), f--;
    }
    for (; h && f; ) {
      const e = m[f - 1],
        n = t[h - 1],
        o = e.key,
        a = n.key;
      e === n
        ? ((d = e.first), h--, f--)
        : b.has(a)
        ? !i.has(o) || y.has(o)
          ? E(e)
          : $.has(a)
          ? h--
          : v.get(o) > v.get(a)
          ? ($.add(o), E(e))
          : (y.add(a), h--)
        : (l(n, i), h--);
    }
    for (; h--; ) {
      const e = t[h];
      b.has(e.key) || l(e, i);
    }
    for (; f; ) E(m[f - 1]);
    return m;
  }
  function ft(t) {
    t && t.c();
  }
  function pt(t, e) {
    t && t.l(e);
  }
  function gt(t, e, o, i) {
    const { fragment: c, after_update: l } = t.$$;
    c && c.m(e, o),
      i ||
        G(() => {
          const e = t.$$.on_mount.map(n).filter(r);
          t.$$.on_destroy ? t.$$.on_destroy.push(...e) : a(e),
            (t.$$.on_mount = []);
        }),
      l.forEach(G);
  }
  function mt(t, e) {
    const n = t.$$;
    null !== n.fragment &&
      (a(n.on_destroy),
      n.fragment && n.fragment.d(e),
      (n.on_destroy = n.fragment = null),
      (n.ctx = []));
  }
  function bt(t, e) {
    -1 === t.$$.dirty[0] &&
      (F.push(t), X || ((X = !0), K.then(Z)), t.$$.dirty.fill(0)),
      (t.$$.dirty[(e / 31) | 0] |= 1 << e % 31);
  }
  function vt(e, n, r, i, c, l, s, d = [-1]) {
    const u = M;
    j(e);
    const h = (e.$$ = {
      fragment: null,
      ctx: [],
      props: l,
      update: t,
      not_equal: c,
      bound: o(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(n.context || (u ? u.$$.context : [])),
      callbacks: o(),
      dirty: d,
      skip_bound: !1,
      root: n.target || u.$$.root,
    });
    s && s(h.root);
    let p = !1;
    if (
      ((h.ctx = r
        ? r(e, n.props || {}, (t, n, ...o) => {
            const a = o.length ? o[0] : n;
            return (
              h.ctx &&
                c(h.ctx[t], (h.ctx[t] = a)) &&
                (!h.skip_bound && h.bound[t] && h.bound[t](a), p && bt(e, t)),
              n
            );
          })
        : []),
      h.update(),
      (p = !0),
      a(h.before_update),
      (h.fragment = !!i && i(h.ctx)),
      n.target)
    ) {
      if (n.hydrate) {
        f = !0;
        const t = T(n.target);
        h.fragment && h.fragment.l(t), t.forEach(y);
      } else h.fragment && h.fragment.c();
      n.intro && ct(e.$$.fragment),
        gt(e, n.target, n.anchor, n.customElement),
        (f = !1),
        Z();
    }
    j(u);
  }
  let yt;
  var $t, Et, _t;
  "function" == typeof HTMLElement &&
    (yt = class extends HTMLElement {
      constructor() {
        super(), this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const { on_mount: t } = this.$$;
        this.$$.on_disconnect = t.map(n).filter(r);
        for (const t in this.$$.slotted) this.appendChild(this.$$.slotted[t]);
      }
      attributeChangedCallback(t, e, n) {
        this[t] = n;
      }
      disconnectedCallback() {
        a(this.$$.on_disconnect);
      }
      $destroy() {
        mt(this, 1), (this.$destroy = t);
      }
      $on(e, n) {
        if (!r(n)) return t;
        const o = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
        return (
          o.push(n),
          () => {
            const t = o.indexOf(n);
            -1 !== t && o.splice(t, 1);
          }
        );
      }
      $set(t) {
        var e;
        this.$$set &&
          ((e = t), 0 !== Object.keys(e).length) &&
          ((this.$$.skip_bound = !0), this.$$set(t), (this.$$.skip_bound = !1));
      }
    }),
    ((_t = $t || ($t = {})).language = "language"),
    (_t.system = "system"),
    (_t.comma_decimal = "comma_decimal"),
    (_t.decimal_comma = "decimal_comma"),
    (_t.space_comma = "space_comma"),
    (_t.none = "none"),
    (function (t) {
      (t.language = "language"),
        (t.system = "system"),
        (t.am_pm = "12"),
        (t.twenty_four = "24");
    })(Et || (Et = {}));
  var wt = function (t, e, n, o) {
    (o = o || {}), (n = null == n ? {} : n);
    var a = new Event(e, {
      bubbles: void 0 === o.bubbles || o.bubbles,
      cancelable: Boolean(o.cancelable),
      composed: void 0 === o.composed || o.composed,
    });
    return (a.detail = n), t.dispatchEvent(a), a;
  };
  function xt(t, e, n) {
    const o = t.slice();
    return (o[32] = e[n]), (o[34] = n), o;
  }
  function Ct(t, e, n) {
    const o = t.slice();
    return (o[27] = e[n][0]), (o[28] = e[n][1][0]), (o[29] = e[n][1][1]), o;
  }
  function kt(t) {
    let e,
      n,
      o,
      a,
      r,
      i,
      c = !t[6] && At(t),
      l = t[2]?.cards?.length && !t[6] && It(t),
      s = t[6] && Rt(t);
    return {
      c() {
        (e = $("form")),
          (n = $("div")),
          c && c.c(),
          (o = _()),
          l && l.c(),
          (a = _()),
          s && s.c(),
          this.h();
      },
      l(t) {
        e = N(t, "FORM", { class: !0 });
        var r = T(e);
        n = N(r, "DIV", { class: !0 });
        var i = T(n);
        c && c.l(i),
          i.forEach(y),
          (o = R(r)),
          l && l.l(r),
          (a = R(r)),
          s && s.l(r),
          r.forEach(y),
          this.h();
      },
      h() {
        C(n, "class", "row"), C(e, "class", "content");
      },
      m(d, u) {
        v(d, e, u),
          b(e, n),
          c && c.m(n, null),
          b(e, o),
          l && l.m(e, null),
          b(e, a),
          s && s.m(e, null),
          r || ((i = x(e, "input", t[8])), (r = !0));
      },
      p(t, o) {
        t[6]
          ? c && (c.d(1), (c = null))
          : c
          ? c.p(t, o)
          : ((c = At(t)), c.c(), c.m(n, null)),
          t[2]?.cards?.length && !t[6]
            ? l
              ? l.p(t, o)
              : ((l = It(t)), l.c(), l.m(e, a))
            : l && (l.d(1), (l = null)),
          t[6]
            ? s
              ? s.p(t, o)
              : ((s = Rt(t)), s.c(), s.m(e, null))
            : s && (s.d(1), (s = null));
      },
      d(t) {
        t && y(e), c && c.d(), l && l.d(), s && s.d(), (r = !1), i();
      },
    };
  }
  function Tt(t) {
    let e,
      n,
      o,
      a = [],
      r = new Map(),
      i = Object.entries(t[7]);
    const c = (t) => t[27];
    for (let e = 0; e < i.length; e += 1) {
      let n = Ct(t, i, e),
        o = c(n);
      r.set(o, (a[e] = Vt(o, n)));
    }
    return {
      c() {
        e = $("form");
        for (let t = 0; t < a.length; t += 1) a[t].c();
        this.h();
      },
      l(t) {
        e = N(t, "FORM", { class: !0 });
        var n = T(e);
        for (let t = 0; t < a.length; t += 1) a[t].l(n);
        n.forEach(y), this.h();
      },
      h() {
        C(e, "class", "content");
      },
      m(r, i) {
        v(r, e, i);
        for (let t = 0; t < a.length; t += 1) a[t].m(e, null);
        n || ((o = x(e, "input", t[8])), (n = !0));
      },
      p(t, n) {
        3479 & n[0] &&
          ((i = Object.entries(t[7])),
          (a = ht(a, n, c, 1, t, i, r, e, dt, Vt, null, Ct)));
      },
      d(t) {
        t && y(e);
        for (let t = 0; t < a.length; t += 1) a[t].d();
        (n = !1), o();
      },
    };
  }
  function At(t) {
    let e,
      n,
      o,
      i,
      c,
      l,
      s,
      d = t[2].cards || [],
      u = [];
    for (let e = 0; e < d.length; e += 1) u[e] = Nt(xt(t, d, e));
    return {
      c() {
        e = $("paper-tabs");
        for (let t = 0; t < u.length; t += 1) u[t].c();
        (n = _()),
          (o = $("paper-tabs")),
          (i = $("paper-tab")),
          (c = $("ha-icon")),
          this.h();
      },
      l(t) {
        e = N(t, "PAPER-TABS", { scrollable: !0, selected: !0 });
        var a = T(e);
        for (let t = 0; t < u.length; t += 1) u[t].l(a);
        a.forEach(y), (n = R(t)), (o = N(t, "PAPER-TABS", { id: !0 }));
        var r = T(o);
        i = N(r, "PAPER-TAB", {});
        var l = T(i);
        (c = N(l, "HA-ICON", { icon: !0 })),
          T(c).forEach(y),
          l.forEach(y),
          r.forEach(y),
          this.h();
      },
      h() {
        k(e, "scrollable", ""),
          k(e, "selected", t[5]),
          k(c, "icon", "mdi:plus"),
          k(o, "id", "add-card");
      },
      m(a, d) {
        v(a, e, d);
        for (let t = 0; t < u.length; t += 1) u[t].m(e, null);
        v(a, n, d),
          v(a, o, d),
          b(o, i),
          b(i, c),
          l ||
            ((s = [
              x(e, "iron-activate", function () {
                r(t[11](t[19])) && t[11](t[19]).apply(this, arguments);
              }),
              x(o, "iron-activate", t[20]),
            ]),
            (l = !0));
      },
      p(n, o) {
        if (((t = n), 4 & o[0])) {
          let n;
          for (d = t[2].cards || [], n = 0; n < d.length; n += 1) {
            const a = xt(t, d, n);
            u[n] ? u[n].p(a, o) : ((u[n] = Nt(a)), u[n].c(), u[n].m(e, null));
          }
          for (; n < u.length; n += 1) u[n].d(1);
          u.length = d.length;
        }
        32 & o[0] && k(e, "selected", t[5]);
      },
      d(t) {
        t && y(e),
          (function (t, e) {
            for (let n = 0; n < t.length; n += 1) t[n] && t[n].d(e);
          })(u, t),
          t && y(n),
          t && y(o),
          (l = !1),
          a(s);
      },
    };
  }
  function Nt(t) {
    let e,
      n,
      o,
      a,
      r = t[34] + 1 + "",
      i = (void t[32] || "") + "";
    return {
      c() {
        (e = $("paper-tab")), (n = E(r)), (o = _()), (a = E(i));
      },
      l(t) {
        e = N(t, "PAPER-TAB", {});
        var c = T(e);
        (n = I(c, r)), (o = R(c)), (a = I(c, i)), c.forEach(y);
      },
      m(t, r) {
        v(t, e, r), b(e, n), b(e, o), b(e, a);
      },
      p(t, e) {
        4 & e[0] && i !== (i = (void t[32] || "") + "") && O(a, i);
      },
      d(t) {
        t && y(e);
      },
    };
  }
  function It(t) {
    let e, n, o, i, c, l, s, d;
    return {
      c() {
        (e = $("div")),
          (n = $("mwc-button")),
          (o = E("Remove")),
          (i = _()),
          (c = $("hui-card-element-editor")),
          this.h();
      },
      l(t) {
        e = N(t, "DIV", { class: !0 });
        var a = T(e);
        n = N(a, "MWC-BUTTON", {});
        var r = T(n);
        (o = I(r, "Remove")),
          r.forEach(y),
          (i = R(a)),
          (c = N(a, "HUI-CARD-ELEMENT-EDITOR", {
            hass: !0,
            value: !0,
            lovelace: !0,
          })),
          T(c).forEach(y),
          a.forEach(y),
          this.h();
      },
      h() {
        k(c, "hass", t[0]),
          k(c, "value", (l = t[2].cards[t[5]])),
          k(c, "lovelace", t[1]),
          C(e, "class", "sub-panel");
      },
      m(a, l) {
        v(a, e, l),
          b(e, n),
          b(n, o),
          b(e, i),
          b(e, c),
          s ||
            ((d = [
              x(n, "click", t[21]),
              x(c, "config-changed", function () {
                r(t[11](t[22])) && t[11](t[22]).apply(this, arguments);
              }),
            ]),
            (s = !0));
      },
      p(e, n) {
        (t = e),
          1 & n[0] && k(c, "hass", t[0]),
          36 & n[0] && l !== (l = t[2].cards[t[5]]) && k(c, "value", l),
          2 & n[0] && k(c, "lovelace", t[1]);
      },
      d(t) {
        t && y(e), (s = !1), a(d);
      },
    };
  }
  function Rt(t) {
    let e, n, o, i, c, l, s;
    return {
      c() {
        (e = $("div")),
          (n = $("mwc-button")),
          (o = E("Cancel")),
          (i = _()),
          (c = $("hui-card-picker")),
          this.h();
      },
      l(t) {
        e = N(t, "DIV", { class: !0 });
        var a = T(e);
        n = N(a, "MWC-BUTTON", {});
        var r = T(n);
        (o = I(r, "Cancel")),
          r.forEach(y),
          (i = R(a)),
          (c = N(a, "HUI-CARD-PICKER", { hass: !0, lovelace: !0 })),
          T(c).forEach(y),
          a.forEach(y),
          this.h();
      },
      h() {
        k(c, "hass", t[0]), k(c, "lovelace", t[1]), C(e, "class", "sub-panel");
      },
      m(a, d) {
        v(a, e, d),
          b(e, n),
          b(n, o),
          b(e, i),
          b(e, c),
          l ||
            ((s = [
              x(n, "click", t[23]),
              x(c, "config-changed", function () {
                r(t[11](t[24])) && t[11](t[24]).apply(this, arguments);
              }),
            ]),
            (l = !0));
      },
      p(e, n) {
        (t = e),
          1 & n[0] && k(c, "hass", t[0]),
          2 & n[0] && k(c, "lovelace", t[1]);
      },
      d(t) {
        t && y(e), (l = !1), a(s);
      },
    };
  }
  function Ot(t) {
    let e, n, o, a, r, i;
    function c() {
      return t[13](t[27]);
    }
    return {
      c() {
        (e = $("ha-formfield")), (n = $("ha-switch")), this.h();
      },
      l(t) {
        e = N(t, "HA-FORMFIELD", { label: !0 });
        var o = T(e);
        (n = N(o, "HA-SWITCH", { checked: !0, configvalue: !0 })),
          T(n).forEach(y),
          o.forEach(y),
          this.h();
      },
      h() {
        k(n, "checked", (o = t[2][t[27]] ?? !1)),
          k(n, "configvalue", (a = t[2][t[27]])),
          k(e, "label", t[29]?.label || t[27]);
      },
      m(t, o) {
        v(t, e, o), b(e, n), r || ((i = x(n, "input", c)), (r = !0));
      },
      p(e, r) {
        (t = e),
          4 & r[0] && o !== (o = t[2][t[27]] ?? !1) && k(n, "checked", o),
          4 & r[0] && a !== (a = t[2][t[27]]) && k(n, "configvalue", a);
      },
      d(t) {
        t && y(e), (r = !1), i();
      },
    };
  }
  function Pt(t) {
    let e, n, o, a, i;
    function c(...e) {
      return t[14](t[27], ...e);
    }
    return {
      c() {
        (e = $("ha-textfield")), this.h();
      },
      l(t) {
        (e = N(t, "HA-TEXTFIELD", { label: !0, value: !0, configvalue: !0 })),
          T(e).forEach(y),
          this.h();
      },
      h() {
        k(e, "label", t[29]?.label || t[27]),
          k(e, "value", (n = t[2][t[27]] ?? "")),
          k(e, "configvalue", (o = t[2][t[27]]));
      },
      m(n, o) {
        v(n, e, o),
          a ||
            ((i = x(e, "input", function () {
              r(t[11](c)) && t[11](c).apply(this, arguments);
            })),
            (a = !0));
      },
      p(a, r) {
        (t = a),
          4 & r[0] && n !== (n = t[2][t[27]] ?? "") && k(e, "value", n),
          4 & r[0] && o !== (o = t[2][t[27]]) && k(e, "configvalue", o);
      },
      d(t) {
        t && y(e), (a = !1), i();
      },
    };
  }
  function Dt(t) {
    let e, n, o, a, r, i, c, l, s, d, u;
    function h(t, e) {
      return t[2][t[27]] ? Ht : Mt;
    }
    let f = h(t),
      p = f(t),
      g = t[2][t[27]] && Bt(t);
    function m(t, e) {
      return t[4] ? Lt : t[2][t[27]] ? St : void 0;
    }
    let E = m(t),
      A = E && E(t);
    return {
      c() {
        (e = $("div")),
          (n = $("ha-textfield")),
          (r = _()),
          (i = $("ha-icon-button")),
          p.c(),
          (c = _()),
          g && g.c(),
          (l = _()),
          A && A.c(),
          (s = w()),
          this.h();
      },
      l(t) {
        e = N(t, "DIV", { class: !0 });
        var o = T(e);
        (n = N(o, "HA-TEXTFIELD", {
          label: !0,
          value: !0,
          configvalue: !0,
          readonly: !0,
        })),
          T(n).forEach(y),
          (r = R(o)),
          (i = N(o, "HA-ICON-BUTTON", {}));
        var a = T(i);
        p.l(a),
          a.forEach(y),
          (c = R(o)),
          g && g.l(o),
          o.forEach(y),
          (l = R(t)),
          A && A.l(t),
          (s = w()),
          this.h();
      },
      h() {
        k(n, "label", t[29]?.label || t[27]),
          k(n, "value", (o = t[2][t[27]]?.type ?? "")),
          k(n, "configvalue", (a = t[2][t[27]])),
          k(n, "readonly", !0),
          C(e, "class", "row");
      },
      m(o, a) {
        v(o, e, a),
          b(e, n),
          b(e, r),
          b(e, i),
          p.m(i, null),
          b(e, c),
          g && g.m(e, null),
          v(o, l, a),
          A && A.m(o, a),
          v(o, s, a),
          d || ((u = x(i, "click", t[15])), (d = !0));
      },
      p(t, r) {
        4 & r[0] && o !== (o = t[2][t[27]]?.type ?? "") && k(n, "value", o),
          4 & r[0] && a !== (a = t[2][t[27]]) && k(n, "configvalue", a),
          f !== (f = h(t)) && (p.d(1), (p = f(t)), p && (p.c(), p.m(i, null))),
          t[2][t[27]]
            ? g
              ? g.p(t, r)
              : ((g = Bt(t)), g.c(), g.m(e, null))
            : g && (g.d(1), (g = null)),
          E === (E = m(t)) && A
            ? A.p(t, r)
            : (A && A.d(1),
              (A = E && E(t)),
              A && (A.c(), A.m(s.parentNode, s)));
      },
      d(t) {
        t && y(e),
          p.d(),
          g && g.d(),
          t && y(l),
          A && A.d(t),
          t && y(s),
          (d = !1),
          u();
      },
    };
  }
  function Ht(t) {
    let e;
    return {
      c() {
        (e = $("ha-icon")), this.h();
      },
      l(t) {
        (e = N(t, "HA-ICON", { icon: !0 })), T(e).forEach(y), this.h();
      },
      h() {
        k(e, "icon", "mdi:redo");
      },
      m(t, n) {
        v(t, e, n);
      },
      d(t) {
        t && y(e);
      },
    };
  }
  function Mt(t) {
    let e;
    return {
      c() {
        (e = $("ha-icon")), this.h();
      },
      l(t) {
        (e = N(t, "HA-ICON", { icon: !0 })), T(e).forEach(y), this.h();
      },
      h() {
        k(e, "icon", "mdi:plus");
      },
      m(t, n) {
        v(t, e, n);
      },
      d(t) {
        t && y(e);
      },
    };
  }
  function Bt(t) {
    let e, n, o, a;
    function r() {
      return t[16](t[27]);
    }
    return {
      c() {
        (e = $("ha-icon-button")), (n = $("ha-icon")), this.h();
      },
      l(t) {
        e = N(t, "HA-ICON-BUTTON", {});
        var o = T(e);
        (n = N(o, "HA-ICON", { icon: !0 })),
          T(n).forEach(y),
          o.forEach(y),
          this.h();
      },
      h() {
        k(n, "icon", "mdi:close");
      },
      m(t, i) {
        v(t, e, i), b(e, n), o || ((a = x(e, "click", r)), (o = !0));
      },
      p(e, n) {
        t = e;
      },
      d(t) {
        t && y(e), (o = !1), a();
      },
    };
  }
  function St(t) {
    let e, n, o, a, r, i;
    return {
      c() {
        (e = $("div")), (n = $("hui-card-element-editor")), (a = _()), this.h();
      },
      l(t) {
        e = N(t, "DIV", { class: !0 });
        var o = T(e);
        (n = N(o, "HUI-CARD-ELEMENT-EDITOR", {
          hass: !0,
          value: !0,
          lovelace: !0,
        })),
          T(n).forEach(y),
          (a = R(o)),
          o.forEach(y),
          this.h();
      },
      h() {
        k(n, "hass", t[0]),
          k(n, "value", (o = t[2][t[27]])),
          k(n, "lovelace", t[1]),
          C(e, "class", "sub-panel");
      },
      m(o, c) {
        v(o, e, c),
          b(e, n),
          b(e, a),
          r || ((i = x(n, "config-changed", t[10](t[27]))), (r = !0));
      },
      p(e, a) {
        (t = e),
          1 & a[0] && k(n, "hass", t[0]),
          4 & a[0] && o !== (o = t[2][t[27]]) && k(n, "value", o),
          2 & a[0] && k(n, "lovelace", t[1]);
      },
      d(t) {
        t && y(e), (r = !1), i();
      },
    };
  }
  function Lt(t) {
    let e, n, o, i, c, l, s, d;
    function u(...e) {
      return t[18](t[27], ...e);
    }
    return {
      c() {
        (e = $("div")),
          (n = $("mwc-button")),
          (o = E("Cancel")),
          (i = _()),
          (c = $("hui-card-picker")),
          (l = _()),
          this.h();
      },
      l(t) {
        e = N(t, "DIV", { class: !0 });
        var a = T(e);
        n = N(a, "MWC-BUTTON", {});
        var r = T(n);
        (o = I(r, "Cancel")),
          r.forEach(y),
          (i = R(a)),
          (c = N(a, "HUI-CARD-PICKER", { hass: !0, lovelace: !0 })),
          T(c).forEach(y),
          (l = R(a)),
          a.forEach(y),
          this.h();
      },
      h() {
        k(c, "hass", t[0]), k(c, "lovelace", t[1]), C(e, "class", "sub-panel");
      },
      m(a, h) {
        v(a, e, h),
          b(e, n),
          b(n, o),
          b(e, i),
          b(e, c),
          b(e, l),
          s ||
            ((d = [
              x(n, "click", t[17]),
              x(c, "config-changed", function () {
                r(t[11](u)) && t[11](u).apply(this, arguments);
              }),
            ]),
            (s = !0));
      },
      p(e, n) {
        (t = e),
          1 & n[0] && k(c, "hass", t[0]),
          2 & n[0] && k(c, "lovelace", t[1]);
      },
      d(t) {
        t && y(e), (s = !1), a(d);
      },
    };
  }
  function Vt(t, e) {
    let n,
      o,
      a,
      r,
      i = "boolean" === e[28] && (!e[29]?.cond || e[29]?.cond(e[2])),
      c = "string" === e[28] && (!e[29]?.cond || e[29]?.cond(e[2])),
      l = "card" === e[28] && (!e[29]?.cond || e[29]?.cond(e[2])),
      s = i && Ot(e),
      d = c && Pt(e),
      u = l && Dt(e);
    return {
      key: t,
      first: null,
      c() {
        (n = w()),
          s && s.c(),
          (o = _()),
          d && d.c(),
          (a = _()),
          u && u.c(),
          (r = w()),
          this.h();
      },
      l(t) {
        (n = w()),
          s && s.l(t),
          (o = R(t)),
          d && d.l(t),
          (a = R(t)),
          u && u.l(t),
          (r = w()),
          this.h();
      },
      h() {
        this.first = n;
      },
      m(t, e) {
        v(t, n, e),
          s && s.m(t, e),
          v(t, o, e),
          d && d.m(t, e),
          v(t, a, e),
          u && u.m(t, e),
          v(t, r, e);
      },
      p(t, n) {
        (e = t),
          4 & n[0] &&
            (i = "boolean" === e[28] && (!e[29]?.cond || e[29]?.cond(e[2]))),
          i
            ? s
              ? s.p(e, n)
              : ((s = Ot(e)), s.c(), s.m(o.parentNode, o))
            : s && (s.d(1), (s = null)),
          4 & n[0] &&
            (c = "string" === e[28] && (!e[29]?.cond || e[29]?.cond(e[2]))),
          c
            ? d
              ? d.p(e, n)
              : ((d = Pt(e)), d.c(), d.m(a.parentNode, a))
            : d && (d.d(1), (d = null)),
          4 & n[0] &&
            (l = "card" === e[28] && (!e[29]?.cond || e[29]?.cond(e[2]))),
          l
            ? u
              ? u.p(e, n)
              : ((u = Dt(e)), u.c(), u.m(r.parentNode, r))
            : u && (u.d(1), (u = null));
      },
      d(t) {
        t && y(n),
          s && s.d(t),
          t && y(o),
          d && d.d(t),
          t && y(a),
          u && u.d(t),
          t && y(r);
      },
    };
  }
  function jt(e) {
    let n, o, a, r, i, c, l, s, d, u, h, f;
    function p(t, e) {
      return 0 === t[3] ? Tt : kt;
    }
    let g = p(e),
      m = g(e);
    return {
      c() {
        (n = $("paper-tabs")),
          (o = $("paper-tab")),
          (a = E("Layout")),
          (i = _()),
          (c = $("paper-tab")),
          (l = E("Cards")),
          (d = _()),
          m.c(),
          (u = w()),
          (this.c = t),
          this.h();
      },
      l(t) {
        n = N(t, "PAPER-TABS", { scrollable: !0, selected: !0 });
        var e = T(n);
        o = N(e, "PAPER-TAB", { class: !0 });
        var r = T(o);
        (a = I(r, "Layout")),
          r.forEach(y),
          (i = R(e)),
          (c = N(e, "PAPER-TAB", { class: !0 }));
        var s = T(c);
        (l = I(s, "Cards")),
          s.forEach(y),
          e.forEach(y),
          (d = R(t)),
          m.l(t),
          (u = w()),
          this.h();
      },
      h() {
        k(o, "class", (r = "" + (0 === e[3] ? "tab-selected" : ""))),
          k(c, "class", (s = "" + (0 !== e[3] ? "tab-selected" : ""))),
          k(n, "scrollable", ""),
          k(n, "selected", e[3]);
      },
      m(t, r) {
        v(t, n, r),
          b(n, o),
          b(o, a),
          b(n, i),
          b(n, c),
          b(c, l),
          v(t, d, r),
          m.m(t, r),
          v(t, u, r),
          h || ((f = x(n, "iron-activate", e[9])), (h = !0));
      },
      p(t, e) {
        8 & e[0] &&
          r !== (r = "" + (0 === t[3] ? "tab-selected" : "")) &&
          k(o, "class", r),
          8 & e[0] &&
            s !== (s = "" + (0 !== t[3] ? "tab-selected" : "")) &&
            k(c, "class", s),
          8 & e[0] && k(n, "selected", t[3]),
          g === (g = p(t)) && m
            ? m.p(t, e)
            : (m.d(1), (m = g(t)), m && (m.c(), m.m(u.parentNode, u)));
      },
      i: t,
      o: t,
      d(t) {
        t && y(n), t && y(d), m.d(t), t && y(u), (h = !1), f();
      },
    };
  }
  function Ut(t, e, n) {
    const o = U();
    let a = {};
    const r = {
      title: ["string", { label: "Title (Not displayed if using Title-Card)" }],
      clear: ["boolean", { label: "Remove background" }],
      expanded: [
        "boolean",
        { label: "Start expanded (Always expanded in editor)" },
      ],
      "button-background": [
        "string",
        { label: "Button background (CSS color" },
      ],
      gap: ["string", { label: "Gap between cards" }],
      padding: ["string", { label: "Padding of all card content" }],
      "child-padding": ["string", { label: "Padding of child cards" }],
      "title-card": ["card", { label: "Title card" }],
      "title-card-padding": [
        "string",
        {
          label: "Padding of title card",
          cond: (t) => void 0 !== t["title-card"],
        },
      ],
      "title-card-button-overlay": [
        "boolean",
        {
          label: "Expand button as overlay on title card",
          cond: (t) => void 0 !== t["title-card"],
        },
      ],
      "overlay-margin": [
        "string",
        {
          label: "Margin of overlay button",
          cond: (t) => !!t["title-card-button-overlay"],
        },
      ],
      cards: ["card[]"],
    };
    let { hass: i } = e,
      { lovelace: c } = e;
    const l = () => {
      wt(
        o,
        "config-changed",
        { config: a },
        { bubbles: !0, cancelable: !1, composed: !0 }
      );
    };
    let {
        setConfig: s = (t = {}) => {
          n(2, (a = Object.assign(Object.assign({}, a), t)));
        },
      } = e,
      d = 0;
    let u;
    const h = (t) => (e) => {
      e.stopPropagation(),
        n(2, (a[t] = e.detail.config), a),
        clearTimeout(u),
        (u = setTimeout(() => {
          wt(
            o,
            "config-changed",
            { config: a[t] },
            { bubbles: !0, cancelable: !0, composed: !0 }
          ),
            setTimeout(() => {
              l();
            }, 100);
        }, 5e3));
    };
    let f = !1,
      p = 0,
      g = !1;
    return (
      (t.$$set = (t) => {
        "hass" in t && n(0, (i = t.hass)),
          "lovelace" in t && n(1, (c = t.lovelace)),
          "setConfig" in t && n(12, (s = t.setConfig));
      }),
      [
        i,
        c,
        a,
        d,
        f,
        p,
        g,
        r,
        l,
        (t) => n(3, (d = t.detail.selected)),
        h,
        (t) => (e) => {
          t(e);
        },
        s,
        (t) => {
          n(2, (a[t] = !a[t]), a);
        },
        (t, e) => {
          n(2, (a[t] = e?.target?.value), a);
        },
        () => n(4, (f = !0)),
        (t) => {
          n(2, (a[t] = void 0), a), l();
        },
        () => {
          n(4, (f = !1));
        },
        (t, e) => {
          h(t)(e), n(4, (f = !1));
        },
        (t) => {
          n(5, (p = t.detail.selected));
        },
        () => n(6, (g = !0)),
        () => {
          n(2, (a.cards = a.cards?.filter((t, e) => e !== p)), a),
            n(5, (p = 0)),
            l();
        },
        (t) => {
          t.stopPropagation(),
            a.cards && (n(2, (a.cards[p] = t.detail.config), a), l());
        },
        () => {
          n(6, (g = !1)), l();
        },
        (t) => {
          t.stopPropagation(),
            a.cards || n(2, (a.cards = []), a),
            a.cards?.push(t.detail.config),
            l(),
            n(6, (g = !1)),
            n(5, (p = a.cards.length - 1));
        },
      ]
    );
  }
  class Ft extends yt {
    constructor(t) {
      super(),
        (this.shadowRoot.innerHTML =
          "<style>.content{display:grid;gap:1em;width:100%}ha-textfield{width:100%}paper-tabs{width:100%;padding-bottom:0.5em}.row{display:flex;flex-direction:row;align-items:center}.tab-selected{border-bottom:solid;background:#72727215}.sub-panel{border:1px solid;border-radius:1em;padding:1em}.mwc-button{margin:1em}#add-card{width:fit-content}</style>"),
        vt(
          this,
          {
            target: this.shadowRoot,
            props: D(this.attributes),
            customElement: !0,
          },
          Ut,
          jt,
          i,
          { hass: 0, lovelace: 1, setConfig: 12 },
          null,
          [-1, -1]
        ),
        t &&
          (t.target && v(t.target, this, t.anchor),
          t.props && (this.$set(t.props), Z()));
    }
    static get observedAttributes() {
      return ["hass", "lovelace", "setConfig"];
    }
    get hass() {
      return this.$$.ctx[0];
    }
    set hass(t) {
      this.$$set({ hass: t }), Z();
    }
    get lovelace() {
      return this.$$.ctx[1];
    }
    set lovelace(t) {
      this.$$set({ lovelace: t }), Z();
    }
    get setConfig() {
      return this.$$.ctx[12];
    }
    set setConfig(t) {
      this.$$set({ setConfig: t }), Z();
    }
  }
  function Wt(t) {
    return t * t * t;
  }
  function qt(t) {
    const e = t - 1;
    return e * e * e + 1;
  }
  function zt(t) {
    return --t * t * t * t * t + 1;
  }
  function Kt(t, { delay: n = 0, duration: o = 400, easing: a = e } = {}) {
    const r = +getComputedStyle(t).opacity;
    return {
      delay: n,
      duration: o,
      easing: a,
      css: (t) => "opacity: " + t * r,
    };
  }
  customElements.define("expander-card-editor", Ft);
  const Xt = window.loadCardHelpers().then((t) => t);
  function Gt(t) {
    let e, n;
    return {
      c() {
        (e = $("span")), (n = E("Loading...")), this.h();
      },
      l(t) {
        e = N(t, "SPAN", { style: !0 });
        var o = T(e);
        (n = I(o, "Loading...")), o.forEach(y), this.h();
      },
      h() {
        C(e, "style", "padding: 1em; display: block; ");
      },
      m(t, o) {
        v(t, e, o), b(e, n);
      },
      d(t) {
        t && y(e);
      },
    };
  }
  function Jt(e) {
    let n,
      o,
      a,
      i,
      c,
      l,
      s = e[2] && Gt();
    return {
      c() {
        (n = $("div")), (a = _()), s && s.c(), (i = w()), (this.c = t);
      },
      l(t) {
        (n = N(t, "DIV", {})),
          T(n).forEach(y),
          (a = R(t)),
          s && s.l(t),
          (i = w());
      },
      m(d, u) {
        var h;
        v(d, n, u),
          v(d, a, u),
          s && s.m(d, u),
          v(d, i, u),
          c ||
            ((h = o = e[3].call(null, n, { type: e[0], hass: e[1] })),
            (l = h && r(h.destroy) ? h.destroy : t),
            (c = !0));
      },
      p(t, [e]) {
        o &&
          r(o.update) &&
          3 & e &&
          o.update.call(null, { type: t[0], hass: t[1] }),
          t[2]
            ? s || ((s = Gt()), s.c(), s.m(i.parentNode, i))
            : s && (s.d(1), (s = null));
      },
      i: t,
      o: t,
      d(t) {
        t && y(n), t && y(a), s && s.d(t), t && y(i), (c = !1), l();
      },
    };
  }
  function Qt(t, e, n) {
    let { type: o = "div" } = e,
      { config: a } = e,
      { hass: r } = e,
      i = !0;
    return (
      (t.$$set = (t) => {
        "type" in t && n(0, (o = t.type)),
          "config" in t && n(4, (a = t.config)),
          "hass" in t && n(1, (r = t.hass));
      }),
      [
        o,
        r,
        i,
        (t, e) => ({
          update: (e) => {
            var o;
            if (t) {
              if (
                null === (o = t.firstChild) || void 0 === o ? void 0 : o.tagName
              )
                return void (t.firstChild.hass = e.hass);
              (async () => {
                const o = (await Xt).createCardElement(a);
                (o.hass = e.hass),
                  (t.innerHTML = ""),
                  t.appendChild(o),
                  n(2, (i = !1));
              })();
            }
          },
        }),
        a,
      ]
    );
  }
  class Yt extends yt {
    constructor(t) {
      super(),
        vt(
          this,
          {
            target: this.shadowRoot,
            props: D(this.attributes),
            customElement: !0,
          },
          Qt,
          Jt,
          i,
          { type: 0, config: 4, hass: 1 },
          null
        ),
        t &&
          (t.target && v(t.target, this, t.anchor),
          t.props && (this.$set(t.props), Z()));
    }
    static get observedAttributes() {
      return ["type", "config", "hass"];
    }
    get type() {
      return this.$$.ctx[0];
    }
    set type(t) {
      this.$$set({ type: t }), Z();
    }
    get config() {
      return this.$$.ctx[4];
    }
    set config(t) {
      this.$$set({ config: t }), Z();
    }
    get hass() {
      return this.$$.ctx[1];
    }
    set hass(t) {
      this.$$set({ hass: t }), Z();
    }
  }
  function Zt(t, { from: e, to: n }, o = {}) {
    const a = getComputedStyle(t),
      i = "none" === a.transform ? "" : a.transform,
      [c, l] = a.transformOrigin.split(" ").map(parseFloat),
      s = e.left + (e.width * c) / n.width - (n.left + c),
      d = e.top + (e.height * l) / n.height - (n.top + l),
      {
        delay: u = 0,
        duration: h = (t) => 120 * Math.sqrt(t),
        easing: f = qt,
      } = o;
    return {
      delay: u,
      duration: r(h) ? h(Math.sqrt(s * s + d * d)) : h,
      easing: f,
      css: (t, o) => {
        const a = o * s,
          r = o * d,
          c = t + (o * e.width) / n.width,
          l = t + (o * e.height) / n.height;
        return `transform: ${i} translate(${a}px, ${r}px) scale(${c}, ${l});`;
      },
    };
  }
  function te(t, e, n) {
    const o = t.slice();
    return (o[9] = e[n]), o;
  }
  function ee(e) {
    let n,
      o,
      a,
      r,
      i,
      c,
      l,
      s,
      d = e[2].title + "";
    return {
      c() {
        (n = $("button")),
          (o = $("div")),
          (a = E(d)),
          (r = _()),
          (i = $("ha-icon")),
          this.h();
      },
      l(t) {
        n = N(t, "BUTTON", { class: !0, style: !0 });
        var e = T(n);
        o = N(e, "DIV", { class: !0 });
        var c = T(o);
        (a = I(c, d)),
          c.forEach(y),
          (r = R(e)),
          (i = N(e, "HA-ICON", { icon: !0, class: !0 })),
          T(i).forEach(y),
          e.forEach(y),
          this.h();
      },
      h() {
        C(o, "class", "primary title"),
          k(i, "icon", "mdi:chevron-down"),
          k(i, "class", (c = " primaryico " + (e[1] ? "flipped" : ""))),
          C(n, "class", "header ripple"),
          P(n, "--button-background", e[2]["button-background"]);
      },
      m(t, c) {
        v(t, n, c),
          b(n, o),
          b(o, a),
          b(n, r),
          b(n, i),
          l || ((s = x(n, "click", e[5])), (l = !0));
      },
      p(t, e) {
        4 & e && d !== (d = t[2].title + "") && O(a, d),
          2 & e &&
            c !== (c = " primaryico " + (t[1] ? "flipped" : "")) &&
            k(i, "class", c),
          4 & e && P(n, "--button-background", t[2]["button-background"]);
      },
      i: t,
      o: t,
      d(t) {
        t && y(n), (l = !1), s();
      },
    };
  }
  function ne(t) {
    let e, n, o, a, r, i, c, l, s, d, u, h;
    return (
      (o = new Yt({
        props: {
          hass: t[0],
          config: t[2]["title-card"],
          type: t[2]["title-card"].type,
        },
      })),
      {
        c() {
          (e = $("div")),
            (n = $("div")),
            ft(o.$$.fragment),
            (a = _()),
            (r = $("button")),
            (i = $("ha-icon")),
            this.h();
        },
        l(t) {
          e = N(t, "DIV", { class: !0 });
          var c = T(e);
          n = N(c, "DIV", { class: !0, style: !0 });
          var l = T(n);
          pt(o.$$.fragment, l),
            l.forEach(y),
            (a = R(c)),
            (r = N(c, "BUTTON", { style: !0, class: !0 }));
          var s = T(r);
          (i = N(s, "HA-ICON", { icon: !0, class: !0 })),
            T(i).forEach(y),
            s.forEach(y),
            c.forEach(y),
            this.h();
        },
        h() {
          C(n, "class", "title-card-container"),
            P(n, "--title-padding", t[2]["title-card-padding"]),
            k(i, "icon", "mdi:chevron-down"),
            k(i, "class", (c = "primary ico " + (t[1] ? "flipped" : ""))),
            P(r, "--overlay-margin", t[2]["overlay-margin"]),
            P(r, "--button-background", t[2]["button-background"]),
            C(
              r,
              "class",
              (l =
                "header ripple " +
                (t[2]["title-card-button-overlay"] ? "header-overlay" : ""))
            ),
            C(
              e,
              "class",
              (s =
                "title-card-header" +
                (t[2]["title-card-button-overlay"] ? "-overlay" : ""))
            );
        },
        m(c, l) {
          v(c, e, l),
            b(e, n),
            gt(o, n, null),
            b(e, a),
            b(e, r),
            b(r, i),
            (d = !0),
            u || ((h = x(r, "click", t[4])), (u = !0));
        },
        p(t, a) {
          const u = {};
          1 & a && (u.hass = t[0]),
            4 & a && (u.config = t[2]["title-card"]),
            4 & a && (u.type = t[2]["title-card"].type),
            o.$set(u),
            (!d || 4 & a) &&
              P(n, "--title-padding", t[2]["title-card-padding"]),
            (!d ||
              (2 & a &&
                c !== (c = "primary ico " + (t[1] ? "flipped" : "")))) &&
              k(i, "class", c),
            (!d || 4 & a) && P(r, "--overlay-margin", t[2]["overlay-margin"]),
            (!d || 4 & a) &&
              P(r, "--button-background", t[2]["button-background"]),
            (!d ||
              (4 & a &&
                l !==
                  (l =
                    "header ripple " +
                    (t[2]["title-card-button-overlay"]
                      ? "header-overlay"
                      : "")))) &&
              C(r, "class", l),
            (!d ||
              (4 & a &&
                s !==
                  (s =
                    "title-card-header" +
                    (t[2]["title-card-button-overlay"] ? "-overlay" : "")))) &&
              C(e, "class", s);
        },
        i(t) {
          d || (ct(o.$$.fragment, t), (d = !0));
        },
        o(t) {
          lt(o.$$.fragment, t), (d = !1);
        },
        d(t) {
          t && y(e), mt(o), (u = !1), h();
        },
      }
    );
  }
  function oe(t) {
    let e,
      n,
      o = [],
      a = new Map(),
      r = t[2].cards;
    const i = (t) => t[9];
    for (let e = 0; e < r.length; e += 1) {
      let n = te(t, r, e),
        c = i(n);
      a.set(c, (o[e] = ae(c, n)));
    }
    return {
      c() {
        e = $("div");
        for (let t = 0; t < o.length; t += 1) o[t].c();
        this.h();
      },
      l(t) {
        e = N(t, "DIV", { style: !0, class: !0 });
        var n = T(e);
        for (let t = 0; t < o.length; t += 1) o[t].l(n);
        n.forEach(y), this.h();
      },
      h() {
        P(e, "--gap", t[2].gap),
          P(e, "--child-padding", t[2]["child-padding"]),
          C(e, "class", "children-container");
      },
      m(t, a) {
        v(t, e, a);
        for (let t = 0; t < o.length; t += 1) o[t].m(e, null);
        n = !0;
      },
      p(t, c) {
        if (5 & c) {
          (r = t[2].cards), rt();
          for (let t = 0; t < o.length; t += 1) o[t].r();
          o = ht(o, c, i, 1, t, r, a, e, ut, ae, null, te);
          for (let t = 0; t < o.length; t += 1) o[t].a();
          it();
        }
        (!n || 4 & c) && P(e, "--gap", t[2].gap),
          (!n || 4 & c) && P(e, "--child-padding", t[2]["child-padding"]);
      },
      i(t) {
        if (!n) {
          for (let t = 0; t < r.length; t += 1) ct(o[t]);
          n = !0;
        }
      },
      o(t) {
        for (let t = 0; t < o.length; t += 1) lt(o[t]);
        n = !1;
      },
      d(t) {
        t && y(e);
        for (let t = 0; t < o.length; t += 1) o[t].d();
      },
    };
  }
  function ae(n, o) {
    let i,
      c,
      s,
      d,
      u,
      f,
      p,
      g,
      m = t;
    return (
      (s = new Yt({ props: { hass: o[0], config: o[9], type: o[9].type } })),
      {
        key: n,
        first: null,
        c() {
          (i = $("div")),
            (c = $("div")),
            ft(s.$$.fragment),
            (f = _()),
            this.h();
        },
        l(t) {
          i = N(t, "DIV", { class: !0 });
          var e = T(i);
          c = N(e, "DIV", {});
          var n = T(c);
          pt(s.$$.fragment, n),
            n.forEach(y),
            (f = R(e)),
            e.forEach(y),
            this.h();
        },
        h() {
          C(i, "class", "child-card"), (this.first = i);
        },
        m(t, e) {
          v(t, i, e), b(i, c), gt(s, c, null), b(i, f), (g = !0);
        },
        p(t, e) {
          o = t;
          const n = {};
          1 & e && (n.hass = o[0]),
            4 & e && (n.config = o[9]),
            4 & e && (n.type = o[9].type),
            s.$set(n);
        },
        r() {
          p = i.getBoundingClientRect();
        },
        f() {
          V(i), m();
        },
        a() {
          m(),
            (m = (function (n, o, a, r) {
              if (!o) return t;
              const i = n.getBoundingClientRect();
              if (
                o.left === i.left &&
                o.right === i.right &&
                o.top === i.top &&
                o.bottom === i.bottom
              )
                return t;
              const {
                delay: c = 0,
                duration: s = 300,
                easing: d = e,
                start: u = l() + c,
                end: f = u + s,
                tick: p = t,
                css: g,
              } = a(n, { from: o, to: i }, r);
              let m,
                b = !0,
                v = !1;
              function y() {
                g && L(n, m), (b = !1);
              }
              return (
                h((t) => {
                  if (
                    (!v && t >= u && (v = !0),
                    v && t >= f && (p(1, 0), y()),
                    !b)
                  )
                    return !1;
                  if (v) {
                    const e = 0 + 1 * d((t - u) / s);
                    p(e, 1 - e);
                  }
                  return !0;
                }),
                g && (m = S(n, 0, 1, s, c, d, g)),
                c || (v = !0),
                p(0, 1),
                y
              );
            })(i, p, Zt, { delay: 250, duration: 250, easing: zt }));
        },
        i(n) {
          g ||
            (ct(s.$$.fragment, n),
            G(() => {
              u && u.end(1),
                (d = (function (n, o, a) {
                  const i = { direction: "in" };
                  let c,
                    s,
                    d = o(n, a, i),
                    u = !1,
                    f = 0;
                  function p() {
                    c && L(n, c);
                  }
                  function g() {
                    const {
                      delay: o = 0,
                      duration: a = 300,
                      easing: r = e,
                      tick: i = t,
                      css: g,
                    } = d || st;
                    g && (c = S(n, 0, 1, a, o, r, g, f++)), i(0, 1);
                    const m = l() + o,
                      b = m + a;
                    s && s.abort(),
                      (u = !0),
                      G(() => nt(n, !0, "start")),
                      (s = h((t) => {
                        if (u) {
                          if (t >= b)
                            return i(1, 0), nt(n, !0, "end"), p(), (u = !1);
                          if (t >= m) {
                            const e = r((t - m) / a);
                            i(e, 1 - e);
                          }
                        }
                        return u;
                      }));
                  }
                  let m = !1;
                  return {
                    start() {
                      m ||
                        ((m = !0),
                        L(n),
                        r(d) ? ((d = d(i)), et().then(g)) : g());
                    },
                    invalidate() {
                      m = !1;
                    },
                    end() {
                      u && (p(), (u = !1));
                    },
                  };
                })(c, Kt, { duration: 500, easing: qt })),
                d.start();
            }),
            (g = !0));
        },
        o(n) {
          lt(s.$$.fragment, n),
            d && d.invalidate(),
            (u = (function (n, o, i) {
              const c = { direction: "out" };
              let s,
                d = o(n, i, c),
                u = !0;
              const f = at;
              function p() {
                const {
                  delay: o = 0,
                  duration: r = 300,
                  easing: i = e,
                  tick: c = t,
                  css: p,
                } = d || st;
                p && (s = S(n, 1, 0, r, o, i, p));
                const g = l() + o,
                  m = g + r;
                G(() => nt(n, !1, "start")),
                  h((t) => {
                    if (u) {
                      if (t >= m)
                        return c(0, 1), nt(n, !1, "end"), --f.r || a(f.c), !1;
                      if (t >= g) {
                        const e = i((t - g) / r);
                        c(1 - e, e);
                      }
                    }
                    return u;
                  });
              }
              return (
                (f.r += 1),
                r(d)
                  ? et().then(() => {
                      (d = d(c)), p();
                    })
                  : p(),
                {
                  end(t) {
                    t && d.tick && d.tick(1, 0), u && (s && L(n, s), (u = !1));
                  },
                }
              );
            })(c, Kt, { duration: 250, easing: Wt })),
            (g = !1);
        },
        d(t) {
          t && y(i), mt(s), t && u && u.end();
        },
      }
    );
  }
  function re(e) {
    let n, o, a, r, i, c;
    const l = [ne, ee],
      s = [];
    function d(t, e) {
      return t[2]["title-card"] ? 0 : 1;
    }
    (o = d(e)), (a = s[o] = l[o](e));
    let u = e[2].cards && e[1] && oe(e);
    return {
      c() {
        (n = $("ha-card")),
          a.c(),
          (r = _()),
          u && u.c(),
          (this.c = t),
          this.h();
      },
      l(t) {
        n = N(t, "HA-CARD", { class: !0, style: !0 });
        var e = T(n);
        a.l(e), (r = R(e)), u && u.l(e), e.forEach(y), this.h();
      },
      h() {
        k(n, "class", (i = "expander-card " + (e[2].clear ? "clear" : ""))),
          P(n, "--gap", e[2].gap),
          P(n, "--padding", e[2].padding);
      },
      m(t, e) {
        v(t, n, e), s[o].m(n, null), b(n, r), u && u.m(n, null), (c = !0);
      },
      p(t, [e]) {
        let h = o;
        (o = d(t)),
          o === h
            ? s[o].p(t, e)
            : (rt(),
              lt(s[h], 1, 1, () => {
                s[h] = null;
              }),
              it(),
              (a = s[o]),
              a ? a.p(t, e) : ((a = s[o] = l[o](t)), a.c()),
              ct(a, 1),
              a.m(n, r)),
          t[2].cards && t[1]
            ? u
              ? (u.p(t, e), 6 & e && ct(u, 1))
              : ((u = oe(t)), u.c(), ct(u, 1), u.m(n, null))
            : u &&
              (rt(),
              lt(u, 1, 1, () => {
                u = null;
              }),
              it()),
          (!c ||
            (4 & e &&
              i !== (i = "expander-card " + (t[2].clear ? "clear" : "")))) &&
            k(n, "class", i),
          (!c || 4 & e) && P(n, "--gap", t[2].gap),
          (!c || 4 & e) && P(n, "--padding", t[2].padding);
      },
      i(t) {
        c || (ct(a), ct(u), (c = !0));
      },
      o(t) {
        lt(a), lt(u), (c = !1);
      },
      d(t) {
        t && y(n), s[o].d(), u && u.d();
      },
    };
  }
  function ie(t, e, n) {
    const o = U();
    let a = !1,
      r = !1,
      { hass: i } = e;
    const c = {
      gap: "0.6em",
      padding: "1em",
      clear: !1,
      title: "Expander",
      "overlay-margin": "2em",
      "child-padding": "0.5em",
      "button-background": "transparent",
    };
    let l = c,
      {
        setConfig: s = (t = {}) => {
          n(2, (l = Object.assign(Object.assign({}, c), t)));
        },
      } = e;
    var d;
    (d = () => {
      var t;
      (r =
        "hui-card-preview" ===
        (null === (t = o.parentElement) || void 0 === t
          ? void 0
          : t.localName)),
        r
          ? n(1, (a = !0))
          : void 0 !== l.expanded &&
            setTimeout(() => n(1, (a = l.expanded)), 100);
    }),
      U().$$.on_mount.push(d),
      (o.constructor.getConfigElement = () => (
        (window.ExpanderCardEditor = Ft),
        document.createElement("expander-card-editor")
      )),
      (o.constructor.getStubConfig = () => Object.assign({}, c));
    return (
      (t.$$set = (t) => {
        "hass" in t && n(0, (i = t.hass)),
          "setConfig" in t && n(3, (s = t.setConfig));
      }),
      [
        i,
        a,
        l,
        s,
        () => {
          n(1, (a = !a));
        },
        () => {
          n(1, (a = !a));
        },
      ]
    );
  }
  customElements.define("expander-sub-card", Yt);
  class ce extends yt {
    constructor(t) {
      super(),
        (this.shadowRoot.innerHTML =
          "<style>.expander-card{display:grid;gap:var(--gap);padding:var(--padding);transition:all 0.3s ease-in-out}.children-container{padding:var(--child-padding);display:grid;gap:var(--gap);transition:all 0.3s ease-in-out}.clear{background-color:transparent;border-style:none}.title-card-header{display:flex;align-items:center;justify-content:space-between;flex-direction:row}.title-card-header-overlay{display:block}.title-card-container{width:100%;padding:var(--title-padding)}.header{display:flex;flex-direction:row;align-items:center;padding:0.8em 0.8em;margin:2px;background:var(--button-background);border-style:none; color: #000000;}.header-overlay{position:absolute;top:0;right:0;margin:var(--overlay-margin)}.title{width:100%;text-align:left; color: #000000; font-size: 16px; font-weight: bold; }.ico{color:#000000;transition-property:transform;transition-duration:0.35s}.flipped{transform:rotate(180deg)}.ripple{background-position:center;transition:background 0.8s;border-radius:1em}.ripple:hover{background:#ffffff12 radial-gradient(circle, transparent 1%, #ffffff12 1%) center/15000%}.ripple:active{background-color:#ffffff25;background-size:100%;transition:background 0s}</style>"),
        vt(
          this,
          {
            target: this.shadowRoot,
            props: D(this.attributes),
            customElement: !0,
          },
          ie,
          re,
          i,
          { hass: 0, setConfig: 3 },
          null
        ),
        t &&
          (t.target && v(t.target, this, t.anchor),
          t.props && (this.$set(t.props), Z()));
    }
    static get observedAttributes() {
      return ["hass", "setConfig"];
    }
    get hass() {
      return this.$$.ctx[0];
    }
    set hass(t) {
      this.$$set({ hass: t }), Z();
    }
    get setConfig() {
      return this.$$.ctx[3];
    }
    set setConfig(t) {
      this.$$set({ setConfig: t }), Z();
    }
  }
  customElements.define("expander-card", ce);
  return (
    console.info("ExpanderCard Version: 0.0.2-3-g2fd6b8a"),
    (window.customCards = window.customCards || []),
    window.customCards.push({
      type: "expander-card",
      name: "Expander Card",
      preview: !0,
      description: "Expander card",
    }),
    ce
  );
});
