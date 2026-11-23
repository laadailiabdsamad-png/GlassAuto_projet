import { LocaleConfig } from 'react-native-calendars';
import { MONTHS, MONTHS_SHORT, WEEKDAYS } from './date';

const capitalize = (value) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

LocaleConfig.locales.fr = {
  monthNames: MONTHS.map(capitalize),
  monthNamesShort: MONTHS_SHORT,
  dayNames: WEEKDAYS,
  dayNamesShort: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
  today: 'Aujourd’hui',
};

LocaleConfig.defaultLocale = 'fr';
