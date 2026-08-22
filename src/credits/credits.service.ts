import { Injectable, BadRequestException } from '@nestjs/common';

interface CreditLog {
  id: string;
  orgId: string;
  amount: number;
  type: 'add' | 'consume';
  action?: string;
  reason?: string;
  timestamp: number;
}

@Injectable()
export class CreditsService {
  private balances: Record<string, number> = {};
  private logs: CreditLog[] = [];

  addCredits(orgId: string, amount: number, reason: string) {
    this.balances[orgId] = (this.balances[orgId] || 0) + amount;
    this.logs.push({
      id: crypto.randomUUID(),
      orgId,
      amount,
      type: 'add',
      reason,
      timestamp: Date.now(),
    });
    return { balance: this.balances[orgId] };
  }

  consumeCredits(orgId: string, amount: number, action: string) {
    if ((this.balances[orgId] || 0) < amount)
      throw new BadRequestException('Insufficient credits');
    this.balances[orgId] -= amount;
    this.logs.push({
      id: crypto.randomUUID(),
      orgId,
      amount,
      type: 'consume',
      action,
      timestamp: Date.now(),
    });
    return { balance: this.balances[orgId] };
  }

  getBalance(orgId: string) {
    return { balance: this.balances[orgId] || 0 };
  }
}
