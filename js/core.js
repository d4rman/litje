// Общее состояние: режим, прогресс мастеров, чек-лист безопасности, «просмотрено».
import { store } from './store.js';
import { WIZARDS } from './data/wizards.js';

export const MODES = {
  tin: { label: 'Олово (учёба)', short: 'Олово' },
  silver: { label: 'Серебро', short: 'Серебро' },
};
export const getMode = () => (store.get('mode', 'tin') === 'silver' ? 'silver' : 'tin');
export function setMode(m) {
  store.set('mode', m);
  applyMode();
  window.dispatchEvent(new CustomEvent('mc:mode', { detail: m }));
}
export function applyMode() {
  const m = getMode();
  document.body.dataset.mode = m;
  document.querySelectorAll('[data-mode-set]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.modeSet === m)));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#111315');
}

// ---------- прогресс мастеров ----------
export const wizState = id => store.get('wiz', {})[id] || { step: 0, max: 0, done: false };
export function setWizState(id, patch) {
  store.patch('wiz', all => ({ ...all, [id]: { ...wizState(id), ...patch } }));
}
export function wizProgress(id) {
  const w = WIZARDS.find(x => x.id === id);
  const s = wizState(id);
  if (!w) return 0;
  return s.done ? 1 : Math.min(1, (s.max + (s.max > 0 ? 1 : 0)) / w.steps.length);
}
export const groupProgress = group => {
  const ws = WIZARDS.filter(w => w.group === group);
  return ws.reduce((a, w) => a + wizProgress(w.id), 0) / ws.length;
};

// ---------- чек-лист безопасности ----------
export const SAFETY = [
  { id: 'vent', t: 'Вентиляция включена', s: 'окно/вытяжка, есть приток воздуха', ico: 'vent' },
  { id: 'ext', t: 'Огнетушитель рядом', s: 'порошковый, на расстоянии вытянутой руки', ico: 'shield' },
  { id: 'ppe', t: 'Щиток, фартук, перчатки', s: 'надеты, а не «лежат рядом»', ico: 'shield' },
  { id: 'cotton', t: 'Хлопковая одежда', s: 'синтетика плавится и прилипает', ico: 'shield' },
  { id: 'shoes', t: 'Закрытая обувь', s: 'кожаная, без сетки и дыр', ico: 'shield' },
  { id: 'dry', t: 'Всё сухое', s: 'форма, металл, инструмент, пол', ico: 'drop' },
  { id: 'sand', t: 'Зона заливки с песком', s: 'противень, сухой песок, кирпичи', ico: 'flame' },
  { id: 'alone', t: 'Никого рядом', s: 'ни детей, ни животных', ico: 'info' },
  { id: 'phone', t: 'Телефон рядом', s: 'на случай 112', ico: 'bell' },
];
const SAFETY_TTL = 8 * 3600 * 1000; // отметки живут 8 часов — дальше новая сессия

export function safetyState() {
  const s = store.get('safety', { checks: {}, ts: 0, readyAt: 0 });
  if (s.ts && Date.now() - s.ts > SAFETY_TTL) return { checks: {}, ts: 0, readyAt: 0 };
  return s;
}
export function setSafety(next) { store.set('safety', { ...next, ts: Date.now() }); }
export function safetyStatus() {
  const s = safetyState();
  const done = SAFETY.filter(x => s.checks[x.id]).length;
  return { done, total: SAFETY.length, all: done === SAFETY.length, ready: !!s.readyAt && done === SAFETY.length };
}

// ---------- «просмотрено» ----------
export const seen = key => !!store.get('seen', {})[key];
export const markSeen = key => store.patch('seen', s => ({ ...s, [key]: true }));
