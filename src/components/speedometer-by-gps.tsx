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
import Geolocation from '@react-native-community/geolocation';
import { CountdownerWidget } from './countdowner';
import { Divider } from './divider';

export const SpeedometerWidgetByGPS: React.FC = () => {
  const [speed, setSpeed] = useState(0);

  const [maxSpeed, setMaxSpeed] = useState(0);

  const [zero30, setZero30] = useState(0);
  const [zero60, setZero60] = useState(0);
  const [zero100, setZero100] = useState(0);

  const countdowner = useRef<CountdownerWidget>(null);

  useEffect(() => {
    Geolocation.setRNConfiguration({
      authorizationLevel: 'whenInUse',
      locationProvider: 'playServices',
      skipPermissionRequests: false,
    });

    let watchId: number | undefined;

    Geolocation.requestAuthorization(() => {
      console.log('Permission received');
      watchId = Geolocation.watchPosition(
        position => {
          console.log(position);
          if (typeof position.coords.speed === 'number') {
            setSpeed(position.coords.speed * 3.6);
          }
        },
        undefined,
        {
          // interval: 100,
          // fastestInterval: 50,
          enableHighAccuracy: true,
          // maximumAge: 0,
          distanceFilter: 0.1,
        },
      );
    });

    return () => {
      console.log('Clean wathch id', watchId);
      if (watchId) {
        Geolocation.clearWatch(watchId);
        watchId = undefined;
      }
    };
  }, []);

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
    countdowner.current?.stop();
  };

  return (
    <View style={styles.widgetContainer}>
      <Speedometer value={speed} max={180} fontFamily="squada-one">
        <Background />
        <Arc />
        <Needle />
        <Progress />
        <Marks />
        <Indicator fixValue>{value => <Text>{value}km/h</Text>}</Indicator>
      </Speedometer>
      <Divider />
      <Text>{`Speed: ${speed.toFixed(2)} m/s`}</Text>
      <Text>{`Max speed: ${maxSpeed.toFixed(1)} m/s`}</Text>
      <Divider />
      <CountdownerWidget ref={countdowner} />
      <Divider />
      <Text>{`0 - 30: ${zero30.toFixed(1)} ms`}</Text>
      <Text>{`0 - 60: ${zero60.toFixed(1)} ms`}</Text>
      <Text>{`0 - 100: ${zero100.toFixed(1)} ms`}</Text>
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
          style={styles.clearButton}
          onPressIn={onCalibrateButtonPressed}
        >
          <Text>Калибровать</Text>
        </TouchableHighlight>
      </View>
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
