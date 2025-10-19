const BASE_URL = 'https://pokeapi.co/api/v2';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - check your internet connection');
    }
    throw error;
  }
};

export const fetchPokemonList = async (limit = 20, offset = 0) => {
  try {
    console.log(`[Service] Fetching pokemon list - limit: ${limit}, offset: ${offset}`);
    const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    console.log('[Service] URL:', url);

    await delay(3000); 

    const response = await fetchWithTimeout(url);
    console.log('[Service] Response received, status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Service] Pokemon list received:', data.results.length, 'items');
    return data;
  } catch (error) {
    console.error('[Service] Error fetching pokemon list:', error);
    throw error;
  }
};

export const fetchPokemonDetails = async (urlOrId) => {
  try {
    const url = typeof urlOrId === 'string' && urlOrId.startsWith('http') 
      ? urlOrId 
      : `${BASE_URL}/pokemon/${urlOrId}`;

    console.log(`[Service] Fetching pokemon details from: ${url}`);

    await delay(3000); 

    const response = await fetchWithTimeout(url);
    console.log('[Service] Details response received, status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Service] Pokemon details received: ${data.name}`);
    return data;
  } catch (error) {
    console.error('[Service] Error fetching pokemon details:', error);
    throw error;
  }
};

export const fetchMultiplePokemonDetails = async (pokemonList) => {
  try {
    console.log(`[Service] Fetching details for ${pokemonList.length} pokemon`);

    await delay(3000); 

    const promises = pokemonList.map(pokemon => fetchPokemonDetails(pokemon.url));
    const results = await Promise.all(promises);

    console.log(`[Service] Successfully fetched ${results.length} pokemon details`);
    return results;
  } catch (error) {
    console.error('[Service] Error fetching multiple pokemon details:', error);
    throw error;
  }
};

export const searchPokemon = async (query) => {
  try {
    console.log(`[Service] Searching for pokemon: ${query}`);
    const url = `${BASE_URL}/pokemon/${query.toLowerCase()}`;
    console.log('[Service] Search URL:', url);

    await delay(3000); 

    const response = await fetchWithTimeout(url);
    console.log('[Service] Search response received, status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Pokemon not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Service] Found pokemon: ${data.name}`);
    return data;
  } catch (error) {
    console.error('[Service] Error searching pokemon:', error);
    throw error;
  }
};
