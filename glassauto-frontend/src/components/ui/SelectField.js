import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { matches } from '../../utils/format';
import { Field } from './Field';
import { Icon } from './Icon';
import { SearchBar } from './SearchBar';
import { Sheet } from './Sheet';
import { Txt } from './Txt';

export function SelectField({
  label,
  title,
  value,
  options,
  onChange,
  placeholder = 'Choisir',
  error,
  icon,
  searchable = false,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);
  const visible = query ? options.filter((option) => matches(option.label, query)) : options;

  const choose = (option) => {
    onChange(option.value);
    setQuery('');
    setOpen(false);
  };

  return (
    <Field label={label} error={error}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label || title || placeholder}${selected ? ` : ${selected.label}` : ''}`}
        onPress={() => setOpen(true)}
        className={`flex-row items-center gap-3 rounded-field border bg-carbon px-4 active:opacity-80 ${compact ? 'h-12' : 'h-[54px]'} ${error ? 'border-crimson' : 'border-edge'}`}
      >
        {icon ? <Icon name={icon} size={20} color={colors.mute} /> : null}
        <Txt tone={selected ? 'ink' : 'mute'} className="flex-1" numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Txt>
        <Icon name="chevron-down" size={20} color={colors.mute} />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label || title || placeholder}>
        {searchable ? (
          <View className="pb-3">
            <SearchBar value={query} onChangeText={setQuery} placeholder="Rechercher" />
          </View>
        ) : null}
        {visible.map((option, index) => (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: option.value === value }}
            onPress={() => choose(option)}
            className={`min-h-[54px] flex-row items-center gap-3 py-3 active:opacity-70 ${index === visible.length - 1 ? '' : 'border-b border-white/10'}`}
          >
            {option.icon ? <Icon name={option.icon} size={20} color={colors.soft} /> : null}
            <View className="flex-1">
              <Txt weight="medium">{option.label}</Txt>
              {option.description ? (
                <Txt size="sm" tone="mute">
                  {option.description}
                </Txt>
              ) : null}
            </View>
            {option.value === value ? <Icon name="check" size={20} color={colors.ember} /> : null}
          </Pressable>
        ))}
        {visible.length === 0 ? (
          <Txt tone="mute" align="center" className="py-6">
            Aucun résultat pour cette recherche.
          </Txt>
        ) : null}
      </Sheet>
    </Field>
  );
}
