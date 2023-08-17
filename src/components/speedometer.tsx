import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import Speedometer, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
  Indicator,
} from 'react-native-cool-speedometer';
import {
  accelerometer,
  gravity,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import { map } from 'rxjs/operators';
import { CountdownerWidget } from './countdowner';
import { Divider } from './divider';

export const SpeedometerWidget: React.FC = () => {
  const [speed, setSpeed] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const [speedVector, setSpeedVector] = useState({
    vx: 0,
    vy: 0,
    vz: 0,
    timestamp: 0,
  });
  const [acceleration, setAcceleration] = useState({
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  });
  const [maxSpeed, setMaxSpeed] = useState(0);

  const [zero30, setZero30] = useState(0);
  const [zero60, setZero60] = useState(0);
  const [zero100, setZero100] = useState(0);

  const [calibrationStatus, setCalibrationStatus] = useState(0);
  const [scalarAdjust, setScalarAdjust] = useState(0);

  const [scalars, setScalars] = useState<number[]>([]);

  const countdowner = useRef<CountdownerWidget>(null);

  const timer = useRef(null);

  const [rawGravity, setRawGravity] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    setUpdateIntervalForType(SensorTypes.gravity, 100);
    gravity.pipe().subscribe(value => {
      // console.log('gravity velue', value);
      setRawGravity(value);
    });
    const sub = accelerometer
      .pipe(
        map(({ x, y, z }) => {
          return { x, y, z, timestamp: Date.now() };
        }),
        // filter(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z) - 9.8 > 0),
      )
      .subscribe(setAcceleration);

    return () => {
      sub.unsubscribe();
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
    const { x, y, z, timestamp } = acceleration;

    if (timestamp === 0) {
      return;
    }

    const gravityAdjust = [
      rawGravity.x - x,
      rawGravity.y - y,
      rawGravity.z - z,
    ];

    if (!gravityAdjust.some(value => Math.abs(value) > 0.1)) {
      return;
    }

    const scalar = Math.sqrt(x * x + y * y + z * z);
    setScalars([scalar, ...scalars.slice(0, 9)]);

    if (scalar < 9.80665) {
      return;
    }

    // console.log({ scalars });

    if (calibrationStatus === 1) {
      if (scalars.length === 10) {
        const averageScalar =
          scalars.reduce((prev, val) => {
            return prev + val;
          }, 0) / 10;

        console.log('averageScalar', averageScalar);
        setScalarAdjust(0 - averageScalar);
        setCalibrationStatus(2);
      }
      return;
    }

    const duration =
      speedVector.timestamp === 0 ? 100 : timestamp - speedVector.timestamp;

    console.log('Received new acceleration', {
      // scalar,
      // duration,
      // acceleration,
      speed,
      speedVector,
    });

    const vx = speedVector.vx + (x * duration) / 1000;
    const vy = speedVector.vy + (y * duration) / 1000;
    const vz = speedVector.vz + (z * duration) / 1000;

    const rawSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz);

    if (rawSpeed <= scalarAdjust) {
      return;
    }
    setSpeedVector({ vx, vy, vz, timestamp: Date.now() });

    // setSpeed(rawSpeed);
    setSpeed(calibrationStatus === 2 ? scalar + scalarAdjust : scalar);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceleration]);

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
      <Speedometer value={speed} max={320} fontFamily="squada-one">
        <Background />
        <Arc />
        <Needle />
        <Progress />
        <Marks />
        <Indicator fixValue>{value => <Text>{value}km/h</Text>}</Indicator>
      </Speedometer>
      <Divider />
      {calibrationStatus === 1 && <Text>Идет калибровка</Text>}
      <Divider />
      <Text>{`Speed: ${speed.toFixed(2)} m/s`}</Text>
      <Text>{`Max speed: ${maxSpeed.toFixed(1)} m/s`}</Text>
      <Divider />
      <CountdownerWidget ref={countdowner} />
      <Divider />
      <Text>{`0 - 30: ${zero30.toFixed(2)} s`}</Text>
      <Text>{`0 - 60: ${zero60.toFixed(2)} s`}</Text>
      <Text>{`0 - 100: ${zero100.toFixed(2)} s`}</Text>
      <Divider />
      <View style={styles.controlsContainer}>
        <TouchableHighlight
          disabled={false}
          style={styles.clearButton}
          onPressIn={onClearButtonPressed}
        >
          <Text>Сбросить</Text>
        </TouchableHighlight>
        <TouchableHighlight
          disabled={false}
          style={styles.stopButton}
          onPressIn={onStopButtonPressed}
        >
          <Text>Остановить</Text>
        </TouchableHighlight>
        <TouchableHighlight
          disabled={false}
          style={
            calibrationStatus === (0 || 2)
              ? styles.stopButton
              : styles.clearButton
          }
          onPressIn={onCalibrateButtonPressed}
        >
          <Text>Калибровать</Text>
        </TouchableHighlight>
      </View>
      <Divider />
      <Text>{`x: ${acceleration.x.toFixed(2)}, y: ${acceleration.y.toFixed(
        2,
      )}, z: ${acceleration.z.toFixed(2)}`}</Text>
      <Divider />
      <Text>{`x: ${rawGravity.x.toFixed(5)}, y: ${rawGravity.y.toFixed(
        5,
      )}, z: ${rawGravity.z.toFixed(5)}`}</Text>
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
  clearButton: { padding: 20, backgroundColor: 'red' },
  stopButton: { padding: 20, backgroundColor: 'green' },
});
