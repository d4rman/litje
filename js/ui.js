// Мелкие UI-помощники: экранирование, числа, тосты, диалоги, делегирование событий.

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const nf = new Map();
export function fmt(n, digits = 0) {
  if (n == null || !isFinite(n)) return '—';
  const key = digits;
  if (!nf.has(key)) nf.set(key, new Intl.NumberFormat('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits }));
  return nf.get(key).format(n);
}
// «1,5» и «1.5» → 1.5
export const parseNum = v => {
  const n = parseFloat(String(v ?? '').replace(',', '.').replace(/\s/g, ''));
  return isFinite(n) ? n : NaN;
};

export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

export function fmtDuration(ms, withSec = true) {
  const neg = ms < 0;
  let s = Math.round(Math.abs(ms) / 1000);
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  const pad = x => String(x).padStart(2, '0');
  const body = h ? `${h}:${pad(m)}${withSec ? ':' + pad(s) : ''}` : `${pad(m)}${withSec ? ':' + pad(s) : ''}`;
  return (neg ? '−' : '') + body;
}
export function fmtMinutes(min) {
  if (min < 1) return `${Math.round(min * 60)} с`;
  if (min < 60) return `${Math.round(min)} мин`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}
export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}
export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Делегирование: on(root, 'click', '[data-act]', (e, el) => …)
export function on(root, type, selector, handler, opts) {
  const fn = e => {
    const el = e.target.closest(selector);
    if (el && root.contains(el)) handler(e, el);
  };
  root.addEventListener(type, fn, opts);
  return () => root.removeEventListener(type, fn, opts);
}

export function toast(msg, { alarm = false, ms = 3200 } = {}) {
  const wrap = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast' + (alarm ? ' alarm' : '');
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 260);
  }, ms);
}

// Модальное окно. buttons: [{label, value, cls}] → Promise(value)
export function modal({ title, body = '', buttons = [{ label: 'OK', value: true, cls: 'primary' }] }) {
  return new Promise(resolve => {
    const root = document.getElementById('modalRoot');
    root.innerHTML = `
      <div class="modal-back" data-close>
        <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
          <h3>${esc(title)}</h3>
          ${body ? `<div class="muted">${body}</div>` : ''}
          <div class="row wrap">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${esc(b.label)}</button>`).join('')}</div>
        </div>
      </div>`;
    const close = v => { root.innerHTML = ''; document.removeEventListener('keydown', key); resolve(v); };
    const key = e => { if (e.key === 'Escape') close(undefined); };
    document.addEventListener('keydown', key);
    root.querySelector('.modal-back').addEventListener('click', e => {
      if (e.target.dataset.close !== undefined) return close(undefined);
      const b = e.target.closest('[data-i]');
      if (b) close(buttons[+b.dataset.i].value);
    });
    root.querySelector('[data-i]')?.focus();
  });
}

export const confirmDanger = (title, body, ok = 'Удалить') =>
  modal({ title, body, buttons: [{ label: 'Отмена', value: false, cls: 'ghost' }, { label: ok, value: true, cls: 'danger' }] });

// Плашки ⚠️ / 🟡 / 🟢
const CALLOUT = { danger: '⚠️', warn: '🟡', tip: '🟢', info: 'ℹ️' };
export const callout = (type, html) => `<div class="callout ${type}"><span class="ci">${CALLOUT[type] || ''}</span><div>${html}</div></div>`;
export const callouts = list => list?.length ? `<div class="callouts">${list.map(c => callout(c[0], c[1])).join('')}</div>` : '';

export const allegro = q => 'https://allegro.pl/listing?string=' + encodeURIComponent(q);

// Ссылка на Allegro (польский запрос) — открывается в новой вкладке
export const queryLink = q => `<a class="q" href="${allegro(q)}" target="_blank" rel="noopener" data-stop>🔎 ${esc(q)}</a>`;

export function downloadFile(name, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
