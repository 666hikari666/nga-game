"""Раскраска + упрощение + распил модели Дани на части для анимации."""
import sys, json, struct, numpy as np
sys.path.insert(0, sys.argv[1]); from load import load, render
V, N, F = load(sys.argv[2]); OUT = sys.argv[3]
x, y, z = V[:, 0], V[:, 1], V[:, 2]
hx = lambda h: np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], np.float32)
COL = dict(hair=hx('#5e3420'), skin=hx('#e8ac7e'), hood=hx('#2a2633'), zip=hx('#5a5a62'),
           pants=hx('#1c1a22'), shoe=hx('#8f8672'), sole=hx('#1a181e'))
lab = np.full(len(V), 'hood', object)
lab[y < 0.36] = 'pants'
lab[y < 0.095] = 'shoe'; lab[y < 0.02] = 'sole'
hand = (np.abs(x) > 0.152) & (y > 0.27) & (y < 0.372)
lab[hand] = 'skin'
neck = (y > 0.64) & (y < 0.70) & (np.abs(x) < 0.06) & (z > -0.02)
lab[neck] = 'skin'
head = y > 0.68
face = head & (y < 0.835) & (np.abs(x) < 0.105) & (z > 0.0)
ears = head & (y > 0.72) & (y < 0.8) & (np.abs(x) > 0.095) & (np.abs(x) < 0.13) & (z > -0.06) & (z < 0.06)
lab[head] = 'hair'; lab[face | ears] = 'skin'
zipm = (y > 0.38) & (y < 0.66) & (np.abs(np.abs(x) - 0.022) < 0.006) & (z > 0.07)
lab[zipm] = 'zip'
C = np.stack([COL[l] for l in lab]).astype(np.float32)
# лёгкая «запечённая» тень: снизу темнее, сверху светлее
shade = (0.8 + 0.25 * np.clip(N[:, 1] * 0.5 + 0.5, 0, 1))
shade[lab == 'skin'] = 1      # кожа без тени — ровно как фон текстуры лица
C *= shade[:, None]
C = np.clip(C, 0, 255)
render(V, C.astype(np.uint8), OUT + '_front.png', 'front'); render(V, C.astype(np.uint8), OUT + '_side.png', 'side')

# упрощение: склейка вершин в сетке
G = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0085
q = np.floor(V / G).astype(np.int64)
key = (q[:, 0] + 1000) * 4000000 + (q[:, 1] + 1000) * 2000 + (q[:, 2] + 1000)
uk, inv = np.unique(key, return_inverse=True)
cnt = np.bincount(inv)
V2 = np.stack([np.bincount(inv, V[:, k]) for k in range(3)], 1) / cnt[:, None]
C2 = np.stack([np.bincount(inv, C[:, k]) for k in range(3)], 1) / cnt[:, None]
F2 = inv[F]
F2 = F2[(F2[:, 0] != F2[:, 1]) & (F2[:, 1] != F2[:, 2]) & (F2[:, 0] != F2[:, 2])]
s = np.sort(F2, 1); _, ui = np.unique(s[:, 0] * 10**12 + s[:, 1] * 10**6 + s[:, 2], return_index=True); F2 = F2[np.sort(ui)]
print('verts', len(V2), 'tris', len(F2))

# распил: часть по центру треугольника. Части перекрываются у суставов (OV),
# чтобы при сгибе руки/ноги не было дыр между частью и телом.
SC = 2.8                                         # высота модели в единицах рига старых персов
OV = 0.035
T = V2[F2]; cen = T.mean(1); cx, cy = cen[:, 0], cen[:, 1]
tn = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); tn /= np.linalg.norm(tn, axis=1, keepdims=True) + 1e-12
ax = np.abs(cx)
armZ = lambda m: (ax > 0.122 - m) & (cy > 0.27 - m) & (cy < 0.645 + m)
parts = {
  'head':  cy > 0.665 - OV,
  'torso': (cy > 0.355 - OV) & (cy < 0.665 + OV) & ~((ax > 0.122 + OV) & (cy < 0.645 - OV)),
  'legL':  (cy < 0.355 + OV) & (cx < 0.01) & ~armZ(0),
  'legR':  (cy < 0.355 + OV) & (cx > -0.01) & ~armZ(0),
  'armL':  armZ(OV) & (cx < 0),
  'armR':  armZ(OV) & (cx > 0),
}
# лицо: передние треугольники головы — отдельная часть с текстурой эмоций
FB = (-0.112, 0.112, 0.668, 0.85)
face = (cy > FB[2]) & (cy < FB[3]) & (cx > FB[0]) & (cx < FB[1]) & (tn[:, 2] > 0.3)
cz = cen[:, 2]
# Чёлка модели висит перед лицом, а под ней нет лба. Поэтому всё лицо (вместе с чёлкой над глазами)
# заменяем гладкой «маской»: сетка по форме лица модели, на неё ложится текстура эмоций.
fringe = (cy > 0.735) & (cy < FB[3]) & (cx > FB[0]) & (cx < FB[1]) & (cz > 0.176) & ~((np.abs(cx) < 0.025) & (cy < 0.785))
parts['head'] &= ~face & ~fringe
GX, GY = 16, 16
gx = np.linspace(FB[0], FB[1], GX); gy = np.linspace(FB[2], FB[3], GY)
skinv = (lab == 'skin') & (V[:, 2] < 0.176) & (V[:, 1] > FB[2] - 0.02)
SV = V[skinv]
depth = np.zeros((GY, GX))
for j, yy in enumerate(gy):
    for i, xx in enumerate(gx):
        near = SV[(np.abs(SV[:, 0] - xx) < 0.012) & (np.abs(SV[:, 1] - yy) < 0.012)]
        depth[j, i] = np.percentile(near[:, 2], 80) if len(near) else np.nan
