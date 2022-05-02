import express, { Request, Response } from 'express';
export const app = express();

// Allows cross origin requests
import cors from 'cors';
app.use(cors({ origin: true }));


app.use(express.json());


app.post('/test', (req: Request, res: Response) => {
  const amount = req.body.amount;
  res.status(200).send({ with_tax: amount * 7 });
});