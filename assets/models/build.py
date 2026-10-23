"""Сборка 3D-моделей персов для игры из сырых .glb (Tripo и т.п.).

Что делает: раскрашивает модель по зонам, упрощает (склейка вершин в сетке),
распиливает на части с осями в суставах (голова, торс, руки, ноги — для анимации),
переднюю часть головы заменяет гладкой «маской» с UV под текстуры эмоций face3d_*.png.

Запуск: python build.py <персонаж> <исходный.glb> <выход без .glb>
Зоны и цвета каждого перса — в CONFIG ниже (координаты модели: высота 0..1, лицо смотрит в +z).
"""
import sys, os, json, struct, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from load import load, render

hx = lambda h: np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], np.float32)


def danya(x, y, z, ax):
    lab = np.full(len(x), 'top', object)
    lab[y < 0.36] = 'pants'; lab[y < 0.095] = 'shoe'; lab[y < 0.02] = 'sole'
    lab[(ax > 0.152) & (y > 0.27) & (y < 0.372)] = 'skin'                        # кисти
    lab[(y > 0.64) & (y < 0.70) & (ax < 0.06) & (z > -0.02)] = 'skin'             # шея
    head = y > 0.68
    face = head & (y < 0.835) & (ax < 0.105) & (z > 0.0)
    ears = head & (y > 0.72) & (y < 0.8) & (ax > 0.095) & (ax < 0.13) & (np.abs(z) < 0.06)
    lab[head] = 'hair'; lab[face | ears] = 'skin'
    lab[(y > 0.38) & (y < 0.66) & (np.abs(ax - 0.022) < 0.006) & (z > 0.07)] = 'zip'
    return lab


def yarik(x, y, z, ax):
    lab = np.full(len(x), 'top', object)
    lab[y < 0.34] = 'pants'; lab[y < 0.11] = 'shoe'; lab[y < 0.02] = 'sole'
    lab[(y > 0.43) & (y < 0.475) & (z > -0.11)] = 'band'                          # серебристая лента на футболке
    lab[(x > 0.15) & (y > 0.34) & (y < 0.47)] = 'skin'                            # правое предплечье (рукав до локтя)
    lab[(x > 0.19) & (y > 0.2) & (y <= 0.34)] = 'skin'                            # правая кисть (бедро у́же)
    lab[(x < -0.04) & (y > 0.33) & (y < 0.46) & (z > 0.05)] = 'skin'              # левая кисть со шлангом
    lab[(y > 0.6) & (y < 0.66) & (ax < 0.09)] = 'skin'                            # шея
    head = y > 0.63
    lab[head] = 'skin'
    lab[head & ((y > 0.85) | ((y > 0.78) & (z < 0.12)))] = 'hair'                 # верх и бока над ушами (виски выбриты)
    lab[head & (ax > 0.135) & (y < 0.87)] = 'phones'
    lab[head & (y > 0.84) & (ax > 0.1) & (np.abs(z - 0.04) < 0.05)] = 'phones'   # дужка
    lab[head & (ax > 0.238) & (y > 0.69) & (y < 0.81) & (np.abs(z - 0.04) < 0.035)] = 'glow'   # голубая полоска на чашках
    lab[(z < -0.11) & (y > 0.2)] = 'hookah'                                       # колба кальяна за спиной
    lab[(z < -0.11) & ((np.abs(y - 0.3) < 0.02) | (np.abs(y - 0.45) < 0.02))] = 'band'
    lab[(z < -0.11) & (y > 0.55)] = 'metal'                                       # шахта и чаша
    lab[(x < -0.19) & (y > 0.25) & (y < 0.6) & (z > -0.11)] = 'hose'              # петля шланга
    lab[(np.abs(x + 0.02) < 0.05) & (y > 0.44) & (y < 0.63) & (z > 0.17)] = 'metal'   # мундштук
    return lab


def edik(x, y, z, ax):
    lab = np.full(len(x), 'top', object)
    lab[y < 0.39] = 'pants'; lab[y < 0.08] = 'shoe'; lab[y < 0.015] = 'sole'
    lab[(x > 0.12) & (y > 0.25) & (y < 0.4)] = 'skin'                             # правая кисть
    lab[(x < -0.04) & (y > 0.52) & (y < 0.66) & (z > -0.08)] = 'skin'             # левая кисть с вейпом
    lab[(x < -0.04) & (y > 0.6) & (y < 0.68) & (z > -0.06)] = 'vape'
    lab[(y > 0.6) & (y < 0.7) & (ax < 0.13) & (z > -0.22)] = 'phones'             # наушники на шее
    head = y > 0.68
    lab[head] = 'hair'
    lab[head & (ax < 0.1) & (z > -0.16) & (y < 0.93)] = 'skin'                    # лицо
    lab[(y > 0.4) & (z < -0.2)] = 'hair'                                          # длинные волосы сзади
    lab[(y > 0.45) & (ax > 0.11) & (z < -0.1)] = 'hair'
    return lab


