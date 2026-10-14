import { store, photos } from '../store.js';
import { icons } from '../svg/icons.js';
import { callout, downloadFile, fmt, toast, confirmDanger, todayISO } from '../ui.js';

export const APP_VERSION = '1.0.0';

export default function data() {
  const kb = store.bytes() / 1024;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const html = `
    <div class="page-head">
      <div class="eyebrow">Данные</div>
      <h1>Копия, установка, сброс</h1>
      <p>Всё хранится только на этом устройстве, в браузере.</p>
    </div>
    <div class="card stack">
      <h3>Установить на iPhone</h3>
      ${standalone ? callout('tip', 'Приложение уже установлено и работает без интернета.') : `
      <ol class="list-plain">
        <li>Открой сайт в <b>Safari</b>.</li>
        <li>Кнопка «Поделиться» → <b>«На экран Домой»</b>.</li>
        <li>Запускай с иконки — работает без интернета, сохраняет данные надёжнее и умеет присылать уведомления таймеров.</li>
      </ol>`}
      ${callout('warn', 'Safari может стереть данные сайта, который не открывали ≈7 дней. Установка на экран «Домой» и резервная копия защищают журнал.')}
    </div>
    <div class="card stack" style="margin-top:12px">
      <h3>Резервная копия</h3>
      <p class="muted small">Занято: ≈${fmt(kb, 0)} КБ настроек и записей + фото в отдельной базе.</p>
      <button class="btn primary" data-export>${icons.download} Скачать копию (.json)</button>
      <button class="btn" data-import>${icons.upload} Восстановить из копии</button>
      <input type="file" id="impFile" accept="application/json,.json" hidden>
    </div>
    <div class="card stack" style="margin-top:12px">
      <h3>Сброс</h3>
      <button class="btn danger" data-wipe>${icons.trash} Стереть все данные</button>
    </div>
    <p class="foot">Мастерская литья · версия ${APP_VERSION}</p>`;

  function mount(root) {
    const $imp = root.querySelector('#impFile');
    root.addEventListener('click', async e => {
      if (e.target.closest('[data-export]')) {
        try {
          const dump = { app: 'casting-workshop', version: APP_VERSION, at: new Date().toISOString(), local: store.dump(), photos: await photos.all() };
          downloadFile(`litje-backup-${todayISO()}.json`, JSON.stringify(dump));
          toast('Копия сохранена');
        } catch { toast('Не удалось собрать копию'); }
        return;
      }
      if (e.target.closest('[data-import]')) { $imp.click(); return; }
      if (e.target.closest('[data-wipe]')) {
        if (!(await confirmDanger('Стереть всё?', 'Журнал, фото, отметки, цены и заметки удалятся. Сначала сделай копию.', 'Стереть'))) return;
        store.clearAll();
        try { await photos.clear(); } catch {}
        toast('Данные стёрты');
        location.hash = '#/';
        location.reload();
      }
    });
    $imp.addEventListener('change', async () => {
      const f = $imp.files[0];
      $imp.value = '';
      if (!f) return;
      try {
        const dump = JSON.parse(await f.text());
        if (dump.app !== 'casting-workshop' || !dump.local) throw new Error('bad');
        if (!(await confirmDanger('Восстановить копию?', `Копия от ${new Date(dump.at).toLocaleString('ru-RU')}. Текущие данные заменятся.`, 'Восстановить'))) return;
        store.clearAll();
        store.restore(dump.local);
        await photos.clear();
        for (const [k, v] of Object.entries(dump.photos || {})) await photos.put(k, v);
        toast('Восстановлено');
        location.hash = '#/';
        location.reload();
      } catch {
        toast('Это не копия «Мастерской литья»');
      }
    });
  }
  return { title: 'Данные', back: '', html, mount };
}
