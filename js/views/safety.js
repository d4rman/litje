import { SAFETY, safetyState, setSafety, safetyStatus } from '../core.js';
import { icons } from '../svg/icons.js';
import { callout, toast } from '../ui.js';

const emit = () => window.dispatchEvent(new CustomEvent('mc:safety'));

export default function safety() {
  function build() {
    const s = safetyState();
    const st = safetyStatus();
    const ready = st.ready;
    return `
      <div class="page-head">
        <div class="eyebrow" style="color:var(--danger)">Раздел 6 · перед каждой заливкой</div>
        <h1>Чек-лист безопасности</h1>
        <p>Отметь всё — только тогда кнопка «Готов к заливке» станет активной. Отметки сбрасываются через 8 часов.</p>
      </div>
      <div class="safety-progress" style="margin-bottom:14px">
        <div class="molten-bar"><i style="width:${(st.done / st.total) * 100}%"></i></div>
        <b class="num">${st.done}/${st.total}</b>
      </div>
      ${ready ? `
        <div class="card ready-banner" style="margin-bottom:14px">
          ${icons.shield.replace('<svg', '<svg style="color:var(--ok)"')}
          <h2>Можно лить</h2>
          <p class="muted">Отмечено в ${new Date(s.readyAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}. Одно движение, без пауз. Удачи!</p>
        </div>` : ''}
      <div class="stack" style="gap:8px">
        ${SAFETY.map(x => `
          <label class="check ${s.checks[x.id] ? 'on' : ''}" data-id="${x.id}">
            <input type="checkbox" ${s.checks[x.id] ? 'checked' : ''}>
            <span class="box">${icons.check}</span>
            <span class="ct"><b>${x.t}</b><small>${x.s}</small></span>
            <span style="color:var(--dim)">${icons[x.ico].replace('<svg', '<svg width="22" height="22"')}</span>
          </label>`).join('')}
      </div>
      <div class="stack" style="margin-top:16px">
        <button class="btn primary block ready-btn" data-ready ${st.all && !ready ? '' : 'disabled'}>${ready ? '✓ Готов к заливке' : `${icons.flame} Готов к заливке`}</button>
        ${st.done ? '<button class="btn ghost block" data-reset>Новая сессия — снять все отметки</button>' : ''}
      </div>
      <div class="section-title" style="color:var(--danger)">Если что-то пошло не так</div>
      <div class="callouts emergency">
        ${callout('danger', '<b>Ожог:</b> сразу под прохладную проточную воду ≈20 мин. Потом гель от ожогов. Сильный ожог — 112.')}
        ${callout('danger', '<b>Расплав пролился:</b> не трогать и не лить воду. Засыпать сухим песком, дать остыть.')}
        ${callout('danger', '<b>Огонь:</b> порошковый огнетушитель. Не справляешься — выйти и звонить 112.')}
        ${callout('warn', '<b>Дым, головная боль, сработал датчик CO:</b> выключить печь, выйти на воздух, проветрить.')}
      </div>`;
  }

  function mount(root) {
    const redraw = () => { const y = scrollY; root.innerHTML = build(); scrollTo(0, y); emit(); };
    root.addEventListener('click', e => {
      const lab = e.target.closest('label.check[data-id]');
      if (lab) {
        e.preventDefault();
        const s = safetyState();
        const checks = { ...s.checks, [lab.dataset.id]: !s.checks[lab.dataset.id] };
        const all = SAFETY.every(x => checks[x.id]);
        setSafety({ checks, readyAt: all ? s.readyAt : 0 });
        redraw();
        return;
      }
      if (e.target.closest('[data-ready]')) {
        const s = safetyState();
        setSafety({ ...s, readyAt: Date.now() });
        try { navigator.vibrate?.(60); } catch {}
        toast('🔥 Всё проверено. Можно лить!');
        redraw();
        scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (e.target.closest('[data-reset]')) {
        setSafety({ checks: {}, readyAt: 0 });
        redraw();
      }
    });
  }
  return { title: 'Перед заливкой', back: '', html: build(), mount };
}
