// SVG-сцены для мастеров. Все рисунки — свои, в коде. viewBox 400×300.
// Анимации — SMIL (<animate>/<animateTransform>): работают в Safari и Chrome без JS.

let N = 0;
const id = p => `${p}${(++N).toString(36)}`;

const svg = (body, label = '', vb = '0 0 400 300') =>
  `<svg class="scene" viewBox="${vb}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

// ---------- анимация ключевыми кадрами ----------
function timing(frames, dur, o = {}) {
  const kts = frames.map(f => f[0]).join(';');
  const vals = frames.map(f => f[1]).join(';');
  const rep = o.once ? 'fill="freeze"' : 'repeatCount="indefinite"';
  const ease = o.ease ? `calcMode="spline" keySplines="${Array(frames.length - 1).fill('.45 0 .25 1').join(';')}"` : '';
  return `dur="${dur}s" ${rep} keyTimes="${kts}" values="${vals}" ${ease} ${o.begin ? `begin="${o.begin}"` : ''}`;
}
const kf = (attr, frames, dur, o) => `<animate attributeName="${attr}" ${timing(frames, dur, o)}/>`;
const kt = (type, frames, dur, o) => `<animateTransform attributeName="transform" type="${type}" ${timing(frames, dur, o)}/>`;
// показать элемент только в окне [a, b] доли цикла
const win = (a, b, dur, fade = .02) => {
  const end = [[b, 1], [Math.min(b + fade, .9999), 0], [1, 0]];
  return kf('opacity', a <= fade ? [[0, 1], ...end] : [[0, 0], [a - fade, 0], [a, 1], ...end], dur);
};

// ---------- подписи ----------
const C = { W: '#ece7df', A: '#ffb347', B: '#8fd0ff', R: '#ff5148', G: '#45d483' };
const tw = s => s.length * 7.1 + 18;
function tag(x, y, s, cls = '', anchor = 'middle') {
  const w = tw(s);
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return `<g><rect x="${x0}" y="${y - 14}" width="${w}" height="22" rx="11" class="lbl-bg"/><text x="${x0 + w / 2}" y="${y + 1.5}" text-anchor="middle" class="s ${cls}">${s}</text></g>`;
}
const lead = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#8a9098" stroke-width="1.2" stroke-dasharray="3 3"/>`;
const arrow = (d, c = 'W', w = 2.5) => `<path d="${d}" fill="none" stroke="${C[c]}" stroke-width="${w}" stroke-linecap="round" marker-end="url(#mArr${c})"/>`;
const tick = (x, y, r = 11) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="#123a24" stroke="#45d483" stroke-width="2"/><path d="M${x - r * .45} ${y}l${r * .3} ${r * .32} ${r * .55}-${r * .62}" fill="none" stroke="#45d483" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const cross = (x, y, r = 12) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="#3a1110" stroke="#ff5148" stroke-width="2"/><path d="M${x - r * .4} ${y - r * .4}l${r * .8} ${r * .8}M${x + r * .4} ${y - r * .4}l-${r * .8} ${r * .8}" stroke="#ff5148" stroke-width="2.4" stroke-linecap="round"/></g>`;

const molten = m => (m === 'silver' ? 'url(#gMoltenSilver)' : 'url(#gMoltenTin)');
const solid = m => (m === 'silver' ? 'url(#gSolidSilver)' : 'url(#gSolidTin)');

// ---------- общие предметы ----------
const bench = (y = 262) => `<rect x="0" y="${y}" width="400" height="${300 - y}" fill="#17191c"/><rect x="0" y="${y}" width="400" height="2.5" fill="#2e3339"/>`;
const heatWaves = (x, y, n = 3, dur = 2.4, color = '#ffb347') => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const xi = x + (i - (n - 1) / 2) * 16;
    s += `<path d="M${xi} ${y} q-6 -8 0 -16 q6 -8 0 -16" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0">
      ${kf('opacity', [[0, 0], [.3, .8], [1, 0]], dur, { begin: `${i * dur / n}s` })}
      ${kt('translate', [[0, '0 0'], [1, '0 -14']], dur, { begin: `${i * dur / n}s` })}</path>`;
  }
  return s;
};

// сердечко-кулон (вид на плоскость разъёма), центр (cx, cy)
const heartD = (cx, cy, s = 1) => {
  const p = (x, y) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  return `M${p(0, -18)} C${p(-8, -34)} ${p(-32, -36)} ${p(-34, -14)} C${p(-36, 6)} ${p(-14, 22)} ${p(0, 36)} C${p(14, 22)} ${p(36, 6)} ${p(34, -14)} C${p(32, -36)} ${p(8, -34)} ${p(0, -18)} Z`;
};

// модель (PLA) в разрезе — «линза», опционально с шурупом-ручкой
const modelLens = (cx, cy, rx = 40, ry = 14, screw = true, op = 1) => `
  <g opacity="${op}">
    ${screw ? `<rect x="${cx - 2}" y="${cy - ry - 18}" width="4" height="20" fill="#9aa3ad"/><rect x="${cx - 8}" y="${cy - ry - 22}" width="16" height="5" rx="2" fill="#c3cad2"/>` : ''}
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#gModel)" stroke="#a6f5ea" stroke-opacity=".55"/>
    <ellipse cx="${cx - rx * .3}" cy="${cy - ry * .45}" rx="${rx * .35}" ry="${ry * .22}" fill="#fff" opacity=".25"/>
  </g>`;

// тигель: локальные координаты, левый край носика = (-34, -42)
const CRU_OUT = 'M-34 -42 L34 -42 L26 26 Q24 34 16 34 L-16 34 Q-24 34 -26 26 Z';
const CRU_IN = 'M-27 -40 L27 -40 L20 22 Q19 27 13 27 L-13 27 Q-19 27 -20 22 Z';
function crucible({ metal = 'tin', level = -18, levelAnim = '', counter = '', empty = false, glow, tongs = false, granules = false } = {}) {
  const cid = id('cru');
  const g = glow ?? metal === 'silver';
  return `
    <clipPath id="${cid}"><path d="${CRU_IN}"/></clipPath>
    ${g && !empty ? `<ellipse cx="0" cy="-10" rx="70" ry="62" fill="url(#gHeat)" opacity=".55"/>` : ''}
    <path d="${CRU_OUT}" fill="url(#gGraphite)" stroke="#6a7078" stroke-width="1.5"/>
    <path d="${CRU_IN}" fill="#141618"/>
    ${empty ? '' : `<g clip-path="url(#${cid})"><g>${counter}
      <rect x="-80" y="${level}" width="160" height="140" fill="${molten(metal)}">${levelAnim}</rect>
      <rect x="-80" y="${level}" width="160" height="2.5" fill="#fff" opacity=".75">${levelAnim}</rect>
    </g></g>`}
    ${granules ? granulesIn() : ''}
    <path d="M-35 -42 L35 -42" stroke="#80878f" stroke-width="3.5" stroke-linecap="round"/>
    ${tongs ? `<path d="M24 -14 L96 -58 M22 2 L100 -44" stroke="#9aa2ab" stroke-width="4.5" stroke-linecap="round"/><path d="M96 -58 L126 -76 M100 -44 L130 -62" stroke="#c34a2c" stroke-width="7" stroke-linecap="round"/>` : ''}`;
}
const granulesIn = () => {
  let s = '';
  const pts = [[-12, 18], [-3, 20], [6, 19], [14, 17], [-8, 11], [1, 12], [10, 10], [-15, 8], [-4, 4], [5, 5], [13, 3], [-10, -2], [0, -3], [9, -4]];
  pts.forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="4.2" fill="url(#gSolidSilver)" stroke="#7e8a97" stroke-width=".6"/>`));
  return s;
};

// Узел «тигель на щипцах + струя»: носик (lipX, lipY), струя до (tx, ty)
function pourRig({ lipX, lipY, tx, ty, metal, dur, s = .8, T }) {
  const piv = '-34 -42';
  const rot = [[0, `0 ${piv}`], [T.a, `0 ${piv}`], [T.b, `-62 ${piv}`], [T.c, `-62 ${piv}`], [T.d, `0 ${piv}`], [1, `0 ${piv}`]];
  const counter = kt('rotate', rot.map(([t, v]) => [t, v.replace(/^-?\d+/, m => String(-parseFloat(m)))]), dur, { ease: true });
  const lev = kf('y', [[0, -18], [T.a, -18], [T.b, -46], [T.c, -38], [T.d, 12], [.985, 12], [1, -18]], dur);
  const sid = id('st');
  return `
    <g transform="translate(${lipX + 34 * s} ${lipY + 42 * s}) scale(${s})">
      <g>${kt('rotate', rot, dur, { ease: true })}
        ${crucible({ metal, level: -18, levelAnim: lev, counter, tongs: true })}
      </g>
    </g>
    <g opacity="0">${win(T.b - .015, T.c + .01, dur)}
      <path id="${sid}" d="M${lipX} ${lipY} C${lipX - 3} ${lipY + 18} ${tx + 1} ${(lipY + ty) / 2} ${tx} ${ty}" fill="none" stroke="${molten(metal)}" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M${lipX} ${lipY} C${lipX - 3} ${lipY + 18} ${tx + 1} ${(lipY + ty) / 2} ${tx} ${ty}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" stroke-dasharray="6 10">
        ${kf('stroke-dashoffset', [[0, 32], [1, 0]], .45)}</path>
      ${metal === 'silver' ? `<circle cx="${tx}" cy="${ty}" r="26" fill="url(#gHeat)" opacity=".8"/>` : ''}
    </g>`;
}

