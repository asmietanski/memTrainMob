import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { getItemsByCategory, updateItemAfterReview, deleteItem, getImageUri } from '../utils/database';
import { calculateNextInterval, getDueItems } from '../utils/srsAlgorithm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

export default function StudyScreen({ route, navigation, db }) {
  const { category } = route.params;
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    failed: 0,
  });

  const position = useRef(new Animated.ValueXY()).current;
  const swipeDirection = useRef(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const allItems = await getItemsByCategory(db, category);
      const dueItems = getDueItems(allItems);
      setItems(dueItems);
      
      if (dueItems.length === 0) {
        Alert.alert(
          'All Caught Up!',
          'No items due for review in this category.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => showAnswer,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
        
        // Determine swipe direction
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeDirection.current = 'right';
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeDirection.current = 'left';
        } else {
          swipeDirection.current = null;
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          const direction = gesture.dx > 0 ? 'right' : 'left';
          forceSwipe(direction);
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const onSwipeComplete = async (direction) => {
    const quality = direction === 'right' ? 5 : 0;
    await handleReview(quality);
    
    position.setValue({ x: 0, y: 0 });
    setShowAnswer(false);
    swipeDirection.current = null;
  };

  const handleReview = async (quality) => {
    const item = items[currentIndex];
    
    try {
      const { newEF, newInterval, newRepetitions } = calculateNextInterval(
        quality,
        item.easiness_factor || 2.5,
        item.interval || 0,
        item.repetitions || 0
      );

      await updateItemAfterReview(db, item.id, quality, newEF, newInterval, newRepetitions);

      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (quality >= 3 ? 1 : 0),
        failed: prev.failed + (quality < 3 ? 1 : 0),
      }));

      // Reset showAnswer for next card
      setShowAnswer(false);

      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        Alert.alert(
          'Session Complete!',
          `Reviewed: ${sessionStats.reviewed + 1}\nCorrect: ${sessionStats.correct + (quality >= 3 ? 1 : 0)}\nFailed: ${sessionStats.failed + (quality < 3 ? 1 : 0)}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error updating review:', error);
      Alert.alert('Error', 'Failed to save review');
    }
  };

  const handleQualityButton = (quality) => {
    handleReview(quality);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to permanently delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const item = items[currentIndex];
            await deleteItem(db, item.id);
            
            const newItems = items.filter((_, index) => index !== currentIndex);
            setItems(newItems);
            
            if (newItems.length === 0) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No items to review</Text>
      </View>
    );
  }

  const currentItem = items[currentIndex];
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  const rotateAndTranslate = {
    transform: [
      { rotate },
      ...position.getTranslateTransform(),
    ],
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / items.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {items.length}
        </Text>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statItem}>✅ {sessionStats.correct}</Text>
        <Text style={styles.statItem}>❌ {sessionStats.failed}</Text>
        <Text style={styles.statItem}>📊 {sessionStats.reviewed}</Text>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.card, rotateAndTranslate]}
        >
          <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
            <Text style={styles.labelText}>CORRECT ✓</Text>
          </Animated.View>
          <Animated.View style={[styles.dislikeLabel, { opacity: dislikeOpacity }]}>
            <Text style={styles.labelText}>WRONG ✗</Text>
          </Animated.View>

          <Image
            source={{ uri: getImageUri(currentItem.image_path) }}
            style={styles.image}
            resizeMode="contain"
          />

          {showAnswer && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>{currentItem.name}</Text>
              <Text style={styles.categoryText}>{currentItem.category}</Text>
            </View>
          )}
        </Animated.View>
      </View>

      {!showAnswer ? (
        <TouchableOpacity
          style={styles.showAnswerButton}
          onPress={() => setShowAnswer(true)}
        >
          <Text style={styles.showAnswerText}>Show Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.controlsContainer}>
          <Text style={styles.swipeHint}>Rate your recall (0-5)</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.qualityButton, styles.blackoutButton]}
              onPress={() => handleQualityButton(0)}
            >
              <Text style={styles.buttonText}>0</Text>
              <Text style={styles.buttonSubtext}>Blackout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.qualityButton, styles.wrongFamiliarButton]}
              onPress={() => handleQualityButton(1)}
            >
              <Text style={styles.buttonText}>1</Text>
              <Text style={styles.buttonSubtext}>Wrong, familiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.qualityButton, styles.wrongEasyButton]}
              onPress={() => handleQualityButton(2)}
            >
              <Text style={styles.buttonText}>2</Text>
              <Text style={styles.buttonSubtext}>Wrong, easy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.qualityButton, styles.hardButton]}
              onPress={() => handleQualityButton(3)}
            >
              <Text style={styles.buttonText}>3</Text>
              <Text style={styles.buttonSubtext}>Hard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.qualityButton, styles.goodButton]}
              onPress={() => handleQualityButton(4)}
            >
              <Text style={styles.buttonText}>4</Text>
              <Text style={styles.buttonSubtext}>Good</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.qualityButton, styles.easyButton]}
              onPress={() => handleQualityButton(5)}
            >
              <Text style={styles.buttonText}>5</Text>
              <Text style={styles.buttonSubtext}>Easy</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete Item</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    padding: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    padding: 20,
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 1000,
    transform: [{ rotate: '30deg' }],
  },
  dislikeLabel: {
    position: 'absolute',
    top: 50,
    left: 40,
    zIndex: 1000,
    transform: [{ rotate: '-30deg' }],
  },
  labelText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    borderWidth: 4,
    borderColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: '70%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
  },
  answerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  answerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  showAnswerButton: {
    backgroundColor: '#2196F3',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  showAnswerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlsContainer: {
    padding: 15,
  },
  swipeHint: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  qualityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blackoutButton: {
    backgroundColor: '#B71C1C',
  },
  wrongFamiliarButton: {
    backgroundColor: '#D32F2F',
  },
  wrongEasyButton: {
    backgroundColor: '#F44336',
  },
  hardButton: {
    backgroundColor: '#FF9800',
  },
  goodButton: {
    backgroundColor: '#2196F3',
  },
  easyButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#757575',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});

// Made with Bob
