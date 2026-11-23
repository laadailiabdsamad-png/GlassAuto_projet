import { useState } from 'react';
import { View } from 'react-native';
import { DonutBreakdown, MonthlyBars, RankBars, TrendLine } from '../../components/charts';
import { TabHeader } from '../../components/domain';
import { Card, Screen, Segmented, StatTile, Txt } from '../../components/ui';
import { DOCUMENT_TYPES, LEAVE_TYPES } from '../../data/constants';
import { HEADQUARTERS } from '../../data/centres';
import { useHrData } from '../../hooks/useHrData';
import {
  approvalRate,
  averageDocumentDays,
  averageProcessingDays,
  centreAbsenceRanking,
  documentsByType,
  justificationRate,
  lastMonths,
  leaveDaysByMonth,
  leavesByType,
  requestsByMonth,
} from '../../utils/analytics';
import { toISO } from '../../utils/date';
import { decimal } from '../../utils/format';

function ChartCard({ title, children }) {
  return (
    <Card>
      <Txt size="md" weight="display" className="mb-4">
        {title}
      </Txt>
      {children}
    </Card>
  );
}

export function HrAnalyticsScreen({ navigation }) {
  const { employees, employeesById, leaves, documents, absences } = useHrData();
  const [months, setMonths] = useState(6);
  const firstMonth = lastMonths(months)[0].key;
  const inRange = (timestamp) => toISO(new Date(timestamp)).slice(0, 7) >= firstMonth;
  const scopedLeaves = leaves.filter(
    (leave) => leave.date_debut.slice(0, 7) >= firstMonth
  );
  const scopedDocuments = documents.filter((document) => inRange(document.generated_at));
  const scopedAbsences = absences.filter((absence) => absence.date_absence_debut.slice(0, 7) >= firstMonth);
  const headquarters = employees.filter((employee) => employee.centre_nom === HEADQUARTERS).length;

  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader
        title="Analyses"
        subtitle={`${employees.length} collaborateurs, siège et 31 centres`}
        actionIcon="history"
        actionLabel="Historique"
        onAction={() => navigation.navigate('HrHistory')}
      />
      <Segmented
        value={months}
        onChange={setMonths}
        options={[
          { value: 3, label: '3 mois' },
          { value: 6, label: '6 mois' },
        ]}
      />
      <View className="gap-3">
        <View className="flex-row gap-3">
          <StatTile value={`${approvalRate(scopedLeaves)} %`} label="Congés approuvés" icon="check-circle-outline" tone="success" />
          <StatTile value={`${decimal(averageProcessingDays(scopedLeaves))} j`} label="Délai moyen congé" icon="timer-outline" tone="sky" />
        </View>
        <View className="flex-row gap-3">
          <StatTile value={`${decimal(averageDocumentDays(scopedDocuments))} j`} label="Délai moyen document" icon="file-clock-outline" tone="violet" />
          <StatTile value={`${justificationRate(scopedAbsences)} %`} label="Absences justifiées" icon="calendar-check-outline" tone="amber" />
        </View>
      </View>
      <ChartCard title="Jours de congé par mois">
        <MonthlyBars key={`bars-${months}`} data={leaveDaysByMonth(leaves, months)} unit="jours ouvrables" />
      </ChartCard>
      <ChartCard title="Congés validés par type">
        <DonutBreakdown
          key={`donut-${months}`}
          totalLabel="congés"
          data={leavesByType(scopedLeaves).map((item) => ({
            label: LEAVE_TYPES[item.type].label.replace('Congé ', '').replace(/^./, (letter) => letter.toUpperCase()),
            value: item.value,
          }))}
        />
      </ChartCard>
      <ChartCard title="Demandes de congé reçues">
        <TrendLine key={`trend-${months}`} data={requestsByMonth(leaves, months)} unit="demandes" />
      </ChartCard>
      <ChartCard title="Documents demandés">
        <RankBars
          data={documentsByType(scopedDocuments).map((item) => ({
            label: DOCUMENT_TYPES[item.type].label,
            value: item.value,
          }))}
        />
      </ChartCard>
      <ChartCard title="Centres les plus concernés">
        <RankBars
          unit="jours"
          data={centreAbsenceRanking(scopedLeaves, employeesById)}
          onSelect={(item) => navigation.navigate('HrEmployees', { centre: item.label })}
        />
      </ChartCard>
      <ChartCard title="Répartition des effectifs">
        <RankBars
          data={[
            { label: '31 centres', value: employees.length - headquarters },
            { label: 'Siège', value: headquarters },
          ]}
        />
      </ChartCard>
    </Screen>
  );
}
