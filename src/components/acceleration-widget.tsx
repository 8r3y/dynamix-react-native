import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SensorData } from 'react-native-sensors';

export type AccelerationWidgetProps = {
  data: Array<Omit<SensorData, 'timestamp'> & Partial<{ timestamp: number }>>;
  decimals?: number;
};

export const AccelerationWidget: React.FC<AccelerationWidgetProps> = ({
  data,
  decimals = 2,
}) => {
  const x = data.slice(-1)[0]?.x.toFixed(decimals) || 0;
  const y = data.slice(-1)[0]?.y.toFixed(decimals) || 0;
  const z = data.slice(-1)[0]?.z.toFixed(decimals) || 0;

  return <Text style={styles.text}>{`x: ${x}, y: ${y}, z: ${z}`}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
