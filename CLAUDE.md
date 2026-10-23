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
  - Онлайн: db-коллекция `online/<NET_ID>` (`netTick`, `syncPeers`, `updateRemotes`). Пишем только при изменении
    (позиция + скорость, действия, прыжок как метка времени), не чаще 0.6 с, «я тут» раз в 20 с; у других перс доезжает по скорости.
    Причина: у гостей claude.ai лимит записей (`invalid_argument ... exceeds a limit`) — частые записи его съедают.
    Room не используется для движения: гостей вне организации claude.ai туда не пускает.
  - Даня — 3D-модель `assets/models/danya.glb` (сборка: `assets/models/build.py` из исходного .glb: раскраска по зонам,
    упрощение, распил на части с перекрытием у суставов, лицо — маска с UV). Эмоции: `assets/chars/danya/face3d_*.png`
    (12 шт., `FACE_NAMES`), кнопка J — эмоция на 3 с (синхронится как `s.e`). Фон текстур = цвет кожи модели #e8ac7e.
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