# пустые клетки (лоб под чёлкой) — по ближайшим снизу/сбоку
for _ in range(40):
    m = np.isnan(depth)
    if not m.any(): break
    pad = np.pad(depth, 1, constant_values=np.nan)
    nb = np.stack([pad[:-2, 1:-1], pad[2:, 1:-1], pad[1:-1, :-2], pad[1:-1, 2:]])
    depth[m] = np.nanmean(nb, 0)[m]
depth = np.nan_to_num(depth, nan=0.15) + 0.004    # чуть вперёд, чтобы не утонуть в голове
# края маски загибаем внутрь головы: бока и верх уходят под волосы, рамки не видно
uu = np.abs(np.linspace(-1, 1, GX))[None, :]; vv = np.linspace(0, 1, GY)[:, None]
side = np.clip((uu - 0.7) / 0.3, 0, 1) ** 2
top = np.clip((vv - 0.8) / 0.2, 0, 1) ** 2
depth -= 0.045 * np.maximum(side, top)
PIV = {'torso': (0, 0, 0), 'head': (0, 0.665, 0), 'legL': (-0.06, 0.355, 0), 'legR': (0.06, 0.355, 0),
       'armL': (-0.15, 0.62, 0), 'armR': (0.15, 0.62, 0), 'face': (0, 0.665, 0)}

bin_ = bytearray(); bviews = []; accs = []; meshes = []; nodes = []
def add(arr, target, ctype, typ, norm=False, mm=False):
    while len(bin_) % 4: bin_.append(0)
    off = len(bin_); bin_.extend(arr.tobytes())
    bviews.append({'buffer': 0, 'byteOffset': off, 'byteLength': arr.nbytes, 'target': target})
    a = {'bufferView': len(bviews) - 1, 'componentType': ctype, 'count': len(arr), 'type': typ}
    if norm: a['normalized'] = True
    if mm: a['min'] = arr.min(0).tolist(); a['max'] = arr.max(0).tolist()
    accs.append(a); return len(accs) - 1
for name, pv in PIV.items():
    if name == 'face':                           # маска лица: сетка GX×GY, UV — по рамке лица
        XX, YY = np.meshgrid(gx, gy)
        Vg = np.stack([XX.ravel(), YY.ravel(), depth.ravel()], 1)
        P = ((Vg - np.array(pv)) * SC).astype('<f4')
        attrs = {'POSITION': add(P, 34962, 5126, 'VEC3', mm=True)}
        u = (XX.ravel() - FB[0]) / (FB[1] - FB[0]); v = (YY.ravel() - FB[2]) / (FB[3] - FB[2])
        attrs['TEXCOORD_0'] = add(np.stack([u, v], 1).astype('<f4'), 34962, 5126, 'VEC2')   # текстура в игре грузится с flipY
        q = [(j * GX + i, j * GX + i + 1, (j + 1) * GX + i + 1, (j + 1) * GX + i) for j in range(GY - 1) for i in range(GX - 1)]
        local = np.array([[a, b, c] for a, b, c, d in q] + [[a, c, d] for a, b, c, d in q])
        f = local
    else:
        f = F2[parts[name]]
        used, local = np.unique(f, return_inverse=True)
        P = ((V2[used] - np.array(pv)) * SC).astype('<f4')
        attrs = {'POSITION': add(P, 34962, 5126, 'VEC3', mm=True)}
    if name != 'face':
        Cc = np.clip(C2[used], 0, 255).astype(np.uint8)
        attrs['COLOR_0'] = add(np.concatenate([Cc, np.full((len(Cc), 1), 255, np.uint8)], 1), 34962, 5121, 'VEC4', norm=True)
    meshes.append({'name': name, 'primitives': [{'attributes': attrs,
        'indices': add(local.reshape(-1).astype('<u4'), 34963, 5125, 'SCALAR'), 'material': 0}]})
    nodes.append({'name': name, 'mesh': len(meshes) - 1, 'translation': [v * SC for v in pv]})
    print(name, len(f))
j = {'asset': {'version': '2.0', 'generator': 'nga build.py'}, 'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}],
     'nodes': nodes, 'meshes': meshes, 'accessors': accs, 'bufferViews': bviews, 'buffers': [{'byteLength': len(bin_)}],
     'materials': [{'name': 'danya', 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0, 'roughnessFactor': 1}}]}
js = json.dumps(j).encode(); js += b' ' * (-len(js) % 4); bin_ += b'\0' * (-len(bin_) % 4)
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bytes(bin_)
open(OUT + '.glb', 'wb').write(glb); print('glb', len(glb) // 1024, 'KB')
