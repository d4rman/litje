// Оболочка: роутер по hash, верхняя панель, нижняя навигация, режим, таймеры, SW.
import { icons, brandMark } from './svg/icons.js';
import { getMode, setMode, applyMode, safetyStatus } from './core.js';
import { startLoop, runningCount } from './timers-core.js';
import { toast } from './ui.js';

import home from './views/home.js';
import metals from './views/metals.js';
import gear from './views/gear.js';
import modeling from './views/modeling.js';
import process from './views/process.js';
import wizard from './views/wizard.js';
import safety from './views/safety.js';
import calc from './views/calc.js';
import timers from './views/timers.js';
import defects from './views/defects.js';
import journal from './views/journal.js';
import data from './views/data.js';

const ROUTES = [
  [/^$/, home],
  [/^metals$/, metals],
  [/^gear$/, gear],
  [/^model$/, modeling],
  [/^(tin|silver)$/, process],
  [/^w\/([a-z0-9]+)$/, wizard],
  [/^safety$/, safety],
  [/^calc$/, calc],
  [/^timers$/, timers],
  [/^defects$/, defects],
  [/^journal(?:\/(new|[a-z0-9]+))?$/, journal],
  [/^data$/, data],
];

const $view = document.getElementById('view');
const $title = document.getElementById('pageTitle');
const $back = document.getElementById('backBtn');
const $nav = document.getElementById('bottomNav');
let cleanup = null;
let current = null;

function parse() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('?')[0].replace(/\/$/, '');
  for (const [re, v] of ROUTES) {
    const m = raw.match(re);
    if (m) return { view: v, params: m.slice(1), path: raw };
  }
  return { view: home, params: [], path: '' };
}

function render({ keepScroll = false } = {}) {
  const r = parse();
  if (cleanup) { try { cleanup(); } catch {} cleanup = null; }
  const v = r.view(r.params);
  current = r;
  document.title = v.title ? `${v.title} · Мастерская литья` : 'Мастерская литья';
  $title.textContent = r.path ? v.title : 'Мастерская литья';
  $back.hidden = !r.path;
  document.querySelector('.topbar').classList.toggle('inner', !!r.path);
  $back.dataset.to = v.back ?? '';
  $view.innerHTML = v.html;
  $view.classList.remove('view-enter');
  void $view.offsetWidth;
  $view.classList.add('view-enter');
  if (!keepScroll) window.scrollTo(0, 0);
  cleanup = v.mount?.($view) || null;
  renderNav(r.path);
}

function renderNav(path = current?.path || '') {
  const mode = getMode();
  const run = runningCount();
  const s = safetyStatus();
  const items = [
    ['', 'home', 'Главная'],
    [mode, 'flame', 'Процесс', p => p === mode || p.startsWith('w/') || p === 'tin' || p === 'silver'],
    ['safety', 'shield', 'Заливка', null, 'pour'],
    ['timers', 'timer', 'Таймеры'],
    ['journal', 'book', 'Журнал', p => p.startsWith('journal')],
  ];
  $nav.innerHTML = items.map(([to, ico, label, match, cls]) => {
    const active = match ? match(path) : path === to;
    const badge = to === 'timers' && run ? `<span class="nav-badge">${run}</span>`
      : to === 'safety' && s.done > 0 && !s.all ? `<span class="nav-badge">${s.done}/${s.total}</span>` : '';
    return `<a href="#/${to}" class="${active ? 'active' : ''} ${cls || ''}" ${active ? 'aria-current="page"' : ''}>${icons[ico]}<span>${label}</span>${badge}</a>`;
  }).join('');
}

// ---------- init ----------
document.getElementById('brandMark').innerHTML = brandMark();
$back.innerHTML = icons.back;
$back.addEventListener('click', () => { location.hash = '#/' + ($back.dataset.to || ''); });
document.querySelectorAll('[data-mode-set]').forEach(b => b.addEventListener('click', () => {
  if (getMode() === b.dataset.modeSet) return;
  setMode(b.dataset.modeSet);
  // раздел «Процесс» другого металла → переключаем на свой
  const p = current?.path;
  if (p === 'tin' || p === 'silver') location.hash = '#/' + getMode();
  else render({ keepScroll: true });
  toast(getMode() === 'silver' ? 'Режим: серебро' : 'Режим: олово (учёба)', { ms: 1600 });
}));
window.addEventListener('hashchange', () => render());
window.addEventListener('mc:timers', () => renderNav());
window.addEventListener('mc:safety', () => renderNav());
window.addEventListener('mc:storage-error', () => toast('⚠️ Память браузера заполнена — сделай резервную копию и удали старые фото', { ms: 6000 }));

applyMode();
render();
startLoop();

// Service worker — только по https (GitHub Pages). На localhost/LAN не мешает разработке.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

export const rerender = () => render({ keepScroll: true });
