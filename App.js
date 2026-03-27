import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { openDatabase, scanExternalImages } from './utils/database';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import StudyScreen from './screens/StudyScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import WikipediaScraperScreen from './screens/WikipediaScraperScreen';

const Stack = createStackNavigator();

export default function App() {
  const [db, setDb] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initStatus, setInitStatus] = useState('Initializing database...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request storage permissions on Android
      if (Platform.OS === 'android') {
        setInitStatus('Requesting storage permissions...');
        const { status } = await MediaLibrary.requestPermissionsAsync();
        
        if (status !== 'granted') {
          setInitStatus('Storage permission denied. App needs access to Documents folder.');
          await new Promise(resolve => setTimeout(resolve, 3000));
          setIsInitializing(false);
          return;
        }
      }

      // Open database
      setInitStatus('Opening database...');
      const database = await openDatabase();
      setDb(database);

      // Always scan on launch to pick up new directories
      setInitStatus('Scanning Documents/memTrain for images...');
      
      try {
        const result = await scanExternalImages(database);
        console.log('Auto-scan complete:', result);
        
        if (result.error) {
          setInitStatus(result.error);
        } else if (result.added > 0) {
          setInitStatus(`Found ${result.added} new items!`);
        } else if (result.scanned === 0) {
          setInitStatus('No images found. Create folder:\n/storage/emulated/0/Documents/memTrain/');
        } else {
          setInitStatus('All images already in database');
        }
      } catch (scanError) {
        console.error('Auto-scan failed:', scanError);
        setInitStatus(`Scan failed: ${scanError.message}\nApp will continue without external images.`);
      }
      
      // Small delay to show status
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setInitStatus('Initialization failed: ' + error.message);
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>{initStatus}</Text>
      </View>
    );
  }

  if (!db) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to initialize database</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          options={{ title: 'memTrain' }}
        >
          {props => <HomeScreen {...props} db={db} />}
        </Stack.Screen>

        <Stack.Screen 
          name="Categories" 
          options={{ title: 'Select Category' }}
        >
          {props => <CategoryScreen {...props} db={db} />}
        </Stack.Screen>

        <Stack.Screen 
          name="Study" 
          options={{ title: 'Study Session' }}
        >
          {props => <StudyScreen {...props} db={db} />}
        </Stack.Screen>

        <Stack.Screen 
          name="Statistics" 
          options={{ title: 'Statistics' }}
        >
          {props => <StatisticsScreen {...props} db={db} />}
        </Stack.Screen>

        <Stack.Screen 
          name="Settings" 
          options={{ title: 'Settings' }}
        >
          {props => <SettingsScreen {...props} db={db} />}
        </Stack.Screen>

        <Stack.Screen 
          name="WikipediaScraper" 
          options={{ title: 'Add from Wikipedia' }}
        >
          {props => <WikipediaScraperScreen {...props} db={db} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Made with Bob


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
});
