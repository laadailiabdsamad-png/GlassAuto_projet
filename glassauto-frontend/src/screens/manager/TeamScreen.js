import { useState } from 'react';
import { View } from 'react-native';
import { EmployeeRow, TabHeader } from '../../components/domain';
import { Card, Chip, EmptyState, Screen, SearchBar } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useHrData } from '../../hooks/useHrData';
import { useTeam } from '../../hooks/useTeam';
import { today } from '../../utils/date';
import { matches, plural } from '../../utils/format';
import { isOnLeave } from '../../utils/leaveRules';

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'present', label: 'Présents' },
  { value: 'absent', label: 'Absents' },
];

export function TeamScreen({ navigation }) {
  const { user } = useAuth();
  const { leaves } = useHrData();
  const { members } = useTeam();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const rows = members
    .map((member) => ({
      member,
      presence: isOnLeave(leaves, member.id_personne, today()) ? 'absent' : 'present',
    }))
    .filter(
      ({ member, presence }) =>
        (filter === 'all' || filter === presence) &&
        (!query || matches(`${member.full_name} ${member.poste}`, query))
    );

  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader
        title="Mon équipe"
        subtitle={`${plural(members.length, 'collaborateur')}, ${user.departement || user.centre_nom}`}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Rechercher un nom ou un poste" />
      <View className="flex-row gap-2">
        {FILTERS.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            selected={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </View>
      {rows.length === 0 ? (
        <EmptyState
          icon="account-search-outline"
          title="Aucun collaborateur"
          message="Modifiez la recherche ou le filtre."
        />
      ) : (
        <Card>
          <View className="-my-3">
            {rows.map(({ member, presence }, index) => (
              <EmployeeRow
                key={member.id_personne}
                employee={member}
                presence={presence}
                caption={member.poste}
                onPress={() => navigation.navigate('EmployeeDetail', { id: member.id_personne })}
                last={index === rows.length - 1}
              />
            ))}
          </View>
        </Card>
      )}
    </Screen>
  );
}
