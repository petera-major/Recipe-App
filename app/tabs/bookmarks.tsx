import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadBookmarks = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        const data = snapshot.exists() ? snapshot.data().bookmarks || [] : [];
        setBookmarks(data);
      } catch (err) {
        console.error('Failed to load bookmarks from Firestore:', err);
      }
    };

    loadBookmarks();
  }, []);

  if (!auth.currentUser) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Please log in to view your saved recipes.</Text>
        <TouchableOpacity onPress={() => router.push('/singup')} style={styles.loginButton}>
          <Text style={styles.loginText}>Go to Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>You haven’t saved any recipes yet. Add some 📲 </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookmarks}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/tabs/recipe-detail',
                params: { recipe: JSON.stringify(item) },
              })
            }
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
      
          <TouchableOpacity
            onPress={async () => {
              const user = auth.currentUser;
              if (!user) return;
      
              try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                  bookmarks: arrayRemove(item)
                });
      
                setBookmarks((prev) => prev.filter((r) => r.id !== item.id));
              } catch (err) {
                console.error('Failed to remove bookmark:', err);
              }
            }}
            style={styles.removeIcon}
          >
            <Ionicons name="heart" size={22} color="#D9534F" />
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  title: {
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: '#F1C27B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  removeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
  },
  
});
