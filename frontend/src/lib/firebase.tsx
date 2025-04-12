import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCr7NpJo14vKumSJZAPS_YMXce9J_Cyv9E",
  authDomain: "smiling-bricks.firebaseapp.com",
  projectId: "smiling-bricks",
  storageBucket: "smiling-bricks.firebasestorage.app",
  messagingSenderId: "809654090015",
  appId: "1:809654090015:web:0d3b2e91a0d7be7930d82a",
  measurementId: "G-YT4JY3VVY8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Firebase Authentication instance
const provider = new GoogleAuthProvider();
// const analytics = getAnalytics(app);

export { auth, provider, signInWithPopup };
