// Правила моделирования под литьё. Для каждого — SVG «неправильно» (bad) и «правильно» (good), viewBox 320×200.

const T = (x, y, s, cls = '', a = 'middle') => `<text x="${x}" y="${y}" text-anchor="${a}" class="${cls}">${s}</text>`;
const mold = (y = 110, h = 70, fill = 'url(#pPlaster)') => `<rect x="50" y="${y}" width="220" height="${h}" rx="4" fill="${fill}"/>`;
const up = (x, y, c) => `<path d="M${x} ${y} v-34" stroke="${c === 'g' ? '#45d483' : '#ff5148'}" stroke-width="3.5" stroke-linecap="round" marker-end="url(#mArr${c === 'g' ? 'G' : 'R'})"/>`;
const model = 'url(#gModel)';
const REC = '#3a332b';

// лесенка печати по куполу
function stairs(step) {
  const cx = 160, base = 160, R = 90, H = 70;
  let d = `M${cx - R} ${base}`;
  for (let y = base; y > base - H; y -= step) {
    const t = (base - y) / H;
    const hw = R * Math.sqrt(Math.max(0, 1 - t * t));
    d += ` L${(cx - hw).toFixed(1)} ${y} L${(cx - hw).toFixed(1)} ${y - step}`;
  }
  for (let y = base - H; y < base; y += step) {
    const t = (base - y - step) / H;
    const hw = R * Math.sqrt(Math.max(0, 1 - t * t));
    d += ` L${(cx + hw).toFixed(1)} ${y} L${(cx + hw).toFixed(1)} ${y + step}`;
  }
  return d + ' Z';
}

