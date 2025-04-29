import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ProfileScreen() {
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [goal, setGoal] = useState('');
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
      router.replace('/login');
    } catch (err) {
      Alert.alert('Logout failed', 'Please try again.');
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
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome, {user?.email?.split('@')[0] || 'Friend'} 👋</Text>
      <Text style={styles.goal}>Your goal: <Text style={styles.goalValue}>{goal || 'Not set yet'}</Text></Text>

      <Text style={styles.quote}>
        “You don’t have to eat less just eat right.” 🥗🍓🥑
      </Text>

      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => router.push('/tabs/bookmarks')}
      >
        <Text style={styles.bookmarkText}>View {bookmarkCount} Saved Recipe{bookmarkCount === 1 ? '' : 's'} ❤️</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
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
  },
  bookmarkText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    alignItems: 'center',
  },
  logoutText: {
    color: '#D9534F',
    fontSize: 16,
  },
});
