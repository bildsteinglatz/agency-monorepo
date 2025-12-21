import { initializeApp, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDcHFViknXzz00F64y2au7miCvaltdcyb0",
  authDomain: "halle5-a2e07.firebaseapp.com",
  projectId: "halle5-a2e07",
  storageBucket: "halle5-a2e07.firebasestorage.app",
  messagingSenderId: "565902285290",
  appId: "1:565902285290:web:2c4ad0599343dc18103a93"
};

// Initialize Firebase
let app;
try {
    app = getApp();
} catch {
    app = initializeApp(firebaseConfig);
}

export const db = getFirestore(app);
