import { View } from 'react-native';
import { useMyRecords } from '../../hooks/useMyRecords';
import { plural } from '../../utils/format';
import { ChromePlate, Gauge, Txt } from '../ui';

function Figure({ value, label }) {
  return (
    <View className="gap-0.5 border-l-2 border-black/20 pl-3">
      <Txt size="lg" weight="figure" tone="obsidian">
        {value}
      </Txt>
      <Txt size="sm" weight="medium" tone="plate">
        {label}
      </Txt>
    </View>
  );
}

export function BalancePlate() {
  const { balance, taken, pending, acquired } = useMyRecords();
  return (
    <ChromePlate>
      <Txt size="md" weight="display" tone="obsidian">
        Solde de congés
      </Txt>
      <View className="mt-2 flex-row items-center gap-5">
        <Gauge value={balance} max={Math.max(acquired, 26)} size={164}>
          <Txt size="2xl" weight="slant" tone="obsidian" align="center">
            {balance}
          </Txt>
          <Txt size="sm" weight="semi" tone="plate" align="center">
            {plural(balance, 'jour').split(' ')[1]}
          </Txt>
        </Gauge>
        <View className="flex-1 gap-4">
          <Figure value={acquired} label="Jours acquis" />
          <Figure value={taken} label="Jours pris" />
          <Figure value={pending} label="En attente" />
        </View>
      </View>
    </ChromePlate>
  );
}
