import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';


import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  'pk_test_51KmQf0Gl29keRoIETKmrFa9XFjF61vmgqVoCQMhx1SCTLQZbgNIgyiLrFf5i0pvagDpqLQGv5YtiTHaWsUV3t9fr00P30dNkWF'
);

ReactDOM.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
        <App />
    </Elements>
  </React.StrictMode>,
  document.getElementById('root')
);

