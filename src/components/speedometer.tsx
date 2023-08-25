import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  accelerometer,
  gravity,
  SensorData,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import { adjustAcceleration, avgSensorData } from '../utils';
import { AccelerationWidget } from './acceleration-widget';
import { CountdownerWidget } from './countdowner';
import { CustomButton } from './custom-button';
import { Divider } from './divider';
// import { SensorsChart } from './sensors-chart';

export const SpeedometerWidget: React.FC = () => {
  const [speed, setSpeed] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const [speedVector, setSpeedVector] = useState({
    vx: 0,
    vy: 0,
    vz: 0,
    timestamp: 0,
  });
  const [rawAcceleration, setRawAcceleration] = useState<SensorData[]>([]);
  const [rawGravity, setRawGravity] = useState<SensorData[]>([]);
  const [maxSpeed, setMaxSpeed] = useState(0);

  const [zero30, setZero30] = useState(0);
  const [zero60, setZero60] = useState(0);
  const [zero100, setZero100] = useState(0);

  const [calibrationStatus, setCalibrationStatus] = useState(0);

  const countdowner = useRef<CountdownerWidget>(null);

  const timer = useRef(null);

  const [normalized, setNormalized] = useState<Omit<SensorData, 'timestamp'>>({
    x: 0,
    y: 0,
    z: 0,
  });

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    setUpdateIntervalForType(SensorTypes.gravity, 100);
    const gravitySub = gravity.pipe().subscribe(value => {
      setRawGravity(hist => {
        if (hist.length > 99) {
          return [...hist.slice(1, 100), value];
        } else {
          return [...hist, value];
        }
      });
    });

    const accSub = accelerometer.pipe().subscribe(value => {
      setRawAcceleration(hist => {
        if (hist.length > 99) {
          return [...hist.slice(1, 100), value];
        } else {
          return [...hist, value];
        }
      });
    });

    return () => {
      accSub.unsubscribe();
      gravitySub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (speed > maxSpeed && calibrationStatus === 2) {
      setMaxSpeed(speed);
    }
    if (speed > 0) {
      if (startTime === 0) {
        setStartTime(Date.now());
      }

      // countdowner.current?.start();

      if (speed >= 30 && zero30 === 0) {
        setZero30((Date.now() - startTime) / 1000);
      }

      if (speed >= 60 && zero60 === 0) {
        setZero60((Date.now() - startTime) / 1000);
      }

      if (speed >= 100 && zero100 === 0) {
        setZero100((Date.now() - startTime) / 1000);
      }

      if (timer.current) {
        clearTimeout(timer.current);
      }
      (timer as any).current = setTimeout(() => {
        setSpeed(0);
        setStartTime(0);
      }, 505);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  useEffect(() => {
    // calcSpeed
    // vx=ux+axt, vy=uy+ayt and vz=uz+azt. and then v= sqrt(vx^2+vy^2+vz^2)

    const avgGravity = avgSensorData(rawGravity);
    const avgAcceleration = avgSensorData(rawAcceleration);

    // adjust gravity
    const adjustedAcceleration = adjustAcceleration({
      avgGravity,
      avgAcceleration,
    });

    setNormalized(adjustedAcceleration);

    const { x, y, z } = adjustedAcceleration;

    const scalarSpeed = Math.sqrt(x * x + y * y + z * z);

    const duration =
      speedVector.timestamp === 0 ? 100 : Date.now() - speedVector.timestamp;

    const vx = speedVector.vx + (x * duration) / 1000;
    const vy = speedVector.vy + (y * duration) / 1000;
    const vz = speedVector.vz + (z * duration) / 1000;

    // console.log('Received new acceleration', {
    //   // scalar,
    //   duration,
    //   // acceleration,
    //   speed,
    //   speedVector,
    //   x,
    //   vx,
    // });

    // const rawSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz);

    setSpeedVector({ vx, vy, vz, timestamp: Date.now() });

    setSpeed(scalarSpeed);
    // setSpeed(calibrationStatus === 2 ? scalar + scalarAdjust : scalar);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawAcceleration]);

  const onClearButtonPressed = () => {
    setMaxSpeed(0);
    setZero30(0);
    setZero60(0);
    setZero100(0);
    countdowner.current?.clear();
  };

  const onStopButtonPressed = () => {
    countdowner.current?.stop();
  };

  const onCalibrateButtonPressed = () => {
    setCalibrationStatus(1);
  };

  return (
    <View style={styles.widgetContainer}>
      {/* <SensorsChart
        accelerationData={rawAcceleration}
        gravityData={rawGravity}
      /> */}
      <Divider />
      {calibrationStatus === 1 && <Text>Идет калибровка</Text>}
      <Divider />
      <Text>{`Speed: ${speed.toFixed(2)} km/h`}</Text>
      <Text>{`Max speed: ${(maxSpeed * 3.6).toFixed(1)} km/h`}</Text>
      <Divider />
      <CountdownerWidget ref={countdowner} />
      <Divider />
      <Text>{`0 - 30: ${zero30.toFixed(2)} s`}</Text>
      <Text>{`0 - 60: ${zero60.toFixed(2)} s`}</Text>
      <Text>{`0 - 100: ${zero100.toFixed(2)} s`}</Text>
      <Divider />
      <View style={styles.controlsContainer}>
        <CustomButton
          title="Сбросить"
          onPress={onClearButtonPressed}
          customStyle={styles.redButton}
        />
        <CustomButton title="Остановить" onPress={onStopButtonPressed} />
        <CustomButton
          customStyle={calibrationStatus === (0 || 2) && styles.redButton}
          title="Калибровать"
          onPress={onCalibrateButtonPressed}
        />
      </View>
      <Divider />
      <AccelerationWidget data={rawAcceleration} />
      <Divider />
      <AccelerationWidget data={rawGravity} />
      <Divider />
      <AccelerationWidget data={[normalized]} />
      <Divider />
    </View>
  );
};

const styles = StyleSheet.create({
  widgetContainer: { flex: 1, alignItems: 'center' },
  controlsContainer: {
    width: '100%',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  redButton: { backgroundColor: 'red' },
});
