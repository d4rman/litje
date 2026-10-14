import { getMode, markSeen } from '../core.js';
import { store } from '../store.js';
import { callout, fmt } from '../ui.js';
import { icons } from '../svg/icons.js';

// Шкала термометра
const TMAX = 1600, Y0 = 510, Y1 = 30;
const yOf = T => Y0 - (T / TMAX) * (Y0 - Y1);
const tOf = y => ((Y0 - y) / (Y0 - Y1)) * TMAX;

const MARKS = [
  { id: 'ss', a: 1400, b: 1450, name: 'Нержавейка 304/316', val: '≈1400–1450 °C · дома НЕЛЬЗЯ', color: '#8a9098', kind: 'no' },
  { id: 'vevor', a: 1150, name: 'Предел печи VEVOR', val: '1150 °C', color: '#ff5148', kind: 'limit' },
  { id: 'agpour', a: 980, b: 1010, name: 'Заливка серебра 925', val: '≈980–1010 °C', color: '#ffc35c', metal: 'silver' },
  { id: 'ag', a: 962, name: 'Чистое серебро', val: '962 °C', color: '#eef3f8', metal: 'silver' },
  { id: 'ag925', a: 800, b: 890, name: 'Серебро 925 плавится', val: '≈800–890 °C', color: '#bccadb', metal: 'silver' },
  { id: 'snpour', a: 280, b: 300, name: 'Заливка олова', val: '≈280–300 °C', color: '#ff7a1a', metal: 'tin' },
  { id: 'sn', a: 232, name: 'Олово чистое', val: '232 °C', color: '#ffb26b', metal: 'tin' },
  { id: 'pewter', a: 170, b: 245, name: 'Пьютер бессвинцовый', val: '≈170–245 °C (по сплаву)', color: '#ffd27a', metal: 'tin' },
];

const PRESETS = [
  [232, 'Олово 232'], [290, 'Заливка Sn'], [845, '925 плавится'], [995, 'Заливка Ag'], [1150, 'Предел печи'], [1425, 'Нержавейка'],
];

// цвет каления по температуре
function glow(T) {
  const stops = [[0, [150, 160, 172]], [450, [170, 176, 184]], [550, [110, 22, 14]], [750, [190, 34, 22]], [900, [240, 80, 20]], [1050, [255, 140, 40]], [1250, [255, 200, 90]], [1600, [255, 245, 220]]];
  for (let i = 1; i < stops.length; i++) {
    if (T <= stops[i][0]) {
      const [t0, c0] = stops[i - 1], [t1, c1] = stops[i];
      const k = (T - t0) / (t1 - t0);
      const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
      return `rgb(${c.join(',')})`;
    }
  }
  return 'rgb(255,245,220)';
}

// раскладка подписей без наложений
function layout(mode) {
  const GAP = 36, MIN = 40, MAX = 520;
  const arr = MARKS.map(m => ({ ...m, y: yOf(m.b ? (m.a + m.b) / 2 : m.a) })).sort((p, q) => p.y - q.y);
  arr.forEach((m, i) => { m.ly = i ? Math.max(m.y, arr[i - 1].ly + GAP) : Math.max(m.y, MIN); });
  for (let i = arr.length - 1; i >= 0; i--) {
    const lim = i === arr.length - 1 ? MAX : arr[i + 1].ly - GAP;
    if (arr[i].ly > lim) arr[i].ly = lim;
  }
  return arr.map(m => ({ ...m, dim: m.metal && m.metal !== mode }));
}

