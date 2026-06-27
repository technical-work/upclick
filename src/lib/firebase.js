import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const prodConfig = {
  apiKey: "AIzaSyCsXbVORWhOgsC1EMRG_-CyGNFxwMwDftg",
  authDomain: "upklick-software.firebaseapp.com",
  projectId: "upklick-software",
  storageBucket: "upklick-software.firebasestorage.app",
  messagingSenderId: "74060817284",
  appId: "1:74060817284:web:c3e7ef1d92200129f2f3d1",
  measurementId: "G-7VH0LGBENN"
};

const stagingConfig = {
  apiKey: "AIzaSyCsXbVORWhOgsC1EMRG_-CyGNFxwMwDftg",
  authDomain: "upklick-software.firebaseapp.com",
  projectId: "upklick-software",
  storageBucket: "upklick-software.firebasestorage.app",
  messagingSenderId: "74060817284",
  appId: "1:74060817284:web:8e2e15b345099028f2f3d1",
  measurementId: "G-F5QDZ49Z3P"
};

// Resolve configuration based on hostname or build environment
let firebaseConfig = prodConfig;
if (typeof window !== "undefined") {
  const host = window.location.hostname;
  if (host.includes("staging") || host.includes("localhost") || host.includes("127.0.0.1")) {
    firebaseConfig = stagingConfig;
  }
} else if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_APP_ENV === "staging") {
  firebaseConfig = stagingConfig;
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

let auth = null;
if (typeof window !== "undefined") {
  auth = getAuth(app);
  try {
    setPersistence(auth, browserSessionPersistence);
  } catch (e) {
    console.warn("Failed to set Firebase Auth persistence", e);
  }
}
const db = getFirestore(app);
const storage = getStorage(app);

export const libFirebaseConfig = {
  apiKey: "AIzaSyCaswftcLmfIepG_F8fzizqGXFl5mnXvj8",
  authDomain: "aibrand-vision.firebaseapp.com",
  projectId: "aibrand-vision",
  storageBucket: "aibrand-vision.firebasestorage.app",
  messagingSenderId: "36898907108",
  appId: "1:36898907108:web:423352bb5b0f5825d65df1",
  measurementId: "G-G0CFX66Q3V"
};

const libApp = !getApps().some(a => a.name === 'LibApp') 
  ? initializeApp(libFirebaseConfig, 'LibApp') 
  : getApp('LibApp');

const libStorage = getStorage(libApp);

export { app, analytics, auth, db, storage, libStorage, firebaseConfig };


