import { store } from '../store.js';
import { getMode } from '../core.js';
import { fmt, parseNum, callout } from '../ui.js';

const METALS = {
  tin: { name: 'Олово / пьютер', rho: 7.3 },
  silver: { name: 'Серебро 925', rho: 10.36 },
};
const DEF = { vol: '', reserve: 40, price: { tin: '', silver: '' } };

export default function calc() {
  const c0 = { ...DEF, ...store.get('calc', {}) };
  c0.price = { ...DEF.price, ...(c0.price || {}) };
  let metal = getMode(); // следует за переключателем режима вверху

  const html = `
    <div class="page-head">
      <div class="eyebrow">Раздел 7</div>
      <h1>Калькулятор металла</h1>
      <p>Объём модели из Fusion 360 → вес изделия, сколько плавить и сколько это стоит.</p>
    </div>
    <div class="card stack">
      <label class="fld">Объём модели
        <div class="input-unit"><input id="cVol" class="num" inputmode="decimal" placeholder="например 1,8" value="${String(c0.vol).replace('.', ',')}"><span>см³</span></div>
      </label>
      <div class="fld">Металл
        <div class="seg acc" id="cMetal">
          ${Object.entries(METALS).map(([k, m]) => `<button data-m="${k}" class="${k === metal ? 'on' : ''}">${m.name} · ≈${fmt(m.rho, k === 'silver' ? 2 : 1)}</button>`).join('')}
        </div>
      </div>
      <label class="fld"><span class="row">Запас на литник и каналы <span class="spacer"></span><b class="num" id="cResV" style="color:var(--text)">+${c0.reserve}%</b></span>
        <input type="range" id="cRes" min="0" max="100" step="5" value="${c0.reserve}">
      </label>
      <label class="fld">Цена металла
        <div class="input-unit"><input id="cPrice" class="num" inputmode="decimal" placeholder="твоя цена" value=""><span>zł/г</span></div>
      </label>
    </div>
    <div class="calc-out" style="margin-top:12px">
      <div class="big-stat hl"><small>Вес изделия</small><b class="num" id="oW">—</b><span>объём × плотность</span></div>
      <div class="big-stat hl"><small>Расплавить</small><b class="num" id="oM">—</b><span id="oMs">с запасом</span></div>
      <div class="big-stat"><small>Стоимость изделия</small><b class="num" id="oC">—</b><span>металл в готовой вещи</span></div>
      <div class="big-stat"><small>Металла в тигель</small><b class="num" id="oCM">—</b><span>литник уйдёт в переплав</span></div>
    </div>
    <div class="callouts" style="margin-top:14px">
      ${callout('info', 'Fusion 360: ПКМ по телу → <b>Properties</b> → <b>Volume</b>. Если модель с литником и каналами — запас можно уменьшить.')}
      ${callout('tip', 'Литник и выпоры вернутся в переплав — реально тратится ≈ вес изделия плюс угар.')}
    </div>`;

  function mount(root) {
    const $ = s => root.querySelector(s);
    const $vol = $('#cVol'), $res = $('#cRes'), $price = $('#cPrice');
    const fillPrice = () => { const p = store.get('calc', c0).price?.[metal] ?? ''; $price.value = String(p).replace('.', ','); };
    fillPrice();

    function save(patch) { store.set('calc', { ...store.get('calc', c0), ...patch }); }
    function update() {
      const v = parseNum($vol.value), r = +$res.value, p = parseNum($price.value);
      $('#cResV').textContent = `+${r}%`;
      const rho = METALS[metal].rho;
      const w = v > 0 ? v * rho : NaN;
      const m = w * (1 + r / 100);
      $('#oW').textContent = isNaN(w) ? '—' : `≈${fmt(w, 2)} г`;
      $('#oM').textContent = isNaN(m) ? '—' : `≈${fmt(m, 1)} г`;
      $('#oMs').textContent = `+${r}% на литник`;
      $('#oC').textContent = isNaN(w) || isNaN(p) ? '—' : `≈${fmt(w * p, 2)} zł`;
      $('#oCM').textContent = isNaN(m) || isNaN(p) ? '—' : `≈${fmt(m * p, 2)} zł`;
    }
    update();

    $vol.addEventListener('input', () => { save({ vol: $vol.value }); update(); });
    $res.addEventListener('input', () => { save({ reserve: +$res.value }); update(); });
    $price.addEventListener('input', () => {
      const c = store.get('calc', c0);
      save({ price: { ...c0.price, ...(c.price || {}), [metal]: $price.value } });
      update();
    });
    $('#cMetal').addEventListener('click', e => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      metal = b.dataset.m;
      root.querySelectorAll('#cMetal button').forEach(x => x.classList.toggle('on', x === b));
      fillPrice();
      update();
    });
  }
  return { title: 'Калькулятор металла', back: '', html, mount };
}