CONFIG = {
    'danya': dict(label=danya, zshift=0, skin='#e8ac7e', remove=None,
        colors=dict(hair='#5e3420', top='#2a2633', zip='#5a5a62', pants='#1c1a22', shoe='#8f8672', sole='#1a181e'),
        hip=0.355, neck=0.665, legx=0.06, arms={'L': (-0.15, 0.62), 'R': (0.15, 0.62)},
        armZ=lambda cx, cy, m: (np.abs(cx) > 0.122 - m) & (cy > 0.27 - m) & (cy < 0.645 + m),
        FB=(-0.112, 0.112, 0.668, 0.85), fringe=True),
    'yarik': dict(label=yarik, zshift=-0.05, skin='#e7ab7f', remove=None,
        colors=dict(hair='#6b3a22', top='#1e1c24', pants='#1c1a22', shoe='#1a181e', sole='#0d0c10', phones='#16161c',
                    glow='#2EE6FF', band='#9a9aa2', hookah='#2f6f9a', metal='#C9D3E0', hose='#2b2b30'),
        hip=0.34, neck=0.63, legx=0.07, arms={'R': (0.17, 0.58)},                   # левая рука держит шланг — неподвижна
        armZ=lambda cx, cy, m: (cx > 0.135 - m) & (cy > 0.18 - m) & (cy < 0.6 + m),
        FB=(-0.115, 0.115, 0.59, 0.88), fringe=False),
    'edik': dict(label=edik, zshift=0.15, skin='#e8ac7f',
        remove=lambda x, y, z: ((z > 0.02) & (y > 0.64)) | ((z > -0.045) & (y > 0.66) & (y < 0.765)),   # облако пара и его начало у рта
        colors=dict(hair='#4a2c1c', top='#1e1c24', pants='#2e3240', shoe='#1a181e', sole='#0d0c10', phones='#16161c', vape='#141414'),
        hip=0.39, neck=0.68, legx=0.06, arms={'R': (0.15, 0.62)},                    # левая рука с вейпом — неподвижна
        armZ=lambda cx, cy, m: (cx > 0.115 - m) & (cy > 0.22 - m) & (cy < 0.64 + m),
        FB=(-0.1, 0.1, 0.66, 0.905), fringe=False),
}

who, SRC, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
cfg = CONFIG[who]
V, N, F = load(SRC)
V[:, 2] += cfg['zshift']                          # центр тела на оси вращения
keep = np.ones(len(V), bool)
if cfg['remove'] is not None:
    keep = ~cfg['remove'](V[:, 0], V[:, 1], V[:, 2] - cfg['zshift'])
    F = F[keep[F].all(1)]
x, y, z = V[:, 0], V[:, 1], V[:, 2] - cfg['zshift']   # зоны заданы в координатах исходника
lab = cfg['label'](x, y, z, np.abs(x))
COL = {k: hx(v) for k, v in cfg['colors'].items()}; COL['skin'] = hx(cfg['skin'])  # кожа = фон листа эмоций
C = np.stack([COL[l] for l in lab]).astype(np.float32)
shade = (0.8 + 0.25 * np.clip(N[:, 1] * 0.5 + 0.5, 0, 1))   # лёгкая «запечённая» тень
shade[lab == 'skin'] = 1                                     # кожа ровная — как фон текстуры лица
C = np.clip(C * shade[:, None], 0, 255)
render(V, C.astype(np.uint8), OUT + '_front.png', 'front'); render(V, C.astype(np.uint8), OUT + '_side.png', 'side')

# упрощение: склейка вершин в сетке
G = 0.0085
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

# распил по центрам треугольников. Части перекрываются у суставов (OV),
# чтобы при сгибе руки/ноги не было дыр между частью и телом.
SC = 2.8                                         # высота модели в единицах рига старых персов
OV = 0.035
T = V2[F2]; cen = T.mean(1); cx, cy, cz = cen[:, 0], cen[:, 1], cen[:, 2] - cfg['zshift']
tn = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); tn /= np.linalg.norm(tn, axis=1, keepdims=True) + 1e-12
HIP, NECK, armZ = cfg['hip'], cfg['neck'], cfg['armZ']
anyArm = lambda m: np.zeros(len(cx), bool) | np.logical_or.reduce([armZ(cx, cy, m) & ((cx < 0) if k == 'L' else (cx > 0)) for k in cfg['arms']])
parts = {
    'head': cy > NECK - OV,
    'torso': (cy > HIP - OV) & (cy < NECK + OV) & ~anyArm(-OV),
    'legL': (cy < HIP + OV) & (cx < 0.01) & ~anyArm(0),
    'legR': (cy < HIP + OV) & (cx > -0.01) & ~anyArm(0),
}
for k in cfg['arms']:
    parts['arm' + k] = armZ(cx, cy, OV) & ((cx < 0) if k == 'L' else (cx > 0))

