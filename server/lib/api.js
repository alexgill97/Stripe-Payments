"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
exports.app = express_1.default();
const cors_1 = __importDefault(require("cors"));
const checkout_1 = require("./checkout");
const payments_1 = require("./payments");
const webhooks_1 = require("./webhooks");
const firebase_admin_1 = require("firebase-admin");
const customers_1 = require("./customers");
const billing_1 = require("./billing");
// == MIDDLEWARE ==
// Allow cross origin requests
//
exports.app.use(cors_1.default({ origin: true }));
// Sets rawBody for webhook handler
//
exports.app.use(express_1.default.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer)
}));
// Decode Firebase Token
exports.app.use(decodeJWT);
// Decode JSON web token from front end => make currentUser data available
//
async function decodeJWT(req, res, next) {
    var _a, _b;
    console.log(req.headers);
    if ((_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        console.log(idToken);
        try {
            const decodedToken = await firebase_admin_1.auth().verifyIdToken(idToken);
            req['currentUser'] = decodedToken;
        }
        catch (err) {
            console.log(err);
        }
    }
    next();
}
// == HELPERS ==
function runAsync(callback) {
    return (req, res, next) => {
        callback(req, res, next).catch(next);
    };
}
function validateUser(req) {
    const user = req['currentUser'];
    console.log(user);
    if (!user) {
        throw new Error('You must be logged in to make this request. i.e Authorization: Bearer <token>');
    }
    return user;
}
// == ROUTES ==
exports.app.post('/test', (req, res) => {
    const amount = req.body.amount;
    res.status(200).send({ with_tax: amount * 7 });
});
// Checkouts
//
exports.app.post("/checkouts/", runAsync(async ({ body }, res) => {
    res.send(res.send(await checkout_1.createStripeCheckoutSession(body.line_items)));
}));
// Payment Intent
//
exports.app.post('/payments', runAsync(async ({ body }, res) => {
    res.send(await payments_1.createPaymentIntent(body.amount));
}));
// Webhooks
//
exports.app.post('/hooks', runAsync(webhooks_1.handleStripeWebhook));
// Customers and setup intent
//
exports.app.post('/wallet', runAsync(async (req, res) => {
    const user = validateUser(req);
    const setupIntent = await customers_1.createSetupIntent(user.uid);
    res.send(setupIntent);
}));
// Customer payment methods
exports.app.get('/wallet', runAsync(async (req, res) => {
    const user = validateUser(req);
    const wallet = await customers_1.listPaymentMethods(user.uid);
    res.send(wallet.data);
}));
exports.app.post('/subscriptions/', runAsync(async (req, res) => {
    const user = validateUser(req);
    const { plan, payment_method } = req.body;
    const subscription = await billing_1.createSubscription(user.uid, plan, payment_method);
    res.send(subscription);
}));
//# sourceMappingURL=api.js.map