// ---------- геометрия формы «вид на разъём» (гипс/силикон) ----------
const FACE = {
  block: [136, 118, 128, 138],
  heart: heartD(200, 200),
  sprue: 'M182 118 L218 118 L206 142 L206 186 L194 186 L194 142 Z',
  ventL: 'M176 173 L182 170 L166 118 L160 118 Z',
  ventR: 'M224 173 L218 170 L234 118 L240 118 Z',
};
// ---------- геометрия Delft-колец для заливки (разрез) ----------
const DELFT = {
  lens: 'M160 195 Q200 177 240 195 Q200 213 160 195 Z',
  sprue: 'M184 140 L216 140 L205 158 L205 186 L195 186 L195 158 Z',
  ventL: 'M163 192 L169 189 L155 140 L149 140 Z',
  ventR: 'M237 192 L231 189 L245 140 L251 140 Z',
};

function moldFace(kind, { cavity = false, straps = false } = {}) {
  const [x, y, w, h] = FACE.block;
  const fill = kind === 'silicone' ? 'url(#gSilicone)' : 'url(#pPlaster)';
  const edge = kind === 'silicone' ? '#e98a7b' : '#fffaf0';
  const rec = kind === 'silicone' ? '#5c1b14' : '#3a332b';
  return `
    ${kind === 'silicone' ? `<rect x="${x - 14}" y="${y + 6}" width="10" height="${h - 6}" rx="2" fill="url(#gWood)"/><rect x="${x + w + 4}" y="${y + 6}" width="10" height="${h - 6}" rx="2" fill="url(#gWood)"/>` : ''}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${edge}" stroke-opacity=".35"/>
    ${cavity ? `<path d="${FACE.heart}" fill="${rec}"/><path d="${FACE.sprue}" fill="${rec}"/><path d="${FACE.ventL}" fill="${rec}"/><path d="${FACE.ventR}" fill="${rec}"/>` : ''}
    ${straps ? `<rect x="${x - 16}" y="150" width="${w + 32}" height="7" rx="3.5" fill="#30353b" stroke="#6b737c"/><rect x="${x - 16}" y="226" width="${w + 32}" height="7" rx="3.5" fill="#30353b" stroke="#6b737c"/>` : ''}`;
}

function delftRingsPour() {
  const ring = (y, h) => `<rect x="120" y="${y}" width="160" height="${h}" fill="url(#pSand)"/><rect x="114" y="${y}" width="7" height="${h}" fill="url(#gSteel)"/><rect x="279" y="${y}" width="7" height="${h}" fill="url(#gSteel)"/>`;
  return `${ring(141, 53)}${ring(196, 54)}
    <path d="M114 195H286" stroke="#2a1d12" stroke-width="2"/>
    <rect x="108" y="190" width="6" height="10" fill="#8f98a2"/><rect x="286" y="190" width="6" height="10" fill="#8f98a2"/>
    <path d="${DELFT.lens}" fill="#24180f"/><path d="${DELFT.sprue}" fill="#24180f"/><path d="${DELFT.ventL}" fill="#24180f"/><path d="${DELFT.ventR}" fill="#24180f"/>`;
}

const sandTray = () => `<rect x="92" y="250" width="216" height="12" fill="url(#pSandDry)"/><path d="M88 244 V262 H312 V244" fill="none" stroke="#8b939c" stroke-width="3.5" stroke-linejoin="round"/>`;

// ========================================================================
const S = {};

// ---------- ЗАЛИВКА (главная анимация) ----------
S.pour = ({ mold = 'plaster', metal = 'tin', hero = false } = {}) => {
  const dur = 7;
  const T = { a: .1, b: .22, c: .56, d: .66 };
  const isDelft = mold === 'delft';
  const g = isDelft ? DELFT : FACE;
  const cid = id('cav');
  const top = isDelft ? 140 : 118, bottom = isDelft ? 210 : 238;
  const lip = isDelft ? [207, 74] : [207, 54];
  const fillY = kf('y', [[0, bottom], [T.b + .03, bottom], [T.c, top - 3], [.97, top - 3], [.975, bottom], [1, bottom]], dur);
  const colH = kf('height', [[0, 0], [T.b, 0], [T.b + .04, bottom - top], [1, bottom - top]], dur);
  const vis = kf('opacity', [[0, 0], [T.b, 0], [T.b + .005, 1], [.965, 1], [.975, 0], [1, 0]], dur);
  const cool = kf('opacity', [[0, 0], [T.d, 0], [.92, 1], [.965, 1], [.975, 0], [1, 0]], dur);
  const bubbles = [0, 1, 2].map(i => `
    <circle cx="${isDelft ? 151 : 162}" cy="${top}" r="2.6" fill="none" stroke="#8fd0ff" stroke-width="1.4" opacity="0">
      ${kf('opacity', [[0, 0], [T.b + .05 + i * .08, 0], [T.b + .07 + i * .08, 1], [T.b + .16 + i * .08, 0], [1, 0]], dur)}
      ${kf('cy', [[0, top], [T.b + .05 + i * .08, top], [T.b + .16 + i * .08, top - 30], [1, top - 30]], dur)}</circle>
    <circle cx="${isDelft ? 249 : 238}" cy="${top}" r="2.6" fill="none" stroke="#8fd0ff" stroke-width="1.4" opacity="0">
      ${kf('opacity', [[0, 0], [T.b + .09 + i * .08, 0], [T.b + .11 + i * .08, 1], [T.b + .2 + i * .08, 0], [1, 0]], dur)}
      ${kf('cy', [[0, top], [T.b + .09 + i * .08, top], [T.b + .2 + i * .08, top - 30], [1, top - 30]], dur)}</circle>`).join('');
  const body = `
    ${bench()}
    ${sandTray()}
    ${isDelft ? delftRingsPour() : moldFace(mold, { cavity: true, straps: true })}
    <clipPath id="${cid}">${isDelft ? `<path d="${g.lens}"/>` : `<path d="${g.heart}"/>`}<path d="${g.sprue}"/><path d="${g.ventL}"/><path d="${g.ventR}"/></clipPath>
    <g clip-path="url(#${cid})" opacity="0">${vis}
      <rect x="194" y="${top}" width="12" height="0" fill="${molten(metal)}">${colH}</rect>
      <rect x="140" y="${bottom}" width="120" height="160" fill="${molten(metal)}">${fillY}</rect>
      <rect x="140" y="${top - 4}" width="120" height="160" fill="${solid(metal)}" opacity="0">${cool}</rect>
    </g>
    ${bubbles}
    ${pourRig({ lipX: lip[0], lipY: lip[1], tx: 200, ty: top + 4, metal, dur, T })}
    ${hero ? '' : `
      ${tag(isDelft ? 64 : 70, isDelft ? 128 : 104, 'воздух ↑', 'blu')}
      ${tag(isDelft ? 92 : 98, 226, isDelft ? 'кольца Delft' : mold === 'silicone' ? 'силикон' : 'гипс', '')}
      <g opacity="0">${win(T.b, T.c, dur)}${tag(330, 150, 'одним движением', 'acc')}</g>
      <g opacity="0">${win(T.d + .02, .95, dur)}${tag(330, 150, 'остывает…', '')}</g>`}`;
  return svg(body, 'Заливка металла в форму', hero ? '30 -14 340 284' : '-25 -36 450 337.5');
};

// ---------- ОПАЛУБКА ----------
const box = {
  base: () => `<rect x="96" y="248" width="208" height="14" rx="3" fill="url(#gWood)"/>`,
  wall: x => `<rect x="${x}" y="118" width="8" height="130" rx="2" fill="#5aa9ff" fill-opacity=".22" stroke="#86c3ff" stroke-opacity=".85" stroke-width="1.5"/>`,
  clay: (y = 200) => `<rect x="118" y="${y}" width="164" height="${248 - y}" fill="url(#gClay)"/><path d="M118 ${y}H282" stroke="#a7b58d" stroke-width="1.5"/>`,
  plaster: (y, h, fill = 'url(#pPlaster)') => `<rect x="118" y="${y}" width="164" height="${h}" fill="${fill}"/>`,
};
const partLine = (y = 200, x0 = 118, x1 = 282) => `<path d="M${x0} ${y}H${x1}" stroke="#ffb347" stroke-width="2" stroke-dasharray="7 5"/>`;

S.formwork = ({ material = 'plaster' } = {}) => {
  const d = 3.4;
  return svg(`
    ${bench()}${box.base()}
    ${modelLens(200, 200, 44, 18, false)}
    ${box.clay(200)}
    <g>${kt('translate', [[0, '-80 0'], [.3, '0 0'], [1, '0 0']], d, { once: true, ease: true })}${box.wall(110)}</g>
    <g>${kt('translate', [[0, '80 0'], [.3, '0 0'], [1, '0 0']], d, { once: true, ease: true })}${box.wall(282)}</g>
    <g opacity="0">${kf('opacity', [[0, 0], [.35, 0], [.5, 1], [1, 1]], d, { once: true })}
      ${partLine(200)}
      ${tag(200, 46, 'разборная опалубка')}${lead(160, 54, 114, 122)}${lead(240, 54, 286, 122)}
      ${tag(200, 152, 'модель')}${lead(200, 160, 200, 182)}
      ${tag(200, 232, material === 'silicone' ? 'пластилин без серы' : 'пластилин', '')}
      ${tag(340, 200, 'разъём', 'acc')}
    </g>`, 'Опалубка с моделью в пластилине');
};

