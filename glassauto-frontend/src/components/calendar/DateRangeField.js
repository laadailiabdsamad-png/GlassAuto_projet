import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { countWorkingDays, formatDate } from '../../utils/date';
import { plural } from '../../utils/format';
import { Button, Field, Icon, Sheet, Txt } from '../ui';
import { RangeCalendar } from './RangeCalendar';

function DateBox({ label, value }) {
  return (
    <View className="flex-1 gap-0.5">
      <Txt size="xs" tone="mute">
        {label}
      </Txt>
      <Txt weight="semi" tone={value ? 'ink' : 'mute'} numberOfLines={1}>
        {value ? formatDate(value) : 'Choisir'}
      </Txt>
    </View>
  );
}

export function DateRangeField({
  label = 'Période',
  start,
  end,
  onChange,
  minDate,
  maxDate,
  initialDate,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ start, end });

  const show = () => {
    setDraft({ start, end });
    setOpen(true);
  };

  const apply = () => {
    onChange({ start: draft.start, end: draft.end || draft.start });
    setOpen(false);
  };

  const days = draft.start ? countWorkingDays(draft.start, draft.end || draft.start) : 0;

  return (
    <Field label={label} error={error}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, choisir les dates`}
        onPress={show}
        className={`min-h-[62px] flex-row items-center gap-3 rounded-field border bg-carbon px-4 py-2 active:opacity-80 ${error ? 'border-crimson' : 'border-edge'}`}
      >
        <Icon name="calendar-range" size={22} color={colors.mute} />
        <DateBox label="Du" value={start} />
        <Icon name="arrow-right" size={18} color={colors.mute} />
        <DateBox label="Au" value={end} />
      </Pressable>
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title={label}
        subtitle={
          draft.start
            ? `${formatDate(draft.start, { weekday: true })}${draft.end ? ` au ${formatDate(draft.end, { weekday: true })}` : ''}, ${plural(days, 'jour ouvrable', 'jours ouvrables')}`
            : 'Sélectionnez le premier puis le dernier jour'
        }
        footer={<Button label="Choisir cette période" onPress={apply} disabled={!draft.start} />}
      >
        <RangeCalendar
          start={draft.start}
          end={draft.end}
          onChange={setDraft}
          minDate={minDate}
          maxDate={maxDate}
          initialDate={initialDate}
        />
      </Sheet>
    </Field>
  );
}
