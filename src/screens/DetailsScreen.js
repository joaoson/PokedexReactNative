import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../contexts/FavoritesContext';
import { fetchPokemonDetails } from '../services/pokemonService';
import { getTypeColor } from '../utils/typeColors';
import styles from '../styles/styles';

const DetailsScreen = ({ route }) => {
  const { pokemon: initialPokemon } = route.params;
  const [pokemon, setPokemon] = useState(initialPokemon);
  const [loading, setLoading] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(pokemon.id);

  useEffect(() => {
    loadPokemonDetails();
  }, []);

  const loadPokemonDetails = async () => {
    try {
      setLoading(true);
      console.log('[DetailsScreen] Loading details for pokemon:', initialPokemon.id);
      
      const data = await fetchPokemonDetails(initialPokemon.id);
      setPokemon(data);
      
      console.log('[DetailsScreen] Details loaded successfully');
    } catch (err) {
      console.error('[DetailsScreen] Error loading details:', err);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pokemon.stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DC0A2D" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <Image
            source={{ 
              uri: pokemon.sprites?.other?.['official-artwork']?.front_default || 
                   pokemon.sprites?.front_default 
            }}
            style={styles.detailsImage}
          />
          <TouchableOpacity
            style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}
            onPress={() => toggleFavorite(pokemon)}
          >
            <Text style={[styles.favoriteButtonText, favorite && styles.favoriteButtonTextActive]}>
              {favorite ? '⭐ Favoritado' : '☆ Favoritar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.detailsName}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>
        <Text style={styles.detailsNumber}>#{pokemon.id}</Text>

        <View style={styles.typesContainer}>
          {pokemon.types?.map((type) => (
            <View
              key={type.type.name}
              style={[
                styles.typeBadge,
                { backgroundColor: getTypeColor(type.type.name) }
              ]}
            >
              <Text style={styles.typeText}>
                {type.type.name.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {pokemon.stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Estatísticas</Text>
            {pokemon.stats.map((stat) => (
              <View key={stat.stat.name} style={styles.statRow}>
                <Text style={styles.statName}>
                  {stat.stat.name.replace('-', ' ').toUpperCase()}
                </Text>
                <View style={styles.statBarContainer}>
                  <View
                    style={[
                      styles.statBar,
                      { width: `${(stat.base_stat / 255) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.statValue}>{stat.base_stat}</Text>
              </View>
            ))}
          </View>
        )}

        {pokemon.abilities && (
          <View style={styles.abilitiesContainer}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            {pokemon.abilities.map((ability, index) => (
              <View key={`${ability.ability.name}-${index}`} style={styles.abilityItem}>
                <Text style={styles.abilityText}>
                  • {ability.ability.name.replace('-', ' ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailsScreen;