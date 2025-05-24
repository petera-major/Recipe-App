import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Animated } from 'react-native';
import { useEffect, useState } from 'react';
import {CheckBox} from 'react-native-elements';


export const screenOptions = {
  tabBarStyle: { display: 'none' },
  headerShown: true,
  title: 'Recipe Details',
};

export default function RecipeDetail() {
  const { recipe } = useLocalSearchParams();
  const base = typeof recipe === 'string' ? JSON.parse(recipe) : {};
  const [details, setDetails] = useState<any>(null);

  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [showBadge, setShowBadge] = useState(false);
  const badgeOpacity = useState(new Animated.Value(0))[0];


  useEffect(() => {
    if (!base.id) return;

    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `https://api.spoonacular.com/recipes/${base.id}/information?apiKey=dc49b262797d47e190b6feada3a13494`
        );
        const data = await res.json();
        setDetails(data);
      } catch (error) {
        console.error('Error fetching full recipe info:', error);
      }
    };

    fetchDetails();
  }, [base.id]);

  if (!details) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F1C27B" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: details.image }} style={styles.image} />
      <Text style={styles.title}>{details.title}</Text>
      <Text style={styles.meta}>⏱ {details.readyInMinutes} min • 🍽 {details.servings} servings</Text>

      <Text style={styles.section}>Ingredients</Text>
      {details.extendedIngredients?.map((ing: any, index: number) => (
        <Text key={index} style={styles.text}>• {ing.original}</Text>
      ))}

      <Text style={styles.section}>Instructions</Text>
      {details.analyzedInstructions?.[0]?.steps?.length > 0 ? (
        details.analyzedInstructions[0].steps.map((step: any, index: number) => (
          <CheckBox
            key={index}
            title={`${index + 1}. ${step.step}`}
            checked={checkedSteps.includes(index)}
            onPress={() => {
              setCheckedSteps(prev => {
                const updated = prev.includes(index)
                  ? prev.filter(i => i !== index)
                  : [...prev, index];

                if (updated.length === details.analyzedInstructions[0].steps.length) {
                  setShowBadge(true);
                  Animated.timing(badgeOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                  }).start();
                } else {
                  setShowBadge(false);
                  badgeOpacity.setValue(0);
                }

                return updated;
              });
            }}
            containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
            textStyle={{ fontSize: 14, color: '#444', lineHeight: 20 }}
            checkedColor="#F1C27B"
          />
        ))
      ) : (
        <Text style={styles.text}>No instructions provided.</Text>
      )}
      
      {showBadge && (
        <Animated.View style={[styles.badge, { opacity: badgeOpacity }]}>
          <Text style={styles.badgeText}>🎉 Finished Cooking!</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}  

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, backgroundColor: '#fff' },
  image: {
    width: '100%',
    height: 260,
    borderRadius: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#4E342E',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    marginBottom: 6,
  },
  badge: {
    marginTop: 20,
    backgroundColor: '#DFF5E1',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#388E3C',
  },
});

