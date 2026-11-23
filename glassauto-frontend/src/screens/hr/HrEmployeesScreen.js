import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmployeeRow } from '../../components/domain';
import { AppHeader, EmptyState, Screen, SearchBar, SelectField, Txt } from '../../components/ui';
import { centres, HEADQUARTERS } from '../../data/centres';
import { useHrData } from '../../hooks/useHrData';
import { absentOn } from '../../utils/analytics';
import { today } from '../../utils/date';
import { matches, plural } from '../../utils/format';

const centreOptions = [
  { value: 'all', label: 'Toute l’entreprise' },
  { value: HEADQUARTERS, label: 'Siège', description: '85 collaborateurs' },
  ...centres.map((centre) => ({
    value: centre.nom,
    label: centre.nom,
    description: `${centre.effectif} collaborateurs, ${centre.region}`,
  })),
];

export function HrEmployeesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { employees, leaves } = useHrData();
  const [query, setQuery] = useState('');
  const [centre, setCentre] = useState((route.params && route.params.centre) || 'all');
  const absentIds = useMemo(
    () => new Set(absentOn(leaves, today()).map((leave) => leave.id_demandeur)),
    [leaves]
  );
  const visible = useMemo(
    () =>
      employees
        .filter((employee) => centre === 'all' || employee.centre_nom === centre)
        .filter(
          (employee) =>
            !query || matches(`${employee.full_name} ${employee.poste} ${employee.matricule}`, query)
        )
        .sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [employees, centre, query]
  );

  return (
    <Screen
      scroll={false}
      header={<AppHeader title="Collaborateurs" subtitle={plural(visible.length, 'résultat')} />}
    >
      <FlatList
        data={visible}
        keyExtractor={(employee) => String(employee.id_personne)}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={14}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
          width: '100%',
          maxWidth: 760,
          alignSelf: 'center',
        }}
        ListHeaderComponent={
          <View className="gap-3 pb-3 pt-2">
            <SearchBar value={query} onChangeText={setQuery} placeholder="Nom, poste ou matricule" />
            <SelectField
              title="Affectation"
              value={centre}
              options={centreOptions}
              onChange={setCentre}
              icon="map-marker-outline"
              searchable
              compact
            />
            <Txt size="sm" tone="mute">
              Le chiffre indique le solde de congés.
            </Txt>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="account-search-outline"
            title="Aucun collaborateur"
            message="Modifiez la recherche ou l’affectation."
          />
        }
        renderItem={({ item, index }) => (
          <EmployeeRow
            employee={item}
            presence={absentIds.has(item.id_personne) ? 'absent' : 'present'}
            onPress={() => navigation.navigate('EmployeeDetail', { id: item.id_personne })}
            last={index === visible.length - 1}
          />
        )}
      />
    </Screen>
  );
}
