import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, TextInput } from 'react-native';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/firebase';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ProfileScreen() {
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [goal, setGoal] = useState('');
  const [randomRecipe, setRandomRecipe] = useState<any | null>(null);
  const [groceryList, setGroceryList] = useState<string[]>(["Spinach", "Tomatoes", "Olive Oil"]);
  const [moodRecipes, setMoodRecipes] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const router = useRouter();

  useEffect(() => {
    const redirectAfterLogin = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const hasRedirected = await AsyncStorage.getItem('redirectedAfterLogin');
    if (!hasRedirected) {
      await AsyncStorage.setItem('redirectedAfterLogin', 'true');
      router.replace('/main/choice');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      const bookmarks = data?.bookmarks || [];
      setBookmarkCount(bookmarks.length);
      setGoal(data?.goal || '');
    });

    return () => unsubscribe();
    };

    redirectAfterLogin();
  }, []);

  const goalLabels: Record<string, string> = {
    'high-protein': 'Weight Gain',
    'low FODMAP': 'Weight Loss',
    'vegan': 'Vegan',
    'vegetarian': 'Vegetarian',
    'ketogenic': 'Keto',
    'maxCalories=900': 'Better Relationship with Food',
  };

  const moods = [
    { label: 'Lazy 😴', tag: 'easy' },
    { label: 'Date Night 🍷', tag: 'romantic' },
    { label: 'Comfort Food 🍲', tag: 'comfort food' },
    { label: 'Gym Prep 🏋️', tag: 'high-protein' },
    { label: 'Sweet Tooth 🍫', tag: 'dessert' },
  ];  
  
  const handleMoodSelect = async (tag: string) => {
    try {
      const url =`https://api.spoonacular.com/recipes/random?number=3&apiKey=dc49b262797d47e190b6feada3a13494`;
  
      const res = await fetch(url);
      const data = await res.json();
      const recipes = data.recipes || [];
  
      if (recipes.length > 0) {
        setMoodRecipes(recipes); 
      } else {
        Alert.alert('Oops!', 'No recipes found for that mood.');
      }
    } catch (err) {
      console.error('Mood recipe error:', err);
      Alert.alert('Oops!', 'Something went wrong.');
    }
  };
    

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (err) {
      Alert.alert('Logout failed', 'Please try again.');
    }
  };

  const handleChangeGoal = () => {
    router.push('/main/choice');
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
  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      setGroceryList(prev => [...prev, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setGroceryList(prev => prev.filter((_, index) => index !== indexToRemove));
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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert("Error", "No user logged in.");
                return;
              }
  
              await deleteDoc(doc(db, "users", user.uid));
  
              await user.delete();
  
              Alert.alert("Account Deleted", "Your account has been successfully deleted.");
              router.replace('/');
            } catch (error: any) {
              console.error("Error deleting account:", error);
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  "Re-authentication Required",
                  "For security, please log out and log back in to delete your account."
                );
              } else {
                Alert.alert("Error", "There was a problem deleting your account.");
              }
            }
          },
        },
      ]
    );
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Welcome, {user?.email?.split('@')[0] || 'Friend'} </Text>
      <Text style={styles.goal}> Your goal: <Text style={styles.goalValue}>{goalLabels[goal] || 'Not set yet'}</Text> </Text>


      <TouchableOpacity style={styles.changeGoalButton} onPress={handleChangeGoal}>
        <Text style={styles.changeGoalText}>🔄 Change Your Goal</Text>
      </TouchableOpacity>

      <Text style={styles.quote}>“You don’t have to eat less just eat right.” 🥗🍓🥑</Text>

      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => router.push('/tabs/bookmarks')}
      >
        <Text style={styles.bookmarkText}>View {bookmarkCount} Saved Recipe{bookmarkCount === 1 ? '' : 's'} ❤️</Text>
      </TouchableOpacity>

      <View style={styles.groceryListBox}>
        <Text style={styles.groceryTitle}>🛒 Grocery List</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add item..."
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={handleAddItem}
          />
          <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {groceryList.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => handleRemoveItem(index)}>
            <Text style={styles.groceryItem}>• {item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ width: '100%', marginBottom: 20 }}>
  <Text style={{
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#4E342E',
    textAlign: 'center',
  }}>
    How are you feeling today? 🧠
  </Text>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 8 }}
  >
    {moods.map((mood) => (
      <TouchableOpacity
        key={mood.tag}
        style={{
          backgroundColor: '#FFE8D6',
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: 24,
          marginRight: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
        onPress={() => handleMoodSelect(mood.tag)}
      >
        <Text style={{
          fontSize: 15,
          fontWeight: '600',
          color: '#5E4637',
        }}>
          {mood.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>

  {moodRecipes.length > 0 && (
    <View style={{ width: '100%', marginTop: 24 }}>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#4E342E',
        textAlign: 'center'
      }}>
        💡 Recipes for your mood:
      </Text>

      {moodRecipes.map((recipe, index) => (
        <View key={index} style={{
          backgroundColor: '#FFF3EC',
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}>
          <Image
            source={{ uri: recipe.image }}
            style={{ width: 250, height: 150, borderRadius: 10, marginBottom: 10 }}
            resizeMode="cover"
          />
          <Text style={{
            fontWeight: '600',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 10,
            color: '#4E342E',
          }}>
            {recipe.title}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#F1C27B',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
            }}
            onPress={() =>
              router.push({
                pathname: '/tabs/recipe-detail',
                params: { recipe: JSON.stringify(recipe) },
              })
            }
          >
            <Text style={{ color: '#fff', fontWeight: '500' }}>👀 View Full Recipe</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => setMoodRecipes([])}
        style={{
          alignSelf: 'center',
          marginTop: 6,
          padding: 10,
          backgroundColor: '#D9534F',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '500' }}>❌ Clear Mood Results</Text>
      </TouchableOpacity>
    </View>
  )}
</View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDeleteAccount}
        style={{
          backgroundColor: '#FFCDD2',
          padding: 14,
          borderRadius: 10,
          marginTop: 12,
          width: '100%',
          alignItems: 'center',
        }}>
        <Text style={{ color: '#B71C1C', fontWeight: 'bold' }}>Delete My Account</Text>
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
  changeGoalButton: {
    marginBottom: 14,
  },
  changeGoalText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
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
  groceryListBox: {
    width: '100%',
    backgroundColor: '#FFF3EC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  groceryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4E342E',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#F1C27B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  groceryItem: {
    fontSize: 14,
    color: '#555',
    paddingVertical: 2,
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
