import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button } from '../ui';

export function PagedList({ items, renderItem, pageSize = 15, resetKey, gap = 'gap-3' }) {
  const [count, setCount] = useState(pageSize);

  useEffect(() => {
    setCount(pageSize);
  }, [pageSize, resetKey]);

  return (
    <View className={gap}>
      {items.slice(0, count).map((item, index) =>
        renderItem(item, index, index === Math.min(count, items.length) - 1)
      )}
      {items.length > count ? (
        <Button
          label={`Afficher plus (${items.length - count})`}
          variant="subtle"
          size="sm"
          onPress={() => setCount((current) => current + pageSize)}
        />
      ) : null}
    </View>
  );
}