S.separator = ({ material = 'plaster' } = {}) => {
  const d = 2.6;
  const shine = [150, 200, 250].map((x, i) => `<path d="M${x - 14} ${i === 1 ? 186 : 198} q14 -8 28 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0">${kf('opacity', [[0, 0], [.2 + i * .2, 0], [.3 + i * .2, .85], [1, .85]], d)}</path>`).join('');
  return svg(`
    ${bench()}${box.base()}
    ${modelLens(200, 200, 44, 18, false)}
    ${material === 'keys' ? box.plaster(200, 48) : box.clay(200)}
    ${box.wall(110)}${box.wall(282)}
    ${shine}
    <g>${kt('translate', [[0, '-70 0'], [.5, '60 0'], [1, '-70 0']], d, { ease: true })}
      <g transform="translate(200 150) rotate(20)">
        <rect x="-4" y="-70" width="8" height="52" rx="3" fill="url(#gWood)"/>
        <rect x="-7" y="-20" width="14" height="10" fill="#9aa2ab"/>
        <path d="M-7 -10 h14 l-2 22 h-10 z" fill="#e8d9b0"/>
      </g>
    </g>
    ${tag(200, 46, material === 'silicone' ? 'вазелин / спрей-разделитель' : 'вазелин / спрей-разделитель', 'acc')}
    ${tag(200, 280, 'тонко, без луж и подтёков')}
  `, 'Нанесение разделителя');
};

S.pourHalf = ({ material = 'plaster', half = 1 } = {}) => {
  const d = 4.6;
  const wet = material === 'silicone' ? 'url(#gSilicone)' : 'url(#gPlasterWet)';
  const y0 = 200, y1 = 148;
  const yA = kf('y', [[0, y0], [.12, y0], [.75, y1], [1, y1]], d);
  const hA = kf('height', [[0, 0], [.12, 0], [.75, y0 - y1], [1, y0 - y1]], d);
  const set = material === 'silicone' ? 'url(#gSilicone)' : 'url(#pPlaster)';
  const bed = half === 1 ? box.clay(200) : `${box.plaster(200, 48, set)}<path d="M131 200 l9 12 l9 -12 M251 200 l9 12 l9 -12" fill="${wet}" opacity=".9"/>`;
  const bubbles = [150, 185, 222, 258].map((x, i) => `
    <circle cx="${x}" cy="190" r="2.2" fill="none" stroke="#fff" stroke-opacity=".8" opacity="0">
      ${kf('opacity', [[0, 0], [.3 + i * .1, 0], [.34 + i * .1, 1], [.5 + i * .1, 0], [1, 0]], d)}
      ${kf('cy', [[0, 196], [.3 + i * .1, 196], [.5 + i * .1, 160], [1, 160]], d)}</circle>`).join('');
  return svg(`
    ${bench()}${box.base()}
    ${modelLens(200, 200, 44, 18, false, .95)}
    ${bed}
    <g>
      <path d="M109 102 C 116 126, 128 154, 128 200" fill="none" stroke="${wet}" stroke-width="${material === 'silicone' ? 4 : 7}" stroke-linecap="round" opacity="0">${win(.06, .8, d)}</path>
    </g>
    <rect x="118" y="${y0}" width="164" height="0" fill="${wet}" opacity=".88">${yA}${hA}</rect>
    ${bubbles}
    ${box.wall(110)}${box.wall(282)}
    <g transform="translate(78 76) rotate(38)">
      <path d="M-22 -30 h44 v52 a8 8 0 0 1 -8 8 h-28 a8 8 0 0 1 -8 -8 z" fill="#3b4148" stroke="#6e767f" stroke-width="1.5"/>
      <path d="M22 -20 q16 4 14 22 q-2 12 -14 12" fill="none" stroke="#6e767f" stroke-width="4"/>
      <path d="M-22 -30 l-8 -6" stroke="#6e767f" stroke-width="4" stroke-linecap="round"/>
    </g>
    ${tag(300, 52, material === 'silicone' ? 'тонкой струйкой, в угол' : 'в угол, не на модель', 'acc')}
    ${tag(200, 280, half === 1 ? 'половина 1: покрыть модель с запасом' : 'половина 2: заполнит ключи', '')}
    ${material === 'plaster' ? `<g opacity="0">${win(.78, .98, d)}${tag(336, 238, 'постучать — пузыри выйдут', 'grn', 'middle')}</g>` : ''}
  `, half === 1 ? 'Заливка первой половины' : 'Заливка второй половины');
};

S.keys = ({ material = 'plaster' } = {}) => {
  const d = 4;
  const sil = material === 'silicone';
  const pit = (x, a) => `<path d="M${x - 9} 200 L${x} 212 L${x + 9} 200 Z" fill="${sil ? '#6e2219' : '#9e937f'}" opacity="0">${kf('opacity', [[0, 0], [a, 0], [a + .05, 1], [1, 1]], d)}</path>`;
  return svg(`
    ${bench()}<rect x="96" y="248" width="208" height="14" rx="3" fill="url(#gWood)"/>
    ${modelLens(200, 200, 44, 18, false)}
    ${box.plaster(200, 48, sil ? 'url(#gSilicone)' : 'url(#pPlaster)')}
    <path d="M118 200H282" stroke="#fffaf0" stroke-opacity=".5"/>
    ${pit(140, .18)}${pit(260, .5)}
    <g>${kt('translate', [[0, '140 160'], [.12, '140 186'], [.3, '140 186'], [.38, '260 160'], [.44, '260 186'], [.62, '260 186'], [.72, '330 120'], [1, '330 120']], d)}
      <g>${kt('rotate', [[0, '0'], [.15, '-25'], [.2, '25'], [.25, '-25'], [.3, '0'], [.45, '-25'], [.5, '25'], [.55, '-25'], [.6, '0'], [1, '0']], d)}
        <ellipse cx="0" cy="0" rx="14" ry="4" fill="#d8b25a" stroke="#8c6a22"/>
        <rect x="-2" y="-36" width="4" height="34" fill="#9aa2ab"/>
      </g>
    </g>
    ${tag(200, 54, sil ? 'ключи — конусы ножом' : 'ключи — конусные ямки (монетой/сверлом)', 'acc')}
    ${tag(200, 280, sil ? 'вазелин на всю плоскость — обязательно!' : 'перевернуть · убрать пластилин · разделитель', sil ? 'red' : '')}
  `, 'Ключи центровки');
};

