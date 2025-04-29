import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { useEffect, useState } from 'react';

export default function IndexScreen() {
  const router = useRouter();

  const buttonOpacity = useSharedValue(0); 
  const [loading, setLoading] = useState(false);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      buttonOpacity.value = withTiming(1, { duration: 800 });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    setLoading(true);

    setTimeout(() => {
      router.push('/main/choice');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.centered}>

      <Image
          source={require('../assets/images/pan.gif')}
          style={styles.gif}
        />


        <Text style={styles.splashText}>🍴 🥐 SmartPantryMuse 🥑 </Text>

        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          {loading ? (
            <ActivityIndicator size="large" color="#F1C27B" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
              <Text style={styles.buttonText}>Get Started 🍯</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5ec',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: 140, 
    height: 120,
    marginBottom: 10,
  },
  splashText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#564a45',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#564a45',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
