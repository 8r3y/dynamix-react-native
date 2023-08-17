import React, { Component } from 'react';
import { View, Text } from 'react-native';

export type CountdownerWidgetProps = {};

export type CountdownerState = {
  value: number;
};

export class CountdownerWidget extends Component<
  CountdownerWidgetProps,
  CountdownerState
> {
  constructor(props: CountdownerWidgetProps) {
    super(props);

    this.state = {
      value: 0,
    };
  }

  private timer?: number = undefined;

  start() {
    console.log('+++ startHandler', this.state.value);
    if (this.timer) {
      console.log('already started');
      return;
    }
    this.setState({ ...this.state, value: 0 });
    const timeStart = Date.now();
    this.timer = setInterval(() => {
      this.setState({ ...this.state, value: Date.now() - timeStart });
    }, 1);
  }

  stop() {
    console.log('--- stopHandler');
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  clear() {
    this.stop();
    this.setState({ ...this.state, value: 0 });
  }

  render() {
    return (
      <View>
        <Text>{`Countdown ${this.state.value.toFixed(1)}`}</Text>
      </View>
    );
  }
}
