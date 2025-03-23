import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCr7NpJo14vKumSJZAPS_YMXce9J_Cyv9E",
  authDomain: "smiling-bricks.firebaseapp.com",
  projectId: "smiling-bricks",
  storageBucket: "smiling-bricks.firebasestorage.app",
  messagingSenderId: "809654090015",
  appId: "1:809654090015:web:7637fdadf01b104330d82a",
  measurementId: "G-TX7SE8VBHG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Firebase Authentication instance
// const analytics = getAnalytics(app);

export { auth, GoogleAuthProvider, signInWithPopup };