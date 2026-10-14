import { store, photos, compressImage } from '../store.js';
import { icons } from '../svg/icons.js';
import { getMode } from '../core.js';
import { esc, fmt, fmtDate, parseNum, todayISO, toast, uid, confirmDanger, plural } from '../ui.js';

const MOLDS = { plaster: 'Гипс', silicone: 'Силикон', delft: 'Delft clay', other: 'Другое' };
const METAL = { tin: 'Олово', silver: 'Серебро 925' };
const FROM_WIZ = { plaster: ['tin', 'plaster'], silicone: ['tin', 'silicone'], tinmelt: ['tin', 'plaster'], delft: ['silver', 'delft'], silvermelt: ['silver', 'delft'], silverfinish: ['silver', 'delft'] };
const MAX_PHOTOS = 6;

const all = () => store.get('journal', []);
const sorted = list => [...list].sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.created - a.created);
const stars = r => `<span class="stars" aria-label="Оценка ${r} из 5">${[1, 2, 3, 4, 5].map(i => `<span class="${i <= r ? '' : 'off'}">★</span>`).join('')}</span>`;
const query = () => new URLSearchParams(location.hash.split('?')[1] || '');

// ---------- список ----------
function chart(list) {
  const pts = [...list].sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.created - b.created);
  if (pts.length < 2) return '';
  const W = 320, H = 110, x = i => 14 + (i / (pts.length - 1)) * (W - 28), y = r => 96 - (r - 1) * 20;
  const line = pts.map((e, i) => `${x(i)},${y(e.rating)}`).join(' ');
  return `
    <div class="card" style="padding:12px 12px 6px">
      <div class="row small"><b>Оценки по порядку</b><span class="spacer"></span><span class="chip tin">● олово</span><span class="chip silver">● серебро</span></div>
      <svg viewBox="0 0 ${W} ${H}" class="spark" style="height:120px" role="img" aria-label="График оценок">
        ${[1, 2, 3, 4, 5].map(r => `<path d="M10 ${y(r)}H${W - 10}" stroke="#2b3036" stroke-width="1"/><text x="2" y="${y(r) + 4}" style="font-size:9px;fill:#70767e">${r}</text>`).join('')}
        <polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" opacity=".7"/>
        ${pts.map((e, i) => `<circle cx="${x(i)}" cy="${y(e.rating)}" r="4.5" fill="${e.metal === 'silver' ? '#dfe8f2' : '#ff8a2a'}" stroke="#111" stroke-width="1.5"/>`).join('')}
      </svg>
    </div>`;
}

function listView(filter) {
  const list = all();
  const shown = sorted(list.filter(e => filter === 'all' || e.metal === filter));
  const n = list.length;
  const avg = n ? list.reduce((a, e) => a + e.rating, 0) / n : 0;
  const asc = [...list].sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.created - b.created);
  const k = Math.min(5, Math.floor(n / 2));
  const trend = k >= 2 ? asc.slice(-k).reduce((a, e) => a + e.rating, 0) / k - asc.slice(0, k).reduce((a, e) => a + e.rating, 0) / k : null;
  return `
    <div class="page-head">
      <div class="eyebrow">Раздел 10</div>
      <h1>Журнал отливок</h1>
      <p>Каждая отливка — запись. Через месяц увидишь, как растёт оценка.</p>
    </div>
    <a class="btn primary block" href="#/journal/new">${icons.plus} Новая отливка</a>
    ${n ? `
      <div class="stats-row" style="margin-top:14px">
        <div class="big-stat"><small>Отливок</small><b class="num">${n}</b></div>
        <div class="big-stat"><small>Средняя</small><b class="num">${fmt(avg, 1)}★</b></div>
        <div class="big-stat"><small>Прогресс</small><b class="num" style="color:${trend == null ? 'var(--dim)' : trend >= 0 ? 'var(--ok)' : 'var(--warn)'}">${trend == null ? '—' : (trend >= 0 ? '+' : '−') + fmt(Math.abs(trend), 1)}</b><span>${trend == null ? 'нужно ≥ 4' : `последние ${k} vs первые ${k}`}</span></div>
      </div>
      <div style="margin-top:12px">${chart(list)}</div>
      <div class="seg" style="margin:14px 0 10px" id="jFilter">
        ${[['all', 'Все'], ['tin', 'Олово'], ['silver', 'Серебро']].map(([k2, l]) => `<button data-f="${k2}" class="${filter === k2 ? 'on' : ''}">${l}</button>`).join('')}
      </div>
      <div class="stack" style="gap:10px">
        ${shown.map(e => `
          <a class="card card-link entry" href="#/journal/${e.id}">
            <div class="e-photo" data-thumb="${e.photos?.[0] || ''}">${icons.camera}</div>
            <div style="min-width:0">
              <div class="row" style="gap:6px"><span class="chip ${e.metal}">${METAL[e.metal]}</span>${stars(e.rating)}</div>
              <b style="display:block;margin-top:4px">${fmtDate(e.date)} · ${MOLDS[e.mold] || ''}</b>
              <div class="e-meta">${[e.temp ? `${fmt(e.temp)} °C` : '', e.weight ? `${fmt(e.weight, 2)} г` : '', e.notes ? esc(e.notes.slice(0, 40)) + (e.notes.length > 40 ? '…' : '') : ''].filter(Boolean).join(' · ')}</div>
            </div>
          </a>`).join('') || '<div class="empty">Здесь пока пусто.</div>'}
      </div>` : `
      <div class="empty">${icons.book}<b>Журнал пуст</b><span>Залей первую отливку олова и запиши её — даже неудачную. Особенно неудачную.</span></div>`}`;
}

