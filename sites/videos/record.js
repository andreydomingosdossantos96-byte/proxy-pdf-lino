// Renders a 1080×1920 Reels video of one site: scripted scroll synced to the narration,
// a hook, word-by-word captions and an end card.
// usage: node record.js <slug> <audio.mp3> <words.json> <out.mp4>
// Needs public/<slug>/index.html built (python3 sites/build.py), Playwright and ffmpeg.
const { chromium } = require("playwright");
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const [slug, audio, wordsFile, outFile] = process.argv.slice(2);
const FPS = 30;
const LEAD = 0.3;          // silence before the first word
const TAIL = 1.5;          // hold after the last word
const HOOK_END = 2.8;

// Per-site direction. Scroll keys are [time, target]: a number is a fraction of the page,
// [selector, k] is k of the way through that section (0 = its top reaches the viewport top).
const SITES = {
  mirante: {
    accent: "#f3c58f", hook: ["Seu empreendimento", "merece um site *assim?*"],
    keys: [[0, 0], [6.2, 0], [13.9, 0.52], [15.6, ["#planta", 0.05]], [17.4, ["#planta", 0.6]], [18.8, 1]],
  },
  lenha: {
    accent: "#ff8a3a", hook: ["Seu restaurante", "merece um site *assim?*"],
    keys: [[0, 0], [5.0, 0], [7.2, ["#manifesto", 0.55]], [8.4, ["#menu", 0]], [12.6, ["#menu", 1]], [15.6, ["#heat", 0.9]], [17.6, ["#reserva", 0.2]]],
  },
  lumen: {
    accent: "#9fe0d2", hook: ["Sua clínica", "merece um site *assim?*"],
    keys: [[0, 0], [6.4, 0], [9.4, ["#cycle", 0]], [14.0, ["#cycle", 1]], [15.0, [".treat", 0.18]], [17.0, [".treat", 0.92]], [18.6, ["#agenda", 0]]],
  },
};
const site = SITES[slug];
const words = JSON.parse(fs.readFileSync(wordsFile, "utf8")).words.map(w => ({ ...w, start: w.start + LEAD, end: w.end + LEAD }));
const font = fs.readFileSync(path.join(__dirname, "..", "fonts", "figtree.woff2")).toString("base64");

const audioDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audio}"`).toString());
const total = LEAD + audioDur + TAIL;
const ctaIdx = words.findIndex(w => /^quer$/i.test(w.w));
const endStart = (ctaIdx >= 0 ? words[ctaIdx].start : total - 3.5) - 0.15;

// caption groups: up to 3 words, breaking after punctuation
const groups = [];
{ let cur = [];
  words.forEach((w, i) => {
    if (w.start >= endStart) return;
    cur.push(i);
    if (cur.length === 3 || /[,.?!…:]$/.test(w.w)) { groups.push(cur); cur = []; }
  });
  if (cur.length) groups.push(cur); }

