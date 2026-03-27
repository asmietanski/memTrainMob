import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function SettingsScreen({ db }) {
  const handleExportData = () => {
    Alert.alert('Export Data', 'Export functionality coming soon!');
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'Import functionality coming soon!');
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'Are you sure? This will delete all your progress!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          Alert.alert('Info', 'Reset functionality coming soon!');
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonText}>📤 Export Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleImportData}>
          <Text style={styles.buttonText}>📥 Import Data</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={handleResetDatabase}
        >
          <Text style={[styles.buttonText, styles.dangerText]}>🗑️ Reset Database</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.infoText}>memTrain Mobile v1.0</Text>
        <Text style={styles.infoText}>Spaced Repetition System</Text>
        <Text style={styles.infoText}>Based on SuperMemo SM-2</Text>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  dangerText: {
    color: '#fff',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