function thermoSVG(mode) {
  let ticks = '';
  for (let T = 0; T <= TMAX; T += 100) {
    const y = yOf(T);
    ticks += `<path d="M${T % 200 ? 52 : 46} ${y}H60" stroke="#59616a" stroke-width="${T % 200 ? 1 : 1.6}"/>`;
    if (T % 200 === 0) ticks += `<text x="42" y="${y + 4}" text-anchor="end" class="s">${T}</text>`;
  }
  const marks = layout(mode).map(m => {
    const ya = yOf(m.a), yb = m.b ? yOf(m.b) : ya;
    const bar = m.b
      ? `<rect x="88" y="${yb}" width="9" height="${Math.max(ya - yb, 3)}" rx="3" fill="${m.color}"/>`
      : `<rect x="86" y="${ya - 1.5}" width="13" height="3" rx="1.5" fill="${m.color}"/>`;
    const yc = (ya + yb) / 2;
    const cls = m.kind === 'no' ? 'red' : m.kind === 'limit' ? 'red' : '';
    return `<g class="tm" data-id="${m.id}" data-dim="${m.dim ? 1 : 0}" opacity="${m.dim ? .42 : 1}">
      ${bar}
      <path d="M100 ${yc} L110 ${yc} L118 ${m.ly}" fill="none" stroke="${m.color}" stroke-width="1.2" opacity=".8"/>
      <text x="124" y="${m.ly - 2}" class="${cls}" style="font-size:14px;font-weight:700">${m.name}</text>
      <text x="124" y="${m.ly + 14}" class="s">${m.val}</text>
      ${m.kind === 'limit' ? `<path d="M60 ${ya}H82" stroke="#ff5148" stroke-width="2" stroke-dasharray="4 3"/>` : ''}
    </g>`;
  }).join('');
  return `
  <svg class="scene" id="thermo" viewBox="0 0 360 560" role="slider" aria-label="Температура" aria-valuemin="0" aria-valuemax="1600" tabindex="0">
    <rect x="0" y="0" width="360" height="560" fill="transparent"/>
    ${ticks}
    <rect x="60" y="${Y1 - 12}" width="24" height="${Y0 - Y1 + 30}" rx="12" fill="#121417" stroke="#3c434b" stroke-width="2"/>
    <circle cx="72" cy="${Y0 + 22}" r="22" fill="#121417" stroke="#3c434b" stroke-width="2"/>
    <ellipse id="thGlow" cx="72" cy="300" rx="34" ry="60" fill="url(#gHeat)" opacity="0"/>
    <rect id="thCol" x="65" y="300" width="14" height="230" rx="7" fill="#aab3bd"/>
    <circle id="thBulb" cx="72" cy="${Y0 + 22}" r="16" fill="#aab3bd"/>
    <path d="M68 ${Y1} V${Y0}" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
    <g id="thKnob"><path d="M58 0 H86" stroke="#fff" stroke-width="2.5"/><circle cx="72" cy="0" r="7" fill="#fff" stroke="#111" stroke-width="2"/></g>
    ${marks}
  </svg>`;
}

const STATES = [
  { id: 'sn', metal: 'tin', name: 'Олово чистое', f: T => T < 232 ? ['твёрдое', 'n'] : T < 280 ? ['жидкое, холодно для заливки', 'w'] : T <= 300 ? ['зона заливки ✓', 'ok'] : ['перегрев — больше окислов', 'bad'] },
  { id: 'pw', metal: 'tin', name: 'Пьютер б/с', f: T => T < 170 ? ['твёрдый', 'n'] : T < 245 ? ['плавится (≈, по сплаву)', 'w'] : T < 280 ? ['жидкий, холодно для заливки', 'w'] : T <= 300 ? ['зона заливки ✓', 'ok'] : ['перегрев', 'bad'] },
  { id: 'ag925', metal: 'silver', name: 'Серебро 925', f: T => T < 800 ? ['твёрдое', 'n'] : T < 890 ? ['плавится (кашица)', 'w'] : T < 980 ? ['жидкое, холодно для заливки', 'w'] : T <= 1010 ? ['зона заливки ✓', 'ok'] : ['перегрев', 'bad'] },
  { id: 'ag', metal: 'silver', name: 'Чистое серебро', f: T => T < 962 ? ['твёрдое', 'n'] : ['жидкое', 'ok'] },
  { id: 'oven', name: 'Печь VEVOR', f: T => T <= 1150 ? ['достаёт ✓', 'ok'] : ['не достанет (макс. 1150)', 'bad'] },
  { id: 'ss', name: 'Нержавейка', f: T => T < 1400 ? ['твёрдая', 'n'] : ['плавится · дома НЕЛЬЗЯ', 'bad'] },
];
const TONE = { n: ['#70767e', 'var(--muted)'], w: ['#ffc53d', '#ffc53d'], ok: ['#45d483', '#45d483'], bad: ['#ff5148', '#ff8f88'] };

