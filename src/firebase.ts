// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3PLA3VC8vmSDJQXPt_cPFf2LtHvkhwpc",
    authDomain: "mortgage-85413.firebaseapp.com",
    projectId: "mortgage-85413",
    storageBucket: "mortgage-85413.firebasestorage.app",
    messagingSenderId: "681228583046",
    appId: "1:681228583046:web:d1f6764984c5100b5a9107",
    measurementId: "G-T0YVZQ97G1"
};

import { getAuth } from "firebase/auth";

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