S.setting = ({ label = '20–60 мин', note = 'греется — это схватывание', material = 'plaster' } = {}) => {
  const d = 4;
  const sil = material === 'silicone';
  return svg(`
    ${bench()}${box.base()}
    ${box.plaster(148, 100, sil ? 'url(#gSilicone)' : 'url(#pPlaster)')}
    ${modelLens(200, 200, 44, 18, false, .35)}
    ${box.wall(110)}${box.wall(282)}
    ${sil ? '' : heatWaves(200, 140, 4, 2.6)}
    <g transform="translate(330 90)">
      <circle r="34" fill="#1b1e22" stroke="#ffb347" stroke-width="3"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<path d="M0 -28 V-23" stroke="#8a9098" stroke-width="2" transform="rotate(${i * 30})"/>`).join('')}
      <path d="M0 0 V-22" stroke="#ece7df" stroke-width="3" stroke-linecap="round">${kt('rotate', [[0, '0'], [1, '360']], d)}</path>
      <circle r="3.5" fill="#ffb347"/>
    </g>
    ${tag(330, 148, label, 'acc')}
    ${tag(140, 70, note)}
    ${tag(200, 280, 'не трогать и не двигать')}
  `, 'Схватывание');
};

S.demold = () => {
  const d = 3.6;
  return svg(`
    ${bench()}${box.base()}
    ${box.plaster(200, 48)}${box.plaster(150, 50, 'url(#gPlasterWet)')}
    <path d="M118 200H282" stroke="#bfb39b" stroke-width="1.5"/>
    ${modelLens(200, 200, 44, 18, false, .5)}
    <g>${kt('translate', [[0, '0 0'], [.2, '0 0'], [.6, '-58 0'], [1, '-58 0']], d, { once: true, ease: true })}
      <g>${kt('rotate', [[0, '0 110 248'], [.2, '0 110 248'], [.6, '-14 110 248'], [1, '-14 110 248']], d, { once: true, ease: true })}${box.wall(110)}</g></g>
    <g>${kt('translate', [[0, '0 0'], [.2, '0 0'], [.6, '58 0'], [1, '58 0']], d, { once: true, ease: true })}
      <g>${kt('rotate', [[0, '0 290 248'], [.2, '0 290 248'], [.6, '14 290 248'], [1, '14 290 248']], d, { once: true, ease: true })}${box.wall(282)}</g></g>
    ${arrow('M100 140 h-40', 'B')}${arrow('M300 140 h40', 'B')}
    ${tag(200, 60, 'снять стенки — блок остаётся целым')}
    ${tag(200, 280, 'блок ещё хрупкий — бережно')}
  `, 'Вынуть блок из опалубки');
};

// разъём формы: верхняя половина вверх, модель — за ручку
S.split = ({ mold = 'plaster' } = {}) => {
  const d = 5;
  const sil = mold === 'silicone';
  const fillB = sil ? 'url(#gSilicone)' : 'url(#pPlaster)';
  const fillT = sil ? 'url(#gSilicone)' : 'url(#gPlaster)';
  const rec = sil ? '#5c1b14' : '#3a332b';
  const up = kt('translate', [[0, '0 0'], [.12, '0 0'], [.35, '0 -62'], [.85, '0 -62'], [.97, '0 0'], [1, '0 0']], d, { ease: true });
  const mUp = kt('translate', [[0, '0 0'], [.4, '0 0'], [.6, '0 -40'], [.85, '0 -40'], [.97, '0 0'], [1, '0 0']], d, { ease: true });
  return svg(`
    ${bench()}
    <rect x="130" y="196" width="140" height="66" rx="4" fill="${fillB}"/>
    <path d="M160 196 Q200 214 240 196 Z" fill="${rec}"/>
    <path d="M144 196 l9 10 l9 -10 M238 196 l9 10 l9 -10" fill="${rec}"/>
    <g>${mUp}${modelLens(200, 196, 40, 15, true)}</g>
    <g>${up}
      <rect x="130" y="130" width="140" height="66" rx="4" fill="${fillT}"/>
      <path d="M160 196 Q200 178 240 196 Z" fill="${rec}"/>
      <path d="M144 196 l9 10 l9 -10 M238 196 l9 10 l9 -10" fill="${fillT}"/>
    </g>
    <g opacity="0">${win(.12, .85, d)}${arrow('M300 190 v-56', 'B')}${tag(334, 124, 'разъём', 'blu')}</g>
    <g opacity="0">${win(.42, .85, d)}${tag(84, 150, 'модель за шуруп', 'acc')}${lead(110, 158, 192, 152)}</g>
    ${tag(200, 284, sil ? 'силикон гибкий — отгибать, не рвать' : 'ключи ровно выходят из ямок')}
  `, 'Разъём формы и извлечение модели');
};

S.drying = () => {
  const d = 6;
  const chips = [['≈60° · 1 ч', 92], ['≈110° · 2–3 ч', 202], ['≈180° · 1–2 ч', 318]].map(([t, x], i) =>
    `<g opacity=".3">${kf('opacity', [[0, .3], [i * .25, .3], [i * .25 + .03, 1], [i * .25 + .25, 1], [i * .25 + .28, .3], [1, .3]], d)}${tag(x, 186, t, 'acc')}</g>`).join('');
  const weights = ['412,6 г', '398,1 г', '391,0 г', '390,4 г', '390,3 г'];
  const wt = weights.map((w, i) => `<text x="200" y="252" text-anchor="middle" class="t ${i >= 3 ? 'grn' : ''}" opacity="0">${win(i * .2 + .005, i * .2 + .19, d, .005)}${w}</text>`).join('');
  return svg(`
    ${tag(98, 34, 'воздух · 3–7 дней')}
    <rect x="40" y="128" width="116" height="4" fill="#8b939c"/><path d="M50 132v18M146 132v18" stroke="#8b939c" stroke-width="3"/>
    <rect x="60" y="86" width="76" height="42" rx="4" fill="url(#pPlaster)"/>
    ${[0, 1, 2].map(i => `<path d="M20 ${80 + i * 18} q12 -6 24 0 t24 0" fill="none" stroke="#8fd0ff" stroke-width="2" stroke-linecap="round" opacity=".7">${kt('translate', [[0, '0 0'], [1, '110 0']], 3, { begin: `${i * .9}s` })}${kf('opacity', [[0, 0], [.2, .8], [.8, .8], [1, 0]], 3, { begin: `${i * .9}s` })}</path>`).join('')}
    ${tag(304, 34, 'или духовка ступенями')}
    <rect x="236" y="52" width="140" height="98" rx="8" fill="url(#gFurnace)" stroke="#4d545c"/>
    <rect x="248" y="70" width="92" height="66" rx="5" fill="#120d0a" stroke="#4d545c"/>
    <ellipse cx="294" cy="103" rx="50" ry="34" fill="url(#gHeat)" opacity=".45">${kf('opacity', [[0, .25], [.5, .6], [1, .25]], 3)}</ellipse>
    <rect x="270" y="98" width="48" height="28" rx="3" fill="url(#pPlaster)"/>
    <circle cx="358" cy="80" r="7" fill="#2b2f34" stroke="#8a9098"/><circle cx="358" cy="104" r="7" fill="#2b2f34" stroke="#8a9098"/>
    ${chips}
    <rect x="130" y="262" width="140" height="10" rx="3" fill="#30353b"/>
    <rect x="140" y="228" width="120" height="34" rx="6" fill="#0d1210" stroke="#3c434b"/>
    ${wt}
    <rect x="160" y="212" width="80" height="14" rx="3" fill="url(#pPlaster)"/>
    ${tag(340, 246, 'вес стоит = сухо', 'grn')}
  `, 'Сушка гипсовой формы');
};

S.channels = ({ mold = 'plaster' } = {}) => {
  const d = 6;
  const draw = (path, len, a, b, w, color) => `<path d="${path}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len}">${kf('stroke-dashoffset', [[0, len], [a, len], [b, 0], [.97, 0], [1, len]], d)}</path>`;
  const sil = mold === 'silicone';
  const rec = sil ? '#5c1b14' : '#3a332b';
  return svg(`
    ${bench()}
    ${moldFace(mold)}
    <path d="${FACE.heart}" fill="${rec}" stroke="${sil ? '#3c100b' : '#2a241e'}" stroke-width="2"/>
    ${draw('M200 186 L200 126', 60, .02, .22, 12, rec)}
    <path d="M182 118 L218 118 L204 140 L196 140 Z" fill="${rec}" opacity="0">${kf('opacity', [[0, 0], [.2, 0], [.25, 1], [.97, 1], [1, 0]], d)}</path>
    ${draw('M179 171 L163 119', 55, .3, .47, 5, rec)}
    ${draw('M221 171 L237 119', 55, .5, .67, 5, rec)}
    <g>${kt('translate', [[0, '200 190'], [.22, '200 126'], [.28, '179 171'], [.47, '163 119'], [.5, '221 171'], [.67, '237 119'], [.75, '330 90'], [1, '330 90']], d)}
      <g transform="rotate(-30)"><path d="M0 0 l4 -16 l3 1 z" fill="#d7dde3"/><rect x="2" y="-46" width="6" height="30" rx="2" fill="#30353b" transform="rotate(10 5 -30)"/></g>
    </g>
    <g opacity="0">${win(.72, .96, d)}
      ${arrow('M200 92 v38', 'A', 3)}${arrow('M164 128 l-6 -22', 'B')}${arrow('M236 128 l6 -22', 'B')}
      ${tag(88, 80, 'воздух выходит', 'blu')}${tag(310, 80, 'металл входит', 'acc')}
    </g>
    ${tag(84, 186, 'литник-воронка', 'acc')}${lead(118, 186, 195, 150)}
    ${tag(330, 186, 'каналы от верхних', 'blu')}${tag(330, 210, 'точек фигуры', 'blu')}
    ${tag(200, 284, sil ? 'резать скальпелем, сдуть крошки' : 'резать ножом, сдуть крошки')}
  `, 'Литник и воздушные каналы');
};

S.clamp = ({ mold = 'plaster' } = {}) => {
  const d = 3.2;
  const sil = mold === 'silicone';
  const fill = sil ? 'url(#gSilicone)' : 'url(#pPlaster)';
  return svg(`
    ${bench()}
    <g>${kt('translate', [[0, '-26 0'], [.35, '0 0'], [1, '0 0']], d, { once: true, ease: true })}
      ${sil ? '<rect x="134" y="104" width="12" height="158" rx="2" fill="url(#gWood)"/>' : ''}
      <rect x="146" y="104" width="54" height="158" rx="4" fill="${fill}"/>
      <path d="M200 104 L184 104 L196 128 Z" fill="#3a332b"/>
    </g>
    <g>${kt('translate', [[0, '26 0'], [.35, '0 0'], [1, '0 0']], d, { once: true, ease: true })}
      ${sil ? '<rect x="254" y="104" width="12" height="158" rx="2" fill="url(#gWood)"/>' : ''}
      <rect x="200" y="104" width="54" height="158" rx="4" fill="${fill}"/>
      <path d="M200 104 L216 104 L204 128 Z" fill="#3a332b"/>
    </g>
    <path d="M200 128 V262" stroke="#2a241e" stroke-width="1.5" stroke-dasharray="4 4"/>
    <g opacity="0">${kf('opacity', [[0, 0], [.38, 0], [.5, 1], [1, 1]], d, { once: true })}
      <rect x="${sil ? 126 : 138}" y="142" width="${sil ? 148 : 124}" height="8" rx="4" fill="#30353b" stroke="#8b939c"/>
      <rect x="${sil ? 126 : 138}" y="218" width="${sil ? 148 : 124}" height="8" rx="4" fill="#30353b" stroke="#8b939c"/>
      ${tag(76, 120, sil ? 'стянуть резинками' : 'стянуть проволокой')}
    </g>
    ${arrow('M100 190 h34', 'W')}${arrow('M300 190 h-34', 'W')}
    ${tag(200, 66, 'воронкой вверх', 'acc')}
    ${tag(200, 286, sil ? 'не пережимать — силикон гнётся' : 'плотно, без щели по разъёму')}
  `, 'Зажать половинки');
};

S.preheat = () => svg(`
  ${bench()}
  <rect x="96" y="60" width="208" height="190" rx="12" fill="url(#gFurnace)" stroke="#4d545c"/>
  <rect x="116" y="96" width="168" height="120" rx="8" fill="#120d0a" stroke="#4d545c"/>
  <ellipse cx="200" cy="160" rx="96" ry="64" fill="url(#gHeat)" opacity=".35">${kf('opacity', [[0, .2], [.5, .5], [1, .2]], 3)}</ellipse>
  <rect x="166" y="118" width="68" height="92" rx="4" fill="url(#pPlaster)"/>
  <path d="M182 118 L218 118 L204 132 L196 132 Z" fill="#3a332b"/>
  <rect x="116" y="70" width="40" height="16" rx="3" fill="#0b0f0c" stroke="#3c434b"/>
  <text x="136" y="83" text-anchor="middle" class="s acc">${'≈120°'}</text>
  <circle cx="276" cy="78" r="8" fill="#2b2f34" stroke="#8a9098"/><circle cx="250" cy="78" r="8" fill="#2b2f34" stroke="#8a9098"/>
  ${heatWaves(200, 56, 3, 2.4)}
  ${tag(200, 236, 'форма ≈100–150 °C', 'acc')}
  ${tag(200, 284, 'холодная форма → недолив')}
