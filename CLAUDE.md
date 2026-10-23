# NGA: Подвал

Браузерная 3D-игра (Three.js, один `index.html`): подвал с качалкой, баром, ПК-клубом и тремя слот-машинами.
Персонажи: Даня, Ярик, Эдик (`assets/chars/<id>/`).

## Опубликовано
- **Основное:** GitHub Pages https://666hikari666.github.io/nga-game/ (репо github.com/666hikari666/nga-game, ветка `main`).
  Обновить = закоммитить и `git push`, Pages пересобирается сам за минуту.
- Онлайн: Firebase проект `nga-game`, Realtime Database (europe-west1). `firebase-net.js` подменяет `window.claude.use('db'|'assets')`
  поверх Firebase, поэтому код игры и слотов не знает, где хранятся данные. Правила — `database.rules.json`
  (вставляются вручную в консоли Firebase → Realtime Database → Rules). Картинки работ — data URL прямо в `tries`.
- Старое: claude.ai https://claude.ai/artifact/MerF256DAJ5kS4dSfdLh5H (там внешние запросы запрещены, Firebase не грузится, онлайн через db claude.ai с лимитом для гостей)
- Старая отдельная страница слотов: https://claude.ai/artifact/GuQSGtodBUNAJHk8JFMMbT (исходник `D:\Design game\nga-design-game.html`), у неё своя база.

## Устройство
- `index.html` — вся игра. Разделы помечены комментариями `// ----`.
  - Слот-машины: `slots[]`, `slotScreenTex`, `enterSlot`/`leaveSlot`; подход + F → камера наезжает → `openSlots()`.
  - Онлайн: коллекция `online/<NET_ID>` в Firebase (`netTick`, `syncPeers`, `updateRemotes`). Пишем только при изменении
    (позиция + скорость, действия, эмоция, прыжок как метка времени), не чаще 0.15 с, «я тут» раз в 10 с; у других перс доезжает по скорости.
  - Персы — 3D-модели `assets/models/<id>.glb`. Сборка из сырого .glb: `python assets/models/build.py <id> <src.glb> assets/models/<id>`
    (зоны/цвета/суставы каждого — в `CONFIG` в build.py; раскраска, упрощение, распил на части с перекрытием, лицо — маска с UV).
    Исходники: `E:\Downloads\{stylized character 3d model,ярик моделька,эдик}.glb`. Референсы и листы эмоций: `C:\Users\rogoz\downloads`.
    Эмоции: `assets/chars/<id>/face3d_*.png` (12 шт., `FACE_NAMES`), J — эмоция на 3 с (синхр. как `s.e`). Фон листов = цвет кожи модели.
    У Ярика/Эдика одна рука в модели держит шланг/вейп — она в торсе и не качается. Просмотр: `model-view.html?m=<id>`.
  - Камера сама едет за персом (`camFollow`: «поводок» + плавно заходит за спину при беге вперёд), Q/E — подвернуть.
    WASD — относительно камеры. Мышь для камеры не используется.
  - Этажи: `player.floor` 0 — подвал, 1 — второй этаж на высоте `Y2` (стоит на потолке подвала). Препятствия и свет
    помнят этаж (`BUILD_FLOOR`, `lightsByFloor`). Лестница — `STAIR`, высота перса `standY()`; этаж меняется сам,
    когда проходишь ступени. В сети этаж — поле `f`.
  - Лаунж с кальянами — передний левый угол подвала (`hookah()`). F у кальяна → меню забивки (`FLAVORS`, `STRENGTHS`):
    вкус = цвет дыма, крепость = размер облака; «Забивка от NGA» — дым логотипом (`LOGO` — контуры, `logoCloud`).
    В сети: `h` — вкус+1, `hs` — крепость.
  - Текстуры — процедурные (`TEX`), на коробках раскладываются по метрам (`texMat(map, tile)` → `worldUVBox`).
    Тени от солнца — только на втором этаже.
  - Наши арты: `assets/posters/*.jpg`, список — `ARTS`. Вешаются `hangArt(i, x, y, z, ry, H)` (на стене — VHS-версия,
    `vhsArtTex` делает её из оригинала на лету). F рядом — просмотр оригинала (`openArt`, ← → листать).
    Новый арт: положить jpg в `assets/posters`, добавить в `ARTS` (с размерами) и повесить через `hangArt`.
  - Второй этаж (`buildUpstairs`): домик и терраса на скале. Пустыня внизу: `groundH`, перекати-поле (`tumbles`),
    антилопы (`herds`), смена суток `updateSky` — круг `DAY_CYCLE` = 10 мин, время общее у всех (по часам).
  - Звуки: WebAudio-синтез (`SFX`, `soundTick`), включаются после первого нажатия.
- `slots/slots.js` — мини-игра «NGA Design Game» в shadow DOM. Собрана из `D:\Design game\nga-design-game.html`
  (стили, разметка и скрипт внутри строк). Общие данные в db: `tries` (история, работы), `state/live` (пульт: крутка, таймер, игроки),
  `config/styles` (база стилей); картинки работ — `assets`.
- `slots/info/` — описания и картинки стилей (внешний интернет со страницы claude.ai недоступен, поэтому всё заранее):
  `meta.json` + `img0..2.json`. Пересборка: `slots/tools/build_info.py` и `pack_info.py` (рассчитаны на запуск из `D:\Design game`).
- `for-3d/` — референсы персонажей, в игре не используются.

## Локальный запуск
Двойной клик не подойдёт (file:// не грузит текстуры). `python -m http.server 8765` в этой папке → http://localhost:8765/.
db/room локально отсутствуют: игра работает в офлайн-режиме.

## Публикация
Artifact-тул публикует только из рабочей папки или scratchpad. Публикуем `index.html` с `files`:
`slots/slots.js`, `slots/info/*.json`, `slots/assets/*`, `assets/chars/*/{head_neutral,face_neutral,face_laughing}.png`, тем же URL.
