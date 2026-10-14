import { wizardById } from '../data/wizards.js';
import { scene } from '../svg/scenes.js';
import { icons } from '../svg/icons.js';
import { wizState, setWizState, safetyStatus } from '../core.js';
import { store } from '../store.js';
import { callouts, esc, fmt, parseNum, toast, fmtDuration } from '../ui.js';
import { PRESETS, start as startTimer, list as timerList, status as timerStatus } from '../timers-core.js';

const GROUP = { tin: 'Олово · учёба', silver: 'Серебро 925' };

// ---------- контроль сушки взвешиванием ----------
function dryingHTML() {
  const ws = store.get('drying', []);
  let status = '<p class="muted small">Взвешивай раз в день (воздух) или после ступени духовки — каждый раз остывшую форму.</p>';
  if (ws.length >= 2) {
    const a = ws[ws.length - 2].w, b = ws[ws.length - 1].w;
    const drop = a - b, pct = (drop / a) * 100;
    status = pct <= 0.2
      ? `<div class="callout tip"><span class="ci">🟢</span><div><b>Вес перестал падать — форма сухая.</b> Изменение ${fmt(drop, 1)} г (≈${fmt(Math.max(pct, 0), 2)} %).</div></div>`
      : `<div class="callout warn"><span class="ci">🟡</span><div><b>Ещё сохнет:</b> −${fmt(drop, 1)} г (≈${fmt(pct, 1)} %) с прошлого раза. Лить рано.</div></div>`;
  }
  let chart = '';
  if (ws.length >= 2) {
    const min = Math.min(...ws.map(x => x.w)), max = Math.max(...ws.map(x => x.w));
    const pts = ws.map((x, i) => `${(i / (ws.length - 1)) * 300 + 10},${70 - ((x.w - min) / ((max - min) || 1)) * 56}`).join(' ');
    chart = `<svg viewBox="0 0 320 80" class="spark"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>${ws.map((x, i) => `<circle cx="${(i / (ws.length - 1)) * 300 + 10}" cy="${70 - ((x.w - min) / ((max - min) || 1)) * 56}" r="3.5" fill="var(--accent)"/>`).join('')}</svg>`;
  }
  return `
    <div class="card" id="dry" style="display:grid;gap:10px">
      <div class="row"><b>⚖️ Контроль сушки</b><span class="spacer"></span>${ws.length ? '<button class="btn small ghost" data-dry-reset>Новая форма</button>' : ''}</div>
      <form class="row" data-dry-add>
        <div class="input-unit" style="flex:1"><input name="w" inputmode="decimal" placeholder="Вес формы" aria-label="Вес формы, граммы"><span>г</span></div>
        <button class="btn primary" type="submit">Записать</button>
      </form>
      ${chart}
      ${ws.length ? `<div class="stack" style="gap:4px">${ws.slice(-6).map((x, i, arr) => {
        const prev = i ? arr[i - 1].w : (ws.length > arr.length ? ws[ws.length - arr.length - 1].w : null);
        const d = prev != null ? x.w - prev : null;
        return `<div class="row small"><span class="muted">${new Date(x.t).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><span class="spacer"></span><b class="num">${fmt(x.w, 1)} г</b><span class="num" style="width:74px;text-align:right;color:${d == null ? 'var(--dim)' : d < 0 ? 'var(--warn)' : 'var(--ok)'}">${d == null ? '—' : (d > 0 ? '+' : '−') + fmt(Math.abs(d), 1)}</span></div>`;
      }).join('')}</div>` : ''}
      ${status}
    </div>`;
}

function timerHTML(presetId) {
  const p = PRESETS.find(x => x.id === presetId);
  if (!p) return '';
  const run = timerList().find(t => t.preset === presetId && !timerStatus(t).done);
  if (run) {
    const s = timerStatus(run);
    return `<a class="btn block" href="#/timers" data-timer-live="${run.id}">${icons.timer} Идёт: <span class="num">${fmtDuration(s.remain)}</span> — открыть</a>`;
  }
  return `<button class="btn block" data-timer-start="${p.id}">${icons.play} Таймер: ${esc(p.title)} · ${esc(p.sub)}</button>`;
}

