export const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export const MONTHS_SHORT = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

export const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export const WEEKDAYS_SHORT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

const NATIONAL_HOLIDAYS = {
  '01-01': 'Nouvel an',
  '01-11': "Manifeste de l'Indépendance",
  '01-14': 'Nouvel an amazigh',
  '05-01': 'Fête du Travail',
  '07-30': 'Fête du Trône',
  '08-14': 'Oued Ed-Dahab',
  '08-20': 'Révolution du Roi et du Peuple',
  '08-21': 'Fête de la Jeunesse',
  '10-31': "Aïd Al Wahda",
  '11-06': 'Marche Verte',
  '11-18': "Fête de l'Indépendance",
};

const pad = (value) => String(value).padStart(2, '0');

export const toISO = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseISO = (iso) => {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

export const today = () => toISO(new Date());

export const addDays = (iso, amount) => {
  const date = parseISO(iso);
  date.setDate(date.getDate() + amount);
  return toISO(date);
};

export const addMonths = (iso, amount) => {
  const date = parseISO(iso);
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  return toISO(date);
};

export const daysFromToday = (amount) => addDays(today(), amount);

export const diffInDays = (from, to) =>
  Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86400000);

export const timestampFromToday = (offsetDays, hour = 9, minute = 15) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() > Date.now()) {
    return new Date(Date.now() - 1000 * 60 * 18).toISOString();
  }
  return date.toISOString();
};

export const isWithin = (iso, start, end) => iso >= start && iso <= end;

export const periodsOverlap = (startA, endA, startB, endB) => startA <= endB && startB <= endA;

export const holidayName = (iso) => NATIONAL_HOLIDAYS[iso.slice(5, 10)] || null;

export const isSunday = (iso) => parseISO(iso).getDay() === 0;

export const isWorkingDay = (iso) => !isSunday(iso) && !holidayName(iso);

export const eachDay = (start, end) => {
  const days = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
};

export const countWorkingDays = (start, end) => {
  if (!start || !end || end < start) {
    return 0;
  }
  return eachDay(start, end).filter(isWorkingDay).length;
};

export const formatDate = (iso, options = {}) => {
  if (!iso) {
    return '';
  }
  const date = parseISO(iso);
  const day = date.getDate() === 1 ? '1er' : String(date.getDate());
  const month = options.long ? MONTHS[date.getMonth()] : MONTHS_SHORT[date.getMonth()];
  const year = options.hideYear ? '' : ` ${date.getFullYear()}`;
  const weekday = options.weekday
    ? `${(options.long ? WEEKDAYS : WEEKDAYS_SHORT)[date.getDay()]} `
    : '';
  return `${weekday}${day} ${month}${year}`;
};

export const formatRange = (start, end, options = {}) => {
  if (!start) {
    return '';
  }
  if (!end || start === end) {
    return formatDate(start, options);
  }
  const from = parseISO(start);
  const to = parseISO(end);
  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();
  if (sameMonth) {
    const first = from.getDate() === 1 ? '1er' : from.getDate();
    return `${first} – ${formatDate(end, options)}`;
  }
  return `${formatDate(start, { ...options, hideYear: options.hideYear || sameYear })} – ${formatDate(end, options)}`;
};

export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) {
    return '';
  }
  return `${formatDate(toISO(new Date(timestamp)))} à ${formatTime(timestamp)}`;
};

export const monthLabel = (iso, options = {}) => {
  const date = parseISO(iso);
  const name = MONTHS[date.getMonth()];
  const label = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  return options.hideYear ? label : `${label} ${date.getFullYear()}`;
};

export const relativeTime = (timestamp) => {
  const elapsed = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) {
    return "à l'instant";
  }
  if (minutes < 60) {
    return `il y a ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `il y a ${hours} h`;
  }
  const days = diffInDays(toISO(new Date(timestamp)), today());
  if (days <= 1) {
    return 'hier';
  }
  if (days < 7) {
    return `il y a ${days} jours`;
  }
  return `le ${formatDate(toISO(new Date(timestamp)))}`;
};

export const greeting = () => {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';
};
