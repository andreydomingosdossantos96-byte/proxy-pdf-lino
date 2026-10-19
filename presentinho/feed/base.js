// Base compartilhada dos vídeos de feed (1080x1350). Cada vídeo define DURATION, EVENTS e render(t).
const W = 1080, H = 1350;
const $ = id => document.getElementById(id);
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => cl((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const eb = x => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const bounce = x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
const lerp = (a, b, x) => a + (b - a) * x;
function set(el, { x = 0, y = 0, s = 1, r = 0, o = 1 } = {}) { el.style.transform = `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`; el.style.opacity = o; }
function rise(el, t, a, d = 0.3, dist = 40) { const k = eo(P(t, a, a + d)); set(el, { y: (1 - k) * dist, o: k }); }
function pop(el, t, a, d = 0.3, from = 0.6, r = 0) { const k = P(t, a, a + d); set(el, { s: lerp(from, 1, eb(k)), r, o: k > 0 ? Math.min(1, k * 3) : 0 }); }
function slam(el, t, a, d = 0.2, from = 2.4, r = 0) { const k = P(t, a, a + d); set(el, { s: lerp(from, 1, eo(k)), r, o: k > 0 ? Math.min(1, k * 3) : 0 }); }
function shakeXY(t, hits, amp = 12) { let dx = 0, dy = 0; for (const h of hits) { const k = P(t, h, h + 0.2); if (k > 0 && k < 1) { const a = (1 - k) * amp; dx += Math.sin(k * 40) * a; dy += Math.cos(k * 33) * a; } } return [dx, dy]; }
const brl = v => "R$ " + Math.round(v).toLocaleString("pt-BR");
const MARK = (hole, string) => `<g transform="rotate(-12 32 32)"><path d="M10 32 L24 16 H52 a4 4 0 0 1 4 4 V44 a4 4 0 0 1 -4 4 H24 Z" fill="#FF5B2E" stroke="#FF5B2E" stroke-width="4" stroke-linejoin="round"/><circle cx="23" cy="32" r="4.5" fill="${hole}"/></g><path d="M23 34 C 14 33, 7 27, 7 16" fill="none" stroke="${string}" stroke-width="3" stroke-linecap="round"/><path d="M55 1 l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8z" fill="#FFE07A"/>`;

// confete / moedas
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const COLORS = ["#FF5B2E", "#FFE07A", "#12A67A", "#FFFFFF", "#B9A6FF", "#22123A"];
const PCACHE = {};
function particles(b) { if (PCACHE[b.seed]) return PCACHE[b.seed]; const r = rng(b.seed * 9973); const ps = [];
  for (let i = 0; i < b.n; i++) { const a = r() * Math.PI * 2, sp = 450 + r() * 1200; ps.push({ vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 650, rot: r() * 6, vr: (r() - .5) * 18, w: 14 + r() * 18, h: 8 + r() * 12, c: COLORS[Math.floor(r() * COLORS.length)], drag: .9 + r() * .3 }); }
  return PCACHE[b.seed] = ps; }
let BURSTS = [];
function drawFx(ctx, t) { ctx.clearRect(0, 0, W, H);
  for (const b of BURSTS) { const dt = t - b.t; if (dt < 0 || dt > 2.6) continue; const al = 1 - P(dt, 1.8, 2.6);
    for (const p of particles(b)) { const k = (1 - Math.exp(-p.drag * 2.2 * dt)) / (p.drag * 2.2); const x = b.x + p.vx * k, y = b.y + p.vy * k + 540 * dt * dt;
      ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.rotate(p.rot + p.vr * dt);
      if (b.kind === "coins") { const s = 1 + p.w / 20; ctx.scale(Math.abs(Math.cos(p.rot + p.vr * dt * .6)) * .9 + .1, 1); ctx.fillStyle = "#F5C542"; ctx.beginPath(); ctx.arc(0, 0, 16 * s, 0, 7); ctx.fill(); ctx.strokeStyle = "#D99A1E"; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "#D99A1E"; ctx.font = `800 ${18 * s}px Bricolage`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("$", 0, 1); }
      else { ctx.scale(1, Math.cos(p.rot * 2 + dt * 9)); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      ctx.restore(); } } }

// cartão final comum a todos os vídeos (elementos com ids endA..endE)
function endCard(t, a) {
  const k = P(t, a, a + 0.5); set($("endLogo"), { s: lerp(0.2, 1, eb(k)), r: lerp(-30, 0, eo(k)) + (t > a + 0.5 ? Math.sin((t - a) * 3) * 4 : 0), o: k > 0 ? 1 : 0 });
  rise($("endWm"), t, a + 0.25, 0.35, 30); rise($("endTl"), t, a + 0.5, 0.3, 24);
  const kc = P(t, a + 0.8, a + 1.1); const pulse = t > a + 1.4 ? 1 + Math.sin((t - a) * 6) * 0.025 : 1; set($("endCta"), { s: lerp(0.5, 1, eb(kc)) * pulse, o: kc > 0 ? 1 : 0 });
  rise($("endFine"), t, a + 1.1, 0.3, 20);
}
const END_HTML = `<svg class="abs" id="endLogo" viewBox="0 0 64 64" style="left:430px;top:330px;width:220px;height:220px;transform-origin:35% 50%">${MARK("#22123A", "#F1ECFF")}</svg>
  <p class="abs center disp" id="endWm" style="top:580px;font-size:130px">presentinho</p>
  <p class="abs center" id="endTl" style="top:740px;font-size:46px;font-weight:600;opacity:.9">Lista de presentes em Pix, sem taxa</p>
  <div class="abs cta" id="endCta" style="top:850px">Crie a sua grátis</div>
  <p class="abs center" id="endFine" style="top:1010px;font-size:36px;font-weight:700;color:#FFE07A">presentinhopix.vercel.app</p>`;
