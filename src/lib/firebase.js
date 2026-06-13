import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsXbVORWhOgsC1EMRG_-CyGNFxwMwDftg",
  authDomain: "upklick-software.firebaseapp.com",
  projectId: "upklick-software",
  storageBucket: "upklick-software.firebasestorage.app",
  messagingSenderId: "74060817284",
  appId: "1:74060817284:web:c3e7ef1d92200129f2f3d1",
  measurementId: "G-7VH0LGBENN"
};

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

const auth = getAuth(app);

export { app, analytics, auth };
