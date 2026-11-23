import { View } from 'react-native';
import { LEAVE_TYPES, ROUTING_META } from '../../data/constants';
import { formatRange } from '../../utils/date';
import { plural } from '../../utils/format';
import { Card, ListRow } from '../ui';

export function RequestFacts({ leave }) {
  const type = LEAVE_TYPES[leave.conge_type];
  return (
    <Card>
      <View className="-my-2">
        <ListRow icon={type.icon} title="Type" value={type.label} />
        <ListRow
          icon="calendar-range"
          title="Période"
          value={formatRange(leave.date_debut, leave.date_fin)}
        />
        <ListRow
          icon="counter"
          title="Durée"
          value={plural(leave.jour_demande, 'jour ouvrable', 'jours ouvrables')}
        />
        <ListRow
          icon="calendar-check-outline"
          title="Planning annuel"
          value={leave.est_dans_planning_annuel ? 'Période prévue' : 'Hors planning'}
        />
        <ListRow icon="routes" title="Circuit" value={ROUTING_META[leave.routing].label} last />
      </View>
    </Card>
  );
}
