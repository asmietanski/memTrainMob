import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { getStatistics, getCategories } from '../utils/database';

export default function HomeScreen({ navigation, db }) {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statistics = await getStatistics(db);
      const cats = await getCategories(db);
      setStats(statistics);
      setCategories(cats);
      
      // Load statistics for each category
      const catStats = {};
      for (const cat of cats) {
        catStats[cat] = await getStatistics(db, cat);
      }
      setCategoryStats(catStats);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };


  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to memTrain</Text>
        <Text style={styles.subtitle}>Spaced Repetition Learning</Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.due}</Text>
              <Text style={styles.statLabel}>Due for Review</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.reviewedToday}</Text>
              <Text style={styles.statLabel}>Reviewed Today</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.failed}</Text>
              <Text style={styles.statLabel}>Failed Items</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
          </View>

          {stats.newItemsBlocked && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                ⚠️ 20+ failed items - Focus on reviewing mistakes!
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.actionButtonText}>📚 Start Studying</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Text style={styles.actionButtonText}>📊 View Statistics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WikipediaScraper')}
        >
          <Text style={styles.actionButtonText}>🌐 Add from Wikipedia</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.actionButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>

      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories ({categories.length})</Text>
          {categories.map((category, index) => {
            const catStats = categoryStats[category] || { due: 0, failed: 0, total: 0 };
            return (
              <View key={index} style={styles.categoryItemWrapper}>
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => navigation.navigate('Study', { category: category })}
                >
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryText}>{category}</Text>
                    <Text style={styles.categoryArrow}>→</Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryStatText}>
                      Due: <Text style={styles.categoryStatNumber}>{catStats.due}</Text>
                    </Text>
                    <Text style={styles.categoryStatSeparator}>•</Text>
                    <Text style={styles.categoryStatText}>
                      Failed: <Text style={styles.categoryStatNumber}>{catStats.failed}</Text>
                    </Text>
                    <Text style={styles.categoryStatSeparator}>•</Text>
                    <Text style={styles.categoryStatText}>
                      Total: <Text style={styles.categoryStatNumber}>{catStats.total}</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.debugButton}
                  onPress={() => navigation.navigate('Debug', { category: category, db: db })}
                >
                  <Text style={styles.debugButtonText}>🔍</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 15,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  scanButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  categoriesContainer: {
    padding: 15,
  },
  categoryItemWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 10,
  },
  categoryItem: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugButtonText: {
    fontSize: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryArrow: {
    fontSize: 20,
    color: '#2196F3',
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryStatText: {
    fontSize: 13,
    color: '#666',
  },
  categoryStatNumber: {
    fontWeight: '600',
    color: '#2196F3',
  },
  categoryStatSeparator: {
    marginHorizontal: 8,
    color: '#999',
  },
});
