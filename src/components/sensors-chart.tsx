import React from 'react';
import { SensorData } from 'react-native-sensors';
import { VictoryChart, VictoryLine } from 'victory-native';

export type SensorsChartProps = {
  gravityData: SensorData[];
  accelerationData: SensorData[];
  selectedData?: {
    dataFamily: 'gravity' | 'acceleration';
    axis: 'x' | 'y' | 'z';
  };
};

const SensorsChartComponent: React.FC<SensorsChartProps> = ({
  gravityData,
  accelerationData,
  selectedData = {
    axis: 'x',
    dataFamily: 'gravity',
  },
}) => {
  return (
    <VictoryChart>
      <VictoryLine
        style={{
          data: { stroke: '#c43a31', strokeDasharray: 3 },
          parent: { border: '1px solid #ccc' },
        }}
        // interpolation="natural"
        data={accelerationData.map((element, idx) => {
          return {
            x: idx,
            y: element[selectedData.axis],
          };
        })}
      />
      <VictoryLine
        style={{
          data: { stroke: '#c43a31' },
          parent: { border: '1px solid #ccc' },
        }}
        // interpolation="natural"
        data={gravityData.map((element, idx) => {
          return {
            x: idx,
            y: element[selectedData.axis],
          };
        })}
      />
    </VictoryChart>
  );
};

export const SensorsChart = React.memo(SensorsChartComponent);
