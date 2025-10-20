import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';

const PokemonAudioPlayer = ({ currentRoute }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Hide button on Details screen
  const shouldHideButton = currentRoute === 'Details';

  useEffect(() => {
    if (shouldHideButton) {
      // Fade out and scale down animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Fade in and scale up animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [shouldHideButton]);

  useEffect(() => {
    loadAndPlaySound();

    return () => {
      if (sound) {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
    };
  }, []);

  async function loadAndPlaySound() {
    try {
      console.log('Loading Pokemon Music');
      
      // Set audio mode for better experience
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../assets/pokemon_music.mp3'),
        { 
          shouldPlay: true,
          isLooping: true,
          volume: 0.3, // 30% volume so it's not too loud
        }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      console.log('Playing Pokemon Music');
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  }

  async function togglePlayPause() {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
      pointerEvents={shouldHideButton ? 'none' : 'auto'}
    >
      <TouchableOpacity
        style={styles.musicButton}
        onPress={togglePlayPause}
        activeOpacity={0.7}
      >
        <Text style={styles.musicIcon}>{isPlaying ? '🔊' : '🔇'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    zIndex: 999,
  },
  musicButton: {
    backgroundColor: '#FFCB05',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  musicIcon: {
    fontSize: 24,
  },
});

export default PokemonAudioPlayer;