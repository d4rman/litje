import { icons } from '../svg/icons.js';
import { callout, esc, fmtDuration, fmtMinutes, parseNum, toast, confirmDanger } from '../ui.js';
import * as T from '../timers-core.js';

const R = 50, CIRC = 2 * Math.PI * R;

function timerCard(t) {
  const s = T.status(t);
  const frac = s.total ? s.elapsed / s.total : 1;
  const multi = t.stages.length > 1;
  let acc = 0;
  return `
    <article class="card timer-card ${s.done ? 'done' : ''}" data-tid="${t.id}">
      <div class="timer-main">
        <div class="ring">
          <svg viewBox="0 0 112 112"><circle class="ring-bg" cx="56" cy="56" r="${R}" fill="none" stroke-width="9"/>
            <circle class="ring-fg" cx="56" cy="56" r="${R}" fill="none" stroke-width="9" stroke-linecap="round" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC * (1 - Math.min(1, frac))}"/></svg>
          <div class="rv"><div><b class="num" data-rem>${s.done ? 'готово' : fmtDuration(multi ? s.stageRemain : s.remain)}</b><small>${s.done ? '✓' : t.pausedAt ? 'пауза' : multi ? 'до конца ступени' : 'осталось'}</small></div></div>
        </div>
        <div style="min-width:0">
          <b style="font-size:17px">${esc(t.title)}</b>
          <div class="muted small" style="margin-top:2px">${multi ? `Ступень ${Math.min(s.stageIdx + 1, t.stages.length)} из ${t.stages.length} · осталось ${fmtMinutes(Math.ceil(s.remain / 60000))}` : `из ${fmtMinutes(t.stages[0].min)}`}</div>
          <div class="row wrap" style="margin-top:10px;gap:6px">
            ${s.done ? '' : t.pausedAt
              ? `<button class="btn small" data-act="resume">${icons.play} Дальше</button>`
              : `<button class="btn small" data-act="pause">${icons.pause} Пауза</button>`}
            <button class="btn small" data-act="plus5">+5 мин</button>
            <button class="btn small ghost" data-act="remove">${icons.x} ${s.done ? 'Убрать' : 'Стоп'}</button>
          </div>
        </div>
      </div>
      ${multi ? `<div class="stage-list">${t.stages.map((st, k) => {
        acc += st.min;
        const cls = k < s.passed ? 'past' : k === s.stageIdx && !s.done ? 'cur' : '';
        return `<div class="stage ${cls}"><span class="sd"></span><span>${esc(st.label)} · ${st.range || fmtMinutes(st.min)}</span><span class="muted small num">до ${fmtMinutes(acc)}</span></div>`;
      }).join('')}</div>` : ''}
      ${multi && !s.done ? `<div class="callout info"><span class="ci">ℹ️</span><div>${esc(t.stages[s.stageIdx].label)}: ${k0(t, s)}</div></div>` : ''}
    </article>`;
}
const k0 = (t, s) => (s.stageIdx === 0 ? 'держи эту температуру.' : `поставь ${esc(t.stages[s.stageIdx].label)} и держи.`);

function presetCard(p) {
  const extra = p.id === 'ovenDry' ? `
    <div class="grid-2" style="margin-top:4px">
      <label class="fld small">≈110 °C
        <select data-st="1"><option value="120">2 ч</option><option value="150" selected>2,5 ч</option><option value="180">3 ч</option></select></label>
      <label class="fld small">≈180 °C
        <select data-st="2"><option value="60">1 ч</option><option value="90" selected>1,5 ч</option><option value="120">2 ч</option></select></label>
    </div>` : '';
  return `
    <div class="card stack" style="gap:10px" data-preset="${p.id}">
      <button class="preset" data-start="${p.id}" style="background:none;border:0;padding:0;color:inherit">
        <span class="p-ico">${icons[p.icon] || icons.timer}</span>
        <span><b>${esc(p.title)}</b><span>${esc(p.sub)}</span></span>
      </button>
      ${extra}
      <button class="btn primary small" data-start="${p.id}">${icons.play} Старт</button>
    </div>`;
}

export default function timers() {
  function controls() {
    const perm = T.notifPermission();
    return `
      <div class="card stack" style="gap:10px">
        <div class="row wrap">
          ${perm === 'granted' ? '<span class="chip ok">🔔 Уведомления включены</span>'
            : perm === 'unsupported' ? '<span class="chip">🔔 Уведомления: только для установленного приложения</span>'
            : perm === 'denied' ? '<span class="chip danger">🔔 Уведомления запрещены в настройках</span>'
            : `<button class="btn small" data-notif>${icons.bell} Включить уведомления</button>`}
          ${T.wakeSupported() ? `<button class="btn small ${T.wakeOn() ? 'primary' : ''}" data-wake>${icons.sun} ${T.wakeOn() ? 'Экран не гаснет' : 'Не гасить экран'}</button>` : ''}
          <button class="btn small ghost" data-test>${icons.bell} Проверить звук</button>
        </div>
        ${callout('warn', 'На iPhone в фоне страница засыпает. Время всё равно считается по часам — вернёшься и увидишь точный остаток. Системные уведомления — когда приложение установлено на экран «Домой». Для коротких таймеров включи «Не гасить экран».')}
      </div>`;
  }
  function build() {
    const list = T.list();
    return `
      <div class="page-head">
        <div class="eyebrow">Раздел 8</div>
        <h1>Таймеры</h1>
        <p>Можно запустить несколько сразу. Звук и уведомление — на каждой ступени.</p>
      </div>
      <div id="tRun" class="stack">${list.length ? list.map(timerCard).join('') : ''}</div>
      <div class="section-title">Пресеты</div>
      <div class="preset-grid">${T.PRESETS.map(presetCard).join('')}</div>
      <div class="section-title">Свой таймер</div>
      <form class="card stack" id="tCustom" style="gap:10px">
        <input name="title" placeholder="Название (например «Остывание формы»)" maxlength="40">
        <div class="grid-2">
          <div class="input-unit"><input name="h" inputmode="numeric" placeholder="0" aria-label="Часы"><span>ч</span></div>
          <div class="input-unit"><input name="m" inputmode="numeric" placeholder="10" aria-label="Минуты"><span>мин</span></div>
        </div>
        <button class="btn primary" type="submit">${icons.play} Запустить</button>
      </form>
      <div class="section-title">Настройки</div>
      ${controls()}`;
  }

  function mount(root) {
    const redraw = () => { const y = scrollY; root.innerHTML = build(); scrollTo(0, y); };
    // лёгкое обновление цифр каждую секунду без пересборки
    let lastSig = '';
    const sig = () => T.list().map(t => `${t.id}:${t.pausedAt ? 1 : 0}:${T.status(t).passed}:${T.status(t).done}:${t.stages.map(s => s.min).join(',')}`).join('|');
    lastSig = sig();
    const onTick = () => {
      const now = sig();
      if (now !== lastSig) { lastSig = now; root.querySelector('#tRun').innerHTML = T.list().map(timerCard).join(''); return; }
      for (const t of T.list()) {
        const card = root.querySelector(`[data-tid="${t.id}"]`);
        if (!card) continue;
        const s = T.status(t);
        const multi = t.stages.length > 1;
        card.querySelector('[data-rem]').textContent = s.done ? 'готово' : fmtDuration(multi ? s.stageRemain : s.remain);
        card.querySelector('.ring-fg').setAttribute('stroke-dashoffset', CIRC * (1 - Math.min(1, s.elapsed / s.total)));
      }
    };
    window.addEventListener('mc:timers', onTick);

    root.addEventListener('click', async e => {
      const st = e.target.closest('[data-start]');
      if (st) {
        const p = T.PRESETS.find(x => x.id === st.dataset.start);
        let stages = p.stages;
        if (p.id === 'ovenDry') {
          const card = st.closest('[data-preset]');
          stages = p.stages.map((s, k) => {
            const sel = card.querySelector(`[data-st="${k}"]`);
            return sel ? { ...s, min: +sel.value, range: fmtMinutes(+sel.value) } : s;
          });
        }
        T.start(p, stages);
        toast(`⏱ ${p.title} — старт`);
        lastSig = sig();
        root.querySelector('#tRun').innerHTML = T.list().map(timerCard).join('');
        scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const act = e.target.closest('[data-act]');
      if (act) {
        const id = act.closest('[data-tid]').dataset.tid;
        const a = act.dataset.act;
        if (a === 'pause') T.pause(id);
        if (a === 'resume') T.resume(id);
        if (a === 'plus5') T.addMinutes(id, 5);
        if (a === 'remove') {
          const t = T.list().find(x => x.id === id);
          if (t && !T.status(t).done && !(await confirmDanger('Остановить таймер?', esc(t.title), 'Остановить'))) return;
          T.remove(id);
        }
        return;
      }
      if (e.target.closest('[data-notif]')) {
        const r = await T.askNotif();
        toast(r === 'granted' ? '🔔 Уведомления включены' : 'Уведомления не разрешены');
        redraw();
        return;
      }
      if (e.target.closest('[data-wake]')) {
        await T.setWake(!T.wakeOn());
        redraw();
        return;
      }
      if (e.target.closest('[data-test]')) {
        T.unlockAudio();
        const t = T.start({ id: 'test', title: 'Проверка', stages: [{ label: 'Проверка', min: 0.05, msg: 'Звук и уведомления работают.' }] });
        setTimeout(() => T.remove(t.id), 9000);
      }
    });
    root.addEventListener('submit', e => {
      if (e.target.id !== 'tCustom') return;
      e.preventDefault();
      const f = e.target;
      const min = (parseNum(f.h.value) || 0) * 60 + (parseNum(f.m.value) || 0);
      if (!(min > 0)) { toast('Укажи время'); return; }
      const title = f.title.value.trim() || 'Свой таймер';
      T.start({ id: 'custom', title, stages: [{ label: title, min, msg: 'Время вышло.' }] });
      f.reset();
      lastSig = sig();
      root.querySelector('#tRun').innerHTML = T.list().map(timerCard).join('');
      scrollTo({ top: 0, behavior: 'smooth' });
    });
    return () => window.removeEventListener('mc:timers', onTick);
  }
  return { title: 'Таймеры', back: '', html: build(), mount };
}
