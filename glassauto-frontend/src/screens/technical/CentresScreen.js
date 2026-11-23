import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { DateRangeField } from '../../components/calendar';
import { TabHeader } from '../../components/domain';
import { Card, Chip, EmptyState, Screen, SearchBar, SectionHeader, Txt } from '../../components/ui';
import { useHrData } from '../../hooks/useHrData';
import { colors } from '../../theme';
import { daysFromToday, today } from '../../utils/date';
import { matches } from '../../utils/format';
import { centreAvailability, FIELD_POSTES } from '../../utils/substitution';

const fillColor = (ratio) => {
  if (ratio === 1) {
    return colors.success;
  }
  return ratio >= 0.5 ? colors.amber : colors.crimson;
};

export function CentresScreen({ navigation }) {
  const { employees, leaves } = useHrData();
  const [period, setPeriod] = useState({ start: today(), end: daysFromToday(6) });
  const [poste, setPoste] = useState(null);
  const [query, setQuery] = useState('');
  const network = useMemo(
    () => centreAvailability(employees, leaves, period.start, period.end, poste),
    [employees, leaves, period, poste]
  );
  const visible = network
    .filter((centre) => centre.total > 0)
    .filter((centre) => !query || matches(`${centre.nom} ${centre.region}`, query));
  const available = visible.reduce((sum, centre) => sum + centre.available, 0);

  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader title="Disponibilité inter-centres" subtitle={`${available} profils disponibles`} />
      <DateRangeField
        label="Période"
        start={period.start}
        end={period.end}
        onChange={setPeriod}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          <Chip label="Tous les postes" selected={!poste} onPress={() => setPoste(null)} />
          {FIELD_POSTES.map((item) => (
            <Chip key={item} label={item} selected={poste === item} onPress={() => setPoste(item)} />
          ))}
        </View>
      </ScrollView>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Centre ou région" />
      <View className="gap-3">
        <SectionHeader title="Centres" count={visible.length} />
        {visible.length === 0 ? (
          <EmptyState icon="map-marker-off-outline" title="Aucun centre" message="Modifiez la recherche ou le poste." />
        ) : (
          visible.map((centre) => {
            const ratio = centre.available / centre.total;
            return (
              <Card
                key={centre.nom}
                accessibilityLabel={`${centre.nom}, ${centre.available} disponibles sur ${centre.total}`}
                onPress={() =>
                  navigation.navigate('CentreDetail', {
                    nom: centre.nom,
                    start: period.start,
                    end: period.end,
                  })
                }
              >
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Txt weight="semi">{centre.nom}</Txt>
                    <Txt size="sm" tone="mute" numberOfLines={1}>
                      {centre.region}
                    </Txt>
                  </View>
                  <View className="flex-row items-baseline gap-1">
                    <Txt size="lg" weight="figure">
                      {centre.available}
                    </Txt>
                    <Txt size="sm" tone="mute">
                      / {centre.total}
                    </Txt>
                  </View>
                </View>
                <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-steel">
                  <View
                    style={{
                      width: `${Math.max(3, ratio * 100)}%`,
                      height: '100%',
                      borderRadius: 3,
                      backgroundColor: fillColor(ratio),
                    }}
                  />
                </View>
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
}
