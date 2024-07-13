import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcSK6-qvp-FeTbj_Y4ppZ2PJsnkE4jkVg",
  authDomain: "agencia-cb530.firebaseapp.com",
  projectId: "agencia-cb530",
  storageBucket: "agencia-cb530.appspot.com",
  messagingSenderId: "671661190729",
  appId: "1:671661190729:web:8cc66601eadc27193c9998",
  databaseURL: "https://agencia-cb530-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = initializeAuth(firebase, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
export const firestore = getFirestore(firebase);

// Initialize Storage
export const storage = getStorage(firebase);

// Initialize Realtime Database
export const dbRealTime = getDatabase(firebase);