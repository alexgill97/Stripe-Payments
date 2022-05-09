import express, { NextFunction, Request, Response } from 'express';
export const app = express();

import cors from 'cors';
import { createStripeCheckoutSession } from "./checkout"
import { createPaymentIntent } from "./payments";
import { handleStripeWebhook } from './webhooks';
import { auth } from 'firebase-admin';
import { createSetupIntent, listPaymentMethods } from './customers';
import { cancelSubscription, createSubscription, listSubscriptions } from './billing';


// == MIDDLEWARE ==

// Allow cross origin requests
//
app.use(cors({ origin: true }));


// Sets rawBody for webhook handler
//
app.use(
  express.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer)
  })
)

// Decode Firebase Token
app.use(decodeJWT);

// Decode JSON web token from front end => make currentUser data available
//
async function decodeJWT(req: Request, res: Response, next: NextFunction) {
  console.log(req.headers)
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    console.log(idToken)

    try {
      const decodedToken = await auth().verifyIdToken(idToken);
      req['currentUser'] = decodedToken;
    } catch (err) {
      console.log(err);
    }
  }
  next();
}

// == HELPERS ==

function runAsync(callback: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next)
  }
}

function validateUser(req: Request) {
  const user = req['currentUser'];
  console.log(user)
  if (!user) {
    throw new Error(
      'You must be logged in to make this request. i.e Authorization: Bearer <token>'
    );
  }
  return user;
}

// == ROUTES ==

app.post('/test', (req: Request, res: Response) => {
  const amount = req.body.amount;
  res.status(200).send({ with_tax: amount * 7 });
});

// Checkouts
//
app.post(
  "/checkouts/", runAsync(async ({ body }: Request, res: Response) => {
    res.send(
      res.send(await createStripeCheckoutSession(body.line_items))
    )
  })
);

// Payment Intent
//
app.post(
  '/payments',
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createPaymentIntent(body.amount))
  })
);

// Webhooks
//
app.post('/hooks', runAsync(handleStripeWebhook))

// Customers and setup intent
//
app.post(
  '/wallet',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const setupIntent = await createSetupIntent(user.uid);
    res.send(setupIntent); 
  })
)

// Customer payment methods
app.get(
  '/wallet',
  runAsync(async (req: Request, res: Response) => {

    const user = validateUser(req);

    const wallet = await listPaymentMethods(user.uid);
    res.send(wallet.data);
  })
)

// Create subscription
//
app.post(
  '/subscriptions/',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const { plan, payment_method } = req.body;
    const subscription = await createSubscription(user.uid, plan, payment_method);
    res.send(subscription);
  })
);

//Get subscriptions
//
app.get(
  '/subscriptions',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const subscriptions = await listSubscriptions(user.uid)
    res.send(subscriptions.data);
  })
);

app.patch(
  '/subscriptions/:id',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    res.send(await cancelSubscription(user.uid, req.params.id));
  })
);