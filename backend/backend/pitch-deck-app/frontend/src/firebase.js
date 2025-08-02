
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwAyFsSn36fJvpQEepLh9dmBJPK8migkw",
  authDomain: "pitch-deck-app.firebaseapp.com",
  projectId: "pitch-deck-app",
  storageBucket: "pitch-deck-app.firebasestorage.app",
  messagingSenderId: "85580775452",
  appId: "1:85580775452:web:d897fa80cb7382cd169fd9",
  measurementId: "G-XC8BZPYW0D"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;