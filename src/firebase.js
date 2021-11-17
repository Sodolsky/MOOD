import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyA36D0sCZzI8EuOuWnwPUFwb2DjqmiHFpg",
  authDomain: "mood-23f44.firebaseapp.com",
  projectId: "mood-23f44",
  storageBucket: "mood-23f44.appspot.com",
  messagingSenderId: "221493786631",
  appId: "1:221493786631:web:a70302fe01425b118812a2",
  measurementId: "G-781BKLCLD6",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage();
export const auth = getAuth();
export const storageRef = ref(storage);
export const db = getFirestore(app);
