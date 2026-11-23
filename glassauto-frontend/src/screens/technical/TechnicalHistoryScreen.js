import { useState } from 'react';
import { View } from 'react-native';
import { LeaveCard, PagedList, TabHeader } from '../../components/domain';
import { Card, EmptyState, Icon, Screen, Segmented, Txt } from '../../components/ui';
import { useEscalations } from '../../hooks/useEscalations';
import { useHrData } from '../../hooks/useHrData';
import { colors } from '../../theme';
import { percent } from '../../utils/format';

export function TechnicalHistoryScreen({ navigation }) {
  const { employeesById } = useHrData();
  const { decided, favorable } = useEscalations();
  const [filter, setFilter] = useState('all');
  const unfavorable = decided.filter((leave) => leave.validation_tech === 'rejected');
  const pools = { all: decided, favorable, unfavorable };
  const visible = pools[filter];
  const rate = percent(favorable.length, decided.length);

  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader title="Historique des décisions" />
      <Card>
        <View className="flex-row items-end justify-between">
          <View>
            <Txt size="sm" tone="soft">
              Demandes avec substitut trouvé
            </Txt>
            <Txt size="2xl" weight="figure">
              {rate} %
            </Txt>
          </View>
          <Txt size="sm" tone="mute">
            {favorable.length} sur {decided.length}
          </Txt>
        </View>
        <View className="mt-3 h-2 overflow-hidden rounded-full bg-steel">
          <View style={{ width: `${rate}%`, height: '100%', backgroundColor: colors.success, borderRadius: 4 }} />
        </View>
      </Card>
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Toutes' },
          { value: 'favorable', label: 'Trouvés' },
          { value: 'unfavorable', label: 'Sans solution' },
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState icon="history" title="Aucune décision" />
      ) : (
        <PagedList
          items={visible}
          resetKey={filter}
          renderItem={(leave) => {
            const substitute = employeesById[leave.id_substitut_propose];
            const found = leave.validation_tech === 'validated';
            return (
              <LeaveCard
                key={leave.id_demande}
                leave={leave}
                showEmployee
                onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
              >
                <View className="flex-row items-center gap-2">
                  <Icon
                    name={found ? 'account-check-outline' : 'account-cancel-outline'}
                    size={17}
                    color={found ? colors.success : colors.ember}
                  />
                  <Txt size="sm" tone="soft" className="flex-1">
                    {found && substitute
                      ? `${substitute.full_name}, ${substitute.centre_nom}`
                      : 'Aucun substitut trouvé'}
                  </Txt>
                </View>
              </LeaveCard>
            );
          }}
        />
      )}
    </Screen>
  );
}
