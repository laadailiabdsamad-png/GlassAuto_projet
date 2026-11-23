import { useState } from 'react';
import { View } from 'react-native';
import { AppHeader, Button, Card, Screen, SectionHeader, Segmented, StatusBadge, Txt } from '../../components/ui';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { colors } from '../../theme';
import { percent, plural } from '../../utils/format';

const SUBMITTED = { tone: 'success', icon: 'calendar-check-outline', label: 'Soumis' };
const DRAFT = { tone: 'amber', icon: 'calendar-edit', label: 'À soumettre' };

export function HrPlansScreen({ navigation }) {
  const { annualPlans, employeesById, actions } = useHrData();
  const { attempt } = useFeedback();
  const years = [...new Set(annualPlans.map((plan) => plan.annee))].sort();
  const [year, setYear] = useState(years[0]);
  const plans = annualPlans.filter((plan) => plan.annee === year);
  const submitted = plans.filter((plan) => plan.statut === 'soumis');
  const missing = plans.filter((plan) => plan.statut !== 'soumis');
  const rate = percent(submitted.length, plans.length);

  const renderPlan = (plan) => {
    const manager = employeesById[plan.id_respo];
    const done = plan.statut === 'soumis';
    return (
      <Card
        key={plan.id}
        accessibilityLabel={`Planning ${plan.centre_nom}`}
        onPress={() => navigation.navigate('PlanDetail', { id: plan.id })}
        footer={
          done ? null : (
            <Button
              label="Relancer le responsable"
              icon="bell-outline"
              size="sm"
              variant="subtle"
              onPress={() =>
                attempt(() => actions.plans.remind(plan.id), {
                  title: 'Rappel envoyé',
                  message: `${manager.full_name} est notifié.`,
                })
              }
            />
          )
        }
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Txt weight="semi">{plan.centre_nom}</Txt>
            <Txt size="sm" tone="mute" numberOfLines={1}>
              {manager.full_name}, {plural(plan.periods.length, 'période')}
            </Txt>
          </View>
          <StatusBadge meta={done ? SUBMITTED : DRAFT} />
        </View>
      </Card>
    );
  };

  return (
    <Screen
      refreshable
      gap={20}
      header={<AppHeader title="Plannings annuels" subtitle="Calendriers prévisionnels des centres" />}
    >
      <Segmented
        value={year}
        onChange={setYear}
        options={years.map((value) => ({ value, label: String(value) }))}
      />
      <Card>
        <View className="flex-row items-end justify-between">
          <View>
            <Txt size="sm" tone="soft">
              Plannings soumis
            </Txt>
            <Txt size="2xl" weight="figure">
              {submitted.length}
            </Txt>
          </View>
          <Txt size="sm" tone="mute">
            sur {plans.length} centres
          </Txt>
        </View>
        <View className="mt-3 h-2 overflow-hidden rounded-full bg-steel">
          <View style={{ width: `${rate}%`, height: '100%', backgroundColor: colors.success, borderRadius: 4 }} />
        </View>
      </Card>
      {missing.length > 0 ? (
        <View className="gap-3">
          <SectionHeader title="À soumettre" count={missing.length} />
          {missing.map(renderPlan)}
        </View>
      ) : null}
      {submitted.length > 0 ? (
        <View className="gap-3">
          <SectionHeader title="Soumis" count={submitted.length} />
          {submitted.map(renderPlan)}
        </View>
      ) : null}
    </Screen>
  );
}
