import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

export default function WikipediaScraperScreen({ db }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a Wikipedia URL');
      return;
    }

    if (!url.includes('wikipedia.org')) {
      Alert.alert('Error', 'Please enter a valid Wikipedia URL');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Coming Soon',
        'Wikipedia scraping functionality will be added in a future update. For now, please use the desktop version to scrape data, then copy the images folder to your phone.'
      );
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Add Items from Wikipedia</Text>
        <Text style={styles.description}>
          Enter a Wikipedia category URL to scrape images and names
        </Text>

        <TextInput
          style={styles.input}
          placeholder="https://en.wikipedia.org/wiki/Category:..."
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleScrape}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🌐 Scrape Wikipedia</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📝 How to use:</Text>
          <Text style={styles.infoText}>
            1. Find a Wikipedia category page{'\n'}
            2. Copy the URL{'\n'}
            3. Paste it here{'\n'}
            4. Tap "Scrape Wikipedia"{'\n'}
            5. Wait for images to download
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Note: This feature requires internet connection and may take some time depending on the number of items.
          </Text>
        </View>
      </View>
    </View>
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
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
  },
});
