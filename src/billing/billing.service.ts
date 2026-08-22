import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe = new Stripe(process.env.STRIPE_SECRET || '', {
    apiVersion: '2023-10-16',
  });

  createCustomer(email: string, orgId: string) {
    return this.stripe.customers.create({ email, metadata: { orgId } });
  }

  subscribe(customerId: string, priceId: string, orgId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: { orgId },
    });
  }

  getInvoices(customerId: string) {
    return this.stripe.invoices.list({ customer: customerId });
  }
}
