"""Собирает описание (ru.wikipedia) и 3 картинки (Wikimedia Commons) для каждого стиля игры.
Запуск: python tools/build_info.py  -> info/info.json + info/img/*.jpg"""
import json, re, os, sys, time, urllib.request, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, 'nga-design-game.html'), encoding='utf8').read()
styles = [s.strip() for s in re.search(r'const DEFAULT_STYLES=`(.*?)`;', html, re.S)[1].split('\n') if s.strip()]
UA = {'User-Agent': 'NGADesignGame/1.0 (rogozin.graphics@gmail.com)'}
os.makedirs(os.path.join(ROOT, 'info', 'img'), exist_ok=True)

def get(url, params):
    for i in range(4):
        try:
            req = urllib.request.Request(url + '?' + urllib.parse.urlencode({**params, 'format': 'json'}), headers=UA)
            return json.load(urllib.request.urlopen(req, timeout=30))
        except Exception:
            time.sleep(2 + i * 3)
    return {}

def wiki(q):
    s = get('https://ru.wikipedia.org/w/api.php', {'action': 'query', 'list': 'search', 'srlimit': 1, 'srsearch': q})
    hits = s.get('query', {}).get('search', [])
    if not hits: return None
    t = hits[0]['title']
    p = get('https://ru.wikipedia.org/w/api.php', {'action': 'query', 'prop': 'extracts|langlinks', 'exintro': 1, 'explaintext': 1,
        'exsentences': 3, 'lllang': 'en', 'redirects': 1, 'titles': t})
    pg = next(iter(p.get('query', {}).get('pages', {}).values()), {})
    en = (pg.get('langlinks') or [{}])[0].get('*')
    return {'title': t, 'text': pg.get('extract', ''), 'en': en}

def commons(q):
    c = get('https://commons.wikimedia.org/w/api.php', {'action': 'query', 'generator': 'search', 'gsrnamespace': 6, 'gsrlimit': 15,
        'gsrsearch': q + ' filetype:bitmap', 'prop': 'imageinfo', 'iiprop': 'url|mime', 'iiurlwidth': 480})
    pages = sorted(c.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0))
    return [p['imageinfo'][0] for p in pages if p.get('imageinfo') and p['imageinfo'][0].get('mime') in ('image/jpeg', 'image/png')]

out_path = os.path.join(ROOT, 'info', 'info.json')
out = json.load(open(out_path, encoding='utf8')) if os.path.exists(out_path) else {}
for n, style in enumerate(styles):
    if style in out: continue
    short = style.split(' — ')[0]
    hint = style.split(' — ')[1] if ' — ' in style else ''
    w = wiki(short + ' стиль искусство') or wiki(short) or {}
    imgs = commons(w.get('en') or short)[:3] or commons(short)[:3]
    files = []
    for k, im in enumerate(imgs):
        fn = f'{n:03d}_{k}.jpg'
        try:
            data = urllib.request.urlopen(urllib.request.Request(im['thumburl'], headers=UA), timeout=30).read()
            open(os.path.join(ROOT, 'info', 'img', fn), 'wb').write(data)
            files.append({'src': 'info/img/' + fn, 'link': im['descriptionurl']})
        except Exception:
            pass
    out[style] = {'text': w.get('text') or hint, 'wiki': 'https://ru.wikipedia.org/wiki/' + urllib.parse.quote(w['title']) if w.get('title') else '', 'imgs': files}
    json.dump(out, open(out_path, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(n, short, len(files), flush=True)
    time.sleep(.3)
