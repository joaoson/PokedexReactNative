import { useState, useCallback } from 'react';
import { 
  fetchPokemonList, 
  fetchPokemonDetails,
  searchPokemon 
} from '../services/pokemonService';

const isNetworkError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = error.toString().toLowerCase();
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorString.includes('network request failed') ||
    error.name === 'TypeError' ||
    error.name === 'NetworkError'
  );
};

export const usePokemonController = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);

  const loadPokemons = useCallback(async (resetList = false) => {
    try {
      console.log('[Controller] Loading pokemons...');
      setLoading(true);
      setError(null);

      const currentOffset = resetList ? 0 : offset;
      
      const listData = await fetchPokemonList(20, currentOffset);
      
      const basicPokemons = listData.results.map((pokemon, index) => ({
        name: pokemon.name,
        url: pokemon.url,
        id: currentOffset + index + 1, 
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
      
      if (isNetworkError(err)) {
        setError('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
      } else {
        setError('Erro ao carregar Pokémon. Tente novamente mais tarde.');
      }
      
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [offset]);

  const fetchPokemonDetail = useCallback(async (pokemon) => {
    try {
      console.log('[Controller] Fetching details for:', pokemon.name);
      const details = await fetchPokemonDetails(pokemon.url);
      console.log('[Controller] Details fetched successfully');
      return { success: true, data: details };
    } catch (err) {
      console.error('[Controller] Error fetching pokemon details:', err);
      
      if (isNetworkError(err)) {
        return { 
          success: false, 
          error: 'network',
          message: 'Sem conexão com a internet' 
        };
      }
      
      return { 
        success: false, 
        error: 'general',
        message: 'Erro ao carregar detalhes' 
      };
    }
  }, []);

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
        return { 
          success: false, 
          error: 'not_found',
          message: 'Pokemon not found' 
        };
      }
      
      if (isNetworkError(err)) {
        return { 
          success: false, 
          error: 'network',
          message: 'Sem conexão com a internet' 
        };
      }
      
      return { 
        success: false, 
        error: 'general',
        message: 'Erro ao buscar Pokémon' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

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