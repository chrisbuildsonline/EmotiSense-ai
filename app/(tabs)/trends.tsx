import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TrendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emotional Trends</Text>
      <Text style={styles.subtitle}>Trends visualization will be implemented here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4A90E2',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});