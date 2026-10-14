import { wizardsOf } from '../data/wizards.js';
import { scene } from '../svg/scenes.js';
import { icons } from '../svg/icons.js';
import { wizState, wizProgress, getMode } from '../core.js';
import { callout, esc } from '../ui.js';

const INFO = {
  tin: {
    n: 4, title: 'Процесс: олово', lead: 'Учебный металл: низкая температура, дешёвые ошибки. Те же движения, что и с серебром.',
    notes: [
      ['danger', '<b>Только бессвинцовое олово / пьютер.</b> Отдельный тигель — только для олова.'],
      ['tip', 'Порядок: сначала гипсовая форма (сохнет 3–7 дней) → плавка олова → силиконовая форма.'],
    ],
    order: ['plaster', 'tinmelt', 'silicone'],
  },
  silver: {
    n: 5, title: 'Процесс: серебро', lead: 'Delft clay: форма из земли в двух кольцах, плавка ≈980–1010 °C, отбел.',
    notes: [
      ['danger', '<b>Олово в серебре = хрупкое серебро.</b> Разные тигли, никогда не смешивать.'],
      ['tip', 'Сначала набей руку на олове: те же движения, но ≈300 °C вместо ≈1000.'],
    ],
    order: ['delft', 'silvermelt', 'silverfinish'],
  },
};

export default function process([group]) {
  const info = INFO[group];
  const ws = info.order.map(id => wizardsOf(group).find(w => w.id === id));
  const mode = getMode();
  const html = `
    <div class="page-head">
      <div class="eyebrow">Раздел ${info.n}${group !== mode ? ` · другой режим` : ''}</div>
      <h1>${info.title}</h1>
      <p>${info.lead}</p>
    </div>
    <div class="callouts" style="margin-bottom:16px">${info.notes.map(([t, h]) => callout(t, h)).join('')}</div>
    <div class="wiz-list">
      ${ws.map((w, i) => {
        const st = wizState(w.id);
        const p = wizProgress(w.id);
        const [sc, opt] = w.steps[Math.min(st.step, w.steps.length - 1)].scene;
        return `
        <a class="card card-link wiz-card" href="#/w/${w.id}">
          <div class="wc-art">${scene(sc, opt)}</div>
          <div>
            <div class="row" style="gap:6px"><span class="chip ${st.done ? 'ok' : 'acc'}">${st.done ? '✓ пройдено' : `${String.fromCharCode(1072 + i)})`}</span><span class="muted small">${w.steps.length} шагов</span></div>
            <b style="margin-top:6px">${esc(w.title)}</b>
            <div class="muted">${esc(w.sub)}</div>
            <div class="molten-bar"><i style="width:${Math.round(p * 100)}%"></i></div>
          </div>
        </a>`;
      }).join('')}
    </div>
    <div class="section-title">Под рукой</div>
    <div class="row wrap">
      <a class="btn" href="#/safety">${icons.shield} Чек-лист заливки</a>
      <a class="btn" href="#/calc">${icons.scale} Калькулятор</a>
      <a class="btn" href="#/timers">${icons.timer} Таймеры</a>
      <a class="btn" href="#/defects">${icons.magnifier} Дефекты</a>
    </div>`;
  return { title: info.title, back: '', html };
}
