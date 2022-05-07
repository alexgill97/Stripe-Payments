import React, { useState, useEffect, Suspense } from 'react';
import { fetchFromAPI } from './helpers';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useUser, AuthCheck } from 'reactfire';
import firebase from 'firebase/app';
import { auth, db } from './firebase';

export function SignIn() {
  const signIn = async () => {
    const credential = await auth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    );
    const { uid, email } = credential.user;
    db.collection('users').doc(uid).set({ email }, { merge: true });
  }
  return (
    <button onClick={signIn}>
      Sign In with Google
    </button>
  )
}

export function SignOut(props) {
  return props.user && (
    <button onClick={() => auth.signOut()}>
      Sign Out
    </button>
  )
}

function SaveCard(props) {
  const stripe = useStripe()
  const elements = useElements()
  const user = useUser()
  
  const [setupIntent, setSetupIntent] = useState();
  const [wallet, setWallet] = useState([]);

  // Get user wallet data
  useEffect(() => {
    getWallet();
  }, [user])

  const createSetupIntent = async (event) => {
    const si = await fetchFromAPI('wallet');
    setSetupIntent(si)
  }

  const getWallet = async () => {
    if (user) {
      const paymentMethods = await fetchFromAPI('wallet', { method: 'GET' });
      setWallet(paymentMethods);
      console.log(wallet)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cardElement = elements.getElement(CardElement)

    const {
      setupIntent: updatedSetupIntent,
      error
    } = await stripe.confirmCardSetup(setupIntent.client_secret, {
      payment_method: { card: cardElement }
    })

    if (error) {
      alert(error.message);
      console.log(error);
    } else {
      setSetupIntent(updatedSetupIntent)
      await getWallet();
      alert('Success!')
    }
  }

  return (
    <>
      <AuthCheck fallback={<SignIn />} />
        <div>
          <button onClick={createSetupIntent}
          hidden={setupIntent}>
            New Credit Card
          </button>
        </div>
        <hr />

        <form onSubmit={handleSubmit}>
          <CardElement />
          <button type='submit'>
            Attach
          </button>
        </form>

        <select>
          {wallet.map((paymentSource) => (
            <CreditCard key={paymentSource.id} card={paymentSource.card} />
          ))}
        </select>
        <div>
          <SignOut user={user} />
        </div>
      <AuthCheck />
    </>
  )
}

function CreditCard(props) {
  const { last4, brand, exp_month, exp_year } = props.card;
  return (
    <option>
      {brand} **** **** **** {last4} expires {exp_month}/{exp_year}
    </option>
  )
}

export default function Customers() {
  return (
    <Suspense fallback={'loading...'}>
      <SaveCard />
    </Suspense>
  )
}