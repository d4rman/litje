// Проверка SMIL-анимаций во всех SVG: keyTimes по возрастанию, 0…1, совпадение числа значений.
// Запуск: node tools/check-svg.mjs
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const imp = p => import(pathToFileURL(root + p).href);
const { scene } = await imp('/js/svg/scenes.js');
const { WIZARDS } = await imp('/js/data/wizards.js');
const { RULES } = await imp('/js/data/modeling.js');
const { DEFECTS } = await imp('/js/data/defects.js');
const jobs = [];
for (const w of WIZARDS) w.steps.forEach((s, i) => jobs.push([`${w.id}#${i + 1}`, scene(s.scene[0], s.scene[1])]));
jobs.push(['hero-tin', scene('hero', { mode: 'tin' })], ['hero-silver', scene('hero', { mode: 'silver' })]);
RULES.forEach(r => jobs.push([`rule:${r.id}`, r.bad + r.good]));
DEFECTS.forEach(d => jobs.push([`defect:${d.id}`, d.art]));
let bad = 0;
for (const [name, svg] of jobs) {
  for (const m of svg.matchAll(/<animate(?:Transform)?\b[^>]*>/g)) {
    const tag = m[0];
    const kt = tag.match(/keyTimes="([^"]*)"/), vals = tag.match(/values="([^"]*)"/), ks = tag.match(/keySplines="([^"]*)"/);
    if (!kt) continue;
    const t = kt[1].split(';').map(Number), v = vals[1].split(';');
    const errs = [];
    if (t[0] !== 0 || t[t.length - 1] !== 1) errs.push('ends');
    for (let i = 1; i < t.length; i++) if (t[i] < t[i - 1]) errs.push(`order@${i}`);
    if (t.length !== v.length) errs.push(`count ${t.length}/${v.length}`);
    if (ks && ks[1].split(';').length !== t.length - 1) errs.push('splines');
    if (t.some(isNaN)) errs.push('NaN');
    if (errs.length) { bad++; console.log(name, errs.join(','), kt[1], '|', tag.slice(0, 60)); }
  }
  if (/undefined|NaN/.test(svg)) console.log(name, 'contains undefined/NaN');
}
console.log(`checked ${jobs.length} svgs, problems: ${bad}`);
