# Traza el logo (raster) a contornos vectoriales con marching squares + Douglas-Peucker.
import numpy as np, json, sys
src, W, H, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
x0 = int(sys.argv[5]) if len(sys.argv) > 5 else 0
x1 = int(sys.argv[6]) if len(sys.argv) > 6 else W
fondo_negro = len(sys.argv) > 7 and sys.argv[7] == 'negro'
modo = sys.argv[7] if len(sys.argv) > 7 else ''
canales = 4 if modo == 'alfa' else 3
img = np.fromfile(src, dtype=np.uint8).reshape(H, W, canales).astype(float)
img = img[:, x0:x1]
H, W = img.shape[:2]
if modo == 'alfa':
    f = img[:, :, 3] / 255.0
elif fondo_negro:
    f = img.max(axis=2) / 255.0          # cualquier cosa no negra
else:
    f = (255 - img[:, :, 2]) / 255.0     # rojo/naranja sobre blanco
f = np.pad(f, 1)
ISO = 0.5
import os
EPS = float(os.environ.get("EPS", "0.9"))
b = f > ISO
tl, tr, br, bl = b[:-1, :-1], b[:-1, 1:], b[1:, 1:], b[1:, :-1]
caso = tl * 1 + tr * 2 + br * 4 + bl * 8
ii, jj = np.nonzero((caso > 0) & (caso < 15))
def pt(e):
    k, i, j = e
    if k == 'h':
        a, c = f[i, j], f[i, j + 1]; t = (ISO - a) / (c - a)
        return (j + t - 1, i - 1)
    a, c = f[i, j], f[i + 1, j]; t = (ISO - a) / (c - a)
    return (j - 1, i + t - 1)
T = {1: [('L', 'T')], 2: [('T', 'R')], 3: [('L', 'R')], 4: [('R', 'B')], 6: [('T', 'B')], 7: [('L', 'B')],
     8: [('B', 'L')], 9: [('T', 'B')], 11: [('R', 'B')], 12: [('L', 'R')], 13: [('T', 'R')], 14: [('L', 'T')]}
vecinos = {}
def une(a, c):
    vecinos.setdefault(a, []).append(c); vecinos.setdefault(c, []).append(a)
for i, j in zip(ii, jj):
    c = caso[i, j]
    E = {'T': ('h', i, j), 'B': ('h', i + 1, j), 'L': ('v', i, j), 'R': ('v', i, j + 1)}
    if c in (5, 10):
        centro = (f[i, j] + f[i, j + 1] + f[i + 1, j] + f[i + 1, j + 1]) / 4 > ISO
        if (c == 5) == centro: pares = [('L', 'B'), ('T', 'R')] if c == 5 else [('L', 'T'), ('R', 'B')]
        else: pares = [('L', 'T'), ('R', 'B')] if c == 5 else [('L', 'B'), ('T', 'R')]
    else:
        pares = T[c]
    for a, d in pares: une(E[a], E[d])
lazos, visto = [], set()
for ini in vecinos:
    if ini in visto: continue
    lazo, prev, cur = [], None, ini
    while True:
        visto.add(cur); lazo.append(pt(cur))
        nx = [n for n in vecinos[cur] if n != prev]
        if not nx: break
        prev, cur = cur, nx[0]
        if cur == ini: break
    if len(lazo) > 20: lazos.append(lazo)
def dp(p, eps):
    p = np.asarray(p)
    if len(p) < 3: return p
    a, c = p[0], p[-1]; d = c - a; n = np.hypot(*d)
    dist = np.abs(d[0] * (p[:, 1] - a[1]) - d[1] * (p[:, 0] - a[0])) / n if n > 1e-9 else np.hypot(*(p - a).T)
    k = int(np.argmax(dist))
    if dist[k] > eps:
        return np.vstack([dp(p[:k + 1], eps)[:-1], dp(p[k:], eps)])
    return np.array([a, c])
def dp_cerrado(p, eps):
    p = np.asarray(p); k = int(np.argmax(np.hypot(*(p - p[0]).T)))
    r = np.vstack([dp(p[:k + 1], eps)[:-1], dp(np.vstack([p[k:], p[:1]]), eps)[:-1]])
    return r
def area(p):
    x, y = p[:, 0], p[:, 1]; return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)
def circulo(p):
    x, y = p[:, 0], p[:, 1]; A = np.c_[2 * x, 2 * y, np.ones(len(x))]
    s, *_ = np.linalg.lstsq(A, x * x + y * y, rcond=None)
    cx, cy = s[0], s[1]; r = np.sqrt(s[2] + cx * cx + cy * cy)
    return cx, cy, r, np.max(np.abs(np.hypot(x - cx, y - cy) - r))
res = []
for l in lazos:
    p = np.asarray(l); a = area(p)
    if abs(a) < 30: continue
    cx, cy, r, err = circulo(p)
    simp = dp_cerrado(p, EPS)
    res.append({'area': float(a), 'n': len(simp), 'circulo': [round(cx, 2), round(cy, 2), round(r, 2), round(err, 2)],
                'caja': [float(p[:, 0].min()), float(p[:, 1].min()), float(p[:, 0].max()), float(p[:, 1].max())],
                'pts': [[round(float(x), 2), round(float(y), 2)] for x, y in simp]})
res.sort(key=lambda r: -abs(r['area']))
json.dump({'W': W, 'H': H, 'lazos': res}, open(out, 'w'))
for r in res: print(round(r['area']), r['n'], r['circulo'], [round(v) for v in r['caja']])
