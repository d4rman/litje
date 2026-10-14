import { GEAR } from '../data/gear.js';
import { store } from '../store.js';
import { icons } from '../svg/icons.js';
import { getMode } from '../core.js';
import { esc, fmt, parseNum, queryLink, uid, confirmDanger } from '../ui.js';

const ICO = { flame: 'flame', rings: 'rings', crucible: 'crucible', shield: 'shield', tools: 'tools', later: 'later' };
const st = () => store.get('gear', { bought: {}, prices: {}, custom: [], withLater: false });

function priceOf(item, s) {
  if (s.prices && item.id in s.prices) return s.prices[item.id];
  return item.price ?? null;
}

function groupsOrdered(mode) {
  const order = mode === 'silver' ? ['furnace', 'silver', 'safety', 'tin', 'finish', 'later'] : ['furnace', 'tin', 'safety', 'silver', 'finish', 'later'];
  return order.map(id => GEAR.find(g => g.id === id));
}

function itemsOf(g, s) {
  return [...g.items, ...(s.custom || []).filter(c => c.group === g.id).map(c => ({ ...c, custom: true }))];
}

function row(item, s) {
  const on = !!s.bought?.[item.id];
  const p = priceOf(item, s);
  return `
    <label class="check ${on ? 'on' : ''}" data-id="${item.id}">
      <input type="checkbox" ${on ? 'checked' : ''}>
      <span class="box">${icons.check}</span>
      <span class="ct">
        <b>${esc(item.name)}</b>
        ${item.note ? `<small>${esc(item.note)}</small>` : ''}
        ${item.q ? queryLink(item.q) : ''}
      </span>
      <span class="side">
        <span class="price-wrap"><input class="price-in num" inputmode="decimal" data-price="${item.id}" value="${p != null ? String(p).replace('.', ',') : ''}" placeholder="—" aria-label="Цена, zł">${item.approx && s.prices?.[item.id] == null ? '' : ''}<span>zł</span></span>
        ${item.custom ? `<button class="icon-btn" style="width:34px;height:34px" data-del="${item.id}" aria-label="Удалить">${icons.x}</button>` : ''}
      </span>
    </label>`;
}

