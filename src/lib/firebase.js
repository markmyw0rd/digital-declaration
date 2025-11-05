// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// (Optional) remove analytics if you don't use it
// import { getAnalytics } from "firebase/analytics";

// ⬇️ Your Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyAZIcUjpdgaZziERd5v1Cmhk2YgstKE_o4",
  authDomain: "digital-declaration.firebaseapp.com",
  projectId: "digital-declaration",
  storageBucket: "digital-declaration.appspot.com",
  messagingSenderId: "657622540647",
  appId: "1:657622540647:web:2db0b75ddcc963619b8fc2",
  measurementId: "G-JC8V2P9X80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and EXPORT it
export const db = getFirestore(app);

// (Optional) Analytics if you really need it in the browser
// export const analytics = getAnalytics(app);
