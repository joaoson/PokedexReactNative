import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NetworkTest = () => {
  const [status, setStatus] = useState('Not tested');
  const [details, setDetails] = useState('');

  const runTest = async () => {
    setStatus('Testing...');
    setDetails('');

    try {
      console.log('=== NETWORK TEST START ===');
      
      // Test 1: Simple fetch
      console.log('Test 1: Basic fetch');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://pokeapi.co/api/v2/pokemon/1', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Data received:', data.name);
      
      setStatus('✅ SUCCESS');
      setDetails(`Connected! Got pokemon: ${data.name}`);
      console.log('=== NETWORK TEST SUCCESS ===');
      
    } catch (error) {
      console.error('=== NETWORK TEST FAILED ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      setStatus('❌ FAILED');
      
      if (error.name === 'AbortError') {
        setDetails('Request timeout (5s) - Check internet connection');
      } else if (error.message.includes('Network request failed')) {
        setDetails('Network request failed - Check permissions & internet');
      } else {
        setDetails(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Diagnostics</Text>
      <Text style={styles.status}>Status: {status}</Text>
      {details ? <Text style={styles.details}>{details}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={runTest}>
        <Text style={styles.buttonText}>Run Test Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#DC0A2D',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NetworkTest;