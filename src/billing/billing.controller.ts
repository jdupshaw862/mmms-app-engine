import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post('create-customer')
  createCustomer(@Body() body: { email: string; orgId: string }) {
    return this.billing.createCustomer(body.email, body.orgId);
  }

  @Post('subscribe')
  subscribe(@Body() body: { customerId: string; priceId: string; orgId: string }) {
    return this.billing.subscribe(body.customerId, body.priceId, body.orgId);
  }

  @Get('invoices/:customerId')
  invoices(@Param('customerId') customerId: string) {
    return this.billing.getInvoices(customerId);
  }
}
