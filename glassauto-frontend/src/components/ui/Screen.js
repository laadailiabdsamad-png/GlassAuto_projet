import { KeyboardAvoidingView, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { useRefreshing } from '../../hooks/useRefreshing';

export const TAB_BAR_SPACE = 104;

export function Screen({
  header,
  children,
  footer,
  tabbed = false,
  refreshable = false,
  scroll = true,
  gap = 24,
}) {
  const insets = useSafeAreaInsets();
  const { refreshing, onRefresh } = useRefreshing();
  const bottom = tabbed ? insets.bottom + TAB_BAR_SPACE : insets.bottom + 32;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.obsidian }}
      behavior="padding"
    >
      {header}
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: header ? 8 : insets.top + 12,
            paddingBottom: footer ? 24 : bottom,
            gap,
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
          }}
          refreshControl={
            refreshable ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.chrome}
                colors={[colors.crimson]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: header ? 0 : insets.top + 12 }}>{children}</View>
      )}
      {footer ? (
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) + 6 }}
          className="border-t border-white/10 bg-carbon px-5 pt-4"
        >
          <View className="w-full max-w-[720px] gap-3 self-center">{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
