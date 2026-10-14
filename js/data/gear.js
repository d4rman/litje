// Оборудование и покупки. price — стартовая цена в zł (редактируется), q — польский запрос.
export const GEAR = [
  {
    id: 'furnace', title: 'Печь', icon: 'flame',
    items: [
      { id: 'vevor', name: 'Печь VEVOR 1350 Вт / 1150 °C', price: 590, approx: true, q: 'piec do topienia metali VEVOR 1150' },
      { id: 'cru-spare', name: 'Запасной графитовый тигель', q: 'tygiel grafitowy do pieca VEVOR' },
      { id: 'cru-tin', name: 'Отдельный тигель ТОЛЬКО для олова', note: 'подписать!', q: 'tygiel grafitowy mały' },
      { id: 'zone-tray', name: 'Противень для зоны заливки', q: 'blacha stalowa do pieczenia' },
      { id: 'zone-brick', name: 'Огнеупорные кирпичи', q: 'cegła szamotowa' },
      { id: 'zone-sand', name: 'Сухой песок', q: 'piasek kwarcowy suszony' },
    ],
  },
  {
    id: 'silver', title: 'Серебро', icon: 'rings', mode: 'silver',
    items: [
      { id: 'delft', name: 'Набор Delft clay (земля + кольца)', q: 'Delft clay zestaw odlewniczy' },
      { id: 'borax', name: 'Бура (boraks)', q: 'boraks do lutowania' },
      { id: 'graphite-rod', name: 'Графитовая палочка для перемешивания', q: 'pręt grafitowy do mieszania' },
      { id: 'citric', name: 'Отбел: лимонная кислота', q: 'kwasek cytrynowy 1 kg' },
      { id: 'cooker', name: 'Старая мультиварка под отбел', note: 'только для отбела', q: 'wolnowar używany' },
      { id: 'tweezers', name: 'Медные / пластиковые пинцеты', q: 'pęseta miedziana jubilerska' },
      { id: 'ag925', name: 'Серебро 925 в гранулах', q: 'granulat srebra 925' },
    ],
  },
  {
    id: 'tin', title: 'Олово', icon: 'crucible', mode: 'tin',
    items: [
      { id: 'pewter', name: 'Бессвинцовый пьютер', note: 'только без свинца!', q: 'cyna bezołowiowa do odlewania' },
      { id: 'silicone', name: 'Термостойкий силикон (до ≈300 °C)', q: 'silikon wysokotemperaturowy do odlewania cyny' },
      { id: 'plaster', name: 'Формовочный гипс', q: 'gips modelarski formierski' },
      { id: 'release', name: 'Разделитель: вазелин / спрей', q: 'wazelina techniczna rozdzielacz do form' },
    ],
  },
  {
    id: 'safety', title: 'Безопасность', icon: 'shield',
    items: [
      { id: 'faceshield', name: 'Щиток на лицо', q: 'przyłbica ochronna' },
      { id: 'apron', name: 'Кожаный фартук', q: 'fartuch spawalniczy skórzany' },
      { id: 'gloves', name: 'Кожаные перчатки', q: 'rękawice spawalnicze skórzane' },
      { id: 'cotton', name: 'Хлопковая одежда', note: 'синтетика плавится на коже', q: 'odzież robocza bawełniana' },
      { id: 'extinguisher', name: 'Порошковый огнетушитель', q: 'gaśnica proszkowa' },
      { id: 'smoke', name: 'Дымовой датчик', q: 'czujnik dymu' },
      { id: 'co', name: 'Датчик CO', q: 'czujnik czadu' },
      { id: 'respirator', name: 'Респиратор P2/P3', q: 'półmaska P3' },
      { id: 'burngel', name: 'Гель от ожогов', q: 'żel na oparzenia' },
    ],
  },
  {
    id: 'finish', title: 'Доводка', icon: 'tools',
    items: [
      { id: 'rotary', name: 'Бормашина', q: 'szlifierka prosta minidrill' },
      { id: 'bits', name: 'Диски, боры, войлочные круги', q: 'frezy filce do minidrill zestaw' },
      { id: 'paste', name: 'Полировальные пасты', q: 'pasta polerska do srebra' },
      { id: 'files', name: 'Надфили', q: 'pilniki iglaki zestaw' },
      { id: 'sandpaper', name: 'Наждачка 240–2000', q: 'papier ścierny wodny 240 2000' },
      { id: 'saw', name: 'Ювелирный лобзик', q: 'piłka jubilerska oprawka' },
      { id: 'vise', name: 'Тиски', q: 'imadło małe' },
      { id: 'scale', name: 'Весы 0,01 г', q: 'waga jubilerska 0,01 g' },
    ],
  },
  {
    id: 'later', title: 'Позже', icon: 'later', later: true,
    items: [
      { id: 'fdm', name: 'FDM 3D-принтер', note: 'модели для Delft и форм', q: 'drukarka 3D FDM' },
      { id: 'burnout', name: 'Печь для выжигания', note: 'литьё по выплавляемым моделям', q: 'piec do wypalania form jubilerskich' },
      { id: 'vacuum', name: 'Вакуумная установка', note: 'литьё по выплавляемым моделям', q: 'odlewanie próżniowe jubilerskie' },
    ],
  },
];
