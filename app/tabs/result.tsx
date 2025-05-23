import Animated ,{ useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import {View, Text, FlatList, Image, TouchableOpacity, StyleSheet,ActivityIndicator, TextInput, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { auth } from '@/firebase';
import { db } from '@/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function ResultScreen() {
  const { recipes, goal } = useLocalSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fallbackFetched, setFallbackFetched] = useState(false);


  let recipeList: any[] = [];
  if (typeof recipes === 'string') {
    try {
      recipeList = JSON.parse(recipes);
    } catch (error) {
      console.error('Failed to parse recipes:', error);
    }
  }

  useEffect(() => {
    if (!recipes && goal && !fallbackFetched) {
      fetchRecipesByGoal();
    }
  }, [recipes, goal]);

  const fetchRecipesByGoal = async () => {
    setLoading(true);
    try {
      const url = `https://api.spoonacular.com/recipes/complexSearch?diet=${goal}&number=20&addRecipeInformation=true&apiKey=dc49b262797d47e190b6feada3a13494`;
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.results);
      setFallbackFetched(true);
    } catch (err) {
      console.error('Fallback fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    try {
      const url = `https://api.spoonacular.com/recipes/complexSearch?query=${searchTerm}&diet=${goal}&number=20&addRecipeInformation=true&apiKey=dc49b262797d47e190b6feada3a13494`;
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayedRecipes = searchResults ?? recipeList;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search recipes..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        {searchTerm.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchTerm('');
              setSearchResults(null);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F1C27B" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={displayedRecipes}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => <RecipeCard item={item} />}
        />
      )}
    </View>
  );
}

function RecipeCard({ item }: { item: any }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        const data = snapshot.exists() ? snapshot.data().bookmarks || [] : [];
  
        const exists = data.find((r: any) => r.id === item.id);
        setIsBookmarked(!!exists);
      } catch (err) {
        console.error('Failed to check bookmark in Firestore:', err);
      }
    };

    checkBookmark();
  }, []);

  const toggleBookmark = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Login Required', 'Create an account to save recipes.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Up', onPress: () => router.push('/singup') },
      ]);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  const exists = snapshot.exists();
  const data = snapshot.data() || {};

  const alreadySaved = data.bookmarks?.find((r: any) => r.id === item.id);

  if (alreadySaved) {
    await updateDoc(userRef, {
      bookmarks: arrayRemove(item)
    });
    setIsBookmarked(false);
  } else {
    await setDoc(userRef, {
      bookmarks: arrayUnion(item)
    }, { merge: true });
    setIsBookmarked(true);
  }
};
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handleBookmarkPress = async () => {
  scale.value = withSpring(1.3, { damping: 3 });
  setTimeout(() => {
    scale.value = withSpring(1);
  }, 150);

  await toggleBookmark();
};

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/tabs/recipe-detail',
          params: { recipe: JSON.stringify(item) },
        })
      }
    >
      <Image source={{ uri: item.image }} style={[styles.image, { height: 160 }]} />
      <View style={styles.cardFooter}>
    <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
      {item.title}
    </Text>
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={handleBookmarkPress}>
        <Ionicons
          name={isBookmarked ? 'heart' : 'heart-outline'}
          size={20}
          color={isBookmarked ? "#E7A6A1" : "#C5D7B5"}
        />
      </TouchableOpacity>
    </Animated.View>
  </View>
</TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    margin: 12,
    borderRadius: 20,
    backgroundColor: '#f0e9e2',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#F1C27B',
    padding: 10,
    borderRadius: 20,
  },
  clearButton: {
    marginLeft: 6,
    padding: 4,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FDF5EC',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    width: '50%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  title: {
    flex: 1,
    padding: 9,
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    paddingRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FDF5EC'
  },
});
