import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, _ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

export default function ChatScreen() {
  const { goal, allergies } = useLocalSearchParams();
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Enter some ingredients and I’ll give you 5 recipe ideas 🍳. Please place a comma between each ingredient. After you decide on which recipe, please pick a number between 1 and 5 for recipe instruction! 📜' }
  ]);
  const [loading, setLoading] = useState(false);
  const [awaitingChoice, setAwaitingChoice] = useState(false);
  const [suggestedMeals, setSuggestedMeals] = useState<string[]>([]);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);


  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
  
    try {
      if (awaitingChoice) {
        const choice = parseInt(input.trim());
        if (isNaN(choice) || choice < 1 || choice > 5) {
          setMessages((prev) => [...prev, { role: 'assistant', text: '🌸' }]);
          setLoading(false);
          return;
        }
        const selectedMeal = suggestedMeals[choice - 1];
        const detailedPrompt = `For the selected meal idea "${selectedMeal}", please format the response like this:
          - Title of the recipe
          - Estimated serving size 🍽️
          - Calories per serving 🔥
          - List of ingredients 🥑
          - Step-by-step instructions 🥣

          Keep it clear and beginner-friendly!`;

          const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
          const res = await fetch('https://recipeapp-backend-production.up.railway.app/api/chat', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: detailedPrompt }],
          }),
        });
  
        const data = await res.json();
        const detailedRecipe = data.choices?.[0]?.message?.content || 'No recipe found.';
        await typeOutText(detailedRecipe);

        setAwaitingChoice(false);
        setSuggestedMeals([]);
      } else {
        const prompt = `Suggest 5 meal ideas using these ingredients: ${input}. List them 1–5, one per line. They should align with a ${goal || 'balanced'} diet and avoid ${allergies || 'none'}.`;

        const res = await fetch('https://recipeapp-backend-production.up.railway.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        const data = await res.json();
        const ideas = data.choices?.[0]?.message?.content?.split('\n') || [];

        const meals = ideas
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
          .filter((line: string) => line.length > 0);

        setSuggestedMeals(meals);
        await typeOutText(data.choices?.[0]?.message?.content || '');

        setAwaitingChoice(true);
      }
    } catch (err) {
      console.error('OpenAI error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Oops! Something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      { role: 'assistant', text: 'Hi! Enter some ingredients and I’ll give you 5 recipe ideas 🍳. After you decide on which recipe, please pick a number between 1 and 5 for recipe instruction! 📜' }
    ]);
    setInput('');
    setAwaitingChoice(false); 
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);
  

  const typeOutText = async (text: string) => {
    setIsTyping(true);
    setTypingText('');
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        setMessages((prev) => [...prev, { role: 'assistant', text }]);
        setTypingText('');
        setIsTyping(false);
      }
    }, 20);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
              <Text style={styles.newChatText}>Start New Chat 🍳</Text>
            </TouchableOpacity>
  
            <ScrollView
              ref={scrollViewRef}
              style={styles.chat}
              contentContainerStyle={{ padding: 16, flexGrow: 1, paddingBottom: 80 }}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.bubble,
                    msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text style={styles.bubbleText}>{msg.text}</Text>
                </View>
              ))}
  
              {isTyping && (
                <View style={[styles.bubble, styles.aiBubble]}>
                  <Text style={styles.bubbleText}>{typingText}</Text>
                </View>
              )}
  
              {loading && !isTyping && (
                <ActivityIndicator style={{ marginTop: 10 }} color="#F1C27B" />
              )}
            </ScrollView>
  
            <View style={styles.inputBar}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={
                  awaitingChoice ? 'Enter 1–5 to pick a meal...' : 'Enter ingredients...'
                }
                style={styles.input}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  chat: { flex: 1 },
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#FFD9C0',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#DFE7E7',
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 14,
    color: '#333',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 10,
    borderTopColor: '#eee',
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f3f3f3',
    borderRadius: 20,
    marginRight: 10,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#F1C27B',
    padding: 10,
    borderRadius: 50,
  },
  newChatButton: {
    alignSelf: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F1C27B',
    borderRadius: 20,
  },
  newChatText: {
    color: '#fff',
    fontWeight: 'bold',
  },  
});