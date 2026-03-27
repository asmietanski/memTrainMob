import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { getCategories, getStatistics } from '../utils/database';

export default function CategoryScreen({ route, navigation, db }) {
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getCategories(db);
      setCategories(cats);
      
      const stats = {};
      for (const cat of cats) {
        stats[cat] = await getStatistics(db, cat);
      }
      setCategoryStats(stats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleCategorySelect = (category) => {
    navigation.navigate('Study', { category });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Select a category to study</Text>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories available</Text>
          <Text style={styles.emptySubtext}>
            Add items from Wikipedia or import data
          </Text>
        </View>
      ) : (
        categories.map((category, index) => {
          const stats = categoryStats[category] || {};
          return (
            <TouchableOpacity
              key={index}
              style={styles.categoryCard}
              onPress={() => handleCategorySelect(category)}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category}</Text>
                {stats.newItemsBlocked && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningBadgeText}>⚠️</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.due || 0}</Text>
                  <Text style={styles.statLabel}>Due</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.failed || 0}</Text>
                  <Text style={styles.statLabel}>Failed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.total || 0}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>

              {stats.newItemsBlocked && (
                <Text style={styles.warningText}>
                  20+ failed items - Focus mode active
                </Text>
              )}
            </TouchableOpacity>
          );
        })
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
  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  warningBadge: {
    backgroundColor: '#FFC107',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBadgeText: {
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  warningText: {
    marginTop: 10,
    fontSize: 12,
    color: '#856404',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 5,
    textAlign: 'center',
  },
});
