// Renders a 1080×1920 Reels video of one site: scripted scroll, hook, captions and end card.
// usage: node record.js <slug> <timing-dir> <out.mp4>
// Needs public/<slug>/index.html built (python3 sites/build.py), Playwright and ffmpeg.
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const [slug, timingDir, outFile] = process.argv.slice(2);
const FPS = 30;
const LEAD = 0.4;          // silence before the first word
const TAIL = 1.4;          // hold after the last word
const HOOK_END = 2.7;

const ACCENT = { mirante: "#f3c58f", lenha: "#f2913f", lumen: "#7fd1c4" };
const HOOK_TOP = { lenha: "47%" };   // keep the hook off each hero's own title
const timing = JSON.parse(fs.readFileSync(path.join(timingDir, `${slug}.timing.json`), "utf8"));
const wav = path.join(timingDir, `${slug}.wav`);
const font = fs.readFileSync(path.join(__dirname, "..", "fonts", "figtree.woff2")).toString("base64");

const total = LEAD + timing.duration + TAIL;
const last = timing.sentences[timing.sentences.length - 1];
const endStart = LEAD + last.start - 0.15;

// caption chunks: at most 5 words, broken after punctuation, timed by character share
const captions = [];
for (const s of timing.sentences) {
  const words = s.text.split(/\s+/);
  const groups = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 5 || /[,.?!]$/.test(w) && cur.length >= 2) { groups.push(cur.join(" ")); cur = []; }
  }
  if (cur.length) groups.push(cur.join(" "));
  const chars = groups.reduce((a, g) => a + g.length, 0);
  let t = LEAD + s.start;
  const span = s.end - s.start;
  for (const g of groups) { const d = span * g.length / chars; captions.push({ text: g, start: t, end: t + d }); t += d; }
}

const smooth = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5 });
  page.on("pageerror", e => console.error("pageerror", e.message));
  await page.goto("file://" + path.resolve(__dirname, "..", "..", "public", slug, "index.html") + "?rec");
  await page.waitForFunction(() => window.__rec);
  await page.evaluate(() => document.fonts.ready);

  // scroll stops: the top of every section, clamped to the scrollable range
  const { stops, max } = await page.evaluate(() => {
    const max = __rec.max();
    const ys = Array.from(document.querySelectorAll("main section")).map(s => Math.min(max, Math.max(0, s.getBoundingClientRect().top + scrollY)));
    return { stops: Array.from(new Set([0, ...ys, max].map(Math.round))).sort((a, b) => a - b), max };
  });
  const scrollStart = HOOK_END - 0.4, scrollEnd = endStart - 0.2;
  const seg = (scrollEnd - scrollStart) / (stops.length - 1);
  const yAt = t => {
    if (t <= scrollStart) return 0;
    if (t >= scrollEnd) return max;
    const k = (t - scrollStart) / seg, i = Math.floor(k), f = k - i;
    const move = smooth(f / 0.72);            // move for 72% of each segment, rest on the stop
    return stops[i] + (stops[i + 1] - stops[i]) * move;
  };

  await page.evaluate(({ font, accent, hook, top }) => {
    const css = document.createElement("style");
    css.textContent = `
      @font-face { font-family: "RecUI"; font-weight: 300 700; src: url(data:font/woff2;base64,${font}) format("woff2"); }
      #ov { position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; font-family: "RecUI", system-ui, sans-serif; }
      #ov .hook { position: absolute; left: 7%; right: 7%; top: ${top}; text-align: center; }
      #ov .hook span { display: inline; font: 700 31px/1.32 "RecUI"; color: #fff; background: #111; padding: 4px 12px;
        -webkit-box-decoration-break: clone; box-decoration-break: clone; border-radius: 10px; letter-spacing: -.01em; }
      #ov .cap { position: absolute; left: 8%; right: 8%; top: 64%; text-align: center; }
      #ov .cap span { display: inline; font: 700 21px/1.42 "RecUI"; color: #fff; background: rgba(17,17,17,.82); padding: 5px 12px;
        -webkit-box-decoration-break: clone; box-decoration-break: clone; border-radius: 8px; }
      #ov .end { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 22px;
        padding: 0 9%; text-align: center; background: rgba(10,10,10,.62); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
      #ov .end h2 { margin: 0; font: 700 34px/1.12 "RecUI"; color: #fff; letter-spacing: -.02em; }
      #ov .end b { font: 700 19px/1 "RecUI"; color: #111; background: ${accent}; padding: 15px 24px; border-radius: 999px; }
      #ov .end small { font: 500 12px/1.4 "RecUI"; color: rgba(255,255,255,.7); }
    `;
    document.head.appendChild(css);
    const ov = document.createElement("div");
    ov.id = "ov";
    ov.innerHTML = `<div class="hook"><span></span></div><div class="cap"><span></span></div>
      <div class="end"><h2>Quer um site assim para a sua empresa?</h2><b>Chama no direct</b><small>Site fictício, criado como demonstração.</small></div>`;
    ov.querySelector(".hook span").textContent = hook;
    document.body.appendChild(ov);
    window.__ov = (s) => {
      const h = ov.querySelector(".hook"), c = ov.querySelector(".cap"), e = ov.querySelector(".end");
      h.style.opacity = s.hook; h.style.transform = `translateY(${(1 - s.hook) * -14}px) scale(${0.96 + 0.04 * s.hook})`;
      const cs = c.querySelector("span");
      if (cs.textContent !== s.cap) cs.textContent = s.cap;
      c.style.opacity = s.cap ? s.capA : 0; c.style.transform = `translateY(${(1 - s.capA) * 8}px)`;
      e.style.opacity = s.end; e.style.transform = `scale(${1.03 - 0.03 * s.end})`;
      e.style.display = s.end > 0 ? "flex" : "none";
    };
  }, { font, accent: ACCENT[slug] || "#fff", hook: timing.hook, top: HOOK_TOP[slug] || "15%" });

  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y",
    "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-i", wav,
    "-filter_complex", `[1:a]adelay=${LEAD * 1000}|${LEAD * 1000},apad,loudnorm=I=-14:TP=-1.5:LRA=7[a]`,
    "-map", "0:v", "-map", "[a]", "-shortest",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", outFile], { stdio: ["pipe", "inherit", "inherit"] });

  const frames = Math.ceil(total * FPS);
  for (let i = 0; i < frames; i++) {
    const t = i / FPS;
    const y = yAt(t);
    const cap = captions.find(c => t >= c.start && t < c.end + 0.12 && c.start < endStart);
    const state = {
      hook: smooth((t - 0.15) / 0.35) * (1 - smooth((t - (HOOK_END - 0.35)) / 0.35)),
      cap: cap ? cap.text : "",
      capA: cap ? smooth((t - cap.start) / 0.12) : 0,
      end: smooth((t - endStart) / 0.45),
    };
    await page.evaluate(([t, y, s]) => { __rec.frame(t, y); __ov(s); }, [t, y, state]);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (i % 60 === 0) process.stdout.write(`\r${slug} ${i}/${frames}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();
  console.log(`\r${slug} done: ${outFile} (${total.toFixed(1)} s)`);
})();