`, 'Прогрев формы в духовке');

S.cool = ({ metal = 'tin' } = {}) => {
  const d = 4;
  return svg(`
    ${bench()}
    ${metal === 'silver'
      ? `<rect x="40" y="200" width="80" height="58" fill="url(#pSand)"/><rect x="34" y="200" width="6" height="58" fill="url(#gSteel)"/><rect x="120" y="200" width="6" height="58" fill="url(#gSteel)"/><path d="M58 200 Q80 214 102 200 Z" fill="#120b06"/>
         <rect x="280" y="200" width="80" height="58" fill="url(#pSand)"/><rect x="274" y="200" width="6" height="58" fill="url(#gSteel)"/><rect x="360" y="200" width="6" height="58" fill="url(#gSteel)"/><path d="M298 200 Q320 214 342 200 Z" fill="#120b06"/>`
      : `<rect x="40" y="170" width="70" height="92" rx="4" fill="url(#pPlaster)"/><path d="${heartD(75, 216, .55)}" fill="#3a332b"/>
         <rect x="290" y="170" width="70" height="92" rx="4" fill="url(#pPlaster)"/><path d="${heartD(325, 216, .55)}" fill="#3a332b"/>`}
    <g>${kt('translate', [[0, '0 6'], [.5, '0 -4'], [1, '0 6']], d, { ease: true })}
      <g transform="translate(200 160)">
        <path d="${heartD(0, 0, .95)}" fill="${solid(metal)}" stroke="#6b7480"/>
        <path d="M-6 -17 L-6 -60 L-16 -76 L16 -76 L6 -60 L6 -17 Z" fill="${solid(metal)}" stroke="#6b7480"/>
        <path d="M-22 -28 L-34 -72 M22 -28 L34 -72" stroke="#9aa2ab" stroke-width="4" stroke-linecap="round"/>
        ${metal === 'silver' ? `<path d="${heartD(0, 0, .95)}" fill="#ff7a1a" opacity="0">${kf('opacity', [[0, .45], [.5, .15], [1, .45]], d)}</path>` : ''}
      </g>
      <path d="M200 76 L182 40 M200 76 L218 40" stroke="#8b939c" stroke-width="5" stroke-linecap="round"/>
    </g>
    ${heatWaves(200, 120, 3, 2.2)}
    ${tag(84, 70, 'горячо! только щипцами')}
    ${tag(320, 70, 'литник → в переплав', 'acc')}
    ${tag(200, 286, metal === 'silver' ? 'ждать, пока погаснет свечение' : 'дать застыть, потом открыть')}
  `, 'Остывание и извлечение отливки');
};

// ---------- ПЛАВКА ----------
S.zone = () => {
  const d = 5;
  const pop = (x, y, a) => `<g opacity="0">${kf('opacity', [[0, 0], [a, 0], [a + .04, 1], [.94, 1], [.97, 0], [1, 0]], d)}${tick(x, y)}</g>`;
  return svg(`
    <rect x="0" y="232" width="400" height="68" fill="#1b1d20"/><path d="M0 232H400" stroke="#2e3339" stroke-width="2"/>
    <rect x="40" y="196" width="40" height="40" fill="url(#pBrick)" stroke="#8d6237"/>
    <rect x="320" y="196" width="40" height="40" fill="url(#pBrick)" stroke="#8d6237"/>
    <rect x="84" y="216" width="232" height="16" fill="url(#pSandDry)"/>
    <path d="M80 206 V236 H320 V206" fill="none" stroke="#8b939c" stroke-width="4" stroke-linejoin="round"/>
    <rect x="160" y="150" width="56" height="70" rx="3" fill="url(#pPlaster)"/>
    <path d="M176 150 L200 150 L190 164 Z" fill="#3a332b"/>
    <g transform="translate(340 177) scale(.55)">${crucible({ metal: 'tin', empty: true })}</g>
    <g transform="translate(22 148)">
      <rect x="0" y="12" width="26" height="70" rx="10" fill="#d23a2c" stroke="#ff7a6a"/>
      <rect x="6" y="2" width="14" height="12" fill="#30353b"/><path d="M20 6 h12 v8" fill="none" stroke="#30353b" stroke-width="4"/>
      <rect x="4" y="34" width="18" height="16" rx="2" fill="#fff" opacity=".85"/>
    </g>
    ${pop(200, 124, .1)}${pop(340, 124, .3)}${pop(36, 124, .5)}
    ${tag(200, 34, 'зона заливки')}
    ${tag(200, 270, 'противень + сухой песок', 'acc')}
    ${tag(340, 100, 'кирпичи')}
    ${tag(52, 100, 'огнетушитель', 'red')}
    ${tag(200, 66, 'ничего горючего рядом · пол сухой')}
  `, 'Зона заливки');
};

S.crucibleTag = ({ focus = 'tin' } = {}) => svg(`
  ${bench(236)}
  <g transform="translate(120 199) scale(1.1)">${crucible({ metal: 'tin', level: -10, glow: false })}</g>
  <g transform="translate(280 199) scale(1.1)">${crucible({ metal: 'silver', level: -10, glow: false })}</g>
  <g transform="translate(120 132)"><rect x="-56" y="-15" width="112" height="26" rx="6" fill="#ff8a2a"/><text x="0" y="3" text-anchor="middle" class="t" style="fill:#1d0e02">ТОЛЬКО Sn</text></g>
  <g transform="translate(280 132)"><rect x="-56" y="-15" width="112" height="26" rx="6" fill="#cfd8e3"/><text x="0" y="3" text-anchor="middle" class="t" style="fill:#0d1520">ТОЛЬКО Ag</text></g>
  <g transform="translate(200 176)"><g>${kt('scale', [[0, '1'], [.5, '1.15'], [1, '1']], 1.6)}<text x="0" y="15" text-anchor="middle" style="font-size:44px;font-weight:900;fill:#ff5148">≠</text></g></g>
  ${tag(200, 66, focus === 'tin' ? 'отдельный тигель — только для олова' : 'у серебра свой тигель', 'acc')}
  ${tag(200, 272, 'олово в серебре = хрупкое серебро', 'red')}
