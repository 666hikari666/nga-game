# NGA: Подвал

Браузерная 3D-игра (Three.js, один `index.html`): подвал с качалкой, баром, ПК-клубом и тремя слот-машинами.
Персонажи: Даня, Ярик, Эдик (`assets/chars/<id>/`).

## Опубликовано
- claude.ai: https://claude.ai/artifact/MerF256DAJ5kS4dSfdLh5H (capabilities: `db`, `assets` upload `interact`, `room` topic `live` `interact`)
- Старая отдельная страница слотов: https://claude.ai/artifact/GuQSGtodBUNAJHk8JFMMbT (исходник `D:\Design game\nga-design-game.html`), у неё своя база.

## Устройство
- `index.html` — вся игра. Разделы помечены комментариями `// ----`.
  - Слот-машины: `slots[]`, `slotScreenTex`, `enterSlot`/`leaveSlot`; подход + F → камера наезжает → `openSlots()`.
  - Онлайн: позиции игроков пишутся в db-коллекцию `online/<NET_ID>` ~4 раза/с (`netTick`, `syncPeers`, `updateRemotes`).
    Room не используется для движения: гостей вне организации claude.ai туда не пускает.
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
