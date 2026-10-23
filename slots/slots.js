// Мини-игра «NGA Design Game» (слот-машина стилей) внутри подвала.
// Собрано из D:/Design game/nga-design-game.html. Живёт в shadow DOM, чтобы стили не трогали игру.
// openSlots() показывает автомат поверх подвала, ESC или кнопка ✕ закрывают.
const CSS = "\n:root{--gold:#ffcc33;--red:#e8334a;--text:#f3eefc;--mute:#9a90b5}\n*{box-sizing:border-box}\n\n:host{all:initial;display:block;color:var(--text);font-family:\"Arial Black\",Impact,system-ui,sans-serif}\n\n/* ---------- room / camera ---------- */\n.room{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;\n  background:linear-gradient(#05030899,#050308cc 70%,#050308),url(slots/assets/bg.jpg) center/cover fixed;\n  perspective:1100px;padding:2vh 16px 0;overflow:hidden;position:relative}\n.room:before{content:\"\";position:absolute;inset:0;background:repeating-linear-gradient(90deg,#ffffff05 0 2px,transparent 2px 80px);pointer-events:none}\n.cabinet{position:relative;width:min(1000px,100%);transform:rotateX(9deg) translateY(-10px);transform-origin:50% 100%;\n  transform-style:preserve-3d;animation:breathe 6s ease-in-out infinite}\n@keyframes breathe{50%{transform:rotateX(9deg) translateY(-4px) rotateZ(.25deg)}}\n\n/* marquee */\n.marquee{margin:0 auto;width:86%;background:linear-gradient(#5b0f1e,#2a0610);border:6px solid #c9a227;border-bottom:none;border-radius:40px 40px 0 0;padding:18px 20px 14px;text-align:center;position:relative;box-shadow:0 -10px 60px #ff2a5a55}\n.marquee .logo{display:block;margin:0 auto;width:min(420px,70%);filter:drop-shadow(0 0 6px #fff) drop-shadow(0 0 18px #ff3df0) drop-shadow(0 0 40px #b000ff)}\n.marquee h1{margin:0;font-size:clamp(30px,7vw,72px);letter-spacing:4px;color:#fff3c4;\n  text-shadow:0 0 6px #fff,0 0 18px var(--gold),0 0 40px #ff7a00,0 4px 0 #8a4b00;animation:flick 3s infinite}\n@keyframes flick{0%,92%,100%{opacity:1}93%{opacity:.5}95%{opacity:1}96%{opacity:.7}}\n.bulbs{display:flex;justify-content:space-between;margin-top:8px}\n.bulbs i{width:12px;height:12px;border-radius:50%;background:#ffde7a;box-shadow:0 0 10px #ffcc33;animation:bulb 1s infinite}\n.bulbs i:nth-child(even){animation-delay:.5s}\n@keyframes bulb{50%{background:#5a3a00;box-shadow:none}}\n.spinning .bulbs i{animation-duration:.2s}\n\n/* body */\n.front{background:\n   linear-gradient(90deg,#1a0a12,#4a1424 12%,#6b1b30 50%,#4a1424 88%,#1a0a12);\n  border:6px solid #c9a227;border-radius:18px;padding:28px 5% 24px;position:relative;\n  box-shadow:inset 0 0 60px #000a,0 30px 80px #000}\n.sub{font:700 14px/1.2 system-ui;color:#ffd99a;text-align:center;letter-spacing:3px;margin-bottom:14px;text-transform:uppercase}\n.glass{background:#0b0508;border-radius:14px;padding:16px;border:4px solid #000;\n  box-shadow:inset 0 0 0 3px #c9a22755,inset 0 0 40px #000,0 0 0 6px #2a0a14}\n.reels{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}\n.reel{flex:1 1 200px;max-width:300px;min-width:150px}\n.name{width:100%;background:#000;border:1px solid #c9a22766;color:#ffde7a;text-align:center;font:700 14px system-ui;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;padding:6px;border-radius:6px}\n.window{height:150px;overflow:hidden;border-radius:10px;position:relative;background:#f4ead2}\n.window:after{content:\"\";position:absolute;inset:0;pointer-events:none;\n  background:linear-gradient(#000c,transparent 30%,transparent 70%,#000c),linear-gradient(100deg,transparent 40%,#ffffff40 48%,transparent 56%)}\n.window:before{content:\"\";position:absolute;left:0;right:0;top:50%;height:2px;background:#e8334a88;z-index:2}\n.strip{position:absolute;left:0;right:0;top:0}\n.cell{height:150px;display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;color:#1a0a12;font-size:clamp(18px,2.4vw,26px);line-height:1.05;text-transform:uppercase;border-bottom:3px solid #0002}\n.reel.win .window{animation:glow .5s 4}\n@keyframes glow{50%{box-shadow:0 0 0 4px var(--gold),0 0 40px var(--gold)}}\n\n/* lever */\n.lever{position:absolute;right:-70px;top:30px;width:60px;height:300px;cursor:pointer;user-select:none}\n.lever .mount{position:absolute;left:0;bottom:30px;width:40px;height:90px;background:linear-gradient(90deg,#666,#ddd,#555);border-radius:10px;box-shadow:0 6px 20px #000}\n.lever .rod{position:absolute;left:16px;bottom:80px;width:10px;height:200px;background:linear-gradient(90deg,#888,#fff,#777);border-radius:5px;transform-origin:50% 100%;transition:transform .3s cubic-bezier(.3,1.6,.5,1)}\n.lever .ball{position:absolute;left:-17px;top:-38px;width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 6%,#ff7b8c 18%,#c0102a 70%,#5a0010);box-shadow:0 6px 16px #000a}\n.lever.pulled .rod{transform:rotateX(180deg) scaleY(.55);transition-duration:.15s}\n\n/* control deck */\n.deck{margin:18px auto 0;width:104%;margin-left:-2%;background:linear-gradient(#3a0d1a,#1a050b);border:5px solid #c9a227;border-radius:12px;padding:16px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;transform:rotateX(-30deg) translateZ(1px);position:relative;z-index:10;transform-origin:top;box-shadow:0 20px 40px #000}\nbutton{font:700 13px system-ui;letter-spacing:1px;text-transform:uppercase;color:#fff;border:none;border-radius:10px;padding:12px 16px;cursor:pointer;\n  background:linear-gradient(#5a5a6e,#2b2b38);box-shadow:0 5px 0 #111,0 0 0 2px #000;transition:transform .05s}\nbutton:active{transform:translateY(4px);box-shadow:0 1px 0 #111,0 0 0 2px #000}\nbutton.big{background:radial-gradient(circle at 40% 30%,#ff7b8c,#c0102a);box-shadow:0 5px 0 #5a0010,0 0 20px #e8334a88;padding:14px 26px;font-size:16px}\nbutton.amber{background:linear-gradient(#ffb030,#b86a00);box-shadow:0 5px 0 #5a3300}\n.tray{width:60%;height:40px;margin:0 auto;background:linear-gradient(#111,#2a2a2a);border-radius:0 0 30px 30px;border:4px solid #c9a227;border-top:none;box-shadow:inset 0 10px 20px #000}\n\n.timer{font:700 54px \"Courier New\",monospace;text-align:center;color:#ff3b3b;text-shadow:0 0 12px #f00;margin-top:12px;background:#000;border-radius:8px;padding:4px}\n.tctl{display:flex;gap:10px;justify-content:center;margin-top:10px;position:relative;z-index:10}\n[hidden]{display:none!important}\n.history{font:13px system-ui;color:#ffd99a;text-align:center;margin-top:10px;max-height:90px;overflow:auto}\n.online{font:700 12px system-ui;letter-spacing:2px;color:#888;margin-top:6px}.online.on{color:#4dff88;text-shadow:0 0 8px #4dff88}\n.armed{background:#e8334a!important}\n.toast{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);background:#e8334a;color:#fff;padding:12px 18px;border-radius:10px;z-index:200;font:600 14px system-ui}\n.journal{width:min(900px,100%);margin:30px auto 0;font-family:system-ui;position:relative;z-index:5}\n.journal h2{color:var(--gold);letter-spacing:2px}\n.journal h3{color:#ffd99a;border-bottom:1px solid #c9a22755;padding-bottom:4px;margin:22px 0 10px}\n.muted{color:var(--mute);font-weight:400}\n.entry{background:#120a12;border:1px solid #c9a22733;border-radius:12px;padding:12px 14px;margin-bottom:10px}\n.etitle{font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:8px}\n.tdel{margin-left:auto;padding:4px 10px;font-size:11px;box-shadow:none;background:#3a0d1a}\n.erow{padding:6px 0;border-top:1px dashed #ffffff14}\n.thumbs{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}\n.tw{position:relative}\n.tw img{height:110px;border-radius:6px;display:block;border:2px solid #c9a22755}\n.del{position:absolute;top:2px;right:2px;padding:2px 7px;font-size:12px;box-shadow:none;background:#000a}\n.up{display:inline-block;font-size:12px;color:#ffde7a;border:1px dashed #c9a22788;border-radius:8px;padding:5px 10px;cursor:pointer}\n.lb{position:fixed;inset:0;background:#000d;z-index:50;display:flex;align-items:center;justify-content:center;cursor:zoom-out}\n.ibtn{width:100%;margin-top:8px;font-size:11px;padding:8px}\n.sinfo{color:#ffde7a}\n.icard{background:#140a12;border:3px solid var(--gold);border-radius:16px;padding:20px 24px;width:min(760px,94vw);max-height:90vh;overflow:auto;font-family:system-ui;position:relative;cursor:auto}\n.icard h2{color:var(--gold);margin:0 30px 10px 0}\n.icard p{line-height:1.5}\n.iclose{position:absolute;top:10px;right:10px;padding:4px 10px}\n.iimgs{display:flex;gap:10px;flex-wrap:wrap}\n.iimgs img{height:180px;max-width:100%;object-fit:cover;border-radius:8px;border:2px solid #c9a22755}\n.ilinks{display:flex;gap:14px;flex-wrap:wrap;margin-top:14px}\n.ilinks a{color:#ffde7a}\n.lb img{max-width:94vw;max-height:94vh}\ndetails{margin:20px auto 40px;width:min(720px,100%);background:#120a12;border:1px solid #c9a22755;border-radius:12px;padding:12px 16px;font-family:system-ui;position:relative;z-index:5}\nsummary{cursor:pointer;font-weight:600}\ntextarea{width:100%;height:240px;margin-top:10px;background:#000;color:var(--text);border:1px solid #333;border-radius:8px;padding:10px;font:14px/1.5 monospace}\n\n/* ---------- VHS overlay ---------- */\n.vhs{position:fixed;inset:0;pointer-events:none;z-index:100}\n#noise{position:absolute;inset:0;width:100%;height:100%;opacity:.12;mix-blend-mode:screen}\n.scan{position:absolute;inset:0;background:repeating-linear-gradient(#0000 0 2px,#0006 2px 3px)}\n.vign{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,#000c 100%)}\n.track{position:absolute;left:0;right:0;height:60px;background:linear-gradient(transparent,#ffffff22 40%,#fff3 50%,#ffffff22 60%,transparent);filter:blur(2px);animation:track 7s linear infinite}\n@keyframes track{0%{top:-80px}100%{top:110%}}\n.osd{position:absolute;font:24px \"VCR OSD Mono\",\"Courier New\",monospace;color:#fff;text-shadow:2px 0 #f0f8,-2px 0 #0ff8;letter-spacing:2px}\n.rec{top:22px;left:28px}.rec b{color:#ff2a2a;animation:blink 1s steps(1) infinite}\n@keyframes blink{50%{opacity:0}}\n.play{top:22px;right:28px}\n.stamp{bottom:24px;left:28px}\n.sp{bottom:24px;right:28px}\n.room{filter:saturate(1.25) contrast(1.08);animation:jitter .25s steps(2) infinite}\n@keyframes jitter{0%{transform:translateX(0)}50%{transform:translateX(.6px)}}\n.cabinet *{text-shadow:1.5px 0 #ff004c66,-1.5px 0 #00e5ff66}\n:host(.glitch) .room{animation:glitch .3s steps(3) 1}\n@keyframes glitch{0%{transform:translateX(-8px) skewX(4deg);filter:hue-rotate(40deg)}50%{transform:translateX(6px)}100%{transform:none}}\n\n@media(max-width:760px){.lever{position:relative;right:auto;top:auto;margin:10px auto 0;height:160px;transform:rotate(90deg)}.cabinet{transform:none;animation:none}.deck{transform:none}.osd{font-size:15px}}\n.closeX{position:fixed;top:70px;right:24px;z-index:300;font:700 20px system-ui;padding:8px 14px}";
const HTML = "<button class=\"closeX\" id=\"closeX\">\u2715 ESC</button>\n<div class=\"room\" id=\"room\">\n <div class=\"cabinet\" id=\"cab\">\n  <div class=\"marquee\">\n    <h1><img class=\"logo\" src=\"slots/assets/nga-logo.png\" alt=\"NGA\"></h1><div class=\"online\" id=\"online\">\u25cf \u043e\u0444\u043b\u0430\u0439\u043d</div>\n    <div class=\"bulbs\"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>\n  </div>\n  <div class=\"front\">\n    <div class=\"sub\">\u2605 \u0414\u0451\u0440\u043d\u0438 \u0440\u044b\u0447\u0430\u0433 \u2014 \u043f\u043e\u043b\u0443\u0447\u0438 \u0441\u0442\u0438\u043b\u044c \u0430\u0444\u0438\u0448\u0438 \u2605</div>\n    <div class=\"glass\"><div class=\"reels\" id=\"reels\"></div></div>\n    <div class=\"lever\" id=\"lever\" title=\"\u0414\u0451\u0440\u043d\u0443\u0442\u044c (\u043f\u0440\u043e\u0431\u0435\u043b)\"><div class=\"mount\"></div><div class=\"rod\"><div class=\"ball\"></div></div></div>\n    <div class=\"timer\" id=\"timer\" hidden></div>\n    <div class=\"tctl\"><button id=\"pauseBtn\" hidden>\u23f8 \u041f\u0430\u0443\u0437\u0430</button><button id=\"stopBtn\" hidden>\u23f9 \u0421\u0442\u043e\u043f</button></div>\n    <div class=\"history\" id=\"history\"></div>\n    <div class=\"deck\">\n      <button id=\"add\">+ \u0418\u0433\u0440\u043e\u043a</button>\n      <button id=\"remove\">\u2212 \u0418\u0433\u0440\u043e\u043a</button>\n      <button class=\"big\" id=\"spin\">Spin</button>\n      <button id=\"same\">\u041e\u0434\u0438\u043d \u0441\u0442\u0438\u043b\u044c: <b id=\"sameLbl\">\u0432\u044b\u043a\u043b</b></button>\n      <button class=\"amber\" data-min=\"15\">\u23f1 15</button>\n      <button class=\"amber\" data-min=\"30\">\u23f1 30</button>\n      <button class=\"amber\" data-min=\"45\">\u23f1 45</button>\n      <button class=\"amber\" data-min=\"60\">\u23f1 60</button>\n    </div>\n  </div>\n  <div class=\"tray\"></div>\n </div>\n <section class=\"journal\">\n  <h2>\ud83d\udcfc \u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0438 \u0440\u0430\u0431\u043e\u0442\u044b</h2>\n  <div id=\"hist\"></div>\n </section>\n <details>\n  <summary>\u0411\u0430\u0437\u0430 \u0441\u0442\u0438\u043b\u0435\u0439 (\u043f\u043e \u043e\u0434\u043d\u043e\u043c\u0443 \u043d\u0430 \u0441\u0442\u0440\u043e\u043a\u0443)</summary>\n  <textarea id=\"styles\"></textarea>\n  <button id=\"save\" style=\"margin-top:8px\">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button>\n </details>\n</div>\n\n<div class=\"lb\" id=\"info\" hidden onclick=\"if(event.target===this)this.hidden=true\">\n  <div class=\"icard\"><button class=\"iclose\" onclick=\"this.closest('.lb').hidden=true\">\u00d7</button>\n    <h2 id=\"infoTitle\"></h2><p id=\"infoText\"></p><div class=\"iimgs\" id=\"infoImgs\"></div><div class=\"ilinks\" id=\"infoLinks\"></div></div>\n</div>\n<div class=\"lb\" id=\"lb\" hidden onclick=\"this.hidden=true\"><img id=\"lbimg\"></div>\n<div class=\"vhs\">\n  <canvas id=\"noise\" width=\"320\" height=\"180\"></canvas>\n  <div class=\"track\"></div>\n  <div class=\"scan\"></div>\n  <div class=\"vign\"></div>\n  <div class=\"osd rec\"><b>\u25cf</b> REC</div>\n  <div class=\"osd play\">PLAY \u25b6</div>\n  <div class=\"osd stamp\" id=\"stamp\"></div>\n  <div class=\"osd sp\">SP</div>\n</div>\n\n";
let host = null, root = null, keyHandler = null, onClose = null;
export function slotsOpen() { return !!host && !host.hidden; }
export function closeSlots() {
  if (!slotsOpen()) return;
  host.style.opacity = 0;                                        // плавно гаснет обратно в подвал
  setTimeout(() => { host.hidden = true; onClose?.(); }, 450);
}
function fadeIn() { host.style.opacity = 0; requestAnimationFrame(() => requestAnimationFrame(() => host.style.opacity = 1)); }
export function openSlots(opts = {}) {
  onClose = opts.onClose;
  if (host) { host.hidden = false; fadeIn(); return; }
  host = document.createElement('div');
  host.style.cssText = 'position:fixed;inset:0;z-index:50;overflow-y:auto;overflow-x:hidden;background:#050308;transition:opacity .45s';
  document.body.appendChild(host);
  root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${CSS}</style>${HTML}`;
  root.getElementById('closeX').onclick = closeSlots;
  run(); fadeIn();
  addEventListener('keydown', e => {
    if (!slotsOpen()) return;
    if (e.code === 'Escape') { e.stopImmediatePropagation(); closeSlots(); return; }
    keyHandler?.(e);
  }, true);
}
function run() {

const DEFAULT_STYLES=`Первобытная эстетика — пещеры, наскальные рисунки, охра
Древний Египет
Месопотамия — Вавилон, зиккураты, клинопись
Античность
Древний Рим
Византия — золото, мозаики, сакральность
Цивилизация майя
Средневековье
Готика — соборы, витражи, каменные узоры
Средневековые рукописи — миниатюры, пергамент, фантастические существа
Рыцарство и геральдика
Кельтская эстетика
Эстетика викингов
Возрождение / Ренессанс
Барокко
Рококо
Викторианская эстетика
Украинская народная эстетика
Славянская мифология
Скандинавская мифология
Древнегреческая мифология
Японский фольклор — ёкаи, духи, легенды
Мексиканское народное искусство
День мёртвых — Día de Muertos
Марокканская эстетика
Индийская дворцовая эстетика
Китайская императорская эстетика
Японское укиё-э
Ваби-саби — несовершенство, старение, природные материалы
Японский дзен-минимализм
Средиземноморская эстетика
Романтизм
Импрессионизм
Экспрессионизм
Кубизм
Футуризм
Супрематизм
Конструктивизм
Дадаизм
Сюрреализм
Абстрактный экспрессионизм
Оп-арт — оптические иллюзии
Поп-арт
Психоделика
Наивное искусство
Ар-нуво / модерн
Ар-деко
Баухаус
Швейцарский международный стиль
Модернизм середины XX века — Mid-century Modern
Космический стиль 1960-х — Space Age
Мемфис
Брутализм
Необрутализм
Минимализм
Максимализм
Винтажный цирк
Немое кино
Голливудский гламур золотой эпохи
Нуар
Пульп — дешёвые приключенческие журналы и яркие обложки
Пин-ап
Американские дайнеры 1950-х
Старинный ботанический атлас
Советский агитплакат
Американская рекламная эстетика 1950-х
Советская космическая романтика
Хиппи
Груви-эстетика 1970-х
Диско 1970-х
Вестерн
Ретро-киноафиши Болливуда
Ретро-комиксы
Американский придорожный мир — мотели, заправки, вывески
Ретро-Лас-Вегас — казино, лампы, шоу
Майами 1980-х — пастель, пальмы, неон
Видеосалон 1980–1990-х — кассеты, боевики, рисованные обложки
Ретро-аркады — игровые автоматы, пиксели, неон
Панк-графика — вырезки, ксерокс, протест
Гранж
Готическая мрачная эстетика
Уличная хип-хоп-эстетика
Граффити
Стрит-арт
Скейт-графика — журналы, стикеры, рисунки, потёртости
Сёрф-эстетика — океан, солнце, волны, пляжная графика
Рейв-графика 1990-х
Андеграундные зины — самиздат, коллажи, грубая печать
Y2K — технологический оптимизм рубежа тысячелетий
Cybercore — цифровые тела, хром, провода, киберпространство
Поп-гламур 2000-х / McBling
Frutiger Aero — стекло, вода, зелень, глянцевые технологии
Frutiger Metro — яркая векторная городская графика
Ранний интернет — GeoCities, GIF, пёстрые домашние страницы
Ретрокомпьютеры — CRT, терминалы, дискеты
8-битная игровая эстетика
16-битная игровая эстетика
Раннее 3D — низкополигональный мир первых PlayStation
Glitch Art — цифровые сбои и разрушенные изображения
Acid Graphics — кислотная экспериментальная графика
Хромовый футуризм
Ретрофутуризм
Synthwave / Retrowave — неоновая ретроэстетика 1980-х
Vaporwave — античные бюсты, ранний интернет, розово-бирюзовая ностальгия
Mallsoft — пустые торговые центры и потребительская ностальгия
Киберпанк
Стимпанк
Дизельпанк
Атомпанк
Кассетный футуризм
Соларпанк
Биопанк
Афрофутуризм
Космическая опера
Утопическое будущее
Антиутопия
Постапокалипсис
Подводная цивилизация
Тёмное фэнтези
Героическое фэнтези — меч и магия
Сказочное фэнтези
Готический хоррор
Космический / лавкрафтовский хоррор
Фолк-хоррор — деревни, обряды, древние поверья
Лиминальные пространства
Dreamcore — сновидения, странная ностальгия, нелогичные миры
Weirdcore — тревожный абсурд и искажённая повседневность
Dark Academia — тёмные библиотеки, старые университеты, классическое искусство
Light Academia — светлые библиотеки, рукописи, тёплая академическая романтика
Cottagecore — идеализированная сельская жизнь
Goblincore — мох, грибы, корни, природные находки
Fairycore — феи, цветы, прозрачность, волшебная природа
Морская романтика — паруса, маяки, карты, океан
Пиратская эстетика
Постсоветская панельная тоска
Постсоветский базар 1990-х
Заброшенная индустрия
Заброшенный парк аттракционов
Затерянные руины в джунглях
Полярная экспедиция — лёд, станции, карты, изоляция
Оккультная эстетика — символы, ритуалы, тайные знания
Небесная эстетика — звёзды, созвездия, старинные карты неба
Подводный мир — рифы, глубина, биолюминесценция
Ботаническая эстетика — растения, гербарии, оранжереи
Тропическая эстетика
Ночной мегаполис — вывески, дождь, отражения
Природа после человека — заросшие города и возвращение дикой среды`;
const LS=k=>{try{return localStorage.getItem(k)}catch{return null}};
const SS=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
let styles=(LS('ss_styles4')||DEFAULT_STYLES).split('\n').map(s=>s.trim()).filter(Boolean);
let players=JSON.parse(LS('ss_players')||'["Игрок 1","Игрок 2"]');
let sameForAll=false,spinning=false;
const H=150,colors=['#f4ead2','#e8f4ff','#ffe8ee','#eaffe8','#f0e8ff','#fff1dc'];
const $=id=>root.getElementById(id);
$('styles').value=styles.join('\n');

function render(){
  $('reels').innerHTML='';
  players.forEach((p,i)=>{
    const r=document.createElement('div');r.className='reel';
    r.innerHTML=`<input class="name" value="${p.replace(/"/g,'&quot;')}"><div class="window"><div class="strip"><div class="cell" style="background:${colors[i%6]}">★ ? ★</div></div></div><button class="ibtn" hidden>ⓘ Что это за стиль?</button>`;
    r.querySelector('input').oninput=e=>{players[i]=e.target.value;SS('ss_players',JSON.stringify(players))};
    $('reels').appendChild(r);
  });
}
render();

