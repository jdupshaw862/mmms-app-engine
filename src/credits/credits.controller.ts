import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private readonly credits: CreditsService) {}

  @Post('add')
  add(@Body() body: { orgId: string; amount: number; reason: string }) {
    return this.credits.addCredits(body.orgId, body.amount, body.reason);
  }

  @Post('consume')
  consume(@Body() body: { orgId: string; amount: number; action: string }) {
    return this.credits.consumeCredits(body.orgId, body.amount, body.action);
  }

  @Get(':orgId')
  balance(@Param('orgId') orgId: string) {
    return this.credits.getBalance(orgId);
  }
}
