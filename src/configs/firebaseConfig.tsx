// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
//export const auth = getAuth(firebase);
export const auth = initializeAuth(firebase, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

//Referencia al servicio de BDD
export const dbRealTime = getDatabase(firebase);