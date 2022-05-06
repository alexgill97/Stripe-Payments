import firebase from "firebase";
import 'firebase/auth'
import 'firebase/firestore'

export const firebaseConfig = {
  apiKey: "AIzaSyB84jSAt41-DUB5jXZVNBMI3pqbiRcsGxQ",
  authDomain: "react-stripe-18ee3.firebaseapp.com",
  projectId: "react-stripe-18ee3",
  storageBucket: "react-stripe-18ee3.appspot.com",
  messagingSenderId: "499607460020",
  appId: "1:499607460020:web:ddaa866b8653043f2b9fe1"
};

firebase.initializeApp(firebaseConfig)

export const db = firebase.firestore();
export const auth = firebase.auth();