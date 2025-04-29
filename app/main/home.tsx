import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/tabs/result')}>
        <Text style={styles.heading}>Results</Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push('/tabs/chat')}>
          <Text style={styles.tabText}>AI Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/tabs/bookmarks')}>
          <Text style={styles.tabText}>Bookmarks</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/tabs/profile')}>
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#C2BAA6',
  },
  tabText: { fontSize: 16, color: '#333' },
});
