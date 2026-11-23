import { Pressable, View } from 'react-native';
import { AppHeader, Avatar, Card, Icon, Screen, SectionHeader, Txt } from '../../components/ui';
import { centres } from '../../data/centres';
import { ROLES } from '../../data/constants';
import { useHrData } from '../../hooks/useHrData';
import { colors } from '../../theme';
import { formatRange } from '../../utils/date';
import { centreAvailability } from '../../utils/substitution';

export function CentreDetailScreen({ navigation, route }) {
  const { nom, start, end } = route.params;
  const { employees, leaves } = useHrData();
  const centre = centres.find((item) => item.nom === nom);
  const manager = employees.find(
    (employee) => employee.centre_nom === nom && employee.role === ROLES.RESPONSABLE_CENTRE
  );
  const availability = centreAvailability(employees, leaves, start, end).find(
    (item) => item.nom === nom
  );
  const available = availability.members.filter((member) => !member.conflict);
  const busy = availability.members.filter((member) => member.conflict);

  const renderMember = ({ employee, conflict }) => (
    <Card
      key={employee.id_personne}
      onPress={() => navigation.navigate('EmployeeDetail', { id: employee.id_personne })}
      accessibilityLabel={employee.full_name}
    >
      <View className="flex-row items-center gap-3">
        <Avatar name={employee.full_name} presence={conflict ? 'absent' : 'present'} />
        <View className="flex-1">
          <Txt weight="semi">{employee.full_name}</Txt>
          <Txt size="sm" tone="mute">
            {employee.poste}
          </Txt>
          {conflict ? (
            <Txt size="sm" tone="amber">
              {conflict.label}
            </Txt>
          ) : null}
        </View>
        <Icon name="chevron-right" size={22} color={colors.mute} />
      </View>
    </Card>
  );

  return (
    <Screen header={<AppHeader title={nom} subtitle={formatRange(start, end)} />}>
      <Card>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 gap-0.5">
            <Txt size="sm" tone="soft">
              {centre.region}
            </Txt>
            <Txt weight="semi">Effectif du centre</Txt>
          </View>
          <Txt size="xl" weight="figure">
            {centre.effectif}
          </Txt>
        </View>
        {manager ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('EmployeeDetail', { id: manager.id_personne })}
            className="mt-3 flex-row items-center gap-3 border-t border-white/10 pt-3 active:opacity-70"
          >
            <Avatar name={manager.full_name} size={40} />
            <View className="flex-1">
              <Txt weight="medium">{manager.full_name}</Txt>
              <Txt size="sm" tone="mute">
                Responsable de centre
              </Txt>
            </View>
            <Icon name="chevron-right" size={22} color={colors.mute} />
          </Pressable>
        ) : null}
      </Card>
      <View className="gap-3">
        <SectionHeader title="Disponibles" count={available.length} />
        {available.length === 0 ? (
          <Txt tone="mute">Aucun profil disponible sur la période.</Txt>
        ) : (
          available.map(renderMember)
        )}
      </View>
      {busy.length > 0 ? (
        <View className="gap-3">
          <SectionHeader title="Non disponibles" count={busy.length} />
          {busy.map(renderMember)}
        </View>
      ) : null}
    </Screen>
  );
}
