import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { importImagesFromFolder } from '../utils/database';

export default function SettingsScreen({ db }) {
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = () => {
    Alert.alert('Export Data', 'Export functionality coming soon!');
  };

  const handleImportData = async () => {
    try {
      // Show instructions
      Alert.alert(
        'Import Images',
        'Select a folder containing category subdirectories with images.\n\nExample structure:\nDownloads/memTrain/\n  ├── Polish_male_film_actors/\n  │   ├── image_001.jpg\n  │   └── ...\n  └── Actors_250/\n      ├── image_001.jpg\n      └── ...',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Select Folder', onPress: selectAndImportFolder }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const selectAndImportFolder = async () => {
    try {
      setIsImporting(true);
      
      // Pick a directory
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
      });
      
      if (result.canceled) {
        setIsImporting(false);
        return;
      }
      
      // Get the folder URI from the selected file
      // User needs to select any file in the folder, we'll use its parent directory
      const fileUri = result.assets[0].uri;
      const folderUri = fileUri.substring(0, fileUri.lastIndexOf('/'));
      
      console.log('Selected folder:', folderUri);
      
      // Import images from the folder
      const importResult = await importImagesFromFolder(db, folderUri);
      
      setIsImporting(false);
      
      // Show results
      let message = `✅ Imported: ${importResult.imported}\n`;
      message += `⏭️ Skipped: ${importResult.skipped}\n`;
      if (importResult.failed > 0) {
        message += `❌ Failed: ${importResult.failed}\n`;
      }
      if (importResult.errors) {
        message += `\nErrors:\n${importResult.errors.slice(0, 3).join('\n')}`;
        if (importResult.errors.length > 3) {
          message += `\n... and ${importResult.errors.length - 3} more`;
        }
      }
      
      Alert.alert('Import Complete', message);
      
    } catch (error) {
      setIsImporting(false);
      console.error('Import error:', error);
      Alert.alert('Import Failed', error.message);
    }
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

        <TouchableOpacity
          style={[styles.button, isImporting && styles.disabledButton]}
          onPress={handleImportData}
          disabled={isImporting}
        >
          {isImporting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={[styles.buttonText, styles.loadingText]}>Importing...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>📥 Import Images from Folder</Text>
          )}
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
