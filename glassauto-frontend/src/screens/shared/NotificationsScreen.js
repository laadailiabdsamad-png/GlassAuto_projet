import { Pressable, View } from 'react-native';
import { AppHeader, Card, EmptyState, Icon, IconButton, IconTile, Screen, SectionHeader, Txt } from '../../components/ui';
import { NOTIFICATION_TYPES } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useHrData } from '../../hooks/useHrData';
import { useNotifications } from '../../hooks/useNotifications';
import { colors } from '../../theme';
import { relativeTime, toISO, today } from '../../utils/date';
import { plural } from '../../utils/format';

function NotificationRow({ item, onPress, onRemove, last }) {
  const meta = NOTIFICATION_TYPES[item.type];
  return (
    <View className={`flex-row items-start gap-3 py-3.5 ${last ? '' : 'border-b border-white/10'}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.title}
        onPress={onPress}
        className="flex-1 flex-row items-start gap-3 active:opacity-70"
      >
        <IconTile icon={meta.icon} tone={meta.tone} size={42} />
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Txt weight={item.read ? 'medium' : 'semi'} tone={item.read ? 'soft' : 'ink'} className="shrink">
              {item.title}
            </Txt>
            {item.read ? null : <View className="h-2 w-2 rounded-full bg-crimson" />}
          </View>
          <Txt size="sm" tone={item.read ? 'mute' : 'soft'}>
            {item.message}
          </Txt>
          <Txt size="xs" tone="mute" className="mt-1">
            {relativeTime(item.created_at)}
          </Txt>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Supprimer la notification"
        onPress={onRemove}
        hitSlop={10}
        className="h-9 w-9 items-center justify-center active:opacity-60"
      >
        <Icon name="close" size={18} color={colors.mute} />
      </Pressable>
    </View>
  );
}

export function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const { actions } = useHrData();
  const { items, unread } = useNotifications();
  const isToday = (item) => toISO(new Date(item.created_at)) === today();
  const groups = [
    { title: 'Aujourd’hui', items: items.filter(isToday) },
    { title: 'Plus tôt', items: items.filter((item) => !isToday(item)) },
  ].filter((group) => group.items.length > 0);

  const open = async (item) => {
    if (!item.read) {
      await actions.notifications.markRead(item.id);
    }
    if (item.target) {
      navigation.navigate(item.target.screen, item.target.params);
    }
  };

  return (
    <Screen
      refreshable
      header={
        <AppHeader
          title="Notifications"
          subtitle={unread > 0 ? plural(unread, 'non lue', 'non lues') : 'Tout est lu'}
          right={
            unread > 0 ? (
              <IconButton
                icon="check-all"
                label="Tout marquer comme lu"
                onPress={() => actions.notifications.markAllRead(user.id_personne)}
              />
            ) : null
          }
        />
      }
    >
      {groups.length === 0 ? (
        <EmptyState
          icon="bell-sleep-outline"
          title="Aucune notification"
          message="Les décisions et les mises à disposition vous seront signalées ici."
        />
      ) : (
        groups.map((group) => (
          <View key={group.title} className="gap-3">
            <SectionHeader title={group.title} />
            <Card>
              <View className="-my-2">
                {group.items.map((item, index) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onPress={() => open(item)}
                    onRemove={() => actions.notifications.remove(item.id)}
                    last={index === group.items.length - 1}
                  />
                ))}
              </View>
            </Card>
          </View>
        ))
      )}
    </Screen>
  );
}