`, 'Разные тигли для олова и серебра');

S.dryMetal = ({ metal = 'tin' } = {}) => {
  const d = 5;
  return svg(`
    ${bench()}
    <g transform="translate(250 221) scale(1.2)">${crucible({ metal, level: -6 })}</g>
    <g>${kt('translate', [[0, '0 0'], [.45, '0 0'], [.62, '44 40'], [.7, '44 40'], [.71, '0 0'], [1, '0 0']], d, { ease: true })}
      <g opacity="1">${kf('opacity', [[0, 1], [.62, 1], [.66, 0], [.97, 0], [1, 1]], d)}
        <rect x="170" y="128" width="44" height="16" rx="3" fill="${solid(metal)}" stroke="#6b7480"/>
      </g>
    </g>
    <rect x="150" y="146" width="80" height="6" rx="2" fill="#4d545c"/>
    ${heatWaves(192, 120, 2, 2)}
    <g transform="translate(70 150)">
      <path d="M0 -34 c12 16 22 28 22 40 a22 22 0 0 1 -44 0 c0 -12 10 -24 22 -40z" fill="#3c8fe0" opacity=".85"/>
      <path d="M-30 -36 L30 36" stroke="#ff5148" stroke-width="6" stroke-linecap="round"/>
    </g>
    ${tag(70, 220, 'влага + расплав', 'red')}${tag(70, 244, '= выброс металла', 'red')}
    ${tag(192, 96, 'сначала подогреть', 'acc')}
    ${tag(250, 36, 'металл, тигель, инструмент — сухие')}
  `, 'Только сухой и подогретый металл');
};

S.furnace = ({ metal = 'tin', temp = '290', label = '≈280–300 °C', clock = false, sub = '' } = {}) => {
  const d = 3;
  return svg(`
    ${bench()}
    <rect x="120" y="76" width="160" height="186" rx="14" fill="url(#gFurnace)" stroke="#4d545c"/>
    <rect x="132" y="60" width="136" height="20" rx="6" fill="#30353b" stroke="#4d545c"/>
    <rect x="186" y="48" width="28" height="14" rx="4" fill="#d23a2c"/>
    <rect x="150" y="96" width="100" height="104" rx="10" fill="#d8cdb6"/>
    <rect x="160" y="104" width="80" height="92" rx="8" fill="#140c08"/>
    <ellipse cx="200" cy="150" rx="56" ry="56" fill="url(#gHeat)" opacity=".7">${kf('opacity', [[0, .45], [.5, .85], [1, .45]], d)}</ellipse>
    <g transform="translate(200 162) scale(.62)">${crucible({ metal, level: -14, glow: false })}</g>
    <rect x="150" y="210" width="100" height="36" rx="6" fill="#121417" stroke="#3c434b"/>
    <rect x="158" y="216" width="58" height="24" rx="3" fill="#060807"/>
    <text x="187" y="234" text-anchor="middle" style="font-family:ui-monospace,Consolas,monospace;font-size:17px;font-weight:700;fill:#ff5a3c">${temp}</text>
    <circle cx="232" cy="228" r="7" fill="#2b2f34" stroke="#8a9098"/>
    <text x="232" y="214" text-anchor="middle" class="s" style="font-size:9px" ><tspan class="blink">SET</tspan></text>
    ${tag(200, 30, sub || 'VEVOR 1350 Вт · до 1150 °C')}
    ${tag(336, 140, label, 'acc')}
    ${clock ? `<g transform="translate(64 140)"><circle r="26" fill="#1b1e22" stroke="#ffb347" stroke-width="3"/><path d="M0 0 V-17" stroke="#ece7df" stroke-width="3" stroke-linecap="round">${kt('rotate', [[0, '0'], [1, '360']], 3)}</path><circle r="3" fill="#ffb347"/></g>${tag(64, 190, '20–30 мин', 'acc')}` : ''}
  `, 'Печь');
};

S.skim = () => {
  const d = 5;
  const sx = [[0, '-90 -40'], [.12, '-66 0'], [.6, '46 0'], [.72, '80 -44'], [1, '-90 -40']];
  const blob = (dx, w) => {
    const t = .12 + ((dx + 66) / 112) * .48;
    return `<ellipse cx="${200 + dx}" cy="160" rx="${w}" ry="4.5" fill="#7c828a" stroke="#5f656c">
      ${kf('opacity', [[0, 1], [Math.max(t - .01, .01), 1], [t + .02, 0], [.97, 0], [1, 1]], d)}</ellipse>`;
  };
  return svg(`
    ${bench()}
    <g transform="translate(200 196) scale(1.6)">${crucible({ metal: 'tin', level: -22, glow: false })}</g>
    ${blob(-44, 9)}${blob(-18, 12)}${blob(10, 8)}${blob(36, 10)}
    <g>${kt('translate', sx, d, { ease: true })}
      <g transform="translate(200 158)">
        <ellipse cx="0" cy="4" rx="16" ry="7" fill="#c2c9d1" stroke="#7e8790"/>
        <path d="M14 0 L80 -54" stroke="#9aa2ab" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="0" cy="2" rx="10" ry="3" fill="#7c828a" opacity="0">${kf('opacity', [[0, 0], [.2, 0], [.25, 1], [.75, 1], [.8, 0], [1, 0]], d)}</ellipse>
      </g>
    </g>
    ${tag(200, 34, 'шлак — сухой стальной ложкой', 'acc')}
    ${tag(200, 284, 'олово: без флюса · ≈280–300 °C')}
    ${tag(300, 78, 'под шлаком — зеркало')}
  `, 'Снятие шлака');
};

S.remelt = () => {
  const d = 3.6;
  const piece = (i) => `<g>${kt('translate', [[0, '90 210'], [.1 + i * .2, '90 210'], [.3 + i * .2, '200 70'], [.5 + i * .2, '288 170'], [.52 + i * .2, '288 170'], [1, '288 170']], d, {})}
    ${kf('opacity', [[0, 1], [.5 + i * .2 - .001, 1], [.5 + i * .2, 0], [.99, 0], [1, 1]], d)}
    <path d="M-5 -16 L5 -16 L5 4 L12 14 L-12 14 L-5 4 Z" fill="url(#gSolidTin)" stroke="#6b7480" transform="rotate(${i * 40})"/></g>`;
  return svg(`
    ${bench()}
    <g transform="translate(290 216) scale(1.1)">${crucible({ metal: 'tin', level: -8 })}</g>
    ${piece(0)}${piece(1)}${piece(2)}
    ${tag(110, 248, 'литники, брак')}
    ${tag(200, 34, 'обратно в переплав — только в «свой» тигель', 'acc')}
  `, 'Литники в переплав');
};

// ---------- DELFT ----------
const ringBottom = (sandTop = 180, extra = '') => `
  <rect x="118" y="${sandTop}" width="164" height="${250 - sandTop}" fill="url(#pSand)">${extra}</rect>
  <rect x="110" y="180" width="8" height="70" fill="url(#gSteel)"/><rect x="282" y="180" width="8" height="70" fill="url(#gSteel)"/>`;
const board = () => `<rect x="86" y="250" width="228" height="12" rx="3" fill="url(#gWood)"/>`;
const pins = (y = 176) => `<rect x="102" y="${y}" width="8" height="10" rx="2" fill="#8f98a2"/><rect x="290" y="${y}" width="8" height="10" rx="2" fill="#8f98a2"/>`;

function rammer({ sand0, ringTop, ringBot, d = 3.2, label }) {
  const hits = [.22, .52, .82];
  const sandF = [[0, sand0]], dy = [[0, '0 0']];
  hits.forEach((h, i) => { sandF.push([h, sand0 + i * 3], [h + .02, sand0 + (i + 1) * 3]); dy.push([h, `0 ${i * 3}`], [h + .02, `0 ${(i + 1) * 3}`]); });
  sandF.push([.97, sand0 + 9], [1, sand0]); dy.push([.97, '0 9'], [1, '0 0']);
  const hF = sandF.map(([t, y]) => [t, ringBot - y]);
  const piv = '128 -20';
  const rot = [[0, `26 ${piv}`]];
  hits.forEach(h => rot.push([h - .06, `26 ${piv}`], [h, `0 ${piv}`], [h + .06, `26 ${piv}`]));
  rot.push([1, `26 ${piv}`]);
  const bang = hits.map(h => `<g opacity="0">${kf('opacity', [[0, 0], [h - .005, 0], [h, 1], [h + .07, 0], [1, 0]], d)}
      <text x="270" y="${sand0 - 44}" class="t acc">тук!</text>
      <path d="M150 ${sand0 - 6} l-12 -6 M250 ${sand0 - 6} l12 -6 M146 ${sand0 + 2} l-14 0 M254 ${sand0 + 2} l14 0" stroke="#e1c08f" stroke-width="2" stroke-linecap="round"/></g>`).join('');
  return `
    <rect x="118" y="${sand0}" width="164" height="${ringBot - sand0}" fill="url(#pSand)">${kf('y', sandF, d)}${kf('height', hF, d)}</rect>
    <rect x="110" y="${ringTop}" width="8" height="${ringBot - ringTop}" fill="url(#gSteel)"/><rect x="282" y="${ringTop}" width="8" height="${ringBot - ringTop}" fill="url(#gSteel)"/>
    <g>${kt('translate', dy, d)}
      <rect x="150" y="${sand0 - 16}" width="100" height="16" rx="2" fill="url(#gWood)" stroke="#5e3d22"/>
      <g transform="translate(200 ${sand0 - 16})"><g>${kt('rotate', rot, d)}
        <rect x="-14" y="-44" width="28" height="44" rx="4" fill="url(#gSteelV)" stroke="#59616a"/>
        <path d="M14 -24 L128 -18" stroke="#9b6b3f" stroke-width="9" stroke-linecap="round"/>
      </g></g>
    </g>
    ${bang}
    ${label}`;
}

S.ram = ({ ring = 1 } = {}) => {
  if (ring === 1) {
    return svg(`
      ${bench()}${board()}
      ${rammer({ sand0: 168, ringTop: 180, ringBot: 250, label: '' })}
      ${tag(200, 284, 'кольцо 1 · сильно, через брусок')}
      ${tag(70, 120, 'земля с горкой')}${lead(96, 128, 130, 168)}
      ${tag(330, 230, 'слоями', 'acc')}
    `, 'Утрамбовка земли в кольцо');
  }
  return svg(`
    ${bench()}
    <g transform="translate(20 34) scale(.9)">
      ${board()}
      ${ringBottom(180)}
      ${modelLens(200, 180, 40, 14, false, .9)}
      <path d="M118 180H282" stroke="#e8e2d4" stroke-width="1.5" stroke-opacity=".6"/>
      ${pins(174)}
      ${rammer({ sand0: 96, ringTop: 108, ringBot: 178, label: '' })}
    </g>
    ${tag(200, 284, 'кольцо 2 по меткам · трамбовать так же', '')}
  `, 'Утрамбовка второго кольца');
};

S.strike = () => {
  const d = 3.4;
  const cid = id('mnd');
  return svg(`
    ${bench()}${board()}
    ${ringBottom(180)}
    <clipPath id="${cid}"><rect x="100" y="140" width="220" height="40">${kf('x', [[0, 100], [.12, 100], [.72, 290], [.97, 290], [1, 100]], d)}</rect></clipPath>
    <path d="M118 181 L118 176 Q200 156 282 176 L282 181 Z" fill="url(#pSand)" clip-path="url(#${cid})"/>
    <g>${kt('translate', [[0, '0 0'], [.12, '0 0'], [.72, '190 0'], [.97, '190 0'], [1, '0 0']], d)}
      <g transform="translate(100 180)"><rect x="-2" y="-62" width="8" height="64" rx="1" fill="url(#gSteel)" transform="rotate(-12 2 0)"/></g>
    </g>
    ${[0, 1, 2].map(i => `<circle cx="${292 + i * 4}" cy="182" r="2.4" fill="#6b523b">${kf('cy', [[0, 182], [.6 + i * .04, 182], [.85 + i * .04, 262], [1, 262]], d)}${kf('opacity', [[0, 0], [.6 + i * .04, 0], [.62 + i * .04, 1], [.88 + i * .03, 1], [.97, 0], [1, 0]], d)}</circle>`).join('')}
    ${tag(200, 110, 'срезать вровень с краем кольца', 'acc')}
    ${tag(200, 284, 'линейкой/ножом, одним проходом')}
  `, 'Срезать землю вровень');
};

S.press = () => {
  const d = 3.6;
  return svg(`
    ${bench()}${board()}
    ${ringBottom(180)}
    <g>${kt('translate', [[0, '0 -70'], [.55, '0 0'], [1, '0 0']], d, { once: true, ease: true })}
      ${modelLens(200, 180, 40, 14, true, .95)}
      ${arrow('M200 120 v14', 'W', 3)}
    </g>
    <g opacity="0">${kf('opacity', [[0, 0], [.55, 0], [.7, 1], [1, 1]], d, { once: true })}
      ${partLine(180)}
      ${tag(200, 72, 'по самому широкому сечению', 'acc')}
      ${tag(340, 180, 'разъём', 'acc')}
    </g>
    ${tag(200, 284, 'вдавить ровно, ручкой (шурупом) вверх')}
  `, 'Вдавить модель по линию разъёма');
};

S.dust = () => {
  const d = 2.4;
  const dots = Array.from({ length: 14 }, (_, i) => {
    const x = 150 + (i * 37) % 100, del = (i * .17) % d;
    return `<circle cx="${x}" cy="110" r="1.8" fill="#f2efe8">${kf('cy', [[0, 110], [1, 176]], d, { begin: `${del}s` })}${kf('opacity', [[0, 0], [.1, 1], [.9, 1], [1, 0]], d, { begin: `${del}s` })}</circle>`;
  }).join('');
  return svg(`
    ${bench()}${board()}
    ${ringBottom(180)}
    ${modelLens(200, 180, 40, 14, true, .95)}
    <path d="M118 179.5H282" stroke="#f2efe8" stroke-width="2.5" stroke-opacity=".7"/>
    <g>${kt('translate', [[0, '-30 0'], [.5, '30 0'], [1, '-30 0']], d * 2, { ease: true })}
      <g transform="translate(200 70) rotate(150)"><rect x="-16" y="-26" width="32" height="44" rx="6" fill="#e8e2d4" stroke="#9e937f"/><rect x="-10" y="18" width="20" height="8" rx="2" fill="#9e937f"/></g>
      ${dots}
    </g>
    ${tag(330, 70, 'тальк / графит', 'acc')}
    ${tag(200, 284, 'тонкий слой · лишнее сдуть')}
  `, 'Присыпка тальком');
};

S.lift = () => {
  const d = 4.4;
  const up = kt('translate', [[0, '0 0'], [.15, '0 0'], [.45, '0 -70'], [.85, '0 -70'], [.98, '0 0'], [1, '0 0']], d, { ease: true });
  return svg(`
    ${bench()}${board()}
    ${ringBottom(180)}
    <path d="M160 180 Q200 194 240 180 Z" fill="#24180f"/>
    ${modelLens(200, 180, 40, 14, true, .95)}
    <g>${up}
      <rect x="118" y="108" width="164" height="70" fill="url(#pSand)"/>
      <path d="M160 178 Q200 164 240 178 Z" fill="#24180f"/>
      <rect x="110" y="108" width="8" height="70" fill="url(#gSteel)"/><rect x="282" y="108" width="8" height="70" fill="url(#gSteel)"/>
      ${pins(172)}
    </g>
    <g opacity="0">${win(.15, .85, d)}${arrow('M330 160 V90', 'G', 3.5)}${tag(340, 76, 'строго вверх', 'grn')}</g>
    ${tag(70, 60, 'без перекоса', '')}
    ${tag(200, 284, 'медленно, двумя руками')}
  `, 'Поднять верхнее кольцо');
};

S.removeModel = () => {
  const d = 4.4;
  return svg(`
    ${bench()}${board()}
    ${ringBottom(180)}
    <path d="M160 180 Q200 194 240 180 Z" fill="#24180f"/>
    <g>${kt('translate', [[0, '0 0'], [.1, '0 -1'], [.13, '0 0'], [.2, '0 -1'], [.23, '0 0'], [.45, '0 0'], [.65, '0 -80'], [.88, '0 -80'], [.98, '0 0'], [1, '0 0']], d)}
      ${modelLens(200, 180, 40, 14, true, .95)}
      <path d="M186 140 L194 156 M214 140 L206 156" stroke="#9aa2ab" stroke-width="4" stroke-linecap="round" opacity="0">${win(.45, .9, d)}</path>
    </g>
    <g opacity="0">${win(0, .3, d)}
      <g>${kt('rotate', [[0, '0 260 110'], [.05, '-20 260 110'], [.1, '0 260 110'], [.15, '-20 260 110'], [.2, '0 260 110'], [1, '0 260 110']], d)}
        <rect x="204" y="132" width="16" height="12" rx="2" fill="url(#gSteelV)"/><path d="M220 138 L262 112" stroke="#9b6b3f" stroke-width="5" stroke-linecap="round"/>
      </g>
      ${tag(320, 96, 'лёгкий стук', 'acc')}
    </g>
    <g opacity="0">${win(.5, .9, d)}${arrow('M330 170 V100', 'G', 3.5)}${tag(330, 86, 'вверх за ручку', 'grn')}</g>
    ${tag(200, 284, 'отпечаток должен остаться чистым')}
  `, 'Вынуть модель');
};

S.delftChannels = () => {
  const d = 6;
  const draw = (path, len, a, b, w) => `<path d="${path}" fill="none" stroke="#24180f" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len}">${kf('stroke-dashoffset', [[0, len], [a, len], [b, 0], [.97, 0], [1, len]], d)}</path>`;
  return svg(`
    ${bench()}${board()}
    ${ringBottom(180)}
    <path d="M160 180 Q200 194 240 180 Z" fill="#24180f"/>
    <rect x="118" y="34" width="164" height="70" fill="url(#pSand)"/>
    <path d="M160 104 Q200 90 240 104 Z" fill="#24180f"/>
    ${draw('M200 94 V38', 56, .05, .28, 10)}
    <path d="M182 34 L218 34 L205 52 L195 52 Z" fill="#24180f" opacity="0">${kf('opacity', [[0, 0], [.28, 0], [.33, 1], [.97, 1], [1, 0]], d)}</path>
    ${draw('M165 101 L152 38', 64, .38, .55, 4)}
    ${draw('M235 101 L248 38', 64, .6, .77, 4)}
    <rect x="110" y="34" width="8" height="70" fill="url(#gSteel)"/><rect x="282" y="34" width="8" height="70" fill="url(#gSteel)"/>
    <g>${kt('translate', [[0, '200 140'], [.05, '200 96'], [.28, '200 40'], [.36, '165 120'], [.38, '165 102'], [.55, '152 40'], [.58, '235 120'], [.6, '235 102'], [.77, '248 40'], [.85, '340 150'], [1, '340 150']], d)}
      <rect x="-2" y="0" width="4" height="48" rx="2" fill="#c8a675"/>
    </g>
    ${tag(70, 54, 'воронка', 'acc')}${lead(96, 54, 182, 40)}
    ${tag(62, 96, 'литник ≥ 5 мм', 'acc')}${lead(98, 96, 194, 74)}
    ${tag(338, 54, 'выпоры', 'blu')}${lead(312, 54, 250, 50)}
    ${tag(200, 140, 'верхнее кольцо — насквозь')}
    ${tag(200, 284, 'крошки сдуть, края не ронять')}
  `, 'Литник и выпоры в Delft');
};

