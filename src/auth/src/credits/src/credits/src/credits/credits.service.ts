import { Injectable } from '@nestjs/common';

@Injectable()
export class CreditsService {
  getCredits(userId: string) {
    return {
      userId,
      credits: 250,
      lastUpdated: '2026-08-19',
    };
  }
}