// --- sound ---
let ac;
function tone(f,d,type='square',v=.06,t=0){ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,ac.currentTime+t);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+t+d);o.connect(g).connect(ac.destination);o.start(ac.currentTime+t);o.stop(ac.currentTime+t+d)}
const ding=()=>[880,1175,1568].forEach((f,i)=>tone(f,.4,'triangle',.12,i*.09));
const glitch=()=>{host.classList.remove('glitch');void host.offsetWidth;host.classList.add('glitch')};

const rnd=a=>a[Math.floor(Math.random()*a.length)];
const short=s=>s.split(' — ')[0];
// не повторять стили из последних 10 круток
const pick=(exclude=[])=>{const recent=new Set(hist.slice(0,10).flatMap(e=>e.results.map(r=>r.style)).concat(exclude));const pool=styles.filter(s=>!recent.has(s));return rnd(pool.length?pool:styles)};

// confirm()/alert() заблокированы на claude.ai — подтверждаем вторым нажатием
function armed(btn,label,fn){if(btn.dataset.armed){fn();return}const old=btn.textContent;btn.dataset.armed=1;btn.textContent=label;btn.classList.add('armed');setTimeout(()=>{delete btn.dataset.armed;btn.textContent=old;btn.classList.remove('armed')},3000)}
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;root.appendChild(t);setTimeout(()=>t.remove(),4000)}
// --- хранилище: общая база (claude.ai) или IndexedDB (локально) ---
let hist=[],sdb=null,sassets=null,sroom=null;
const idb=new Promise(res=>{try{const r=indexedDB.open('styleslots',1);r.onupgradeneeded=()=>r.result.createObjectStore('h',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>res(null)}catch{res(null)}});
const putEntry=e=>sdb?sdb.collection('tries').doc(String(e.id)).set(e).catch(err=>toast('Не сохранилось: '+err.message)):idb.then(d=>d&&d.transaction('h','readwrite').objectStore('h').put(e));
const delEntry=e=>sdb?sdb.collection('tries').doc(String(e.id)).delete().catch(err=>toast('Не удалилось: '+err.message)):idb.then(d=>d&&d.transaction('h','readwrite').objectStore('h').delete(e.id));
const dayKey=t=>new Date(t).toLocaleDateString('ru-RU');
async function storeImage(blob){
  if(sdb){if(!sassets)throw new Error('нет прав на загрузку файлов');return (await sassets.upload(blob)).url}
  return await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(blob)});
}
(async()=>{
  const c=window.claude;
  if(c?.use){[sdb,sassets,sroom]=await Promise.all([c.use('db'),c.use('assets'),c.use('room')])}
  if(sroom){
    // живая синхронизация: крутка друга проигрывается у тебя в тот же момент
    sroom.on('live',m=>{if(!m.isMe)applyLive(m.data)});
    const showPeers=()=>{const n=sroom.peers().length;$('online').dataset.peers=n>1?` · в игре: ${n}`:''; $('online').textContent=$('online').textContent.split(' · в игре')[0]+$('online').dataset.peers};
    sroom.onPeers(showPeers);
  }
  if(sdb){
    $('online').textContent='● онлайн — общая игра';$('online').classList.add('on');
    liveDoc().onSnapshot(s=>{if(s.exists)applyLive(s.data())});
    await pullLive();loadedOnce=true;
    setInterval(pullLive,2000); // страховка, если живые обновления не доходят
    setInterval(()=>sdb.collection('tries').get().then(s=>{const n=s.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id);if(n.map(x=>x.id+':'+(x.results||[]).map(r=>(r.images||[]).length)).join()!==hist.map(x=>x.id+':'+(x.results||[]).map(r=>(r.images||[]).length)).join()){hist=n;renderHist()}}).catch(()=>{}),5000);
    sdb.collection('tries').onSnapshot(s=>{hist=s.docs.map(d=>d.data()).sort((a,b)=>b.id-a.id);renderHist();
      const top=hist[0];if(!top||top.id===lastShownId)return;
      if(!loadedOnce)showStatic(top);
      loadedOnce=true;});
    setTimeout(()=>loadedOnce=true,3000);
    sdb.doc('config/styles').onSnapshot(s=>{const l=s.exists&&s.data().list;if(Array.isArray(l)&&l.length){styles=l;$('styles').value=l.join('\n')}});
  }else{
    idb.then(d=>{if(!d)return renderHist();const q=d.transaction('h').objectStore('h').getAll();q.onsuccess=()=>{hist=q.result.sort((a,b)=>b.id-a.id);renderHist()}});
  }
})();
function shrink(file){return new Promise(res=>{const img=new Image();img.onload=()=>{const k=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=img.width*k;c.height=img.height*k;c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);c.toBlob(res,'image/jpeg',.85)};img.src=URL.createObjectURL(file)})}
function renderHist(){
  const days=[...new Set(hist.map(e=>dayKey(e.id)))].reverse();
  const box=$('hist');box.innerHTML=hist.length?'':'<p class="muted">Пока пусто — дёрни рычаг.</p>';
  let curDay=null;
  hist.forEach(e=>{
    const dk=dayKey(e.id);
    if(dk!==curDay){curDay=dk;const h=document.createElement('h3');h.textContent=`День ${days.indexOf(dk)+1} · ${dk}`;box.appendChild(h)}
    const tryN=hist.filter(x=>dayKey(x.id)===dk&&x.id<=e.id).length;
    const card=document.createElement('div');card.className='entry';
    card.innerHTML=`<div class="etitle">Трай ${tryN} <span class="muted">${new Date(e.id).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</span><button class="tdel">🗑 Удалить трай</button></div>`;
    card.querySelector('.tdel').onclick=ev=>armed(ev.currentTarget,'Точно удалить?',()=>{hist=hist.filter(x=>x!==e);delEntry(e);renderHist()});
    e.results.forEach((r,ri)=>{
      const row=document.createElement('div');row.className='erow';
      row.innerHTML=`<b>${r.player}</b> — <a href="#" class="sinfo">${r.style} ⓘ</a><div class="thumbs"></div><label class="up">+ работа<input type="file" accept="image/*" multiple hidden></label>`;
      row.querySelector('.sinfo').onclick=ev=>{ev.preventDefault();showInfo(r.style)};
      const th=row.querySelector('.thumbs');
      (r.images||[]).forEach((src,ii)=>{const a=document.createElement('a');a.href='#';a.innerHTML=`<img src="${src}">`;a.onclick=ev=>{ev.preventDefault();$('lbimg').src=src;$('lb').hidden=false};
        const x=document.createElement('button');x.textContent='×';x.className='del';x.onclick=()=>armed(x,'Точно?',()=>{r.images.splice(ii,1);putEntry(e);renderHist()});
        const w=document.createElement('span');w.className='tw';w.append(a,x);th.appendChild(w)});
      row.querySelector('input').onchange=async ev=>{const lbl=ev.target.parentNode;lbl.firstChild.textContent='загружаю…';try{for(const f of ev.target.files){(r.images=r.images||[]).push(await storeImage(await shrink(f)))}putEntry(e)}catch(err){toast('Не загрузилось: '+err.message)}renderHist()};
      card.appendChild(row);
    });
    box.appendChild(card);
  });
}

