import React, { useState, useEffect, Suspense } from 'react';
import { fetchFromAPI } from './helpers';
import { cardElement, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useUser, AuthCheck } from 'reactfire';

import { db } from './firebase';
import { SignIn, SignOut } from './Customers';

function UserData(props) {

  const [data, setData] = useState({});

  useEffect(() => {
      const unsubscribe = db.collection('users').doc(props.user.uid).onSnapshot(doc => setData(doc.data()))
      return unsubscribe
    }, [props.user]
  );
  
  return (
    <pre>
      Stripe Customer ID: {data.stripeCustomerId} <br />
      Subscriptions: {JSON.stringify(data.activePlans || [])}
    </pre>
  );
}

function SubscribeToPlan(props) {
  const stripe = useStripe();
  const elements = useElements();
  const user = useUser();

  const [plan, setPlan] = useState();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false)
  
  const getSubscriptions = async () => {
    if (user) {
      const subs = await fetchFromAPI('subscriptions', { method: 'GET' });
      setSubscriptions(subs)
    }
  };

  useEffect(() => {
    getSubscriptions();
  }, [user]);

  const cancel = async (id) => {
    setLoading(true);
    await fetchFromAPI(`subscriptions/${id}`, { method: 'PATCH' });
    alert('canceled!');
    await getSubscriptions();
    setLoading(false);
  }


  const handleSubmit = async (event) => {
    setLoading(true)
    event.preventDefault();

    const cardElement = elements.getElement(CardElement)

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement
    })

    if (error) {
      alert(error.message);
      setLoading(false)
      return;
    }

    // Create Subscription on Server
    const subscription = await fetchFromAPI('subscriptions', {
      body: {
        plan,
        payment_method: paymentMethod.id,
      }
    });

    const { latest_invoice } = subscription;

    if (latest_invoice.payment_intent) {
      const { client_secret, status } = latest_invoice.payment_intent;

      if (status === 'requires_action') {
        const { error: confirmationError } = await stripe.confirmCardPayment(
          client_secret);
        if (confirmationError) {
          console.error(confirmationError)
          alert('unable to confirm card')
          return
        }
      }

      alert('subscribed!')
      getSubscriptions()
    }

    setLoading(false)
    setPlan(null)
  }

  return (
    <>
      <AuthCheck fallback={<SignIn />}>
        <div>
          {user?.uid && <UserData user={user} />}
        </div>

        <hr />

        <div>
        <button
            onClick={() => setPlan('price_1KxLPMGl29keRoIES0lyHJ1p')}>
            Choose Monthly $25/m
          </button>

          <button
            onClick={() => setPlan('price_1KxLPMGl29keRoIEb0DcIU2y')}>
            Choose Quarterly $50/q
          </button>

          <p>
            Selected Plan: <strong>{plan}</strong>
          </p>
        </div>
        <hr />

        <form onSubmit={handleSubmit} hidden={!plan}>

          <CardElement />
          <button type='submit' disabled={loading}>
            Subscribe & Pay
          </button>
        </form>

        <div>
          <h3>Manage Subscriptions</h3>
          <div>
            {subscriptions.map((sub) => (
              <div>
                {sub.id}. Next Payment of {sub.plan.amount} due{' '}
                {new Date(sub.current_period_end * 1000).toUTCString()}
                <button 
                onClick={() => cancel(sub.id)}
                disabled={loading}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SignOut user={user} />
        </div>

      </AuthCheck>
    </>
  )
  
  
 

}


function Subscriptions() {
  return (
    <Suspense fallback={'loading user'}>
      <SubscribeToPlan />
    </Suspense>
  );
}

export default Subscriptions