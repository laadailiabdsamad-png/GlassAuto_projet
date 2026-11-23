export const plural = (count, singular, pluralForm) =>
  `${count} ${Math.abs(count) > 1 ? pluralForm || `${singular}s` : singular}`;

export const daysLabel = (count) => plural(count, 'jour');

export const initials = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ? parts[0][0] : '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
};

export const firstName = (fullName) => fullName.trim().split(/\s+/)[0];

export const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const matches = (value, query) => normalize(value).includes(normalize(query));

export const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

export const decimal = (value) => {
  const rounded = Math.round(value * 10) / 10;
  return String(rounded).replace('.', ',');
};

export const lowerFirst = (value) => `${value.charAt(0).toLowerCase()}${value.slice(1)}`;

export const indexBy = (items, key) =>
  items.reduce((accumulator, item) => {
    accumulator[item[key]] = item;
    return accumulator;
  }, {});

export const groupBy = (items, resolver) =>
  items.reduce((accumulator, item) => {
    const key = resolver(item);
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(item);
    return accumulator;
  }, {});

export const byNewest = (a, b) => (a.generated_at < b.generated_at ? 1 : -1);

export const byStartDate = (a, b) => (a.date_debut > b.date_debut ? 1 : -1);
