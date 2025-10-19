// HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePokemonController } from '../controllers/usePokemonController';
import styles from '../styles/styles';
import NetworkTest from '../testing/NetworkTest';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const { 
    pokemons, 
    loading, 
    error, 
    loadPokemons, 
    searchForPokemon, 
    resetPokemons,
    fetchPokemonDetail
  } = usePokemonController();

  useEffect(() => {
    console.log('[HomeScreen] Component mounted');
    loadPokemons(true);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Atenção', 'Digite o nome ou número de um Pokémon');
      return;
    }

    const result = await searchForPokemon(searchQuery);
    
    if (result.success) {
      navigation.navigate('Details', { pokemon: result.data });
      setSearchQuery('');
    } else {
      Alert.alert('Erro', 'Pokémon não encontrado. Verifique o nome ou número.');
    }
  };

  const handlePokemonPress = async (pokemon) => {
    setLoadingDetail(true);
    
    // Fetch details only when clicked
    const result = await fetchPokemonDetail(pokemon);
    
    setLoadingDetail(false);
    
    if (result.success) {
      navigation.navigate('Details', { pokemon: result.data });
    } else {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do Pokémon.');
    }
  };

  const handleLoadMore = () => {
    if (!loading) {
      loadPokemons(false);
    }
  };

  const handleRetry = () => {
    resetPokemons();
    loadPokemons(true);
  };

  const renderPokemon = ({ item }) => (
    <TouchableOpacity
      style={styles.pokemonCard}
      onPress={() => handlePokemonPress(item)}
      disabled={loadingDetail}
    >
      <Image
        source={{ 
          uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png` 
        }}
        style={styles.pokemonImage}
      />
      <Text style={styles.pokemonName}>
        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
      </Text>
      <Text style={styles.pokemonNumber}>#{item.id}</Text>
    </TouchableOpacity>
  );

  return (
  <SafeAreaView style={styles.container} edges={['left', 'right']}>
    <StatusBar barStyle="light-content" backgroundColor="#DC0A2D" />
    
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Nome ou número do Pokémon"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>🔍</Text>
      </TouchableOpacity>
    </View>

    {error && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    )}

    {loading && pokemons.length === 0 ? (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DC0A2D" />
        <Text style={styles.loadingText}>Carregando Pokémon...</Text>
      </View>
    ) : (
      <FlatList
        data={pokemons}
        renderItem={renderPokemon}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          pokemons.length > 0 ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loadMoreText}>Carregar Mais</Text>
              )}
            </TouchableOpacity>
          ) : null
        }
      />
    )}

    {/* Floating Favorites Button */}
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => navigation.navigate('Favorites')}
      activeOpacity={0.8}
    >
      <Text style={styles.floatingButtonText}>❤️</Text>
    </TouchableOpacity>

    {loadingDetail && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#DC0A2D" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    )}
  </SafeAreaView>
);
};

export default HomeScreen;