const smooth = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5 });
  page.on("pageerror", e => console.error("pageerror", e.message));
  await page.goto("file://" + path.resolve(__dirname, "..", "..", "public", slug, "index.html") + "?rec");
  await page.waitForFunction(() => window.__rec);
  await page.evaluate(() => document.fonts.ready);

  // resolve scroll keys to pixels
  const keys = await page.evaluate(keys => {
    const max = __rec.max(), vh = innerHeight;
    return keys.map(([t, k]) => {
      if (typeof k === "number") return [t, k * max];
      const el = document.querySelector(k[0]);
      const top = el.getBoundingClientRect().top + scrollY;
      return [t, Math.min(max, Math.max(0, top + k[1] * Math.max(0, el.offsetHeight - vh)))];
    });
  }, site.keys);
  const yAt = t => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, y0] = keys[i], [t1, y1] = keys[i + 1];
      if (t <= t1) return y0 + (y1 - y0) * smooth((t - t0) / (t1 - t0));
    }
    return keys[keys.length - 1][1];
  };

  await page.evaluate(({ font, accent, hook }) => {
    const css = document.createElement("style");
    css.textContent = `
      @font-face { font-family: "RecUI"; font-weight: 300 700; src: url(data:font/woff2;base64,${font}) format("woff2"); }
      #ov { position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; font-family: "RecUI", system-ui, sans-serif; color: #fff; }
      #ov .shade { position: absolute; left: 0; right: 0; top: 52%; height: 30%; background: radial-gradient(70% 50% at 50% 50%, rgba(0,0,0,.42), rgba(0,0,0,0)); }
      #ov .hook { position: absolute; left: 6%; right: 6%; top: 12%; text-align: center; }
      #ov .hook .pill { display: inline-block; font: 700 11px/1 "RecUI"; letter-spacing: .16em; text-transform: uppercase; color: #111; background: ${accent};
        padding: 7px 11px; border-radius: 999px; margin-bottom: 12px; }
      #ov .hook .l { display: block; font: 700 39px/1.04 "RecUI"; letter-spacing: -.035em; text-shadow: 0 2px 0 rgba(0,0,0,.18), 0 8px 30px rgba(0,0,0,.6); }
      #ov .hook .w { display: inline-block; margin: 0 .12em; }
      #ov .hook .acc { color: ${accent}; }
      #ov .cap { position: absolute; left: 5%; right: 5%; top: 61%; text-align: center; }
      #ov .cap .w { display: inline-block; margin: 0 .08em; padding: .02em .16em .06em; border-radius: .16em;
        font: 700 37px/1.12 "RecUI"; letter-spacing: -.02em; text-transform: uppercase;
        text-shadow: 0 3px 0 rgba(0,0,0,.25), 0 6px 22px rgba(0,0,0,.65); }
      #ov .cap .w.on { background: ${accent}; color: #111; text-shadow: none; box-shadow: 0 8px 24px -6px rgba(0,0,0,.5); }
      #ov .end { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 26px;
        padding: 0 8%; text-align: center; background: rgba(8,8,8,.66); backdrop-filter: blur(16px) saturate(1.2); -webkit-backdrop-filter: blur(16px) saturate(1.2); }
      #ov .end h2 { margin: 0; font: 700 42px/1.02 "RecUI"; letter-spacing: -.04em; }
      #ov .end h2 em { font-style: normal; color: ${accent}; }
      #ov .end .btn { display: inline-flex; align-items: center; gap: 10px; font: 700 20px/1 "RecUI"; color: #111; background: ${accent};
        padding: 17px 26px; border-radius: 999px; box-shadow: 0 14px 40px -10px ${accent}; }
      #ov .end .btn svg { width: 20px; height: 20px; }
      #ov .end small { font: 500 12px/1.4 "RecUI"; color: rgba(255,255,255,.6); }
    `;
    document.head.appendChild(css);
    const ov = document.createElement("div");
    ov.id = "ov";
    const hookHtml = hook.map(line => `<span class="l">${line.split(" ").map(w => {
      const acc = /^\*.*\*$/.test(w); return `<span class="w${acc ? " acc" : ""}">${w.replace(/\*/g, "")}</span>`; }).join("")}</span>`).join("");
    ov.innerHTML = `<div class="shade"></div><div class="hook"><span class="pill">Site de exemplo</span>${hookHtml}</div><div class="cap"></div>
      <div class="end"><h2>Quer um site <em>assim</em> para a sua empresa?</h2>
      <span class="btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z"/></svg>Me chama no direct</span>
      <small>Site fictício, criado como demonstração.</small></div>`;
    document.body.appendChild(ov);
    const hw = Array.from(ov.querySelectorAll(".hook .w")), pill = ov.querySelector(".pill");
    const cap = ov.querySelector(".cap"), end = ov.querySelector(".end"), shade = ov.querySelector(".shade");
    const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    let lastKey = "";
    window.__ov = s => {
      // hook: the label, then the words rise in one after another, then all leave together
      pill.style.opacity = s.hookIn[0] * s.hookOut; pill.style.transform = `translateY(${(1 - s.hookIn[0]) * 10}px)`;
      hw.forEach((w, i) => { const k = s.hookIn[i + 1] ?? 1; w.style.opacity = k * s.hookOut; w.style.transform = `translateY(${(1 - k) * 22 + (1 - s.hookOut) * -16}px) scale(${.92 + .08 * k})`; });
      // captions: the spoken word sits on an accent chip
      const key = s.cap.map(w => w.t).join("|");
      if (key !== lastKey) { lastKey = key; cap.innerHTML = s.cap.map(w => `<span class="w">${w.t}</span>`).join(" "); }
      Array.from(cap.children).forEach((el, i) => {
        const w = s.cap[i]; el.classList.toggle("on", w.on);
        el.style.transform = w.on ? `rotate(-2deg) scale(${1 + .12 * w.pop})` : "none";
      });
      cap.style.opacity = s.capA; cap.style.transform = `translateY(${(1 - s.capA) * 14}px)`;
      shade.style.opacity = s.cap.length ? s.capA : 0;
      end.style.opacity = s.end; end.style.display = s.end > 0 ? "flex" : "none";
      end.children[0].style.transform = `translateY(${(1 - s.end) * 20}px)`;
      end.children[1].style.transform = `scale(${.9 + .1 * sm(s.end2)})`;
    };
  }, { font, accent: site.accent, hook: site.hook });

  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y",
    "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-i", audio,
    "-filter_complex", `[1:a]adelay=${LEAD * 1000}|${LEAD * 1000},apad,loudnorm=I=-14:TP=-1.5:LRA=9[a]`,
    "-map", "0:v", "-map", "[a]", "-shortest",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", outFile], { stdio: ["pipe", "inherit", "inherit"] });

  const hookCount = site.hook.join(" ").split(" ").length;
  const frames = Math.ceil(total * FPS);
  const started = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = i / FPS;
    const hookIn = [smooth((t - 0.1) / 0.25)];
    for (let k = 0; k < hookCount; k++) hookIn.push(smooth((t - 0.2 - k * 0.09) / 0.28));
    let g = groups.find(gr => t >= words[gr[0]].start - 0.04 && t < words[gr[gr.length - 1]].end + 0.25);
    if (!g) { // hold the previous group through short gaps
      const prev = groups.filter(gr => words[gr[gr.length - 1]].end <= t).pop();
      const next = groups.find(gr => words[gr[0]].start > t);
      if (prev && next && words[next[0]].start - words[prev[prev.length - 1]].end < 0.7) g = prev;
    }
    const cap = (g && t < endStart) ? g.map(idx => ({ t: words[idx].w, on: t >= words[idx].start && t < words[idx].end + 0.02, pop: 1 - smooth((t - words[idx].start) / 0.14) })) : [];
    const state = {
      hookIn, hookOut: 1 - smooth((t - (HOOK_END - 0.3)) / 0.3),
      cap, capA: cap.length && t > HOOK_END - 0.2 ? smooth((t - words[g[0]].start + 0.04) / 0.1) : 0,
      end: smooth((t - endStart) / 0.4), end2: (t - endStart - 0.25) / 0.35,
    };
    await page.evaluate(([t, y, s]) => { __rec.frame(t, y); __ov(s); }, [t, yAt(t), state]);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (i % 60 === 0) process.stdout.write(`\r${slug} ${i}/${frames} (${((Date.now() - started) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();
  console.log(`\r${slug} done: ${outFile} (${total.toFixed(1)} s)`);
})();
