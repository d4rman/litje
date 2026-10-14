// Таймеры: считаем по часам (startedAt), а не по тикам — переживают перезагрузку и сон телефона.
import { store } from './store.js';
import { toast, uid } from './ui.js';

export const PRESETS = [
  {
    id: 'plaster60', title: 'Схватывание гипса', icon: 'timer', sub: '60 мин',
    stages: [{ label: 'Схватывание', min: 60, msg: 'Гипс схватился — можно разбирать опалубку.' }],
  },
  {
    id: 'furnace25', title: 'Нагрев печи', icon: 'flame', sub: '25 мин',
    stages: [{ label: 'Прогрев печи', min: 25, msg: 'Печь прогрета — проверь, что металл полностью жидкий.' }],
  },
  {
    id: 'ovenDry', title: 'Сушка гипса (духовка)', icon: 'oven', sub: '≈60 → 110 → 180 °C', editable: true,
    stages: [
      { label: '≈60 °C', min: 60, range: '1 ч', msg: 'Ступень 1 готова → поставь ≈110 °C.' },
      { label: '≈110 °C', min: 150, range: '2–3 ч', msg: 'Ступень 2 готова → поставь ≈180 °C.' },
      { label: '≈180 °C', min: 90, range: '1–2 ч', msg: 'Сушка окончена → выключи духовку, остуди внутри и взвесь форму.' },
    ],
  },
];

const KEY = 'timers';
export const list = () => store.get(KEY, []);
const save = ts => { store.set(KEY, ts); emit(); };
const emit = () => window.dispatchEvent(new CustomEvent('mc:timers'));

export function totalMs(t) { return t.stages.reduce((a, s) => a + s.min * 60000, 0); }
export function elapsedMs(t, now = Date.now()) {
  const end = t.pausedAt || now;
  return Math.max(0, end - t.startedAt - (t.pausedMs || 0));
}
export function status(t, now = Date.now()) {
  const el = elapsedMs(t, now);
  let acc = 0, idx = 0, stageEnd = 0;
  for (; idx < t.stages.length; idx++) {
    acc += t.stages[idx].min * 60000;
    if (el < acc) { stageEnd = acc; break; }
  }
  const total = totalMs(t);
  const done = el >= total;
  return {
    elapsed: el, total, done,
    stageIdx: done ? t.stages.length - 1 : idx,
    stageRemain: done ? 0 : stageEnd - el,
    remain: Math.max(0, total - el),
    passed: done ? t.stages.length : idx, // сколько ступеней завершено
  };
}

export function start(preset, stagesOverride) {
  unlockAudio();
  const t = {
    id: uid(), preset: preset.id || 'custom', title: preset.title,
    stages: (stagesOverride || preset.stages).map(s => ({ ...s })),
    startedAt: Date.now(), pausedAt: 0, pausedMs: 0, fired: 0,
  };
  save([...list(), t]);
  return t;
}
export function pause(id) {
  save(list().map(t => (t.id === id && !t.pausedAt ? { ...t, pausedAt: Date.now() } : t)));
}
export function resume(id) {
  unlockAudio();
  save(list().map(t => (t.id === id && t.pausedAt ? { ...t, pausedMs: (t.pausedMs || 0) + Date.now() - t.pausedAt, pausedAt: 0 } : t)));
}
export function remove(id) { save(list().filter(t => t.id !== id)); }
export function addMinutes(id, min) {
  save(list().map(t => {
    if (t.id !== id) return t;
    const st = t.stages.map(s => ({ ...s }));
    st[st.length - 1].min += min;
    return { ...t, stages: st, fired: Math.min(t.fired, st.length - 1) };
  }));
}
export const runningCount = () => list().filter(t => !status(t).done).length;

// ---------- тик и оповещения ----------
let timer = null;
export function startLoop() {
  if (timer) return;
  const tick = () => {
    const ts = list();
    let changed = false;
    const now = Date.now();
    for (const t of ts) {
      if (t.pausedAt) continue;
      const st = status(t, now);
      while (t.fired < st.passed) {
        const s = t.stages[t.fired];
        const lateMin = Math.round((st.elapsed - t.stages.slice(0, t.fired + 1).reduce((a, x) => a + x.min * 60000, 0)) / 60000);
        const last = t.fired === t.stages.length - 1;
        alarm(`${t.title}${t.stages.length > 1 ? ` · ${s.label}` : ''}`, (s.msg || (last ? 'Время вышло.' : 'Ступень завершена.')) + (lateMin >= 2 ? ` (опоздание ${lateMin} мин)` : ''));
        t.fired++;
        changed = true;
      }
    }
    if (changed) store.set(KEY, ts);
    emit();
  };
  tick();
  timer = setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); reacquireWake(); } });
}

// ---------- звук ----------
let actx = null;
export function unlockAudio() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch {}
}
function beep() {
  if (!actx) return;
  try {
    const t0 = actx.currentTime;
    [0, .32, .64].forEach(dt => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t0 + dt);
      g.gain.exponentialRampToValueAtTime(0.35, t0 + dt + .02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + .25);
      o.connect(g).connect(actx.destination);
      o.start(t0 + dt); o.stop(t0 + dt + .27);
    });
  } catch {}
}

// ---------- уведомления ----------
export const notifSupported = () => 'Notification' in window;
export const notifPermission = () => (notifSupported() ? Notification.permission : 'unsupported');
export async function askNotif() {
  if (!notifSupported()) return 'unsupported';
  try { return await Notification.requestPermission(); } catch { return 'denied'; }
}
async function sysNotify(title, body) {
  if (notifPermission() !== 'granted') return;
  const opts = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'mc-' + title, renotify: true };
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg) return reg.showNotification(title, opts);
    new Notification(title, opts);
  } catch {}
}
function alarm(title, body) {
  beep();
  try { navigator.vibrate?.([200, 100, 200, 100, 400]); } catch {}
  toast(`⏰ ${title}: ${body}`, { alarm: true, ms: 9000 });
  sysNotify(title, body);
}

// ---------- не гасить экран ----------
let wake = null;
export const wakeSupported = () => 'wakeLock' in navigator;
export const wakeOn = () => store.get('wake', false);
export async function setWake(on) {
  store.set('wake', on);
  if (on) await reacquireWake();
  else { try { await wake?.release(); } catch {} wake = null; }
  emit();
}
async function reacquireWake() {
  if (!wakeOn() || !wakeSupported() || document.hidden) return;
  try { wake = await navigator.wakeLock.request('screen'); } catch {}
}
export const wakeActive = () => !!wake && !wake.released;
