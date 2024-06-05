// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxzYLFTUbepFNFduMPoOFaBg_qy-lFx2E",
  authDomain: "xpense-2dafb.firebaseapp.com",
  projectId: "xpense-2dafb",
  storageBucket: "xpense-2dafb.appspot.com",
  messagingSenderId: "659244204020",
  appId: "1:659244204020:web:de582b9a550e553b7e43a1",
  measurementId: "G-0N7KWDF8PG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app)