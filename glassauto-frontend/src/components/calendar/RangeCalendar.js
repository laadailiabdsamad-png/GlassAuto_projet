import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { eachDay, holidayName, isSunday, today } from '../../utils/date';
import { Txt } from '../ui';
import { calendarTheme } from './calendarTheme';
import { CalendarArrow } from './CalendarArrow';

const textTone = ({ edge, range, disabled, off }) => {
  if (edge) {
    return 'white';
  }
  if (disabled) {
    return 'mute';
  }
  if (range) {
    return 'ink';
  }
  return off ? 'mute' : 'ink';
};

function RangeDay({ date, state, marking = {}, onPress }) {
  const iso = date.dateString;
  const disabled = state === 'disabled' || Boolean(marking.blocked);
  const edge = marking.start || marking.end;
  const off = isSunday(iso) || holidayName(iso);
  const isToday = iso === today();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={iso}
      accessibilityState={{ disabled, selected: Boolean(edge || marking.range) }}
      disabled={disabled}
      onPress={() => onPress(date)}
      className="h-11 w-full items-center justify-center"
    >
      {marking.range && !(marking.start && marking.end) ? (
        <View
          className="absolute bottom-1 top-1 bg-[#4a1716]"
          style={{ left: marking.start ? '50%' : 0, right: marking.end ? '50%' : 0 }}
        />
      ) : null}
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${edge ? 'bg-crimson' : isToday ? 'border border-chrome' : ''}`}
      >
        <Txt
          weight={edge || isToday ? 'semi' : 'body'}
          tone={textTone({ edge, range: marking.range, disabled, off })}
          className={disabled ? 'opacity-40' : ''}
        >
          {date.day}
        </Txt>
      </View>
    </Pressable>
  );
}

export function RangeCalendar({ start, end, onChange, minDate, maxDate, initialDate }) {
  const markedDates = useMemo(() => {
    const current = today();
    const marks = {};
    if ((minDate && current < minDate) || (maxDate && current > maxDate)) {
      marks[current] = { blocked: true };
    }
    if (!start) {
      return marks;
    }
    const last = end || start;
    return eachDay(start, last).reduce((accumulator, day) => {
      accumulator[day] = { range: true, start: day === start, end: day === last };
      return accumulator;
    }, marks);
  }, [start, end, minDate, maxDate]);

  const handleDay = ({ dateString }) => {
    if (!start || end || dateString < start) {
      onChange({ start: dateString, end: null });
      return;
    }
    onChange({ start, end: dateString });
  };

  return (
    <Calendar
      current={start || initialDate || (minDate && minDate > today() ? minDate : today())}
      firstDay={1}
      minDate={minDate}
      maxDate={maxDate}
      hideExtraDays
      enableSwipeMonths
      monthFormat="MMMM yyyy"
      theme={calendarTheme}
      markedDates={markedDates}
      onDayPress={handleDay}
      dayComponent={RangeDay}
      renderArrow={(direction) => <CalendarArrow direction={direction} />}
    />
  );
}
