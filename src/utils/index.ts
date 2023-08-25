import { SensorData } from 'react-native-sensors';

export const avgSensorData = (data: Array<SensorData>, valuesCount = 3) => {
  return data.slice(-valuesCount).reduce(
    (prev, cur) => {
      const x = !Number.isNaN(prev.x) ? (cur.x + prev.x) / 2 : cur.x;
      const y = !Number.isNaN(prev.y) ? (cur.y + prev.y) / 2 : cur.y;
      const z = !Number.isNaN(prev.z) ? (cur.z + prev.z) / 2 : cur.z;

      return {
        x,
        y,
        z,
      };
    },
    { x: NaN, y: NaN, z: NaN },
  );
};

export const adjustAcceleration = ({
  avgAcceleration,
  avgGravity,
}: {
  avgAcceleration: Omit<SensorData, 'timestamp'>;
  avgGravity: Omit<SensorData, 'timestamp'>;
}) => {
  const calcValue = (key: 'x' | 'y' | 'z') => {
    const acc = !Number.isNaN(avgAcceleration[key])
      ? Math.round(avgAcceleration[key] * 10) / 10
      : 0;
    const gravity = !Number.isNaN(avgGravity[key])
      ? Math.round(avgGravity[key] * 10) / 10
      : 0;
    return acc - gravity;
  };

  const x = calcValue('x');
  const y = calcValue('y');
  const z = calcValue('z');

  return { x, y, z };
};
