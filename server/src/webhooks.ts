import { stripe } from './'
import Stripe from 'stripe'

/** 
 * Webhook event types
*/

const webhookHandlers = {

  'payment_intent.succeeded': async (data: Stripe.PaymentIntent) => {
    
  },

  'payment_intent.failed': async (data: Stripe.PaymentIntent) => {

  },
}


export const handleStripeWebhook = async(req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req['rawBody'], sig, process.env.STRIPE_WEBHOOK_SECRET);

  try {
    await webhookHandlers[event.type](event.data.object);
    res.send({received: true});
  } catch (err) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${err}`);
  }

}