# Лицо: передние треугольники головы заменяем гладкой «маской» по форме лица — на неё ложится
# текстура эмоции. У Дани заодно убираем чёлку, висящую перед глазами (под ней у модели нет лба).
FB = cfg['FB']
face = (cy > FB[2]) & (cy < FB[3]) & (cx > FB[0]) & (cx < FB[1]) & (tn[:, 2] > 0.3)
parts['head'] &= ~face
if cfg['fringe']:
    fringe = (cy > 0.735) & (cy < FB[3]) & (cx > FB[0]) & (cx < FB[1]) & (cz > 0.176) & ~((np.abs(cx) < 0.025) & (cy < 0.785))
    parts['head'] &= ~fringe
GX, GY = 16, 16
gx = np.linspace(FB[0], FB[1], GX); gy = np.linspace(FB[2], FB[3], GY)
skinv = keep & (lab == 'skin') & (N[:, 2] > 0.2) & (y > FB[2] + 0.01) & (np.abs(x) < FB[1])   # только лицо — не кисть у подбородка
if cfg['fringe']: skinv &= z < 0.176
SV = np.stack([x, y, V[:, 2]], 1)[skinv]
depth = np.zeros((GY, GX))
for j, yy in enumerate(gy):
    for i, xx in enumerate(gx):
        near = SV[(np.abs(SV[:, 0] - xx) < 0.012) & (np.abs(SV[:, 1] - yy) < 0.012)]
        depth[j, i] = np.percentile(near[:, 2], 80) if len(near) else np.nan
for _ in range(40):                              # пустые клетки — по соседям
    m = np.isnan(depth)
    if not m.any(): break
    pad = np.pad(depth, 1, constant_values=np.nan)
    nb = np.stack([pad[:-2, 1:-1], pad[2:, 1:-1], pad[1:-1, :-2], pad[1:-1, 2:]])
    with np.errstate(all='ignore'): depth[m] = np.nanmean(nb, 0)[m]
depth = np.nan_to_num(depth, nan=np.nanmedian(SV[:, 2])) + 0.004
# края маски загибаем внутрь головы: бока и верх уходят под волосы, рамки не видно
uu = np.abs(np.linspace(-1, 1, GX))[None, :]; vv = np.linspace(0, 1, GY)[:, None]
depth -= 0.045 * np.maximum(np.clip((uu - 0.7) / 0.3, 0, 1) ** 2, np.clip((vv - 0.8) / 0.2, 0, 1) ** 2)

PIV = {'torso': (0, 0, 0), 'head': (0, NECK, 0), 'legL': (-cfg['legx'], HIP, 0), 'legR': (cfg['legx'], HIP, 0), 'face': (0, NECK, 0)}
for k, (ax_, ay_) in cfg['arms'].items(): PIV['arm' + k] = (ax_, ay_, 0)

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
        P = ((np.stack([XX.ravel(), YY.ravel(), depth.ravel()], 1) - np.array(pv)) * SC).astype('<f4')
        attrs = {'POSITION': add(P, 34962, 5126, 'VEC3', mm=True)}
        u = (XX.ravel() - FB[0]) / (FB[1] - FB[0]); v = (YY.ravel() - FB[2]) / (FB[3] - FB[2])
        attrs['TEXCOORD_0'] = add(np.stack([u, v], 1).astype('<f4'), 34962, 5126, 'VEC2')   # текстура в игре грузится с flipY
        q = [(j * GX + i, j * GX + i + 1, (j + 1) * GX + i + 1, (j + 1) * GX + i) for j in range(GY - 1) for i in range(GX - 1)]
        local = np.array([[a, b, c] for a, b, c, d in q] + [[a, c, d] for a, b, c, d in q]); f = local
    else:
        f = F2[parts[name]]
        used, local = np.unique(f, return_inverse=True)
        P = ((V2[used] - np.array(pv)) * SC).astype('<f4')
        attrs = {'POSITION': add(P, 34962, 5126, 'VEC3', mm=True)}
        Cc = np.clip(C2[used], 0, 255).astype(np.uint8)
        attrs['COLOR_0'] = add(np.concatenate([Cc, np.full((len(Cc), 1), 255, np.uint8)], 1), 34962, 5121, 'VEC4', norm=True)
    meshes.append({'name': name, 'primitives': [{'attributes': attrs,
        'indices': add(local.reshape(-1).astype('<u4'), 34963, 5125, 'SCALAR'), 'material': 0}]})
    nodes.append({'name': name, 'mesh': len(meshes) - 1, 'translation': [v * SC for v in pv]})
    print(name, len(f))
j = {'asset': {'version': '2.0', 'generator': 'nga build.py'}, 'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}],
     'nodes': nodes, 'meshes': meshes, 'accessors': accs, 'bufferViews': bviews, 'buffers': [{'byteLength': len(bin_)}],
     'materials': [{'name': who, 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0, 'roughnessFactor': 1}}]}
js = json.dumps(j).encode(); js += b' ' * (-len(js) % 4); bin_ += b'\0' * (-len(bin_) % 4)
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bytes(bin_)
open(OUT + '.glb', 'wb').write(glb); print('glb', len(glb) // 1024, 'KB')