let lastShownId=null,loadedOnce=false,pendingSpin=null;
function usePlayers(e){const ps=e.results.map(r=>r.player);if(ps.join('|')!==players.join('|')){players=ps;render()}}
function showStatic(e){
  lastShownId=e.id;usePlayers(e);
  root.querySelectorAll('.reel').forEach((reel,i)=>{const r=e.results[i];if(!r)return;
    reel.querySelector('.strip').innerHTML=`<div class="cell" style="background:${colors[i%6]}">${short(r.style)}</div>`;
    const b=reel.querySelector('.ibtn');b.hidden=false;b.onclick=()=>showInfo(r.style)});
}
// preset — крутка, пришедшая от другого игрока
function spin(preset){
  if(preset instanceof Event)preset=null;
  if(spinning||!styles.length)return;spinning=true;
  if(preset){lastShownId=preset.id;usePlayers(preset)}
  $('cab').classList.add('spinning');glitch();
  $('lever').classList.add('pulled');setTimeout(()=>$('lever').classList.remove('pulled'),450);
  tone(120,.15,'sawtooth',.1);
  const common=pick(),results=[],strips=[];
  const reels=[...root.querySelectorAll('.reel')];
  let done=0;
  reels.forEach((reel,i)=>{
    reel.classList.remove('win');
    const res=preset?preset.results[i].style:sameForAll?common:pick(results);
    results.push(res);
    const n=25+i*8,strip=reel.querySelector('.strip'),c=colors[i%6];
    const fill=preset?.strips?.[i]||Array.from({length:n-1},()=>rnd(styles));strips.push(fill);
    let html='';for(let k=0;k<n;k++)html+=`<div class="cell" style="background:${c}">${short(k===n-1?res:fill[k]||rnd(styles))}</div>`;
    strip.innerHTML=html;strip.style.transition='none';strip.style.transform='translateY(0)';
    strip.offsetHeight;
    const dur=2+i*.6;
    strip.style.transition=`transform ${dur}s cubic-bezier(.15,.7,.2,1)`;
    strip.style.transform=`translateY(${-(n-1)*H}px)`;
    let last=0;const t0=performance.now();
    (function tick(){const y=-new DOMMatrix(getComputedStyle(strip).transform).m42;const idx=Math.floor(y/H);if(idx!==last){last=idx;tone(600+i*80,.03,'square',.03)}if(performance.now()-t0<dur*1000)requestAnimationFrame(tick)})();
    setTimeout(()=>{reel.classList.add('win');tone(300,.12,'square',.08);if(++done===reels.length){ding();glitch();spinning=false;$('cab').classList.remove('spinning');if(pendingSpin){const d=pendingSpin;pendingSpin=null;setTimeout(()=>spin(d),300)}logHistory(results,!preset)}},dur*1000);
  });
  if(!preset){const e={id:Date.now(),results:players.map((p,i)=>({player:p,style:results[i],images:[]}))};lastShownId=e.id;setLive({spin:{...e,strips,at:Date.now()}});hist.unshift(e);putEntry(e)}
}
// --- карточка стиля: описание из Википедии + примеры с Wikimedia Commons ---
// описания и картинки собраны заранее (tools/build_info.py): внешний интернет со страницы недоступен
let infoData=null;const imgChunks={};
const infoP=fetch('slots/info/meta.json').then(r=>r.json()).then(d=>infoData=d).catch(()=>infoData={});
const chunk=i=>imgChunks[i]||(imgChunks[i]=fetch(`slots/info/img${i}.json`).then(r=>r.json()).catch(()=>({})));
async function fetchInfo(style){
  await infoP;const d=infoData[style]||{};
  const imgs=d.chunk!=null?((await chunk(d.chunk))[style]||[]):[];
  return {text:d.text||(style.split(' — ')[1]||''),url:d.wiki||'',imgs:imgs.map(i=>({thumburl:i.src,descriptionurl:i.link}))};
}
async function showInfo(style){
  const m=$('info');m.hidden=false;
  $('infoTitle').textContent=style;$('infoText').textContent='Загружаю…';$('infoImgs').innerHTML='';
  const q=encodeURIComponent(short(style)+' стиль дизайн');
  $('infoLinks').innerHTML=`<a target="_blank" href="https://www.pinterest.com/search/pins/?q=${q}">Pinterest</a><a target="_blank" href="https://www.google.com/search?tbm=isch&q=${q}">Google Картинки</a><a target="_blank" href="https://www.behance.net/search/projects?search=${q}">Behance</a>`;
  const d=await fetchInfo(style);
  if($('infoTitle').textContent!==style)return;
  $('infoText').textContent=d.text||'Описание не найдено.';
  if(d.url)$('infoLinks').insertAdjacentHTML('afterbegin',`<a target="_blank" href="${d.url}">Википедия</a>`);
  $('infoImgs').innerHTML=d.imgs.length?d.imgs.map(i=>`<a target="_blank" href="${i.descriptionurl}"><img src="${i.thumburl}"></a>`).join(''):'<p class="muted">Картинок не нашлось — загляни в ссылки ниже.</p>';
}
let lastResults=[];
function logHistory(r,mine){
  lastResults=r;root.querySelectorAll('.reel .ibtn').forEach((b,i)=>{b.hidden=false;b.onclick=()=>showInfo(r[i])});
  const line=players.map((p,i)=>`${p}: ${r[i]}`).join(' · ');const d=document.createElement('div');d.textContent=line;$('history').prepend(d);
  renderHist();
}

