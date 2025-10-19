# PokedexReactNative

Uma aplicação móvel desenvolvida com **Expo** e **React Native** que permite explorar, buscar e favoritar Pokémon utilizando a [PokéAPI](https://pokeapi.co/).

Demonstração [IOS](https://www.youtube.com/watch?v=Kx01v5fhH8Y)

## 📱 Funcionalidades

### ✅ RF01 - Tela Principal (Pokédex)
Exibe uma lista de Pokémon em formato de grade com scroll infinito.

**Implementação:**
```javascript
// HomeScreen.js - Renderização da lista em grade
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
```

**Funcionalidades:**
- ✅ Grid de 2 colunas com imagem e nome
- ✅ Botão "Carregar Mais" para paginação
- ✅ Consumo da PokéAPI para buscar lista inicial

---

### ✅ RF02 - Navegação para Detalhes
Navegação implementada com **React Navigation** entre as telas.

**Implementação:**
```javascript
// HomeScreen.js - Navegação ao tocar em um Pokémon
const handlePokemonPress = async (pokemon) => {
  setLoadingDetail(true);
  
  const result = await fetchPokemonDetail(pokemon);
  
  setLoadingDetail(false);
  
  if (result.success) {
    navigation.navigate('Details', { pokemon: result.data });
  }
};

const renderPokemon = ({ item }) => (
  <TouchableOpacity
    style={styles.pokemonCard}
    onPress={() => handlePokemonPress(item)}
    disabled={loadingDetail}
  >
    <Image source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png` }} 
           style={styles.pokemonImage} />
    <Text style={styles.pokemonName}>
      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
    </Text>
    <Text style={styles.pokemonNumber}>#{item.id}</Text>
  </TouchableOpacity>
);
```

---

### ✅ RF03 - Tela de Detalhes do Pokémon
Exibe informações completas do Pokémon selecionado.

**Implementação:**
```javascript
// DetailsScreen.js - Carregamento e exibição de detalhes
const loadPokemonDetails = async () => {
  try {
    setLoading(true);
    const data = await fetchPokemonDetails(initialPokemon.id);
    setPokemon(data);
  } catch (err) {
    Alert.alert('Erro', 'Não foi possível carregar os detalhes');
  } finally {
    setLoading(false);
  }
};

// Exibição de tipos
<View style={styles.typesContainer}>
  {pokemon.types?.map((type) => (
    <View key={type.type.name} 
          style={[styles.typeBadge, { backgroundColor: getTypeColor(type.type.name) }]}>
      <Text style={styles.typeText}>{type.type.name.toUpperCase()}</Text>
    </View>
  ))}
</View>

// Exibição de estatísticas
{pokemon.stats && (
  <View style={styles.statsContainer}>
    <Text style={styles.sectionTitle}>Estatísticas</Text>
    {pokemon.stats.map((stat) => (
      <View key={stat.stat.name} style={styles.statRow}>
        <Text style={styles.statName}>
          {stat.stat.name.replace('-', ' ').toUpperCase()}
        </Text>
        <View style={styles.statBarContainer}>
          <View style={[styles.statBar, { width: `${(stat.base_stat / 255) * 100}%` }]} />
        </View>
        <Text style={styles.statValue}>{stat.base_stat}</Text>
      </View>
    ))}
  </View>
)}
```

**Informações exibidas:**
- ✅ Imagem em alta qualidade (official artwork)
- ✅ Nome e número da Pokédex
- ✅ Tipos do Pokémon (com cores personalizadas)
- ✅ Estatísticas com barras de progresso
- ✅ Habilidades

---

### ✅ RF04 - Gerenciamento de Estado (Context API)
Sistema de favoritos implementado com **Context API**.

**Implementação:**
```javascript
// FavoritesContext.js - Criação do contexto
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (pokemon) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.id === pokemon.id);
      if (exists) {
        return prev.filter(p => p.id !== pokemon.id);
      }
      return [...prev, pokemon];
    });
  };

  const isFavorite = (pokemonId) => {
    return favorites.some(p => p.id === pokemonId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// DetailsScreen.js - Uso do contexto
const { toggleFavorite, isFavorite } = useFavorites();
const favorite = isFavorite(pokemon.id);

<TouchableOpacity
  style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}
  onPress={() => toggleFavorite(pokemon)}
>
  <Text style={[styles.favoriteButtonText, favorite && styles.favoriteButtonTextActive]}>
    {favorite ? '⭐ Favoritado' : '☆ Favoritar'}
  </Text>
</TouchableOpacity>
```

---

### ✅ RF05 - Tela de Favoritos
Lista todos os Pokémon marcados como favoritos.

**Implementação:**
```javascript
// FavoritesScreen.js - Exibição dos favoritos
const { favorites, clearFavorites } = useFavorites();

const renderFavorite = ({ item }) => (
  <TouchableOpacity
    style={styles.favoriteCard}
    onPress={() => navigation.navigate('Details', { pokemon: item })}
  >
    <Image source={{ uri: item.sprites.front_default }} style={styles.favoriteImage} />
    <View style={styles.favoriteInfo}>
      <Text style={styles.favoriteName}>
        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
      </Text>
      <Text style={styles.favoriteNumber}>#{item.id}</Text>
    </View>
  </TouchableOpacity>
);

// HomeScreen.js - Botão flutuante para acessar favoritos
<TouchableOpacity
  style={styles.floatingButton}
  onPress={() => navigation.navigate('Favorites')}
  activeOpacity={0.8}
>
  <Text style={styles.floatingButtonText}>❤️</Text>
</TouchableOpacity>
```

**Funcionalidades:**
- ✅ Listagem de todos os favoritos
- ✅ Botão para limpar todos os favoritos
- ✅ Navegação para detalhes ao tocar
- ✅ Atualização em tempo real

---

### ✅ RF06 - Funcionalidade de Busca
Sistema de busca por nome ou número do Pokémon.

**Implementação:**
```javascript
// HomeScreen.js - Busca de Pokémon
const [searchQuery, setSearchQuery] = useState('');

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
    }
  }
};

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
```

---

### ✅ RF07 - Feedback de UI
Indicadores visuais de carregamento e tratamento de erros.

**Implementação:**
```javascript
// HomeScreen.js - Loading animado com Pokébola
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
  <FlatList ... />
)}

