import { useState } from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors, fonts } from '../../theme';
import { Txt } from '../ui';

const niceCeiling = (value) => {
  if (value <= 4) {
    return 4;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 1.2, 1.6, 2, 2.4, 3, 4, 6, 8, 10];
  const factor = steps.find((step) => step * magnitude >= value && (step * magnitude) % 4 === 0);
  return (factor || 10) * magnitude;
};

export function MonthlyBars({ data, unit, height = 150 }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(data.length - 1);
  const max = niceCeiling(Math.max(...data.map((item) => item.value), 1));
  const axis = 34;
  const slot = width > 0 ? (width - axis - 12) / data.length : 0;
  const barWidth = Math.min(24, slot * 0.5);
  const focus = data[selected] || data[data.length - 1];

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} className="gap-3">
      <View className="flex-row items-baseline gap-2">
        <Txt size="xl" weight="figure">
          {focus.value}
        </Txt>
        <Txt size="sm" tone="soft">
          {unit}, {focus.label}
        </Txt>
      </View>
      {width > 0 ? (
        <BarChart
          key={Math.round(width)}
          data={data.map((item, index) => ({
            value: item.value,
            label: item.label,
            frontColor: index === selected ? colors.crimson : '#6d6968',
            onPress: () => setSelected(index),
          }))}
          width={width - axis}
          rulesLength={width - axis}
          xAxisLength={width - axis}
          height={height}
          maxValue={max}
          noOfSections={4}
          barWidth={barWidth}
          spacing={slot - barWidth}
          initialSpacing={(slot - barWidth) / 2}
          endSpacing={0}
          barBorderTopLeftRadius={4}
          barBorderTopRightRadius={4}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={colors.edge}
          rulesColor={colors.steel}
          rulesType="solid"
          yAxisLabelWidth={axis}
          yAxisTextStyle={{ color: colors.mute, fontFamily: fonts.body, fontSize: 12 }}
          xAxisLabelTextStyle={{
            color: colors.soft,
            fontFamily: fonts.body,
            fontSize: 12,
            textAlign: 'center',
          }}
          disableScroll
          isAnimated
          animationDuration={500}
        />
      ) : null}
    </View>
  );
}