function metalCards(mode) {
  const tin = `
    <article class="card metal-card">
      <div class="mc-top"><div class="mc-sym" style="background:var(--fire-grad)">Sn</div><div><h3>Олово / пьютер</h3><div class="muted small">учебный металл</div></div></div>
      <dl class="kv">
        <dt>Плавление (чистое)</dt><dd class="num">232 °C</dd>
        <dt>Пьютер бессвинцовый</dt><dd class="num">≈170–245 °C</dd>
        <dt>Заливка</dt><dd class="num">≈280–300 °C</dd>
        <dt>Плотность</dt><dd class="num">≈7,3 г/см³</dd>
      </dl>
      <div style="margin-top:12px">${callout('danger', '<b>Только бессвинцовое.</b> Свинец ядовит (пары, пыль) и запрещён в украшениях. Ищи «bezołowiowa» / «lead-free».')}</div>
    </article>`;
  const ag = `
    <article class="card metal-card">
      <div class="mc-top"><div class="mc-sym" style="background:var(--silver-grad)">Ag</div><div><h3>Серебро 925</h3><div class="muted small">92,5 % серебра + медь</div></div></div>
      <dl class="kv">
        <dt>Плавление</dt><dd class="num">≈800–890 °C</dd>
        <dt>Чистое серебро</dt><dd class="num">962 °C</dd>
        <dt>Заливка</dt><dd class="num">≈980–1010 °C</dd>
        <dt>Плотность</dt><dd class="num">≈10,36 г/см³</dd>
      </dl>
      <div style="margin-top:12px">${callout('danger', '<b>Олово в серебре = хрупкое серебро.</b> Разные тигли, никогда не смешивать.')}</div>
    </article>`;
  return `
    <div class="metal-cards">
      ${mode === 'silver' ? ag + tin : tin + ag}
      <article class="card metal-card">
        <div class="mc-top"><div class="mc-sym" style="background:#59616a;color:#fff">Fe</div><div><h3>Нержавейка 304/316</h3><div class="muted small">не для домашней печи</div></div></div>
        <dl class="kv"><dt>Плавление</dt><dd class="num">≈1400–1450 °C</dd></dl>
        <div style="margin-top:12px">${callout('danger', '<b>Дома НЕЛЬЗЯ.</b> Только заказ металлической 3D-печати 316L.')}</div>
      </article>
      <article class="card metal-card">
        <div class="mc-top"><div class="mc-sym" style="background:#d23a2c;color:#fff">${icons.flame.replace('<svg', '<svg width="26" height="26"')}</div><div><h3>Печь VEVOR 1350 Вт</h3><div class="muted small">мой предел</div></div></div>
        <dl class="kv">
          <dt>Максимум</dt><dd class="num">1150 °C</dd>
          <dt>Запас над заливкой серебра</dt><dd class="num">≈140 °C</dd>
        </dl>
        <div style="margin-top:12px">${callout('tip', 'Олово и серебро — с запасом. Нержавейка — нет.')}</div>
      </article>
    </div>
    <div class="section-title">Плотность → вес</div>
    <div class="card">
      <div class="calc-out">
        <div class="big-stat"><small>1 см³ олова / пьютера</small><b class="num">≈7,3 г</b></div>
        <div class="big-stat"><small>1 см³ серебра 925</small><b class="num">≈10,36 г</b></div>
      </div>
      <p class="muted small" style="margin-top:10px">Та же модель в серебре тяжелее в ≈${fmt(10.36 / 7.3, 2)} раза.</p>
      <a class="btn block" style="margin-top:12px" href="#/calc">${icons.scale} Посчитать по объёму из Fusion</a>
    </div>`;
}