// ---------- форма ----------
function formView(e, isNew) {
  return `
    <div class="page-head">
      <div class="eyebrow">Журнал</div>
      <h1>${isNew ? 'Новая отливка' : 'Редактировать'}</h1>
    </div>
    <form class="stack" id="jForm" autocomplete="off">
      <div class="grid-2">
        <label class="fld">Дата<input type="date" name="date" value="${e.date}" required></label>
        <label class="fld">Форма
          <select name="mold">${Object.entries(MOLDS).map(([k, l]) => `<option value="${k}" ${e.mold === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        </label>
      </div>
      <div class="fld">Металл
        <div class="seg acc" id="jMetal">${Object.entries(METAL).map(([k, l]) => `<button type="button" data-m="${k}" class="${e.metal === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      </div>
      <div class="grid-2">
        <label class="fld">Температура<div class="input-unit"><input name="temp" class="num" inputmode="decimal" value="${e.temp ?? ''}" placeholder="${e.metal === 'silver' ? '≈1000' : '≈290'}"><span>°C</span></div></label>
        <label class="fld">Вес отливки<div class="input-unit"><input name="weight" class="num" inputmode="decimal" value="${e.weight != null ? String(e.weight).replace('.', ',') : ''}" placeholder="0,00"><span>г</span></div></label>
      </div>
      <div class="fld">Результат
        <div class="star-input" id="jStars">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-r="${i}" class="${i <= e.rating ? 'on' : ''}" aria-label="${i} из 5">★</button>`).join('')}</div>
      </div>
      <div class="fld">Фото
        <div class="photo-row" id="jPhotos"></div>
        <input type="file" id="jFile" accept="image/*" multiple hidden>
      </div>
      <label class="fld">Заметки<textarea name="notes" placeholder="Что получилось, что поменять: температура, литник, сушка…">${esc(e.notes || '')}</textarea></label>
      <div class="row">
        <a class="btn ghost" href="#/journal${isNew ? '' : '/' + e.id}">Отмена</a>
        <span class="spacer"></span>
        <button class="btn primary" type="submit">${icons.check} Сохранить</button>
      </div>
      ${isNew ? '' : `<button type="button" class="btn danger block" data-del>${icons.trash} Удалить запись</button>`}
    </form>`;
}

function detailView(e) {
  return `
    <div class="page-head">
      <div class="row" style="gap:6px"><span class="chip ${e.metal}">${METAL[e.metal]}</span>${stars(e.rating)}</div>
      <h1 style="margin-top:8px">${fmtDate(e.date)} · ${MOLDS[e.mold]}</h1>
    </div>
    <div class="calc-out">
      <div class="big-stat"><small>Температура</small><b class="num">${e.temp ? fmt(e.temp) + ' °C' : '—'}</b></div>
      <div class="big-stat"><small>Вес</small><b class="num">${e.weight ? fmt(e.weight, 2) + ' г' : '—'}</b></div>
    </div>
    ${e.notes ? `<div class="card" style="margin-top:12px;white-space:pre-wrap">${esc(e.notes)}</div>` : ''}
    <div class="stack gallery" id="jGallery" style="margin-top:12px"></div>
    <div class="row" style="margin-top:16px">
      <a class="btn" href="#/journal/${e.id}?edit=1">${icons.edit} Изменить</a>
      <span class="spacer"></span>
      <a class="btn ghost" href="#/journal">К журналу</a>
    </div>`;
}

export default function journal([sub]) {
  const q = query();
  // ---------- список ----------
  if (!sub) {
    let filter = 'all';
    return {
      title: 'Журнал отливок', back: '', html: listView(filter),
      mount(root) {
        const thumbs = () => root.querySelectorAll('[data-thumb]').forEach(async el => {
          const pid = el.dataset.thumb;
          if (!pid) return;
          try { const d = await photos.get(pid); if (d) el.innerHTML = `<img src="${d}" alt="">`; } catch {}
        });
        thumbs();
        root.addEventListener('click', e => {
          const b = e.target.closest('[data-f]');
          if (!b) return;
          filter = b.dataset.f;
          root.innerHTML = listView(filter);
          thumbs();
        });
      },
    };
  }

  const isNew = sub === 'new';
  const existing = !isNew && all().find(e => e.id === sub);
  if (!isNew && !existing) return { title: 'Запись', back: 'journal', html: '<div class="empty">Запись не найдена.</div>' };

  // ---------- карточка ----------
  if (!isNew && !q.get('edit')) {
    return {
      title: 'Отливка', back: 'journal', html: detailView(existing),
      async mount(root) {
        const g = root.querySelector('#jGallery');
        for (const pid of existing.photos || []) {
          try { const d = await photos.get(pid); if (d) g.insertAdjacentHTML('beforeend', `<img src="${d}" alt="Фото отливки">`); } catch {}
        }
      },
    };
  }

  // ---------- форма ----------
  const [wm, wmold] = FROM_WIZ[q.get('wiz')] || [];
  const e = existing ? { ...existing } : { id: uid(), date: todayISO(), metal: wm || getMode(), mold: wmold || (getMode() === 'silver' ? 'delft' : 'plaster'), temp: null, weight: null, rating: 3, photos: [], notes: '', created: Date.now() };
  return {
    title: isNew ? 'Новая отливка' : 'Редактировать', back: isNew ? 'journal' : `journal/${e.id}`,
    html: formView(e, isNew),
    mount(root) {
      const form = root.querySelector('#jForm');
      const $ph = root.querySelector('#jPhotos'), $file = root.querySelector('#jFile');
      // фото: {id, url, isNew}
      let pics = [];
      const removed = [];
      const drawPics = () => {
        $ph.innerHTML = pics.map((p, i) => `<div class="ph"><img src="${p.url}" alt=""><button type="button" data-rm="${i}" aria-label="Убрать фото">✕</button></div>`).join('')
          + (pics.length < MAX_PHOTOS ? `<button type="button" class="photo-add" data-add>${icons.camera}<span>Добавить</span></button>` : '');
      };
      (async () => {
        for (const pid of e.photos || []) {
          try { const d = await photos.get(pid); if (d) pics.push({ id: pid, url: d, isNew: false }); } catch {}
        }
        drawPics();
      })();
      drawPics();

      root.addEventListener('click', async ev => {
        const m = ev.target.closest('[data-m]');
        if (m) {
          e.metal = m.dataset.m;
          root.querySelectorAll('#jMetal button').forEach(b => b.classList.toggle('on', b === m));
          form.temp.placeholder = e.metal === 'silver' ? '≈1000' : '≈290';
          return;
        }
        const r = ev.target.closest('[data-r]');
        if (r) {
          e.rating = +r.dataset.r;
          root.querySelectorAll('#jStars button').forEach(b => b.classList.toggle('on', +b.dataset.r <= e.rating));
          return;
        }
        if (ev.target.closest('[data-add]')) { $file.click(); return; }
        const rm = ev.target.closest('[data-rm]');
        if (rm) {
          const [p] = pics.splice(+rm.dataset.rm, 1);
          if (p && !p.isNew) removed.push(p.id);
          drawPics();
          return;
        }
        if (ev.target.closest('[data-del]')) {
          if (!(await confirmDanger('Удалить запись?', 'Запись и её фото удалятся без возврата.'))) return;
          for (const pid of e.photos || []) { try { await photos.del(pid); } catch {} }
          store.set('journal', all().filter(x => x.id !== e.id));
          toast('Запись удалена');
          location.hash = '#/journal';
        }
      });
      $file.addEventListener('change', async () => {
        const files = [...$file.files].slice(0, MAX_PHOTOS - pics.length);
        for (const f of files) {
          try { pics.push({ id: 'p' + uid(), url: await compressImage(f), isNew: true }); } catch { toast('Не удалось прочитать фото'); }
        }
        $file.value = '';
        drawPics();
      });
      form.addEventListener('submit', async ev => {
        ev.preventDefault();
        const temp = parseNum(form.temp.value), weight = parseNum(form.weight.value);
        try {
          for (const p of pics) if (p.isNew) await photos.put(p.id, p.url);
          for (const pid of removed) await photos.del(pid);
        } catch {
          toast('⚠️ Не удалось сохранить фото — мало места');
          return;
        }
        const rec = {
          ...e, date: form.date.value || todayISO(), mold: form.mold.value,
          temp: isNaN(temp) ? null : temp, weight: isNaN(weight) ? null : weight,
          notes: form.notes.value.trim(), photos: pics.map(p => p.id), updated: Date.now(),
        };
        const list = all().filter(x => x.id !== rec.id);
        if (!store.set('journal', [...list, rec])) return;
        const n = list.length + 1;
        toast(isNew ? `Записано · ${n} ${plural(n, 'отливка', 'отливки', 'отливок')} в журнале` : 'Сохранено');
        location.hash = `#/journal/${rec.id}`;
      });
    },
  };
}
