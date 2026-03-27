import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { openDatabase } from './utils/database';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import StudyScreen from './screens/StudyScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import WikipediaScraperScreen from './screens/WikipediaScraperScreen';

const Stack = createStackNavigator();

export default function App() {
  const [db, setDb] = useState(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const database = await openDatabase();
      setDb(database);
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  if (!db) {
    return null; // Or a loading screen
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
