import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../contexts/FavoritesContext';
import styles from '../styles/styles';

const FavoritesScreen = ({ navigation }) => {
  const { favorites, clearFavorites } = useFavorites();

  const handleClearFavorites = () => {
    Alert.alert(
      'Limpar Favoritos',
      'Tem certeza que deseja remover todos os Pokémon favoritos?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: clearFavorites
        }
      ]
    );
  };

  const renderFavorite = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => navigation.navigate('Details', { pokemon: item })}
    >
      <Image
        source={{ uri: item.sprites.front_default }}
        style={styles.favoriteImage}
      />
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>
          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
        </Text>
        <Text style={styles.favoriteNumber}>#{item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {favorites.length > 0 && (
        <View style={styles.clearButtonContainer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearFavorites}
          >
            <Text style={styles.clearButtonText}>Limpar Todos</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>⭐</Text>
          <Text style={styles.emptySubtext}>
            Você ainda não tem Pokémon favoritos
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.favoritesListContainer}
        />
      )}
    </SafeAreaView>
  );
};

export default FavoritesScreen;