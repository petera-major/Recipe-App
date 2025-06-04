import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBh5yCUy9IgmZhXPPR5amRjnkHhBmhRFzo',
  authDomain: 'myrecipeapp-cf105.firebaseapp.com',
  projectId: 'myrecipeapp-cf105',
  storageBucket: 'myrecipeapp-cf105.appspot.com',
  messagingSenderId: '366032639011',
  appId: '1:366032639011:web:863c04e5462148c53a8d96',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);