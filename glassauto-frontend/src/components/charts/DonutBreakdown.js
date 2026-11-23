import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { chartSeries, colors } from '../../theme';
import { percent } from '../../utils/format';
import { Txt } from '../ui';

export function DonutBreakdown({ data, totalLabel, size = 78 }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(null);
  const stacked = width > 0 && width < 290;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const focus = selected === null ? null : data[selected];
  const slices = data.map((item, index) => ({
    value: item.value,
    color: chartSeries[index],
    focused: selected === index,
    onPress: () => setSelected((current) => (current === index ? null : index)),
  }));

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      className={stacked ? 'items-center gap-4' : 'flex-row items-center gap-5'}
    >
      <PieChart
        data={slices}
        donut
        radius={size}
        innerRadius={size * 0.66}
        innerCircleColor={colors.carbon}
        strokeColor={colors.carbon}
        strokeWidth={2}
        centerLabelComponent={() => (
          <View className="items-center">
            <Txt size="xl" weight="figure" align="center">
              {focus ? `${percent(focus.value, total)} %` : total}
            </Txt>
            <Txt size="xs" tone="mute" align="center">
              {focus ? 'du total' : totalLabel}
            </Txt>
          </View>
        )}
      />
      <View className={stacked ? 'w-full gap-0.5' : 'flex-1 gap-0.5'}>
        {data.map((item, index) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={`${item.label} : ${item.value}`}
            onPress={() => setSelected((current) => (current === index ? null : index))}
            className={`min-h-[40px] flex-row items-center gap-2 rounded-lg px-2 py-1.5 ${selected === index ? 'bg-steel' : ''}`}
          >
            <View
              style={{ backgroundColor: chartSeries[index] }}
              className="h-3 w-3 rounded-[3px]"
            />
            <Txt size="sm" tone="soft" className="flex-1" numberOfLines={2}>
              {item.label}
            </Txt>
            <Txt size="sm" weight="semi">
              {item.value}
            </Txt>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
