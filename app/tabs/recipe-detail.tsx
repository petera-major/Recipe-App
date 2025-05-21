import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';

export const screenOptions = {
  tabBarStyle: { display: 'none' },
  headerShown: true,
  title: 'Recipe Details',
};

export default function RecipeDetail() {
  const { recipe } = useLocalSearchParams();
  const base = typeof recipe === 'string' ? JSON.parse(recipe) : {};
  const [details, setDetails] = useState<any>(null);

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
          <Text key={index} style={styles.text}>
            {index + 1}. {step.step}
          </Text>
        ))
      ) : (
        <Text style={styles.text}>No instructions provided.</Text>
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
});

