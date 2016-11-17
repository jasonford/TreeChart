import firebase from 'firebase';
import credentials from '../credentials.js';
// Initialize Firebase
firebase.initializeApp({
  apiKey: credentials.firebaseApiKey,
  authDomain: "fir-test-51aab.firebaseapp.com",
  databaseURL: "https://fir-test-51aab.firebaseio.com",
  storageBucket: "fir-test-51aab.appspot.com",
});