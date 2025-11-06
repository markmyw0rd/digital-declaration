// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZICUJpdgaZZiERd5v1Cmhk2YgstKeQ4",
  authDomain: "digital-declaration.firebaseapp.com",
  projectId: "digital-declaration",
  storageBucket: "digital-declaration.appspot.com",
  messagingSenderId: "657622540647",
  appId: "1:657622540647:web:2dbb75ddcc963619b8fc2",
  measurementId: "G-GDUC8V2P9X8",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
