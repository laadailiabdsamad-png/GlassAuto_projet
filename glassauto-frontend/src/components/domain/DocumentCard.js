import { View } from 'react-native';
import { useHrData } from '../../hooks/useHrData';
import { DOCUMENT_STATES, DOCUMENT_TYPES } from '../../data/constants';
import { relativeTime } from '../../utils/date';
import { Card, IconTile, StatusBadge, Txt } from '../ui';

export function DocumentCard({ document, onPress, showEmployee = false, footer }) {
  const { employeesById } = useHrData();
  const employee = employeesById[document.id_demandeur];
  const type = DOCUMENT_TYPES[document.type_doc];
  return (
    <Card onPress={onPress} footer={footer} accessibilityLabel={type.label}>
      <View className="flex-row items-center gap-3">
        <IconTile icon={type.icon} size={44} />
        <View className="flex-1">
          <Txt weight="semi" numberOfLines={1}>
            {type.label}
          </Txt>
          <Txt size="sm" tone="mute" numberOfLines={1}>
            {showEmployee ? `${employee.full_name}, ${employee.centre_nom}` : document.motif}
          </Txt>
        </View>
      </View>
      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
        <StatusBadge meta={DOCUMENT_STATES[document.state]} />
        <Txt size="sm" tone="mute">
          {relativeTime(document.generated_at)}
        </Txt>
      </View>
    </Card>
  );
}