// ===== общий пульт: одно состояние state/live на всех, кто открыл страницу =====
// live = {players, same, timer:{endsAt|null,left,paused}|null, spin:{id,results,strips,at}}
let live={players,same:false,timer:null,spin:null},liveRev=0;
const liveDoc=()=>sdb&&sdb.doc('state/live');
function setLive(patch){
  live={...live,...patch,rev:Date.now()};liveRev=live.rev;applyLive(live,true);
  sroom?.emit('live',live).catch(()=>{});
  liveDoc()?.set(live).catch(err=>toast('Нет прав менять игру: '+err.message));
}
function applyLive(d,mine){
  if(!d||(!mine&&d.rev&&d.rev<liveRev))return;liveRev=d.rev||liveRev;live={...live,...d};
  if(Array.isArray(d.players)&&d.players.join('|')!==players.join('|')&&!(root.activeElement?.classList.contains('name'))){players=d.players;if(!spinning)render()}
  sameForAll=!!d.same;$('sameLbl').textContent=sameForAll?'вкл':'выкл';
  renderTimer();
  const s=d.spin;
  if(!mine&&s&&s.id!==lastShownId&&Array.isArray(s.results)){
    if(loadedOnce&&Date.now()-s.at<15000){if(spinning)pendingSpin=s;else spin(s)}else showStatic(s);
  }
}
async function pullLive(){try{const s=await liveDoc().get();if(s.exists)applyLive(s.data())}catch{}}

