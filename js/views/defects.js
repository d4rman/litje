import { DEFECTS } from '../data/defects.js';

const LEVEL = { danger: ['danger', '⚠️ опасно'], warn: ['warn', '🟡 частое'], tip: ['ok', '🟢 лечится'] };

export default function defects() {
  const html = `
    <div class="page-head">
      <div class="eyebrow">Раздел 9</div>
      <h1>Дефекты и решения</h1>
      <p>Найди похожую картинку — внутри причины и что делать.</p>
    </div>
    <div class="defect-grid">
      ${DEFECTS.map(d => `
        <article class="card defect" id="d-${d.id}" ${d.level === 'danger' ? 'style="border-color:rgba(255,81,72,.45)"' : ''}>
          <div class="d-top">
            <div class="d-art">${d.art}</div>
            <div>
              <span class="chip ${LEVEL[d.level][0]}">${LEVEL[d.level][1]}</span>
              <h3 style="margin-top:6px">${d.title}</h3>
              <div class="d-sub">${d.sub}</div>
            </div>
          </div>
          <details ${d.level === 'danger' ? 'open' : ''}>
            <summary>Причины и что делать</summary>
            <div class="dl-h">Почему</div>
            <ul class="dl">${d.causes.map(c => `<li><span>•</span><span>${c}</span></li>`).join('')}</ul>
            <div class="dl-h">Что делать</div>
            <ul class="dl">${d.fixes.map(c => `<li><span style="color:var(--ok)">✓</span><span>${c}</span></li>`).join('')}</ul>
          </details>
        </article>`).join('')}
    </div>`;
  return { title: 'Дефекты и решения', back: '', html };
}
