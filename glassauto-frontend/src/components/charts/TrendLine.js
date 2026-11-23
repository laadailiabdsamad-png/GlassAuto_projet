import { useState } from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors, fonts } from '../../theme';
import { Txt } from '../ui';

export function TrendLine({ data, unit, height = 140, color = '#3987e5' }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(data.length - 1);
  const axis = 34;
  const peak = Math.max(...data.map((item) => item.value), 1);
  const max = Math.max(4, Math.ceil(peak / 4) * 4);
  const spacing = width > 0 ? (width - axis - 48) / Math.max(1, data.length - 1) : 0;
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
        <LineChart
          key={Math.round(width)}
          data={data.map((item, index) => ({
            value: item.value,
            label: item.label,
            dataPointColor: index === selected ? colors.ink : color,
            dataPointRadius: index === selected ? 6 : 4,
            onPress: () => setSelected(index),
          }))}
          areaChart
          width={width - axis}
          rulesLength={width - axis}
          xAxisLength={width - axis}
          height={height}
          maxValue={max}
          noOfSections={4}
          spacing={spacing}
          initialSpacing={22}
          endSpacing={22}
          thickness={2}
          color={color}
          startFillColor={color}
          endFillColor={color}
          startOpacity={0.24}
          endOpacity={0.01}
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
          focusEnabled
          onFocus={(_item, index) => setSelected(index)}
          isAnimated
          animationDuration={600}
        />
      ) : null}
    </View>
  );
}
