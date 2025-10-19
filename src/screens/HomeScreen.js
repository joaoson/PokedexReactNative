import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePokemonController } from '../controllers/usePokemonController';
import styles from '../styles/styles';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  
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

  useEffect(() => {
    if (loading && pokemons.length === 0) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [loading, pokemons.length]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const detailSpinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (loadingDetail) {
      Animated.loop(
        Animated.timing(detailSpinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      detailSpinValue.setValue(0);
    }
  }, [loadingDetail]);

  const detailSpin = detailSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
      if (result.error === 'not_found') {
        Alert.alert('Pokémon não encontrado', 'Verifique o nome ou número digitado e tente novamente.');
      } else if (result.error === 'network') {
        Alert.alert('Sem conexão', 'Verifique sua conexão com a internet e tente novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível buscar o Pokémon. Tente novamente mais tarde.');
      }
    }
  };

  const handlePokemonPress = async (pokemon) => {
    setLoadingDetail(true);
    
    const result = await fetchPokemonDetail(pokemon);
    
    setLoadingDetail(false);
    
    if (result.success) {
      navigation.navigate('Details', { pokemon: result.data });
    } else {
      if (result.error === 'network') {
        Alert.alert('Sem conexão', 'Verifique sua conexão com a internet e tente novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do Pokémon.');
      }
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
          <Animated.Image
            source={require('../../assets/pokeball.png')}
            style={[styles.pokeballSpinner, { transform: [{ rotate: spin }] }]}
            resizeMode="contain"
          />
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
          <View style={styles.loadingContent}>
            <Animated.Image
              source={require('../../assets/greatball.png')}
              style={[styles.pokeballSpinnerLarge, { transform: [{ rotate: detailSpin }] }]}
              resizeMode="contain"
            />
            <Text style={styles.loadingText}>Carregando detalhes...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;