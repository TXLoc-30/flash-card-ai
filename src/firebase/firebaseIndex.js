/**
 * Initialize firebase authentication and firestore.
 */

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

var firebaseConfig = {
  // apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  // authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  // projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  // messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.REACT_APP_FIREBASE_APP_ID
  apiKey: "AIzaSyAuaLMCYkiUCMRQTaCUA5xXv4JUY-2dW0I",
  authDomain: "flash-cards-7b4c7.firebaseapp.com",
  projectId: "flash-cards-7b4c7",
  storageBucket: "flash-cards-7b4c7.firebasestorage.app",
  messagingSenderId: "794590279227",
  appId: "1:794590279227:web:1740610e861034294b4e1e",
  measurementId: "G-S8S16XX4VT"
};

firebase.initializeApp(firebaseConfig);
export const auth=firebase.auth();
export const db=firebase.firestore();
export const fb=firebase;
export const EmailAuthProvider = firebase.auth.EmailAuthProvider;
export const FieldValue = firebase.firestore.FieldValue;

const firebaseConfigExport = { firebaseConfig };
export default firebaseConfigExport;