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

}