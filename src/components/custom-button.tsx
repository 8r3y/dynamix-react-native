import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableHighlight,
  ViewStyle,
} from 'react-native';

export type CustomButtonProps = {
  customStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onPress: (event?: any) => void;
  title: string;
};

export const CustomButton: React.FC<CustomButtonProps> = ({
  customStyle,
  disabled = false,
  onPress,
  title,
}) => {
  return (
    <TouchableHighlight
      disabled={disabled}
      style={[styles.buttonContainer, customStyle]}
      onPressIn={onPress}
    >
      <Text>{title}</Text>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  buttonContainer: { padding: 20, backgroundColor: 'green' },
});