function safetyHTML() {
  const s = safetyStatus();
  return s.all
    ? `<a class="safety-pill good" href="#/safety">${icons.shield}<span>Чек-лист безопасности пройден ✓</span></a>`
    : `<a class="safety-pill bad" href="#/safety">${icons.shield}<span>Чек-лист безопасности: ${s.done}/${s.total} — пройди перед заливкой</span>${icons.next}</a>`;
}

export default function wizard([id]) {
  const w = wizardById(id);
  if (!w) return { title: 'Не найдено', back: '', html: '<div class="empty">Мастер не найден. <a href="#/">На главную</a></div>' };
  store.patch('lastWiz', o => ({ ...(o && typeof o === 'object' ? o : {}), [w.group]: id }), {});
  const n = w.steps.length;
  let st = wizState(id);
  let i = Math.min(st.step || 0, n - 1);

  const notes = store.get('notes', {});
  const stageHTML = (k, dir) => {
    if (k >= n) {
      const next = w.next && wizardById(w.next);
      return `
        <div class="card wiz-done ${dir < 0 ? 'wiz-anim-back' : 'wiz-anim-in'}">
          <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface3)" stroke-width="8"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" stroke-dasharray="315" stroke-dashoffset="315" transform="rotate(-90 60 60)"><animate attributeName="stroke-dashoffset" from="315" to="0" dur=".8s" fill="freeze"/></circle>
            <path d="M38 62l15 15 30-32" fill="none" stroke="var(--accent)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="80" stroke-dashoffset="80"><animate attributeName="stroke-dashoffset" from="80" to="0" begin=".6s" dur=".4s" fill="freeze"/></path></svg>
          <h2>Готово!</h2>
          <p class="muted">«${esc(w.title)}» пройден. Запиши результат — так виден прогресс.</p>
          <a class="btn primary block" href="#/journal/new?wiz=${w.id}">${icons.book} Записать отливку в журнал</a>
          ${next ? `<a class="btn block" href="#/w/${next.id}">${icons.next} Дальше: ${esc(next.title)}</a>` : ''}
          <a class="btn ghost block" href="#/${w.group}">К списку процессов</a>
          <button class="btn ghost block" data-restart>Пройти заново</button>
        </div>`;
    }
    const s = w.steps[k];
    const key = `${id}:${k}`;
    const note = notes[key] || '';
    return `
      <div class="wiz-stage ${dir < 0 ? 'wiz-anim-back' : 'wiz-anim-in'}">
        <div class="wiz-art"><span class="step-no">Шаг ${k + 1}</span>${scene(s.scene[0], s.scene[1])}</div>
        <div class="wiz-text">
          <h2>${esc(s.t)}</h2>
          <div class="lead">${s.text.map(p => `<p>${p}</p>`).join('')}</div>
          ${callouts(s.notes)}
          ${s.pour ? safetyHTML() : ''}
          ${s.timer ? `<div data-timer-slot="${s.timer}">${timerHTML(s.timer)}</div>` : ''}
          ${s.widget === 'drying' ? `<div data-dry-slot>${dryingHTML()}</div>` : ''}
          <details class="note-box" ${note ? 'open' : ''}>
            <summary>${icons.note.replace('<svg', '<svg width="18" height="18"')} Моя заметка к шагу</summary>
            <textarea data-note="${key}" placeholder="Что заметил, что поменять в следующий раз…">${esc(note)}</textarea>
          </details>
        </div>
      </div>`;
  };

  const dots = () => w.steps.map((_, k) => `<button class="${k === i ? 'cur' : k <= st.max || st.done ? 'done' : ''}" data-go="${k}" aria-label="Шаг ${k + 1}"></button>`).join('');

  const html = `
    <div class="wiz">
      <div class="wiz-head">
        <div class="row"><span class="eyebrow" style="margin:0">${GROUP[w.group]}</span><span class="spacer"></span>${st.done ? '<span class="chip ok">✓ пройдено</span>' : ''}<b class="num" id="wCount"></b></div>
        <h1 style="font-size:21px;font-weight:800">${esc(w.title)}</h1>
        <div class="molten-bar"><i id="wBar" style="width:0"></i></div>
        <div class="wiz-dots" id="wDots"></div>
      </div>
      <div id="wStage"></div>
      <div class="wiz-nav" id="wNav">
        <button class="btn" data-nav="-1">${icons.back} Назад</button>
        <button class="btn primary" data-nav="1" id="wNext">Далее ${icons.next}</button>
      </div>
    </div>`;

  function mount(root) {
    const $stage = root.querySelector('#wStage'), $bar = root.querySelector('#wBar'), $count = root.querySelector('#wCount');
    const $dots = root.querySelector('#wDots'), $next = root.querySelector('#wNext'), $nav = root.querySelector('#wNav');

    function show(k, dir = 1) {
      i = k;
      $stage.innerHTML = stageHTML(k, dir);
      $bar.style.width = `${(Math.min(k + 1, n) / n) * 100}%`;
      $count.textContent = k >= n ? `${n} / ${n}` : `${k + 1} / ${n}`;
      $dots.innerHTML = dots();
      $nav.hidden = k >= n;
      $next.innerHTML = k === n - 1 ? `Готово ${icons.check}` : `Далее ${icons.next}`;
      root.querySelector('[data-nav="-1"]').disabled = k === 0;
    }
    function go(d) {
      const k = i + d;
      if (k < 0 || k > n) return;
      if (k === n) {
        st = { ...st, step: 0, max: n - 1, done: true };
        setWizState(id, st);
      } else {
        st = { ...st, step: k, max: Math.max(st.max || 0, k) };
        setWizState(id, { step: k, max: st.max });
      }
      show(k, d);
      const top = root.querySelector('.wiz').getBoundingClientRect().top + scrollY - 70;
      if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
    }
    show(i, 1);

    root.addEventListener('click', e => {
      const nav = e.target.closest('[data-nav]');
      if (nav) return go(+nav.dataset.nav);
      const dot = e.target.closest('[data-go]');
      if (dot) { const k = +dot.dataset.go; return go(k - i); }
      if (e.target.closest('[data-restart]')) { st = { ...st, step: 0 }; setWizState(id, { step: 0 }); return show(0, -1); }
      const ts = e.target.closest('[data-timer-start]');
      if (ts) {
        const p = PRESETS.find(x => x.id === ts.dataset.timerStart);
        startTimer(p);
        toast(`⏱ Запущен: ${p.title}`);
        ts.parentElement.innerHTML = timerHTML(p.id);
        return;
      }
      if (e.target.closest('[data-dry-reset]')) {
        store.set('drying', []);
        root.querySelector('[data-dry-slot]').innerHTML = dryingHTML();
      }
    });
    root.addEventListener('submit', e => {
      if (!e.target.closest('[data-dry-add]')) return;
      e.preventDefault();
      const v = parseNum(e.target.w.value);
      if (!(v > 0)) { toast('Введи вес в граммах'); return; }
      store.patch('drying', a => [...a, { t: Date.now(), w: v }], []);
      root.querySelector('[data-dry-slot]').innerHTML = dryingHTML();
    });
    let noteT;
    root.addEventListener('input', e => {
      const ta = e.target.closest('[data-note]');
      if (!ta) return;
      clearTimeout(noteT);
      noteT = setTimeout(() => {
        notes[ta.dataset.note] = ta.value;
        if (!ta.value) delete notes[ta.dataset.note];
        store.set('notes', notes);
      }, 300);
    });

    // свайп влево/вправо
    let sx = 0, sy = 0, tracking = false;
    $stage.addEventListener('touchstart', e => {
      if (e.target.closest('textarea, input, button, a, select')) { tracking = false; return; }
      tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    $stage.addEventListener('touchend', e => {
      if (!tracking) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && i < n) go(dx < 0 ? 1 : -1);
    }, { passive: true });

    const key = e => {
      if (e.target.closest('textarea, input')) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', key);

    // живой остаток таймера на шаге
    const onTick = () => {
      const live = root.querySelector('[data-timer-live]');
      if (!live) return;
      const t = timerList().find(x => x.id === live.dataset.timerLive);
      const slot = live.parentElement;
      if (!t || timerStatus(t).done) { slot.innerHTML = timerHTML(slot.dataset.timerSlot); return; }
      live.querySelector('.num').textContent = fmtDuration(timerStatus(t).remain);
    };
    window.addEventListener('mc:timers', onTick);
    return () => { document.removeEventListener('keydown', key); window.removeEventListener('mc:timers', onTick); };
  }

  return { title: w.title, back: w.group, html, mount };
}