export default function gear() {
  const mode = getMode();

  function totals(s) {
    let all = 0, bought = 0, missing = 0;
    for (const g of GEAR) {
      if (g.later && !s.withLater) continue;
      for (const it of itemsOf(g, s)) {
        const p = priceOf(it, s);
        if (p == null || isNaN(p)) { if (!s.bought?.[it.id]) missing++; continue; }
        all += p;
        if (s.bought?.[it.id]) bought += p;
      }
    }
    return { all, bought, left: all - bought, missing };
  }
  const groupSum = (g, s) => itemsOf(g, s).reduce((a, it) => a + (priceOf(it, s) || 0), 0);

  function build() {
    const s = st();
    const t = totals(s);
    return `
      <div class="page-head">
        <div class="eyebrow">Раздел 2</div>
        <h1>Оборудование и покупки</h1>
        <p>Отмечай купленное, вписывай цены — сумма считается сама. Польский запрос открывает поиск на Allegro.</p>
      </div>
      <div class="totals" id="totals">
        <div><small>Всего</small><b class="num" id="tAll">${fmt(t.all)} zł</b></div>
        <div><small>Куплено</small><b class="num" id="tBought" style="color:var(--ok)">${fmt(t.bought)} zł</b></div>
        <div><small>Осталось</small><b class="num grad-text" id="tLeft">${fmt(t.left)} zł</b></div>
      </div>
      <p class="tiny" id="tMissing" style="margin:8px 4px 0">${t.missing ? `Без цены: ${t.missing} поз. — впиши, чтобы сумма была точной. Цена VEVOR — ≈590 zł.` : ''}</p>
      ${groupsOrdered(mode).map(g => `
        <div class="group-head">
          <span class="gh-ico">${icons[ICO[g.icon] || 'cart']}</span>
          <h3>${g.title}</h3>
          <span class="gh-sum num" data-gsum="${g.id}">${fmt(groupSum(g, s))} zł</span>
        </div>
        ${g.later ? `<label class="check ${s.withLater ? 'on' : ''}" data-later style="margin-bottom:8px"><input type="checkbox" ${s.withLater ? 'checked' : ''}><span class="box">${icons.check}</span><span class="ct"><b>Учитывать «Позже» в сумме</b><small>литьё по выплавляемым моделям — следующий этап</small></span><span></span></label>` : ''}
        <div class="stack" style="gap:8px">${itemsOf(g, s).map(it => row(it, s)).join('')}</div>
        <form class="row" data-add="${g.id}" style="margin-top:8px">
          <input name="n" placeholder="Своя позиция…" aria-label="Новая позиция в группе ${esc(g.title)}" style="min-height:42px">
          <button class="btn small" type="submit">${icons.plus}</button>
        </form>
      `).join('')}
      <p class="tiny" style="margin-top:20px">Цены — твои, приложение их не знает. ≈ — примерно.</p>`;
  }

  function mount(root) {
    const refreshTotals = () => {
      const s = st();
      const t = totals(s);
      root.querySelector('#tAll').textContent = `${fmt(t.all)} zł`;
      root.querySelector('#tBought').textContent = `${fmt(t.bought)} zł`;
      root.querySelector('#tLeft').textContent = `${fmt(t.left)} zł`;
      root.querySelector('#tMissing').textContent = t.missing ? `Без цены: ${t.missing} поз. — впиши, чтобы сумма была точной.` : '';
      GEAR.forEach(g => { const el = root.querySelector(`[data-gsum="${g.id}"]`); if (el) el.textContent = `${fmt(groupSum(g, s))} zł`; });
    };
    const redraw = () => { const y = scrollY; root.innerHTML = build(); scrollTo(0, y); };

    root.addEventListener('click', async e => {
      if (e.target.closest('[data-stop], input.price-in')) return;
      const del = e.target.closest('[data-del]');
      if (del) {
        e.preventDefault();
        if (await confirmDanger('Удалить позицию?', '')) {
          store.patch('gear', s => ({ ...s, custom: (s.custom || []).filter(c => c.id !== del.dataset.del) }), st());
          redraw();
        }
        return;
      }
      const lat = e.target.closest('[data-later]');
      if (lat) {
        e.preventDefault();
        store.patch('gear', s => ({ ...s, withLater: !s.withLater }), st());
        redraw();
        return;
      }
      const lab = e.target.closest('label.check[data-id]');
      if (lab) {
        e.preventDefault();
        const id = lab.dataset.id;
        const s = store.patch('gear', s => ({ ...s, bought: { ...s.bought, [id]: !s.bought?.[id] } }), st());
        lab.classList.toggle('on', !!s.bought[id]);
        refreshTotals();
      }
    });
    root.addEventListener('input', e => {
      const inp = e.target.closest('[data-price]');
      if (!inp) return;
      const v = parseNum(inp.value);
      const id = inp.dataset.price;
      store.patch('gear', s => {
        const prices = { ...s.prices };
        if (inp.value.trim() === '') prices[id] = null; else if (!isNaN(v)) prices[id] = v;
        return { ...s, prices };
      }, st());
      refreshTotals();
    });
    root.addEventListener('submit', e => {
      const f = e.target.closest('[data-add]');
      if (!f) return;
      e.preventDefault();
      const name = f.n.value.trim();
      if (!name) return;
      store.patch('gear', s => ({ ...s, custom: [...(s.custom || []), { id: 'c' + uid(), group: f.dataset.add, name }] }), st());
      redraw();
    });
  }

  return { title: 'Оборудование и покупки', back: '', html: build(), mount };
}