export default function metals() {
  const mode = getMode();
  markSeen('metals');
  const html = `
    <div class="page-head">
      <div class="eyebrow">Раздел 1</div>
      <h1>Металлы и температуры</h1>
      <p>Тяни термометр пальцем — увидишь, что происходит с каждым металлом.</p>
    </div>
    <div class="thermo-wrap">
      <div class="card thermo-card">${thermoSVG(mode)}</div>
      <div class="stack" style="align-content:start">
        <div class="card">
          <div class="row">
            <div class="temp-readout"><b class="num" id="tVal">0</b><span>°C</span></div>
            <span class="spacer"></span>
            <button class="icon-btn" data-step="-10" aria-label="Минус 10 градусов">−</button>
            <button class="icon-btn" data-step="10" aria-label="Плюс 10 градусов">+</button>
          </div>
          <div class="preset-row" style="margin-top:12px">
            ${PRESETS.map(([t, l]) => `<button class="chip" data-t="${t}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="state-list" id="states"></div>
      </div>
    </div>
    <div class="section-title">Карточки металлов</div>
    ${metalCards(mode)}`;

  function mount(root) {
    const svg = root.querySelector('#thermo');
    const col = svg.querySelector('#thCol'), bulb = svg.querySelector('#thBulb'), knob = svg.querySelector('#thKnob'), gl = svg.querySelector('#thGlow');
    const $val = root.querySelector('#tVal'), $states = root.querySelector('#states');
    let T = store.get('thermoT', mode === 'silver' ? 995 : 290);

    const order = mode === 'silver' ? ['ag925', 'ag', 'oven', 'sn', 'pw', 'ss'] : ['sn', 'pw', 'ag925', 'ag', 'oven', 'ss'];
    function set(t) {
      T = Math.max(0, Math.min(TMAX, Math.round(t / 5) * 5));
      const y = yOf(T), c = glow(T);
      col.setAttribute('y', y); col.setAttribute('height', Y0 + 22 - y); col.setAttribute('fill', c);
      bulb.setAttribute('fill', c);
      knob.setAttribute('transform', `translate(0 ${y})`);
      gl.setAttribute('cy', y); gl.setAttribute('opacity', T > 520 ? Math.min(.9, (T - 520) / 500) : 0);
      svg.setAttribute('aria-valuenow', T);
      $val.textContent = T;
      $val.style.color = T > 520 ? c : '';
      svg.querySelectorAll('.tm').forEach(g => {
        const m = MARKS.find(x => x.id === g.dataset.id);
        const lo = m.a - 4, hi = (m.b || m.a) + 4;
        const on = T >= lo && T <= hi;
        g.style.filter = on ? 'drop-shadow(0 0 6px ' + m.color + ')' : '';
        g.setAttribute('opacity', on || g.dataset.dim !== '1' ? 1 : .42);
      });
      $states.innerHTML = order.map(id => {
        const s = STATES.find(x => x.id === id);
        const [txt, tone] = s.f(T);
        const [dot, col2] = TONE[tone];
        const dim = s.metal && s.metal !== mode;
        return `<div class="state-row" style="${dim ? 'opacity:.6' : ''}"><i style="background:${dot}"></i><span>${s.name}</span><em style="color:${col2}">${txt}</em></div>`;
      }).join('');
    }
    const save = () => store.set('thermoT', T);
    set(T);

    const toT = e => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return tOf(p.y);
    };
    let drag = false;
    svg.addEventListener('pointerdown', e => { drag = true; svg.setPointerCapture(e.pointerId); set(toT(e)); });
    svg.addEventListener('pointermove', e => { if (drag) set(toT(e)); });
    const end = () => { if (drag) { drag = false; save(); } };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('keydown', e => {
      const d = { ArrowUp: 10, ArrowRight: 10, ArrowDown: -10, ArrowLeft: -10, PageUp: 100, PageDown: -100 }[e.key];
      if (d) { e.preventDefault(); set(T + d); save(); }
    });
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-t],[data-step]');
      if (!b) return;
      set(b.dataset.t ? +b.dataset.t : T + +b.dataset.step);
      save();
    });
  }
  return { title: 'Металлы и температуры', back: '', html, mount };
}
