#!/usr/bin/env python3
"""Word timings for a narration whose script is known, without a speech recogniser.

Speech segments come from ffmpeg's silencedetect. The script is split at punctuation into
phrases, the phrases are grouped to fit the segments (dynamic programming on duration shares),
and each word gets time in proportion to its length inside its segment.

usage: align.py audio.mp3 "script text (audio tags in [brackets] are ignored)" out.json
"""
import json
import re
import subprocess
import sys


def segments(audio):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", audio, "-af", "silencedetect=noise=-35dB:d=0.18", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    h, mi, se = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()
    dur = int(h) * 3600 + int(mi) * 60 + float(se)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    segs, cur = [], 0.0
    for s, e in zip(starts, ends + [dur] * (len(starts) - len(ends))):
        if s - cur > 0.12:
            segs.append((cur, s))
        cur = e
    if dur - cur > 0.12:
        segs.append((cur, dur))
    return segs, dur


def main(audio, script, out):
    text = re.sub(r"\[[^\]]*\]", " ", script)
    text = re.sub(r"\s+", " ", text).strip()
    # phrase units end at punctuation
    units = [u.strip() for u in re.findall(r"[^,.?!…:]+[,.?!…:]*", text) if u.strip()]
    segs, _ = segments(audio)
    n, m = len(units), len(segs)
    lens = [len(u) for u in units]
    total_c, total_d = sum(lens), sum(e - s for s, e in segs)
    # dp[i][j]: best cost placing first i units into first j segments
    INF = float("inf")
    dp = [[INF] * (m + 1) for _ in range(n + 1)]
    back = [[0] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = 0.0
    for j in range(1, m + 1):
        d = (segs[j - 1][1] - segs[j - 1][0]) / total_d
        for i in range(1, n + 1):
            for k in range(j - 1, i):
                if dp[k][j - 1] == INF:
                    continue
                c = sum(lens[k:i]) / total_c
                cost = dp[k][j - 1] + (c - d) ** 2
                if cost < dp[i][j]:
                    dp[i][j], back[i][j] = cost, k
    if dp[n][m] == INF:   # more segments than phrases: merge segments greedily by dropping the shortest gaps
        raise SystemExit(f"cannot fit {n} phrases into {m} segments")
    groups, i = [], n
    for j in range(m, 0, -1):
        k = back[i][j]
        groups.append((units[k:i], segs[j - 1]))
        i = k
    groups.reverse()
    words = []
    for us, (s, e) in groups:
        ws = " ".join(us).split()
        weights = [len(w) + 2 for w in ws]
        t = s
        for w, wt in zip(ws, weights):
            d = (e - s) * wt / sum(weights)
            words.append({"w": w, "start": round(t, 3), "end": round(t + d, 3)})
            t += d
    json.dump({"words": words}, open(out, "w"), ensure_ascii=False, indent=1)
    print(f"{len(words)} words in {m} segments")


if __name__ == "__main__":
    main(*sys.argv[1:4])
