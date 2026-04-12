import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAochi5vaOJrzbhP2EwaBwDjviOcZCaJmY",
  authDomain: "florball-883c6.firebaseapp.com",
  projectId: "florball-883c6",
  storageBucket: "florball-883c6.firebasestorage.app",
  messagingSenderId: "975679043904",
  appId: "1:975679043904:web:5c948728d1cf42568fa2a5"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
