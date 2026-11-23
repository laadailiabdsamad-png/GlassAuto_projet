import { useState } from 'react';
import { View } from 'react-native';
import { AbsenceCalendar, TeamTimeline } from '../../components/calendar';
import { LeaveCard, TabHeader } from '../../components/domain';
import { EmptyState, IconButton, Screen, SectionHeader, Segmented, Txt } from '../../components/ui';
import { OPEN_LEAVE_STATES } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useTeam } from '../../hooks/useTeam';
import { addDays, formatDate, formatRange, isWithin, today } from '../../utils/date';

const WINDOW = 28;

export function TeamCalendarScreen({ navigation }) {
  const { user } = useAuth();
  const { members, leaves } = useTeam();
  const [mode, setMode] = useState('calendar');
  const [selected, setSelected] = useState(today());
  const [start, setStart] = useState(addDays(today(), -3));
  const visible = leaves.filter(
    (leave) => leave.state === 'validated' || OPEN_LEAVE_STATES.includes(leave.state)
  );
  const dayLeaves = visible.filter((leave) => isWithin(selected, leave.date_debut, leave.date_fin));
  const absent = new Set(
    dayLeaves.filter((leave) => leave.state === 'validated').map((leave) => leave.id_demandeur)
  ).size;
  const openLeave = (leave) => navigation.navigate('LeaveDetail', { id: leave.id_demande });

  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader
        title="Planning d’équipe"
        subtitle={user.departement || `Centre de ${user.centre_nom}`}
        actionIcon="calendar-check-outline"
        actionLabel="Planning annuel"
        onAction={() => navigation.navigate('AnnualPlanning')}
      />
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'calendar', label: 'Calendrier' },
          { value: 'timeline', label: 'Chronologie' },
        ]}
      />
      {mode === 'calendar' ? (
        <>
          <AbsenceCalendar leaves={visible} selected={selected} onSelect={setSelected} />
          <View className="gap-3">
            <View>
              <SectionHeader title={formatDate(selected, { weekday: true, long: true })} />
              <Txt size="sm" tone="soft">
                {members.length - absent} présents sur {members.length}
              </Txt>
            </View>
            {dayLeaves.length === 0 ? (
              <EmptyState
                icon="account-group-outline"
                title="Équipe au complet"
                message="Aucune absence prévue ce jour-là."
              />
            ) : (
              dayLeaves.map((leave) => (
                <LeaveCard
                  key={leave.id_demande}
                  leave={leave}
                  showEmployee
                  onPress={() => openLeave(leave)}
                />
              ))
            )}
          </View>
        </>
      ) : (
        <>
          <View className="flex-row items-center justify-between">
            <IconButton
              icon="chevron-left"
              label="Quatre semaines précédentes"
              onPress={() => setStart((current) => addDays(current, -WINDOW))}
            />
            <Txt weight="semi" align="center" className="flex-1">
              {formatRange(start, addDays(start, WINDOW - 1))}
            </Txt>
            <IconButton
              icon="chevron-right"
              label="Quatre semaines suivantes"
              onPress={() => setStart((current) => addDays(current, WINDOW))}
            />
          </View>
          <TeamTimeline
            members={members}
            leaves={visible}
            start={start}
            days={WINDOW}
            onSelectLeave={openLeave}
          />
          <Txt size="sm" tone="mute" align="center">
            Trait plein : congé validé. Pointillé : demande en cours.
          </Txt>
        </>
      )}
    </Screen>
  );
}