$('spin').onclick=()=>spin();$('lever').onclick=()=>spin();
keyHandler=e=>{if(!host.isConnected||host.hidden)return;if(e.code==='Space'&&e.target.tagName!=='TEXTAREA'&&e.target.tagName!=='INPUT'){e.preventDefault();spin()}};
$('add').onclick=()=>{players.push('Игрок '+(players.length+1));render();setLive({players:[...players]})};
$('remove').onclick=()=>{if(players.length>1){players.pop();render();setLive({players:[...players]})}};
$('same').onclick=()=>setLive({same:!sameForAll});
$('save').onclick=()=>{styles=$('styles').value.split('\n').map(s=>s.trim()).filter(Boolean);SS('ss_styles4',styles.join('\n'));if(sdb)sdb.doc('config/styles').set({list:styles}).catch(err=>toast('Не сохранилось: '+err.message));$('save').textContent='Сохранено ✓';setTimeout(()=>$('save').textContent='Сохранить',1200)};
let nameT;root.addEventListener('input',e=>{if(!e.target.classList.contains('name'))return;SS('ss_players',JSON.stringify(players));clearTimeout(nameT);nameT=setTimeout(()=>setLive({players:[...players]}),600)});

// таймер считается от общего времени окончания, поэтому у всех одинаковый
let rang=0;
const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const tLeft=t=>t.paused?t.left:Math.max(0,Math.round((t.endsAt-Date.now())/1000));
function renderTimer(){
  const t=live.timer;$('timer').hidden=!t;$('pauseBtn').hidden=$('stopBtn').hidden=!t;
  if(!t)return;const s=tLeft(t);
  if(s<=0&&!t.paused){$('timer').textContent='ВРЕМЯ! 🔥';$('pauseBtn').hidden=true;if(rang!==t.endsAt){rang=t.endsAt;ding();setTimeout(ding,500)}return}
  $('timer').textContent=fmt(s)+(t.paused?' ⏸':'');$('pauseBtn').textContent=t.paused?'▶ Дальше':'⏸ Пауза';
}
setInterval(renderTimer,250);
root.querySelectorAll('[data-min]').forEach(b=>b.onclick=()=>setLive({timer:{endsAt:Date.now()+b.dataset.min*60000,left:b.dataset.min*60,paused:false}}));
$('pauseBtn').onclick=()=>{const t=live.timer;if(!t)return;
  setLive({timer:t.paused?{endsAt:Date.now()+t.left*1000,left:t.left,paused:false}:{endsAt:t.endsAt,left:tLeft(t),paused:true}})};
$('stopBtn').onclick=()=>setLive({timer:null});

// --- VHS: noise + timestamp ---
const nc=$('noise'),nx=nc.getContext('2d'),img=nx.createImageData(nc.width,nc.height);
(function noise(){const d=img.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}nx.putImageData(img,0,0);setTimeout(()=>requestAnimationFrame(noise),50)})();
const months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
(function stamp(){const d=new Date(),p=n=>String(n).padStart(2,'0');
  $('stamp').innerHTML=`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}<br>${months[d.getMonth()]}. ${p(d.getDate())} 1997`;setTimeout(stamp,1000)})();
setInterval(()=>{if(Math.random()<.3)glitch()},4000);

}
