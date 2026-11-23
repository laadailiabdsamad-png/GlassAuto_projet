import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { colors } from '../../theme';
import { eachDay, holidayName, isSunday, today } from '../../utils/date';
import { Card, Txt } from '../ui';
import { calendarTheme } from './calendarTheme';
import { CalendarArrow } from './CalendarArrow';

const eventColor = (leave) => (leave.state === 'validated' ? colors.success : colors.amber);

function AbsenceDay({ date, state, marking = {}, onPress }) {
  const iso = date.dateString;
  const isToday = iso === today();
  const off = isSunday(iso) || holidayName(iso);
  const dots = marking.dots || [];
  const background = marking.selected ? 'bg-chrome' : dots.length > 0 ? 'bg-steel' : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${iso}, ${marking.total || 0} absences`}
      accessibilityState={{ selected: Boolean(marking.selected) }}
      disabled={state === 'disabled'}
      onPress={() => onPress(date)}
      className={`h-[46px] w-[40px] items-center justify-center gap-1 rounded-xl ${background} ${isToday && !marking.selected ? 'border border-chrome' : ''}`}
    >
      <Txt
        size="sm"
        weight={isToday || marking.selected ? 'semi' : 'body'}
        tone={marking.selected ? 'obsidian' : off ? 'mute' : 'ink'}
      >
        {date.day}
      </Txt>
      <View className="h-1.5 flex-row items-center gap-0.5">
        {dots.map((color, index) => (
          <View key={index} style={{ backgroundColor: color }} className="h-1.5 w-1.5 rounded-full" />
        ))}
      </View>
    </Pressable>
  );
}

export function AbsenceCalendar({ leaves, selected, onSelect }) {
  const [month, setMonth] = useState(today().slice(0, 7));

  const markedDates = useMemo(() => {
    const marks = {};
    leaves.forEach((leave) => {
      if (leave.date_fin.slice(0, 7) < month || leave.date_debut.slice(0, 7) > month) {
        return;
      }
      eachDay(leave.date_debut, leave.date_fin).forEach((day) => {
        if (!day.startsWith(month)) {
          return;
        }
        const mark = marks[day] || { dots: [], total: 0 };
        mark.total += 1;
        if (mark.dots.length < 3) {
          mark.dots.push(eventColor(leave));
        }
        marks[day] = mark;
      });
    });
    if (selected) {
      marks[selected] = { ...(marks[selected] || {}), selected: true };
    }
    return marks;
  }, [leaves, selected, month]);

  return (
    <Card padded={false}>
      <View className="px-2 pb-3 pt-1">
        <Calendar
          current={selected || today()}
          firstDay={1}
          hideExtraDays
          enableSwipeMonths
          monthFormat="MMMM yyyy"
          theme={calendarTheme}
          markedDates={markedDates}
          onDayPress={({ dateString }) => onSelect(dateString)}
          onMonthChange={({ dateString }) => setMonth(dateString.slice(0, 7))}
          dayComponent={AbsenceDay}
          renderArrow={(direction) => <CalendarArrow direction={direction} />}
        />
        <View className="mt-3 flex-row items-center justify-center gap-5">
          <Legend color={colors.success} label="Congé validé" />
          <Legend color={colors.amber} label="Demande en cours" />
        </View>
      </View>
    </Card>
  );
}

function Legend({ color, label }) {
  return (
    <View className="flex-row items-center gap-2">
      <View style={{ backgroundColor: color }} className="h-2 w-2 rounded-full" />
      <Txt size="xs" tone="soft">
        {label}
      </Txt>
    </View>
  );
}
