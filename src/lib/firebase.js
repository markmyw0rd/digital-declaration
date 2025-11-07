// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZICUJpdgaZZiERd5v1Cmhk2YgstKeQ4",
  authDomain: "digital-declaration.firebaseapp.com",
  projectId: "digital-declaration",
  storageBucket: "digital-declaration.appspot.com",
  messagingSenderId: "657622540647",
  appId: "1:657622540647:web:2dbb75ddcc963619b8fc2",
  // measurementId is fine to leave or remove; not required for Firestore
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// TEMP diagnostic — keep until Vercel is verified
console.log("[Diag] Firebase projectId =", getApp().options.projectId);

export const db = getFirestore(app);