export const RULES = [
  {
    id: 'draft', title: 'Уклоны 1–3°',
    text: 'Стенки, перпендикулярные разъёму, слегка сужай вглубь — модель выйдет, не задирая форму. В Fusion: Modify → Draft.',
    bad: `${mold()}<rect x="120" y="110" width="80" height="40" fill="${REC}"/>
      <rect x="120" y="58" width="80" height="40" rx="2" fill="${model}"/>
      <path d="M120 112v36M200 112v36" stroke="#ff5148" stroke-width="3"/>
      <circle cx="116" cy="106" r="3" fill="#d6cdbb"/><circle cx="205" cy="103" r="2.5" fill="#d6cdbb"/><circle cx="110" cy="99" r="2" fill="#d6cdbb"/>
      ${up(160, 50, 'r')}${T(160, 196, 'стенки 90° — дерут форму', 'red')}`,
    good: `${mold()}<path d="M112 110 L208 110 L200 150 L120 150 Z" fill="${REC}"/>
      <path d="M112 56 L208 56 L200 96 L120 96 Z" fill="${model}"/>
      <path d="M208 110 V160" stroke="#8a9098" stroke-dasharray="3 3"/><path d="M208 140 q-3 -1 -5 0" stroke="#ffb347" stroke-width="2" fill="none"/>
      ${T(232, 146, '1–3°', 'acc')}
      ${up(160, 48, 'g')}${T(160, 196, 'сужается вглубь — выходит чисто', 'grn')}`,
  },
  {
    id: 'undercut', title: 'Никаких поднутрений',
    text: 'Всё, что шире в глубине, чем у поверхности разъёма, запирает модель. Убери крючки и нависания или перенеси разъём.',
    bad: `${mold()}<path d="M140 110 L180 110 L180 124 L204 136 L204 150 L116 150 L116 136 L140 124 Z" fill="${model}"/>
      <path d="M140 124 L116 136 L116 150 L140 150 Z M180 124 L204 136 L204 150 L180 150 Z" fill="#ff5148" opacity=".45"/>
      ${up(160, 100, 'r')}${T(160, 196, 'поднутрение — модель застрянет', 'red')}`,
    good: `${mold()}<path d="M118 110 L202 110 L192 150 L128 150 Z" fill="${model}"/>
      ${up(160, 100, 'g')}${T(160, 196, 'шире у поверхности — выходит', 'grn')}`,
  },
  {
    id: 'parting', title: 'Разъём по самому широкому сечению',
    text: 'Линия разъёма проходит там, где модель шире всего. Тогда обе половинки сужаются от разъёма — поднутрений нет.',
    bad: `<clipPath id="clPL"><ellipse cx="160" cy="105" rx="80" ry="45"/></clipPath>
      <ellipse cx="160" cy="105" rx="80" ry="45" fill="${model}"/>
      <g clip-path="url(#clPL)"><rect x="70" y="80" width="30" height="70" fill="#ff5148" opacity=".55"/><rect x="220" y="80" width="30" height="70" fill="#ff5148" opacity=".55"/></g>
      <path d="M50 80H270" stroke="#ff5148" stroke-width="2.5" stroke-dasharray="8 5"/>
      ${T(290, 84, 'разъём', 'red', 'end')}${T(160, 180, 'ниже линии шире — поднутрение', 'red')}`,
    good: `<ellipse cx="160" cy="105" rx="80" ry="45" fill="${model}"/>
      <path d="M50 105H270" stroke="#45d483" stroke-width="2.5" stroke-dasharray="8 5"/>
      ${T(290, 98, 'разъём', 'grn', 'end')}${T(160, 180, 'по максимальной ширине', 'grn')}`,
  },
  {
    id: 'walls', title: 'Стенки не тоньше ≈1 мм',
    text: 'Тонкое место металл не пробьёт — застынет раньше. Для олова и серебра держи стенки от ≈1 мм.',
    bad: `<rect x="50" y="96" width="220" height="5" rx="1" fill="#2b3036" stroke="#555c64" stroke-dasharray="4 3"/>
      <rect x="50" y="96" width="110" height="5" rx="1" fill="url(#gMoltenSilver)"/>
      <path d="M160 96 q4 2.5 0 5" fill="#ffb347"/>
      <path d="M40 86 V112M40 86 l-4 6 M40 86 l4 6" stroke="#ece7df" stroke-width="1.5" fill="none"/>
      ${T(46, 80, '≈0,5 мм', 's', 'start')}${T(160, 150, 'металл застыл на полпути', 'red')}`,
    good: `<rect x="50" y="90" width="220" height="16" rx="2" fill="url(#gMoltenSilver)"/>
      <path d="M40 84 V112" stroke="#ece7df" stroke-width="1.5"/>
      ${T(46, 78, '≥ ≈1 мм', 's grn', 'start')}${T(160, 150, 'дошёл до конца', 'grn')}`,
  },
  {
    id: 'sprue', title: 'Литник и каналы — прямо в модели',
    text: 'Нарисуй воронку-литник и тонкие воздушные каналы в Fusion и печатай вместе с моделью. Ровнее, чем резать ножом.',
    bad: `<path d="M160 92 C152 76 128 74 126 96 C124 116 146 132 160 146 C174 132 196 116 194 96 C192 74 168 76 160 92 Z" fill="${model}"/>
      <path d="M230 40 l-30 40" stroke="#c9d0d8" stroke-width="3"/><path d="M200 80 l-4 8 6 -3z" fill="#c9d0d8"/>
      ${T(160, 186, 'резать вручную — криво и с крошками', 'red')}`,
    good: `<path d="M160 92 C152 76 128 74 126 96 C124 116 146 132 160 146 C174 132 196 116 194 96 C192 74 168 76 160 92 Z" fill="${model}"/>
      <path d="M154 94 V40 H146 L142 26 H178 L174 40 H166 V94 Z" fill="${model}"/>
      <path d="M138 80 L128 26 M182 80 L192 26" stroke="#5fe0cf" stroke-width="3.5"/>
      ${T(232, 36, 'литник', 'acc', 'start')}${T(214, 60, 'каналы', 'blu', 'start')}
      ${T(160, 186, 'одной деталью с моделью', 'grn')}`,
  },
  {
    id: 'handle', title: '«Ручка» — отверстие под шуруп',
    text: 'Сделай в модели отверстие под маленький шуруп (с нерабочей стороны). Вкрутил — вынул модель строго вверх.',
    bad: `${mold(110, 60, 'url(#pSand)')}<ellipse cx="160" cy="110" rx="60" ry="22" fill="${model}"/>
      <path d="M96 64 L106 104 M224 64 L214 104" stroke="#9aa2ab" stroke-width="5" stroke-linecap="round"/>
      <circle cx="104" cy="112" r="3" fill="#a07b55"/><circle cx="218" cy="114" r="2.5" fill="#a07b55"/>
      ${T(160, 192, 'щипцами за край — ломаешь отпечаток', 'red')}`,
    good: `${mold(110, 60, 'url(#pSand)')}<ellipse cx="160" cy="110" rx="60" ry="22" fill="${model}"/>
      <rect x="157" y="66" width="6" height="30" fill="#9aa3ad"/><rect x="149" y="60" width="22" height="7" rx="2" fill="#c3cad2"/>
      ${up(200, 92, 'g')}${T(160, 192, 'шуруп в отверстие — и вверх', 'grn')}`,
  },
  {
    id: 'print', title: 'Печать: слой 0,08–0,12 мм, сопло 0,2 мм',
    text: 'Тонкий слой и сопло 0,2 мм дают мелкие ступеньки и детали. Каждая ступенька модели отпечатается в металле.',
    bad: `<path d="${stairs(17.5)}" fill="${model}"/>
      ${T(160, 186, 'толстый слой — «лесенка»', 'red')}`,
    good: `<path d="${stairs(3.5)}" fill="${model}"/>
      ${T(160, 186, '0,08–0,12 мм · сопло 0,2 мм', 'grn')}`,
  },
  {
    id: 'surface', title: 'Шлифовка и грунт модели',
    text: 'Прошкурь модель и покрой грунтом (можно в 2–3 слоя с шлифовкой). Гладкая модель — гладкая отливка и чистый отпечаток.',
    bad: `<path d="M50 140 L60 120 L68 128 L78 104 L90 112 L100 92 L114 100 L126 84 L140 92 L152 80 L168 88 L180 78 L194 90 L208 82 L220 96 L232 90 L244 106 L256 102 L264 122 L270 140 Z" fill="${model}"/>
      ${T(160, 186, 'шероховатость перейдёт в металл', 'red')}`,
    good: `<path d="M50 140 C60 96 110 78 160 78 C210 78 260 96 270 140 Z" fill="${model}"/>
      <path d="M96 104 C116 90 140 86 160 86" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45" fill="none"/>
      ${T(160, 186, 'шкурка + грунт = гладко', 'grn')}`,
  },
  {
    id: 'plate', title: 'Модельная плита',
    text: 'Пластина 2–3 мм: половинки модели напечатаны по обе стороны, по краям — штифты центровки. Разъём всегда ровный, формы — повторяемые.',
    bad: `<rect x="60" y="100" width="200" height="50" fill="url(#gClay)"/>
      <path d="M60 100 Q90 92 110 102 T160 98 T210 104 T260 96" stroke="#ff5148" stroke-width="2.5" fill="none"/>
      <ellipse cx="160" cy="100" rx="44" ry="16" fill="${model}"/>
      ${T(160, 186, 'в пластилин на глаз — разъём кривой', 'red')}`,
    good: `<rect x="40" y="96" width="240" height="8" rx="2" fill="#c0a274"/>
      <path d="M116 96 Q160 66 204 96 Z" fill="${model}"/><path d="M116 104 Q160 134 204 104 Z" fill="${model}"/>
      <rect x="56" y="78" width="10" height="18" rx="3" fill="#8f98a2"/><rect x="254" y="104" width="10" height="18" rx="3" fill="#8f98a2"/>
      ${T(61, 70, 'штифт', 's', 'middle')}${T(259, 138, 'штифт', 's', 'middle')}
      ${T(292, 104, '2–3 мм', 'acc', 'end')}
      ${T(160, 186, 'половинки на плите + штифты', 'grn')}`,
  },
];

export const FUSION_TIPS = [
  ['Draft', 'Modify → <b>Draft</b>: уклон 1–3° от плоскости разъёма.'],
  ['Проверка', 'Inspect → <b>Draft Analysis</b>: красные зоны = поднутрения.'],
  ['Половинки', 'Modify → <b>Split Body</b> по плоскости разъёма → половинки для модельной плиты.'],
  ['Объём', 'ПКМ по телу → <b>Properties</b> → Volume (см³) → в калькулятор металла.'],
];
