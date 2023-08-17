import React from 'react';
import { StyleSheet, View } from 'react-native';

export const Divider: React.FC = () => {
  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: { flex: 1, width: 100, height: 20 },
});
