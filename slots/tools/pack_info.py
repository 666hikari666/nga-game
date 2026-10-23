"""Пакует info/info.json + info/img/*.jpg в 4 файла для публикации:
info/meta.json (тексты) и info/img0..2.json (сжатые картинки base64, грузятся по требованию)."""
import json, os, base64, io
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
info = json.load(open(os.path.join(ROOT, 'info', 'info.json'), encoding='utf8'))
meta, chunks = {}, [{}, {}, {}]
for n, (style, v) in enumerate(info.items()):
    c = n % 3
    imgs = []
    for im in v['imgs']:
        pic = Image.open(os.path.join(ROOT, im['src'])).convert('RGB')
        pic.thumbnail((420, 420))
        buf = io.BytesIO(); pic.save(buf, 'JPEG', quality=72)
        imgs.append({'src': 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode(), 'link': im['link']})
    chunks[c][style] = imgs
    meta[style] = {'text': v['text'], 'wiki': v['wiki'], 'chunk': c}
json.dump(meta, open(os.path.join(ROOT, 'info', 'meta.json'), 'w', encoding='utf8'), ensure_ascii=False)
for i, ch in enumerate(chunks):
    json.dump(ch, open(os.path.join(ROOT, 'info', f'img{i}.json'), 'w'))
