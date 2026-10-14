import { RULES, FUSION_TIPS } from '../data/modeling.js';
import { store } from '../store.js';
import { icons } from '../svg/icons.js';
import { callout } from '../ui.js';

export default function modeling() {
  const seenR = store.get('rulesSeen', {});
  const html = `
    <div class="page-head">
      <div class="eyebrow">Раздел 3</div>
      <h1>Моделирование под литьё</h1>
      <p>FDM-принтер + Fusion 360. Нажми на картинку — переключится «неправильно / правильно».</p>
    </div>
    <div class="row wrap" style="margin-bottom:14px">
      <span class="chip acc">слой 0,08–0,12 мм</span>
      <span class="chip acc">сопло 0,2 мм</span>
      <span class="chip acc">уклон 1–3°</span>
      <span class="chip acc">стенки ≥ ≈1 мм</span>
      <span class="chip acc">плита 2–3 мм</span>
    </div>
    <div class="rule-grid">
      ${RULES.map((r, i) => `
        <article class="card rule-card">
          <div class="rule-art ${seenR[r.id] ? 'good' : ''}" data-rule="${r.id}" role="button" tabindex="0" aria-label="${r.title}: переключить правильно/неправильно">
            <svg class="scene" viewBox="0 0 320 200" aria-hidden="true">
              <g class="ra-b">${r.bad}</g>
              <g class="ra-g">${r.good}</g>
            </svg>
            <div class="rule-tog"><span class="t-b">✗ неправильно</span><span class="t-g">✓ правильно</span></div>
            <span class="rule-tap">нажми</span>
          </div>
          <h3>${i + 1}. ${r.title}</h3>
          <p>${r.text}</p>
        </article>`).join('')}
    </div>
    <div class="section-title">Fusion 360 — где что</div>
    <div class="card stack" style="gap:10px">
      ${FUSION_TIPS.map(([k, v]) => `<div class="row" style="align-items:flex-start"><span class="chip" style="min-width:92px;justify-content:center">${k}</span><span>${v}</span></div>`).join('')}
      <a class="btn block" href="#/calc">${icons.scale} Объём → калькулятор металла</a>
    </div>
    <div class="section-title">Перед печатью</div>
    <div class="callouts">
      ${callout('tip', 'Печатай модель целиком с литником и каналами — режь меньше ножом.')}
      ${callout('warn', 'Тонкие детали < ≈1 мм в земле Delft осыпаются, а в металле не проливаются.')}
      ${callout('info', 'Позже, для литья по выплавляемым моделям, понадобятся печь для выжигания и вакуум — см. «Покупки → Позже».')}
    </div>`;

  function mount(root) {
    const flip = el => {
      el.classList.toggle('good');
      if (el.classList.contains('good')) store.patch('rulesSeen', s => ({ ...s, [el.dataset.rule]: true }));
    };
    root.addEventListener('click', e => { const el = e.target.closest('[data-rule]'); if (el) flip(el); });
    root.addEventListener('keydown', e => {
      const el = e.target.closest('[data-rule]');
      if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); flip(el); }
    });
  }
  return { title: 'Моделирование', back: '', html, mount };
}
