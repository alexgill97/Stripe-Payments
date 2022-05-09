"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscription = void 0;
const _1 = require(".");
const customers_1 = require("./customers");
async function createSubscription(userId, plan, payment_method) {
    const customer = customers_1.getOrCreateCustomer(userId);
    await _1.stripe.paymentMethods.attach(payment_method, { customer: customer.id });
    await _1.stripe.customers.update((await customer).id, {
        invoice_settings: { default_payment_method: payment_method },
    });
    const subscription = await _1.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ plan }],
        expand: ['latest_invoice.payment_intent'],
    });
}
exports.createSubscription = createSubscription;
//# sourceMappingURL=billing.js.map