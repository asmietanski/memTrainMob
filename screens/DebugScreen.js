import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getItemsByCategory } from '../utils/database';

export default function DebugScreen({ route, navigation }) {
  const { db, category } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const allItems = await getItemsByCategory(db, category);
      setItems(allItems);
      setLoading(false);
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Error', 'Failed to load items');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'NULL';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    let timeInfo = '';
    if (diffDays > 0) {
      timeInfo = ` (+${diffDays}d ${diffHours}h)`;
    } else if (diffDays < 0) {
      timeInfo = ` (${diffDays}d ${diffHours}h)`;
    } else {
      timeInfo = ` (${diffHours}h)`;
    }
    
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) + timeInfo;
  };

  const isDue = (item) => {
    if (!item.next_review_date) return false;
    const nextReview = new Date(item.next_review_date);
    const now = new Date();
    return nextReview <= now;
  };

  const getItemStatus = (item) => {
    if (!item.last_reviewed_at) return '🆕 NEW';
    if (item.interval === 0 && item.repetitions === 0) return '❌ FAILED';
    if (isDue(item)) return '⏰ DUE';
    return '⏳ SCHEDULED';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const dueItems = items.filter(isDue);
  const failedItems = items.filter(item => 
    item.interval === 0 && item.repetitions === 0 && item.last_reviewed_at
  );
  const newItems = items.filter(item => !item.last_reviewed_at);
  const scheduledItems = items.filter(item => 
    item.interval > 0 && item.repetitions > 0 && !isDue(item)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug: {category}</Text>
        <Text style={styles.subtitle}>Total: {items.length} items</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>⏰ Due: {dueItems.length}</Text>
          <Text style={styles.stat}>❌ Failed: {failedItems.length}</Text>
          <Text style={styles.stat}>🆕 New: {newItems.length}</Text>
          <Text style={styles.stat}>⏳ Scheduled: {scheduledItems.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {items.map((item, index) => (
          <View key={item.id} style={[
            styles.itemCard,
            isDue(item) && styles.dueCard
          ]}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemStatus}>{getItemStatus(item)}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            
            <View style={styles.itemDetails}>
              <Text style={styles.detailText}>ID: {item.id}</Text>
              <Text style={styles.detailText}>EF: {item.easiness_factor?.toFixed(2) || 'N/A'}</Text>
              <Text style={styles.detailText}>Interval: {item.interval} days</Text>
              <Text style={styles.detailText}>Reps: {item.repetitions}</Text>
            </View>

            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>Next Review:</Text>
              <Text style={[
                styles.dateValue,
                isDue(item) && styles.dueDate
              ]}>
                {formatDate(item.next_review_date)}
              </Text>
            </View>

            {item.last_reviewed_at && (
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>Last Reviewed:</Text>
                <Text style={styles.dateValue}>
                  {formatDate(item.last_reviewed_at)}
                </Text>
              </View>
            )}

            <Text style={styles.imagePath}>{item.image_path}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  stat: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  scrollView: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dueCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#f0fff0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemStatus: {
    fontSize: 16,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  dateSection: {
    marginTop: 5,
  },
  dateLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  dueDate: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  imagePath: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Made with Bob
