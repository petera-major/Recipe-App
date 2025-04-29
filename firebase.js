import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBh5yCUy9IgmZhXPPR5amRjnkHhBmhRFzo',
  authDomain: 'myrecipeapp-cf105.firebaseapp.com',
  projectId: 'myrecipeapp-cf105',
  storageBucket: 'myrecipeapp-cf105.appspot.com',
  messagingSenderId: '366032639011',
  appId: '1:366032639011:web:863c04e5462148c53a8d96',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { onAuthStateChanged };