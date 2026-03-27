import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getAllItems } from '../utils/database';

export default function StatisticsScreen({ db }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    const items = await getAllItems(db);
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const statistics = {
      total: items.length,
      new: items.filter(i => !i.last_reviewed_at).length,
      learning: items.filter(i => i.repetitions > 0 && i.repetitions < 3).length,
      mature: items.filter(i => i.repetitions >= 3).length,
      reviewedToday: items.filter(i => 
        i.last_reviewed_at && new Date(i.last_reviewed_at) >= todayStart
      ).length,
      avgEF: items.reduce((sum, i) => sum + (i.easiness_factor || 2.5), 0) / items.length,
    };

    setStats(statistics);
  };

  if (!stats) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Overall Statistics</Text>
        <View style={styles.statRow}>
          <Text style={styles.label}>Total Items:</Text>
          <Text style={styles.value}>{stats.total}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.label}>New Items:</Text>
          <Text style={styles.value}>{stats.new}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.label}>Learning:</Text>
          <Text style={styles.value}>{stats.learning}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.label}>Mature:</Text>
          <Text style={styles.value}>{stats.mature}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.label}>Reviewed Today:</Text>
          <Text style={styles.value}>{stats.reviewedToday}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.label}>Avg Easiness:</Text>
          <Text style={styles.value}>{stats.avgEF.toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});