S.assemble = () => {
  const d = 4;
  return svg(`
    ${bench()}${board()}
    ${ringBottom(180)}
    <path d="M160 180 Q200 194 240 180 Z" fill="#24180f"/>
    <g>${kt('translate', [[0, '0 -60'], [.45, '0 0'], [1, '0 0']], d, { once: true, ease: true })}
      <rect x="118" y="108" width="164" height="70" fill="url(#pSand)"/>
      <path d="M160 178 Q200 164 240 178 Z" fill="#24180f"/>
      <path d="M200 112 V170" stroke="#24180f" stroke-width="10"/><path d="M184 108 L216 108 L205 124 L195 124 Z" fill="#24180f"/>
      <path d="M165 175 L152 108 M235 175 L248 108" stroke="#24180f" stroke-width="4"/>
      <rect x="110" y="108" width="8" height="70" fill="url(#gSteel)"/><rect x="282" y="108" width="8" height="70" fill="url(#gSteel)"/>
      ${pins(172)}
    </g>
    <g opacity="0">${kf('opacity', [[0, 0], [.5, 0], [.6, 1], [1, 1]], d, { once: true })}${tick(330, 178)}${tag(330, 150, 'метки совпали', 'grn')}</g>
    ${tag(200, 60, 'собрать по меткам/штифтам')}
    ${tag(200, 284, 'воронкой вверх — в лоток с песком')}
  `, 'Собрать кольца');
};

// ---------- СЕРЕБРО: тигель, плавка ----------
S.glaze = () => {
  const d = 4;
  const dots = Array.from({ length: 10 }, (_, i) => `<circle cx="${184 + (i * 13) % 34}" cy="70" r="2.2" fill="#f4f1ea">${kf('cy', [[0, 70], [1, 150]], 1.6, { begin: `${i * .16}s` })}${kf('opacity', [[0, 0], [.1, 1], [.85, 1], [1, 0]], 1.6, { begin: `${i * .16}s` })}</circle>`).join('');
  return svg(`
    ${bench()}
    <ellipse cx="200" cy="230" rx="120" ry="40" fill="url(#gHeat)" opacity=".5">${kf('opacity', [[0, .3], [.5, .6], [1, .3]], 2.4)}</ellipse>
    <g transform="translate(200 190) scale(1.5)">
      ${crucible({ empty: true })}
      <path d="${CRU_IN}" fill="none" stroke="#bfe6ff" stroke-width="3.5" stroke-opacity="0">${kf('stroke-opacity', [[0, 0], [.3, 0], [.8, .85], [1, .85]], d, { once: true })}</path>
    </g>
    ${dots}
    ${tag(200, 34, 'новый тигель: щепотка буры, прогреть', 'acc')}
    ${tag(330, 150, 'стекловидная плёнка', 'blu')}
    ${tag(200, 284, 'плёнка защищает тигель и металл')}
  `, 'Глазировать тигель бурой');
};

