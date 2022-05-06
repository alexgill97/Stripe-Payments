import express, { NextFunction, Request, Response } from 'express';
export const app = express();

import cors from 'cors';
import { createStripeCheckoutSession } from "./checkout"
import { createPaymentIntent } from "./payments";
import { handleStripeWebhook } from './webhooks';

// Allow cross origin requests
app.use(cors({ origin: true }));


// Sets rawBody for webhook handler
app.use(
  express.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer)
  })
)


app.post('/test', (req: Request, res: Response) => {
  const amount = req.body.amount;
  res.status(200).send({ with_tax: amount * 7 });
});

// Checkouts
//
app.post(
  "/checkouts/", runAsync(async ({ body }: Request, res: Response) => {
    res.send(

      await createStripeCheckoutSession(body.line_items)

    )
  })
);

// Payment Intent
app.post(
  '/payments',
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createPaymentIntent(body.amount))
  })
);

// Webhooks
app.post('/hooks', runAsync(handleStripeWebhook))



function runAsync(callback: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next)
  }
}