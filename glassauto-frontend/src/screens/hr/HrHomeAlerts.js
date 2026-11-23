import { AlertCard } from '../../components/domain';
import { plural } from '../../utils/format';

export function AlertCardGroup({ navigation, leaves }) {
  const special = leaves.filter((leave) => leave.routing !== 'standard');
  if (special.length === 0) {
    return null;
  }
  return (
    <AlertCard
      icon="routes"
      tone="violet"
      title={plural(special.length, 'cas particulier', 'cas particuliers')}
      message="Congés de responsables ou responsable indisponible"
      onPress={() => navigation.navigate('HrLeaves', { filter: 'special' })}
    />
  );
}
