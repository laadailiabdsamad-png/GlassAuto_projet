import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { AbsenceCalendar } from '../../components/calendar';
import { LeaveCard, PagedList } from '../../components/domain';
import { AppHeader, EmptyState, Screen, SectionHeader, SelectField } from '../../components/ui';
import { centres, HEADQUARTERS } from '../../data/centres';
import { OPEN_LEAVE_STATES } from '../../data/constants';
import { useHrData } from '../../hooks/useHrData';
import { formatDate, isWithin, today } from '../../utils/date';

const options = [
  { value: 'all', label: 'Toute l’entreprise' },
  { value: HEADQUARTERS, label: 'Siège' },
  ...centres.map((centre) => ({ value: centre.nom, label: centre.nom, description: centre.region })),
];

export function HrCalendarScreen({ navigation }) {
  const { leaves, employeesById } = useHrData();
  const [centre, setCentre] = useState('all');
  const [selected, setSelected] = useState(today());
  const visible = useMemo(
    () =>
      leaves.filter(
        (leave) =>
          (leave.state === 'validated' || OPEN_LEAVE_STATES.includes(leave.state)) &&
          (centre === 'all' || employeesById[leave.id_demandeur].centre_nom === centre)
      ),
    [leaves, employeesById, centre]
  );
  const dayLeaves = visible.filter((leave) => isWithin(selected, leave.date_debut, leave.date_fin));

  return (
    <Screen
      refreshable
      gap={18}
      header={<AppHeader title="Calendrier global" subtitle="Absences du siège et des centres" />}
    >
      <SelectField
        title="Affectation"
        value={centre}
        options={options}
        onChange={setCentre}
        icon="map-marker-outline"
        searchable
        compact
      />
      <AbsenceCalendar leaves={visible} selected={selected} onSelect={setSelected} />
      <View className="gap-3">
        <SectionHeader
          title={formatDate(selected, { weekday: true, long: true })}
          count={dayLeaves.length}
        />
        {dayLeaves.length === 0 ? (
          <EmptyState
            icon="account-group-outline"
            title="Aucune absence"
            message="Aucun congé prévu ce jour-là pour cette affectation."
          />
        ) : (
          <PagedList
            items={dayLeaves}
            resetKey={`${selected}-${centre}`}
            renderItem={(leave) => (
              <LeaveCard
                key={leave.id_demande}
                leave={leave}
                showEmployee
                onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
              />
            )}
          />
        )}
      </View>
    </Screen>
  );
}
