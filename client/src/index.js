import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Stripe setup
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  'pk_test_51KmQf0Gl29keRoIETKmrFa9XFjF61vmgqVoCQMhx1SCTLQZbgNIgyiLrFf5i0pvagDpqLQGv5YtiTHaWsUV3t9fr00P30dNkWF'
);

// Firebase setup
import { FirebaseAppProvider } from 'reactfire';

export const firebaseConfig = {
  apiKey: "AIzaSyB84jSAt41-DUB5jXZVNBMI3pqbiRcsGxQ",
  authDomain: "react-stripe-18ee3.firebaseapp.com",
  projectId: "react-stripe-18ee3",
  storageBucket: "react-stripe-18ee3.appspot.com",
  messagingSenderId: "499607460020",
  appId: "1:499607460020:web:ddaa866b8653043f2b9fe1"
};

ReactDOM.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Elements stripe={stripePromise}>
          <App />
      </Elements>
    </FirebaseAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

