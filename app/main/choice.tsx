import { useRouter } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import {auth, db} from '@/firebase';
import {doc, setDoc} from 'firebase/firestore';

export default function ChoiceScreen() {

  const [selectedGoal, setSelectedGoal] = useState<{ label: string; apiValue: string } | null>(null);
  const [allergies, setAllergies] = useState('');
    const router = useRouter();

    const handleContinue = async () => {
      try {
        const selectedApiValue = selectedGoal?.apiValue;

        const user = auth.currentUser;
        if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          goal: selectedApiValue,
          allergies: allergies,
        }, { merge: true });
        }

        const response = await fetch('https://recipeapp-backend-production.up.railway.app/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diet: selectedApiValue,
            allergies: allergies,
          }),
        });
        const data = await response.json();        
  
        router.replace({
          pathname: '/tabs/result',
          params: { recipes: JSON.stringify(data.results),
          goal: selectedApiValue,
           },
        });
      } catch (error) {
        console.error('Error fetching recipes:', error);
        console.log('Error', 'Failed to fetch recipes. Please try again.');
      }
    };
  
    const goals = [
      {label: 'Weight Gain', apiValue: 'high-protein'},
      {label: 'Weight Loss', apiValue: 'low FODMAP' },
      {label: 'Vegan', apiValue: 'vegan'},
      {label: 'Vegetarian', apiValue: 'vegetarian'},
      {label: 'Keto', apiValue: 'ketogenic' },
      {label: 'Better Relationship with Food', apiValue: 'maxCalories=900'},
    ];
  
    return (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={60}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.container}>
              <Text style={styles.title}>Pick Your Dietary Goal</Text>
      
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.label}
                  style={[
                    styles.button,
                    selectedGoal?.label === goal.label && styles.selectedButton,
                  ]}
                  onPress={() => setSelectedGoal(goal)}
                >
                  <Text style={styles.buttonText}>{goal.label}</Text>
                </TouchableOpacity>
              ))}
      
              <Text style={styles.label}>Any allergies?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., peanuts, gluten"
                value={allergies}
                onChangeText={setAllergies}
              />
      
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                disabled={!selectedGoal}
              >
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      );
      
  }
  
  const styles = StyleSheet.create({
    container: {
      padding: 24,
      paddingBottom: 40,
      backgroundColor: '#fdf5ec',
      flexGrow: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 20,
      textAlign: 'center',
      color: '#564a45',
    },
    button: {
      padding: 16,
      backgroundColor: '#FFD9C0',
      borderRadius: 10,
      marginBottom: 12,
      alignItems: 'center',
    },
    selectedButton: {
      backgroundColor: '#FFB3A7',
    },
    buttonText: {
      fontSize: 16,
      color: '#75758b',
    },
    label: {
      marginTop: 20,
      marginBottom: 6,
      fontSize: 16,
      color: '#4E342E',
    },
    input: {
      padding: 12,
      borderColor: '#D9A066',
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: '#dfcbba',
      marginBottom: 20,
    },
    continueButton: {
      backgroundColor: '#F1C27B',
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
    },
    continueText: {
      color: '#4E342E',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
