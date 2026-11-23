import { View } from 'react-native';
import { ListRow, Sheet } from '../../components/ui';

const options = [
  {
    screen: 'LeaveForm',
    icon: 'beach',
    title: 'Demande de congé',
    subtitle: 'Planning annuel ou préavis de 20 jours',
  },
  {
    screen: 'DocumentForm',
    icon: 'file-document-outline',
    title: 'Document administratif',
    subtitle: 'À retirer signé et cacheté au bureau RH',
  },
  {
    screen: 'AbsenceForm',
    icon: 'calendar-remove-outline',
    title: 'Justification d’absence',
    subtitle: 'Pour une absence inopinée passée',
  },
];

export function NewRequestSheet({ visible, onClose, onSelect }) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Nouvelle demande">
      <View>
        {options.map((option, index) => (
          <ListRow
            key={option.screen}
            icon={option.icon}
            tone="crimson"
            title={option.title}
            subtitle={option.subtitle}
            onPress={() => onSelect(option.screen)}
            last={index === options.length - 1}
          />
        ))}
      </View>
    </Sheet>
  );
}
