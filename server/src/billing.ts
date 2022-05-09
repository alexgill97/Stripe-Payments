import { stripe } from ".";
import { db } from './firebase';
import Stripe from "stripe";
import { getOrCreateCustomer } from "./customers";
import { firestore } from "firebase-admin";

export async function createSubscription(
  userId: string,
  plan: string,
  payment_method: string,
) {
  const customer = getOrCreateCustomer(userId);

  await stripe.paymentMethods.attach(payment_method, { customer: customer.id });

  await stripe.customers.update((await customer).id, {
    invoice_settings: { default_payment_method: payment_method },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan }],
    expand: ['latest_invoice.payment_intent'],
  })

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const payment_intent = invoice.payment_intent as Stripe.PaymentIntent;

  if (payment_intent.status === 'succeeded') {
    await db
      .collection('users')
      .doc(userId)
      .set({
        stripeCustomerId: customer.id,
        activePlans: firestore.FieldValue.arrayUnion(plan)
      },
      { merge: true }
    )
  }

  return subscription

}

export async function cancelSubscription(
  userId: string,
  subscriptionId: string
  ) {
    const customer = await getOrCreateCustomer(userId);
    if (customer.metadata.firebaseUID !== userId) {
      throw Error('Firebase UID does not match Stripe Customer');
    }

    const subscription = stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
  
    if (subscription.status === 'canceled') {
      await db 
      .collection('users')
      .doc(userId)
      .update({
        activePlans: firestore.FieldValue.arrayRemove(subscription.plan.id)
      })
    }
  return subscription;
};

export async function listSubscriptions(userId: string) {
  const customer = await getOrCreateCustomer(userId);
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id
  })
  return subscriptions;
};