// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDk6Bj9FKjogSJJny2eCV5Mj0l5SMFMLuI",
    authDomain: "travel-app-adc11.firebaseapp.com",
    projectId: "travel-app-adc11",
    storageBucket: "travel-app-adc11.appspot.com",
    messagingSenderId: "1079616000151",
    appId: "1:1079616000151:web:3712194ccb0810f76fd9d2",
    measurementId: "G-T9KETCSEN6"  
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
