// Линейные иконки 24×24, цвет = currentColor
const I = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;

export const icons = {
  home: I('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>'),
  back: I('<path d="M15 5l-7 7 7 7"/>'),
  next: I('<path d="M9 5l7 7-7 7"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
  flame: I('<path d="M12 21c4 0 7-2.7 7-6.6 0-3.1-1.9-5.2-3.6-7.1-.4 1.8-1.3 3-2.6 3.5.3-3.4-1.2-6.3-3.8-7.8.2 3-1.5 5-3 6.8C4.8 11.3 5 12.7 5 14.4 5 18.3 8 21 12 21Z"/><path d="M12 21c-1.8 0-3-1.2-3-2.9 0-1.6 1.2-2.6 2.1-3.7.4 1 1 1.5 1.8 1.6.1-.8.5-1.5 1.1-2 .7 1 1 2 1 3.2 0 2.2-1.3 3.8-3 3.8Z"/>'),
  shield: I('<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6Z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
  timer: I('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.8h5M12 2.8V6M18.5 6.5l1.5-1.5"/>'),
  book: I('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5Z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7.5h6M9 11h4"/>'),
  thermo: I('<path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z"/><path d="M12 9v7.5"/><path d="M17 6h2.5M17 9.5h2.5M17 13h2.5"/>'),
  cart: I('<path d="M3 4h2.5l2.2 10.5h10.6L20.5 7H7"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>'),
  cube: I('<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="M12 12 20 7.5M12 12 4 7.5M12 12v9"/>'),
  crucible: I('<path d="M5 6h14l-2 13.5a1.6 1.6 0 0 1-1.6 1.5H8.6A1.6 1.6 0 0 1 7 19.5Z"/><path d="M6 10.5h12"/><path d="M10 3c0 1 1 1 1 2M14 3c0 1 1 1 1 2"/>'),
  rings: I('<rect x="4" y="5" width="16" height="6" rx="1.5"/><rect x="4" y="13" width="16" height="6" rx="1.5"/><path d="M10 11v2M14 11v2"/>'),
  scale: I('<path d="M12 4v16M7 20h10M5 7h14"/><path d="M5 7 2.5 13a3 3 0 0 0 5 0Z"/><path d="M19 7l-2.5 6a3 3 0 0 0 5 0Z"/><circle cx="12" cy="4" r="1"/>'),
  magnifier: I('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/><path d="M8 9l2 1.5-1 2 2.5 1"/>'),
  note: I('<path d="M5 4h10l4 4v12H5Z"/><path d="M15 4v4h4M8.5 12h7M8.5 15.5h5"/>'),
  camera: I('<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4Z"/><circle cx="12" cy="13.5" r="3.5"/>'),
  trash: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  edit: I('<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="M13.5 6.5l4 4"/>'),
  download: I('<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>'),
  upload: I('<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>'),
  play: I('<path d="M7 4.5v15l12-7.5Z"/>'),
  pause: I('<path d="M8 5v14M16 5v14"/>', 'stroke-width="3"'),
  stop: I('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
  bell: I('<path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15Z"/><path d="M10 21h4"/>'),
  sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
  star: I('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8Z"/>'),
  data: I('<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6"/>'),
  hammer: I('<path d="M14 6 9.5 10.5l4 4L18 10"/><path d="M14 6l2-2 4 4-2 2M11.5 12.5 4 20"/>'),
  oven: I('<rect x="3.5" y="4" width="17" height="16" rx="2"/><rect x="6.5" y="9" width="11" height="8" rx="1"/><path d="M7 6.5h1M10 6.5h1M14 6.5h3"/>'),
  drop: I('<path d="M12 3c3 4.2 6 7.4 6 11a6 6 0 0 1-12 0c0-3.6 3-6.8 6-11Z"/>'),
  info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/>'),
  vent: I('<path d="M4 8h10a3 3 0 1 0-3-3M4 12h15a3 3 0 1 1-3 3M4 16h7"/>'),
  tools: I('<path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-7.5 7.5-3.5-3.5 7.5-7.5"/><path d="M3 21l6-6M6 12 3.5 9.5 6 7l2.5 2.5"/>'),
  later: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
};

// Логотип: тигель + капля (цвет — акцент режима)
export const brandMark = () => `
<svg viewBox="0 0 32 32" aria-hidden="true">
  <defs><linearGradient id="bmG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent-2)"/><stop offset="1" stop-color="var(--accent)"/></linearGradient></defs>
  <rect x="1" y="1" width="30" height="30" rx="9" fill="#1d2125" stroke="#363c43"/>
  <path d="M8 9h16l-2.2 13.2a2 2 0 0 1-2 1.8h-7.6a2 2 0 0 1-2-1.8Z" fill="#30353b" stroke="#5b626a"/>
  <path d="M9.3 13h13.4l-1.3 8.6a1.6 1.6 0 0 1-1.6 1.4h-7.6a1.6 1.6 0 0 1-1.6-1.4Z" fill="url(#bmG)"/>
  <path d="M24 8.6c1.6 1.6 2.3 2.9 2.3 4a1.7 1.7 0 0 1-3.4 0c0-.9.4-2 1.1-4Z" fill="url(#bmG)"/>
</svg>`;
