import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ProfileScreen() {
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [goal, setGoal] = useState('');
  const [randomRecipe, setRandomRecipe] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      const bookmarks = data?.bookmarks || [];
      setBookmarkCount(bookmarks.length);
      setGoal(data?.goal || '');
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (err) {
      Alert.alert('Logout failed', 'Please try again.');
    }
  };

  const handleRoulette = async () => {
    try {
      const res = await fetch(
        'https://api.spoonacular.com/recipes/random?number=1&apiKey=dc49b262797d47e190b6feada3a13494'
      );
      const data = await res.json();
      setRandomRecipe(data.recipes[0]);
    } catch (error) {
      console.error('Error fetching random recipe:', error);
    }
  };

  const user = auth.currentUser;

  if (!auth.currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>You're not logged in 😢</Text>
        <Text style={styles.quote}>Create a free account to set your goals and save your favorite recipes! 🥗🍷🍞</Text>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => router.push('/singup')}
        >
          <Text style={styles.bookmarkText}>Sign Up / Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Welcome, {user?.email?.split('@')[0] || 'Friend'} 👋</Text>
      <Text style={styles.goal}>Your goal: <Text style={styles.goalValue}>{goal || 'Not set yet'}</Text></Text>
      <Text style={styles.quote}>“You don’t have to eat less just eat right.” 🥗🍓🥑</Text>

      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => router.push('/tabs/bookmarks')}
      >
        <Text style={styles.bookmarkText}>View {bookmarkCount} Saved Recipe{bookmarkCount === 1 ? '' : 's'} ❤️</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.rouletteCard}>
        <Text style={styles.rouletteTitle}>🎲 Recipe Roulette</Text>
        <TouchableOpacity style={styles.rouletteButton} onPress={handleRoulette}>
          <Text style={styles.rouletteText}>Surprise Me!</Text>
        </TouchableOpacity>
        {randomRecipe && (
          <Animated.View entering={FadeIn.duration(600).delay(150)} style={styles.recipePreview}>
            <Image source={{ uri: randomRecipe.image }} style={styles.previewImage} />
            <Text style={styles.previewTitle}>{randomRecipe.title}</Text>
            <TouchableOpacity
              style={styles.goButton}
              onPress={() =>
                router.push({
                  pathname: '/tabs/recipe-detail',
                  params: { recipe: JSON.stringify(randomRecipe) },
                })
              }
            >
              <Text style={styles.goButtonText}>🎯 Cook This!</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heading: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: '#564a45',
  },
  goal: {
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
    marginBottom: 16,
  },
  goalValue: {
    fontWeight: 'bold',
    color: '#F1C27B',
  },
  quote: {
    fontStyle: 'italic',
    fontSize: 16,
    textAlign: 'center',
    color: '#4E342E',
    marginBottom: 30,
  },
  bookmarkButton: {
    backgroundColor: '#FFD9C0',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%'
  },
  bookmarkText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    alignItems: 'center',
    marginBottom: 24
  },
  logoutText: {
    color: '#D9534F',
    fontSize: 16,
  },
  rouletteCard: {
    backgroundColor: '#FFF8F0',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  rouletteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  rouletteButton: {
    backgroundColor: '#F1C27B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  rouletteText: {
    color: '#4E342E',
    fontWeight: 'bold',
  },
  recipePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewTitle: {
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  goButton: {
    backgroundColor: '#D7EFD2',
    padding: 10,
    borderRadius: 6,
  },
  goButtonText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
});
