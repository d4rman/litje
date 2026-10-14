import { icons } from '../svg/icons.js';
import { scene } from '../svg/scenes.js';
import { getMode, wizState, groupProgress, safetyStatus } from '../core.js';
import { store } from '../store.js';
import { wizardById, wizardsOf } from '../data/wizards.js';
import { GEAR } from '../data/gear.js';
import { RULES } from '../data/modeling.js';
import { esc, plural } from '../ui.js';
import { runningCount } from '../timers-core.js';

const SECTIONS = [
  { n: 1, to: 'metals', ico: 'thermo', t: 'Металлы и температуры', s: 'Термометр 0–1600 °C' },
  { n: 2, to: 'gear', ico: 'cart', t: 'Оборудование и покупки', s: 'Чек-лист и сумма' },
  { n: 3, to: 'model', ico: 'cube', t: 'Моделирование', s: 'FDM + Fusion 360' },
  { n: 4, to: 'tin', ico: 'crucible', t: 'Процесс: олово', s: 'Гипс, силикон, плавка', mode: 'tin' },
  { n: 5, to: 'silver', ico: 'rings', t: 'Процесс: серебро', s: 'Delft clay, плавка, отбел', mode: 'silver' },
  { n: 6, to: 'safety', ico: 'shield', t: 'Перед заливкой', s: 'Чек-лист безопасности' },
  { n: 7, to: 'calc', ico: 'scale', t: 'Калькулятор металла', s: 'Объём → вес → цена' },
  { n: 8, to: 'timers', ico: 'timer', t: 'Таймеры', s: 'Гипс, печь, сушка' },
  { n: 9, to: 'defects', ico: 'magnifier', t: 'Дефекты и решения', s: 'Что пошло не так' },
  { n: 10, to: 'journal', ico: 'book', t: 'Журнал отливок', s: 'Прогресс и фото' },
];

function progressFor(to) {
  if (to === 'gear') {
    const g = store.get('gear', {});
    const items = GEAR.filter(x => !x.later).flatMap(x => x.items).concat((g.custom || []).filter(c => c.group !== 'later'));
    const b = items.filter(i => g.bought?.[i.id]).length;
    return { p: items.length ? b / items.length : 0, s: `куплено ${b} из ${items.length}` };
  }
  if (to === 'model') {
    const seenR = store.get('rulesSeen', {});
    const n = RULES.filter(r => seenR[r.id]).length;
    return { p: n / RULES.length, s: n ? `разобрано ${n} из ${RULES.length}` : null };
  }
  if (to === 'tin' || to === 'silver') return { p: groupProgress(to) };
  if (to === 'safety') { const s = safetyStatus(); return { p: s.done / s.total, s: s.done ? `${s.done} из ${s.total} отмечено` : null }; }
  if (to === 'journal') {
    const n = store.get('journal', []).length;
    return { s: n ? `${n} ${plural(n, 'отливка', 'отливки', 'отливок')}` : null };
  }
  if (to === 'timers') { const n = runningCount(); return { s: n ? `идёт: ${n}` : null }; }
  return {};
}

function continueCard(mode) {
  const lastMap = store.get('lastWiz', {});
  const last = lastMap && typeof lastMap === 'object' ? lastMap[mode] : null;
  let w = last && wizardById(last);
  let st = w && wizState(w.id);
  if (!w || st.done) {
    // первый незавершённый мастер текущего режима
    w = wizardsOf(mode).find(x => !wizState(x.id).done) || wizardsOf(mode)[0];
    st = wizState(w.id);
  }
  const step = Math.min(st.step, w.steps.length - 1);
  const fresh = !st.max && !st.step;
  return `
    <a class="card card-link continue-card" href="#/w/${w.id}">
      <span class="cc-ico">${icons[fresh ? 'play' : 'next']}</span>
      <span class="cc-txt"><span>${fresh ? 'Начать' : 'Продолжить'} · шаг ${step + 1} из ${w.steps.length}</span><b>${esc(w.title)}</b><span>${esc(w.steps[step].t)}</span></span>
      ${icons.next}
    </a>`;
}

export default function home() {
  const mode = getMode();
  const html = `
    <section class="hero">
      <div style="padding-bottom:6px">
        <div class="eyebrow">${mode === 'silver' ? 'Режим: серебро 925' : 'Режим: олово · учёба'}</div>
        <h1>Мастерская <span class="grad-text">литья</span></h1>
        <p>${mode === 'silver'
          ? 'Delft clay, бура, ≈980–1010 °C и отбел. Одно движение — и готово.'
          : 'Учимся на олове: ≈280–300 °C, дёшево, ошибки не страшны. Потом — серебро.'}</p>
      </div>
      <div class="hero-art">${scene('hero', { mode })}</div>
    </section>
    ${continueCard(mode)}
    <div class="section-title">Разделы</div>
    <div class="sec-grid">
      ${SECTIONS.map(s => {
        const pr = progressFor(s.to);
        const hot = s.mode === mode || (s.to === 'safety');
        return `<a class="sec-card ${hot ? 'hot' : ''}" href="#/${s.to}">
          <span class="sc-num">${s.n}</span>
          <span class="sc-ico">${icons[s.ico]}</span>
          <b>${s.t}</b>
          <span class="sc-sub">${esc(pr.s || s.s)}</span>
          ${pr.p != null ? `<span class="sc-bar"><i style="width:${Math.round(pr.p * 100)}%"></i></span>` : ''}
        </a>`;
      }).join('')}
    </div>
    <div class="foot">
      <a class="btn small ghost" href="#/data">${icons.data} Данные, копия и установка</a>
      <span>Личный гайд домашней мастерской · работает без интернета</span>
    </div>`;
  return { title: 'Мастерская литья', html };
}
