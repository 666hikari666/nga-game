"""Раскраска + упрощение + распил модели Дани на части для анимации."""
import sys, json, struct, numpy as np
sys.path.insert(0, sys.argv[1]); from load import load, render
V, N, F = load(sys.argv[2]); OUT = sys.argv[3]
x, y, z = V[:, 0], V[:, 1], V[:, 2]
hx = lambda h: np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], np.float32)
COL = dict(hair=hx('#5e3420'), skin=hx('#e9ac7f'), hood=hx('#2a2633'), zip=hx('#5a5a62'),
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
C *= (0.8 + 0.25 * np.clip(N[:, 1] * 0.5 + 0.5, 0, 1))[:, None]
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

# распил: часть по центру треугольника
SC = 2.8                                         # высота модели в единицах рига старых персов
cen = V2[F2].mean(1); cx, cy = cen[:, 0], cen[:, 1]
arm = (np.abs(cx) > 0.122) & (cy > 0.27) & (cy < 0.645)
part = np.full(len(F2), 'torso', object)
part[cy > 0.665] = 'head'
part[(cy < 0.355) & ~arm] = np.where(cx[(cy < 0.355) & ~arm] < 0, 'legL', 'legR')
part[arm] = np.where(cx[arm] < 0, 'armL', 'armR')
PIV = {'torso': (0, 0, 0), 'head': (0, 0.665, 0), 'legL': (-0.06, 0.355, 0), 'legR': (0.06, 0.355, 0),
       'armL': (-0.15, 0.62, 0), 'armR': (0.15, 0.62, 0)}

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
    f = F2[part == name]
    used, local = np.unique(f, return_inverse=True)
    P = ((V2[used] - np.array(pv)) * SC).astype('<f4')
    Cc = np.clip(C2[used], 0, 255).astype(np.uint8)
    Cc = np.concatenate([Cc, np.full((len(Cc), 1), 255, np.uint8)], 1)
    I = local.reshape(-1).astype('<u4')
    meshes.append({'name': name, 'primitives': [{'attributes': {
        'POSITION': add(P, 34962, 5126, 'VEC3', mm=True), 'COLOR_0': add(Cc, 34962, 5121, 'VEC4', norm=True)},
        'indices': add(I, 34963, 5125, 'SCALAR'), 'material': 0}]})
    nodes.append({'name': name, 'mesh': len(meshes) - 1, 'translation': [v * SC for v in pv]})
    print(name, len(f))
j = {'asset': {'version': '2.0', 'generator': 'nga build.py'}, 'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}],
     'nodes': nodes, 'meshes': meshes, 'accessors': accs, 'bufferViews': bviews, 'buffers': [{'byteLength': len(bin_)}],
     'materials': [{'name': 'danya', 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0, 'roughnessFactor': 1}}]}
js = json.dumps(j).encode(); js += b' ' * (-len(js) % 4); bin_ += b'\0' * (-len(bin_) % 4)
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bytes(bin_)
open(OUT + '.glb', 'wb').write(glb); print('glb', len(glb) // 1024, 'KB')
