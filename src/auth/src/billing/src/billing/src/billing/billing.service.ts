import { Injectable } from '@nestjs/common';

@Injectable()
export class BillingService {
  getInvoice(id: string) {
    return {
      id,
      amount: 125.00,
      status: 'paid',
      issued: '2026-08-19',
    };
  }
}
