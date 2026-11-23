import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { POSTE_SHORT } from '../../data/constants';
import { colors } from '../../theme';
import {
  addDays,
  diffInDays,
  eachDay,
  holidayName,
  isSunday,
  parseISO,
  periodsOverlap,
  today,
} from '../../utils/date';
import { firstName } from '../../utils/format';
import { Card, Txt } from '../ui';

const CELL = 32;
const ROW = 46;
const HEADER = 50;
const LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export function TeamTimeline({ members, leaves, start, days = 28, onSelectLeave }) {
  const end = addDays(start, days - 1);
  const dates = useMemo(() => eachDay(start, end), [start, end]);
  const visible = useMemo(
    () => leaves.filter((leave) => periodsOverlap(leave.date_debut, leave.date_fin, start, end)),
    [leaves, start, end]
  );

  return (
    <Card padded={false}>
      <View className="flex-row">
        <View className="w-[104px] border-r border-white/10">
          <View style={{ height: HEADER }} className="justify-end border-b border-white/10 px-3 pb-2">
            <Txt size="xs" tone="mute">
              Équipe
            </Txt>
          </View>
          {members.map((member) => (
            <View key={member.id_personne} style={{ height: ROW }} className="justify-center px-3">
              <Txt size="sm" weight="medium" numberOfLines={1}>
                {firstName(member.full_name)}
              </Txt>
              <Txt size="xs" tone="mute" numberOfLines={1}>
                {POSTE_SHORT[member.poste] || member.poste}
              </Txt>
            </View>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ width: CELL * days }}>
            <View style={{ height: HEADER }} className="flex-row border-b border-white/10">
              {dates.map((date) => {
                const current = date === today();
                return (
                  <View
                    key={date}
                    style={{ width: CELL }}
                    className={`items-center justify-end pb-1.5 ${current ? 'rounded-t-lg bg-crimson' : ''}`}
                  >
                    <Txt size="xs" tone={current ? 'white' : 'mute'}>
                      {LETTERS[parseISO(date).getDay()]}
                    </Txt>
                    <Txt size="sm" weight="semi" tone={current ? 'white' : 'soft'}>
                      {parseISO(date).getDate()}
                    </Txt>
                  </View>
                );
              })}
            </View>
            {members.map((member) => (
              <View key={member.id_personne} style={{ height: ROW, width: CELL * days }}>
                <View className="absolute bottom-0 left-0 top-0 flex-row">
                  {dates.map((date) => (
                    <View
                      key={date}
                      style={{
                        width: CELL,
                        backgroundColor:
                          date === today()
                            ? 'rgba(212,21,20,0.14)'
                            : isSunday(date) || holidayName(date)
                              ? 'rgba(255,255,255,0.035)'
                              : 'transparent',
                      }}
                    />
                  ))}
                </View>
                {visible
                  .filter((leave) => leave.id_demandeur === member.id_personne)
                  .map((leave) => {
                    const from = Math.max(0, diffInDays(start, leave.date_debut));
                    const to = Math.min(days - 1, diffInDays(start, leave.date_fin));
                    const validated = leave.state === 'validated';
                    return (
                      <Pressable
                        key={leave.id_demande}
                        accessibilityRole="button"
                        accessibilityLabel={`${member.full_name}, demande ${leave.id_demande}`}
                        onPress={() => onSelectLeave(leave)}
                        style={{
                          position: 'absolute',
                          top: 10,
                          height: ROW - 20,
                          left: from * CELL + 2,
                          width: (to - from + 1) * CELL - 4,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderStyle: validated ? 'solid' : 'dashed',
                          borderColor: validated ? colors.success : colors.amber,
                          backgroundColor: validated
                            ? 'rgba(63,202,140,0.26)'
                            : 'rgba(240,177,60,0.18)',
                        }}
                      />
                    );
                  })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Card>
  );
}