// Overlay de loading ao navegar para detalhes
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

// Tratamento de erros
{error && (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
      <Text style={styles.retryButtonText}>Tentar Novamente</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## 🛠️ Tecnologias Utilizadas

- **Expo** - Framework para desenvolvimento React Native
- **React Native** - Framework mobile
- **React Navigation** - Navegação entre telas
- **Context API** - Gerenciamento de estado global
- **PokéAPI** - API REST para dados dos Pokémon
- **Safe Area Context** - Gerenciamento de áreas seguras

## 📂 Estrutura do Projeto

```
├── src/
│   ├── contexts/
│   │   └── FavoritesContext.js      # Gerenciamento de favoritos
│   ├── controllers/
│   │   └── usePokemonController.js  # Lógica de negócio
│   ├── services/
│   │   └── pokemonService.js        # Requisições à API
│   ├── screens/
│   │   ├── HomeScreen.js            # Tela principal
│   │   ├── DetailsScreen.js         # Detalhes do Pokémon
│   │   └── FavoritesScreen.js       # Lista de favoritos
│   ├── navigation/
│   │   └── AppNavigator.js          # Configuração de rotas
│   ├── styles/
│   │   └── styles.js                # Estilos globais
│   └── utils/
│       └── typeColors.js            # Cores dos tipos
├── assets/
│   ├── pokeball.png                 # Loading animation
│   └── greatball.png                # Detail loading
└── App.js                           # Componente raiz
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Expo CLI
- Expo Go (app móvel) ou emulador

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Navegue até a pasta
cd pokedex-app

# Instale as dependências
npm install
# ou
yarn install

# Inicie o projeto
npx expo start
# ou
yarn start
```

### Executando no dispositivo

1. Instale o app **Expo Go** no seu celular (iOS/Android)
2. Escaneie o QR Code que aparece no terminal
3. Aguarde o carregamento do app

## 🎯 Funcionalidades Principais

- 📜 **Lista infinita** de Pokémon com paginação
- 🔍 **Busca** por nome ou número
- ⭐ **Sistema de favoritos** persistente
- 📊 **Estatísticas detalhadas** com visualização gráfica
- 🎨 **Tipos coloridos** de acordo com o tipo do Pokémon
- 🔄 **Animações** de loading personalizadas
- ⚡ **Feedback visual** em todas as ações
- 📱 **Interface responsiva** e intuitiva

## 🌐 API Utilizada

Este projeto consome a [PokéAPI](https://pokeapi.co/), uma API RESTful gratuita que fornece dados completos sobre Pokémon.

Endpoints utilizados:
- `GET /pokemon?limit={limit}&offset={offset}` - Lista de Pokémon
- `GET /pokemon/{id ou nome}` - Detalhes específicos

## 📝 Observações

- O app inclui um delay artificial de 3 segundos nas requisições para demonstrar os estados de loading
- Console logs são desabilitados em produção
- Timeout de 10 segundos para requisições HTTP
- Tratamento de erros de rede e respostas inválidas

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

---

**Desenvolvido com ❤️ usando Expo e React Native**
