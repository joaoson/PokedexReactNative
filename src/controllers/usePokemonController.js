// usePokemonController.js
import { useState, useCallback } from 'react';
import { 
  fetchPokemonList, 
  fetchPokemonDetails,
  searchPokemon 
} from '../services/pokemonService';

export const usePokemonController = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);

  // Load initial or next page of Pokemon
  const loadPokemons = useCallback(async (resetList = false) => {
    try {
      console.log('[Controller] Loading pokemons...');
      setLoading(true);
      setError(null);

      const currentOffset = resetList ? 0 : offset;
      
      // Only fetch the list (no details)
      const listData = await fetchPokemonList(20, currentOffset);
      
      // Store basic info with extracted ID from URL
      const basicPokemons = listData.results.map((pokemon, index) => ({
        name: pokemon.name,
        url: pokemon.url,
        id: currentOffset + index + 1, // Extract ID from position
      }));
      
      if (resetList) {
        setPokemons(basicPokemons);
        setOffset(20);
      } else {
        setPokemons(prev => [...prev, ...basicPokemons]);
        setOffset(prev => prev + 20);
      }
      
      console.log('[Controller] Successfully loaded pokemons');
      return { success: true };
    } catch (err) {
      console.error('[Controller] Error loading pokemons:', err);
      setError('Erro ao carregar Pokémon. Verifique sua conexão.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [offset]);

  // Fetch details for a single Pokemon when needed
  const fetchPokemonDetail = useCallback(async (pokemon) => {
    try {
      console.log('[Controller] Fetching details for:', pokemon.name);
      const details = await fetchPokemonDetails(pokemon.url);
      console.log('[Controller] Details fetched successfully');
      return { success: true, data: details };
    } catch (err) {
      console.error('[Controller] Error fetching pokemon details:', err);
      return { success: false, error: err };
    }
  }, []);

  // Search for a specific Pokemon
  const searchForPokemon = useCallback(async (query) => {
    try {
      console.log('[Controller] Searching for pokemon:', query);
      setLoading(true);
      setError(null);

      const pokemon = await searchPokemon(query);
      
      console.log('[Controller] Pokemon found:', pokemon.name);
      return { success: true, data: pokemon };
    } catch (err) {
      console.error('[Controller] Error searching pokemon:', err);
      
      if (err.message === 'Pokemon not found') {
        return { success: false, error: 'Pokemon not found' };
      }
      
      return { success: false, error: 'Erro ao buscar Pokémon' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset the list
  const resetPokemons = useCallback(() => {
    console.log('[Controller] Resetting pokemon list');
    setPokemons([]);
    setOffset(0);
    setError(null);
  }, []);

  return {
    pokemons,
    loading,
    error,
    loadPokemons,
    searchForPokemon,
    resetPokemons,
    fetchPokemonDetail,
  };
};