S.load = () => {
  const d = 3;
  const gran = Array.from({ length: 8 }, (_, i) => `<circle cx="${188 + (i * 9) % 26}" cy="60" r="4.5" fill="url(#gSolidSilver)" stroke="#7e8a97" stroke-width=".6">${kf('cy', [[0, 60], [.5, 160], [1, 160]], d, { begin: `${i * .3}s` })}${kf('opacity', [[0, 0], [.05, 1], [.48, 1], [.52, 0], [1, 0]], d, { begin: `${i * .3}s` })}</circle>`).join('');
  return svg(`
    ${bench()}
    <g transform="translate(200 196) scale(1.4)">${crucible({ empty: true, granules: true })}</g>
    ${gran}
    <g transform="translate(300 70)"><rect x="-18" y="-20" width="36" height="40" rx="6" fill="#e8e2d4" stroke="#9e937f"/><text x="0" y="5" text-anchor="middle" class="s" style="fill:#3a332b">бура</text></g>
    ${tag(110, 60, 'гранулы 925', '')}
    ${tag(300, 116, 'щепотка', 'acc')}
    ${tag(200, 284, 'прогрев печи 20–30 мин, потом металл')}
  `, 'Загрузка серебра');
};

S.stir = () => {
  const d = 2.2;
  return svg(`
    ${bench()}
    <g transform="translate(200 200) scale(1.5)">${crucible({ metal: 'silver', level: -22 })}</g>
    ${[0, 1].map(i => `<ellipse cx="200" cy="168" rx="${22 + i * 16}" ry="${4 + i * 2}" fill="none" stroke="#fff6d8" stroke-width="1.5" stroke-dasharray="10 8" opacity=".7">${kf('stroke-dashoffset', [[0, 0], [1, i ? -36 : 36]], 1.4)}</ellipse>`).join('')}
    <g>${kt('rotate', [[0, '-10 201 40'], [.5, '10 201 40'], [1, '-10 201 40']], d, { ease: true })}
      <rect x="196" y="40" width="10" height="150" rx="4" fill="#2c2f33" stroke="#555c64"/>
    </g>
    ${tag(90, 60, 'графитовая палочка', '')}
    ${tag(330, 104, '≈980–1010 °C', 'acc')}
    ${tag(200, 284, 'мешать — всё должно быть жидким')}
  `, 'Перемешать расплав серебра');
};

S.pickle = () => {
  const d = 3;
  const bub = [170, 205, 238, 262].map((x, i) => `<circle cx="${x}" cy="236" r="2.5" fill="none" stroke="#f3ffd8" stroke-opacity=".8">${kf('cy', [[0, 238], [1, 180]], d, { begin: `${i * .7}s` })}${kf('opacity', [[0, 0], [.1, 1], [.85, 1], [1, 0]], d, { begin: `${i * .7}s` })}</circle>`).join('');
  return svg(`
    ${bench()}
    <path d="M128 140 H300 V248 Q300 262 286 262 H142 Q128 262 128 248 Z" fill="#3a4047" stroke="#5f6770"/>
    <rect x="140" y="176" width="148" height="78" rx="8" fill="url(#gAcid)"/>
    <rect x="120" y="132" width="188" height="12" rx="6" fill="#4d545c"/>
    ${bub}
    <g>${kt('translate', [[0, '0 -40'], [.4, '0 0'], [1, '0 0']], 4, { once: true, ease: true })}
      <path d="${heartD(214, 212, .5)}" fill="url(#gSolidSilver)" stroke="#8a95a2"/>
      <path d="M206 198 L196 92 M222 198 L232 92" stroke="#d9874a" stroke-width="4.5" stroke-linecap="round"/>
    </g>
    <g transform="translate(62 150)"><path d="M-6 50 L-14 -30 M6 50 L14 -30" stroke="#a7b0ba" stroke-width="5" stroke-linecap="round"/>${cross(0, 6, 22)}</g>
    ${tag(62, 112, 'сталь', 'red')}
    ${tag(300, 70, 'медный / пластик', 'grn')}
    ${tag(214, 280, 'тёплая лимонная кислота', 'acc')}
  `, 'Отбел в лимонной кислоте');
};

S.saw = () => {
  const d = 1.2;
  return svg(`
    ${bench()}
    <path d="M60 190 H300 L340 214 H60 Z" fill="url(#gWood)"/>
    <path d="M250 190 L300 190 L300 214 L250 214 Z" fill="#17191c"/>
    <g transform="translate(190 172)">
      <path d="${heartD(0, 0, .6)}" fill="url(#gSolidSilver)" stroke="#8a95a2" transform="rotate(-90)"/>
      <path d="M20 -5 L74 -5 L84 -12 L84 12 L74 5 L20 5 Z" fill="url(#gSolidSilver)" stroke="#8a95a2"/>
    </g>
    <g>${kt('translate', [[0, '0 -16'], [.5, '0 16'], [1, '0 -16']], d)}
      <path d="M244 60 V200" stroke="#cfd6dd" stroke-width="1.5"/>
      <path d="M244 64 H310 V196 H244" fill="none" stroke="#7f8892" stroke-width="5" stroke-linejoin="round"/>
      <rect x="236" y="196" width="16" height="44" rx="5" fill="url(#gWood)"/>
    </g>
    ${tag(110, 70, 'отрезать литник', 'acc')}
    ${tag(110, 250, 'пилка вертикально')}
    ${tag(330, 250, 'режет вниз')}
  `, 'Отрезать литник');
};

S.file = () => {
  const d = 5;
  const grits = ['240', '400', '600', '1000', '2000'];
  const chips = grits.map((g, i) => `<g opacity=".3">${kf('opacity', [[0, .3], [i * .19, .3], [i * .19 + .02, 1], [i * .19 + .19, 1], [i * .19 + .21, .3], [1, .3]], d)}${tag(72 + i * 64, 70, g, 'acc')}</g>`).join('');
  return svg(`
    ${bench()}
    <path d="${heartD(200, 190, 1.4)}" fill="url(#gSolidSilver)" stroke="#8a95a2"/>
    <path d="${heartD(200, 190, 1.4)}" fill="#fff" opacity="0">${kf('opacity', [[0, 0], [1, .35]], d)}</path>
    <g>${kt('translate', [[0, '-30 0'], [.5, '30 0'], [1, '-30 0']], .9)}
      <path d="M150 148 L270 128 L274 138 L154 158 Z" fill="#8b939c" stroke="#59616a"/>
    </g>
    ${chips}
    ${tag(200, 34, 'надфили → наждачка по порядку')}
    ${tag(200, 284, 'каждый номер убирает риски предыдущего')}
  `, 'Доводка: надфили и наждачка');
};

S.polish = ({ metal = 'silver' } = {}) => {
  const spark = (x, y, del) => `<g transform="translate(${x} ${y})"><path d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z" fill="#fff" opacity="0">${kf('opacity', [[0, 0], [.5, 1], [1, 0]], 1.4, { begin: `${del}s` })}${kt('scale', [[0, '.6'], [.5, '1.1'], [1, '.6']], 1.4, { begin: `${del}s` })}</path></g>`;
  return svg(`
    ${bench()}
    <path d="${heartD(150, 196, 1.3)}" fill="${solid(metal)}" stroke="#8a95a2"/>
    <path d="M120 170 q20 -10 40 0" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7" fill="none"/>
    <g transform="translate(150 196)">${spark(-40, -30, 0)}${spark(30, -24, .5)}${spark(0, 20, .9)}</g>
    <g transform="translate(262 126) rotate(-35)">
      <rect x="0" y="-14" width="110" height="28" rx="12" fill="#3b4148" stroke="#6b737c"/>
      <rect x="-26" y="-4" width="28" height="8" fill="#9aa2ab"/>
      <g transform="translate(-34 0)"><circle r="20" fill="#efe6d2" stroke="#c9bb9c"/><path d="M-14 0 H14 M0 -14 V14" stroke="#c9bb9c" stroke-width="2" class="spin"/></g>
    </g>
    ${tag(300, 210, 'войлок + паста', 'acc')}
    ${tag(200, 34, 'полировка: от грубой пасты к финишной')}
    ${tag(200, 284, 'держать крепко — круг может вырвать деталь')}
  `, 'Полировка');
};

S.mix = () => {
  const d = 2;
  return svg(`
    ${bench()}
    <rect x="120" y="236" width="160" height="26" rx="6" fill="#30353b" stroke="#59616a"/>
    <rect x="170" y="244" width="60" height="12" rx="2" fill="#0b0f0c"/><text x="200" y="254" text-anchor="middle" class="s acc">124,0 г</text>
    <path d="M166 160 L234 160 L228 236 L172 236 Z" fill="#f3f0ea" fill-opacity=".14" stroke="#cfd6dd"/>
    <path d="M169 190 L231 190 L228 236 L172 236 Z" fill="url(#gSilicone)"/>
    <g>${kt('rotate', [[0, '-12 200 120'], [.5, '12 200 120'], [1, '-12 200 120']], d, { ease: true })}<rect x="196" y="96" width="8" height="130" rx="3" fill="url(#gWood)"/></g>
    <g transform="translate(70 196)"><rect x="-24" y="-60" width="48" height="66" rx="8" fill="#d8dde3"/><text x="0" y="-20" text-anchor="middle" class="t" style="fill:#1b1e22">A</text></g>
    <g transform="translate(330 196)"><rect x="-24" y="-60" width="48" height="66" rx="8" fill="#d8dde3"/><text x="0" y="-20" text-anchor="middle" class="t" style="fill:#c8463a">B</text></g>
    ${tag(200, 40, 'A + B строго по инструкции (по весу)', 'acc')}
    ${tag(200, 284, 'мешать, скребя стенки и дно')}
  `, 'Смешать силикон');
};

// ---------- титульная иллюстрация ----------
S.hero = ({ mode = 'tin' } = {}) => S.pour({ mold: mode === 'silver' ? 'delft' : 'plaster', metal: mode, hero: true });

export function scene(name, opts = {}) {
  const fn = S[name];
  return fn ? fn(opts) : svg(`<text x="200" y="150" text-anchor="middle">${name}</text>`);
}
export const sceneNames = Object.keys(S);
